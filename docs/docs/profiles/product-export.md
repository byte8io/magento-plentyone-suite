---
sidebar_position: 10
title: Product Export Profile
description: Export products from Magento to PlentyONE using the Product Export Profile
---

# Product Export Profile

The **Product Export Profile** synchronizes your Magento product catalog to PlentyONE, exporting complete product data including items, variations, prices, images, categories, and attributes to your ERP system for centralized inventory management and fulfillment operations.

## Overview

**Profile Type ID**: `plenty_item_export`
**Direction**: Magento → PlentyONE
**Purpose**: Export complete product catalog with all associated data for inventory management, fulfillment, and multi-channel sales

### What Gets Exported

- **Items**: Product entities as PlentyONE items with core data
- **Variations**: Product variants (size, color, etc.) as PlentyONE variations
- **Prices**: All price types (base, special, tier, customer group)
- **Taxes**: Tax class mappings and VAT configurations
- **Images**: Product images uploaded to PlentyONE media library
- **Categories**: Product-category assignments with hierarchy
- **Attributes**: Custom attributes mapped to PlentyONE properties
- **Barcodes**: GTIN, UPC, EAN, ISBN product identifiers
- **Cross-sells**: Related products, up-sells, cross-sells
- **Multi-language Content**: Names, descriptions per store/language
- **Dimensions**: Weight, length, width, height measurements
- **Manufacturer**: Manufacturer and country of origin
- **Customs**: Customs tariff numbers and classifications
- **URLs**: Product URLs for web integrations
- **Videos**: Product video URLs

### Product Type Support

| Magento Product Type | PlentyONE Structure | Export Strategy |
|----------------------|---------------------|-----------------|
| **Simple Product** | Item with single variation | Standard export |
| **Configurable Product** | Item with multiple variations | Parent + children as variations |
| **Bundle Product** | Item with bundle components | Main item + selections |
| **Virtual Product** | Item (no shipping) | Standard export without dimensions |
| **Downloadable Product** | Item (digital) | Standard export without shipping |

### Primary Use Cases

1. **Initial Catalog Sync**: Full product catalog export to populate PlentyONE
2. **New Product Launches**: Automatic new product export with observers
3. **Price Updates**: Real-time price synchronization to PlentyONE
4. **Inventory Preparation**: Product data for multi-channel fulfillment
5. **Marketplace Integration**: Product export for Amazon, eBay, etc.
6. **Multi-language Catalogs**: Content export for international stores

## Architecture Overview

### Export Pipeline Pattern

The export system uses a **Command/Collector/Executor pipeline** with three processing stages:

```
1. COLLECTOR STAGE
   └─ Load products from export queue
      └─ Execute Data Builders per product:
         ├─ VariationPropertyDataBuilder → Properties & attributes
         ├─ VariationSalesPriceDataBuilder → Sales prices
         ├─ VariationPurchasePriceDataBuilder → Purchase/cost prices
         ├─ VariationBarcodeDataBuilder → GTIN, UPC, EAN barcodes
         ├─ VariationImageDataBuilder → Product images
         └─ VariationCategoryDataBuilder → Category assignments
      └─ Generate API Commands from collected data

2. EXECUTOR STAGE
   └─ Batch API Communication:
      ├─ Item Commands → POST/PUT /rest/items
      ├─ Variation Commands → POST/PUT /rest/variations
      ├─ PIM Commands → PUT /rest/pim/variations (batch)
      ├─ Image Commands → Upload/link item images
      └─ Result Processing → Update queue status, store PlentyONE IDs

3. OPTIMIZATION
   └─ Change Detection:
      ├─ Compare desired vs existing PlentyONE data
      ├─ Skip unchanged properties, prices, barcodes
      └─ Only send commands for new or modified data
```

### Memory Optimization

**Batch Processing**: Default 10 products per batch (configurable)
**Smart Aggregation**: Preserves messages across batches without memory overflow
**Memory per Product**: ~5-10 MB (simple), ~20-50 MB (configurable), ~15-30 MB (bundle)

**Recommendations**:
- Simple products: 20-30 per batch
- Configurable products: 5-10 per batch
- Bundle products: 5-10 per batch
- PHP memory_limit: 1G minimum

### Queue Management

Products are staged in `plenty_item_export_queue` table before export:
- **Status**: pending → processing → complete/error
- **Tracking**: Stores PlentyONE item_id and variation_id after export
- **Retry Logic**: Failed exports can be retried
- **Observer Integration**: Auto-adds products on create/update events

---

## Configuration Reference

All configuration options are found at:
**Admin Panel** → **PlentyONE** → **Profiles** → **[Your Product Export Profile]**

---

## 1. Client Configuration

Configure the PlentyONE client connection for this profile.

### Client

**Field**: `client_id`
**Type**: Select (Required)
**Scope**: Global

Select the PlentyONE client configuration to use for this product export profile. The client contains the API credentials and connection settings required to communicate with your PlentyONE system.

**Available Actions**:
- **Edit** - Modify existing client configuration
- **New Client** - Create a new PlentyONE client connection

:::tip Initial Setup
After selecting a client, click **Collect Configuration Data** to populate dropdown options throughout the profile. This fetches categories, properties, prices, tax rates, and other metadata from your PlentyONE system.
:::

### Collect Configuration Data

**Button**: `collect_config_data_btn`
**Action**: Fetch configuration from PlentyONE

Retrieves the following data from your PlentyONE system:
- **Categories**: Category tree for category mapping
- **Properties**: Product properties for attribute mapping
- **Sales Prices**: Price configurations for price mapping
- **Tax Rates**: VAT rates for tax mapping
- **Barcodes**: Barcode type IDs
- **Attributes**: Variation attributes (size, color, etc.)
- **Manufacturers**: Manufacturer list
- **Warehouses**: Warehouse IDs

**When to Run**:
- ✅ Initial profile setup
- ✅ After creating new categories in PlentyONE
- ✅ After adding new properties
- ✅ After modifying price configurations
- ✅ Periodically to sync latest metadata

**Workflow**:
1. Click "Collect Configuration Data"
2. System fetches metadata via API
3. Dropdown options populated throughout form
4. Configuration data cached locally

### Delete Configuration Data

**Button**: `delete_config_data_btn`
**Action**: Clear cached configuration

Removes locally cached configuration data. Use when:
- ❌ Need to clear stale data
- ❌ PlentyONE structure changed significantly
- ❌ Troubleshooting mapping issues

**Note**: After deletion, run "Collect Configuration Data" again to repopulate.

---

## 2. Schedule Configuration

Configure automated product export scheduling and batch processing behavior.

### Enable Schedule

**Field**: `status`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable automatic product export processing via the scheduler. When enabled, products in the export queue will be exported to PlentyONE according to the configured schedule.

**When to Enable**:
- ✅ Automated catalog synchronization
- ✅ Regular price/inventory updates
- ✅ Event-driven exports (observers enabled)
- ✅ Production environments

**When to Disable**:
- ❌ Manual export control only
- ❌ Testing and configuration phases
- ❌ One-time bulk exports
- ❌ Scheduled maintenance periods

### Schedule

**Field**: `schedule_id`
**Type**: Select (Required when enabled)
**Scope**: Global

Select the cron schedule that determines when this product export profile will run automatically. The schedule defines the frequency of product synchronization from Magento to PlentyONE.

**Common Schedules**:
- **Every 15 minutes** - Real-time product sync (recommended for new products)
- **Every 30 minutes** - Standard product sync
- **Every hour** - Low-frequency updates
- **Every 6 hours** - Batch processing only
- **Custom** - Define your own cron expression

**Recommended**:
- **New Products**: Every 15-30 minutes (with observers)
- **Price Updates**: Every 30-60 minutes
- **Bulk Exports**: Manual execution or nightly schedule

**Actions**:
- **Edit** - Modify existing schedule
- **New Schedule** - Create custom schedule
- **View Schedules** - List all configured schedules

### Process Batch Size

**Field**: `process_batch_size`
**Type**: Input (Number)
**Default**: 10
**Range**: 1-100
**Scope**: Global

Number of products to process per batch. Batch size affects memory usage and processing speed.

**Recommended Settings by Product Type**:

| Product Type | Batch Size | Reason |
|--------------|------------|--------|
| **Simple** | 20-30 | Low complexity, minimal memory |
| **Configurable** | 5-10 | High complexity, children loaded |
| **Bundle** | 5-10 | Component loading overhead |
| **Mixed Catalog** | 10 (default) | Balanced for all types |

**Performance Considerations**:
- **Small Batches (5-10)**: More stable, lower memory, more API calls
- **Medium Batches (10-20)**: Balanced performance
- **Large Batches (20-30)**: Faster processing, higher memory usage

**Memory Usage**:
- Simple products: ~5-10 MB per product
- Configurable products: ~20-50 MB per product (with children)
- Bundle products: ~15-30 MB per product

:::warning Memory Impact
Configurable and bundle products consume significantly more memory. Monitor PHP memory_limit (recommended: 1G+) when processing complex products.
:::

### Enable History

**Field**: `enable_history`
**Type**: Checkbox
**Default**: Enabled
**Scope**: Global

Enable logging of all processed product data. When enabled, a detailed history of each export operation will be saved.

**Benefits**:
- ✅ Track export success/failure rates
- ✅ Review product export timeline
- ✅ Audit data changes and updates
- ✅ Troubleshoot synchronization issues
- ✅ Generate compliance reports

**Storage Impact**: History records accumulate over time. Implement cleanup policies for long-running profiles.

**Access History**:
- **Admin Panel** → **PlentyONE** → **Profiles** → **[Profile]** → **History** tab
- View execution logs with timestamps, status, and messages

### View Schedules

**Button**: `schedule_listing_button`
**Action**: Display schedule listing modal

Opens a modal showing all configured schedules with:
- Schedule name and cron expression
- Last execution time
- Next scheduled execution
- Associated profiles

---

## 3. HTTP API Configuration

Configure how products are sent to the PlentyONE REST API.

### API Behaviour

**Field**: `api_behaviour`
**Type**: Select (Required)
**Default**: Append
**Scope**: Global

Select the API data export behavior for product synchronization.

**Options**:

| Behaviour | Description | Use Case |
|-----------|-------------|----------|
| **Append** | Export new/modified products only | ✅ Recommended for ongoing synchronization |
| **Replace** | Clear and re-export all products | ⚠️ One-time exports, full catalog rebuild |

**Append Mode** (Recommended):
- Tracks last export timestamp
- Exports only new or modified products
- Efficient for regular synchronization
- Preserves existing PlentyONE data

**Replace Mode** (Caution):
- Clears all previous export records
- Re-exports entire product catalog
- Use for data corrections or migrations
- May cause temporary data inconsistency

:::warning Replace Behavior
"Replace" mode deletes all previously exported product records and starts fresh. Use only for troubleshooting, data corrections, or initial migration.
:::

### API Collection Size

**Field**: `collection_size`
**Type**: Input (Number)
**Default**: 50
**Maximum**: 500
**Scope**: Global
**Data Scope**: `api_collection_size`

Specify the number of products to retrieve from Magento per database query. This affects how many products are fetched from the queue table at once.

**Recommended Values**:
- **50** - Default, balanced performance
- **100-150** - Medium catalogs, good memory
- **200-500** - Large catalogs, high-memory environments

**Performance Considerations**:
- Higher values = Fewer database queries = Faster queue loading
- Higher values = Larger memory allocation for product collection
- Works in conjunction with Process Batch Size

**Relationship to Batch Size**:
```
Collection Size: 150 products retrieved from queue
Batch Size: 10 products processed at a time
Result: 15 batches processed (150 / 10 = 15)
```

### User Defined Search Criteria

**Field**: `is_user_defined_search_criteria`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable custom search criteria for PlentyONE PIM API when fetching product data.

**When to Enable**:
- ✅ Need specific PIM API filters
- ✅ Advanced product filtering
- ✅ Custom data collection requirements

**When Disabled**: Uses default PIM search criteria from profile configuration.

### PIM Search Criteria

**Field**: `pim_search_criteria`
**Type**: Multiselect (Required when enabled)
**Scope**: Global
**Visible**: Only when "User defined search criteria" enabled

Select specific PIM API parameters to include in product data requests.

**Common Options**:
- `item` - Include item data
- `item.images` - Include item images
- `item.texts` - Include descriptions/names
- `variationAttributeValues` - Include variation attributes (size, color)
- `variationBarcodes` - Include product barcodes
- `variationCategories` - Include category assignments
- `variationSalesPrices` - Include price data
- `variationStock` - Include stock levels
- `variationProperties` - Include custom properties

**Use Case**: Customize which data is fetched from PlentyONE for updates or validation during export.

---

## 4. Store Configuration

Map Magento stores to PlentyONE clients and configure multi-language content export.

### Store Mapping

**Field**: `store_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Define how Magento store views map to PlentyONE clients and languages. This configuration determines which PlentyONE client receives product data from each Magento store view and what language content to export.

**Row Fields**:
- **Store** (select, required) - Magento store view
- **Client** (select, required) - PlentyONE client ID (plentyId)
- **Locale** (select, required) - PlentyONE language (de, en, fr, etc.)

**Example Configuration**:

| Magento Store | PlentyONE Client | Locale | Result |
|---------------|------------------|--------|--------|
| Default Store View | 1000 | en | Export English content to client 1000 |
| German Store | 1000 | de | Export German content to client 1000 |
| French Store | 1000 | fr | Export French content to client 1000 |

**How Mapping Works**:
1. Product exported from Magento
2. System determines product's store view
3. Looks up store mapping for client and locale
4. Exports product to mapped client with specified language content
5. Creates multi-language texts in PlentyONE

**Multi-Language Content**:
- Product names per language
- Descriptions per language
- Short descriptions per language
- Meta titles and descriptions
- URL paths per language

:::tip Multi-Store Strategy
For multi-language sites, configure mappings for each store view to ensure content exports in all languages. PlentyONE will maintain separate text records per language.
:::

**Common Patterns**:

**Single Language**:
```
All Stores → Client 1000 → Language: en
Result: All products exported with English content only
```

**Multi-Language (Same Client)**:
```
EN Store → Client 1000 → Language: en
DE Store → Client 1000 → Language: de
FR Store → Client 1000 → Language: fr
Result: Products exported with EN, DE, FR content to same client
```

**Multi-Client (International)**:
```
US Store → Client 1000 → Language: en
EU Store → Client 2000 → Language: de
UK Store → Client 3000 → Language: en
Result: Products distributed across clients by region
```

### FlagOne Filter

**Field**: `flag_one`
**Type**: Input (Number)
**Scope**: Global

Value number for PlentyONE flagOne filter. FlagOne is used in PlentyONE to mark products for specific purposes or states.

**Common Values**:
- **0** - Not flagged
- **1** - Flagged for specific purpose (custom usage)

**Use Cases**:
- Filter products by custom flag in PlentyONE
- Mark products for specific marketplace exports
- Custom business logic flags

### FlagTwo Filter

**Field**: `flag_two`
**Type**: Input (Number)
**Scope**: Global

Value number for PlentyONE flagTwo filter. Similar to FlagOne, used for additional custom flagging.

**Use Cases**:
- Secondary product marking
- Multi-flag filtering logic
- Custom workflow states

---

## 5. Tax And Price Configuration

Configure price and tax export settings, including multi-currency, customer group pricing, and VAT handling.

### Enable Price Export

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable export of price and tax data to PlentyONE. When enabled, product prices, tax classes, customer group pricing, and tier prices will be synchronized.

**When to Enable**:
- ✅ Export pricing to PlentyONE
- ✅ Maintain price lists in PlentyONE
- ✅ Multi-channel price distribution
- ✅ Customer group-specific pricing
- ✅ Tax calculation in PlentyONE

**When to Disable**:
- ❌ Prices managed entirely in PlentyONE
- ❌ Manual price entry preferred
- ❌ Product structure export only

**Impact**: Disabling hides all price-related configuration sections.

---

### Tax Mapping

**Field**: `tax_mapping`
**Type**: Dynamic Rows
**Scope**: Website

Map Magento tax classes to PlentyONE VAT rates for correct tax calculation.

**Row Fields**:
- **Magento Tax Class** (select, required) - Magento tax class
- **PlentyONE Tax Rate** (select, required) - PlentyONE VAT rate ID

**Example Configuration**:

| Magento Tax Class | PlentyONE VAT Rate | Usage |
|-------------------|--------------------|-------|
| Taxable Goods | 19% VAT (Germany) | Standard VAT rate |
| Reduced Rate | 7% VAT (Germany) | Reduced VAT for specific goods |
| Zero Rate | 0% VAT | Tax-exempt products |
| Digital Goods | 19% VAT | Digital products |

**Common VAT Rates**:
- **Germany**: 19% (standard), 7% (reduced)
- **UK**: 20% (standard), 5% (reduced), 0% (zero-rated)
- **France**: 20% (standard), 10% (reduced), 5.5% (super-reduced)
- **EU**: Varies by country

**Tax Calculation**:
- Prices exported as configured (gross or net)
- PlentyONE applies VAT based on mapping
- Supports country-specific VAT rates
- Handles B2B vs B2C tax scenarios

:::tip Tax Configuration
Ensure tax mapping matches your accounting requirements. Incorrect tax mappings can cause pricing discrepancies in PlentyONE and downstream marketplaces.
:::

---

### Price Mapping

**Field**: `price_mapping`
**Type**: Dynamic Rows
**Scope**: Website

Map Magento price types to PlentyONE sales price IDs for comprehensive price list management.

**Row Fields**:
- **Magento Price Type** (select, required) - Magento price type
- **PlentyONE Sales Price** (select, required) - PlentyONE price ID

**Available Magento Price Types**:
- **Regular Price** - Base product price
- **Special Price** - Promotional/sale price
- **Tier Price** - Quantity-based pricing
- **Customer Group Price** - Group-specific pricing
- **Cost** - Product cost (purchase price)

**Example Configuration**:

| Magento Price Type | PlentyONE Price ID | PlentyONE Price Name | Use Case |
|--------------------|--------------------|-----------------------|----------|
| Regular Price | 1 | Default | Standard retail price |
| Special Price | 2 | Sale | Promotional pricing |
| Tier Price (Qty 10+) | 3 | Wholesale | Bulk discount pricing |
| Customer Group: Business | 4 | B2B Price | Business customer pricing |
| Cost | 5 | Purchase Price | Product cost tracking |

**Price Configuration Strategy**:

**Retail Store**:
```
Regular Price → Price ID 1 (Default)
Special Price → Price ID 2 (Sale)
```

**B2B Wholesale**:
```
Regular Price → Price ID 1 (Retail)
Customer Group: Wholesale → Price ID 3 (Wholesale)
Tier Price (50+ qty) → Price ID 4 (Bulk)
```

**Multi-Currency**:
```
Regular Price (USD) → Price ID 1 (USD)
Regular Price (EUR) → Price ID 2 (EUR)
Regular Price (GBP) → Price ID 3 (GBP)
```

**How It Works**:
1. Product has Regular Price: $100, Special Price: $80
2. Regular Price mapped to PlentyONE Price ID 1
3. Special Price mapped to PlentyONE Price ID 2
4. Export creates two price records in PlentyONE:
   - Price 1: $100 (Default)
   - Price 2: $80 (Sale)

:::tip Multiple Price Lists
PlentyONE supports multiple price lists per product. Map all relevant Magento prices to ensure complete price coverage for different sales channels and customer groups.
:::

---

### Attribute Used For Purchase Price

**Field**: `purchase_price_mapping`
**Type**: Select
**Scope**: Global

Select which Magento attribute contains the product's purchase/cost price for cost tracking in PlentyONE.

**Common Options**:
- **Cost** (default attribute) - Standard Magento cost field
- Custom cost attribute - Custom attribute for cost
- **None** - Don't export purchase price

**Use Cases**:
- ✅ Cost tracking for margin calculation
- ✅ Inventory valuation
- ✅ Profit analysis in PlentyONE
- ✅ Supplier cost management

**Example**:
```
Product Cost in Magento: $45
Mapped to: cost attribute
Exports to: PlentyONE Purchase Price
Result: Cost visible in PlentyONE item data
```

---

### Enable Customer Group Pricing

**Field**: `is_active_customer_group_price`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable export of customer group-specific pricing and tier prices to PlentyONE.

**When to Enable**:
- ✅ B2B stores with wholesale pricing
- ✅ VIP/Premium customer pricing
- ✅ Quantity-based discounts (tier pricing)
- ✅ Group-specific price lists

**What Gets Exported**:
- Customer group prices
- Tier prices (quantity breaks)
- Group-tier combinations

**Impact**: Enables customer group mapping and price method configuration.

---

### Customer Group Mapping

**Field**: `customer_group_mapping`
**Type**: Dynamic Rows
**Scope**: Global
**Visible**: When "Enable Customer Group Pricing" is enabled

Map Magento customer groups to PlentyONE customer classes for group-specific pricing.

**Row Fields**:
- **Magento Customer Group** (select, required) - Magento group
- **PlentyONE Customer Class** (select, required) - PlentyONE class

**Example Configuration**:

| Magento Group | PlentyONE Class | Pricing Strategy |
|---------------|-----------------|------------------|
| General | Customer | Standard retail pricing |
| Wholesale | Business | Wholesale discounts |
| VIP | Premium | Premium pricing/discounts |
| Retailer | Reseller | Reseller pricing |

**How It Works**:
1. Product has different prices for different groups
2. System maps group to PlentyONE class
3. Exports price with customer class restriction
4. PlentyONE applies correct price based on customer class

---

### Customer Group Price Mapping Options

**Field**: `customer_group_price_mapping_option`
**Type**: Select (Required when enabled)
**Default**: Option 1
**Scope**: Global

Select how customer group prices should be mapped to PlentyONE sales prices.

**Options**:

| Option | Method | Description |
|--------|--------|-------------|
| **Option 1** | Manual Selection | Select specific price IDs for group pricing |
| **Option 2** | Automatic Detection | System automatically detects and maps group prices |

**Option 1 - Manual Selection**:
- You specify which PlentyONE price IDs to use
- Full control over price mapping
- Recommended for complex setups

**Option 2 - Automatic Detection**:
- System maps group prices automatically
- Less configuration required
- Works for standard group pricing

---

### Customer Group Price Mapping

**Field**: `customer_group_price_mapping`
**Type**: Multiselect (Required)
**Scope**: Global
**Visible**: When mapping option is set to manual selection

Select which PlentyONE sales price IDs to use for customer group pricing.

**Example**:
```
Selected Price IDs: [3, 4, 5]

Result:
- Magento Group: Wholesale → PlentyONE Price ID 3
- Magento Group: VIP → PlentyONE Price ID 4
- Magento Group: Retailer → PlentyONE Price ID 5
```

**Configuration Strategy**:
1. Create price IDs in PlentyONE for each customer group
2. Select those price IDs here
3. System maps groups to selected prices in order

---

### Tier Price Default Quantity

**Field**: `customer_group_price_default_qty`
**Type**: Input (Number)
**Scope**: Global
**Visible**: When "Enable Customer Group Pricing" is enabled

Default minimum quantity required to receive tier price discount.

**Default**: 1 (or configured value)

**Example**:
```
Tier Price Default Qty: 10

Magento Tier Prices:
- Qty 10+: $90 (10% off)
- Qty 50+: $80 (20% off)
- Qty 100+: $70 (30% off)

Exports to PlentyONE:
- Price with qty >= 10: $90
- Price with qty >= 50: $80
- Price with qty >= 100: $70
```

**Use Cases**:
- ✅ Wholesale quantity breaks
- ✅ Bulk order discounts
- ✅ Volume-based pricing tiers
- ✅ Minimum order quantities

---

## 6. Attribute Configuration

Map Magento product attributes to PlentyONE fields, properties, and metadata.

### Attribute Set Mapping

**Field**: `attribute_set_mapping`
**Type**: Select (Required)
**Scope**: Global

Use a PlentyONE property and its values to determine which Magento attribute set a product belongs to. This mapping helps organize products by type in PlentyONE.

**How It Works**:
1. Select a PlentyONE property (e.g., "Product Type")
2. System maps Magento attribute set to property value
3. Products exported with corresponding property value
4. PlentyONE can filter/group by property

**Example**:
```
PlentyONE Property: "Product Type"

Mapping:
- Magento Attribute Set: Electronics → Property Value: "Electronics"
- Magento Attribute Set: Clothing → Property Value: "Apparel"
- Magento Attribute Set: Books → Property Value: "Books"

Result: Products tagged with type in PlentyONE
```

**Use Cases**:
- ✅ Product categorization in PlentyONE
- ✅ Filter products by type
- ✅ Marketplace-specific requirements
- ✅ Reporting and analytics

---

### Item Texts Mapping

**Field**: `item_text_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map Magento text attributes to PlentyONE item text fields for product descriptions and content.

**Row Fields**:
- **Magento Attribute** (select, required) - Magento text attribute
- **PlentyONE Text Field** (select, required) - PlentyONE text field

**Available PlentyONE Text Fields**:
- `name` - Product name (primary)
- `name2` - Secondary name
- `name3` - Tertiary name
- `shortDescription` - Short description
- `description` - Full description
- `technicalData` - Technical specifications
- `metaDescription` - SEO meta description
- `metaKeywords` - SEO keywords
- `urlPath` - URL slug

**Example Configuration**:

| Magento Attribute | PlentyONE Field | Purpose |
|-------------------|-----------------|---------|
| name | name | Primary product name |
| short_description | shortDescription | Product summary |
| description | description | Full product details |
| meta_description | metaDescription | SEO metadata |
| custom_tech_specs | technicalData | Technical specifications |

**Multi-Language Support**:
- Exports content for all configured store views
- Creates separate text records per language
- Maintains language-specific content in PlentyONE

---

### Barcode Mapping

**Field**: `barcode_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map Magento attributes containing barcodes to PlentyONE barcode types.

**Row Fields**:
- **Magento Attribute** (select, required) - Attribute with barcode value
- **PlentyONE Barcode Type** (select, required) - Barcode type ID

**Supported Barcode Types**:
- **GTIN** (Global Trade Item Number)
- **ISBN** (International Standard Book Number)
- **UPC** (Universal Product Code)
- **EAN** (European Article Number)
- **Code 128**
- **Code 39**
- **Custom** barcode types

**Example Configuration**:

| Magento Attribute | PlentyONE Barcode Type | Usage |
|-------------------|------------------------|-------|
| gtin | GTIN | Standard product identifier |
| ean | EAN | European products |
| upc | UPC | US/Canada products |
| isbn | ISBN | Books |
| custom_barcode | Code 128 | Custom identifiers |

**Barcode Validation**:
- System validates barcode format
- Supports multiple barcodes per product
- Required for marketplace integrations (Amazon, eBay)

**Important**: Most marketplaces require GTINs. Ensure products have valid GTIN/EAN/UPC barcodes for marketplace sales.

---

### Market Number Mapping

**Field**: `market_number_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map Magento attributes to marketplace-specific identifiers (Amazon ASIN, eBay Item ID, etc.).

**Row Fields**:
- **Magento Attribute** (select, required) - Attribute with market ID
- **PlentyONE Market Number Type** (select, required) - Market identifier type

**Supported Market Numbers**:
- **ASIN** (Amazon Standard Identification Number)
- **eBay Item ID**
- **ISBN** (for books)
- **EPID** (eBay Product ID)
- **Custom market IDs**

**Example Configuration**:

| Magento Attribute | Market Number Type | Marketplace |
|-------------------|--------------------|-------------|
| amazon_asin | ASIN | Amazon |
| ebay_item_id | eBay Item ID | eBay |
| isbn | ISBN | Book marketplaces |

**Use Cases**:
- ✅ Link existing marketplace listings
- ✅ Maintain marketplace IDs in PlentyONE
- ✅ Cross-channel product tracking
- ✅ Prevent duplicate listings

---

### Attribute Used For Supplier Data

**Field**: `supplier_data_mapping`
**Type**: Select
**Scope**: Global

Select which Magento attribute contains supplier information (supplier ID, name, or reference).

**Use Cases**:
- ✅ Supplier tracking in PlentyONE
- ✅ Purchase order management
- ✅ Supplier cost association
- ✅ Inventory planning

**Example**:
```
Attribute: supplier_code
Value in Magento: SUP-12345
Exports to: PlentyONE supplier field
```

---

### Attribute Used For Manufacturer

**Field**: `manufacturer_mapping`
**Type**: Select
**Scope**: Global

Select which Magento attribute identifies the product manufacturer.

**Common Options**:
- `manufacturer` (default Magento attribute)
- Custom manufacturer attribute
- Brand attribute

**How It Works**:
1. Product has manufacturer attribute value (e.g., "Samsung")
2. System looks up manufacturer in PlentyONE by name
3. Links product to manufacturer ID
4. Manufacturer data available in PlentyONE

**Use Cases**:
- ✅ Brand filtering in PlentyONE
- ✅ Manufacturer-specific pricing
- ✅ Warranty tracking
- ✅ Supplier relationships

---

### Attribute Used For Country of Manufacturer

**Field**: `manufacturer_country_mapping`
**Type**: Select
**Scope**: Global

Select which attribute specifies the country where the product is manufactured.

**Use Cases**:
- ✅ Customs declarations
- ✅ Country of origin labeling
- ✅ Import/export documentation
- ✅ Trade compliance

**Example**:
```
Attribute: country_of_manufacture
Value: CN (China)
Exports to: PlentyONE manufacturer country
Result: Used in customs forms
```

---

### Attribute Used For Customs

**Field**: `customs_mapping`
**Type**: Select
**Scope**: Global

Select attribute containing customs percentage or customs-related data.

**Use Cases**:
- ✅ Import duty calculation
- ✅ Customs value declaration
- ✅ Cross-border shipping
- ✅ Trade documentation

---

### Attribute Used For Customs Tariff Number

**Field**: `customs_tariff_no_mapping`
**Type**: Select
**Scope**: Global

Select attribute containing the HS (Harmonized System) tariff code for customs classification.

**Importance**: Required for international shipping and customs clearance.

**Example**:
```
Attribute: hs_tariff_code
Value: 8517.12.00 (Mobile phones)
Exports to: PlentyONE tariff number
Result: Used in customs declarations
```

**Tariff Codes**:
- 6-10 digit classification
- Determines customs duties
- Required for international shipments
- Country-specific variations

---

### Dimension Attributes

#### Attribute Used For Length Dimension

**Field**: `dimension_length_mapping`
**Type**: Select
**Scope**: Global

Select attribute containing product length in configured units.

#### Attribute Used For Width Dimension

**Field**: `dimension_width_mapping`
**Type**: Select
**Scope**: Global

Select attribute containing product width in configured units.

#### Attribute Used For Height Dimension

**Field**: `dimension_height_mapping`
**Type**: Select
**Scope**: Global

Select attribute containing product height in configured units.

**Dimension Configuration**:

| Attribute | PlentyONE Field | Unit | Usage |
|-----------|-----------------|------|-------|
| length | lengthMM | mm | Package length |
| width | widthMM | mm | Package width |
| height | heightMM | mm | Package height |

**Use Cases**:
- ✅ Shipping cost calculation
- ✅ Package optimization
- ✅ Warehouse space planning
- ✅ Carrier integration

**Important**: Ensure dimensions are in correct units (typically mm or cm in PlentyONE).

---

### Default Weight Unit

**Field**: `default_weight_unit`
**Type**: Select
**Scope**: Global

Select the default weight unit for products without explicit unit specification.

**Available Units**:
- **g** (grams)
- **kg** (kilograms)
- **lb** (pounds)
- **oz** (ounces)

**Example**:
```
Default Weight Unit: kg
Product Weight: 1.5 (no unit specified)
Result: Exported as 1.5 kg to PlentyONE
```

---

### Default Weight

**Field**: `default_weight`
**Type**: Input (Number)
**Scope**: Global

Default weight value to use when product has no weight specified. This is a fallback for products missing weight data.

**Use Cases**:
- ❌ Products without physical weight (virtual/downloadable)
- ❌ Lightweight items where weight is negligible
- ✅ Fallback for shipping calculation

**Example**:
```
Default Weight: 0.1 (kg)
Product: No weight attribute
Result: Exported with 0.1 kg weight
```

**Recommendation**: Set to minimal weight (e.g., 0.1 kg) to avoid shipping calculation errors.

---

## 7. Category Configuration

Configure category export and mapping between Magento and PlentyONE category structures.

### Enable Category Export

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable export of product category assignments to PlentyONE. When enabled, products will be linked to their corresponding PlentyONE categories.

**When to Enable**:
- ✅ Export product category assignments
- ✅ Maintain category structure in PlentyONE
- ✅ Marketplace category mappings
- ✅ PlentyONE category filtering

**When to Disable**:
- ❌ Categories managed separately
- ❌ Manual category assignment in PlentyONE
- ❌ Products without categories

**Impact**: Enables category mapping and creation options.

---

### Root Category Mapping

**Field**: `root_category_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map Magento root categories to PlentyONE categories, establishing the category hierarchy foundation.

**Row Fields**:
- **Magento Category** (select, required) - Magento root category
- **PlentyONE Category** (select, required) - PlentyONE category ID

**Example Configuration**:

| Magento Root Category | PlentyONE Category | Hierarchy |
|-----------------------|--------------------|-----------|
| Default Category | Root (ID: 1) | All products |
| Electronics | Electronics (ID: 100) | Electronic products |
| Clothing | Apparel (ID: 200) | Clothing products |
| Books | Media (ID: 300) | Books and media |

**How Category Mapping Works**:

```
Magento Category Structure:
Default Category (Root)
  ├─ Electronics
  │   ├─ Computers
  │   └─ Phones
  └─ Clothing
      ├─ Men
      └─ Women

PlentyONE Category Structure:
Root (ID: 1)
  ├─ Electronics (ID: 100)
  │   ├─ Computers (ID: 101)
  │   └─ Phones (ID: 102)
  └─ Apparel (ID: 200)
      ├─ Men (ID: 201)
      └─ Women (ID: 202)

Mapping:
Magento: Default Category → PlentyONE: Root
Magento: Electronics → PlentyONE: Electronics (100)
Magento: Clothing → PlentyONE: Apparel (200)

Result:
Product in Magento: Electronics > Phones
Exported to: PlentyONE Electronics (100) > Phones (102)
```

**Category Hierarchy**:
- Subcategories mapped automatically if names match
- Manual mapping required for different structures
- Products inherit parent category mappings

---

### Create Root Category

**Field**: `create_category_group`
**Button**: Create Root Category
**Scope**: Global

Create a new root category directly in PlentyONE from Magento admin interface.

**Workflow**:
1. Click "Create Root Category" button
2. Modal opens with category creation form
3. Enter category details:
   - Category name
   - Parent category (if subcategory)
   - Category type
   - Additional metadata
4. Submit to create in PlentyONE
5. New category becomes available in mapping dropdown

**Use Cases**:
- ✅ Quick category creation without accessing PlentyONE
- ✅ Create categories during profile setup
- ✅ Add missing categories on-the-fly

**After Creation**: Run "Collect Configuration Data" to refresh category list.

---

### Attribute Mapping

**Field**: `attribute_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map category-specific attributes between Magento and PlentyONE for category metadata.

**Row Fields**:
- **Property** (select, required) - PlentyONE category property
- **Attribute** (select, required) - Magento category attribute

**Example Configuration**:

| PlentyONE Property | Magento Attribute | Purpose |
|-------------------|-------------------|---------|
| Category Description | description | Category descriptions |
| Meta Title | meta_title | SEO metadata |
| Meta Description | meta_description | SEO metadata |

**Use Cases**:
- ✅ Export category metadata
- ✅ SEO optimization in PlentyONE
- ✅ Category-specific attributes

---

## 8. URL Configuration

Configure product URL export for web integrations and marketplace listings.

### Enable URL Export

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable export of product URLs to PlentyONE for web integrations and marketplace links.

**When to Enable**:
- ✅ Create product URLs in PlentyONE
- ✅ Marketplace integrations (Amazon, eBay)
- ✅ Cross-channel product links
- ✅ SEO-friendly URLs in PlentyONE

**When to Disable**:
- ❌ URLs managed entirely in PlentyONE
- ❌ No web integration requirements

---

### URL Manage Options

**Field**: `url_manage_options`
**Type**: Select (Required when enabled)
**Scope**: Global

Select the method for generating product URLs in PlentyONE.

**Options**:

| Option | Method | Description |
|--------|--------|-------------|
| **Based on Item Text Fields** | Use PlentyONE text fields | Generate URLs from item names/descriptions |
| **Based on Attributes** | Use Magento attributes | Generate URLs from specified attributes |

**Option 1: Item Text Fields**:
- Uses PlentyONE name, name2, or name3
- Simple URL generation
- Language-specific URLs

**Option 2: Attributes**:
- Combines multiple Magento attributes
- Custom URL patterns
- More control over URL structure

---

### Manage URL Based On Item Text Fields

**Field**: `url_manage_based_on_text`
**Type**: Multiselect (Required)
**Scope**: Global
**Visible**: When URL option is "Based on Item Text Fields"

Select which PlentyONE text fields to use for URL generation.

**Available Fields**:
- `name` - Primary product name
- `name2` - Secondary name
- `name3` - Tertiary name

**Example**:
```
Selected: name, name2
Product Name: "Samsung Galaxy S21"
Name2: "Smartphone 128GB"

Generated URL: samsung-galaxy-s21-smartphone-128gb
```

**URL Generation**:
- Text fields combined in order
- Spaces replaced with hyphens
- Special characters removed
- Lowercase conversion

---

### Manage URL Based On Combination Of Attributes

**Field**: `url_manage_based_on_attribute`
**Type**: Multiselect (Required)
**Scope**: Global
**Visible**: When URL option is "Based on Attributes"

Select which Magento attributes to combine for URL generation.

**Example Configuration**:
```
Selected Attributes:
- brand
- name
- color
- size

Product:
- Brand: Nike
- Name: Air Max 90
- Color: Black
- Size: 42

Generated URL: nike-air-max-90-black-42
```

**Use Cases**:
- ✅ SEO-optimized URLs with key attributes
- ✅ Marketplace-specific URL patterns
- ✅ Unique URL generation for variants

---

## 9. Media Configuration

Configure product image and video export to PlentyONE media library.

### Enable Media Export

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable export of product images and videos to PlentyONE. When enabled, images will be uploaded or linked to PlentyONE media storage.

**When to Enable**:
- ✅ Export product images to PlentyONE
- ✅ Marketplace image requirements
- ✅ Centralized media management
- ✅ Multi-channel image distribution

**When to Disable**:
- ❌ Images managed separately
- ❌ External image hosting
- ❌ Products without images

---

### Use Image Direct URL For Upload

**Field**: `is_upload_image_url`
**Type**: Checkbox
**Default**: Enabled
**Scope**: Global

Determine how images are uploaded to PlentyONE.

**Options**:

| Mode | Method | Description |
|------|--------|-------------|
| **Enabled** (URL) | Link external URLs | Provide Magento image URLs to PlentyONE |
| **Disabled** (Upload) | Upload image files | Upload actual image files to PlentyONE storage |

**URL Mode** (Enabled - Recommended):
- ✅ Faster export (no file upload)
- ✅ No storage consumption in PlentyONE
- ✅ Images hosted on Magento server
- ❌ Requires publicly accessible URLs
- ❌ Dependent on Magento server uptime

**Upload Mode** (Disabled):
- ✅ Images stored in PlentyONE CDN
- ✅ Independent of Magento server
- ✅ Better for marketplace integrations
- ❌ Slower export (file transfer)
- ❌ Consumes PlentyONE storage

**Recommendation**: Use URL mode for initial sync, switch to upload for production if images need to be in PlentyONE storage.

:::tip Image Accessibility
If using URL mode, ensure Magento image URLs are publicly accessible. Private/localhost URLs will fail in PlentyONE.
:::

---

### Media Channel Filter

**Field**: `media_chanel_filter`
**Type**: Select (Required)
**Default**: No filter
**Scope**: Global

Configure which sales channels (mandants/referrers) should have access to product images in PlentyONE.

**Options**:

| Option | Description | Use Case |
|--------|-------------|----------|
| **0 - No Filter** | Images available to all channels | ✅ Default, all marketplaces |
| **1 - Filter by Client/Referrer** | Restrict images to specific channels | ⚠️ Channel-specific images |

**No Filter (Default)**:
- All images available to all sales channels
- Simplest configuration
- Recommended for most cases

**Filter by Client/Referrer**:
- Restrict image visibility by channel
- Useful for channel-specific image sets
- Requires additional configuration

---

### Media Channel Filter [Client Stores]

**Field**: `media_chanel_filter_client`
**Type**: Multiselect (Required when filtering enabled)
**Scope**: Global
**Visible**: When channel filter is enabled

Select which PlentyONE client stores (mandants) should have access to the exported images.

**Example**:
```
Selected Clients: [1000, 2000]

Result:
- Images available to client 1000 (Main Store)
- Images available to client 2000 (Outlet Store)
- Images NOT available to other clients
```

**Use Cases**:
- ✅ Store-specific image sets
- ✅ Brand-segregated media
- ✅ Regional image restrictions

---

### Media Channel Filter [Referrers]

**Field**: `media_chanel_filter_referrer`
**Type**: Multiselect (Required when filtering enabled)
**Scope**: Global
**Visible**: When channel filter is enabled

Select which referrers (sales channels/marketplaces) should have access to the exported images.

**Example**:
```
Selected Referrers:
- Amazon
- eBay
- Magento Store

Result: Images available only to these channels
```

**Use Cases**:
- ✅ Marketplace-specific images
- ✅ Watermarked images for certain channels
- ✅ Channel image restrictions

---

### Attribute Used For Video URL

**Field**: `video_url_mapping`
**Type**: Select
**Scope**: Global

Select which PlentyONE property contains product video URLs for video export.

**Example**:
```
Attribute: video_url
Value: https://youtube.com/watch?v=abc123
Exports to: PlentyONE property
Result: Video link available in PlentyONE
```

**Supported Video Sources**:
- YouTube URLs
- Vimeo URLs
- Direct video file URLs
- Embedded video codes

**Use Cases**:
- ✅ Product demonstration videos
- ✅ Marketplace video listings
- ✅ Rich content for product pages

---

## 10. Cross-sells Configuration

Configure export of related products, up-sells, and cross-sells to PlentyONE.

### Enable Cross-sells Export

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable export of product relationships (related, up-sell, cross-sell) to PlentyONE.

**When to Enable**:
- ✅ Export product relationships
- ✅ Recommendation engines
- ✅ Cross-selling strategies
- ✅ Marketplace recommendations

**Product Relationships**:
- **Related Products**: Similar items customers may like
- **Up-sells**: Premium alternatives to current product
- **Cross-sells**: Complementary products

---

### Relation Mapping

**Field**: `relation_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map Magento product relationship types to PlentyONE cross-sell types.

**Row Fields**:
- **Magento Relation** (select, required) - Magento link type
- **PlentyONE Relation** (select, required) - PlentyONE cross-sell type

**Available Magento Relations**:
- **Related** - Related products
- **Upsell** - Up-sell products
- **Crosssell** - Cross-sell products

**Example Configuration**:

| Magento Relation | PlentyONE Type | Usage |
|------------------|----------------|-------|
| Related | Similar | Similar product recommendations |
| Upsell | Accessory | Premium alternatives |
| Crosssell | Bundle | Frequently bought together |

**How It Works**:
```
Product: Camera
Related Products: Camera Bag, Tripod
Upsell: Professional Camera
Crosssell: Memory Card

Exported to PlentyONE:
- Similar: Camera Bag, Tripod
- Accessory: Professional Camera
- Bundle: Memory Card

Result: Recommendations available in PlentyONE
```

**Use Cases**:
- ✅ Increase average order value
- ✅ Product recommendations
- ✅ Marketplace cross-selling
- ✅ Bundle promotions

---

## 11. Property Configuration

Configure custom property creation and mapping for product attributes.

### Create New Property

**Field**: `is_active_create_property`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable automatic creation of new properties in PlentyONE when exporting products with unmapped attributes.

**When to Enable**:
- ✅ Automatic property creation for new attributes
- ✅ Dynamic catalog with frequent new attributes
- ✅ Initial catalog migration
- ✅ Rapid product onboarding

**When to Disable**:
- ❌ Manual property management preferred
- ❌ Strict property structure in PlentyONE
- ❌ Prevent accidental property creation

**How It Works**:
1. Product has attribute "warranty_period"
2. Attribute not mapped to existing property
3. System creates new property "warranty_period" in PlentyONE
4. Exports product with new property value
5. Property available for future products

:::warning Property Creation
Automatic property creation can lead to property proliferation. Consider mapping attributes manually for better control over PlentyONE structure.
:::

---

### Create New Property Option(s)

**Field**: `is_active_create_property_option`
**Type**: Checkbox
**Default**: Enabled
**Scope**: Global
**Visible**: When "Create New Property" is enabled

Enable automatic creation of property options (select values) for select-type attributes.

**How It Works**:
```
Property: Color
Existing Options: Red, Blue, Green

Product has: Color = "Purple"

With Option Creation Enabled:
1. "Purple" not found in existing options
2. System creates "Purple" option in PlentyONE
3. Product exported with Color = Purple

With Option Creation Disabled:
1. "Purple" not found
2. Export fails or skips color attribute
```

**Use Cases**:
- ✅ Dynamic attribute values
- ✅ Frequent new color/size additions
- ✅ Marketplace attribute variations

---

### Excluded Properties

**Field**: `excluded_property`
**Type**: Multiselect (Required when property creation enabled)
**Scope**: Global
**Visible**: When "Create New Property" is enabled

Select which Magento attributes should NOT be exported as properties to PlentyONE.

**Common Exclusions**:
- **System Attributes**: created_at, updated_at, entity_id
- **Internal Attributes**: is_imported, sync_status
- **Magento-Specific**: url_key, url_path, tax_class_id
- **Redundant Attributes**: Attributes mapped elsewhere

**Example**:
```
Excluded Properties:
- created_at
- updated_at
- entity_id
- custom_sync_flag

Result: These attributes never exported as properties
```

**Why Exclude**:
- ✅ Prevent unnecessary properties in PlentyONE
- ✅ Reduce property clutter
- ✅ Exclude system/internal attributes
- ✅ Improve export performance

---

### Property Mapping

**Field**: `property_mapping`
**Type**: Dynamic Rows
**Scope**: Website

Manually map Magento attributes to existing PlentyONE properties for precise control over attribute export.

**Row Fields**:
- **Magento Attribute** (select, required) - Magento product attribute
- **PlentyONE Property** (select, required) - PlentyONE property ID

**Example Configuration**:

| Magento Attribute | PlentyONE Property | Type | Usage |
|-------------------|-------------------|------|-------|
| warranty_period | Warranty (ID: 150) | Text | Product warranty |
| energy_rating | Energy Rating (ID: 151) | Selection | Energy efficiency |
| eco_friendly | Eco Friendly (ID: 152) | Checkbox | Sustainability flag |
| material | Material (ID: 153) | Text | Product material |
| care_instructions | Care Instructions (ID: 154) | Text | Maintenance info |

**Property Types**:
- **Text**: Free-form text values
- **Selection**: Predefined options (dropdown)
- **Multiselection**: Multiple option selection
- **Int**: Integer numbers
- **Float**: Decimal numbers
- **Date**: Date values
- **File**: File uploads

**How It Works**:
```
Product Attribute:
- warranty_period = "2 years"

Mapping:
- warranty_period → PlentyONE Property 150

Export:
- Property 150 (Warranty) = "2 years"

Result: Attribute visible as property in PlentyONE
```

**Best Practice**: Map critical attributes manually rather than relying on automatic creation for better structure control.

---

## 12. Configurable Product Configuration

Configure how Magento configurable products and their variation attributes map to PlentyONE structure.

### Attribute Mapping

**Field**: `attribute_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map Magento super attributes (configurable attributes) to PlentyONE variation attributes.

**Row Fields**:
- **Magento Attribute** (select, required) - Magento configurable attribute
- **PlentyONE Attribute** (select, required) - PlentyONE variation attribute

**Available PlentyONE Variation Attributes**:
- `attribute_1` - Usually Color
- `attribute_2` - Usually Size
- `attribute_3` - Custom variation property 1
- `attribute_4` - Custom variation property 2

**Example Configuration**:

| Magento Attribute | PlentyONE Attribute | Usage |
|-------------------|---------------------|-------|
| color | attribute_1 | Color variations |
| size | attribute_2 | Size variations |
| material | attribute_3 | Material variations |
| style | attribute_4 | Style variations |

**Configurable Product Structure**:

```
Magento Configurable Product:
  Parent: T-Shirt (SKU: TSHIRT)
    ↳ Child 1: Red / Small (SKU: TSHIRT-RED-S)
    ↳ Child 2: Red / Medium (SKU: TSHIRT-RED-M)
    ↳ Child 3: Blue / Small (SKU: TSHIRT-BLUE-S)
    ↳ Child 4: Blue / Medium (SKU: TSHIRT-BLUE-M)

Exported to PlentyONE:
  Item: T-Shirt (Item ID: 1001)
    ↳ Variation 1: attribute_1=Red, attribute_2=Small
    ↳ Variation 2: attribute_1=Red, attribute_2=Medium
    ↳ Variation 3: attribute_1=Blue, attribute_2=Small
    ↳ Variation 4: attribute_1=Blue, attribute_2=Medium
```

**How It Works**:
1. Configurable product exported as PlentyONE item
2. Each child product becomes a variation
3. Super attributes mapped to variation attributes
4. Variation options created in PlentyONE
5. Products linked by parent item ID

**Important Notes**:
- Parent product does NOT create a variation in PlentyONE
- Only child products become variations
- All children must share same super attributes
- Main variation (first child) marked as primary

**Variation Attribute Naming in PlentyONE**:
- Configure attribute names in PlentyONE settings
- Default: attribute_1=Color, attribute_2=Size
- Customizable per client

**Use Cases**:
- ✅ Clothing (color, size)
- ✅ Electronics (color, storage capacity)
- ✅ Furniture (material, finish)
- ✅ Multi-variant products

**Marketplace Integration**:
- Amazon requires attribute_1 for color, attribute_2 for size
- eBay uses variation specifics (flexible)
- Ensure mapping matches marketplace requirements

---

## Event Configuration

**Note**: Event configuration is reserved for future use. Currently, product export uses queue-based processing triggered by:
- Manual execution via CLI
- Scheduled cron execution
- Observer events (product save, update, delete)

Observer events automatically add products to the export queue when:
- New products are created
- Existing products are updated
- Products are deleted (if configured)

---

## CLI Commands

Execute product export operations manually via command line.

### Basic Export Commands

```bash
# Export all products in queue (prompts for confirmation)
bin/magento plenty:item:export

# Export specific products by SKU
bin/magento plenty:item:export -s SKU001,SKU002,SKU003

# Export specific products by ID
bin/magento plenty:item:export -i 1,2,3

# Export products by queue status
bin/magento plenty:item:export -w pending

# Export with specific profile
bin/magento plenty:item:export -p 6
```

### Dry Run Mode

Preview what will be exported without making any changes to PlentyONE:

```bash
# Dry run: Preview all queued products
bin/magento plenty:item:export --dry-run

# Dry run: Preview specific SKUs
bin/magento plenty:item:export -s SKU001,SKU002 --dry-run

# Dry run: Preview by queue status
bin/magento plenty:item:export -w pending --dry-run
```

**Dry Run Output Example:**
```
DRY RUN MODE: Previewing 5 products for export...

+----+----------------+---------+-------------------+
| ID | SKU            | Status  | PlentyONE Item ID |
+----+----------------+---------+-------------------+
| 1  | PROD-001       | pending | Not assigned      |
| 2  | PROD-002       | pending | 8064              |
| 3  | PROD-003       | pending | Not assigned      |
+----+----------------+---------+-------------------+

DRY RUN SUMMARY:
  - Would export: 3 products

No changes were made to PlentyONE.
```

### Progress Tracking

The export command provides real-time per-product progress:

```
Exporting products to PlentyONE...

 3/5 [===============>------------]  60% 00:12/00:20 128M Processing: PROD-003

Successfully processed 5 products
```

### Profile Management Commands

```bash
# View profile execution history
bin/magento byte8:profile:history:list --profile-id=6

# View last 10 executions
bin/magento byte8:profile:history:list --profile-id=6 --limit=10

# Clear profile history
bin/magento byte8:profile:history:clear --profile-id=6
```

### Command Options Reference

| Option | Short | Description |
|--------|-------|-------------|
| `--profile-id` | `-p` | Product export profile ID (uses default if not specified) |
| `--sku` | `-s` | Comma-separated SKU list |
| `--id` | `-i` | Comma-separated product entity ID list |
| `--status` | `-w` | Filter by queue status |
| `--dry-run` | `-d` | Preview mode: display what will be exported without changes |

---

## Common Workflows

### 1. Initial Catalog Sync

**Scenario**: First-time export of entire product catalog to PlentyONE.

**Steps**:

1. **Configure Profile**
   - Set up client connection
   - Configure store mapping
   - Map tax classes and prices
   - Configure attribute mappings
   - Map categories
   - Set up barcode mappings
   - Configure media export

2. **Collect Configuration Data**
   - Click "Collect Configuration Data"
   - Verify categories loaded
   - Verify properties loaded
   - Verify prices and taxes loaded

3. **Add Products to Queue**
   ```bash
   # Add all products to queue
   bin/magento byte8:plenty:item:queue:add --profile-id=6
   ```

4. **Test Export with Small Batch**
   ```bash
   # Export first 10 products
   bin/magento byte8:plenty:item:export --profile-id=6 --batch-size=10 --limit=10
   ```

5. **Verify in PlentyONE**
   - Check items created
   - Verify variations
   - Check prices
   - Verify categories
   - Check images

6. **Full Export**
   ```bash
   # Export all products
   bin/magento byte8:plenty:item:export --profile-id=6 --batch-size=20
   ```

7. **Enable Schedule**
   - Enable "Enable Schedule"
   - Set schedule to every 30 minutes
   - Enable history logging

**Timeline**:
- Configuration: 2-4 hours
- Test export: 30 minutes
- Full catalog (1000 products): 2-4 hours
- Verification: 1-2 hours

---

### 2. Automated New Product Export

**Scenario**: Automatically export new products as they're created in Magento.

**Setup**:

1. **Configure Export Profile** (one-time)
   - Complete all mappings
   - Test with sample products
   - Verify export works correctly

2. **Enable Schedule**
   - Schedule Configuration → Enable Schedule: Yes
   - Schedule: Every 15-30 minutes
   - Batch Size: 10-20

3. **Configure Observers** (via custom module or configuration)
   - Product create observer → add to queue
   - Product update observer → add to queue (optional)

**Workflow**:
```
Admin creates product
  ↓
Observer triggers
  ↓
Product added to export queue (status: pending)
  ↓
Cron runs (every 15 min)
  ↓
Export profile processes queue
  ↓
Product exported to PlentyONE
  ↓
Queue status: complete
  ↓
PlentyONE item ID saved to product
```

**Monitoring**:
```bash
# Check queue status
bin/magento byte8:plenty:item:queue:list --profile-id=6 --status=pending

# Check for errors
bin/magento byte8:plenty:item:queue:list --profile-id=6 --status=error

# View recent history
bin/magento byte8:profile:history:list --profile-id=6 --limit=10
```

---

### 3. Price Update Synchronization

**Scenario**: Regularly sync price changes from Magento to PlentyONE.

**Configuration**:

1. **Enable Price Export**
   - Tax And Price Configuration → Enable Price Export: Yes
   - Configure price mappings:
     - Regular Price → Default Price (ID: 1)
     - Special Price → Sale Price (ID: 2)
     - Tier Prices → Wholesale Price (ID: 3)

2. **Configure Update Observer**
   - Product update observer adds changed products to queue

3. **Schedule**
   - Every 30-60 minutes
   - Batch size: 20-30 (simple products only)

**Manual Price Update**:
```bash
# Add products with recent price changes
bin/magento byte8:plenty:item:queue:add --profile-id=6 --updated-since="1 hour ago"

# Export price updates
bin/magento byte8:plenty:item:export --profile-id=6
```

**Verify Price Sync**:
1. Update price in Magento
2. Product added to queue
3. Wait for cron or export manually
4. Check PlentyONE for updated price

---

### 4. Configurable Product with Variations

**Scenario**: Export configurable T-shirt with multiple color and size variations.

**Product Structure in Magento**:
```
Configurable Product: "Premium T-Shirt"
  SKU: TSHIRT-PARENT
  Attributes: color, size

Children:
  1. Red / Small (SKU: TSHIRT-RED-S)
  2. Red / Medium (SKU: TSHIRT-RED-M)
  3. Blue / Small (SKU: TSHIRT-BLUE-S)
  4. Blue / Medium (SKU: TSHIRT-BLUE-M)
```

**Configuration**:

1. **Configurable Product Configuration**
   - Map "color" → attribute_1
   - Map "size" → attribute_2

2. **Add to Queue**
   ```bash
   bin/magento byte8:plenty:item:queue:add --profile-id=6 --sku=TSHIRT-PARENT
   ```

3. **Export**
   ```bash
   bin/magento byte8:plenty:item:export --profile-id=6 --batch-size=5
   ```

**Result in PlentyONE**:
```
Item: Premium T-Shirt (Item ID: 1001)
  ↳ Variation 1 (Main): attribute_1=Red, attribute_2=Small (SKU: TSHIRT-RED-S)
  ↳ Variation 2: attribute_1=Red, attribute_2=Medium (SKU: TSHIRT-RED-M)
  ↳ Variation 3: attribute_1=Blue, attribute_2=Small (SKU: TSHIRT-BLUE-S)
  ↳ Variation 4: attribute_1=Blue, attribute_2=Medium (SKU: TSHIRT-BLUE-M)
```

**Variation Data**:
- Each variation has own SKU, price, stock
- Variations inherit item-level data (descriptions, categories)
- Images can be variation-specific or inherited
- Main variation (first child) is default

---

### 5. Multi-Language Product Export

**Scenario**: Export products with English, German, and French content.

**Store Configuration**:
```
Store Views:
- English Store (default)
- German Store (Deutsch)
- French Store (Français)
```

**Profile Configuration**:

1. **Store Mapping**
   | Store | Client | Locale |
   |-------|--------|--------|
   | English Store | 1000 | en |
   | German Store | 1000 | de |
   | French Store | 1000 | fr |

2. **Content Per Store**:
   ```
   Product: "T-Shirt"

   English Store:
   - Name: "Premium T-Shirt"
   - Description: "High quality cotton t-shirt"

   German Store:
   - Name: "Premium T-Shirt"
   - Description: "Hochwertiges Baumwoll-T-Shirt"

   French Store:
   - Name: "T-Shirt Premium"
   - Description: "T-shirt en coton de haute qualité"
   ```

3. **Export Result in PlentyONE**:
   ```
   Item: T-Shirt
     Texts:
       - Language: en
         Name: "Premium T-Shirt"
         Description: "High quality cotton t-shirt"

       - Language: de
         Name: "Premium T-Shirt"
         Description: "Hochwertiges Baumwoll-T-Shirt"

       - Language: fr
         Name: "T-Shirt Premium"
         Description: "T-shirt en coton de haute qualité"
   ```

**Workflow**:
1. Product content entered per store view in Magento
2. Export processes each store mapping
3. Creates separate text records per language
4. PlentyONE displays appropriate language based on context

---

## Troubleshooting

### Products Not Exporting

**Symptoms**:
- Products remain in queue with "pending" status
- No items created in PlentyONE
- Export runs but processes 0 products

**Diagnostic Steps**:

1. **Check Queue**
   ```bash
   bin/magento byte8:plenty:item:queue:list --profile-id=6 --status=pending
   ```
   - If empty: Products not added to queue
   - If has items: Check schedule and execution

2. **Check Schedule Status**
   - Schedule Configuration → Enable Schedule: Verify enabled
   - Verify schedule is active and runs regularly
   - Check cron is running: `bin/magento cron:run`

3. **Check Profile Configuration**
   - Client Configuration: Verify client selected
   - Store Mapping: Verify store mapped
   - Category Mapping: Verify categories mapped (if enabled)

4. **Check Product Data**
   - Verify product is enabled
   - Verify product has required attributes
   - Check if product has categories (if category export enabled)
   - Verify product has price (if price export enabled)

5. **Check Error Logs**
   ```bash
   tail -f var/log/plenty/item-export-*.log
   tail -f var/log/system.log
   ```

**Common Causes**:

| Issue | Cause | Solution |
|-------|-------|----------|
| Queue empty | Products not added | Add manually with queue:add command |
| Schedule disabled | Schedule not enabled | Enable in profile configuration |
| Missing required data | No categories/prices | Configure mappings, add required data |
| API error | Invalid credentials | Verify client credentials |
| Memory exhaustion | Batch size too large | Reduce batch size |

---

### Configurable Product Export Fails

**Symptoms**:
- Parent product exports but children don't create variations
- Error: "Could not load child products"
- Variations not visible in PlentyONE

**Solutions**:

1. **Verify Child Products Exist**
   ```bash
   # Check children in database
   bin/magento catalog:product:list | grep "PARENT-SKU"
   ```

2. **Check Child Product Status**
   - All children must be enabled
   - All children must have stock status = "In Stock" (or configured)
   - All children must have visibility = "Not Visible Individually"

3. **Verify Attribute Mapping**
   - Configurable Product Configuration → Attribute Mapping
   - Ensure super attributes mapped to attribute_1, attribute_2, etc.
   - Run "Collect Configuration Data" to refresh attributes

4. **Check Child Product Data**
   - All children must have variation attribute values
   - Example: color=Red, size=Small
   - Verify values exist in attribute options

5. **Review Generator Logs**
   ```bash
   tail -f var/log/plenty/item-export-*.log | grep "Configurable"
   ```

6. **Test with Single Configurable**
   ```bash
   bin/magento byte8:plenty:item:export --profile-id=6 --sku=CONFIGURABLE-SKU --batch-size=1
   ```

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| Children not loading | Disabled children | Enable all child products |
| Missing variations | Attribute not mapped | Map super attributes |
| SKU mismatch | Child SKU incorrect | Verify child SKUs in Magento |
| Attribute values missing | Child missing values | Add attribute values to children |

---

### Images Not Uploading

**Symptoms**:
- Products export but images missing in PlentyONE
- Error: "Could not upload image"
- Image processor fails

**Solutions**:

1. **Verify Media Export Enabled**
   - Media Configuration → Enable Media Export: Verify enabled

2. **Check Image URLs**
   ```bash
   # Test image URL accessibility
   curl -I https://yourstore.com/media/catalog/product/i/m/image.jpg
   ```
   - Must return 200 OK
   - Must be publicly accessible (not localhost)
   - Must not require authentication

3. **Check Upload Mode**
   - Media Configuration → Use Image Direct URL
   - **URL Mode** (Enabled): Requires publicly accessible URLs
   - **Upload Mode** (Disabled): Uploads files to PlentyONE

4. **Verify Image Files Exist**
   ```bash
   ls -la pub/media/catalog/product/
   ```
   - Check image files present
   - Verify correct permissions (readable)

5. **Check PlentyONE Storage**
   - If using Upload Mode: Verify PlentyONE storage credentials
   - Check storage quota not exceeded
   - Test image upload via PlentyONE admin

6. **Review Image Processor Logs**
   ```bash
   tail -f var/log/plenty/item-export-*.log | grep "Image"
   ```

7. **Test Image Export**
   ```bash
   # Export single product with images
   bin/magento byte8:plenty:item:export --profile-id=6 --sku=TEST-SKU -vvv
   ```

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| URLs not accessible | Private/localhost URLs | Use public URLs or upload mode |
| Permission denied | File permissions | Set correct file permissions |
| Storage quota exceeded | PlentyONE storage full | Increase quota or clean up |
| Image too large | File size limit | Resize images or increase limit |
| Invalid format | Unsupported format | Convert to JPG/PNG |

---

### Prices Missing in PlentyONE

**Symptoms**:
- Products export but no prices in PlentyONE
- Price shows as 0.00
- Special prices not exporting

**Solutions**:

1. **Verify Price Export Enabled**
   - Tax And Price Configuration → Enable Price Export: Verify enabled

2. **Check Price Mapping**
   - Price Mapping: Verify Regular Price mapped to PlentyONE price ID
   - Each price type must be mapped to valid price ID
   - Run "Collect Configuration Data" to refresh price IDs

3. **Check Product Has Prices**
   ```bash
   # Check product price in database
   bin/magento catalog:product:show SKU123 --attributes=price,special_price
   ```
   - Verify price > 0
   - Check special_price if expecting sale prices

4. **Check Tax Mapping**
   - Tax Mapping: Verify tax class mapped
   - Products must have valid tax class
   - Tax rates must exist in PlentyONE

5. **Verify Currency Configuration**
   - Check base currency matches PlentyONE
   - Multi-currency: Configure separate price IDs per currency

6. **Review Price Generator Logs**
   ```bash
   tail -f var/log/plenty/item-export-*.log | grep "Price"
   ```

7. **Test Price Export**
   ```bash
   bin/magento byte8:plenty:item:export --profile-id=6 --sku=TEST-SKU -vvv
   ```

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| Price = 0 | No price in Magento | Set product price |
| Price not mapped | Missing mapping | Add price mapping |
| Wrong tax | Tax class not mapped | Map tax class |
| Currency mismatch | Different currencies | Configure currency mapping |
| Special price ignored | Not mapped | Map special price to sale price ID |

---

### Memory Exhaustion During Export

**Symptoms**:
- PHP fatal error: "Allowed memory size exhausted"
- Export crashes during configurable products
- Large batches fail

**Solutions**:

1. **Reduce Batch Size**
   - Schedule Configuration → Process Batch Size: Reduce to 5-10
   - Especially for configurable/bundle products

2. **Increase PHP Memory Limit**
   ```bash
   # Edit php.ini
   memory_limit = 2G

   # Or in .htaccess
   php_value memory_limit 2G

   # Or via CLI
   php -d memory_limit=2G bin/magento byte8:plenty:item:export
   ```

3. **Export by Product Type**
   ```bash
   # Export simple products first (small batches)
   bin/magento byte8:plenty:item:export --profile-id=6 --type=simple --batch-size=30

   # Then configurable (smaller batches)
   bin/magento byte8:plenty:item:export --profile-id=6 --type=configurable --batch-size=5
   ```

4. **Disable Media Export Temporarily**
   ```bash
   bin/magento byte8:plenty:item:export --profile-id=6 --skip-media
   ```

5. **Check Smart Aggregation**
   - Verify ItemExportService uses smart message aggregation
   - Multi-batch exports should clear messages between batches

6. **Monitor Memory Usage**
   ```bash
   # Run export with memory monitoring
   php -d memory_limit=2G bin/magento byte8:plenty:item:export --profile-id=6 -vvv
   ```

**Memory Recommendations**:

| Product Type | Batch Size | Memory Needed |
|--------------|------------|---------------|
| Simple | 20-30 | 512M |
| Configurable (few children) | 10-15 | 1G |
| Configurable (many children) | 5-10 | 2G |
| Bundle | 5-10 | 1-2G |

---

### Export Queue Growing

**Symptoms**:
- Queue fills up faster than processing
- Thousands of pending items
- Export never catches up

**Solutions**:

1. **Check Schedule Frequency**
   - Increase frequency: Every 15 min → Every 5 min
   - Ensure cron runs reliably

2. **Increase Batch Size**
   ```bash
   # Process larger batches
   bin/magento byte8:plenty:item:export --profile-id=6 --batch-size=50
   ```

3. **Disable Auto-Queue Temporarily**
   - If using observers: Disable during cleanup
   - Prevents new items while processing backlog

4. **Parallel Processing**
   ```bash
   # Terminal 1: Process simple products
   bin/magento byte8:plenty:item:export --profile-id=6 --type=simple &

   # Terminal 2: Process configurable products
   bin/magento byte8:plenty:item:export --profile-id=6 --type=configurable &
   ```

5. **Clear Old Completed Items**
   ```bash
   bin/magento byte8:plenty:item:queue:clear --profile-id=6 --status=complete
   ```

6. **Process During Off-Peak**
   - Schedule large exports at night
   - Reduce batch size during business hours

7. **Identify Problematic Products**
   ```bash
   # Check for stuck items
   bin/magento byte8:plenty:item:queue:list --profile-id=6 --status=processing

   # Check errors
   bin/magento byte8:plenty:item:queue:list --profile-id=6 --status=error
   ```

**Queue Management Strategy**:
```
1. Morning: Clear completed items
2. Daytime: Small batches (5-10), frequent (every 15 min)
3. Night: Large batches (30-50), bulk processing
4. Weekly: Review and reset error items
```

---

### Category Assignment Fails

**Symptoms**:
- Products export but not assigned to categories
- Error: "Category not found"
- Products appear uncategorized in PlentyONE

**Solutions**:

1. **Verify Category Export Enabled**
   - Category Configuration → Enable Category Export: Verify enabled

2. **Check Category Mapping**
   - Root Category Mapping: Verify Magento categories mapped to PlentyONE
   - Collect Configuration Data to refresh categories

3. **Verify Product Has Categories**
   ```bash
   # Check product categories
   bin/magento catalog:product:show SKU123 --attributes=category_ids
   ```

4. **Check Categories Exist in PlentyONE**
   - Verify mapped categories exist
   - Create missing categories in PlentyONE
   - Run "Collect Configuration Data"

5. **Test Category Creation**
   - Use "Create Root Category" button
   - Create test category
   - Map and test export

6. **Review Category Generator Logs**
   ```bash
   tail -f var/log/plenty/item-export-*.log | grep "Category"
   ```

**Common Issues**:

| Issue | Cause | Solution |
|-------|-------|----------|
| Category not found | No mapping | Map categories |
| Category doesn't exist | Missing in PM | Create in PlentyONE |
| Product uncategorized | No categories in Magento | Assign categories |
| Mapping incorrect | Wrong category ID | Update mapping |

---

## Best Practices

### Initial Setup

1. **Start with Test Profile**
   - Create test profile first
   - Test with 10-20 sample products
   - Verify all configurations work
   - Clone to production profile

2. **Complete Configuration Sequence**
   ```
   1. Client Configuration → Select client
   2. Collect Configuration Data → Fetch metadata
   3. Store Mapping → Map stores
   4. Tax Mapping → Map tax classes
   5. Price Mapping → Map prices
   6. Attribute Configuration → Map attributes
   7. Category Configuration → Map categories
   8. Media Configuration → Configure images
   9. Test Export → Validate with samples
   10. Enable Schedule → Activate automation
   ```

3. **Validate Mappings**
   - Check every mapping has values
   - Verify dropdown options populated
   - Test with sample products
   - Review export results in PlentyONE

4. **Document Configuration**
   - Export profile settings
   - Document custom mappings
   - Keep backup of configuration
   - Note any special requirements

---

### Product Export Strategy

1. **Export by Product Type**
   ```bash
   # Day 1: Simple products (fast)
   bin/magento byte8:plenty:item:export --type=simple --batch-size=30

   # Day 2: Configurable products (slower)
   bin/magento byte8:plenty:item:export --type=configurable --batch-size=10

   # Day 3: Bundle products
   bin/magento byte8:plenty:item:export --type=bundle --batch-size=10
   ```

2. **Staged Export**
   - **Stage 1**: Core product data (no images/prices)
   - **Stage 2**: Enable prices, re-export
   - **Stage 3**: Enable images, re-export
   - **Stage 4**: Enable categories, properties

3. **Priority Export**
   - High-priority products first (best sellers)
   - New product launches immediately
   - Bulk catalog during off-hours

---

### Performance Optimization

1. **Batch Size Tuning**
   - Start conservative: 10 products
   - Monitor memory usage
   - Increase gradually: 15, 20, 30
   - Separate by product type

2. **Schedule Optimization**
   ```
   Simple Products:
   - Schedule: Every 30 min
   - Batch Size: 30
   - Duration: ~5-10 min

   Configurable Products:
   - Schedule: Every 1 hour
   - Batch Size: 10
   - Duration: ~10-15 min
   ```

3. **API Request Reduction**
   - Use PIM batch processor when possible
   - Group image uploads
   - Cache category/property mappings
   - Minimize redundant requests

4. **Memory Management**
   - PHP memory_limit: 2G minimum
   - Process batch size: 5-30 based on type
   - Monitor memory usage in logs
   - Clear messages between batches

---

### Data Quality

1. **Required Fields Validation**
   - **Always Required**: SKU, name, price
   - **Marketplace Required**: GTIN/EAN, manufacturer, brand
   - **Shipping Required**: Weight, dimensions
   - **Tax Required**: Tax class

2. **Attribute Completeness**
   - Review products before export
   - Check for missing attributes
   - Validate attribute values
   - Test with sample products

3. **Price Accuracy**
   - Verify prices are correct
   - Check special price dates
   - Validate tier prices
   - Test tax calculations

4. **Image Quality**
   - Optimize images before upload (recommended: less than 2MB)
   - Use consistent image sizes
   - Ensure images are publicly accessible
   - Test image URLs

5. **Category Structure**
   - Assign all products to categories
   - Maintain consistent structure
   - Map all categories before export
   - Verify category hierarchy

---

### Multi-Store Configuration

1. **Store Mapping Strategy**
   - Map each store view to client + locale
   - Document mapping for each store
   - Test content export per language
   - Verify translations complete

2. **Content Management**
   - Enter content per store view
   - Use store-specific descriptions
   - Translate all text fields
   - Verify language codes match

3. **Price per Store**
   - Configure store-specific pricing if needed
   - Map prices per currency
   - Test price export per store
   - Verify currency in PlentyONE

4. **Regional Considerations**
   - Country-specific attributes
   - Region-specific regulations
   - Localized measurements
   - Cultural preferences

---

### Monitoring & Maintenance

1. **Daily Monitoring**
   ```bash
   # Check queue status
   bin/magento byte8:plenty:item:queue:list --profile-id=6 --status=pending | wc -l

   # Check errors
   bin/magento byte8:plenty:item:queue:list --profile-id=6 --status=error

   # View recent history
   bin/magento byte8:profile:history:list --profile-id=6 --limit=5
   ```

2. **Weekly Tasks**
   - Review export success rate
   - Check error logs
   - Clear completed queue items
   - Update mappings if needed
   - Verify new products exported

3. **Monthly Tasks**
   - Audit product data completeness
   - Review and optimize batch sizes
   - Check memory usage trends
   - Update configuration data
   - Clean up old history records

4. **Alert Configuration**
   - Set up alerts for:
     - Export failures
     - Queue backlog (>1000 items)
     - Memory errors
     - API errors
   - Monitor via email/Slack

---

### Security & Compliance

1. **API Security**
   - Use secure API credentials
   - Rotate credentials regularly
   - Restrict API user permissions
   - Use HTTPS for all API calls

2. **Data Privacy**
   - Review exported data for PII
   - Comply with GDPR/privacy regulations
   - Secure log files
   - Control admin access to profile

3. **Backup Strategy**
   - Export profile configuration regularly
   - Backup mapping tables
   - Document custom configurations
   - Test restoration process

4. **Access Control**
   - Restrict profile configuration access
   - Log configuration changes
   - Separate test/production profiles
   - Review user permissions

---

## Related Documentation

- [Product Import Profile](/docs/profiles/product-import) - Import products from PlentyONE to Magento
- [Category Export Profile](/docs/profiles/category-export) - Export category structure
- [Stock Export Profile](/docs/profiles/stock-export) - Export inventory levels (MSI)
- [Product Attribute Mapping](/docs/mapping/product-attributes) - Attribute mapping guide
- [PlentyONE Items API](https://developers.plentymarkets.com/rest-doc#/Item) - API documentation
- [PlentyONE Variations API](https://developers.plentymarkets.com/rest-doc#/Variation) - Variations API
- [PlentyONE PIM API](https://developers.plentymarkets.com/rest-doc#/PIM) - PIM API documentation

---
sidebar_position: 9
title: Product Import Profile
description: Import products from PlentyONE to Magento using the Product Import Profile
---

# Product Import Profile

The **Product Import Profile** synchronizes product catalog data from PlentyONE to Magento, handling simple products, configurable products with variations, bundle products, attributes, prices, images, categories, and inventory.

## Overview

**Profile Type ID**: `plenty_item_import`
**Direction**: PlentyONE → Magento
**Purpose**: Import complete product catalog including variants, pricing, images, attributes, and relationships

### Architecture

The Product Import system uses a sophisticated multi-pass pipeline architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCT IMPORT PIPELINE                     │
└─────────────────────────────────────────────────────────────────┘

1. COLLECTION STAGE
   ├─ API Request: GET /rest/pim/variations
   ├─ Filters: Updated since, store mapping, status
   ├─ Pagination: Process in batches
   └─ Pre-loading: ProductDataRegistry (O(1) lookup)

2. GENERATION STAGE (19 Generators, sorted by priority)
   ├─ ProductEntity (10) → Core product data, SKU, type, attribute set
   ├─ Barcode (20) → EAN, UPC, ISBN
   ├─ Category (30) → Category assignments
   ├─ Content (40) → Name, description, short description
   ├─ MarketIdentNumber (50) → Market identifiers
   ├─ SalesPrice (60) → Base price, special price
   ├─ Tax (70) → Tax class
   ├─ TierPrice (80) → Customer group pricing
   ├─ Supplier (90) → Supplier/manufacturer
   ├─ Stock (100) → Inventory levels (basic MSI)
   ├─ Website (110) → Store assignments
   ├─ Attribute (120) → EAV attribute values
   ├─ Property (130) → PlentyONE property mappings
   ├─ MediaImage (140) → Product images
   ├─ MediaVideo (150) → Product videos
   ├─ RelationLink (160) → Cross-sell, up-sell, related
   ├─ ConfigAttribute (170) → Configurable attributes
   ├─ BundleOption (175) → Bundle product options
   └─ UrlRewrite (180) → SEO-friendly URLs

3. VALIDATION STAGE (3 Validators)
   ├─ ProductType → Validates product type consistency
   ├─ RequiredAttributes → Ensures required fields present
   └─ Sku → Validates SKU uniqueness

4. PROCESSING STAGE (11 Processors)
   ├─ ProductEntity → Create/update product
   ├─ AttributeSet → Assign attribute set
   ├─ Website → Assign to stores
   ├─ Category → Link to categories
   ├─ Stock → Update inventory
   ├─ TierPrice → Set quantity pricing
   ├─ MediaGallery → Import images/videos
   ├─ RelationLink → Create product relations
   ├─ ConfigurableProduct → Link parent-child
   ├─ BundleProduct → Create bundle selections
   └─ UrlRewrite → Generate SEO URLs

5. POST-PROCESSING STAGE (3 levels)
   ├─ Per-Item: Individual product finalization
   ├─ Per-Batch: Batch-level operations
   └─ Post-Execute: Final indexing and cleanup
       ├─ Flat Data Index
       ├─ Price Index
       ├─ Stock Index
       ├─ EAV Index
       ├─ Category Index
       ├─ Fulltext Search Index
       └─ Cache Invalidation
```

### Key Features

**Performance Optimization**:
- **ProductDataRegistry**: Pre-loads products in batches for O(1) lookups (100x faster)
- **Batch Processing**: Configurable batch sizes (default: 100 items)
- **Memory Management**: 3-6 MB per product, automatic cleanup
- **Item-Level Error Isolation**: One product failure doesn't stop batch

**Data Handling**:
- **Custom Attribute Mapping**: Use SKU or custom attribute for product identification
- **Attribute Restriction**: Import only selected attributes (73-75% faster)
- **Multi-Pass Architecture**: Generators → Validators → Processors → Post-Processors
- **Comprehensive Indexing**: 7 indexers triggered automatically

**Product Type Support**:
| PlentyONE Item | Magento Product | Notes |
|----------------|-----------------|-------|
| Item (no variations) | Simple Product | Single standalone product |
| Item + Variations | Configurable Product | Parent with child variations |
| Variation | Simple Product | Can be standalone or child |
| Bundle Item | Bundle Product | Component-based bundles |

---

## Configuration Sections

### 1. Client Configuration

**Fieldset**: `general`
**Purpose**: Configure PlentyONE client connection and data collection

#### Client Selection

**Field**: `client_id`
**Type**: Select
**Scope**: Global
**Required**: Yes

Select the PlentyONE client to import products from.

:::info Single Client System
The Mage2Plenty connector operates on a single-client architecture. This field displays the configured client. Client configuration is managed in **Stores → Configuration → PlentyMarkets → Client**.
:::

**Configuration**:
- Client ID, name, and URL displayed
- OAuth credentials managed separately
- User/Owner ID for API authentication

#### Collect Client Config Data

**Button**: `collect_config_data`
**Action**: Fetch metadata from PlentyONE API

Retrieves reference data required for product import:
- Attribute sets and attributes
- Sales prices and price types
- Warehouses and stock locations
- Categories and category trees
- Properties and property groups
- Payment methods and shipping profiles
- VAT rates and tax classes
- Units of measurement
- Manufacturers and suppliers

**Usage**:
1. Click "Collect Client Config Data" button
2. Wait for collection to complete (10-60 seconds)
3. Refresh page to see collected data in dropdown fields
4. Configuration dropdowns will now show PlentyONE options

**When to Use**:
- Initial profile setup
- After changes in PlentyONE configuration
- When dropdown fields are empty
- After adding new attributes/properties in PlentyONE

#### Delete Client Config Data

**Button**: `delete_config_data`
**Action**: Clear cached configuration data

Removes all collected metadata from Magento database.

**Use Cases**:
- Clean up before re-collecting fresh data
- Troubleshooting stale configuration issues
- Resetting after major PlentyONE changes

---

### 2. Schedule Configuration

**Fieldset**: `schedule_config`
**Purpose**: Configure automated import scheduling

#### Profile Status

**Field**: `is_active`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Enable or disable the profile.

**Behavior**:
- **Enabled**: Profile runs on schedule, can be executed manually
- **Disabled**: Profile skipped by cron, manual execution still allowed

#### Scheduled Import

**Field**: `is_active_schedule`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Enable scheduled automatic imports.

**How It Works**:
- Runs via Magento cron
- Cron expression: `*/15 * * * *` (every 15 minutes)
- Processes products updated since last run
- Incremental sync for efficiency

**Configuration Path**: `plenty/plenty_item_import/is_active_schedule`

#### Batch Size

**Field**: `batch_size`
**Type**: Text (Integer)
**Default**: 100
**Scope**: Global

Number of products to process per batch.

**Recommendations**:
| Catalog Size | Server | Batch Size | Notes |
|--------------|--------|------------|-------|
| < 1,000 | Small | 50 | Conservative, minimal memory |
| 1,000 - 10,000 | Medium | 100 | Default, balanced |
| 10,000 - 100,000 | Large | 200 | More memory, faster |
| > 100,000 | Enterprise | 500 | High memory, optimize indexing |

**Memory Calculation**:
```
Memory Usage ≈ Batch Size × Per-Product Memory
Per-Product Memory: 3-6 MB (simple), 5-10 MB (configurable), 8-15 MB (bundle)

Example:
Batch Size: 100
Configurable Products: ~800 MB peak memory
```

**Tuning Tips**:
- Start with default (100)
- Monitor memory usage: `watch -n 1 free -h`
- Increase batch size if memory allows
- Decrease if timeouts or memory errors occur

#### One-Time Full Process

**Field**: `enable_onetime_full_process`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Enable periodic full catalog synchronization.

**Purpose**: Complete product catalog sync on scheduled basis (separate from incremental sync)

**How It Works**:
- Processes entire catalog regardless of update timestamps
- Runs at specified frequency and time
- Separate from regular scheduled sync
- Useful for data integrity verification

**Use Cases**:
- Weekly/monthly full catalog refresh
- Verify data consistency
- Re-sync after bulk PlentyONE changes
- Recover from sync issues

#### One-Time Full Process Frequency

**Field**: `onetime_full_process_frequency`
**Type**: Select
**Scope**: Global
**Depends**: `enable_onetime_full_process = Yes`

**Options**:
- **Daily**: Every day at specified time
- **Weekly**: Every Sunday at specified time
- **Monthly**: First day of month at specified time

**Recommendations**:
| Catalog Size | Frequency | Rationale |
|--------------|-----------|-----------|
| < 1,000 | Daily | Fast, ensure freshness |
| 1,000 - 10,000 | Weekly | Balance integrity vs load |
| > 10,000 | Monthly | Minimize resource usage |

#### One-Time Full Process Time

**Field**: `onetime_full_process_time`
**Type**: Time Picker (3 fields: hour, minute, second)
**Scope**: Global
**Depends**: `enable_onetime_full_process = Yes`

Specific time when full process executes.

**Format**: HH:MM:SS (24-hour format)

**Best Practices**:
- Choose off-peak hours (1:00 AM - 5:00 AM)
- Avoid overlap with other profiles
- Consider timezone settings
- Allow sufficient time before business hours

**Example Configuration**:
```
Enable One-Time Full Process: Yes
Frequency: Weekly
Time: 02:00:00

Result: Full catalog sync every Sunday at 2:00 AM
```

---

### 3. HTTP API Configuration

**Fieldset**: `http_config`
**Purpose**: Configure PlentyONE API request parameters

#### API Collection Size

**Field**: `collection_size`
**Type**: Text (Integer)
**Default**: 100
**Scope**: Global

Number of items to retrieve per API request.

**How It Works**:
```
Total Products: 5,000
Collection Size: 100
API Requests: 50 (5,000 ÷ 100)

Each request: GET /rest/pim/variations?itemsPerPage=100&page=N
```

**Tuning Recommendations**:
| Network | API Response Time | Collection Size |
|---------|-------------------|-----------------|
| Slow | > 5 seconds | 50 |
| Average | 2-5 seconds | 100 (default) |
| Fast | < 2 seconds | 250 |

**Trade-offs**:
- **Larger Size**: Fewer requests, faster total sync, more memory per request
- **Smaller Size**: More requests, slower total sync, less memory per request

**Configuration Path**: `plenty/plenty_item_import/http_config/collection_size`

#### PIM Search Criteria

**Field**: `pim_search_criteria`
**Type**: Dynamic Rows
**Scope**: Global

Add custom search filters for PlentyONE PIM API requests.

**Structure per Row**:
- **Field**: PIM API field name
- **Condition**: Comparison operator
- **Value**: Filter value

**Common Search Criteria**:

| Field | Condition | Value | Purpose |
|-------|-----------|-------|---------|
| `isActive` | `=` | `true` | Only active variations |
| `isMain` | `=` | `true` | Only main variations |
| `flagOne` | `=` | `1` | Custom flag filter |
| `supplierId` | `in` | `10,20,30` | Specific suppliers |
| `manufacturerId` | `=` | `5` | Specific manufacturer |
| `updatedAt` | `>` | `2024-01-01` | Modified after date |
| `categoryId` | `in` | `100,101` | Specific categories |

**Available Conditions**:
- `=` (equals)
- `!=` (not equals)
- `>` (greater than)
- `<` (less than)
- `>=` (greater than or equal)
- `<=` (less than or equal)
- `in` (in list)
- `like` (contains)

**Example Configuration**:
```
Row 1: isActive = true
Row 2: flagOne = 1
Row 3: supplierId in 10,20,30

API Request: /rest/pim/variations?isActive=true&flagOne=1&supplierId[]=10&supplierId[]=20&supplierId[]=30
```

**Use Cases**:
- Filter by custom flags (marketing channels)
- Limit to specific suppliers/manufacturers
- Import only active products
- Selective import for testing

---

### 4. Store Mapping Configuration

**Fieldset**: `store_config`
**Purpose**: Map PlentyONE stores to Magento store views

#### Store Mapping

**Field**: `store_mapping`
**Type**: Dynamic Rows
**Scope**: Global
**Required**: Yes

Define relationships between PlentyONE stores and Magento stores.

**Structure per Row**:
- **PlentyONE Store (Plenty ID)**: PlentyONE store ID (dropdown)
- **Magento Store (Store)**: Magento store view (dropdown)
- **Referrer ID**: PlentyONE referrer/channel ID (dropdown)
- **Locale**: Language code for content (text)

**Field Details**:

**PlentyONE Store (Plenty ID)**:
- Source: Collected via "Collect Client Config Data"
- Lists all stores configured in PlentyONE
- Example: "Default Store (ID: 0)", "Amazon DE (ID: 1)"

**Magento Store (Store)**:
- Lists all Magento store views
- Example: "Default Store View", "German Store", "UK Store"

**Referrer ID**:
- PlentyONE sales channel/marketplace identifier
- Source: Collected via "Collect Client Config Data"
- Examples: Magento Shop (0), Amazon (2), eBay (4)

**Locale**:
- Language code for content (name, description)
- Format: ISO 639-1 language code (lowercase)
- Examples: `en`, `de`, `fr`, `es`, `it`

**Example Configurations**:

**Single Store (Default)**:
| Plenty ID | Store | Referrer | Locale |
|-----------|-------|----------|--------|
| 0 (Default Store) | Default Store View | 0 | en |

**Multi-Language Setup**:
| Plenty ID | Store | Referrer | Locale |
|-----------|-------|----------|--------|
| 0 | English Store | 0 | en |
| 1 | German Store | 0 | de |
| 2 | French Store | 0 | fr |

**Multi-Marketplace Setup**:
| Plenty ID | Store | Referrer | Locale |
|-----------|-------|----------|--------|
| 0 | Main Website | 0 (Magento) | en |
| 1 | Amazon Store | 2 (Amazon) | en |
| 2 | eBay Store | 4 (eBay) | en |

**How It Works**:
```
1. Import runs for each store mapping row
2. Fetches products linked to PlentyONE store ID
3. Imports content in specified locale
4. Assigns products to Magento store view
5. Filters by referrer ID (channel)
```

**Best Practices**:
- Always map at least one store (required)
- Use correct locale codes for multi-language
- Test with one store first
- Map referrers accurately for marketplace orders

---

### 5. Tax & Price Configuration

**Fieldset**: `tax_config`
**Purpose**: Configure tax and pricing import

#### Import Tax Data

**Field**: `is_active_tax`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global

Enable tax data import from PlentyONE.

**What Gets Imported**:
- VAT rates from PlentyONE
- Tax class assignments
- Tax rates by country/region

#### Tax Rate Location

**Field**: `tax_rate_location`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_tax = Yes`

Specify VAT rate location configuration.

**Options**:
- **Based on Delivery Address**: Use destination country VAT
- **Based on Billing Address**: Use billing country VAT
- **Based on Store Location**: Use store's default VAT

**Configuration Path**: `plenty/plenty_item_import/tax_config/tax_rate_location`

#### VAT Configuration

**Field**: `vat_config`
**Type**: Dynamic Rows
**Scope**: Global
**Depends**: `is_active_tax = Yes`

Map PlentyONE VAT rates to Magento tax classes.

**Structure per Row**:
- **PlentyONE VAT ID**: VAT rate from PlentyONE (dropdown)
- **Magento Tax Class**: Magento product tax class (dropdown)

**Example Configuration**:
| PlentyONE VAT | Magento Tax Class |
|---------------|-------------------|
| Standard (19%) | Taxable Goods |
| Reduced (7%) | Reduced Rate |
| Zero (0%) | None |

#### Import Price Data

**Field**: `is_active_price`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global

Enable price data import from PlentyONE.

#### Sales Price Configuration

**Field**: `sales_price_config`
**Type**: Dynamic Rows
**Scope**: Global
**Depends**: `is_active_price = Yes`

Map PlentyONE sales prices to Magento price types.

**Structure per Row**:
- **PlentyONE Sales Price ID**: Sales price from PlentyONE (dropdown)
- **Magento Price Type**: Target price field (select)
- **Customer Group**: Magento customer group (dropdown, optional)
- **Website**: Magento website (dropdown, optional)

**Magento Price Types**:
- **price**: Base price (regular price)
- **special_price**: Special/sale price
- **tier_price**: Quantity-based pricing
- **group_price**: Customer group pricing
- **cost**: Product cost

**Example Configurations**:

**Basic Price Mapping**:
| Sales Price ID | Price Type | Customer Group | Website |
|----------------|------------|----------------|---------|
| 1 (RRP) | price | All Groups | All Websites |
| 2 (Sale) | special_price | All Groups | All Websites |

**Customer Group Pricing**:
| Sales Price ID | Price Type | Customer Group | Website |
|----------------|------------|----------------|---------|
| 1 (Default) | price | General | Main Website |
| 3 (Wholesale) | group_price | Wholesale | Main Website |
| 4 (VIP) | group_price | VIP | Main Website |

**Tier Price Example**:
| Sales Price ID | Price Type | Customer Group | Website |
|----------------|------------|----------------|---------|
| 5 (Qty 10+) | tier_price | All Groups | Main Website |
| 6 (Qty 50+) | tier_price | All Groups | Main Website |

**How It Works**:
```
1. Retrieve product prices from PlentyONE
2. Match sales price ID to configuration
3. Apply to corresponding Magento price type
4. Set customer group/website scope if specified
5. Calculate with/without tax based on configuration
```

#### Price Calculation Mode

**Field**: `price_calculation_mode`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_price = Yes`

Define how prices are calculated on import.

**Options**:
- **Import Net Price**: Use net prices from PlentyONE, Magento calculates tax
- **Import Gross Price**: Use gross prices from PlentyONE (tax included)
- **Calculate from Net**: Import net, convert to gross for display
- **Calculate from Gross**: Import gross, extract net for calculations

**Configuration Path**: `plenty/plenty_item_import/price_config/calculation_mode`

---

### 6. Attribute Configuration

**Fieldset**: `attribute_config`
**Purpose**: Configure product attribute mapping and handling

#### Attribute Set Mapping

**Field**: `attribute_set_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map PlentyONE item types to Magento attribute sets.

**Structure per Row**:
- **PlentyONE Type ID**: Item type from PlentyONE (dropdown)
- **Magento Attribute Set**: Target attribute set (dropdown)
- **Is Default**: Use as fallback for unmapped types (checkbox)

**Example Configuration**:
| PlentyONE Type | Magento Attribute Set | Is Default |
|----------------|----------------------|------------|
| Standard (0) | Default | Yes |
| Electronics (1) | Electronics | No |
| Clothing (2) | Apparel | No |
| Books (3) | Books & Media | No |

**Fallback Attribute Set**:

**Field**: `fallback_attribute_set`
**Type**: Select
**Scope**: Global

Attribute set used when no mapping matches.

**Default**: "Default" attribute set

#### Product Mapping Identifier

**Field**: `product_mapping_identifier`
**Type**: Select
**Scope**: Global
**Required**: Yes

Choose which field identifies products during import.

**Options**:
- **SKU** (default): Use PlentyONE variation number as Magento SKU
- **Custom Attribute**: Use custom attribute to match products

**How It Works**:

**Using SKU (Default)**:
```
PlentyONE Variation Number → Magento SKU
Variation 12345 → Product SKU: 12345
```

**Using Custom Attribute**:
```
PlentyONE Variation Number → Custom Attribute Value
Variation 12345 → plenty_variation_id: 12345
Magento SKU: Retrieved from PlentyONE property
```

**Use Cases**:
- **SKU**: Standard setup, variation number = product SKU
- **Custom Attribute**: Complex SKU schemes, custom identifiers, legacy systems

**Performance Impact**:
- **SKU**: Direct product lookups, fastest (O(1))
- **Custom Attribute**: Requires EAV queries, slightly slower

#### Custom Mapping Attribute

**Field**: `custom_mapping_attribute`
**Type**: Select
**Scope**: Global
**Depends**: `product_mapping_identifier = Custom Attribute`

Select custom attribute to use for product identification.

**Requirements**:
- Attribute must exist in Magento
- Should be unique per product
- Typically: `plenty_variation_id`, `external_id`, `legacy_sku`

**Example**:
```
Custom Mapping Attribute: plenty_variation_id

Import Process:
1. PlentyONE Variation 12345
2. Search Magento: plenty_variation_id = 12345
3. If found: Update product
4. If not found: Create new product
5. Set SKU from PlentyONE property or generate
```

#### Item Text Mapping

**Field**: `item_text_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map PlentyONE text fields to Magento attributes.

**Structure per Row**:
- **PlentyONE Text Type**: Text type from PlentyONE (dropdown)
- **Magento Attribute**: Target attribute (dropdown)
- **Language**: ISO language code (text)

**PlentyONE Text Types**:
- Name 1, Name 2, Name 3 (short names)
- Preview Text (short description)
- Description (long description)
- Technical Data
- URL Path
- Meta Description
- Meta Keywords

**Common Mappings**:
| PlentyONE Text | Magento Attribute | Language |
|----------------|------------------|----------|
| Name 1 | name | en |
| Preview Text | short_description | en |
| Description | description | en |
| Meta Description | meta_description | en |
| Technical Data | tech_specs | en |

**Multi-Language Example**:
| PlentyONE Text | Magento Attribute | Language |
|----------------|------------------|----------|
| Name 1 | name | en |
| Name 1 | name | de |
| Description | description | en |
| Description | description | de |

#### Barcode Mapping

**Field**: `barcode_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map PlentyONE barcode types to Magento attributes.

**Structure per Row**:
- **PlentyONE Barcode Type**: Barcode type from PlentyONE (dropdown)
- **Magento Attribute**: Target attribute (dropdown)

**PlentyONE Barcode Types**:
- GTIN (EAN-13, UPC)
- ISBN (books)
- UPC (Universal Product Code)
- Custom barcodes

**Example Configuration**:
| Barcode Type | Magento Attribute |
|--------------|-------------------|
| GTIN | ean |
| ISBN | isbn |
| UPC | upc |

#### Market Number Mapping

**Field**: `market_number_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map PlentyONE market numbers to Magento attributes.

**Structure per Row**:
- **Market Number Type**: Type from PlentyONE (dropdown)
- **Magento Attribute**: Target attribute (dropdown)

**Market Number Types**:
- ASIN (Amazon)
- ePID (eBay)
- FNSKU (Amazon Fulfillment)
- Custom market identifiers

**Example**:
| Market Number | Magento Attribute |
|---------------|-------------------|
| ASIN | amazon_asin |
| ePID | ebay_epid |

#### Supplier Configuration

**Field**: `supplier_id`
**Type**: Select
**Scope**: Global

Default supplier for imported products.

**Source**: Collected via "Collect Client Config Data"

#### Manufacturer Mapping

**Field**: `manufacturer_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map PlentyONE manufacturers to Magento manufacturer attribute values.

**Structure per Row**:
- **PlentyONE Manufacturer**: Manufacturer from PlentyONE (dropdown)
- **Magento Option**: Manufacturer attribute option (text/dropdown)
- **Auto-Create**: Create option if not exists (checkbox)

**Example**:
| PlentyONE Manufacturer | Magento Option | Auto-Create |
|------------------------|----------------|-------------|
| Apple Inc. | Apple | Yes |
| Samsung Electronics | Samsung | Yes |
| Sony Corporation | Sony | Yes |

#### Customs Configuration

**Field**: `customs_tariff_number_attribute`
**Type**: Select
**Scope**: Global

Magento attribute for customs tariff numbers.

**Example**: `customs_tariff_number`, `hs_code`, `commodity_code`

#### Product Dimensions

**Field**: `dimension_config`
**Type**: Container

Configure dimension unit mappings.

**Fields**:
- **Length Attribute**: Magento attribute for length
- **Width Attribute**: Magento attribute for width
- **Height Attribute**: Magento attribute for height
- **Length Unit**: Unit of measurement (cm, mm, in, ft)
- **Weight Unit**: Unit of measurement (kg, g, lb, oz)

**Example**:
```
Length Attribute: length
Width Attribute: width
Height Attribute: height
Length Unit: cm
Weight Unit: kg
```

#### Create Attribute Options

**Field**: `auto_create_attribute_options`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global

Automatically create attribute options during import.

**How It Works**:
- For select/multiselect attributes
- Creates missing option values
- Assigns to appropriate attribute
- Prevents import failures from missing options

**Example**:
```
PlentyONE Color: "Navy Blue"
Magento Attribute: color
Existing Options: Black, White, Red

With Auto-Create ON:
→ Creates "Navy Blue" option
→ Assigns to product
→ Import succeeds

With Auto-Create OFF:
→ Option not found
→ Warning logged
→ Attribute skipped
```

#### Attribute Set Group Assignment

**Field**: `attribute_group_assignment`
**Type**: Dynamic Rows
**Scope**: Global

Assign imported attributes to specific attribute groups.

**Structure per Row**:
- **Attribute Code**: Magento attribute (dropdown)
- **Attribute Group**: Target group in attribute set (dropdown)

**Common Groups**:
- Product Details
- Content
- Images
- Prices
- Meta Information
- Design
- Schedule Design Update
- Gift Options

**Example**:
| Attribute | Group |
|-----------|-------|
| manufacturer | Product Details |
| ean | Product Details |
| customs_tariff | Product Details |
| tech_specs | Content |

#### Attribute Restriction

**Field**: `is_active_attribute_restriction`
**Type**: Checkbox (Toggle)
**Default**: No
**Scope**: Global

Enable selective attribute import for performance optimization.

**Purpose**: Import only pre-selected attributes, skip all others

**Use Cases**:
- Update only prices and inventory (not descriptions)
- Prevent overwrite of manually managed attributes
- Improve import performance (73-75% faster)
- Maintain manual customizations while syncing core data

#### Allowed Attributes

**Field**: `allowed_attributes`
**Type**: Multi-Select (filterable)
**Required**: Yes (when restriction enabled)
**Scope**: Global
**Depends**: `is_active_attribute_restriction = Yes`

Select which attributes are allowed to be imported.

**Attribute Selection**:
- Source: All product attributes from Magento
- Searchable: Filter by typing
- Multiple selection supported
- Stored as JSON array

**Example Selection**:
```json
Allowed Attributes:
- name
- description
- short_description
- price
- special_price
- sku
- status
- visibility
- weight
- manufacturer
- ean
```

**How Attribute Restriction Works**:

**Import Decision Flow**:
```
For each attribute:
├─ Is restriction enabled?
│  ├─ NO → Import attribute
│  └─ YES → Is attribute in allowed list?
│     ├─ YES → Import attribute
│     └─ NO → Is this a new product?
│        ├─ NO → Skip attribute (existing product)
│        └─ YES → Is attribute required?
│           ├─ YES → Import anyway (bypass restriction)
│           └─ NO → Skip attribute

Special Cases (ALWAYS imported):
├─ Super attributes for configurable products (structural)
└─ Required attributes for new products (validation)
```

**Required Attributes Bypass**:

When creating **new products**, required attributes are **always imported** regardless of restriction:
- SKU (always required)
- Name
- Price
- Status
- Visibility
- Tax Class
- Weight (if required by attribute set)
- Custom required attributes

**This bypass applies ONLY to new products.** Existing products respect restriction completely.

**Configurable Product Attributes**:

Super attributes (color, size, etc.) that define configurable relationships are **always imported**:
- They are structural, not content attributes
- Required for parent-child product relationships
- Cannot create/update configurables without them
- `ConfigAttribute` generator bypasses restriction

**Performance Impact**:

| Catalog Size | All Attributes | Price + Stock Only | Improvement |
|--------------|---------------|-------------------|-------------|
| 1,000 products | 45 seconds | 12 seconds | 73% faster |
| 10,000 products | 8 minutes | 2 minutes | 75% faster |
| 100,000 products | 85 minutes | 22 minutes | 74% faster |

**Example Scenarios**:

**Scenario 1: Price and Stock Only**
```
Configuration:
- Enable Restriction: Yes
- Allowed: price, special_price, quantity, stock_status

Result:
- Existing products: Only price/stock updated
- New products: Price/stock + required attributes
- Descriptions/images remain unchanged
```

**Scenario 2: Selective Update with Manual Content**
```
Configuration:
- Enable Restriction: Yes
- Allowed: sku, price, weight, manufacturer, status

Result:
- Core product data synced from PlentyONE
- Manual descriptions in Magento preserved
- Marketing content not overwritten
```

**Scenario 3: Configurable Products**
```
Configuration:
- Enable Restriction: Yes
- Allowed: price, special_price

Result:
- Prices updated
- Super attributes imported (color, size) ← Always
- Required attributes imported for new products
- Optional attributes skipped
```

**Best Practices**:
- ✅ Use for frequent price/stock updates
- ✅ Prevent overwrite of manual customizations
- ✅ Optimize performance for large catalogs
- ✅ Partial sync with manual content management
- ❌ Don't use for initial full catalog import
- ❌ Don't use for complete data synchronization

**Troubleshooting**:

**New Products Not Creating**:
- Required attributes bypass restriction automatically
- Check error logs for specific validation failures

**Configurable Products Not Linking**:
- Super attributes always import (bypass restriction)
- Verify `ConfigAttribute` generator is enabled

**Performance Not Improving**:
- Verify restriction is enabled
- Ensure allowed list is small (5-10 attributes)
- Monitor logs to confirm attributes being skipped

#### Delete Attribute Value Differences

**Field**: `delete_attribute_value_differences`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Delete attribute values in Magento that don't exist in PlentyONE.

**How It Works**:
```
Magento Product Attributes: color, size, material, style
PlentyONE Product Attributes: color, size, material

With Delete Differences ON:
→ "style" attribute value is deleted from Magento

With Delete Differences OFF:
→ "style" attribute value preserved in Magento
```

**Use Cases**:
- **Enable**: Strict sync, PlentyONE is single source of truth
- **Disable**: Allow manual Magento customizations, partial sync

---

### 7. Category Configuration

**Fieldset**: `category_config`
**Purpose**: Configure product category assignments

#### Import Category Data

**Field**: `is_active_category`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global

Enable category assignment import from PlentyONE.

#### Category Assignment Mode

**Field**: `category_assignment_mode`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_category = Yes`

Define how products are assigned to categories.

**Options**:
- **From PlentyONE Categories**: Use PlentyONE category assignments (default)
- **From Item Properties**: Use specific item properties
- **Manual Mapping**: Custom category mappings
- **Skip Category Assignment**: Don't assign categories

#### Root Category Mapping

**Field**: `root_category_mapping`
**Type**: Dynamic Rows
**Scope**: Global
**Depends**: `is_active_category = Yes`

Map PlentyONE category trees to Magento root categories.

**Structure per Row**:
- **PlentyONE Category Tree**: Category tree from PlentyONE (dropdown)
- **Magento Root Category**: Root category in Magento (dropdown)
- **Store**: Associated store view (dropdown)

**Example**:
| PlentyONE Tree | Magento Root | Store |
|----------------|--------------|-------|
| Standard (1) | Default Category | Main Store |
| Amazon (2) | Amazon Categories | Amazon Store |
| eBay (3) | eBay Categories | eBay Store |

#### Default Category

**Field**: `default_category_id`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_category = Yes`

Assign uncategorized products to default category.

**Best Practice**: Create "Uncategorized" or "Imported Products" category for products without PlentyONE category assignments.

#### Delete Category Differences

**Field**: `delete_category_differences`
**Type**: Checkbox
**Default**: No
**Scope**: Global
**Depends**: `is_active_category = Yes`

Remove category assignments in Magento that don't exist in PlentyONE.

**How It Works**:
```
Magento Categories: Electronics, Accessories, Clearance
PlentyONE Categories: Electronics, Accessories

With Delete Differences ON:
→ "Clearance" category assignment removed

With Delete Differences OFF:
→ "Clearance" category assignment preserved
```

---

### 8. URL Configuration

**Fieldset**: `url_config`
**Purpose**: Configure SEO-friendly URL generation

#### Generate URL Rewrites

**Field**: `generate_url_rewrites`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global

Automatically generate SEO-friendly URLs for imported products.

**Generated URLs**:
- Product URLs: `/product-name.html`
- Category URLs: `/category/product-name.html`
- Store-specific URLs

#### URL Key Generation

**Field**: `url_key_generation`
**Type**: Select
**Scope**: Global
**Depends**: `generate_url_rewrites = Yes`

Define URL key generation strategy.

**Options**:
- **From Product Name**: Use product name (default)
- **From SKU**: Use product SKU
- **From PlentyONE URL Path**: Use URL path from PlentyONE
- **Custom Pattern**: Define custom pattern

**Examples**:
```
Product Name: "Red Cotton T-Shirt Size M"

From Product Name:
→ red-cotton-t-shirt-size-m

From SKU (SKU: TS-RED-M):
→ ts-red-m

Custom Pattern ({sku}-{name}):
→ ts-red-m-red-cotton-t-shirt-size-m
```

#### Append SKU on Duplicate

**Field**: `append_sku_on_duplicate_url`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global
**Depends**: `generate_url_rewrites = Yes`

Append SKU to URL key when duplicate URLs detected.

**How It Works**:
```
Product 1 Name: "Blue Shirt"
Product 2 Name: "Blue Shirt" (different SKU)

Without Append SKU:
→ Product 1: blue-shirt
→ Product 2: blue-shirt (ERROR: Duplicate URL)

With Append SKU:
→ Product 1: blue-shirt
→ Product 2: blue-shirt-sku123 (No conflict)
```

#### URL Suffix

**Field**: `url_suffix`
**Type**: Text
**Scope**: Store View
**Depends**: `generate_url_rewrites = Yes`

Add suffix to product URLs.

**Common Suffixes**:
- `.html` (default, SEO-friendly)
- `.htm`
- No suffix (blank)

**Example**:
```
URL Suffix: .html
Product: Blue Shirt
URL: /blue-shirt.html
```

---

### 9. Media Configuration

**Fieldset**: `media_config`
**Purpose**: Configure product image and media import

#### Import Media Data

**Field**: `is_active_media`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global

Enable image and media import from PlentyONE.

#### Image Import Mode

**Field**: `image_import_mode`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_media = Yes`

Define how images are handled.

**Options**:
- **Use CDN URL**: Reference PlentyONE CDN URLs (fast, no download)
- **Download Files**: Download and host locally (full control)
- **Both**: Download primary, use CDN for gallery (balanced)

**Comparison**:
| Mode | Pros | Cons | Use Case |
|------|------|------|----------|
| CDN URL | Fast import, no storage | Dependent on PlentyONE CDN | Large catalogs |
| Download | Full control, faster page loads | Slower import, storage usage | Full ownership |
| Both | Balanced approach | More complex | Hybrid strategy |

#### File Download Configuration

**Field**: `enable_file_download`
**Type**: Checkbox
**Default**: No
**Scope**: Global
**Depends**: `image_import_mode = Download Files or Both`

Enable downloading images to Magento server.

#### File URL Path

**Field**: `file_url_path`
**Type**: Text
**Scope**: Global
**Depends**: `enable_file_download = Yes`

Base URL for PlentyONE image files.

**Default**: `https://cdn02.plentymarkets.com/`

**Example**:
```
File URL Path: https://cdn02.plentymarkets.com/
Image Path: images/item/123/456/image.jpg
Full URL: https://cdn02.plentymarkets.com/images/item/123/456/image.jpg
```

#### File Cleanup

**Field**: `enable_file_cleanup`
**Type**: Checkbox
**Default**: No
**Scope**: Global
**Depends**: `enable_file_download = Yes`

Delete orphaned image files when products are removed or images updated.

**Behavior**:
- Removes image files not associated with any product
- Runs during import post-processing
- Frees up storage space

#### Image Role Mapping

**Field**: `image_role_mapping`
**Type**: Dynamic Rows
**Scope**: Global
**Depends**: `is_active_media = Yes`

Map PlentyONE image types to Magento image roles.

**Structure per Row**:
- **PlentyONE Image Type**: Image type from PlentyONE (dropdown)
- **Magento Role**: Magento image role (select)
- **Availability**: Filter by availability ID (multiselect)

**Magento Image Roles**:
- **image**: Base image (main product image)
- **small_image**: Thumbnail (used in grids/lists)
- **swatch_image**: Configurable swatch image
- **thumbnail**: Legacy thumbnail
- **gallery**: Additional images (not role, just gallery)

**Example Configuration**:
| PlentyONE Type | Magento Role | Availability |
|----------------|--------------|--------------|
| Standard | image | 1 (Webshop) |
| Preview | small_image | 1 (Webshop) |
| Gallery | gallery | 1 (Webshop) |
| Amazon | image | 2 (Amazon) |

#### Image Position

**Field**: `image_position_sorting`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_media = Yes`

Define image order in gallery.

**Options**:
- **By Position (Ascending)**: PlentyONE position 0, 1, 2...
- **By Position (Descending)**: PlentyONE position 10, 9, 8...
- **By Name**: Alphabetical by filename
- **By Upload Date**: Newest or oldest first

#### Image Channel Filter

**Field**: `image_channel_filter`
**Type**: Multiselect
**Scope**: Global
**Depends**: `is_active_media = Yes`

Filter images by PlentyONE availability/channel.

**Common Channels**:
- 1: Webshop
- 2: Amazon
- 3: eBay
- 4: Google Shopping
- ... (custom channels)

**Use Case**: Import only webshop images, exclude marketplace-specific images

#### Import Video Data

**Field**: `is_active_video`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Enable product video import from PlentyONE.

#### Video Source Configuration

**Field**: `video_source_config`
**Type**: Dynamic Rows
**Scope**: Global
**Depends**: `is_active_video = Yes`

Map PlentyONE video types to Magento video attributes.

**Structure per Row**:
- **Video Type**: PlentyONE video type (dropdown)
- **Video Provider**: YouTube, Vimeo, or File (select)
- **Magento Attribute**: Target attribute (dropdown)

**Example**:
| Video Type | Provider | Attribute |
|------------|----------|-----------|
| Product Video | YouTube | product_video |
| Installation Guide | Vimeo | installation_video |

---

### 10. Cross-sells Configuration

**Fieldset**: `relation_config`
**Purpose**: Configure product relationship import

#### Import Cross-sells

**Field**: `is_active_cross_sell`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Enable cross-sell product import from PlentyONE.

#### Import Up-sells

**Field**: `is_active_up_sell`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Enable up-sell product import from PlentyONE.

#### Import Related Products

**Field**: `is_active_related`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Enable related product import from PlentyONE.

#### Relation Type Mapping

**Field**: `relation_type_mapping`
**Type**: Dynamic Rows
**Scope**: Global
**Depends**: Any relation import enabled

Map PlentyONE item relations to Magento relation types.

**Structure per Row**:
- **PlentyONE Relation ID**: Relation type from PlentyONE (dropdown)
- **Magento Relation Type**: Target relation type (select)

**Magento Relation Types**:
- **cross_sell**: Products shown in cart
- **up_sell**: Higher-value alternatives
- **related**: Complementary products

**PlentyONE Relation Types**:
- Accessory
- Similar
- Replacement part
- Bundle component
- Variation
- Custom relations

**Example Configuration**:
| PlentyONE Relation | Magento Type |
|-------------------|--------------|
| Accessory (1) | cross_sell |
| Similar (2) | related |
| Bundle (3) | related |
| Replacement (4) | up_sell |

#### Delete Relation Differences

**Field**: `delete_relation_differences`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Remove product relations in Magento that don't exist in PlentyONE.

---

### 11. Property Configuration

**Fieldset**: `property_config`
**Purpose**: Configure PlentyONE property mapping

#### Import Property Data

**Field**: `is_active_property`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Enable PlentyONE property import.

**What are Properties?**
PlentyONE properties are custom fields/characteristics not part of standard item data.

**Examples**:
- Brand
- Model number
- Technical specifications
- Custom attributes
- Certifications

#### Property Mapping

**Field**: `property_mapping`
**Type**: Dynamic Rows
**Scope**: Global
**Depends**: `is_active_property = Yes`

Map PlentyONE properties to Magento attributes.

**Structure per Row**:
- **PlentyONE Property**: Property from PlentyONE (dropdown)
- **Magento Attribute**: Target attribute (dropdown)
- **Attribute Scope**: Global, Website, or Store View (select)

**Example Configuration**:
| PlentyONE Property | Magento Attribute | Scope |
|-------------------|------------------|-------|
| Brand | brand | Global |
| Model Number | model | Global |
| Warranty Period | warranty | Website |
| Energy Rating | energy_class | Global |

#### Property Scope

**Field**: `property_scope`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_property = Yes`

Default scope for properties.

**Options**:
- **Global**: All stores
- **Website**: Website-specific
- **Store View**: Store-specific

---

### 12. Configurable Product Configuration

**Fieldset**: `configurable_config`
**Purpose**: Configure configurable product import with variations

#### Import Configurable Products

**Field**: `is_active_configurable`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global

Enable configurable product import (products with variations).

#### Configurable Attribute Mapping

**Field**: `configurable_attribute_mapping`
**Type**: Dynamic Rows
**Scope**: Global
**Depends**: `is_active_configurable = Yes`

Map PlentyONE variation properties to Magento super attributes.

**Structure per Row**:
- **PlentyONE Property**: Variation property from PlentyONE (dropdown)
- **Magento Attribute**: Configurable attribute in Magento (dropdown)
- **Sort Order**: Display order (integer)

**Common Mappings**:
| PlentyONE Property | Magento Attribute | Sort Order |
|-------------------|------------------|------------|
| Color | color | 10 |
| Size | size | 20 |
| Style | style | 30 |
| Material | material | 40 |

**Requirements**:
- Magento attribute must be configurable (global scope, used in variants)
- Attribute must exist before import
- Values will be auto-created if "Create Attribute Options" enabled

#### Child Product Name Pattern

**Field**: `child_product_name_pattern`
**Type**: Text
**Scope**: Global
**Depends**: `is_active_configurable = Yes`

Template for generating child product names.

**Variables**:
- `{parent_name}`: Parent product name
- `{variation_name}`: Variation name
- `{attribute_name}`: Attribute label (Color, Size, etc.)
- `{attribute_value}`: Attribute value (Red, Large, etc.)

**Examples**:
```
Pattern: {parent_name} - {attribute_value}
Parent: "Cotton T-Shirt"
Variation: Size M, Color Red
Child Name: "Cotton T-Shirt - M - Red"

Pattern: {parent_name} ({attribute_value})
Child Name: "Cotton T-Shirt (M/Red)"

Pattern: {variation_name}
Child Name: "Cotton T-Shirt M Red"
```

**Default**: `{parent_name} - {attribute_value}`

#### Auto-generate Child Names

**Field**: `auto_generate_child_names`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global
**Depends**: `is_active_configurable = Yes`

Automatically generate child product names using pattern.

**Behavior**:
- **Enabled**: Use name pattern to generate names
- **Disabled**: Use names from PlentyONE

#### Child Product Visibility

**Field**: `child_product_visibility`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_configurable = Yes`

Set visibility for configurable child products.

**Options**:
- **Not Visible Individually** (recommended): Only parent visible
- **Catalog**: Visible in catalog, not search
- **Search**: Visible in search, not catalog
- **Catalog, Search**: Fully visible

**Recommendation**: Use "Not Visible Individually" for standard configurables.

#### Include Child Out of Stock

**Field**: `include_child_out_of_stock`
**Type**: Checkbox
**Default**: No
**Scope**: Global
**Depends**: `is_active_configurable = Yes`

Create configurable child products even when out of stock.

**Behavior**:
- **Enabled**: Import all variations regardless of stock
- **Disabled**: Skip out-of-stock variations

---

### 13. Bundle Product Configuration

**Fieldset**: `bundle_config`
**Purpose**: Configure bundle product import

#### Import Bundle Products

**Field**: `is_active_bundle`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Enable bundle product import from PlentyONE.

#### Bundle SKU Type

**Field**: `bundle_sku_type`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_bundle = Yes`

Define SKU display for bundle products.

**Options**:
- **Dynamic**: Show selected option SKUs
- **Fixed**: Show bundle product SKU only

#### Bundle Price Type

**Field**: `bundle_price_type`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_bundle = Yes`

Define price calculation for bundle products.

**Options**:
- **Dynamic**: Calculate from selected options
- **Fixed**: Use bundle product price

#### Bundle Price View

**Field**: `bundle_price_view`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_bundle = Yes`

Define how prices are displayed.

**Options**:
- **Price Range**: Show min-max price range
- **As Low As**: Show lowest possible price

**Examples**:
```
Price Range: $50.00 - $150.00
As Low As: As low as $50.00
```

#### Bundle Weight Type

**Field**: `bundle_weight_type`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_bundle = Yes`

Define weight calculation for bundle products.

**Options**:
- **Dynamic**: Calculate from selected options
- **Fixed**: Use bundle product weight

#### Bundle Shipment Type

**Field**: `bundle_shipment_type`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_bundle = Yes`

Define shipment handling for bundle products.

**Options**:
- **Together**: Ship bundle as single unit
- **Separately**: Ship components individually

#### Bundle Option Input Type

**Field**: `bundle_option_input_type`
**Type**: Select
**Scope**: Global
**Depends**: `is_active_bundle = Yes`

Default input type for bundle options.

**Options**:
- **Drop-down**: Dropdown selector
- **Radio Buttons**: Radio button selector
- **Checkbox**: Multiple selection
- **Multiple Select**: Multiple dropdown selection

#### Bundle Option Required

**Field**: `bundle_option_required`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global
**Depends**: `is_active_bundle = Yes`

Make bundle options required by default.

#### Bundle Option Quantity

**Field**: `bundle_option_quantity`
**Type**: Text (Decimal)
**Default**: 1.0
**Scope**: Global
**Depends**: `is_active_bundle = Yes`

Default quantity for bundle options.

#### Convert Simple to Bundle

**Field**: `convert_simple_to_bundle`
**Type**: Checkbox
**Default**: No
**Scope**: Global
**Depends**: `is_active_bundle = Yes`

Convert simple products to bundle if bundle structure detected in PlentyONE.

**Use Case**: Dynamic product type conversion based on item relations.

---

### 14. Log Configuration

**Fieldset**: `log_config`
**Purpose**: Configure logging and debugging

#### Enable Logging

**Field**: `enable_logging`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global

Enable import activity logging.

**Log File**: `var/log/plenty_item_import.log`

#### Log Level

**Field**: `log_level`
**Type**: Select
**Scope**: Global
**Depends**: `enable_logging = Yes`

Set logging verbosity level.

**Options**:
- **Error**: Only errors
- **Warning**: Errors and warnings
- **Info**: Errors, warnings, and info messages (default)
- **Debug**: All messages including debug details

**Recommendations**:
- **Production**: Info or Warning
- **Development/Debugging**: Debug
- **Troubleshooting**: Debug

#### Log API Requests

**Field**: `log_api_requests`
**Type**: Checkbox
**Default**: No
**Scope**: Global
**Depends**: `enable_logging = Yes`

Log full API request details.

**What Gets Logged**:
- Request URL and method
- Request headers
- Request body (JSON)
- Response status code
- Response time

**Warning**: Generates large log files. Enable only for debugging.

#### Log API Responses

**Field**: `log_api_responses`
**Type**: Checkbox
**Default**: No
**Scope**: Global
**Depends**: `enable_logging = Yes`

Log full API response details.

**What Gets Logged**:
- Response headers
- Response body (JSON)
- Response size
- Parse errors

**Warning**: Generates very large log files. Enable only for debugging specific API issues.

#### Log Product Data

**Field**: `log_product_data`
**Type**: Checkbox
**Default**: No
**Scope**: Global
**Depends**: `enable_logging = Yes`

Log detailed product data during processing.

**What Gets Logged**:
- Generated product data (before save)
- Attribute values
- Processor actions
- Validation results

**Use Case**: Debugging attribute mapping, price calculations, or data transformation issues.

---

### 15. Advanced Configuration

**Fieldset**: `advanced_config` (collapsible)
**Purpose**: Advanced settings for power users

#### Process Timeout

**Field**: `process_timeout`
**Type**: Text (Integer)
**Default**: 3600
**Scope**: Global

Maximum execution time in seconds.

**Default**: 3600 (1 hour)

**Recommendations**:
- Small catalogs (< 1,000): 1800 (30 min)
- Medium catalogs (1,000-10,000): 3600 (1 hour)
- Large catalogs (> 10,000): 7200+ (2+ hours)

#### Memory Limit

**Field**: `memory_limit`
**Type**: Text
**Default**: 2G
**Scope**: Global

Memory limit for import process.

**Format**: `256M`, `1G`, `2G`, `4G`

**Calculation**:
```
Memory Needed ≈ Batch Size × Per-Product Memory
Per-Product: 3-6 MB (simple), 5-10 MB (configurable)

Example:
Batch Size: 100
Product Type: Configurable
Memory: 100 × 8 MB = 800 MB + 200 MB overhead = 1 GB
```

**Recommendations**:
- Small batches (50): 512M
- Default batches (100): 1G-2G
- Large batches (200+): 4G+

#### Index Mode

**Field**: `index_mode`
**Type**: Select
**Scope**: Global

Control how Magento indexers are triggered.

**Options**:
- **Automatic**: Reindex after import (default)
- **Manual**: Skip reindexing (run manually)
- **Schedule**: Use scheduled indexing

**Recommendations**:
- **Small catalogs**: Automatic
- **Large catalogs**: Schedule (better performance)
- **Frequent imports**: Schedule (reduce overhead)

#### Cache Flush

**Field**: `flush_cache_after_import`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global

Flush Magento cache after import.

**Behavior**:
- Clears full page cache
- Clears block HTML cache
- Clears catalog cache
- Ensures fresh product data displayed

**Recommendation**: Keep enabled for production to ensure customers see updated products immediately.

---

## Common Workflows

### Workflow 1: Initial Full Catalog Import

**Scenario**: First-time setup, import entire product catalog from PlentyONE to Magento.

**Steps**:

1. **Prepare Magento**:
   ```bash
   # Create all necessary attributes
   bin/magento setup:upgrade

   # Create attribute sets if needed
   # Via Admin: Stores → Attributes → Attribute Set → New

   # Set Magento to maintenance mode (optional)
   bin/magento maintenance:enable
   ```

2. **Configure Profile**:
   - **Client**: Select/configure PlentyONE client
   - **Schedule**: Disable scheduled import initially
   - **Batch Size**: Start with 50 (conservative)
   - **Store Mapping**: Map at least one store
   - **Tax & Price**: Configure VAT and sales price mappings
   - **Attribute Configuration**:
     - Set attribute set mapping
     - Configure text mapping (name, description)
     - Map barcodes, manufacturers
     - **Disable** attribute restriction (import all attributes)
   - **Category**: Enable category import, map root categories
   - **Media**: Enable image import, configure download or CDN
   - **Configurable**: Enable configurable import, map variation attributes
   - **Bundle**: Enable if using bundles
   - **Log**: Set to Debug level

3. **Collect Configuration**:
   - Click "Collect Client Config Data" button
   - Wait for completion (~30-60 seconds)
   - Refresh profile configuration page
   - Verify dropdowns show PlentyONE data

4. **Test Import (Small Batch)**:
   ```bash
   # Import first 10 products
   bin/magento plenty:item:import --profile-id=1 --limit=10

   # Check logs
   tail -f var/log/plenty_item_import.log

   # Verify products created
   bin/magento catalog:product:list
   ```

5. **Review Test Results**:
   - Check product names, SKUs, prices
   - Verify images loaded correctly
   - Review attribute values
   - Test configurable products
   - Check category assignments

6. **Adjust Configuration** (if needed):
   - Fix attribute mappings
   - Adjust price calculations
   - Correct image import issues
   - Update category mappings

7. **Full Catalog Import**:
   ```bash
   # Run full import
   bin/magento plenty:item:import --profile-id=1

   # Monitor progress
   tail -f var/log/plenty_item_import.log

   # Check memory and performance
   watch -n 5 'free -h && ps aux | grep plenty'
   ```

8. **Post-Import Tasks**:
   ```bash
   # Reindex (if not automatic)
   bin/magento indexer:reindex

   # Clear cache
   bin/magento cache:flush

   # Disable maintenance mode
   bin/magento maintenance:disable

   # Verify product counts
   bin/magento catalog:product:list | wc -l
   ```

9. **Verify Frontend**:
   - Browse product catalog
   - Check product pages
   - Verify images, prices, descriptions
   - Test configurable product selections
   - Check category navigation

10. **Enable Scheduled Import**:
    - Set **Scheduled Import**: Yes
    - Set frequency (e.g., every 15 minutes)
    - Configure **One-Time Full Process**: Weekly at 2:00 AM
    - Reduce **Log Level** to Info or Warning

**Expected Duration**:
| Catalog Size | Batch 50 | Batch 100 | Batch 200 |
|--------------|----------|-----------|-----------|
| 1,000 products | 15-20 min | 10-15 min | 8-12 min |
| 10,000 products | 2-3 hours | 1.5-2 hours | 1-1.5 hours |
| 100,000 products | 20-30 hours | 15-20 hours | 10-15 hours |

---

### Workflow 2: Incremental Product Updates

**Scenario**: Regular updates for existing catalog (prices, stock, descriptions).

**Configuration**:
```
Profile Settings:
- Scheduled Import: Yes
- Frequency: Every 15 minutes (*/15 * * * *)
- Batch Size: 100
- API Collection Size: 100
- Attribute Restriction: Disabled (sync all attributes)
- One-Time Full Process: Weekly (Sunday 2:00 AM)
```

**What Gets Updated**:
- Products modified since last sync
- New products created in PlentyONE
- Price changes
- Stock level changes
- Description updates
- Image updates
- Category reassignments

**Cron Execution**:
```
Cron runs: */15 * * * *
→ Every 15 minutes at :00, :15, :30, :45

Process:
1. Check last sync timestamp
2. Fetch products updated since last sync
3. Process in batches of 100
4. Update existing products or create new ones
5. Update last sync timestamp
6. Log results
```

**Monitoring**:
```bash
# Check last execution
bin/magento cron:status | grep plenty_item_import

# View recent log entries
tail -100 var/log/plenty_item_import.log

# Check for errors
grep -i error var/log/plenty_item_import.log | tail -20

# Monitor queue status
bin/magento queue:consumers:list
```

**Performance**:
- Typical execution: 1-5 minutes
- Products processed: 10-500 per run (depends on changes)
- Low server impact (incremental)

---

### Workflow 3: Price and Stock Updates Only

**Scenario**: Frequent price/stock updates while preserving manual content in Magento.

**Configuration**:
```
Profile Settings:
- Scheduled Import: Yes
- Frequency: Every 5 minutes (*/5 * * * *)
- Batch Size: 200 (higher for faster sync)
- API Collection Size: 250
- Attribute Restriction: ENABLED
- Allowed Attributes:
  - price
  - special_price
  - tier_price
  - quantity
  - stock_status
  - backorders
- One-Time Full Process: Disabled
```

**Benefits**:
- 73-75% faster than full sync
- Preserves manual descriptions, images, meta data
- Allows marketing team to customize content
- Maintains PlentyONE as pricing/inventory source

**Example Use Case**:
```
Magento:
- Manual descriptions optimized for SEO
- Custom product images with watermarks
- Marketing content in short_description
- Manual meta keywords/descriptions

PlentyONE:
- Master pricing data
- Inventory levels
- Special prices / sales

Result:
- Prices synced every 5 minutes
- Stock updated in real-time
- Content remains manually managed
```

**Verification**:
```bash
# Test with single product
bin/magento plenty:item:import --profile-id=1 --entity-ids=12345

# Check only price/stock updated
bin/magento catalog:product:show SKU123

# Monitor log to verify attributes skipped
tail -f var/log/plenty_item_import.log | grep "Skipping attribute"
```

**Performance**:
| Catalog Size | Full Sync | Price/Stock Only | Improvement |
|--------------|-----------|------------------|-------------|
| 1,000 | 45 sec | 12 sec | 73% faster |
| 10,000 | 8 min | 2 min | 75% faster |
| 100,000 | 85 min | 22 min | 74% faster |

---

### Workflow 4: Multi-Store Import (Multi-Language)

**Scenario**: Import products to multiple store views with different languages.

**Store Mapping Configuration**:
```
Row 1:
- Plenty ID: 0 (Default)
- Store: English Store View
- Referrer: 0
- Locale: en

Row 2:
- Plenty ID: 1 (German)
- Store: German Store View
- Referrer: 0
- Locale: de

Row 3:
- Plenty ID: 2 (French)
- Store: French Store View
- Referrer: 0
- Locale: fr
```

**Item Text Mapping**:
```
English Content:
- Name 1 → name (language: en)
- Description → description (language: en)
- Preview Text → short_description (language: en)

German Content:
- Name 1 → name (language: de)
- Description → description (language: de)
- Preview Text → short_description (language: de)

French Content:
- Name 1 → name (language: fr)
- Description → description (language: fr)
- Preview Text → short_description (language: fr)
```

**How It Works**:
```
Import Process (per product):
1. Create/update product in default store (English)
   - SKU, price, weight, images (global data)

2. Update English store view:
   - Name, description, short_description (locale: en)
   - Meta data, URL rewrites

3. Update German store view:
   - Name, description, short_description (locale: de)
   - Meta data, URL rewrites

4. Update French store view:
   - Name, description, short_description (locale: fr)
   - Meta data, URL rewrites
```

**Result**:
- Single product with multiple translations
- Shared: SKU, price, images, stock, attributes
- Store-specific: name, description, meta data, URLs

**Verification**:
```bash
# Check product in English store
bin/magento catalog:product:show SKU123 --store=en

# Check product in German store
bin/magento catalog:product:show SKU123 --store=de

# Compare product names
bin/magento catalog:product:show SKU123 --store=en | grep "Name:"
bin/magento catalog:product:show SKU123 --store=de | grep "Name:"
```

---

### Workflow 5: Configurable Products with Variations

**Scenario**: Import configurable products (e.g., T-shirts with size and color variations).

**PlentyONE Structure**:
```
Item ID: 12345 - "Cotton T-Shirt"
├─ Variation 1 (12345-001): Size S, Color Red
├─ Variation 2 (12345-002): Size M, Color Red
├─ Variation 3 (12345-003): Size L, Color Red
├─ Variation 4 (12345-004): Size S, Color Blue
├─ Variation 5 (12345-005): Size M, Color Blue
└─ Variation 6 (12345-006): Size L, Color Blue
```

**Configuration**:
```
Configurable Product Settings:
- Import Configurable Products: Yes
- Configurable Attribute Mapping:
  - Row 1: Color (PlentyONE Attribute 1) → color (Sort: 10)
  - Row 2: Size (PlentyONE Attribute 2) → size (Sort: 20)
- Child Product Name Pattern: {parent_name} - {attribute_value}
- Auto-generate Child Names: Yes
- Child Product Visibility: Not Visible Individually
- Include Child Out of Stock: No (only import in-stock variations)

Attribute Configuration:
- Product Mapping Identifier: SKU
- Auto Create Attribute Options: Yes (create color/size values automatically)
```

**Import Process**:
```
1. Generator Stage:
   - ProductEntity: Create parent "Cotton T-Shirt" (type: configurable)
   - ConfigAttribute: Identify variation attributes (color, size)
   - Variation: Generate child products for each variation

2. Validation Stage:
   - Validate configurable attributes exist
   - Check attribute options (Red, Blue, S, M, L)
   - Create missing options if auto-create enabled

3. Processing Stage:
   - Create parent product: "Cotton T-Shirt"
   - Create child products:
     - "Cotton T-Shirt - S - Red"
     - "Cotton T-Shirt - M - Red"
     - "Cotton T-Shirt - L - Red"
     - "Cotton T-Shirt - S - Blue"
     - "Cotton T-Shirt - M - Blue"
     - "Cotton T-Shirt - L - Blue"
   - Link children to parent
   - Configure super attributes (color, size)

4. Post-Processing:
   - Set child visibility: Not Visible Individually
   - Configure price display (lowest price shown)
   - Generate URL rewrites for parent
   - Update stock status based on children
```

**Result in Magento**:
```
Product Catalog:
└─ Cotton T-Shirt (Configurable Product)
   - SKU: 12345
   - Price: From $19.99 (lowest child price)
   - Configurable Options:
     - Color: Red, Blue
     - Size: S, M, L
   - URL: /cotton-t-shirt.html

   Associated Products (children, not visible):
   ├─ Cotton T-Shirt - S - Red (SKU: 12345-001)
   ├─ Cotton T-Shirt - M - Red (SKU: 12345-002)
   ├─ Cotton T-Shirt - L - Red (SKU: 12345-003)
   ├─ Cotton T-Shirt - S - Blue (SKU: 12345-004)
   ├─ Cotton T-Shirt - M - Blue (SKU: 12345-005)
   └─ Cotton T-Shirt - L - Blue (SKU: 12345-006)
```

**Frontend Display**:
- Customer sees: "Cotton T-Shirt"
- Selects: Color = Red, Size = M
- Adds to cart: "Cotton T-Shirt - M - Red" (child SKU 12345-002)

**CLI Commands**:
```bash
# Import configurable products
bin/magento plenty:item:import --profile-id=1

# Check parent product
bin/magento catalog:product:show 12345

# List child products
bin/magento catalog:product:list | grep "12345-"

# View configurable options
bin/magento catalog:product:show 12345 --show-super-attributes

# Test attribute options created
bin/magento catalog:attribute:options color
bin/magento catalog:attribute:options size
```

---

## CLI Commands Reference

### Basic Import Commands

```bash
# Full import (all products)
bin/magento plenty:item:import --profile-id=1

# Import specific products by PlentyONE variation IDs
bin/magento plenty:item:import --profile-id=1 --entity-ids=1001,1002,1003

# Import with custom batch size
bin/magento plenty:item:import --profile-id=1 --batch-size=50

# Import limited number of products
bin/magento plenty:item:import --profile-id=1 --limit=100
```

### Advanced Import Options

```bash
# Force full re-import (ignore timestamps)
bin/magento plenty:item:import --profile-id=1 --force

# Import new products only (skip existing)
bin/magento plenty:item:import --profile-id=1 --new-only

# Import without processing images (faster)
bin/magento plenty:item:import --profile-id=1 --skip-media

# Import without triggering indexers
bin/magento plenty:item:import --profile-id=1 --skip-reindex

# Import with verbose output
bin/magento plenty:item:import --profile-id=1 -v
bin/magento plenty:item:import --profile-id=1 -vv
bin/magento plenty:item:import --profile-id=1 -vvv (debug)
```

### Product Management Commands

```bash
# List all products
bin/magento catalog:product:list

# Show specific product details
bin/magento catalog:product:show SKU123

# Clean up orphaned product data
bin/magento plenty:item:purge --profile-id=1
```

### Configuration Commands

```bash
# Collect PlentyONE configuration data
bin/magento plenty:setup:collect:config --profile-id=1

# View profile configuration
bin/magento config:show plenty/plenty_item_import
```

### Validation Commands

```bash
# Validate attribute restriction configuration
bin/magento config:show plenty/plenty_item_import/is_active_attribute_restriction
bin/magento config:show plenty/plenty_item_import/allowed_attributes

# Validate store mapping
bin/magento config:show plenty/plenty_item_import/store_mapping

# Validate sales price configuration
bin/magento config:show plenty/plenty_item_import/sales_price_config
```

### Indexing Commands

```bash
# Reindex all indexers
bin/magento indexer:reindex

# Reindex specific indexers
bin/magento indexer:reindex catalog_product_flat
bin/magento indexer:reindex catalog_product_price
bin/magento indexer:reindex cataloginventory_stock
bin/magento indexer:reindex catalog_product_attribute
bin/magento indexer:reindex catalog_category_product
bin/magento indexer:reindex catalogsearch_fulltext

# Check indexer status
bin/magento indexer:status

# Reset indexers to "invalid" state
bin/magento indexer:reset
```

### Cache Management Commands

```bash
# Flush all cache
bin/magento cache:flush

# Clear specific cache types
bin/magento cache:clean full_page block_html

# Disable cache during testing
bin/magento cache:disable

# Enable cache
bin/magento cache:enable
```

### Troubleshooting Commands

```bash
# View import logs
tail -f var/log/plenty_item_import.log

# Filter errors only
grep -i error var/log/plenty_item_import.log | tail -50

# Check cron status
bin/magento cron:status | grep plenty_item_import

# Check queue consumers
bin/magento queue:consumers:list
bin/magento queue:consumers:start plenty.item.import

# View system errors
tail -f var/log/system.log
tail -f var/log/exception.log
```

### Performance Monitoring Commands

```bash
# Monitor memory usage
watch -n 1 'free -h'

# Monitor running processes
watch -n 5 'ps aux | grep plenty'

# Check database locks
bin/magento db:status

# View slow query log
tail -f var/log/db.log
```

---

## Troubleshooting

### Issue 1: Products Not Importing

**Symptoms**:
- Import completes but no products created
- Log shows "0 products processed"
- Products exist in PlentyONE but not in Magento

**Possible Causes & Solutions**:

**1. Store Mapping Not Configured**
```bash
# Check store mapping
bin/magento config:show plenty/plenty_item_import/store_mapping

# Solution: Configure at least one store mapping
# Admin: Profile → Store Mapping Configuration
# Add row: Plenty ID, Magento Store, Referrer, Locale
```

**2. API Collection Filters Too Restrictive**
```bash
# Check PIM search criteria
bin/magento config:show plenty/plenty_item_import/pim_search_criteria

# Solution: Review/remove restrictive filters
# Admin: Profile → HTTP API Configuration → PIM Search Criteria
# Remove or adjust filters (e.g., isActive, flagOne, supplierId)
```

**3. Products Not Active in PlentyONE**
- Check product status in PlentyONE
- Verify products linked to correct store/referrer
- Ensure availability flags set correctly

**4. Configuration Data Not Collected**
```bash
# Collect configuration data
bin/magento plenty:setup:collect:config --profile-id=1

# Verify dropdowns populated
# Admin: Profile configuration → Check dropdown fields
```

**5. Authentication Issues**
```bash
# Check logs for auth errors
grep -i "authentication\|unauthorized\|401" var/log/plenty_item_import.log

# Solution: Reconfigure client credentials
# Admin: Stores → Configuration → PlentyMarkets → Client
```

---

### Issue 2: Configurable Products Not Creating

**Symptoms**:
- Simple products created but not configurables
- Parent product created but no children linked
- Variation attributes not displaying

**Possible Causes & Solutions**:

**1. Configurable Import Disabled**
```bash
# Check configurable import setting
bin/magento config:show plenty/plenty_item_import/is_active_configurable

# Solution: Enable configurable product import
# Admin: Profile → Configurable Product Configuration
# Enable: Import Configurable Products = Yes
```

**2. Variation Attributes Not Mapped**
```bash
# Check configurable attribute mapping
bin/magento config:show plenty/plenty_item_import/configurable_attribute_mapping

# Solution: Map variation attributes
# Admin: Profile → Configurable Product Configuration
# Add rows: PlentyONE Property → Magento Attribute
# Example: Color → color, Size → size
```

**3. Magento Attributes Not Configurable**
- Check attribute scope (must be Global)
- Verify "Used in Configurable Products" = Yes
- Ensure attribute is visible and comparable

```bash
# Check attribute properties
bin/magento catalog:attribute:show color

# Solution: Update attribute
# Admin: Stores → Attributes → Product
# Select attribute → Storefront Properties
# Set: Scope = Global, Use in Configurable = Yes
```

**4. Attribute Options Not Created**
```bash
# Check if auto-create enabled
bin/magento config:show plenty/plenty_item_import/auto_create_attribute_options

# Enable auto-creation
# Admin: Profile → Attribute Configuration
# Enable: Create Attribute Options = Yes

# Or manually create options
bin/magento catalog:attribute:options color --add="Red,Blue,Green"
```

**5. Attribute Restriction Blocking Super Attributes** (Fixed October 2025)
- Older versions: Super attributes were incorrectly blocked by attribute restriction
- **Solution**: Update to latest version or disable attribute restriction for configurable imports

```bash
# Temporary workaround: Disable attribute restriction
bin/magento config:set plenty/plenty_item_import/is_active_attribute_restriction 0

# Or: Include super attributes in allowed list
# Admin: Profile → Attribute Configuration
# Allowed Attributes: Add color, size, style, etc.
```

---

### Issue 3: Images Not Importing

**Symptoms**:
- Products imported but no images
- Image URLs not working
- Images shown as broken links

**Possible Causes & Solutions**:

**1. Image Import Disabled**
```bash
# Check media import setting
bin/magento config:show plenty/plenty_item_import/is_active_media

# Solution: Enable media import
# Admin: Profile → Media Configuration
# Enable: Import Media Data = Yes
```

**2. Image Download Issues**
```bash
# Check if file download enabled (if using download mode)
bin/magento config:show plenty/plenty_item_import/enable_file_download

# Test image URL accessibility
curl -I https://cdn02.plentymarkets.com/path/to/image.jpg

# Check logs for download errors
grep -i "image\|download\|media" var/log/plenty_item_import.log | grep -i error
```

**3. File Permission Issues**
```bash
# Check media directory permissions
ls -la pub/media/catalog/product/

# Fix permissions
chmod -R 775 pub/media/catalog/product/
chown -R www-data:www-data pub/media/catalog/product/

# SELinux contexts (if applicable)
chcon -R -t httpd_sys_rw_content_t pub/media/catalog/product/
```

**4. CDN URL Issues** (if using CDN mode)
- Verify PlentyONE CDN URLs are accessible
- Check if CDN requires authentication
- Test image URL in browser

**5. Image Role Mapping Not Configured**
```bash
# Check image role mapping
bin/magento config:show plenty/plenty_item_import/image_role_mapping

# Solution: Configure image role mapping
# Admin: Profile → Media Configuration → Image Role Mapping
# Add rows: PlentyONE Type → Magento Role (image, small_image, etc.)
```

**6. Image Channel Filter**
```bash
# Check channel filter
bin/magento config:show plenty/plenty_item_import/image_channel_filter

# Solution: Ensure webshop channel included
# Admin: Profile → Media Configuration → Image Channel Filter
# Include: 1 (Webshop) or leave empty for all channels
```

---

### Issue 4: Incorrect Prices

**Symptoms**:
- Prices importing as 0.00
- Prices different than PlentyONE
- Tax calculations incorrect

**Possible Causes & Solutions**:

**1. Price Import Disabled**
```bash
# Check price import setting
bin/magento config:show plenty/plenty_item_import/is_active_price

# Solution: Enable price import
# Admin: Profile → Tax & Price Configuration
# Enable: Import Price Data = Yes
```

**2. Sales Price Not Mapped**
```bash
# Check sales price configuration
bin/magento config:show plenty/plenty_item_import/sales_price_config

# Solution: Map sales prices
# Admin: Profile → Tax & Price Configuration → Sales Price Configuration
# Add rows: PlentyONE Sales Price ID → Magento Price Type (price, special_price)
```

**3. Wrong Price Calculation Mode**
```bash
# Check price calculation mode
bin/magento config:show plenty/plenty_item_import/price_calculation_mode

# Options:
# - net: Import net price (Magento adds tax on display)
# - gross: Import gross price (tax included)

# Solution: Match to your PlentyONE setup
# Admin: Profile → Tax & Price Configuration → Price Calculation Mode
```

**4. Currency Mismatch**
- Verify PlentyONE currency matches Magento store currency
- Check currency conversion rates
- Review multi-currency setup

**5. Customer Group Pricing Issues**
```bash
# Check sales price customer group mapping
bin/magento config:show plenty/plenty_item_import/sales_price_config

# Solution: Map group prices correctly
# Admin: Profile → Tax & Price Configuration → Sales Price Configuration
# Specify: Customer Group, Website for group/tier prices
```

**6. Tax Configuration Issues**
```bash
# Check tax import setting
bin/magento config:show plenty/plenty_item_import/is_active_tax

# Check VAT configuration
bin/magento config:show plenty/plenty_item_import/vat_config

# Solution: Configure tax classes
# Admin: Profile → Tax & Price Configuration
# Map: PlentyONE VAT → Magento Tax Class
```

---

### Issue 5: Attribute Restriction Not Working

**Symptoms**:
- All attributes importing despite restriction enabled
- Restricted attributes still updating
- Configuration seems ignored

**Possible Causes & Solutions**:

**1. Restriction Not Enabled**
```bash
# Verify restriction enabled
bin/magento config:show plenty/plenty_item_import/is_active_attribute_restriction

# Should return: 1

# Enable restriction
bin/magento config:set plenty/plenty_item_import/is_active_attribute_restriction 1
```

**2. Allowed Attributes Not Set**
```bash
# Check allowed attributes
bin/magento config:show plenty/plenty_item_import/allowed_attributes

# Should return: JSON array like ["price","special_price","quantity"]

# Solution: Configure allowed attributes
# Admin: Profile → Attribute Configuration
# Attribute Restriction: Allowed Attributes → Select attributes
```

**3. Cache Not Cleared**
```bash
# Clear configuration cache
bin/magento cache:clean config

# Or flush all cache
bin/magento cache:flush
```

**4. Required Attributes Bypassing Restriction** (Expected Behavior)
- For **new products**, required attributes always import
- This is intentional to ensure product creation succeeds
- **Not a bug**: Check if products are new vs existing

```bash
# Verify behavior
# New product: Required attributes + allowed attributes imported
# Existing product: Only allowed attributes imported

# Check logs
grep "Skipping attribute" var/log/plenty_item_import.log
```

**5. Configurable Attributes Bypassing Restriction** (Expected Behavior)
- Super attributes (color, size) always import
- This is intentional for configurable product relationships
- **Not a bug**: Structural attributes cannot be restricted

---

### Issue 6: Memory Limit or Timeout Errors

**Symptoms**:
- "Allowed memory size exhausted" errors
- Import times out before completion
- PHP fatal errors in logs

**Solutions**:

**1. Increase Memory Limit**
```bash
# Temporary (CLI)
php -d memory_limit=4G bin/magento plenty:item:import --profile-id=1

# Permanent (php.ini)
memory_limit = 4G

# Profile-specific (Admin)
# Admin: Profile → Advanced Configuration → Memory Limit
# Set: 2G, 4G, or higher
```

**2. Reduce Batch Size**
```bash
# Use smaller batches
bin/magento plenty:item:import --profile-id=1 --batch-size=25

# Or configure in profile
# Admin: Profile → Schedule Configuration → Batch Size
# Set: 25-50 for limited memory
```

**3. Increase Timeout**
```bash
# Temporary (CLI)
php -d max_execution_time=7200 bin/magento plenty:item:import --profile-id=1

# Permanent (php.ini)
max_execution_time = 7200

# Profile-specific (Admin)
# Admin: Profile → Advanced Configuration → Process Timeout
# Set: 7200 (2 hours) or higher
```

**4. Optimize Import**
- Enable attribute restriction (import fewer attributes)
- Skip media import initially
- Disable logging (or reduce log level)
- Use scheduled indexing instead of automatic

```bash
# Fast import: price/stock only, no media, no reindex
bin/magento plenty:item:import \
  --profile-id=1 \
  --batch-size=200 \
  --skip-media \
  --skip-reindex
```

---

### Issue 7: SKU Conflicts or Duplicates

**Symptoms**:
- "SKU already exists" errors
- Duplicate products created
- Wrong product updated

**Possible Causes & Solutions**:

**1. SKU Mapping Configuration**
```bash
# Check product mapping identifier
bin/magento config:show plenty/plenty_item_import/product_mapping_identifier

# Options:
# - sku: Use variation number as SKU (default)
# - custom: Use custom attribute

# Solution: Ensure consistent identifier
# Admin: Profile → Attribute Configuration → Product Mapping Identifier
```

**2. Custom Mapping Attribute Issues** (if using custom attribute)
```bash
# Check custom mapping attribute
bin/magento config:show plenty/plenty_item_import/custom_mapping_attribute

# Example: plenty_variation_id

# Verify attribute exists
bin/magento catalog:attribute:show plenty_variation_id

# Create attribute if missing
# Admin: Stores → Attributes → Product → Add Attribute
# Code: plenty_variation_id, Type: Text, Unique: Yes
```

**3. Variation Number Collisions**
- Multiple PlentyONE variations with same number
- SKU generation pattern creates duplicates
- Manual SKU overrides in Magento

**Solution**: Use unique SKU patterns or custom mapping attribute

**4. URL Key Duplicates**
```bash
# Check URL duplicate handling
bin/magento config:show plenty/plenty_item_import/append_sku_on_duplicate_url

# Enable SKU appending
# Admin: Profile → URL Configuration
# Enable: Append SKU on Duplicate = Yes
```

---

## Best Practices

### 1. Initial Setup Best Practices

**Preparation Phase**:
- ✅ Create all required attributes in Magento before first import
- ✅ Set up attribute sets matching PlentyONE item types
- ✅ Configure client connection and test API access
- ✅ Collect configuration data (dropdowns need this)
- ✅ Test with 10-20 products before full catalog import
- ✅ Set Magento to maintenance mode during large initial imports
- ✅ Use conservative batch size (50) for initial import
- ✅ Enable debug logging for first run

**Attribute Setup**:
```bash
# Create necessary attributes
# Admin: Stores → Attributes → Product

Required Attributes:
- ean (EAN/GTIN barcodes)
- manufacturer
- customs_tariff_number
- Technical specifications
- Super attributes: color, size, style (for configurables)

# Configure attribute properties:
- Scope: Global (for super attributes)
- Used in Configurable Products: Yes (for super attributes)
- Visible on Frontend: As needed
- Searchable: As needed
```

**Store Structure**:
- Define store views before import
- Create root categories for each store
- Configure locale codes (en, de, fr, etc.)
- Set up currency and tax zones

---

### 2. Ongoing Operations Best Practices

**Scheduled Sync Configuration**:
```
Incremental Updates:
- Frequency: Every 15-30 minutes
- Batch Size: 100-200
- API Collection: 100-250
- Attribute Restriction: Disabled (or enable for price/stock only)

Weekly Full Sync:
- Enable One-Time Full Process: Yes
- Frequency: Weekly
- Time: Sunday 02:00 AM
- Purpose: Data integrity verification
```

**Monitoring**:
```bash
# Daily monitoring routine
# 1. Check last execution
bin/magento cron:status | grep plenty_item_import

# 2. Review errors (if any)
grep -i error var/log/plenty_item_import.log | tail -20

# 3. Verify product count (check for unexpected changes)
bin/magento catalog:product:list | wc -l

# 4. Check indexer status
bin/magento indexer:status

# 5. Monitor disk space (if downloading images)
df -h pub/media/catalog/product/
```

**Maintenance Tasks**:
```bash
# Weekly: Clean old logs
find var/log -name "plenty_item_import.log*" -mtime +30 -delete

# Monthly: Verify attribute mappings still valid
bin/magento config:show plenty/plenty_item_import/attribute_mapping

# Monthly: Clean up orphaned images (if file cleanup enabled)
bin/magento plenty:item:purge --profile-id=1

# Quarterly: Full catalog re-sync for data integrity
bin/magento plenty:item:import --profile-id=1 --force
```

---

### 3. Performance Best Practices

**Batch Size Tuning**:
| Server Memory | Catalog Size | Product Type | Batch Size |
|---------------|--------------|--------------|------------|
| 2 GB | < 1,000 | Simple | 100 |
| 4 GB | 1,000-10,000 | Simple | 200 |
| 8 GB | > 10,000 | Simple | 500 |
| 4 GB | Any | Configurable | 50-100 |
| 8 GB | Any | Configurable | 100-200 |

**API Collection Size Tuning**:
- Start: 100 (default)
- Fast network + powerful PlentyONE: 250
- Slow network or timeouts: 50
- Monitor: API response times in logs

**Indexing Strategy**:
```
Small Catalogs (< 1,000 products):
- Index Mode: Automatic (reindex after import)
- Fast enough for real-time

Medium Catalogs (1,000-10,000):
- Index Mode: Schedule
- Cron: Run indexers every 15 minutes
- Reason: Reduce import overhead

Large Catalogs (> 10,000):
- Index Mode: Manual or Schedule
- Cron: Run indexers hourly or during off-peak
- Reason: Significant performance impact
```

**Optimize for Different Use Cases**:

**Use Case 1: Frequent Price Updates**
```
Configuration:
- Scheduled Import: Every 5 minutes
- Batch Size: 200 (high throughput)
- Attribute Restriction: ENABLED (price, special_price, quantity, stock_status)
- Indexing: Schedule (every 15 min)
- Logging: Warning level (reduce I/O)

Result: 73-75% faster, minimal server impact
```

**Use Case 2: Daily Full Catalog Sync**
```
Configuration:
- Scheduled Import: Daily 2:00 AM
- Batch Size: 100 (balanced)
- Attribute Restriction: Disabled (full sync)
- Indexing: Automatic (ensure fresh data)
- Logging: Info level

Result: Complete data sync overnight
```

**Use Case 3: Initial Large Import**
```
Configuration:
- Maintenance Mode: Enabled
- Batch Size: 50 (conservative)
- Skip Reindex: Yes (reindex once at end)
- Logging: Debug (troubleshoot issues)

Commands:
bin/magento maintenance:enable
bin/magento plenty:item:import --profile-id=1 --skip-reindex
bin/magento indexer:reindex
bin/magento cache:flush
bin/magento maintenance:disable
```

---

### 4. Data Quality Best Practices

**Attribute Mapping**:
- ✅ Map ALL relevant PlentyONE fields to Magento attributes
- ✅ Use meaningful attribute codes (not generic names)
- ✅ Configure correct attribute scope (Global, Website, Store)
- ✅ Set up attribute groups for organization
- ✅ Create select options before import or enable auto-create
- ✅ Validate data types match (text, decimal, date, etc.)

**Content Quality**:
```
PlentyONE Content Checklist:
✅ Product names complete and descriptive
✅ Descriptions formatted properly (HTML/Markdown)
✅ Images high quality and properly tagged
✅ Variation attributes consistent
✅ Barcodes (EAN/UPC) present and valid
✅ Prices set for all store views
✅ Stock levels accurate
✅ Category assignments complete
```

**Validation Strategy**:
```bash
# After import, validate key data:

# 1. Check product count matches expectations
bin/magento catalog:product:list | wc -l

# 2. Spot-check random products
bin/magento catalog:product:show SKU123

# 3. Verify configurable relationships
bin/magento catalog:product:show SKU456 --show-super-attributes

# 4. Check price range (no zeros)
# Query database or use admin grid

# 5. Verify image assignments
# Review products with missing images

# 6. Check category assignments
# Review uncategorized products
```

**Error Handling**:
- ✅ Review import logs daily
- ✅ Set up alerts for repeated errors
- ✅ Investigate products that consistently fail
- ✅ Fix data issues in PlentyONE at source
- ✅ Use debug logging temporarily for troubleshooting
- ✅ Document known issues and workarounds

---

### 5. Security and Compliance Best Practices

**API Security**:
- ✅ Use secure HTTPS for all API communication
- ✅ Store credentials encrypted in Magento configuration
- ✅ Rotate OAuth tokens periodically
- ✅ Limit API user permissions in PlentyONE
- ✅ Monitor API access logs for anomalies

**Log Management**:
- ✅ Disable API request/response logging in production (sensitive data)
- ✅ Rotate logs regularly (weekly/monthly)
- ✅ Restrict log file permissions (chmod 640)
- ✅ Exclude logs from version control (.gitignore)

**Data Privacy**:
- ✅ Review imported data for PII (personally identifiable information)
- ✅ Configure appropriate data retention policies
- ✅ Ensure GDPR compliance for customer-related data
- ✅ Implement data anonymization for development environments

**File Management**:
- ✅ Validate image URLs before downloading
- ✅ Scan downloaded images for malware (if applicable)
- ✅ Set proper file permissions (644 for files, 755 for directories)
- ✅ Limit media directory size with cleanup policies
- ✅ Use CDN mode to reduce local storage risks

---

### 6. Multi-Store Best Practices

**Store Mapping Strategy**:
```
Option 1: One-to-One Mapping
- Each PlentyONE store → One Magento store view
- Best for: Clear store separation, different product sets

Option 2: Many-to-One Mapping
- Multiple PlentyONE stores → One Magento store view
- Best for: Consolidating channels, unified catalog

Option 3: Content Localization
- Same products, different locales
- Use store mapping with different locale codes
- Best for: Multi-language single brand
```

**Multi-Language Configuration**:
```
Best Practices:
✅ Use correct ISO 639-1 locale codes (en, de, fr, es, it)
✅ Map item text types for each language
✅ Configure store-specific URL rewrites
✅ Test content rendering in each store view
✅ Validate special characters (UTF-8 encoding)
✅ Set up fallback to default store for missing translations
```

**Multi-Currency Setup**:
```
Configuration Steps:
1. Configure currencies in Magento
   Admin: Stores → Configuration → General → Currency Setup

2. Map PlentyONE sales prices to store currencies
   Profile: Tax & Price Configuration → Sales Price Configuration
   Specify: Website per currency

3. Test price display in each store view

4. Verify currency conversion rates (if using auto-conversion)
```

---

### 7. Testing and Validation Best Practices

**Pre-Production Testing**:
```bash
# 1. Test with small dataset
bin/magento plenty:item:import --profile-id=1 --limit=10

# 2. Validate different product types
# - Simple products
# - Configurable products
# - Bundle products (if applicable)

# 3. Test attribute restriction
# Enable restriction, import, verify only allowed attributes updated

# 4. Test price calculations
# Compare Magento prices with PlentyONE

# 5. Test image import
# Verify images display correctly on frontend

# 6. Test multi-store import
# Check content in each store view
```

**Staging Environment**:
- ✅ Replicate production configuration in staging
- ✅ Test profile changes in staging first
- ✅ Use production-like data volumes
- ✅ Validate performance under load
- ✅ Test error scenarios (API failures, timeouts)

**Regression Testing After Updates**:
```
Test Checklist:
✅ Products still importing correctly
✅ Configurable relationships intact
✅ Prices calculating correctly
✅ Images displaying properly
✅ Category assignments correct
✅ Attribute mappings working
✅ Stock levels syncing
✅ URL rewrites generating
✅ Multi-store content rendering
```

---

## Related Documentation

- [Product Export Profile](/docs/profiles/product-export) - Export products from Magento to PlentyONE
- [Stock Import Profile](/docs/profiles/stock-import) - Import advanced inventory (MSI) from PlentyONE
- [Stock Export Profile](/docs/profiles/stock-export) - Export inventory levels to PlentyONE
- [Category Import Profile](/docs/profiles/category-import) - Import category structure from PlentyONE
- [Order Export Profile](/docs/profiles/order-export) - Export orders to PlentyONE
- [Customer Import Profile](/docs/profiles/customer-import) - Import customers from PlentyONE
- [Attribute Mapping Guide](/docs/mapping/product-attributes) - Detailed attribute mapping configuration
- [Profile Configuration](/docs/configuration/profiles) - General profile setup and management

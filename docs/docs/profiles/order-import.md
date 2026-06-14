---
sidebar_position: 11
title: Order Import Profile
description: Import orders from PlentyONE to Magento using the Order Import Profile
---

# Order Import Profile

The **Order Import Profile** synchronizes orders from PlentyONE to Magento, primarily used for importing marketplace orders (Amazon, eBay, etc.) that are processed through PlentyONE.

## Overview

**Profile Type ID**: `plenty_order_import`
**Direction**: PlentyONE → Magento
**Purpose**: Import orders from external marketplaces and PlentyONE-managed sales channels into Magento

### What Gets Imported

- **Orders**: Complete order data with line items
- **Customers**: Customer information (if not exists)
- **Addresses**: Billing and shipping addresses
- **Order Status**: Current order state and status
- **Payments**: Payment method and transaction data
- **Shipping**: Shipping method and tracking
- **Invoices**: Invoice documents and financial data (when configured)
- **Credit Memos**: Returns and refund documentation (when applicable)
- **Order Totals**: Subtotals, tax, shipping, discounts, grand total

### Primary Use Cases

- **Marketplace Orders**: Import Amazon, eBay, Otto orders from PlentyONE
- **Multi-Channel Sales**: Consolidate orders from various channels
- **Order Synchronization**: Keep Magento updated with PlentyONE order changes
- **Fulfillment Tracking**: Import shipping and tracking updates
- **Financial Documents**: Sync invoices and credit memos from PlentyONE

:::info Order Direction
**Order Import** is used for orders created OUTSIDE Magento (marketplaces, PlentyONE).
For Magento store orders, use **Order Export** to send them to PlentyONE for fulfillment.
:::

## Configuration Reference

All configuration options are found at:
**Admin Panel** → **PlentyONE** → **Profiles** → **[Your Order Import Profile]**

### 1. Client Configuration

Configure the PlentyONE client connection for this profile.

#### Client

**Field**: `client_id`
**Type**: Select (Required)
**Scope**: Global

Select the PlentyONE client configuration to use for this order import profile. The client contains the API credentials and connection settings required to communicate with your PlentyONE system.

**Actions**:
- **Edit** - Modify existing client configuration
- **New Client** - Create a new PlentyONE client connection
- **Collect Configuration Data** - Fetch order statuses, payment methods, shipping profiles from PlentyONE
- **Delete Configuration Data** - Remove cached configuration data

:::tip Initial Setup
After selecting a client, click **Collect Configuration Data** to populate dropdown options throughout the profile configuration. This fetches payment methods, shipping profiles, order statuses, and referrers from your PlentyONE system.
:::

---

### 2. Schedule Configuration

Configure automated order import scheduling and processing behavior.

#### Enable Schedule

**Field**: `status`
**Type**: Checkbox
**Default**: Enabled
**Scope**: Global

Enable automatic order import processing via the scheduler. When enabled, orders will be imported from PlentyONE according to the configured schedule.

**When to Enable**:
- ✅ Production environments with regular order flow
- ✅ Automated marketplace order synchronization
- ✅ Continuous integration between systems

**When to Disable**:
- ❌ Initial testing and configuration
- ❌ Manual-only order import workflows
- ❌ Troubleshooting and debugging

#### Schedule

**Field**: `schedule_id`
**Type**: Select (Required when enabled)
**Scope**: Global

Select the cron schedule that determines when this profile will run automatically.

**Common Schedules**:
- **Every 15 minutes** - Near real-time order sync (recommended for high-volume)
- **Every 30 minutes** - Standard order sync
- **Every hour** - Low-volume marketplaces
- **Custom** - Define your own cron expression

#### Process Batch Size

**Field**: `process_batch_size`
**Type**: Input (Number)
**Default**: 50
**Range**: 1-1000
**Scope**: Global

Number of orders to process per batch execution. Higher values improve throughput but increase memory usage.

**Recommended Values**:
- **25-50** - Standard configurations, shared hosting
- **100-200** - Dedicated servers, high performance
- **500+** - Bulk imports, one-time migrations

:::warning Performance Impact
Higher batch sizes consume more memory. Monitor your PHP memory_limit (recommended: 2GB+) when processing large batches.
:::

#### Enable History

**Field**: `enable_history`
**Type**: Checkbox
**Default**: Enabled
**Scope**: Global

Enable logging of all processed order data for troubleshooting and audit purposes. Creates detailed execution history for each profile run.

**Benefits**:
- ✅ Track processing success/failure rates
- ✅ Review order import timeline
- ✅ Audit compliance and data changes
- ✅ Troubleshoot synchronization issues

**Storage Impact**: History records accumulate over time. Implement cleanup policies for long-running profiles.

---

#### Incomplete Order Detection

Advanced feature to automatically detect and re-sync orders missing shipments, invoices, or fulfillment data.

##### Enable Incomplete Order Detection

**Field**: `incomplete_detection_enabled`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Automatically detect and re-sync orders that are missing expected documents or stuck in processing states. The system periodically scans existing orders and triggers re-import when issues are detected.

**Use Cases**:
- ✅ Orders imported before invoice/shipment was created in PlentyONE
- ✅ Failed document creation (invoices, shipments, credit memos)
- ✅ Orders stuck in "processing" status longer than expected
- ✅ Status synchronization issues between systems

##### Minimum Order Age (Days)

**Field**: `incomplete_min_age_days`
**Type**: Input (Number)
**Default**: 2
**Required**: Yes (when detection enabled)
**Scope**: Global

Only check orders older than this many days. Prevents false positives for recently created orders that haven't completed their normal processing workflow.

**Recommended Values**:
- **1-2 days** - Fast-moving marketplaces (Amazon, eBay)
- **3-5 days** - Standard fulfillment cycles
- **7+ days** - Slow-moving or manual fulfillment processes

##### Maximum Order Age (Days)

**Field**: `incomplete_max_age_days`
**Type**: Input (Number)
**Default**: 30
**Required**: Yes (when detection enabled)
**Scope**: Global

Only check orders younger than this many days. Limits scanning to recent orders, improving performance and avoiding historical data.

**Recommended Values**:
- **30 days** - Standard setting (captures most fulfillment issues)
- **60 days** - Extended warranty/return periods
- **90 days** - Comprehensive historical correction

##### Detection Strategies

**Field**: `incomplete_strategies`
**Type**: Multiselect
**Default**: missing_shipments, missing_invoices, stuck_in_processing, status_mismatch
**Scope**: Global

Select which criteria to use for detecting incomplete orders.

**Available Strategies**:

| Strategy | Detects |
|----------|---------|
| **missing_shipments** | Orders marked shipped in PlentyONE but no shipment in Magento |
| **missing_invoices** | Orders with invoices in PlentyONE but missing in Magento |
| **stuck_in_processing** | Orders in "processing" status longer than expected |
| **status_mismatch** | PlentyONE status doesn't match Magento order state |
| **missing_creditmemos** | Credit notes exist in PlentyONE but not in Magento |

**Recommended**: Enable all strategies for comprehensive detection.

##### Excluded Order Statuses

**Field**: `incomplete_excluded_statuses`
**Type**: Multiselect
**Default**: complete, canceled, closed
**Scope**: Global

Skip orders with these Magento order statuses during incomplete detection scans.

**Common Exclusions**:
- `complete` - Fully processed orders
- `canceled` - Cancelled orders
- `closed` - Closed orders (returns processed)
- `holded` - Intentionally held orders

##### Maximum Orders Per Run

**Field**: `incomplete_batch_limit`
**Type**: Input (Number)
**Default**: 500
**Range**: 1-1000
**Required**: Yes (when detection enabled)
**Scope**: Global

Limit the number of incomplete orders to process per cron run. Prevents overwhelming the system when many incomplete orders are detected.

**Recommended Values**:
- **100-200** - Prevent timeout issues
- **500** - High-performance servers
- **1000** - Bulk correction operations

:::tip Detection Workflow
Incomplete order detection runs as a separate cron job after main import. It queries orders within the age range, applies detection strategies, and re-imports affected orders to sync missing data.
:::

---

### 3. HTTP API Configuration

Configure how orders are fetched from the PlentyONE REST API.

#### API Behaviour

**Field**: `api_behaviour`
**Type**: Select (Required)
**Default**: Append
**Scope**: Global

Select the API data collection behavior.

**Options**:

| Behaviour | Description | Use Case |
|-----------|-------------|----------|
| **Append** | Continuously import new and updated orders | ✅ Recommended for ongoing synchronization |
| **Replace** | Reset and reimport all orders matching criteria | ⚠️ One-time imports, data corrections |

**Append** tracks the last import timestamp and only fetches new/modified orders. **Replace** clears the collection table and reimports everything.

:::warning Replace Behavior
"Replace" mode deletes all previously collected orders and starts fresh. Use only for troubleshooting or one-time bulk imports.
:::

#### API Collection Size

**Field**: `collection_size`
**Type**: Input (Number)
**Default**: 50
**Maximum**: 500
**Scope**: Global

Number of orders retrieved per API request from PlentyONE. Higher values reduce API calls but increase response time and memory usage.

**Recommended Values**:
- **50** - Default, balanced performance
- **100-200** - High-volume imports
- **500** - Maximum, use only for bulk operations

**Performance Considerations**:
- Higher values = Fewer API requests = Faster overall collection
- Higher values = Larger response payloads = More memory per request
- PlentyONE API limits: Maximum 500 items per page

#### Order Search Criteria

**Field**: `order_search_filters`
**Type**: Multiselect (Required)
**Scope**: Global

Select which orders to import from PlentyONE based on their status or type. You can select multiple criteria to import orders in different states.

**Common PlentyONE Order Statuses**:

| Status ID | Status Name | Import? |
|-----------|-------------|---------|
| 3 | Waiting for payment | ✅ Import if tracking unpaid orders |
| 4 | In preparation for shipping | ✅ Yes - ready for fulfillment |
| 5 | Cleared for shipping | ✅ Yes - approved orders |
| 6 | Currently being shipped | ✅ Yes - track shipment |
| 7 | Shipped | ✅ Yes - import with tracking |
| 8 | Cancelled | ❌ Optional - usually skip |
| 9 | Return | ✅ Yes - if processing returns |
| 10+ | Completed/Archived | ❌ No - historical data |

**Example Configuration**:
```
Order Search Criteria: [4, 5, 7]
Result: Import orders in preparation, cleared, and shipped statuses
```

**Strategy**:
- ✅ Import active fulfillment statuses (4-7)
- ✅ Include return status (9) if processing returns in Magento
- ❌ Exclude completed (10+) and cancelled (8) to reduce noise
- ✅ Include unpaid (3) only if managing payment collection in Magento

#### Order Referrer Filter

**Field**: `order_referer_filter`
**Type**: Select
**Default**: -1 (All Referrers)
**Scope**: Global

Filter orders by their referrer (sales channel) in PlentyONE. Select a specific referrer to import only orders from that channel, or leave unselected to import from all referrers.

**Common Referrers**:
- **Magento Shop** - Your direct Magento store orders
- **Amazon** - Amazon marketplace orders
- **eBay** - eBay marketplace orders
- **Otto** - Otto marketplace orders (Germany)
- **Manual Order** - Manually created orders

**Use Cases**:
- ✅ Separate profiles per marketplace for isolated processing
- ✅ Filter specific channel for testing
- ✅ Import only marketplace orders (exclude Magento shop)

**Actions**:
- **New Referrer** - Create custom order referrer in PlentyONE

:::tip Multi-Profile Setup
Create separate import profiles per marketplace referrer for better control, error isolation, and performance monitoring.
:::

#### Initial Collect DateTime

**Field**: `initial_collect_timestamp`
**Type**: Date
**Scope**: Global

Specify the starting date and time for the initial data collection from PlentyONE. For example, entering 2022-08-20 will import all orders created from that date forward.

**Use Cases**:
- **First-time setup** - Set to go-live date
- **Historical import** - Set to past date for backfill
- **Fresh start** - Set to current date to skip old orders

**Behavior**:
- Only used on first collection when no previous import timestamp exists
- Subsequent imports use the last collected timestamp (incremental sync)
- Can be updated to trigger re-collection from new date

**Example**:
```
Initial Collect DateTime: 2024-01-01 00:00:00
Result: First run imports all orders from Jan 1, 2024 onwards
Subsequent runs: Import only new/updated orders since last run
```

---

### 4. Store Configuration

Map PlentyONE clients and languages to Magento store views for multi-store environments.

#### Store Mapping

**Field**: `store_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Define how PlentyONE clients and languages map to Magento stores. This configuration determines which Magento store view imported orders are assigned to.

**Row Fields**:
- **Store** - Magento store view
- **Client** - PlentyONE client ID
- **Locale** - PlentyONE language (e.g., de, en, fr)

**Example Configuration**:

| Magento Store | PlentyONE Client | Locale |
|---------------|------------------|--------|
| German Store | 1000 | de |
| English Store | 1000 | en |
| French Store | 1000 | fr |
| Austria Store | 2000 | de |

**How Mapping Works**:
1. Order arrives from PlentyONE with client ID and language
2. System looks up matching store mapping
3. Order is imported to the mapped Magento store view
4. If no mapping found, uses default store

:::warning Multi-Store Requirement
Store mapping is critical for multi-store setups. Orders without valid mapping may fail to import or be assigned to incorrect stores.
:::

#### Enable Store Filter

**Field**: `is_active_store_filter`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable filtering of orders by PlentyONE client store mapping. When enabled, only orders from stores that are included in the mapping above will be imported. Orders from unmapped stores will be excluded from import.

**When to Enable**:
- ✅ Multi-store Magento with selective import per store
- ✅ Prevent importing orders from specific PlentyONE clients
- ✅ Test store isolation

**When to Disable**:
- ❌ Single-store setup (not needed)
- ❌ Import all orders regardless of client/language

#### Order Referrer

**Field**: `referer_id`
**Type**: Select (Required)
**Scope**: Global

Select the primary order referrer (sales channel) for this profile.

**Actions**:
- **New Referrer** - Create a new order referrer in PlentyONE directly from Magento

**Difference from Order Referrer Filter**:
- **Order Referrer Filter** (API Config) - Filters which orders to collect from PlentyONE
- **Order Referrer** (Store Config) - Sets the referrer for orders created from this profile

---

### 5. Actions Configuration

Control order creation and automated order state management.

#### Create New Order

**Field**: `create_new_order`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable automatic creation of new Magento orders from PlentyONE order data.

**When to Enable**:
- ✅ Importing marketplace orders to Magento
- ✅ Consolidating multi-channel orders in Magento
- ✅ Magento as central order management system

**When to Disable**:
- ❌ Only syncing order status updates
- ❌ Only importing documents (invoices, shipments) for existing orders
- ❌ Testing configuration without creating orders

#### Create New Product

**Field**: `create_new_product`
**Type**: Checkbox
**Default**: Enabled
**Scope**: Global

Enable automatic creation of products when they don't exist in Magento during order import.

**Behavior**:
- **Enabled**: Missing products are imported from PlentyONE, then order is created
- **Disabled**: Orders with missing products will fail with error

**When to Enable**:
- ✅ Marketplace-specific SKUs not in main catalog
- ✅ Dynamic product catalog from PlentyONE
- ✅ Automated product management

**When to Disable**:
- ❌ Strict catalog control (all products must pre-exist)
- ❌ Manual product approval workflow
- ❌ Prevent unwanted product creation

:::warning Product Import Requirements
Product import profile must be configured and functional. Missing products trigger PlentyONE API calls to fetch product data, then create products via the item import service.
:::

#### Enable Backorders for Out-of-Stock Items

**Field**: `is_active_backorder`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Allow order creation even when items are out of stock in Magento. Sets products to allow backorders during order import.

**When to Enable**:
- ✅ Fulfillment managed in PlentyONE (inventory sync handled separately)
- ✅ Marketplace orders already paid and confirmed
- ✅ Virtual/downloadable products

**When to Disable**:
- ❌ Strict inventory control in Magento
- ❌ Prevent overselling
- ❌ Inventory managed in Magento

---

#### Order Automation

Automatically manage order states based on PlentyONE status changes.

##### Allow Order Cancellation

**Field**: `is_active_cancel_order`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable automatic cancellation of Magento orders when cancelled in PlentyONE.

**When to Enable**:
- ✅ Sync cancellations from marketplaces
- ✅ Maintain accurate order states across systems
- ✅ Automated refund workflows

##### Allowed Status for Order Cancellation

**Field**: `cancel_order_status`
**Type**: Multiselect (Required when enabled)
**Scope**: Global

Select which PlentyONE order statuses should trigger automatic order cancellation in Magento.

**Common Cancellation Statuses**:
- **Status 8** - Cancelled
- **Status 8.1** - Cancelled by customer
- **Status 8.2** - Cancelled by seller

**Example**:
```
Allowed Status: [8, 8.1, 8.2]
Result: Any order with these statuses in PlentyONE will be cancelled in Magento
```

##### Allow Order Holding

**Field**: `is_active_hold_order`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable automatic holding of Magento orders based on PlentyONE status. Held orders are flagged for review and cannot be invoiced/shipped until released.

**Use Cases**:
- ✅ Payment verification pending
- ✅ Fraud review
- ✅ Customer service intervention required

##### Allowed Status for Order Holding

**Field**: `hold_order_status`
**Type**: Multiselect (Required when enabled)
**Scope**: Global

Select which PlentyONE order statuses should trigger automatic order holding in Magento.

##### Allow Order Unholding

**Field**: `is_active_unhold_order`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable automatic release of held Magento orders when PlentyONE status changes.

##### Allowed Status for Order Un-holding

**Field**: `unhold_order_status`
**Type**: Multiselect (Required when enabled)
**Scope**: Global

Select which PlentyONE order statuses should trigger automatic release from hold in Magento.

:::tip Automation Workflow Example
1. Order imports with PlentyONE status 3 (Waiting payment) → **Held** in Magento
2. Payment confirmed, status changes to 4 (In preparation) → **Unheld** in Magento
3. Order cancelled, status changes to 8 (Cancelled) → **Cancelled** in Magento
:::

---

### 6. Customer Configuration

Configure customer account creation and field mapping.

#### Enable Customer Import

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable automatic creation of customer accounts from PlentyONE order contact data.

**When to Enable**:
- ✅ Build customer database from marketplace orders
- ✅ Enable customer accounts for repeat purchases
- ✅ Customer relationship management

**When to Disable**:
- ❌ All orders should remain as guest orders
- ❌ Manual customer account creation only

#### Create Account for Guest

**Field**: `create_account_for_guest`
**Type**: Checkbox
**Default**: Enabled
**Scope**: Global

Create customer accounts even for orders that don't have an existing PlentyONE contact. Creates accounts using order email and address data.

**Behavior**:
- **Enabled**: All orders get customer accounts (contacts created from order addresses)
- **Disabled**: Only orders with PlentyONE contacts get Magento customer accounts

**Recommended**: Enable for comprehensive customer database.

#### Create Address

**Field**: `create_address`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Save billing and shipping addresses to customer's address book in Magento.

**When to Enable**:
- ✅ Pre-populate customer address book
- ✅ Faster checkout for repeat customers
- ✅ Address management in customer account

**When to Disable**:
- ❌ Privacy concerns (minimize stored personal data)
- ❌ One-time marketplace orders

#### Default Customer Group

**Field**: `default_group`
**Type**: Select
**Scope**: Global

Default customer group for newly created customers when no specific mapping applies.

**Common Groups**:
- **General** - Default Magento customer group
- **Wholesale** - B2B customers
- **Marketplace** - Custom group for marketplace orders
- **VIP** - Special pricing tier

---

#### Advanced Customer Mappings

##### Customer Group Mapping

**Field**: `group_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map PlentyONE customer classes to Magento customer groups for automatic group assignment.

**Row Fields**:
- **Magento Group** - Magento customer group
- **PlentyONE Group** - PlentyONE customer class ID

**Example Configuration**:

| Magento Group | PlentyONE Class |
|---------------|-----------------|
| Wholesale | B2B Class |
| Retail | Standard Class |
| VIP | Premium Class |

**How It Works**:
1. Order contact has customer class in PlentyONE
2. System looks up matching group mapping
3. Customer created/updated with mapped Magento group
4. Falls back to default group if no mapping found

##### Address Field Mapping

**Field**: `address_field_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map PlentyONE address fields to Magento address fields. PlentyONE uses flexible name fields (name1-name4) that can be customized per client.

**Row Fields**:
- **Magento Address Field** - Magento field (firstname, lastname, company)
- **Client Address Field** - PlentyONE field (name1, name2, name3, name4)

**Default Mapping**:

| Magento Field | PlentyONE Field |
|---------------|-----------------|
| company | name1 |
| firstname | name2 |
| lastname | name3 |

**Custom Mapping Example** (German B2B):

| Magento Field | PlentyONE Field |
|---------------|-----------------|
| company | name1 |
| firstname | name3 |
| lastname | name4 |

**When to Configure**:
- ✅ PlentyONE address format differs from Magento defaults
- ✅ Country-specific name formatting (e.g., Germany, Japan)
- ✅ B2B vs B2C different field usage

:::tip Address Format Considerations
Address field mapping is critical for correct name display in orders, invoices, and shipping labels. Verify mapping matches your PlentyONE configuration.
:::

##### Gender Mapping

**Field**: `gender_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map customer name prefixes to gender values for proper customer data structure.

**Row Fields**:
- **Magento Prefix** - Customer name prefix (Mr., Mrs., Ms., Dr.)
- **PlentyONE Gender** - Gender value from PlentyONE contact

**Example Configuration**:

| Magento Prefix | PlentyONE Gender |
|----------------|------------------|
| Mr. | male |
| Mrs. | female |
| Ms. | female |
| Dr. | - |

**Use Cases**:
- ✅ Personalized email communications
- ✅ Proper salutation in invoices
- ✅ Marketing segmentation

---

### 7. Payment Configuration

Map payment methods between PlentyONE and Magento.

#### Payment Method Mapping

**Field**: `payment_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map PlentyONE payment methods to Magento payment methods. Essential for order creation as every order requires a valid payment method.

**Row Fields**:
- **Magento Payment** - Magento payment method code
- **PlentyONE Payment** - PlentyONE method of payment (MOP) ID

**Example Configuration**:

| Magento Payment | PlentyONE Payment | Description |
|-----------------|-------------------|-------------|
| plentyone | PayPal | Paid via PayPal in marketplace |
| plentyone | Credit Card | Credit card payment |
| plentyone | Amazon Pay | Amazon Pay |
| cashondelivery | Cash on Delivery | COD orders |
| plentyone | Invoice | Invoice payment |

**PlentyONE Payment Method** (`plentyone`):
- Internal payment method for orders paid outside Magento
- Represents any payment processed in PlentyONE or marketplace
- Must be enabled in Magento: **Stores → Configuration → Sales → Payment Methods → PlentyONE Payment**
- See [Payment Method Configuration](/docs/configuration/payment-configuration) for setup

**Recommended Mapping**:
```
All PlentyONE payment methods → "plentyone"

Reason: Payment already processed in marketplace/PlentyONE
```

**Exception Cases**:
- Map COD to `cashondelivery` if using Magento COD module
- Map invoice to `checkmo` for accounting integration
- Custom mappings for ERP integrations

#### Payment Method Code Fallback

**Field**: `payment_method_fallback`
**Type**: Input
**Default**: plentyone
**Scope**: Global

Fallback payment method code when PlentyONE payment method doesn't match any mapping.

**Use Cases**:
- ✅ Prevents order import failure due to unmapped payment methods
- ✅ Handles new payment methods added to PlentyONE
- ✅ Graceful degradation for edge cases

**Recommended**: Set to `plentyone` for marketplace orders.

:::warning Payment Method Requirement
The fallback payment method must be enabled in Magento. Orders will fail if the payment method doesn't exist or is disabled.
:::

---

### 8. Credit Memo Configuration

Configure automatic credit memo (refund) creation from PlentyONE credit note orders.

#### Enable Credit Memo Import

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable automatic creation of credit memos from PlentyONE credit note orders (Type 4).

**What Gets Imported**:
- **Credit Note Orders** (Type ID 4) — Separate orders in PlentyONE linked to the original sales order via parent ID
- **Full Refunds** — Items refunded at original price, with stock return (based on Magento inventory config)
- **Partial Amount Refunds** — Items refunded at a reduced price (e.g., goodwill refund where customer keeps the product). Uses Magento's adjustment mechanism to calculate the correct refund total
- **Shipping Refunds** — Shipping costs included in the credit note are refunded automatically

:::info Credit Note Order Type Required
Credit memos are **only** created for PlentyONE Credit Note orders (Type 4). In PlentyONE, credit note documents can only be generated within credit note orders — they cannot be created on regular sales orders. This means the order must be of type "Credit Note" for a credit memo to be generated in Magento.
:::

**When to Enable**:
- ✅ Process returns and refunds in PlentyONE
- ✅ Sync refund status to Magento
- ✅ Maintain accurate financial records

---

#### Credit Memo Conditions

Optionally filter which credit note orders trigger credit memo creation. These conditions act as **additional filters** on top of the credit note order type requirement.

If no conditions are enabled, **all** credit note orders will create credit memos. If one or more conditions are enabled, at least one must match.

##### Use Order Status Condition

**Field**: `is_active_order_status_condition`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Only create credit memos for credit note orders matching specific PlentyONE order statuses.

##### Allowed Order Status for Credit Memo Creation

**Field**: `order_status_conditional_rule`
**Type**: Multiselect (Required when enabled)
**Scope**: Global

Select which PlentyONE order statuses allow credit memo creation.

**Common Refund Statuses**:
- **Status 9** - Return
- **Status 9.1** - Return in progress
- **Status 9.2** - Return completed

**Example**:
```
Enable Status Condition: Yes
Allowed Statuses: [9, 9.1, 9.2]
Result: Credit memos only created for credit note orders in return statuses
```

##### Use Credit Note Document Presence Condition

**Field**: `is_active_document_condition`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Only create credit memos if a credit note document exists in the PlentyONE credit note order.

**When to Enable**:
- ✅ Only refund when official credit note document has been generated
- ✅ Compliance and audit requirements

**Behavior**:
- Checks for document type "Credit Note" in PlentyONE order documents
- Creates credit memo only if document exists
- Skips credit note orders without the document

#### Condition Logic

**How Conditions Combine**:
- The order **must** be a Credit Note type (Type 4) — this is always required
- If **no** conditions are enabled: all credit note orders create credit memos
- If **one or more** conditions are enabled: at least one must match (OR logic between conditions)

**Example Scenarios**:

| Scenario | Order Type | Status Condition | Document Condition | Result |
|----------|-----------|-----------------|-------------------|--------|
| No conditions configured | Credit Note ✓ | Disabled | Disabled | ✅ Credit memo created |
| Status matches | Credit Note ✓ | Enabled, matches ✓ | Disabled | ✅ Credit memo created |
| Document exists | Credit Note ✓ | Disabled | Enabled, exists ✓ | ✅ Credit memo created |
| Neither matches | Credit Note ✓ | Enabled, no match ✗ | Enabled, missing ✗ | ❌ Skipped |
| Not a credit note | Sales Order ✗ | Any | Any | ❌ Skipped |

#### Refund Capture Case

**Field**: `refund_capture_case`
**Type**: Select (Required when enabled)
**Scope**: Global

Determine how refunds are processed when creating credit memos.

**Options**:

| Capture Case | Behavior | Use Case |
|--------------|----------|----------|
| **Online** | Process refund through payment gateway | ✅ Automatic refunds to customer payment method |
| **Offline** | Create credit memo without gateway refund | ✅ Manual refunds, cash refunds, store credit |

**Online Refund**:
- Attempts to refund via original payment method
- Requires payment gateway support for refunds
- Fails if gateway doesn't support refunds

**Offline Refund**:
- Creates credit memo in Magento
- Does NOT process actual refund
- Use when refund handled externally (PlentyONE, manual process)

**Recommended for Marketplace Orders**: Offline (refunds already processed by marketplace)

:::warning Stock Return
Credit memos can optionally return items to stock. Configure inventory behavior in **Stores → Configuration → Catalog → Inventory → Product Stock Options → Automatically Return Credit Memo Item to Stock**.
:::

---

### 9. Invoice Configuration

Configure automatic invoice creation from PlentyONE invoice documents and payment data.

#### Enable Invoice Import

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable automatic creation of invoices from PlentyONE invoice documents and payment confirmations.

**When to Enable**:
- ✅ Orders already paid in marketplace
- ✅ Payment confirmed in PlentyONE
- ✅ Automated invoicing workflow
- ✅ Financial record synchronization

**What Gets Created**:
- Magento invoices for imported orders
- Invoice line items matching order items
- Payment transaction records
- Invoice PDFs (if configured)

---

#### Invoice Conditional Rules

The invoice creation process supports multiple conditional rules that can be combined to control when invoices are automatically created.

##### Use Order Status Condition

**Field**: `is_active_order_status_condition`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Create invoices only for specific PlentyONE order statuses.

##### Allowed Order Status for Invoice Creation

**Field**: `order_status_conditional_rule`
**Type**: Multiselect (Required when enabled)
**Scope**: Global

Select which PlentyONE order statuses allow invoice creation.

**Common Invoice Statuses**:
- **Status 4** - In preparation for shipping
- **Status 5** - Cleared for shipping
- **Status 7** - Shipped

**Example**:
```
Enable Status Condition: Yes
Allowed Statuses: [4, 5]
Result: Only creates invoices for orders in status 4 or 5
```

**Strategy**:
- ✅ Include paid/approved statuses (4, 5)
- ✅ Include shipped status (7) for post-shipment invoicing
- ❌ Exclude pending payment (3)
- ❌ Exclude cancelled (8)

##### Use Payment Status Condition

**Field**: `is_active_payment_status_condition`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Create invoices only when payment status matches configured values.

##### Allowed Payment Status for Invoice Creation

**Field**: `payment_status_conditional_rule`
**Type**: Multiselect (Required when enabled)
**Scope**: Global

Select which PlentyONE payment statuses allow invoice creation.

**Common Payment Statuses**:
- **Fully Paid**
- **Partially Paid**
- **Overpaid**
- **Prepayment Received**

**Example**:
```
Enable Payment Condition: Yes
Payment Statuses: [Fully Paid, Partially Paid]
Result: Only creates invoices when payment received
```

##### Allow Invoice Creation for Payments with Zero Totals

**Field**: `is_active_payment_zero_totals_condition`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Create invoices even when order payment amount is zero (e.g., fully discounted orders, promotional orders, replacements).

**When to Enable**:
- ✅ Process $0 orders (fully discounted)
- ✅ Replacement orders
- ✅ Warranty replacements
- ✅ Sample orders

##### Use Payment Method Condition

**Field**: `is_active_payment_method_condition`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable conditional invoice creation based on payment method exclusions.

##### Excluded Payment Methods for Invoice Creation

**Field**: `excluded_payment_methods`
**Type**: Multiselect
**Scope**: Global

Select payment methods that should NOT automatically create invoices. Acts as a blocking filter - selected payment methods will NEVER create invoices automatically.

**How It Works**:
- Acts as a **blocking filter** - prevents invoice creation for excluded methods
- Applies BEFORE other conditions are checked
- Selected payment methods will NEVER create invoices automatically
- Other payment methods proceed to additional condition checks

**Common Exclusions**:

| Payment Method | Why Exclude | Workflow |
|---------------|-------------|----------|
| Cash on Delivery | Payment not yet received | Manual invoice after delivery confirmation |
| Check/Money Order | Requires payment verification | Manual invoice after check clears |
| Bank Transfer (pending) | Payment confirmation needed | Manual invoice after bank confirmation |
| Purchase Order | Requires approval | Manual invoice after PO approval |
| Invoice Payment | Credit terms apply | Manual invoice per payment schedule |

**Example Configuration**:
```
Enable Payment Method Condition: Yes
Excluded Payment Methods: [Cash on Delivery, Check/Money Order]

Result:
- Orders with PayPal → invoices created (if other conditions pass)
- Orders with Cash on Delivery → invoices NOT created (blocked)
- Orders with Check/Money Order → invoices NOT created (blocked)
```

**Processing Logic**:
1. Check if payment method condition is enabled
2. If enabled and payment method is excluded → **block invoice creation**
3. If payment method passes (or condition disabled) → check other conditions (order status, payment status, document presence)

:::tip Best Practice
Use payment method exclusion for methods requiring manual verification. This ensures invoices are only created when payment is guaranteed, preventing premature invoicing for unpaid orders.
:::

##### Use Invoice Document Presence Condition

**Field**: `is_active_document_condition`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Create invoices only when invoice document exists in PlentyONE.

**When to Enable**:
- ✅ Only invoice when PlentyONE has generated invoice document
- ✅ Synchronize invoice creation with PlentyONE workflow
- ✅ Compliance requirements (invoice must exist in source system)

**Behavior**:
- Checks for document type "Invoice" in PlentyONE order documents
- Creates Magento invoice only if PlentyONE invoice document exists
- Skips orders without invoice document

---

#### Invoice Condition Logic

**How Conditions Combine**:
- Conditions are evaluated in order: Payment Method (blocking) → Order Status → Payment Status → Zero Totals → Document Presence
- **Payment Method Condition**: If enabled and payment method excluded → invoice creation **blocked**, other conditions ignored
- **Other Conditions**: At least ONE enabled condition must pass for invoice to be created
- **All Conditions Disabled**: Invoice created for all orders (if invoice import enabled)

**Example Scenarios**:

**Scenario 1: Payment Method Blocking**
```
Payment Method Condition: Enabled
Excluded Methods: [Cash on Delivery]
Order Payment Method: Cash on Delivery

Result: Invoice NOT created (blocked by payment method exclusion)
```

**Scenario 2: Multiple Conditions (OR Logic)**
```
Payment Method Condition: Disabled
Order Status Condition: Enabled, Statuses [4, 5]
Payment Status Condition: Enabled, Statuses [Fully Paid]
Order Status: 3
Payment Status: Fully Paid

Result: Invoice created (payment status condition passed)
```

**Scenario 3: All Conditions Must Pass**
```
Payment Method Condition: Disabled
Order Status Condition: Enabled, Statuses [4, 5]
Payment Status Condition: Enabled, Statuses [Fully Paid]
Document Condition: Enabled
Order Status: 5 ✓
Payment Status: Fully Paid ✓
Invoice Document: Not Found ✗

Result: Invoice NOT created (document condition failed)
```

:::warning Troubleshooting Invoices Not Created
If invoices aren't being created:
1. Check Payment Method Condition first - excluded methods block all invoice creation
2. Verify at least ONE enabled condition passes (status, payment, document)
3. Confirm order meets ALL enabled condition requirements
4. Review order processing logs for condition evaluation results
:::

---

### 10. Shipping Configuration

Configure automatic shipment creation from PlentyONE delivery orders and tracking data.

#### Enable Shipment Import

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable automatic creation of Magento shipments from PlentyONE delivery orders and shipping documents.

**When to Enable**:
- ✅ Orders shipped from PlentyONE/fulfillment center
- ✅ Import tracking information to Magento
- ✅ Automated fulfillment workflow
- ✅ Sync shipment status to customers

**What Gets Created**:
- Magento shipments with line items
- Tracking numbers and carrier information
- Shipment emails to customers (if enabled)
- Shipment history and comments

---

#### Shipment Conditional Rules

##### Use Order Status Condition

**Field**: `is_active_order_status_condition`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Shipments only created if PlentyONE order status matches selected statuses.

##### Allowed Order Status for Shipment Creation

**Field**: `order_status_conditional_rule`
**Type**: Multiselect (Required when enabled)
**Scope**: Global

Select which PlentyONE order statuses allow shipment creation.

**Common Shipment Statuses**:
- **Status 6** - Currently being shipped
- **Status 7** - Shipped
- **Status 7.1** - Exported to shipping provider

**Example**:
```
Enable Status Condition: Yes
Allowed Statuses: [7]
Result: Only creates shipments for fully shipped orders
```

##### Use Delivery Note Presence Condition

**Field**: `is_active_document_condition`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Only create shipments if delivery note document exists in PlentyONE.

**When to Enable**:
- ✅ Ensure delivery documentation exists
- ✅ Compliance with shipping regulations
- ✅ Sync with warehouse documentation workflow

##### Use Tracking Presence Condition

**Field**: `is_active_tracking_condition`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Only create shipments if tracking numbers are present in PlentyONE.

**When to Enable**:
- ✅ Ensure customers receive tracking information
- ✅ Skip shipments without tracking
- ✅ Mandatory tracking for customer service

**When to Disable**:
- ❌ Not all shipments have tracking (local delivery, pickup)
- ❌ Tracking added later

---

#### Shipment Options

##### Enable Transactional Email

**Field**: `is_active_transactional_email`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Send shipment confirmation emails to customers when shipments are created.

**Email Contents**:
- Shipment confirmation
- Tracking numbers and carrier information
- Links to track shipment
- Shipped items list

**When to Enable**:
- ✅ Customer expects Magento shipment notifications
- ✅ Tracking information needs to be sent
- ✅ Magento is customer-facing system

**When to Disable**:
- ❌ Marketplace handles shipment notifications
- ❌ Prevent duplicate emails (PlentyONE already sends)
- ❌ Magento used only for backend/admin

##### Enable Back-shipment

**Field**: `is_active_backorder`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Allow shipment creation for out-of-stock items (items already shipped but inventory not reflected in Magento).

**When to Enable**:
- ✅ Inventory managed in PlentyONE (Magento stock may be outdated)
- ✅ Dropshipping scenarios
- ✅ Virtual/service products

**When to Disable**:
- ❌ Strict inventory control in Magento
- ❌ Prevent shipment of out-of-stock items

##### Import Tracking Numbers

**Field**: `is_active_tracking_number`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Import tracking numbers from PlentyONE into Magento shipments.

**When to Enable**:
- ✅ Display tracking to customers in Magento
- ✅ Customer account shows tracking history
- ✅ Customer service needs tracking access

**Tracking Data Imported**:
- Tracking numbers
- Carrier codes
- Tracking URLs
- Shipping dates

##### Use Shipping Profile Title for Tracking Information

**Field**: `use_profile_title_for_track_info`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Use PlentyONE shipping profile name as carrier title in tracking information instead of Magento carrier name.

**When to Enable**:
- ✅ Display actual carrier from PlentyONE (e.g., "DHL Express")
- ✅ PlentyONE has more accurate carrier information
- ✅ Multiple shipping services per Magento carrier

**When to Disable**:
- ❌ Use Magento carrier mapping for consistency
- ❌ Carrier names standardized in Magento

##### Default Shipping Profile

**Field**: `default_shipping_profile`
**Type**: Select (Required when enabled)
**Scope**: Global

Fallback shipping profile when no specific mapping is found between PlentyONE shipping provider and Magento shipping method.

**Recommended**: Set to most common shipping method (e.g., "Flat Rate" or "Table Rates")

---

#### Shipping Method Mapping

**Field**: `shipping_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map PlentyONE shipping profiles to Magento shipping methods.

**Row Fields**:
- **Magento Shipping Method** - Magento method code (carrier_method)
- **PlentyONE Shipping Profile** - PlentyONE shipping profile ID

**Example Configuration**:

| Magento Shipping Method | PlentyONE Shipping Profile | Carrier |
|------------------------|---------------------------|---------|
| flatrate_flatrate | DHL Standard | Flat Rate |
| tablerate_bestway | DHL Express | Table Rates |
| freeshipping_freeshipping | Amazon Logistics | Free Shipping |
| ups_03 | UPS Ground | UPS |

**Shipping Method Code Format**: `carrier_code`_`method_code`

**How to Find Codes**:
1. **Admin Panel** → **Stores** → **Configuration** → **Sales** → **Shipping Methods**
2. Each enabled carrier has method codes
3. Common carriers: `flatrate`, `tablerate`, `freeshipping`, `ups`, `usps`, `fedex`, `dhl`

**Mapping Strategy**:
- ✅ Map specific PlentyONE profiles to matching Magento carriers when possible
- ✅ Use generic methods (flatrate, tablerate) for unmapped profiles
- ✅ Configure default shipping profile as fallback

:::tip Carrier Title Display
The carrier title displayed to customers comes from the Magento shipping method unless "Use Shipping Profile Title" is enabled, which shows the PlentyONE shipping profile name.
:::

---

### 11. Attribute Configuration

Map custom attributes between PlentyONE and Magento for order data synchronization.

#### Attribute Mapping

**Field**: `attribute_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Define custom attribute mappings between PlentyONE order properties and Magento order attributes.

**Row Fields**:
- **Magento Attribute** - Magento order attribute code (from dropdown)
- **Magento Custom** - Custom attribute code (manual entry)
- **PlentyONE Attribute** - PlentyONE order property type ID

**Use Cases**:
- ✅ Sync custom order properties (gift messages, special instructions)
- ✅ Map marketplace-specific data (Amazon order ID, eBay item ID)
- ✅ Transfer custom order metadata

**Example Configuration**:

| Magento Attribute | PlentyONE Attribute | Purpose |
|-------------------|---------------------|---------|
| amazon_order_id | External Order ID | Store Amazon order number |
| gift_message | Gift Message Property | Sync gift message text |
| delivery_instructions | Delivery Notes | Special delivery instructions |

**How It Works**:
1. PlentyONE order contains property with specific type ID
2. System looks up attribute mapping
3. Property value is assigned to Magento order attribute
4. Attribute visible in order details

**Requirements**:
- Magento custom attributes must exist before mapping
- Create attributes at **Stores** → **Attributes** → **Order**
- PlentyONE property type IDs from "Collect Configuration Data"

---

### 12. Log Configuration

Configure debugging and request/response logging for troubleshooting.

#### Log Request Data to File

**Field**: `is_active_request_log`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable logging of request data to file for debugging purposes.

**What Gets Logged**:
- Quote data structures
- Order creation requests
- Invoice/shipment generation requests
- API calls to PlentyONE

**Log Location**: `var/log/plenty_order.log`

**When to Enable**:
- ✅ Troubleshooting order import issues
- ✅ Debugging data transformation
- ✅ Investigating failed imports
- ✅ Development and testing

**When to Disable**:
- ❌ Production environments (performance impact)
- ❌ Large import volumes (disk space usage)
- ❌ Privacy/compliance concerns (logs contain customer data)

#### Log Response Data to File

**Field**: `is_active_response_log`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable logging of response data to file for debugging purposes.

**What Gets Logged**:
- Magento entity IDs created (order, invoice, shipment IDs)
- Success/failure status
- Error messages and stack traces
- Processing results

**Log Location**: `var/log/plenty_order.log`

**Recommended**:
- Enable both request and response logging for comprehensive debugging
- Disable in production unless actively troubleshooting
- Rotate logs regularly to manage disk space

:::warning Log File Size
Logging can generate large files quickly with high import volumes. Monitor `var/log/plenty_order.log` size and implement log rotation policies.
:::

---

## CLI Commands

Execute order import operations manually via command line.

```bash
# Import orders using profile
bin/magento plenty:order:import --profile-id=7

# Import specific order by PlentyONE ID
bin/magento plenty:order:import --profile-id=7 --order-id=12345

# Import orders by date range
bin/magento plenty:order:import --profile-id=7 --from-date="2024-01-01" --to-date="2024-01-31"

# Import orders with specific PlentyONE status
bin/magento plenty:order:import --profile-id=7 --status=5

# Force re-import (update existing orders)
bin/magento plenty:order:import --profile-id=7 --force

# Collect orders from PlentyONE API (Stage 1)
bin/magento plenty:order:collect --profile-id=7

# Collect specific orders
bin/magento plenty:order:collect --profile-id=7 --id=12345,67890

# Collect orders by date range
bin/magento plenty:order:collect --profile-id=7 --date-created="2024-01-01/2024-01-31"
```

**Command Options**:

| Option | Short | Description |
|--------|-------|-------------|
| `--profile-id` | `-p` | Order import profile ID (required) |
| `--order-id` | `-o` | Specific PlentyONE order ID(s) |
| `--from-date` | `-f` | Start date for order filter |
| `--to-date` | `-t` | End date for order filter |
| `--status` | `-s` | PlentyONE order status filter |
| `--force` | | Force re-import of existing orders |

**Two-Stage Import Process**:
1. **Collect**: Fetch orders from PlentyONE API → `plenty_order` table
2. **Import**: Read from `plenty_order` table → Create Magento orders

**Automated Workflow** (Cron):
```
1. Order Collection Cron → Fetch new/updated orders from PlentyONE
2. Order Import Cron → Process pending orders from collection table
3. Incomplete Detection Cron → Scan and re-import incomplete orders
```

---

## Troubleshooting

### Orders Not Importing

**Symptoms**:
- Orders collected but not creating in Magento
- Import profile runs but no orders processed
- Zero orders in execution history

**Solutions**:

1. **Check "Create New Order" Setting**
   - Navigate to Actions Configuration
   - Verify "Create New Order" is enabled
   - This must be enabled for order creation

2. **Verify Order Status Matches Import Criteria**
   - Check HTTP API Configuration → Order Search Criteria
   - Confirm order status is in selected list
   - PlentyONE order must match configured statuses

3. **Check Product Availability**
   - Enable "Create New Product" in Actions Configuration
   - Verify product import profile is configured
   - Check `plenty_item_variation` table for SKU mapping

4. **Review Store Mapping**
   - Store Configuration → Store Mapping must be configured
   - Order client ID and locale must match mapping
   - If "Enable Store Filter" is on, unmapped orders are skipped

5. **Verify Customer/Guest Configuration**
   - Customer Configuration → "Create Account for Guest" should be enabled
   - Or ensure PlentyONE contacts exist for all orders

6. **Check Logs**
   - Review `var/log/plenty_order.log` (if logging enabled)
   - Check `var/log/system.log` for errors
   - Enable request/response logging for detailed troubleshooting

### Order Import with Wrong Status

**Symptoms**:
- Orders importing but incorrect Magento status
- Orders not progressing to expected state
- Status doesn't match PlentyONE status

**Solutions**:

1. **Review Order Status Mapping**
   - No explicit status mapping in import (unlike export)
   - Orders import with default status from quote submission
   - Status updated by invoice/shipment creation

2. **Check Invoice/Shipment Configuration**
   - Invoice Configuration → Verify conditions
   - Shipment Configuration → Verify conditions
   - Documents may not be creating due to condition failures

3. **Enable Order Automation**
   - Actions Configuration → Order Automation
   - Configure cancel/hold/unhold statuses
   - Automate status changes based on PlentyONE

### Customer Not Created

**Symptoms**:
- Orders importing as guest only
- No customer accounts created
- Customer data missing

**Solutions**:

1. **Enable Customer Import**
   - Customer Configuration → "Enable Customer Import"
   - Must be checked for customer account creation

2. **Enable Guest Account Creation**
   - Customer Configuration → "Create Account for Guest"
   - Allows accounts even without PlentyONE contact

3. **Check Email Uniqueness**
   - Customer with same email may already exist
   - System uses existing customer instead of creating new
   - Review customer database for email duplicates

4. **Verify Customer Group Configuration**
   - Default Customer Group must be set
   - Customer group must exist and be valid

### Products Missing in Order

**Symptoms**:
- Order import fails with "product not found"
- Items missing from imported orders
- SKU mismatch errors

**Solutions**:

1. **Enable "Create New Product"**
   - Actions Configuration → "Create New Product"
   - Allows automatic product import during order import

2. **Pre-Import Products**
   - Run product import profile before order import
   - Ensures all SKUs exist in Magento
   - Recommended for initial setup

3. **Check SKU Mapping**
   - Verify `plenty_item_variation` table
   - SKU must match between PlentyONE and Magento
   - Run variation collection if mapping missing

4. **Verify Product Import Profile**
   - Product import profile must be configured
   - Auto-import fetches products from PlentyONE API
   - Check product import configuration

### Invoice Not Created

**Symptoms**:
- Orders importing without invoices
- Invoice conditions not triggering
- Expected invoices missing

**Solutions**:

1. **Enable Invoice Import**
   - Invoice Configuration → "Enable Invoice Import"
   - Must be checked

2. **Check Order Status Condition**
   - If enabled, verify PlentyONE order status is in allowed list
   - Order status must match configured statuses

3. **Check Payment Status Condition**
   - If enabled, ensure payment status matches configured values
   - Review PlentyONE payment status for order

4. **Check Payment Method Condition**
   - If enabled, verify payment method is NOT in excluded list
   - Excluded payment methods block invoice creation completely

5. **Check Document Condition**
   - If enabled, ensure invoice document exists in PlentyONE
   - Run "Collect Configuration Data" to refresh documents

6. **Review Condition Logic**
   - Payment method exclusion blocks all invoices for that method
   - Other conditions use OR logic - at least ONE must pass
   - All enabled conditions are evaluated

7. **Verify Order State**
   - Order must be in "can invoice" state
   - Already invoiced orders cannot be invoiced again

### Shipment Not Created

**Symptoms**:
- Orders importing without shipments
- Shipment conditions not triggering
- Tracking numbers missing

**Solutions**:

1. **Enable Shipment Import**
   - Shipping Configuration → "Enable Shipment Import"
   - Must be checked

2. **Check Order Status Condition**
   - If enabled, verify PlentyONE order status matches
   - Common: Status 7 (Shipped)

3. **Check Document Condition**
   - If enabled, delivery note must exist in PlentyONE
   - Verify documents in PlentyONE order

4. **Check Tracking Condition**
   - If enabled, tracking numbers must be present
   - Disable if shipments lack tracking

5. **Verify Shipping Method Mapping**
   - Shipping Configuration → Shipping Method Mapping
   - PlentyONE shipping profile must map to Magento method
   - Configure default shipping profile as fallback

6. **Check Order State**
   - Order must be in "can ship" state
   - Already shipped orders cannot be shipped again
   - Invoice may be required first (depends on order workflow)

### Credit Memo Not Created

**Symptoms**:
- Returns/refunds not creating credit memos
- Credit note orders not processing
- Expected refunds missing

**Solutions**:

1. **Verify Order Type is Credit Note (Type 4)**
   - Credit memos are only created for PlentyONE Credit Note orders
   - Regular sales orders will not trigger credit memo creation regardless of conditions
   - In PlentyONE, create a credit note order linked to the original sales order

2. **Enable Credit Memo Import**
   - Creditmemo Configuration → "Enable Credit Memo Import"
   - Must be checked

3. **Check Condition Filters**
   - If no conditions are enabled, all credit note orders are processed
   - If conditions are enabled, at least one must match:
     - **Order Status Condition**: verify PlentyONE order status is in allowed list
     - **Document Condition**: verify credit note document exists in PlentyONE order

4. **Verify Order State**
   - Order must be invoiced before credit memo can be created
   - Cannot refund more than invoiced amount

5. **Check Refund Capture Case**
   - Online refunds may fail if payment gateway doesn't support refunds
   - Use Offline for manually processed refunds

### Memory Issues

**Symptoms**:
- PHP memory exhausted errors
- Import timeouts
- Process crashes during large imports

**Solutions**:

1. **Reduce Batch Size**
   - Schedule Configuration → Process Batch Size
   - Lower to 25-50 for memory-constrained environments

2. **Increase PHP Memory Limit**
   - Update `php.ini`: `memory_limit = 2G`
   - Or use `.htaccess`: `php_value memory_limit 2G`
   - Recommended: 2GB minimum for order import

3. **Reduce API Collection Size**
   - HTTP API Configuration → API Collection Size
   - Lower to 50 or less
   - Reduces per-request memory usage

4. **Disable Logging**
   - Log Configuration → Disable request/response logging
   - Logging consumes additional memory

5. **Run Imports Off-Peak**
   - Schedule during low-traffic periods
   - Reduces competition for system resources

### Incomplete Order Detection Issues

**Symptoms**:
- Incomplete orders not detected
- Detection running but no results
- False positives detected

**Solutions**:

1. **Verify Age Range**
   - Minimum Age: Must be > 0 days
   - Maximum Age: Must be > Minimum Age
   - Orders outside range are not checked

2. **Check Detection Strategies**
   - At least one strategy must be enabled
   - Strategies must match your workflow (e.g., don't check for invoices if not using invoice import)

3. **Review Excluded Statuses**
   - Completed, cancelled, closed orders are excluded by default
   - Adjust if checking specific order states

4. **Monitor Batch Limit**
   - Increase if many incomplete orders detected
   - System processes up to batch limit per cron run

---

## Best Practices

### Initial Setup

1. **Configure Client First**
   - Client Configuration → Select PlentyONE client
   - Click "Collect Configuration Data"
   - Populates all dropdown options

2. **Import Products Before Orders**
   - Run product import profile
   - Ensures all SKUs exist in Magento
   - Prevents "product not found" errors

3. **Configure Store Mapping**
   - Store Configuration → Store Mapping
   - Map all client/locale combinations
   - Critical for multi-store setups

4. **Set Up Payment Method**
   - Enable PlentyONE payment method in Magento
   - Payment Configuration → Map PlentyONE methods to "plentyone"
   - See [Payment Method Configuration](/docs/configuration/payment-configuration)

5. **Configure Shipping Methods**
   - Shipping Configuration → Shipping Method Mapping
   - Map all PlentyONE shipping profiles
   - Set default shipping profile fallback

6. **Test with One Order**
   - Use CLI to import single order: `--order-id=12345`
   - Verify all data imports correctly
   - Check invoice, shipment, customer creation

### Ongoing Operations

1. **Frequent Imports**
   - Schedule every 15-30 minutes for near real-time sync
   - Schedule Configuration → Select appropriate cron

2. **Status Filtering**
   - HTTP API Configuration → Order Search Criteria
   - Only import relevant statuses (3-7)
   - Exclude archived/completed orders

3. **Monitor Execution History**
   - Review profile execution history regularly
   - Admin Panel → PlentyONE → Profiles → [Profile] → History
   - Check success rates and error messages

4. **Enable Incomplete Detection**
   - Schedule Configuration → Incomplete Order Detection
   - Set appropriate age ranges (2-30 days recommended)
   - Enable all detection strategies
   - Monitor for stuck/missing documents

5. **Maintain Clean Logs**
   - Disable request/response logging in production
   - Enable only when actively troubleshooting
   - Implement log rotation for `var/log/plenty_order.log`

### Marketplace Integration

1. **Separate Profiles Per Marketplace**
   - Create individual import profiles per marketplace
   - HTTP API Configuration → Order Referrer Filter
   - Better error isolation and monitoring

2. **Assign to Customer Groups**
   - Customer Configuration → Customer Group Mapping
   - Separate marketplace customers for reporting/pricing

3. **Payment Mapping**
   - Payment Configuration → Map all marketplace payments to "plentyone"
   - Payment already processed in marketplace

4. **Order Prefix/Numbering**
   - Use Magento order number format configuration
   - Add marketplace prefix for easy identification
   - Example: AMZ-100001234, EBAY-100001235

### Performance Optimization

1. **Optimize Batch Sizes**
   - Process Batch Size: 50-100 (standard)
   - API Collection Size: 50-100 (standard)
   - Adjust based on server capacity

2. **Use Date Filters**
   - HTTP API Configuration → Initial Collect DateTime
   - Limit historical data imports
   - Import only recent orders

3. **Incremental Sync**
   - Use "Append" behavior (default)
   - System tracks last import timestamp
   - Only fetches new/updated orders

4. **Off-Peak Scheduling**
   - Schedule imports during low-traffic periods
   - Reduces impact on customer-facing operations
   - Better system resource availability

5. **Monitor Server Resources**
   - PHP memory_limit: 2GB+ recommended
   - PHP max_execution_time: 300+ seconds
   - MySQL query cache and buffer sizes
   - Monitor disk I/O during imports

### Data Quality & Validation

1. **Enable Address Validation**
   - Ensures complete address data
   - Prevents import failures
   - Maintains data quality

2. **Configure Field Mappings**
   - Customer Configuration → Address Field Mapping
   - Verify mapping matches PlentyONE configuration
   - Test with sample orders from each market

3. **Use Conditional Document Creation**
   - Invoice/Shipment/Creditmemo Configurations
   - Enable appropriate conditions
   - Prevents premature document creation

4. **Monitor Customer Duplicates**
   - Check for duplicate customer accounts by email
   - System reuses existing customers
   - Review customer import behavior

### Security & Compliance

1. **Disable Logging in Production**
   - Log Configuration → Disable unless troubleshooting
   - Logs contain sensitive customer data
   - Comply with GDPR/privacy regulations

2. **Secure API Credentials**
   - Client Configuration stored encrypted
   - Restrict admin access to profile configuration
   - Use separate PlentyONE API users per profile

3. **Implement Data Retention Policies**
   - Clear old execution history
   - Archive/delete old order import logs
   - Manage `plenty_order` table growth

4. **Test in Staging First**
   - Replicate production configuration in staging
   - Test marketplace scenarios
   - Validate all workflows before production deployment

---

## Related Documentation

- [Order Export Profile](/docs/profiles/order-export) - Send Magento orders to PlentyONE
- [Order Collect Architecture](/docs/architecture/order-collect) - Technical details on order collection
- [Order Import Architecture](/docs/architecture/order-import) - Technical details on order import
- [Payment Method Configuration](/docs/configuration/payment-configuration) - Configure PlentyONE payment method
- [Customer Import Profile](/docs/profiles/customer-import) - Customer synchronization
- [Product Import Profile](/docs/profiles/product-import) - Product synchronization
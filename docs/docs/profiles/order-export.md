---
sidebar_position: 12
title: Order Export Profile
description: Export orders from Magento to PlentyONE for fulfillment
---

# Order Export Profile

The **Order Export Profile** exports Magento store orders to PlentyONE for inventory management, fulfillment, and shipping. This is a CRITICAL profile for Magento-PlentyONE integration.

## Overview

**Profile Type ID**: `plenty_order_export`
**Direction**: Magento → PlentyONE
**Purpose**: Export Magento web store orders to PlentyONE for processing and fulfillment

### What Gets Exported

- **Orders**: Complete order data with line items
- **Customers**: Customer information (creates contacts in PlentyONE)
- **Addresses**: Billing and shipping addresses
- **Payment Information**: Payment method and status
- **Shipping Method**: Selected shipping option
- **Invoices**: Invoice documents (when configured)
- **Credit Memos**: Credit note orders (when configured)
- **Shipments**: Delivery orders with tracking (when configured)
- **Order Totals**: Prices, tax, shipping, discounts
- **Order Comments**: Customer notes and instructions

### Primary Use Cases

- **Store Order Fulfillment**: Send Magento store orders to PlentyONE warehouse
- **Inventory Management**: Export orders for stock reservation and management
- **Multi-Warehouse Operations**: Route orders to appropriate fulfillment centers
- **Order Processing Automation**: Automatic order submission to fulfillment system
- **Customer Contact Management**: Sync customer data to PlentyONE contacts

### Primary Workflow

```
Customer Places Order (Magento)
         ↓
Order Status Changes to "Processing"
         ↓
Order Export Profile Runs (Automatic)
         ↓
Order Created in PlentyONE
         ↓
Warehouse Fulfills Order
         ↓
Shipping Tracking Updated
         ↓
Order Status Synced Back (Order Import)
         ↓
Customer Notified (Magento)
```

:::info Order Direction
**Order Export** is for Magento store orders going to PlentyONE for fulfillment.
For marketplace orders (Amazon, eBay) coming FROM PlentyONE, use **Order Import**.
:::

## Configuration Reference

All configuration options are found at:
**Admin Panel** → **PlentyONE** → **Profiles** → **[Your Order Export Profile]**

### 1. Client Configuration

Configure the PlentyONE client connection for this profile.

#### Client

**Field**: `client_id`
**Type**: Select (Required)
**Scope**: Global

Select the PlentyONE client configuration to use for this order export profile. The client contains the API credentials and connection settings required to communicate with your PlentyONE system.

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

Configure automated order export scheduling and processing behavior.

#### Enable Schedule

**Field**: `status`
**Type**: Checkbox
**Default**: Enabled
**Scope**: Global

Enable automatic order export processing via the scheduler. When enabled, orders will be exported to PlentyONE according to the configured schedule.

**When to Enable**:
- ✅ Production environments with regular order flow
- ✅ Automated order processing workflow
- ✅ Real-time or near-real-time order fulfillment

**When to Disable**:
- ❌ Manual order review before export
- ❌ Batch export during specific time windows only
- ❌ Testing and configuration phases

#### Schedule

**Field**: `schedule_id`
**Type**: Select (Required when enabled)
**Scope**: Global

Select the cron schedule that determines when this order export profile will run automatically. The schedule defines the frequency and timing of order synchronization from Magento to PlentyONE.

**Common Schedules**:
- **Every 5 minutes** - Near real-time order sync (recommended for high-volume)
- **Every 15 minutes** - Standard order sync
- **Every 30 minutes** - Low-volume stores
- **Custom** - Define your own cron expression

**Recommended**: Every 5-15 minutes for timely order fulfillment

#### Process Batch Size

**Field**: `process_batch_size`
**Type**: Input (Number)
**Default**: 50
**Range**: 1-1000
**Scope**: Global

Number of orders processed per batch.

**Recommended settings**:
- **50** (default) - Optimal for most stores
- **25-30** - Complex orders with many items or low memory
- **75-100** - Simple orders with high memory

**Performance notes**:
- Automatic chunking activates for batches >20 orders
- Memory usage scales with order complexity
- Start with default and adjust based on monitoring

:::warning Performance Impact
Higher batch sizes consume more memory. Monitor your PHP memory_limit (recommended: 2GB+) when processing large batches.
:::

#### Enable Automatic Retry on Failure

**Field**: `enable_retry_on_failure`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Automatically retry failed order exports on subsequent schedule runs. This helps recover from PlentyONE downtime automatically.

**When to Enable**:
- ✅ Automatic recovery from temporary PlentyONE downtime
- ✅ Network connectivity issues
- ✅ API rate limiting recovery

**How It Works**:
1. Order export fails (API timeout, connection error)
2. Order marked for retry with attempt counter
3. System retries on next scheduled run (up to configured max attempts)
4. Only retries orders less than 24 hours old
5. Success on retry clears retry flag
6. After max attempts exceeded, admin email notification sent (if enabled)
7. Orders exceeding max retry attempts require manual intervention

#### Maximum Retry Attempts

**Field**: `retry_max_attempts`
**Type**: Input (Number)
**Default**: 3
**Scope**: Global

Maximum number of retry attempts for failed order exports before marking them as permanently failed. Once exceeded, the order will not be retried automatically and an email notification is sent to the admin (if enabled).

**Recommended Values**:
- **3** (default) - Suitable for most environments
- **5-10** - For environments with frequent but short PlentyONE downtime

#### Enable Retry Failure Notification

**Field**: `retry_notification_enabled`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Send an email notification to the admin when an order exceeds the maximum retry attempts. Uses the centralized ProfileNotification email service.

**When to Enable**:
- ✅ Production environments requiring immediate attention for failed exports
- ✅ Monitoring when automated recovery fails

:::tip Retry Strategy
Enable retry with notifications for production environments. The default of 3 attempts covers most transient failures. Increase max attempts if your PlentyONE environment experiences longer maintenance windows.
:::

#### Enable History

**Field**: `enable_history`
**Type**: Checkbox
**Default**: Enabled
**Scope**: Global

Enable logging of all processed order data. When enabled, a detailed history of each export operation will be saved, allowing you to track changes, troubleshoot issues, and audit data synchronization activities.

**Benefits**:
- ✅ Track processing success/failure rates
- ✅ Review order export timeline
- ✅ Audit compliance and data changes
- ✅ Troubleshoot synchronization issues

**Storage Impact**: History records accumulate over time. Implement cleanup policies for long-running profiles.

---

### 3. HTTP API Configuration

Configure how orders are sent to the PlentyONE REST API.

#### API Behaviour

**Field**: `api_behaviour`
**Type**: Select (Required)
**Default**: Append
**Scope**: Global

Select the API data export behavior.

**Options**:

| Behaviour | Description | Use Case |
|-----------|-------------|----------|
| **Append** | Continuously export new orders | ✅ Recommended for ongoing synchronization |
| **Replace** | Reset and reexport all orders matching criteria | ⚠️ One-time exports, data corrections |

**Append** tracks the last export timestamp and only exports new/modified orders. **Replace** clears the export table and reexports everything.

:::warning Replace Behavior
"Replace" mode deletes all previously exported order records and starts fresh. Use only for troubleshooting or one-time bulk exports.
:::

#### API Collection Size

**Field**: `api_collection_size`
**Type**: Input (Number)
**Default**: 50
**Maximum**: 500
**Scope**: Global

Specify the number of orders to export per batch to PlentyONE. Default is 50. Maximum allowed is 500. Higher values may improve performance but could increase memory usage and timeout risks.

**Recommended Values**:
- **50** - Default, balanced performance
- **100-200** - High-volume exports
- **500** - Maximum, use only for bulk operations

**Performance Considerations**:
- Higher values = Fewer API requests = Faster overall export
- Higher values = Larger request payloads = More memory per request
- PlentyONE API limits: Monitor rate limiting

#### Order Search Criteria

**Field**: `order_search_filters`
**Type**: Multiselect (Required)
**Scope**: Global

Select which Magento orders to export to PlentyONE based on their status or state. You can select multiple criteria to export orders in different states.

**Common Magento Order Statuses**:

| Status | Status Name | Export? |
|--------|-------------|---------|
| pending | Pending | ❌ Usually wait for payment |
| pending_payment | Pending Payment | ❌ Wait for payment confirmation |
| processing | Processing | ✅ Yes - paid and ready |
| complete | Complete | ⚠️ Optional - already fulfilled |
| holded | On Hold | ❌ Manual review required |
| payment_review | Payment Review | ❌ Fraud check pending |
| canceled | Canceled | ❌ No - canceled orders |
| closed | Closed | ❌ No - completed/closed |

**Example Configuration**:
```
Order Search Criteria: [processing]
Result: Export only paid orders ready for fulfillment
```

**Multi-Status Strategy**:
```
Order Search Criteria: [pending_payment, processing]
Result: Export immediately, PlentyONE holds until payment confirmed
```

**Recommended**: `processing` (paid orders ready to ship)

---

### 4. Store Configuration

Map Magento stores to PlentyONE clients and configure order referrers for multi-store environments.

#### Store Mapping

**Field**: `store_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Define how Magento stores map to PlentyONE clients and languages. This configuration determines which PlentyONE client receives orders from each Magento store view.

**Row Fields**:
- **Store** - Magento store view
- **Client** - PlentyONE client ID (plentyId)
- **Locale** - PlentyONE language (e.g., de, en, fr)

**Example Configuration**:

| Magento Store | PlentyONE Client | Locale |
|---------------|------------------|--------|
| Default Store | 1000 | en |
| German Store | 1000 | de |
| French Store | 1000 | fr |

**How Mapping Works**:
1. Order placed in Magento store
2. System looks up store mapping
3. Order exported to mapped PlentyONE client with specified language
4. If no mapping found, uses default client

:::warning Multi-Store Requirement
Store mapping is critical for multi-store setups. Orders without valid mapping may fail to export or be assigned to incorrect clients.
:::

#### Enable Store Filter

**Field**: `is_active_store_filter`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Restricts order export by mapped stores. Orders placed in stores that are not included in the mapping will be excluded from export.

**When to Enable**:
- ✅ Multi-store Magento with selective export per store
- ✅ Prevent exporting orders from specific stores
- ✅ Test store isolation

**When to Disable**:
- ❌ Single-store setup (not needed)
- ❌ Export all orders regardless of store

#### Order Referrer

**Field**: `referer_id`
**Type**: Select (Required)
**Scope**: Store View
**Validation**: Required

Select the PlentyONE referrer (sales channel) to assign to exported orders from this Magento store. The referrer identifies which sales channel or marketplace the order originated from in PlentyONE.

**What is a Referrer?**
- Identifies the order source/channel in PlentyONE
- Used for reporting and analytics
- Tracks sales by channel
- Essential for multi-channel operations

**Referrer Strategy**:

**Single Store**:
```
Order Referrer: Magento Store

All Magento orders → "Magento Store" referrer
```

**Multi-Store**:
```
US Store → Referrer: Magento US
EU Store → Referrer: Magento EU
B2B Store → Referrer: Magento B2B
```

**Actions**:
- **New Referrer** - Create a new order referrer in PlentyONE directly from Magento

:::tip Store-Level Configuration
Order Referrer is configured at store view level, allowing different referrers per Magento store for accurate channel tracking in PlentyONE.
:::

#### Enable Channel Filter

**Field**: `is_active_channel_filter`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable filtering of orders by sales channel during export. When enabled, only orders from channels specified in the filter below will be exported to PlentyONE. Orders from unmapped channels will be automatically excluded from export.

**When to Enable**:
- ✅ Export only specific sales channels
- ✅ Multi-channel store with selective export
- ✅ Testing specific channel integration

#### Order Channels

**Field**: `order_channel_filters`
**Type**: Multiselect (Required when filter enabled)
**Scope**: Global

Select which order channels to include in export when channel filtering is enabled.

**Example Use Case**:
```
Enable Channel Filter: Yes
Order Channels: [Magento Storefront, B2B Portal]

Result: Only orders from these channels are exported
Orders from other channels are skipped
```

---

### 5. Customer Configuration

Configure customer account creation and field mapping for PlentyONE contacts.

#### Enable Customer Export

**Field**: `is_active`
**Type**: Checkbox
**Default**: Enabled
**Scope**: Global

An option to create contact in PlentyONE.

**Behavior**:
- **Enabled**: Creates/updates customer as PlentyONE contact
- **Disabled**: Creates order without linking to contact

**When to Enable**:
- ✅ Build customer database in PlentyONE
- ✅ Enable customer-specific features (credit limits, pricing)
- ✅ Customer relationship management

**When to Disable**:
- ❌ Guest-only orders (not recommended)
- ❌ PlentyONE used only for fulfillment without CRM

**Recommendation**: Always enable for complete customer data sync

#### Create Account for Guest

**Field**: `create_account_for_guest`
**Type**: Checkbox
**Default**: Enabled
**Scope**: Global

An option to create new contact account for guests.

**Behavior**:
- **Enabled**: Guest checkouts create PlentyONE contacts
- **Disabled**: Only registered customers create contacts

**Recommended**: Enable to maintain complete customer records

#### Create Address

**Field**: `create_address`
**Type**: Checkbox
**Default**: Enabled
**Scope**: Global

An option to create new customer's address in PlentyONE contact record.

**When to Enable**:
- ✅ Store customer addresses for repeat orders
- ✅ Address book management in PlentyONE
- ✅ Multi-address customer support

#### Default Customer Group

**Field**: `default_group`
**Type**: Select
**Scope**: Global

An option to automatically assign new customer to a group. System configuration will override this option if un-selected.

**Common Groups**:
- **Customer** - Standard B2C customers
- **Business** - B2B customers
- **Premium** - VIP/Premium tier

---

#### Advanced Customer Mappings

##### Customer Group Mapping

**Field**: `group_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map Magento customer groups to PlentyONE customer types/groups.

**Row Fields**:
- **Magento Group** - Magento customer group
- **Plenty Group** - PlentyONE customer class

**Example Configuration**:

| Magento Group | PlentyONE Type | Use Case |
|---------------|----------------|----------|
| General | Customer | B2C retail |
| Wholesale | Business | B2B wholesale |
| VIP | Premium | VIP customers |

**How It Works**:
1. Order placed by customer with specific group
2. System looks up matching group mapping
3. Contact created/updated with mapped PlentyONE group
4. Falls back to default group if no mapping found

##### Address Field Mapping

**Field**: `address_field_mapping`
**Type**: Dynamic Rows
**Scope**: Website

Map Magento address fields to PlentyONE address fields. PlentyONE uses flexible name fields (name1-name4) that can be customized per client.

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
Address field mapping is critical for correct name display in orders, packing slips, and shipping labels in PlentyONE. Verify mapping matches your PlentyONE configuration.
:::

##### Gender Mapping

**Field**: `gender_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map customer name prefixes to gender values for proper PlentyONE contact structure.

**Row Fields**:
- **Magento Prefix** - Customer name prefix (Mr., Mrs., Ms., Dr.)
- **PlentyONE Gender** - Gender value from options

**Example Configuration**:

| Magento Prefix | PlentyONE Gender |
|----------------|------------------|
| Mr. | male |
| Mrs. | female |
| Ms. | female |
| Dr. | - |

**Use Cases**:
- ✅ Proper salutation in PlentyONE documents
- ✅ Contact data completeness
- ✅ Legal/compliance requirements

---

### 6. Status Configuration

Configure order status filtering and mapping between Magento and PlentyONE.

#### Process Order Status Filter

**Field**: `status_filter`
**Type**: Multiselect (Required)
**Scope**: Global

An option to restrict order export by status. Orders with selected statuses will be allowed for export.

**Recommended Configuration**:
```
Process Order Status Filter: [processing]

Reason: Only export paid orders ready for fulfillment
```

**Multi-Status Strategy**:
```
Process Order Status Filter: [pending_payment, processing]

Reason: Export immediately, PlentyONE holds until paid
```

**Common Statuses**:
- `processing` - Payment received, ready to ship (RECOMMENDED)
- `pending_payment` - Awaiting payment confirmation
- `complete` - Order fulfilled (usually not needed)

:::warning Status Filter vs. Order Search Criteria
Both filters work together. Orders must match BOTH the Process Order Status Filter AND the Order Search Criteria to be exported.
:::

#### Status Mapping

**Field**: `status_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map Magento order statuses to PlentyONE order statuses.

**Row Fields**:
- **Magento Status** - Magento order status
- **Plenty Status** - PlentyONE order status ID

**Example Configuration**:

| Magento Status | PlentyONE Status | PlentyONE Status Name |
|----------------|------------------|-----------------------|
| processing | 3 | Waiting for payment |
| processing | 4 | In preparation for shipping |
| processing | 5 | Cleared for shipping |
| complete | 7 | Shipped |
| canceled | 8 | Canceled |

**Common PlentyONE Order Status IDs**:
- **3** - Waiting for payment
- **4** - In preparation for shipping
- **5** - Cleared for shipping
- **6** - Currently being shipped
- **7** - Shipped
- **8** - Canceled

**Mapping Strategy**:
- Map Magento `processing` to PlentyONE status 4 or 5 (ready for fulfillment)
- Map Magento `complete` to PlentyONE status 7 (if exporting completed orders)
- Map Magento `canceled` to PlentyONE status 8

---

### 7. Payment Configuration

Configure payment export and method mapping.

#### Enable Payment Export

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

An option to export payment information to PlentyONE.

**When to Enable**:
- ✅ Export payment transaction data to PlentyONE
- ✅ Payment status tracking in PlentyONE
- ✅ Financial reconciliation

**When to Disable**:
- ❌ Payment managed entirely in Magento
- ❌ PlentyONE used only for fulfillment

#### Payment Method Mapping

**Field**: `payment_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map Magento payment methods to PlentyONE payment methods.

**Row Fields**:
- **Magento Payment** - Magento payment method code
- **Plenty Payment** - PlentyONE method of payment (MOP) ID
- **Active** - Enable/disable this mapping
- **Submit Unconfirmed Payment** - Submit payments for orders with outstanding or unconfirmed payments

**Critical Mapping Examples**:

| Magento Payment | PlentyONE Method ID | PlentyONE Method Name |
|-----------------|---------------------|-----------------------|
| checkmo | 1 | Cash in advance |
| cashondelivery | 1 | Cash on delivery |
| banktransfer | 1 | Bank transfer |
| paypal_express | 4 | PayPal |
| authorizenet | 2 | Credit card |
| stripe | 2 | Credit card |
| braintree | 4 | PayPal |

**PlentyONE Payment Method IDs** (Common):
- **1** - Cash / Bank Transfer
- **2** - Credit Card
- **4** - PayPal
- **6** - Invoice
- **7** - Amazon Pay

**How to Get PlentyONE Payment IDs**:
1. Click "Collect Configuration Data" in Client Configuration
2. Payment methods are fetched from PlentyONE
3. Available in mapping dropdowns

**Per-Method Options**:

##### Active

**Field**: `is_active` (within payment mapping row)
**Type**: Checkbox
**Default**: Enabled

An option to enable / disable payment submission per method.

**Use Case**: Temporarily disable specific payment method export without removing mapping.

##### Submit Unconfirmed Payment

**Field**: `can_submit_unconfirmed_payment` (within payment mapping row)
**Type**: Checkbox
**Default**: Disabled

An option to submit payments for orders with outstanding or unconfirmed payments.

**When to Enable**:
- ✅ Payment pending but order should be exported
- ✅ Post-payment processing (invoice, COD)
- ✅ Manual payment verification workflow

**When to Disable**:
- ❌ Only export fully paid orders (recommended)
- ❌ Prevent export of unpaid orders

:::warning Payment Method Required
Every Magento payment method MUST be mapped. Orders with unmapped payment methods will fail to export. Use "Collect Configuration Data" to fetch available PlentyONE payment methods.
:::

---

### 8. Credit Memo Configuration

Configure credit memo (refund/return) document export to PlentyONE.

#### Enable Credit Note Order Export

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

An option to create an order type "credit note" in PlentyONE.

**When to Enable**:
- ✅ Export Magento credit memos as PlentyONE credit note orders
- ✅ Return and refund processing in PlentyONE
- ✅ Financial reconciliation of returns

**What Gets Created**:
- Credit note order (Type ID 4) in PlentyONE
- Linked to original order
- Item quantities and amounts

#### Create Credit Note Document

**Field**: `is_active_artefact`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

An option to create credit note document in PlentyONE.

**When to Enable**:
- ✅ Generate printable credit note documents in PlentyONE
- ✅ Document management workflow
- ✅ Customer-facing credit note PDFs

**Difference from Credit Note Order**:
- **Credit Note Order**: Creates transaction record in PlentyONE
- **Credit Note Document**: Generates printable PDF document

---

### 9. Invoice Configuration

Configure invoice document export to PlentyONE.

#### Enable Invoice Export

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

An option to create invoice document in PlentyONE.

**When to Enable**:
- ✅ Generate invoice documents in PlentyONE
- ✅ Centralized invoice management
- ✅ PlentyONE handles invoice PDFs

**When to Disable**:
- ❌ Magento generates all invoices
- ❌ No need for PlentyONE invoice documents

**What Gets Created**:
- Invoice document in PlentyONE
- Linked to order
- Invoice number and amounts
- Printable invoice PDF

---

### 10. Shipping Configuration

Configure shipping profile mapping and package export.

#### Enable Shipping Export

**Field**: `is_active`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

An option to create order delivery note in PlentyONE.

**When to Enable**:
- ✅ Generate delivery notes in PlentyONE
- ✅ Shipping document management
- ✅ Warehouse packing slips

#### Export Shipping Profile

**Field**: `is_active_shipping_profile`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

An option to export shipping profile from Magento to PlentyONE.

**When to Enable**:
- ✅ Map Magento shipping methods to PlentyONE shipping profiles
- ✅ Shipping method-specific fulfillment rules
- ✅ Carrier integration in PlentyONE

#### Default Shipping Profile

**Field**: `default_shipping_profile`
**Type**: Select
**Scope**: Global

Profile will be used as a fall-back option in case specific profile not found.

**Recommended**: Set to most common shipping method (e.g., "Standard Shipping")

#### Shipping Method Mapping

**Field**: `shipping_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Map Magento shipping methods to PlentyONE shipping profiles.

**Row Fields**:
- **Magento Shipping** - Magento method code (carrier_method)
- **Plenty Shipping** - PlentyONE shipping profile ID

**Example Configuration**:

| Magento Shipping | PlentyONE Shipping Profile | Carrier |
|------------------|----------------------------|---------|
| flatrate_flatrate | 1 (Standard Shipping) | DHL |
| tablerate_bestway | 2 (Express) | DHL Express |
| freeshipping_freeshipping | 3 (Free Shipping) | DHL |
| ups_03 | 4 (UPS Ground) | UPS |
| fedex_FEDEX_GROUND | 5 (FedEx Ground) | FedEx |

**Shipping Profile Configuration**:
1. Run "Collect Configuration Data"
2. PlentyONE shipping profiles are fetched
3. Available in mapping dropdowns

**Shipping Method Code Format**: `carrier_code`_`method_code`

**How to Find Codes**:
1. **Admin Panel** → **Stores** → **Configuration** → **Sales** → **Shipping Methods**
2. Each enabled carrier has method codes
3. Common carriers: `flatrate`, `tablerate`, `freeshipping`, `ups`, `usps`, `fedex`, `dhl`

:::warning Shipping Method Required
Every Magento shipping method should be mapped. Orders with unmapped shipping methods use the default shipping profile.
:::

---

#### Export Shipping Package

**Field**: `is_active_shipping_package`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

An option to export shipping package including tracking numbers.

**When to Enable**:
- ✅ Export Magento shipment tracking to PlentyONE
- ✅ Track shipments created in Magento
- ✅ Two-way tracking synchronization

**What Gets Exported**:
- Package information
- Tracking numbers
- Carrier codes
- Shipment dates

#### Default Shipping Package

**Field**: `default_shipping_package`
**Type**: Select
**Scope**: Global

Package will be used as a fall-back option in case specific package not found.

---

### 11. Attribute Configuration

Map custom attributes between Magento and PlentyONE for order data.

#### Attribute Mapping

**Field**: `attribute_mapping`
**Type**: Dynamic Rows
**Scope**: Global

Define custom attribute mappings between Magento order attributes and PlentyONE order properties.

**Row Fields**:
- **Magento Attribute** - Magento order attribute code (from dropdown)
- **Magento Custom** - Custom attribute code (manual entry)
- **PlentyONE Attribute** - PlentyONE order property type ID

**Use Cases**:
- ✅ Sync custom order fields (gift messages, special instructions)
- ✅ Map custom data to PlentyONE order properties
- ✅ Transfer custom order metadata

**Example Configuration**:

| Magento Attribute | PlentyONE Attribute | Purpose |
|-------------------|---------------------|---------|
| gift_message | Gift Message Property | Sync gift message text |
| delivery_instructions | Delivery Notes | Special delivery instructions |
| po_number | Purchase Order Number | B2B PO tracking |

**How It Works**:
1. Magento order contains custom attribute
2. System looks up attribute mapping
3. Value assigned to PlentyONE order property
4. Property visible in PlentyONE order details

**Requirements**:
- Magento custom attributes must exist before mapping
- Create attributes at **Stores** → **Attributes** → **Order**
- PlentyONE property type IDs from "Collect Configuration Data"

**Actions**:
- **Create Order Property** - Create new order property in PlentyONE directly from Magento

---

### 12. Order Line Item Configuration

Configure how order line items are processed and exported.

#### Apply Discount to Order Line Item

**Field**: `apply_discount_to_line_item`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

If active, the promotion discount will be applied to order line items. Otherwise, the discount is applied to the order as a "Promotional Coupon". Default: "No".

**Options**:

| Mode | Behavior | Use Case |
|------|----------|----------|
| **Disabled** (default) | Discount as separate line | ✅ Promotions shown separately |
| **Enabled** | Discount applied to items | ✅ Item prices reduced directly |

**Example**:

**Disabled (Default)**:
```
Item 1: $100.00
Item 2: $50.00
Subtotal: $150.00
Discount (PROMO10): -$15.00
Total: $135.00
```

**Enabled**:
```
Item 1: $90.00 (discount applied)
Item 2: $45.00 (discount applied)
Subtotal: $135.00
Total: $135.00
```

**Recommended**: Disabled (separate discount line for clarity)

#### Export Bundle Components

**Field**: `export_bundle_components`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

If active, all the bundle components will be exported as separate line items. Otherwise, the main bundle product is exported. Please note, PlentyONE can automatically assign associated components when main bundle is detected. Default: "No".

**Options**:

| Mode | Behavior | Use Case |
|------|----------|----------|
| **Disabled** (default) | Export bundle as single item | ✅ PlentyONE handles bundle assembly |
| **Enabled** | Export all components separately | ✅ Custom bundle handling required |

**Recommended**: Disabled (let PlentyONE handle bundle components)

#### Include Product Options

**Field**: `include_product_options`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

If enabled, additional product options will be included in the order line item.

**What Gets Included**:
- Custom product options (text fields, dropdowns)
- Configurable product selections (size, color)
- Bundle product selections
- Custom engraving/personalization

**When to Enable**:
- ✅ Products with custom options
- ✅ Personalized products
- ✅ Configurable product variants
- ✅ Bundle product component details

#### Exclude Warehouse Assignment

**Field**: `exclude_warehouse_assignment`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

If enabled, a warehouse ID assignment will be excluded from order line item. Default: false.

**When to Enable**:
- ✅ PlentyONE determines warehouse automatically
- ✅ Dynamic warehouse assignment based on stock
- ✅ No MSI (Multi-Source Inventory) in Magento

**When to Disable**:
- ❌ MSI enabled with source selection
- ❌ Specific warehouse per item required
- ❌ Pre-assigned warehouse from Magento

---

### 13. Log Configuration

Configure debugging and request/response logging for troubleshooting.

#### Log Request Data to File

**Field**: `is_active_request_log`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable logging of request data to file.

**What Gets Logged**:
- Order data structures
- Customer/contact data
- Payment information
- Shipping details
- API request payloads

**Log Location**: `var/log/plenty_order.log`

**When to Enable**:
- ✅ Troubleshooting export failures
- ✅ Debugging data transformation
- ✅ Investigating API errors
- ✅ Development and testing

**When to Disable**:
- ❌ Production environments (performance impact)
- ❌ Large export volumes (disk space usage)
- ❌ Privacy/compliance concerns (logs contain customer data)

#### Log Response Data to File

**Field**: `is_active_response_log`
**Type**: Checkbox
**Default**: Disabled
**Scope**: Global

Enable logging of response data to file.

**What Gets Logged**:
- PlentyONE order IDs created
- Success/failure status
- API response codes
- Error messages and stack traces
- Processing results

**Log Location**: `var/log/plenty_order.log`

**Recommended**:
- Enable both request and response logging for comprehensive debugging
- Disable in production unless actively troubleshooting
- Rotate logs regularly to manage disk space

:::warning Log File Size
Logging can generate large files quickly with high export volumes. Monitor `var/log/plenty_order.log` size and implement log rotation policies.
:::

---

## CLI Commands

Execute order export operations manually via command line.

```bash
# Export all pending orders
bin/magento softcommerce:plenty:order:export --profile-id=8

# Export specific order
bin/magento softcommerce:plenty:order:export --profile-id=8 --order-id=1000001

# Export orders by status
bin/magento softcommerce:plenty:order:export --profile-id=8 --status=processing

# Export orders by date range
bin/magento softcommerce:plenty:order:export --profile-id=8 --from-date="2024-01-01" --to-date="2024-01-31"

# Export with date range
bin/magento softcommerce:plenty:order:export --profile-id=8 --from-date="2024-01-01"

# Process export queue
bin/magento softcommerce:plenty:order:export --profile-id=8 --queue

# Force re-export (update existing order)
bin/magento softcommerce:plenty:order:export --profile-id=8 --order-id=1000001 --force

# View profile execution history
bin/magento softcommerce:profile:history:list --profile-id=8

# Clear profile history
bin/magento softcommerce:profile:history:clear --profile-id=8
```

**Command Options**:

| Option | Short | Description |
|--------|-------|-------------|
| `--profile-id` | `-p` | Order export profile ID (required) |
| `--order-id` | `-o` | Specific Magento order ID(s) |
| `--from-date` | `-f` | Start date for order filter |
| `--to-date` | `-t` | End date for order filter |
| `--status` | `-s` | Magento order status filter |
| `--queue` | | Process export queue |
| `--force` | | Force re-export of existing orders |

**Automated Workflow** (Cron):
```
1. Order placed in Magento
2. Order status changes to "processing"
3. Observer adds order to export queue
4. Export Cron runs every 5-15 minutes
5. Orders exported to PlentyONE
```

---

## Troubleshooting

### Orders Not Exporting

**Symptoms**:
- Orders placed but not appearing in PlentyONE
- Export profile runs but no orders processed
- Zero orders in execution history

**Solutions**:

1. **Check Order Status**
   - Navigate to Status Configuration → Process Order Status Filter
   - Verify order status is in filter list (e.g., `processing`)
   - Order must match configured export statuses

2. **Verify Order Search Criteria**
   - HTTP API Configuration → Order Search Criteria
   - Confirm order status matches selected criteria
   - Both status filter AND search criteria must match

3. **Check Schedule Status**
   - Schedule Configuration → Enable Schedule must be ON
   - Verify schedule is configured (every 5-15 minutes recommended)
   - Check cron is running: `bin/magento cron:run`

4. **Review Payment Mapping**
   - Payment Configuration → Payment Method Mapping
   - Ensure order's payment method is mapped
   - Orders with unmapped payment methods fail

5. **Verify Shipping Mapping**
   - Shipping Configuration → Shipping Method Mapping
   - Ensure order's shipping method is mapped
   - Set default shipping profile as fallback

6. **Check Store Configuration**
   - Store Configuration → Store Mapping
   - Verify order's store is mapped to PlentyONE client
   - If Enable Store Filter is on, unmapped stores are excluded

7. **Review Logs**
   - Check `var/log/plenty_order.log` (if logging enabled)
   - Check `var/log/system.log` for errors
   - Enable request/response logging for detailed troubleshooting

### Payment Method Not Mapped Error

**Problem**: Order export fails with "Payment method not mapped"

**Symptoms**:
- Export fails with payment method error
- Specific payment methods not exporting
- Error message mentions payment method code

**Solutions**:

1. **Add Payment Mapping**
   - Navigate to Payment Configuration → Payment Method Mapping
   - Add row for missing payment method
   - Map to appropriate PlentyONE payment method

2. **Collect Configuration Data**
   - Client Configuration → Click "Collect Configuration Data"
   - Refreshes PlentyONE payment methods
   - Makes latest payment methods available

3. **Verify Payment Method Code**
   - Check exact payment method code in Magento order
   - Code must match exactly in mapping (case-sensitive)
   - Common codes: `checkmo`, `paypal_express`, `authorizenet`, `stripe`

4. **Check Payment Method Active**
   - Payment mapping row → Active checkbox must be enabled
   - Disabled mappings are ignored

### Shipping Method Not Mapped

**Problem**: Export fails with "Shipping method not found"

**Symptoms**:
- Order export fails with shipping error
- Specific shipping methods not exporting
- Error message mentions shipping method code

**Solutions**:

1. **Add Shipping Mapping**
   - Navigate to Shipping Configuration → Shipping Method Mapping
   - Add row for missing shipping method
   - Map to appropriate PlentyONE shipping profile

2. **Set Default Shipping Profile**
   - Shipping Configuration → Default Shipping Profile
   - Select fallback shipping profile
   - Used when specific mapping not found

3. **Collect Configuration Data**
   - Client Configuration → Click "Collect Configuration Data"
   - Refreshes PlentyONE shipping profiles
   - Makes latest profiles available

4. **Verify Shipping Method Code**
   - Check exact shipping method code in order
   - Format: `carrier_code`_`method_code`
   - Example: `flatrate_flatrate`, `ups_03`, `fedex_FEDEX_GROUND`

### Customer Not Created in PlentyONE

**Symptoms**:
- Order exported but no contact in PlentyONE
- Customer data missing in PlentyONE orders
- Contact fields empty

**Solutions**:

1. **Enable Customer Export**
   - Customer Configuration → Enable Customer Export
   - Must be checked for contact creation

2. **Enable Guest Account Creation**
   - Customer Configuration → Create Account for Guest
   - Allows contacts for guest checkouts

3. **Verify Customer Data**
   - Ensure order has complete customer information
   - Check email, name, address fields are populated
   - Validate required fields are not empty

4. **Check Address Creation**
   - Customer Configuration → Create Address
   - Enable if addresses should be saved to contact

5. **Review Customer Group Mapping**
   - Customer Configuration → Customer Group Mapping
   - Verify customer's group is mapped
   - Check default group is configured

### Order Exported But Missing Items

**Symptoms**:
- Order created in PlentyONE but incomplete
- Some items missing from PlentyONE order
- Item count doesn't match Magento

**Solutions**:

1. **Check Product SKU Matching**
   - Verify SKUs exist in PlentyONE
   - SKUs must match exactly (case-sensitive)
   - Check for extra spaces or special characters

2. **Import Products First**
   - Run product import profile before order export
   - Ensures all SKUs exist in PlentyONE
   - Recommended for initial setup

3. **Review Bundle Configuration**
   - Order Line Item Configuration → Export Bundle Components
   - Check if bundle export mode is correct
   - Verify PlentyONE bundle configuration

4. **Check Product Options**
   - Order Line Item Configuration → Include Product Options
   - Enable if product has custom options
   - Verify options are mapped correctly

### Export Fails with Memory Error

**Symptoms**:
- PHP memory exhausted errors
- Export timeouts
- Process crashes during large exports

**Solutions**:

1. **Reduce Batch Size**
   - Schedule Configuration → Process Batch Size
   - Lower to 25-30 for memory-constrained environments
   - Monitor memory usage and adjust

2. **Increase PHP Memory Limit**
   - Update `php.ini`: `memory_limit = 2G`
   - Or use `.htaccess`: `php_value memory_limit 2G`
   - Recommended: 2GB minimum for order export

3. **Reduce API Collection Size**
   - HTTP API Configuration → API Collection Size
   - Lower to 50 or less
   - Reduces per-request memory usage

4. **Disable Logging**
   - Log Configuration → Disable request/response logging
   - Logging consumes additional memory
   - Enable only when actively troubleshooting

5. **Run Exports Off-Peak**
   - Schedule during low-traffic periods
   - Reduces competition for system resources
   - Better memory availability

### Retry Not Working

**Symptoms**:
- Failed orders not automatically retried
- Orders stuck in error status
- Retry counter not incrementing

**Solutions**:

1. **Enable Retry on Failure**
   - Schedule Configuration → Enable Automatic Retry on Failure
   - Must be enabled for automatic retry

2. **Check Order Age**
   - Retry only processes orders less than 24 hours old
   - Orders older than 24 hours require manual re-export
   - Check order created date

3. **Verify Retry Limit**
   - Default maximum retry attempts: 3 (configurable via `retry_max_attempts`)
   - After max attempts exceeded, manual intervention required
   - Check retry count in order metadata
   - Enable `retry_notification_enabled` to receive email alerts when retries are exhausted

4. **Review Error Type**
   - Some errors are not retryable (invalid data)
   - Only transient errors (API timeout, network) are retried
   - Check error message for root cause

---

## Best Practices

### Initial Configuration

1. **Configure Client First**
   - Client Configuration → Select PlentyONE client
   - Click "Collect Configuration Data"
   - Populates all dropdown options

2. **Map All Payment Methods**
   - Payment Configuration → Payment Method Mapping
   - Map EVERY payment method before going live
   - Test with sample orders

3. **Map All Shipping Methods**
   - Shipping Configuration → Shipping Method Mapping
   - Map ALL shipping methods
   - Set default shipping profile fallback

4. **Configure Order Referrer**
   - Store Configuration → Order Referrer
   - Select or create appropriate referrer
   - Critical for order tracking in PlentyONE

5. **Test with Sample Orders**
   - Create test orders for each payment/shipping combo
   - Verify orders appear correctly in PlentyONE
   - Check customer data, items, totals

6. **Enable Customer Export**
   - Customer Configuration → Enable Customer Export
   - Ensures complete customer data in PlentyONE
   - Configure group and address mappings

### Production Operation

1. **Enable Automatic Export**
   - Schedule Configuration → Enable Schedule
   - Select frequent schedule (every 5-15 minutes)
   - Ensures near real-time order fulfillment

2. **Enable Automatic Retry**
   - Schedule Configuration → Enable Automatic Retry on Failure
   - Configure max retry attempts (default: 3)
   - Enable retry failure notifications for email alerts when retries exhausted
   - Handles temporary PlentyONE downtime automatically

3. **Monitor Execution History**
   - Review profile execution history regularly
   - Admin Panel → PlentyONE → Profiles → [Profile] → History
   - Check success rates and error messages

4. **Set Up Error Alerts**
   - Configure monitoring for failed exports
   - Alert on orders stuck in error status
   - Track retry exhaustion

5. **Regular Queue Monitoring**
   - Check export queue for stuck orders
   - Clear completed queue items
   - Investigate persistent failures

### Multi-Store Setup

1. **Separate Referrers Per Store**
   - Store Configuration → Order Referrer (per store view)
   - Use different referrer for each Magento store
   - Enables channel-specific reporting in PlentyONE

2. **Store-Specific Mapping**
   - Configure store mapping for multi-store
   - Map each store to appropriate PlentyONE client
   - Consider locale settings per store

3. **Test Each Store**
   - Validate exports for all stores
   - Check referrer assignment
   - Verify client mapping

4. **Currency Handling**
   - Consider currency conversion needs
   - Verify pricing in PlentyONE matches Magento
   - Test multi-currency orders

### Performance Optimization

1. **Optimize Batch Sizes**
   - Process Batch Size: 50 (default, adjust as needed)
   - API Collection Size: 50 (standard)
   - Monitor memory usage and adjust

2. **Frequent Execution**
   - Schedule every 5-15 minutes
   - Reduces export queue buildup
   - Faster order to fulfillment time

3. **Off-Peak Processing**
   - Schedule bulk exports during low traffic
   - Reduces impact on customer-facing operations
   - Better system resource availability

4. **Queue Management**
   - Monitor and clear completed queue items
   - Investigate stuck orders promptly
   - Prevent queue bloat

5. **Monitor Server Resources**
   - PHP memory_limit: 2GB+ recommended
   - PHP max_execution_time: 300+ seconds
   - Monitor disk I/O during exports

### Order Data Quality

1. **Required Fields Validation**
   - Ensure addresses have all required fields
   - Validate customer data completeness
   - Check payment/shipping method validity

2. **Product Existence**
   - Import products to PlentyONE before orders
   - Verify SKU matching between systems
   - Test with products from each category

3. **SKU Matching**
   - Use consistent SKU format across systems
   - Avoid spaces, special characters
   - Case-sensitive matching

4. **Price Accuracy**
   - Verify tax calculations match
   - Check discount application
   - Validate currency conversion if needed

### Security & Compliance

1. **Disable Logging in Production**
   - Log Configuration → Disable unless troubleshooting
   - Logs contain sensitive customer/payment data
   - Comply with GDPR/privacy regulations

2. **Secure API Credentials**
   - Client Configuration stored encrypted
   - Restrict admin access to profile configuration
   - Use separate PlentyONE API users per profile

3. **Regular Backups**
   - Export profile configuration regularly
   - Backup payment/shipping mappings
   - Document custom attribute mappings

4. **Test in Staging First**
   - Replicate production configuration in staging
   - Test all scenarios before production deployment
   - Validate mapping completeness

## Critical Success Factors

### Must-Have Configuration

1. ✅ **Payment Mapping Complete**: Every payment method mapped
2. ✅ **Shipping Mapping Complete**: Every shipping method mapped
3. ✅ **Order Referrer Selected**: Configured per store view
4. ✅ **Customer Export Enabled**: Creates contacts in PlentyONE
5. ✅ **Schedule Configured**: Every 5-15 minutes
6. ✅ **Status Filter Set**: Processing status selected
7. ✅ **Store Mapping Configured**: For multi-store setups

### Pre-Launch Checklist

- [ ] All payment methods mapped
- [ ] All shipping methods mapped
- [ ] Default shipping profile configured
- [ ] Order referrer configured per store
- [ ] Customer export enabled
- [ ] Customer group mapping configured
- [ ] Test order successfully exported
- [ ] Order appears correctly in PlentyONE
- [ ] Schedule enabled (every 5-15 min)
- [ ] Automatic retry enabled
- [ ] Error logging enabled temporarily
- [ ] Notification alerts set up

### Post-Launch Monitoring

- [ ] Daily: Check execution history for failures
- [ ] Daily: Monitor export queue for stuck orders
- [ ] Weekly: Review retry statistics
- [ ] Weekly: Verify payment/shipping mapping coverage
- [ ] Monthly: Check memory usage trends
- [ ] Monthly: Review and optimize batch sizes
- [ ] Quarterly: Audit customer data completeness

---

## Related Documentation

- [Order Import Profile](/docs/profiles/order-import) - Import marketplace orders from PlentyONE
- [Order Export Architecture](/docs/architecture/order-export) - Technical details on order export
- [Payment Method Configuration](/docs/configuration/payment-configuration) - Configure payment methods
- [Customer Export Profile](/docs/profiles/customer-export) - Customer synchronization
- [Product Export Profile](/docs/profiles/product-export) - Product synchronization
- [Initial Setup Wizard](/docs/configuration/initial-setup) - Getting started guide
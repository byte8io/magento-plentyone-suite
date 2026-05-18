---
sidebar_position: 8
title: Customer Export Profile
description: Export customers from Magento to PlentyONE using the Customer Export Profile
---

# Customer Export Profile

The **Customer Export Profile** synchronizes customer data from Magento to PlentyONE, creating contacts and updating customer information in your ERP system. This profile enables automatic or manual export of customer accounts, addresses, and contact details to maintain consistent customer data across both systems.

## Overview

**Profile Type ID**: `plenty_customer_export`
**Direction**: Magento → PlentyONE
**Purpose**: Export customer accounts, addresses, and contact details from Magento to PlentyONE

### What Gets Exported

- **Customer Accounts**: Complete customer information as PlentyONE contacts
- **Customer Addresses**: Billing and shipping addresses with full details
- **Customer Groups**: Magento customer groups mapped to PlentyONE customer classes
- **Customer Metadata**: Names, email, phone, company information
- **Account Information**: Company accounts with tax IDs and business details
- **Gender Mapping**: Customer prefix mapped to PlentyONE gender field
- **Custom Attributes**: Configurable address field mappings for custom data

### Primary Use Cases

- **Order Processing**: Export customers to PlentyONE before or during order export for fulfillment
- **CRM Integration**: Synchronize customer data for marketing, support, and customer management
- **Guest Checkout**: Automatically create PlentyONE contacts for guest orders
- **B2B Management**: Export business customers with company accounts and tax IDs
- **Automated Export**: Queue-based processing for new customer registrations
- **Multi-Store Separation**: Export customers to different PlentyONE clients by store

### Export Workflow

```
Magento Customers
       ↓
[Customer Collection]
       ↓
[Store Filtering (Optional)]
       ↓
[Contact Resolution]
       ↓
[Contact Data Generation]
       ↓
[Account Data Generation]
       ↓
[Address Data Generation]
       ↓
[API Export to PlentyONE]
       ↓
[Status Update & Logging]
```

---

## Configuration

The Customer Export Profile configuration is organized into sections that mirror the admin interface. Each section controls specific aspects of the export process.

### 1. Client Configuration

**Purpose**: Connect the profile to your PlentyONE system and manage API credentials.

#### Client

**Field**: `client_id`
**Type**: Dropdown (required)
**Scope**: Global
**Default**: None

Select the PlentyONE client configuration containing API credentials and connection settings for customer synchronization.

**Available Actions**:
- **Edit**: Modify existing client settings (credentials, API URL, user ID)
- **New Client**: Create a new client configuration

**Configuration Requirements**:
- Valid PlentyONE API URL
- API username and password
- Client ID and User ID from PlentyONE
- Active authentication token

:::tip Multiple Profiles
While you can only have one active client, you can create multiple customer export profiles using the same client with different configurations (e.g., different stores, different customer filters).
:::

#### Collect Configuration Data

**Button**: `collect_config_data_btn`
**Action**: Fetch configuration data from PlentyONE
**Purpose**: Download current customer classes, gender options, and referrers from PlentyONE

**When to Use**:
- ✅ After creating or editing client configuration
- ✅ When PlentyONE customer classes have changed
- ✅ Before configuring customer group or gender mappings
- ✅ After adding new referrers in PlentyONE

**What Gets Collected**:
- PlentyONE customer classes (for group mapping)
- Gender options
- Referrer configurations
- Address field options
- Client-specific settings

:::warning Required Step
You must collect configuration data before you can configure customer group mappings or gender mappings. The system needs this data to populate dropdown options.
:::

#### Delete Configuration Data

**Button**: `delete_config_data_btn`
**Action**: Remove cached configuration data
**Purpose**: Clear outdated or incorrect configuration data

**When to Use**:
- ✅ When switching to a different PlentyONE instance
- ✅ To force a fresh configuration data download
- ✅ When configuration data appears corrupted or outdated

**Impact**: After deletion, you must re-collect configuration data before the profile can function properly.

---

### 2. Schedule Configuration

**Purpose**: Automate customer export execution via cron scheduling.

#### Enable Schedule

**Field**: `status`
**Type**: Toggle (Yes/No)
**Default**: Yes
**Scope**: Global

Enable automatic customer export processing via the scheduler. When enabled, customers will be exported to PlentyONE according to the configured schedule.

**When Enabled**:
- Profile executes automatically based on schedule
- Customers in export queue are processed in batches
- Execution history is recorded
- Email notifications sent on errors (if configured)

**When Disabled**:
- Profile only runs via manual execution or CLI commands
- Scheduled cron jobs are skipped
- Queue processing must be triggered manually

#### Schedule

**Field**: `schedule_id`
**Type**: Dropdown (required when scheduling enabled)
**Scope**: Global
**Default**: None

Select the cron schedule that determines when this customer export profile runs automatically.

**Available Actions**:
- **Edit**: Modify existing schedule settings (frequency, time, batch limits)
- **New Schedule**: Create a new cron schedule configuration
- **View Schedules**: See overview of all scheduled tasks and next run times

**Common Schedule Patterns**:
- **Real-time sync**: Every 15 minutes (for new customer registrations)
- **Regular updates**: Every 30-60 minutes (for moderate registration frequency)
- **Daily batch**: Once per day (for low registration frequency)
- **Manual only**: Disable scheduling (for complete manual control)

:::tip Schedule Selection
Choose schedule frequency based on:
- How often new customers register
- Whether queue-based export is enabled
- System resource availability
- Business requirements for sync timing
:::

#### Process Batch Size

**Field**: `process_batch_size`
**Type**: Number
**Default**: 100
**Scope**: Global
**Required**: No

Number of customers to process in each batch during scheduled execution.

**Recommendations**:
- **Small installations** (< 1,000 customers): 100-200
- **Medium installations** (1,000-10,000 customers): 100-150
- **Large installations** (> 10,000 customers): 50-100
- **Limited resources**: Reduce batch size to prevent timeouts

**Performance Impact**:
- **Larger batches**: Faster overall processing, higher memory usage, higher timeout risk
- **Smaller batches**: Slower processing, lower memory usage, more reliable execution

**Memory Considerations**:
- Average memory per customer: ~2-5 MB
- Customer entity: ~500 KB
- Addresses (avg 2): ~1 MB
- API request/response: ~500 KB

#### Enable History

**Field**: `enable_history`
**Type**: Toggle (Yes/No)
**Default**: Yes
**Scope**: Global

Enable logging of all processed customer data to the profile history.

**When Enabled**:
- Detailed execution logs for each export run
- Per-customer processing status and results
- Error tracking and debugging information
- Performance metrics (execution time, memory usage)

**When Disabled**:
- No history records created
- Reduced database storage usage
- Limited troubleshooting capability

:::warning Troubleshooting
Keep history enabled during initial setup and testing. Disable only after the profile is stable and working correctly to reduce database growth.
:::

---

### 3. HTTP API Configuration

**Purpose**: Control PlentyONE API request behavior and pagination settings.

#### API Behaviour

**Field**: `api_behaviour`
**Type**: Dropdown (required)
**Default**: Append
**Scope**: Global

Controls how customer data is sent to PlentyONE during export operations.

**Options**:

**Append** (Recommended)
- Creates new contacts if they don't exist in PlentyONE
- Updates existing contacts with new data
- Preserves existing PlentyONE contacts not in Magento
- **Use for**: Normal operations, incremental updates

**Replace**
- Deletes existing contacts in PlentyONE
- Creates fresh contacts from Magento
- **Destructive operation** - removes all existing contacts
- **Use for**: Initial setup, complete rebuilds only

:::danger Replace Mode
Replace mode permanently deletes all existing contacts in PlentyONE before creating new ones. Use only during initial setup or when explicitly rebuilding the entire customer database.
:::

**Sync**
- Matches Magento customers with PlentyONE contacts
- Updates only matched contacts
- Does not create new contacts
- **Use for**: Updating existing contact data without creating new records

#### API Collection Size

**Field**: `collection_size`
**Type**: Number
**Default**: 150
**Scope**: Global
**Required**: No

Number of customer items returned per page in API requests when collecting data from PlentyONE (not directly used for export, but for configuration data collection).

**Configuration**:
- **Default**: 50
- **Maximum**: 500
- **Recommended**: 150

**When to Adjust**:
- **Large customer classes list**: Increase to 200-500 to reduce API calls during config collection
- **API timeout issues**: Decrease to 50-100 for more reliable requests

---

### 4. Store Configuration

**Purpose**: Map Magento stores to PlentyONE clients and configure referrers for multi-store setups.

#### Store Mapping

**Field**: `store_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Configure which Magento store views export to which PlentyONE client and locale combinations.

**Row Configuration**:

**Store** (required)
- Select Magento store view to export from
- Each store view can have its own mapping
- Supports multi-store, multi-language configurations

**Client** (required)
- PlentyONE client (plentyID) to export to
- Typically matches the client selected in Client Configuration
- Allows for advanced multi-client scenarios (B2B vs B2C)

**Locale** (required)
- PlentyONE locale (language) to use for this store's customer data
- Must match locales configured in PlentyONE
- Determines language for customer communications

**Example Configurations**:

**Single Store**:
```
Store: Default Store View
Client: 1 (Main Store)
Locale: en
```

**Multi-Store B2B/B2C Separation**:
```
Store: B2C Store → Client: 1 (Retail), Locale: en
Store: B2B Store → Client: 2 (Wholesale), Locale: en
```

**Multi-Region Setup**:
```
Store: US Store → Client: 1, Locale: en
Store: UK Store → Client: 1, Locale: en
Store: DE Store → Client: 2, Locale: de
Store: FR Store → Client: 2, Locale: fr
```

#### Enable Store Filter

**Field**: `is_active_store_filter`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Restricts customer export by mapped stores. When enabled, only customers from stores included in the store mapping will be exported.

**When to Enable**:
- ✅ Multi-store setup with different PlentyONE clients for different stores
- ✅ B2B and B2C store separation
- ✅ Regional customer segregation
- ✅ You want to control which store customers get exported

**When to Disable**:
- ❌ Single store setup
- ❌ All customers should export regardless of store
- ❌ You want unified customer database in PlentyONE

**Example Use Case**:
```
Scenario: B2B and B2C separation

Store Mapping:
  - B2C Store → PlentyONE Client 1 (Retail)
  - B2B Store → PlentyONE Client 2 (Wholesale)

Enable Store Filter: Yes

Result:
  - B2C customers only export to Client 1
  - B2B customers only export to Client 2
  - Customers from unmapped stores are not exported
```

:::warning Store Filter Impact
When store filter is enabled, customers registered in stores NOT included in the store mapping will be completely excluded from export. Ensure all desired stores are mapped.
:::

#### Referrer

**Field**: `referer_id`
**Type**: Dropdown (required)
**Scope**: Website
**Default**: None

Select the PlentyONE referrer to associate with exported customers. Referrers identify the source/channel of the customer.

**Available Actions**:
- **New Referrer**: Create a new referrer directly in PlentyONE from Magento admin

**Common Referrer Usage**:
- Different referrer per store (US Store, UK Store, DE Store)
- Different referrer per customer type (B2B, B2C)
- Different referrer per acquisition channel (Web, Mobile App, Partner)

**Example Configurations**:
```
Store: US Store → Referrer: "US Webshop"
Store: UK Store → Referrer: "UK Webshop"
Store: B2B Store → Referrer: "B2B Portal"
```

:::tip Referrer Best Practices
1. Use descriptive referrer names that identify the source
2. Create separate referrers for different stores or customer types
3. Referrers help track customer acquisition in PlentyONE reports
4. Once set, avoid changing referrers for existing customers
:::

---

### 5. Customer Configuration

**Purpose**: Configure customer data export, group mappings, gender mappings, and address field mappings.

#### Enable Customer Export

**Field**: `is_active`
**Type**: Toggle (Yes/No)
**Default**: Yes
**Scope**: Global

Enable or disable customer contact creation in PlentyONE.

**When Enabled**:
- Customer data is exported to PlentyONE contacts
- All customer configuration options become available
- Customer group and gender mappings are applied

**When Disabled**:
- Customer export is skipped entirely
- No contacts created or updated in PlentyONE
- Other configuration options are hidden
- Use when you only want to export orders without customer data

:::info Use Case
Disable if you manage customers directly in PlentyONE and only want to export orders. Most implementations should keep this enabled.
:::

#### Create Address

**Field**: `create_address`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Enable automatic creation of customer addresses in PlentyONE when exporting customers.

**When Enabled**:
- Customer billing and shipping addresses are exported
- Address field mappings are applied
- Addresses linked to PlentyONE contact

**When Disabled**:
- Only contact information is exported
- No address records created in PlentyONE
- Address field mappings are ignored

**When to Enable**:
- ✅ You need full customer address data in PlentyONE
- ✅ Order fulfillment requires address information
- ✅ Marketing segmentation by region
- ✅ Customer service needs complete customer records

**When to Disable**:
- ❌ Addresses are managed separately (e.g., during order export)
- ❌ You want to reduce API calls
- ❌ Address data privacy concerns

#### Default Group

**Field**: `default_group`
**Type**: Dropdown
**Scope**: Global
**Default**: None
**Required**: No

Select the default PlentyONE customer class to assign to new contacts when no group mapping matches.

**How It Works**:
1. System checks if customer's Magento group has a mapping in Customer Group Mapping
2. If mapping exists: Uses mapped PlentyONE class
3. If no mapping: Uses default group specified here
4. If no default group: Uses system configuration default

**Use Cases**:
- **Fallback for unmapped groups**: Ensures all customers get assigned a class
- **New customer default**: Standard class for new registrations
- **Guest customers**: Default class for guest checkouts

**Example**:
```
Default Group: "Standard Customer"

Scenario 1:
  Magento Group: "General" (not mapped)
  Result: Assigned "Standard Customer" in PlentyONE

Scenario 2:
  Magento Group: "Wholesale" (mapped to "Business Customer")
  Result: Assigned "Business Customer" (mapping takes precedence)
```

#### Customer Group Mapping

**Field**: `group_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Map Magento customer groups to PlentyONE customer classes to maintain group structure across systems.

**Row Configuration**:

**Magento Group** (required)
- Select Magento customer group to export from
- Groups from Magento customer group configuration
- Includes General, Wholesale, Retailer, VIP, etc.

**Plenty Group** (required)
- Select corresponding PlentyONE customer class
- Classes must exist in PlentyONE before mapping
- Available after collecting configuration data

**Common Mappings**:
```
Magento Group: "General" → Plenty Group: "Standard Customer"
Magento Group: "Wholesale" → Plenty Group: "Business Customer"
Magento Group: "VIP" → Plenty Group: "Premium Customer"
Magento Group: "Retailer" → Plenty Group: "Retail Partner"
```

**B2B/B2C Example**:
```
B2C Groups:
  General → Standard Customer
  VIP → Premium Customer

B2B Groups:
  Wholesale → Business Customer (Wholesale Pricing)
  Distributor → Business Customer (Distributor Pricing)
```

**Regional Pricing Example**:
```
US General → US Retail Customer
UK General → UK Retail Customer
EU General → EU Retail Customer
```

:::tip Group Mapping Strategy
1. Map all active Magento customer groups
2. Use descriptive PlentyONE class names
3. Consider pricing tiers when mapping
4. Set default group for unmapped scenarios
5. Test with customers from each group
:::

#### Gender Mapping

**Field**: `gender_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Map Magento customer prefix values to PlentyONE gender field values.

**Row Configuration**:

**Magento Prefix** (required)
- Select customer prefix/salutation from Magento
- Common values: Mr., Mrs., Ms., Dr., etc.
- Custom prefixes if configured in Magento

**PlentyONE Gender** (required)
- Select corresponding gender in PlentyONE
- Options: Male (1), Female (2), Diverse (3), Company (4)
- Used for proper salutation in PlentyONE communications

**Common Mappings**:
```
Magento Prefix: "Mr." → PlentyONE Gender: "Male"
Magento Prefix: "Mrs." → PlentyONE Gender: "Female"
Magento Prefix: "Ms." → PlentyONE Gender: "Female"
Magento Prefix: "Dr." → PlentyONE Gender: "Diverse"
Magento Prefix: "Company" → PlentyONE Gender: "Company"
```

**International Example**:
```
English:
  Mr. → Male
  Mrs. → Female
  Ms. → Female

German:
  Herr → Male
  Frau → Female

French:
  M. → Male
  Mme → Female
  Mlle → Female
```

:::info Gender Mapping Purpose
Gender mapping ensures proper salutation in PlentyONE for marketing emails, invoices, and customer communications. Not required for functionality but improves customer experience.
:::

#### Address Field Mapping

**Field**: `address_field_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Map Magento address fields to PlentyONE address fields for comprehensive address data export.

**Row Configuration**:

**Magento Address Field** (required)
- Select Magento address field to export from
- Standard fields: firstname, lastname, street, city, postcode, country_id, etc.
- Custom address attributes if configured

**Client Address Field** (required)
- Select corresponding PlentyONE address field
- Fields must exist in PlentyONE
- Available after collecting configuration data

**Required Field Mappings**:

| Magento Field | PlentyONE Field | Required | Description |
|---------------|-----------------|----------|-------------|
| firstname | firstName | Yes | First name |
| lastname | lastName | Yes | Last name |
| street | street | Yes | Street address |
| city | town | Yes | City/Town |
| postcode | postalCode | Yes | Postal/ZIP code |
| country_id | countryId | Yes | Country code |

**Recommended Field Mappings**:

| Magento Field | PlentyONE Field | Use Case |
|---------------|-----------------|----------|
| company | companyName | B2B customers |
| telephone | phone | Contact information |
| region | state | US/CA/AU addresses |
| vat_id | vatNumber | EU B2B, tax validation |
| fax | fax | Legacy business contacts |

**Custom Field Example**:
```
Custom Magento Attribute: "delivery_instructions"
PlentyONE Custom Field: "deliveryNotes"
Mapping: delivery_instructions → deliveryNotes

Result: Special delivery instructions exported to PlentyONE
```

**Multi-Line Street Address**:
```
Magento has multi-line street (street[0], street[1], street[2])
PlentyONE has street, address2, address3

Mappings:
  street[0] → street (Street name and number)
  street[1] → address2 (Building, floor, apartment)
  street[2] → address3 (Additional info)
```

:::tip Address Field Best Practices
1. Always map all required fields (firstname, lastname, street, city, postcode, country)
2. Map company for B2B stores
3. Map telephone for customer service
4. Map region/state for US, Canada, Australia
5. Map VAT ID for EU B2B customers
6. Test address export with various address formats
7. Verify multi-line street addresses are handled correctly
:::

---

### 6. Event Configuration

**Purpose**: Configure automatic customer export triggers (reserved for future use).

**Field**: `event_config`
**Type**: Fieldset
**Scope**: Global

This section is currently empty and reserved for future event-based export triggers similar to Category Export observers.

**Future Capabilities** (not currently implemented):
- Automatic customer queue addition on registration
- Automatic export on customer update
- Webhook triggers for customer changes

**Current Workaround**:
Use CLI commands or scheduled exports with queue processing to achieve similar automation:
```bash
# Add customer to queue manually
bin/magento softcommerce:plenty:customer:queue --add --entity-id=123

# Process queue on schedule
bin/magento softcommerce:plenty:customer:export --profile-id=4 --queue
```

---

### 7. Log Configuration

**Purpose**: Control diagnostic logging of API requests and responses for troubleshooting.

#### Log Request Data to File

**Field**: `is_active_request_log`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Enable logging of all API request data sent to PlentyONE to file system.

**Log Location**: `var/log/softcommerce/plenty/customer_export_request.log`

**What Gets Logged**:
- Complete API request URLs
- Request headers (including authentication tokens)
- Request body payload (customer and address data being sent)
- Request timestamps
- Request method (POST, PUT, DELETE)

**When to Enable**:
- ✅ Troubleshooting customer export failures
- ✅ Debugging data mapping issues
- ✅ Verifying correct data is being sent to PlentyONE
- ✅ API integration issues or errors
- ✅ During initial setup and testing

**When to Disable**:
- ❌ Production environment with stable integration
- ❌ Concerned about disk space usage
- ❌ Customer data privacy concerns
- ❌ High-frequency exports generating large logs

:::warning Security and Privacy Consideration
Request logs contain API authentication tokens and complete customer personal data (names, addresses, phone numbers, email addresses). Ensure log files are properly secured, access is restricted, and logs comply with GDPR/privacy regulations. Do not share logs publicly without sanitizing all personal information.
:::

#### Log Response Data to File

**Field**: `is_active_response_log`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Enable logging of all API response data received from PlentyONE to file system.

**Log Location**: `var/log/softcommerce/plenty/customer_export_response.log`

**What Gets Logged**:
- Complete API response body
- Response headers
- HTTP status codes (200, 400, 500, etc.)
- Error messages from PlentyONE
- Contact IDs and address IDs created
- Response timestamps
- Response processing time

**When to Enable**:
- ✅ Troubleshooting PlentyONE API errors
- ✅ Debugging contact creation failures
- ✅ Investigating data validation errors
- ✅ Analyzing API performance issues
- ✅ During initial setup and testing

**When to Disable**:
- ❌ Production environment with stable integration
- ❌ Log files growing too large
- ❌ No active troubleshooting needed
- ❌ Performance concerns with logging overhead

**Log Analysis Tips**:
1. Check for HTTP error codes (400, 401, 403, 404, 500)
2. Look for validation error messages from PlentyONE
3. Verify contact IDs are being returned correctly
4. Monitor response times for performance issues
5. Cross-reference with request logs to see full API interaction
6. Check for duplicate contact warnings

:::tip Temporary Logging
Enable logging only when actively troubleshooting issues. Leave disabled during normal operations to conserve disk space, maintain optimal performance, and protect customer privacy.
:::

---

## Common Workflows

### Initial Customer Database Export

**Scenario**: First-time export of Magento customer database to PlentyONE during integration setup.

**Configuration**:
```
Client Configuration:
  ✓ Client: Main Store Client
  ✓ Collect Configuration Data: Execute

Schedule Configuration:
  ✓ Enable Schedule: No (manual execution for initial setup)

API Configuration:
  ✓ API Behaviour: Append (create new contacts)
  ✓ API Collection Size: 150

Store Configuration:
  ✓ Store: Default Store View → Client: 1, Locale: en
  ✓ Enable Store Filter: No (export all customers)
  ✓ Referrer: "Magento Webshop"

Customer Configuration:
  ✓ Enable Customer Export: Yes
  ✓ Create Address: Yes
  ✓ Default Group: "Standard Customer"
  ✓ Customer Group Mapping:
    - General → Standard Customer
    - Wholesale → Business Customer
  ✓ Gender Mapping:
    - Mr. → Male
    - Mrs. → Female
  ✓ Address Field Mapping:
    - firstname → firstName
    - lastname → lastName
    - street → street
    - city → town
    - postcode → postalCode
    - country_id → countryId
    - company → companyName
    - telephone → phone

Log Configuration:
  ✓ Log Requests: Yes (for initial testing)
  ✓ Log Responses: Yes (for verification)
```

**Steps**:
1. Create and configure client connection
2. Collect configuration data from PlentyONE
3. Configure store mapping and referrer
4. Set up customer group mappings
5. Configure address field mappings (all required fields)
6. Enable request/response logging
7. Start with small test batch (10-50 customers):
   ```bash
   bin/magento softcommerce:plenty:customer:export --profile-id=4 --entity-ids=1,2,3,4,5
   ```
8. Verify contacts and addresses in PlentyONE
9. Review logs for any errors or warnings
10. Process full customer database:
    ```bash
    bin/magento softcommerce:plenty:customer:export --profile-id=4
    ```
11. Monitor execution and review final statistics
12. Disable logging after successful completion
13. Enable scheduling for ongoing sync

---

### Automated New Customer Export

**Scenario**: Automatically export new customer registrations to PlentyONE as they occur.

**Configuration**:
```
Client Configuration:
  ✓ Client: Main Store Client

Schedule Configuration:
  ✓ Enable Schedule: Yes
  ✓ Schedule: Every 15 minutes
  ✓ Process Batch Size: 50
  ✓ Enable History: Yes

API Configuration:
  ✓ API Behaviour: Append
  ✓ API Collection Size: 150

Store Configuration:
  ✓ Store: Default Store View → Client: 1, Locale: en
  ✓ Enable Store Filter: No
  ✓ Referrer: "Magento Webshop"

Customer Configuration:
  ✓ Enable Customer Export: Yes
  ✓ Create Address: Yes
  ✓ Default Group: "Standard Customer"

Log Configuration:
  ✓ Log Requests: No
  ✓ Log Responses: No
```

**Workflow**:
1. Customer registers on Magento storefront
2. Customer is added to export queue (via custom observer or manual queue addition)
3. Within 15 minutes, scheduled export runs
4. Customer contact and addresses exported to PlentyONE
5. History recorded with execution details
6. Customer can place orders immediately as PlentyONE contact exists

**Queue Management**:
```bash
# View customers in export queue
bin/magento softcommerce:plenty:customer:queue --list

# Add new customer to queue (can be automated via observer)
bin/magento softcommerce:plenty:customer:queue --add --entity-id=500

# Process queue manually (optional, schedule handles this)
bin/magento softcommerce:plenty:customer:export --profile-id=4 --queue
```

---

### Multi-Store B2B/B2C Separation

**Scenario**: Separate B2B and B2C customers to different PlentyONE clients with different customer classes.

**Configuration**:
```
Store Configuration:
  ✓ Store: B2C Store → Client: 1 (Retail), Locale: en
  ✓ Store: B2B Store → Client: 2 (Wholesale), Locale: en
  ✓ Enable Store Filter: Yes (critical for separation)
  ✓ Referrer (B2C): "B2C Webshop"
  ✓ Referrer (B2B): "B2B Portal"

Customer Configuration:
  ✓ Enable Customer Export: Yes
  ✓ Create Address: Yes
  ✓ Default Group (B2C): "Standard Customer"
  ✓ Default Group (B2B): "Business Customer"
  ✓ Customer Group Mapping (B2C Store):
    - General → Standard Customer (Retail Pricing)
    - VIP → Premium Customer (VIP Pricing)
  ✓ Customer Group Mapping (B2B Store):
    - Wholesale → Business Customer (Wholesale Pricing)
    - Distributor → Distributor Customer (Distributor Pricing)
  ✓ Address Field Mapping:
    - company → companyName (important for B2B)
    - vat_id → vatNumber (important for B2B tax)
    - All standard required fields

Schedule Configuration:
  ✓ Enable Schedule: Yes
  ✓ Schedule: Every 30 minutes
```

**How It Works**:
1. B2C customers register on B2C store
2. Export to Client 1 (Retail) with retail customer class
3. B2B customers register on B2B store
4. Export to Client 2 (Wholesale) with business customer class
5. Different pricing and fulfillment rules apply per client
6. Referrers identify source for reporting

**Benefits**:
- Separate customer databases in PlentyONE
- Different pricing structures
- Different fulfillment workflows
- Separate reporting and analytics
- Clear B2B vs B2C segmentation

---

## CLI Commands

### Execute Customer Export

```bash
# Export all customers
bin/magento softcommerce:plenty:customer:export --profile-id=4

# Export specific customers by ID (comma-separated)
bin/magento softcommerce:plenty:customer:export --profile-id=4 --entity-ids=100,101,102

# Export new customers only (customers not yet exported)
bin/magento softcommerce:plenty:customer:export --profile-id=4 --new-only

# Export customers from specific store
bin/magento softcommerce:plenty:customer:export --profile-id=4 --store-id=1

# Process export queue (customers added to queue)
bin/magento softcommerce:plenty:customer:export --profile-id=4 --queue

# Force re-export (ignores previous export status)
bin/magento softcommerce:plenty:customer:export --profile-id=4 --force

# Export with verbose output for debugging
bin/magento softcommerce:plenty:customer:export --profile-id=4 -vvv
```

### Manage Export Queue

```bash
# View all customers in export queue
bin/magento softcommerce:plenty:customer:queue --list

# View queue with details
bin/magento softcommerce:plenty:customer:queue --list --verbose

# Add specific customer to export queue
bin/magento softcommerce:plenty:customer:queue --add --entity-id=123

# Add multiple customers to queue
bin/magento softcommerce:plenty:customer:queue --add --entity-ids=123,124,125

# Remove customer from export queue
bin/magento softcommerce:plenty:customer:queue --remove --entity-id=123

# Clear entire export queue (use with caution)
bin/magento softcommerce:plenty:customer:queue --clear

# View queue statistics
bin/magento softcommerce:plenty:customer:queue --stats
```

### Manage Configuration Data

```bash
# Collect customer configuration data from PlentyONE
bin/magento softcommerce:plenty:customer:collect-config --client-id=1

# Force re-collection of configuration data
bin/magento softcommerce:plenty:customer:collect-config --client-id=1 --force

# Delete configuration data
bin/magento softcommerce:plenty:customer:delete-config --client-id=1
```

### Profile Management

```bash
# List all customer export profiles
bin/magento softcommerce:profile:list --type=plenty_customer_export

# View profile configuration
bin/magento softcommerce:profile:info --profile-id=4

# Enable/disable profile scheduling
bin/magento softcommerce:profile:schedule:enable --profile-id=4
bin/magento softcommerce:profile:schedule:disable --profile-id=4
```

### Debugging and Diagnostics

```bash
# Validate profile configuration
bin/magento softcommerce:plenty:customer:validate --profile-id=4

# Test API connection for profile
bin/magento softcommerce:plenty:customer:test-connection --profile-id=4

# View recent export history
bin/magento softcommerce:profile:history --profile-id=4 --limit=10

# View export history with errors only
bin/magento softcommerce:profile:history --profile-id=4 --status=error

# Clear customer export history
bin/magento softcommerce:profile:history:clear --profile-id=4 --older-than=30

# Check customer PlentyONE contact mapping
bin/magento softcommerce:plenty:customer:check-mapping --customer-id=123
```

---

## Troubleshooting

### Customers Not Exporting to PlentyONE

**Symptoms**:
- Customers exist in Magento but don't appear in PlentyONE
- Export executes but no contacts are created
- No errors reported in execution history

**Diagnostic Steps**:

1. **Check Customer Export Enable Setting**
   - Navigate to profile → Customer Configuration → Enable Customer Export
   - Verify it's set to "Yes"
   - If disabled, no customers will export

2. **Verify Store Filter Settings**
   ```bash
   # Check if store filter is enabled
   bin/magento config:show softcommerce_plenty_customer/store_config/is_active_store_filter
   ```
   - If enabled, check if customer's store is in store mapping
   - Customer stores must be mapped for export

3. **Check Store Mapping Configuration**
   - Navigate to profile → Store Configuration → Store Mapping
   - Verify customer's store view has proper client and locale mapping
   - Ensure all active stores are included if store filter is enabled

4. **Review Customer Group Mapping**
   - Check if customer's group is mapped
   - Verify default group is set for fallback
   - Unmapped groups without default may fail export

5. **Review API Response Logs**
   - Enable response logging in profile configuration
   - Execute export manually
   - Check `var/log/softcommerce/plenty/customer_export_response.log`
   - Look for API error codes (400, 401, 403, 404, 500) or validation errors

6. **Verify Client Configuration**
   ```bash
   # Test API connection
   bin/magento softcommerce:plenty:customer:test-connection --profile-id=4
   ```
   - Ensure client has valid credentials
   - Check API token hasn't expired
   - Verify client has permissions in PlentyONE

7. **Check Customer Data Completeness**
   - Verify customer has email address (required)
   - Check customer has at least first name or last name
   - Ensure customer status is active

**Common Solutions**:
- Enable customer export in Customer Configuration
- Add missing stores to store mapping
- Configure default group for unmapped customer groups
- Fix store filter settings (enable/disable as needed)
- Refresh API credentials if authentication failing
- Ensure required customer fields are populated

---

### Wrong Customer Class in PlentyONE

**Symptoms**:
- Customers exported but assigned incorrect PlentyONE customer class
- All customers assigned same class regardless of Magento group
- B2B customers receiving B2C pricing or vice versa

**Diagnostic Steps**:

1. **Review Customer Group Mapping**
   - Navigate to profile → Customer Configuration → Customer Group Mapping
   - Verify Magento groups are mapped correctly to PlentyONE classes
   - Direction is Magento → PlentyONE (export), not import

2. **Check Customer's Magento Group**
   ```bash
   # Check customer group
   bin/magento customer:info --customer-id=123 | grep group
   ```
   - Verify customer is actually in the expected Magento group
   - Customer might be in different group than assumed

3. **Verify Default Group Setting**
   - Check profile → Customer Configuration → Default Group
   - Default applies when no mapping matches
   - May be overriding expected mappings

4. **Check Configuration Data Collection**
   ```bash
   # Re-collect configuration data
   bin/magento softcommerce:plenty:customer:collect-config --client-id=1
   ```
   - PlentyONE classes must be collected for mappings to work
   - Outdated collection data may not include new classes

5. **Review PlentyONE Classes**
   - Log into PlentyONE admin
   - Navigate to Settings → CRM → Customer Classes
   - Verify mapped classes actually exist in PlentyONE
   - Check class IDs match

**Solutions**:

1. **Fix Customer Group Mappings**
   - Update mappings to correct PlentyONE → Magento direction
   - Map all active Magento customer groups
   - Test with customer from each group

2. **Update Default Group**
   - Set appropriate default for unmapped scenarios
   - Consider if default should be used at all
   - Remove default if all groups are mapped

3. **Re-Export Affected Customers**
   ```bash
   # Re-export customers with force flag
   bin/magento softcommerce:plenty:customer:export --profile-id=4 --force --entity-ids=100,101,102
   ```
   - Force flag overwrites existing contact data
   - Verify correct class after re-export

4. **Manual Class Correction in PlentyONE**
   - If many customers affected, may need bulk update in PlentyONE
   - Use PlentyONE's customer class bulk edit feature
   - Then ensure mappings are correct for future exports

---

### Missing or Incorrect Address Data

**Symptoms**:
- Customers exported but addresses missing in PlentyONE
- Address data incomplete (missing city, postcode, etc.)
- Wrong address fields mapped

**Diagnostic Steps**:

1. **Check Create Address Setting**
   - Navigate to profile → Customer Configuration → Create Address
   - Verify it's enabled (Yes)
   - If disabled, addresses won't export even with mappings

2. **Verify Address Field Mappings**
   - Navigate to profile → Customer Configuration → Address Field Mapping
   - Check all required fields are mapped:
     - firstname → firstName
     - lastname → lastName
     - street → street
     - city → town
     - postcode → postalCode
     - country_id → countryId

3. **Check Customer Has Addresses**
   ```bash
   # View customer addresses
   bin/magento customer:info --customer-id=123
   ```
   - Customer must have at least one address in Magento
   - Default billing or shipping address should exist

4. **Review Address Data Completeness**
   - Check customer addresses have all required fields populated
   - Verify street, city, postcode, country are not empty
   - Check for validation errors in address

5. **Enable Request Logging**
   - Enable request logging in profile configuration
   - Execute export manually
   - Check `var/log/softcommerce/plenty/customer_export_request.log`
   - Verify address data is being sent in request

6. **Review PlentyONE Address Requirements**
   - Log into PlentyONE admin
   - Check address field requirements
   - Some fields may be mandatory in PlentyONE but not Magento

**Solutions**:

1. **Enable Create Address**
   - Set Create Address to "Yes" in Customer Configuration
   - Save profile and re-export customers

2. **Complete Address Field Mappings**
   - Add all required field mappings
   - Ensure direction is Magento → PlentyONE
   - Include optional but recommended fields (company, telephone, region)
   - Example complete mapping:
     ```
     firstname → firstName
     lastname → lastName
     company → companyName
     street → street
     city → town
     region → state
     postcode → postalCode
     country_id → countryId
     telephone → phone
     ```

3. **Fix Customer Address Data**
   - Ensure customers have complete addresses in Magento
   - Set default billing/shipping addresses
   - Validate address data before export

4. **Re-Export with Address Creation**
   ```bash
   # Re-export customers to create addresses
   bin/magento softcommerce:plenty:customer:export --profile-id=4 --force
   ```
   - Addresses should be created/updated on re-export
   - Verify in PlentyONE after completion

---

### Duplicate Contacts in PlentyONE

**Symptoms**:
- Same customer appears multiple times with different IDs in PlentyONE
- Multiple contacts with same email address
- Contact resolution failing

**Diagnostic Steps**:

1. **Check API Behaviour Setting**
   - Navigate to profile → HTTP API Configuration → API Behaviour
   - If set to "Replace", shouldn't cause duplicates (deletes first)
   - If set to "Append", duplicates may occur if matching fails

2. **Review Email Addresses**
   ```bash
   # Check for duplicate emails in Magento
   bin/magento customer:list | grep email@example.com
   ```
   - Duplicate emails in Magento will create separate contacts
   - Magento allows duplicate emails for different stores (by design)

3. **Check Contact Resolution Logic**
   - Enable request/response logging
   - Check logs for contact resolution attempts
   - Look for failed email matches

4. **Review PlentyONE Contact Database**
   ```sql
   # In PlentyONE database (if you have access)
   SELECT * FROM contacts WHERE email = 'customer@example.com';
   ```
   - Check how many contacts exist with same email
   - Verify contact IDs

5. **Check Extension Attributes**
   - Verify Magento customer has `plenty_contact_id` stored
   - Missing contact ID may cause duplicate creation
   ```bash
   # Check customer plenty contact ID
   bin/magento softcommerce:plenty:customer:check-mapping --customer-id=123
   ```

**Solutions**:

1. **Clean Up Duplicates in PlentyONE**
   - Manually delete duplicate contacts in PlentyONE admin
   - Keep only the most recent/correct contact
   - Note the correct contact ID

2. **Update Contact Mapping in Magento**
   ```sql
   # In Magento database
   UPDATE plenty_customer
   SET contact_id = {correct_contact_id}
   WHERE customer_id = {magento_customer_id};
   ```
   - Links Magento customer to correct PlentyONE contact
   - Prevents future duplication

3. **Re-Export with Correct Mapping**
   ```bash
   # Re-export will update existing contact, not create duplicate
   bin/magento softcommerce:plenty:customer:export --profile-id=4 --entity-ids=123
   ```

4. **Implement Email Uniqueness**
   - Consider making email unique across all stores in Magento
   - Or use store filter with separate PlentyONE clients per store

5. **Use Replace Mode for Fresh Start** (extreme measure)
   - Only if many duplicates and manageable customer count
   - Set API Behaviour to "Replace"
   - Execute export (will delete all and recreate)
   - Immediately set back to "Append"
   - **Warning**: Destructive operation, use with extreme caution

---

### Profile Execution Timeouts

**Symptoms**:
- Export fails with timeout error
- PHP fatal error: Maximum execution time exceeded
- Incomplete customer export with some customers missing

**Diagnostic Steps**:

1. **Check Batch Size Configuration**
   - Large batch sizes with many addresses can cause timeouts
   - Review Schedule Configuration → Process Batch Size
   - Current default: 100 customers per batch

2. **Review PHP Configuration**
   ```bash
   php -i | grep max_execution_time
   php -i | grep memory_limit
   ```
   - Default PHP execution time may be too low (60-120 seconds)
   - Memory limit may be insufficient for customer + address processing
   - Average memory per customer: 2-5 MB

3. **Check Customer Complexity**
   - Customers with many addresses take longer to process
   - Each address = separate API call
   - 10 customers with 3 addresses each = 30 API calls for addresses alone

4. **Review API Performance**
   - PlentyONE API may be responding slowly
   - Check response times in logs
   - Network latency to PlentyONE servers

**Solutions**:

1. **Reduce Batch Size**
   - Decrease Process Batch Size from 100 to 50
   - Or even 25 for very complex customer data
   - More batches compensate for smaller size
   - Example:
     ```
     Before: 100 customers/batch × 3 min = 3 min per batch
     After: 50 customers/batch × 1.5 min = 1.5 min per batch (more reliable)
     ```

2. **Increase PHP Limits**
   - Update `php.ini` settings:
     ```ini
     max_execution_time = 1800 ; 30 minutes
     memory_limit = 2G ; 2 gigabytes
     ```
   - Or override in Magento `.htaccess`:
     ```apache
     php_value max_execution_time 1800
     php_value memory_limit 2G
     ```
   - Restart web server/PHP-FPM after changes

3. **Use CLI for Large Exports**
   - CLI has higher default timeout limits
   - Run manual exports via CLI instead of admin panel
   ```bash
   bin/magento softcommerce:plenty:customer:export --profile-id=4
   ```
   - Schedule using system cron instead of Magento cron

4. **Disable Create Address Temporarily**
   - If addresses aren't critical immediately
   - Export customers first (faster)
   - Then enable Create Address and re-export with force flag

5. **Split Into Multiple Runs**
   - Export by customer segments
   ```bash
   # Export customers 1-1000
   bin/magento softcommerce:plenty:customer:export --profile-id=4 --entity-ids=1-1000

   # Export customers 1001-2000
   bin/magento softcommerce:plenty:customer:export --profile-id=4 --entity-ids=1001-2000
   ```

6. **Schedule During Off-Peak**
   - Run large exports during low-traffic periods
   - 2 AM - 6 AM typically has better API performance
   - Less system resource contention

---

### API Rate Limiting Issues

**Symptoms**:
- Export slows down significantly mid-process
- HTTP 429 (Too Many Requests) errors
- API responds with rate limit warnings

**Diagnostic Steps**:

1. **Check PlentyONE API Limits**
   - Default: 10,000 requests per hour
   - Contact API: ~2-3 requests per customer (contact + addresses)
   - Calculate: 100 customers × 3 requests = 300 requests per batch

2. **Review Export Frequency**
   - Multiple profiles running simultaneously
   - Other integrations using same PlentyONE API
   - Check total API call volume

3. **Monitor Response Times**
   ```bash
   # Enable response logging and check times
   tail -f var/log/softcommerce/plenty/customer_export_response.log | grep "response_time"
   ```

**Solutions**:

1. **Reduce Batch Size**
   - Smaller batches = fewer simultaneous API calls
   - Reduce from 100 to 50 or 25

2. **Adjust Schedule Frequency**
   - Increase time between runs (every 30 min instead of 15)
   - Spread API load over time

3. **Coordinate with Other Profiles**
   - Don't run customer, order, and product exports simultaneously
   - Stagger schedule times:
     ```
     Customer Export: Every hour at :00
     Order Export: Every hour at :15
     Product Export: Every hour at :30
     ```

4. **Contact PlentyONE Support**
   - Request higher API rate limits if needed
   - Upgrade to premium API tier if available

---

## Best Practices

### Initial Setup

1. **Plan Before Execution**
   - Document customer data requirements
   - Map out customer groups and corresponding PlentyONE classes
   - Identify required address fields
   - Plan multi-store strategy if applicable

2. **Test with Small Batch First**
   - Export 5-10 test customers before full export
   - Verify contacts appear correctly in PlentyONE
   - Check all address fields are populated
   - Validate customer group assignments

3. **Verify All Mappings**
   - Customer group mapping complete
   - Gender mapping configured
   - Address field mapping includes all required fields
   - Store mapping configured if multi-store

4. **Enable Logging Initially**
   - Turn on request and response logging during setup
   - Review logs to understand data flow
   - Identify and fix issues early
   - Disable after stable operation

5. **Start with Manual Execution**
   - Disable scheduling during initial setup
   - Execute manually and review results
   - Enable scheduling only after successful manual runs

### Ongoing Operations

1. **Monitor Export Queue**
   - Regularly check queue size and status
   ```bash
   bin/magento softcommerce:plenty:customer:queue --stats
   ```
   - Clear stuck items and resolve issues
   - Don't let queue grow unbounded

2. **Review Execution History**
   - Periodically check profile history for errors
   ```bash
   bin/magento softcommerce:profile:history --profile-id=4 --limit=20
   ```
   - Set up email notifications for failures
   - Track execution times for performance trends

3. **Maintain Clean Logs**
   - Keep logging disabled during normal operations
   - Enable only when troubleshooting
   - Rotate or clear old log files
   ```bash
   # Clear logs older than 30 days
   find var/log/softcommerce/plenty/ -name "customer_*" -mtime +30 -delete
   ```

4. **Optimize Schedule Frequency**
   - Match frequency to business needs
   - Consider: How often do new customers register?
   - Balance: Real-time needs vs. system resources

5. **Regular Configuration Review**
   - Quarterly review of profile configuration
   - Update mappings when adding customer groups
   - Verify API credentials are current
   - Test with new customer registrations

6. **Keep Configuration Data Fresh**
   - Re-collect when PlentyONE classes change
   - After adding new customer groups in PlentyONE
   - When dropdown options appear outdated

### Customer Data Management

1. **Ensure Data Quality**
   - Validate email addresses before export
   - Require complete addresses at registration
   - Implement address validation in checkout
   - Keep customer data clean in Magento

2. **Handle Duplicate Emails**
   - Consider email uniqueness policy
   - Use store filter for multi-store separation
   - Document how duplicates are handled
   - Test duplicate scenarios

3. **B2B Customer Handling**
   - Always map company name for B2B
   - Map VAT ID for EU B2B customers
   - Use appropriate customer groups
   - Assign correct PlentyONE business classes

4. **Address Management**
   - Map all required address fields
   - Include telephone for customer service
   - Map region/state for applicable countries
   - Test various address formats (US, EU, Asia)

### Performance Optimization

1. **Appropriate Batch Sizes**
   - Start with default (100) and adjust
   - Reduce if timeouts occur
   - Consider customer complexity (number of addresses)
   - Monitor memory usage

2. **Schedule During Off-Peak**
   - Run large exports during low-traffic periods
   - Avoid peak shopping hours
   - Better API performance late night/early morning

3. **Address Creation Strategy**
   - If many addresses per customer, consider smaller batches
   - Test with/without address creation enabled
   - Assess if all addresses need immediate export

4. **Memory Management**
   - Profile has built-in memory cleanup
   - Force garbage collection between batches
   - Monitor PHP memory usage during exports
   - Increase PHP memory limit if needed

### Security and Privacy

1. **Protect Customer Data**
   - Restrict log file access (contains PII)
   - Log files have names, addresses, emails, phones
   - Ensure compliance with GDPR/privacy regulations
   - Don't commit logs to version control
   - Sanitize logs before sharing for support

2. **Secure API Credentials**
   - Store credentials in `env.php` or environment variables
   - Rotate API passwords periodically
   - Use API users with minimal required permissions
   - Monitor API access logs for unusual activity

3. **Data Retention**
   - Define customer data retention policy
   - Clear old export history regularly
   - Document data storage and transmission
   - Ensure GDPR compliance for EU customers

4. **Backup Before Major Changes**
   - Export profile configuration before updates
   - Backup PlentyONE contact database before Replace mode
   - Keep staging synchronized with production
   - Document all configuration changes

### Multi-Store Configurations

1. **Store Filter Strategy**
   - Enable for clear B2B/B2C separation
   - Use separate PlentyONE clients per business type
   - Document which stores export to which clients
   - Test thoroughly before production

2. **Referrer Management**
   - Use descriptive referrer names
   - Different referrer per store or customer type
   - Track customer acquisition in PlentyONE reports
   - Don't change referrers after initial setup

3. **Customer Group Strategy**
   - Plan group structure for multi-store
   - Consider regional pricing differences
   - Map groups appropriately per store
   - Test with customers from each store/group combination

4. **Testing Per Store**
   - Test customer export from each store view
   - Verify correct client assignment
   - Check locale/language settings
   - Validate group and referrer assignments

---

## Related Documentation

- [Customer Import Profile](/docs/profiles/customer-import) - Import customers from PlentyONE to Magento
- [Order Export Profile](/docs/profiles/order-export) - Export orders with customer references
- [About Profiles](/docs/profiles/about-profiles) - Overview of profile system
- [Creating a Profile](/docs/profiles/create-profile) - General profile creation guide
- [Client Configuration](/docs/configuration/client) - PlentyONE client setup and management

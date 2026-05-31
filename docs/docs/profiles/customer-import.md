---
sidebar_position: 7
title: Customer Import Profile
description: Import customers from PlentyONE to Magento using the Customer Import Profile
---

# Customer Import Profile

The **Customer Import Profile** synchronizes customer data from PlentyONE to Magento, creating and updating customer accounts, addresses, and related information. This profile enables automatic or manual import of contacts from PlentyONE's ERP system to maintain consistent customer data across both platforms.

## Overview

**Profile Type ID**: `plenty_customer_import`
**Direction**: PlentyONE → Magento
**Purpose**: Import customer accounts, addresses, groups, and contact details from PlentyONE to Magento

### What Gets Imported

- **Customer Accounts**: Complete customer information as Magento customer entities
- **Customer Addresses**: Billing and shipping addresses with full details
- **Customer Groups**: PlentyONE customer classes mapped to Magento customer groups
- **Customer Prefix/Gender**: PlentyONE gender values mapped to Magento prefixes
- **Account Information**: Email, names, phone, company, tax ID
- **Custom Attributes**: Configurable address field mappings for custom data
- **Multi-Store Assignment**: Customers assigned to correct website/store scope

### Primary Use Cases

- **Marketplace Integration**: Import customers from Amazon, eBay orders processed in PlentyONE
- **ERP Migration**: Import existing customer base from PlentyONE to new Magento installation
- **Multi-Channel Sync**: Synchronize customers from various sales channels managed in PlentyONE
- **B2B Customer Management**: Import business customers with custom groups and tax IDs
- **Contact Synchronization**: Keep Magento customer database synchronized with PlentyONE contact database
- **Order Pre-Import**: Create customer accounts before importing orders from PlentyONE

### Import Workflow

```
PlentyONE Contacts
       ↓
[Local Contact Cache (plenty_customer)]
       ↓
[Customer Resolution by Email]
       ↓
[Website Scope Resolution]
       ↓
[Customer Data Generation]
       ↓
[Address Data Generation]
       ↓
[Customer Save to Magento]
       ↓
[Address Save to Magento]
       ↓
[Status Update & Logging]
```

---

## Configuration

The Customer Import Profile configuration is organized into sections that mirror the admin interface. Each section controls specific aspects of the import process.

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
While you can only have one active client, you can create multiple customer import profiles using the same client with different configurations (e.g., different stores, different customer filters).
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

**Purpose**: Automate customer import execution via cron scheduling.

#### Enable Schedule

**Field**: `status`
**Type**: Toggle (Yes/No)
**Default**: Yes
**Scope**: Global

Enable automatic customer import processing via the scheduler. When enabled, customers will be imported from PlentyONE according to the configured schedule.

**When Enabled**:
- Profile executes automatically based on schedule
- Contacts from local cache are processed in batches
- Execution history is recorded
- Email notifications sent on errors (if configured)

**When Disabled**:
- Profile only runs via manual execution or CLI commands
- Scheduled cron jobs are skipped
- Import processing must be triggered manually

#### Schedule

**Field**: `schedule_id`
**Type**: Dropdown (required when scheduling enabled)
**Scope**: Global
**Default**: None

Select the cron schedule that determines when this customer import profile runs automatically.

**Available Actions**:
- **Edit**: Modify existing schedule settings (frequency, time, batch limits)
- **New Schedule**: Create a new cron schedule configuration
- **View Schedules**: See overview of all scheduled tasks and next run times

**Common Schedule Patterns**:
- **Frequent sync**: Every 30 minutes (for marketplace order imports)
- **Regular updates**: Every 1-2 hours (for moderate change frequency)
- **Daily batch**: Once per day (for low change frequency)
- **Manual only**: Disable scheduling (for complete manual control)

:::tip Schedule Selection
Choose schedule frequency based on:
- How often contacts are added to PlentyONE
- Whether marketplace orders create new customers
- System resource availability
- Order import dependency (customers must exist before orders)
:::

#### Process Batch Size

**Field**: `process_batch_size`
**Type**: Number
**Default**: 100
**Scope**: Global
**Required**: No

Number of contacts to process in each batch during scheduled execution.

**Recommendations**:
- **Small imports** (< 1,000 contacts): 100-200
- **Medium imports** (1,000-10,000 contacts): 100-150
- **Large imports** (> 10,000 contacts): 50-100
- **Limited resources**: Reduce batch size to prevent timeouts

**Performance Impact**:
- **Larger batches**: Faster overall processing, higher memory usage, higher timeout risk
- **Smaller batches**: Slower processing, lower memory usage, more reliable execution

**Memory Considerations**:
- Average memory per contact: ~3-6 MB
- Contact entity: ~500 KB
- Customer entity: ~1 MB
- Addresses (avg 2): ~1.5 MB
- Magento indexing overhead: ~2 MB

#### Enable History

**Field**: `enable_history`
**Type**: Toggle (Yes/No)
**Default**: Yes
**Scope**: Global

Enable logging of all processed customer data to the profile history.

**When Enabled**:
- Detailed execution logs for each import run
- Per-contact processing status and results
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

Controls how customer data is handled in Magento during import operations.

**Options**:

**Append** (Recommended)
- Creates new customers if they don't exist in Magento
- Updates existing customers with new data from PlentyONE
- Preserves existing Magento customers not in PlentyONE
- **Use for**: Normal operations, incremental updates

**Replace**
- Deletes existing customers in Magento
- Creates fresh customer database from PlentyONE
- **Destructive operation** - removes all existing customers
- **Use for**: Initial setup, complete rebuilds only

:::danger Replace Mode
Replace mode permanently deletes all existing customers in Magento before importing new ones. Use only during initial setup or when explicitly rebuilding the entire customer database. Orders linked to deleted customers will lose customer references.
:::

**Sync**
- Matches PlentyONE contacts with Magento customers
- Updates only matched customers
- Does not create new customers
- **Use for**: Updating existing customer data without creating new accounts

**Delete**
- Removes customers that no longer exist in PlentyONE
- Updates and creates customers as needed
- Maintains synchronization including deletions
- **Use for**: Keeping Magento exactly synchronized with PlentyONE

#### API Collection Size

**Field**: `collection_size`
**Type**: Number
**Default**: 150
**Scope**: Global
**Required**: No

Number of items returned per page in API requests when collecting configuration data from PlentyONE.

**Configuration**:
- **Default**: 50
- **Maximum**: 500
- **Recommended**: 150

**When to Adjust**:
- **Large customer classes list**: Increase to 200-500 to reduce API calls during config collection
- **API timeout issues**: Decrease to 50-100 for more reliable requests

:::info Import vs Collection
This setting primarily affects configuration data collection, not the actual customer import. Customer import reads from local `plenty_customer` table populated by the contact collection profile.
:::

---

### 4. Store Configuration

**Purpose**: Map PlentyONE clients to Magento stores and configure referrers for multi-store setups.

#### Store Mapping

**Field**: `store_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Configure which Magento store views correspond to which PlentyONE client and locale combinations.

**Row Configuration**:

**Store** (required)
- Select Magento store view
- Determines website scope for customer
- Affects customer isolation in multi-website setups

**Client** (required)
- PlentyONE client (plentyID)
- Typically matches the client selected in Client Configuration
- Allows for advanced multi-client scenarios

**Locale** (required)
- PlentyONE locale (language)
- Must match locales configured in PlentyONE
- Determines language for customer communications

**Example Configurations**:

**Single Store**:
```
Store: Default Store View
Client: 1 (Main Store)
Locale: en
```

**Multi-Website Setup**:
```
Store: US Store View → Client: 1, Locale: en
Store: UK Store View → Client: 1, Locale: en_GB
Store: DE Store View → Client: 2, Locale: de
```

**Marketplace Channels**:
```
Store: Amazon Store → Client: 1, Locale: en (Referrer: Amazon)
Store: eBay Store → Client: 1, Locale: en (Referrer: eBay)
Store: Direct Webshop → Client: 1, Locale: en (Referrer: Magento)
```

:::tip Website Scope Impact
Store mapping is critical for multi-website setups. Customers are created in the website associated with the mapped store. If customer account sharing is set to "Per Website", customers will be isolated per website.
:::

#### Enable Store Filter

**Field**: `is_active_store_filter`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Restricts customer import by mapped stores. When enabled, only contacts from stores included in the store mapping will be imported.

**When to Enable**:
- ✅ Multi-store setup with different PlentyONE clients for different stores
- ✅ Regional customer segregation
- ✅ Marketplace-specific customer imports
- ✅ You want to control which store customers get imported to

**When to Disable**:
- ❌ Single store setup
- ❌ All contacts should import regardless of source
- ❌ You want unified customer database in Magento

**Example Use Case**:
```
Scenario: Multi-region import

Store Mapping:
  - US Store → PlentyONE Client 1
  - EU Store → PlentyONE Client 2

Enable Store Filter: Yes

Result:
  - Contacts from Client 1 only imported to US Store (US Website)
  - Contacts from Client 2 only imported to EU Store (EU Website)
  - Customers isolated per website (if account sharing = per website)
```

:::warning Store Filter Impact
When store filter is enabled, contacts from PlentyONE clients NOT included in the store mapping will be completely excluded from import. Ensure all desired clients are mapped.
:::

#### Referrer

**Field**: `referer_id`
**Type**: Dropdown (required)
**Scope**: Global
**Default**: None

Select the PlentyONE referrer to filter which contacts get imported. Referrers identify the source/origin of the contact.

**Available Actions**:
- **New Referrer**: Create a new referrer directly in PlentyONE from Magento admin

**Common Referrers**:
- Magento Store (main webshop)
- Amazon (marketplace)
- eBay (marketplace)
- Manual Entry (back office)
- B2B Portal (business customers)

**How Referrer Filtering Works**:
1. Only contacts with matching referrer are considered for import
2. Allows selective import based on customer acquisition channel
3. Useful for marketplace order imports (import only Amazon customers, for example)

**Example Configurations**:
```
Profile 1: Amazon Customer Import
  Referrer: Amazon
  Store: Amazon Store View
  Result: Only Amazon customers imported to Amazon store

Profile 2: eBay Customer Import
  Referrer: eBay
  Store: eBay Store View
  Result: Only eBay customers imported to eBay store

Profile 3: Direct Webshop Import
  Referrer: Magento
  Store: Default Store View
  Result: Only direct webshop customers imported
```

:::tip Multiple Import Profiles
Create separate customer import profiles for each marketplace/referrer with store filter enabled. This ensures customers are imported to the correct store view with proper website isolation.
:::

---

### 5. Customer Configuration

**Purpose**: Configure customer data import, group mappings, gender mappings, and address field mappings.

#### Enable Customer Import

**Field**: `is_active`
**Type**: Toggle (Yes/No)
**Default**: Yes
**Scope**: Global

Enable or disable customer account creation in Magento from PlentyONE contacts.

**When Enabled**:
- Customer data is imported from PlentyONE to Magento
- All customer configuration options become available
- Customer group and gender mappings are applied

**When Disabled**:
- Customer import is skipped entirely
- No customer accounts created or updated in Magento
- Other configuration options are hidden
- Use when you manage customers directly in Magento

:::info Use Case
Disable if you only want to import orders from PlentyONE without synchronizing the customer database. Most implementations should keep this enabled.
:::

#### Create Address

**Field**: `create_address`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Enable automatic creation of customer addresses in Magento when importing customers.

**When Enabled**:
- Customer billing and shipping addresses are imported
- Address field mappings are applied
- Addresses linked to Magento customer account

**When Disabled**:
- Only customer account information is imported
- No address records created in Magento
- Address field mappings are ignored

**When to Enable**:
- ✅ You need full customer address data in Magento
- ✅ Marketplace orders require customer addresses
- ✅ Marketing segmentation by region
- ✅ Customer service needs complete customer records

**When to Disable**:
- ❌ Addresses are imported separately (e.g., during order import)
- ❌ You want to reduce processing time
- ❌ Address data quality concerns

:::tip Address Management
For marketplace orders, addresses typically come with the order. You may not need to import customer addresses separately. Test with your specific use case.
:::

#### Default Customer Group

**Field**: `default_group`
**Type**: Dropdown
**Scope**: Global
**Default**: None
**Required**: No

Select the default Magento customer group to assign to new customers when no group mapping matches.

**How It Works**:
1. System checks if contact's PlentyONE class has a mapping in Customer Group Mapping
2. If mapping exists: Uses mapped Magento group
3. If no mapping: Uses default group specified here
4. If no default group: Uses system configuration default (typically "General")

**Use Cases**:
- **Fallback for unmapped classes**: Ensures all customers get assigned a group
- **Guest customers**: Default group for contacts without class assignment
- **Marketplace customers**: Standard group for marketplace-sourced customers

**Example**:
```
Default Group: "General"

Scenario 1:
  PlentyONE Class: "Standard Customer" (not mapped)
  Result: Assigned "General" in Magento

Scenario 2:
  PlentyONE Class: "Business Customer" (mapped to "Wholesale")
  Result: Assigned "Wholesale" (mapping takes precedence)

Scenario 3:
  PlentyONE Class: (none/empty)
  Result: Assigned "General" (default group)
```

:::tip Default Group Strategy
Set a sensible default like "General" for retail customers. Map specific PlentyONE classes for B2B, VIP, and other special customer types.
:::

#### Customer Group Mapping

**Field**: `group_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Map PlentyONE customer classes to Magento customer groups to maintain group structure across systems.

**Row Configuration**:

**Magento Group** (required)
- Select Magento customer group
- Groups from Magento customer group configuration
- Includes General, Wholesale, Retailer, VIP, NOT LOGGED IN, etc.

**Plenty Group** (required)
- Select corresponding PlentyONE customer class
- Classes must exist in PlentyONE before mapping
- Available after collecting configuration data

**Common Mappings**:
```
PlentyONE Class: "Standard Customer" → Magento Group: "General"
PlentyONE Class: "Business Customer" → Magento Group: "Wholesale"
PlentyONE Class: "Premium Customer" → Magento Group: "VIP"
PlentyONE Class: "Reseller" → Magento Group: "Retailer"
```

**B2B/B2C Example**:
```
B2C Classes:
  Standard Customer → General (Retail Pricing)
  Premium Customer → VIP (VIP Pricing)

B2B Classes:
  Business Customer → Wholesale (Wholesale Pricing)
  Distributor → Retailer (Distributor Pricing)
```

**Marketplace Example**:
```
Amazon Customers → General (Standard retail pricing)
eBay Customers → General (Standard retail pricing)
Direct Webshop → VIP (Loyalty program pricing)
```

:::tip Group Mapping Strategy
1. Map all active PlentyONE customer classes
2. Set default group for unmapped scenarios
3. Consider pricing tiers when mapping
4. Tax class associations are important for B2B
5. Test with customers from each class
:::

#### Gender Mapping

**Field**: `gender_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Map PlentyONE gender field values to Magento customer prefix/salutation values.

**Row Configuration**:

**Magento Prefix** (required)
- Select customer prefix/salutation in Magento
- Common values: Mr., Mrs., Ms., Dr., etc.
- Custom prefixes if configured in Magento

**PlentyONE Gender** (required)
- Select corresponding gender in PlentyONE
- Options: Male, Female, Diverse, Company
- Values from PlentyONE contact data

**Common Mappings**:
```
PlentyONE Gender: "Male" → Magento Prefix: "Mr."
PlentyONE Gender: "Female" → Magento Prefix: "Mrs."
PlentyONE Gender: "Female" → Magento Prefix: "Ms."
PlentyONE Gender: "Company" → Magento Prefix: "Company"
PlentyONE Gender: "Diverse" → Magento Prefix: "" (empty/no prefix)
```

**International Example**:
```
English Store:
  Male → Mr.
  Female → Mrs./Ms.

German Store:
  Male → Herr
  Female → Frau

French Store:
  Male → M.
  Female → Mme
```

**B2B Example**:
```
Company → Company (for business accounts)
Male → Mr. (for individual contacts)
Female → Ms. (for individual contacts)
```

:::info Gender Mapping Purpose
Gender mapping ensures proper salutation in Magento for emails, invoices, and customer communications. While not required for functionality, it improves customer experience and personalization.
:::

#### Address Field Mapping

**Field**: `address_field_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Map PlentyONE address fields to Magento address fields for comprehensive address data import.

**Row Configuration**:

**Magento Address Field** (required)
- Select Magento address field
- Standard fields: firstname, lastname, street, city, postcode, country_id, etc.
- Custom address attributes if configured

**Client Address Field** (required)
- Select corresponding PlentyONE address field
- Fields from PlentyONE contact addresses
- Available after collecting configuration data

**Required Field Mappings**:

| PlentyONE Field | Magento Field | Required | Description |
|-----------------|---------------|----------|-------------|
| firstName | firstname | Yes | First name |
| lastName | lastname | Yes | Last name |
| street | street | Yes | Street address |
| town | city | Yes | City/Town |
| postalCode | postcode | Yes | Postal/ZIP code |
| countryId | country_id | Yes | Country code |

**Recommended Field Mappings**:

| PlentyONE Field | Magento Field | Use Case |
|-----------------|---------------|----------|
| companyName | company | B2B customers |
| phone | telephone | Contact information |
| state | region | US/CA/AU addresses |
| vatNumber | vat_id | EU B2B, tax validation |
| fax | fax | Legacy business contacts |

**Custom Field Example**:
```
PlentyONE Custom Field: "deliveryInstructions"
Custom Magento Attribute: "delivery_notes"
Mapping: deliveryInstructions → delivery_notes

Result: Special delivery instructions imported from PlentyONE
```

**Multi-Line Street Address**:
```
PlentyONE has street, address2, address3
Magento has multi-line street (street[0], street[1], street[2])

Mappings:
  street → street[0] (Street name and number)
  address2 → street[1] (Building, floor, apartment)
  address3 → street[2] (Additional info)
```

:::tip Address Field Best Practices
1. Always map all required fields (firstname, lastname, street, city, postcode, country)
2. Map company for B2B or marketplace customers
3. Map telephone for customer service
4. Map region/state for US, Canada, Australia
5. Map VAT number for EU B2B customers
6. Test address import with various country formats
7. Verify multi-line street addresses are handled correctly
:::

---

### 6. Event Configuration

**Purpose**: Configure automatic import triggers (reserved for future use).

**Field**: `event_config`
**Type**: Fieldset
**Scope**: Global

This section is currently empty and reserved for future event-based import triggers.

**Future Capabilities** (not currently implemented):
- Automatic import when new contacts collected
- Webhook triggers for contact changes
- Real-time import on contact update

**Current Workflow**:
Customer import relies on scheduled execution or manual CLI triggers:
```bash
# Scheduled import (via cron)
# Runs automatically based on schedule configuration

# Manual import
bin/magento byte8:plenty:customer:import --profile-id=3
```

---

### 7. Log Configuration

**Purpose**: Control diagnostic logging of processing for troubleshooting.

#### Log Request Data to File

**Field**: `is_active_request_log`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Enable logging of all import processing data to file system.

**Log Location**: `var/log/plenty/customer_import_request.log`

**What Gets Logged**:
- Contact data being processed
- Customer data structures generated
- Address data structures generated
- Processing timestamps
- Mapping decisions (group, gender, address fields)

**When to Enable**:
- ✅ Troubleshooting customer import failures
- ✅ Debugging data mapping issues
- ✅ Verifying correct data transformations
- ✅ Customer group assignment issues
- ✅ During initial setup and testing

**When to Disable**:
- ❌ Production environment with stable integration
- ❌ Concerned about disk space usage
- ❌ Customer data privacy concerns
- ❌ High-frequency imports generating large logs

:::warning Security and Privacy Consideration
Request logs contain complete customer personal data (names, addresses, phone numbers, email addresses). Ensure log files are properly secured, access is restricted, and logs comply with GDPR/privacy regulations. Do not share logs publicly without sanitizing all personal information.
:::

#### Log Response Data to File

**Field**: `is_active_response_log`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Enable logging of all Magento save operation results to file system.

**Log Location**: `var/log/plenty/customer_import_response.log`

**What Gets Logged**:
- Magento customer IDs created
- Address IDs created
- Success/failure status for each save operation
- Validation error messages
- Database constraint violations
- Response timestamps
- Processing time per customer

**When to Enable**:
- ✅ Troubleshooting Magento save errors
- ✅ Debugging customer creation failures
- ✅ Investigating validation errors
- ✅ Address save issues
- ✅ During initial setup and testing

**When to Disable**:
- ❌ Production environment with stable integration
- ❌ Log files growing too large
- ❌ No active troubleshooting needed
- ❌ Performance concerns with logging overhead

**Log Analysis Tips**:
1. Check for database constraint violations (duplicate emails, etc.)
2. Look for validation error messages
3. Verify customer IDs are being created correctly
4. Monitor processing times for performance issues
5. Cross-reference with request logs to see full data flow
6. Check for address matching/duplication issues

:::tip Temporary Logging
Enable logging only when actively troubleshooting issues. Leave disabled during normal operations to conserve disk space, maintain optimal performance, and protect customer privacy.
:::

---

## Common Workflows

### Initial Customer Database Import

**Scenario**: First-time import of PlentyONE contact database to Magento during integration setup.

**Prerequisites**:
1. Customer contact collection profile must run first to populate `plenty_customer` table
2. Store mapping configured
3. Customer group mapping planned

**Configuration**:
```
Client Configuration:
  ✓ Client: Main Store Client
  ✓ Collect Configuration Data: Execute

Schedule Configuration:
  ✓ Enable Schedule: No (manual execution for initial setup)

API Configuration:
  ✓ API Behaviour: Append (create new customers)
  ✓ API Collection Size: 150

Store Configuration:
  ✓ Store: Default Store View → Client: 1, Locale: en
  ✓ Enable Store Filter: No (import all contacts)
  ✓ Referrer: "All" or specific referrer

Customer Configuration:
  ✓ Enable Customer Import: Yes
  ✓ Create Address: Yes
  ✓ Default Customer Group: "General"
  ✓ Customer Group Mapping:
    - Standard Customer → General
    - Business Customer → Wholesale
  ✓ Gender Mapping:
    - Male → Mr.
    - Female → Mrs.
  ✓ Address Field Mapping:
    - firstName → firstname
    - lastName → lastname
    - street → street
    - town → city
    - postalCode → postcode
    - countryId → country_id
    - companyName → company
    - phone → telephone

Log Configuration:
  ✓ Log Requests: Yes (for initial testing)
  ✓ Log Responses: Yes (for verification)
```

**Steps**:
1. Run contact collection profile first:
   ```bash
   bin/magento byte8:plenty:customer:collect --profile-id=1
   ```
2. Verify contacts in `plenty_customer` table:
   ```sql
   SELECT COUNT(*) FROM plenty_customer WHERE contact_id IS NOT NULL;
   ```
3. Create and configure customer import profile
4. Collect configuration data from PlentyONE
5. Configure all mappings (store, group, gender, address)
6. Enable request/response logging
7. Start with small test batch (10-50 customers):
   ```bash
   bin/magento byte8:plenty:customer:import --profile-id=3 --entity-ids=1,2,3,4,5
   ```
8. Verify customers in Magento admin
9. Check customer groups, addresses, prefixes
10. Review logs for any errors or warnings
11. Process full customer database:
    ```bash
    bin/magento byte8:plenty:customer:import --profile-id=3
    ```
12. Monitor execution and review final statistics
13. Disable logging after successful completion
14. Enable scheduling for ongoing sync

---

### Marketplace Customer Import

**Scenario**: Automatically import new customers from Amazon/eBay orders processed in PlentyONE.

**Configuration**:
```
Client Configuration:
  ✓ Client: Main Store Client

Schedule Configuration:
  ✓ Enable Schedule: Yes
  ✓ Schedule: Every 30 minutes (before order import)
  ✓ Process Batch Size: 50
  ✓ Enable History: Yes

API Configuration:
  ✓ API Behaviour: Append
  ✓ API Collection Size: 150

Store Configuration:
  ✓ Store: Amazon Store View → Client: 1, Locale: en
  ✓ Enable Store Filter: Yes (import only for this store)
  ✓ Referrer: "Amazon" (filter by Amazon customers)

Customer Configuration:
  ✓ Enable Customer Import: Yes
  ✓ Create Address: Yes (marketplace orders need addresses)
  ✓ Default Customer Group: "General"

Log Configuration:
  ✓ Log Requests: No
  ✓ Log Responses: No
```

**Workflow**:
1. Amazon order processed in PlentyONE
2. Contact created/updated in PlentyONE with Amazon referrer
3. Contact collection profile fetches contact to `plenty_customer` table
4. Within 30 minutes, customer import runs
5. Customer account created in Magento (Amazon Store View)
6. Customer assigned to correct website based on store mapping
7. Order import can now link to customer account

**Why This Works**:
- Customer import runs before order import (schedule order)
- Referrer filter ensures only Amazon customers imported to Amazon store
- Store filter with website isolation keeps marketplaces separate
- Addresses imported for order fulfillment

**Schedule Order Example**:
```
Every 30 minutes:
  :00 → Contact Collection (fetch from PlentyONE)
  :15 → Customer Import (create Magento accounts)
  :30 → Order Import (link orders to customers)
```

---

### Multi-Website B2C/B2B Separation

**Scenario**: Import B2C customers to retail website and B2B customers to wholesale website with different pricing.

**Configuration**:
```
Magento Configuration:
  ✓ Customer Account Sharing: Per Website
  ✓ Two websites: B2C Website, B2B Website

Profile 1: B2C Customer Import
  Store Configuration:
    ✓ Store: B2C Store View → Client: 1 (Retail), Locale: en
    ✓ Enable Store Filter: Yes
    ✓ Referrer: "Magento Webshop" (B2C referrer)

  Customer Configuration:
    ✓ Enable Customer Import: Yes
    ✓ Default Customer Group: "General"
    ✓ Customer Group Mapping:
      - Standard Customer → General (Retail Pricing)
      - Premium Customer → VIP (VIP Pricing)

Profile 2: B2B Customer Import
  Store Configuration:
    ✓ Store: B2B Store View → Client: 2 (Wholesale), Locale: en
    ✓ Enable Store Filter: Yes
    ✓ Referrer: "B2B Portal" (B2B referrer)

  Customer Configuration:
    ✓ Enable Customer Import: Yes
    ✓ Default Customer Group: "Wholesale"
    ✓ Customer Group Mapping:
      - Business Customer → Wholesale (Wholesale Pricing)
      - Distributor → Retailer (Distributor Pricing)
    ✓ Address Field Mapping:
      - companyName → company (important for B2B)
      - vatNumber → vat_id (important for B2B tax)

Schedule Configuration (Both):
  ✓ Enable Schedule: Yes
  ✓ Schedule: Every 1 hour (offset by 30 minutes)
```

**How It Works**:
1. B2C contacts from PlentyONE Client 1 imported to B2C Website
2. B2B contacts from PlentyONE Client 2 imported to B2B Website
3. Customers isolated per website (account sharing = per website)
4. Different pricing and tax rules apply per website
5. Referrers identify customer acquisition source

**Benefits**:
- Complete customer database isolation
- Different pricing structures (retail vs wholesale)
- Different tax treatments (B2C vs B2B)
- Separate customer groups and segmentation
- Clear B2B vs B2C separation

---

## CLI Commands

### Execute Customer Import

```bash
# Import all customers from local cache
bin/magento byte8:plenty:customer:import --profile-id=3

# Import specific contacts by ID (comma-separated)
bin/magento byte8:plenty:customer:import --profile-id=3 --entity-ids=100,101,102

# Import for specific store
bin/magento byte8:plenty:customer:import --profile-id=3 --store-id=1

# Force re-import (update existing customers)
bin/magento byte8:plenty:customer:import --profile-id=3 --force

# Import with verbose output for debugging
bin/magento byte8:plenty:customer:import --profile-id=3 -vvv
```

### Manage Configuration Data

```bash
# Collect customer configuration data from PlentyONE
bin/magento byte8:plenty:customer:collect-config --client-id=1

# Force re-collection of configuration data
bin/magento byte8:plenty:customer:collect-config --client-id=1 --force

# Delete configuration data
bin/magento byte8:plenty:customer:delete-config --client-id=1
```

### Profile Management

```bash
# List all customer import profiles
bin/magento byte8:profile:list --type=plenty_customer_import

# View profile configuration
bin/magento byte8:profile:info --profile-id=3

# Enable/disable profile scheduling
bin/magento byte8:profile:schedule:enable --profile-id=3
bin/magento byte8:profile:schedule:disable --profile-id=3
```

### Debugging and Diagnostics

```bash
# Validate profile configuration
bin/magento byte8:plenty:customer:validate --profile-id=3

# Test website scope resolution
bin/magento byte8:plenty:customer:test-website-scope --profile-id=3

# View recent import history
bin/magento byte8:profile:history --profile-id=3 --limit=10

# View import history with errors only
bin/magento byte8:profile:history --profile-id=3 --status=error

# Clear customer import history
bin/magento byte8:profile:history:clear --profile-id=3 --older-than=30

# Check contact to customer mapping
bin/magento byte8:plenty:customer:check-mapping --contact-id=456

# View contacts ready for import
bin/magento byte8:plenty:customer:list-pending --profile-id=3
```

### Contact Collection (Prerequisite)

```bash
# Collect contacts from PlentyONE to local cache
bin/magento byte8:plenty:customer:collect --profile-id=1

# View collected contacts count
bin/magento byte8:plenty:customer:collect --profile-id=1 --count

# Force re-collection (refresh cache)
bin/magento byte8:plenty:customer:collect --profile-id=1 --force
```

---

## Troubleshooting

### Customers Not Importing from PlentyONE

**Symptoms**:
- Contacts exist in `plenty_customer` table but not appearing in Magento
- Import executes but no customers are created
- No errors reported in execution history

**Diagnostic Steps**:

1. **Check Customer Import Enable Setting**
   - Navigate to profile → Customer Configuration → Enable Customer Import
   - Verify it's set to "Yes"
   - If disabled, no customers will import

2. **Verify Contact Collection**
   ```bash
   # Check if contacts exist in local cache
   SELECT COUNT(*) FROM plenty_customer WHERE contact_id IS NOT NULL;
   ```
   - If count is 0, run contact collection profile first
   - Customer import reads from `plenty_customer` table

3. **Check Store Filter Settings**
   ```bash
   # Verify store filter configuration
   bin/magento config:show plenty_customer/store_config/is_active_store_filter
   ```
   - If enabled, verify contact's client is in store mapping
   - Unmapped clients won't be imported

4. **Review Store Mapping Configuration**
   - Navigate to profile → Store Configuration → Store Mapping
   - Verify all PlentyONE clients are mapped to stores
   - Check client IDs match between PlentyONE and mapping

5. **Check Referrer Filter**
   - Navigate to profile → Store Configuration → Referrer
   - Verify contacts have matching referrer in PlentyONE
   - Wrong referrer = excluded from import

6. **Review Response Logs**
   - Enable response logging in profile configuration
   - Execute import manually
   - Check `var/log/plenty/customer_import_response.log`
   - Look for database errors or validation failures

7. **Verify Website Scope**
   ```bash
   # Check customer account sharing scope
   bin/magento config:show customer/account_share/scope
   ```
   - 0 = Global (all websites share customers)
   - 1 = Per Website (customers isolated per website)

**Common Solutions**:
- Run contact collection profile before customer import
- Enable customer import in Customer Configuration
- Add missing clients to store mapping
- Check and adjust referrer filter
- Verify website scope matches your multi-store strategy
- Ensure contacts have required data (email, names)

---

### Customers Created in Wrong Website

**Symptoms**:
- Customers imported but appear in wrong website
- Multi-website setup: customers not isolated properly
- Website ID mismatch in customer entity

**Diagnostic Steps**:

1. **Check Store Mapping**
   - Navigate to profile → Store Configuration → Store Mapping
   - Verify each store is mapped to correct client
   - Check website ID of each mapped store

2. **Review Account Sharing Scope**
   ```bash
   # Check account sharing setting
   bin/magento config:show customer/account_share/scope
   ```
   - If Global (0): All customers in one pool (no website isolation)
   - If Per Website (1): Customers must be in correct website

3. **Verify Contact Client Assignment**
   ```sql
   # Check which client the contact belongs to
   SELECT contact_id, client_id, email FROM plenty_customer WHERE entity_id = X;
   ```
   - Client ID must match store mapping

4. **Test Website Resolution**
   ```bash
   # Test website scope resolution for profile
   bin/magento byte8:plenty:customer:test-website-scope --profile-id=3 --contact-id=456
   ```

5. **Review Import Logs**
   - Enable request logging
   - Check which website ID is being assigned
   - Verify against expected website

**Solutions**:

1. **Fix Store Mapping**
   - Ensure each PlentyONE client maps to correct Magento store
   - Store's website determines customer website assignment
   - Example:
     ```
     Client 1 → US Store (Website ID: 1)
     Client 2 → EU Store (Website ID: 2)
     ```

2. **Set Account Sharing to Per Website**
   - If you want website isolation, set to Per Website
   - Stores → Configuration → Customers → Customer Configuration → Share Customer Accounts
   - Set to "Per Website"

3. **Re-Import Affected Customers**
   ```bash
   # Delete incorrect customers
   # Re-run import with correct store mapping
   bin/magento byte8:plenty:customer:import --profile-id=3 --force
   ```

4. **Manual Customer Website Correction**
   ```sql
   # Move customer to correct website (use with caution)
   UPDATE customer_entity
   SET website_id = {correct_website_id}
   WHERE entity_id = {customer_id};
   ```
   - Only if few customers affected
   - Backup database first

---

### Customers Assigned to Wrong Group

**Symptoms**:
- Imported customers appear in incorrect customer group
- All customers in default group regardless of PlentyONE class
- B2B customers receiving B2C pricing or vice versa

**Diagnostic Steps**:

1. **Review Customer Group Mapping**
   - Navigate to profile → Customer Configuration → Customer Group Mapping
   - Verify PlentyONE classes are mapped correctly to Magento groups
   - Direction is PlentyONE → Magento (import), not export

2. **Check Contact's PlentyONE Class**
   ```sql
   # Check contact class in local cache
   SELECT contact_id, class_id, email FROM plenty_customer WHERE entity_id = X;
   ```
   - Verify contact actually has a class assigned
   - NULL or empty = will use default group

3. **Verify Default Group Setting**
   - Check profile → Customer Configuration → Default Customer Group
   - Default applies when no mapping matches
   - May be assigning all to default if mappings don't match

4. **Check Configuration Data Collection**
   ```bash
   # Re-collect configuration data
   bin/magento byte8:plenty:customer:collect-config --client-id=1
   ```
   - PlentyONE classes must be collected for mappings to work
   - Outdated collection data may not include new classes

5. **Review Magento Customer Groups**
   - Check Magento admin → Customers → Customer Groups
   - Verify mapped groups exist
   - Check tax class associations

**Solutions**:

1. **Fix Customer Group Mappings**
   - Map all active PlentyONE customer classes
   - Ensure correct direction (PlentyONE Class → Magento Group)
   - Test with contact from each class

2. **Update Default Group**
   - Set appropriate default for unmapped classes
   - Consider if default should be "General" or something else
   - Document which classes use default

3. **Re-Import Affected Customers**
   ```bash
   # Re-import to update group assignments
   bin/magento byte8:plenty:customer:import --profile-id=3 --force --entity-ids=100,101,102
   ```
   - Force flag updates existing customers
   - Verify correct group after re-import

4. **Bulk Update Customer Groups**
   - If many customers affected, use bulk update
   - Magento admin → Customers → All Customers
   - Select customers → Actions → Assign a Customer Group

---

### Missing or Incorrect Address Data

**Symptoms**:
- Customers imported but addresses missing in Magento
- Address data incomplete (missing city, postcode, etc.)
- Wrong address fields mapped

**Diagnostic Steps**:

1. **Check Create Address Setting**
   - Navigate to profile → Customer Configuration → Create Address
   - Verify it's enabled (Yes)
   - If disabled, addresses won't import even with mappings

2. **Verify Address Field Mappings**
   - Navigate to profile → Customer Configuration → Address Field Mapping
   - Check all required fields are mapped:
     - firstName → firstname
     - lastName → lastname
     - street → street
     - town → city
     - postalCode → postcode
     - countryId → country_id

3. **Check Contact Has Addresses**
   ```sql
   # Check if contact has addresses in PlentyONE cache
   SELECT * FROM plenty_customer_address WHERE contact_id = X;
   ```
   - Contact must have at least one address in PlentyONE
   - Billing or shipping address should exist

4. **Review Address Data Completeness**
   ```sql
   # Check address data
   SELECT contact_id, address_type, street, town, postal_code, country_id
   FROM plenty_customer_address
   WHERE contact_id = X;
   ```
   - Verify all required fields are populated
   - Empty fields may cause import failures

5. **Enable Request Logging**
   - Enable request logging in profile configuration
   - Execute import manually
   - Check `var/log/plenty/customer_import_request.log`
   - Verify address data structures are being generated

6. **Check Magento Address Requirements**
   - Different countries have different requirements
   - US requires region/state
   - Some EU countries require VAT numbers
   - Check validation rules for target countries

**Solutions**:

1. **Enable Create Address**
   - Set Create Address to "Yes" in Customer Configuration
   - Save profile and re-import customers

2. **Complete Address Field Mappings**
   - Add all required field mappings
   - Ensure correct direction (PlentyONE → Magento)
   - Include optional but recommended fields
   - Example complete mapping:
     ```
     firstName → firstname
     lastName → lastname
     companyName → company
     street → street
     town → city
     state → region
     postalCode → postcode
     countryId → country_id
     phone → telephone
     ```

3. **Fix Contact Address Data**
   - Ensure contacts have complete addresses in PlentyONE
   - Run contact collection to refresh local cache
   - Validate address data before import

4. **Re-Import with Address Creation**
   ```bash
   # Re-import customers to create addresses
   bin/magento byte8:plenty:customer:import --profile-id=3 --force
   ```
   - Addresses should be created/updated on re-import
   - Verify in Magento admin after completion

---

### Duplicate Customers in Magento

**Symptoms**:
- Same contact creates multiple Magento customers
- Multiple customers with same email address
- Customer resolution failing

**Diagnostic Steps**:

1. **Check API Behaviour Setting**
   - Navigate to profile → HTTP API Configuration → API Behaviour
   - If set to "Replace", shouldn't cause duplicates (deletes first)
   - If set to "Append", duplicates may occur if matching fails

2. **Review Email Addresses**
   ```bash
   # Check for duplicate emails in Magento
   SELECT email, COUNT(*)
   FROM customer_entity
   GROUP BY email
   HAVING COUNT(*) > 1;
   ```
   - Multiple customers with same email indicate duplicate issue

3. **Check Website Scope**
   ```bash
   # Check customers with same email across websites
   SELECT entity_id, email, website_id
   FROM customer_entity
   WHERE email = 'customer@example.com';
   ```
   - If account sharing = per website, same email can exist in multiple websites
   - This is by design, not a bug

4. **Review Contact Data**
   ```sql
   # Check if same contact processed multiple times
   SELECT contact_id, customer_id, email FROM plenty_customer WHERE contact_id = X;
   ```
   - Verify customer_id is properly set after import
   - NULL customer_id may cause re-creation

5. **Check Import History**
   - Review profile execution history
   - Look for same contact processed multiple times
   - Check if contact customer_id was lost/reset

**Solutions**:

1. **Understand Website Scope Behavior**
   - Per Website scope: Same email can exist in multiple websites (intentional)
   - Global scope: Email must be unique across all websites
   - Choose scope based on business requirements

2. **Clean Up True Duplicates**
   - If multiple customers in same website with same email:
   ```bash
   # Delete duplicate customers (backup first!)
   # Keep the most recent customer
   DELETE FROM customer_entity WHERE entity_id IN (older_duplicate_ids);
   ```

3. **Fix Contact-Customer Mapping**
   ```sql
   # Ensure contact is linked to correct customer
   UPDATE plenty_customer
   SET customer_id = {correct_customer_id}
   WHERE contact_id = {plenty_contact_id};
   ```

4. **Re-Import with Correct Configuration**
   - Verify website scope resolution
   - Ensure store mapping is correct
   - Re-import will update existing customer, not create duplicate

---

### Profile Execution Timeouts

**Symptoms**:
- Import fails with timeout error
- PHP fatal error: Maximum execution time exceeded
- Incomplete customer import with some customers missing

**Diagnostic Steps**:

1. **Check Batch Size Configuration**
   - Large batch sizes can cause timeouts
   - Review Schedule Configuration → Process Batch Size
   - Current default: 100 contacts per batch

2. **Review PHP Configuration**
   ```bash
   php -i | grep max_execution_time
   php -i | grep memory_limit
   ```
   - Default PHP execution time may be too low (60-120 seconds)
   - Memory limit may be insufficient
   - Average memory per contact: 3-6 MB

3. **Check Import Complexity**
   - Customers with many addresses take longer
   - Address creation adds significant processing time
   - Reindexing overhead per customer

4. **Review Indexer Mode**
   ```bash
   bin/magento indexer:status
   ```
   - If indexers in "Update on Save" mode, each customer triggers reindex
   - Can dramatically slow import

**Solutions**:

1. **Reduce Batch Size**
   - Decrease Process Batch Size from 100 to 50
   - Or even 25 for very complex scenarios
   - Example:
     ```
     Before: 100 customers/batch × 5 min = 5 min per batch (timeout risk)
     After: 50 customers/batch × 2.5 min = 2.5 min per batch (reliable)
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

3. **Set Indexers to Schedule Mode**
   ```bash
   # Before large import, set indexers to schedule mode
   bin/magento indexer:set-mode schedule

   # Run import
   bin/magento byte8:plenty:customer:import --profile-id=3

   # Reindex once at end
   bin/magento indexer:reindex customer_grid
   ```
   - Dramatically improves import speed
   - Reindex once after completion

4. **Use CLI for Large Imports**
   - CLI has higher default timeout limits
   - Run imports via CLI instead of admin panel
   ```bash
   bin/magento byte8:plenty:customer:import --profile-id=3
   ```

5. **Disable Address Creation Temporarily**
   - If addresses not critical immediately
   - Import customers first (faster)
   - Enable Create Address and re-import with force

6. **Split Into Multiple Runs**
   ```bash
   # Import by batches manually
   bin/magento byte8:plenty:customer:import --profile-id=3 --entity-ids=1-1000
   bin/magento byte8:plenty:customer:import --profile-id=3 --entity-ids=1001-2000
   ```

---

## Best Practices

### Initial Setup

1. **Run Contact Collection First**
   - Customer import requires local contact cache
   - Set up and run contact collection profile
   - Verify contacts in `plenty_customer` table before import

2. **Plan Website Scope Strategy**
   - Decide: Global or Per Website customer account sharing
   - Per Website = isolation, good for multi-region/multi-brand
   - Global = unified, good for single brand multi-store

3. **Configure Store Mapping Carefully**
   - Map all PlentyONE clients to correct stores
   - Verify website ID of each store
   - Test website resolution with single customer

4. **Test with Small Batch First**
   - Import 5-10 test customers before full import
   - Verify website assignment
   - Check customer groups
   - Validate addresses
   - Confirm prefix/gender mapping

5. **Enable Logging Initially**
   - Turn on request and response logging during setup
   - Review logs to understand data flow
   - Identify and fix issues early
   - Disable after stable operation

### Ongoing Operations

1. **Schedule Order Matters**
   - Contact collection must run before customer import
   - Customer import must run before order import
   - Typical order:
     ```
     1. Contact Collection (every 30 min at :00)
     2. Customer Import (every 30 min at :15)
     3. Order Import (every 30 min at :30)
     ```

2. **Monitor Import History**
   ```bash
   bin/magento byte8:profile:history --profile-id=3 --limit=20
   ```
   - Check for errors regularly
   - Set up email notifications for failures
   - Track execution times for performance trends

3. **Maintain Clean Logs**
   - Keep logging disabled during normal operations
   - Enable only when troubleshooting
   - Rotate or clear old log files
   ```bash
   find var/log/plenty/ -name "customer_*" -mtime +30 -delete
   ```

4. **Indexer Management**
   - For scheduled imports: "Update on Schedule" mode recommended
   - For manual large imports: Switch to schedule, import, then reindex
   - Monitor indexer status and backlog

5. **Regular Configuration Review**
   - Quarterly review of profile configuration
   - Update mappings when PlentyONE classes change
   - Verify API credentials are current
   - Test with new customer scenarios

### Customer Data Management

1. **Understand Website Isolation**
   - Per Website scope: Customers isolated, can't login across websites
   - Global scope: Customers shared, can login to any website
   - Choose based on business model

2. **Group Assignment Strategy**
   - Map all PlentyONE classes to Magento groups
   - Set sensible default group
   - Consider pricing and tax implications
   - Document group strategy for team

3. **Address Data Quality**
   - Ensure complete addresses in PlentyONE
   - Map all required fields
   - Test with various country formats
   - Handle missing data gracefully

4. **Email Uniqueness**
   - Understand email constraints per website scope
   - Plan for duplicate email scenarios
   - Document how duplicates are handled

### Performance Optimization

1. **Batch Size Tuning**
   - Start with default (100) and adjust
   - Reduce if timeouts occur
   - Monitor memory usage
   - Consider address creation overhead

2. **Indexer Optimization**
   - Use "Update on Schedule" for production
   - Switch modes for large imports
   - Reindex after import completion
   - Monitor customer_grid indexer

3. **Schedule During Off-Peak**
   - Run imports during low-traffic periods
   - Avoid peak shopping hours
   - Better database performance at night

4. **Database Maintenance**
   - Keep customer tables optimized
   - Archive old import history
   - Monitor table sizes
   - Regular database maintenance

### Multi-Store Configurations

1. **Website Scope Planning**
   - Design website structure before import
   - Document which clients → which websites
   - Test customer login behavior
   - Verify pricing per website

2. **Store Filter Strategy**
   - Use for marketplace separation
   - Enable for regional isolation
   - Test with customers from each source
   - Verify referrer filtering works

3. **Referrer Management**
   - Create descriptive referrers in PlentyONE
   - Use for source tracking
   - Filter imports by referrer
   - Document referrer usage

4. **Multiple Import Profiles**
   - Consider separate profiles per marketplace
   - Each with own referrer filter
   - Scheduled at different times
   - Keeps imports isolated and manageable

### Security and Privacy

1. **Protect Customer Data**
   - Restrict log file access (contains PII)
   - Ensure GDPR compliance
   - Don't commit logs to version control
   - Sanitize logs before sharing

2. **Secure API Credentials**
   - Store credentials securely
   - Rotate passwords periodically
   - Use minimal API permissions
   - Monitor API access logs

3. **Data Retention**
   - Define customer data retention policy
   - Clear old import history
   - Archive as required by regulation
   - Document data handling procedures

4. **Backup Before Major Changes**
   - Backup customer tables before large imports
   - Export profile configuration
   - Keep staging synchronized
   - Document all changes

---

## Related Documentation

- [Customer Export Profile](/docs/profiles/customer-export) - Export customers from Magento to PlentyONE
- [Customer Contact Collection Profile](/docs/profiles/customer-collect) - Collect contacts from PlentyONE to local cache
- [Order Import Profile](/docs/profiles/order-import) - Import orders with customer references
- [About Profiles](/docs/profiles/about-profiles) - Overview of profile system
- [Creating a Profile](/docs/profiles/create-profile) - General profile creation guide
- [Client Configuration](/docs/configuration/client) - PlentyONE client setup and management

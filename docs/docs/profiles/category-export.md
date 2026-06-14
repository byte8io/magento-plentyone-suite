---
sidebar_position: 6
title: Category Export Profile
description: Export categories from Magento to PlentyONE using the Category Export Profile
---

# Category Export Profile

The **Category Export Profile** synchronizes category structures from Magento to PlentyONE, creating and updating PlentyONE categories based on your Magento category tree. This profile enables automatic or manual export of category hierarchies, names, descriptions, and attributes to maintain consistent category structures across both systems.

## Overview

**Profile Type ID**: `plenty_category_export`
**Direction**: Magento → PlentyONE
**Purpose**: Export category hierarchy, names, descriptions, and attributes from Magento to PlentyONE

### What Gets Exported

- **Category Structure**: Complete category hierarchy and parent-child relationships
- **Category Names**: Multi-language category names for all configured store views
- **Category Descriptions**: Full category descriptions and content
- **Category Attributes**: Mapped attributes from Magento to PlentyONE properties
- **Category Status**: Active/inactive status synchronization
- **Root Categories**: Top-level category mappings between systems

### Primary Use Cases

- **Initial Setup**: Populate PlentyONE with complete Magento category structure during initial integration
- **Category Synchronization**: Keep category structures synchronized between Magento and PlentyONE
- **Multi-Language Export**: Export translated category data for all configured locales
- **Automated Updates**: Automatically export new or modified categories to PlentyONE
- **Marketplace Integration**: Prepare category structure for marketplace channel exports

### Export Workflow

```
Magento Categories
       ↓
[Category Collection]
       ↓
[Root Category Filtering]
       ↓
[Attribute Mapping]
       ↓
[Multi-Language Processing]
       ↓
[API Export to PlentyONE]
       ↓
[Status Update & Logging]
```

---

## Configuration

The Category Export Profile configuration is organized into sections that mirror the admin interface. Each section controls specific aspects of the export process.

### 1. Client Configuration

**Purpose**: Connect the profile to your PlentyONE system and manage API credentials.

#### Client

**Field**: `client_id`
**Type**: Dropdown (required)
**Scope**: Global
**Default**: None

Select the PlentyONE client configuration containing API credentials and connection settings for category synchronization.

**Available Actions**:
- **Edit**: Modify existing client settings (credentials, API URL, user ID)
- **New Client**: Create a new client configuration

**Configuration Requirements**:
- Valid PlentyONE API URL
- API username and password
- Client ID and User ID from PlentyONE
- Active authentication token

:::tip Multiple Profiles
While you can only have one active client, you can create multiple category export profiles using the same client with different configurations (e.g., different schedules, different root category mappings).
:::

#### Collect Configuration Data

**Button**: `collect_config_data_btn`
**Action**: Fetch configuration data from PlentyONE
**Purpose**: Download current category structure, properties, and locales from PlentyONE

**When to Use**:
- ✅ After creating or editing client configuration
- ✅ When PlentyONE categories or properties have changed
- ✅ Before configuring root category or attribute mappings
- ✅ After adding new locales in PlentyONE

**What Gets Collected**:
- PlentyONE category tree and structure
- Available category properties for mapping
- Locale configurations
- Client-specific settings

:::warning Required Step
You must collect configuration data before you can configure root category mappings or attribute mappings. The system needs this data to populate dropdown options.
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

**Purpose**: Automate category export execution via cron scheduling.

#### Enable Schedule

**Field**: `status`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Enable automatic category export processing via the scheduler. When enabled, categories will be exported to PlentyONE according to the configured schedule.

**When Enabled**:
- Profile executes automatically based on schedule
- Categories in export queue are processed in batches
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

Select the cron schedule that determines when this category export profile runs automatically.

**Available Actions**:
- **Edit**: Modify existing schedule settings (frequency, time, batch limits)
- **New Schedule**: Create a new cron schedule configuration
- **View Schedules**: See overview of all scheduled tasks and next run times

**Common Schedule Patterns**:
- **Real-time sync**: Every 5-15 minutes (for event-driven exports)
- **Regular updates**: Every 1 hour (for moderate change frequency)
- **Daily batch**: Once per day (for low change frequency)
- **Manual only**: Disable scheduling (for complete manual control)

:::tip Schedule Selection
Choose schedule frequency based on:
- How often categories change in Magento
- Whether event observers are enabled
- System resource availability
- Business requirements for sync timing
:::

#### Process Batch Size

**Field**: `process_batch_size`
**Type**: Number
**Default**: 100
**Scope**: Global
**Required**: No

Number of categories to process in each batch during scheduled execution.

**Recommendations**:
- **Small installations** (< 500 categories): 100-200
- **Medium installations** (500-2000 categories): 50-100
- **Large installations** (> 2000 categories): 25-50
- **Limited resources**: Reduce batch size to prevent timeouts

**Performance Impact**:
- **Larger batches**: Faster overall processing, higher memory usage, higher timeout risk
- **Smaller batches**: Slower processing, lower memory usage, more reliable execution

#### Enable History

**Field**: `enable_history`
**Type**: Toggle (Yes/No)
**Default**: Yes
**Scope**: Global

Enable logging of all processed category data to the profile history.

**When Enabled**:
- Detailed execution logs for each export run
- Per-category processing status and results
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

Controls how category data is sent to PlentyONE during export operations.

**Options**:

**Append** (Recommended)
- Creates new categories if they don't exist in PlentyONE
- Updates existing categories with new data
- Preserves existing PlentyONE categories not in Magento
- **Use for**: Normal operations, incremental updates

**Replace**
- Deletes existing category structure in PlentyONE
- Creates fresh category tree from Magento
- **Destructive operation** - removes all existing categories
- **Use for**: Initial setup, complete rebuilds only

:::danger Replace Mode
Replace mode permanently deletes all existing categories in PlentyONE before importing new ones. Use only during initial setup or when explicitly rebuilding the entire category structure.
:::

**Sync**
- Matches Magento categories with PlentyONE
- Updates only matched categories
- Does not create new categories
- **Use for**: Updating existing category data without structural changes

#### API Collection Size

**Field**: `collection_size`
**Type**: Number
**Default**: 100
**Scope**: Global
**Required**: No

Number of category items returned per page in API requests when collecting data from PlentyONE.

**Configuration**:
- **Default**: 50
- **Maximum**: 500
- **Recommended**: 100

**When to Adjust**:
- **Large category trees**: Increase to 200-500 to reduce API calls
- **API timeout issues**: Decrease to 25-50 for more reliable requests
- **Rate limiting problems**: Decrease to stay within API limits

**Impact**:
- **Higher values**: Fewer API calls, faster data collection, higher memory usage
- **Lower values**: More API calls, slower collection, lower memory usage, more reliable

---

### 4. Store Configuration

**Purpose**: Map Magento store views to PlentyONE clients and locales for multi-language category export.

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
- Allows for advanced multi-client scenarios

**Locale** (required)
- PlentyONE locale (language) to use for this store's category data
- Must match locales configured in PlentyONE
- Ensures category names/descriptions are exported in correct language

**Example Configurations**:

**Single Language**:
```
Store: Default Store View
Client: 1 (Main Store)
Locale: en
```

**Multi-Language Setup**:
```
Store: English Store View → Client: 1, Locale: en
Store: German Store View → Client: 1, Locale: de
Store: French Store View → Client: 1, Locale: fr
```

**Multi-Store Setup**:
```
Store: US Store → Client: 1, Locale: en
Store: UK Store → Client: 1, Locale: en
Store: DE Store → Client: 2, Locale: de
```

:::tip Store Mapping Best Practices
1. Map each active store view to ensure complete category data export
2. Match Magento store locales to PlentyONE locales exactly
3. Test each mapping individually before enabling all
4. Verify category names are properly translated in each store view
:::

---

### 5. Category Configuration

**Purpose**: Map root categories and attributes between Magento and PlentyONE.

#### Root Category Mapping

**Field**: `root_category_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Map Magento root categories to PlentyONE categories to define which category trees get exported.

**Row Configuration**:

**Magento Category** (required)
- Select root category from Magento category tree
- Only categories at root level or designated as roots
- Defines starting point for category export

**PlentyONE Category** (required)
- Select corresponding root category in PlentyONE
- Must exist in PlentyONE before mapping
- Child categories will be created/updated under this root

**How It Works**:
1. Profile identifies all categories under each mapped Magento root
2. Category hierarchy is preserved during export
3. Categories are created/updated under corresponding PlentyONE root
4. Unmapped categories are not exported

**Example Mappings**:
```
Magento Category: "Default Category" → PlentyONE Category: "Webshop"
Magento Category: "Electronics" → PlentyONE Category: "Electronics_EN"
Magento Category: "Clothing" → PlentyONE Category: "Fashion"
```

**Actions**:
- **Create Root Category**: Create a new root category directly in PlentyONE from Magento admin
- **Add Mapping**: Add additional root category mappings
- **Delete**: Remove a mapping (does not delete actual categories)

:::warning Multiple Root Categories
If you have multiple Magento root categories (multi-store setup), you must map each one separately. Unmapped root categories and their children will not be exported.
:::

#### Attribute Mapping

**Field**: `attribute_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Map Magento category attributes to PlentyONE category properties for additional data synchronization.

**Row Configuration**:

**Plenty Property** (required)
- Select PlentyONE category property to receive data
- Properties must be configured in PlentyONE first
- Available after collecting configuration data

**Magento Attribute** (required)
- Select Magento category attribute to export
- Can be standard or custom category attributes
- Value will be sent to mapped PlentyONE property

**Common Mappings**:
```
Plenty Property: "meta_title" → Magento Attribute: "meta_title"
Plenty Property: "meta_description" → Magento Attribute: "meta_description"
Plenty Property: "custom_label" → Magento Attribute: "custom_category_label"
```

**Supported Attribute Types**:
- Text and textarea attributes
- Select and multiselect attributes
- Yes/No boolean attributes
- Date attributes

**Data Flow**:
- Attribute values are read from Magento category
- Values are transformed according to attribute type
- Values are sent to PlentyONE via mapped property
- Multi-language values exported based on store mapping

:::tip Attribute Mapping Tips
1. Create PlentyONE properties before mapping
2. Collect configuration data to see available properties
3. Match data types between Magento attributes and PlentyONE properties
4. Test with a few categories before enabling all mappings
:::

---

### 6. Event Configuration

**Purpose**: Automatically trigger category exports when categories are created or deleted in Magento.

#### Add New Categories To Export Queue

**Field**: `new_entity_observer`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Automatically adds newly created Magento categories to the export queue.

**How It Works**:
1. Admin creates a new category in Magento
2. Observer detects the category creation event
3. Category is added to export queue automatically
4. Next scheduled profile execution exports the category to PlentyONE

**When to Enable**:
- ✅ Categories are created frequently in Magento
- ✅ You want near real-time category synchronization
- ✅ Scheduled exports run regularly (every 15-30 minutes)
- ✅ Magento is the master system for category management

**When to Disable**:
- ❌ You manually control which categories get exported
- ❌ You only export during specific maintenance windows
- ❌ You prefer batch exports over incremental sync
- ❌ PlentyONE is the master system for categories

**Workflow Example**:
```
Time 10:00 → Category "Summer Collection 2024" created in Magento
Time 10:00 → Observer adds category to export queue
Time 10:15 → Scheduled export runs
Time 10:15 → "Summer Collection 2024" exported to PlentyONE
```

:::info Queue Processing
Categories are queued, not exported immediately. Ensure you have scheduled exports enabled and running regularly, or export queue items will accumulate without being processed.
:::

#### Delete Categories Externally

**Field**: `deleted_entity_observer`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Automatically removes deleted Magento categories from PlentyONE.

**How It Works**:
1. Admin deletes a category in Magento
2. Observer detects the category deletion event
3. Corresponding category is deleted in PlentyONE immediately
4. Deletion happens synchronously (not queued)

:::danger Destructive Action
Enabling this option will permanently delete categories in PlentyONE when deleted in Magento. This action is immediate and cannot be undone. Products assigned to deleted categories may lose their category assignments in PlentyONE.
:::

**When to Enable**:
- ✅ Magento is the authoritative master for category structure
- ✅ You want automatic cleanup of obsolete categories
- ✅ You understand deletions are permanent and immediate
- ✅ Category structures are always synchronized between systems

**When to Disable**:
- ❌ PlentyONE is the master system or equal authority
- ❌ You want to manually control category deletions
- ❌ Categories might be shared across multiple systems
- ❌ You need approval workflows for category deletions
- ❌ Products in PlentyONE depend on these category assignments

**Deletion Behavior**:
- Category is deleted from PlentyONE immediately (not queued)
- Products assigned to category lose that category assignment
- Child categories are NOT automatically deleted (depends on PlentyONE settings)
- Deletion is logged in system logs

:::warning Pre-Production Testing
Test this feature thoroughly in a staging environment before enabling in production. Create test categories, delete them, and verify PlentyONE behavior matches expectations.
:::

---

### 7. Log Configuration

**Purpose**: Control diagnostic logging of API requests and responses for troubleshooting.

#### Log Request Data to File

**Field**: `is_active_request_log`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Enable logging of all API request data sent to PlentyONE to file system.

**Log Location**: `var/log/plenty/category_export_request.log`

**What Gets Logged**:
- Complete API request URLs
- Request headers (including authentication tokens)
- Request body payload (category data being sent)
- Request timestamps
- Request method (POST, PUT, DELETE)

**When to Enable**:
- ✅ Troubleshooting category export failures
- ✅ Debugging data mapping issues
- ✅ Verifying correct data is being sent to PlentyONE
- ✅ API integration issues or errors
- ✅ During initial setup and testing

**When to Disable**:
- ❌ Production environment with stable integration
- ❌ Concerned about disk space usage
- ❌ Sensitive data in category attributes
- ❌ High-frequency exports generating large logs

:::warning Security Consideration
Request logs contain API authentication tokens and potentially sensitive category data. Ensure log files are properly secured and access is restricted. Do not share logs publicly without sanitizing sensitive information.
:::

#### Log Response Data to File

**Field**: `is_active_response_log`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Enable logging of all API response data received from PlentyONE to file system.

**Log Location**: `var/log/plenty/category_export_response.log`

**What Gets Logged**:
- Complete API response body
- Response headers
- HTTP status codes (200, 400, 500, etc.)
- Error messages from PlentyONE
- Response timestamps
- Response processing time

**When to Enable**:
- ✅ Troubleshooting PlentyONE API errors
- ✅ Debugging category creation failures
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
3. Verify category IDs are being returned correctly
4. Monitor response times for performance issues
5. Cross-reference with request logs to see full API interaction

:::tip Temporary Logging
Enable logging only when actively troubleshooting issues. Leave disabled during normal operations to conserve disk space and maintain optimal performance.
:::

---

## Common Workflows

### Initial Category Structure Setup

**Scenario**: First-time export of Magento category tree to PlentyONE during integration setup.

**Configuration**:
```
Client Configuration:
  ✓ Client: Main Store Client
  ✓ Collect Configuration Data: Execute

Schedule Configuration:
  ✓ Enable Schedule: No (manual execution for initial setup)

API Configuration:
  ✓ API Behaviour: Replace (initial setup)
  ✓ API Collection Size: 100

Store Configuration:
  ✓ Store: Default Store View → Client: 1, Locale: en

Category Configuration:
  ✓ Root Category: Default Category → Webshop
  ✓ Attribute Mapping: meta_title → meta_title

Event Configuration:
  ✓ New Entity Observer: No (enable after initial setup)
  ✓ Delete Entity Observer: No

Log Configuration:
  ✓ Log Requests: Yes (for initial testing)
  ✓ Log Responses: Yes (for verification)
```

**Steps**:
1. Create and configure client connection
2. Collect configuration data from PlentyONE
3. Configure root category mapping
4. Set API Behaviour to "Replace"
5. Enable request/response logging
6. Execute profile manually via CLI or admin panel
7. Verify category structure in PlentyONE
8. Review logs for any errors
9. Switch API Behaviour to "Append" after successful initial export
10. Enable scheduling and event observers for ongoing sync

---

### Automated Real-Time Synchronization

**Scenario**: Automatically export new categories to PlentyONE as they're created in Magento.

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
  ✓ API Collection Size: 100

Store Configuration:
  ✓ Store: English Store → Client: 1, Locale: en
  ✓ Store: German Store → Client: 1, Locale: de

Category Configuration:
  ✓ Root Category: Default Category → Webshop

Event Configuration:
  ✓ New Entity Observer: Yes (automatic queue addition)
  ✓ Delete Entity Observer: No (manual control of deletions)

Log Configuration:
  ✓ Log Requests: No
  ✓ Log Responses: No
```

**Workflow**:
1. Marketing team creates category "Spring Sale 2024" in Magento
2. New entity observer adds category to export queue automatically
3. Within 15 minutes, scheduled export processes queue
4. Category exported to PlentyONE with English and German names
5. History recorded with execution details
6. Team can continue creating categories without manual export steps

---

### Multi-Language Category Export

**Scenario**: Export category structure with translations for multiple languages/markets.

**Configuration**:
```
Store Configuration:
  ✓ Store: English Store → Client: 1, Locale: en
  ✓ Store: German Store → Client: 1, Locale: de
  ✓ Store: French Store → Client: 1, Locale: fr
  ✓ Store: Spanish Store → Client: 1, Locale: es

Category Configuration:
  ✓ Root Category: Default Category → Webshop_International
  ✓ Attribute Mapping:
    - meta_title → meta_title
    - meta_description → meta_description

Schedule Configuration:
  ✓ Enable Schedule: Yes
  ✓ Schedule: Every 1 hour
```

**How It Works**:
1. Each store mapping exports category data in its configured locale
2. Category names and descriptions are taken from each store view
3. Same category exported 4 times (once per language)
4. PlentyONE receives multilingual category data for all locales
5. Marketplace exports can use appropriate language per channel

**Prerequisites**:
- Categories must have translations in all Magento store views
- PlentyONE must have matching locales configured (en, de, fr, es)
- Store views must use correct locale codes

---

## CLI Commands

### Execute Category Export

```bash
# Execute category export profile manually
bin/magento plenty:category:export --profile-id=2

# Export specific categories by ID (comma-separated)
bin/magento plenty:category:export --profile-id=2 --entity-ids=5,12,18

# Force re-export of all categories (ignores previous export status)
bin/magento plenty:category:export --profile-id=2 --force

# Export with verbose output for debugging
bin/magento plenty:category:export --profile-id=2 -vvv
```

### Manage Export Queue

```bash
# View all categories currently in export queue
bin/magento byte8:plenty:category:queue --list

# Add specific category to export queue manually
bin/magento byte8:plenty:category:queue --add --entity-id=15

# Add multiple categories to queue
bin/magento byte8:plenty:category:queue --add --entity-ids=15,16,17

# Remove category from export queue
bin/magento byte8:plenty:category:queue --remove --entity-id=15

# Clear entire export queue (use with caution)
bin/magento byte8:plenty:category:queue --clear

# View queue statistics
bin/magento byte8:plenty:category:queue --stats
```

### Profile Management

```bash
# List all category export profiles
bin/magento byte8:profile:list --type=plenty_category_export

# View profile configuration
bin/magento byte8:profile:info --profile-id=2

# Enable/disable profile scheduling
bin/magento byte8:profile:schedule:enable --profile-id=2
bin/magento byte8:profile:schedule:disable --profile-id=2
```

### Debugging and Diagnostics

```bash
# Validate profile configuration
bin/magento byte8:plenty:category:validate --profile-id=2

# Test API connection for profile
bin/magento byte8:plenty:category:test-connection --profile-id=2

# View recent export history
bin/magento byte8:profile:history --profile-id=2 --limit=10

# Clear category export history
bin/magento byte8:profile:history:clear --profile-id=2 --older-than=30
```

---

## Troubleshooting

### Categories Not Exporting to PlentyONE

**Symptoms**:
- Categories created in Magento don't appear in PlentyONE
- Export executes but no categories are processed
- Queue contains items but they're not exported

**Diagnostic Steps**:

1. **Check Event Configuration**
   ```bash
   # Verify new entity observer is enabled if expecting automatic queue addition
   bin/magento config:show plenty_category/event_config/new_entity_observer
   ```
   - If disabled and you want automatic queuing, enable it in profile configuration

2. **Review Export Queue**
   ```bash
   bin/magento byte8:plenty:category:queue --list
   ```
   - Verify categories are actually in the queue
   - Check queue status (pending, processing, error)
   - Look for error messages in queue items

3. **Verify Root Category Mapping**
   - Navigate to profile → Category Configuration → Root Category Mapping
   - Ensure Magento categories are under a mapped root category
   - Verify PlentyONE root category exists and is accessible
   - Categories outside mapped roots will NOT be exported

4. **Check Schedule Configuration**
   ```bash
   # Verify scheduled export is enabled
   bin/magento config:show plenty_category/schedule_config/status

   # Check when schedule last ran
   bin/magento cron:job:list | grep category_export
   ```
   - If scheduling disabled, queue won't be processed automatically
   - If schedule hasn't run, cron may not be configured properly

5. **Review API Response Logs**
   - Enable response logging in profile configuration
   - Execute export manually
   - Check `var/log/plenty/category_export_response.log`
   - Look for API error codes (400, 401, 403, 500) or validation errors

6. **Verify Client Configuration**
   ```bash
   # Test API connection
   bin/magento byte8:plenty:category:test-connection --profile-id=2
   ```
   - Ensure client has valid credentials
   - Check API token hasn't expired
   - Verify client has permissions in PlentyONE

**Common Solutions**:
- Enable new entity observer if expecting automatic queuing
- Manually add categories to queue using CLI if observer disabled
- Fix root category mappings to include all desired categories
- Enable and configure schedule if expecting automatic processing
- Refresh API credentials if authentication failing
- Increase API timeout if requests are timing out

---

### Categories Deleted Unexpectedly in PlentyONE

**Symptoms**:
- Categories disappear from PlentyONE without manual deletion
- Category structure changes unexpectedly
- Products lose category assignments

**Diagnostic Steps**:

1. **Check Delete Observer Setting**
   ```bash
   bin/magento config:show plenty_category/event_config/deleted_entity_observer
   ```
   - If enabled (value: 1), deletions in Magento trigger PlentyONE deletions
   - Review if this is intentional behavior

2. **Review Magento Admin Logs**
   - Check `var/log/system.log` for category deletion events
   - Review admin user activity logs for who deleted categories
   - Check if deletions were intentional or accidental

3. **Check API Behaviour Setting**
   - Navigate to profile → HTTP API Configuration → API Behaviour
   - If set to "Replace", entire category tree is deleted and recreated on each export
   - Change to "Append" for incremental updates without deletions

4. **Review PlentyONE Logs**
   - Log into PlentyONE admin panel
   - Check system logs for category deletion events
   - Verify deletions came from Magento API (not manual PlentyONE actions)

**Solutions**:
1. **Disable Delete Observer**
   - Set "Delete Categories Externally" to No in Event Configuration
   - Categories deleted in Magento won't affect PlentyONE
   - Manually manage PlentyONE category cleanup

2. **Change API Behaviour to Append**
   - Prevents complete category tree replacement
   - Only creates/updates categories, doesn't delete existing ones

3. **Restore from Backup**
   - Use PlentyONE backup functionality to restore deleted categories
   - Re-import categories from Magento using profile execution
   - Verify configuration before re-enabling automation

4. **Implement User Permissions**
   - Restrict admin user permissions for category deletion in Magento
   - Require approval workflows for category structure changes
   - Add confirmation prompts for category deletions

---

### Duplicate Categories in PlentyONE

**Symptoms**:
- Same category appears multiple times with different IDs in PlentyONE
- Category hierarchy duplicated under wrong parent
- Mapping between Magento and PlentyONE categories broken

**Diagnostic Steps**:

1. **Check API Behaviour**
   - If set to "Replace", shouldn't cause duplicates (deletes everything first)
   - If set to "Append" or "Sync", duplicates may occur if category matching fails

2. **Review Category Mapping**
   - Check `catalog_plenty_entity` table for category ID mappings
   ```sql
   SELECT * FROM catalog_plenty_entity WHERE entity_type = 'category';
   ```
   - Look for multiple PlentyONE IDs mapped to same Magento category
   - Verify mappings are correct and up-to-date

3. **Check Execution History**
   - Review profile history for multiple executions in short time
   - Look for duplicate processing of same categories
   - Check if profile was executed multiple times during errors

4. **Verify Root Category Mapping**
   - Multiple or incorrect root mappings can cause hierarchy duplication
   - Ensure each Magento root maps to exactly one PlentyONE root
   - Check for orphaned categories without proper parent mapping

**Solutions**:

1. **Clean Up Duplicates in PlentyONE**
   - Manually delete duplicate categories in PlentyONE admin
   - Keep only the most recent/correct category instances
   - Note the correct category IDs for remapping

2. **Reset Category Mappings**
   ```bash
   # Clear category mappings (will trigger full re-export)
   bin/magento byte8:plenty:category:mapping:reset --profile-id=2
   ```
   - Clears Magento-to-PlentyONE category ID mappings
   - Next export will re-establish correct mappings
   - Use with caution - may cause category recreation

3. **Re-Export with Fresh Start**
   - Set API Behaviour to "Replace" temporarily
   - Execute export to rebuild entire category tree
   - Verify clean structure in PlentyONE
   - Change API Behaviour back to "Append"

4. **Fix Root Category Mapping**
   - Review and correct root category mappings in profile
   - Ensure clear, non-overlapping mappings
   - Test with small subset before full export

---

### Multi-Language Export Issues

**Symptoms**:
- Category names not translated in PlentyONE
- Only one language exported despite multiple store mappings
- Wrong language appearing in PlentyONE locales

**Diagnostic Steps**:

1. **Verify Store Mappings**
   - Check profile → Store Configuration → Store Mapping
   - Ensure each store view mapped to correct locale
   - Verify all active store views are included

2. **Check Category Translations in Magento**
   - Switch store view in Magento admin
   - Verify category names are actually translated
   - Check that category is enabled in each store view

3. **Verify PlentyONE Locale Configuration**
   ```bash
   # View collected configuration data
   bin/magento byte8:plenty:category:config --profile-id=2
   ```
   - Ensure PlentyONE has matching locales configured
   - Check locale codes match exactly (en, de, fr, not en_US, de_DE, fr_FR)

4. **Review Export Logs**
   - Enable request logging
   - Execute export manually
   - Check `var/log/plenty/category_export_request.log`
   - Verify data for each locale is being sent

**Solutions**:

1. **Complete Store Mappings**
   - Add missing store views to Store Mapping configuration
   - Map each store view to appropriate PlentyONE locale
   - Save and re-collect configuration data if needed

2. **Translate Categories**
   - Switch to each store view in Magento admin
   - Update category name and description for each language
   - Ensure "Use Default Value" is unchecked for translated fields
   - Save changes and re-export

3. **Match Locale Codes**
   - Check PlentyONE locale settings
   - Adjust store mapping locale codes to match exactly
   - Common mappings:
     ```
     Magento: en_US → PlentyONE: en
     Magento: de_DE → PlentyONE: de
     Magento: fr_FR → PlentyONE: fr
     ```

4. **Re-Export with Force Flag**
   ```bash
   # Force re-export all categories
   bin/magento plenty:category:export --profile-id=2 --force
   ```
   - Ignores previous export status
   - Re-sends all category data including translations
   - Verify results in PlentyONE after completion

---

### Profile Execution Timeouts

**Symptoms**:
- Export fails with timeout error
- PHP fatal error: Maximum execution time exceeded
- Incomplete category export with some categories missing

**Diagnostic Steps**:

1. **Check Batch Size Configuration**
   - Large batch sizes with complex categories can cause timeouts
   - Review Schedule Configuration → Process Batch Size
   - Check how many categories are in export queue

2. **Review PHP Configuration**
   ```bash
   php -i | grep max_execution_time
   php -i | grep memory_limit
   ```
   - Default PHP execution time may be too low (60-120 seconds)
   - Memory limit may be insufficient for large category trees

3. **Check Category Complexity**
   - Categories with many attribute mappings take longer
   - Deep category hierarchies increase processing time
   - Large number of store mappings multiplies export operations

**Solutions**:

1. **Reduce Batch Size**
   - Decrease Process Batch Size from 100 to 25-50
   - Smaller batches process faster and more reliably
   - More frequent executions compensate for smaller batches

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
   bin/magento plenty:category:export --profile-id=2
   ```
   - Schedule using system cron instead of Magento cron for better resource allocation

4. **Split Into Multiple Profiles**
   - Create separate profiles for different root categories
   - Each profile handles smaller subset of categories
   - Schedule profiles at different times to spread load

---

## Best Practices

### Initial Setup

1. **Plan Before Execution**
   - Document category structure requirements
   - Map out root category relationships
   - Identify which attributes need synchronization
   - Plan multi-language strategy if applicable

2. **Test in Staging First**
   - Set up and test complete configuration in staging environment
   - Export test categories and verify in PlentyONE
   - Validate all store mappings and translations
   - Only deploy to production after successful testing

3. **Use Replace Mode Once**
   - Use "Replace" API Behaviour only for initial setup
   - Immediately switch to "Append" after first successful export
   - Never use Replace in production with established data

4. **Enable Logging Initially**
   - Turn on request and response logging during setup
   - Review logs to understand data flow and catch issues early
   - Disable logging after stable operation is confirmed

5. **Start with Manual Execution**
   - Disable scheduling during initial setup
   - Execute manually and review results after each run
   - Enable scheduling only after successful manual executions

### Ongoing Operations

1. **Monitor Export Queue**
   - Regularly check queue size and status
   ```bash
   bin/magento byte8:plenty:category:queue --stats
   ```
   - Investigate if queue grows continuously without processing
   - Clear stuck items and resolve underlying issues

2. **Review Execution History**
   - Periodically check profile history for errors
   - Set up email notifications for export failures
   - Track execution times to identify performance degradation

3. **Maintain Clean Logs**
   - Keep logging disabled during normal operations
   - Enable only when troubleshooting specific issues
   - Rotate or clear old log files to manage disk space
   ```bash
   # Clear logs older than 30 days
   find var/log/plenty/ -name "category_*" -mtime +30 -delete
   ```

4. **Optimize Schedule Frequency**
   - Match frequency to business needs (not faster than necessary)
   - Consider system resources and load patterns
   - Adjust based on category change frequency

5. **Regular Configuration Review**
   - Quarterly review of profile configuration
   - Update mappings when adding new locales or store views
   - Verify API credentials are current and valid
   - Check for deprecated settings after system upgrades

### Event-Driven Exports

1. **Understand Observer Impact**
   - New entity observer adds categories to queue (not immediate export)
   - Delete entity observer triggers immediate deletion (not queued)
   - Plan accordingly for each type of automation

2. **Match Schedule to Observers**
   - If new entity observer enabled, schedule frequent exports (15-30 minutes)
   - If observers disabled, schedule based on manual queue management
   - Don't enable observers without scheduled processing

3. **Use Delete Observer Cautiously**
   - Only enable if Magento is definitive master for category structure
   - Thoroughly test in staging before production use
   - Document the behavior for all admin users
   - Consider disabling if category deletions are rare

4. **Monitor Automatic Processes**
   - Track which categories are automatically queued
   - Review observer-triggered actions in logs
   - Disable observers if unexpected behavior occurs
   - Re-evaluate automation strategy periodically

### Multi-Language Configuration

1. **Complete Translations Before Export**
   - Ensure all category names translated in all store views
   - Verify descriptions and custom attributes are translated
   - Check that "Use Default Value" is unchecked for translated fields

2. **Match Locale Codes Exactly**
   - PlentyONE and Magento must use same locale format
   - Document locale code mappings for reference
   - Test each language individually before enabling all

3. **Test Per Language**
   - Export one language at a time initially
   - Verify data appears correctly in PlentyONE for each locale
   - Ensure no language data overwrites another

4. **Consistent Store View Usage**
   - Don't change store view locale codes after initial mapping
   - Keep store view configuration stable across environments
   - Document any locale code changes and update mappings

### Performance Optimization

1. **Appropriate Batch Sizes**
   - Start with default (100) and adjust based on performance
   - Reduce if timeouts occur
   - Increase cautiously if system handles load well

2. **Schedule During Off-Peak Hours**
   - Run large exports during low-traffic periods
   - Avoid peak shopping hours for scheduled exports
   - Consider separate schedules for different profiles

3. **Use Queue Efficiently**
   - Don't let queue grow unbounded
   - Process queue items regularly through scheduling
   - Clear failed items after resolving issues

4. **Limit Attribute Mappings**
   - Only map attributes that are actually used in PlentyONE
   - Unnecessary mappings increase processing time and data transfer
   - Review and remove unused mappings periodically

### Security and Maintenance

1. **Protect Log Files**
   - Restrict file system access to log directories
   - Logs contain API tokens and potentially sensitive data
   - Don't commit log files to version control
   - Sanitize logs before sharing for support

2. **Secure API Credentials**
   - Store credentials in `env.php` or environment variables (not database)
   - Rotate API passwords periodically
   - Use API users with minimal required permissions in PlentyONE
   - Monitor API access logs for unusual activity

3. **Backup Before Major Changes**
   - Export profile configuration before major updates
   - Backup PlentyONE category structure before using Replace mode
   - Keep staging environment synchronized with production configuration
   - Document all configuration changes

4. **Keep Systems Updated**
   - Regularly update Mage2Plenty connector modules
   - Monitor for PlentyONE API changes or deprecations
   - Test updates in staging before applying to production
   - Review release notes for breaking changes

---

## Related Documentation

- [Category Import Profile](/docs/profiles/category-import) - Import categories from PlentyONE to Magento
- [Item Export Profile](/docs/profiles/item-export) - Export products with category assignments
- [About Profiles](/docs/profiles/about-profiles) - Overview of profile system
- [Creating a Profile](/docs/profiles/create-profile) - General profile creation guide
- [Client Configuration](/docs/configuration/client) - PlentyONE client setup and management

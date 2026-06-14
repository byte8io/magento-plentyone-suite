---
sidebar_position: 5
title: Category Import Profile
description: Import categories from PlentyONE to Magento using the Category Import Profile
---

# Category Import Profile

The **Category Import Profile** synchronizes category structures from PlentyONE to Magento, creating and updating Magento categories based on your PlentyONE category tree. This profile enables automatic or manual import of category hierarchies, names, descriptions, and attributes to maintain consistent category structures across both systems.

## Overview

**Profile Type ID**: `plenty_category_import`
**Direction**: PlentyONE → Magento
**Purpose**: Import category hierarchy, names, descriptions, and attributes from PlentyONE to Magento

### What Gets Imported

- **Category Structure**: Complete category hierarchy and parent-child relationships
- **Category Names**: Multi-language category names for all configured store views
- **Category Descriptions**: Full category descriptions and content
- **Category Attributes**: Mapped properties from PlentyONE to Magento attributes
- **Category Status**: Active/inactive status synchronization
- **Root Categories**: Top-level category mappings between systems

### Primary Use Cases

- **Initial Setup**: Populate Magento with complete PlentyONE category structure during initial integration
- **Category Synchronization**: Keep category structures synchronized between PlentyONE and Magento
- **Multi-Language Import**: Import translated category data for all configured locales
- **Automated Updates**: Automatically import updated categories from PlentyONE
- **Marketplace Management**: Maintain consistent category structure across marketplace channels

### Import Workflow

```
PlentyONE Categories
       ↓
[API Data Collection]
       ↓
[Root Category Filtering]
       ↓
[Attribute Mapping]
       ↓
[Multi-Language Processing]
       ↓
[Category Creation/Update in Magento]
       ↓
[Status Update & Logging]
```

---

## Configuration

The Category Import Profile configuration is organized into sections that mirror the admin interface. Each section controls specific aspects of the import process.

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
While you can only have one active client, you can create multiple category import profiles using the same client with different configurations (e.g., different schedules, different root category mappings).
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

**Purpose**: Automate category import execution via cron scheduling.

#### Enable Schedule

**Field**: `status`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Enable automatic category import processing via the scheduler. When enabled, categories will be imported from PlentyONE according to the configured schedule.

**When Enabled**:
- Profile executes automatically based on schedule
- Categories are imported in batches
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

Select the cron schedule that determines when this category import profile runs automatically.

**Available Actions**:
- **Edit**: Modify existing schedule settings (frequency, time, batch limits)
- **New Schedule**: Create a new cron schedule configuration
- **View Schedules**: See overview of all scheduled tasks and next run times

**Common Schedule Patterns**:
- **Real-time sync**: Every 15-30 minutes (for frequent PlentyONE updates)
- **Regular updates**: Every 1-2 hours (for moderate change frequency)
- **Daily batch**: Once per day (for low change frequency)
- **Manual only**: Disable scheduling (for complete manual control)

:::tip Schedule Selection
Choose schedule frequency based on:
- How often categories change in PlentyONE
- System resource availability
- Business requirements for sync timing
- Whether PlentyONE is master system
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
- Detailed execution logs for each import run
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

Controls how category data is handled in Magento during import operations.

**Options**:

**Append** (Recommended)
- Creates new categories if they don't exist in Magento
- Updates existing categories with new data
- Preserves existing Magento categories not in PlentyONE
- **Use for**: Normal operations, incremental updates

**Replace**
- Deletes existing category structure in Magento
- Creates fresh category tree from PlentyONE
- **Destructive operation** - removes all existing categories
- **Use for**: Initial setup, complete rebuilds only

:::danger Replace Mode
Replace mode permanently deletes all existing categories in Magento before importing new ones. Use only during initial setup or when explicitly rebuilding the entire category structure.
:::

**Sync**
- Matches PlentyONE categories with Magento
- Updates only matched categories
- Does not create new categories
- **Use for**: Updating existing category data without structural changes

**Delete**
- Removes categories that no longer exist in PlentyONE
- Updates and creates categories as needed
- Maintains synchronization including deletions
- **Use for**: Keeping Magento exactly synchronized with PlentyONE

#### API Collection Size

**Field**: `collection_size`
**Type**: Number
**Default**: 100
**Scope**: Global
**Required**: No

Number of category items returned per page in API requests when fetching data from PlentyONE.

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

**Purpose**: Map PlentyONE clients and locales to Magento store views for multi-language category import.

#### Store Mapping

**Field**: `store_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Configure which Magento store views import from which PlentyONE client and locale combinations.

**Row Configuration**:

**Store** (required)
- Select Magento store view to import to
- Each store view can have its own mapping
- Supports multi-store, multi-language configurations

**Client** (required)
- PlentyONE client (plentyID) to import from
- Typically matches the client selected in Client Configuration
- Allows for advanced multi-client scenarios

**Locale** (required)
- PlentyONE locale (language) to use for this store's category data
- Must match locales configured in PlentyONE
- Ensures category names/descriptions are imported in correct language

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
1. Map each active store view to ensure complete category data import
2. Match PlentyONE locales to Magento store locales exactly
3. Test each mapping individually before enabling all
4. Verify category names are properly translated in PlentyONE for each locale
:::

---

### 5. Category Configuration

**Purpose**: Map root categories and attributes between PlentyONE and Magento.

#### Root Category Mapping

**Field**: `root_category_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Map PlentyONE root categories to Magento categories to define where category trees are imported.

**Row Configuration**:

**Magento Category** (required)
- Select root category in Magento category tree
- Categories at root level or designated as roots
- Defines destination for category import

**PlentyONE Category** (required)
- Select corresponding root category in PlentyONE
- Must exist in PlentyONE before mapping
- Child categories will be imported under this mapping

**How It Works**:
1. Profile identifies all categories under each mapped PlentyONE root
2. Category hierarchy is preserved during import
3. Categories are created/updated under corresponding Magento root
4. Unmapped categories are not imported

**Example Mappings**:
```
Magento Category: "Default Category" → PlentyONE Category: "Webshop"
Magento Category: "Electronics" → PlentyONE Category: "Electronics_PM"
Magento Category: "Clothing" → PlentyONE Category: "Fashion"
```

**Actions**:
- **Create Root Category**: Create a new root category directly in PlentyONE from Magento admin
- **Add Mapping**: Add additional root category mappings
- **Delete**: Remove a mapping (does not delete actual categories)

:::warning Multiple Root Categories
If PlentyONE has multiple root categories, you must map each one separately if you want to import them. Unmapped root categories and their children will not be imported.
:::

#### Attribute Mapping

**Field**: `attribute_mapping` (dynamic rows)
**Type**: Mapping table
**Scope**: Global

Map PlentyONE category properties to Magento category attributes for additional data synchronization.

**Row Configuration**:

**Plenty Property** (required)
- Select PlentyONE category property to import from
- Properties must be configured in PlentyONE first
- Available after collecting configuration data

**Magento Attribute** (required)
- Select Magento category attribute to receive data
- Can be standard or custom category attributes
- Value will be imported from mapped PlentyONE property

**Common Mappings**:
```
Plenty Property: "name" → Magento Attribute: "name"
Plenty Property: "description" → Magento Attribute: "description"
Plenty Property: "meta_title" → Magento Attribute: "meta_title"
Plenty Property: "meta_description" → Magento Attribute: "meta_description"
Plenty Property: "is_active" → Magento Attribute: "is_active"
```

**Supported Attribute Types**:
- Text and textarea attributes
- Select and multiselect attributes
- Yes/No boolean attributes
- Date attributes

**Data Flow**:
- Property values are read from PlentyONE category
- Values are transformed according to attribute type
- Values are saved to Magento via mapped attribute
- Multi-language values imported based on store mapping

:::tip Attribute Mapping Tips
1. Create custom Magento attributes before mapping if needed
2. Collect configuration data to see available PlentyONE properties
3. Match data types between PlentyONE properties and Magento attributes
4. Test with a few categories before enabling all mappings
:::

---

### 6. Log Configuration

**Purpose**: Control diagnostic logging of API requests and responses for troubleshooting.

#### Log Request Data to File

**Field**: `is_active_request_log`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Enable logging of all API request data sent to PlentyONE to file system.

**Log Location**: `var/log/plenty/category_import_request.log`

**What Gets Logged**:
- Complete API request URLs
- Request headers (including authentication tokens)
- Request parameters and filters
- Request timestamps
- Request method (GET, POST, etc.)

**When to Enable**:
- ✅ Troubleshooting category import failures
- ✅ Debugging data collection issues
- ✅ Verifying correct API calls are being made
- ✅ API integration issues or errors
- ✅ During initial setup and testing

**When to Disable**:
- ❌ Production environment with stable integration
- ❌ Concerned about disk space usage
- ❌ No active troubleshooting needed
- ❌ High-frequency imports generating large logs

:::warning Security Consideration
Request logs contain API authentication tokens and potentially sensitive data. Ensure log files are properly secured and access is restricted. Do not share logs publicly without sanitizing sensitive information.
:::

#### Log Response Data to File

**Field**: `is_active_response_log`
**Type**: Toggle (Yes/No)
**Default**: No
**Scope**: Global

Enable logging of all API response data received from PlentyONE to file system.

**Log Location**: `var/log/plenty/category_import_response.log`

**What Gets Logged**:
- Complete API response body
- Response headers
- HTTP status codes (200, 400, 500, etc.)
- Error messages from PlentyONE
- Response timestamps
- Response processing time

**When to Enable**:
- ✅ Troubleshooting PlentyONE API errors
- ✅ Debugging category data issues
- ✅ Investigating missing or incorrect data
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
3. Verify category data structure is correct
4. Monitor response times for performance issues
5. Cross-reference with request logs to see full API interaction

:::tip Temporary Logging
Enable logging only when actively troubleshooting issues. Leave disabled during normal operations to conserve disk space and maintain optimal performance.
:::

---

## Common Workflows

### Initial Category Structure Import

**Scenario**: First-time import of PlentyONE category tree to Magento during integration setup.

**Configuration**:
```
Client Configuration:
  ✓ Client: Main Store Client
  ✓ Collect Configuration Data: Execute

Schedule Configuration:
  ✓ Enable Schedule: No (manual execution for initial setup)

API Configuration:
  ✓ API Behaviour: Replace (initial setup - clears existing)
  ✓ API Collection Size: 100

Store Configuration:
  ✓ Store: Default Store View → Client: 1, Locale: en

Category Configuration:
  ✓ Root Category: Default Category → Webshop
  ✓ Attribute Mapping:
    - name → name
    - description → description
    - meta_title → meta_title

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
7. Verify category structure in Magento
8. Review logs for any errors
9. Switch API Behaviour to "Append" after successful initial import
10. Enable scheduling for ongoing sync

---

### Automated Regular Synchronization

**Scenario**: Automatically import category updates from PlentyONE on a regular schedule.

**Configuration**:
```
Client Configuration:
  ✓ Client: Main Store Client

Schedule Configuration:
  ✓ Enable Schedule: Yes
  ✓ Schedule: Every 30 minutes
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

Log Configuration:
  ✓ Log Requests: No
  ✓ Log Responses: No
```

**Workflow**:
1. Categories are updated in PlentyONE by marketplace management team
2. Within 30 minutes, scheduled import runs automatically
3. New and updated categories are imported to Magento
4. Category data appears in both English and German store views
5. History recorded with execution details
6. Teams can continue managing categories in PlentyONE

---

### Multi-Language Category Import

**Scenario**: Import category structure with translations for multiple languages/markets.

**Configuration**:
```
Store Configuration:
  ✓ Store: English Store → Client: 1, Locale: en
  ✓ Store: German Store → Client: 1, Locale: de
  ✓ Store: French Store → Client: 1, Locale: fr
  ✓ Store: Spanish Store → Client: 1, Locale: es

Category Configuration:
  ✓ Root Category: Default Category → International_Webshop
  ✓ Attribute Mapping:
    - name → name
    - description → description
    - meta_title → meta_title
    - meta_description → meta_description

Schedule Configuration:
  ✓ Enable Schedule: Yes
  ✓ Schedule: Every 1 hour
```

**How It Works**:
1. Each store mapping imports category data in its configured locale
2. Category names and descriptions are fetched from PlentyONE for each language
3. Same category imported 4 times (once per language/store view)
4. Magento has multilingual category data for all locales
5. Store-specific category translations available

**Prerequisites**:
- Categories must have translations in PlentyONE for all configured locales
- Magento store views must use correct locale codes
- PlentyONE must have matching locales configured (en, de, fr, es)

---

## CLI Commands

### Execute Category Import

```bash
# Execute category import profile manually
bin/magento plenty:category:import --profile-id=1

# Import specific categories by ID (comma-separated)
bin/magento plenty:category:import --profile-id=1 --entity-ids=5,12,18

# Force re-import of all categories (ignores previous import status)
bin/magento plenty:category:import --profile-id=1 --force

# Import with verbose output for debugging
bin/magento plenty:category:import --profile-id=1 -vvv

# Import for specific store view
bin/magento plenty:category:import --profile-id=1 --store-id=1
```

---

## Troubleshooting

### Categories Not Importing from PlentyONE

**Symptoms**:
- Categories exist in PlentyONE but don't appear in Magento
- Import executes but no categories are created
- No errors reported in execution history

**Diagnostic Steps**:

1. **Verify Root Category Mapping**
   - Navigate to profile → Category Configuration → Root Category Mapping
   - Ensure PlentyONE categories are mapped to Magento root categories
   - Verify Magento root category exists and is enabled
   - Categories outside mapped roots will NOT be imported

2. **Check Store Mapping Configuration**
   - Navigate to profile → Store Configuration → Store Mapping
   - Verify each store view has proper client and locale mapping
   - Ensure locale codes match exactly between systems

3. **Verify Configuration Data**
   - If no data or outdated, re-collect configuration data
   - Verify PlentyONE categories appear in dropdown after collection

4. **Review API Response Logs**
   - Enable response logging in profile configuration
   - Execute import manually
   - Check `var/log/plenty/category_import_response.log`
   - Look for API error codes (400, 401, 403, 500) or empty responses

5. **Check API Collection Size**
   - If many categories, API might be timing out
   - Try reducing collection size from 100 to 50
   - Check for partial data returns

6. **Verify Client Configuration**
   - Ensure client has valid credentials
   - Check API token hasn't expired
   - Verify client has permissions in PlentyONE

**Common Solutions**:
- Re-collect configuration data if PlentyONE categories don't appear in mappings
- Fix root category mappings to include all desired categories
- Verify store mappings are complete and correct
- Reduce API collection size if timeout issues
- Refresh API credentials if authentication failing

---

### Missing Category Names or Translations

**Symptoms**:
- Categories import but have blank names
- Only one language imported despite multiple store mappings
- Wrong language appearing in specific store views

**Diagnostic Steps**:

1. **Verify Store Mapping Locales**
   - Check profile → Store Configuration → Store Mapping
   - Ensure each store view mapped to correct locale
   - Verify all active store views are included

2. **Check Category Data in PlentyONE**
   - Log into PlentyONE admin panel
   - Navigate to category management
   - Verify category has name/description for the specific locale
   - Check that locale is activated in PlentyONE

3. **Review Attribute Mapping**
   - Navigate to profile → Category Configuration → Attribute Mapping
   - Verify "name" property is mapped to "name" attribute
   - Verify "description" property is mapped to "description" attribute
   - Ensure mappings are correct and saved

4. **Check Import Logs**
   - Enable request logging
   - Execute import manually
   - Check `var/log/plenty/category_import_request.log`
   - Verify correct locale parameter in API requests

5. **Verify Locale Code Matching**
   - Ensure PlentyONE locale codes match Magento expectations
   - Common formats: "en", "de", "fr" (not "en_US", "de_DE")

**Solutions**:

1. **Complete Store Mappings**
   - Add missing store views to Store Mapping configuration
   - Map each store view to appropriate PlentyONE locale
   - Save and re-collect configuration data if needed

2. **Add Category Translations in PlentyONE**
   - Log into PlentyONE admin
   - Edit categories to add translations for each required locale
   - Save changes in PlentyONE
   - Re-run import in Magento

3. **Fix Locale Code Matching**
   - Verify PlentyONE uses simple locale codes (en, de, fr)
   - Update store mapping to use matching codes
   - Common mappings:
     ```
     Magento Store: en_US → PlentyONE Locale: en
     Magento Store: de_DE → PlentyONE Locale: de
     Magento Store: fr_FR → PlentyONE Locale: fr
     ```

4. **Re-Import with Force Flag**
   ```bash
   # Force re-import all categories
   bin/magento plenty:category:import --profile-id=1 --force
   ```
   - Ignores previous import status
   - Re-fetches all category data including translations
   - Verify results in Magento after completion

---

### Duplicate Categories in Magento

**Symptoms**:
- Same category appears multiple times with different IDs in Magento
- Category hierarchy duplicated under wrong parent
- Mapping between PlentyONE and Magento categories broken

**Diagnostic Steps**:

1. **Check API Behaviour Setting**
   - Navigate to profile → HTTP API Configuration → API Behaviour
   - If set to "Replace", shouldn't cause duplicates (deletes everything first)
   - If set to "Append", duplicates may occur if category matching fails

2. **Review Category Mapping**
   - Check `catalog_plenty_entity` table for category ID mappings
   ```sql
   SELECT * FROM catalog_plenty_entity WHERE entity_type = 'category';
   ```
   - Look for multiple Magento IDs mapped to same PlentyONE category
   - Verify mappings are correct and up-to-date

3. **Check Execution History**
   - Review profile history for multiple executions in short time
   - Look for duplicate processing of same categories
   - Check if profile was executed multiple times during errors

4. **Verify Root Category Mapping**
   - Multiple or incorrect root mappings can cause hierarchy duplication
   - Ensure each PlentyONE root maps to exactly one Magento root
   - Check for orphaned categories without proper parent mapping

**Solutions**:

1. **Clean Up Duplicates in Magento**
   - Manually delete duplicate categories in Magento admin
   - Keep only the most recent/correct category instances
   - Note the correct category IDs for remapping

2. **Reset Category Mappings**
   - Clears PlentyONE-to-Magento category ID mappings
   - Next import will re-establish correct mappings
   - Use with caution - may cause category recreation

3. **Re-Import with Fresh Start**
   - Set API Behaviour to "Replace" temporarily
   - Execute import to rebuild entire category tree
   - Verify clean structure in Magento
   - Change API Behaviour back to "Append"

4. **Fix Root Category Mapping**
   - Review and correct root category mappings in profile
   - Ensure clear, non-overlapping mappings
   - Test with small subset before full import

---

### Incorrect Category Hierarchy

**Symptoms**:
- Categories imported but parent-child relationships are wrong
- Categories appear under wrong parent category
- Category tree structure doesn't match PlentyONE

**Diagnostic Steps**:

1. **Check Root Category Mapping**
   - Verify root categories are mapped correctly
   - Ensure only root categories are mapped (not mid-level categories)
   - Check if multiple roots are causing conflicts

2. **Review Category Import Order**
   - Parent categories must be imported before children
   - Check execution history for any ordering issues
   - Verify import processes categories in correct sequence

3. **Check Category URL Keys**
   - Duplicate URL keys can cause hierarchy issues
   - Review category URL keys in Magento
   - Ensure uniqueness within store view

4. **Verify PlentyONE Category Structure**
   - Log into PlentyONE admin
   - Navigate to category management
   - Verify source hierarchy is correct in PlentyONE
   - Check for circular references or orphaned categories

**Solutions**:

1. **Fix Root Category Mappings**
   - Map only true root categories (top-level)
   - Remove any mid-level category mappings
   - Ensure one-to-one mapping between roots

2. **Re-Import with Replace Mode**
   ```bash
   # Use Replace mode to rebuild entire tree
   # First, set API Behaviour to "Replace" in profile
   bin/magento plenty:category:import --profile-id=1
   ```
   - Clears existing structure
   - Rebuilds hierarchy from scratch
   - Ensures correct parent-child relationships

3. **Fix URL Key Conflicts**
   ```bash
   # Regenerate category URL rewrites
   bin/magento catalog:url:regenerate
   ```
   - Resolves URL key conflicts
   - Regenerates clean URL structure
   - May fix hierarchy display issues

4. **Manual Hierarchy Correction**
   - If specific categories are misplaced, manually move them in Magento admin
   - Update category mappings if needed
   - Re-run import with "Append" mode to update data without changing structure

---

### Profile Execution Timeouts

**Symptoms**:
- Import fails with timeout error
- PHP fatal error: Maximum execution time exceeded
- Incomplete category import with some categories missing

**Diagnostic Steps**:

1. **Check Batch Size Configuration**
   - Large batch sizes with complex categories can cause timeouts
   - Review Schedule Configuration → Process Batch Size
   - Check how many categories are being imported

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
   - Large number of store mappings multiplies import operations

4. **Check API Collection Size**
   - Very large collection sizes can cause timeout during API fetch
   - Review HTTP API Configuration → API Collection Size
   - Consider if too much data is requested per API call

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

3. **Reduce API Collection Size**
   - Decrease API Collection Size from 100 to 50
   - Reduces data per API call
   - More API calls but more reliable execution
   - Less memory per request

4. **Use CLI for Large Imports**
   - CLI has higher default timeout limits
   - Run manual imports via CLI instead of admin panel
   ```bash
   bin/magento plenty:category:import --profile-id=1
   ```
   - Schedule using system cron instead of Magento cron for better resource allocation

5. **Split Into Multiple Profiles**
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
   - Import test categories and verify in Magento
   - Validate all store mappings and translations
   - Only deploy to production after successful testing

3. **Use Replace Mode Once**
   - Use "Replace" API Behaviour only for initial setup
   - Immediately switch to "Append" after first successful import
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

1. **Monitor Execution History**
   - Regularly check profile history for errors
   - Set up email notifications for import failures
   - Track execution times to identify performance degradation

2. **Review Imported Categories**
   - Periodically check imported categories for accuracy
   - Verify names, descriptions, and attributes are correct
   - Ensure hierarchy matches PlentyONE structure

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
   - Adjust based on how often categories change in PlentyONE

5. **Regular Configuration Review**
   - Quarterly review of profile configuration
   - Update mappings when adding new locales or store views
   - Verify API credentials are current and valid
   - Check for deprecated settings after system upgrades

6. **Keep Configuration Data Fresh**
   - Re-collect configuration data when PlentyONE structure changes
   - After adding new categories or properties in PlentyONE
   - After adding new locales or clients
   - When dropdown options appear outdated

### Multi-Language Configuration

1. **Verify Translations in PlentyONE**
   - Ensure all category names translated in PlentyONE for all required locales
   - Verify descriptions and custom properties are translated
   - Check that translations are complete before import

2. **Match Locale Codes Exactly**
   - PlentyONE and Magento must use same locale format
   - Document locale code mappings for reference
   - Test each language individually before enabling all

3. **Test Per Language**
   - Import one language at a time initially
   - Verify data appears correctly in Magento for each locale
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
   - Run large imports during low-traffic periods
   - Avoid peak shopping hours for scheduled imports
   - Consider separate schedules for different profiles

3. **Optimize API Collection Size**
   - Balance between number of API calls and data per call
   - Larger sizes = fewer calls but more memory
   - Smaller sizes = more calls but more reliable

4. **Limit Attribute Mappings**
   - Only map attributes that are actually needed in Magento
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
   - Backup Magento category structure before using Replace mode
   - Keep staging environment synchronized with production configuration
   - Document all configuration changes

4. **Keep Systems Updated**
   - Regularly update Mage2Plenty connector modules
   - Monitor for PlentyONE API changes or deprecations
   - Test updates in staging before applying to production
   - Review release notes for breaking changes

---

## Related Documentation

- [Category Export Profile](/docs/profiles/category-export) - Export categories from Magento to PlentyONE
- [Item Import Profile](/docs/profiles/item-import) - Import products with category assignments
- [About Profiles](/docs/profiles/about-profiles) - Overview of profile system
- [Creating a Profile](/docs/profiles/create-profile) - General profile creation guide
- [Client Configuration](/docs/configuration/client) - PlentyONE client setup and management

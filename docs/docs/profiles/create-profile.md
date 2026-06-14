---
sidebar_position: 2
title: Creating a New Profile
description: Step-by-step guide to creating and configuring synchronization profiles
---

# Creating a New Profile

This guide walks you through the process of creating a new synchronization profile in Mage2Plenty. Profiles are the foundation of data exchange between Magento and PlentyONE.

## Prerequisites

Before creating a profile, ensure you have:

1. ✅ **Completed Initial Setup** - Run the [Initial Setup Wizard](/docs/configuration/initial-setup)
2. ✅ **Configured Authentication** - Set up [Client Configuration](/docs/configuration/client-configuration)
3. ✅ **Tested Connection** - Verified API connectivity to PlentyONE
4. ✅ **Collected Configuration** - Warehouses, shipping methods, payment methods imported
5. ✅ **Admin Permissions** - Access to **Byte8 → PlentyONE → Profiles**

:::info Profile Uniqueness
Remember: You can only create **ONE profile of each type**. Profiles are unique by their type ID (e.g., only one "Product Import" profile can exist).
:::

## Accessing Profile Management

1. Log in to your Magento Admin panel
2. Navigate to **Byte8 → PlentyONE → Profiles**
3. You'll see the Profile Management grid showing all existing profiles

**Navigation Path**: **Byte8 → PlentyONE → Profiles**

## Profile Management Grid

The Profile Management page displays all profiles in a searchable grid:

| Column | Description |
|--------|-------------|
| **ID** | Profile entity ID (unique identifier) |
| **Name** | Profile name (human-readable) |
| **Type** | Profile type (e.g., "Product Import [PlentyONE]") |
| **Status** | Current status (Enabled/Disabled) |
| **Created At** | Profile creation date/time |
| **Updated At** | Last modification date/time |
| **Actions** | Available operations (Edit, Execute, Delete, etc.) |

**Grid Features**:
- **Search**: Find profiles by name or type
- **Filters**: Filter by status, type, date range
- **Sort**: Click column headers to sort
- **Mass Actions**: Select multiple profiles for bulk operations

## Creating a New Profile

### Step 1: Initiate Profile Creation

1. In the Profile Management grid, click **Create New Profile** button (top-right corner)
2. The "New Profile" form page opens

:::tip Quick Access
You can also create a profile directly via URL: `admin/byte8/profile/new`
:::

### Step 2: Configure Profile Information

Fill in the basic profile information:

#### Profile Name

**Field**: Name
**Required**: Yes
**Description**: Internal name for the profile (not visible to customers)

**Examples**:
```
✅ Good Names:
- Product Import - Main Catalog
- Daily Order Export
- Stock Update - Warehouse 1
- Category Sync - English Store

❌ Bad Names:
- Profile 1
- Test
- Sync
- abc123
```

**Best Practices**:
- Use descriptive, meaningful names
- Include purpose (Import/Export)
- Add scope or frequency if relevant
- Use consistent naming convention

#### Profile Type

**Field**: Type ID
**Required**: Yes
**Type**: Dropdown selection
**Description**: Determines what data the profile synchronizes

**Available Profile Types**:

| Profile Type | Type ID | Description |
|--------------|---------|-------------|
| **Category Export** | `plenty_category_export` | Export Magento categories to PlentyONE |
| **Category Import** | `plenty_category_import` | Import PlentyONE categories to Magento |
| **Product Export** | `plenty_item_export` | Export Magento products to PlentyONE |
| **Product Import** | `plenty_item_import` | Import PlentyONE items to Magento |
| **Order Export** | `plenty_order_export` | Export Magento orders to PlentyONE |
| **Order Import** | `plenty_order_import` | Import PlentyONE orders to Magento |
| **Stock Import** | `plenty_stock_import` | Import PlentyONE stock to Magento |
| **Customer Export** | `plenty_customer_export` | Export Magento customers to PlentyONE |
| **Customer Import** | `plenty_customer_import` | Import PlentyONE contacts to Magento |

:::warning One Per Type
If a profile of the selected type already exists, you'll see an error: "A profile of this type already exists." You must delete the existing profile first or choose a different type.
:::

**Choosing the Right Type**:
- **Import**: Brings data FROM PlentyONE TO Magento
- **Export**: Sends data FROM Magento TO PlentyONE

#### Status

**Field**: Status
**Type**: Dropdown (Enabled/Disabled)
**Default**: Enabled
**Description**: Controls whether the profile is active

**Options**:
- **Enabled**: Profile is active and can be executed
- **Disabled**: Profile is inactive and cannot be executed (useful for testing)

**When to Disable**:
- During initial configuration
- For testing purposes
- Temporarily stopping synchronization
- Maintenance periods

### Step 3: Save the Profile

After filling in the basic information:

1. **Save & Close**: Saves the profile and returns to the grid
2. **Save & Continue**: Saves the profile and keeps the form open for further configuration

:::tip Recommended: Save & Continue
For new profiles, use **Save & Continue** so you can immediately configure profile-specific settings.
:::

**What Happens on Save**:
- Profile record created in database (`byte8_profile_entity` table)
- Unique profile ID assigned
- Configuration tabs become available
- Profile appears in management grid
- Auto-configuration assistant may appear (see Step 4)

### Step 4: Auto-Configuration Assistant (Smart Setup)

**✨ New Feature!** After saving a new profile, Mage2Plenty's intelligent Auto-Configuration Assistant may appear to help you configure the profile quickly and accurately.

#### What is Auto-Configuration?

Auto-Configuration is a smart assistant that:

- **Detects** unconfigured or partially configured profiles
- **Analyzes** related profiles and system settings
- **Suggests** intelligent configuration values
- **Pre-fills** settings automatically with one click

This feature significantly reduces manual configuration time and minimizes errors by leveraging smart defaults and configuration from related profiles.

:::tip Time Saver
Auto-Configuration can reduce profile setup time from 30+ minutes to just a few clicks, especially for complex profiles like Product Import.
:::

#### When Does It Appear?

The Auto-Configuration modal appears automatically when:

1. **New profile is saved** for the first time
2. **Profile is unconfigured** (missing required settings)
3. **Configuration data is available** from PlentyONE (collected via Initial Setup Wizard)
4. **Related profiles exist** that can share configuration

**Example Scenario**:
- You create a "Category Import" profile
- You previously configured a "Category Export" profile
- Auto-Configuration detects the export profile and suggests using its store mapping, client ID, and attribute mappings

#### How It Works

**Detection Process**:

1. System checks if profile has required configurations:
   - Client ID
   - Store mapping
   - Entity-specific mappings (category root, attribute mapping, etc.)

2. System searches for related profiles:
   - Import ↔ Export pairs (e.g., `plenty_category_import` ↔ `plenty_category_export`)
   - Same entity type profiles
   - Shared configuration paths

3. System generates suggestions:
   - Auto-detect single-client systems
   - Map stores to PlentyONE locales
   - Suggest entity mappings based on name similarity
   - Provide default attribute mapping templates

#### Configuration Suggestions

The modal displays suggested configurations organized by type:

##### Client Configuration

**What It Suggests**:
- **Client ID**: Auto-selected if only one client exists
- **Client Name**: Display name from client configuration

**Example**:
```
✓ Client ID: 12345
  Client Name: Main PlentyONE Client
  Source: Auto-detected (single client system)
  Confidence: High
```

##### Store Mapping

**What It Suggests**:
- Mapping between Magento stores and PlentyONE languages/stores
- Based on locale codes and language settings

**Example**:
```
✓ Store Mapping:
  English Store (en_US) → PlentyONE Store 1 (en)
  German Store (de_DE) → PlentyONE Store 2 (de)
  French Store (fr_FR) → PlentyONE Store 3 (fr)

  Source: Locale-based matching
  Confidence: High
```

##### Entity-Specific Configurations

Different profile types suggest different configurations:

**Category Profiles**:
```
✓ Root Category Mapping:
  Magento Root Category (ID: 2) → PlentyONE Category (ID: 1)

✓ Attribute Mapping:
  name → Category Name
  description → Category Description
  is_active → Active

  Source: Default template
  Confidence: Medium
```

**Product Profiles**:
```
✓ Attribute Mapping:
  sku → Item Number
  name → Item Name
  description → Item Description
  price → Sales Price 1
  weight → Weight

✓ Warehouse Mapping:
  Default Stock → PlentyONE Warehouse 1

  Source: Standard mapping template
  Confidence: High
```

**Order Profiles**:
```
✓ Payment Method Mapping:
  checkmo → Cash on Delivery (1)
  banktransfer → Bank Transfer (2)
  paypal → PayPal (3)

✓ Shipping Method Mapping:
  flatrate_flatrate → Standard Shipping (1)
  freeshipping_freeshipping → Free Shipping (2)

  Source: Collected configuration data
  Confidence: High
```

#### Using Auto-Configuration

**Step-by-Step**:

1. **Review Suggestions**: The modal displays all suggested configurations
2. **Check Confidence Levels**:
   - **High** (green): Highly recommended, likely correct
   - **Medium** (yellow): Reasonable guess, should review
   - **Low** (red): Uncertain, requires manual verification

3. **Customize if Needed**:
   - Accept all suggestions
   - Accept individual suggestions
   - Modify suggestions before applying
   - Skip auto-configuration entirely

4. **Apply Configuration**: Click "Apply Configuration" to save

5. **Verification**: System applies settings and shows confirmation

**Modal Example**:

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Smart Configuration Assistant                          │
│  Category Import Profile                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  We detected this profile needs configuration. Based on    │
│  your existing setup, we can automatically configure:      │
│                                                             │
│  ✓ Client Configuration                          [High]   │
│    Client ID: 12345 (Main PlentyONE Client)               │
│                                                             │
│  ✓ Store Mapping                                 [High]   │
│    • English Store → PlentyONE Store 1                    │
│    • German Store → PlentyONE Store 2                     │
│                                                             │
│  ✓ Root Category Mapping                        [Medium]  │
│    • Magento Root (ID: 2) → PlentyONE Root (ID: 1)       │
│                                                             │
│  ✓ Attribute Mapping                            [High]   │
│    • Standard category attributes                          │
│                                                             │
│  Source: Category Export profile + Smart defaults         │
│                                                             │
│  [ Apply Configuration ]  [ Customize ]  [ Skip ]         │
└─────────────────────────────────────────────────────────────┘
```

#### Benefits of Auto-Configuration

**Time Savings**:
- ⏱️ **Manual Configuration**: 30-60 minutes
- ⚡ **Auto-Configuration**: 2-5 minutes
- 📊 **Time Saved**: ~90% faster setup

**Error Reduction**:
- ✅ Eliminates typos in mapping
- ✅ Prevents missing required configurations
- ✅ Ensures consistency across related profiles
- ✅ Uses validated configuration data

**Best Practices Enforcement**:
- Applies recommended settings
- Uses proven mapping templates
- Follows established patterns
- Leverages collected PlentyONE data

#### Manual Configuration Alternative

You can always skip auto-configuration and configure manually:

1. **Click "Skip"** in the auto-configuration modal
2. **Or**: Close the modal (X button)
3. Configure each setting individually via configuration tabs

**When to Skip Auto-Configuration**:
- Complex custom requirements
- Non-standard mapping needs
- Want full control over every setting
- Learning the configuration process

:::info Can Re-run Auto-Configuration
If you skip auto-configuration but change your mind, you can trigger it again by clearing the profile configuration and refreshing the edit page.
:::

#### Configuration Sources

Auto-Configuration pulls data from multiple sources:

**1. Related Profiles** (Highest Priority):
- Import/Export profile pairs
- Same entity type profiles
- Shared configuration paths

**2. Collected Configuration Data**:
- Data from Initial Setup Wizard
- PlentyONE API-collected information
- Warehouses, shipping methods, payment methods

**3. System Detection**:
- Single-client auto-detection
- Store-to-locale mapping
- Default Magento settings

**4. Smart Templates**:
- Pre-defined attribute mappings
- Standard field mappings
- Best practice configurations

#### Confidence Levels Explained

**High Confidence** (Highly Recommended):
- Data from related configured profiles
- Single-client auto-detection
- Exact matches in collected data
- Standard template mappings

**Medium Confidence** (Should Review):
- Name-based matching
- Default templates
- Inferred relationships
- Partial matches

**Low Confidence** (Requires Verification):
- Guessed mappings
- Fallback defaults
- Uncertain relationships
- Missing source data

#### Troubleshooting Auto-Configuration

##### Modal Doesn't Appear

**Reasons**:
- Profile already has required configuration
- No configuration data collected (run Initial Setup Wizard)
- No related profiles exist
- JavaScript error (check browser console)

**Solutions**:
- Run [Initial Setup Wizard](/docs/configuration/initial-setup) first
- Create and configure related profile first
- Check browser console for errors
- Clear browser cache

##### Suggestions Are Incorrect

**Reasons**:
- Related profile has wrong configuration
- Collected data is outdated
- Name matching confusion

**Solutions**:
- Review and correct related profile configuration
- Re-run configuration collection: `bin/magento plenty:setup:collect:config`
- Skip auto-configuration and configure manually
- Customize suggestions before applying

##### Configuration Not Saving

**Reasons**:
- Cache issues
- Database permissions
- Validation errors

**Solutions**:
- Clear cache: `bin/magento cache:flush`
- Check database permissions
- Review browser console and `var/log/system.log`
- Try manual configuration

#### CLI Alternative

Auto-configuration can also be triggered via CLI:

```bash
# Auto-configure a profile
bin/magento byte8:profile:auto-config --id=1

# Auto-configure with specific source
bin/magento byte8:profile:auto-config \
    --id=1 \
    --source-profile-id=2

# Preview suggestions without applying
bin/magento byte8:profile:auto-config \
    --id=1 \
    --dry-run

# Force configuration even if already configured
bin/magento byte8:profile:auto-config \
    --id=1 \
    --force
```

#### Best Practices

**Before Using Auto-Configuration**:
1. ✅ Complete [Initial Setup Wizard](/docs/configuration/initial-setup)
2. ✅ Configure one profile type manually first (e.g., Category Export)
3. ✅ Review collected configuration data
4. ✅ Understand your mapping requirements

**When Using Auto-Configuration**:
1. ✅ Review all suggestions before applying
2. ✅ Pay attention to confidence levels
3. ✅ Test with a related profile first (Import after Export)
4. ✅ Customize medium/low confidence suggestions
5. ✅ Verify configuration after applying

**After Using Auto-Configuration**:
1. ✅ Review applied configuration in each tab
2. ✅ Test profile execution with small data set
3. ✅ Verify mappings are correct
4. ✅ Adjust as needed based on results

## Profile Configuration Tabs

After saving, additional configuration tabs appear based on the profile type:

### Common Tabs (All Profiles)

These tabs are available for all profile types:

#### 1. General Information

**Purpose**: Basic profile settings and metadata

**Settings**:
- **Profile Name**: Update profile name
- **Status**: Enable/disable profile
- **Store View**: Select which Magento store(s) this profile applies to
- **Created At**: Creation timestamp (read-only)
- **Updated At**: Last modification timestamp (read-only)

**Configuration Example**:
```
Profile Name: Daily Product Import
Status: Enabled
Store View: All Store Views
Created: 2025-10-12 14:30:00
Updated: 2025-10-12 15:45:00
```

#### 2. Configuration

**Purpose**: Profile-specific behavior settings

**Common Settings**:
- **Batch Size**: Number of records to process per batch (default: 100)
- **Process Limit**: Maximum records to process per execution (0 = unlimited)
- **Enable Queue**: Use asynchronous processing via message queue
- **Continue on Error**: Continue processing if individual items fail
- **Log Level**: Logging verbosity (Error, Warning, Info, Debug)

**Configuration Example**:
```
Batch Size: 50
Process Limit: 1000
Enable Queue: Yes
Continue on Error: Yes
Log Level: Info
```

**Tuning Guidelines**:

| Store Size | Batch Size | Process Limit | Queue |
|------------|-----------|---------------|-------|
| Small (< 1K products) | 100 | 500 | No |
| Medium (1K-10K) | 50 | 1000 | Yes |
| Large (10K-50K) | 25 | 2000 | Yes |
| Enterprise (50K+) | 10 | 5000 | Yes |

#### 3. Schedule

**Purpose**: Configure automatic execution via cron

**Settings**:
- **Enable Schedule**: Activate automatic execution
- **Cron Expression**: When to run (e.g., `*/15 * * * *`)
- **Cron Group**: Execution group (default: `byte8`)
- **Time Zone**: Execution timezone

**Cron Expression Examples**:

| Expression | Description |
|-----------|-------------|
| `*/15 * * * *` | Every 15 minutes |
| `0 * * * *` | Every hour (on the hour) |
| `0 */4 * * *` | Every 4 hours |
| `0 2 * * *` | Daily at 2:00 AM |
| `0 3 * * 0` | Weekly on Sunday at 3:00 AM |
| `0 1 1 * *` | Monthly on 1st at 1:00 AM |

**Configuration Example**:
```
Enable Schedule: Yes
Cron Expression: */30 * * * *  (Every 30 minutes)
Cron Group: byte8
Time Zone: UTC
```

:::tip Cron Expression Generator
Use online tools like [crontab.guru](https://crontab.guru/) to generate and validate cron expressions.
:::

#### 4. Execution History

**Purpose**: View past executions and results

**Information Displayed**:
- **Execution ID**: Unique execution identifier
- **Start Time**: When execution began
- **End Time**: When execution completed
- **Duration**: Total execution time
- **Status**: Success, Failed, Partial
- **Processed**: Number of records processed
- **Created**: Number of new records created
- **Updated**: Number of existing records updated
- **Failed**: Number of failed records
- **Messages**: Execution log messages

**Example History Entry**:
```
Execution ID: 12345
Start Time: 2025-10-12 14:00:00
End Time: 2025-10-12 14:05:32
Duration: 5m 32s
Status: Success
Processed: 150
Created: 25
Updated: 120
Failed: 5
```

**Actions Available**:
- **View Details**: See detailed execution log
- **View Errors**: See only failed items
- **Export Log**: Download execution log
- **Re-run**: Execute profile again with same parameters

### Profile-Specific Tabs

Different profile types have additional configuration tabs:

#### Product Import/Export

**Additional Tabs**:
- **Attribute Mapping**: Map Magento attributes to PlentyONE properties
- **Category Mapping**: Assign products to categories
- **Image Settings**: Configure image download/upload
- **Price Configuration**: Price type mapping and rules
- **Stock Configuration**: Stock source and warehouse mapping
- **Filters**: Select which products to sync

#### Order Import/Export

**Additional Tabs**:
- **Order Status Mapping**: Map Magento ↔ PlentyONE statuses
- **Payment Method Mapping**: Map payment methods
- **Shipping Method Mapping**: Map shipping carriers
- **Customer Mapping**: Link customers between systems
- **Address Handling**: Address validation and formatting

#### Category Import/Export

**Additional Tabs**:
- **Category Mapping**: Parent-child relationship mapping
- **Attribute Mapping**: Category attribute mapping
- **Store Mapping**: Multi-store category assignment

#### Stock Import

**Additional Tabs**:
- **Warehouse Mapping**: Map PlentyONE warehouses to Magento stock sources
- **MSI Configuration**: Multi-Source Inventory settings
- **Stock Calculation**: How to calculate available stock

## Example: Creating a Product Import Profile

Let's walk through creating a complete product import profile:

### Step 1: Create Profile

1. Go to **Byte8 → PlentyONE → Profiles**
2. Click **Create New Profile**
3. Enter:
   - **Name**: `Product Import - Main Catalog`
   - **Type**: `Product Import [PlentyONE]`
   - **Status**: `Enabled`
4. Click **Save & Continue**

### Step 2: Configure General Settings

1. Switch to **Configuration** tab
2. Configure:
   - **Batch Size**: `50` (for medium catalogs)
   - **Process Limit**: `1000` (limit per execution)
   - **Enable Queue**: `Yes` (use async processing)
   - **Continue on Error**: `Yes` (don't stop on individual failures)
   - **Log Level**: `Info` (balanced logging)
3. Click **Save**

### Step 3: Set Up Attribute Mapping

1. Switch to **Attribute Mapping** tab
2. Map key attributes:

| Magento Attribute | PlentyONE Property |
|-------------------|-------------------|
| name | Item Name |
| sku | Item Number |
| description | Description |
| short_description | Preview Text |
| price | Sales Price 1 |
| weight | Weight |
| manufacturer | Manufacturer |

3. Click **Save**

### Step 4: Configure Image Settings

1. Switch to **Image Settings** tab
2. Configure:
   - **Import Images**: `Yes`
   - **Image Types**: `Main, Additional`
   - **Download Path**: `pub/media/catalog/product/plenty/`
   - **Image Roles**: Map PlentyONE positions to Magento roles
3. Click **Save**

### Step 5: Set Up Stock Configuration

1. Switch to **Stock Configuration** tab
2. Configure:
   - **Import Stock**: `Yes`
   - **Warehouse Mapping**:
     - PlentyONE Warehouse 1 → Magento Default Stock
     - PlentyONE Warehouse 2 → Magento Warehouse East
   - **Stock Calculation**: `Physical Stock - Reserved`
3. Click **Save**

### Step 6: Apply Filters

1. Switch to **Filters** tab
2. Set filters:
   - **Active Items Only**: `Yes`
   - **Store ID**: `1` (main store)
   - **Flag ID**: `1` (web shop flag)
   - **Updated Since**: Leave empty for full import
3. Click **Save**

### Step 7: Schedule Automatic Execution

1. Switch to **Schedule** tab
2. Configure:
   - **Enable Schedule**: `Yes`
   - **Cron Expression**: `0 */4 * * *` (every 4 hours)
   - **Time Zone**: `America/New_York`
3. Click **Save**

### Step 8: Test the Profile

1. Click **Run Profile** button (top-right)
2. Select **Dry Run** mode for testing
3. Review results in **Execution History** tab
4. Check for errors and adjust configuration if needed

### Step 9: Enable Live Execution

1. If dry run successful, disable dry run mode
2. Run profile manually once more to verify
3. Profile will now execute automatically every 4 hours

## Advanced Configuration

### Using Filters

Filters control which data is synchronized:

**Common Filter Types**:
- **Date Range**: Only process items modified within date range
- **Status**: Only active/visible items
- **Category**: Items from specific categories
- **Attribute Value**: Items matching attribute criteria
- **Store**: Items assigned to specific stores
- **Custom SQL**: Advanced filtering with SQL WHERE clause

**Filter Example**:
```
Active Only: Yes
Categories: Electronics, Computers
Modified Since: 2025-10-01
Price Greater Than: 10.00
Stock Status: In Stock
```

### Field Mapping

Customize how data is mapped between systems:

**Mapping Types**:
- **Direct Mapping**: One-to-one field mapping
- **Transformation**: Apply logic during mapping (e.g., unit conversion)
- **Conditional**: Map based on conditions
- **Default Value**: Use default if source field is empty
- **Concatenation**: Combine multiple fields

**Mapping Example**:
```
Magento Field: name
PlentyONE Property: Item Name (lang=en)
Transformation: Capitalize first letter
Default: "Untitled Product"
```

### Multi-Store Configuration

Configure different settings per store:

**Store-Specific Settings**:
- **Language Mapping**: Map Magento stores to PlentyONE languages
- **Price Configuration**: Different price sources per store
- **Category Mapping**: Different category structures
- **Attribute Sets**: Store-specific attribute sets

**Example Multi-Store Setup**:
```
Store: English (default)
- Language: en
- Price Source: Sales Price 1
- Category Root: Category 1

Store: German
- Language: de
- Price Source: Sales Price 2
- Category Root: Category 2
```

## Cloning Profiles

To create a similar profile quickly:

1. Go to **Byte8 → PlentyONE → Profiles**
2. Find the profile to clone
3. Click **Actions → Clone**
4. Enter new profile name
5. Select new profile type (must be different from original)
6. Click **Clone Profile**
7. Modify settings as needed

:::warning Profile Type Limitation
You can clone a profile but must select a different profile type since each type can only have one profile.
:::

## Deleting Profiles

To remove a profile:

1. Go to **Byte8 → PlentyONE → Profiles**
2. Find the profile to delete
3. Click **Actions → Delete**
4. Confirm deletion

**What Gets Deleted**:
- Profile record
- Profile configuration
- Schedule settings
- Execution history

**What Does NOT Get Deleted**:
- Synchronized data (products, orders, etc.)
- Magento entities created by the profile
- PlentyONE data

:::danger Irreversible Action
Deleting a profile is permanent. Export the profile configuration before deletion if you may need it later.
:::

## Best Practices

### Naming Conventions

Use consistent, descriptive names:

**Pattern**: `[Entity] [Direction] - [Purpose/Scope]`

**Examples**:
- `Product Import - Main Catalog`
- `Order Export - Daily Processing`
- `Stock Import - Warehouse 1`
- `Category Sync - English Store`

### Initial Configuration

1. **Start with Default Settings**: Use recommended defaults initially
2. **Test in Dry Run**: Always test before live execution
3. **Process Small Batches**: Start with small batch sizes
4. **Monitor First Executions**: Watch first few runs closely
5. **Adjust Based on Results**: Fine-tune after observing behavior

### Scheduling Strategy

1. **Stagger Profile Executions**: Don't run all profiles simultaneously
2. **Off-Peak Hours**: Schedule resource-intensive profiles during low-traffic periods
3. **Consider Dependencies**: Run profiles in logical order (e.g., categories before products)
4. **Realistic Intervals**: Balance data freshness with system load

**Example Schedule**:
```
02:00 - Category Import (daily)
03:00 - Product Import (every 4 hours)
04:00 - Stock Import (every 30 minutes during business hours)
05:00 - Order Export (every 15 minutes)
```

### Error Handling

1. **Enable Continue on Error**: Don't let one failed item stop the entire batch
2. **Monitor Error Rates**: Review failed items regularly
3. **Set Up Notifications**: Configure email alerts for critical failures
4. **Review Logs**: Check execution logs periodically

### Performance Optimization

1. **Optimal Batch Sizes**: Adjust based on your data volume and server capacity
2. **Use Queues**: Enable async processing for large operations
3. **Apply Filters**: Only process necessary data
4. **Index Management**: Re-index after large imports

## Troubleshooting

### Profile Won't Save

**Problem**: Error when clicking Save

**Solutions**:
- Check required fields are filled
- Verify profile name is unique
- Ensure profile type doesn't already exist
- Check for validation errors in form
- Review `var/log/system.log` for PHP errors

### Profile Not Executing

**Problem**: Scheduled profile doesn't run

**Solutions**:
- Verify cron is running: `bin/magento cron:run`
- Check schedule is enabled
- Verify cron expression is valid
- Review `cron_schedule` table for errors
- Check profile status is "Enabled"

### Configuration Not Saving

**Problem**: Configuration changes don't persist

**Solutions**:
- Clear cache: `bin/magento cache:flush`
- Check database permissions
- Verify no conflicting configuration
- Review browser console for JavaScript errors

### Mapping Not Working

**Problem**: Fields not mapping correctly

**Solutions**:
- Verify source fields exist in PlentyONE
- Check attribute codes match exactly
- Review data types are compatible
- Test with single item first
- Check transformation logic

## CLI Profile Management

Create and manage profiles via command line:

```bash
# List all profiles
bin/magento byte8:profile:list

# Create a new profile
bin/magento byte8:profile:create \
    --name="Product Import CLI" \
    --type="plenty_item_import" \
    --status=1

# Update profile configuration
bin/magento byte8:profile:config:set \
    --id=1 \
    --key="batch_size" \
    --value=50

# Clone existing profile
bin/magento byte8:profile:clone \
    --id=1 \
    --name="Cloned Profile" \
    --type="plenty_item_export"

# Delete profile
bin/magento byte8:profile:delete --id=1
```

## Next Steps

After creating your profile:

1. 🧪 **[Test the Profile](/docs/testing/first-sync)** - Run test executions
2. 📊 **[Configure Specific Profile Types](/docs/profiles/product-import)** - Detailed configuration guides
3. ⏰ **[Set Up Scheduling](/docs/profiles/scheduling)** - Automate executions
4. 📈 **[Monitor Performance](/docs/monitoring/profiles)** - Track execution metrics
5. 🔧 **[Troubleshoot Issues](/docs/troubleshooting/profile-issues)** - Fix common problems

## Related Documentation

- [About Profiles](/docs/profiles/about-profiles) - Understanding profile concepts
- [Product Import Profile](/docs/profiles/product-import) - Product sync configuration
- [Order Export Profile](/docs/profiles/order-export) - Order processing setup
- [Stock Import Profile](/docs/profiles/stock-import) - Inventory synchronization
- [Profile Configuration](/docs/configuration/profile-configuration) - System-level settings
- [CLI Commands](/docs/cli-commands) - Command-line tools

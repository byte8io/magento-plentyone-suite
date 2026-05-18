---
sidebar_position: 6
title: Initial Setup Wizard
description: Step-by-step guide to using the Initial Setup Wizard for first-time Mage2Plenty configuration
---

# Initial Setup Wizard

The Initial Setup Wizard is an interactive, step-by-step tool that guides you through the initial configuration of your Mage2Plenty integration. It automates many manual setup tasks and ensures all required PlentyONE properties are created correctly.

## Overview

The wizard streamlines the initial setup process by:

- Testing your API connection
- Automatically collecting configuration data from PlentyONE
- Creating required properties for Magento integration
- Validating your setup before completion

**Estimated Time**: 5-10 minutes

:::tip Recommended for First-Time Setup
If you're setting up Mage2Plenty for the first time, we strongly recommend using the Initial Setup Wizard. It reduces configuration errors and ensures all prerequisites are met before you start synchronizing data.
:::

## Prerequisites

Before running the wizard, ensure you have:

1. ✅ **Installed Mage2Plenty** - All modules installed and enabled
2. ✅ **Created PlentyONE Admin User** - Admin user with English UI language
3. ✅ **Collected Credentials** - URL, username, password, client ID, owner ID, store ID
4. ✅ **Configured Authentication** - Entered credentials in **SoftCommerce → PlentyONE → Manage Client Connection**
5. ✅ **Verified Network** - Confirmed Magento server can reach PlentyONE API

:::warning Configure Authentication First
The wizard requires valid authentication credentials to be configured before running. You can configure credentials via the UI at **SoftCommerce → PlentyONE → Manage Client Connection** or use the CLI wizard (see Method 3 below). See [Client Configuration](/docs/configuration/client-configuration) for credential setup.
:::

## Accessing the Wizard

### Method 1: Via Configuration Page

1. Log in to Magento Admin panel
2. Navigate to **Stores → Configuration**
3. Expand **Soft Commerce** in the left sidebar
4. Select **PlentyONE Integration**
5. In the **Authentication Settings** section header, click the **Actions** dropdown button
6. Select **Run Setup Wizard**

### Method 2: Via Direct URL

Navigate to: **System → PlentyONE → Initial Setup**

Or access directly: `https://your-magento-url.com/admin/plenty_profile/setup/wizard`

### Method 3: Via CLI Wizards

For command-line configuration (recommended for first-time setup or automation), use the interactive CLI wizards. Setup is split into two steps:

#### Step 1: Client Connection & API Configuration

```bash
# Configure client connection and API settings
bin/magento plenty:setup:client

# Quick mode - use recommended defaults
bin/magento plenty:setup:client --quick
```

**What it configures:**
1. **Core Settings** - Log rotation, email notifications, FontAwesome icons
2. **REST API Settings** - Connection timeout, retry logic, debug modes
3. **Client Connection** - PlentyONE URL, username, password with connection test

#### Step 2: Profile System Setup

```bash
# Configure profile system and notifications
bin/magento plenty:setup:profile:system

# Quick mode - use recommended defaults
bin/magento plenty:setup:profile:system --quick
```

**What it configures:**
1. **Profile Settings** - History retention, cleanup policies
2. **Notification Settings** - Log level, retention days, max notifications
3. **Email Alerts** - Recipients, thresholds, batch processing settings
4. **Performance Settings** - Batch sizes, async processing

**Benefits of CLI Wizards**:
- ✅ **Interactive prompts** - Step-by-step guided configuration
- ✅ **Connection testing** - Validates credentials before saving (client wizard)
- ✅ **Token management** - Automatically saves and refreshes OAuth tokens (client wizard)
- ✅ **Configuration validation** - Validates all input before applying
- ✅ **No browser required** - Perfect for SSH access or automated deployments

See [CLI Commands Documentation](/docs/cli-commands) for detailed CLI wizard usage and options.

:::tip CLI vs UI Wizard
The **CLI wizards** (`plenty:setup:client` + `plenty:setup:profile:system`) configure system-wide settings and connection credentials, while the **UI Initial Setup Wizard** (this page) focuses on collecting PlentyONE configuration and creating properties. For first-time setup, run both CLI wizards first, then proceed with the UI wizard.
:::

## Wizard Steps

### Step 1: Test API Connection

**Purpose**: Verify that Magento can successfully communicate with your PlentyONE system.

#### What Happens

The wizard tests the API connection using the credentials configured in your client settings.

**Verification Checks**:
- ✓ URL accessibility
- ✓ SSL certificate validity
- ✓ Authentication credentials
- ✓ OAuth token generation
- ✓ API version compatibility
- ✓ Network connectivity

#### User Actions

1. **Review Connection Settings**: The wizard displays your configured PlentyONE URL and client ID
2. **Click "Test Connection"**: Initiates the connection test
3. **Wait for Results**: The test typically completes in 2-5 seconds

#### Possible Outcomes

**✅ Success**:
```
Connection successful!
- Server: https://mystore.plentymarkets-cloud.com
- Client ID: 12345
- API Version: 1.0
- Response Time: 0.85s
- Status: Ready for configuration collection

Proceeding to next step...
```

The wizard automatically advances to Step 2.

**❌ Failure**:
```
Connection failed!
- Error: Invalid credentials
- HTTP Status: 401 Unauthorized
- Message: The provided username or password is incorrect
```

**Common Failures and Solutions**:

| Error | Cause | Solution |
|-------|-------|----------|
| Connection timeout | Network/firewall issue | Check network, firewall rules |
| 401 Unauthorized | Invalid credentials | Verify username/password |
| 403 Forbidden | Insufficient permissions | Ensure user has Admin access |
| 404 Not Found | Incorrect URL | Verify PlentyONE URL |
| SSL Certificate Error | Invalid/expired certificate | Check SSL certificate validity |

:::tip If Test Fails
Fix the error, update your credentials in **SoftCommerce → PlentyONE → Manage Client Connection** (or run `bin/magento plenty:setup:client` to reconfigure via CLI), then run the wizard again.
:::

### Step 2: Collect Configuration Data

**Purpose**: Automatically fetch essential configuration data from your PlentyONE system.

#### What Gets Collected

The wizard collects configuration data for multiple modules:

| Module | Data Collected | Purpose |
|--------|----------------|---------|
| **Warehouses** | Warehouse list, IDs, names | Stock/inventory mapping |
| **Shipping Providers** | Carrier codes, names | Shipping method mapping |
| **Payment Methods** | Payment method IDs, names | Payment method mapping |
| **Order Statuses** | Status IDs, names, types | Order status mapping |
| **Order Referrers** | Referrer IDs, names | Order source tracking |
| **VAT Rates** | VAT configurations, rates | Tax calculation |
| **Units** | Measurement units | Product unit mapping |
| **Manufacturers** | Manufacturer list | Brand mapping |
| **Salesprices** | Price configurations | Multi-price support |
| **Attributes** | Attribute types, values | Attribute mapping |

**Total Items**: 10-20 configuration collectors (depends on installed modules)

#### How It Works

1. **Display Available Collectors**: Wizard shows all configuration items to be collected
2. **User Initiates Collection**: Click "Start Collection"
3. **Sequential Processing**: Each collector runs one at a time
4. **Real-Time Progress**: Status updates as each item is collected
5. **Error Handling**: If a collector fails, wizard logs the error but continues
6. **Completion**: All items processed, results displayed

#### User Actions

1. **Review Collection List**: See what configuration data will be collected
2. **Click "Start Collection"**: Begins the collection process
3. **Monitor Progress**: Watch as each configuration type is collected
4. **Wait for Completion**: Takes 30-60 seconds depending on data volume

#### Visual Progress Indicator

```
Loading available collectors...

✓ Warehouses            [Collected]
✓ Shipping Providers    [Collected]
⚠ Payment Methods       [Failed - Invalid API response]
✓ Order Statuses        [Collected]
⏳ Order Referrers      [Loading...]
⌛ VAT Rates            [Pending]
⌛ Units                [Pending]
⌛ Manufacturers        [Pending]
⌛ Salesprices          [Pending]
⌛ Attributes           [Pending]

Progress: 4/10 collectors completed
```

**Status Indicators**:
- ⌛ **Pending** - Waiting to be processed
- ⏳ **Loading** - Currently collecting
- ✓ **Collected** - Successfully completed
- ⚠ **Failed** - Collection failed (hover for error details)

#### Handling Errors

If one or more collectors fail:

1. **Review Error**: Hover over the failed item to see the error message
2. **Common Causes**:
   - API timeout (increase request timeout)
   - Missing permissions (verify user has Admin access)
   - Invalid response format (check PlentyONE API version)
   - Empty configuration (e.g., no warehouses defined)

3. **Options**:
   - **Continue Anyway**: Non-critical failures won't block setup
   - **Fix and Re-run**: Address the issue and restart the wizard
   - **Manual Configuration**: Configure failed items manually later

:::info Non-Blocking Errors
Most configuration collection errors are non-critical. You can proceed with the wizard and manually configure failed items later.
:::

#### Where Data Is Stored

Collected configuration is stored in:
- Database tables: `softcommerce_plenty_*_config`
- Cache: `var/cache/plenty/config/`
- Configuration scope: Global (applies to all stores)

### Step 3: Create Required Properties

**Purpose**: Create necessary properties in PlentyONE for Magento integration.

#### What Are Properties?

PlentyONE properties are custom fields that store additional data on products, variants, and orders. Mage2Plenty uses specific properties to map Magento data to PlentyONE.

**Required Properties**:

| Property | Type | Purpose | Example Value |
|----------|------|---------|---------------|
| **Magento Product ID** | Item | Links PlentyONE items to Magento products | `12345` |
| **Magento Variation ID** | Variation | Links PlentyONE variations to Magento variants | `67890` |
| **Magento Category IDs** | Item | Maps PlentyONE items to Magento categories | `10,25,42` |
| **Magento Attribute Set** | Item | Stores Magento attribute set ID | `4` |
| **Magento Order ID** | Order | Links PlentyONE orders to Magento orders | `100001234` |
| **Magento Customer ID** | Contact | Links PlentyONE contacts to Magento customers | `456` |

**Total Properties**: 6-12 properties (depends on installed modules)

#### How It Works

1. **Check Existing Properties**: Wizard verifies which properties already exist in PlentyONE
2. **Display Property List**: Shows properties to be created (existing properties marked as "Exists")
3. **User Initiates Creation**: Click "Create Properties"
4. **Sequential Creation**: Each property is created one at a time via API
5. **Skip Existing**: Properties that already exist are skipped
6. **Completion**: All properties created or verified

#### User Actions

1. **Review Property List**: See which properties will be created
2. **Note Existing Properties**: Properties marked "Exists" will be skipped
3. **Click "Create Properties"**: Begins property creation
4. **Monitor Progress**: Watch as each property is created
5. **Wait for Completion**: Takes 10-30 seconds

#### Visual Progress Indicator

```
Loading available properties...

✓ Magento Product ID       [Exists]
✓ Magento Variation ID     [Created]
⏳ Magento Category IDs    [Creating...]
⌛ Magento Attribute Set   [Pending]
⌛ Magento Order ID        [Pending]
⌛ Magento Customer ID     [Pending]

Progress: 2/6 properties processed
```

#### Handling Errors

If property creation fails:

1. **Review Error**: Hover over the failed item for error details
2. **Common Causes**:
   - Insufficient API permissions
   - Property name conflict
   - API rate limiting
   - Invalid property configuration

3. **Solutions**:
   - **Retry**: Re-run the wizard to retry failed properties
   - **Manual Creation**: Create properties manually in PlentyONE backend
   - **Check Permissions**: Verify API user has property creation rights

:::warning Critical Step
Properties are essential for data mapping. If property creation fails, data synchronization won't work correctly. Ensure all properties are created before proceeding.
:::

#### Verifying Properties in PlentyONE

After wizard completion, verify properties exist:

1. Log in to PlentyONE backend
2. Navigate to **Setup → Item → Properties**
3. Search for "Magento" properties
4. Verify all required properties exist

### Step 4: Review & Complete Setup

**Purpose**: Review setup results and finalize the initial configuration.

#### What Happens

The wizard displays a summary of all completed actions:

- ✓ API connection tested successfully
- ✓ Configuration data collected (X/Y collectors successful)
- ✓ Properties created (X/Y properties created or verified)

#### Summary Display

```
Setup Completed Successfully!

✓ API Connection
  - Server: https://mystore.plentymarkets-cloud.com
  - Client ID: 12345
  - Status: Connected
  - Response Time: 0.85s

✓ Configuration Collection
  - Total Collectors: 10
  - Successful: 9
  - Failed: 1 (Payment Methods - non-critical)
  - Data Cached: Yes

✓ Property Creation
  - Total Properties: 6
  - Created: 4
  - Already Existed: 2
  - Status: Ready for synchronization

All required configurations have been created.
```

#### Next Steps Guidance

The wizard provides guidance on what to do next:

**Next Steps**:
1. ✓ Configure your synchronization profiles
2. ✓ Map Magento attributes to PlentyONE properties
3. ✓ Set up cron jobs for automatic synchronization
4. ✓ Run your first data synchronization test

#### User Actions

1. **Review Summary**: Check all setup results
2. **Note Any Warnings**: Address any failed items if needed
3. **Click "Complete Setup"**: Finalizes the wizard
4. **Redirect**: Automatically redirected to Profile Management page

#### What Happens on Completion

When you click "Complete Setup":

1. **Mark Wizard Complete**: Sets setup status to "completed"
2. **Clear Temporary Data**: Removes wizard progress data
3. **Log Success**: Records successful setup in logs
4. **Redirect**: Sends you to **SoftCommerce → PlentyONE → Profiles**

:::tip Post-Setup
After completing the wizard, the next step is to create and configure your first synchronization profile. Start with a simple profile like "Category Import" to verify everything works.
:::

## Re-running the Wizard

### When to Re-run

You may need to re-run the wizard if:

- ✅ Switching to a different PlentyONE system
- ✅ After purging all data
- ✅ Major configuration changes in PlentyONE
- ✅ New modules installed that require setup
- ✅ Properties were manually deleted from PlentyONE

### Warning for Completed Setup

If setup was previously completed, the wizard shows a warning:

```
⚠ Warning: Initial setup has already been completed.

You can still review and update configurations, but this may overwrite existing data.

Options:
- Continue with wizard (updates configuration)
- Cancel (keep existing configuration)
- Purge data first (start completely fresh)
```

### How to Re-run

1. Navigate to **System → PlentyONE → Initial Setup**
2. Review the warning message
3. Click "Start Setup Wizard" to proceed
4. Follow the same 4 steps as initial setup

:::info Configuration Updates
Re-running the wizard updates existing configuration but does not delete synchronized data (products, orders, etc.). Only configuration metadata is updated.
:::

## Troubleshooting

### Wizard Won't Start

**Problem**: Clicking "Run Setup Wizard" does nothing or shows error

**Solutions**:
1. Clear cache: `bin/magento cache:flush`
2. Check module is enabled: `bin/magento module:status SoftCommerce_PlentyProfile`
3. Verify admin user permissions
4. Check browser console for JavaScript errors
5. Review `var/log/system.log` for PHP errors

### Step 1 Connection Test Fails

**Problem**: Connection test fails repeatedly

**Solutions**:
1. Verify authentication credentials in **SoftCommerce → PlentyONE → Manage Client Connection**
2. Test connection via CLI: `bin/magento plenty:client:test`
3. Test URL manually in browser: `https://your-url.com/rest`
4. Check firewall allows HTTPS outbound connections
5. Enable verbose cURL mode for detailed error in REST API settings
6. Review `var/log/softcommerce/plenty/client.log`

### Step 2 Collectors Failing

**Problem**: Multiple configuration collectors fail

**Solutions**:
1. Check API user has Admin permissions in PlentyONE
2. Verify PlentyONE API version is supported
3. Increase request timeout in REST API settings (increase to 120 seconds)
4. Check PlentyONE has data for collectors (e.g., warehouses exist)
5. Review individual error messages (hover over failed items)

### Step 3 Property Creation Fails

**Problem**: Properties won't create in PlentyONE

**Solutions**:
1. Verify API user has property creation permissions
2. Check for existing properties with same name in PlentyONE
3. Manually create properties in PlentyONE backend
4. Check PlentyONE API rate limits
5. Review `var/log/softcommerce/plenty/property.log`

### Wizard Hangs or Freezes

**Problem**: Wizard stops responding during processing

**Solutions**:
1. Check browser console for JavaScript errors
2. Increase PHP `max_execution_time`: `php.ini → max_execution_time = 300`
3. Increase PHP `memory_limit`: `php.ini → memory_limit = 512M`
4. Clear browser cache and cookies
5. Try different browser
6. Check web server error logs

### Cannot Complete Wizard

**Problem**: "Complete Setup" button doesn't work

**Solutions**:
1. Check all previous steps completed successfully
2. Verify form validation passes
3. Check browser console for errors
4. Clear cache: `bin/magento cache:flush`
5. Review `var/log/system.log`

## Advanced Options

### Running via CLI

For automation or troubleshooting, you can run wizard steps via CLI:

```bash
# Configure client connection and API settings
bin/magento plenty:setup:client

# Configure profile system and notifications
bin/magento plenty:setup:profile:system

# Run system health check
bin/magento plenty:system:check

# Test connection
bin/magento plenty:client:test

# Collect all configuration
bin/magento plenty:config:collect --all

# Collect specific configuration
bin/magento plenty:config:collect --type=warehouse
bin/magento plenty:config:collect --type=shipping

# Create properties
bin/magento plenty:property:create --all

# Create specific property
bin/magento plenty:property:create --type=product_id

# Mark setup as complete
bin/magento plenty:setup:complete

# Reset setup status (for re-running)
bin/magento plenty:setup:reset
```

:::tip CLI Setup Wizards
The `bin/magento plenty:setup:client` and `bin/magento plenty:setup:profile:system` commands provide an interactive CLI experience for configuring client credentials, system settings, and profile system setup. Run both wizards for first-time setup before running the UI Initial Setup Wizard. See [CLI Commands Documentation](/docs/cli-commands) for detailed usage.
:::

### Skipping Wizard

If you prefer manual configuration:

1. Configure authentication via CLI wizards: `bin/magento plenty:setup:client` and `bin/magento plenty:setup:profile:system`, or manually in **SoftCommerce → PlentyONE → Manage Client Connection**
2. Run configuration collectors individually: `bin/magento plenty:config:collect --type=[type]`
3. Create properties manually in PlentyONE backend or via CLI
4. Skip wizard and proceed directly to profile configuration

## Wizard Logs

### Log Locations

```
var/log/softcommerce/plenty/
├── client.log           # Connection tests
├── config.log          # Configuration collection
├── property.log        # Property creation
└── system.log          # General wizard operations
```

### Viewing Logs

```bash
# View recent wizard activity
tail -f var/log/softcommerce/plenty/client.log

# Search for errors
grep -i "error" var/log/softcommerce/plenty/*.log

# View last 100 lines of all logs
tail -100 var/log/softcommerce/plenty/*.log
```

## Security Considerations

### Wizard Access Control

The wizard requires specific admin permissions:

- **ACL Resource**: `SoftCommerce_PlentyProfile::setup_wizard`
- **Required Role**: Admin

**Restricting Access**:

1. Navigate to **System → Permissions → User Roles**
2. Select role to configure
3. Expand **Role Resources**
4. Locate **Soft Commerce → PlentyONE Profile → Setup Wizard**
5. Uncheck to deny access

### API Credentials Security

The wizard uses credentials stored in configuration:

- Credentials are encrypted in database
- Never logged in plain text
- Transmitted over HTTPS only
- Access restricted to authorized users

## Performance Considerations

### Wizard Duration

| Step | Typical Duration | Factors |
|------|-----------------|---------|
| Step 1: Connection Test | 2-5 seconds | Network latency |
| Step 2: Configuration Collection | 30-90 seconds | Number of collectors, data volume |
| Step 3: Property Creation | 10-30 seconds | Number of properties |
| Step 4: Review & Complete | 2-5 seconds | - |
| **Total** | **45-130 seconds** | Network, server speed, data volume |

### Optimization Tips

1. **Run During Off-Peak**: Run wizard when PlentyONE API is less busy
2. **Good Network**: Ensure stable, fast internet connection
3. **Server Resources**: Ensure adequate PHP memory and execution time
4. **Cache Warm-Up**: Clear Magento cache before running wizard

## Post-Wizard Next Steps

After successfully completing the wizard:

1. 📊 **[Create Profiles](/docs/profiles/create-profile)** - Set up your first synchronization profile
2. 🗺️ **[Attribute Mapping](/docs/mapping/attributes)** - Map Magento attributes to PlentyONE properties
3. 🔄 **[Schedule Synchronization](/docs/profiles/scheduling)** - Set up cron jobs for automatic sync
4. ✅ **[Test Synchronization](/docs/testing/first-sync)** - Run a test synchronization
5. 📈 **[Monitor Performance](/docs/monitoring/profiles)** - Track profile execution

## Video Tutorial

:::warning Outdated Content
This video shows a previous version of the connection configuration. While the core concepts and form fields remain similar, **the interface and workflow have been updated**. Follow the written documentation above for current instructions.

**What's Still Relevant:**
- ✅ Client credential configuration concepts
- ✅ Connection testing process
- ✅ Required field explanations
- ✅ PlentyONE backend configuration

**What's Changed:**
- ❌ New CLI wizards available (`bin/magento plenty:setup:client` and `bin/magento plenty:setup:profile:system`)
- ❌ Updated admin menu structure (**SoftCommerce → PlentyONE**)
- ❌ Enhanced validation and error handling
- ❌ Improved token management workflow
:::

<div style={{position: 'relative', paddingBottom: '56.25%', height: 0}}>
  <iframe
    style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
    src="https://www.youtube.com/embed/vhurmQVNPQQ"
    title="Mage2Plenty Connection Configuration"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</div>

## Related Documentation

- [Client Configuration](/docs/configuration/client-configuration) - Manual authentication setup
- [Profile Configuration](/docs/configuration/profile-configuration) - Profile system settings
- [Create Profiles](/docs/profiles/create-profile) - Setting up synchronization profiles
- [Troubleshooting](/docs/troubleshooting/common-issues) - Common issues and solutions

## Getting Help

If you encounter issues with the Initial Setup Wizard:

- 📧 **Email Support**: support@softcommerce.io
- 📞 **Phone**: +44 2080 587 795 (GMT working hours)
- 📖 **Documentation**: Browse this site for detailed guides
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/byte8/mage2plenty/issues)

Include in your support request:
- Wizard step where error occurred
- Error message displayed
- Contents of `var/log/softcommerce/plenty/` logs
- PHP version and Magento version
- Screenshot of the error (if applicable)

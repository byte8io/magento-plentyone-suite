---
sidebar_position: 2
title: Core Configuration
description: Configure core Mage2Plenty settings including logging, debugging, and UI options
---

# Core Configuration

The Core Configuration section contains global settings that affect the entire Mage2Plenty extension. These settings control logging behavior, debugging options, and user interface customization.

## Accessing Core Configuration

1. Log in to your Magento Admin panel
2. Navigate to **Stores → Configuration**
3. In the left panel, expand **Byte8**
4. Select **Core Configuration**

:::tip Navigation Path
**Stores → Configuration → Byte8 → Core Configuration**
:::

## Developer Settings

These settings control logging, debugging, and monitoring behavior across all Mage2Plenty modules.

### Enable Log Rotation

**Field**: `is_active_log_rotation`
**Path**: `byte8_core/dev/is_active_log_rotation`
**Type**: Yes/No
**Default**: No
**Scope**: Global

Controls automatic log file rotation to prevent log files from growing too large.

**Description**: Files are rotated every day and a limited number of files are kept. This helps manage disk space and improves log file readability.

**How It Works**:
- Log files are rotated daily at midnight
- Old log files are compressed and archived
- Only the last 7 days of logs are kept by default
- Older files are automatically deleted

**Configuration Steps**:

1. Navigate to **Stores → Configuration → Byte8 → Core Configuration**
2. Expand the **Developer Settings** section
3. Set **Enable log rotation** to **Yes**
4. Click **Save Config**
5. Clear cache: `bin/magento cache:flush`

**Log File Locations**:
```
var/log/plenty/
├── api.log              # Current API log
├── api.log.1.gz         # Yesterday's log (compressed)
├── api.log.2.gz         # 2 days ago
├── ...
└── api.log.7.gz         # 7 days ago
```

:::tip Recommended for Production
Always enable log rotation in production environments to prevent disk space issues.
:::

:::warning Performance Impact
Log rotation has minimal performance impact. It runs as a scheduled job and processes files asynchronously.
:::

### Print Data to Array

**Field**: `is_active_log_print_to_array`
**Path**: `byte8_core/dev/is_active_log_print_to_array`
**Type**: Yes/No
**Default**: No
**Scope**: Global

Enables logging data in array format for improved human readability.

**Description**: When enabled, data is formatted as readable arrays in log files. This improves human readability but increases the size of log files.

**Comparison**:

**Disabled (JSON format)**:
```json
{"product_id":123,"sku":"ABC-001","name":"Product Name","price":19.99}
```

**Enabled (Array format)**:
```php
Array
(
    [product_id] => 123
    [sku] => ABC-001
    [name] => Product Name
    [price] => 19.99
)
```

**Configuration Steps**:

1. Navigate to **Stores → Configuration → Byte8 → Core Configuration**
2. Expand the **Developer Settings** section
3. Set **Print data to array** to **Yes**
4. Click **Save Config**

**When to Use**:
- ✅ Development and debugging
- ✅ Manual log review and analysis
- ✅ Troubleshooting specific issues
- ❌ Production (increases log file size)
- ❌ Automated log parsing

:::caution File Size Impact
Enabling this option can increase log file sizes by 2-3x. Monitor disk space usage when enabled.
:::

### Enable Logging to Email

**Field**: `is_active_mail_log`
**Path**: `byte8_core/dev/is_active_mail_log`
**Type**: Yes/No
**Default**: No
**Scope**: Global

Global setting for sending critical errors and notifications via email.

**Description**: When enabled, critical errors and important notifications are sent to specified email addresses. This is useful for real-time monitoring and alerting.

**Configuration Steps**:

1. Navigate to **Stores → Configuration → Byte8 → Core Configuration**
2. Expand the **Developer Settings** section
3. Set **Enable logging to Email** to **Yes**
4. Configure the email settings (see below)
5. Click **Save Config**

#### Email Recipient

**Field**: `mail_log_email`
**Path**: `byte8_core/dev/mail_log_email`
**Type**: Text (email validation)
**Required**: Yes (when email logging is enabled)
**Scope**: Global

Enter the email address where log notifications should be sent.

**Example**: `admin@example.com` or `devteam@example.com`

:::tip Multiple Recipients
To send to multiple recipients, set up email forwarding rules in your email system, or use a distribution list address.
:::

#### Log Email Sender

**Field**: `mail_log_email_identity`
**Path**: `byte8_core/dev/mail_log_email_identity`
**Type**: Select
**Options**: Magento email identities
**Scope**: Global

Select which Magento email sender identity to use for log notifications.

**Common Options**:
- General Contact
- Sales Representative
- Customer Support
- Custom Email 1
- Custom Email 2

#### Log Email Template

**Field**: `mail_log_email_template`
**Path**: `byte8_core/dev/mail_log_email_template`
**Type**: Select
**Default**: Default template
**Scope**: Global

Select the email template for log notifications.

**Description**: Email template chosen based on theme fallback when "Default" option is selected. You can create custom templates for branded notifications.

**Creating Custom Template**:

1. Navigate to **Marketing → Email Templates**
2. Click **Add New Template**
3. Load the default log template
4. Customize as needed
5. Save and select in configuration

**Email Notification Examples**:

```
Subject: [CRITICAL] Mage2Plenty API Error

Dear Administrator,

A critical error occurred in Mage2Plenty:

Error: Connection timeout to PlentyONE API
Module: Byte8_PlentyItem
Profile: Product Import
Time: 2025-10-12 14:30:45 UTC

Details:
- Failed to connect to api.plentymarkets.com
- Connection timeout after 30 seconds
- Retry attempts: 3/3

Please review the logs for more information.

Location: var/log/plenty/api.log
```

:::warning Email Frequency
Email notifications are sent for critical errors only. Non-critical messages are logged to files. Configure appropriate email filters to manage notification volume.
:::

## UI Settings

These settings control the user interface appearance and functionality in the Magento Admin panel.

### Enable Font Awesome Icons

**Field**: `is_active_fontawesome`
**Path**: `byte8_core/ui/is_active_fontawesome`
**Type**: Yes/No
**Default**: No
**Scope**: Global

Enables Font Awesome icons in the Mage2Plenty admin interface.

**Description**: When enabled, Font Awesome icons enhance the visual appearance of buttons, status indicators, and navigation elements in the admin panel.

**Configuration Steps**:

1. Navigate to **Stores → Configuration → Byte8 → Core Configuration**
2. Expand the **UI Settings** section
3. Set **Enable Font Awesome Icons** to **Yes**
4. (Optional) Configure custom Font Awesome host URL
5. Click **Save Config**
6. Clear cache: `bin/magento cache:flush`

**Visual Impact**:

**Without Font Awesome**:
```
[Save] [Delete] [Cancel]
Status: Active
```

**With Font Awesome**:
```
💾 Save  🗑️ Delete  ❌ Cancel
✅ Status: Active
```

### Fontawesome Host URL

**Field**: `fontawesome_resource`
**Path**: `byte8_core/ui/fontawesome_resource`
**Type**: Text (URL validation)
**Default**: `https://use.fontawesome.com/releases/v6.1.1/css/all.css`
**Scope**: Global
**Depends on**: `is_active_fontawesome` = Yes

Specify a custom Font Awesome CDN URL.

**When to Use Custom URL**:
- Using a self-hosted Font Awesome installation
- Using a specific Font Awesome version
- Using Font Awesome Pro with custom license
- Corporate network requires specific CDN

**Examples**:

```
# Default CDN
https://use.fontawesome.com/releases/v6.1.1/css/all.css

# Self-hosted
https://your-domain.com/assets/fontawesome/css/all.min.css

# Font Awesome Pro
https://pro.fontawesome.com/releases/v6.1.1/css/all.css

# Different version
https://use.fontawesome.com/releases/v6.4.0/css/all.css
```

:::info Version Compatibility
Mage2Plenty is tested with Font Awesome 6.x. Using different versions may cause icon display issues.
:::

## List of Installed Modules

**Section**: `vendor_module_list`
**Frontend Model**: `Byte8\Core\Block\Adminhtml\System\Config\Form\Field\ModuleList`

This section displays a list of all installed Byte8 and Mage2Plenty modules with their versions.

**Information Displayed**:
- Module name
- Module version
- Module status (enabled/disabled)
- Module path

**Example Display**:

| Module Name | Version | Status | Path |
|-------------|---------|--------|------|
| Byte8_Core | 1.15.1 | Enabled | vendor/byte8/module-core |
| Byte8_PlentyCore | 1.15.1 | Enabled | vendor/byte8/module-plenty-core |
| Byte8_PlentyClient | 1.15.1 | Enabled | vendor/byte8/module-plenty-client |
| Byte8_PlentyItem | 1.15.1 | Enabled | vendor/byte8/module-plenty-item |
| ... | ... | ... | ... |

**Use Cases**:
- Verify module installations
- Check module versions
- Troubleshoot module conflicts
- Support ticket information

## Configuration via CLI

You can also manage core configuration via command line:

### View Current Settings

```bash
# View all core configuration
bin/magento config:show byte8_core

# View specific setting
bin/magento config:show byte8_core/dev/is_active_log_rotation
```

### Update Settings

```bash
# Enable log rotation
bin/magento config:set byte8_core/dev/is_active_log_rotation 1

# Enable array printing
bin/magento config:set byte8_core/dev/is_active_log_print_to_array 1

# Set email recipient
bin/magento config:set byte8_core/dev/mail_log_email "admin@example.com"

# Enable Font Awesome
bin/magento config:set byte8_core/ui/is_active_fontawesome 1
```

### Clear Configuration Cache

```bash
# Clear configuration cache
bin/magento cache:clean config

# Or flush all caches
bin/magento cache:flush
```

## Best Practices

### Development Environment

```bash
# Recommended development settings
bin/magento config:set byte8_core/dev/is_active_log_rotation 0
bin/magento config:set byte8_core/dev/is_active_log_print_to_array 1
bin/magento config:set byte8_core/dev/is_active_mail_log 0
bin/magento config:set byte8_core/ui/is_active_fontawesome 1
```

### Staging Environment

```bash
# Recommended staging settings
bin/magento config:set byte8_core/dev/is_active_log_rotation 1
bin/magento config:set byte8_core/dev/is_active_log_print_to_array 0
bin/magento config:set byte8_core/dev/is_active_mail_log 1
bin/magento config:set byte8_core/ui/is_active_fontawesome 1
```

### Production Environment

```bash
# Recommended production settings
bin/magento config:set byte8_core/dev/is_active_log_rotation 1
bin/magento config:set byte8_core/dev/is_active_log_print_to_array 0
bin/magento config:set byte8_core/dev/is_active_mail_log 1
bin/magento config:set byte8_core/ui/is_active_fontawesome 1
```

## Troubleshooting

### Log Files Not Rotating

**Problem**: Log files continue to grow despite rotation being enabled

**Solutions**:
1. Check cron is running: `bin/magento cron:run`
2. Verify file permissions on `var/log/`
3. Check for disk space issues
4. Review `cron_schedule` table for failed jobs

### Email Notifications Not Sending

**Problem**: Critical errors not arriving via email

**Solutions**:
1. Test Magento email: `bin/magento dev:email:test`
2. Check email configuration in **Stores → Configuration → Advanced → System → Mail Sending Settings**
3. Verify SMTP settings
4. Check email logs in `var/log/system.log`
5. Verify email recipient address is correct

### Font Awesome Icons Not Displaying

**Problem**: Icons show as squares or missing

**Solutions**:
1. Clear cache: `bin/magento cache:flush`
2. Verify CDN URL is accessible
3. Check browser console for 404 errors
4. Try default CDN URL
5. Check Content Security Policy settings

## Next Steps

Now that you've configured core settings, proceed to:

1. 🔌 **[Client Configuration](/docs/configuration/client-configuration)** - Configure PlentyONE connection
2. 📊 **[Profile Setup](/docs/profiles/about-profiles)** - Create synchronization profiles
3. 📝 **[API Logging](/docs/configuration/api-logging)** - Configure detailed API logging
4. ✅ **[Testing](/docs/testing/connection-test)** - Test your configuration

## Related Documentation

- [Configuration Overview](/docs/configuration/overview)
- [System Requirements](/docs/system-requirements)
- [Troubleshooting](/docs/troubleshooting/common-issues)
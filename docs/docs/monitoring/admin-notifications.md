---
sidebar_position: 3
title: Admin Notification System
description: Monitor profile operations through the Admin UI notification system
---

# Admin Notification System

The Profile Notification System provides comprehensive logging and alerting for all profile operations in the Mage2Plenty connector. This guide covers how to use the Admin UI to monitor profile execution, investigate issues, and manage notifications.

## Overview

The notification system tracks all profile operations with:
- Real-time notification grid with severity levels
- Process execution summaries with performance metrics
- Detailed error context and stack traces
- Bulk management actions
- Email alert integration

**Access:** **System → Profile Notifications**

## Accessing Notifications

### Main Navigation

1. Log in to Magento Admin
2. Navigate to **System → Profile Notifications**

### Alternative Access

- From any Profile page, click the **Notifications** tab

## Understanding the Notification Grid

### Grid Columns

| Column | Description |
|--------|-------------|
| **ID** | Unique notification identifier |
| **Severity** | Level of importance (Debug, Notice, Warning, Error, Critical) |
| **Profile** | Which profile generated the notification |
| **Entity Type** | Type of data (order, product, customer, etc.) |
| **Entity ID** | Specific ID of the affected entity |
| **Title** | Brief description of the notification |
| **Read** | Whether the notification has been viewed |
| **Created** | When the notification was generated |

### Severity Levels Explained

- 🟢 **Debug**: Detailed information for developers
- 🔵 **Notice**: Normal operational messages
- 🟡 **Warning**: Issues that don't stop processing
- 🔴 **Error**: Failures that affect individual entities
- ⚫ **Critical**: System-wide failures requiring immediate attention

### Visual Indicators

- **Bold text**: Unread notifications
- **Color coding**: Each severity has a distinct color
- **Background shading**: Unread items have light gray background

## Using Filters

### Quick Filters

- **Severity**: Filter by importance level
- **Profile**: Show notifications from specific profile
- **Date Range**: View notifications from specific period
- **Read/Unread**: Show only new notifications

### Advanced Search

1. Click **Filters** button
2. Enter search criteria:
   - **Entity ID**: Find notifications for specific order/product
   - **Title/Message**: Search by keywords
   - **Source**: Filter by specific module or service

**Example searches:**
```
Entity ID: 12345         # Find all notifications for entity 12345
Title: "timeout"         # Search for timeout-related issues
Profile: "Item Export"   # View notifications from Item Export profile
```

## Bulk Actions

Select multiple notifications using checkboxes, then choose:

- **Mark as Read**: Remove bold formatting
- **Delete**: Permanently remove notifications

**Use cases:**
- Mark all warnings as read after reviewing
- Delete old debug notifications
- Bulk delete notifications for resolved issues

## Viewing Notification Details

1. Click on any notification row
2. View detailed information:
   - **Full error message**: Complete error description
   - **Stack trace**: For errors - full PHP stack trace
   - **Context data**: Entity details, profile settings, API request/response
   - **Timestamp and source**: When and where the notification originated

### Detail View Example

```
Notification #12345
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Severity:     🔴 Error
Profile:      Item Export (ID: 5)
Entity Type:  product
Entity ID:    SKU-12345
Created:      2025-10-13 14:23:45

Title
─────────────────────────────────────────────────
Failed to export product to PlentyONE

Message
─────────────────────────────────────────────────
API request failed: 422 Unprocessable Entity
Validation error: Property 'size' has invalid value

Context
─────────────────────────────────────────────────
Product SKU: SKU-12345
Profile Batch Size: 50
API Endpoint: /rest/items
Request ID: abc-123-def

Stack Trace
─────────────────────────────────────────────────
#0 Byte8\PlentyItem\Model\Processor\Export
#1 Byte8\Profile\Model\ProfileProcessor
...
```

## Process Summary View

Access via **System → Profile Notifications → Summary**

### Summary Metrics

The summary view provides aggregated metrics for profile executions:

| Metric | Description |
|--------|-------------|
| **Total Processed** | Number of entities handled |
| **Success Count** | Successfully processed items |
| **Warning Count** | Items with non-critical issues |
| **Error Count** | Failed items |
| **Execution Time** | How long the process took |
| **Memory Usage** | Peak memory consumption |

### Summary Grid Example

```
Profile: Item Export (ID: 5)
Execution: 2025-10-13 14:00:00 - 14:15:30

┌──────────────────┬───────────┐
│ Metric           │ Value     │
├──────────────────┼───────────┤
│ Total Processed  │ 1,234     │
│ Success          │ 1,200     │
│ Warnings         │ 30        │
│ Errors           │ 4         │
│ Duration         │ 15m 30s   │
│ Memory Peak      │ 384 MB    │
│ Success Rate     │ 97.2%     │
└──────────────────┴───────────┘
```

### Performance Indicators

- **Green**: All metrics within normal range
- **Yellow**: Some warnings, acceptable performance
- **Red**: Errors present or performance degraded

## System Configuration

The notification system can be configured via Admin panel or CLI. All settings are found under **Stores → Configuration → Byte8 → Profile Notifications**.

### General Settings

Control the overall notification system behavior:

**Via Admin:**
Navigate to **Stores → Configuration → Byte8 → Profile Notifications → General Settings**

| Setting | Description | Values |
|---------|-------------|--------|
| **Enable Notifications** | Master switch for notification system | Yes/No |
| **Minimum Log Level** | Only log notifications at this severity or higher | Debug, Notice, Warning, Error, Critical |
| **Retention Period (Days)** | Auto-delete notifications older than this (0 = keep forever) | Number (0+) |
| **Maximum Notifications** | Maximum number of notifications to keep (0 = no limit) | Number (0+) |

**Via CLI:**
```bash
# Enable notification system
bin/magento config:set byte8_profile_notification/general/enabled 1

# Set minimum log level (debug, notice, warning, error, critical)
bin/magento config:set byte8_profile_notification/general/log_level warning

# Set retention period (days, 0 = keep forever)
bin/magento config:set byte8_profile_notification/general/retention_days 90

# Set maximum notifications to keep (0 = no limit)
bin/magento config:set byte8_profile_notification/general/max_notifications 10000

bin/magento cache:flush
```

### Email Notifications

Configure email alerts for profile notifications:

**Via Admin:**
Navigate to **Stores → Configuration → Byte8 → Profile Notifications → Email Notifications**

| Setting | Description | Values |
|---------|-------------|--------|
| **Enable Email Notifications** | Send notifications via email | Yes/No |
| **Recipient Email(s)** | Comma-separated list of email addresses | Email addresses |
| **Email Sender** | Magento email identity to use as sender | General, Sales, Support, Custom |
| **Email Threshold** | Minimum severity to trigger email | Debug, Notice, Warning, Error, Critical |
| **Send Critical Errors Immediately** | Skip batching for critical errors | Yes/No |
| **Enable Batch Email Summary** | Send periodic summary of notifications | Yes/No |
| **Batch Interval (Minutes)** | How often to send batch emails | Number (> 0) |

**Via CLI:**
```bash
# Enable email notifications
bin/magento config:set byte8_profile_notification/email/enabled 1

# Set recipient(s) - comma-separated for multiple
bin/magento config:set byte8_profile_notification/email/recipient "admin@example.com,devops@example.com"

# Set email sender identity
bin/magento config:set byte8_profile_notification/email/sender general

# Set minimum severity threshold (debug, notice, warning, error, critical)
bin/magento config:set byte8_profile_notification/email/threshold error

# Enable immediate critical alerts
bin/magento config:set byte8_profile_notification/email/real_time_critical 1

# Enable batch summary emails
bin/magento config:set byte8_profile_notification/email/batch_enabled 1

# Set batch interval in minutes
bin/magento config:set byte8_profile_notification/email/batch_interval 60

bin/magento cache:flush
```

### Performance Settings

Optimize notification processing performance:

**Via Admin:**
Navigate to **Stores → Configuration → Byte8 → Profile Notifications → Performance Settings**

| Setting | Description | Values |
|---------|-------------|--------|
| **Batch Processing Size** | Number of notifications to process at once | Number (> 0) |
| **Enable Asynchronous Logging** | Process notifications in background queue | Yes/No |

**Via CLI:**
```bash
# Set batch processing size
bin/magento config:set byte8_profile_notification/performance/batch_size 100

# Enable asynchronous logging
bin/magento config:set byte8_profile_notification/performance/enable_async 1

bin/magento cache:flush
```

:::tip Configuration Recommendations

**Production Environment:**
- Minimum Log Level: `warning` or `error`
- Retention Period: `30-90 days`
- Maximum Notifications: `5000-10000`
- Email Threshold: `error` or `critical`
- Enable Batch Emails: `Yes`
- Batch Interval: `60 minutes`
- Asynchronous Logging: `Yes`

**Development Environment:**
- Minimum Log Level: `debug` or `notice`
- Retention Period: `7-14 days`
- Maximum Notifications: `1000`
- Email Threshold: `critical`
- Enable Batch Emails: `No` (to avoid email noise)
- Asynchronous Logging: `No` (for immediate debugging)
:::

## Email Alert Types

The notification system sends three types of email alerts:

### Immediate Alerts

Critical errors trigger immediate emails containing:
- Error description
- Affected profile and entity
- Direct link to admin panel

**Example:**
```
Subject: [CRITICAL] Profile Execution Failed - Item Export

Profile "Item Export" encountered a critical error:

Error: Database connection lost during export
Entity: Product SKU-12345
Time: 2025-10-13 14:23:45

View Details: https://your-store.com/admin/profile/notification/view/id/12345
```

### Batch Summaries

Periodic emails (configurable interval) include:
- Count of errors by severity
- Most recent critical issues
- Link to full notification list

**CLI Command:**
```bash
# Send batch emails manually
bin/magento byte8:notification:send-batch-emails

# Preview without sending
bin/magento byte8:notification:send-batch-emails --preview

# Send only critical notifications
bin/magento byte8:notification:send-batch-emails --severity=critical
```

### Process Reports

After each profile run:
- Total items processed
- Success/failure rates
- Performance metrics
- Links to detailed notifications

## Best Practices

### Daily Monitoring

1. **Check for critical/error notifications each morning**
   - Filter by severity: Critical + Error
   - Review overnight profile executions

2. **Review warning trends weekly**
   - Look for patterns in warnings
   - Address recurring issues before they become errors

3. **Clear old notifications monthly**
   - Delete notifications older than retention period
   - Export important notifications for records

### Investigating Issues

**Step-by-step process:**

1. **Start with critical/error severity**
   ```
   Filter: Severity = Critical OR Error
   Date Range: Last 24 hours
   ```

2. **Look for patterns**
   - Same entity type failing?
   - Same time of day?
   - Specific profile having issues?

3. **Check related entities using filters**
   ```
   If product SKU-12345 failed:
   Search: Entity ID = SKU-12345
   View all notifications for this product
   ```

4. **Review full context in detail view**
   - Read complete error message
   - Check stack trace
   - Review API request/response
   - Note any related configuration

5. **Cross-reference with profile logs**
   ```bash
   tail -f var/log/plenty_item.log | grep "SKU-12345"
   ```

### Performance Monitoring

1. **Check Summary view for execution times**
   - Identify slow-running profiles
   - Compare with historical baselines

2. **Monitor memory usage trends**
   - Watch for increasing memory consumption
   - Adjust batch sizes if needed

3. **Identify slow-running processes**
   - Review execution duration metrics
   - Optimize profiles with consistently long execution times

## Common Scenarios

### Order Export Failed

**Problem:** Order not exported to PlentyONE

**Investigation steps:**

1. Filter by Entity Type = "order"
2. Look for error notifications
3. Click to view specific order ID and error details
4. Common causes:
   - Missing required data (shipping address, payment method)
   - Invalid order status
   - API rate limiting
   - PlentyONE configuration issues

**Resolution:**
```bash
# Re-run export for specific order
bin/magento plenty:order:export --order-id=12345 --verbose

# Or re-run entire profile
bin/magento plenty:profile:run --profile-id=3
```

### Order Export Retry Exhausted

**Problem:** Order failed to export after maximum retry attempts

**How it works:**
- When automatic retry is enabled in the Order Export profile, failed orders are retried up to the configured maximum attempts (default: 3)
- When all retry attempts are exhausted, the system sends an email notification via the ProfileNotification service (if `retry_notification_enabled` is enabled in the order export profile)
- The notification includes the order details and failure reason

**Investigation steps:**

1. Check email for retry failure notification
2. Filter admin notifications by Entity Type = "order" and Severity = "Error"
3. Review the specific error message to determine root cause
4. Check if the issue is transient (API timeout) or permanent (invalid data)

**Resolution:**
1. Fix the underlying issue (API credentials, data validation, etc.)
2. Manually re-export the order:
   ```bash
   bin/magento plenty:order:export --order-id=12345
   ```

### Memory Limit Errors

**Problem:** Profile execution fails with memory errors

**Investigation steps:**

1. Check Summary for high memory usage
2. Review critical notifications for memory errors
3. Look at execution history to see memory trends

**Common causes:**
- Large batch sizes
- Too many entities loaded at once
- Inefficient attribute loading
- Image processing

**Resolution:**
```bash
# Reduce batch size temporarily
bin/magento config:set plenty/profile_config/batch_size 25

# For specific profile (via database)
mysql> UPDATE byte8_profile_entity SET batch_size = 25 WHERE entity_id = 5;
```

### API Connection Issues

**Problem:** Intermittent connection failures to PlentyONE

**Investigation steps:**

1. Look for patterns in error timing
   - Random failures = network issues
   - Regular timing = rate limiting

2. Check for "connection" or "timeout" in messages
   ```
   Filter: Title contains "timeout" OR "connection"
   ```

3. Verify PlentyONE API credentials
   ```bash
   bin/magento plenty:client:test
   ```

**Common causes:**
- Rate limiting (429 errors)
- Network timeouts
- Invalid/expired credentials
- PlentyONE system maintenance

**Resolution:**
```bash
# Test connection
bin/magento plenty:client:test

# Refresh access token
bin/magento plenty:client:token --refresh

# Check API logs
tail -f var/log/plenty_api_error.log
```

### Too Many Debug Notifications

**Problem:** Notification grid cluttered with debug messages

**Investigation steps:**

1. Check current log level configuration
2. Review if debug mode is enabled unnecessarily

**Resolution:**
```bash
# Set minimum log level to warning
bin/magento config:set byte8_profile_notification/general/log_level warning

# Or via Admin:
# Stores > Configuration > Byte8 > Profile Notification > General > Log Level = Warning

bin/magento cache:flush

# Clean up existing debug notifications
mysql> DELETE FROM byte8_profile_notification WHERE severity = 'debug' AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

## Troubleshooting

### No Notifications Appearing

**Possible causes:**
- Notifications disabled in configuration
- Minimum log level too high (only showing critical, missing errors/warnings)
- Profile services not running

**Check:**
```bash
# Verify notification module is enabled
bin/magento module:status Byte8_ProfileNotification

# Check configuration
bin/magento config:show byte8_profile_notification/general/enabled
bin/magento config:show byte8_profile_notification/general/log_level

# Verify profiles are executing
tail -f var/log/plenty_profile.log
```

### Too Many Notifications

**Problem:** Grid overwhelmed with notifications

**Solutions:**

1. **Adjust minimum log level**
   ```bash
   # Only show warnings and above
   bin/magento config:set byte8_profile_notification/general/log_level warning
   ```

2. **Configure retention settings**
   ```bash
   # Auto-delete after 30 days
   bin/magento config:set byte8_profile_notification/general/retention_days 30
   ```

3. **Set up email filters**
   - Use email threshold to reduce noise
   - Configure batch summaries instead of individual alerts

4. **Use notification filters**
   - Bookmark filtered views (e.g., "Errors only")
   - Focus on critical/error severity daily

### Email Alerts Not Received

**Possible causes:**
- Email configuration incorrect
- Threshold set too high
- Recipient email invalid
- SMTP issues

**Check:**
```bash
# Verify email configuration
bin/magento config:show byte8_profile_notification/email/enabled
bin/magento config:show byte8_profile_notification/email/recipient
bin/magento config:show byte8_profile_notification/email/threshold

# Test email notifications
bin/magento byte8:notification:send-batch-emails --preview

# Check Magento email logs
tail -f var/log/system.log | grep -i mail
```

## Keyboard Shortcuts

Speed up notification management with keyboard shortcuts:

- **R**: Mark selected as read
- **D**: Delete selected
- **F**: Focus on filters
- **Esc**: Clear selection

## Tips for Efficiency

1. **Save Filter Presets**
   - Bookmark frequently used filter combinations
   - Example: `?severity=error&severity=critical&read=0`

2. **Export Data**
   - Use "Export" button for offline analysis
   - Export to CSV for trend analysis in Excel/Google Sheets

3. **Quick Actions**
   - Right-click notifications for context menu
   - Bulk mark as read for reviewed issues

4. **Notification Badge**
   - Check admin header for unread count
   - Click badge for quick access to unread notifications

5. **Set Up Saved Filters**
   - Create filter for each profile you monitor
   - Save "Critical + Error" as default view

## Retention and Cleanup

### Automatic Cleanup

Notifications are automatically deleted after configured retention period:

```bash
# Set retention period (days)
bin/magento config:set byte8_profile_notification/general/retention_days 90
```

The cleanup cron runs daily and removes notifications older than the retention period.

### Manual Cleanup

**Via Admin:**
- Use "Clear All" button to delete all notifications
- Use filters + bulk delete for selective cleanup

**Via CLI:**
```bash
# Delete notifications older than 90 days
mysql> DELETE FROM byte8_profile_notification WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

# Delete all debug notifications older than 7 days
mysql> DELETE FROM byte8_profile_notification WHERE severity = 'debug' AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

# Delete read notifications older than 30 days
mysql> DELETE FROM byte8_profile_notification WHERE is_read = 1 AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### Export Before Deletion

**Preserve important data:**
```bash
# Export to CSV
mysql -e "SELECT * FROM byte8_profile_notification WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);" \
    -B | sed 's/\t/,/g' > notifications_archive_$(date +%Y%m%d).csv

# Then delete
mysql -e "DELETE FROM byte8_profile_notification WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);"
```

## Integration with Profile Monitoring

The Admin Notification System works alongside CLI monitoring tools:

### Combined Workflow

1. **Admin UI** (End-user focused)
   - Daily health checks
   - Quick issue identification
   - Bulk management

2. **CLI Monitoring** (DevOps focused)
   - Automated alerts
   - Performance metrics
   - Detailed troubleshooting

See **[Profile Execution Monitoring](/docs/monitoring/profiles)** for CLI-based monitoring tools and SQL queries.

## Getting Help

- **Hover tooltips**: Hover over any field for quick help
- **Context help**: Click "?" icons for detailed explanations
- **Support**: Contact support for system issues
- **Documentation**: See related documentation below

## Related Documentation

- **[Profile Execution Monitoring](/docs/monitoring/profiles)** - CLI monitoring and SQL queries
- **[API Performance Monitoring](/docs/monitoring/api-performance)** - Monitor API performance
- **[Profile Scheduling](/docs/profiles/scheduling)** - Schedule profiles
- **[Common Issues](/docs/troubleshooting/common-issues)** - General troubleshooting

---

**Pro Tip:** Set your default filter view to show only unread notifications with severity Error or Critical. This ensures you see the most important issues first thing each day. Bookmark the filtered URL for quick access.
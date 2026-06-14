---
sidebar_position: 3
title: Profile Configuration
description: Configure profile history, notifications, and performance settings
---

# Profile Configuration

Profile Configuration controls how Mage2Plenty manages synchronization profiles, including history retention, notification settings, and performance options. Profiles are the core mechanism for managing data synchronization between Magento 2 and PlentyONE.

## Accessing Profile Configuration

1. Log in to your Magento Admin panel
2. Navigate to **Stores → Configuration**
3. In the left panel, expand **Byte8**
4. Select **Profile Configuration** for general settings
5. Select **Profile Notifications** for notification settings

:::tip Navigation Paths
- **Profile Settings**: **Stores → Configuration → Byte8 → Profile Configuration**
- **Profile Notifications**: **Stores → Configuration → Byte8 → Profile Notifications**
:::

## Profile Settings

### Profile History Lifetime

**Field**: `history_lifetime`
**Path**: `byte8_profile/profile_config/history_lifetime`
**Type**: Text (numeric)
**Default**: 7 days
**Scope**: Global

Controls how long profile execution history is retained in the database.

**Description**: Number of days a profile history should be kept for. After this period, old profile execution records are automatically purged to maintain database performance.

**Configuration Steps**:

1. Navigate to **Stores → Configuration → Byte8 → Profile Configuration**
2. Expand the **Profile Settings** section
3. Enter the number of days in **Profile history lifetime** field
4. Click **Save Config**
5. Clear cache: `bin/magento cache:flush`

**Recommended Values**:

| Environment | Recommended Days | Reasoning |
|-------------|-----------------|-----------|
| Development | 3-7 days | Limited history needed for testing |
| Staging | 7-14 days | Enough history for debugging |
| Production | 30-90 days | Extended history for auditing and troubleshooting |

**What Gets Stored in Profile History**:
- Profile execution start/end times
- Processed entity counts
- Error messages and warnings
- Data snapshots (depending on profile type)
- API request/response logs
- Processing status and results

**Storage Impact**:

```
Average storage per profile execution: 1-5 MB
Daily synchronizations: 24 executions (hourly)
30-day retention: ~720-3,600 MB per profile
```

:::warning Database Maintenance
Profile history tables can grow large in high-volume environments. Regular cleanup is essential for optimal performance.
:::

:::tip Custom Retention
For compliance or audit requirements, you can set longer retention periods (90-365 days). Consider implementing database archiving for very long retention periods.
:::

## Profile Notifications

Profile Notifications allow you to monitor profile executions and receive alerts when issues occur.

### General Settings

#### Enable Notifications

**Field**: `enabled`
**Path**: `byte8_profile_notification/general/enabled`
**Type**: Yes/No
**Default**: No
**Scope**: Global

Master switch for the profile notification system.

**Description**: When enabled, Mage2Plenty will log profile notifications and can send email alerts based on configured thresholds.

**Configuration Steps**:

1. Navigate to **Stores → Configuration → Byte8 → Profile Notifications**
2. Expand the **General Settings** section
3. Set **Enable Notifications** to **Yes**
4. Configure other notification settings (see below)
5. Click **Save Config**

#### Minimum Log Level

**Field**: `log_level`
**Path**: `byte8_profile_notification/general/log_level`
**Type**: Select
**Scope**: Global
**Depends on**: `enabled` = Yes

Determines which notification levels are logged.

**Available Levels**:

| Level | Numeric Value | Description | Example |
|-------|---------------|-------------|---------|
| DEBUG | 100 | Detailed debugging information | API request/response details |
| INFO | 200 | Informational messages | Profile started, completed successfully |
| NOTICE | 250 | Normal but significant events | 100 products synchronized |
| WARNING | 300 | Warning messages | Product SKU not found in PlentyONE |
| ERROR | 400 | Error messages | API connection failed |
| CRITICAL | 500 | Critical conditions | Database connection lost |
| ALERT | 550 | Action must be taken immediately | System running out of disk space |
| EMERGENCY | 600 | System is unusable | Complete system failure |

**Recommended Settings**:

```bash
# Development
Minimum Log Level: DEBUG (log everything)

# Staging
Minimum Log Level: INFO (log general operations)

# Production
Minimum Log Level: WARNING (log only issues)
```

:::tip Performance Impact
Lower log levels (DEBUG, INFO) generate more database records. Use WARNING or ERROR in production to minimize storage and performance impact.
:::

#### Retention Period

**Field**: `retention_days`
**Path**: `byte8_profile_notification/general/retention_days`
**Type**: Text (numeric)
**Default**: 30 days
**Scope**: Global
**Depends on**: `enabled` = Yes

Number of days to keep notifications in the database.

**Description**: Old notifications are automatically deleted after this period. Set to `0` to keep notifications forever (not recommended).

**Configuration Examples**:

```bash
# Short retention (development/staging)
Retention Period: 7-14 days

# Standard retention (production)
Retention Period: 30-60 days

# Extended retention (compliance/audit)
Retention Period: 90-180 days

# Forever (not recommended)
Retention Period: 0
```

:::warning Storage Considerations
High-volume environments can generate thousands of notifications daily. Monitor database size when using extended retention periods.
:::

#### Maximum Notifications

**Field**: `max_notifications`
**Path**: `byte8_profile_notification/general/max_notifications`
**Type**: Text (numeric)
**Default**: 10,000
**Scope**: Global
**Depends on**: `enabled` = Yes

Maximum number of notifications to keep in the database.

**Description**: When this limit is reached, oldest notifications are automatically deleted regardless of retention period. Set to `0` for no limit (not recommended).

**How It Works**:
1. Notifications accumulate over time
2. When limit is reached, oldest notifications are purged
3. Works in conjunction with retention period
4. Whichever limit is reached first triggers cleanup

**Example Scenarios**:

```
Scenario 1:
- max_notifications: 10,000
- retention_days: 30
- Result: Keeps 10,000 most recent notifications OR 30 days (whichever is less)

Scenario 2:
- max_notifications: 0 (no limit)
- retention_days: 7
- Result: Keeps all notifications from last 7 days only

Scenario 3:
- max_notifications: 5,000
- retention_days: 90
- Result: Keeps 5,000 most recent notifications (may be less than 90 days)
```

### Email Notifications

Configure email alerts for profile execution events and errors.

#### Enable Email Notifications

**Field**: `enabled`
**Path**: `byte8_profile_notification/email/enabled`
**Type**: Yes/No
**Default**: No
**Scope**: Global

Enables sending email notifications for profile events.

**Configuration Steps**:

1. Navigate to **Stores → Configuration → Byte8 → Profile Notifications**
2. Expand the **Email Notifications** section
3. Set **Enable Email Notifications** to **Yes**
4. Configure recipient, sender, and threshold settings
5. Click **Save Config**

#### Recipient Email(s)

**Field**: `recipient`
**Path**: `byte8_profile_notification/email/recipient`
**Type**: Text (email)
**Required**: Yes (when email notifications enabled)
**Scope**: Global

Email addresses to receive profile notifications.

**Format**: Comma-separated list of email addresses

**Examples**:

```
# Single recipient
admin@example.com

# Multiple recipients
admin@example.com,devteam@example.com,support@example.com

# Team aliases
ecommerce-team@example.com,it-operations@example.com
```

:::tip Email Filtering
Use email rules or distribution lists to route notifications to appropriate teams based on severity or profile type.
:::

#### Email Sender

**Field**: `sender`
**Path**: `byte8_profile_notification/email/sender`
**Type**: Select
**Scope**: Global

Magento email identity used as the sender for notifications.

**Common Options**:
- General Contact
- Sales Representative
- Customer Support
- Custom Email 1
- Custom Email 2

**Sender Identity Configuration**:

To configure sender identities:
1. Navigate to **Stores → Configuration → General → Store Email Addresses**
2. Configure desired email identity
3. Return to Profile Notifications and select the identity

#### Email Threshold

**Field**: `threshold`
**Path**: `byte8_profile_notification/email/threshold`
**Type**: Select
**Scope**: Global

Minimum severity level required to trigger email notifications.

**Available Thresholds**:

| Threshold | When to Use | Notification Volume |
|-----------|-------------|---------------------|
| DEBUG | Development only | Very High |
| INFO | Never recommended | High |
| NOTICE | Special monitoring scenarios | Medium-High |
| WARNING | General production use | Medium |
| ERROR | Important errors only | Low-Medium |
| CRITICAL | Mission-critical alerts only | Low |

**Recommended Settings**:

```bash
# Development/Staging
Email Threshold: WARNING or ERROR

# Production (standard)
Email Threshold: ERROR

# Production (mission-critical)
Email Threshold: CRITICAL
```

:::caution Email Overload
Setting threshold too low (DEBUG, INFO, NOTICE) can result in hundreds of emails per day. Start with ERROR and adjust as needed.
:::

#### Send Critical Errors Immediately

**Field**: `real_time_critical`
**Path**: `byte8_profile_notification/email/real_time_critical`
**Type**: Yes/No
**Default**: Yes
**Scope**: Global

Sends critical errors immediately without waiting for batch interval.

**Description**: When enabled, CRITICAL and EMERGENCY level notifications bypass batch processing and send immediately. This ensures you're notified of severe issues without delay.

**When to Enable**:
- ✅ Production environments
- ✅ Mission-critical integrations
- ✅ 24/7 operations
- ❌ Development/testing environments

**Example Critical Errors**:
- PlentyONE API authentication failure
- Database connection lost
- File system full
- Memory exhausted
- Queue processing stopped

#### Enable Batch Email Summary

**Field**: `batch_enabled`
**Path**: `byte8_profile_notification/email/batch_enabled`
**Type**: Yes/No
**Default**: No
**Scope**: Global

Groups non-critical notifications into periodic summary emails.

**Description**: Instead of sending individual emails for each notification, batch mode collects notifications and sends summaries at configured intervals.

**Benefits**:
- Reduces email volume
- Easier to digest multiple notifications
- Less email alert fatigue
- Better overview of issues

**Example Summary Email**:

```
Subject: [Mage2Plenty] Notification Summary - 15 notifications

Profile Execution Summary (Last 60 minutes)

ERRORS (3):
- Product SKU "ABC-123" not found in PlentyONE
- Order #100001234 export failed: timeout
- Stock update failed for 5 products

WARNINGS (12):
- Product image missing for SKU "DEF-456"
- Category mapping not configured for ID 42
- Customer address validation failed for order #100001235
...

View detailed logs: [Admin Panel Link]
```

#### Batch Interval

**Field**: `batch_interval`
**Path**: `byte8_profile_notification/email/batch_interval`
**Type**: Text (numeric)
**Default**: 60 minutes
**Scope**: Global
**Depends on**: `batch_enabled` = Yes

How often to send batch summary emails (in minutes).

**Recommended Intervals**:

| Environment | Interval | Reasoning |
|-------------|----------|-----------|
| Development | 240-480 min (4-8 hours) | Low priority |
| Staging | 120-240 min (2-4 hours) | Moderate monitoring |
| Production (low volume) | 60-120 min (1-2 hours) | Regular monitoring |
| Production (high volume) | 30-60 min | Frequent monitoring |
| 24/7 Operations | 15-30 min | Continuous monitoring |

:::tip Balancing Frequency
Shorter intervals provide faster notification but more emails. Find the right balance for your operations team's workflow.
:::

### Performance Settings

Optimize notification processing for high-volume environments.

#### Batch Processing Size

**Field**: `batch_size`
**Path**: `byte8_profile_notification/performance/batch_size`
**Type**: Text (numeric)
**Default**: 100
**Scope**: Global

Number of notifications to process in a single batch operation.

**Description**: When cleaning up old notifications or processing notification queue, this determines how many records are handled per batch.

**Recommended Values**:

| Environment | Batch Size | Database Load |
|-------------|-----------|---------------|
| Small (< 10 profiles) | 50-100 | Low |
| Medium (10-50 profiles) | 100-200 | Medium |
| Large (50+ profiles) | 200-500 | High |
| Enterprise | 500-1000 | Very High |

**Impact on Performance**:

```
Smaller Batch Size:
✅ Lower memory usage
✅ Less database locking
❌ Slower overall processing

Larger Batch Size:
✅ Faster overall processing
✅ More efficient queries
❌ Higher memory usage
❌ Potential database locks
```

:::warning Database Locks
Very large batch sizes (> 1000) can cause database locks affecting other operations. Test thoroughly before increasing beyond defaults.
:::

#### Enable Asynchronous Logging

**Field**: `enable_async`
**Path**: `byte8_profile_notification/performance/enable_async`
**Type**: Yes/No
**Default**: Yes
**Scope**: Global

Process notifications asynchronously via message queue to improve performance.

**Description**: When enabled, notifications are added to Magento's message queue and processed by background workers. This prevents notification logging from slowing down profile execution.

**Synchronous vs Asynchronous**:

| Aspect | Synchronous (Disabled) | Asynchronous (Enabled) |
|--------|------------------------|------------------------|
| Profile Performance | Slower (waits for logging) | Faster (queued) |
| Notification Delay | Immediate | 1-5 minutes |
| System Load | Higher (inline processing) | Lower (distributed) |
| Reliability | Direct (no queue) | Queue-dependent |
| Best For | Low-volume, development | Production, high-volume |

**Requirements**:
- Magento message queue consumers must be running
- RabbitMQ or MySQL queue configured

**Queue Consumer Setup**:

```bash
# Start notification consumer
bin/magento queue:consumers:start profileNotificationLogger

# Or add to crontab for automatic restart
* * * * * cd /var/www/magento && bin/magento cron:run
```

:::info Queue Configuration
Verify message queue is configured and running before enabling async mode. Check **Stores → Configuration → Advanced → System → Message Queue**.
:::

## Configuration via CLI

Manage profile configuration via command line:

### View Current Settings

```bash
# View all profile configuration
bin/magento config:show byte8_profile
bin/magento config:show byte8_profile_notification

# View specific settings
bin/magento config:show byte8_profile/profile_config/history_lifetime
bin/magento config:show byte8_profile_notification/general/enabled
```

### Update Settings

```bash
# Set profile history lifetime to 30 days
bin/magento config:set byte8_profile/profile_config/history_lifetime 30

# Enable notifications
bin/magento config:set byte8_profile_notification/general/enabled 1

# Set minimum log level to WARNING
bin/magento config:set byte8_profile_notification/general/log_level 300

# Set retention period
bin/magento config:set byte8_profile_notification/general/retention_days 60

# Enable email notifications
bin/magento config:set byte8_profile_notification/email/enabled 1
bin/magento config:set byte8_profile_notification/email/recipient "admin@example.com,devteam@example.com"

# Enable batch email
bin/magento config:set byte8_profile_notification/email/batch_enabled 1
bin/magento config:set byte8_profile_notification/email/batch_interval 60

# Enable async processing
bin/magento config:set byte8_profile_notification/performance/enable_async 1

# Clear cache
bin/magento cache:flush
```

## Best Practices

### Development Environment

```bash
# Development settings - verbose logging, short retention
bin/magento config:set byte8_profile/profile_config/history_lifetime 7
bin/magento config:set byte8_profile_notification/general/enabled 1
bin/magento config:set byte8_profile_notification/general/log_level 100  # DEBUG
bin/magento config:set byte8_profile_notification/general/retention_days 7
bin/magento config:set byte8_profile_notification/email/enabled 0
bin/magento config:set byte8_profile_notification/performance/enable_async 0
```

### Staging Environment

```bash
# Staging settings - moderate logging, email alerts
bin/magento config:set byte8_profile/profile_config/history_lifetime 14
bin/magento config:set byte8_profile_notification/general/enabled 1
bin/magento config:set byte8_profile_notification/general/log_level 200  # INFO
bin/magento config:set byte8_profile_notification/general/retention_days 30
bin/magento config:set byte8_profile_notification/email/enabled 1
bin/magento config:set byte8_profile_notification/email/threshold 400  # ERROR
bin/magento config:set byte8_profile_notification/email/batch_enabled 1
bin/magento config:set byte8_profile_notification/performance/enable_async 1
```

### Production Environment

```bash
# Production settings - critical errors only, async processing
bin/magento config:set byte8_profile/profile_config/history_lifetime 60
bin/magento config:set byte8_profile_notification/general/enabled 1
bin/magento config:set byte8_profile_notification/general/log_level 300  # WARNING
bin/magento config:set byte8_profile_notification/general/retention_days 60
bin/magento config:set byte8_profile_notification/general/max_notifications 10000
bin/magento config:set byte8_profile_notification/email/enabled 1
bin/magento config:set byte8_profile_notification/email/threshold 400  # ERROR
bin/magento config:set byte8_profile_notification/email/real_time_critical 1
bin/magento config:set byte8_profile_notification/email/batch_enabled 1
bin/magento config:set byte8_profile_notification/email/batch_interval 60
bin/magento config:set byte8_profile_notification/performance/enable_async 1
bin/magento config:set byte8_profile_notification/performance/batch_size 200
```

## Monitoring and Maintenance

### Check Notification Storage

```bash
# View notification statistics
SELECT
    COUNT(*) as total_notifications,
    MIN(created_at) as oldest,
    MAX(created_at) as newest,
    ROUND(SUM(LENGTH(message))/1024/1024, 2) as size_mb
FROM byte8_profile_notification;

# View notifications by level
SELECT
    level,
    COUNT(*) as count
FROM byte8_profile_notification
GROUP BY level
ORDER BY level DESC;
```

### Queue Monitoring

```bash
# Check queue status
bin/magento queue:consumers:list
bin/magento queue:consumers:start profileNotificationLogger --single-thread

# View message queue backlog
SELECT COUNT(*) FROM queue_message WHERE topic_name = 'profile.notification.log';
```

## Troubleshooting

### Notifications Not Being Created

**Problem**: Profile executions complete but no notifications in database

**Solutions**:
1. Verify notifications are enabled: `bin/magento config:show byte8_profile_notification/general/enabled`
2. Check minimum log level isn't too high
3. Verify profile is generating notifiable events
4. Check database permissions
5. Review `var/log/system.log` for errors

### Emails Not Sending

**Problem**: Notifications logged but emails not received

**Solutions**:
1. Verify email notifications enabled
2. Check recipient email format
3. Test Magento email: `bin/magento dev:email:test`
4. Verify SMTP configuration in **Stores → Configuration → Advanced → System → Mail Sending Settings**
5. Check threshold settings (may be set too high)
6. Review `var/log/system.log` for email errors
7. Check spam folders

### Queue Not Processing

**Problem**: Notifications delayed or stuck in queue

**Solutions**:
1. Check queue consumers running: `ps aux | grep queue:consumers:start`
2. Start consumer manually: `bin/magento queue:consumers:start profileNotificationLogger`
3. Check queue configuration: `bin/magento queue:consumers:list`
4. Verify cron is running: `bin/magento cron:run`
5. Check for queue errors in database: `SELECT * FROM queue_message WHERE status = 4`

### High Database Usage

**Problem**: Notification tables consuming excessive storage

**Solutions**:
1. Reduce retention period
2. Set maximum notification limit
3. Increase minimum log level to WARNING or ERROR
4. Disable DEBUG level in production
5. Consider archiving old notifications before deletion

## Next Steps

Now that you've configured profile settings and notifications:

1. 📊 **[Create Profiles](/docs/profiles/create-profile)** - Set up synchronization profiles
2. 📋 **[Profile Management](/docs/profiles/about-profiles)** - Learn about profile types
3. ⚙️ **[Schedule Profiles](/docs/profiles/scheduling)** - Automate profile execution
4. 📝 **[Monitor Execution](/docs/monitoring/profiles)** - Track profile performance

## Related Documentation

- [Configuration Overview](/docs/configuration/overview)
- [Core Configuration](/docs/configuration/core-configuration)
- [Client Configuration](/docs/configuration/client-configuration)
- [Troubleshooting Profiles](/docs/troubleshooting/profile-issues)
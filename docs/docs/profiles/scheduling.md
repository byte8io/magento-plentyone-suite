---
sidebar_position: 4
title: Profile Scheduling & Automation
description: Automate profile execution with cron jobs and message queues
---

# Profile Scheduling & Automation

Once you've configured and tested your profiles, it's time to automate them. This guide covers scheduling profiles with cron jobs and using message queues for asynchronous processing.

## Scheduling Methods

Mage2Plenty supports two scheduling methods:

1. **Cron-based scheduling** - Time-based execution (recommended for most use cases)
2. **Event-based scheduling** - Trigger on specific events (e.g., order placement)

## Cron-Based Scheduling

### Enable Cron Jobs

First, ensure Magento's cron is installed:

```bash
# Install cron
bin/magento cron:install

# Verify cron jobs
crontab -l | grep magento
```

### Configure Profile Schedule

Each profile can be scheduled independently via the admin panel:

1. Navigate to **Byte8 → Plenty Profiles**
2. Select your profile
3. Go to **Schedule** tab
4. Configure schedule settings:
   - **Enable Schedule:** Yes
   - **Frequency:** Every 15 minutes, Hourly, Daily, Custom
   - **Start Time:** When to start execution
   - **Priority:** Execution priority (lower number = higher priority)

### Schedule Configuration via CLI

```bash
# Set profile schedule
bin/magento config:set plenty_profile/schedule/<profile_id>/enabled 1
bin/magento config:set plenty_profile/schedule/<profile_id>/frequency "*/15 * * * *"
bin/magento cache:flush
```

### Cron Frequency Examples

| Frequency | Cron Expression | Description |
|-----------|----------------|-------------|
| Every 5 minutes | `*/5 * * * *` | High-frequency sync |
| Every 15 minutes | `*/15 * * * *` | Standard sync |
| Hourly | `0 * * * *` | Medium-frequency |
| Every 4 hours | `0 */4 * * *` | Low-frequency |
| Daily at 2 AM | `0 2 * * *` | Overnight batch |
| Twice daily | `0 2,14 * * *` | 2 AM and 2 PM |

## Profile Execution Order

Configure the execution order when multiple profiles run simultaneously:

```xml
<!-- etc/crontab.xml -->
<group id="plenty_profiles">
    <job name="plenty_category_import" instance="..." schedule="*/30 * * * *">
        <config_path>plenty_profile/schedule/category_import/enabled</config_path>
    </job>
    <job name="plenty_item_import" instance="..." schedule="0 */2 * * *">
        <config_path>plenty_profile/schedule/item_import/enabled</config_path>
    </job>
    <job name="plenty_stock_import" instance="..." schedule="*/15 * * * *">
        <config_path>plenty_profile/schedule/stock_import/enabled</config_path>
    </job>
    <job name="plenty_order_export" instance="..." schedule="*/5 * * * *">
        <config_path>plenty_profile/schedule/order_export/enabled</config_path>
    </job>
</group>
```

### Recommended Execution Order

```
1. Category Import (runs first, less frequent)
   ↓
2. Attribute/Property Sync (after categories)
   ↓
3. Product Import (after categories and attributes)
   ↓
4. Stock Import (frequent, after products)
   ↓
5. Order Export (most frequent, real-time)
   ↓
6. Order Import (status updates)
```

## Event-Based Scheduling

Trigger profiles based on Magento events:

### Order Export on Order Placement

```xml
<!-- etc/events.xml -->
<event name="sales_order_save_after">
    <observer name="plenty_order_export"
              instance="Byte8\PlentyOrderProfile\Observer\ExportOrderObserver" />
</event>
```

### Product Export on Product Save

```xml
<event name="catalog_product_save_after">
    <observer name="plenty_item_export"
              instance="Byte8\PlentyItemProfile\Observer\ExportProductObserver" />
</event>
```

### Configuration

Enable event-based export in profile settings:

1. **Admin → Plenty Profiles → [Profile] → Configuration**
2. **Event Configuration → Enable Event-Based Export:** Yes
3. **Export Queue:** Use queue for async processing (recommended)

## Asynchronous Processing with Message Queues

For better performance, use RabbitMQ or MySQL queue for async processing:

### Setup RabbitMQ (Recommended)

```bash
# Install RabbitMQ
sudo apt-get install rabbitmq-server

# Configure Magento to use RabbitMQ
bin/magento setup:config:set \
  --amqp-host=localhost \
  --amqp-port=5672 \
  --amqp-user=guest \
  --amqp-password=guest \
  --amqp-virtualhost=/
```

### Start Queue Consumers

```bash
# Start all plenty consumers
bin/magento queue:consumers:start plentyItemExportConsumer &
bin/magento queue:consumers:start plentyOrderExportConsumer &
bin/magento queue:consumers:start plentyStockImportConsumer &

# Or use supervisor for production
```

### Supervisor Configuration

Create `/etc/supervisor/conf.d/magento-plenty-queues.conf`:

```ini
[program:magento_plenty_order_export]
command=/usr/bin/php /var/www/magento/bin/magento queue:consumers:start plentyOrderExportConsumer --max-messages=1000
process_name=%(program_name)s_%(process_num)02d
numprocs=3
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/magento-plenty-order.log

[program:magento_plenty_item_export]
command=/usr/bin/php /var/www/magento/bin/magento queue:consumers:start plentyItemExportConsumer --max-messages=500
process_name=%(program_name)s_%(process_num)02d
numprocs=2
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/magento-plenty-item.log

[program:magento_plenty_stock_import]
command=/usr/bin/php /var/www/magento/bin/magento queue:consumers:start plentyStockImportConsumer --max-messages=2000
process_name=%(program_name)s_%(process_num)02d
numprocs=1
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/magento-plenty-stock.log
```

Reload supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

## Monitoring Scheduled Profiles

### Check Cron Execution

```bash
# View cron schedule
bin/magento cron:install --list

# Check last cron run
bin/magento cron:run --bootstrap=standaloneProcessStarted=1

# View cron log
tail -f var/log/cron.log
```

### Monitor Profile Execution

```bash
# View profile history
bin/magento plenty:profile:history --profile=<profile_id> --limit=10

# Check for failed executions
bin/magento plenty:profile:history --status=error

# View last execution time
mysql> SELECT profile_id, status, created_at, finished_at
       FROM byte8_profile_history
       ORDER BY created_at DESC LIMIT 10;
```

### Queue Monitoring

```bash
# List all consumers
bin/magento queue:consumers:list

# Check queue status
mysql> SELECT * FROM queue_message WHERE status='in_progress';

# View consumer logs
tail -f var/log/system.log | grep Consumer
```

## Performance Optimization

### Batch Size Configuration

Adjust batch sizes based on your server resources:

```php
// In profile configuration
'collection_size' => 100,  // Items per batch
'page_size' => 50,         // API request page size
```

**Recommendations:**

| Profile Type | Batch Size | Frequency |
|-------------|------------|-----------|
| Order Export | 50-100 | Every 5-15 min |
| Product Import | 100-500 | Every 1-4 hours |
| Stock Import | 500-1000 | Every 15-30 min |
| Category Import | 50-100 | Daily |

### Parallel Processing

Run multiple consumers for high-volume profiles:

```bash
# Start 3 order export consumers
for i in {1..3}; do
    bin/magento queue:consumers:start plentyOrderExportConsumer &
done

# Or use supervisor numprocs setting
```

### Off-Peak Scheduling

Schedule resource-intensive operations during off-peak hours:

```bash
# Large catalog sync at 2 AM
0 2 * * * /usr/bin/php /var/www/magento/bin/magento plenty:item:import --profile=1

# Price updates at 3 AM
0 3 * * * /usr/bin/php /var/www/magento/bin/magento plenty:item:update-prices

# Stock sync every 15 minutes during business hours only
*/15 8-18 * * * /usr/bin/php /var/www/magento/bin/magento plenty:stock:import
```

## Error Handling and Alerts

### Email Notifications

Configure email alerts for profile failures:

```bash
# Enable profile notifications
bin/magento config:set plenty_profile/notification/enabled 1
bin/magento config:set plenty_profile/notification/recipient admin@example.com
bin/magento config:set plenty_profile/notification/send_on_error 1
```

### Slack/Discord Webhooks

Set up webhook notifications:

```php
// app/code/Custom/PlentyNotify/Observer/ProfileErrorObserver.php
public function execute(Observer $observer)
{
    $profile = $observer->getProfile();
    $error = $observer->getError();

    // Send to Slack
    $webhook = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';
    $message = sprintf(
        'Profile %s failed: %s',
        $profile->getName(),
        $error->getMessage()
    );

    $this->httpClient->post($webhook, [
        'json' => ['text' => $message]
    ]);
}
```

### Automatic Retry Logic

Profiles automatically retry on transient failures:

```php
// Configure retry attempts
'retry_attempts' => 3,
'retry_delay' => 60, // seconds between retries
```

## Advanced Scheduling

### Conditional Execution

Execute profiles based on conditions:

```bash
#!/bin/bash
# /usr/local/bin/plenty-smart-sync.sh

# Only run if orders pending export
ORDER_COUNT=$(mysql -e "SELECT COUNT(*) FROM sales_order WHERE status='processing'" -sN)

if [ $ORDER_COUNT -gt 0 ]; then
    php /var/www/magento/bin/magento plenty:order:export --status=processing
fi
```

### Chained Profile Execution

Execute profiles in sequence:

```bash
#!/bin/bash
# Complete sync workflow

echo "Starting full synchronization..."

# 1. Categories first
php bin/magento plenty:category:import && \

# 2. Then attributes
php bin/magento plenty:attribute:collect && \

# 3. Then products
php bin/magento plenty:item:import && \

# 4. Finally stock
php bin/magento plenty:stock:import

echo "Synchronization complete!"
```

## Troubleshooting Scheduled Profiles

### Profile Not Running

**Check:**
1. Cron is installed and running: `crontab -l`
2. Profile schedule is enabled
3. Cron log for errors: `tail -f var/log/cron.log`

```bash
# Manually trigger cron
bin/magento cron:run

# Check for stuck cron jobs
mysql> SELECT * FROM cron_schedule WHERE status='running';
```

### Profile Runs But No Data Syncs

**Check:**
1. Profile configuration is complete
2. API connection is working: `bin/magento plenty:client:test`
3. Profile logs: `tail -f var/log/plenty_<profile>.log`

### Queue Messages Stuck

```bash
# Check queue status
bin/magento queue:consumers:list

# Restart consumers
sudo supervisorctl restart all

# Clear stuck messages
mysql> UPDATE queue_message SET status='new' WHERE status='in_progress' AND updated_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

## Best Practices

1. **Start Conservative:** Begin with longer intervals, optimize later
2. **Monitor Performance:** Watch server resources during peak times
3. **Use Queues:** Always use async processing for event-based exports
4. **Separate Concerns:** Different frequencies for different profiles
5. **Log Rotation:** Set up log rotation to prevent disk space issues
6. **Backup Schedule:** Keep configuration backed up
7. **Test Changes:** Test schedule changes in staging first
8. **Document Custom Schedules:** Maintain documentation of custom cron jobs

## Related Documentation

- **[Profile Creation](/docs/profiles/create-profile)** - Create and configure profiles
- **[Profile Monitoring](/docs/monitoring/profiles)** - Monitor profile execution
- **[Troubleshooting](/docs/troubleshooting/profile-issues)** - Common profile issues

---

**Next Steps:** After setting up scheduling, monitor your profiles for 24-48 hours to ensure they're running correctly and adjust frequencies as needed.
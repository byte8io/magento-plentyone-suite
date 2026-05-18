---
sidebar_position: 2
title: Profile Execution Monitoring
description: Monitor and track profile execution and performance
---

# Profile Execution Monitoring

Effective profile monitoring ensures your synchronization processes run smoothly and reliably. This guide covers monitoring tools, metrics, and best practices for tracking profile execution.

:::info Database Schema Note
The `softcommerce_profile_history` table contains basic execution history with these columns:
- `entity_id`: History record ID
- `parent_id`: Profile ID (FK to `softcommerce_profile_entity.entity_id`)
- `status`: Execution status
- `type_id`: Profile type identifier
- `message`: Error/status message (singular)
- `created_at`: Execution start time
- `updated_at`: Last update time

For detailed metrics like processed counts, execution times, and throughput, you'll need to aggregate data from module-specific logs and tables.
:::

## Profile Execution Metrics

### Key Performance Indicators

| Metric | Description | Good | Warning | Critical |
|--------|-------------|------|---------|----------|
| **Success Rate** | % of successful executions | > 98% | 95-98% | < 95% |
| **Execution Time** | Time to complete | Within expected | 2x expected | > 3x expected |
| **Entities Processed** | Items/orders/etc per run | As expected | -20% | -50% |
| **Error Rate** | % of failed entities | < 1% | 1-5% | > 5% |
| **Queue Depth** | Messages waiting | < 100 | 100-1000 | > 1000 |
| **Memory Usage** | Peak memory per execution | < 512MB | 512MB-1GB | > 1GB |

### Profile Execution States

| State | Description | Duration |
|-------|-------------|----------|
| **Pending** | Scheduled but not started | Until cron runs |
| **Running** | Currently executing | Minutes to hours |
| **Success** | Completed without errors | Final |
| **Partial Success** | Completed with some errors | Final |
| **Failed** | Execution failed | Final |
| **Cancelled** | Manually stopped | Final |

## Monitoring Profile Execution

### View Profile History

#### Via Database

```sql
-- Recent profile executions
SELECT
    h.entity_id,
    h.parent_id as profile_id,
    p.name as profile_name,
    h.status,
    h.type_id,
    h.created_at,
    h.updated_at,
    TIMESTAMPDIFF(SECOND, h.created_at, h.updated_at) as duration_seconds,
    SUBSTRING(h.message, 1, 100) as message_preview
FROM softcommerce_profile_history h
JOIN softcommerce_profile_entity p ON h.parent_id = p.entity_id
ORDER BY h.created_at DESC
LIMIT 20;

-- Profile execution statistics (last 30 days)
SELECT
    h.parent_id as profile_id,
    p.name as profile_name,
    h.status,
    COUNT(*) as execution_count,
    AVG(TIMESTAMPDIFF(SECOND, h.created_at, h.updated_at)) as avg_duration_seconds
FROM softcommerce_profile_history h
JOIN softcommerce_profile_entity p ON h.parent_id = p.entity_id
WHERE h.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY h.parent_id, h.status, p.name
ORDER BY h.parent_id, h.status;

-- Failed executions with errors
SELECT
    h.parent_id as profile_id,
    p.name as profile_name,
    h.created_at,
    h.status,
    SUBSTRING(h.message, 1, 200) as error_message
FROM softcommerce_profile_history h
JOIN softcommerce_profile_entity p ON h.parent_id = p.entity_id
WHERE h.status IN ('error', 'failed')
ORDER BY h.created_at DESC
LIMIT 10;
```

#### Via Admin Panel

1. Navigate to **SoftCommerce → Profiles → Manage Profiles**
2. Select your profile
3. Click **History** tab
4. View execution history with:
   - Status
   - Start/end time
   - Duration
   - Entities processed
   - Error messages

### Profile Execution Logs

```bash
# Module-specific logs
tail -f var/log/plenty_item.log          # Item profile execution
tail -f var/log/plenty_order.log         # Order profile execution
tail -f var/log/plenty_stock.log         # Stock profile execution
tail -f var/log/plenty_customer.log      # Customer profile execution
tail -f var/log/plenty_category.log      # Category profile execution

# Error logs
tail -f var/log/plenty_item_error.log
tail -f var/log/plenty_order_error.log

# General profile logs
tail -f var/log/plenty_profile.log

# Cron logs (for scheduled profiles)
tail -f var/log/cron.log | grep plenty
```

### Real-Time Execution Monitoring

```bash
# Monitor profile execution in real-time
tail -f var/log/plenty_item.log | grep -E "(Started|Finished|Processing|Error)"

# Watch for specific profile
tail -f var/log/plenty_item.log | grep "profile_id: 1"

# Monitor progress with counts
tail -f var/log/plenty_item.log | grep -E "processed: [0-9]+"

# Monitor errors only
tail -f var/log/plenty_item_error.log
```

## Profile Performance Analysis

### Execution Time Analysis

```sql
-- Average execution time by profile (last 30 days)
SELECT
    p.entity_id,
    p.name,
    p.type_id,
    COUNT(*) as executions,
    AVG(TIMESTAMPDIFF(SECOND, h.created_at, h.updated_at)) as avg_seconds,
    MIN(TIMESTAMPDIFF(SECOND, h.created_at, h.updated_at)) as min_seconds,
    MAX(TIMESTAMPDIFF(SECOND, h.created_at, h.updated_at)) as max_seconds
FROM softcommerce_profile_entity p
JOIN softcommerce_profile_history h ON p.entity_id = h.parent_id
WHERE h.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND h.status = 'success'
GROUP BY p.entity_id, p.name, p.type_id
ORDER BY avg_seconds DESC;

-- Execution time trend (daily)
SELECT
    DATE(h.created_at) as date,
    h.parent_id as profile_id,
    p.name as profile_name,
    COUNT(*) as executions,
    AVG(TIMESTAMPDIFF(SECOND, h.created_at, h.updated_at)) as avg_duration_seconds
FROM softcommerce_profile_history h
JOIN softcommerce_profile_entity p ON h.parent_id = p.entity_id
WHERE h.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND h.status = 'success'
GROUP BY DATE(h.created_at), h.parent_id, p.name
ORDER BY date DESC, profile_id;
```

### Throughput Analysis

:::note
The `softcommerce_profile_history` table does not store processed entity counts.
For throughput metrics, use module-specific logs or implement custom tracking.
:::

```sql
-- Profile execution frequency (executions per hour)
SELECT
    p.name,
    p.type_id,
    COUNT(*) / 168 as avg_executions_per_hour
FROM softcommerce_profile_entity p
JOIN softcommerce_profile_history h ON p.entity_id = h.parent_id
WHERE h.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    AND h.status = 'success'
GROUP BY p.entity_id, p.name, p.type_id
ORDER BY avg_executions_per_hour DESC;

-- Hourly execution pattern
SELECT
    HOUR(h.created_at) as hour,
    COUNT(*) as total_executions,
    SUM(CASE WHEN h.status = 'success' THEN 1 ELSE 0 END) as successful_executions,
    AVG(TIMESTAMPDIFF(SECOND, h.created_at, h.updated_at)) as avg_duration_seconds
FROM softcommerce_profile_history h
WHERE h.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY HOUR(h.created_at)
ORDER BY hour;
```

### Error Rate Analysis

```sql
-- Error rate by profile
SELECT
    p.name,
    p.type_id,
    COUNT(*) as total_executions,
    SUM(CASE WHEN h.status = 'success' THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN h.status IN ('error', 'failed') THEN 1 ELSE 0 END) as failed,
    ROUND(SUM(CASE WHEN h.status IN ('error', 'failed') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as error_rate_percent
FROM softcommerce_profile_entity p
JOIN softcommerce_profile_history h ON p.entity_id = h.parent_id
WHERE h.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY p.entity_id, p.name, p.type_id
HAVING total_executions > 0
ORDER BY error_rate_percent DESC;

-- Common error messages
SELECT
    h.parent_id as profile_id,
    p.name as profile_name,
    SUBSTRING(h.message, 1, 100) as error_message,
    COUNT(*) as occurrence_count
FROM softcommerce_profile_history h
JOIN softcommerce_profile_entity p ON h.parent_id = p.entity_id
WHERE h.status IN ('error', 'failed')
    AND h.message IS NOT NULL
    AND h.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY h.parent_id, p.name, SUBSTRING(h.message, 1, 100)
ORDER BY occurrence_count DESC
LIMIT 20;
```

## Queue Monitoring

### Check Queue Status

```bash
# List all queue consumers
bin/magento queue:consumers:list

# Check if consumers are running
ps aux | grep queue:consumers:start

# View queue message counts
mysql> SELECT
    q.name as queue_name,
    COUNT(*) as message_count,
    SUM(CASE WHEN qms.status = 4 THEN 1 ELSE 0 END) as new,
    SUM(CASE WHEN qms.status = 5 THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN qms.status = 6 THEN 1 ELSE 0 END) as complete,
    SUM(CASE WHEN qms.status = 7 THEN 1 ELSE 0 END) as error
FROM queue_message qm
JOIN queue q ON q.id = qm.id
JOIN queue_message_status qms ON qm.id = qms.message_id
WHERE q.name LIKE '%plenty%'
GROUP BY q.name;
```

### Monitor Queue Depth

```sql
-- Queue depth by topic (status: 4=new, 5=in_progress, 6=complete, 7=error)
SELECT
    qm.topic_name,
    CASE qms.status
        WHEN 4 THEN 'new'
        WHEN 5 THEN 'in_progress'
        WHEN 6 THEN 'complete'
        WHEN 7 THEN 'error'
        ELSE 'unknown'
    END as status_name,
    COUNT(*) as message_count
FROM queue_message qm
JOIN queue_message_status qms ON qm.id = qms.message_id
WHERE qm.topic_name LIKE 'plenty%'
GROUP BY qm.topic_name, qms.status
ORDER BY qm.topic_name, qms.status;

-- Stuck messages (in_progress status)
SELECT
    qm.topic_name,
    COUNT(*) as stuck_messages
FROM queue_message qm
JOIN queue_message_status qms ON qm.id = qms.message_id
WHERE qms.status = 5
    AND qm.topic_name LIKE 'plenty%'
GROUP BY qm.topic_name
HAVING stuck_messages > 0;
```

### Queue Performance Metrics

```bash
# Monitor queue processing rate
watch -n 5 'mysql -e "SELECT qm.topic_name, qms.status, COUNT(*) as count FROM queue_message qm JOIN queue_message_status qms ON qm.id = qms.message_id WHERE qm.topic_name LIKE \"plenty%\" GROUP BY qm.topic_name, qms.status;"'

# Check consumer logs
tail -f var/log/system.log | grep Consumer

# Monitor supervisor status (if using supervisor)
sudo supervisorctl status | grep plenty
```

## Cron Job Monitoring

### Check Cron Schedule

```sql
-- View cron schedule for Plenty profiles
SELECT
    job_code,
    status,
    scheduled_at,
    executed_at,
    finished_at,
    messages
FROM cron_schedule
WHERE job_code LIKE '%plenty%'
ORDER BY scheduled_at DESC
LIMIT 20;

-- Cron execution success rate
SELECT
    job_code,
    status,
    COUNT(*) as count,
    MIN(scheduled_at) as first_run,
    MAX(scheduled_at) as last_run
FROM cron_schedule
WHERE job_code LIKE '%plenty%'
    AND scheduled_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY job_code, status
ORDER BY job_code, status;

-- Failed cron jobs
SELECT
    job_code,
    scheduled_at,
    executed_at,
    finished_at,
    messages
FROM cron_schedule
WHERE job_code LIKE '%plenty%'
    AND status = 'error'
    AND scheduled_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY scheduled_at DESC;
```

### Monitor Cron Execution

```bash
# Watch cron log in real-time
tail -f var/log/cron.log

# Check last cron run
ls -lht var/log/cron.log | head -1

# Manually trigger cron
bin/magento cron:run

# Check for stuck cron jobs
mysql> SELECT * FROM cron_schedule WHERE status = 'running' AND scheduled_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

## Alerting and Notifications

### Admin Notification System

Mage2Plenty includes a comprehensive notification system accessible via the Admin panel:

**Access:** **System → Profile Notifications**

Features:
- Real-time notification grid with severity levels
- Process execution summaries with performance metrics
- Email alerts for critical errors
- Bulk actions (mark as read, delete)
- Detailed notification filtering and search
- Keyboard shortcuts for efficiency

:::tip Admin UI Guide
For complete Admin UI documentation, see **[Admin Notification System](/docs/monitoring/admin-notifications)**.
:::

### Email Notifications

Configure email alerts via CLI:

```bash
# Enable email notifications
bin/magento config:set softcommerce_profile_notification/email/enabled 1

# Set recipient email(s) - comma-separated for multiple
bin/magento config:set softcommerce_profile_notification/email/recipient "admin@example.com,devops@example.com"

# Set email sender identity
bin/magento config:set softcommerce_profile_notification/email/sender general

# Set minimum severity threshold (debug, notice, warning, error, critical)
bin/magento config:set softcommerce_profile_notification/email/threshold error

# Enable immediate critical alerts
bin/magento config:set softcommerce_profile_notification/email/real_time_critical 1

# Enable batch summary emails
bin/magento config:set softcommerce_profile_notification/email/batch_enabled 1

# Set batch interval in minutes
bin/magento config:set softcommerce_profile_notification/email/batch_interval 60

bin/magento cache:flush
```

**Test email notifications:**

```bash
# Send batch emails manually
bin/magento softcommerce:notification:send-batch-emails

# Preview without sending
bin/magento softcommerce:notification:send-batch-emails --preview

# Send only critical notifications
bin/magento softcommerce:notification:send-batch-emails --severity=critical
```

### Custom Alert Scripts

Create custom monitoring scripts:

```bash
#!/bin/bash
# /usr/local/bin/monitor-plenty-profiles.sh

# Check for failed profiles in last hour
FAILED=$(mysql -sN -e "SELECT COUNT(*) FROM softcommerce_profile_history WHERE status IN ('error', 'failed') AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR);")

if [ "$FAILED" -gt 0 ]; then
    # Send alert
    echo "⚠️ $FAILED profile(s) failed in the last hour" | mail -s "Plenty Profile Alert" admin@example.com
fi

# Check for stuck queue messages
STUCK=$(mysql -sN -e "SELECT COUNT(*) FROM queue_message qm JOIN queue_message_status qms ON qm.id = qms.message_id WHERE qm.topic_name LIKE 'plenty%' AND qms.status = 5;")

if [ "$STUCK" -gt 0 ]; then
    echo "⚠️ $STUCK stuck queue message(s) detected" | mail -s "Plenty Queue Alert" admin@example.com
fi
```

Schedule the monitoring script:

```bash
# Add to crontab
*/15 * * * * /usr/local/bin/monitor-plenty-profiles.sh
```

## Dashboard and Reporting

### Create Monitoring Dashboard

Build a simple monitoring dashboard:

```php
// app/code/Custom/PlentyMonitor/Block/Dashboard.php
public function getProfileStats()
{
    return [
        'total_profiles' => $this->getProfileCount(),
        'active_profiles' => $this->getActiveProfileCount(),
        'last_24h_executions' => $this->getExecutionCount(24),
        'last_24h_failures' => $this->getFailureCount(24),
        'queue_depth' => $this->getQueueDepth(),
        'avg_execution_time' => $this->getAverageExecutionTime()
    ];
}
```

### Generate Performance Reports

```bash
# Daily execution summary
mysql> SELECT
    DATE(created_at) as date,
    COUNT(*) as total_executions,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN status IN ('error', 'failed') THEN 1 ELSE 0 END) as failed,
    AVG(TIMESTAMPDIFF(SECOND, created_at, updated_at)) as avg_duration_seconds
FROM softcommerce_profile_history
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;

# Weekly summary email
bin/magento plenty:profile:weekly-report --email=admin@example.com
```

### Export Metrics for External Tools

```bash
# Export to CSV
mysql -e "SELECT * FROM softcommerce_profile_history WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);" \
    -B | sed 's/\t/,/g' > profile_history.csv

# Export to JSON
mysql -e "SELECT * FROM softcommerce_profile_history WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);" \
    -B | python3 -c "import sys, csv, json; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin, delimiter='\t')]))" \
    > profile_history.json
```

## Performance Optimization

### Identify Slow Profiles

```sql
-- Profiles with longest average execution time
SELECT
    p.entity_id,
    p.name,
    p.type_id,
    COUNT(*) as executions,
    AVG(TIMESTAMPDIFF(MINUTE, h.created_at, h.updated_at)) as avg_minutes,
    MAX(TIMESTAMPDIFF(MINUTE, h.created_at, h.updated_at)) as max_minutes
FROM softcommerce_profile_entity p
JOIN softcommerce_profile_history h ON p.entity_id = h.parent_id
WHERE h.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND h.status = 'success'
GROUP BY p.entity_id
HAVING avg_minutes > 10
ORDER BY avg_minutes DESC;
```

### Optimization Actions

Based on monitoring data:

1. **Reduce batch size** if execution time > expected
2. **Increase batch size** if throughput < expected and execution time is good
3. **Add more queue consumers** if queue depth constantly high
4. **Adjust schedule frequency** if overlap detected
5. **Enable caching** if same data fetched repeatedly
6. **Review filters** if processing unnecessary entities

## Maintenance Tasks

### Daily Checks

```bash
#!/bin/bash
# Daily profile health check

echo "=== Profile Executions (Last 24h) ==="
mysql -t -e "SELECT status, COUNT(*) as count FROM softcommerce_profile_history WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY status;"

echo "=== Queue Status ==="
mysql -t -e "SELECT CASE qms.status WHEN 4 THEN 'new' WHEN 5 THEN 'in_progress' WHEN 6 THEN 'complete' WHEN 7 THEN 'error' ELSE 'unknown' END as status_name, COUNT(*) as count FROM queue_message qm JOIN queue_message_status qms ON qm.id = qms.message_id WHERE qm.topic_name LIKE 'plenty%' GROUP BY qms.status;"

echo "=== Recent Failures ==="
mysql -t -e "SELECT parent_id as profile_id, created_at, SUBSTRING(message, 1, 100) as error FROM softcommerce_profile_history WHERE status IN ('error', 'failed') AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) ORDER BY created_at DESC LIMIT 5;"
```

### Weekly Maintenance

```bash
# Clean old profile history (older than 90 days)
mysql -e "DELETE FROM softcommerce_profile_history WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);"

# Clean completed queue messages
mysql -e "DELETE qm FROM queue_message qm JOIN queue_message_status qms ON qm.id = qms.message_id WHERE qms.status = 6;"

# Optimize tables
mysql -e "OPTIMIZE TABLE softcommerce_profile_history;"
mysql -e "OPTIMIZE TABLE queue_message;"

# Review and archive logs
find var/log/plenty_*.log -mtime +30 -exec gzip {} \;
find var/log/plenty_*.log.gz -mtime +90 -exec rm {} \;
```

### Monthly Review

- Review profile execution trends
- Analyze performance changes
- Identify optimization opportunities
- Update documentation with findings
- Plan capacity adjustments if needed

## Troubleshooting Based on Monitoring

### High Error Rate

**If error rate > 5%:**

1. Check error messages:
   ```sql
   SELECT message, COUNT(*) FROM softcommerce_profile_history WHERE status = 'error' GROUP BY message;
   ```

2. Review logs for patterns
3. Test problematic profiles manually
4. Check API connectivity and rate limits

### Increasing Execution Time

**If execution time trending upward:**

1. Compare current vs baseline metrics
2. Check data volume growth
3. Review API performance
4. Analyze database query performance
5. Consider scaling resources

### Queue Buildup

**If queue depth constantly increasing:**

1. Increase number of consumers
2. Optimize profile batch sizes
3. Review schedule frequency
4. Check for stuck messages
5. Monitor consumer health

## Best Practices

1. **Monitor Proactively:**
   - Set up automated alerts
   - Review dashboards daily
   - Analyze trends weekly

2. **Maintain Baselines:**
   - Document normal performance metrics
   - Track changes over time
   - Identify anomalies quickly

3. **Keep History:**
   - Retain 90 days of execution history
   - Archive older data
   - Use for trend analysis

4. **Document Issues:**
   - Log all incidents
   - Document resolutions
   - Build knowledge base

5. **Regular Reviews:**
   - Weekly performance review
   - Monthly optimization review
   - Quarterly capacity planning

## Related Documentation

- **[API Performance Monitoring](/docs/monitoring/api-performance)** - Monitor API performance
- **[Address Data Integrity](/docs/monitoring/address-data-integrity)** - Audit address sync issues
- **[Profile Scheduling](/docs/profiles/scheduling)** - Schedule profiles
- **[Profile Issues](/docs/troubleshooting/profile-issues)** - Troubleshoot profiles
- **[Common Issues](/docs/troubleshooting/common-issues)** - General troubleshooting

---

**Pro Tip:** Set up a simple monitoring dashboard that shows key metrics at a glance: success rate, average execution time, queue depth, and recent errors. Review it every morning to catch issues early.

---
sidebar_position: 1
title: API Performance Monitoring
description: Monitor and optimize PlentyONE API performance
---

# API Performance Monitoring

Effective API performance monitoring ensures reliable synchronization between Magento and PlentyONE. This guide covers monitoring tools, metrics, and optimization strategies.

## Key Performance Metrics

### Response Time Metrics

| Metric | Good | Acceptable | Poor | Action Required |
|--------|------|------------|------|-----------------|
| Token Request | < 500ms | < 1s | > 1s | Check authentication |
| Single Item GET | < 200ms | < 500ms | > 500ms | Optimize query |
| Bulk Item GET (100) | < 2s | < 5s | > 5s | Reduce batch size |
| Item POST/PUT | < 500ms | < 1s | > 1s | Simplify payload |
| Order POST | < 1s | < 2s | > 2s | Check related entities |

### Throughput Metrics

| Operation | Expected Rate | Description |
|-----------|---------------|-------------|
| Item Import | 100-500 items/min | Depends on complexity |
| Order Export | 50-200 orders/min | Includes customer/address |
| Stock Update | 500-1000 items/min | Simple updates |
| Price Update | 200-500 items/min | Multiple price types |

### Rate Limit Metrics

PlentyONE enforces rate limits to ensure system stability:

- **Standard Limit:** 1000 requests per 5 minutes per user
- **Burst Limit:** 200 requests per minute
- **Per-endpoint Limits:** Vary by endpoint complexity

## Monitoring API Performance

### Enable API Performance Logging

```bash
# Enable API performance logging
bin/magento config:set plenty/log_config/is_active 1
bin/magento config:set plenty/log_config/log_level info
bin/magento config:set plenty/log_config/log_api_performance 1
bin/magento cache:flush
```

### View API Logs

```bash
# Monitor API requests in real-time
tail -f var/log/plenty_api.log

# View API performance metrics
tail -f var/log/plenty_api_performance.log

# Filter by slow requests (> 1 second)
grep -E "duration\":[1-9][0-9]{3}" var/log/plenty_api_performance.log
```

### API Log Format

```json
{
  "timestamp": "2025-01-13 14:30:45",
  "method": "GET",
  "endpoint": "/rest/items/100",
  "duration_ms": 345,
  "status_code": 200,
  "request_size": 0,
  "response_size": 2048,
  "rate_limit_remaining": 945,
  "rate_limit_reset": "2025-01-13 14:35:00"
}
```

## Analyzing API Performance

### Identify Slow Endpoints

```bash
# Find slowest API calls (last 24 hours)
grep "duration_ms" var/log/plenty_api_performance.log | \
  awk -F'duration_ms":' '{print $2}' | \
  awk -F',' '{print $1}' | \
  sort -rn | head -20

# Count requests by endpoint
grep "endpoint" var/log/plenty_api_performance.log | \
  awk -F'endpoint":"' '{print $2}' | \
  awk -F'"' '{print $1}' | \
  sort | uniq -c | sort -rn
```

### Detect Rate Limiting

```bash
# Check for 429 Too Many Requests errors
grep "429" var/log/plenty_api.log

# Monitor rate limit headers
grep "rate_limit_remaining" var/log/plenty_api_performance.log | \
  awk -F'rate_limit_remaining":' '{print $2}' | \
  awk -F',' '{print $1}' | \
  sort -n
```

### Analyze Request Patterns

```bash
# Requests per minute
grep "timestamp" var/log/plenty_api_performance.log | \
  awk -F'timestamp":"' '{print $2}' | \
  awk -F':' '{print $1":"$2}' | \
  uniq -c

# Average response time by hour
grep "2025-01-13 14:" var/log/plenty_api_performance.log | \
  awk -F'duration_ms":' '{print $2}' | \
  awk -F',' '{sum+=$1; count++} END {print sum/count}'
```

## Performance Optimization Strategies

### 1. Request Optimization

#### Reduce Payload Size

Only request fields you need:

```php
// Instead of fetching all fields
$url = '/rest/items/100';

// Specify only required fields
$url = '/rest/items/100?with[]=texts&with[]=variations.base&lang=en';
```

**Configuration:**
- **SoftCommerce → Profiles → Manage Profiles → [Profile]**
- **Configuration → API Configuration**
- Configure `fields_to_fetch` to include only necessary fields

#### Use Appropriate Filters

```bash
# Instead of fetching all items then filtering
bin/magento plenty:item:collect

# Fetch only updated items
bin/magento plenty:item:collect --date-updated="2025-01-13"

# Fetch specific category
bin/magento plenty:item:collect --category=10
```

#### Enable Compression

```bash
# Enable gzip compression for API requests
bin/magento config:set plenty/client_config/use_compression 1
bin/magento cache:flush
```

**Benefits:**
- Reduces response size by 60-80%
- Faster data transfer
- Lower bandwidth costs

### 2. Batch Size Optimization

#### Find Optimal Batch Size

Test different batch sizes to find the sweet spot:

```bash
# Test small batch
time bin/magento config:set plenty_profile/1/collection_size 50 && \
  bin/magento plenty:item:import

# Test medium batch
time bin/magento config:set plenty_profile/1/collection_size 100 && \
  bin/magento plenty:item:import

# Test large batch
time bin/magento config:set plenty_profile/1/collection_size 200 && \
  bin/magento plenty:item:import
```

**Recommendations:**

| Data Complexity | Recommended Batch Size |
|-----------------|------------------------|
| Simple items (no variations) | 200-500 |
| Complex items (with variations) | 100-200 |
| Items with images | 50-100 |
| Orders with multiple items | 50-100 |
| Stock updates only | 500-1000 |

#### Dynamic Batch Sizing

Implement adaptive batch sizes based on response times:

```php
// In profile configuration
'batch_config' => [
    'min_size' => 50,
    'max_size' => 500,
    'target_duration_ms' => 2000,  // Adjust batch to hit 2s per request
    'auto_adjust' => true
]
```

### 3. Caching Strategies

#### Cache Configuration Data

```bash
# Cache collected configuration
bin/magento config:set plenty/cache_config/enabled 1
bin/magento config:set plenty/cache_config/lifetime 3600  # 1 hour
bin/magento cache:flush
```

**Cacheable data:**
- Referrers
- Shipping profiles
- VAT configurations
- Web stores
- Warehouses
- Payment methods

#### Cache Entity Mappings

```php
// Use Redis for mapping cache
'mapping_cache' => [
    'backend' => 'redis',
    'backend_options' => [
        'server' => '127.0.0.1',
        'port' => 6379,
        'database' => 3
    ],
    'lifetime' => 86400  // 24 hours
]
```

### 4. Connection Optimization

#### Persistent Connections

Enable HTTP keep-alive for API connections:

```bash
bin/magento config:set plenty/client_config/persistent_connection 1
bin/magento cache:flush
```

**Benefits:**
- Reduces connection overhead
- Faster subsequent requests
- Lower latency

#### Connection Pooling

For high-volume operations, use connection pooling:

```php
'connection_pool' => [
    'enabled' => true,
    'pool_size' => 5,
    'max_connections' => 10,
    'connection_timeout' => 30
]
```

#### Optimize DNS Resolution

```bash
# Add PlentyONE domain to /etc/hosts to avoid DNS lookups
echo "93.184.216.34 your-domain.plentymarkets-cloud01.com" >> /etc/hosts
```

### 5. Parallel Processing

#### Queue-Based Parallel Processing

```bash
# Start multiple consumers for parallel processing
for i in {1..5}; do
    bin/magento queue:consumers:start plentyItemImportConsumer --max-messages=200 &
done
```

**Configuration:**
```ini
[program:magento_plenty_item_import]
command=/usr/bin/php /var/www/magento/bin/magento queue:consumers:start plentyItemImportConsumer
process_name=%(program_name)s_%(process_num)02d
numprocs=5
autostart=true
autorestart=true
```

#### Concurrent API Requests

Enable concurrent requests when supported:

```php
'concurrent_requests' => [
    'enabled' => true,
    'max_concurrent' => 3,
    'wait_timeout' => 30
]
```

**Warning:** Be mindful of rate limits when using concurrency.

## Rate Limit Management

### Monitor Rate Limits

```bash
# Real-time rate limit monitoring
tail -f var/log/plenty_api_performance.log | grep "rate_limit"

# Alert when rate limit < 100 requests remaining
watch -n 5 'tail -1 var/log/plenty_api_performance.log | grep -o "rate_limit_remaining\":[0-9]*" | cut -d: -f2'
```

### Implement Rate Limit Backoff

```php
'rate_limit' => [
    'enabled' => true,
    'threshold' => 100,        // Start slowing at 100 requests remaining
    'backoff_strategy' => 'exponential',
    'initial_delay_ms' => 100,
    'max_delay_ms' => 5000
]
```

### Respect Rate Limit Headers

The system automatically respects rate limit headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 945
X-RateLimit-Reset: 1673622900
```

When limits are approached:
1. Requests automatically slow down
2. Batch sizes reduce
3. Delays introduced between requests

### Schedule Around Rate Limits

```bash
# Distribute load throughout the day
# High-priority: Order export every 5 minutes
*/5 * * * * /usr/bin/php /path/bin/magento plenty:order:export

# Medium-priority: Stock sync every 15 minutes
*/15 * * * * /usr/bin/php /path/bin/magento plenty:stock:import

# Low-priority: Product sync every 2 hours
0 */2 * * * /usr/bin/php /path/bin/magento plenty:item:import

# Bulk operations: Off-peak hours only (2-6 AM)
0 2 * * * /usr/bin/php /path/bin/magento plenty:item:import-all
```

## Performance Monitoring Tools

### Built-in Performance Reports

```bash
# Generate API performance report
bin/magento plenty:api:performance-report --from="2025-01-01" --to="2025-01-31"

# Output:
# ╔══════════════════════════════════════════════════════════╗
# ║          API Performance Report (Jan 2025)               ║
# ╠══════════════════════════════════════════════════════════╣
# ║ Total Requests:           125,432                        ║
# ║ Average Response Time:    342ms                          ║
# ║ Slowest Endpoint:         /rest/items/{id} (1,245ms)    ║
# ║ 95th Percentile:          890ms                          ║
# ║ 99th Percentile:          1,456ms                        ║
# ║ Rate Limit Violations:    3                              ║
# ║ Failed Requests:          12 (0.01%)                     ║
# ╚══════════════════════════════════════════════════════════╝
```

### Database Queries for Analysis

```sql
-- Average API response time by endpoint (from custom logging table)
SELECT
    endpoint,
    COUNT(*) as request_count,
    AVG(duration_ms) as avg_duration,
    MIN(duration_ms) as min_duration,
    MAX(duration_ms) as max_duration,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration
FROM api_performance_log
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY endpoint
ORDER BY avg_duration DESC;

-- Requests over time (hourly)
SELECT
    DATE_FORMAT(created_at, '%Y-%m-%d %H:00') as hour,
    COUNT(*) as request_count,
    AVG(duration_ms) as avg_duration
FROM api_performance_log
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY hour
ORDER BY hour;

-- Rate limit violations
SELECT
    DATE(created_at) as date,
    COUNT(*) as violations
FROM api_performance_log
WHERE status_code = 429
GROUP BY date
ORDER BY date DESC;
```

### External Monitoring Tools

#### New Relic Integration

```php
// config.php or env.php
'newrelic' => [
    'enabled' => true,
    'app_name' => 'Magento PlentyONE Integration',
    'track_api_calls' => true
]
```

#### Grafana + Prometheus

Export metrics to Prometheus:

```bash
# Install Prometheus exporter
composer require promphp/prometheus_client_php

# Configure metrics endpoint
# http://your-magento.com/plenty/metrics
```

**Example Grafana Dashboard Metrics:**
- API request rate (requests/min)
- Average response time
- Error rate
- Rate limit usage
- Profile execution time

#### DataDog Integration

```bash
# Install DataDog PHP agent
curl -L https://install.datadoghq.com/scripts/install_script.sh | DD_API_KEY=<your_key> bash

# Tag API calls
bin/magento config:set plenty/monitoring/datadog_enabled 1
```

## Performance Alerts

### Configure Email Alerts

```bash
# Enable performance alerts
bin/magento config:set plenty/monitoring/alerts_enabled 1
bin/magento config:set plenty/monitoring/alert_email admin@example.com

# Alert thresholds
bin/magento config:set plenty/monitoring/slow_request_threshold 2000  # 2 seconds
bin/magento config:set plenty/monitoring/error_rate_threshold 5       # 5%
bin/magento config:set plenty/monitoring/rate_limit_threshold 100     # 100 remaining
```

### Slack/Discord Webhooks

```bash
# Configure webhook
bin/magento config:set plenty/monitoring/webhook_url https://hooks.slack.com/services/YOUR/WEBHOOK/URL
bin/magento config:set plenty/monitoring/webhook_enabled 1
```

**Alert triggers:**
- Response time > threshold
- Error rate > threshold
- Rate limit < threshold
- API connection failures

## Troubleshooting Slow Performance

### Common Performance Issues

#### Issue: Slow Item Import

**Symptoms:**
- Item import takes > 1 minute per item
- High API response times

**Solutions:**

1. **Reduce requested data:**
   ```bash
   # Configure profile to fetch only essential fields
   # Exclude images if not needed
   # Exclude unused variations
   ```

2. **Check network latency:**
   ```bash
   # Test latency to PlentyONE
   ping your-domain.plentymarkets-cloud01.com

   # Traceroute to identify slow hops
   traceroute your-domain.plentymarkets-cloud01.com
   ```

3. **Enable compression:**
   ```bash
   bin/magento config:set plenty/client_config/use_compression 1
   ```

#### Issue: Rate Limit Constantly Hit

**Symptoms:**
- Frequent 429 errors
- Synchronization pauses frequently

**Solutions:**

1. **Reduce request frequency:**
   ```bash
   # Increase batch size (fewer requests total)
   bin/magento config:set plenty_profile/1/collection_size 200

   # Add delays between batches
   bin/magento config:set plenty_profile/1/batch_delay_ms 500
   ```

2. **Distribute load:**
   ```bash
   # Spread syncs throughout the day instead of all at once
   ```

3. **Optimize filters:**
   ```bash
   # Only fetch changed entities
   bin/magento plenty:item:collect --date-updated="$(date +%Y-%m-%d)"
   ```

#### Issue: Intermittent Timeouts

**Symptoms:**
- Random timeout errors
- Some requests fast, others timeout

**Solutions:**

1. **Increase timeout:**
   ```bash
   bin/magento config:set plenty/client_config/timeout 300
   ```

2. **Enable retries:**
   ```bash
   bin/magento config:set plenty/client_config/retry_enabled 1
   bin/magento config:set plenty/client_config/retry_attempts 3
   ```

3. **Check PlentyONE system status:**
   - Visit PlentyONE status page
   - Contact support if persistent

## Best Practices

1. **Monitor continuously:**
   - Set up automated performance monitoring
   - Review metrics weekly
   - Track trends over time

2. **Optimize proactively:**
   - Test configuration changes in staging
   - Benchmark before and after optimizations
   - Document performance improvements

3. **Respect rate limits:**
   - Never try to circumvent rate limits
   - Distribute load appropriately
   - Plan for peak usage

4. **Cache aggressively:**
   - Cache configuration data
   - Cache entity mappings
   - Use Redis for better performance

5. **Schedule wisely:**
   - Run heavy operations off-peak
   - Stagger different profiles
   - Monitor system load

6. **Keep logs manageable:**
   - Rotate logs regularly
   - Archive old performance data
   - Clean up after analysis

## Related Documentation

- **[Profile Monitoring](/docs/monitoring/profiles)** - Monitor profile execution
- **[API Errors](/docs/troubleshooting/api-errors)** - API error reference
- **[Profile Scheduling](/docs/profiles/scheduling)** - Schedule profiles
- **[Common Issues](/docs/troubleshooting/common-issues)** - General troubleshooting

---

**Pro Tip:** Implement a performance baseline when you first set up the integration. Measure and document typical response times, throughput, and resource usage. This baseline helps identify performance degradation early.
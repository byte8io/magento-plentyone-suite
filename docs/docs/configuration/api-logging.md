---
sidebar_position: 4
title: API Logging Configuration
description: Configure REST API logging for different module types (Products, Orders, Categories, Stock, Customers)
---

# API Logging Configuration

API Logging Configuration allows you to enable granular logging for REST API communications between Magento and PlentyONE for different entity types. This is essential for debugging, monitoring, and troubleshooting synchronization issues.

## Overview

Mage2Plenty provides separate API logging controls for each major module:

- **Attribute** - Product and category attributes
- **Category** - Category structure and data
- **Customer** - Customer accounts and addresses
- **Item** - Products and variants
- **Log** - System logging and diagnostics
- **Order** - Order synchronization
- **Property** - PlentyONE property mappings
- **Stock** - Inventory and stock levels

Each module can have its own logging configuration, allowing you to enable detailed logging only for specific areas you're troubleshooting.

## Accessing API Logging Configuration

1. Log in to your Magento Admin panel
2. Navigate to **Stores → Configuration**
3. In the left panel, expand **Byte8**
4. Select **PlentyONE Integration**
5. Scroll to the specific module section (e.g., "Item REST API Settings", "Order REST API Settings")

:::tip Navigation Path
**Stores → Configuration → Byte8 → PlentyONE Integration → [Module] REST API Settings**
:::

## Common Configuration Options

All module-specific API logging sections share the same configuration structure:

### Log REST API

**Field Pattern**: `is_active_api_log`
**Path Pattern**: `plenty/[module]_config/is_active_api_log`
**Type**: Yes/No
**Default**: No
**Scope**: Global

Enables or disables REST API request/response logging for the specific module.

**What Gets Logged**:
- Complete API request URLs
- Request headers (including authentication tokens)
- Request body (JSON payload)
- Response headers
- Response body (JSON data)
- Response time and status codes
- Timestamps for each API call

**Log File Locations**:
```
var/log/plenty/
├── api.log                    # Main API log (all modules)
├── api_attribute.log          # Attribute-specific logging
├── api_category.log           # Category-specific logging
├── api_customer.log           # Customer-specific logging
├── api_item.log              # Item/product-specific logging
├── api_order.log             # Order-specific logging
├── api_property.log          # Property-specific logging
└── api_stock.log             # Stock-specific logging
```

:::warning Performance Impact
Enabling API logging increases disk I/O and log file sizes. Only enable for modules you're actively troubleshooting, and disable when not needed.
:::

### Log Contents

**Field Pattern**: `api_log_content_filter`
**Path Pattern**: `plenty/[module]_config/api_log_content_filter`
**Type**: Multiselect
**Scope**: Global
**Depends on**: `is_active_api_log` = Yes

Specifies which parts of API communication should be logged.

**Available Options**:

| Option | What It Logs | Use Case |
|--------|--------------|----------|
| **Request URL** | Full API endpoint URL with parameters | Track which endpoints are being called |
| **Request Headers** | HTTP headers including auth tokens | Debug authentication issues |
| **Request Body** | Complete request payload (JSON) | Inspect data being sent to PlentyONE |
| **Response Headers** | HTTP response headers | Check rate limits, content types |
| **Response Body** | Complete response payload (JSON) | Analyze data received from PlentyONE |
| **Response Status** | HTTP status codes (200, 404, 500, etc.) | Identify API errors quickly |

**Common Configurations**:

```bash
# Minimal logging (errors only)
- Response Status

# Standard debugging
- Request URL
- Response Status
- Response Body

# Full debugging (development)
- Request URL
- Request Headers
- Request Body
- Response Headers
- Response Body
- Response Status

# Authentication debugging
- Request URL
- Request Headers
- Response Headers
- Response Status
```

:::tip Selective Logging
For production environments, log only Request URL and Response Status to minimize performance impact while maintaining basic monitoring capabilities.
:::

## Module-Specific Configuration

### Attribute REST API Settings

**Configuration Path**: `plenty/attribute_config`
**Sort Order**: 10

Controls logging for product and category attribute synchronization.

**When to Enable**:
- Troubleshooting attribute mapping issues
- Debugging attribute value synchronization
- Investigating missing or incorrect attribute data
- Testing new attribute mappings

**Configuration Example**:

```bash
# Enable attribute API logging
bin/magento config:set plenty/attribute_config/is_active_api_log 1

# Log request URL, body, and response status
bin/magento config:set plenty/attribute_config/api_log_content_filter "request_url,request_body,response_status,response_body"

# Clear cache
bin/magento cache:flush
```

**Sample Log Output**:

```
[2025-10-12 14:30:45] API REQUEST: GET https://api.plentymarkets.com/rest/items/properties
[2025-10-12 14:30:45] Request Body: {"propertyId":[123,456,789]}
[2025-10-12 14:30:46] Response Status: 200 OK
[2025-10-12 14:30:46] Response Body: [{"id":123,"names":[{"name":"Color"}]},...]
```

### Category REST API Settings

**Configuration Path**: `plenty/category_config`
**Sort Order**: 20

Controls logging for category structure and data synchronization.

**When to Enable**:
- Troubleshooting category hierarchy issues
- Debugging category name translations
- Investigating missing categories
- Testing category import/export

**Configuration Example**:

```bash
# Enable category API logging
bin/magento config:set plenty/category_config/is_active_api_log 1

# Log URLs and response data
bin/magento config:set plenty/category_config/api_log_content_filter "request_url,response_body,response_status"

# Clear cache
bin/magento cache:flush
```

**Common Issues Logged**:
- Category not found in PlentyONE
- Parent category ID mismatch
- Translation/name synchronization errors
- Category tree structure inconsistencies

### Customer REST API Settings

**Configuration Path**: `plenty/customer_config`
**Sort Order**: 30

Controls logging for customer account and address synchronization.

**When to Enable**:
- Debugging customer account creation
- Troubleshooting address validation
- Investigating customer group mapping
- Testing guest checkout handling

**Configuration Example**:

```bash
# Enable customer API logging
bin/magento config:set plenty/customer_config/is_active_api_log 1

# Full logging for customer debugging
bin/magento config:set plenty/customer_config/api_log_content_filter "request_url,request_body,response_body,response_status"

# Clear cache
bin/magento cache:flush
```

:::caution Privacy Considerations
Customer API logs contain personally identifiable information (PII) including names, addresses, email addresses, and phone numbers. Ensure logs are secured and comply with GDPR/privacy regulations.
:::

**PII in Logs**:
- Customer names
- Email addresses
- Physical addresses
- Phone numbers
- Customer IDs

**Recommendations**:
1. Enable customer logging only when necessary
2. Disable after troubleshooting
3. Implement log rotation with short retention
4. Restrict file permissions: `chmod 600 var/log/plenty/api_customer.log`
5. Consider log encryption for compliance

### Item REST API Settings

**Configuration Path**: `plenty/item_config`
**Sort Order**: 40

Controls logging for product/item synchronization (the most frequently used logging).

**When to Enable**:
- Debugging product import/export
- Troubleshooting price synchronization
- Investigating image upload issues
- Testing variant creation
- Analyzing API performance

**Configuration Example**:

```bash
# Enable item API logging
bin/magento config:set plenty/item_config/is_active_api_log 1

# Standard product debugging
bin/magento config:set plenty/item_config/api_log_content_filter "request_url,response_status,response_body"

# Clear cache
bin/magento cache:flush
```

**High-Volume Warning**:

Product synchronization generates the most API calls. A typical product import profile might make:
- 1 API call to fetch item list
- 10-100 API calls to fetch individual item details
- 50-500 API calls for variations
- 100-1000 API calls for images and media

With logging enabled, this can generate **10-100 MB of logs per sync** in high-volume stores.

:::danger Disk Space
Product API logging can consume significant disk space. Monitor `var/log/plenty/` directory size and implement log rotation.
:::

### Log REST API Settings

**Configuration Path**: `plenty/log_config`
**Sort Order**: 50

Controls logging for system log and diagnostic API calls.

**When to Enable**:
- Debugging system-level API issues
- Troubleshooting authentication problems
- Testing API connection
- Investigating rate limiting

**Configuration Example**:

```bash
# Enable log API logging
bin/magento config:set plenty/log_config/is_active_api_log 1
bin/magento config:set plenty/log_config/api_log_content_filter "request_url,response_status"
bin/magento cache:flush
```

### Order REST API Settings

**Configuration Path**: `plenty/order_config`
**Sort Order**: 60

Controls logging for order export and status synchronization.

**When to Enable**:
- Debugging order export failures
- Troubleshooting order status updates
- Investigating payment/shipping method mapping
- Testing order cancellation flow

**Configuration Example**:

```bash
# Enable order API logging
bin/magento config:set plenty/order_config/is_active_api_log 1

# Full order debugging
bin/magento config:set plenty/order_config/api_log_content_filter "request_url,request_body,response_body,response_status"

# Clear cache
bin/magento cache:flush
```

**Critical Order Issues**:
- Order not created in PlentyONE
- Payment method not recognized
- Shipping address validation failure
- Tax calculation mismatch
- Order status not updating

:::warning Sensitive Data
Order logs contain sensitive information including customer data, payment methods, and order totals. Handle with care.
:::

### Property REST API Settings

**Configuration Path**: `plenty/property_config`
**Sort Order**: 70

Controls logging for PlentyONE property mapping and synchronization.

**When to Enable**:
- Debugging property mapping configuration
- Troubleshooting property value assignments
- Testing custom property creation
- Investigating property group issues

**Configuration Example**:

```bash
# Enable property API logging
bin/magento config:set plenty/property_config/is_active_api_log 1
bin/magento config:set plenty/property_config/api_log_content_filter "request_url,response_body,response_status"
bin/magento cache:flush
```

### Stock REST API Settings

**Configuration Path**: `plenty/stock_config`
**Sort Order**: 80

Controls logging for inventory and stock level synchronization.

**When to Enable**:
- Debugging stock import issues
- Troubleshooting Multi-Source Inventory (MSI)
- Investigating warehouse mapping
- Testing real-time stock updates

**Configuration Example**:

```bash
# Enable stock API logging
bin/magento config:set plenty/stock_config/is_active_api_log 1

# Standard stock debugging
bin/magento config:set plenty/stock_config/api_log_content_filter "request_url,response_body,response_status"

# Clear cache
bin/magento cache:flush
```

**High-Frequency Updates**:

Stock synchronization can run very frequently (every 5-15 minutes). This generates substantial log volume:

```
Example: 1000 products, stock sync every 15 minutes
= 96 syncs per day
= 96,000 API calls per day
= Potential 1-10 GB of logs per day with full logging
```

:::caution Performance
For stock logging, use minimal content filter (Request URL + Response Status only) or disable entirely in production unless actively troubleshooting.
:::

## Best Practices

### Development Environment

Enable comprehensive logging for all modules:

```bash
# Enable all module logging with full details
for module in attribute category customer item log order property stock; do
    bin/magento config:set plenty/${module}_config/is_active_api_log 1
    bin/magento config:set plenty/${module}_config/api_log_content_filter "request_url,request_headers,request_body,response_headers,response_body,response_status"
done

bin/magento cache:flush
```

### Staging Environment

Enable selective logging for testing:

```bash
# Enable logging for entities being tested
bin/magento config:set plenty/item_config/is_active_api_log 1
bin/magento config:set plenty/item_config/api_log_content_filter "request_url,request_body,response_body,response_status"

bin/magento config:set plenty/order_config/is_active_api_log 1
bin/magento config:set plenty/order_config/api_log_content_filter "request_url,response_status"

bin/magento cache:flush
```

### Production Environment

Minimal logging or disabled unless troubleshooting:

```bash
# Disable all API logging by default
for module in attribute category customer item log order property stock; do
    bin/magento config:set plenty/${module}_config/is_active_api_log 0
done

# OR: Enable minimal logging (URLs and status only)
for module in attribute category customer item log order property stock; do
    bin/magento config:set plenty/${module}_config/is_active_api_log 1
    bin/magento config:set plenty/${module}_config/api_log_content_filter "request_url,response_status"
done

bin/magento cache:flush
```

## Analyzing API Logs

### Viewing Recent Logs

```bash
# View last 100 lines of item API log
tail -100 var/log/plenty/api_item.log

# View all errors (HTTP 4xx, 5xx)
grep -E "(HTTP/[0-9\.]+ [45][0-9]{2}|Error|Failed)" var/log/plenty/api_item.log

# Count API calls by endpoint
grep "API REQUEST" var/log/plenty/api_item.log | cut -d' ' -f4 | sort | uniq -c | sort -rn

# View API calls in last hour
grep "$(date -d '1 hour ago' '+%Y-%m-%d %H')" var/log/plenty/api_item.log
```

### Identifying Performance Issues

```bash
# Find slow API calls (response time > 5 seconds)
grep -B2 "Response time: [5-9]\|Response time: [0-9]\{2,\}" var/log/plenty/api.log

# Count errors by type
grep "Error" var/log/plenty/api.log | cut -d':' -f3 | sort | uniq -c | sort -rn

# Find authentication failures
grep -i "auth\|401\|403" var/log/plenty/api.log
```

### Common Error Patterns

**Authentication Errors** (401, 403):
```
[ERROR] API REQUEST: GET https://api.plentymarkets.com/rest/items/123
[ERROR] Response Status: 401 Unauthorized
[ERROR] Response Body: {"error":"invalid_token"}
```

**Not Found Errors** (404):
```
[ERROR] API REQUEST: GET https://api.plentymarkets.com/rest/items/999999
[ERROR] Response Status: 404 Not Found
[ERROR] Response Body: {"error":"Item not found"}
```

**Rate Limiting** (429):
```
[ERROR] API REQUEST: POST https://api.plentymarkets.com/rest/items
[ERROR] Response Status: 429 Too Many Requests
[ERROR] Response Headers: Retry-After: 60
```

**Server Errors** (500, 502, 503):
```
[ERROR] API REQUEST: POST https://api.plentymarkets.com/rest/orders
[ERROR] Response Status: 503 Service Unavailable
[ERROR] Response Body: {"error":"Service temporarily unavailable"}
```

## Log Rotation and Cleanup

### Automatic Log Rotation

If you enabled log rotation in [Core Configuration](/docs/configuration/core-configuration#enable-log-rotation), API logs are automatically rotated:

```
var/log/plenty/
├── api_item.log              # Current
├── api_item.log.1.gz         # Yesterday
├── api_item.log.2.gz         # 2 days ago
└── api_item.log.7.gz         # 7 days ago (oldest kept)
```

### Manual Cleanup

```bash
# Remove logs older than 7 days
find var/log/plenty/ -name "*.log*" -mtime +7 -delete

# Archive logs before deletion
tar -czf api_logs_backup_$(date +%Y%m%d).tar.gz var/log/plenty/api*.log
find var/log/plenty/ -name "*.log" -mtime +7 -delete

# Clear all API logs (caution!)
rm -f var/log/plenty/api*.log
```

### Monitor Disk Usage

```bash
# Check log directory size
du -sh var/log/plenty/

# Find largest log files
find var/log/plenty/ -type f -exec ls -lh {} \; | sort -k5 -hr | head -10

# Set up monitoring alert (example with cron)
# Alert if log directory exceeds 1GB
0 * * * * [ $(du -s /var/www/magento/var/log/plenty/ | cut -f1) -gt 1048576 ] && echo "PlentyONE logs exceeding 1GB" | mail -s "Log Alert" admin@example.com
```

## Security Considerations

### Protecting API Logs

API logs contain sensitive information. Implement these security measures:

**1. File Permissions**:
```bash
# Restrict access to logs
chmod 700 var/log/plenty/
chmod 600 var/log/plenty/*.log

# Set ownership
chown -R www-data:www-data var/log/plenty/
```

**2. Web Server Protection**:

Add to `.htaccess` or nginx config:
```apache
# Apache
<DirectoryMatch "^.*/var/log">
    Require all denied
</DirectoryMatch>
```

```nginx
# Nginx
location ~* ^/var/log {
    deny all;
}
```

**3. Exclude from Version Control**:
```bash
# Add to .gitignore
var/log/plenty/*.log
var/log/plenty/*.log.*
```

**4. Regular Cleanup**:
```bash
# Implement automated cleanup
0 2 * * * find /var/www/magento/var/log/plenty/ -name "*.log*" -mtime +7 -delete
```

## Troubleshooting

### API Logs Not Being Created

**Problem**: Logging enabled but no log files generated

**Solutions**:
1. Verify logging is enabled: `bin/magento config:show plenty/item_config/is_active_api_log`
2. Check directory permissions: `ls -la var/log/plenty/`
3. Create directory if missing: `mkdir -p var/log/byte8/plenty && chmod 777 var/log/byte8/plenty`
4. Check PHP error logs: `tail -f var/log/system.log`
5. Verify profile is running: `bin/magento byte8:profile:list`

### Log Files Too Large

**Problem**: Log files growing to GB sizes

**Solutions**:
1. Enable log rotation in [Core Configuration](/docs/configuration/core-configuration#enable-log-rotation)
2. Reduce log content filter (remove request_body, response_body)
3. Disable logging for high-frequency modules (stock, item)
4. Implement manual cleanup cron job
5. Use external log management (Logstash, Splunk)

### Cannot Read Log Files

**Problem**: Permission denied when accessing logs

**Solutions**:
1. Check file permissions: `ls -l var/log/plenty/`
2. Adjust permissions: `chmod 644 var/log/plenty/*.log`
3. Verify ownership: `chown www-data:www-data var/log/plenty/*`
4. Use sudo if necessary: `sudo tail -f var/log/plenty/api.log`

## Performance Impact

### Logging Overhead by Configuration

| Configuration | Disk I/O | File Size Impact | CPU Impact | Recommended For |
|--------------|----------|------------------|------------|-----------------|
| Disabled | None | None | None | Production (normal) |
| URL + Status only | Minimal | 1x | Minimal | Production (monitoring) |
| + Response Body | Low | 10-50x | Low | Staging/debugging |
| + Request Body | Medium | 20-100x | Low | Development |
| Full logging | High | 50-200x | Medium | Development only |

### Recommendations by Store Size

| Store Size | Products | Orders/Day | Recommended Logging |
|-----------|----------|------------|-------------------|
| Small | < 1,000 | < 100 | Minimal or disabled |
| Medium | 1,000-10,000 | 100-1,000 | URL + Status only |
| Large | 10,000-50,000 | 1,000-5,000 | Disabled (enable for specific troubleshooting) |
| Enterprise | 50,000+ | 5,000+ | Disabled (use external monitoring) |

## Next Steps

Now that you've configured API logging:

1. 📊 **[Profile Configuration](/docs/configuration/profile-configuration)** - Configure profile settings
2. 🔧 **[Create Profiles](/docs/profiles/create-profile)** - Set up synchronization profiles
3. 🧪 **[Test Connection](/docs/testing/connection-test)** - Verify API connectivity
4. 📈 **[Monitor Performance](/docs/monitoring/api-performance)** - Track API performance metrics

## Related Documentation

- [Configuration Overview](/docs/configuration/overview)
- [Core Configuration](/docs/configuration/core-configuration)
- [Client Configuration](/docs/configuration/client-configuration)
- [Troubleshooting API Issues](/docs/troubleshooting/api-errors)
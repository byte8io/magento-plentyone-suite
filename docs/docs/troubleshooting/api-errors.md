---
sidebar_position: 2
title: API Errors Reference
description: Comprehensive guide to PlentyONE API errors and solutions
---

# API Errors Reference

This guide provides detailed information about PlentyONE API errors you may encounter and how to resolve them.

## HTTP Status Codes

### 400 Bad Request

**Meaning:** The request was malformed or contains invalid data.

**Common Causes:**
- Invalid JSON payload
- Missing required fields
- Invalid data types
- Field validation failures

**Example Error:**
```json
{
  "error": {
    "code": 400,
    "message": "Validation failed",
    "validation_errors": [
      {
        "field": "quantity",
        "message": "Must be a positive integer"
      }
    ]
  }
}
```

**Solutions:**

1. **Check request payload:**
   ```bash
   # Enable API debug logging
   bin/magento config:set plenty/log_config/is_active_debug 1
   bin/magento config:set plenty/log_config/log_level debug

   # View API request/response
   tail -f var/log/plenty_api.log
   ```

2. **Validate data before sending:**
   - Ensure all required fields are present
   - Check data types match API requirements
   - Verify field values are within acceptable ranges

3. **Common field validation issues:**
   - **Prices:** Must be positive decimals
   - **Quantities:** Must be positive integers
   - **Dates:** Must be in ISO 8601 format (YYYY-MM-DD)
   - **IDs:** Must be valid integers

### 401 Unauthorized

**Meaning:** Authentication failed or access token is invalid/expired.

**Common Causes:**
- Invalid username or password
- Expired access token
- User account disabled
- Missing API permissions

**Solutions:**

1. **Verify credentials:**
   ```bash
   bin/magento config:show plenty/client_config/username
   bin/magento config:show plenty/client_config/url
   ```

2. **Test authentication:**
   ```bash
   bin/magento plenty:client:test
   ```

3. **Refresh access token:**
   ```bash
   bin/magento plenty:client:token --refresh
   ```

4. **Update credentials:**
   ```bash
   bin/magento config:set plenty/client_config/username "your-username"
   bin/magento config:set plenty/client_config/password "your-password" --lock-env
   bin/magento cache:flush
   ```

5. **Check user permissions in PlentyONE:**
   - Navigate to **Setup → Settings → User → Accounts**
   - Verify user has **API access** enabled
   - Ensure user account is **active**
   - Check user has required permissions for the operations

### 403 Forbidden

**Meaning:** Authenticated successfully but lacks permission for the requested resource.

**Common Causes:**
- Insufficient user permissions
- IP address not whitelisted
- API endpoint access restricted
- Resource ownership mismatch

**Solutions:**

1. **Check API user permissions:**
   - In PlentyONE: **Setup → Settings → User → Accounts**
   - Verify user has appropriate rights for:
     - Item management
     - Order management
     - Customer management
     - Property management

2. **Verify IP whitelist:**
   - Check if PlentyONE has IP restrictions
   - Add your server IP to whitelist if required

3. **Contact system administrator:**
   - May require elevated permissions
   - Check if resource access is restricted by policy

### 404 Not Found

**Meaning:** The requested resource does not exist.

**Common Causes:**
- Invalid entity ID
- Entity deleted in PlentyONE
- Incorrect API endpoint
- Wrong base URL

**Example Errors:**
```
Error: Item with ID 12345 not found
Error: Order with ID 67890 does not exist
Error: Property with ID 100 not found
```

**Solutions:**

1. **Verify entity exists in PlentyONE:**
   - Log into PlentyONE backend
   - Search for the entity by ID
   - Check if it was deleted or archived

2. **Check API endpoint:**
   ```bash
   # Verify base URL
   bin/magento config:show plenty/client_config/url
   # Should be: https://your-domain.plentymarkets-cloud01.com
   ```

3. **For product import issues:**
   ```bash
   # Verify item exists
   bin/magento plenty:item:collect -i 12345 --verbose

   # If item doesn't exist, create in PlentyONE first
   ```

4. **Check entity mapping:**
   ```sql
   -- Check if entity is mapped
   SELECT * FROM softcommerce_plenty_item_relation WHERE plenty_item_id = 12345;
   SELECT * FROM softcommerce_plenty_order_relation WHERE plenty_order_id = 67890;
   ```

### 422 Unprocessable Entity

**Meaning:** Request is well-formed but contains semantic errors or business rule violations.

**Common Causes:**
- Business logic validation failures
- Duplicate entity creation
- Referential integrity violations
- Invalid state transitions

**Example Errors:**
```json
{
  "error": {
    "code": 422,
    "message": "Cannot create duplicate barcode",
    "details": {
      "barcode": "12345678",
      "existing_item_id": 100
    }
  }
}
```

**Solutions:**

1. **Check for duplicates:**
   ```bash
   # For items with duplicate SKU
   mysql> SELECT * FROM catalog_product_entity WHERE sku = 'YOUR-SKU';

   # Check PlentyONE for existing records
   bin/magento plenty:item:collect --sku=YOUR-SKU
   ```

2. **Verify referential integrity:**
   - Ensure referenced entities exist (categories, attributes, etc.)
   - Check foreign key relationships

3. **Review business rules:**
   - Some operations require specific prerequisites
   - Example: Can't export order without valid customer

### 429 Too Many Requests

**Meaning:** Rate limit exceeded.

**PlentyONE Rate Limits:**
- **Standard:** 1000 requests per 5 minutes per user
- **Peak hours:** May be reduced to 500 requests per 5 minutes
- **Per endpoint:** Some endpoints have stricter limits

**Solutions:**

1. **Implement rate limiting in profiles:**
   ```php
   // Profile configuration
   'rate_limit' => [
       'enabled' => true,
       'max_requests' => 200,      // Per minute
       'retry_after' => 60,        // Seconds
       'exponential_backoff' => true
   ]
   ```

2. **Reduce batch sizes:**
   - Navigate to profile configuration
   - Reduce `collection_size` and `page_size`
   - Example: From 500 to 100 items per batch

3. **Schedule operations off-peak:**
   ```bash
   # Schedule large syncs during off-peak hours (e.g., 2 AM)
   0 2 * * * /usr/bin/php /path/bin/magento plenty:item:import
   ```

4. **Use queue-based processing:**
   ```bash
   # Process items asynchronously
   bin/magento queue:consumers:start plentyItemExportConsumer --max-messages=100
   ```

5. **Monitor rate limit headers:**
   ```bash
   # Check API logs for rate limit info
   tail -f var/log/plenty_api.log | grep "X-RateLimit"
   ```

### 500 Internal Server Error

**Meaning:** PlentyONE server encountered an unexpected error.

**Common Causes:**
- PlentyONE system issue
- Database timeout
- Invalid data causing server crash
- System maintenance

**Solutions:**

1. **Check PlentyONE status:**
   - Visit PlentyONE status page
   - Check for scheduled maintenance
   - Contact PlentyONE support if persistent

2. **Retry the request:**
   ```bash
   # Automatic retry is built-in, but you can manually retry
   bin/magento plenty:item:export --sku=YOUR-SKU --verbose
   ```

3. **Simplify the request:**
   - Reduce batch size
   - Process single entity to isolate issue
   - Remove optional fields

4. **Contact PlentyONE support with:**
   - Timestamp of error
   - Request ID (from error response)
   - API endpoint accessed
   - Request payload (sanitized)

### 502 Bad Gateway / 503 Service Unavailable

**Meaning:** PlentyONE service is temporarily unavailable.

**Common Causes:**
- System maintenance
- Server overload
- Network issues between your server and PlentyONE
- CDN/proxy issues

**Solutions:**

1. **Wait and retry:**
   - Profile execution includes automatic retry logic
   - Default: 3 retry attempts with exponential backoff

2. **Check PlentyONE status:**
   - Visit status page or support portal
   - Check for maintenance notifications

3. **Verify network connectivity:**
   ```bash
   # Test connectivity
   curl -I https://your-domain.plentymarkets-cloud01.com
   ping your-domain.plentymarkets-cloud01.com
   ```

4. **Adjust timeout settings:**
   ```bash
   # Increase timeout in profile configuration
   bin/magento config:set plenty/client_config/timeout 120
   ```

### 504 Gateway Timeout

**Meaning:** PlentyONE did not respond within the timeout period.

**Common Causes:**
- Long-running query
- Large data set processing
- PlentyONE system under heavy load
- Network latency

**Solutions:**

1. **Increase timeout:**
   ```bash
   # Set higher timeout (in seconds)
   bin/magento config:set plenty/client_config/timeout 300
   bin/magento cache:flush
   ```

2. **Reduce batch size:**
   - Process smaller batches
   - Use pagination more effectively

3. **Optimize filters:**
   ```bash
   # Instead of fetching all items
   bin/magento plenty:item:collect

   # Fetch specific date range
   bin/magento plenty:item:collect --date-updated="2025-01-01/2025-01-31"
   ```

## API-Specific Errors

### Item/Product Errors

#### "Variation not found"

**Cause:** Attempting to update/access a variation that doesn't exist.

**Solution:**
```bash
# Verify variation exists
bin/magento plenty:item:collect -i <item_id> --verbose

# Check variation mappings
mysql> SELECT * FROM softcommerce_plenty_item_variation_relation WHERE plenty_item_id = <item_id>;
```

#### "Main variation required"

**Cause:** Creating item without a main variation.

**Solution:**
- Every item must have at least one main variation
- Ensure main variation is created first
- Check item export includes main variation data

#### "Price not found for web store"

**Cause:** Price configuration missing for target web store.

**Solution:**
1. Configure prices in PlentyONE for all web stores
2. Verify price mapping in profile configuration
3. Ensure sales prices are activated for web store

### Order Errors

#### "Referrer not found"

**Cause:** Order referrer (source) not configured.

**Solution:**
```bash
# Create Magento referrer if not exists
bin/magento plenty:setup:create --type=referrer

# Verify referrer in profile config
# SoftCommerce → Profiles → Manage Profiles → [Order Profile] → Configuration
# Set Order Referrer to "magento"
```

#### "Payment not created"

**Cause:** Failed to create payment record in PlentyONE.

**Solution:**
1. Check payment method mapping in profile
2. Verify payment method exists in PlentyONE
3. Ensure payment amount matches order total

#### "Contact required"

**Cause:** Order export requires associated customer/contact.

**Solution:**
```bash
# Export customer first
bin/magento plenty:customer:export --id=<customer_id>

# Then export order
bin/magento plenty:order:export -i <order_id>
```

### Stock Errors

#### "Warehouse not found"

**Cause:** Warehouse ID in configuration doesn't exist in PlentyONE.

**Solution:**
1. Verify warehouse configuration:
   ```bash
   bin/magento plenty:stock:setup:collect --verbose
   ```
2. Update profile configuration with correct warehouse ID
3. Map Magento sources to PlentyONE warehouses

#### "Stock type invalid"

**Cause:** Invalid stock type specified.

**Valid stock types:**
- `1` - Physical stock
- `2` - Reserved stock
- `3` - Net stock (physical - reserved)

**Solution:**
Update profile configuration to use valid stock type.

### Category Errors

#### "Category tree limit exceeded"

**Cause:** Category hierarchy too deep (PlentyONE limit: 6 levels).

**Solution:**
1. Flatten Magento category structure
2. Use category mapping to skip intermediate levels
3. Combine multiple Magento categories into one PlentyONE category

#### "Category name translation missing"

**Cause:** Category name not provided for required locale.

**Solution:**
- Ensure all category names are translated in Magento
- Configure store-to-locale mapping in profile
- Provide default fallback locale

## Debugging API Errors

### Enable Debug Logging

```bash
# Enable debug mode
bin/magento config:set plenty/log_config/is_active_debug 1
bin/magento config:set plenty/log_config/log_level debug
bin/magento cache:flush
```

### View API Logs

```bash
# API request/response logs
tail -f var/log/plenty_api.log

# API errors only
tail -f var/log/plenty_api_error.log

# Filter by specific endpoint
tail -f var/log/plenty_api.log | grep "/rest/items"
```

### Analyze API Requests

```bash
# View last 50 lines of API log
tail -n 50 var/log/plenty_api.log

# Search for specific error
grep "401 Unauthorized" var/log/plenty_api.log

# View requests for specific SKU
grep "TEST-SKU-001" var/log/plenty_api.log
```

### Test API Endpoints Directly

Use curl to test endpoints outside of Magento:

```bash
# 1. Get access token
TOKEN=$(curl -X POST https://your-domain.plentymarkets-cloud01.com/rest/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your-user","password":"your-pass"}' \
  | jq -r '.accessToken')

# 2. Test item endpoint
curl -X GET https://your-domain.plentymarkets-cloud01.com/rest/items/100 \
  -H "Authorization: Bearer $TOKEN"

# 3. Test order endpoint
curl -X GET https://your-domain.plentymarkets-cloud01.com/rest/orders/12345 \
  -H "Authorization: Bearer $TOKEN"
```

## Common Error Patterns

### Authentication Loop

**Symptoms:**
- Continuous 401 errors
- Token refresh fails repeatedly
- "Invalid credentials" despite correct password

**Causes:**
- Password recently changed
- User account locked
- Multiple failed login attempts

**Solutions:**
1. Reset password in PlentyONE
2. Wait 15 minutes if account locked
3. Clear stored tokens:
   ```bash
   bin/magento config:set plenty/client_config/access_token ""
   bin/magento config:set plenty/client_config/refresh_token ""
   bin/magento cache:flush
   ```

### Intermittent 404 Errors

**Symptoms:**
- Entity found sometimes, not found other times
- Works manually but fails in cron

**Causes:**
- Entity recently deleted
- Asynchronous PlentyONE updates
- Caching issues

**Solutions:**
1. Add retry logic with delay
2. Verify entity exists before operations
3. Check PlentyONE replication status

### Data Validation Failures

**Symptoms:**
- 400 or 422 errors with validation messages
- "Required field missing" errors
- Data type mismatch errors

**Solutions:**
1. Enable verbose mode to see exact validation errors:
   ```bash
   bin/magento plenty:item:export --sku=TEST-SKU --verbose
   ```

2. Check data transformation in logs
3. Validate data in Magento before export
4. Review field mapping in profile configuration

## Getting Help

If you can't resolve an API error:

1. **Collect diagnostic information:**
   ```bash
   # System check
   bin/magento plenty:system:check > system-check.log

   # Recent API logs
   tail -n 500 var/log/plenty_api.log > api-logs.txt
   tail -n 500 var/log/plenty_api_error.log > api-errors.txt
   ```

2. **Document the error:**
   - Exact error message
   - HTTP status code
   - Timestamp
   - Request details (endpoint, method, payload)
   - Steps to reproduce

3. **Contact support with:**
   - System check output
   - Relevant log excerpts
   - Error documentation
   - Profile configuration (sanitized)

## Related Documentation

- **[Connection Testing](/docs/testing/connection-test)** - Test API connectivity
- **[Common Issues](/docs/troubleshooting/common-issues)** - General troubleshooting
- **[Order Issues](/docs/troubleshooting/order-issues)** - Order-specific problems
- **[Profile Issues](/docs/troubleshooting/profile-issues)** - Profile execution problems

---

**Pro Tip:** Always enable debug logging when troubleshooting API issues. The detailed request/response logs are invaluable for identifying the root cause.
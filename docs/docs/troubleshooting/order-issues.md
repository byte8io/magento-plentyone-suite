---
sidebar_position: 3
title: Order Synchronization Issues
description: Troubleshoot order import and export problems
---

# Order Synchronization Issues

This guide covers common issues specific to order synchronization between Magento and PlentyONE.

## Order Export Issues (Magento → PlentyONE)

### Issue: Order Export Fails with "Customer Not Found"

**Symptoms:**
```
Error: Cannot export order #000000123
Customer with ID 456 not found in PlentyONE
```

**Cause:** Customer doesn't exist in PlentyONE yet.

**Solution:**

```bash
# 1. Export customer first
bin/magento plenty:customer:export --id=456 --verbose

# 2. Verify customer export succeeded
mysql> SELECT * FROM plenty_customer_relation WHERE magento_customer_id = 456;

# 3. Retry order export
bin/magento plenty:order:export -i 123 --verbose
```

**Prevention:**
- Enable automatic customer export on order creation
- Configure customer export profile to run before order export in cron schedule

### Issue: "Payment Method Not Mapped"

**Symptoms:**
```
Error: Payment method 'checkmo' is not mapped to PlentyONE payment method
Cannot create payment record
```

**Cause:** Payment method mapping not configured in profile.

**Solution:**

1. **Check current mappings:**
   ```bash
   # View profile configuration
   bin/magento profile:config:export --profile=order_export
   ```

2. **Configure mapping via Admin:**
   - Navigate to **Byte8 → Profiles → Manage Profiles**
   - Select your Order Export profile
   - Go to **Configuration → Payment Method Mapping**
   - Map each Magento payment method to PlentyONE payment method

3. **Common payment method mappings:**
   | Magento Method | PlentyONE Method ID |
   |----------------|---------------------|
   | checkmo | 1 (Invoice) |
   | cashondelivery | 2 (Cash on Delivery) |
   | paypal_express | 4 (PayPal) |
   | stripe_payments | 6 (Credit Card) |
   | banktransfer | 5 (Bank Transfer) |

### Issue: "Shipping Method Not Mapped"

**Symptoms:**
```
Error: Shipping method 'flatrate_flatrate' is not mapped
Order export failed
```

**Solution:**

1. **Configure shipping mapping:**
   - **Byte8 → Profiles → Manage Profiles → [Order Export Profile]**
   - **Configuration → Shipping Method Mapping**
   - Map Magento shipping methods to PlentyONE shipping profiles

2. **Get PlentyONE shipping profile IDs:**
   ```bash
   # Collect shipping profiles from PlentyONE
   bin/magento plenty:setup:collect:config --type=shipping --verbose

   # View collected shipping profiles
   mysql> SELECT * FROM plenty_config_shipping_profile;
   ```

3. **Example mappings:**
   | Magento Method | PlentyONE Shipping Profile |
   |----------------|----------------------------|
   | flatrate_flatrate | 1 (Standard Shipping) |
   | tablerate_bestway | 2 (Express Shipping) |
   | freeshipping_freeshipping | 3 (Free Shipping) |

### Issue: "Address Validation Failed"

**Symptoms:**
```
Error: Invalid address data
Required field 'address.countryId' is missing or invalid
```

**Common Causes:**
- Missing country code
- Invalid postal code format
- Missing required address fields (street, city, postcode)

**Solution:**

1. **Validate order address in Magento:**
   ```bash
   # Check order address completeness
   mysql> SELECT * FROM sales_order_address WHERE parent_id = 123;
   ```

2. **Required address fields:**
   - First name & Last name
   - Street address (line 1 minimum)
   - City
   - Postcode/ZIP
   - Country code (ISO 2-letter)
   - Telephone

3. **Fix missing data:**
   ```bash
   # Update order address in Magento first
   # Then retry export
   bin/magento plenty:order:export -i 123 --verbose
   ```

### Issue: Order Items Missing in PlentyONE

**Symptoms:**
- Order created in PlentyONE but has no items
- Order total is 0.00
- "Order items not found" error

**Cause:** Products not exported to PlentyONE yet.

**Solution:**

```bash
# 1. Get product SKUs from order
mysql> SELECT sku FROM sales_order_item WHERE order_id = 123;

# 2. Export each product
bin/magento plenty:item:collect --sku=PRODUCT-SKU
bin/magento plenty:item:export --sku=PRODUCT-SKU --verbose

# 3. Verify product mapping exists
mysql> SELECT * FROM plenty_item_relation WHERE sku = 'PRODUCT-SKU';

# 4. Retry order export
bin/magento plenty:order:export -i 123 --verbose
```

### Issue: Order Reference Inconsistencies

**Symptoms:**
- Order data appears inconsistent between systems
- Order reference mapping issues
- Order relation mapping missing

**Cause:** Order mapping relation not created or cleared.

**Solution:**

```bash
# 1. Check order data integrity
bin/magento plenty:order:check-integrity --skip-collect

# 2. Check if mapping exists
mysql> SELECT * FROM plenty_order_relation WHERE magento_order_id = 123;

# 3. If issues found, review and clean up affected orders
bin/magento plenty:order:delete --id=<affected_plenty_order_id> --verbose

# 4. Recreate order mapping
bin/magento plenty:order:map

# 5. Verify mapping
mysql> SELECT * FROM plenty_order_relation WHERE magento_order_id = 123;
```

### Issue: "Referrer Not Found"

**Symptoms:**
```
Error: Order referrer 'magento' not found
Cannot create order
```

**Cause:** Magento referrer not created in PlentyONE.

**Solution:**

```bash
# Create Magento referrer
bin/magento plenty:setup:create --type=referrer --verbose

# Verify referrer created
mysql> SELECT * FROM plenty_config_referrer WHERE name = 'magento';

# Configure profile to use referrer
# Byte8 → Profiles → Manage Profiles → [Order Export Profile]
# Configuration → Order Configuration → Order Referrer: magento
```

### Issue: Order Export Extremely Slow

**Symptoms:**
- Single order export takes > 30 seconds
- Bulk export times out
- Memory exhaustion on large orders

**Causes:**
- Large number of order items
- Complex product configurations
- API rate limiting
- Insufficient PHP memory

**Solutions:**

1. **Increase PHP memory and timeout:**
   ```bash
   php -d memory_limit=2G -d max_execution_time=300 bin/magento plenty:order:export --status=processing
   ```

2. **Use queue-based processing:**
   ```bash
   # Enable queue processing
   bin/magento queue:consumers:start plentyOrderExportConsumer --max-messages=100
   ```

3. **Process in smaller batches:**
   ```bash
   # Export orders by date range
   bin/magento plenty:order:export --date="2025-01-13"

   # Export specific orders
   bin/magento plenty:order:export -i 123,124,125
   ```

4. **Optimize profile settings:**
   - Reduce batch size in profile configuration
   - Enable gzip compression for API requests
   - Increase API timeout setting

## Order Import Issues (PlentyONE → Magento)

### Issue: Order Status Not Updating

**Symptoms:**
- Order status changed in PlentyONE but not reflected in Magento
- Status import runs without errors but no changes applied
- Old status persists in Magento

**Causes:**
- Status mapping not configured
- Order already in target status
- Order not collected from PlentyONE
- Status transition not allowed by Magento

**Solutions:**

1. **Verify order is collected:**
   ```bash
   # Check if order exists in collection table
   mysql> SELECT * FROM plenty_order WHERE magento_order_id = 123;

   # If not, collect it
   bin/magento plenty:order:collect --date-updated="$(date +%Y-%m-%d)" --verbose
   ```

2. **Check status mapping:**
   - **Byte8 → Profiles → Manage Profiles → [Order Import Profile]**
   - **Configuration → Status Mapping**
   - Ensure PlentyONE statuses are mapped to Magento statuses

3. **Verify status transition is valid:**
   ```bash
   # Check current order status
   mysql> SELECT status, state FROM sales_order WHERE entity_id = 123;

   # Some transitions are not allowed:
   # - complete → processing (can't revert)
   # - closed → pending (can't reopen)
   ```

4. **Force status update:**
   ```bash
   # Re-collect and import
   bin/magento plenty:order:collect --id=<plenty_order_id> --verbose
   bin/magento plenty:order:import --verbose
   ```

5. **Check import logs:**
   ```bash
   tail -f var/log/plenty_order.log | grep "status"
   ```

### Issue: "Order Not Found in Magento"

**Symptoms:**
```
Error: Cannot update order
Magento order with increment ID 000000123 not found
```

**Cause:** Trying to import order that wasn't exported from Magento.

**Solution:**

This is expected behavior. Order import only updates existing Magento orders. It doesn't create new orders from PlentyONE.

**Workflow:**
1. Order created in Magento
2. Order exported to PlentyONE
3. Order status updated in PlentyONE
4. Status imported back to Magento

If you need to create orders in Magento from PlentyONE, this requires custom development.

### Issue: Tracking Information Not Syncing

**Symptoms:**
- Shipment created in PlentyONE
- Tracking number not appearing in Magento
- Customer not receiving tracking emails

**Solution:**

1. **Ensure tracking sync is enabled:**
   - **Byte8 → Profiles → Manage Profiles → [Order Import Profile]**
   - **Configuration → Order Configuration**
   - Enable **Sync Tracking Information**

2. **Collect shipments:**
   ```bash
   # Collect order updates including shipments
   bin/magento plenty:order:collect --date-updated="$(date +%Y-%m-%d)" --verbose

   # Import updates
   bin/magento plenty:order:import --verbose
   ```

3. **Verify tracking in Magento:**
   ```bash
   mysql> SELECT * FROM sales_shipment_track WHERE parent_id IN (
       SELECT entity_id FROM sales_shipment WHERE order_id = 123
   );
   ```

4. **Check carrier mapping:**
   - Ensure PlentyONE carrier codes are mapped to Magento carriers
   - Configure carrier mapping in profile configuration

### Issue: Invoice Not Created

**Symptoms:**
- Invoice created in PlentyONE
- Invoice not synced to Magento
- Payment status not updated

**Cause:** Invoice sync not enabled or invoice already exists.

**Solutions:**

1. **Enable invoice sync:**
   - **Byte8 → Profiles → Manage Profiles → [Order Import Profile]**
   - **Configuration → Order Configuration**
   - Enable **Sync Invoices**

2. **Check if invoice already exists:**
   ```bash
   mysql> SELECT * FROM sales_invoice WHERE order_id = 123;
   ```

3. **Force invoice sync:**
   ```bash
   bin/magento plenty:order:collect --id=<plenty_order_id> --verbose
   bin/magento plenty:order:import --verbose
   ```

## Order Data Integrity Issues

### Issue: Order Totals Mismatch

**Symptoms:**
- Order total in PlentyONE differs from Magento
- Tax calculations don't match
- Shipping costs different

**Causes:**
- Currency conversion issues
- Tax calculation differences
- Discount application order
- Rounding differences

**Solutions:**

1. **Verify tax configuration:**
   - Ensure tax rules match between systems
   - Check tax calculation method (gross vs net)
   - Verify tax rates for customer location

2. **Check discount application:**
   ```bash
   # View order totals breakdown
   mysql> SELECT * FROM sales_order WHERE entity_id = 123;
   mysql> SELECT * FROM sales_order_item WHERE order_id = 123;
   ```

3. **Review currency settings:**
   - Ensure correct currency is configured in profile
   - Check exchange rates if multi-currency

### Issue: Guest Order Export Fails

**Symptoms:**
```
Error: Cannot export guest order
Contact creation failed: Email already exists
```

**Cause:** Guest email matches existing PlentyONE contact.

**Solution:**

1. **Configure guest order handling:**
   - **Byte8 → Profiles → Manage Profiles → [Order Export Profile]**
   - **Configuration → Customer Configuration**
   - Set **Guest Order Handling** to one of:
     - Create new contact with unique email
     - Use default guest contact
     - Link to existing contact by email

2. **Export with verbose logging:**
   ```bash
   bin/magento plenty:order:export -i 123 --verbose
   ```

### Issue: Multi-Address Orders Not Supported

**Symptoms:**
```
Error: Multi-shipping orders are not supported
Cannot export order with multiple shipping addresses
```

**Cause:** PlentyONE doesn't support multiple shipping addresses per order.

**Solution:**

Magento multi-address orders are split into separate orders. Each resulting order can be exported:

```bash
# Export each split order separately
bin/magento plenty:order:export -i 123 --verbose
bin/magento plenty:order:export -i 124 --verbose
```

## Performance and Queue Issues

### Issue: Order Export Queue Stuck

**Symptoms:**
- Orders queued but not processing
- Queue messages in "in_progress" state for hours
- No progress in queue processing

**Solutions:**

1. **Check queue consumers:**
   ```bash
   # List all consumers
   bin/magento queue:consumers:list

   # Check if order export consumer is running
   ps aux | grep plentyOrderExportConsumer
   ```

2. **Restart consumers:**
   ```bash
   # Stop existing consumers
   pkill -f plentyOrderExportConsumer

   # Start fresh consumer
   bin/magento queue:consumers:start plentyOrderExportConsumer --max-messages=1000 &
   ```

3. **Clear stuck messages:**
   ```sql
   -- Reset stuck messages (older than 1 hour)
   UPDATE queue_message
   SET status = 'new'
   WHERE topic_name = 'plenty.order.export'
     AND status = 'in_progress'
     AND updated_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);
   ```

4. **Use supervisor for automatic restarts:**
   ```ini
   [program:magento_plenty_order_export]
   command=/usr/bin/php /var/www/magento/bin/magento queue:consumers:start plentyOrderExportConsumer
   autostart=true
   autorestart=true
   ```

### Issue: High Memory Usage During Order Sync

**Symptoms:**
- PHP memory exhausted errors
- Server slowdown during order sync
- Cron jobs killed by system

**Solutions:**

1. **Increase PHP memory limit:**
   ```ini
   ; php.ini
   memory_limit = 2G
   ```

2. **Process smaller batches:**
   ```bash
   # Instead of all orders
   bin/magento plenty:order:export --date="$(date +%Y-%m-%d)"

   # Split by status
   bin/magento plenty:order:export --status=processing
   bin/magento plenty:order:export --status=pending
   ```

3. **Use queue for async processing:**
   - Reduces memory footprint per execution
   - Allows parallel processing

## Debugging Order Sync

### Enable Order Debug Logging

```bash
# Enable debug mode
bin/magento config:set plenty/log_config/is_active_debug 1
bin/magento config:set plenty/log_config/log_level debug
bin/magento cache:flush
```

### View Order Sync Logs

```bash
# All order operations
tail -f var/log/plenty_order.log

# Order errors only
tail -f var/log/plenty_order_error.log

# Filter by order increment ID
tail -f var/log/plenty_order.log | grep "000000123"

# API calls for orders
tail -f var/log/plenty_api.log | grep "/rest/orders"
```

### Database Inspection

```sql
-- Check order mapping
SELECT * FROM plenty_order_relation
WHERE magento_order_id = 123;

-- Check collected order data
SELECT * FROM plenty_order
WHERE magento_order_id = 123;

-- Check order export queue
SELECT * FROM queue_message
WHERE topic_name = 'plenty.order.export'
AND body LIKE '%123%';

-- View profile execution history
SELECT * FROM byte8_profile_history
WHERE profile_id IN (
    SELECT entity_id FROM byte8_profile
    WHERE type_id LIKE '%order%'
)
ORDER BY created_at DESC
LIMIT 10;
```

### Test Single Order Export

```bash
# Test with maximum verbosity
bin/magento plenty:order:export -i 123 --verbose

# Check each step:
# 1. Order loading
# 2. Customer export/check
# 3. Address validation
# 4. Order items mapping
# 5. Payment creation
# 6. Order creation
# 7. Relation storage
```

## Prevention Best Practices

1. **Always export customers before orders:**
   - Set up customer export profile
   - Schedule it to run before order export

2. **Complete mapping configuration:**
   - Payment methods
   - Shipping methods
   - Order statuses
   - Carriers

3. **Test with single orders first:**
   ```bash
   bin/magento plenty:order:export -i 123 --verbose
   ```

4. **Monitor order sync regularly:**
   ```bash
   # Daily check for failed exports
   bin/magento plenty:profile:history --status=error
   ```

5. **Keep products synced:**
   - Ensure products are exported before orders
   - Run product sync more frequently than order sync

6. **Use queue for real-time exports:**
   - Configure event-based order export
   - Ensure queue consumers are always running

## Getting Help

If order sync issues persist:

1. **Collect information:**
   ```bash
   # Order details
   mysql> SELECT * FROM sales_order WHERE entity_id = 123;

   # Order logs
   tail -n 500 var/log/plenty_order.log > order-logs.txt

   # Profile configuration
   bin/magento profile:config:export --profile=order_export > order-profile.json
   ```

2. **Document the issue:**
   - Order increment ID
   - Error messages
   - Steps to reproduce
   - Profile configuration

3. **Contact support with:**
   - Order details (sanitized)
   - Log excerpts
   - Profile configuration
   - System check output

## Related Documentation

- **[Order Synchronization Testing](/docs/testing/order-synchronization)** - Test order sync
- **[API Errors](/docs/troubleshooting/api-errors)** - API error reference
- **[Common Issues](/docs/troubleshooting/common-issues)** - General troubleshooting
- **[Profile Issues](/docs/troubleshooting/profile-issues)** - Profile execution problems

---

**Pro Tip:** Set up automated monitoring for order sync failures. Configure email notifications or webhooks to alert you immediately when order exports fail, allowing quick resolution before it affects customers.
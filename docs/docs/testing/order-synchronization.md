---
sidebar_position: 3
title: Order Synchronization Testing
description: Test order import and export between Magento and PlentyONE
---

# Order Synchronization Testing

Testing order synchronization is critical to ensure orders flow correctly between Magento and PlentyONE. This guide covers both order export (Magento → PlentyONE) and order import (PlentyONE → Magento).

## Prerequisites

Before testing order synchronization:

1. ✅ **Connection verified** - Run `bin/magento plenty:system:check`
2. ✅ **Initial setup completed** - Run `bin/magento plenty:setup:init`
3. ✅ **Order profiles created** - Create both import and export profiles
4. ✅ **Mappings configured** - Configure status, payment, and shipping mappings

## Order Export Testing (Magento → PlentyONE)

Order export sends Magento orders to PlentyONE for fulfillment.

### Test Single Order Export

Export a specific order by ID:

```bash
# Export by Magento order entity ID
bin/magento plenty:order:export --id=123

# Export by order increment ID (order number)
bin/magento plenty:order:export --increment_id=000000123
```

### Test Multiple Orders

```bash
# Export multiple orders by entity ID
bin/magento plenty:order:export --id=123,124,125

# Export multiple orders by increment ID
bin/magento plenty:order:export --increment_id=000000123,000000124
```

### Export by Date Range

```bash
# Export orders created today
bin/magento plenty:order:export --date="$(date +%Y-%m-%d)"

# Export orders created since specific date
bin/magento plenty:order:export --date="2025-01-01/"

# Export orders created between dates
bin/magento plenty:order:export --date="2025-01-01/2025-01-31"
```

### Export by Status

```bash
# Export only processing orders
bin/magento plenty:order:export --status=processing

# Export complete orders
bin/magento plenty:order:export --status=complete
```

### Successful Export Example

```
Exporting 1 order(s) to PlentyONE...
[============================] 100%

Export Summary:
  000000123: Order 12345 | Contact 67890 | Address 11111 | Payment 22222

Total: 1 orders exported (1 successful, 0 with errors)
```

### Understanding Export Output

Each successful order export creates multiple entities in PlentyONE:

| Entity | Description | Example Output |
|--------|-------------|----------------|
| **Order** | Main order record | `Order 12345` |
| **Contact** | Customer account | `Contact 67890` |
| **Address** | Shipping/billing address | `Address 11111` |
| **Payment** | Payment information | `Payment 22222` |
| **Relations** | Links between entities | `Payment-order relation` |

### Verbose Export Mode

For detailed information about what's happening:

```bash
bin/magento plenty:order:export --id=123 --verbose
```

Verbose mode shows:
- Each step of the export process
- API requests and responses
- Data mapping details
- Validation results

## Order Import Testing (PlentyONE → Magento)

Order import synchronizes status updates from PlentyONE back to Magento.

### Collect Orders from PlentyONE

```bash
# Collect all updated orders
bin/magento plenty:order:collect

# Collect specific order by PlentyONE ID
bin/magento plenty:order:collect --id=12345

# Collect orders updated since specific date
bin/magento plenty:order:collect --date-updated="2025-01-01"

# Collect orders created in date range
bin/magento plenty:order:collect --date-created="2025-01-01/2025-01-31"
```

### Import Collected Orders

After collecting, import the order data:

```bash
# Import all collected orders
bin/magento plenty:order:import

# Import with profile ID
bin/magento plenty:order:import --profile=5
```

### Typical Import Flow

```
1. Collect orders from PlentyONE → Stores in plenty_order_entity table
2. Import collected orders   → Updates Magento order status
```

### Example: Full Order Update Test

```bash
# Step 1: Collect recent updates from PlentyONE
bin/magento plenty:order:collect --date-updated="$(date +%Y-%m-%d)"

# Output:
# Collecting orders by date updated from: 2025-01-13.
# ✓ Collected 5 order(s) from PlentyONE

# Step 2: Import the collected orders
bin/magento plenty:order:import

# Output:
# ✓ Processed 5 orders
# ✓ Updated 3 order statuses
# ⚠ Skipped 2 orders (already in sync)
```

## Testing Order Mapping

### Validate Order Mapping

The order mapping command maps Magento orders to PlentyONE orders by matching increment IDs stored in the `plenty_order_property` metadata field or the `plenty_order_entity.increment_id` column.

```bash
# Map orders by increment ID
bin/magento plenty:order:map --increment-id=000000123

# Map multiple orders by increment ID
bin/magento plenty:order:map --increment-id=000000123,000000124,000000125

# Map orders by Magento entity ID
bin/magento plenty:order:map --entity-id=456

# Map orders by date range
bin/magento plenty:order:map --date-from="2025-01-01" --date-to="2025-01-13"

# Combine filters
bin/magento plenty:order:map --date-from="2025-01-01" --increment-id=000000123
```

**Important:** At least one filter is required to prevent accidental bulk operations.

This command:
- Maps Magento `sales_order.increment_id` to PlentyONE order external order ID
- Updates `sales_order.plenty_order_id` with the matched PlentyONE order entity ID
- Processes orders in batches of 50
- Refreshes order grid after updates

## Common Test Scenarios

### Scenario 1: New Order End-to-End Test

**Objective:** Test complete flow from order creation to export

```bash
# 1. Create test order in Magento (via admin or storefront)

# 2. Export the order
bin/magento plenty:order:export --increment_id=000000123 --verbose

# 3. Verify in PlentyONE backend
# Navigate to Orders → Order UI → Search for order

# 4. Update order status in PlentyONE (e.g., mark as shipped)

# 5. Collect and import updates back to Magento
bin/magento plenty:order:collect --date-updated="$(date +%Y-%m-%d)"
bin/magento plenty:order:import

# 6. Verify status updated in Magento Admin
```

### Scenario 2: Bulk Order Export

**Objective:** Test exporting multiple orders at once

```bash
# Export all processing orders
bin/magento plenty:order:export --status=processing

# Monitor output for any errors
# Check PlentyONE for all orders
```

### Scenario 3: Order Update Sync

**Objective:** Test status updates flow from PlentyONE to Magento

```bash
# 1. Change order status in PlentyONE (e.g., Shipped → Delivered)

# 2. Collect updates
bin/magento plenty:order:collect --date-updated="$(date +%Y-%m-%d)"

# 3. Import updates
bin/magento plenty:order:import

# 4. Verify status change in Magento
bin/magento sales:order:status --increment_id=000000123
```

## Troubleshooting Order Sync

### Issue: Order Export Fails with "Missing Required Field"

**Common causes:**
- Missing payment method mapping
- Missing shipping method mapping
- Missing order status mapping

**Solution:**
```bash
# Check mappings in profile configuration
# Admin → Plenty Profiles → [Order Export Profile] → Mappings

# Or export config
bin/magento profile:export:config --profile=order_export
```

### Issue: Customer Not Found During Export

**Cause:** Customer doesn't exist in PlentyONE

**Solution:**
```bash
# Export customer first
bin/magento plenty:customer:export --id=<customer_id>

# Then retry order export
bin/magento plenty:order:export --increment_id=000000123
```

### Issue: Order Import Not Updating Status

**Common causes:**
- Status mapping not configured
- Order already in target status
- Order not collected from PlentyONE

**Debugging:**
```bash
# Check if order is in collection table (by Magento order ID)
mysql> SELECT * FROM plenty_order_entity WHERE order_id=123;

# Or check by increment ID
mysql> SELECT * FROM plenty_order_entity WHERE increment_id='000000123';

# Check profile logs
tail -f var/log/plenty_order.log

# Re-collect with verbose mode
bin/magento plenty:order:collect --id=<plenty_order_id> --verbose
```

### Issue: Order Reference Inconsistencies

**Cause:** Order mapping relation not created

**Solution:**
```bash
# Check order data integrity
bin/magento plenty:order:check-integrity --skip-collect

# Re-map orders with date filter
bin/magento plenty:order:map --date-from="2025-01-01" --date-to="2025-01-13"

# Verify mapping in plenty_order_entity table
mysql> SELECT entity_id, order_id, increment_id, status FROM plenty_order_entity;

# Check if Magento orders have plenty_order_id set
mysql> SELECT entity_id, increment_id, plenty_order_id FROM sales_order WHERE plenty_order_id IS NOT NULL;
```

## Order Validation

Validate orders before export:

```bash
# Validate specific order
bin/magento plenty:order:validate --id=123

# Validates:
# ✓ Required fields present
# ✓ Customer exists
# ✓ Products available
# ✓ Mappings configured
# ✓ Valid payment/shipping methods
```

## Automated Testing with Cron

Once manual testing is successful, enable automated sync:

```bash
# Check cron configuration
bin/magento cron:install

# Verify cron jobs are configured
crontab -l | grep plenty

# Monitor cron execution
tail -f var/log/cron.log
```

## Performance Testing

### Test Large Order Batches

```bash
# Export 100 orders
bin/magento plenty:order:export --date="$(date -d '7 days ago' +%Y-%m-%d)/" --verbose

# Monitor:
# - Execution time
# - Memory usage
# - Error rate
```

Expected performance:
- **Single order export:** < 5 seconds
- **Batch (10 orders):** < 30 seconds
- **Batch (100 orders):** < 5 minutes

### Optimize for Large Volumes

If processing is slow:

```bash
# Enable queue processing
bin/magento queue:consumers:start plentyOrderExportConsumer --max-messages=100

# Check queue status
bin/magento queue:consumers:list
```

## Monitoring Order Sync

### Check Sync History

```bash
# View recent order sync history
bin/magento plenty:profile:history --profile=order_export --limit=10

# Check for errors
bin/magento plenty:profile:history --profile=order_export --status=error
```

### View Order Logs

```
var/log/plenty_order.log        # All order operations
var/log/plenty_order_error.log  # Order sync errors
var/log/plenty_api.log          # API communication
```

## Best Practices for Testing

1. **Start Small:** Test with 1-2 orders before bulk operations
2. **Use Test Orders:** Create test orders specifically for testing
3. **Verify in Both Systems:** Always check both Magento and PlentyONE
4. **Monitor Logs:** Keep an eye on log files during testing
5. **Test Edge Cases:** Test orders with:
   - Multiple products
   - Virtual products
   - Bundle products
   - Special characters in names
   - Guest checkouts
   - Various payment methods

## Next Steps

After successful order synchronization testing:

- ✅ **[Configure Automation](/docs/profiles/scheduling)** - Set up cron jobs
- ✅ **[Monitor Performance](/docs/monitoring/profiles)** - Track sync metrics
- ✅ **[Troubleshooting Guide](/docs/troubleshooting/order-issues)** - Common order issues

## Related Commands

```bash
# Order Export
bin/magento plenty:order:export [--id|--increment_id|--date|--status] [-p profile_id]

# Order Import (Collect from PlentyONE)
bin/magento plenty:order:collect [--id|--date-created|--date-updated] [-p profile_id]

# Order Import (Process Collected)
bin/magento plenty:order:import [-p profile_id]

# Order Validation
bin/magento plenty:order:validate --id=<order_id>

# Order Mapping
bin/magento plenty:order:map [--increment-id|--entity-id|--date-from|--date-to]

# Delete Test Order (from PlentyONE)
bin/magento plenty:order:delete --id=<plenty_order_id>

# Delete Test Payment
bin/magento plenty:order:payment:delete --id=<payment_id>
```

---

**Pro Tip:** Use `--verbose` flag during testing to see detailed information about the synchronization process.
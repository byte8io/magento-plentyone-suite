---
sidebar_position: 4
title: Address Data Integrity
description: Audit and resolve address synchronization issues between Magento and PlentyONE
---

# Address Data Integrity

This guide covers tools for auditing and maintaining address data consistency between Magento and PlentyONE. These diagnostic commands help identify and resolve address assignment issues proactively.

## Overview

The Mage2Plenty connector stores address references using the `external_address_id` option in PlentyONE addresses. This links PlentyONE addresses back to their corresponding Magento address records.

**Potential issues these tools detect:**

| Issue Type | Description | Impact |
|------------|-------------|--------|
| **ID Collision** | Same ID exists in both `customer_address_entity` and `sales_order_address` | Wrong address data linked |
| **Contact Mismatch** | Customer address book contains references to wrong customer | Address displayed for wrong customer |
| **Order Mismatch** | Order linked to wrong address in PlentyONE | Incorrect shipping/billing on order |

## Audit Commands

### Address Audit

Comprehensive diagnostic to identify address mismatches between Magento and PlentyONE.

```bash
bin/magento plenty:order:audit-addresses
```

#### Audit Types

Run all audits (default):

```bash
bin/magento plenty:order:audit-addresses --all
```

Run specific audits:

```bash
# Check for ID collisions between customer and order address tables
bin/magento plenty:order:audit-addresses --collision-range

# Audit address→contact relations (customer address books)
bin/magento plenty:order:audit-addresses --contact-relations

# Audit address→order relations (order addresses)
bin/magento plenty:order:audit-addresses --order-relations
```

#### Filter Options

Filter by specific order:

```bash
# By Magento order increment ID
bin/magento plenty:order:audit-addresses --increment-id=000139782

# By PlentyONE order ID
bin/magento plenty:order:audit-addresses --plenty-order-id=107579
```

Filter by date range:

```bash
# Orders from a specific date
bin/magento plenty:order:audit-addresses --date-from=2025-01-01

# Orders within a date range
bin/magento plenty:order:audit-addresses --date-from=2025-01-01 --date-to=2025-03-31

# Combine with other filters
bin/magento plenty:order:audit-addresses --order-relations --date-from=2025-06-01
```

Filter by customer/contact:

```bash
# By PlentyONE contact ID
bin/magento plenty:order:audit-addresses --contact-id=23729

# By Magento customer ID
bin/magento plenty:order:audit-addresses --customer-id=13519

# By customer email
bin/magento plenty:order:audit-addresses --email=customer@example.com
```

#### Output Options

```bash
# Output as table (default)
bin/magento plenty:order:audit-addresses --all --format=table

# Output as CSV
bin/magento plenty:order:audit-addresses --all --format=csv

# Output as JSON
bin/magento plenty:order:audit-addresses --all --format=json

# Write results to file (in var/ directory)
bin/magento plenty:order:audit-addresses --all --output=address-audit.csv
```

#### Example Output

```
PlentyMarkets Order Address Audit
================================================================================

Checking ID collision range...
  Found 847 colliding IDs (range: 1 - 847)
Auditing address→contact relations...
  Found 3 mismatched contact relations
Auditing address→order relations...
  Scanning 1250 orders...
  Found 5 mismatched order relations

=== SUMMARY ===
  ID Collision Range:                           847
  Address→Contact Mismatches:                   3
  Address→Order Mismatches:                     5

=== ADDRESS→ORDER MISMATCHES (Details) ===
...
```

### Understanding Audit Results

#### Collision Range

Shows IDs that exist in both `customer_address_entity` and `sales_order_address` tables. This is informational - it shows the ID range where collisions are possible.

:::info
ID collisions occur because Magento uses separate auto-increment sequences for customer addresses and order addresses. ID `123` in `customer_address_entity` is a different record than ID `123` in `sales_order_address`.
:::

#### Contact Relation Mismatches

Identifies addresses in customer address books that reference the wrong customer. This happens when:
- The `external_address_id` points to an address belonging to a different customer
- The `external_address_id` points to an order address instead of a customer address

#### Order Relation Mismatches

Identifies orders where the PlentyONE address doesn't match the Magento order address. Detected by comparing:
- Last name
- Postcode

When a mismatch is found, the audit shows both the current (wrong) address and the expected (correct) address.

## Resolution Commands

### Resolve Order Address Assignment

Fixes orders where PlentyONE has the wrong address assigned.

```bash
# Dry-run (default) - shows what would be fixed
bin/magento plenty:order:resolve-address-assignment

# Filter to specific order
bin/magento plenty:order:resolve-address-assignment --increment-id=000139782

# Filter by date range
bin/magento plenty:order:resolve-address-assignment --date-from=2025-01-01 --date-to=2025-03-31

# Execute fixes
bin/magento plenty:order:resolve-address-assignment --execute

# Execute with limit (useful for batch processing)
bin/magento plenty:order:resolve-address-assignment --execute --limit=10

# Execute for specific date range
bin/magento plenty:order:resolve-address-assignment --execute --date-from=2025-06-01

# Skip confirmation prompt
bin/magento plenty:order:resolve-address-assignment --execute --force
```

#### How Resolution Works

1. **Detects mismatches** by comparing address data (lastname, postcode)
2. **Finds correct address** by looking up the PlentyONE address with matching `external_address_id`
3. **Falls back to billing** if correct address not found for shipping
4. **Updates via API** using `PUT /rest/orders/{orderId}` with new `addressRelations`
5. **Updates local DB** to keep `plenty_order_entity.address_relations` in sync

#### Output

```
PlentyMarkets Order Address Assignment Resolution
================================================================================

Step 1: Detecting address mismatches...
  Scanning order-address relations...
  Scanning 1250 orders...
  Found 5 address mismatch(es)

=== SUMMARY ===
  Order Address Mismatches:                     5

  With expected Plenty address:   4
  With fallback (billing):        1
  No target address found:        0

[DRY RUN] Use --execute to apply address re-assignments.
```

### Purge External Address IDs

Bulk operation to reset all `external_address_id` values in PlentyONE addresses.

:::warning
This is a destructive operation. Use only when instructed by support or after understanding the implications. This command sets `external_address_id` to `0` for all addresses.
:::

```bash
# Dry-run (default) - shows what would be purged
bin/magento plenty:address:purge-external-ids

# Execute purge
bin/magento plenty:address:purge-external-ids --execute

# Limit number of addresses (useful for testing)
bin/magento plenty:address:purge-external-ids --execute --limit=100

# Skip confirmation
bin/magento plenty:address:purge-external-ids --execute --force
```

#### When to Use

This command is typically used when:
- Migrating to a new address ID strategy
- Resetting address references after data cleanup
- Preparing for re-export of all addresses

## Recommended Workflow

### Routine Health Check

Run periodically to monitor address data integrity:

```bash
# Weekly audit (last 7 days)
bin/magento plenty:order:audit-addresses --order-relations --date-from=$(date -v-7d +%Y-%m-%d) --output=address-audit-$(date +%Y%m%d).csv

# Monthly audit
bin/magento plenty:order:audit-addresses --all --date-from=$(date -v-1m +%Y-%m-%d) --output=address-audit-$(date +%Y%m%d).csv
```

### Investigating Specific Issues

When a customer reports address problems:

```bash
# 1. Audit by customer email
bin/magento plenty:order:audit-addresses --email=customer@example.com

# 2. Or by specific order
bin/magento plenty:order:audit-addresses --increment-id=000123456

# 3. Review results and resolve if needed
bin/magento plenty:order:resolve-address-assignment --increment-id=000123456 --execute
```

### Batch Resolution

For resolving multiple issues:

```bash
# 1. Run full audit and export results
bin/magento plenty:order:audit-addresses --order-relations --format=csv --output=mismatches.csv

# 2. Review the CSV file to understand scope

# 3. Resolve in batches
bin/magento plenty:order:resolve-address-assignment --execute --limit=50

# 4. Repeat until all resolved
```

## Log Files

All operations are logged to:

| Command | Log File |
|---------|----------|
| Audit | `var/log/plenty-address-audit.log` |
| Resolve | `var/log/plenty-order-address-resolution.log` |
| Purge | `var/log/plenty-address-purge.log` |

## Database Tables

These commands work with:

| Table | Purpose |
|-------|---------|
| `plenty_address_entity` | Cached PlentyONE address data including `options` JSON |
| `plenty_address_relation` | Links addresses to contacts/orders |
| `plenty_order_entity` | Order data including `address_relations` JSON |
| `plenty_customer_entity` | Customer/contact mapping |
| `customer_address_entity` | Magento customer saved addresses |
| `sales_order_address` | Magento order addresses |

## Related Documentation

- **[Order Synchronization Issues](/docs/troubleshooting/order-issues)** - Order sync troubleshooting
- **[Profile Execution Monitoring](/docs/monitoring/profiles)** - Monitor profile execution
- **[CLI Commands Reference](/docs/cli-commands)** - Complete CLI reference

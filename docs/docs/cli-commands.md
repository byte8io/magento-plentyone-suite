---
sidebar_position: 20
title: CLI Commands Reference
description: Complete reference of all Mage2Plenty CLI commands
---

# CLI Commands Reference

Mage2Plenty provides a comprehensive set of CLI commands for managing synchronization, testing, and system maintenance. This reference covers all available commands organized by functionality.

## Quick Reference

```bash
# System & Setup
bin/magento plenty:system:check           # System health check
bin/magento plenty:client:test            # Test API connection
bin/magento plenty:setup:init             # Complete initial setup

# Profile Management
bin/magento plenty:item:import            # Import products
bin/magento plenty:item:export            # Export products (with dry-run, SKU/ID filtering)
bin/magento plenty:item:export:queue      # Add products to the export queue
bin/magento plenty:order:export           # Export orders
bin/magento plenty:stock:import           # Import stock
bin/magento plenty:customer:export        # Export customers

# Diagnostics & Troubleshooting
bin/magento plenty:item:map:show          # Show product mapping details
bin/magento plenty:order:map:show         # Show order item mapping details
bin/magento plenty:order:check-integrity  # Check order data integrity
bin/magento plenty:order:audit-addresses  # Audit address data integrity
bin/magento plenty:order:resolve-address-assignment # Fix order address assignments
bin/magento plenty:stock:map:show         # Show stock and warehouse mapping
bin/magento plenty:stock:reservations:show # Show inventory reservations
bin/magento plenty:stock:availability:show # Show product availability per source
bin/magento plenty:stock:drift:report     # Report physical-stock drift vs PlentyONE
bin/magento plenty:api:history            # View API request history
bin/magento plenty:profile:status         # Show profile status dashboard

# Maintenance
bin/magento plenty:log:process            # Process API logs
bin/magento plenty:*:flush-data           # Clear module data
```

## System Commands

### System Check

Comprehensive system health check including PHP version, Magento version, modules, configuration, file permissions, and API connection.

```bash
bin/magento plenty:system:check
```

**Checks performed:**
- ✅ PHP version and extensions
- ✅ Magento version compatibility
- ✅ Module status
- ✅ Client configuration
- ✅ File system permissions
- ✅ API connectivity

**Example output:**
```
PlentyONE System Check
======================

System Requirements
✅ PHP Version         8.3.0
✅ Magento Version     2.4.8
✅ PHP Memory Limit    2G

API Connection
✓ Connection test successful! Found 2 webstore(s).

Summary
✓ All checks passed!
```

[Learn more: Connection Testing →](/docs/testing/connection-test)

### Connection Test

Test API connection without full system check:

```bash
bin/magento plenty:client:test
```

### License Heartbeat

Send the license heartbeat to the Byte8 API (normally triggered by cron):

```bash
# Send the heartbeat now
bin/magento plenty:heartbeat

# Preview the metrics that would be sent, without sending
bin/magento plenty:heartbeat --dry-run
```

**Options:**
- `--dry-run`: Display the heartbeat metrics without sending them

### Client Token Management

Generate or refresh OAuth access token:

```bash
# Generate new token
bin/magento plenty:client:token

# Force refresh token
bin/magento plenty:client:token --refresh
```

### API Request History

Display API request history from log files. This diagnostic command helps troubleshoot API communication issues, monitor request/response patterns, and identify failed API calls.

```bash
# Show recent API requests (default: 20 entries)
bin/magento plenty:api:history

# Show more entries
bin/magento plenty:api:history --recent=50
bin/magento plenty:api:history -r 50

# Show only failed requests (4xx, 5xx status codes)
bin/magento plenty:api:history --failed-only
bin/magento plenty:api:history -f

# Filter by specific endpoint
bin/magento plenty:api:history --endpoint="items/variations"
bin/magento plenty:api:history -e "orders"

# Show detailed request/response data
bin/magento plenty:api:history --detailed
bin/magento plenty:api:history -d
```

**Options:**
- `--recent` / `-r`: Number of recent entries to show (default: 20)
- `--failed-only` / `-f`: Show only failed requests (status >= 400)
- `--endpoint` / `-e`: Filter by endpoint (partial match)
- `--detailed` / `-d`: Show full request/response data

**What it displays:**

**Summary View:**
- Timestamp
- HTTP method (GET, POST, PUT, DELETE)
- Endpoint URL
- Status code with color coding
- Request duration

**Detailed View:**
- Complete request data
- Response body (truncated for large responses)
- Error messages (if any)

**Example Output:**
```bash
$ bin/magento plenty:api:history --recent=10 --failed-only

PlentyONE API Request History
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Time                 Method  Endpoint                Status  Duration
2025-10-27 14:23:11  POST    orders                  401     142ms
2025-10-27 14:15:32  GET     items/variations/31014  404     98ms
2025-10-27 13:45:18  PUT     stockmanagement/stock   500     215ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Showing 3 of 1,247 entries
```

**Detailed Output Example:**
```bash
$ bin/magento plenty:api:history --recent=1 --detailed

Request #1
Time:     2025-10-27 14:23:11
Method:   POST
Endpoint: orders
Status:   401
Duration: 142ms

Error: Authentication failed. Access token expired.
```

**Common Use Cases:**

1. **Debug Authentication Issues**
   ```bash
   # Check for 401 errors
   bin/magento plenty:api:history --failed-only
   ```

2. **Monitor Specific Endpoint**
   ```bash
   # Track stock update requests
   bin/magento plenty:api:history -e "stockmanagement" -r 50
   ```

3. **Analyze Performance**
   ```bash
   # View request durations and identify slow endpoints
   bin/magento plenty:api:history --detailed
   ```

4. **Troubleshoot Integration**
   ```bash
   # Find recent failures
   bin/magento plenty:api:history --failed-only --detailed
   ```

**Status Color Coding:**
- **Green (2xx)**: Successful requests
- **Yellow (4xx)**: Client errors (authentication, not found, etc.)
- **Red (5xx)**: Server errors

**Important Notes:**
- Reads from `var/log/plenty_api.log` file
- API logging must be enabled: **Stores > Configuration > PlentyONE > Client > API Logging**
- Log file is rotated automatically to manage size
- Supports both JSON and standard log formats

### Setup Wizards

Interactive setup wizards for initial configuration:

```bash
# Client connection and API configuration
bin/magento plenty:setup:client

# Profile system setup
bin/magento plenty:setup:profile:system
```

**Client Wizard** guides you through:
1. Core settings (log rotation, notifications)
2. REST API settings (timeout, retry logic)
3. Client connection (URL, credentials, connection test)

**Profile Wizard** guides you through:
1. Profile settings (history retention)
2. Notification settings (log level, retention)
3. Email alerts (recipients, thresholds)
4. Performance settings (batch sizes, async processing)

## Setup Commands

### Complete Setup

Master command that runs both collection and property creation:

```bash
# Complete setup for all modules
bin/magento plenty:setup:init

# Setup specific modules only
bin/magento plenty:setup:init --modules=order,item,stock

# Preview what will be done (dry run)
bin/magento plenty:setup:init --dry-run

# Skip configuration collection
bin/magento plenty:setup:init --skip-collect

# Skip property creation
bin/magento plenty:setup:init --skip-create
```

[Learn more: Profile Setup & Auto-Configuration →](/docs/profiles/setup-auto-config)

### Configuration Collection

Collect configuration data from PlentyONE API:

```bash
# Collect all configuration types
bin/magento plenty:setup:collect:config

# Collect specific types
bin/magento plenty:setup:collect:config --type=referrer,shipping,vat

# List available collectors
bin/magento plenty:setup:collect:config --list
```

**Options (`plenty:setup:collect:config`):**
- `--type` / `-t`: Specific types to collect, comma-separated (e.g. `referrer,shipping_profile,vat_config`). Collects all when omitted
- `--list` / `-l`: List available collector types

**What gets collected:**
- Referrers (order sources)
- Shipping countries and profiles
- VAT configurations
- Web stores and locations
- Item configuration (availabilities, barcodes, units)
- Customer classes
- Warehouse configurations

Collect initial **entity** data (customers, items, categories, etc.) from PlentyONE:

```bash
# Collect data for all modules
bin/magento plenty:setup:collect:data

# Collect specific modules
bin/magento plenty:setup:collect:data --modules=customer,item,category

# List available data collection modules
bin/magento plenty:setup:collect:data --list
```

**Options (`plenty:setup:collect:data`):**
- `--modules` / `-m`: Specific modules to collect, comma-separated. Collects all when omitted
- `--list` / `-l`: List available data collection modules

### Property Creation

Create system properties in PlentyONE:

```bash
# Create all system properties
bin/magento plenty:setup:create

# Create specific property types
bin/magento plenty:setup:create --type=referrer,order,item

# List available property managers
bin/magento plenty:setup:create --list

# Verbose output
bin/magento plenty:setup:create --verbose
```

**What gets created:**
- Default referrer (`magento`)
- Media type referrers (image, small_image, thumbnail, etc.)
- Order properties
- Customer properties
- Item property groups

## Item (Product) Commands

### Item Import

Import products from PlentyONE to Magento:

```bash
# Import all products via profile (requires confirmation)
bin/magento plenty:item:import --profile=<profile_id>

# Import specific item(s) by PlentyONE ID
bin/magento plenty:item:import --id=12345
bin/magento plenty:item:import --id=12345,12346,12347

# Import items by status
bin/magento plenty:item:import --status=active
bin/magento plenty:item:import --status=inactive

# Dry run: Preview what will be imported without making changes
bin/magento plenty:item:import --dry-run
bin/magento plenty:item:import --id=12345,12346 --dry-run
bin/magento plenty:item:import --status=active --dry-run

# Verbose mode
bin/magento plenty:item:import --profile=1 --verbose
```

**Options:**
- `--id` / `-i`: Import specific PlentyONE item ID(s). Comma-separated values (e.g., "123,456,789")
- `--status` / `-s`: Filter items by status ("active" or "inactive")
- `--profile` / `-p`: Use specific profile ID for import
- `--dry-run` / `-d`: Preview mode - displays what will be imported without making any database changes

**Confirmation Prompt:**
When no filters (`--id` or `--status`) are specified, the command will prompt for confirmation:
```
No filters specified. This will import ALL products from PlentyONE.
Are you sure you want to continue? (yes/no) [no]:
```

This safety check prevents accidental bulk imports. Use `--dry-run` to preview the import scope without triggering the confirmation prompt.

**Dry Run Output Example:**
```bash
$ bin/magento plenty:item:import --status=active --dry-run

DRY RUN MODE - No data will be imported

Total items to import: 25

Preview (first 10 items):
  - ID: 1001, SKU: TEST-001, Status: Active
  - ID: 1002, SKU: TEST-002, Status: Active
  - ID: 1003, SKU: TEST-003, Status: Active
  ... and 15 more items

Dry run completed. No data was imported.
Remove --dry-run option to perform actual import.
```

### Item Export

Export products from Magento to PlentyONE:

```bash
# Export all products in queue (prompts for confirmation)
bin/magento plenty:item:export

# Export specific products by SKU
bin/magento plenty:item:export -s SKU1,SKU2,SKU3

# Export specific products by entity ID
bin/magento plenty:item:export -i 1,2,3

# Export products by queue status
bin/magento plenty:item:export -w pending

# Export with specific profile
bin/magento plenty:item:export -p 2

# Dry run: Preview what will be exported without changes
bin/magento plenty:item:export --dry-run
bin/magento plenty:item:export -s SKU1,SKU2 --dry-run
```

**Options:**
- `--id` / `-i`: Product entity ID(s). Comma-separated values
- `--sku` / `-s`: Product SKU(s). Comma-separated values
- `--status` / `-w`: Filter by queue status
- `--profile-id` / `-p`: Profile ID (uses default if not specified)
- `--dry-run` / `-d`: Preview mode - displays what will be exported without making changes

**Features:**
- Real-time progress bar showing per-product processing status
- Confirmation prompt when no filters are specified (safety check)
- Dry run mode displays products in a table with ID, SKU, status, and PlentyONE item ID
- Automatic parent product resolution when exporting child products

### Item Export Queue

Add products to the item export queue without exporting them immediately. Queued products are picked up by the scheduled export profile (or a subsequent `plenty:item:export` run):

```bash
# Add all products to the export queue (prompts for confirmation)
bin/magento plenty:item:export:queue

# Add specific products by entity ID
bin/magento plenty:item:export:queue -i 1,2,3
```

**Options:**
- `--id` / `-i`: Product entity ID(s). Comma-separated values

**Features:**
- Confirmation prompt when no ID filter is specified, showing the total number of products that will be queued (safety check)
- Skips products already present in the queue and reports how many were added
- Reports `Export queue is up-to-date.` when there is nothing new to add

### Item Collection

Collect item data from PlentyONE:

```bash
# Collect items
bin/magento plenty:item:collect --profile=<profile_id>

# Collect specific items
bin/magento plenty:item:collect --id=12345,12346

# Collect by date range
bin/magento plenty:item:collect --date-created="2025-01-01/2025-01-31"
```

### Item-Product Mapping

Map PlentyONE variations to Magento products using the configured mapping attribute. This command establishes the relationship between products in both systems by matching variation numbers with the designated Magento product attribute (typically SKU or a custom attribute).

```bash
# Map all products (shows progress bar)
bin/magento plenty:item:map

# Map specific products by Magento Product ID
bin/magento plenty:item:map --id=123
bin/magento plenty:item:map --id=123,456,789

# Dry run: Preview mappings without making changes
bin/magento plenty:item:map --dry-run
bin/magento plenty:item:map --id=123,456 --dry-run
```

**Options:**
- `--id` / `-i`: Map specific Magento product ID(s). Comma-separated values (e.g., "123,456,789")
- `--dry-run` / `-d`: Preview mode - displays what will be mapped without making any database changes

**What it does:**
- Matches PlentyONE variation numbers with Magento products using the configured mapping attribute
- Updates `plenty_item_id` and `plenty_variation_id` columns in the product entity table
- Displays real-time progress with a progress bar showing items processed
- Shows detailed summary upon completion

**Dry Run Output Example:**
```bash
$ bin/magento plenty:item:map --dry-run

DRY RUN MODE: Previewing 250 product mappings...

 250/250 [============================] 100%

DRY RUN SUMMARY:
  - Would map: 235 products
  - Already mapped (would skip): 15 products

No changes were made to the database.
```

**Mapping Summary Example:**
```bash
$ bin/magento plenty:item:map

Starting product mapping for 250 products...

 250/250 [============================] 100%

MAPPING SUMMARY:
  - Successfully mapped: 235 products
  - Already mapped (skipped): 15 products
```

**Configuration:**
The mapping attribute is configured in:
**Stores > Configuration > PlentyONE > Item Settings > Product Mapping**

Common mapping attributes:
- `sku` - Match by SKU (most common)
- Custom attribute - Match by custom product attribute (e.g., `plenty_variation_number`)

### Clear Product Mappings

Remove PlentyONE product mappings (`plenty_item_id` and `plenty_variation_id`) from catalog products. This is useful when switching product mapping attributes, troubleshooting synchronization issues, or starting fresh with product imports.

```bash
# Clear all mappings (with confirmation prompt)
bin/magento plenty:item:unmap

# Clear all mappings without confirmation
bin/magento plenty:item:unmap --force

# Clear mappings for specific products
bin/magento plenty:item:unmap --id=123
bin/magento plenty:item:unmap --id=123,456,789

# Preview what will be cleared (dry run)
bin/magento plenty:item:unmap --dry-run
bin/magento plenty:item:unmap --id=123,456 --dry-run
```

**Options:**
- `--id` / `-i`: Clear specific product ID(s). Comma-separated values. Automatically includes child products (configurable variants)
- `--force` / `-f`: Skip confirmation prompt
- `--dry-run` / `-d`: Preview mode - shows what would be cleared without making changes

**What it does:**
- Removes `plenty_item_id` and `plenty_variation_id` from specified products
- Automatically includes child products when parent product ID is provided
- Shows summary of products affected before clearing
- Provides next steps for re-mapping products

**Dry Run Output Example:**
```bash
$ bin/magento plenty:item:unmap --dry-run

PlentyONE Product Mapping Cleaner

DRY RUN MODE - No changes will be made

Scope: All products with PlentyONE mappings

Summary:
  • Products to clear: 235
  • Fields to clear:
    - plenty_item_id
    - plenty_variation_id

Dry run completed. No changes were made.
Run without --dry-run to apply changes.
```

**Clearing Specific Products Example:**
```bash
$ bin/magento plenty:item:unmap --id=123,456

PlentyONE Product Mapping Cleaner

Scope: Products 123, 456 (including child products)

Summary:
  • Products to clear: 8
  • Fields to clear:
    - plenty_item_id
    - plenty_variation_id

Clear PlentyONE mappings from 8 product(s)? [y/N] y

Clearing product mappings...

✓ Product mappings cleared successfully
  • Rows affected: 8 of 8 products

Next steps:
  1. Re-collect items: bin/magento plenty:item:collect
  2. Re-import products: bin/magento plenty:item:import
```

**Common Use Cases:**

1. **Switching Mapping Attributes**
   ```bash
   # Clear all mappings before changing mapping attribute
   bin/magento plenty:item:unmap --force
   # Update mapping attribute in admin configuration
   # Re-map with new attribute
   bin/magento plenty:item:map
   ```

2. **Troubleshooting Sync Issues**
   ```bash
   # Clear and re-map specific products
   bin/magento plenty:item:unmap --id=123,456,789
   bin/magento plenty:item:collect --id=123,456,789
   bin/magento plenty:item:import --id=123,456,789
   ```

3. **Fresh Start**
   ```bash
   # Clear all mappings and re-import everything
   bin/magento plenty:item:unmap --force
   bin/magento plenty:item:collect
   bin/magento plenty:item:import
   ```

### Show Product Mapping

Display detailed product to PlentyONE item/variation mapping information. This diagnostic command helps troubleshoot mapping issues, verify configuration, and audit product-to-variation relationships.

```bash
# Show mapping for a specific SKU
bin/magento plenty:item:map:show --sku="24-WB05-REAL"
bin/magento plenty:item:map:show -s "24-WB05-REAL"

# Show mapping for a product ID
bin/magento plenty:item:map:show --product-id=7918
bin/magento plenty:item:map:show -p 7918

# Show mapping for multiple products (comma-separated)
bin/magento plenty:item:map:show -s "SKU1,SKU2,SKU3"
bin/magento plenty:item:map:show -p "123,456,789"
```

**Options:**
- `--sku` / `-s`: Product SKU(s). Accepts comma-separated values
- `--product-id` / `-p`: Magento product ID(s). Accepts comma-separated values

**What it displays:**

**Product Information:**
- SKU, Product ID, Product Name
- Product Type, Status
- Link Field ID (entity_id/row_id)

**Mapping Configuration:**
- Current mapping mode (SKU or Custom Attribute)
- Identifier field being used
- Custom attribute value (if applicable)

**PlentyONE Mapping:**
- Item ID and type
- Variation ID, number, status
- Collection status (whether data exists in local PlentyONE tables)
- Last sync timestamp

**Validation Warnings:**
- Missing variation/item IDs
- Custom attribute not set
- Data inconsistencies

**Example Output:**
```bash
$ bin/magento plenty:item:map:show -s "24-WB05-REAL"

Product Mapping Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Product Information:
SKU           24-WB05-REAL
Product ID    7918
Link Field ID 7918
Product Name  Savvy Shoulder Tote
Type          simple
Status        Enabled

Mapping Configuration:
Mapping Mode           Custom Attribute
Identifier Field       custom_sku
Custom Attribute Value 24-WB05
SKU Source             PlentyONE Property

PlentyONE Mapping:
Item ID           8064
Item Type         simple
Item Status       ✓ Collected
Variation ID      31014
Variation Number  24-WB05
Is Main Variation Yes
Variation Active  Yes
Variation Status  ✓ Collected
Last Synced       2025-10-25 21:33:45

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary: 1 product(s) displayed, 0 not mapped
```

**Common Use Cases:**

1. **Verify Mapping Configuration**
   ```bash
   # Check if custom attribute mapping is working
   bin/magento plenty:item:map:show -s "PROD-123"
   ```

2. **Troubleshoot Import Issues**
   ```bash
   # Check if variation data is collected locally
   bin/magento plenty:item:map:show -p 7918
   ```

3. **Audit Multiple Products**
   ```bash
   # Check mapping for several SKUs at once
   bin/magento plenty:item:map:show -s "SKU1,SKU2,SKU3"
   ```

4. **Data Integrity Check**
   ```bash
   # Verify mapping matches between systems
   bin/magento plenty:item:map:show --product-id=123
   ```

**Possible Status Messages:**
- `✓ Collected` - Item/variation data exists in local PlentyONE tables
- `✗ NOT COLLECTED` - Mapped but data not collected (run `plenty:item:collect`)
- `⚠ Product is NOT mapped to PlentyONE` - No mapping exists (run `plenty:item:map`)

### Resolve Variation Visibility

Resolve which product variations should be visible in catalog:

```bash
bin/magento plenty:item:resolve_variations_visible_in_catalog
```

### Item Setup Commands

```bash
# Complete item module setup
bin/magento plenty:item:setup

# Collect item configuration data
bin/magento plenty:item:setup:collect

# Create item properties
bin/magento plenty:item:setup:property

# Pre-compute MD5 checksums for product media gallery images
bin/magento plenty:item:setup:checksum
bin/magento plenty:item:setup:checksum --product-ids=1,2,3 --batch-size=500 --force
```

**`plenty:item:setup:checksum` options:**
- `--product-ids` / `-p`: Restrict to specific product IDs, comma-separated
- `--batch-size` / `-b`: Images processed per batch
- `--force` / `-f`: Recompute even when a checksum already exists

### Item Maintenance

```bash
# Clear local item data (prompts for confirmation)
bin/magento plenty:item:purge

# Check item/variation mapping integrity (cpe + plenty_item_entity vs plenty_variation_entity)
bin/magento plenty:item:check-integrity
bin/magento plenty:item:check-integrity --log     # append results to var/log/plenty-item-integrity.log
bin/magento plenty:item:check-integrity --email   # email a critical alert if mismatches are found

# Delete orphaned PlentyONE items (items that exist in Magento, or all items) via batch DELETE
bin/magento plenty:item:purge-orphans --dry-run
bin/magento plenty:item:purge-orphans --all --force
```

**`plenty:item:check-integrity` options:**
- `--log`: Append the results to `var/log/plenty-item-integrity.log`
- `--email`: Send a critical-alert email if mismatches are found

**`plenty:item:purge-orphans` options:**
- `--all`: Target all PlentyONE items (not just those present in Magento)
- `--collect` / `-c`: Collect items from PlentyONE before evaluating
- `--dry-run`: Report what would be deleted without deleting
- `--force` / `-f`: Skip confirmation
- `--limit`: Cap the number of items processed

## Order Commands

### Order Export

Export orders from Magento to PlentyONE:

```bash
# Export by order entity ID
bin/magento plenty:order:export --id=123

# Export by increment ID (order number)
bin/magento plenty:order:export --increment_id=000000123

# Export multiple orders
bin/magento plenty:order:export --increment_id=000000123,000000124

# Export by date
bin/magento plenty:order:export --date="2025-01-13"

# Export by status
bin/magento plenty:order:export --status=processing

# Export with profile
bin/magento plenty:order:export --profile=3 --verbose
```

[Learn more: Order Synchronization Testing →](/docs/testing/order-synchronization)

### Order Import

Import order updates from PlentyONE:

```bash
# Import all collected orders
bin/magento plenty:order:import --profile=<profile_id>

# Import with verbose output
bin/magento plenty:order:import --profile=4 --verbose
```

### Order Collection

Collect orders from PlentyONE:

```bash
# Collect all updated orders
bin/magento plenty:order:collect

# Collect specific order
bin/magento plenty:order:collect --id=12345

# Collect by creation date
bin/magento plenty:order:collect --date-created="2025-01-01"

# Collect by update date
bin/magento plenty:order:collect --date-updated="2025-01-01/2025-01-31"

# Collect with profile
bin/magento plenty:order:collect --profile=4
```

### Order Validation

Validate order data before export:

```bash
bin/magento plenty:order:validate --id=<order_id>
```

### Order Mapping

Create/update order relation mappings:

```bash
bin/magento plenty:order:map
```

Unmap Magento orders from PlentyONE (removes the relation IDs):

```bash
# Unmap by order increment ID, entity ID, or PlentyONE order ID
bin/magento plenty:order:unmap --increment-id=000000123
bin/magento plenty:order:unmap --entity-id=123
bin/magento plenty:order:unmap --plenty-order-id=4567

# Unmap a date range
bin/magento plenty:order:unmap --date-from=2025-01-01 --date-to=2025-01-31
```

**Options:**
- `--increment-id` / `-i`: Order increment ID
- `--entity-id` / `-e`: Order entity ID
- `--plenty-order-id` / `-p`: PlentyONE order ID
- `--date-from` / `--date-to`: Restrict to an order date range

### Show Order Item Mapping

Display detailed order/quote item to PlentyONE variation mapping information. This diagnostic command helps troubleshoot order export failures, verify checkout flow, and audit historical order data.

```bash
# Show mapping for a specific order
bin/magento plenty:order:map:show --order-id=100000123
bin/magento plenty:order:map:show -o 100000123

# Show mapping by order increment ID
bin/magento plenty:order:map:show --increment-id=000000123
bin/magento plenty:order:map:show -i 000000123

# Show mapping for a specific SKU across all orders
bin/magento plenty:order:map:show --sku="24-WB05-REAL"
bin/magento plenty:order:map:show -s "24-WB05-REAL"

# Show mapping for quote items (debugging checkout)
bin/magento plenty:order:map:show --quote-id=456
bin/magento plenty:order:map:show -t 456

# Show only items missing plenty_variation_id
bin/magento plenty:order:map:show --order-id=100000123 --missing-only
bin/magento plenty:order:map:show -o 100000123 -m
```

**Options:**
- `--order-id` / `-o`: Order entity ID
- `--increment-id` / `-i`: Order increment ID (order number shown to customer)
- `--sku` / `-s`: Product SKU (searches across all orders)
- `--quote-id` / `-t`: Quote ID (for debugging checkout process)
- `--missing-only` / `-m`: Show only items without `plenty_variation_id`

**What it displays:**

**Order Item Information:**
- Item ID, Order ID, Order Increment ID
- SKU, Product ID, Product Name
- Qty Ordered
- Created At timestamp

**Quote Item Information:**
- Item ID, Quote ID
- SKU, Product ID, Product Name
- Qty
- Created At, Updated At

**PlentyONE Mapping:**
- Variation ID, variation number
- Is main variation, active status
- Collection status (whether variation exists in local tables)

**Comparison with Product:**
- Current product variation ID
- Match status (does order item mapping match current product mapping?)
- Mismatch warnings (product mapping changed after order was placed)

**Example Output:**
```bash
$ bin/magento plenty:order:map:show -i 000000123

Order Item Mapping Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order Item Information:
Item ID            1234
Order ID           100000123
Order Increment ID 000000123
SKU                24-WB05-REAL
Product ID         7918
Product Name       Savvy Shoulder Tote
Qty Ordered        2
Created At         2025-10-25 10:30:00

PlentyONE Mapping:
Variation ID       31014
Variation Number   24-WB05
Is Main Variation  Yes
Variation Active   Yes
Variation Status   ✓ Collected

Comparison with Product:
Product Variation ID  31014
Match Status          ✓ Matches current product mapping

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary: 3 order item(s) displayed
```

**Common Use Cases:**

1. **Troubleshoot Order Export Failures**
   ```bash
   # Check if order items have variation IDs
   bin/magento plenty:order:map:show --order-id=100000123

   # Find all items missing variation IDs
   bin/magento plenty:order:map:show --order-id=100000123 --missing-only
   ```

2. **Debug Checkout Flow**
   ```bash
   # Verify quote items get variation IDs during checkout
   bin/magento plenty:order:map:show --quote-id=456
   bin/magento plenty:order:map:show -t 456
   ```

3. **Data Integrity Audit**
   ```bash
   # Find orders with missing variation IDs
   bin/magento plenty:order:map:show --sku="PROD-123" --missing-only
   ```

4. **Historical Data Analysis**
   ```bash
   # Check if product mapping changed after order was placed
   bin/magento plenty:order:map:show --increment-id=000000123
   ```

5. **SKU-Level Tracking**
   ```bash
   # See all orders for a specific SKU and their mapping status
   bin/magento plenty:order:map:show -s "24-WB05-REAL"
   ```

**Possible Status Messages:**
- `✓ Collected` - Variation data exists in `plenty_variation_entity`
- `✗ NOT COLLECTED` - Variation ID set but data not collected
- `✗ MISMATCH` - Product mapping has changed since order was placed
- `⚠ Order item missing plenty_variation_id` - Cannot be exported to PlentyONE
- `⚠ Quote item not mapped but product is` - Issue during checkout process

**Important Notes:**
- Order items store a snapshot of `plenty_variation_id` at the time of order placement
- If product mapping changes later, order items retain their original variation IDs
- Quote items get `plenty_variation_id` during the checkout process
- Missing variation IDs will prevent order export to PlentyONE

### Order Deletion (Testing)

Delete test orders from PlentyONE:

```bash
# Delete order
bin/magento plenty:order:delete --id=<plenty_order_id>

# Delete payment
bin/magento plenty:order:delete:payment --id=<payment_id>
```

### Order Maintenance

```bash
# Refresh order grid data
bin/magento plenty:order:grid:refresh

# Clear order data
bin/magento plenty:order:flush

# Purge external_address_id values from PlentyONE addresses
bin/magento plenty:address:purge-external-ids --execute
bin/magento plenty:address:purge-external-ids --limit=500 --force
```

**`plenty:address:purge-external-ids` options:**
- `--execute`: Perform the purge (default is a dry-run preview)
- `--dry-run`: Preview only (no changes)
- `--limit` / `-l`: Maximum addresses to process
- `--profile-id` / `-p`: Restrict to a specific profile
- `--force` / `-f`: Skip confirmation

### Check Order Integrity

Check order data integrity between Magento and PlentyONE. This diagnostic command analyzes order references and identifies potential consistency issues that may require review.

```bash
# Collect and analyze orders for a single date
bin/magento plenty:order:check-integrity --date="2021-01-01"
bin/magento plenty:order:check-integrity -d "2021-01-01"

# Collect and analyze orders for a date range
bin/magento plenty:order:check-integrity --date-from="2021-01-01" --date-to="2021-01-31"

# Skip collection and only analyze existing data
bin/magento plenty:order:check-integrity --date-from="2021-01-01" --skip-collect
bin/magento plenty:order:check-integrity --date-from="2021-01-01" -s

# Specify profile for collection
bin/magento plenty:order:check-integrity --date="2021-01-01" --profile=3
bin/magento plenty:order:check-integrity -d "2021-01-01" -p 3

# Run specific checks only
bin/magento plenty:order:check-integrity --skip-collect --skip-plenty-check      # Only sales_order check
bin/magento plenty:order:check-integrity --date="2021-01-01" --skip-sales-order-check  # Only PlentyONE check
```

**Options:**
- `--date` / `-d`: Single date to collect and analyze orders (YYYY-MM-DD)
- `--date-from`: Start date for date range (YYYY-MM-DD)
- `--date-to`: End date for date range (YYYY-MM-DD). If not specified, only date-from is used
- `--skip-collect` / `-s`: Skip the collection step and only analyze existing data in local tables
- `--profile` / `-p`: Profile ID to use for order collection
- `--skip-plenty-check`: Skip PlentyONE integrity check
- `--skip-sales-order-check`: Skip Magento sales_order integrity check

**What it does:**

1. **Collects Orders** (unless `--skip-collect`): Fetches orders from PlentyONE API for the specified date range
2. **Analyzes PlentyONE Data**: Scans `plenty_order_entity` and `plenty_order_property` tables for order reference consistency
3. **Analyzes Magento Data**: Checks `sales_order` table for order reference integrity
4. **Filters Sales Orders**: Only analyzes sales orders (type_id = 1), excluding credit notes, delivery orders, returns, and warranty orders
5. **Displays Results**: Shows any issues found with their corresponding order IDs in the CLI
6. **Logs Results**: Writes detailed report to `var/log/plenty-order-integrity.log`

**Example Output:**
```bash
$ bin/magento plenty:order:check-integrity --date="2021-06-15"

Order Data Integrity Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Collecting orders from PlentyONE...

Using profile ID: 3
Date: 2021-06-15
Collecting... Page 1/5 - 250 orders
✓ Collected 1,250 orders

Step 2: Analyzing orders for integrity issues...

Analyzing 1,250 orders...
Processed 1250/1250 orders...

Step 2b: Checking sales_order table for integrity issues...

Found 0 order reference(s) requiring review in sales_order table

No order integrity issues found

✓ Integrity check complete
```

**Common Use Cases:**

1. **Routine Health Check**
   ```bash
   # Check specific date for any issues
   bin/magento plenty:order:check-integrity --date="2021-06-15"
   ```

2. **Audit Historical Data**
   ```bash
   # Analyze a month of orders
   bin/magento plenty:order:check-integrity --date-from="2021-06-01" --date-to="2021-06-30"
   ```

3. **Quick Analysis Without Re-collecting**
   ```bash
   # Skip API collection if data is already up-to-date
   bin/magento plenty:order:check-integrity --date-from="2021-06-01" --skip-collect
   ```

**Important Notes:**
- Requires `--date` or `--date-from` parameter unless using `--skip-collect`
- Only sales orders (type_id = 1) are analyzed
- Results are appended to the log file, preserving history
- The command extracts the external order ID from order properties (type_id = 7)

### Order Setup Commands

```bash
# Complete order setup
bin/magento plenty:order:setup

# Collect order configuration
bin/magento plenty:order:setup:collect

# Create order properties
bin/magento plenty:order:setup:property
```

## Stock Commands

### Stock Import

Import stock levels from PlentyONE:

```bash
# Import all stock
bin/magento plenty:stock:import --profile=<profile_id>

# Import with verbose output
bin/magento plenty:stock:import --profile=5 --verbose
```

### Stock Export

Export stock levels from Magento to PlentyONE:

```bash
# Export all queued stock
bin/magento plenty:stock:export

# Export specific products by entity ID
bin/magento plenty:stock:export --id=1,2,3

# Export specific products by SKU
bin/magento plenty:stock:export --sku=SKU1,SKU2

# Export with a specific profile
bin/magento plenty:stock:export --profile-id=5
```

**Options:**
- `--id` / `-i`: Product entity ID(s). Comma-separated values
- `--sku` / `-s`: Product SKU(s). Comma-separated values
- `--profile-id` / `-p`: Profile ID (uses default if not specified)
- `--status`: Filter by export-queue status

### Stock Export Queue

Manage the stock export queue (products awaiting stock export):

```bash
# Add products to the stock export queue
bin/magento plenty:stock:export:add --id=1,2,3
bin/magento plenty:stock:export:add --sku=SKU1,SKU2

# Add all products
bin/magento plenty:stock:export:add --all

# Remove rows from the stock export queue
bin/magento plenty:stock:export:purge --id=1,2,3
bin/magento plenty:stock:export:purge --older-than=7   # days
bin/magento plenty:stock:export:purge --all
```

**`plenty:stock:export:add` options:**
- `--id` / `-i`: Product entity ID(s), comma-separated
- `--sku` / `-s`: Product SKU(s), comma-separated
- `--all` / `-a`: Add all products
- `--force` / `-f`: Skip confirmation

**`plenty:stock:export:purge` options:**
- `--id` / `-i`, `--sku` / `-s`: Restrict to specific products
- `--older-than` / `-o`: Remove rows older than N days
- `--all` / `-a`: Purge the entire queue
- `--force` / `-f`: Skip confirmation

### Stock Collection

Collect stock data from PlentyONE:

```bash
# Collect all stock
bin/magento plenty:stock:collect --profile=<profile_id>

# Collect for specific SKUs
bin/magento plenty:stock:collect --sku=SKU1,SKU2,SKU3
```

### Stock Source Management

Assign stock sources (MSI):

```bash
# Assign stock source to product
bin/magento plenty:stock:reservation:assign_source --sku=TEST-SKU --source=default

# Batch assign
bin/magento plenty:stock:reservation:assign_source --category=10 --source=warehouse1
```

### Check Product Saleable Quantity

```bash
bin/magento plenty:stock:get_saleable_qty --sku=TEST-SKU
```

### Stock-Product Mapping

Map PlentyONE stock records to Magento products using variation IDs. This command establishes the relationship between stock records and products by matching `plenty_stock_entity.variation_id` with `catalog_product_entity.plenty_variation_id`.

```bash
# Map all stock records to product SKUs
bin/magento plenty:stock:map

# Map specific variation IDs
bin/magento plenty:stock:map --id=12345,67890

# Preview mappings without making changes (dry run)
bin/magento plenty:stock:map --dry-run
bin/magento plenty:stock:map --id=12345,67890 --dry-run
```

**Options:**
- `--id` / `-i`: Map specific PlentyONE variation ID(s). Comma-separated values
- `--dry-run` / `-d`: Preview mode - displays what will be mapped without making any database changes

**What it does:**
- Matches `plenty_stock_entity.variation_id` with `catalog_product_entity.plenty_variation_id`
- Updates `plenty_stock_entity.sku` and `plenty_stock_entity.product_id` fields
- Displays real-time progress with progress bar
- Shows detailed summary upon completion

**When to use:**
- After importing products with custom attribute mapping
- When stock records are missing SKU values
- To sync SKU changes from product catalog to stock records
- After product SKU updates in Magento

[Learn more: Stock Import Profile →](/docs/profiles/stock-import)

### Clear Stock Mappings

Remove Magento product mappings (`product_id` and `sku`) from stock records. This is useful when switching product mapping attributes, troubleshooting synchronization issues, or starting fresh with stock mappings.

```bash
# Clear all stock mappings (with confirmation prompt)
bin/magento plenty:stock:unmap

# Clear all mappings without confirmation
bin/magento plenty:stock:unmap --force

# Clear mappings for specific variation IDs
bin/magento plenty:stock:unmap --id=12345
bin/magento plenty:stock:unmap --id=12345,67890,11111

# Preview what will be cleared (dry run)
bin/magento plenty:stock:unmap --dry-run
bin/magento plenty:stock:unmap --id=12345,67890 --dry-run
```

**Options:**
- `--id` / `-i`: Clear specific PlentyONE variation ID(s). Comma-separated values
- `--force` / `-f`: Skip confirmation prompt
- `--dry-run` / `-d`: Preview mode - shows what would be cleared without making changes

**What it does:**
- Removes `product_id` (Magento product entity ID) from `plenty_stock_entity`
- Removes `sku` (Magento product SKU) from `plenty_stock_entity`
- Shows summary of stock records affected before clearing
- Provides next steps for re-mapping stock

**Dry Run Output Example:**
```bash
$ bin/magento plenty:stock:unmap --dry-run

PlentyONE Stock Mapping Cleaner

DRY RUN MODE - No changes will be made

Scope: All stock records with Magento product mappings

Summary:
  • Stock records to clear: 1,234
  • Fields to clear:
    - product_id (Magento product entity ID)
    - sku (Magento product SKU)

Dry run completed. No changes were made.
Run without --dry-run to apply changes.
```

**Clearing Specific Variations Example:**
```bash
$ bin/magento plenty:stock:unmap --id=12345,67890

PlentyONE Stock Mapping Cleaner

Scope: Stock records for variation IDs: 12345, 67890

Summary:
  • Stock records to clear: 2
  • Fields to clear:
    - product_id (Magento product entity ID)
    - sku (Magento product SKU)

Clear product mappings from 2 stock record(s)? [y/N] y

Clearing stock mappings...

✓ Stock mappings cleared successfully
  • Rows affected: 2 of 2 stock records

Next steps:
  1. Re-map stock to products: bin/magento plenty:stock:map
  2. Re-import stock: bin/magento plenty:stock:import
```

**Common Use Cases:**

1. **Switching Mapping Attributes**
   ```bash
   # Clear all mappings before changing mapping attribute
   bin/magento plenty:stock:unmap --force
   # Update mapping attribute in admin configuration
   # Re-map with new attribute
   bin/magento plenty:stock:map
   ```

2. **Troubleshooting Sync Issues**
   ```bash
   # Clear and re-map specific variations
   bin/magento plenty:stock:unmap --id=12345,67890
   bin/magento plenty:stock:map --id=12345,67890
   bin/magento plenty:stock:import
   ```

3. **Fresh Start**
   ```bash
   # Clear all mappings and re-import everything
   bin/magento plenty:stock:unmap --force
   bin/magento plenty:stock:map
   bin/magento plenty:stock:import
   ```

### Stock Cleanup

```bash
# Remove stock rows whose variation no longer exists (variation-orphan cleanup)
bin/magento plenty:stock:cleanup:orphan

# Remove stock rows for warehouses no longer in PlentyONE
bin/magento plenty:stock:cleanup:warehouse

# Clean up reservations
bin/magento plenty:stock:reservation:cleanup

# Clean up unassigned reservations
bin/magento plenty:stock:reservation:cleanup_unassigned

# Resolve order inconsistencies
bin/magento plenty:stock:reservation:resolve_order_inconsistency

# Resolve shipment inconsistencies
bin/magento plenty:stock:reservation:resolve_shipment_inconsistency

# Flush import listing
bin/magento plenty:stock:flush:import
```

#### Orphan Stock Cleanup

Remove `plenty_stock_entity` rows whose variation no longer exists in `plenty_variation_entity` — e.g. left behind after a variation is deleted in PlentyONE. Age-guarded: a stock row is only an orphan candidate once its `collected_at` is older than the retention window (so stock collected before its variation arrives isn't deleted prematurely). This is the manual equivalent of the `plenty_stock_orphan_cleanup` cron — it shares the same logic and safety guards but ignores the cron's enabled flag.

```bash
# Preview how many rows would be deleted (no changes)
bin/magento plenty:stock:cleanup:orphan --dry-run

# Delete orphaned stock rows
bin/magento plenty:stock:cleanup:orphan

# Override the retention window / batching for this run
bin/magento plenty:stock:cleanup:orphan --retention-days=30
bin/magento plenty:stock:cleanup:orphan --batch-size=2000 --max-batches=20
```

**Options:**
- `--dry-run`: Report how many rows would be deleted (with a sample of entity IDs), without deleting
- `--retention-days`: Override the retention window in days (default: admin config, minimum 1)
- `--batch-size`: Rows deleted per statement (default: admin config)
- `--max-batches`: Max batches per run — a blast-radius cap (default: admin config)

**Safety:** if `plenty_variation_entity` is empty (e.g. variations not yet collected), the command aborts rather than treating every stock row as an orphan.

**Configuration:** **Stores > Configuration > PlentyONE > Stock Config > Orphan Stock Cleanup** (disabled by default — destructive).

#### Deleted-Warehouse Stock Cleanup

Remove `plenty_stock_entity` rows for warehouses that no longer exist in PlentyONE (their `warehouse_id` is not among the locally-collected warehouse config). Distinct from orphan cleanup, which targets deleted *variations*.

```bash
# Preview what would be deleted
bin/magento plenty:stock:cleanup:warehouse --dry-run

# Delete (prompts for confirmation)
bin/magento plenty:stock:cleanup:warehouse
```

**Options:**
- `--dry-run`: Show what would be deleted without deleting

**Safety:** if no warehouses are found in the local config mirror, the command refuses to run rather than wiping the table. Collect the warehouse config first: `bin/magento plenty:stock:setup:collect`.

### Show Stock Mapping

Display product stock and warehouse mapping information between Magento MSI and PlentyONE. This diagnostic command helps troubleshoot stock synchronization issues, verify warehouse configurations, and identify discrepancies.

```bash
# Show stock mapping for a specific SKU
bin/magento plenty:stock:map:show --sku="PROD-123"
bin/magento plenty:stock:map:show -s "PROD-123"

# Show stock mapping for a product ID
bin/magento plenty:stock:map:show --product-id=7918
bin/magento plenty:stock:map:show -p 7918

# Show mapping for multiple products (comma-separated)
bin/magento plenty:stock:map:show -s "SKU1,SKU2,SKU3"
bin/magento plenty:stock:map:show -p "123,456,789"
```

**Options:**
- `--sku` / `-s`: Product SKU(s). Accepts comma-separated values
- `--product-id` / `-p`: Magento product ID(s). Accepts comma-separated values

**What it displays:**

**Product Information:**
- SKU, Product ID, Product Name
- Product Type
- Variation ID (PlentyONE mapping)

**Magento Stock (MSI):**
- Source code
- Quantity per source
- Stock status (In Stock / Out of Stock)
- Total quantity across all sources

**PlentyONE Stock:**
- Warehouse ID
- Physical stock
- Reserved stock
- Net stock (available)
- Last updated timestamp
- Total net stock across warehouses

**Stock Comparison:**
- Magento total vs PlentyONE total
- Difference calculation
- Match status indicator

**Warehouse Mapping:**
- MSI source to PlentyONE warehouse correlation
- Quantity comparison per warehouse
- Sync status for each mapping

**Example Output:**
```bash
$ bin/magento plenty:stock:map:show -s "PROD-123"

Stock Mapping Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Product Information:
SKU           PROD-123
Product ID    7918
Product Name  Sample Product
Type          simple
Variation ID  31014

Magento Stock (MSI):
Source Code  Quantity  Status
default      100       In Stock
warehouse1   50        In Stock
TOTAL        150

PlentyONE Stock:
Warehouse ID  Physical  Reserved  Net Stock  Updated At
101           100       10        90         2025-10-27 14:30:00
102           60        5         55         2025-10-27 14:30:00
TOTAL                             145

Stock Comparison:
Magento Total Stock    150
PlentyONE Total Stock  145
Difference             5
Status                 ⚠ Difference: +5

Warehouse Mapping:
MSI Source  MSI Qty  PlentyONE Warehouse  Plenty Net Stock  Status
default     100      101                  90                ⚠ Diff: +10
warehouse1  50       102                  55                ⚠ Diff: -5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary: 1 product(s) displayed
```

**Common Use Cases:**

1. **Troubleshoot Stock Sync Issues**
   ```bash
   # Check if stock levels match between systems
   bin/magento plenty:stock:map:show -s "PROD-123"
   ```

2. **Verify Warehouse Configuration**
   ```bash
   # Ensure MSI sources map correctly to PlentyONE warehouses
   bin/magento plenty:stock:map:show --product-id=7918
   ```

3. **Identify Stock Discrepancies**
   ```bash
   # Find products with mismatched stock levels
   bin/magento plenty:stock:map:show -s "SKU1,SKU2,SKU3"
   ```

4. **Audit Stock Data**
   ```bash
   # Verify stock data exists in PlentyONE tables
   bin/magento plenty:stock:map:show -p 123
   ```

**Possible Status Messages:**
- `✓ Match` - Stock levels are synchronized
- `⚠ Difference: +/-N` - Stock mismatch detected
- `⚠ Product not mapped to PlentyONE` - No variation ID set
- `No PlentyONE stock data found` - Run `bin/magento plenty:stock:collect`
- `No MSI stock sources assigned` - Product has no MSI sources

**Important Notes:**
- Product must be mapped to a PlentyONE variation
- Stock data must be collected: `bin/magento plenty:stock:collect`
- MSI sources must be configured and assigned
- Warehouse mapping is based on configuration: **Stores > Configuration > PlentyONE > Stock Settings**

### Show Inventory Reservations

Display inventory reservations with parsed metadata. This diagnostic command helps troubleshoot MSI reservation issues, track order-related stock holds, and identify reservation inconsistencies.

```bash
# Show all reservations for a SKU
bin/magento plenty:stock:reservations:show --sku="PROD-123"
bin/magento plenty:stock:reservations:show -s "PROD-123"

# Filter by source code
bin/magento plenty:stock:reservations:show --source-code="default"
bin/magento plenty:stock:reservations:show -c "default"

# Filter by stock ID
bin/magento plenty:stock:reservations:show --stock-id=1
bin/magento plenty:stock:reservations:show -i 1

# Filter by event type
bin/magento plenty:stock:reservations:show -s "PROD-123" --event-type="order_placed"
bin/magento plenty:stock:reservations:show -s "PROD-123" -e "order_canceled"

# Filter by object type
bin/magento plenty:stock:reservations:show -s "PROD-123" --object-type="order"
bin/magento plenty:stock:reservations:show -s "PROD-123" -o "shipment"

# Show detailed metadata
bin/magento plenty:stock:reservations:show -s "PROD-123" --detailed
bin/magento plenty:stock:reservations:show -s "PROD-123" -d
```

**Options:**
- `--sku` / `-s`: Product SKU
- `--source-code` / `-c`: Source code filter
- `--stock-id` / `-i`: Stock ID filter
- `--event-type` / `-e`: Event type (e.g., order_placed, order_canceled, shipment_created)
- `--object-type` / `-o`: Object type (e.g., order, shipment, creditmemo)
- `--detailed` / `-d`: Show full metadata and detailed breakdown

**What it displays:**

**Summary View:**
- Reservation ID
- SKU
- Stock ID
- Quantity (negative = reserved, positive = released)
- Event type
- Object information (type and increment ID)
- Source code

**Detailed View:**
- Full reservation details per entry
- Complete metadata JSON
- Event type, object type, object ID
- Source code assignment

**Statistics:**
- Total reservation count
- Total quantity reserved
- Breakdown by event type
- Breakdown by source code
- Breakdown by object type

**Example Output:**
```bash
$ bin/magento plenty:stock:reservations:show -s "24-WB05-REAL"

Inventory Reservations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ID    SKU           Stock  Qty      Event          Object        Source
1234  24-WB05-REAL  1      -2.00    order_placed   Order #123    default
1235  24-WB05-REAL  1      -1.00    order_placed   Order #124    warehouse1
1236  24-WB05-REAL  1      +1.00    order_canceled Order #120    default

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Statistics:

Total Reservations       3
Total Quantity Reserved  -2.00

By Event Type:
Event Type       Quantity
order_placed     -3.00
order_canceled   +1.00

By Source Code:
Source Code  Quantity
default      -1.00
warehouse1   -1.00

By Object Type:
Object Type  Quantity
order        -2.00
```

**Metadata Structure:**
```json
{
  "event_type": "order_placed",
  "object_type": "order",
  "object_id": "86",
  "object_increment_id": "000000020-20",
  "source_code": "ks_berlin"
}
```

**Common Use Cases:**

1. **Track Order Reservations**
   ```bash
   # See all reservations for a product
   bin/magento plenty:stock:reservations:show -s "PROD-123"
   ```

2. **Debug Stock Issues**
   ```bash
   # Find reservations by source
   bin/magento plenty:stock:reservations:show --source-code="default"
   ```

3. **Audit Reservation Events**
   ```bash
   # See canceled orders
   bin/magento plenty:stock:reservations:show -s "PROD-123" -e "order_canceled"
   ```

4. **Investigate Inconsistencies**
   ```bash
   # Get detailed breakdown
   bin/magento plenty:stock:reservations:show -s "PROD-123" --detailed
   ```

**Event Types:**
- `order_placed` - Reservation created when order placed
- `order_canceled` - Reservation released when order canceled
- `shipment_created` - Stock committed on shipment
- `creditmemo_created` - Stock returned via credit memo
- `client_reserved` - External reservation (PlentyONE)
- `client_released` - External reservation release

**Important Notes:**
- Negative quantity = stock reserved (not available)
- Positive quantity = stock released (available again)
- External reservations (PlentyONE) use `client_reserved`/`client_released` events
- Metadata parsing requires proper JSON format in database

### Show Product Availability

Display product availability per source code with reservation breakdown. This diagnostic command shows saleable quantity calculations, helping troubleshoot stock availability issues.

```bash
# Show availability for a SKU
bin/magento plenty:stock:availability:show --sku="PROD-123"
bin/magento plenty:stock:availability:show -s "PROD-123"

# Show for multiple SKUs
bin/magento plenty:stock:availability:show -s "PROD-123,PROD-456,PROD-789"

# Filter by source code
bin/magento plenty:stock:availability:show -s "PROD-123" --source-code="default"
bin/magento plenty:stock:availability:show -s "PROD-123" -c "default"

# Show detailed reservation breakdown
bin/magento plenty:stock:availability:show -s "PROD-123" --detailed
bin/magento plenty:stock:availability:show -s "PROD-123" -d
```

**Options:**
- `--sku` / `-s`: Product SKU(s). Accepts comma-separated values
- `--source-code` / `-c`: Filter by specific source code
- `--detailed` / `-d`: Show detailed reservation breakdown (internal vs external)

**What it displays:**

**Standard View:**
- Source code
- Physical quantity (actual stock in warehouse)
- Reserved quantity (total reservations)
- Saleable quantity (physical + reserved)
- Stock status (In Stock / Out of Stock)
- Totals across all sources

**Detailed View:**
- Internal reservations (Magento orders)
- External reservations (PlentyONE sync)
- Total reserved
- Breakdown by event type
- Count of reservations per event

**Example Output:**
```bash
$ bin/magento plenty:stock:availability:show -s "24-WB05-REAL"

Product Availability per Source
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SKU: 24-WB05-REAL

Source      Qty (Physical)  Qty (Reserved)  Qty (Saleable)  Status
default     100.00          -12.00          88.00           In Stock
warehouse1  50.00           -5.00           45.00           In Stock
TOTAL       150.00          -17.00          133.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary: 1 product(s) displayed
```

**Detailed Output Example:**
```bash
$ bin/magento plenty:stock:availability:show -s "24-WB05-REAL" --detailed

Product Availability per Source
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SKU: 24-WB05-REAL

Source      Qty (Physical)  Qty (Reserved)  Qty (Saleable)  Status
default     100.00          -12.00          88.00           In Stock
TOTAL       100.00          -12.00          88.00

Reservation Breakdown:

  Source: default
  Internal (Magento)   -8.00
  External (PlentyONE) -4.00
  Total Reserved       -12.00

  By Event Type:
  Event Type       Quantity  Count
  order_placed     -8.00     3
  client_reserved  -4.00     1
```

**How Saleable Quantity is Calculated:**
```
Saleable Qty = Physical Qty + Reserved Qty

Example:
Physical: 100.00
Reserved: -12.00 (negative because it's reserved)
Saleable: 100.00 + (-12.00) = 88.00
```

**Common Use Cases:**

1. **Check Product Availability**
   ```bash
   # Quick availability check
   bin/magento plenty:stock:availability:show -s "PROD-123"
   ```

2. **Compare Multiple Products**
   ```bash
   # Check several SKUs at once
   bin/magento plenty:stock:availability:show -s "SKU1,SKU2,SKU3"
   ```

3. **Analyze Specific Source**
   ```bash
   # Check only default warehouse
   bin/magento plenty:stock:availability:show -s "PROD-123" -c "default"
   ```

4. **Debug Reservation Issues**
   ```bash
   # See internal vs external reservations
   bin/magento plenty:stock:availability:show -s "PROD-123" --detailed
   ```

5. **Troubleshoot Negative Stock**
   ```bash
   # Find why saleable qty is negative
   bin/magento plenty:stock:availability:show -s "PROD-123" -d
   ```

**Reservation Types:**
- **Internal (Magento)**: Reservations created by Magento orders, shipments, credit memos
- **External (PlentyONE)**: Reservations synced from PlentyONE (`client_reserved` events)

**Color Coding:**
- **Green (positive)**: Available stock
- **Red (negative)**: Reserved/oversold stock
- **Yellow**: Released reservations

**Important Notes:**
- Physical quantity comes from `inventory_source_item` table
- Reserved quantity is sum of all reservations (negative values)
- Saleable quantity is what's available for sale
- External reservations are managed by PlentyONE sync
- Uses `Byte8\PlentyStock` repositories for accurate data

### Stock Drift Detection & Reporting

Detect physical-stock discrepancies between Magento and PlentyONE, and optionally trigger the automated drift safety-net on demand. Physical stock is the authoritative signal the report alarms on; PlentyONE reserved/net are shown as context only.

This one command is the manual entry point for two scheduled jobs:
- the hourly `plenty_stock_drift_log_sync` cron (drift tracking + auto-fix) — `--fix`
- the weekly `plenty_stock_drift_report` email cron — `--email`

```bash
# Read-only report: SKUs whose Magento physical differs from PlentyONE
bin/magento plenty:stock:drift:report

# Inspect a single profile only
bin/magento plenty:stock:drift:report --profile=5
bin/magento plenty:stock:drift:report -p 5

# Show more rows / change the tolerance
bin/magento plenty:stock:drift:report --limit=200
bin/magento plenty:stock:drift:report --tolerance=0.5

# Run the tracker now: record drift persistence + auto-fix
#   import  -> collect from PlentyONE and re-pend (re-import)
#   export  -> re-enqueue the SKUs for export
bin/magento plenty:stock:drift:report --fix

# Send the drift report email now (forces send, ignores the enabled flag)
bin/magento plenty:stock:drift:report --email
```

**Options:**
- `--profile` / `-p`: Inspect a single profile ID instead of the default import(+export) scope
- `--limit` / `-l`: Maximum rows to display (default: 50)
- `--tolerance` / `-t`: Drift tolerance override (default: 0.0001)
- `--fix`: Run the tracker now — record persistence in `plenty_stock_drift_log` and attempt the direction-aware auto-fix (mutates data)
- `--email`: Send the drift report email immediately, regardless of the enabled flag

**How it works:**
- **Default (no flags) — read-only.** Compares `inventory_source_item.quantity` (Magento) against `plenty_stock_entity.stock_physical` (PlentyONE) for every mapped source/warehouse, largest discrepancy first.
- **`--fix`** mirrors the hourly cron: drift the auto-fix clears disappears next cycle; drift that persists past the threshold is escalated to the report.
- **`--email`** mirrors the weekly cron: emails only the SKUs that have stayed out of sync past the persistence threshold (the ones needing manual review). A clean week sends no email.

**Example Output:**
```bash
$ bin/magento plenty:stock:drift:report

PlentyONE ↔ Magento physical-stock drift report
============================================================

Drifted SKUs: 3   |   Total |Δ|: 17

 SKU       Source   Whse  Mage phys  Plenty phys  Δ (mage-plenty)  Plenty resv  Plenty net
 PROD-123  default  101   5          12           -7               2            10
 PROD-456  default  101   8          4            4                0            4
 PROD-789  default  102   0          6            -6               0            6

Note: physical is the authoritative signal; Plenty reserved/net are context only.
```

**Configuration:** **Stores > Configuration > PlentyONE > Stock Config**:
- **Stock Drift Detection** — enable/disable + cron schedule for the hourly tracker
- **Stock Drift Report** — enable/disable, cron schedule, persistence threshold (hours), and recipient email(s) for the weekly report

#### Enqueue Drifted SKUs for Export

`plenty:stock:export:drift` is a focused companion to the report: it detects drift between Magento and PlentyONE and **enqueues the affected SKUs onto the stock export queue** (rather than printing a report):

```bash
# Detect drift and enqueue affected SKUs
bin/magento plenty:stock:export:drift

# Limit scope to a profile / cap the number of SKUs
bin/magento plenty:stock:export:drift --profile=5
bin/magento plenty:stock:export:drift --limit=200
```

**Options:**
- `--profile` / `-p`: Restrict to a single profile ID
- `--limit` / `-l`: Maximum number of SKUs to enqueue

### Stock Reconciliation & Correction

```bash
# Report stock inconsistencies (read-only); --fix attempts repairs
bin/magento plenty:stock:reconcile
bin/magento plenty:stock:reconcile --fix
bin/magento plenty:stock:reconcile --limit=100

# Correct a storage-location quantity in PlentyONE
bin/magento plenty:stock:location:correct \
  --warehouse-id=101 --storage-location-id=5 --variation-id=12345 --quantity=10

# Preview the correction without writing
bin/magento plenty:stock:location:correct ... --dry-run
```

**`plenty:stock:reconcile` options:**
- `--fix`: Attempt to repair detected inconsistencies (mutates data)
- `--limit` / `-l`: Max sample rows to display per issue

**`plenty:stock:location:correct` options:**
- `--warehouse-id` / `-w`, `--storage-location-id` / `-l`, `--variation-id` / `-i`, `--reason-id` / `-r`: Target the correction
- `--quantity`: Target quantity to set
- `--batch-size` / `-b`: Rows processed per batch
- `--dry-run`: Preview without writing
- `--force` / `-f`: Skip confirmation

### Stock Setup Commands

```bash
# Collect stock configuration
bin/magento plenty:stock:setup:collect

# Collect specific config types / list available types
bin/magento plenty:stock:setup:collect --type=warehouse
bin/magento plenty:stock:setup:collect --list
```

**Options:**
- `--type` / `-t`: Specific config types to collect, comma-separated
- `--list` / `-l`: List available collector types

:::note Deprecated
`plenty:stock:client:collect` is **deprecated** — use `plenty:stock:setup:collect` instead.
:::

## Category Commands

### Category Import

Import categories from PlentyONE:

```bash
# Import all categories
bin/magento plenty:category:import --profile=<profile_id>

# Import with verbose output
bin/magento plenty:category:import --profile=6 --verbose
```

### Category Export

Export categories from Magento to PlentyONE:

```bash
# Export all categories
bin/magento plenty:category:export --profile=<profile_id>

# Export specific category
bin/magento plenty:category:export --id=<category_id>

# Export with verbose mode
bin/magento plenty:category:export --profile=6 --verbose
```

### Category Collection

Collect category data from PlentyONE:

```bash
# Collect categories
bin/magento plenty:category:collect --profile=<profile_id>

# Collect specific categories
bin/magento plenty:category:collect --id=10,11,12
```

### Category Path Building

Build category path hierarchy:

```bash
bin/magento plenty:category:build
```

### Category Export Queue

Add categories to export queue:

```bash
bin/magento plenty:category:add --id=<category_id>
```

### Category Maintenance

```bash
# Clear category data
bin/magento plenty:category:purge
```

## Customer Commands

### Customer Export

Export customers from Magento to PlentyONE:

```bash
# Export single customer
bin/magento plenty:customer:export --id=<customer_id>

# Export multiple customers
bin/magento plenty:customer:export --id=1,2,3

# Export with profile
bin/magento plenty:customer:export --profile=7 --verbose
```

### Customer Import

Import customers from PlentyONE:

```bash
# Import all customers
bin/magento plenty:customer:import --profile=<profile_id>

# Import with verbose output
bin/magento plenty:customer:import --profile=8 --verbose
```

### Customer Collection

Collect customer data from PlentyONE:

```bash
# Collect contacts (customers)
bin/magento plenty:contact:collect --profile=<profile_id>

# Collect addresses
bin/magento plenty:address:collect --profile=<profile_id>

# Collect specific contacts
bin/magento plenty:contact:collect --id=12345
```

### Customer Maintenance

```bash
# Clear customer data
bin/magento plenty:customer:purge
```

### Customer Setup Commands

```bash
# Complete customer setup
bin/magento plenty:customer:config:init

# Collect customer configuration
bin/magento plenty:customer:setup:collect

# Create customer properties
bin/magento plenty:customer:config:create-initial-properties
```

## Attribute Commands

### Attribute Export

Export product attributes to PlentyONE:

```bash
# Export all attributes
bin/magento plenty:attribute:export

# Export specific attributes by code
bin/magento plenty:attribute:export --code=color,size

# Export specific attributes by ID
bin/magento plenty:attribute:export --id=12,34
```

**Options:**
- `--code` / `-c`: Attribute code filter. Comma-separated values
- `--id` / `-i`: Attribute ID filter. Comma-separated values

### Attribute & Manufacturer Collection

Collect attribute and manufacturer data from PlentyONE:

```bash
# Collect all attributes
bin/magento plenty:attribute:collect

# Collect manufacturers/brands
bin/magento plenty:manufacturer:collect

# Collect by ID or modified-since date
bin/magento plenty:attribute:collect --id=12,34
bin/magento plenty:manufacturer:collect --date=2025-01-01
```

**Options (both commands):**
- `--id` / `-i`: ID filter. Comma-separated values
- `--date` / `-d`: Collect records modified since the given date

### Attribute Maintenance

```bash
# Clear attribute data
bin/magento plenty:attribute:purge
```

## Property Commands

### Property Import

Import properties from PlentyONE:

```bash
# Import all properties
bin/magento plenty:property:import --profile=<profile_id>

# Import with verbose output
bin/magento plenty:property:import --profile=9 --verbose
```

### Property Export

Export properties to PlentyONE:

```bash
# Export properties
bin/magento plenty:property:export --profile=<profile_id>

# Export property groups
bin/magento plenty:property:group:export
```

### Property Collection

Collect property data:

```bash
# Collect properties
bin/magento plenty:property:collect --profile=<profile_id>
```

### Create Attribute Set Property

Create properties for attribute sets:

```bash
bin/magento plenty:property:create:attribute_set
```

### Property Maintenance

```bash
# Clear property data
bin/magento plenty:property:purge
```

## Referrer Commands

### Create Referrer

Create order referrer in PlentyONE:

```bash
# Create default referrer
bin/magento plenty:client:create_referrer

# Create specific referrer
bin/magento plenty:client:create_referrer --name="magento" --type=1
```

### Create Media Referrer

Create media type referrers:

```bash
bin/magento plenty:client:create_referrer_media
```

## Profile Management Commands

### Profile Status Dashboard

Display comprehensive profile status dashboard showing all profiles, their schedules, execution history, and performance statistics. This diagnostic command provides operational oversight of the entire synchronization system.

```bash
# Show all profiles
bin/magento plenty:profile:status

# Show specific profile by type ID
bin/magento plenty:profile:status --profile=item_import
bin/magento plenty:profile:status -p item_import

# Show detailed information with recent activity
bin/magento plenty:profile:status --verbose
bin/magento plenty:profile:status -v
```

**Options:**
- `--profile` / `-p`: Show specific profile by type ID (e.g., item_import, order_export, stock_import)
- `--verbose` / `-v`: Show detailed history and recent activity (last 10 runs)

**What it displays:**

**For Each Profile:**
- Profile Type ID and Entity ID
- Created date
- Schedule status (Active/Disabled)
- Cron expression
- Last run timestamp
- Last run status
- 30-day statistics

**Statistics (Last 30 Days):**
- Total runs
- Success count
- Error count
- Processing/pending count
- Success rate percentage

**Verbose Mode Shows:**
- Recent activity (last 10 runs)
- Execution timestamps
- Status for each run
- Messages and errors

**Summary (All Profiles View):**
- Total number of profiles
- Active schedules count
- Total runs in last 30 days
- Recent errors count

**Example Output:**
```bash
$ bin/magento plenty:profile:status

PlentyONE Profile Status Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Item Import (ID: 1)
Type ID           item_import
Created           2025-09-15 10:00:00
Schedule Status   ✓ Active
Cron Expression   */15 * * * *
Schedule Name     Item Import Every 15 Minutes
Last Run          2025-10-27 14:30:00
Last Status       SUCCESS

  Statistics (Last 30 Days):
  Total Runs    2,880
  Success       2,850
  Errors        5
  Processing    0
  Success Rate  98.9%

Order Export (ID: 3)
Type ID           order_export
Created           2025-09-15 10:00:00
Schedule Status   ✓ Active
Cron Expression   */5 * * * *
Schedule Name     Order Export Every 5 Minutes
Last Run          2025-10-27 14:35:00
Last Status       SUCCESS

  Statistics (Last 30 Days):
  Total Runs    8,640
  Success       8,632
  Errors        8
  Processing    0
  Success Rate  99.9%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary

Total Profiles       5
Active Schedules     5
Total Runs (30 days) 15,120
Recent Errors        0
```

**Verbose Output Example:**
```bash
$ bin/magento plenty:profile:status -p item_import -v

PlentyONE Profile Status Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Item Import (ID: 1)
[... basic information ...]

  Recent Activity (Last 10 Runs):
  Date/Time            Status   Type         Message
  2025-10-27 14:30:00  SUCCESS  item_import  Imported 15 items successfully
  2025-10-27 14:15:00  SUCCESS  item_import  Imported 8 items successfully
  2025-10-27 14:00:00  SUCCESS  item_import  No new items to import
  2025-10-27 13:45:00  SUCCESS  item_import  Imported 23 items successfully
  2025-10-27 13:30:00  ERROR    item_import  API connection timeout
  ...
```

**Common Use Cases:**

1. **Monitor System Health**
   ```bash
   # Get overview of all profiles
   bin/magento plenty:profile:status
   ```

2. **Troubleshoot Specific Profile**
   ```bash
   # View detailed history for failing profile
   bin/magento plenty:profile:status -p order_export -v
   ```

3. **Verify Schedule Configuration**
   ```bash
   # Check if schedules are active
   bin/magento plenty:profile:status
   ```

4. **Analyze Performance**
   ```bash
   # Review success rates and error counts
   bin/magento plenty:profile:status -v
   ```

5. **Audit Profile Activity**
   ```bash
   # See recent execution history
   bin/magento plenty:profile:status -p stock_import -v
   ```

**Status Color Coding:**
- **Green (SUCCESS/COMPLETE)**: Successful execution
- **Red (ERROR/FAILED)**: Failed execution
- **Yellow (PROCESSING/PENDING)**: Currently running or queued

**Possible Status Messages:**
- `✓ Active` - Schedule is enabled and running
- `Disabled` - Schedule is disabled
- `Not Configured` - No schedule exists for this profile
- `Never` - Profile has never been executed

**Important Notes:**
- Statistics are calculated for the last 30 days only
- Schedule configuration: **Stores > Configuration > PlentyONE > [Module] > Schedule**
- Profile history is stored in `byte8_profile_history` table
- Cron must be configured and running for scheduled execution

### Profile Configuration Export/Import

```bash
# Export all profile configuration
bin/magento profile:config:export

# Export a specific profile type by ID
bin/magento profile:config:export --id=<profile_type_id>

# Import profile configuration from a file
bin/magento profile:config:import --file=config.json
```

**Options:**
- `profile:config:export` — `--id` / `-i`: Profile type ID filter (exports all when omitted)
- `profile:config:import` — `--file` / `-f`: Source filename (required)

### Profile Data Purge

Purges data from `byte8_*` tables (preserving `byte8_profile_entity`):

```bash
# Purge data for a specific profile
bin/magento profile:data:purge --profile-id=<profile_id>

# Purge all profile data (prompts for confirmation)
bin/magento profile:data:purge

# Skip the confirmation prompt
bin/magento profile:data:purge --force
```

**Options:**
- `--profile-id`: Restrict purge to a specific profile ID
- `--force` / `-f`: Force purge without confirmation

## Logging Commands

### Log Collection

```bash
# Collect API logs
bin/magento plenty:log:collect

# Collect with date filter
bin/magento plenty:log:collect --date="2025-01-01"
```

### Log Processing

```bash
# Process and analyze logs
bin/magento plenty:log:process

# Process specific log types
bin/magento plenty:log:process --type=error
```

## Notification Commands

### Send Batch Emails

Send profile notification emails:

```bash
# Send queued batch email notifications
bin/magento byte8:notification:send-batch-emails
```

This command takes no options — it flushes any pending batch notification emails. Batch sending is normally triggered automatically by cron.

## Maintenance Commands

### Flush Data

Clear module-specific data:

```bash
# Clear client config data
bin/magento plenty:client:purge:config-data

# Clear item data
bin/magento plenty:item:purge

# Clear order data
bin/magento plenty:order:flush

# Clear customer data
bin/magento plenty:customer:purge

# Clear category data
bin/magento plenty:category:purge

# Clear attribute data
bin/magento plenty:attribute:purge

# Clear property data
bin/magento plenty:property:purge
```

Purge **all** PlentyONE data at once (every `plenty_*` table):

```bash
# List the tables that would be purged
bin/magento plenty:data:purge --list-tables

# Purge all plenty_* data (prompts for confirmation)
bin/magento plenty:data:purge

# Restrict to a profile / skip confirmation
bin/magento plenty:data:purge --profile-id=4
bin/magento plenty:data:purge --force
```

**`plenty:data:purge` options:**
- `--list-tables` / `-l`: List the `plenty_*` tables that would be purged
- `--profile-id`: Restrict purge to a specific profile
- `--force` / `-f`: Skip confirmation

### Clean Static View Files

```bash
# Clean static view files from pub/static
bin/magento pub:static:clean
```

## Testing & Development Commands

### Generate Fake Data (Development)

```bash
# Generate fake customers
bin/magento faker:generate:customers --count=100

# Generate fake orders
bin/magento faker:generate:orders --count=50
```

## Common Command Patterns

### Verbose Mode

Add `--verbose` or `-v` to most commands for detailed output:

```bash
bin/magento plenty:order:export --id=123 --verbose
```

### Profile Selection

Most domain commands support profile selection:

```bash
--profile=<profile_id>  # Use specific profile
-p <profile_id>         # Short form
```

### Date Filters

Commands support various date filters:

```bash
--date="2025-01-13"                  # Specific date
--date="2025-01-01/2025-01-31"       # Date range
--date-created="2025-01-01"          # Creation date
--date-updated="2025-01-01"          # Update date
```

### ID Filters

```bash
--id=123               # Single ID
--id=123,124,125      # Multiple IDs
```

## Command Chaining

Chain commands for complex workflows:

```bash
# Complete sync workflow
bin/magento plenty:category:import && \
bin/magento plenty:attribute:collect && \
bin/magento plenty:item:import && \
bin/magento plenty:stock:import

# Export with validation
bin/magento plenty:order:validate --id=123 && \
bin/magento plenty:order:export --id=123
```

## Tips & Best Practices

1. **Use verbose mode during testing:** `-v` or `--verbose`
2. **Start with small batches:** Test with single items before bulk operations
3. **Check logs:** Always monitor `var/log/plenty_*.log` files
4. **Use dry-run when available:** Preview operations before execution
5. **Profile-specific commands:** Always specify `--profile` for multi-profile setups
6. **Background execution:** Use `&` for long-running commands in production

## Related Documentation

- **[Testing Documentation](/docs/category/testing)** - Test each command type
- **[Profile Scheduling](/docs/profiles/scheduling)** - Automate with cron
- **[Troubleshooting](/docs/category/troubleshooting)** - Command issues
- **[Address Data Integrity](/docs/monitoring/address-data-integrity)** - Address audit and resolution commands

---

**Pro Tip:** Use `bin/magento list plenty` to see all available Mage2Plenty commands with descriptions.

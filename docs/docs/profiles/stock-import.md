---
sidebar_position: 13
title: Stock Import Profile
description: Import inventory levels from PlentyONE to Magento using the Stock Import Profile
---

# Stock Import Profile

The **Stock Import Profile** synchronizes inventory levels from PlentyONE to Magento, managing both physical stock quantities and inventory reservations across single or multiple warehouse sources with full Multi-Source Inventory (MSI) support.

## Overview

**Profile Type ID**: `plenty_stock_import`
**Direction**: PlentyONE → Magento
**Purpose**: Import real-time stock quantities and reservations from PlentyONE warehouses to Magento inventory sources

### Architecture

The Stock Import system uses a sophisticated 4-stage pipeline architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                     STOCK IMPORT PIPELINE                        │
└─────────────────────────────────────────────────────────────────┘

STAGE 1: COLLECTION (StockCollectService)
├─ API Request: GET /rest/stockmanagement/stock
├─ Pagination: Process in batches (default: 50 items per page)
├─ Filters: warehouseId, variationId, updatedAtFrom/To
├─ Database: Insert/update plenty_stock table (UPSERT)
└─ Status: Mark as PENDING for processing

STAGE 2: PRE-PROCESSORS (Validation & Preparation)
├─ SkuAssignment (sortOrder: 10)
│  └─ Maps PlentyONE variation IDs → Magento SKUs
├─ NumberAssignment (sortOrder: 20)
│  └─ Assigns tracking numbers to inventory items
├─ SourceAssignment (sortOrder: 30)
│  └─ Maps warehouse IDs → Magento source codes (MSI)
├─ ValidateWarehouse (sortOrder: 40)
│  └─ Validates warehouse mappings exist
├─ ReservationCleanup (sortOrder: 50)
│  └─ Removes stale or invalid reservations
└─ Validation (sortOrder: 60)
   ├─ SkuAssignment validator → Validates SKU mappings
   └─ StockManagement validator → Validates stock quantities

STAGE 3: GENERATORS (Build Update Requests)
├─ SourceAssignment (sortOrder: 10)
│  └─ Processes unmapped reservation source codes
├─ StockPhysical (sortOrder: 20)
│  ├─ Smart quantity selection:
│  │  ├─ Reservations ACTIVE → Physical stock
│  │  └─ Reservations INACTIVE → Net stock (physical - reserved)
│  ├─ Validates source items before queuing
│  ├─ Skips updates when quantity unchanged
│  └─ Enforces non-negative stock quantities
└─ StockReservation (sortOrder: 30)
   ├─ Calculates reservation adjustments
   ├─ Safety checks prevent over-releasing
   └─ Metadata tracking: event_type, object_type, source_code

STAGE 4: PROCESSORS (Execute Database Operations)
├─ StockPhysical (sortOrder: 10)
│  ├─ Saves physical stock quantities
│  ├─ Row-level locking (SELECT ... FOR UPDATE)
│  ├─ Transaction-based updates
│  └─ Fallback to standard save on lock failures
└─ StockReservation (sortOrder: 20)
   ├─ Saves reservation adjustments
   ├─ SKU-level locking at product_entity table
   ├─ Groups reservations by SKU for efficiency
   └─ Atomic operations per SKU

STAGE 5: POST-PROCESSORS (Finalization & Cleanup)
├─ SaveEntity (sortOrder: 10)
│  ├─ Persists inventory entity status changes
│  ├─ Updates processed timestamps
│  └─ Tracks successful variation IDs
├─ History (sortOrder: 20)
│  └─ Records processing history (audit trail)
└─ DataLog (sortOrder: 30)
   └─ Logs detailed processing information
```

### Key Features

**Performance Optimization**:
- **Batch Processing**: Configurable batch sizes (default: 20 items)
- **Memory Management**: Explicit cleanup after each batch (gc_collect_cycles)
- **Pagination**: Prevents memory exhaustion on large datasets
- **Skip Logic**: No-op detection for unchanged quantities

**Concurrency Safety**:
- **Row-Level Locking**: For stock updates (SELECT ... FOR UPDATE)
- **SKU-Level Locking**: For reservations at product_entity table
- **Transaction Isolation**: Atomic operations per batch
- **Graceful Failure**: Fallback to standard save on lock failures

**Data Handling**:
- **Smart Quantity Selection**: Physical vs Net stock based on reservation mode
- **Reservation Adjustments**: Differential sync (PM total - Magento current)
- **Warehouse Mapping**: Flexible PlentyONE warehouse → Magento source mapping
- **Validation Framework**: Comprehensive pre-processing validation

**MSI (Multi-Source Inventory)**:
- Full MSI compatibility with source item management
- Source selection algorithms (Priority, Distance)
- Stock/source relationship management
- Reservation system integration

### What Gets Imported

| Data Type | Description | Source |
|-----------|-------------|--------|
| **Physical Stock** | Actual warehouse quantity | `stockPhysical` from PlentyONE |
| **Reserved Stock** | Stock allocated to orders | `reservedStock` from PlentyONE |
| **Net Stock** | Physical - Reserved | Calculated: `stockNet` |
| **Stock Status** | In Stock / Out of Stock | Based on quantity thresholds |
| **Reservations** | Inventory reservations | Differential sync |
| **Source Assignment** | Warehouse → Source mapping | Configuration-based |

### Stock Calculation Modes

| Mode | Calculation | Use Case |
|------|-------------|----------|
| **Physical Stock** | Actual warehouse quantity | When reservations handled separately |
| **Net Stock** | Physical - Reserved | Conservative, prevents overselling |
| **Available Stock** | Physical - Reserved - Shipped | Most accurate availability |
| **Virtual Stock** | Physical + Incoming - Reserved | Include incoming stock |

---

## Configuration Sections

### 1. Client Configuration

**Fieldset**: `client_config`
**Purpose**: Configure PlentyONE client connection and metadata collection

#### Client Selection

**Field**: `client_id`
**Type**: Select (filterable UI-select)
**Scope**: Global
**Required**: Yes

Select the PlentyONE client configuration for stock synchronization.

:::info Single Client System
The Mage2Plenty connector operates on a single-client architecture. This field displays the configured client. Client configuration is managed in **Stores → Configuration → PlentyMarkets → Client**.
:::

**Configuration**:
- Client ID, name, and URL displayed
- OAuth credentials managed separately
- User/Owner ID for API authentication

**Listeners**:
- Reloads when new client created via modal
- Triggers UI updates on client change

#### Edit Client

**Button**: Edit (link-style button)
**Action**: Opens client edit modal

Edit the selected client's configuration without leaving the profile form.

#### New Client

**Button**: New Client
**Action**: Opens client creation modal

Create a new PlentyONE client configuration directly from the stock import profile form.

#### Client Management Modal

**Modal**: `create_client_modal`
**Title**: Client Management
**Form**: `plenty_client_form`

Inline client creation/editing for seamless configuration workflow.

#### Collect Configuration Data

**Button**: `collect_config_data_btn`
**Action**: Fetch metadata from PlentyONE API
**URL**: `plenty_stock/client/collectConfiguration`
**Style**: Primary button

Retrieves reference data required for stock import configuration:
- Warehouse list with IDs and names
- Source codes and priorities
- Stock types and availability flags
- Units of measurement
- Currency settings

**Usage**:
1. Click "Collect Configuration Data" button
2. Wait for collection to complete (10-30 seconds)
3. Refresh profile configuration page
4. Configuration dropdowns will now show PlentyONE warehouses

**When to Use**:
- Initial profile setup
- After creating new warehouses in PlentyONE
- When dropdown fields are empty
- After changing PlentyONE account structure

#### Delete Configuration Data

**Button**: `delete_config_data_btn`
**Action**: Clear cached configuration data
**URL**: `plenty_stock/client/deleteConfiguration`

Removes all collected metadata from Magento database.

**Use Cases**:
- Clean up before re-collecting fresh data
- Troubleshooting stale configuration issues
- Resetting after major PlentyONE warehouse changes

---

### 2. Schedule Configuration

**Fieldset**: `schedule_config`
**Purpose**: Configure automated stock import scheduling

#### Enable Schedule

**Field**: `status`
**Type**: Checkbox (toggle)
**Default**: No
**Scope**: Global

Enable automatic stock import processing via scheduler.

**Behavior**:
- **Enabled**: Profile runs on schedule, imports stock automatically
- **Disabled**: Profile skipped by cron, manual execution only

**Switcher Logic**:
When disabled, automatically disables:
- Schedule selection field
- Process batch size
- Onetime full process settings
- History logging

#### Schedule Selection

**Field**: `schedule_id`
**Type**: Select (filterable UI-select)
**Scope**: Global
**Required**: Yes (when schedule enabled)
**Depends**: `status = 1`

Select the cron schedule for automatic stock import.

**How It Works**:
- Runs via Magento cron according to selected schedule
- Typical frequencies: Every 5, 10, 15, 30 minutes, or hourly
- Processes stock items with status = PENDING
- Incremental sync (only changed items)

**Recommended Schedules**:
| Store Type | Frequency | Rationale |
|------------|-----------|-----------|
| High-traffic e-commerce | Every 5 minutes | Prevent overselling |
| Standard e-commerce | Every 15 minutes | Balance accuracy vs load |
| Low-traffic B2B | Every 30 minutes | Sufficient for slow-moving stock |
| Catalog with high stock | Hourly | Stock rarely changes |

#### Edit Schedule

**Button**: Edit (link-style)
**Action**: Opens schedule edit modal

Modify the selected schedule without leaving the form.

#### New Schedule

**Button**: New Schedule
**Action**: Opens schedule creation modal

Create a new cron schedule directly from the stock import profile form.

#### Schedule Management Modal

**Modal**: `create_schedule_modal`
**Title**: Schedule Management
**Form**: `byte8_profile_schedule_form`

Inline schedule creation/editing for seamless configuration workflow.

#### Process Batch Size

**Field**: `process_batch_size`
**Type**: Text (Integer)
**Default**: 20
**Scope**: Global
**Depends**: `status = 1`

Number of stock items to process per batch.

**Performance Characteristics**:

**Smaller Batches (10-30)**:
- ✅ Lower memory usage (predictable ~50-100 MB)
- ✅ Better error isolation (one bad item doesn't block others)
- ✅ Lower latency (faster individual updates)
- ✅ More responsive (frequent progress updates)
- ❌ More database transactions
- ❌ Slightly slower overall for large catalogs

**Larger Batches (50-200)**:
- ✅ Fewer database transactions (better for high-volume)
- ✅ More efficient for bulk operations
- ✅ Faster total processing time
- ❌ Higher memory usage (200-500 MB)
- ❌ Less granular error handling
- ❌ Longer waits between updates

**Recommendations**:
| Catalog Size | Server RAM | Batch Size | Notes |
|--------------|------------|------------|-------|
| < 1,000 SKUs | 2 GB | 20-30 | Conservative, minimal risk |
| 1,000-10,000 | 4 GB | 30-50 | Balanced performance |
| 10,000-50,000 | 8 GB | 50-100 | Higher throughput |
| > 50,000 | 16 GB+ | 100-200 | Enterprise-level processing |

**Memory Calculation**:
```
Memory per Item ≈ 2-3 MB (includes product data, source items, reservations)

Example:
Batch Size: 20
Memory Usage: 20 × 2.5 MB ≈ 50 MB + 50 MB overhead = 100 MB total
```

**Tuning Tips**:
- Start with default (20)
- Monitor memory: `watch -n 1 free -h`
- Increase if memory allows and processing is slow
- Decrease if encountering memory errors or timeouts

#### Enable Onetime Full Process

**Field**: `enable_onetime_full_process`
**Type**: Checkbox
**Default**: No
**Scope**: Global
**Depends**: `status = 1`

Enable periodic full stock synchronization.

**Purpose**: Complete stock sync on scheduled basis (separate from incremental updates)

**How It Works**:
- Processes entire stock catalog regardless of update timestamps
- Runs at specified frequency and time
- Separate from regular scheduled sync
- Resets all stock to PlentyONE values (master sync)

**Use Cases**:
- Weekly/monthly full stock reconciliation
- Verify data consistency after bulk operations
- Recover from sync issues or manual changes
- Audit trail for inventory accuracy

**Switcher Logic**:
When enabled, shows:
- Onetime Full Process Frequency
- Onetime Full Process Time

#### Onetime Full Process Frequency

**Field**: `onetime_full_process_frequency`
**Type**: Select
**Scope**: Global
**Required**: Yes (when onetime enabled)
**Depends**: `enable_onetime_full_process = 1`

How often the full stock synchronization runs.

**Options**:
- **Daily**: Every day at specified time
- **Weekly**: Every Sunday at specified time
- **Monthly**: First day of month at specified time

**Recommendations**:
| Catalog Size | Change Frequency | Recommended | Rationale |
|--------------|------------------|-------------|-----------|
| < 1,000 SKUs | High (frequent sales) | Daily | Ensure accuracy |
| 1,000-10,000 | Medium | Weekly | Balance integrity vs load |
| 10,000-50,000 | Low | Weekly | Catch any drift |
| > 50,000 | Very low | Monthly | Minimize resource usage |

#### Onetime Full Process Time

**Field**: `onetime_full_process_time`
**Type**: Time Picker (hour:minute format)
**Scope**: Global
**Required**: Yes (when onetime enabled)
**Depends**: `enable_onetime_full_process = 1`

Specific time when full process executes.

**Format**: HH:MM (24-hour format)
**Options**:
- Time only picker (no date)
- "Go Now" quick action button

**Best Practices**:
- Choose off-peak hours (1:00 AM - 5:00 AM)
- Avoid overlap with other profiles
- Consider timezone settings (server time)
- Allow 1-2 hours before business hours start
- Coordinate with product import schedules

**Example Configuration**:
```
Enable Onetime Full Process: Yes
Frequency: Weekly
Time: 02:00

Result: Full stock sync every Sunday at 2:00 AM
```

#### Enable History

**Field**: `enable_history`
**Type**: Checkbox
**Default**: Yes
**Scope**: Global
**Depends**: `status = 1`

Enable logging of all processed stock data.

**What Gets Logged**:
- Processing timestamp
- Status changes (PENDING → COMPLETE/ERROR)
- Quantity changes (before → after)
- Warehouse/source assignments
- Error messages and warnings
- Processing duration

**Benefits**:
- Track stock level changes over time
- Troubleshoot sync issues
- Audit trail for inventory accuracy
- Performance monitoring
- Compliance and reporting

**Storage Considerations**:
- History records accumulate over time
- Recommended: Enable automatic cleanup (30-90 days)
- High-frequency imports generate more history

**Disable When**:
- Storage is limited
- Processing speed is critical
- History not needed for compliance

#### View Schedules

**Button**: View Schedules (in schedule_listing_group)
**Action**: Opens schedule listing modal

Text: "An overview of your scheduled tasks and the next time they are scheduled to run. Your task schedule is defined within selected scheduler."

View all cron schedules, execution times, and next run times.

---

### 3. HTTP API Configuration

**Fieldset**: `api_config`
**Purpose**: Configure PlentyONE API request parameters

#### API Behaviour

**Field**: `api_behaviour`
**Type**: Select
**Scope**: Global
**Default**: append
**Required**: Yes

Define how API data is handled during collection.

**Options**:
- **append**: Add new records, update existing (recommended)
- **replace**: Replace all existing data with new data
- **delete**: Remove records not in API response

**Recommended**: **append** for standard stock sync

**How It Works**:
```
Append Mode:
- Fetches stock data from PlentyONE
- Updates existing stock records
- Adds new stock records for new products
- Preserves records not in current response

Replace Mode:
- Fetches stock data from PlentyONE
- Deletes all existing stock records
- Inserts all records from API response
- Use case: Complete database refresh

Delete Mode:
- Fetches stock data from PlentyONE
- Removes stock records NOT in API response
- Use case: Cleanup discontinued products
```

**Configuration Path**: `api_config/api_behaviour`

#### API Collection Size

**Field**: `collection_size`
**Type**: Text (Integer)
**Default**: 50
**Scope**: Global
**Data Scope**: `api_collection_size`

Number of stock items retrieved per API request from PlentyONE.

**Limits**:
- Minimum: 1
- Maximum: 500
- Default: 50
- Recommended: 50-100

**How It Works**:
```
Total Stock Items: 5,000
Collection Size: 50
API Requests: 100 (5,000 ÷ 50)

Each request: GET /rest/stockmanagement/stock?itemsPerPage=50&page=N
```

**Tuning Recommendations**:
| Network | PlentyONE Response Time | Collection Size |
|---------|------------------------|-----------------|
| Slow | > 5 seconds | 25 |
| Average | 2-5 seconds | 50 (default) |
| Fast | < 2 seconds | 100 |
| Very Fast | < 1 second | 200 |

**Trade-offs**:
- **Larger Size**: Fewer requests, faster total collection, more memory per request
- **Smaller Size**: More requests, slower total collection, less memory per request, more resilient

**Performance Impact**:
```
Example: 10,000 stock items

Collection Size 25:
- Requests: 400
- Time: ~20 minutes (3s per request)
- Memory: Low (predictable)

Collection Size 100:
- Requests: 100
- Time: ~8 minutes (slower per request, fewer total)
- Memory: Medium
- Recommended for most use cases

Collection Size 500 (max):
- Requests: 20
- Time: ~5 minutes (but may timeout)
- Memory: High
- Risk of timeouts on slow connections
```

**Configuration Path**: `api_config/api_collection_size`

---

### 4. Stock Configuration

**Fieldset**: `stock_config`
**Purpose**: Configure stock import settings, warehouse mappings, and MSI

#### Enable Stock Import

**Field**: `is_active`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Enable automatic import of stock levels from PlentyONE to Magento.

**Behavior**:
- **Enabled**: Stock quantities synchronized according to schedule and mappings
- **Disabled**: Stock import skipped entirely

**When to Enable**:
- After configuring warehouse mappings
- After testing with sample data
- When ready for production sync

**When to Disable**:
- During initial setup
- During product import
- During troubleshooting
- For manual stock management

#### Main Warehouse ID

**Field**: `main_warehouse_id`
**Type**: Select (filterable UI-select)
**Scope**: Global
**Required**: Yes

Select the default PlentyONE warehouse to use as fallback source.

**Purpose**: Fallback warehouse when specific mapping not found

**When Used**:
- Product stock from unmapped warehouse
- New products without source assignment
- Configuration errors or missing mappings
- Legacy products before MSI setup

**Configuration**:
- Source: Collected via "Collect Configuration Data"
- Lists all warehouses from PlentyONE
- Shows warehouse ID and name
- Example: "Main Warehouse (ID: 101)", "EU DC (ID: 103)"

**Best Practice**: Use your primary warehouse as main warehouse ID

#### Stock Source Mapping

**Field**: `stock_source_mapping`
**Type**: Dynamic Rows (repeatable)
**Scope**: Global

Map PlentyONE warehouses to Magento inventory sources.

**Structure per Row**:
- **Magento Source**: Magento MSI source code (dropdown)
- **PlentyONE Source**: PlentyONE warehouse ID (dropdown)
- **Delete Action**: Remove this mapping row

**How It Works**:
```
Stock Import Process:
1. Fetch stock from PlentyONE warehouse X
2. Lookup warehouse X in mapping configuration
3. Find corresponding Magento source Y
4. Update stock in Magento source Y
5. If no mapping found, use main warehouse as fallback
```

**Magento Source Options**:
- Source: MSI source table (`inventory_source`)
- Displays: source code, name, country
- Pre-requisite: Create sources in Magento first
- Example: "main_warehouse", "east_dc", "west_dc"

**PlentyONE Source Options**:
- Source: Collected configuration data
- Displays: warehouse ID and name
- Filters: Active warehouses only
- Example: "101 - Main Warehouse", "102 - East Coast DC"

**Single Source Example (Legacy/Non-MSI)**:
| Magento Source | PlentyONE Source |
|----------------|------------------|
| default | 101 (Main Warehouse) |

**Multi-Source Example (MSI)**:
| Magento Source | PlentyONE Source | Notes |
|----------------|------------------|-------|
| main_warehouse | 101 | Primary DC (CA) |
| east_dc | 102 | East Coast (NY) |
| west_dc | 103 | West Coast (WA) |
| eu_warehouse | 104 | European DC (DE) |
| drop_ship | 105 | Drop ship supplier |

**Advanced Multi-Source Setup**:
```
Scenario: E-commerce with Regional Fulfillment

PlentyONE Warehouses:
- 101: Main Distribution Center (Los Angeles)
- 102: East Coast Facility (New York)
- 103: Midwest Hub (Chicago)
- 104: Drop Ship Supplier (Various)

Magento MSI Sources:
- main_dc (Priority 1)
- east_coast (Priority 2)
- midwest (Priority 3)
- dropship (Priority 10)

Mapping:
Row 1: main_dc → 101
Row 2: east_coast → 102
Row 3: midwest → 103
Row 4: dropship → 104

Result: Orders fulfilled from nearest source based on algorithm
```

**Best Practices**:
- Always map at least one source (required for import)
- Map all active PlentyONE warehouses
- Use clear, consistent naming (warehouse codes)
- Test with one mapping first
- Document regional mappings
- Update mappings when opening new warehouses

**Troubleshooting**:
- **Stock not updating**: Verify warehouse is mapped
- **Wrong source getting stock**: Check mapping rows for duplicates
- **Missing source**: Collect configuration data to refresh options

#### Source Selection Algorithm

**Field**: `source_selection_algorithm`
**Type**: Select (filterable UI-select)
**Scope**: Global
**Required**: Yes

Select the MSI algorithm for assigning reservations to sources.

**Purpose**: Determines which source fulfills orders when multiple sources have stock

**Options**:

**Priority Algorithm** (Recommended):
- Fulfills from sources based on assigned priority
- Priority 1 sources checked first
- Falls back to Priority 2, 3, etc. if insufficient stock
- Deterministic and predictable
- Best for: Preferred warehouse strategy

**Distance Algorithm**:
- Calculates distance from shipping address to source
- Fulfills from nearest source with stock
- Uses latitude/longitude coordinates
- Best for: Geographic distribution, shipping cost optimization

**Custom Algorithms**:
- Third-party or custom implementations
- May appear if installed
- Check documentation for behavior

**How It Works (Priority Algorithm)**:
```
Order: 5 units of SKU123
Shipping to: New York

Sources with Stock:
- main_dc (Priority 1, CA): 100 units
- east_coast (Priority 2, NY): 50 units
- midwest (Priority 3, IL): 30 units

Source Selection:
1. Check Priority 1 (main_dc): 100 units available ✓
2. Allocate 5 units from main_dc
3. Create shipment from California

Result: Order fulfilled from Priority 1 source
```

**How It Works (Distance Algorithm)**:
```
Order: 5 units of SKU123
Shipping to: New York (40.7128° N, 74.0060° W)

Sources with Stock:
- main_dc (CA): 100 units, Distance: 2,800 mi
- east_coast (NY): 50 units, Distance: 10 mi
- midwest (IL): 30 units, Distance: 800 mi

Source Selection:
1. Calculate distances to shipping address
2. Sort by distance (ascending)
3. Check nearest source: east_coast (10 mi) ✓
4. Allocate 5 units from east_coast

Result: Order fulfilled from nearest source
```

**Configuration Considerations**:

**Use Priority When**:
- You have a preferred fulfillment warehouse
- Cost to ship from specific warehouse is lower
- Certain warehouses have faster processing
- Regional contracts or agreements exist
- Predictable fulfillment is important

**Use Distance When**:
- Shipping cost optimization is primary goal
- Multiple warehouses geographically distributed
- Customer location varies widely
- Same processing speed across warehouses
- Sources have accurate coordinates configured

**Configuration Path**: `stock_config/source_selection_algorithm`

#### Enable Reservation

**Field**: `is_active_reservation`
**Type**: Checkbox
**Default**: No
**Scope**: Global

Enable stock reservation handling during import.

**What Are Reservations?**
Inventory reservations are quantities allocated to pending orders, reducing available stock without physically removing items from warehouse.

**How It Works**:

**Reservations DISABLED (Net Stock Mode)**:
```
PlentyONE:
- Physical Stock: 100
- Reserved: 20
- Net Stock: 80

Import to Magento:
→ Saleable Quantity: 80 (net stock)
→ Reservations NOT created in Magento
```

**Reservations ENABLED (Reservation Mode)**:
```
PlentyONE:
- Physical Stock: 100
- Reserved: 20
- Net Stock: 80

Import to Magento:
→ Physical Quantity: 100
→ Creates 20 units of reservations
→ Saleable Quantity: 100 - 20 = 80 (calculated)
```

**Benefits of Enabling**:
- More accurate inventory tracking
- Maintains reservation metadata (order IDs, event types)
- Supports multi-channel selling with reservation sync
- Audit trail for reserved quantities
- Prevents overselling across channels

**When to Enable**:
- ✅ Multi-channel selling (eBay, Amazon via PlentyONE)
- ✅ Complex fulfillment with multiple order sources
- ✅ Need audit trail for reserved stock
- ✅ B2B with manual reservation management
- ✅ Pre-order or backorder functionality

**When to Disable**:
- ✅ Simple single-channel setup
- ✅ PlentyONE handles all reservations
- ✅ Performance is critical (fewer database operations)
- ✅ Don't need reservation details in Magento

**Technical Details**:
- Reservations stored in `inventory_reservation` table
- Metadata: event_type (CLIENT_RESERVED/CLIENT_RELEASED), object_type (CLIENT_MANAGEMENT)
- Differential sync: PlentyONE total - Magento current
- Safety checks prevent over-releasing reservations

**Configuration Path**: `stock_config/is_active_reservation`

#### Enable Reservation Bundle

**Field**: `is_active_reservation_bundle`
**Type**: Checkbox
**Default**: No
**Scope**: Global
**Depends**: Works in conjunction with reservation handling

Enable bundle product reservation handling.

**What It Does**:
Accounts for component quantities reserved by bundle products in pending orders.

**How It Works**:
```
Bundle Product: "Gift Set"
- Component A: 1 unit
- Component B: 2 units
- Component C: 1 unit

Order: 5 × Gift Set (pending)

Reservations Created:
- Component A: 5 units reserved
- Component B: 10 units reserved
- Component C: 5 units reserved

Without Bundle Reservation:
→ Component reservations NOT tracked

With Bundle Reservation:
→ Component reservations tracked and synced
→ Available stock accounts for bundle components
→ Prevents overselling bundle components
```

**When to Enable**:
- ✅ Selling bundle products
- ✅ Need accurate component stock tracking
- ✅ Bundle components sold individually too
- ✅ Multi-channel with bundles

**When to Disable**:
- ❌ No bundle products
- ❌ Bundles don't share components with individual products
- ❌ Bundle stock managed independently

**Configuration Path**: `stock_config/is_active_reservation_bundle`

---

### 5. Event Configuration

**Fieldset**: `event_config`
**Purpose**: Configure event-driven stock updates

:::info Under Development
Event configuration is currently planned for future releases. This section will enable real-time stock updates triggered by PlentyONE webhooks or events.
:::

---

### 6. Log Configuration

**Fieldset**: `log_config`
**Purpose**: Configure logging and debugging

#### Log Request Data to File

**Field**: `is_active_request_log`
**Type**: Checkbox (toggle)
**Default**: No
**Scope**: Global

Enable logging of API request data to file.

**What Gets Logged**:
- API request URL and method
- Request headers (including authentication)
- Request parameters (filters, pagination)
- Response status codes
- Response body (stock data)
- Request/response timestamps
- Processing duration

**Log File**: `var/log/plenty_stock_import.log`

**Benefits**:
- Debug API communication issues
- Verify correct data being fetched
- Troubleshoot authentication problems
- Monitor API performance
- Compliance and audit requirements

**Warnings**:
- ⚠️ Generates large log files (MB to GB)
- ⚠️ Contains API credentials in headers
- ⚠️ May impact performance (I/O operations)
- ⚠️ Requires regular cleanup/rotation

**Recommendations**:
- **Production**: Disable (only enable during troubleshooting)
- **Development**: Enable for debugging
- **Troubleshooting**: Enable temporarily, disable after issue resolved
- **Log Rotation**: Configure automatic cleanup (weekly/monthly)

**Example Log Entry**:
```
[2025-01-15 10:30:15] INFO: Stock API Request
URL: https://plentymarkets.com/rest/stockmanagement/stock?page=1&itemsPerPage=50
Method: GET
Headers: [Authorization: Bearer *****, Content-Type: application/json]
Response Status: 200 OK
Response Time: 1.23s
Records Fetched: 50
```

**Configuration Path**: `log_config/is_active_request_log`

---

## Common Workflows

### Workflow 1: Initial Stock Import Setup

**Scenario**: First-time setup, import entire stock catalog from PlentyONE to Magento.

**Prerequisites**:
- Products already imported to Magento (SKUs must exist)
- MSI sources created in Magento (if using multi-source)
- PlentyONE warehouses configured and active

**Steps**:

1. **Configure Client Connection**:
   ```bash
   # Verify client credentials
   # Admin: Stores → Configuration → PlentyMarkets → Client

   # Test connection
   bin/magento byte8:plenty:client:test
   ```

2. **Create Stock Import Profile**:
   - Admin: PlentyMarkets → Profiles → Stock Import
   - Click "Add New Profile"
   - Name: "Stock Import - Main"
   - Entity Type: Stock Import

3. **Configure Client**:
   - Select PlentyONE client
   - Click "Collect Configuration Data"
   - Wait 10-30 seconds for warehouse data
   - Refresh page

4. **Configure Schedule** (Disable Initially):
   - Enable Schedule: No (disable for initial setup)
   - We'll enable after testing

5. **Configure API**:
   - API Behaviour: append
   - API Collection Size: 50 (conservative start)

6. **Configure Stock Settings**:
   - Enable Stock Import: Yes
   - Main Warehouse ID: Select primary warehouse (e.g., 101)

   **Stock Source Mapping**:
   ```
   Single Source Setup:
   Row 1:
   - Magento Source: default
   - PlentyONE Source: 101 (Main Warehouse)

   Multi-Source Setup:
   Row 1:
   - Magento Source: main_warehouse
   - PlentyONE Source: 101

   Row 2:
   - Magento Source: east_dc
   - PlentyONE Source: 102

   Row 3:
   - Magento Source: west_dc
   - PlentyONE Source: 103
   ```

   - Source Selection Algorithm: Priority (recommended)
   - Enable Reservation: No (start simple)
   - Enable Reservation Bundle: No

7. **Configure Logging**:
   - Log Request Data: Yes (for initial testing)

8. **Save Profile**

9. **Test Stock Collection**:
   ```bash
   # Collect stock data from PlentyONE
   bin/magento plenty:stock:collect --profile-id=1

   # Check collected data
   mysql -e "SELECT COUNT(*) FROM plenty_stock WHERE collected_at IS NOT NULL;"

   # View sample records
   mysql -e "SELECT variation_id, warehouse_id, stock_physical, stock_net FROM plenty_stock LIMIT 10;"
   ```

10. **Map Stock SKUs** (if using custom attribute mapping):
    ```bash
    # Preview mapping
    bin/magento plenty:stock:map --dry-run

    # Map variation IDs to SKUs
    bin/magento plenty:stock:map

    # Verify mapping
    mysql -e "SELECT variation_id, sku, stock_physical FROM plenty_stock WHERE sku IS NOT NULL LIMIT 10;"
    ```

11. **Test Stock Import** (Small Sample):
    ```bash
    # Import first 10 items
    bin/magento plenty:stock:import --profile-id=1 --limit=10

    # Check logs
    tail -50 var/log/plenty_stock_import.log

    # Verify stock in Magento
    bin/magento inventory:status:list
    ```

12. **Verify Stock Levels**:
    - Admin: Catalog → Products
    - Check sample products:
      - Quantity updated correctly
      - Stock status (In Stock/Out of Stock)
      - Source assignments (for MSI)

    ```bash
    # CLI verification
    bin/magento inventory:source-items:list --sku="SKU123"
    ```

13. **Full Stock Import**:
    ```bash
    # Import all stock
    bin/magento plenty:stock:import --profile-id=1

    # Monitor progress
    tail -f var/log/plenty_stock_import.log

    # Check completion
    mysql -e "SELECT status, COUNT(*) FROM plenty_stock GROUP BY status;"
    ```

14. **Post-Import Verification**:
    ```bash
    # Check stock levels imported
    bin/magento inventory:status:list | wc -l

    # Verify saleable quantities
    mysql -e "SELECT COUNT(*) FROM inventory_source_item WHERE quantity > 0;"

    # Check for errors
    mysql -e "SELECT COUNT(*) FROM plenty_stock WHERE status = 'ERROR';"

    # Spot-check random products
    bin/magento inventory:source-items:list --sku="RANDOM-SKU"
    ```

15. **Enable Scheduled Import**:
    - Admin: Edit stock import profile
    - Schedule Configuration:
      - Enable Schedule: Yes
      - Schedule: Every 15 minutes
      - Process Batch Size: 20
      - Enable Onetime Full Process: Yes
      - Frequency: Weekly
      - Time: 02:00
      - Enable History: Yes
    - Save profile

16. **Disable Debug Logging**:
    - Log Configuration:
      - Log Request Data: No (production mode)
    - Save profile

**Expected Duration**:
| Catalog Size | Collection Time | Import Time | Total |
|--------------|----------------|-------------|-------|
| 1,000 SKUs | 2-3 min | 3-5 min | ~8 min |
| 10,000 SKUs | 10-15 min | 20-30 min | ~45 min |
| 50,000 SKUs | 45-60 min | 1.5-2 hours | ~3 hours |
| 100,000 SKUs | 1.5-2 hours | 3-4 hours | ~6 hours |

---

### Workflow 2: Incremental Stock Updates

**Scenario**: Regular updates for existing stock levels (automated via cron).

**Configuration**:
```
Profile Settings:
- Enable Schedule: Yes
- Schedule: Every 15 minutes (*/15 * * * *)
- Process Batch Size: 20
- API Collection Size: 50
- Enable Reservation: No (or Yes for multi-channel)
- Enable History: Yes
- Onetime Full Process: Weekly at 02:00 AM
```

**What Gets Updated**:
- Products with stock changes in PlentyONE
- New stock items added to warehouses
- Reservations (if enabled)
- Stock status (In Stock/Out of Stock)

**Cron Execution**:
```
Cron runs: */15 * * * *
→ Every 15 minutes at :00, :15, :30, :45

Process:
1. Collect stock from PlentyONE (updated since last run)
2. Process in batches of 20
3. Update Magento source items
4. Update stock status
5. Update reservations (if enabled)
6. Log results
```

**Monitoring**:
```bash
# Check last cron execution
bin/magento cron:status | grep plenty_stock

# View recent imports
tail -100 var/log/plenty_stock_import.log

# Check for errors
grep -i error var/log/plenty_stock_import.log | tail -20

# Monitor pending items
mysql -e "SELECT COUNT(*) FROM plenty_stock WHERE status = 'PENDING';"

# Monitor processing
mysql -e "SELECT status, COUNT(*) FROM plenty_stock GROUP BY status;"
```

**Performance**:
- Typical execution: 30 seconds - 2 minutes
- Items processed: 10-500 per run (depends on changes)
- Low server impact (incremental)
- Memory usage: 50-200 MB

**Troubleshooting**:
```bash
# If stock not updating
bin/magento cache:flush
bin/magento indexer:reindex inventory

# Force re-collection
bin/magento plenty:stock:collect --profile-id=1 --force

# Re-import specific SKUs
bin/magento plenty:stock:import --profile-id=1 --skus=SKU1,SKU2,SKU3
```

---

### Workflow 3: Multi-Warehouse Stock Distribution

**Scenario**: E-commerce with multiple warehouses and regional fulfillment.

**Warehouse Structure**:
```
Company: National E-commerce Retailer

PlentyONE Warehouses:
- 101: Main Distribution Center (Los Angeles, CA)
- 102: East Coast Facility (New York, NY)
- 103: Midwest Hub (Chicago, IL)
- 104: South Region (Dallas, TX)
- 105: Drop Ship Supplier (Various locations)

Magento MSI Sources:
- main_dc (Priority 1, GPS: 34.0522° N, 118.2437° W)
- east_coast (Priority 2, GPS: 40.7128° N, 74.0060° W)
- midwest (Priority 3, GPS: 41.8781° N, 87.6298° W)
- south_region (Priority 4, GPS: 32.7767° N, 96.7970° W)
- dropship (Priority 10, no GPS)
```

**Configuration**:
```
Stock Source Mapping:
Row 1: main_dc → 101 (Main DC)
Row 2: east_coast → 102 (East Coast)
Row 3: midwest → 103 (Midwest Hub)
Row 4: south_region → 104 (South Region)
Row 5: dropship → 105 (Drop Ship)

Source Selection Algorithm: Distance (optimize shipping)
Enable Reservation: Yes (multi-channel selling)
Main Warehouse: 101 (fallback to main DC)
```

**Stock Distribution Example**:
```
Product: SKU-LAPTOP-001

PlentyONE Stock by Warehouse:
- Warehouse 101: 150 units
- Warehouse 102: 75 units
- Warehouse 103: 50 units
- Warehouse 104: 25 units
- Warehouse 105: 100 units (drop ship)

After Import to Magento:
Source "main_dc": 150 units
Source "east_coast": 75 units
Source "midwest": 50 units
Source "south_region": 25 units
Source "dropship": 100 units

Total Saleable Quantity: 400 units
```

**Order Fulfillment Logic (Distance Algorithm)**:
```
Customer Order: 2 × SKU-LAPTOP-001
Shipping Address: Boston, MA (42.3601° N, 71.0589° W)

Distance Calculation:
- main_dc (LA): 2,990 miles
- east_coast (NY): 215 miles ← NEAREST
- midwest (IL): 983 miles
- south_region (TX): 1,765 miles
- dropship: N/A (no GPS)

Source Selection:
1. Calculate distances from Boston
2. Sort: east_coast (215 mi) closest
3. Check stock: 75 units available ✓
4. Allocate 2 units from east_coast
5. Create shipment from New York facility

Result: Order ships from nearest warehouse (215 miles)
Shipping cost: Minimized
Delivery time: Optimized
```

**Verification**:
```bash
# Check source assignments
bin/magento inventory:source-items:list --sku="SKU-LAPTOP-001"

# Output:
# Source Code: main_dc, Quantity: 150
# Source Code: east_coast, Quantity: 75
# Source Code: midwest, Quantity: 50
# Source Code: south_region, Quantity: 25
# Source Code: dropship, Quantity: 100

# Check saleable quantity
bin/magento inventory:status:list --sku="SKU-LAPTOP-001"

# Output:
# SKU: SKU-LAPTOP-001
# Saleable Qty: 400
# Stock Status: In Stock
```

**Best Practices**:
- Configure GPS coordinates for all sources (distance algorithm)
- Set priority levels for preferred warehouses
- Test fulfillment with sample orders
- Monitor which sources fulfill orders
- Adjust priorities based on shipping costs
- Regular stock reconciliation (weekly full sync)

---

### Workflow 4: Stock Reservation Management

**Scenario**: Multi-channel selling with reservation tracking (Magento + eBay + Amazon via PlentyONE).

**Configuration**:
```
Stock Configuration:
- Enable Stock Import: Yes
- Main Warehouse: 101
- Source Selection Algorithm: Priority
- Enable Reservation: Yes ← CRITICAL
- Enable Reservation Bundle: Yes (if selling bundles)

Schedule:
- Frequency: Every 5 minutes (frequent for reservations)
- Batch Size: 30
```

**How Reservations Work**:

**Scenario**: Multi-Channel Product
```
Product: SKU-WIDGET-001
Physical Stock in PlentyONE Warehouse: 100 units

Orders:
- Magento: 10 units (pending payment) → Reserved
- eBay: 5 units (pending shipment) → Reserved
- Amazon: 8 units (pending fulfillment) → Reserved
- Total Reserved: 23 units

PlentyONE Reservation Data:
- Physical Stock: 100
- Reserved Stock: 23
- Net Stock: 77

Import to Magento (Reservations ENABLED):
→ Physical Quantity: 100 units
→ Reservations Created: 23 units
→ Metadata:
  - 10 units: event_type=CLIENT_RESERVED, source=magento
  - 5 units: event_type=CLIENT_RESERVED, source=ebay
  - 8 units: event_type=CLIENT_RESERVED, source=amazon
→ Saleable Quantity: 100 - 23 = 77 units

Customer sees: 77 units available (prevents overselling)
```

**Without Reservations (Net Stock Mode)**:
```
Import to Magento (Reservations DISABLED):
→ Physical Quantity: 77 units (net stock)
→ No reservation records created
→ Saleable Quantity: 77 units

Result: Same saleable qty, but no reservation details
Risk: If Magento creates its own reservations, may double-count
```

**Reservation Sync Process**:
```
1. Stock Collection:
   - Fetch physical stock: 100
   - Fetch reserved stock: 23
   - Store in plenty_stock table

2. Pre-Processing:
   - Validate warehouse mappings
   - Assign SKUs to variation IDs
   - Assign source codes

3. Generator Stage:
   StockReservation Generator:
   - Query existing Magento reservations for SKU
   - Existing: 20 units reserved
   - PlentyONE: 23 units reserved
   - Adjustment Needed: +3 units (23 - 20)
   - Creates compensation reservation: +3 units

4. Processor Stage:
   StockReservation Processor:
   - Lock SKU at product_entity level
   - Save compensation reservation (+3 units)
   - Commit transaction
   - Update saleable quantity cache

5. Result:
   - Magento reservations: 20 + 3 = 23 units
   - Matches PlentyONE: 23 units
   - Saleable quantity: 100 - 23 = 77 units
```

**Reservation Metadata**:
```sql
SELECT * FROM inventory_reservation WHERE sku = 'SKU-WIDGET-001' AND metadata LIKE '%CLIENT%';

-- Output:
| sku            | quantity | metadata                                              |
|----------------|----------|-------------------------------------------------------|
| SKU-WIDGET-001 | -10.0000 | {"event_type":"CLIENT_RESERVED","source_code":"main_dc"} |
| SKU-WIDGET-001 | -5.0000  | {"event_type":"CLIENT_RESERVED","source_code":"main_dc"} |
| SKU-WIDGET-001 | -8.0000  | {"event_type":"CLIENT_RESERVED","source_code":"main_dc"} |
```

**Monitoring Reservations**:
```bash
# View reservations for a SKU
mysql -e "SELECT sku, SUM(quantity) as total_reserved
FROM inventory_reservation
WHERE sku = 'SKU-WIDGET-001'
GROUP BY sku;"

# Check reservation consistency
bin/magento inventory:reservation:list-inconsistencies

# Create compensation if needed
bin/magento inventory:reservation:create-compensations
```

**Benefits of Reservation Tracking**:
- ✅ Accurate cross-channel inventory
- ✅ Prevents overselling across marketplaces
- ✅ Audit trail for reserved quantities
- ✅ Metadata tracks reservation source
- ✅ Automatic compensation for discrepancies

---

### Workflow 5: Stock Troubleshooting and Recovery

**Scenario**: Stock levels out of sync, need to diagnose and fix.

**Common Issues and Solutions**:

**Issue 1: Stock Showing Zero but PlentyONE Has Stock**

**Diagnosis**:
```bash
# Check stock collection status
mysql -e "SELECT variation_id, warehouse_id, stock_physical, status
FROM plenty_stock
WHERE variation_id = 12345;"

# Check if SKU mapped
mysql -e "SELECT variation_id, sku, stock_physical
FROM plenty_stock
WHERE variation_id = 12345;"

# Check Magento source items
bin/magento inventory:source-items:list --sku="PROBLEM-SKU"
```

**Solution**:
```bash
# Re-collect stock for this item
bin/magento plenty:stock:collect --profile-id=1 --variation-ids=12345

# Map SKU if missing
bin/magento plenty:stock:map --id=12345

# Re-import stock
bin/magento plenty:stock:import --profile-id=1 --skus="PROBLEM-SKU"

# Clear cache and reindex
bin/magento cache:flush
bin/magento indexer:reindex inventory
```

**Issue 2: Stock Stuck in PENDING Status**

**Diagnosis**:
```bash
# Check pending items
mysql -e "SELECT COUNT(*) FROM plenty_stock WHERE status = 'PENDING';"

# Find oldest pending
mysql -e "SELECT variation_id, warehouse_id, collected_at, TIMESTAMPDIFF(HOUR, collected_at, NOW()) as hours_pending
FROM plenty_stock
WHERE status = 'PENDING'
ORDER BY collected_at ASC
LIMIT 10;"
```

**Solution**:
```bash
# Force process pending items
bin/magento plenty:stock:import --profile-id=1 --force

# If still stuck, check for validation errors
mysql -e "SELECT variation_id, message
FROM plenty_stock
WHERE status = 'ERROR'
LIMIT 10;"

# Reset status for specific items
mysql -e "UPDATE plenty_stock
SET status = 'PENDING'
WHERE variation_id IN (12345, 67890);"

# Re-import
bin/magento plenty:stock:import --profile-id=1
```

**Issue 3: Warehouse Not Mapped**

**Diagnosis**:
```bash
# Check for unmapped warehouses
mysql -e "SELECT DISTINCT warehouse_id
FROM plenty_stock
WHERE status = 'FAILED';"

# Check mapping configuration
bin/magento config:show plenty/plenty_stock_import/stock_source_mapping
```

**Solution**:
```bash
# Add missing warehouse mapping
# Admin: Profile → Stock Configuration → Stock Source Mapping
# Add row: Magento Source → PlentyONE Warehouse

# Or collect fresh configuration
bin/magento plenty:stock/client/collectConfiguration --profile-id=1

# Re-process failed items
mysql -e "UPDATE plenty_stock
SET status = 'PENDING'
WHERE status = 'FAILED'
AND warehouse_id = 106;"

bin/magento plenty:stock:import --profile-id=1
```

**Issue 4: Reservation Inconsistencies**

**Diagnosis**:
```bash
# Check for inconsistencies
bin/magento inventory:reservation:list-inconsistencies

# Output:
# SKU-WIDGET-001: Reservations: -25, Saleable: 77, Physical: 100
# Inconsistency: Expected -23, found -25 (2 units over-reserved)
```

**Solution**:
```bash
# Create compensation reservations
bin/magento inventory:reservation:create-compensations

# Verify fix
bin/magento inventory:reservation:list-inconsistencies

# Force full stock resync
bin/magento plenty:stock:collect --profile-id=1 --force
bin/magento plenty:stock:import --profile-id=1 --force
```

**Issue 5: Stock Import Not Running**

**Diagnosis**:
```bash
# Check cron status
bin/magento cron:status | grep plenty_stock

# Check schedule configuration
mysql -e "SELECT * FROM cron_schedule
WHERE job_code LIKE '%plenty_stock%'
ORDER BY scheduled_at DESC
LIMIT 5;"

# Check profile schedule enabled
bin/magento config:show plenty/plenty_stock_import/schedule_config/status
```

**Solution**:
```bash
# Enable schedule
# Admin: Profile → Schedule Configuration → Enable Schedule: Yes

# Run cron manually
bin/magento cron:run --group=default

# Check execution
tail -50 var/log/plenty_stock_import.log

# Verify next scheduled run
mysql -e "SELECT job_code, status, scheduled_at, executed_at
FROM cron_schedule
WHERE job_code LIKE '%plenty_stock%'
ORDER BY scheduled_at DESC
LIMIT 1;"
```

**Full Recovery Workflow**:
```bash
# 1. Clear all stock mappings
bin/magento plenty:stock:unmap --force

# 2. Re-collect stock from PlentyONE
bin/magento plenty:stock:collect --profile-id=1 --force

# 3. Re-map SKUs
bin/magento plenty:stock:map

# 4. Re-import stock
bin/magento plenty:stock:import --profile-id=1 --force

# 5. Fix reservations
bin/magento inventory:reservation:create-compensations

# 6. Clear cache and reindex
bin/magento cache:flush
bin/magento indexer:reindex inventory

# 7. Verify results
bin/magento inventory:status:list | head -20
mysql -e "SELECT status, COUNT(*) FROM plenty_stock GROUP BY status;"
```

---

## CLI Commands Reference

### Stock Collection Commands

```bash
# Full stock collection from PlentyONE
bin/magento plenty:stock:collect

# Collect for specific profile
bin/magento plenty:stock:collect --profile-id=1

# Force full re-collection (ignore timestamps)
bin/magento plenty:stock:collect --profile-id=1 --force

# Collect specific variation IDs
bin/magento plenty:stock:collect --profile-id=1 --variation-ids=12345,67890

# Collect specific warehouse
bin/magento plenty:stock:collect --profile-id=1 --warehouse-id=101

# Verbose output
bin/magento plenty:stock:collect --profile-id=1 -v
bin/magento plenty:stock:collect --profile-id=1 -vv
bin/magento plenty:stock:collect --profile-id=1 -vvv (debug)
```

### Stock Import Commands

```bash
# Full stock import (process all PENDING)
bin/magento plenty:stock:import --profile-id=1

# Import specific SKUs
bin/magento plenty:stock:import --profile-id=1 --skus=SKU1,SKU2,SKU3

# Import specific warehouse
bin/magento plenty:stock:import --profile-id=1 --warehouse-id=101

# Import specific source
bin/magento plenty:stock:import --profile-id=1 --source=main_warehouse

# Force full refresh (re-process all)
bin/magento plenty:stock:import --profile-id=1 --force

# Dry run (test without updating)
bin/magento plenty:stock:import --profile-id=1 --dry-run

# Limit processing
bin/magento plenty:stock:import --profile-id=1 --limit=100

# Import with custom batch size
bin/magento plenty:stock:import --profile-id=1 --batch-size=50
```

### Stock Mapping Commands

```bash
# Map all stock records to product SKUs
bin/magento plenty:stock:map

# Preview mapping (dry-run)
bin/magento plenty:stock:map --dry-run

# Map specific variation IDs
bin/magento plenty:stock:map --id=12345,67890

# Map with preview
bin/magento plenty:stock:map --id=12345,67890 --dry-run

# Verbose output
bin/magento plenty:stock:map -v
```

### Clear Stock Mappings Commands

```bash
# Clear all stock mappings (with confirmation)
bin/magento plenty:stock:unmap

# Clear without confirmation
bin/magento plenty:stock:unmap --force

# Clear specific variation IDs
bin/magento plenty:stock:unmap --id=12345,67890

# Preview clearing (dry-run)
bin/magento plenty:stock:unmap --dry-run

# Combine options
bin/magento plenty:stock:unmap --id=12345,67890 --dry-run --force
```

### Stock Verification Commands

```bash
# List source items for SKU
bin/magento inventory:source-items:list --sku="SKU123"

# Check saleable quantity
bin/magento inventory:status:list --sku="SKU123"

# List all inventory statuses
bin/magento inventory:status:list

# Check reservations
bin/magento inventory:reservation:list --sku="SKU123"

# List inconsistencies
bin/magento inventory:reservation:list-inconsistencies

# Create compensation reservations
bin/magento inventory:reservation:create-compensations
```

### Database Query Commands

```bash
# Check stock collection status
mysql -e "SELECT status, COUNT(*) FROM plenty_stock GROUP BY status;"

# View pending items
mysql -e "SELECT variation_id, warehouse_id, stock_physical FROM plenty_stock WHERE status = 'PENDING' LIMIT 10;"

# Check SKU mappings
mysql -e "SELECT variation_id, sku, stock_physical FROM plenty_stock WHERE sku IS NOT NULL LIMIT 10;"

# Find unmapped items
mysql -e "SELECT COUNT(*) FROM plenty_stock WHERE sku IS NULL;"

# Check warehouse distribution
mysql -e "SELECT warehouse_id, COUNT(*) FROM plenty_stock GROUP BY warehouse_id;"

# View error messages
mysql -e "SELECT variation_id, message FROM plenty_stock WHERE status = 'ERROR' LIMIT 10;"
```

### Configuration Commands

```bash
# View stock import configuration
bin/magento config:show plenty/plenty_stock_import

# Check schedule status
bin/magento config:show plenty/plenty_stock_import/schedule_config/status

# View warehouse mappings
bin/magento config:show plenty/plenty_stock_import/stock_source_mapping

# Check reservation settings
bin/magento config:show plenty/plenty_stock_import/is_active_reservation
```

### Indexing Commands

```bash
# Reindex inventory
bin/magento indexer:reindex inventory

# Reindex specific inventory indexers
bin/magento indexer:reindex inventory_stock
bin/magento indexer:reindex inventory_product_price
bin/magento indexer:reindex inventory_source_item

# Check indexer status
bin/magento indexer:status

# Reset indexers
bin/magento indexer:reset inventory
```

### Cache Management Commands

```bash
# Flush all cache
bin/magento cache:flush

# Clear specific cache types
bin/magento cache:clean full_page block_html

# Disable cache during troubleshooting
bin/magento cache:disable

# Enable cache
bin/magento cache:enable
```

### Cron Management Commands

```bash
# Check cron status
bin/magento cron:status | grep plenty_stock

# Run cron manually
bin/magento cron:run --group=default

# View cron schedule
mysql -e "SELECT job_code, status, scheduled_at, executed_at FROM cron_schedule WHERE job_code LIKE '%plenty_stock%' ORDER BY scheduled_at DESC LIMIT 10;"

# Clean old cron jobs
bin/magento cron:clean
```

### Troubleshooting Commands

```bash
# View import logs
tail -f var/log/plenty_stock_import.log

# Filter errors only
grep -i error var/log/plenty_stock_import.log | tail -50

# Check recent activity
tail -100 var/log/plenty_stock_import.log

# Monitor memory usage
watch -n 1 'free -h'

# Monitor running processes
watch -n 5 'ps aux | grep plenty'

# Check database locks
bin/magento db:status

# View system errors
tail -f var/log/system.log
tail -f var/log/exception.log
```

---

## Troubleshooting

### Issue 1: Stock Not Updating

**Symptoms**:
- Import runs but stock quantities don't change in Magento
- Source items show old quantities
- Products remain out of stock despite PlentyONE having stock

**Possible Causes & Solutions**:

**1. Products Don't Exist in Magento**
```bash
# Check if products imported
bin/magento catalog:product:list | grep "PROBLEM-SKU"

# Solution: Import products first
bin/magento plenty:item:import --profile-id=1

# Then import stock
bin/magento plenty:stock:import --profile-id=1
```

**2. SKU Mapping Missing**
```bash
# Check SKU mapping in stock table
mysql -e "SELECT variation_id, sku, stock_physical FROM plenty_stock WHERE variation_id = 12345;"

# If sku is NULL, map it
bin/magento plenty:stock:map --id=12345

# Verify mapping
bin/magento plenty:stock:map --id=12345 --dry-run
```

**3. Warehouse Not Mapped**
```bash
# Check warehouse mappings
bin/magento config:show plenty/plenty_stock_import/stock_source_mapping

# Solution: Add warehouse mapping
# Admin: Profile → Stock Configuration → Stock Source Mapping
# Add row: Magento Source → PlentyONE Warehouse

# Or check for failed items
mysql -e "SELECT warehouse_id, COUNT(*) FROM plenty_stock WHERE status = 'FAILED' GROUP BY warehouse_id;"
```

**4. Stock Import Disabled**
```bash
# Check if stock import enabled
bin/magento config:show plenty/plenty_stock_import/stock_config/is_active

# Should return: 1

# Enable if disabled
# Admin: Profile → Stock Configuration → Enable Stock Import: Yes
```

**5. Source Items Not Created**
```bash
# Check source items exist
bin/magento inventory:source-items:list --sku="PROBLEM-SKU"

# If empty, force re-import
bin/magento plenty:stock:import --profile-id=1 --skus="PROBLEM-SKU" --force

# Check again
bin/magento inventory:source-items:list --sku="PROBLEM-SKU"
```

**6. Cache Not Cleared**
```bash
# Clear cache
bin/magento cache:flush

# Reindex inventory
bin/magento indexer:reindex inventory

# Check again
bin/magento inventory:status:list --sku="PROBLEM-SKU"
```

---

### Issue 2: Stock Showing Incorrect Quantities

**Symptoms**:
- Stock quantities in Magento don't match PlentyONE
- Discrepancies in saleable quantities
- Stock higher or lower than expected

**Possible Causes & Solutions**:

**1. Reservation Mode Issue**
```bash
# Check reservation setting
bin/magento config:show plenty/plenty_stock_import/is_active_reservation

# If disabled (0), Magento shows net stock (physical - reserved)
# If enabled (1), Magento shows physical, with reservations created

# Verify PlentyONE data
mysql -e "SELECT variation_id, stock_physical, reserved_stock, stock_net FROM plenty_stock WHERE sku = 'PROBLEM-SKU';"

# Example:
# Physical: 100, Reserved: 20, Net: 80

# With reservations OFF:
# Magento should show: 80 units

# With reservations ON:
# Magento should show: 100 physical, -20 reserved = 80 saleable
```

**2. Multiple Source Confusion (MSI)**
```bash
# Check all sources for SKU
bin/magento inventory:source-items:list --sku="PROBLEM-SKU"

# May show:
# Source "main_warehouse": 50
# Source "east_dc": 30
# Source "west_dc": 20
# Total: 100 (not 50!)

# Verify mapping
bin/magento config:show plenty/plenty_stock_import/stock_source_mapping

# Ensure all warehouses mapped correctly
```

**3. Reservation Inconsistencies**
```bash
# Check for reservation issues
bin/magento inventory:reservation:list-inconsistencies

# Example output:
# SKU-WIDGET-001: Expected -20, Found -25 (5 units over-reserved)

# Create compensations
bin/magento inventory:reservation:create-compensations

# Verify fix
bin/magento inventory:reservation:list-inconsistencies
bin/magento inventory:status:list --sku="PROBLEM-SKU"
```

**4. Stale Data in plenty_stock Table**
```bash
# Check collection timestamp
mysql -e "SELECT variation_id, sku, stock_physical, collected_at FROM plenty_stock WHERE sku = 'PROBLEM-SKU';"

# If collected_at is old (> 1 day), re-collect
bin/magento plenty:stock:collect --profile-id=1 --skus="PROBLEM-SKU" --force

# Re-import
bin/magento plenty:stock:import --profile-id=1 --skus="PROBLEM-SKU" --force
```

**5. Wrong Warehouse Data**
```bash
# Check which warehouse stock is coming from
mysql -e "SELECT variation_id, warehouse_id, stock_physical FROM plenty_stock WHERE sku = 'PROBLEM-SKU';"

# Verify this is the correct warehouse
# Check PlentyONE admin for expected warehouse

# If wrong warehouse, check mapping
bin/magento config:show plenty/plenty_stock_import/stock_source_mapping
```

---

### Issue 3: Products Show Out of Stock Incorrectly

**Symptoms**:
- Products show "Out of Stock" on frontend
- Stock quantity shows > 0 but status is "Out of Stock"
- Products disappear from category pages

**Possible Causes & Solutions**:

**1. Stock Status Not Updated**
```bash
# Check source item
bin/magento inventory:source-items:list --sku="PROBLEM-SKU"

# Check if status field is correct
# status should be 1 (in stock) if qty > 0

# Force status update
mysql -e "UPDATE inventory_source_item SET status = 1 WHERE sku = 'PROBLEM-SKU' AND quantity > 0;"

# Reindex
bin/magento indexer:reindex inventory
bin/magento cache:flush
```

**2. Saleable Quantity Zero (Reservations)**
```bash
# Check saleable quantity
bin/magento inventory:status:list --sku="PROBLEM-SKU"

# Example:
# Qty: 50, Saleable Qty: 0 → Problem with reservations

# Check reservations
bin/magento inventory:reservation:list --sku="PROBLEM-SKU"

# If over-reserved, create compensations
bin/magento inventory:reservation:create-compensations

# Verify
bin/magento inventory:status:list --sku="PROBLEM-SKU"
```

**3. Product Disabled in Magento**
```bash
# Check product status
bin/magento catalog:product:show "PROBLEM-SKU" | grep status

# Should be: status: 1 (enabled)

# If disabled, check in admin or update
mysql -e "UPDATE catalog_product_entity_int SET value = 1 WHERE attribute_id = (SELECT attribute_id FROM eav_attribute WHERE attribute_code = 'status') AND entity_id = (SELECT entity_id FROM catalog_product_entity WHERE sku = 'PROBLEM-SKU');"

# Reindex
bin/magento indexer:reindex catalog_product_attribute
```

**4. Not Assigned to Website/Source**
```bash
# Check website assignment
mysql -e "SELECT website_id FROM catalog_product_website WHERE product_id = (SELECT entity_id FROM catalog_product_entity WHERE sku = 'PROBLEM-SKU');"

# Check source assignment
bin/magento inventory:source-items:list --sku="PROBLEM-SKU"

# If missing, re-import product
bin/magento plenty:item:import --profile-id=1 --skus="PROBLEM-SKU" --force
```

**5. Threshold Configuration**
```bash
# Check out-of-stock threshold configuration
# Admin: Stores → Configuration → Catalog → Inventory → Product Stock Options
# Out-of-Stock Threshold

# If threshold is 5, product shows "Out of Stock" when qty < 5
# Even if qty = 4 (above 0)

# Adjust threshold or increase stock quantity
```

---

### Issue 4: MSI Stock Not Distributing to Sources

**Symptoms**:
- All stock goes to one source
- Multiple sources exist but only one has stock
- Stock not distributed across warehouses

**Possible Causes & Solutions**:

**1. Warehouse Mapping Missing**
```bash
# Check all warehouse mappings
bin/magento config:show plenty/plenty_stock_import/stock_source_mapping

# Should show multiple rows like:
# [main_warehouse] => 101
# [east_dc] => 102
# [west_dc] => 103

# If missing warehouses, add mappings
# Admin: Profile → Stock Configuration → Stock Source Mapping
# Add rows for each warehouse → source pair
```

**2. Only One Warehouse Has Stock in PlentyONE**
```bash
# Check PlentyONE data for all warehouses
mysql -e "SELECT warehouse_id, COUNT(*) as items, SUM(stock_physical) as total_stock FROM plenty_stock GROUP BY warehouse_id;"

# Example output:
# warehouse_id: 101, items: 5000, total_stock: 50000
# warehouse_id: 102, items: 100, total_stock: 500

# If only one warehouse has data, check PlentyONE configuration
# Ensure products assigned to multiple warehouses
```

**3. Main Warehouse Fallback**
```bash
# Check main warehouse configuration
bin/magento config:show plenty/plenty_stock_import/main_warehouse_id

# If all stock going to one source, may be using fallback
# Check for unmapped warehouses in plenty_stock table

mysql -e "SELECT DISTINCT s.warehouse_id, s.sku FROM plenty_stock s LEFT JOIN (SELECT JSON_EXTRACT(value, '$.plenty_source') as warehouse FROM core_config_data WHERE path = 'plenty/plenty_stock_import/stock_source_mapping') m ON s.warehouse_id = m.warehouse WHERE m.warehouse IS NULL LIMIT 10;"

# If rows returned, these warehouses are unmapped
# Add mappings for these warehouses
```

**4. Source Assignment Algorithm Issue**
```bash
# Check source selection algorithm
bin/magento config:show plenty/plenty_stock_import/source_selection_algorithm

# Ensure correct algorithm selected (Priority or Distance)

# Test with specific SKU
bin/magento inventory:source-items:list --sku="TEST-SKU"

# Should show multiple sources
# If not, check individual warehouse imports
bin/magento plenty:stock:import --profile-id=1 --warehouse-id=102 --force
```

---

### Issue 5: Stock Import Not Running Automatically

**Symptoms**:
- Cron not executing stock import
- Last execution shows old timestamp
- Stock never updates automatically

**Possible Causes & Solutions**:

**1. Schedule Disabled**
```bash
# Check if schedule enabled
bin/magento config:show plenty/plenty_stock_import/schedule_config/status

# Should return: 1

# Enable in admin
# Admin: Profile → Schedule Configuration → Enable Schedule: Yes
```

**2. Cron Not Running**
```bash
# Check cron status
bin/magento cron:status | grep plenty_stock

# Should show recent executions

# Run cron manually
bin/magento cron:run --group=default

# Check if executed
tail -50 var/log/plenty_stock_import.log
```

**3. Schedule Not Selected**
```bash
# Check schedule ID
bin/magento config:show plenty/plenty_stock_import/schedule_config/schedule_id

# Should return schedule ID (not empty)

# Select schedule in admin
# Admin: Profile → Schedule Configuration → Schedule: (select schedule)
```

**4. Cron Expression Invalid**
```bash
# Check cron expression for schedule
mysql -e "SELECT * FROM byte8_profile_schedule WHERE entity_id = (SELECT JSON_UNQUOTE(JSON_EXTRACT(value, '$')) FROM core_config_data WHERE path = 'plenty/plenty_stock_import/schedule_config/schedule_id');"

# Verify cron_expr column is valid (e.g., */15 * * * *)

# Test cron expression: https://crontab.guru/
```

**5. No PENDING Items**
```bash
# Check if items waiting to process
mysql -e "SELECT COUNT(*) FROM plenty_stock WHERE status = 'PENDING';"

# If 0, nothing to import

# Trigger collection
bin/magento plenty:stock:collect --profile-id=1

# Check again
mysql -e "SELECT COUNT(*) FROM plenty_stock WHERE status = 'PENDING';"
```

---

### Issue 6: Memory Errors During Import

**Symptoms**:
- "Allowed memory size exhausted" errors
- Import stops mid-batch
- PHP fatal errors in logs

**Solutions**:

**1. Reduce Batch Size**
```bash
# Edit profile
# Admin: Profile → Schedule Configuration → Process Batch Size
# Reduce from 20 to 10 or 5

# Or use CLI with custom batch size
bin/magento plenty:stock:import --profile-id=1 --batch-size=10
```

**2. Increase Memory Limit**
```bash
# Temporary (CLI)
php -d memory_limit=2G bin/magento plenty:stock:import --profile-id=1

# Permanent (php.ini)
memory_limit = 2G

# Per-command
ini_set('memory_limit', '2G');
```

**3. Process by Warehouse**
```bash
# Import one warehouse at a time
bin/magento plenty:stock:import --profile-id=1 --warehouse-id=101
bin/magento plenty:stock:import --profile-id=1 --warehouse-id=102
bin/magento plenty:stock:import --profile-id=1 --warehouse-id=103
```

**4. Limit Processing**
```bash
# Import limited number at once
bin/magento plenty:stock:import --profile-id=1 --limit=100

# Run multiple times until all processed
mysql -e "SELECT COUNT(*) FROM plenty_stock WHERE status = 'PENDING';"
```

---

## Best Practices

### 1. Initial Setup Best Practices

**Preparation Phase**:
- ✅ Import products before importing stock (SKUs must exist)
- ✅ Create MSI sources in Magento for each warehouse
- ✅ Configure source priorities for fulfillment preference
- ✅ Set up GPS coordinates for distance-based algorithm
- ✅ Test with 10-20 products before full import
- ✅ Document warehouse → source mappings
- ✅ Choose reservation mode based on sales channels

**Warehouse Configuration**:
```
Document warehouse structure:

PlentyONE Warehouses:
- 101: Main DC (CA) → Magento: main_warehouse
- 102: East DC (NY) → Magento: east_coast
- 103: Midwest (IL) → Magento: midwest
- 104: Drop Ship → Magento: dropship

Main Warehouse: 101 (fallback)
Algorithm: Priority (prefer main DC)
Reservations: Yes (multi-channel)
```

**MSI Source Setup**:
```bash
# Create sources in Magento first
# Admin: Stores → Inventory → Sources → Add New Source

Required fields per source:
- Source Code: main_warehouse (lowercase, no spaces)
- Name: Main Warehouse Distribution Center
- Enabled: Yes
- Country: US
- State/Province: CA
- Postcode: 90001
- Latitude: 34.0522
- Longitude: -118.2437
- Priority: 1
```

---

### 2. Ongoing Operations Best Practices

**Stock Sync Schedule**:
```
Incremental Updates (Scheduled):
- Frequency: Every 15 minutes
- Batch Size: 20
- Collection Size: 50
- Reservation: Enabled (if multi-channel)
- History: Enabled

Full Reconciliation (Onetime):
- Frequency: Weekly (Sunday)
- Time: 02:00 AM
- Purpose: Catch any drift, full resync
```

**Monitoring Routine**:
```bash
# Daily checks (automated monitoring recommended)

# 1. Check cron execution
bin/magento cron:status | grep plenty_stock

# 2. Check for errors
grep -i error var/log/plenty_stock_import.log | tail -20

# 3. Verify pending items not stuck
mysql -e "SELECT status, COUNT(*) FROM plenty_stock GROUP BY status;"

# 4. Check reservation consistency
bin/magento inventory:reservation:list-inconsistencies

# 5. Spot-check random SKUs
bin/magento inventory:status:list | shuf -n 5
```

**Maintenance Tasks**:
```bash
# Weekly
# - Review error logs
# - Check stuck items (PENDING > 24 hours)
# - Verify warehouse mappings still valid

# Monthly
# - Clean old logs: find var/log -name "plenty_stock*.log" -mtime +30 -delete
# - Archive history: mysql -e "DELETE FROM plenty_stock_history WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);"
# - Full reconciliation: bin/magento plenty:stock:import --profile-id=1 --force

# Quarterly
# - Review warehouse structure changes
# - Audit source priority configuration
# - Performance optimization review
```

---

### 3. Performance Best Practices

**Batch Size Optimization**:
| Scenario | Batch Size | Rationale |
|----------|------------|-----------|
| Initial import (large catalog) | 10-15 | Conservative, predictable memory |
| Incremental updates | 20-30 | Balanced throughput |
| High-frequency updates | 30-50 | Fewer transactions, faster |
| Low memory server (2GB) | 10 | Memory safety |
| High memory server (16GB+) | 50-100 | Maximize throughput |

**Collection Size Tuning**:
- Slow network: 25-50
- Average network: 50-100 (default)
- Fast network: 100-200
- Monitor API response times in logs

**Database Optimization**:
```sql
-- Add indexes for faster queries
CREATE INDEX idx_plenty_stock_status ON plenty_stock(status);
CREATE INDEX idx_plenty_stock_collected ON plenty_stock(collected_at);
CREATE INDEX idx_plenty_stock_sku ON plenty_stock(sku);
CREATE INDEX idx_plenty_stock_variation ON plenty_stock(variation_id);

-- Regular table optimization
OPTIMIZE TABLE plenty_stock;
OPTIMIZE TABLE inventory_source_item;
OPTIMIZE TABLE inventory_reservation;
```

**Cron Optimization**:
```
High-traffic stores:
- Stock Import: Every 5-10 minutes
- Rationale: Minimize overselling risk
- Trade-off: Higher server load

Standard stores:
- Stock Import: Every 15-30 minutes
- Rationale: Balanced accuracy vs load
- Trade-off: Slight delay in stock updates

Low-traffic stores:
- Stock Import: Every 30-60 minutes
- Rationale: Minimize resource usage
- Trade-off: Higher overselling risk
```

---

### 4. Multi-Warehouse Strategy Best Practices

**Warehouse Priority Setup**:
```
Strategy 1: Cost-Based Priority
- Priority 1: Lowest shipping cost warehouse
- Priority 2: Secondary fulfillment center
- Priority 3: Drop ship (higher cost)

Strategy 2: Speed-Based Priority
- Priority 1: Fastest processing warehouse
- Priority 2: Standard processing
- Priority 3: Slower but cheaper

Strategy 3: Regional Priority
- Use Distance Algorithm
- Configure GPS coordinates
- Optimize for shipping zones
```

**Source Configuration**:
```
Best Practices:
✅ Name sources clearly: main_dc, not warehouse1
✅ Set realistic priorities (1-10 range)
✅ Configure GPS for distance algorithm
✅ Document purpose of each source
✅ Regular review of source performance
✅ Update coordinates if warehouse moves
```

**Fulfillment Testing**:
```bash
# Test order fulfillment logic

# 1. Create test order with known shipping address
# 2. Check which source selected
bin/magento inventory:source-selection:run --sku="TEST-SKU" --qty=5 --address='{"country":"US","region":"NY","postcode":"10001"}'

# 3. Verify expected source selected
# 4. Adjust priorities or algorithm if needed
```

---

### 5. Reservation Management Best Practices

**When to Enable Reservations**:
- ✅ Multi-channel selling (eBay, Amazon, etc.)
- ✅ Need audit trail for allocated stock
- ✅ Complex order workflows
- ✅ B2B with manual reservations
- ✅ Dropshipping with pre-orders

**When to Disable Reservations**:
- ✅ Single-channel Magento only
- ✅ PlentyONE handles all reservations
- ✅ Simple fulfillment process
- ✅ Performance is critical

**Reservation Maintenance**:
```bash
# Weekly: Check for inconsistencies
bin/magento inventory:reservation:list-inconsistencies

# If found, create compensations
bin/magento inventory:reservation:create-compensations

# Monthly: Clean up old reservations
mysql -e "DELETE FROM inventory_reservation WHERE metadata LIKE '%CLIENT%' AND ABS(quantity) < 0.01;"

# Quarterly: Full reservation reconciliation
bin/magento plenty:stock:import --profile-id=1 --force
bin/magento inventory:reservation:create-compensations
```

---

### 6. Error Handling Best Practices

**Proactive Monitoring**:
```bash
# Set up automated alerts (cron or monitoring tool)

# Alert if pending items > 24 hours old
mysql -e "SELECT COUNT(*) FROM plenty_stock WHERE status = 'PENDING' AND TIMESTAMPDIFF(HOUR, collected_at, NOW()) > 24;" | grep -v COUNT | xargs -I {} sh -c 'if [ {} -gt 0 ]; then echo "Alert: {} items stuck in PENDING"; fi'

# Alert if error count high
mysql -e "SELECT COUNT(*) FROM plenty_stock WHERE status = 'ERROR';" | grep -v COUNT | xargs -I {} sh -c 'if [ {} -gt 10 ]; then echo "Alert: {} items in ERROR status"; fi'

# Alert if last collection > 2 hours ago
mysql -e "SELECT MAX(collected_at) FROM plenty_stock;" | xargs -I {} sh -c 'date -d "{}" +%s' | xargs -I {} sh -c 'if [ $(($(date +%s) - {})) -gt 7200 ]; then echo "Alert: No stock collected in 2+ hours"; fi'
```

**Error Recovery Procedure**:
```bash
# 1. Identify errors
mysql -e "SELECT variation_id, warehouse_id, message FROM plenty_stock WHERE status = 'ERROR' LIMIT 20;"

# 2. Categorize errors
# - SKU not found: Import products first
# - Warehouse not mapped: Add mapping
# - Validation failed: Check data integrity

# 3. Fix root cause
# (Add products, mappings, etc.)

# 4. Reset error items to pending
mysql -e "UPDATE plenty_stock SET status = 'PENDING' WHERE status = 'ERROR';"

# 5. Re-import
bin/magento plenty:stock:import --profile-id=1

# 6. Verify resolution
mysql -e "SELECT COUNT(*) FROM plenty_stock WHERE status = 'ERROR';"
```

---

### 7. Security and Compliance Best Practices

**API Security**:
- ✅ Use HTTPS for all API communication
- ✅ Store credentials encrypted in configuration
- ✅ Rotate OAuth tokens periodically
- ✅ Limit API user permissions in PlentyONE
- ✅ Monitor API access logs

**Log Management**:
- ✅ Disable request logging in production (contains credentials)
- ✅ Rotate logs regularly (weekly/monthly)
- ✅ Restrict log file permissions (chmod 640)
- ✅ Exclude logs from version control

**Data Integrity**:
- ✅ Regular full reconciliation (weekly/monthly)
- ✅ Audit trail via history logging
- ✅ Backup stock data before major changes
- ✅ Document configuration changes
- ✅ Test in staging before production changes

**Audit Trail**:
```bash
# Enable history logging
# Admin: Profile → Schedule Configuration → Enable History: Yes

# Query history for audit
mysql -e "SELECT entity_id, status, created_at, updated_at FROM plenty_stock_history WHERE variation_id = 12345 ORDER BY created_at DESC LIMIT 10;"

# Track stock changes over time
mysql -e "SELECT DATE(created_at) as date, AVG(stock_physical) as avg_stock, MIN(stock_physical) as min_stock, MAX(stock_physical) as max_stock FROM plenty_stock_history WHERE variation_id = 12345 GROUP BY DATE(created_at) ORDER BY date DESC;"
```

---

## Related Documentation

- [Product Import Profile](/docs/profiles/product-import) - Import products before stock
- [Stock Export Profile](/docs/profiles/stock-export) - Export stock from Magento to PlentyONE
- [Order Export Profile](/docs/profiles/order-export) - Export orders (creates reservations)
- [MSI Configuration](/docs/configuration/msi) - Multi-Source Inventory setup
- [Warehouse Mapping](/docs/mapping/warehouses) - Detailed warehouse mapping guide
- [Profile Configuration](/docs/configuration/profiles) - General profile management

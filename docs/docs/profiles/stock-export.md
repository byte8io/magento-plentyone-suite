---
sidebar_position: 14
title: Stock Export Profile
description: Push Magento inventory changes to PlentyONE using the Stock Export Profile (absolute or delta corrections)
---

# Stock Export Profile

The **Stock Export Profile** pushes Magento inventory changes back to PlentyONE. It supports two correction strategies — **absolute** (overwrite Plenty's value) and **delta** (send only the change, preserving Plenty-side channel sales such as Amazon and eBay). It is designed for high-frequency event-driven syncs plus a periodic drift-reconciliation safety net.

## Overview

**Profile Type ID**: `plenty_stock_export`
**Direction**: Magento → PlentyONE
**Purpose**: Keep PlentyONE's physical stock aligned with Magento as inventory changes (sales, stock receipts, manual corrections, MSI source changes).

### When to use which correction mode

| Scenario | Recommended mode |
|---|---|
| Plenty only sells through Magento (no Amazon / eBay / other channels via Plenty) | **Absolute** |
| Plenty also sells the same SKUs through external channels (Amazon, eBay, etc.) | **Delta** (with default `absolute_then_delta` bootstrap) |
| Migrating an established Plenty store; want Plenty's existing state preserved untouched | **Delta** with `skip_and_seed` bootstrap |

:::warning Channel-sales hazard with absolute mode
Absolute mode overwrites Plenty's current physical with Magento's. If Plenty has channel deductions that Magento doesn't know about (e.g. an Amazon sale processed in Plenty without reaching Magento), absolute mode will undo them and you risk overselling on the channel. If your Plenty has channel sales, use **delta** mode.
:::

### Architecture

The Stock Export system follows a five-stage pipeline with a producer–queue–consumer model:

```
┌──────────────────────────────────────────────────────────────────┐
│                     STOCK EXPORT PIPELINE                          │
└──────────────────────────────────────────────────────────────────┘

STAGE 1: PRODUCERS (enqueue changed SKUs into plenty_stock_export_queue)
├─ EnqueueAfterSourceItemsSavePlugin           (MSI source-item save: admin, REST, CSV, mass action)
├─ EnqueueAfterSourceItemsDeletePlugin         (MSI source-item delete)
├─ EnqueueAfterLegacyStockItemSavePlugin       (Magento\CatalogInventory\Api\StockItemRepositoryInterface::save)
├─ EnqueueAfterDecrementSourceItemQtyPlugin    (shipment-driven physical decrement — bypasses SourceItemsSaveInterface)
├─ EnqueueOnCatalogProductSaveAfter (observer) (catalog_product_save_after — safety net)
└─ DriftReconciler (cron + CLI)                (enqueues SKUs where Magento ≠ Plenty cache)

STAGE 2: TRIGGER / SCHEDULE (drains the queue)
├─ Cron: plenty_stock_export                 (admin-tunable via config_path — no default schedule)
├─ MQ:   plenty.stock.export.processor       (async, on-demand publish)
└─ CLI:  bin/magento plenty:stock:export     (manual / scripted)

STAGE 3: GENERATORS (build the API request per queued SKU)
├─ Generator\StockPhysical          (absolute mode — early-returns in delta mode)
│  ├─ Reads MSI source items for the SKU
│  ├─ Resolves variationId via SkuToVariationIdResolverInterface
│  └─ Emits one row per (variation, warehouse) into the absolute request key
└─ Generator\StockPhysicalDelta     (delta mode — early-returns in absolute mode)
   ├─ Reads queue row's last_pushed_qty[warehouseId] baseline
   ├─ Computes delta = magento_qty - baseline
   ├─ Handles bootstrap (no-baseline case) per bootstrap_policy
   └─ Emits one row into either the absolute or delta request key

STAGE 4: PROCESSORS (call the Plenty API)
├─ Processor\StockPhysical          (absolute — createStockCorrection, reasonId 301)
│  └─ Batches up to 20 corrections per warehouse; stashes baseline on success
└─ Processor\StockPhysicalDelta     (delta — bookIncomingItems / bookOutgoingItems)
   ├─ Splits batch rows into incoming (delta > 0) / outgoing (delta < 0)
   ├─ Calls bookIncomingItems with reasonId 100 and positive quantity
   ├─ Calls bookOutgoingItems with reasonId 200 and negative quantity
   └─ Captures Plenty booking id / orderNo from incoming response

STAGE 5: POST-PROCESSORS (persist results, audit, log)
├─ UpdateLastPushedQty (sortOrder: 5)     — writes last_pushed_qty for delta-mode baseline
├─ SaveEntity          (sortOrder: 10)    — writes queue row status / message / metadata
├─ History             (sortOrder: 20)    — profile history (audit trail)
└─ DataLog             (sortOrder: 30)    — verbose per-row logging
```

### Key features

**Event-driven** — every Magento stock change (MSI source-item save / delete, legacy single-source save, shipment-driven decrement, catalog save observer) immediately enqueues the SKU. No polling.

**Coalescing queue** — `plenty_stock_export_queue` has a UNIQUE constraint on `sku`. Rapid back-to-back changes for the same SKU don't pile up; the next worker run processes the latest state.

**Drift reconciler** — hourly cron compares Magento physical against the cached Plenty physical (`plenty_stock_entity`) and enqueues SKUs whose values diverge by more than 0.0001. This is the safety net for missed events (MQ outages, hook failures, deploy races).

**Two correction strategies**:
- **Absolute** — overwrite. One API call (`createStockCorrection`). Simple, idempotent on retry.
- **Delta** — relative. One or two API calls per warehouse (`bookIncomingItems`, `bookOutgoingItems`). Preserves Plenty-side channel deductions.

**Bootstrap policy** — for delta mode, controls what happens on the very first push for any (SKU, warehouse) pair. Default `absolute_then_delta` aligns Plenty to Magento once, then maintains the baseline atomically for all future delta pushes.

**Audit trail** — every successful incoming-items push records the Plenty booking `id` and `orderNo` into the queue row's `metadata.plenty_bookings` array. Outgoing pushes (which return empty body) record direction, qty, warehouse, and timestamp.

**Operator visibility** — the CLI emits seed summaries, per-SKU success/error messages, and per-batch failure reasons in the same renderer used by other Plenty profiles.

### What gets exported

| Data | Source | Target |
|---|---|---|
| Physical stock (per warehouse) | `inventory_source_item.quantity` | Plenty `stockPhysical` |
| Last-pushed baseline | `plenty_stock_export_queue.last_pushed_qty` JSON | Local only (delta mode) |
| Booking audit | Plenty response (incoming only) | `plenty_stock_export_queue.metadata.plenty_bookings` |

:::info Excluded by design
Order-lifecycle events (`sales_order_*`) **do not** enqueue. Plenty manages its own reservations when the Order Export Profile delivers the order; pushing stock on `sales_order_*` would double-deduct. Reservations are handled by the order export flow, not this profile.

Configurable, bundle, and grouped product parents are **filtered out** by the queue management layer (`STOCK_ELIGIBLE_TYPES = ['simple', 'virtual', 'downloadable']`). They have no `inventory_source_item` row and would produce no-ops.
:::

---

## Configuration Sections

Profile is configured under **Stores → Configuration → PlentyMarkets → Stock Export Profile** (or `Profiles → Stock Export` in the admin grid). The fieldsets mirror the import profile's structure.

### 1. Client Configuration

Same client model as Stock Import. The Mage2Plenty connector uses a single-client architecture; the dropdown displays the configured client and provides shortcuts to edit / create / collect-config.

**Required action before first sync**: click **Collect Configuration Data**. This populates warehouse, source, and currency reference data from Plenty.

See [Stock Import → Client Configuration](./stock-import.md#1-client-configuration) for the full field reference; it's identical.

### 2. Schedule Configuration

Same schedule model as Stock Import: `status` (enable / disable the cron), `schedule_id` (which cron schedule), `process_batch_size` (default 100 for export, vs 20 for import).

**Cron group**: `plenty_stock_profile`
**Cron job name**: `plenty_stock_export`
**Default schedule path**: `crontab/plenty_stock_profile/jobs/plenty_stock_export/schedule/cron_expr`

**Recommended frequency**:

| Store type | Frequency | Rationale |
|---|---|---|
| High-traffic with channels | Every 5 minutes | Push Magento changes quickly so channel availability stays accurate |
| Standard e-commerce | Every 15 minutes | Balance API load against freshness |
| Low-velocity catalog | Hourly | Stock rarely changes; drift reconciler still picks up anything missed |

:::info Cron + MQ + event-driven all work together
The MQ consumer (`plenty.stock.export.processor` topic) processes high-priority pushes async, the cron runs the queue drain on schedule, and producers enqueue on every Magento stock change. The three layers are complementary — disabling one doesn't break the others, but you lose timeliness.
:::

### 3. HTTP API Configuration

Same as Stock Import — connection timeouts, retries, and rate-limit handling. See [Stock Import → HTTP API Configuration](./stock-import.md#3-http-api-configuration).

### 4. Stock Configuration

This is where Stock Export diverges from Stock Import. Fields specific to export are described below; fields shared with import (`main_warehouse_id`, `stock_source_mapping`, `source_selection_algorithm`) are documented in the import profile.

#### Main Warehouse ID

**Field**: `main_warehouse_id`
**Scope**: Global
**Required**: Yes

Default Plenty warehouse to push to when an MSI source has no explicit mapping.

#### Stock Source Mapping

**Field**: `stock_source_mapping`
**Type**: Dynamic rows (Magento source → Plenty warehouse)
**Scope**: Global
**Required**: When the store has multiple inventory sources

Each row maps a Magento source code (from MSI) to a Plenty warehouse ID. The generator uses `getWarehouseIdBySourceCode($sourceCode)` to resolve.

If a source isn't mapped, its stock is not exported. To export everything to a single Plenty warehouse, leave the mapping empty and set `main_warehouse_id`.

#### Source Selection Algorithm

Same as Stock Import — controls MSI source priority on the Magento side.

#### Stock Correction Mode

**Field**: `correction_mode`
**Type**: Select
**Default**: `absolute`
**Scope**: Global
**Required**: Yes

Choose how Magento changes are pushed to Plenty.

| Value | Description | Use when |
|---|---|---|
| `absolute` | Overwrite Plenty's physical with Magento's via `createStockCorrection` (reasonId 301). | Plenty has no channel sales; simplest model. |
| `delta` | Send only the change via `bookIncomingItems` / `bookOutgoingItems` (reasonId 100 / 200). Preserves Plenty-side channel deductions. | Plenty sells the same SKUs on Amazon, eBay, or other channels. |

:::warning Switching from `absolute` to `delta` for an existing profile
The first delta-mode push for every (SKU, warehouse) pair triggers the **Bootstrap Policy** below. The default policy will run a one-shot absolute reconciliation before switching to deltas — this aligns Plenty to Magento once, then preserves channel deductions from that point onward. If that's not what you want, set bootstrap policy to `skip_and_seed` *before* enabling delta mode.
:::

#### Delta Bootstrap Policy

**Field**: `bootstrap_policy`
**Type**: Select
**Default**: `absolute_then_delta`
**Scope**: Global
**Required**: Yes (only consulted in delta mode)

Controls what happens on the **very first push** for a given (SKU, warehouse) pair in delta mode — i.e. when `plenty_stock_export_queue.last_pushed_qty` has no entry for that warehouse yet.

| Value | Behavior | Use when |
|---|---|---|
| `absolute_then_delta` *(default, recommended)* | Push absolute Magento qty via `createStockCorrection` once, then record the baseline. From the next push onward, use deltas. | New installations, switches into delta mode, almost all real-world cases. |
| `skip_and_seed` | No API call. Record current Magento qty as the baseline. Plenty's current value is preserved as-is. | Migrating an established Plenty store; you want its existing state untouched. |
| `reconcile_to_cache` | Compute delta against the local `plenty_stock_entity` cache and push it. Overwrites Plenty-side channel deductions on day-zero. | Staged rollouts where you want to inspect computed deltas before any HTTP push; rare. |

The default resolves the apparent tension between "Magento is authoritative" (you enabled export) and "channel deductions matter" (you chose delta). On day-zero we make Plenty match Magento; from day-1 onward channels are preserved.

See [Workflow 4](#workflow-4-channel-sales-with-delta-mode) below for the full walk-through.

### 5. Event Configuration

Producers are wired as Magento plugins / observers in `etc/di.xml` and `etc/events.xml`. They are **not** toggleable per-profile through the admin form — once the module is installed and enabled, all five producers fire globally on the events they hook. The Event Configuration fieldset on the profile form is currently a placeholder for future per-event toggles and intentionally empty.

| Producer | Hooks | Triggered by | `trigger_reason` recorded |
|---|---|---|---|
| `EnqueueAfterSourceItemsSavePlugin` | `Magento\InventoryApi\Api\SourceItemsSaveInterface::execute` | MSI source-item save (admin product page, REST API, CSV import, mass action) | `source_item_save` |
| `EnqueueAfterSourceItemsDeletePlugin` | `Magento\InventoryApi\Api\SourceItemsDeleteInterface::execute` | MSI source-item delete | `source_item_save` |
| `EnqueueAfterLegacyStockItemSavePlugin` | `Magento\CatalogInventory\Api\StockItemRepositoryInterface::save` | Legacy single-source stock save | `source_item_save` |
| `EnqueueAfterDecrementSourceItemQtyPlugin` | `Magento\Inventory\Model\SourceItem\Command\DecrementSourceItemQty::execute` | Shipment-driven physical decrement (bypasses `SourceItemsSaveInterface`) | `shipment` |
| `EnqueueOnCatalogProductSaveAfter` | `catalog_product_save_after` event | Any code path that saves a product and changes stock | `product_save` |

If you need to temporarily disable a producer during troubleshooting (e.g. isolate the source of an enqueue spike), comment out the corresponding `<type>` block in `module-plenty-stock-profile/etc/di.xml`, recompile DI, and flush cache. Re-enable when done.

### 6. Log Configuration

Same as Stock Import — controls log file paths, log levels, and per-profile log retention.

---

## Common Workflows

### Workflow 1: Initial setup (absolute mode, no channels)

For a store that only sells through Magento. Plenty receives the orders via the Order Export profile and the Stock Export profile keeps Plenty's physical aligned with Magento.

1. **Pre-flight**:
   ```bash
   bin/magento module:status Byte8_PlentyStock
   bin/magento module:status Byte8_PlentyStockProfile
   bin/magento setup:db-status                  # confirm db_schema is current
   ```

2. **Create the profile**:
   - Admin → Profiles → Add → choose **Stock Export**.
   - Set `client_id`, click **Collect Configuration Data**, wait for Plenty warehouses to populate.
   - Set `main_warehouse_id` and `stock_source_mapping` rows.
   - Leave `correction_mode = absolute`.
   - Enable the schedule.

3. **First sync** — seed the queue and drain. Use `--all` at onboarding since `plenty_stock_entity` cache is typically empty and drift can't compute divergence yet:
   ```bash
   bin/magento plenty:stock:export:add --all      # bulk-enqueues every stock-eligible product (prompts)
   bin/magento plenty:stock:export --status=pending
   ```

4. **Verify**:
   ```sql
   SELECT status, COUNT(*) FROM plenty_stock_export_queue GROUP BY status;
   ```
   Expect most rows to be `success`; investigate any `error`.

5. **Hand over to cron**: leave the queue draining on schedule. New Magento stock changes auto-enqueue via the producer plugins.

### Workflow 2: Initial setup (delta mode, with channel sales)

For a store where Plenty also sells the SKUs on Amazon, eBay, or other channels.

1. Follow steps 1–2 of Workflow 1 to create the profile.
2. **Set delta mode**:
   - `correction_mode = delta`
   - `bootstrap_policy = absolute_then_delta` *(default, leave as-is)*
3. **First sync** — seed and drain. Use `--all` at onboarding (drift needs a populated `plenty_stock_entity` cache to work, and it's typically empty on a brand-new install):
   ```bash
   bin/magento plenty:stock:export:add --all
   bin/magento plenty:stock:export --status=pending -vv
   ```
   The first push per SKU triggers the bootstrap policy. Under the default `absolute_then_delta`, that's a one-shot `createStockCorrection` to align Plenty with Magento. Subsequent pushes for the same (SKU, warehouse) pair use `bookIncomingItems` / `bookOutgoingItems`.
4. **Verify baselines were set**:
   ```sql
   SELECT sku, last_pushed_qty FROM plenty_stock_export_queue
   WHERE status = 'success' AND last_pushed_qty IS NOT NULL LIMIT 10;
   ```
5. **Verify channel preservation** (after at least one channel sale and one Magento change has occurred):
   - Check that a Plenty-side Amazon sale wasn't undone by a Magento push.
   - The queue row's `metadata.plenty_bookings` should show only the bookings we triggered.

### Workflow 3: Manual export for specific SKUs / products

Useful for testing, ad-hoc fixes, and incident response.

```bash
# Export by SKU (queue is seeded automatically if rows don't exist)
bin/magento plenty:stock:export -s "24-MG04,WSH12,WP07"

# Export by Magento product ID
bin/magento plenty:stock:export -i 42,17,99

# Re-run rows currently in error status
bin/magento plenty:stock:export --status=error

# Process multiple status values
bin/magento plenty:stock:export --status=pending,error
```

The CLI prints a seed summary first (showing how many queue rows were inserted / updated) then renders per-SKU results.

:::tip "No filter provided. Nothing to do."
If you run `bin/magento plenty:stock:export` with no flags, the command intentionally does nothing and prints a hint. The cron uses an explicit `status = pending` filter; the CLI requires you to be explicit about scope. To process all pending rows from the CLI, use `--status=pending`.
:::

### Workflow 4: Channel sales with delta mode

Walk-through with concrete numbers showing what each correction mode does.

**Scenario**: Magento has 10 units. Plenty has 10. Amazon then sells 3 via Plenty (Magento blind). Plenty real = 7. Magento later ships 1 → Magento qty = 9.

**Absolute mode**:
1. Magento ships → enqueues SKU. Generator emits `quantity = 9`.
2. Processor calls `createStockCorrection(quantity = 9)`. Plenty becomes 9.
3. **Channel deduction is undone**. Next Amazon order can oversell by 3.

**Delta mode, `absolute_then_delta` policy** (default, day-zero already passed):
1. `last_pushed_qty[wh] = 10` (set on first push earlier).
2. Magento ships → enqueues SKU. Generator computes `delta = 9 - 10 = -1`.
3. Processor calls `bookOutgoingItems(quantity = -1, reasonId = 200)`. Plenty becomes 6 (= 7 − 1). **Channel deduction preserved**.
4. Generator stashes new baseline `last_pushed_qty[wh] = 9`. Next sync compares against 9.

### Workflow 5: Drift reconciliation

Drift reconciler is the safety net. It runs hourly under the `plenty_stock_profile` cron group at `15 * * * *`.

```bash
# Manual drift sweep
bin/magento plenty:stock:export:drift

# Limit how many divergent SKUs to enqueue per run
bin/magento plenty:stock:export:drift --limit=500

# Profile-scoped
bin/magento plenty:stock:export:drift --profile=1
```

The command compares `inventory_source_item.quantity` to the cached `plenty_stock_entity.stock_physical` (per Magento source / Plenty warehouse) and enqueues SKUs where `|magento_qty − plenty_phy| > 0.0001`. Enqueued rows get `trigger_reason = collect_drift`.

:::warning Drift reconciler vs delta mode
The drift reconciler enqueues SKUs based on cached Plenty values, not real Plenty values. In delta mode the cache is *expected* to disagree with real Plenty when there are channel sales — those deductions exist in real Plenty but the cache may reflect them depending on when the import cron last ran. The reconciler simply enqueues divergent SKUs; the generator does the right thing (re-seeds baseline, no-ops or sends a correct delta) based on the actual `last_pushed_qty`.
:::

### Workflow 6: Async export via MQ (high-priority pushes)

For latency-sensitive pushes (admin saves, REST API calls), publish to the MQ topic and let a consumer drain it asynchronously.

```bash
# Start the consumer (typically managed by supervisor/systemd)
bin/magento queue:consumers:start plenty.stock.export.processor

# Verify the topic exists
bin/magento queue:consumers:list | grep plenty.stock.export
```

The admin grid's **Mass Export** action publishes selected queue rows to this topic for immediate processing, then falls back to the cron drain if the consumer is down.

### Workflow 7: Switching from absolute to delta mid-flight

For a store that previously ran absolute mode and is now adopting delta mode (e.g. because they're expanding into Amazon).

1. **Confirm baseline column is populated**:
   ```sql
   SELECT COUNT(*) FROM plenty_stock_export_queue
   WHERE last_pushed_qty IS NOT NULL OR last_pushed_qty != '';
   ```
   The absolute processor stashes the baseline on every successful push (free side-effect), so if the store has been running for a while, baselines are likely populated for active SKUs.

2. **For SKUs with no baseline yet**: the new default `bootstrap_policy = absolute_then_delta` handles them automatically on first delta-mode push. Day-zero alignment, no operator action needed.

3. **Flip the mode**:
   - Admin → Stock Export Profile → set `correction_mode = delta`. Save.
4. **Monitor first cron cycle**: messages should show `Bootstrap (absolute then delta)` for any SKU that hadn't been seen yet, and `Delta corrected (incoming|outgoing)` for SKUs with established baselines.

---

## CLI Commands Reference

### Stock Export Commands

```bash
# Process pending queue rows (default behavior of cron + MQ consumer)
bin/magento plenty:stock:export --status=pending

# Export specific SKUs (auto-seeds the queue if rows don't exist)
bin/magento plenty:stock:export -s "SKU1,SKU2,SKU3"

# Export by Magento product ID
bin/magento plenty:stock:export -i 42,17,99

# Retry failed rows
bin/magento plenty:stock:export --status=error

# Multiple statuses
bin/magento plenty:stock:export --status=pending,error

# Profile-scoped
bin/magento plenty:stock:export --profile=1

# Verbose output
bin/magento plenty:stock:export --status=pending -v
bin/magento plenty:stock:export --status=pending -vv
```

### Queue Management Commands

```bash
# Add SKUs to the queue (auto-skips configurable / bundle / grouped parents)
bin/magento plenty:stock:export:add -s "SKU1,SKU2"

# Add by Magento product ID
bin/magento plenty:stock:export:add -i 42,17

# Bulk-seed the whole catalog (prompts for confirmation)
bin/magento plenty:stock:export:add --all

# Same, scripted (skip the confirmation)
bin/magento plenty:stock:export:add --all --force

# Purge specific SKUs from the queue
bin/magento plenty:stock:export:purge -s "SKU1,SKU2"

# Purge by queue entity_id
bin/magento plenty:stock:export:purge -i 1001,1002

# Purge completed rows older than N days (leaves pending / processing untouched)
bin/magento plenty:stock:export:purge --older-than=30

# Truncate the entire queue (every row, every status) — prompts for confirmation
bin/magento plenty:stock:export:purge --all

# Same, scripted
bin/magento plenty:stock:export:purge --all --force
```

:::tip `--all` vs `plenty:stock:export:drift`
Use `--all` at **onboarding** when `plenty_stock_entity` cache is empty and drift can't compute divergence yet. Use `plenty:stock:export:drift` for **ongoing maintenance** — it only enqueues SKUs whose Magento value disagrees with the cached Plenty value, so it doesn't generate API calls for SKUs that are already in sync.
:::

**Alternative for truncate**: the admin grid's **Flush Data** button (`plenty_stock/exportQueue/flushData`) does the same thing as `--all --force` and is convenient when you're already in the admin UI.

### Drift Reconciliation Commands

```bash
# Run drift sweep manually (same logic as the hourly cron)
bin/magento plenty:stock:export:drift

# Limit per-run enqueues
bin/magento plenty:stock:export:drift --limit=500

# Profile-scoped
bin/magento plenty:stock:export:drift --profile=1
```

### Database Query Commands

```sql
-- Queue health overview
SELECT status, COUNT(*) FROM plenty_stock_export_queue GROUP BY status;

-- Recently failed rows
SELECT sku, status, attempts, message, updated_at
FROM plenty_stock_export_queue
WHERE status = 'error'
ORDER BY updated_at DESC LIMIT 20;

-- Rows stuck in "processing" (possibly orphaned by a crashed worker)
SELECT sku, attempts, updated_at FROM plenty_stock_export_queue
WHERE status = 'processing' AND updated_at < NOW() - INTERVAL 1 HOUR;

-- Inspect last_pushed_qty for a SKU (delta-mode baseline)
SELECT sku, last_pushed_qty FROM plenty_stock_export_queue
WHERE sku = '24-MG04';

-- Inspect Plenty booking audit trail
SELECT sku, JSON_EXTRACT(metadata, '$.plenty_bookings') FROM plenty_stock_export_queue
WHERE sku = '24-MG04';

-- Rows enqueued by trigger reason
SELECT trigger_reason, COUNT(*) FROM plenty_stock_export_queue GROUP BY trigger_reason;

-- Drift-enqueued (suggests events were missed)
SELECT sku, updated_at FROM plenty_stock_export_queue
WHERE trigger_reason = 'collect_drift' ORDER BY updated_at DESC LIMIT 20;
```

### Configuration Commands

```bash
# View export profile configuration
bin/magento config:show plenty/plenty_stock_export

# Check correction mode
bin/magento config:show plenty_stock_export/stock_config/correction_mode

# Check bootstrap policy
bin/magento config:show plenty_stock_export/stock_config/bootstrap_policy

# Source mapping (Magento source → Plenty warehouse)
bin/magento config:show plenty_stock_export/stock_config/stock_source_mapping
```

### Cron Management

```bash
# Check stock export cron status
bin/magento cron:status | grep plenty_stock_export

# View recent runs
mysql -e "SELECT job_code, status, scheduled_at, executed_at, messages
          FROM cron_schedule
          WHERE job_code = 'plenty_stock_export'
          ORDER BY scheduled_at DESC LIMIT 10;"

# Trigger the cron group manually
bin/magento cron:run --group=plenty_stock_profile
```

### Log Inspection

```bash
# Tail the export log
tail -f var/log/plenty_stock_export.log

# Filter errors
grep -i error var/log/plenty_stock_export.log | tail -50

# Filter API responses for a specific SKU
grep "24-MG04" var/log/plenty_stock_export.log | tail -30
```

---

## Troubleshooting

### Issue 1: CLI run prints "Stock is up-to-date" but I know SKUs need pushing

**Symptoms**:
- `bin/magento plenty:stock:export -s "SKU1"` succeeds without sending anything to Plenty.
- Queue row shows `success` status but `last_pushed_qty` didn't change.

**Diagnosis**:

```sql
-- Check the queue row's current state
SELECT sku, status, last_pushed_qty, trigger_reason, attempts, message
FROM plenty_stock_export_queue WHERE sku = 'SKU1';

-- Check Magento source items
SELECT source_code, quantity FROM inventory_source_item WHERE sku = 'SKU1';
```

**Possible causes**:

1. **Delta mode + matching baseline**. If `last_pushed_qty[warehouse_id]` already equals current Magento qty, the generator correctly skips (delta = 0). No API call is correct behavior. Confirm by inspecting the baseline.

2. **Source code isn't mapped**. The generator can only push to warehouses that have a mapping. Verify `stock_source_mapping` covers the SKU's MSI sources.

3. **Product type isn't stock-eligible**. Configurable / bundle / grouped parents are filtered. The SKU should be a simple / virtual / downloadable product (or a variant of a configurable, which is itself a simple).

4. **SKU not in Plenty**. `SkuToVariationIdResolverInterface::execute()` returned null. The product hasn't been synced to Plenty yet via the Item Export profile.

### Issue 2: Plenty's stock stays wrong forever (delta mode)

**Symptoms**:
- Magento has 5 units, Plenty has 0 (or some other wrong value).
- Drift reconciler enqueues the SKU every hour.
- CLI runs complete with no API call to Plenty.
- `last_pushed_qty` shows current Magento qty (the baseline matches Magento, so delta = 0).

**Diagnosis**:

```sql
SELECT sku, status, last_pushed_qty, attempts, updated_at
FROM plenty_stock_export_queue WHERE sku = '24-MG04';
```

If `last_pushed_qty` exists and equals Magento's qty but Plenty is wrong, the SKU was previously bootstrapped under `skip_and_seed` (which seeds the baseline without pushing). Plenty was never aligned.

**Fix**: temporarily switch the profile's `bootstrap_policy` to `absolute_then_delta` (or `correction_mode` to `absolute`), clear the baseline for the affected SKU, re-enqueue, then switch back.

```sql
-- Clear baseline for one SKU so the next push runs bootstrap again
UPDATE plenty_stock_export_queue SET last_pushed_qty = NULL WHERE sku = '24-MG04';
```

```bash
# Re-enqueue and process
bin/magento plenty:stock:export -s "24-MG04"
```

:::tip Why the default is `absolute_then_delta`
This is the exact failure mode the new default resolves. New installations of this version will never hit it. Only stores that were running on the previous `skip_and_seed` default (and never switched away) can be affected.
:::

### Issue 3: Channel oversell (Amazon / eBay / other Plenty channels)

**Symptoms**:
- Plenty showed 5 units for a SKU, Amazon sold 3 (Plenty real = 2), then a Magento push reset Plenty to 5.
- Customer is unable to buy on Magento despite Plenty showing low stock.

**Diagnosis**:

```sql
-- What correction mode is the profile in?
SELECT value FROM core_config_data WHERE path = 'plenty_stock_export/stock_config/correction_mode';

-- For the affected SKU, what does the metadata trail show?
SELECT sku, JSON_EXTRACT(metadata, '$.plenty_bookings') FROM plenty_stock_export_queue
WHERE sku = 'AFFECTED-SKU';
```

If `correction_mode = absolute`, **this is expected behavior** of absolute mode. Switch to `delta` mode to preserve channel deductions going forward.

If `correction_mode = delta` but the metadata trail shows a `createStockCorrection`-style booking, the SKU went through a bootstrap. From the next push onward, deltas will preserve channel state.

**Fix**:
1. Switch `correction_mode = delta` if not already.
2. Ensure `bootstrap_policy = absolute_then_delta` (default) so future SKUs are aligned on first contact.
3. For SKUs that have already lost their channel state due to a previous absolute push, no automated recovery is possible — the Plenty side needs the channel system to re-emit the deductions or operator manually re-applies them in Plenty.

### Issue 4: Queue rows stuck in "processing"

**Symptoms**:
- `SELECT COUNT(*) FROM plenty_stock_export_queue WHERE status = 'processing'` returns non-zero and isn't decreasing.
- Rows have old `updated_at` (e.g. > 1 hour).

**Diagnosis**: a worker crashed or was killed mid-batch, leaving the status flipped to `processing` but never finalized.

**Fix**:

```sql
-- Reset stale "processing" rows to pending so they get re-tried
UPDATE plenty_stock_export_queue
SET status = 'pending', message = NULL
WHERE status = 'processing' AND updated_at < NOW() - INTERVAL 1 HOUR;
```

Or via the admin grid: filter `status = processing`, mass-action **Reset to Pending**.

### Issue 5: Drift reconciler hammers the queue indefinitely (delta mode, legacy `skip_and_seed`)

**Symptoms**:
- Same SKU re-appears in the queue every hour with `trigger_reason = collect_drift`.
- Pushes "succeed" but Plenty never matches Magento.

This is the legacy-bootstrap manifestation of Issue 2. Apply the same fix.

### Issue 6: First delta push fails ("Plenty validation error")

**Symptoms**: log shows `validation error found` from Plenty with messages like `outgoingItems.0.deliveredAt: validation.date_w3c` or `outgoingItems.0.reasonId must be between 200 and 299`.

**Diagnosis**: this would indicate a wire-format regression. The constants are:

| Endpoint | Reason ID | Quantity sign |
|---|---|---|
| `bookIncomingItems` | 100 | positive |
| `bookOutgoingItems` | 200 | negative |
| `createStockCorrection` (absolute / bootstrap) | 301 | absolute value |

The `deliveredAt` field is built from `DateTimeInterface::W3C` (`Y-m-d\TH:i:sP`) → e.g. `2026-05-29T13:13:12+00:00`. Naive timestamps without timezone will be rejected by Plenty.

If you see this in production, file an issue — it would mean a code-level wire-format regression rather than a configuration problem.

### Issue 7: Producer plugin not enqueuing on Magento save

**Symptoms**:
- Editing a product's stock in admin doesn't add a queue row.
- Queue stays empty between drift reconciler runs.

**Diagnosis**:

```sql
-- Verify the producer fired
SELECT sku, trigger_reason, created_at FROM plenty_stock_export_queue
WHERE created_at > NOW() - INTERVAL 5 MINUTE
ORDER BY created_at DESC LIMIT 10;
```

Expected `trigger_reason` values: `source_item_save`, `product_save`, `manual`, `cli`, `collect_drift`, `reservation`, `shipment`.

If nothing appears, possible causes:
1. **Plugin disabled** in profile config (Event Configuration fieldset).
2. **Magento cache not flushed** after deploy — Magento didn't pick up the new plugin registration. Run `bin/magento cache:flush`.
3. **DI compile is stale** — run `bin/magento setup:di:compile` and flush cache.
4. **Product type is filtered**: configurable/bundle/grouped parents don't enqueue (by design). Only simple/virtual/downloadable do.

### Issue 8: Bootstrap pushes succeed but baseline isn't recorded

**Symptoms**: queue row shows `Stock corrected.` success message but `last_pushed_qty` is NULL on the next inspection.

**Diagnosis**:

```sql
SELECT sku, status, last_pushed_qty FROM plenty_stock_export_queue
WHERE sku = 'AFFECTED-SKU';
```

**Possible causes**:

1. **`PostProcessor\UpdateLastPushedQty` was disabled** in DI. Verify it's listed in the profile's `postProcessors`.
2. **`SaveEntity` failed before `UpdateLastPushedQty` could run** — check the message column for partial errors.
3. **Schema column missing** — run `bin/magento setup:upgrade` and confirm `last_pushed_qty TEXT NULLABLE` is on `plenty_stock_export_queue`.

---

## Best Practices

### 1. Initial setup

- **Check `correction_mode` matches your client's reality** before first sync. If they sell on Plenty channels, choose `delta` from day one — switching later isn't free (existing baselines remain, but SKUs that haven't been touched will go through bootstrap on next contact).
- **Run `plenty:stock:export:add --all` once** at onboarding to seed the queue (drift reconciler needs a populated `plenty_stock_entity` cache and is the right tool *after* the first stock-import has run; until then, `--all` is the way). For ongoing maintenance, drift is preferred — it only enqueues divergent SKUs.
- **Pre-flight the producer plugins** — edit one product's stock in admin and verify a row appears in `plenty_stock_export_queue` within seconds.
- **Don't enable both the schedule and the MQ consumer simultaneously on first sync** — pick one for the initial drain so you can observe results without competing workers.

### 2. Ongoing operations

- **Monitor the queue's `error` count daily**. A handful is normal (transient Plenty rate-limits, network blips). A persistent backlog signals a real issue.
- **Inspect `trigger_reason` distribution weekly**. A surge in `collect_drift` means producers are missing events — investigate.
- **Purge completed rows on a sane cadence**: `bin/magento plenty:stock:export:purge --older-than=30` daily keeps the table small (only deletes rows in `success` / `error` status; `pending` / `processing` are left untouched).
- **Watch `last_pushed_qty` size**. If a single queue row's `last_pushed_qty` JSON grows beyond a few KB, your source-to-warehouse mapping has unexpected fan-out — investigate.

### 3. Performance

- **Tune `process_batch_size`** based on observed cron run-times. Default 100 is appropriate for most stores. Smaller batches (50) give better error isolation; larger batches (200) reduce per-row overhead.
- **Use the MQ for high-priority pushes** (admin saves, REST API), schedule for background catch-up. Don't expect the schedule to be a real-time guarantee.
- **Don't run drift reconciler more often than hourly** unless investigating a specific incident. It's a safety net, not a primary sync mechanism.

### 4. Mode-switching

- **Switching `absolute → delta`**: safe because the absolute processor has been stashing baselines for free. Most active SKUs already have `last_pushed_qty`. SKUs without baselines bootstrap on next contact.
- **Switching `delta → absolute`**: also safe. `last_pushed_qty` is simply ignored in absolute mode; future pushes overwrite Plenty directly. Channel deductions present at switch time will be undone on the next push for each affected SKU.

### 5. Channel-sales hygiene

- **Treat `correction_mode = absolute` on a store with Plenty channels as a misconfiguration**, not a default. The combination silently overwrites channel state on every push.
- **Audit `metadata.plenty_bookings` for SKUs reported as oversold**. The trail shows exactly what pushes were sent and when.
- **Read PROGRESS.md 2026-05-29** in the internal `__docs/` folder for the full design rationale behind delta mode and the bootstrap policy decisions.

### 6. Error recovery

- **`error` rows are kept indefinitely** (`pruneCompleted` only purges `success` and `error` based on age). Inspect them via the admin grid before resetting them — `error` messages often reveal real Plenty-side or mapping issues.
- **For SKUs Plenty doesn't know about** (validation errors mentioning unknown variation IDs), confirm the SKU is mapped to a Plenty variation via the Item Export profile before re-trying the stock export.
- **For rate-limit errors** (`429` or Plenty's `x-plenty-global-short-period-calls-left` exhausted), the retry strategy is to wait — the next cron run will re-process pending rows.

---

## Related Documentation

- [Stock Import Profile](./stock-import.md) — the inverse direction (Plenty → Magento), populates the `plenty_stock_entity` cache used by drift reconciler and delta-mode bootstrap.
- [Order Export Profile](./order-export.md) — sends Magento orders to Plenty; Plenty manages its own reservations from those orders (this is why stock export does *not* fire on `sales_order_*` events).
- [Product Export Profile](./product-export.md) — establishes the SKU → Plenty variation ID mapping that delta mode depends on.
- [Profile Configuration overview](../configuration/profile-configuration.md) — shared fields and conventions.
- [Profile Issues troubleshooting](../troubleshooting/profile-issues.md) — generic profile failure modes.
- [API Errors troubleshooting](../troubleshooting/api-errors.md) — Plenty REST response codes and rate-limit handling.

---
sidebar_position: 5
title: Migrating from SoftCommerce to Byte8 (v4.0.0)
description: Step-by-step migration guide for the SoftCommerce → Byte8 namespace transition in Mage2Plenty v4.0.0
---

# Migrating from SoftCommerce to Byte8 (v4.0.0)

**Last Updated:** June 14, 2026
**Status:** Production Ready
**Breaking Changes:** ⚠️ Yes — vendor/namespace change + database migration (automated)

## Overview

Mage2Plenty **v4.0.0** completes our company transition from **SoftCommerce** to **Byte8**. The connector is functionally the same product you already run — this release re-homes it under the Byte8 brand and infrastructure.

### What changed

- **PHP namespaces** — `SoftCommerce\*` → `Byte8\*`
- **Composer packages** — `softcommerce/*` → `byte8/*` (the suite is now `byte8/magento-plentyone-suite`)
- **Magento module names** — `SoftCommerce_*` → `Byte8_*`
- **Profile database tables** — `softcommerce_profile_*` → `byte8_profile_*`
- **Module consolidation** — finer-grained modules were merged into their parent modules to reduce footprint and maintenance overhead

:::tip Most of your data is untouched
All `plenty_*` domain tables (items, orders, stock, customers, properties, categories, mappings, queues) keep their exact names and contents. Only the seven `softcommerce_profile_*` tables are renamed — and that rename is performed for you automatically (see [What the upgrade does](#what-the-upgrade-does-automatically)).
:::

:::info Battle-tested
The v4.0.0 namespace transition has been thoroughly tested end-to-end on dedicated migration environments (clean installs and upgrades from live SoftCommerce datasets) before release.
:::

### Grace period — no rush

Your **existing** `softcommerce/mage2plenty-os` (or `softcommerce/mage2plenty-ac` for Adobe Commerce) installation keeps working and continues to receive releases for **3 months, until 14 September 2026**. After that date, switch to `byte8/magento-plentyone-suite` (`-ac` for Adobe Commerce) to keep receiving updates. You can migrate any time within that window.

---

## Pre-Migration Checklist

<div className="checklist">

- [ ] **Full database backup** (via hosting provider or `mysqldump`)
- [ ] **Complete file system backup** of your Magento installation
- [ ] **SSH / command line access** to your server
- [ ] **Your Byte8 access token** (from your purchase confirmation — see [Composer Installation](./composer-installation.md))
- [ ] **Test environment** (strongly recommended — run this migration on staging first)
- [ ] **Maintenance window** scheduled for the production upgrade

</div>

:::warning Test first
Run the migration on a staging copy of production before upgrading the live store. The migration is automated, but a dry run on a database clone confirms the result for *your* data.
:::

---

## Step 1: Check Your Current Version

```bash
composer show softcommerce/mage2plenty-os
```

If you see a `3.x` (or earlier) version under the `softcommerce/*` vendor, follow this guide. Adobe Commerce stores will see `softcommerce/mage2plenty-ac`.

---

## Step 2: Enable Maintenance Mode

```bash
bin/magento maintenance:enable
```

---

## Step 3: Remove the SoftCommerce Packages

Remove the old metapackage. This unsets the connector code but **does not touch your database** — your configuration and data stay in place for the migration in Step 5.

**Magento Open Source:**

```bash
composer remove softcommerce/mage2plenty-os --no-update
```

**Adobe Commerce:**

```bash
composer remove softcommerce/mage2plenty-ac --no-update
```

> `--no-update` defers the dependency resolution so Composer can swap vendors in a single `update` together with the new package in Step 4.

---

## Step 4: Add the Byte8 Registry and Require the New Package

Add the Byte8 Composer registry (served from cargoman.io) and authenticate:

```bash
composer config repositories.cargoman '{"type":"composer","url":"https://byte8.packages.cargoman.io"}'
composer config http-basic.byte8.packages.cargoman.io token YOUR_TOKEN
```

Then require the new metapackage:

**Magento Open Source:**

```bash
composer require byte8/magento-plentyone-suite ^4.0
```

**Adobe Commerce:**

```bash
composer require byte8/magento-plentyone-suite-ac ^4.0
```

---

## Step 5: Run the Upgrade

```bash
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento cache:flush
```

`setup:upgrade` runs the built-in migration patches that re-home your data from SoftCommerce to Byte8 (next section).

---

## Step 6: Exit Maintenance Mode and Verify

```bash
bin/magento maintenance:disable
```

Verify the new modules are enabled and the connection is healthy:

```bash
# All connector modules should now be Byte8_*
bin/magento module:status | grep Byte8_

# Confirm the PlentyONE connection and system state
bin/magento plenty:system:check
```

In the Admin, confirm your profiles, schedules, mappings, and client configuration are all present under the existing menus.

---

## What the Upgrade Does Automatically

`bin/magento setup:upgrade` runs Byte8 setup patches that migrate your installation in place — **you do not need to run any SQL by hand**:

| Area | Action |
|------|--------|
| **Profile tables** | Renames `softcommerce_profile_*` → `byte8_profile_*` (DDL `RENAME TABLE`, FK-safe) |
| **Transient tables** | Truncates `softcommerce_profile_history` and `softcommerce_profile_queue` before rename (large, no business value) |
| **`setup_module`** | Re-points module rows from `SoftCommerce_*` to `Byte8_*` (and folds consolidated modules into their parent) so Magento doesn't try to reinstall |
| **`core_config_data`** | Rewrites configuration paths `softcommerce_profile*` → `byte8_profile*` (your settings are preserved) |
| **`authorization_rule`** | Rewrites admin ACL resources `SoftCommerce_*::*` → `Byte8_*::*` so existing admin roles keep their permissions |
| **EAV / config source models** | Rewrites stored `SoftCommerce\…` class references to `Byte8\…` (attributes, profile config) |

All patches are **idempotent and existence-checked**, so they are safe on fresh installs and safe to re-run.

### Database table reference

Only these tables are renamed — everything else (all `plenty_*` tables) keeps its name:

| Legacy table | New table | Note |
|---|---|---|
| `softcommerce_profile_entity` | `byte8_profile_entity` | Profiles preserved |
| `softcommerce_profile_config` | `byte8_profile_config` | Settings preserved |
| `softcommerce_profile_schedule` | `byte8_profile_schedule` | Schedules preserved |
| `softcommerce_profile_notification` | `byte8_profile_notification` | Preserved |
| `softcommerce_profile_notification_summary` | `byte8_profile_notification_summary` | Preserved |
| `softcommerce_profile_history` | `byte8_profile_history` | **Truncated** (run history) |
| `softcommerce_profile_queue` | `byte8_profile_queue` | **Truncated** (transient queue) |

### Module consolidation map

The connector now ships as a smaller, consolidated set of modules. The patches fold the legacy modules into their new parents automatically:

| Legacy module(s) | New module |
|---|---|
| `SoftCommerce_PlentyClient`, `SoftCommerce_PlentyLog`, `SoftCommerce_PlentyProfile` | `Byte8_PlentyCore` |
| `SoftCommerce_Profile`, `SoftCommerce_ProfileHistory`, `SoftCommerce_ProfileQueue`, `SoftCommerce_ProfileSchedule`, `SoftCommerce_ProfileConfig` | `Byte8_Profile` |
| `SoftCommerce_PlentyCategoryProfile` | `Byte8_PlentyCategory` |
| `SoftCommerce_PlentyCustomerProfile` | `Byte8_PlentyCustomer` |
| `SoftCommerce_PlentyItemProfile` | `Byte8_PlentyItem` |
| `SoftCommerce_PlentyOrderProfile` | `Byte8_PlentyOrder` |
| `SoftCommerce_PlentyStockProfile` | `Byte8_PlentyStock` |
| `SoftCommerce_PlentyCategoryProfileStaging` | `Byte8_PlentyCategoryStaging` |
| `SoftCommerce_PlentyItemProfileStaging` | `Byte8_PlentyItemStaging` |
| `SoftCommerce_Plenty{Attribute,Category,Customer,Item,Order,Property,Stock,Storefront}` | `Byte8_Plenty{Attribute,Category,Customer,Item,Order,Property,Stock,Storefront}` |

---

## Rollback

If you need to revert before completing the migration:

1. Restore your database backup from the Pre-Migration Checklist.
2. Reinstate the SoftCommerce packages:
   ```bash
   composer require softcommerce/mage2plenty-os:^3.0   # or mage2plenty-ac for Adobe Commerce
   bin/magento setup:upgrade && bin/magento setup:di:compile && bin/magento cache:flush
   ```

Because the table rename is one-way per environment, **always roll back from the database backup** rather than renaming tables by hand.

---

## Troubleshooting

**`module:status` still shows `SoftCommerce_*` modules**
Run `bin/magento setup:upgrade` again. If a legacy module remains, ensure the old `softcommerce/*` package was fully removed (`composer show | grep softcommerce`) and that `composer dump-autoload` has run.

**Admin users lost access to connector menus**
The ACL migration runs during `setup:upgrade`. Re-run it, then re-save the affected admin role under **System → Permissions → User Roles** to refresh the resource tree.

**Profiles or settings appear empty after upgrade**
Confirm the patches ran: `SELECT patch_name FROM patch_list WHERE patch_name LIKE '%Byte8%';` should list the `MigrateFromSoftCommerce` / `MigrateTablesFromSoftCommerce` patches. If they did not run, verify the `byte8_profile_*` tables exist and contain your rows, then flush cache.

**Composer can't find `byte8/magento-plentyone-suite`**
Confirm the registry and token are configured (Step 4) and that your token is valid — see [Composer Installation](./composer-installation.md).

---

## Need Help?

Reach the Byte8 team via the channels in the [project README](https://github.com/byte8io/magento-plentyone-suite) or open a [GitHub issue](https://github.com/byte8io/magento-plentyone-suite/issues). Include your previous version, Magento version, and the output of `bin/magento plenty:system:check`.

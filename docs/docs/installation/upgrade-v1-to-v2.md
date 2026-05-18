---
sidebar_position: 4
title: Upgrading v1.x to v2.0.0
description: Step-by-step migration guide for upgrading Mage2Plenty from version 1.x to 2.0.0
---

# Upgrading from v1.x to v2.0.0

**Last Updated:** November 3, 2025
**Status:** Production Ready
**Breaking Changes:** ⚠️ Yes - Manual migration required

## Overview

Mage2Plenty v2.0.0 is a **major release** featuring significant architectural improvements and performance enhancements.

### What's New in v2.0.0

- 🎯 **Module Consolidation** - 15 modules consolidated into parent modules for better maintainability
- ⚡ **Performance** - 100x faster imports for large catalogs with optimized data processing
- 🚀 **PHP 8.3+ Support** - Modern PHP 8.1+ features with constructor property promotion
- 🔄 **RabbitMQ Integration** - Async processing for improved scalability
- 🧙 **Setup Wizard** - Streamlined initial configuration experience
- 🔔 **Profile Notifications** - Comprehensive notification system with email alerts, admin dashboard, and performance tracking
- 🔍 **Product Mapping Identifier** - Choose which product attribute to use as identifier for matching PlentyONE variation numbers
- 📊 **Improved Logging** - Enhanced debugging with MessageCollector system

:::warning Breaking Changes
Due to module consolidation, **upgrading from v1.x requires manual composer.json changes**. This guide provides step-by-step instructions to ensure a smooth migration.
:::

## Pre-Migration Checklist

Before starting the upgrade process, ensure you have:

<div className="checklist">

- [ ] **Full database backup** (via hosting provider or `mysqldump`)
- [ ] **Complete file system backup** of your Magento installation
- [ ] **SSH/Command line access** to your server
- [ ] **Composer access** to modify `composer.json`
- [ ] **PHP 8.1 or higher** installed (check with `php -v`)
- [ ] **Test environment** (highly recommended - test migration first!)
- [ ] **Maintenance window** scheduled for production upgrade

</div>

:::tip Test First
We strongly recommend testing this migration in a development or staging environment before upgrading production.
:::

---

## Step 1: Check Current Version

First, verify your current installation version:

```bash
composer show softcommerce/mage2plenty-os
```

**Example Output:**
```
name     : softcommerce/mage2plenty-os
versions : * 1.15.1
```

If you see version `1.x.x`, proceed with this guide.

---

## Step 2: Understanding Version Constraints

### Why Auto-Upgrade Won't Work

Your current `composer.json` likely has:

```json title="composer.json"
{
    "require": {
        "softcommerce/mage2plenty-os": "^1.8"
    }
}
```

The caret operator (`^`) follows semantic versioning:
- `^1.8` means: `>=1.8.0 <2.0.0`
- Composer **will NOT** upgrade to v2.0.0 automatically
- This is intentional - major versions indicate breaking changes

### Manual Update Required

You must explicitly update to v2.0.0.

---

## Step 3: Update composer.json

### Recommended: Specific Version

```json title="composer.json"
{
    "require": {
        "softcommerce/mage2plenty-os": "2.0.0"
    }
}
```

### Alternative: Allow v2.x Updates

```json title="composer.json"
{
    "require": {
        "softcommerce/mage2plenty-os": "^2.0"
    }
}
```

:::info
Using `^2.0` allows automatic patch and minor updates within v2.x (e.g., 2.0.1, 2.1.0) while preventing major version jumps.
:::

---

## Step 4: Remove Consolidated Modules

### Critical: Module Consolidation

The following **15 modules have been removed** and consolidated into parent modules:

<details>
<summary>View Removed Modules (Click to expand)</summary>

If any of these are explicitly declared in your `composer.json`, **you must remove them**:

```json title="Remove these from composer.json"
{
    "require": {
        // ❌ Remove these lines if present:
        "softcommerce/module-plenty-client-rest-api": "*",
        "softcommerce/module-plenty-rest-api": "*",
        "softcommerce/module-plenty-attribute-rest-api": "*",
        "softcommerce/module-plenty-category-rest-api": "*",
        "softcommerce/module-plenty-customer-rest-api": "*",
        "softcommerce/module-plenty-customer-client": "*",
        "softcommerce/module-plenty-item-rest-api": "*",
        "softcommerce/module-plenty-item-client": "*",
        "softcommerce/module-plenty-order-rest-api": "*",
        "softcommerce/module-plenty-order-client": "*",
        "softcommerce/module-plenty-stock-rest-api": "*",
        "softcommerce/module-plenty-stock-client": "*",
        "softcommerce/module-plenty-property-rest-api": "*",
        "softcommerce/module-plenty-category-profile-schedule": "*",
        "softcommerce/module-plenty-item-profile-schedule": "*",
        "softcommerce/module-plenty-order-profile-schedule": "*"
    }
}
```

</details>

### Consolidation Mapping

| Removed Module | Now Part Of |
|----------------|-------------|
| `module-plenty-client-rest-api` | `module-plenty-client` |
| `module-plenty-rest-api` | `module-plenty-client` |
| `module-plenty-attribute-rest-api` | `module-plenty-attribute` |
| `module-plenty-category-rest-api` | `module-plenty-category` |
| `module-plenty-customer-rest-api` | `module-plenty-customer` |
| `module-plenty-customer-client` | `module-plenty-customer` |
| `module-plenty-item-rest-api` | `module-plenty-item` |
| `module-plenty-item-client` | `module-plenty-item` |
| `module-plenty-order-rest-api` | `module-plenty-order` |
| `module-plenty-order-client` | `module-plenty-order` |
| `module-plenty-stock-rest-api` | `module-plenty-stock` |
| `module-plenty-stock-client` | `module-plenty-stock` |
| `module-plenty-property-rest-api` | `module-plenty-property` |
| `module-plenty-category-profile-schedule` | `module-plenty-category-profile` |
| `module-plenty-item-profile-schedule` | `module-plenty-item-profile` |
| `module-plenty-order-profile-schedule` | `module-plenty-order-profile` |

---

## Step 5: Execute Upgrade

### Enable Maintenance Mode

```bash
php bin/magento maintenance:enable
```

### Clear Composer Cache

```bash
composer clear-cache
```

### Update Dependencies

```bash
composer update softcommerce/mage2plenty-os --with-all-dependencies
```

### Expected Output

```bash
Loading composer repositories with package information
Updating dependencies
Lock file operations: 0 installs, 37 updates, 16 removals
  - Removing softcommerce/module-plenty-client-rest-api (1.3.3)
  - Removing softcommerce/module-plenty-rest-api (1.3.10)
  - Removing softcommerce/module-plenty-attribute-rest-api (1.2.10)
  ... (13 more removals)
  - Updating softcommerce/mage2plenty-os (1.15.1 => 2.0.0)
  - Updating softcommerce/module-core (1.6.1 => 2.0.0)
  ... (35 more updates)
Writing lock file
```

:::tip Handling Conflicts
If you encounter dependency conflicts:

```bash
# Option 1: Clear and reinstall
rm -rf vendor/ composer.lock
composer install

# Option 2: Update composer.json first
composer require softcommerce/mage2plenty-os:^2.0 --no-update
composer update
```
:::

---

## Step 6: Run Magento Upgrades

### Upgrade Database Schema

```bash
php bin/magento setup:upgrade
```

This command:
- Runs database migrations
- Updates module schema versions
- Executes data patches
- Removes old module entries

### Compile Dependency Injection

```bash
php bin/magento setup:di:compile
```

This generates:
- DI configuration
- Proxies and factories
- Validates dependencies

### Deploy Static Content

```bash
# For production
php bin/magento setup:static-content:deploy -f

# Or specify languages
php bin/magento setup:static-content:deploy en_US de_DE -f
```

### Flush Cache

```bash
php bin/magento cache:clean
php bin/magento cache:flush
```

---

## Step 7: Disable Maintenance Mode

```bash
php bin/magento maintenance:disable
```

---

## Step 8: Verify Installation

### Check Module Status

```bash
php bin/magento module:status | grep SoftCommerce
```

**Expected Modules (v2.0.0):**

```
List of enabled modules:
SoftCommerce_Core
SoftCommerce_PlentyAttribute
SoftCommerce_PlentyCategory
SoftCommerce_PlentyCategoryProfile
SoftCommerce_PlentyClient
SoftCommerce_PlentyCustomer
SoftCommerce_PlentyCustomerProfile
SoftCommerce_PlentyItem
SoftCommerce_PlentyItemProfile
SoftCommerce_PlentyLog
SoftCommerce_PlentyOrder
SoftCommerce_PlentyOrderProfile
SoftCommerce_PlentyProfile
SoftCommerce_PlentyProperty
SoftCommerce_PlentyStock
SoftCommerce_PlentyStockProfile
SoftCommerce_Profile
SoftCommerce_ProfileConfig
SoftCommerce_ProfileHistory
SoftCommerce_ProfileQueue
SoftCommerce_ProfileSchedule
```

:::danger These Should NOT Appear
```
SoftCommerce_PlentyClientRestApi
SoftCommerce_PlentyRestApi
SoftCommerce_PlentyAttributeRestApi
... (and 13 other removed modules)
```
:::

### Verify Version

```bash
composer show softcommerce/mage2plenty-os
```

**Expected:**
```
versions : * 2.0.0
```

### Test Admin Panel

1. Log into **Magento Admin**
2. Navigate to: **Stores → Configuration → SoftCommerce → PlentyONE Client**
3. Verify all settings are preserved
4. Check: **System → Mage2Plenty**
5. Confirm version shows `2.0.0`

---

## Step 9: Test Critical Functions

### Test Client Connection

```bash
php bin/magento plenty:client:test
```

✅ **Expected:** Connection successful

### Test Item Collection

```bash
php bin/magento plenty:item:collect --profile-id=1
```

✅ **Expected:** Items collected successfully

### Test Product Import

```bash
php bin/magento plenty:item:import --profile-id=1 --limit=10
```

✅ **Expected:** 10 products imported

---

## New Features

### 1. Setup Wizard

Navigate to: **System → Mage2Plenty → Setup Wizard**

The new Setup Wizard provides:
- Step-by-step configuration
- Automatic profile creation
- Connection testing
- Initial data collection
- Smart configuration detection

### 2. RabbitMQ Support (Optional)

Enable async processing for better performance:

```bash
# List available consumers
bin/magento queue:consumers:list | grep plenty
```

**Available Message Queue Consumers:**
- `plenty.attribute.collect`
- `plenty.category.collect`
- `plenty.category.export`
- `plenty.category.import`
- `plenty.item.collect`
- `plenty.item.export`
- `plenty.item.import`
- `plenty.order.collect`
- `plenty.order.export`
- `plenty.order.import`

### 3. Profile Notification System (NEW)

A comprehensive notification and monitoring system for all profile operations:

**Features:**
- 🔔 **Real-time notifications** - Track profile execution start, end, and errors
- 📊 **Admin dashboard** - View all notifications with filtering and bulk actions
- 📧 **Email alerts** - Critical alerts and batch summaries sent automatically
- 🎯 **Performance tracking** - Execution time, memory usage, success rates
- 📈 **Summary reports** - Process execution summaries with metrics

**Access:**
- **Admin Panel:** System → Profile Notifications
- **Configuration:** Stores → Configuration → SoftCommerce → Profile Notifications

**CLI Commands:**
```bash
# Send batch notification emails
bin/magento softcommerce:notification:send-batch-emails

# Preview emails without sending
bin/magento softcommerce:notification:send-batch-emails --preview

# Send only critical notifications
bin/magento softcommerce:notification:send-batch-emails --severity=critical
```

### 4. Enhanced CLI Commands

```bash
# Show profile status with detailed information
bin/magento plenty:profile:show-status --profile-id=1

# Map orders by increment ID
bin/magento plenty:order:map-by-increment-id 100000123

# Show product to variation mapping
bin/magento plenty:item:show-product-mapping

# Clear product mappings
bin/magento plenty:item:unmap-relation --all

# Setup wizard initialization
bin/magento plenty:profile:setup-wizard
```

### 5. Product Mapping Identifier (NEW)

Choose which product attribute to use as the **identifier** for matching PlentyONE variation numbers:

**What it does:** Instead of always using SKU to match products with PlentyONE variations, you can now select any product attribute as the primary identifier.

**Configure:** Admin → Stores → Configuration → SoftCommerce → Item Profile → Product Mapping → Product Mapping Identifier

**Use Cases:**
- **Manufacturer Part Number:** Use `manufacturer_part_number` attribute instead of SKU
- **Custom ERP ID:** Use a custom `erp_id` attribute as the primary identifier
- **Article Number:** Use PlentyONE article number stored in a custom attribute
- **Barcode/GTIN:** Use product barcode as the matching identifier

**How it works:**
1. **Default behavior (v1.x):** `variation.number` → `product.sku`
2. **New behavior (v2.0.0):** `variation.number` → `product.[your_chosen_attribute]`

**Note:** SKU is still required for all products, but the identifier attribute determines how products are matched and updated during sync.

---

## Troubleshooting

### ❌ "Module 'SoftCommerce_PlentyClientRestApi' not found"

**Cause:** Old module still registered in database

**Solution:**
```bash
php bin/magento setup:upgrade
php bin/magento setup:di:compile
php bin/magento cache:flush
```

### ❌ Composer: "Your requirements could not be resolved"

**Cause:** Deprecated modules still in `composer.json`

**Solution:** Remove all 15 deprecated modules from `composer.json` (see Step 4)

### ❌ "Class SoftCommerce\PlentyClientRestApi\... not found"

**Cause:** Old generated code cached

**Solution:**
```bash
rm -rf generated/code/* generated/metadata/*
php bin/magento setup:di:compile
```

### ❌ Admin Configuration Shows Errors

**Cause:** Browser cache or static content not regenerated

**Solution:**
```bash
php bin/magento cache:clean config
php bin/magento setup:static-content:deploy -f
# Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
```

### ❌ Import/Export Stopped Working

**Cause:** Profile configuration needs refresh

**Solution:**
1. Go to **System → Mage2Plenty → [Profile Type]**
2. Re-save profile configuration
3. Test: `bin/magento plenty:client:test`
4. Run test import with `--limit=10`

---

## Rollback Plan

If migration fails, restore from backup:

### Rollback Composer

```bash
# Restore composer files from backup
cp composer.json.bak composer.json
cp composer.lock.bak composer.lock

# Reinstall old version
composer install

# Downgrade Magento
php bin/magento setup:upgrade
php bin/magento setup:di:compile
php bin/magento cache:flush
```

### Rollback Database

```bash
# Restore database from backup
mysql -u username -p database_name < backup_before_v2.sql
```

### Rollback Files

```bash
# Restore from file backup
rsync -av /path/to/backup/ /path/to/magento/
```

---

## FAQ

### Will my profiles and configuration be preserved?

✅ **Yes**, all configuration, profiles, mappings, and historical data are fully preserved during the upgrade.

### Do I need to re-configure anything?

❌ **No**, all existing configurations work as-is. However, you may want to explore new features like the Setup Wizard, Profile Notifications, and Product Mapping Identifier options.

### Is PHP 8.0 supported in v2.0.0?

❌ **No**, minimum requirement is **PHP 8.1**. We recommend **PHP 8.3** for best performance.

### What about my custom modules that depend on consolidated modules?

Update your custom module's `etc/module.xml`:

```xml
<!-- Before -->
<module name="SoftCommerce_PlentyClientRestApi" />

<!-- After -->
<module name="SoftCommerce_PlentyClient" />
```

Update your custom module's use statements:

```php
// Before
use SoftCommerce\PlentyClientRestApi\Model\Something;

// After
use SoftCommerce\PlentyClient\RestApi\Something;
```

### Do I need RabbitMQ?

❌ **No**, RabbitMQ is optional. Synchronous processing (current method) continues to work. RabbitMQ provides async processing for improved performance at scale.

### What about Adobe Commerce (Enterprise Edition)?

✅ **Fully compatible**. V2.0.0 includes full support for Adobe Commerce features including staging (`row_id` support).

### Can I upgrade from any v1.x version?

✅ **Yes**, this guide supports direct upgrade from any v1.x version to v2.0.0.

---

## Getting Help

### Before Seeking Support

1. ✅ Review this migration guide thoroughly
2. ✅ Check the Troubleshooting section
3. ✅ Review logs: `var/log/system.log`, `var/log/exception.log`
4. ✅ Search existing GitHub issues

### Support Channels

- **GitHub Issues:** [Report a bug or request help](https://github.com/softcommerceltd/mage2plenty-os/issues)
- **Documentation:** Check module-specific docs in `docs/` folders
- **Email Support:** support@softcommerce.io

### When Reporting Issues

Please include:

- ✅ Magento version (`bin/magento --version`)
- ✅ PHP version (`php -v`)
- ✅ Previous Mage2Plenty version
- ✅ Error messages from logs
- ✅ Steps to reproduce the issue
- ✅ Output of `composer show | grep softcommerce`

---

## Quick Reference

### Migration Checklist

<div className="checklist">

1. ✅ Backup database and files
2. ✅ Enable maintenance mode
3. ✅ Update `composer.json`: `"softcommerce/mage2plenty-os": "^2.0"`
4. ✅ Remove 15 deprecated modules from `composer.json`
5. ✅ Run: `composer clear-cache`
6. ✅ Run: `composer update softcommerce/mage2plenty-os --with-all-dependencies`
7. ✅ Run: `bin/magento setup:upgrade`
8. ✅ Run: `bin/magento setup:di:compile`
9. ✅ Run: `bin/magento setup:static-content:deploy -f`
10. ✅ Run: `bin/magento cache:flush`
11. ✅ Disable maintenance mode
12. ✅ Verify: `composer show softcommerce/mage2plenty-os` = v2.0.0
13. ✅ Test: Item collect/import works
14. ✅ Verify: Admin configuration preserved

</div>

---

## Congratulations! 🎉

You're now running **Mage2Plenty v2.0.0** with:

- ⚡ Improved performance and scalability
- 🎯 Modern PHP 8.3+ features
- 🔄 Optional async processing with RabbitMQ
- 🧙 New Setup Wizard
- 🔔 Profile Notification system
- 🔍 Product Mapping Identifier
- 📊 Enhanced debugging and logging

**Next Steps:**
1. Explore the new Setup Wizard
2. Configure Profile Notifications and email alerts
3. Review Product Mapping Identifier options for your use case
4. Consider enabling RabbitMQ for async processing
5. Check out new CLI commands and notification features

Need help? Check our [Support Channels](#support-channels) above.

---
sidebar_position: 3
title: Upgrading from v0.x to Stable v1.0.0
description: Migration guide for upgrading from Mage2Plenty v0.x (beta/unstable) to stable v1.0.0 release
---

# Upgrading from v0.x to Stable v1.0.0

:::info Looking for Different Upgrade Path?
- **Upgrading from v1.x to v2.0.0?** See the [v1.x to v2.0.0 Migration Guide](./upgrade-v1-to-v2.md)
- **Fresh installation?** See [Composer Installation Guide](./composer-installation.md)

This guide is specifically for upgrading from the **unstable v0.x releases** to the **stable v1.0.0 release** of Mage2Plenty for Magento 2.
:::

With the introduction of the stable v1.0.0 release, we strongly recommend upgrading from the earlier v0.x beta versions to benefit from production-ready features, improved stability, and ongoing support.

## Why Upgrade to v1.0.0?

Upgrading from v0.x to the stable v1.0.0 release is essential for production environments and ensures long-term compatibility with PlentyONE.

### Key Benefits

- ✅ **Production Ready** - Stable release suitable for live e-commerce environments
- ✅ **Magento 2.4.4+ Support** - Compatible with latest Magento versions
- ✅ **PHP 8.1+ Support** - Modern PHP features and improved performance
- ✅ **Updated Dependencies** - All project libraries updated for latest compatibility
- ✅ **Enhanced Performance** - Optimized code and better resource management
- ✅ **Improved Error Handling** - Better logging and debugging capabilities
- ✅ **Production Features** - Access to stable, tested integration features
- ✅ **Security Updates** - Regular security patches and updates
- ✅ **Better MSI Support** - Enhanced Multi-Source Inventory integration
- ✅ **Ongoing Support** - Active maintenance and support for v1.x line

:::warning v0.x Beta Support Ending
The v0.x beta releases are no longer maintained and do not receive updates or security patches. Upgrade to v1.0.0 stable as soon as possible to ensure continued compatibility and security.
:::

## Before You Begin

### Important Notes

:::danger Data Loss Risk
This is a **major upgrade** that requires uninstalling the old v0.x modules and installing the stable v1.0.0 modules. **You must backup your database and files** before proceeding.
:::

:::info Profile Reconfiguration Required
Due to significant architectural changes between v0.x and v1.0.0, **you must re-configure all your profiles** after upgrading. The v0.x beta profile configurations are not compatible with the v1.0.0 stable system.
:::

:::tip Test Environment
We strongly recommend testing this upgrade in a development or staging environment before applying to production. The v0.x → v1.0.0 upgrade involves module replacement and profile reconfiguration.
:::

### System Requirements

Before upgrading, ensure your system meets the requirements for v1.0.0:

- **Magento**: 2.4.4 or higher
- **PHP**: 8.1 or higher (PHP 8.0 also supported in v1.x)
- **Database**: MySQL 8.0 or MariaDB 10.6
- **Composer**: 2.2 or higher

See [System Requirements](/docs/system-requirements) for complete details.

## Upgrade Process

### Step 1: Backup

#### Create Database Backup

Create a complete backup of your database. You can use Magento's built-in backup command:

```bash
# Backup database
bin/magento setup:backup --db

# Or backup everything (db + media + code)
bin/magento setup:backup --db --media --code
```

Alternatively, use mysqldump utility directly:

```bash
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
```

:::tip Backup Location
Magento stores backups in `var/backups/`. Move these to a secure location outside your web root.
:::

#### Create Filesystem Backup

Back up your PlentyMarkets extension files:

**If installed manually**:
```bash
# Backup app/code/Plenty directory
tar -czf plenty_backup_$(date +%Y%m%d).tar.gz app/code/Plenty/
```

**If installed via Composer**:
```bash
# Backup vendor/plenty directory
tar -czf plenty_vendor_backup_$(date +%Y%m%d).tar.gz vendor/plenty/
```

#### Export Current Configuration

Before removing the v0.x beta modules, document your current configuration:

1. Take screenshots of all configuration pages in Magento Admin
2. Export profile configurations if possible (note: these will need to be manually recreated in v1.0.0)
3. Document custom integrations or modifications
4. Note any third-party extensions that depend on Mage2Plenty modules

### Step 2: Uninstall Existing Module

#### Pre-Uninstallation

If your store is set to production mode, enable maintenance mode:

```bash
bin/magento maintenance:enable
```

#### Remove Extension Filesystem (Manual Installation)

If you installed the extension manually using FTP, remove the directory:

```bash
rm -rf app/code/Plenty
```

Verify removal:
```bash
ls app/code/ | grep -i plenty
# Should return nothing
```

#### Remove Extension Filesystem (Composer Installation)

If you installed the extension using Composer, remove all PlentyMarkets modules.

**For Magento Open Source**:

```bash
composer remove \
  plenty/module-core \
  plenty/module-customer \
  plenty/module-item \
  plenty/module-order \
  plenty/module-stock \
  plenty/module-stock-reservation \
  plenty/module-stock-source-selection
```

**For Adobe Commerce**:

```bash
composer remove \
  plenty/module-core \
  plenty/module-customer \
  plenty/module-item \
  plenty/module-order \
  plenty/module-stock \
  plenty/module-stock-reservation \
  plenty/module-stock-source-selection \
  plenty/module-giftcard
```

:::warning Check Dependencies
Ensure to remove any extensions that depend on the core Plenty modules. Check with:

```bash
composer show | grep -i plenty
```
:::

#### Clean Up Database

Run Magento's setup upgrade to remove database tables and configuration:

```bash
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento cache:flush
```

#### Verify Removal

Verify that Plenty modules are completely removed:

```bash
# Check filesystem
ls app/code/ vendor/ | grep -i plenty

# Check Magento modules
bin/magento module:status | grep -i plenty

# Should return no results
```

### Step 3: Install v1.0.0 Stable Release

Now install the stable v1.0.0 release of Mage2Plenty.

#### Choose Installation Method

Depending on where you purchased the extension:

**Option A: Direct Purchase (Private Packagist)**

Follow the [Composer Installation Guide](/docs/installation/composer-installation):

```bash
# For Magento Open Source
composer require byte8/magento-plentyone-suite

# For Adobe Commerce
composer require byte8/magento-plentyone-suite-ac
```

**Option B: Marketplace Purchase**

Follow the [Marketplace Composer Installation Guide](/docs/installation/marketplace-composer-installation):

```bash
# For Magento Open Source
composer require byte8/magento-plentyone-suite

# For Adobe Commerce
composer require byte8/magento-plentyone-suite-ac
```

#### Post Installation

Run the setup commands:

```bash
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy -f
bin/magento cache:flush
```

#### Verify Installation

Check that the new modules are installed:

```bash
bin/magento module:status Byte8_PlentyCore

# Should show as enabled
```

### Step 4: System Configuration

After installation, configure the new connector:

1. Navigate to **Stores → Configuration → Byte8 → PlentyONE Client**
2. Enter your PlentyONE API credentials
3. Configure connection settings
4. Test the connection

See [Client Configuration](/docs/configuration/client-configuration) for detailed instructions.

### Step 5: Collect Client Configuration Data

:::danger Required — do this before running any profile
After the upgrade your profiles will **not** have client configuration data — web stores, warehouses, prices, VAT rates, referrers, and payment/shipping methods. You **must** re-collect it, otherwise syncs will fail or produce incomplete data.
:::

Collect the client configuration data via **CLI**:

```bash
bin/magento plenty:setup:collect:config
```

Or via the **Admin UI**: **Stores → Configuration → Byte8 → PlentyONE Integration → Authentication Settings → Actions → Run Setup Wizard**.

This retrieves the PlentyONE system configuration your profiles rely on, including:

- Web stores and locations
- Warehouses and stock sources
- Sales prices
- VAT configurations
- Referrers and order referrers
- Shipping profiles and payment methods

### Step 6: Profile Configuration

:::warning Reconfigure All Profiles
Profile configurations from the old connector are **not compatible** with the new system. You must set up all profiles from scratch.
:::

For each profile you had configured:

1. Navigate to **Byte8 → PlentyONE → Profiles**
2. Create a new profile for each entity type (Products, Orders, Inventory, etc.)
3. Configure the profile settings based on your previous configuration
4. Set up field mappings and synchronization rules
5. Test each profile before enabling

See [Profile Configuration](/docs/profiles/about-profiles) for detailed guidance.

### Step 7: Testing

Before disabling maintenance mode, thoroughly test the new installation:

1. **Test Connection**: Verify PlentyONE API connection
2. **Test Profiles**: Run each profile in test mode
3. **Check Logs**: Review logs for any errors
4. **Verify Data**: Ensure data is syncing correctly
5. **Test Admin**: Confirm all admin features work

```bash
# Test connection
bin/magento plenty:client:test

# Run system check
bin/magento plenty:system:check

# Test specific profile (dry run)
bin/magento plenty:profile:run --profile-id=1 --dry-run
```

### Step 8: Go Live

Once testing is complete:

```bash
# Disable maintenance mode
bin/magento maintenance:disable

# Clear all caches
bin/magento cache:flush

# Reindex if needed
bin/magento indexer:reindex
```

## Post-Upgrade Checklist

After upgrading, verify the following:

- [ ] All modules are enabled and functioning
- [ ] PlentyONE API connection is working
- [ ] All profiles are configured correctly
- [ ] Product synchronization works
- [ ] Order export functions properly
- [ ] Inventory updates are syncing
- [ ] Customer data syncs correctly
- [ ] Cron jobs are running
- [ ] Logs are being created properly
- [ ] Admin interface is accessible
- [ ] No PHP errors in system logs

## Common Issues and Solutions

### Profile Data Not Migrating

**Issue**: v0.x profile configurations don't carry over to v1.0.0

**Solution**: This is expected. The v1.0.0 stable release uses a completely different data structure than v0.x beta. You must reconfigure all profiles manually.

### Authentication Fails

**Issue**: Can't connect to PlentyONE after upgrade

**Solution**:
1. Re-enter your API credentials
2. Regenerate access tokens in PlentyONE if needed
3. Check firewall and network settings

### Missing Dependencies

**Issue**: Composer reports missing packages

**Solution**:
1. Ensure all old modules were completely removed
2. Clear Composer cache: `composer clear-cache`
3. Update Composer: `composer self-update`
4. Try again with fresh authentication

### Performance Issues

**Issue**: New connector seems slower

**Solution**:
1. Enable Redis for cache and sessions
2. Configure RabbitMQ for async processing
3. Optimize database indexes
4. Review profile schedules to avoid conflicts

## Rollback Procedure

If you need to rollback to the old connector:

1. **Restore Database**: Restore from your backup
   ```bash
   mysql -u username -p database_name < backup_file.sql
   ```

2. **Restore Files**: Restore the backed-up files
   ```bash
   tar -xzf plenty_backup_file.tar.gz -C /
   ```

3. **Run Setup**:
   ```bash
   bin/magento setup:upgrade
   bin/magento cache:flush
   ```

:::danger Consider Carefully
Rollback should only be used as a last resort. The old connector will not receive updates or support.
:::

## Getting Help

If you encounter issues during the upgrade:

- 📧 **Email Support**: support@byte8.io
- 📞 **Phone**: +44 2080 587 795 (GMT working hours)
- 📖 **Documentation**: Review our comprehensive guides
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/byte8/mage2plenty/issues)
- 💬 **Migration Assistance**: We offer professional migration services

## Professional Migration Service

Need help with the upgrade? We offer professional migration services:

- ✅ Complete backup and safety planning
- ✅ Expert installation and configuration
- ✅ Profile migration and setup
- ✅ Testing and validation
- ✅ Training on new features
- ✅ Post-migration support

Contact us at **support@byte8.io** for a quote.

## Next Steps

After successfully upgrading:

1. 📋 **[Initial Setup](/docs/configuration/initial-setup)** - Complete the configuration
2. 📊 **[Profile Setup](/docs/profiles/about-profiles)** - Configure synchronization profiles
3. 📈 **[Monitoring](/docs/monitoring/profiles)** - Set up monitoring and alerts
4. 🔄 **[Schedule Sync](/docs/profiles/scheduling)** - Configure automated synchronization

## FAQ

### How long does the upgrade take?

Typically 2-4 hours including backup, installation, and configuration. More complex setups may take longer.

### Will I lose my data?

No, if you backup properly. The database data remains intact. Only module-specific configuration needs to be reconfigured.

### Can I upgrade without downtime?

For production sites, we recommend using a staging environment first, then migrating to production during a maintenance window.

### Is v1.0.0 backward compatible with v0.x?

No, v1.0.0 stable uses a completely different architecture than v0.x beta. You cannot run both versions simultaneously, and profile configurations must be manually recreated.

### What happens to my order history?

All order history in Magento remains intact. You just need to reconfigure how new orders sync to PlentyONE.

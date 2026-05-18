---
sidebar_position: 3
title: Magento Version Compatibility
description: Detailed compatibility information for Mage2Plenty with Magento Open Source and Adobe Commerce
---

# Magento Version Compatibility

We maintain a regular release cycle to ensure compatibility with the latest Magento versions and to provide continuous improvements, bug fixes, and new features for the PlentyONE integration.

:::info Regular Updates
We carry out updates **every two weeks** to ensure you always have access to the latest features, security patches, and compatibility improvements.
:::

## Package Editions

Mage2Plenty is available in two editions tailored to your Magento installation:

| Edition | Package Name | Magento Version | PHP Versions |
|---------|-------------|-----------------|--------------|
| **Open Source** | `softcommerce/mage2plenty-os` | ≥ 2.4.4 | 8.1, 8.2, 8.3, 8.4 |
| **Adobe Commerce** | `softcommerce/mage2plenty-ac` | ≥ 2.4.4 | 8.1, 8.2, 8.3, 8.4 |

## Installation Commands

### Magento Open Source

For Magento Open Source (Community Edition):

```bash
composer require softcommerce/mage2plenty-os
```

### Adobe Commerce

For Adobe Commerce (Enterprise Edition):

```bash
composer require softcommerce/mage2plenty-ac
```

## Current Requirements

### Minimum Requirements

- **Magento**: 2.4.4 or higher (Open Source or Adobe Commerce)
- **PHP**: 8.1 or higher
- **Composer**: 2.2 or higher

### Recommended Setup

- **Magento**: 2.4.7 or 2.4.8 (latest)
- **PHP**: 8.2 or 8.3
- **Database**: MySQL 8.0 or MariaDB 10.6
- **Search**: Elasticsearch 7.17+ or OpenSearch 1.2+
- **Cache**: Redis 6.2+
- **Queue**: RabbitMQ 3.9+

## Supported Magento Versions

### Magento 2.4.4

**Status**: ✅ Supported

- PHP 8.1, 8.2
- First version requiring PHP 8.1+
- Introduced Elasticsearch requirement
- Full MSI (Multi-Source Inventory) support

**Installation**:
```bash
# Open Source
composer require softcommerce/mage2plenty-os ^1.13.0

# Adobe Commerce
composer require softcommerce/mage2plenty-ac ^1.13.0
```

### Magento 2.4.5

**Status**: ✅ Supported

- PHP 8.1, 8.2
- Improved performance
- Enhanced security features
- Better error handling

**Installation**:
```bash
# Open Source
composer require softcommerce/mage2plenty-os ^1.14.0

# Adobe Commerce
composer require softcommerce/mage2plenty-ac ^1.14.0
```

### Magento 2.4.6

**Status**: ✅ Supported

- PHP 8.1, 8.2, 8.3
- Added PHP 8.3 support
- Updated dependencies
- Performance optimizations

**Installation**:
```bash
# Open Source
composer require softcommerce/mage2plenty-os ^1.14.0

# Adobe Commerce
composer require softcommerce/mage2plenty-ac ^1.14.0
```

### Magento 2.4.7

**Status**: ✅ Supported & Recommended

- PHP 8.1, 8.2, 8.3
- Latest stable release line
- Recommended for new installations
- Enhanced stability and performance

**Installation**:
```bash
# Open Source
composer require softcommerce/mage2plenty-os ^1.15.0

# Adobe Commerce
composer require softcommerce/mage2plenty-ac ^1.15.0
```

### Magento 2.4.8+

**Status**: ✅ Supported & Latest

- PHP 8.1, 8.2, 8.3, 8.4
- Cutting edge features
- Continuous bi-weekly updates
- Best performance and security

**Installation**:
```bash
# Open Source
composer require softcommerce/mage2plenty-os

# Adobe Commerce
composer require softcommerce/mage2plenty-ac
```

## PHP Version Support

### PHP 8.1
- ✅ Minimum Required Version
- Fully supported
- Required for all Mage2Plenty versions
- Full feature compatibility

### PHP 8.2
- ✅ Fully Supported & Recommended
- Better performance than PHP 8.1
- Improved type system
- Better error messages
- Ideal for production

### PHP 8.3
- ✅ Fully Supported
- Best performance
- Most secure option
- Latest language features
- Supported in Mage2Plenty 1.14.0+

### PHP 8.4
- ✅ Supported (Beta)
- Cutting edge features
- For testing and development
- Production-ready with Magento 2.4.8+

## Legacy Versions (Not Maintained)

:::warning End of Life
The following versions are no longer supported and do not receive updates or security patches.
:::

### Magento 2.3.x

- **Status**: ❌ End of Life
- Last supported in Mage2Plenty 1.0.x
- PHP 7.2-7.4 compatibility
- No security patches
- **Action Required**: Upgrade to Magento 2.4.4+

### Magento 2.4.0 - 2.4.3

- **Status**: ❌ End of Life
- Last supported in Mage2Plenty 1.1.x
- PHP 7.4-8.1 compatibility
- End of life as of 2024
- **Action Required**: Upgrade to Magento 2.4.4+

## Compatibility Matrix

| Magento Version | Mage2Plenty Version | PHP Versions | Status |
|-----------------|---------------------|--------------|--------|
| 2.3.x | 1.0.x | 7.2, 7.3, 7.4 | ❌ EOL |
| 2.4.0 - 2.4.3 | 1.1.x | 7.4, 8.0, 8.1 | ❌ EOL |
| 2.4.4 | 1.13.x | 8.1, 8.2 | ✅ Supported |
| 2.4.5 | 1.14.x | 8.1, 8.2 | ✅ Supported |
| 2.4.6 | 1.14.x | 8.1, 8.2, 8.3 | ✅ Supported |
| 2.4.7 | 1.15.x | 8.1, 8.2, 8.3 | ✅ Recommended |
| 2.4.8+ | Latest | 8.1, 8.2, 8.3, 8.4 | ✅ Latest |

## Feature Availability by Version

| Feature | 1.0.x | 1.1.x | 1.13.x | 1.14.x | 1.15.x | Latest |
|---------|-------|-------|--------|--------|--------|--------|
| Basic Integration | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MSI Support | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Async Processing | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Message Queue Support | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Advanced Logging | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enhanced Error Handling | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| PHP 8.3 Support | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| PHP 8.4 Support | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Initial Setup CLI | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Data Purge Tools | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| GraphQL API | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## Upgrade Paths

### From Magento 2.3.x

1. ⬆️ Upgrade to PHP 8.1+
2. ⬆️ Upgrade to Magento 2.4.4+
3. 🔍 Install Elasticsearch/OpenSearch
4. 📦 Update to Mage2Plenty 1.13.x or higher

```bash
# After Magento upgrade, install appropriate package
composer require softcommerce/mage2plenty-os  # or mage2plenty-ac
```

### From Magento 2.4.0-2.4.3

1. ✔️ Ensure PHP 8.1+ is installed
2. ⬆️ Upgrade to Magento 2.4.4+
3. 📦 Update to Mage2Plenty 1.13.x or higher

```bash
composer require softcommerce/mage2plenty-os  # or mage2plenty-ac
```

### Within Magento 2.4.4+

Simply update Mage2Plenty to the version matching your Magento installation:

```bash
composer update softcommerce/mage2plenty-os  # or mage2plenty-ac
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento cache:flush
```

## Edition Differences

### Open Source vs Adobe Commerce

Both editions provide the same core functionality:

| Feature | Open Source | Adobe Commerce |
|---------|------------|----------------|
| Product Sync | ✅ | ✅ |
| Order Processing | ✅ | ✅ |
| Inventory Management | ✅ | ✅ |
| Customer Sync | ✅ | ✅ |
| MSI Support | ✅ | ✅ |
| B2B Features | ❌ | ✅ |
| Staging & Preview | ❌ | ✅ |
| Advanced Reporting | ❌ | ✅ |

:::tip Choosing the Right Edition
Always use the package that matches your Magento edition:
- Magento Open Source → `mage2plenty-os`
- Adobe Commerce → `mage2plenty-ac`

Using the wrong package may cause compatibility issues.
:::

## Release Schedule

We maintain an active development cycle with regular updates:

- **Bi-weekly Updates**: Every 2 weeks for bug fixes, improvements, and minor features
- **Minor Versions**: Monthly for new features and enhancements
- **Major Versions**: Annually or when new Magento major versions are released
- **Security Patches**: As needed, typically within 24-48 hours of discovery

### Staying Updated

Subscribe to updates:
1. Watch our [GitHub repository](https://github.com/byte8/mage2plenty)
2. Check the [Changelog](/blog) regularly
3. Enable notifications in your account dashboard

## Testing Compatibility

Before upgrading, always test in a staging environment:

```bash
# Check current versions
bin/magento --version
php -v
composer show softcommerce/mage2plenty-os  # or mage2plenty-ac

# Run system check
bin/magento plenty:system:check

# Test connection
bin/magento plenty:client:test
```

## Getting Help

If you need assistance with version compatibility:

- 📖 Check our [System Requirements](/docs/system-requirements)
- 📘 Review the [Installation Guide](/docs/installation/composer-installation)
- 📧 Contact support: support@softcommerce.io
- 📞 Call us: +44 2080 587 795 (GMT working hours)
- 🐛 Report issues: [GitHub Issues](https://github.com/byte8/mage2plenty/issues)

## Important Notes

:::warning Security Notice
Magento versions prior to 2.4.4 are no longer supported. Running older versions poses **significant security risks**. Please upgrade immediately.
:::

:::tip Best Practice
Always test upgrades in a staging environment before applying to production. This helps identify any compatibility issues before they affect your live store.
:::

:::info Performance Tip
For best performance and security, always use:
- Latest version of Magento (currently 2.4.8)
- Latest PHP version compatible with your Magento (PHP 8.3 recommended)
- Latest Mage2Plenty version for your Magento edition
:::

---
sidebar_position: 1
title: Free Extension Plugins
description: Additional free plugins that extend Mage2Plenty functionality with third-party integrations
---

# Free Extension Plugins

Mage2Plenty offers several **free extension plugins** that provide additional functionality and seamless integration with popular third-party Magento extensions. These plugins are designed to extend the core Mage2Plenty connector and ensure that data from specialized extensions is properly synchronized with PlentyONE.

## Overview

All free plugins are:
- ✅ **Free to use** with your Mage2Plenty license
- ✅ **Fully supported** by Byte8 Ltd
- ✅ **Open source** (OSL-3.0 / AFL-3.0 licensed)
- ✅ **Production ready** and actively maintained
- ✅ **Easy to install** via Composer

:::info Requirements
These plugins require the core Mage2Plenty connector to be installed and configured. Each plugin also requires its respective third-party extension to be installed in your Magento store.
:::

## Plugin Directory

Browse our collection of free integration plugins:

<div className="plugin-grid">

### 🎁 [Amasty Gift Card](/docs/extensions/amasty-gift-card)
Integrate Amasty Gift Card products and redemptions with PlentyONE order export.

**Key Features**: Gift card products, code synchronization, redemption handling

---

### 🎉 [Amasty Promo](/docs/extensions/amasty-promo)
Export promotional free gift items from Amasty Special Promotions to PlentyONE.

**Key Features**: Free gifts, Buy X Get Y, promo rule tracking

---

### ⭐ [Amasty Rewards](/docs/extensions/amasty-rewards)
Synchronize Amasty Reward Points usage and earnings with PlentyONE orders.

**Key Features**: Points redemption, discount tracking, balance adjustments

---

### 💰 [Amasty Cash on Delivery](/docs/extensions/amasty-cash-on-delivery)
Export Amasty COD fees as order line items to PlentyONE.

**Key Features**: COD fee calculation, payment method integration, tax handling

---

### 📦 [DHL Packstation](/docs/extensions/packstation)
Handle DHL Packstation and Postfiliale delivery addresses for German market.

**Key Features**: Packstation addresses, Post Number validation, DHL integration

---

### 📝 [Swissup Checkout Fields](/docs/extensions/swissup-checkout-fields)
Export custom checkout fields from Swissup extension to PlentyONE orders.

**Key Features**: Custom fields, field mapping, order metadata

---

### 🏪 [PlentyONE Storefront](/docs/extensions/plenty-storefront)
Display PlentyONE data on Magento storefront (stock, availability, delivery time).

**Key Features**: Real-time stock, warehouse breakdown, delivery estimates

</div>

:::tip Quick Start
Click any plugin name above to view detailed documentation, installation instructions, and troubleshooting guides.
:::

## Available Plugins

### Amasty Integrations

These plugins extend Mage2Plenty to support popular Amasty extensions, ensuring that promotional items, gift cards, rewards, and special payment methods are correctly synchronized with PlentyONE.

#### Amasty Gift Card

**Package**: `byte8/module-plenty-amasty-giftcard`

Integrates Amasty Gift Card extension with PlentyONE order export.

**Features:**
- Exports gift card products as order line items
- Synchronizes gift card codes and values
- Handles gift card redemptions in orders
- Supports gift card product variations

**Use Case:** When customers purchase or redeem Amasty gift cards, this plugin ensures that gift card line items are properly exported to PlentyONE with correct product types, codes, and values.

**Requirements:**
- `amasty/giftcard` - Amasty Gift Card extension
- `byte8/module-plenty-order-profile`

**Installation:**
```bash
composer require byte8/module-plenty-amasty-giftcard
bin/magento setup:upgrade
bin/magento cache:flush
```

---

#### Amasty Promo

**Package**: `byte8/module-plenty-amasty-promo`

Integrates Amasty Special Promotions (Free Gifts) extension with PlentyONE order export.

**Features:**
- Exports free promotional items to PlentyONE
- Handles "Buy X Get Y" promotions
- Synchronizes free gift line items with zero price
- Maintains promotion rule references

**Use Case:** When promotional rules add free products to orders (e.g., "Buy 2, Get 1 Free"), this plugin ensures those free items are correctly exported to PlentyONE with appropriate pricing and item types.

**Requirements:**
- `amasty/promo` - Amasty Special Promotions extension
- `byte8/module-plenty-order-profile`

**Installation:**
```bash
composer require byte8/module-plenty-amasty-promo
bin/magento setup:upgrade
bin/magento cache:flush
```

---

#### Amasty Rewards

**Package**: `byte8/module-plenty-amasty-rewards`

Integrates Amasty Reward Points extension with PlentyONE order synchronization.

**Features:**
- Exports reward points usage in orders
- Synchronizes reward point adjustments as order totals
- Handles reward points redemption discounts
- Tracks reward points earned per order

**Use Case:** When customers use reward points for discounts or earn points from purchases, this plugin ensures that reward point transactions are properly reflected in PlentyONE order totals and accounting.

**Requirements:**
- `amasty/rewards` - Amasty Reward Points extension
- `byte8/module-plenty-profile`

**Installation:**
```bash
composer require byte8/module-plenty-amasty-rewards
bin/magento setup:upgrade
bin/magento cache:flush
```

---

#### Amasty Cash on Delivery

**Package**: `byte8/module-plenty-amasty-cashondelivery`

Integrates Amasty Cash on Delivery Fee extension with PlentyONE order export.

**Features:**
- Exports Cash on Delivery fees as order totals
- Synchronizes COD payment method information
- Handles COD-specific order processing
- Supports COD fee calculations based on order value

**Use Case:** When customers select Cash on Delivery payment and incur additional fees, this plugin ensures COD fees are correctly exported to PlentyONE as separate order total line items.

**Requirements:**
- `amasty/cashondelivery` - Amasty Cash on Delivery extension
- `byte8/module-plenty-order-profile`

**Installation:**
```bash
composer require byte8/module-plenty-amasty-cashondelivery
bin/magento setup:upgrade
bin/magento cache:flush
```

---

### Shipping & Logistics

These plugins handle special shipping scenarios common in European e-commerce, particularly German markets.

#### DHL Packstation Support

**Package**: `byte8/module-plenty-packstation`

Handles DHL Packstation, Postfiliale, and Paketbox delivery addresses for German customers.

**Features:**
- Detects PackStation/Postfiliale delivery addresses
- Formats addresses correctly for PlentyONE export
- Validates Postnummer (customer identification numbers)
- Handles address transformation for pickup points
- Provides detailed logging for address changes
- Sends email alerts for critical address transformations

**Use Case:** German customers often use DHL Packstation (automated parcel terminals), Postfiliale (post office pickup), or Paketbox (parcel box) for deliveries. This plugin ensures these specialized addresses are correctly formatted and exported to PlentyONE.

**Address Handling:**
- Detects SERVICE_OPTION_DELIVERY_LOCATION in shipping addresses
- Preserves customer's billing address
- Formats delivery location address according to DHL requirements
- Maintains Postnummer for customer identification

**Monitoring & Alerts:**
- Dedicated log file: `/var/log/plenty_packstation.log`
- Email alerts for critical address changes
- Validation warnings in order export messages
- Detailed tracking of all address transformations

**Configuration:**
Email alerts can be configured at:
**Stores → Configuration → Byte8 → Developer → Email Logs**

**Requirements:**
- `byte8/module-plenty-customer-profile`
- `byte8/module-plenty-order-profile`

**Installation:**
```bash
composer require byte8/module-plenty-packstation
bin/magento setup:upgrade
bin/magento cache:flush
```

**Troubleshooting:**
See `/packages/modules/module-plenty-packstation/README-ADDRESS-ISSUE.md` for detailed information about address transformation handling and monitoring.

---

### Third-Party Checkout Extensions

#### Swissup Checkout Fields

**Package**: `byte8/module-plenty-swissup-checkout-fields`

Integrates Swissup Checkout Fields extension with PlentyONE order export.

**Features:**
- Exports custom checkout fields to PlentyONE
- Synchronizes additional order data fields
- Handles custom field mappings
- Supports various field types (text, select, date, etc.)

**Use Case:** When using Swissup Checkout Fields to collect additional information during checkout (delivery instructions, PO numbers, etc.), this plugin ensures that custom field data is exported to PlentyONE along with order information.

**Requirements:**
- `swissup/module-checkout-fields` - Swissup Checkout Fields extension
- `byte8/module-plenty-order-profile`

**Installation:**
```bash
composer require byte8/module-plenty-swissup-checkout-fields
bin/magento setup:upgrade
bin/magento cache:flush
```

---

### Storefront Enhancements

#### PlentyONE Storefront

**Package**: `byte8/module-plenty-storefront`

Provides frontend display enhancements for PlentyONE-specific data on your Magento storefront.

**Features:**
- **Item Availability Display**: Shows PlentyONE availability status on product pages
- **Shipping Profile Information**: Displays shipping profile data from PlentyONE
- **Manufacturer Details**: Shows manufacturer information synced from PlentyONE
- **Custom Attributes**: Provides view models for displaying PlentyONE item attributes
- **Admin Product Form Extensions**: Adds PlentyONE attribute sections to product edit form

**Use Case:** Displays PlentyONE-specific product information (availability, shipping profiles, manufacturer data) on your Magento storefront, giving customers visibility into ERP-managed data.

**Configuration:**
Navigate to **Stores → Configuration → Byte8 → Storefront Configuration**

Available Options:
- **Enable Item Availability**: Show/hide item availability status
- **Enable Manufacturer Details**: Display manufacturer information on product pages

**Setup Patches:**
The module includes data patches that:
- Create `plenty_item_availability` product attribute
- Add item availability attribute to item synchronization profile
- Configure attribute display in product admin form

**Requirements:**
- `byte8/module-core`
- Standard Magento catalog modules

**Installation:**
```bash
composer require byte8/module-plenty-storefront
bin/magento setup:upgrade
bin/magento cache:flush
```

**Admin Configuration:**
After installation, configure which PlentyONE attributes to display:
1. Navigate to **Stores → Configuration → Byte8 → Storefront Configuration → Catalog Settings**
2. Enable/disable Item Availability display
3. Enable/disable Manufacturer Details display
4. Clear cache

---

## Installation Guide

### General Installation Steps

All free plugins follow the same installation pattern:

1. **Install via Composer:**
   ```bash
   composer require byte8/module-[plugin-name]
   ```

2. **Run Magento Setup:**
   ```bash
   bin/magento setup:upgrade
   bin/magento setup:di:compile  # For production only
   bin/magento setup:static-content:deploy  # For production only
   ```

3. **Clear Cache:**
   ```bash
   bin/magento cache:flush
   ```

4. **Verify Installation:**
   ```bash
   bin/magento module:status | grep Byte8
   ```

### Install Multiple Plugins

To install multiple plugins at once:

```bash
composer require \
  byte8/module-plenty-amasty-giftcard \
  byte8/module-plenty-amasty-promo \
  byte8/module-plenty-packstation

bin/magento setup:upgrade
bin/magento cache:flush
```

### Uninstalling Plugins

To remove a plugin:

```bash
# Remove via Composer
composer remove byte8/module-[plugin-name]

# Run setup
bin/magento setup:upgrade
bin/magento cache:flush
```

---

## Configuration

Most plugins work out-of-the-box and don't require additional configuration. However, some plugins offer optional settings:

### Storefront Configuration

**Location**: Stores → Configuration → Byte8 → Storefront Configuration

- **Item Availability**: Enable/disable PlentyONE availability display on product pages
- **Manufacturer Details**: Show manufacturer information from PlentyONE

### Packstation Email Alerts

**Location**: Stores → Configuration → Byte8 → Developer → Email Logs

- **Enable Email Logs**: Turn on email alerts for critical events
- **Recipient Email**: Email address for receiving alerts
- **Email Identity**: Sender identity for alert emails

---

## Compatibility

### Magento Versions

All plugins are compatible with:
- Magento Open Source 2.4.4 - 2.4.8
- Adobe Commerce 2.4.4 - 2.4.8

### PHP Versions

Supported PHP versions:
- PHP 8.1
- PHP 8.2
- PHP 8.3
- PHP 8.4

### Third-Party Extensions

Each plugin requires its respective third-party extension:

| Plugin | Required Extension | Min Version |
|--------|-------------------|-------------|
| Amasty Gift Card | amasty/giftcard | Latest |
| Amasty Promo | amasty/promo | Latest |
| Amasty Rewards | amasty/rewards | Latest |
| Amasty Cash on Delivery | amasty/cashondelivery | Latest |
| Swissup Checkout Fields | swissup/module-checkout-fields | Latest |
| Packstation | None (standalone) | N/A |
| Storefront | None (standalone) | N/A |

---

## Support & Resources

### Getting Help

If you encounter issues with any free plugin:

- 📧 **Email**: support@byte8.io
- 📞 **Phone**: +44 2080 587 795 (GMT working hours)
- 📖 **Documentation**: Browse this site for guides
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/byte8/mage2plenty/issues)

### Source Code

All free plugins are open source:
- **Repository**: `/packages/modules/module-plenty-[plugin-name]`
- **License**: OSL-3.0 / AFL-3.0
- **Contributions**: Welcome via pull requests

### Version Information

Check plugin versions:
```bash
composer show byte8/* | grep plenty
```

---

## Frequently Asked Questions

### Do I need all plugins?

No, only install the plugins for third-party extensions you actually use in your store.

### Are these plugins included with Mage2Plenty?

Yes, all free plugins are included in the Mage2Plenty package and available at no extra cost.

### Do plugins affect performance?

Minimal impact. Plugins only activate when their respective third-party extensions are present and being used.

### Can I customize plugin behavior?

Yes, all plugins are open source and can be customized. We recommend using Magento plugins and preferences rather than modifying plugin code directly.

### What happens if I don't install a required plugin?

Orders may export to PlentyONE with incomplete data. For example, without the Amasty Promo plugin, free promotional items might not export correctly.

### Are new plugins added regularly?

Yes, we continuously develop new plugins based on customer needs and popular extension integrations.

---

## Related Documentation

- **[Installation Guide](/docs/installation/composer-installation)** - Core Mage2Plenty installation
- **[Order Synchronization](/docs/testing/order-synchronization)** - Testing order export
- **[Profile Configuration](/docs/profiles/create-profile)** - Configure sync profiles
- **[Troubleshooting](/docs/troubleshooting/common-issues)** - Common issues

---

**Pro Tip:** Install plugins proactively even if you plan to use the third-party extension in the future. This ensures seamless integration when you enable the extension.

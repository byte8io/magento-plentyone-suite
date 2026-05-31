---
sidebar_position: 2
title: Amasty Gift Card Plugin
description: Integrate Amasty Gift Card extension with PlentyONE order export
---

# Amasty Gift Card Plugin

The **Amasty Gift Card plugin** integrates the popular Amasty Gift Card extension with Mage2Plenty, ensuring that gift card products and redemptions are properly synchronized with PlentyONE during order export.

## Overview

**Package**: `byte8/module-plenty-amasty-giftcard`
**Category**: Amasty Integrations
**License**: OSL-3.0 / AFL-3.0
**Status**: Production Ready

## Features

- **Gift Card Products**: Exports gift card products as order line items with correct product types
- **Code Synchronization**: Synchronizes gift card codes and values to PlentyONE
- **Redemption Handling**: Processes gift card redemptions in orders correctly
- **Product Variations**: Supports gift card product variations (different denominations)
- **Order Totals**: Ensures gift card discounts are reflected in order totals

## Use Cases

### Gift Card Purchase
When a customer purchases an Amasty gift card:
1. Gift card product appears as a line item in the order
2. Plugin identifies it as a gift card product type
3. Exports to PlentyONE with gift card-specific attributes
4. Includes gift card code and value in order data

### Gift Card Redemption
When a customer uses a gift card for payment:
1. Gift card code is applied to the order
2. Discount amount is calculated
3. Plugin exports redemption details to PlentyONE
4. Order total reflects gift card discount

### Mixed Orders
Orders containing both regular products and gift cards:
- Regular products exported normally
- Gift card products flagged appropriately
- All items processed in single order export
- Totals calculated correctly

## Requirements

### Magento Extensions
- **Amasty Gift Card** (`amasty/giftcard`) - Required

### Mage2Plenty Modules
- `byte8/module-plenty-order-profile` - Required for order export

### System Requirements
- Magento 2.4.4 - 2.4.8
- PHP 8.1 - 8.4
- Mage2Plenty connector installed and configured

## Installation

### Via Composer

```bash
# Install the plugin
composer require byte8/module-plenty-amasty-giftcard

# Run Magento setup
bin/magento setup:upgrade
bin/magento cache:flush

# For production (optional)
bin/magento setup:di:compile
bin/magento setup:static-content:deploy
```

### Verify Installation

```bash
# Check module status
bin/magento module:status Byte8_PlentyAmastyGiftCard

# Should show as enabled
```

## Configuration

This plugin works automatically once installed. No additional configuration is required in most cases.

### Default Behavior

The plugin automatically:
- Detects Amasty gift card products in orders
- Identifies gift card line items during order export
- Adds gift card-specific metadata to PlentyONE export
- Handles gift card redemptions in order totals

## How It Works

### Order Export Flow

```
Order Created in Magento
    ↓
Contains Gift Card? → No → Normal export
    ↓ Yes
Plugin Activated
    ↓
Identify Gift Card Type
    ↓
Format for PlentyONE
    ↓
Export with Gift Card Data
```

### Data Mapping

| Magento Data | PlentyONE Field | Notes |
|--------------|-----------------|-------|
| Gift Card SKU | Item Number | Standard product SKU |
| Gift Card Code | Custom Field | Gift card identifier |
| Gift Card Value | Price | Denomination amount |
| Redemption Amount | Discount | Applied discount value |

## Troubleshooting

### Gift Cards Not Exported

**Problem**: Gift card products missing from PlentyONE orders

**Solutions**:
1. Verify plugin is enabled:
   ```bash
   bin/magento module:status Byte8_PlentyAmastyGiftCard
   ```

2. Check Amasty Gift Card is installed:
   ```bash
   bin/magento module:status Amasty_GiftCard
   ```

3. Review order export logs:
   ```bash
   tail -f var/log/plenty/order.log
   ```

4. Ensure order export profile is configured correctly

### Gift Card Values Incorrect

**Problem**: Gift card amounts wrong in PlentyONE

**Solutions**:
1. Verify gift card denomination is set correctly in Magento
2. Check currency conversion settings
3. Review order total calculation in export logs
4. Ensure gift card product has correct price in Magento

### Redemption Not Showing

**Problem**: Gift card redemption discount not reflected in PlentyONE

**Solutions**:
1. Check that gift card was applied before order placement
2. Verify order totals include gift card discount in Magento
3. Review order export configuration for total handling
4. Check PlentyONE order for discount line items

## Best Practices

### Gift Card Product Setup
1. **Clear SKUs**: Use distinctive SKUs for gift card products (e.g., `GIFTCARD-50`)
2. **Proper Categorization**: Place gift cards in dedicated category
3. **Accurate Pricing**: Set denomination amounts precisely
4. **Stock Management**: Consider if gift cards should affect inventory

### Order Processing
1. **Test Orders**: Process test gift card orders before going live
2. **Verify Export**: Check PlentyONE after first gift card order export
3. **Monitor Logs**: Watch order export logs for gift card-related issues
4. **Regular Audits**: Periodically verify gift card orders in both systems

### Multi-Currency Stores
1. **Currency Handling**: Ensure gift card values convert correctly
2. **Price Precision**: Maintain consistent decimal precision
3. **Exchange Rates**: Keep exchange rates synchronized
4. **Testing**: Test gift cards in all currency configurations

## Related Plugins

### Amasty Suite
- **[Amasty Promo](/docs/extensions/amasty-promo)** - Handle promotional free gifts
- **[Amasty Rewards](/docs/extensions/amasty-rewards)** - Integrate reward points
- **[Amasty Cash on Delivery](/docs/extensions/amasty-cash-on-delivery)** - COD fee handling

### Order Export
- **[Order Export Profile](/docs/profiles/order-export)** - Configure order synchronization
- **[Payment Method Configuration](/docs/configuration/payment-configuration)** - Payment setup

## Support

### Getting Help

If you encounter issues:

- 📧 **Email**: support@byte8.io
- 📞 **Phone**: +44 2080 587 795 (GMT working hours)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/byte8/mage2plenty/issues)

### Source Code

- **Location**: `/packages/modules/module-plenty-amasty-giftcard`
- **License**: OSL-3.0 / AFL-3.0
- **Contributions**: Welcome via pull requests

## Version Information

Check current version:
```bash
composer show byte8/module-plenty-amasty-giftcard
```

## Related Documentation

- **[Free Plugins Overview](/docs/extensions/free-plugins)** - All available plugins
- **[Order Export Profile](/docs/profiles/order-export)** - Order synchronization setup
- **[Installation Guide](/docs/installation/composer-installation)** - Core installation
- **[Troubleshooting Orders](/docs/troubleshooting/order-issues)** - Order sync issues

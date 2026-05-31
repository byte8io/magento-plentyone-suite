---
sidebar_position: 3
title: Amasty Promo Plugin
description: Integrate Amasty Special Promotions extension with PlentyONE order export
---

# Amasty Promo Plugin

The **Amasty Promo plugin** integrates Amasty Special Promotions (Free Gifts) extension with Mage2Plenty, ensuring that promotional items and free gifts are properly exported to PlentyONE with orders.

## Overview

**Package**: `byte8/module-plenty-amasty-promo`
**Category**: Amasty Integrations
**License**: OSL-3.0 / AFL-3.0
**Status**: Production Ready

## Features

- **Free Gift Export**: Exports promotional free items to PlentyONE as order line items
- **Buy X Get Y**: Handles "Buy X Get Y Free" promotional rules
- **Zero Price Items**: Synchronizes free gift line items with zero price correctly
- **Promotion References**: Maintains promotion rule references for tracking
- **Multiple Promotions**: Supports multiple promotional items in single order
- **Rule Identification**: Tracks which promotion rule triggered each free item

## Use Cases

### Buy X Get Y Free
**Promotion**: Buy 2 T-shirts, Get 1 Free

**Order Contains**:
- 2x T-shirt (paid)
- 1x T-shirt (free via promo)

**Plugin Action**:
- Exports all 3 T-shirts to PlentyONE
- Marks free item with zero price
- Includes promotion rule reference
- Maintains correct order totals

### Spend $X Get Free Gift
**Promotion**: Spend $100, Get Free Sample Kit

**Order Contains**:
- $150 worth of products
- 1x Sample Kit (free)

**Plugin Action**:
- Exports all products including free gift
- Tags sample kit as promotional item
- Zero price for promotional item
- Links to promotion rule ID

### Multiple Promotions
**Active Promotions**:
- Buy 3 Get 1 Free (Product A)
- Free Shipping Sample with any order

**Order Contains**:
- 3x Product A (paid) + 1x Product A (free)
- 1x Shipping Sample (free)

**Plugin Action**:
- Exports all line items correctly
- Each promo item tagged with its rule
- Correct pricing for all items
- Maintains order integrity

## Requirements

### Magento Extensions
- **Amasty Special Promotions** (`amasty/promo`) - Required

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
composer require byte8/module-plenty-amasty-promo

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
bin/magento module:status Byte8_PlentyAmastyPromo

# Should show as enabled
```

## Configuration

This plugin works automatically once installed. It integrates seamlessly with your existing order export configuration.

### Default Behavior

The plugin automatically:
- Detects Amasty promotional items in orders
- Identifies free gift line items during order export
- Adds promotional item metadata
- Ensures zero pricing for free items
- Maintains promotion rule references

## How It Works

### Order Export Flow

```
Order Created with Promo Items
    ↓
Order Export Triggered
    ↓
Plugin Detects Promo Items
    ↓
Tag Items as Promotional
    ↓
Apply Zero Price
    ↓
Add Promo Rule Reference
    ↓
Export to PlentyONE
```

### Data Mapping

| Magento Data | PlentyONE Field | Notes |
|--------------|-----------------|-------|
| Product SKU | Item Number | Same as regular products |
| Promotional Flag | Custom Attribute | Marks as promo item |
| Rule ID | Reference | Promo rule identifier |
| Price | Amount | Set to 0.00 for free items |
| Quantity | Quantity | Same as ordered |

## Troubleshooting

### Free Items Not Exported

**Problem**: Promotional items missing from PlentyONE orders

**Solutions**:
1. Verify plugin is enabled:
   ```bash
   bin/magento module:status Byte8_PlentyAmastyPromo
   ```

2. Check Amasty Promo extension is installed:
   ```bash
   bin/magento module:status Amasty_Promo
   ```

3. Verify promotion was applied in Magento order
4. Review order export logs:
   ```bash
   tail -f var/log/plenty/order.log
   ```

### Promo Items Have Wrong Price

**Problem**: Free items showing non-zero price in PlentyONE

**Solutions**:
1. Verify item was actually free in Magento order
2. Check order totals calculation
3. Review promotional rule configuration
4. Ensure plugin is processing items correctly
5. Check for conflicts with other pricing extensions

### Duplicate Items in Order

**Problem**: Promo items appear twice in PlentyONE

**Solutions**:
1. Check if item was added manually and via promotion
2. Review promotion rule configuration
3. Verify order line items in Magento
4. Check export logs for duplicate processing
5. Ensure promotion rule isn't misconfigured

### Promotion Rules Not Identified

**Problem**: Can't track which promotion triggered items

**Solutions**:
1. Ensure Amasty Promo stores rule IDs with order items
2. Check order item metadata in Magento database
3. Review promotion rule setup in Amasty
4. Verify plugin version is current

## Best Practices

### Promotion Setup
1. **Clear Rules**: Use descriptive promotion rule names
2. **Distinct SKUs**: Ensure promotional items have clear SKUs
3. **Stock Management**: Track inventory for promotional items
4. **Testing**: Test each promotion rule before going live

### Order Processing
1. **Verify First Export**: Check first promotional order in PlentyONE
2. **Monitor Logs**: Watch for promotional item processing messages
3. **Regular Audits**: Periodically verify promotional orders match
4. **Stock Reconciliation**: Ensure promo items don't cause stock issues

### Performance
1. **Rule Complexity**: Keep promotion rules simple when possible
2. **Item Quantity**: Monitor orders with many promotional items
3. **Export Timing**: Consider scheduling bulk exports during off-peak
4. **Cache Management**: Clear cache after changing promotion rules

## Common Promotion Scenarios

### Scenario 1: BOGO (Buy One Get One)
```
Promotion: Buy 1 Get 1 Free on Product X
Order: 2x Product X
Result: Both items exported, second at $0.00
```

### Scenario 2: Tiered Promotions
```
Promotion: Buy 2 Get 10% Off, Buy 3 Get 1 Free
Order: 4x Product
Result: 3 at discounted price, 1 at $0.00
```

### Scenario 3: Category Promotions
```
Promotion: Buy from Category A, Get Free Item from Category B
Order: 3x Category A products + 1x Free Category B product
Result: All exported, Category B item at $0.00
```

## Related Plugins

### Amasty Suite
- **[Amasty Gift Card](/docs/extensions/amasty-gift-card)** - Gift card integration
- **[Amasty Rewards](/docs/extensions/amasty-rewards)** - Reward points integration
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

- **Location**: `/packages/modules/module-plenty-amasty-promo`
- **License**: OSL-3.0 / AFL-3.0
- **Contributions**: Welcome via pull requests

## Version Information

Check current version:
```bash
composer show byte8/module-plenty-amasty-promo
```

## Related Documentation

- **[Free Plugins Overview](/docs/extensions/free-plugins)** - All available plugins
- **[Order Export Profile](/docs/profiles/order-export)** - Order synchronization setup
- **[Installation Guide](/docs/installation/composer-installation)** - Core installation
- **[Troubleshooting Orders](/docs/troubleshooting/order-issues)** - Order sync issues

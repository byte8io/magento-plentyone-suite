---
sidebar_position: 4
title: Amasty Rewards Plugin
description: Integrate Amasty Reward Points extension with PlentyONE order synchronization
---

# Amasty Rewards Plugin

The **Amasty Rewards plugin** integrates Amasty Reward Points extension with Mage2Plenty, ensuring that reward point transactions, redemptions, and earnings are properly synchronized with PlentyONE orders.

## Overview

**Package**: `softcommerce/module-plenty-amasty-rewards`
**Category**: Amasty Integrations
**License**: OSL-3.0 / AFL-3.0
**Status**: Production Ready

## Features

- **Points Usage Export**: Exports reward points used in orders as discount totals
- **Points Earned Tracking**: Synchronizes reward points earned from purchases
- **Redemption Discounts**: Handles reward point redemptions as order totals adjustments
- **Balance Adjustments**: Tracks reward point balance changes per order
- **Multi-Currency**: Supports reward points in multi-currency stores
- **Order Total Integration**: Correctly calculates order totals with reward points applied

## Use Cases

### Customer Redeems Points
**Scenario**: Customer uses 500 points ($5.00) for order discount

**Order Details**:
- Subtotal: $50.00
- Reward Points: -$5.00 (500 points)
- Grand Total: $45.00

**Plugin Action**:
- Exports order with $45.00 grand total
- Includes reward redemption as discount line
- Records 500 points used
- Synchronizes with PlentyONE accounting

### Customer Earns Points
**Scenario**: Customer earns 100 points from $100 purchase

**Order Details**:
- Subtotal: $100.00
- Points Earned: 100 points

**Plugin Action**:
- Exports order normally
- Records points earned in order metadata
- Tracks for future redemptions
- Available for loyalty reporting

### Mixed Scenario
**Scenario**: Customer uses 200 points AND earns 150 new points

**Order Details**:
- Subtotal: $75.00
- Reward Discount: -$2.00 (200 points used)
- Grand Total: $73.00
- Points Earned: 150 points

**Plugin Action**:
- Exports full transaction details
- Tracks both redemption and earning
- Maintains accurate point balance
- Synchronizes complete order data

## Requirements

### Magento Extensions
- **Amasty Reward Points** (`amasty/rewards`) - Required

### Mage2Plenty Modules
- `softcommerce/module-plenty-profile` - Required for synchronization

### System Requirements
- Magento 2.4.4 - 2.4.8
- PHP 8.1 - 8.4
- Mage2Plenty connector installed and configured

## Installation

### Via Composer

```bash
# Install the plugin
composer require softcommerce/module-plenty-amasty-rewards

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
bin/magento module:status SoftCommerce_PlentyAmastyRewards

# Should show as enabled
```

## Configuration

This plugin works automatically once installed. It integrates with your existing order export configuration.

### Default Behavior

The plugin automatically:
- Detects reward point usage in orders
- Calculates reward point discount amounts
- Tracks points earned from orders
- Includes reward data in order export
- Maintains accurate order totals

## How It Works

### Order Export Flow with Rewards

```
Order Placed
    ↓
Contains Reward Points? → No → Normal export
    ↓ Yes
Plugin Activated
    ↓
Calculate Points Used/Earned
    ↓
Adjust Order Totals
    ↓
Add Reward Metadata
    ↓
Export to PlentyONE
```

### Data Mapping

| Magento Data | PlentyONE Field | Notes |
|--------------|-----------------|-------|
| Points Used | Discount | Monetary value of points |
| Points Earned | Custom Field | For loyalty tracking |
| Point Balance Change | Order Metadata | Net point adjustment |
| Reward Discount | Order Total | Applied to grand total |

## Troubleshooting

### Reward Discount Not Exported

**Problem**: Order shows wrong total in PlentyONE (reward discount missing)

**Solutions**:
1. Verify plugin is enabled:
   ```bash
   bin/magento module:status SoftCommerce_PlentyAmastyRewards
   ```

2. Check reward points were actually applied:
   - View order in Magento Admin
   - Check order totals section
   - Verify reward points discount shows

3. Review order export logs:
   ```bash
   tail -f var/log/softcommerce/plenty/order.log
   ```

4. Verify order export profile includes all totals

### Incorrect Point Calculation

**Problem**: Points-to-currency conversion wrong in export

**Solutions**:
1. Check Amasty Rewards configuration:
   - Stores → Configuration → Amasty → Reward Points
   - Verify "Points Value" setting
   - Confirm exchange rate (points to currency)

2. Review multi-currency configuration if applicable
3. Verify point balance in customer account
4. Check for rounding issues in calculations

### Points Earned Not Tracked

**Problem**: Points earned from order not showing in PlentyONE

**Solutions**:
1. Verify Amasty Rewards is configured to award points for purchases
2. Check earning rules in Amasty configuration
3. Confirm order status qualifies for point earning
4. Review order metadata in export logs
5. Check if points are pending approval

## Best Practices

### Point System Setup
1. **Clear Exchange Rate**: Set clear points-to-currency conversion
2. **Earning Rules**: Configure consistent earning rules
3. **Expiration Policy**: Define point expiration clearly
4. **Communication**: Inform customers of point values

### Order Processing
1. **Test Orders**: Process test orders with reward points before going live
2. **Verify Totals**: Always verify order totals match between systems
3. **Monitor Balance**: Regularly audit customer point balances
4. **Reconciliation**: Periodic reconciliation between Magento and PlentyONE

### Multi-Currency Considerations
1. **Currency Conversion**: Ensure points convert correctly in all currencies
2. **Display Values**: Show point values in customer's selected currency
3. **Accounting**: Maintain consistent accounting across currencies
4. **Testing**: Test reward redemptions in all supported currencies

## Common Scenarios

### Scenario 1: First Time Point Usage
```
Customer Balance: 1000 points
Order Value: $50.00
Points Used: 500 (= $5.00)
New Balance: 500 points
Export: Order total $45.00 with $5.00 reward discount
```

### Scenario 2: Earning and Using
```
Starting Balance: 200 points
Points Used: 200 (= $2.00)
Order Value: $100.00
Points Earned: 100
Net Change: -200 + 100 = -100 points
Export: Full transaction details with both redemption and earning
```

### Scenario 3: Partial Redemption
```
Order Value: $150.00
Available Points: 5000 (= $50.00)
Customer Uses: 1000 points (= $10.00)
Export: Order $140.00 with $10.00 reward discount
Remaining: 4000 points in customer account
```

## Related Plugins

### Amasty Suite
- **[Amasty Gift Card](/docs/extensions/amasty-gift-card)** - Gift card integration
- **[Amasty Promo](/docs/extensions/amasty-promo)** - Promotional items
- **[Amasty Cash on Delivery](/docs/extensions/amasty-cash-on-delivery)** - COD fees

### Order Export
- **[Order Export Profile](/docs/profiles/order-export)** - Configure order synchronization
- **[Customer Export Profile](/docs/profiles/customer-export)** - Customer data sync

## Support

### Getting Help

If you encounter issues:

- 📧 **Email**: support@byte8.io
- 📞 **Phone**: +44 2080 587 795 (GMT working hours)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/softcommerceltd/mage2plenty-os/issues)

### Source Code

- **Location**: `/packages/modules/module-plenty-amasty-rewards`
- **License**: OSL-3.0 / AFL-3.0
- **Contributions**: Welcome via pull requests

## Version Information

Check current version:
```bash
composer show softcommerce/module-plenty-amasty-rewards
```

## Related Documentation

- **[Free Plugins Overview](/docs/extensions/free-plugins)** - All available plugins
- **[Order Export Profile](/docs/profiles/order-export)** - Order synchronization setup
- **[Installation Guide](/docs/installation/composer-installation)** - Core installation
- **[Troubleshooting Orders](/docs/troubleshooting/order-issues)** - Order sync issues

---
sidebar_position: 5
title: Amasty Cash on Delivery Plugin
description: Integrate Amasty Cash on Delivery fees with PlentyONE order export
---

# Amasty Cash on Delivery Plugin

The **Amasty Cash on Delivery (COD) plugin** integrates Amasty's Cash on Delivery Fee extension with Mage2Plenty, ensuring that COD fees are properly exported to PlentyONE as part of order totals and accounting.

## Overview

**Package**: `softcommerce/module-plenty-amasty-cash-on-delivery`
**Category**: Amasty Integrations
**License**: OSL-3.0 / AFL-3.0
**Status**: Production Ready

## Features

- **COD Fee Export**: Exports cash on delivery fees as separate order line items
- **Fee Calculation**: Synchronizes calculated COD fees based on Amasty rules
- **Payment Method Integration**: Automatically detects COD payment method usage
- **Accounting Accuracy**: Ensures fees are properly included in order totals
- **Multi-Currency**: Supports COD fees in multiple currencies
- **Tax Handling**: Correctly handles tax calculation on COD fees

## Use Cases

### Standard COD Order
**Scenario**: Customer selects Cash on Delivery payment method

**Order Details**:
- Subtotal: $100.00
- Shipping: $10.00
- COD Fee: $5.00
- Grand Total: $115.00

**Plugin Action**:
- Detects COD payment method
- Exports COD fee as separate line item
- Includes fee in order total calculation
- Synchronizes to PlentyONE accounting

### Variable COD Fees
**Scenario**: COD fee varies based on order value

**Amasty Rule**:
- Orders under $50: $5.00 COD fee
- Orders $50-$100: $3.00 COD fee
- Orders over $100: $2.00 COD fee

**Plugin Action**:
- Applies correct fee based on order value
- Exports calculated fee amount
- Maintains fee calculation logic
- Ensures accurate accounting

### International COD
**Scenario**: Different COD fees for different countries

**Order Details**:
- Domestic order: $3.00 COD fee
- International order: $8.00 COD fee

**Plugin Action**:
- Detects shipping destination
- Applies country-specific COD fee
- Exports correct fee amount
- Handles currency conversion if needed

## Requirements

### Magento Extensions
- **Amasty Cash on Delivery Fee** (`amasty/cashondelivery`) - Required

### Mage2Plenty Modules
- `softcommerce/module-plenty-order-profile` - Required for order export

### System Requirements
- Magento 2.4.4 - 2.4.8
- PHP 8.1 - 8.4
- Mage2Plenty connector installed and configured

## Installation

### Via Composer

```bash
# Install the plugin
composer require softcommerce/module-plenty-amasty-cash-on-delivery

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
bin/magento module:status SoftCommerce_PlentyAmastryCashOnDelivery

# Should show as enabled
```

## Configuration

This plugin works automatically once installed. It integrates with your existing order export and payment method configuration.

### Default Behavior

The plugin automatically:
- Detects when COD payment method is used
- Retrieves COD fee amount from order totals
- Adds COD fee as order line item during export
- Includes fee in grand total calculation
- Synchronizes with PlentyONE accounting

### Payment Method Mapping

Ensure your COD payment method is properly mapped:
1. Navigate to **Stores → Configuration → Mage2Plenty → Payment Configuration**
2. Map Magento COD method to PlentyONE payment method
3. Verify COD fees are included in payment mapping

## How It Works

### Order Export Flow with COD

```
Order Placed with COD
    ↓
Payment Method = COD? → No → Normal export
    ↓ Yes
Plugin Activated
    ↓
Retrieve COD Fee Amount
    ↓
Add Fee as Line Item
    ↓
Update Order Totals
    ↓
Export to PlentyONE
```

### Data Mapping

| Magento Data | PlentyONE Field | Notes |
|--------------|-----------------|-------|
| COD Fee Amount | Order Total | Added to grand total |
| Fee Item | Line Item | Exported as service fee |
| Payment Method | Payment ID | COD method mapping |
| Tax on Fee | Tax Total | If fee is taxable |

## Troubleshooting

### COD Fee Not Exported

**Problem**: Cash on delivery fee missing from PlentyONE order

**Solutions**:
1. Verify plugin is enabled:
   ```bash
   bin/magento module:status SoftCommerce_PlentyAmastryCashOnDelivery
   ```

2. Check Amasty COD extension is installed:
   ```bash
   bin/magento module:status Amasty_CashOnDelivery
   ```

3. Verify COD fee was applied in Magento order:
   - View order in Admin
   - Check Order Totals section
   - Confirm COD fee line exists

4. Review order export logs:
   ```bash
   tail -f var/log/softcommerce/plenty/order.log
   ```

### Incorrect Fee Amount

**Problem**: COD fee amount wrong in PlentyONE

**Solutions**:
1. Verify Amasty COD configuration:
   - Stores → Configuration → Amasty → Cash on Delivery
   - Check fee calculation rules
   - Verify fee amounts

2. Check order totals in Magento match expected fee
3. Review currency conversion settings if multi-currency
4. Ensure no conflicts with other fee/discount extensions

### Fee Missing from Total

**Problem**: Order total doesn't include COD fee in PlentyONE

**Solutions**:
1. Verify order export profile includes all totals
2. Check that fee is added before export trigger
3. Review order data in export logs
4. Ensure PlentyONE order type accepts service fees
5. Check payment method mapping configuration

### Tax Calculation Issues

**Problem**: Tax on COD fee calculated incorrectly

**Solutions**:
1. Verify Amasty COD tax configuration:
   - Check if fee should be taxable
   - Verify tax class assignment
   - Confirm tax calculation rules

2. Review Magento tax configuration
3. Check PlentyONE tax settings
4. Ensure tax rates are synchronized
5. Verify order tax totals in both systems

## Best Practices

### COD Configuration
1. **Clear Fee Rules**: Set transparent, easy-to-understand COD fee rules
2. **Customer Communication**: Display COD fees clearly during checkout
3. **Reasonable Fees**: Keep fees competitive and justifiable
4. **Country-Specific**: Consider different fees for different regions

### Order Processing
1. **Test Orders**: Process test COD orders before going live
2. **Verify Totals**: Always verify order totals match between systems
3. **Monitor Fees**: Regularly review COD fee collection
4. **Reconciliation**: Periodic reconciliation of COD fees in accounting

### Multi-Store Setup
1. **Store-Specific Fees**: Configure appropriate fees per store view
2. **Currency Handling**: Ensure fees convert correctly in all currencies
3. **Regional Rules**: Apply country/region-specific COD policies
4. **Testing**: Test COD in all store views and currencies

## Common Scenarios

### Scenario 1: Fixed COD Fee
```
Configuration: $5.00 flat COD fee
Order Value: $75.00
Shipping: $10.00
COD Fee: $5.00
Export: Order total $90.00 with $5.00 service fee line item
```

### Scenario 2: Percentage-Based Fee
```
Configuration: 3% of order value as COD fee
Order Value: $100.00
COD Fee: $3.00
Export: Order total $103.00 with calculated percentage fee
```

### Scenario 3: Tiered Fee Structure
```
Rule: Orders under $50 = $5, $50-$100 = $3, over $100 = $2
Order Value: $120.00
Applied Fee: $2.00
Export: Correct tier-based fee included in order
```

## Related Plugins

### Amasty Suite
- **[Amasty Gift Card](/docs/extensions/amasty-gift-card)** - Gift card integration
- **[Amasty Promo](/docs/extensions/amasty-promo)** - Promotional items
- **[Amasty Rewards](/docs/extensions/amasty-rewards)** - Reward points

### Order Export
- **[Order Export Profile](/docs/profiles/order-export)** - Configure order synchronization
- **[Payment Configuration](/docs/configuration/payment-configuration)** - Payment method mapping

## Support

### Getting Help

If you encounter issues:

- 📧 **Email**: support@byte8.io
- 📞 **Phone**: +44 2080 587 795 (GMT working hours)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/softcommerceltd/mage2plenty-os/issues)

### Source Code

- **Location**: `/packages/modules/module-plenty-amasty-cash-on-delivery`
- **License**: OSL-3.0 / AFL-3.0
- **Contributions**: Welcome via pull requests

## Version Information

Check current version:
```bash
composer show softcommerce/module-plenty-amasty-cash-on-delivery
```

## Related Documentation

- **[Free Plugins Overview](/docs/extensions/free-plugins)** - All available plugins
- **[Order Export Profile](/docs/profiles/order-export)** - Order synchronization setup
- **[Payment Configuration](/docs/configuration/payment-configuration)** - Payment method setup
- **[Troubleshooting Orders](/docs/troubleshooting/order-issues)** - Order sync issues

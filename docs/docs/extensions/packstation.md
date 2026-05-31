---
sidebar_position: 6
title: Packstation Plugin
description: Integrate DHL Packstation delivery addresses with PlentyONE order export
---

# Packstation Plugin

The **Packstation plugin** enables proper handling and export of DHL Packstation delivery addresses from Magento to PlentyONE, ensuring seamless integration with Germany's popular parcel locker system.

## Overview

**Package**: `byte8/module-plenty-packstation`
**Category**: Shipping & Delivery
**License**: OSL-3.0 / AFL-3.0
**Status**: Production Ready

## Features

- **Packstation Address Export**: Exports Packstation addresses with correct format to PlentyONE
- **Post Number Handling**: Synchronizes DHL Post Number (Postnummer) data
- **Address Validation**: Validates Packstation address format before export
- **DHL Integration**: Seamless integration with DHL shipping methods
- **Address Parsing**: Correctly parses Packstation, Filiale, and Postfiliale addresses
- **Order Fulfillment**: Ensures orders are fulfilled to correct locker locations

## Use Cases

### Standard Packstation Delivery
**Scenario**: Customer selects DHL Packstation for delivery

**Address Format**:
```
Customer Name: Max Mustermann
Packstation Number: 123
Post Number: 12345678
Postal Code: 10115
City: Berlin
Country: Germany
```

**Plugin Action**:
- Detects Packstation address format
- Validates Post Number exists
- Formats address for PlentyONE
- Exports with DHL-compatible structure
- Ensures proper label generation

### Post Filiale Delivery
**Scenario**: Customer uses DHL Postfiliale (post office location)

**Address Format**:
```
Customer Name: Anna Schmidt
Filiale: 512
Post Number: 87654321
Postal Code: 80331
City: München
Country: Germany
```

**Plugin Action**:
- Identifies Filiale delivery type
- Validates address completeness
- Exports to PlentyONE with correct format
- Maintains Filiale reference number

### Mixed Order Processing
**Scenario**: Store processes both standard and Packstation deliveries

**Plugin Action**:
- Detects address type automatically
- Applies appropriate validation rules
- Formats each address correctly
- Exports all orders seamlessly
- No manual intervention required

## Requirements

### Magento Extensions
- **DHL Packstation Extension** (optional) - Enhances checkout experience
- Standard Magento address functionality works with manual entry

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
composer require byte8/module-plenty-packstation

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
bin/magento module:status Byte8_PlentyPackstation

# Should show as enabled
```

## Configuration

This plugin works automatically once installed, detecting Packstation addresses during order export.

### Default Behavior

The plugin automatically:
- Detects Packstation/Filiale keywords in addresses
- Extracts Post Number from address fields
- Validates address format and completeness
- Formats address for DHL compatibility
- Exports to PlentyONE with correct structure

### Address Detection Keywords

The plugin recognizes these address patterns:
- "Packstation" or "Pack Station"
- "Postfiliale" or "Filiale"
- "Paketshop" or "Paket Shop"
- Post Number patterns (8-digit numeric)

## How It Works

### Order Export Flow with Packstation

```
Order Placed
    ↓
Address Contains Packstation? → No → Normal export
    ↓ Yes
Plugin Activated
    ↓
Parse Address Components
    ↓
Extract Post Number
    ↓
Validate Address
    ↓
Format for DHL/PlentyONE
    ↓
Export to PlentyONE
```

### Address Parsing Logic

1. **Detection**: Scan address fields for Packstation keywords
2. **Extraction**: Parse Packstation number, Post Number, postal code
3. **Validation**: Ensure all required fields present
4. **Formatting**: Structure data for PlentyONE/DHL
5. **Export**: Send formatted address with order

### Data Mapping

| Magento Field | PlentyONE Field | Notes |
|---------------|-----------------|-------|
| Street Line 1 | Packstation Number | e.g., "Packstation 123" |
| Street Line 2 | Post Number | 8-digit DHL number |
| Street Line 3 | Additional Info | Optional |
| City | City | Standard |
| Postal Code | Postal Code | Required |
| Name | Customer Name | Recipient |

## Troubleshooting

### Packstation Address Not Recognized

**Problem**: Order exports with standard address format instead of Packstation

**Solutions**:
1. Verify plugin is enabled:
   ```bash
   bin/magento module:status Byte8_PlentyPackstation
   ```

2. Check address format in Magento order:
   - Must include "Packstation" keyword
   - Post Number must be present
   - View order in Admin → check shipping address

3. Review order export logs:
   ```bash
   tail -f var/log/plenty/order.log
   ```

4. Verify address wasn't manually edited after placement

### Post Number Missing

**Problem**: Export fails due to missing Post Number

**Solutions**:
1. Check customer entered Post Number during checkout
2. Verify Post Number field is available in checkout
3. Review address validation rules
4. Ensure Post Number stored in address fields:
   ```sql
   SELECT * FROM sales_order_address
   WHERE order_id = [ORDER_ID]
   AND address_type = 'shipping';
   ```

5. Consider adding Post Number as required field

### Incorrect Address Format in PlentyONE

**Problem**: Address exported but format wrong in PlentyONE

**Solutions**:
1. Verify PlentyONE address field mapping
2. Check address parser configuration
3. Review exported address in PlentyONE order
4. Ensure DHL shipping method properly configured
5. Test with known-good Packstation address

### DHL Label Generation Fails

**Problem**: Orders export but DHL labels fail to generate

**Solutions**:
1. Verify Post Number format (must be 8 digits)
2. Check Packstation number is valid
3. Ensure postal code matches Packstation location
4. Verify customer name matches DHL account
5. Review DHL API error messages
6. Check PlentyONE shipping configuration

## Best Practices

### Checkout Configuration
1. **Clear Instructions**: Provide customer guidance for Packstation entry
2. **Field Validation**: Validate Post Number format at checkout
3. **Address Format**: Display example Packstation address
4. **Required Fields**: Make Post Number mandatory for Packstation

### Address Entry
1. **Standardized Format**: Encourage consistent address format
2. **Post Number Verification**: Consider DHL API verification
3. **Autocomplete**: Implement Packstation number autocomplete if possible
4. **Error Messages**: Clear messaging when address incomplete

### Order Processing
1. **Test Orders**: Process test Packstation orders before going live
2. **Verify Export**: Check first Packstation order in PlentyONE
3. **Monitor Labels**: Ensure DHL labels generate correctly
4. **Regular Audits**: Periodically verify Packstation orders

### Customer Communication
1. **Checkout Help**: Add help text explaining Packstation fields
2. **Post Number**: Include instructions on finding Post Number
3. **Confirmation**: Show Packstation details in order confirmation
4. **Tracking**: Provide tracking info for locker delivery

## Common Address Formats

### Packstation Format
```
Max Mustermann
Packstation 123
Postnummer 12345678
10115 Berlin
Germany
```

### Postfiliale Format
```
Anna Schmidt
Postfiliale 512
Postnummer 87654321
80331 München
Germany
```

### Alternative Entry
```
Street 1: Packstation 123
Street 2: 12345678
City: Berlin
Postcode: 10115
```

## Related Plugins

### Shipping & Address
- **[Swissup Checkout Fields](/docs/extensions/swissup-checkout-fields)** - Custom checkout fields

### Order Export
- **[Order Export Profile](/docs/profiles/order-export)** - Configure order synchronization

## Support

### Getting Help

If you encounter issues:

- 📧 **Email**: support@byte8.io
- 📞 **Phone**: +44 2080 587 795 (GMT working hours)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/byte8/mage2plenty/issues)

### DHL Resources
- **DHL Packstation Finder**: [dhl.de/packstation-finden](https://www.dhl.de/packstation-finden)
- **Post Number Registration**: Available through DHL website
- **DHL API Documentation**: Contact DHL for shipping API docs

### Source Code

- **Location**: `/packages/modules/module-plenty-packstation`
- **License**: OSL-3.0 / AFL-3.0
- **Contributions**: Welcome via pull requests

## Version Information

Check current version:
```bash
composer show byte8/module-plenty-packstation
```

## Related Documentation

- **[Free Plugins Overview](/docs/extensions/free-plugins)** - All available plugins
- **[Order Export Profile](/docs/profiles/order-export)** - Order synchronization setup
- **[Troubleshooting Orders](/docs/troubleshooting/order-issues)** - Order sync issues

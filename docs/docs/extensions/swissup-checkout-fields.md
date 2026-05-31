---
sidebar_position: 7
title: Swissup Checkout Fields Plugin
description: Synchronize Swissup custom checkout fields with PlentyONE order export
---

# Swissup Checkout Fields Plugin

The **Swissup Checkout Fields plugin** integrates Swissup's Checkout Fields extension with Mage2Plenty, ensuring that custom checkout fields and their values are properly exported to PlentyONE with orders.

## Overview

**Package**: `byte8/module-plenty-swissup-checkout-fields`
**Category**: Checkout & Forms
**License**: OSL-3.0 / AFL-3.0
**Status**: Production Ready

## Features

- **Custom Field Export**: Exports all Swissup custom checkout fields with orders
- **Field Mapping**: Maps custom fields to PlentyONE order properties
- **Multiple Field Types**: Supports text, textarea, select, multiselect, date, checkbox fields
- **Validation Data**: Includes field validation rules and requirements
- **Order Metadata**: Stores custom field values in order metadata
- **Multi-Store Support**: Handles store-specific field configurations

## Use Cases

### Delivery Instructions
**Scenario**: Custom field for delivery instructions

**Checkout Field**:
```
Field: Delivery Instructions
Type: Textarea
Customer Input: "Please leave at back door"
```

**Plugin Action**:
- Captures delivery instructions value
- Exports as order property to PlentyONE
- Available for warehouse/fulfillment team
- Appears in order notes

### Gift Message
**Scenario**: Gift order with custom message

**Checkout Fields**:
```
Is this a gift? → Yes (checkbox)
Gift Message → "Happy Birthday!" (textarea)
Gift Wrapping → "Premium Box" (select)
```

**Plugin Action**:
- Exports all gift-related fields
- Maps to PlentyONE order properties
- Maintains field relationships
- Enables gift processing workflow

### Company Purchase Order
**Scenario**: B2B order with purchase order number

**Checkout Field**:
```
Field: PO Number
Type: Text
Required: Yes (for company accounts)
Customer Input: "PO-2024-12345"
```

**Plugin Action**:
- Validates required field
- Exports PO number to PlentyONE
- Maps to invoice reference field
- Available for accounting integration

### Delivery Date Selection
**Scenario**: Customer selects preferred delivery date

**Checkout Field**:
```
Field: Preferred Delivery Date
Type: Date
Customer Input: 2024-12-25
Validation: Must be future date
```

**Plugin Action**:
- Exports date in ISO format
- Maps to PlentyONE delivery date field
- Enables delivery scheduling
- Available for logistics planning

## Requirements

### Magento Extensions
- **Swissup Checkout Fields** (`swissup/module-checkout-fields`) - Required

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
composer require byte8/module-plenty-swissup-checkout-fields

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
bin/magento module:status Byte8_PlentySwissupCheckoutFields

# Should show as enabled
```

## Configuration

### Automatic Field Detection

The plugin automatically:
- Detects all active Swissup checkout fields
- Reads field values from orders
- Maps fields to PlentyONE properties
- Exports field data with orders

### Field Mapping Configuration

Configure custom field mapping:

1. Navigate to **Stores → Configuration → Mage2Plenty → Checkout Fields**
2. Map Swissup fields to PlentyONE properties
3. Set field export priorities
4. Configure field formatting rules

### Example Configuration

```
Swissup Field          → PlentyONE Property
─────────────────────────────────────────────
delivery_instructions  → Order Note 1
gift_message          → Order Note 2
po_number             → External Order ID
delivery_date         → Estimated Shipping Date
company_vat           → VAT Number
```

## How It Works

### Order Export Flow

```
Order Placed with Custom Fields
    ↓
Contains Checkout Fields? → No → Normal export
    ↓ Yes
Plugin Activated
    ↓
Retrieve Field Values
    ↓
Map to PlentyONE Properties
    ↓
Format Field Data
    ↓
Add to Order Export
    ↓
Export to PlentyONE
```

### Data Processing

1. **Field Detection**: Identify all Swissup fields attached to order
2. **Value Extraction**: Read field values from order metadata
3. **Field Mapping**: Map each field to corresponding PlentyONE property
4. **Data Formatting**: Format values according to field type
5. **Export**: Include field data in order export payload

### Data Mapping

| Swissup Field Type | PlentyONE Field | Notes |
|--------------------|-----------------|-------|
| Text | Custom Property | Plain text value |
| Textarea | Order Note | Multi-line text |
| Select | Custom Property | Selected option value |
| Multiselect | Custom Property | Comma-separated values |
| Date | Date Property | ISO 8601 format |
| Checkbox | Boolean Property | true/false |

## Troubleshooting

### Custom Fields Not Exported

**Problem**: Swissup checkout field values missing from PlentyONE

**Solutions**:
1. Verify plugin is enabled:
   ```bash
   bin/magento module:status Byte8_PlentySwissupCheckoutFields
   ```

2. Check Swissup extension is installed:
   ```bash
   bin/magento module:status Swissup_CheckoutFields
   ```

3. Verify field has value in Magento order:
   - View order in Admin
   - Check Additional Information section
   - Look for custom field values

4. Review order export logs:
   ```bash
   tail -f var/log/plenty/order.log
   ```

5. Ensure field mapping is configured

### Field Values Incorrect

**Problem**: Field values exported but wrong in PlentyONE

**Solutions**:
1. Check field type matches expected format
2. Verify data formatting configuration
3. Review field value in Magento database:
   ```sql
   SELECT * FROM swissup_checkout_field_value
   WHERE order_id = [ORDER_ID];
   ```

4. Ensure no data transformation issues
5. Verify PlentyONE property accepts data type

### Field Mapping Not Working

**Problem**: Fields export but don't appear in expected PlentyONE fields

**Solutions**:
1. Verify field mapping configuration:
   - Stores → Configuration → Mage2Plenty → Checkout Fields
   - Check field-to-property mappings

2. Ensure PlentyONE properties exist
3. Check property naming matches configuration
4. Verify property data types are compatible
5. Review PlentyONE order data structure

### Multi-Select Values Issue

**Problem**: Multi-select field exports as single value

**Solutions**:
1. Verify delimiter configuration (comma, semicolon, etc.)
2. Check PlentyONE field accepts multiple values
3. Review value formatting in export logs
4. Ensure proper array-to-string conversion
5. Consider mapping to multiple properties if needed

## Best Practices

### Field Configuration
1. **Meaningful Names**: Use descriptive field codes for easy mapping
2. **Consistent Types**: Standardize field types across store views
3. **Required vs Optional**: Set appropriate validation rules
4. **Field Order**: Organize fields logically in checkout

### Field Mapping
1. **Documentation**: Document which Swissup field maps to which PlentyONE property
2. **Naming Convention**: Use consistent property naming
3. **Data Types**: Match field types to property types
4. **Testing**: Test each field mapping with sample orders

### Order Processing
1. **Test Orders**: Process test orders with various field combinations
2. **Verify Export**: Check first custom field order in PlentyONE
3. **Monitor Logs**: Watch for field-related export issues
4. **Regular Audits**: Periodically verify field values in both systems

### Multi-Store Setup
1. **Store-Specific Fields**: Configure appropriate fields per store
2. **Locale Handling**: Ensure field labels work in all languages
3. **Field Visibility**: Control which fields appear in which stores
4. **Consistent Mapping**: Maintain consistent mapping across stores

## Common Field Types

### Text Input
```yaml
Field: Order Reference
Type: text
Max Length: 50
Export: Order external ID
```

### Textarea
```yaml
Field: Special Instructions
Type: textarea
Rows: 5
Export: Order note 1
```

### Select Dropdown
```yaml
Field: Delivery Time Preference
Type: select
Options: Morning|Afternoon|Evening
Export: Custom delivery time property
```

### Date Picker
```yaml
Field: Desired Delivery Date
Type: date
Format: Y-m-d
Export: Estimated shipping date
```

### Checkbox
```yaml
Field: Subscribe to SMS Updates
Type: checkbox
Export: Boolean custom property
```

## Related Plugins

### Checkout Extensions
- **[Packstation](/docs/extensions/packstation)** - DHL Packstation addresses

### Order Export
- **[Order Export Profile](/docs/profiles/order-export)** - Configure order synchronization
- **[Customer Export Profile](/docs/profiles/customer-export)** - Customer data sync

## Support

### Getting Help

If you encounter issues:

- 📧 **Email**: support@byte8.io
- 📞 **Phone**: +44 2080 587 795 (GMT working hours)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/byte8/mage2plenty/issues)

### Swissup Resources
- **Swissup Documentation**: [docs.swissuplabs.com](https://docs.swissuplabs.com/)
- **Checkout Fields Guide**: Check Swissup docs for field configuration

### Source Code

- **Location**: `/packages/modules/module-plenty-swissup-checkout-fields`
- **License**: OSL-3.0 / AFL-3.0
- **Contributions**: Welcome via pull requests

## Version Information

Check current version:
```bash
composer show byte8/module-plenty-swissup-checkout-fields
```

## Related Documentation

- **[Free Plugins Overview](/docs/extensions/free-plugins)** - All available plugins
- **[Order Export Profile](/docs/profiles/order-export)** - Order synchronization setup
- **[Troubleshooting Orders](/docs/troubleshooting/order-issues)** - Order sync issues

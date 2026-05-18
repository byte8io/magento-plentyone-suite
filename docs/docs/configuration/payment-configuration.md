---
sidebar_position: 5
title: Payment Method Configuration
description: Configure PlentyONE internal payment method for order synchronization
---

# Payment Method Configuration

The PlentyONE payment method is a special internal payment method used when synchronizing orders between Magento and PlentyONE. This configuration allows you to handle orders where payment processing occurs in PlentyONE rather than Magento.

## Overview

The **PlentyONE [internal payment]** method is used for:

- Orders created in PlentyONE that are imported to Magento
- Orders where payment is processed through PlentyONE's payment gateway
- Synchronization scenarios where payment details are managed by PlentyONE
- Manual orders entered directly in PlentyONE

This payment method acts as a placeholder in Magento, indicating that the payment was handled by the PlentyONE system.

:::info Internal Use Only
This payment method is not displayed to customers during checkout. It's an administrative payment method used exclusively for order synchronization between the two systems.
:::

## Accessing Payment Configuration

1. Log in to your Magento Admin panel
2. Navigate to **Stores → Configuration**
3. In the left panel, expand **Sales**
4. Select **Payment Methods**
5. Scroll down to find **PlentyONE [internal payment]** section

:::tip Navigation Path
**Stores → Configuration → Sales → Payment Methods → PlentyONE [internal payment]**
:::

## Configuration Settings

### Enabled

**Field**: `active`
**Path**: `payment/plentyone/active`
**Type**: Yes/No
**Default**: No
**Scope**: Website
**Can Restore**: Yes

Enables or disables the PlentyONE internal payment method.

**Description**: When enabled, orders can be created in Magento using this payment method during synchronization from PlentyONE.

**Configuration Steps**:

1. Navigate to **Stores → Configuration → Sales → Payment Methods**
2. Scroll to **PlentyONE [internal payment]** section
3. Set **Enabled** to **Yes**
4. Click **Save Config**
5. Clear cache: `bin/magento cache:flush`

**When to Enable**:
- ✅ Importing orders from PlentyONE to Magento
- ✅ Using PlentyONE as the payment processor
- ✅ Synchronizing historical orders from PlentyONE
- ✅ Managing orders created in PlentyONE backend

**When to Disable**:
- ❌ Only exporting orders from Magento to PlentyONE (no import)
- ❌ All payments processed exclusively in Magento
- ❌ Not using order import functionality

:::warning Required for Order Import
If you plan to import orders from PlentyONE to Magento, this payment method **must be enabled**. Otherwise, order import will fail with payment method errors.
:::

### New Order Status

**Field**: `order_status`
**Path**: `payment/plentyone/order_status`
**Type**: Select
**Scope**: Website
**Can Restore**: Yes

Determines the initial order status when an order is created with this payment method.

**Description**: When an order is imported from PlentyONE with this payment method, it will be assigned the selected status in Magento.

**Available Statuses**:

Common order statuses include:

| Status | Code | Description | Typical Use |
|--------|------|-------------|-------------|
| Pending | `pending` | Order received, payment pending | Default for new orders |
| Pending Payment | `pending_payment` | Awaiting payment confirmation | Orders awaiting payment |
| Processing | `processing` | Order is being processed | Paid orders ready to ship |
| On Hold | `holded` | Order requires manual review | Suspicious or flagged orders |
| Payment Review | `payment_review` | Payment under review | Fraud detection triggered |

**Recommended Settings**:

```bash
# For paid orders imported from PlentyONE
New Order Status: Processing

# For orders requiring payment verification
New Order Status: Pending Payment

# For orders needing manual review
New Order Status: Payment Review
```

**Configuration Example**:

```bash
# Set order status to Processing for imported orders
bin/magento config:set payment/plentyone/order_status processing

# Or: Set to Pending for manual review
bin/magento config:set payment/plentyone/order_status pending

# Clear cache
bin/magento cache:flush
```

**Order Status Workflow**:

```
PlentyONE Order (Paid) → Import to Magento → Set Status: Processing
                                           ↓
                            Invoice Created (if configured)
                                           ↓
                            Ready for Shipment
```

:::tip Custom Order Statuses
If you have custom order statuses defined in your Magento installation, they will also appear in this dropdown. Choose a status that reflects the actual state of orders imported from PlentyONE.
:::

### Title

**Field**: `title`
**Path**: `payment/plentyone/title`
**Type**: Text
**Default**: "PlentyONE [internal payment]"
**Scope**: Store View
**Can Restore**: Yes

Defines how the payment method is displayed in the Magento admin panel and order details.

**Description**: This title appears in:
- Order detail pages (Admin panel)
- Order grid (payment method column)
- Invoice pages
- Customer order history (if visible)

**Configuration Steps**:

1. Navigate to **Stores → Configuration → Sales → Payment Methods**
2. Scroll to **PlentyONE [internal payment]** section
3. Enter desired title in **Title** field
4. Click **Save Config**

**Recommended Titles**:

```
# Default (clear and descriptive)
PlentyONE [internal payment]

# Shorter version
PlentyONE Payment

# Descriptive version
PlentyONE ERP Payment

# Multi-language support (store view specific)
# English store view:
PlentyONE Payment

# German store view:
PlentyONE Zahlung

# French store view:
Paiement PlentyONE
```

**Multi-Store Configuration**:

If you have multiple store views, you can set different titles per store view:

```bash
# Default (all store views)
bin/magento config:set --scope=default payment/plentyone/title "PlentyONE Payment"

# English store view (store ID 1)
bin/magento config:set --scope=stores --scope-code=default payment/plentyone/title "PlentyONE Payment"

# German store view (store ID 2)
bin/magento config:set --scope=stores --scope-code=german payment/plentyone/title "PlentyONE Zahlung"

# Clear cache
bin/magento cache:flush
```

:::info Store View Scope
The Title field has Store View scope, allowing you to translate the payment method name for different languages/locales.
:::

## Configuration via CLI

### View Current Settings

```bash
# View all PlentyONE payment configuration
bin/magento config:show payment/plentyone

# View specific settings
bin/magento config:show payment/plentyone/active
bin/magento config:show payment/plentyone/order_status
bin/magento config:show payment/plentyone/title
```

### Update Settings

```bash
# Enable PlentyONE payment method
bin/magento config:set payment/plentyone/active 1

# Set order status to Processing
bin/magento config:set payment/plentyone/order_status processing

# Set custom title
bin/magento config:set payment/plentyone/title "PlentyONE Payment Gateway"

# Clear cache
bin/magento cache:flush
```

### Website-Specific Configuration

```bash
# Enable for specific website (website code: base)
bin/magento config:set --scope=websites --scope-code=base payment/plentyone/active 1

# Set order status for specific website
bin/magento config:set --scope=websites --scope-code=base payment/plentyone/order_status processing

# Clear cache
bin/magento cache:flush
```

## Common Use Cases

### Use Case 1: Importing Paid Orders from PlentyONE

**Scenario**: Orders are placed in a marketplace (Amazon, eBay) connected to PlentyONE. You want to import these orders to Magento for fulfillment.

**Configuration**:
```bash
# Enable payment method
bin/magento config:set payment/plentyone/active 1

# Set status to Processing (orders are already paid)
bin/magento config:set payment/plentyone/order_status processing

# Set descriptive title
bin/magento config:set payment/plentyone/title "Marketplace Payment (via PlentyONE)"

bin/magento cache:flush
```

**Result**: Imported orders appear in Magento with "Processing" status, ready for shipment.

### Use Case 2: Synchronizing Historical Orders

**Scenario**: Migrating from another system to Magento, importing historical orders from PlentyONE.

**Configuration**:
```bash
# Enable payment method
bin/magento config:set payment/plentyone/active 1

# Set status to Complete (historical orders already fulfilled)
bin/magento config:set payment/plentyone/order_status complete

# Set title for historical orders
bin/magento config:set payment/plentyone/title "Historical Order (PlentyONE)"

bin/magento cache:flush
```

**Result**: Historical orders imported with "Complete" status for record-keeping.

### Use Case 3: Manual Review Required

**Scenario**: Orders imported from PlentyONE require manual verification before fulfillment.

**Configuration**:
```bash
# Enable payment method
bin/magento config:set payment/plentyone/active 1

# Set status to Payment Review
bin/magento config:set payment/plentyone/order_status payment_review

# Set title indicating review needed
bin/magento config:set payment/plentyone/title "PlentyONE Payment (Pending Review)"

bin/magento cache:flush
```

**Result**: Imported orders require manual review before processing.

## Order Import Workflow

Understanding how the payment method fits into the order import process:

### Step-by-Step Import Process

1. **PlentyONE Order Creation**
   - Order placed in marketplace or PlentyONE
   - Payment processed by marketplace/PlentyONE
   - Order data stored in PlentyONE

2. **Mage2Plenty Order Import Profile Runs**
   - Profile fetches orders from PlentyONE API
   - Order data is mapped to Magento format
   - Payment method set to `plentyone`

3. **Order Creation in Magento**
   - Order created with PlentyONE payment method
   - Order status set based on configuration
   - Customer data synchronized
   - Order items added

4. **Post-Import Processing**
   - Invoice created (if status = Processing)
   - Email notifications sent (if enabled)
   - Order appears in admin grid
   - Ready for fulfillment workflow

### Payment Information Display

In Magento order details, the payment information section will show:

```
Payment Information

Payment Method: PlentyONE Payment
Transaction ID: [PlentyONE Order ID]
Payment Status: Paid
```

## Multi-Website Configuration

For Magento installations with multiple websites:

### Scenario: Different Payment Handling per Website

**Website 1 (B2C)**: Import marketplace orders
**Website 2 (B2B)**: No order import, export only

**Configuration**:

```bash
# Website 1 (B2C) - Enable payment method
bin/magento config:set --scope=websites --scope-code=b2c payment/plentyone/active 1
bin/magento config:set --scope=websites --scope-code=b2c payment/plentyone/order_status processing
bin/magento config:set --scope=websites --scope-code=b2c payment/plentyone/title "Marketplace Payment"

# Website 2 (B2B) - Disable payment method
bin/magento config:set --scope=websites --scope-code=b2b payment/plentyone/active 0

bin/magento cache:flush
```

## Best Practices

### Security

1. **Access Control**: Restrict access to payment configuration
   - Only admin users should modify payment settings
   - Use Magento ACL to control permissions

2. **Audit Trail**: Monitor payment configuration changes
   - Review configuration changes in **System → Actions Logs → Actions Log Report** (Adobe Commerce only)
   - Track changes via version control for `app/etc/config.php`
   - Use `git log` to review configuration file changes

### Order Status Management

1. **Consistent Status Flow**: Ensure status transitions make sense
   ```
   Good Flow:
   Pending Payment → Processing → Complete

   Bad Flow:
   Complete → Pending (confusing)
   ```

2. **Status-Based Automation**: Configure actions based on status
   - Processing → Auto-create invoice
   - Processing → Auto-create shipment
   - Complete → Archive order

3. **Customer Communication**: Configure email templates for each status
   - Pending Payment → "Payment Pending" email
   - Processing → "Order Confirmed" email
   - Complete → "Order Delivered" email

### Testing

1. **Test Import**: Before enabling in production
   ```bash
   # Enable in staging
   bin/magento config:set payment/plentyone/active 1
   bin/magento config:set payment/plentyone/order_status pending_payment

   # Test order import
   bin/magento softcommerce:plenty:order:import --profile-id=1 --limit=1

   # Verify order in admin
   # Check status, payment method, order details
   ```

2. **Validate Order Data**: Ensure imported orders are complete
   - Customer information correct
   - Product details accurate
   - Prices and taxes correct
   - Shipping information complete

## Troubleshooting

### Payment Method Not Available

**Problem**: Cannot see PlentyONE payment method in payment methods list

**Solutions**:
1. Clear cache: `bin/magento cache:flush`
2. Verify module enabled: `bin/magento module:status SoftCommerce_PlentyOrder`
3. Run setup upgrade: `bin/magento setup:upgrade`
4. Check database: `SELECT * FROM core_config_data WHERE path LIKE 'payment/plentyone%'`

### Order Import Fails - Invalid Payment Method

**Problem**: Order import fails with error "Payment method not found"

**Solutions**:
1. Enable payment method: `bin/magento config:set payment/plentyone/active 1`
2. Verify correct website scope: `bin/magento config:show --scope=websites --scope-code=base payment/plentyone/active`
3. Clear cache: `bin/magento cache:flush`
4. Check error logs: `tail -f var/log/softcommerce/plenty/order.log`

### Wrong Order Status After Import

**Problem**: Imported orders have incorrect status

**Solutions**:
1. Verify configuration: `bin/magento config:show payment/plentyone/order_status`
2. Check order status exists: **Stores → Settings → Order Status**
3. Update configuration: `bin/magento config:set payment/plentyone/order_status processing`
4. Test with single order: `bin/magento softcommerce:plenty:order:import --limit=1`

### Payment Title Not Displaying

**Problem**: Payment method title not showing in orders

**Solutions**:
1. Set title: `bin/magento config:set payment/plentyone/title "PlentyONE Payment"`
2. Check store view scope: `bin/magento config:show --scope=stores payment/plentyone/title`
3. Clear cache: `bin/magento cache:flush`
4. Refresh order page in admin

## Advanced Configuration

### Custom Order Status

Create a custom order status specifically for PlentyONE imported orders:

1. **Create Custom Status**:
   - Navigate to **Stores → Settings → Order Status**
   - Click **Create New Status**
   - Status Code: `plentyone_imported`
   - Status Label: `PlentyONE Imported`

2. **Assign to State**:
   - Assign to State: `Processing`
   - Use Order Status as Default: No

3. **Configure Payment Method**:
   ```bash
   bin/magento config:set payment/plentyone/order_status plentyone_imported
   bin/magento cache:flush
   ```

### Programmatic Configuration

For deployment automation, include payment configuration in `app/etc/config.php`:

```php
return [
    // ... other config ...
    'default' => [
        'payment' => [
            'plentyone' => [
                'active' => '1',
                'order_status' => 'processing',
                'title' => 'PlentyONE Payment'
            ]
        ]
    ]
];
```

## Integration with Other Modules

### Payment Method Mapping

When exporting orders from Magento to PlentyONE, the PlentyONE payment method needs to be mapped to a PlentyONE payment method ID.

Configure in **Profile → Order Export → Payment Method Mapping**:

| Magento Payment Method | PlentyONE Payment Method ID |
|------------------------|----------------------------|
| plentyone | 1 (Cash) or appropriate ID |

### Invoice Generation

Configure automatic invoice creation for PlentyONE payment:

1. Navigate to **Stores → Configuration → Sales → Sales**
2. Expand **Invoice and Packing Slip Design**
3. For payment method `plentyone`, enable auto-invoice

Or via CLI:
```bash
# Configure invoice creation
bin/magento config:set sales/orders/plentyone_auto_invoice 1
bin/magento cache:flush
```

## Next Steps

Now that you've configured the payment method:

1. 🛒 **[Order Import Profile](/docs/profiles/order-import)** - Set up order import from PlentyONE
2. 📊 **[Order Export Profile](/docs/profiles/order-export)** - Configure order export to PlentyONE
3. 🔄 **[Payment Mapping](/docs/mapping/payment-methods)** - Map Magento payment methods to PlentyONE
4. ✅ **[Test Order Sync](/docs/testing/order-synchronization)** - Verify order import/export

## Related Documentation

- [Configuration Overview](/docs/configuration/overview)
- [Order Import Profile](/docs/profiles/order-import)
- [Order Export Profile](/docs/profiles/order-export)
- [Troubleshooting Orders](/docs/troubleshooting/order-issues)
- [Payment Method Mapping](/docs/mapping/payment-methods)

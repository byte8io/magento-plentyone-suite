---
sidebar_position: 2
title: Payment & Shipping Method Mapping
description: Map Magento payment and shipping methods to PlentyONE
---

# Payment & Shipping Method Mapping

Proper payment and shipping method mapping is crucial for successful order synchronization. This guide covers how to configure mappings for both payment and shipping methods.

## Payment Method Mapping

### Understanding Payment Methods

**Magento Payment Methods:**
- Identified by method code (e.g., `checkmo`, `paypal_express`)
- Each order has one payment method
- Custom payment methods possible via extensions

**PlentyONE Payment Methods:**
- Identified by numeric ID
- Predefined list in PlentyONE
- Cannot create custom payment methods via API

### Common Payment Method IDs

| PlentyONE ID | Payment Method | Common Magento Codes |
|--------------|----------------|----------------------|
| 1 | Invoice | `checkmo`, `cashondelivery` |
| 2 | Cash in Advance | `banktransfer`, `cashondelivery` |
| 3 | Cash on Delivery | `cashondelivery` |
| 4 | PayPal | `paypal_express`, `paypal_standard` |
| 5 | Direct Debit | `directdebit`, `sepa_debit` |
| 6 | Credit Card | `stripe_payments`, `authnetcim`, `braintree` |
| 7 | Amazon Pay | `amazon_payment`, `amazon_payment_v2` |
| 8 | Klarna | `klarna_kp`, `klarna_slice_it` |
| 9 | Sofort | `sofort`, `sofort_uberweisung` |
| 10 | Payment in Advance | `banktransfer` |

### Collect Available Payment Methods

```bash
# Collect payment methods from PlentyONE
bin/magento plenty:setup:collect:config --type=payment --verbose

# Output:
# ✓ Collected 12 payment methods
# ✓ Stored in plenty_client_config table

# View collected payment methods
mysql> SELECT * FROM plenty_client_config WHERE config_source = 'payment_method';
```

### Configure Payment Method Mapping

#### Via Admin Panel

1. Navigate to **SoftCommerce → Profiles → Manage Profiles**
2. Select your **Order Export** profile
3. Go to **Configuration → Payment Method Mapping**
4. Map each Magento payment method to PlentyONE payment method ID

**Example configuration:**

| Magento Method Code | Magento Method Title | PlentyONE Method ID | PlentyONE Method Name |
|---------------------|----------------------|---------------------|-----------------------|
| `checkmo` | Check / Money Order | 1 | Invoice |
| `cashondelivery` | Cash on Delivery | 3 | Cash on Delivery |
| `paypal_express` | PayPal Express | 4 | PayPal |
| `stripe_payments` | Credit Card (Stripe) | 6 | Credit Card |
| `banktransfer` | Bank Transfer | 10 | Payment in Advance |

#### Via Configuration

```php
// In profile configuration
'payment_method_mapping' => [
    'checkmo' => 1,              // Invoice
    'cashondelivery' => 3,       // Cash on Delivery
    'paypal_express' => 4,       // PayPal
    'paypal_standard' => 4,      // PayPal (alternate method)
    'stripe_payments' => 6,      // Credit Card
    'authnetcim' => 6,           // Credit Card (Authorize.net)
    'braintree' => 6,            // Credit Card (Braintree)
    'banktransfer' => 10,        // Payment in Advance
    'amazon_payment' => 7,       // Amazon Pay
    'klarna_kp' => 8,            // Klarna
    'sofort' => 9                // Sofort
]
```

### Payment Method Mapping Examples

#### Standard Magento Payment Methods

```php
'payment_method_mapping' => [
    // Check/Money Order → Invoice
    'checkmo' => 1,

    // Bank Transfer → Payment in Advance
    'banktransfer' => 10,

    // Cash on Delivery → Cash on Delivery
    'cashondelivery' => 3,

    // Purchase Order → Invoice
    'purchaseorder' => 1,

    // Zero Subtotal (Free) → Invoice
    'free' => 1
]
```

#### Third-Party Payment Extensions

```php
'payment_method_mapping' => [
    // PayPal
    'paypal_express' => 4,
    'paypal_standard' => 4,
    'payflowpro' => 4,

    // Stripe
    'stripe_payments' => 6,
    'stripe_checkout' => 6,

    // Braintree
    'braintree' => 6,
    'braintree_paypal' => 4,

    // Authorize.net
    'authnetcim' => 6,

    // Amazon
    'amazon_payment' => 7,
    'amazon_payment_v2' => 7,

    // Klarna
    'klarna_kp' => 8,
    'klarna_slice_it' => 8,

    // Adyen
    'adyen_cc' => 6,
    'adyen_hpp' => 6
]
```

### Testing Payment Method Mapping

```bash
# Export test order with specific payment method
bin/magento plenty:order:export -i 100 --verbose

# Check payment method in logs
tail -f var/log/plenty_order.log | grep "payment_method"

# Verify in PlentyONE backend
# Orders → Order UI → [Order] → Payment tab
```

### Troubleshooting Payment Mapping

#### Issue: "Payment Method Not Mapped"

**Error:**
```
Error: Payment method 'stripe_payments' is not mapped
Cannot create payment record
```

**Solution:**

1. Check current mappings:
   ```bash
   bin/magento profile:export:config --profile=order_export | grep payment_method_mapping
   ```

2. Add missing mapping via Admin or configuration

3. Verify mapping applied:
   ```bash
   bin/magento cache:flush
   bin/magento plenty:order:export -i 100 --verbose
   ```

#### Issue: Wrong Payment Method Created

**Cause:** Incorrect mapping configuration

**Solution:**

1. Verify Magento payment method code:
   ```sql
   SELECT method FROM sales_order_payment WHERE parent_id = 100;
   ```

2. Check PlentyONE payment method ID:
   ```sql
   SELECT * FROM plenty_client_config WHERE config_source = 'payment_method';
   ```

3. Update mapping to use correct ID

## Shipping Method Mapping

### Understanding Shipping Methods

**Magento Shipping Methods:**
- Format: `carrier_method` (e.g., `flatrate_flatrate`)
- Multiple methods per carrier possible
- Custom carriers via extensions

**PlentyONE Shipping Profiles:**
- Numeric ID
- Configured in PlentyONE backend
- Define carriers, services, and costs

### Collect Shipping Profiles

```bash
# Collect shipping profiles from PlentyONE
bin/magento plenty:setup:collect:config --type=shipping --verbose

# Output:
# ✓ Collected 8 shipping profiles
# ✓ Stored in plenty_client_config table

# View collected shipping profiles
mysql> SELECT * FROM plenty_client_config WHERE config_source = 'shipping_profile';

# Example output (config_data contains JSON with id and name):
# +-----+------------------+--------------------------------------------------------+
# | id  | config_source    | config_data                                            |
# +-----+------------------+--------------------------------------------------------+
# | 1   | shipping_profile | {"id":1,"name":"Standard Shipping"}                    |
# | 2   | shipping_profile | {"id":2,"name":"Express Shipping"}                     |
# | 3   | shipping_profile | {"id":3,"name":"Free Shipping"}                        |
# | 4   | shipping_profile | {"id":4,"name":"DHL Standard"}                         |
# | 5   | shipping_profile | {"id":5,"name":"DHL Express"}                          |
# | 6   | shipping_profile | {"id":6,"name":"UPS Ground"}                           |
# | 7   | shipping_profile | {"id":7,"name":"FedEx 2-Day"}                          |
# | 8   | shipping_profile | {"id":8,"name":"USPS Priority"}                        |
# +-----+------------------+--------------------------------------------------------+
```

### Configure Shipping Method Mapping

#### Via Admin Panel

1. Navigate to **SoftCommerce → Profiles → Manage Profiles**
2. Select your **Order Export** profile
3. Go to **Configuration → Shipping Method Mapping**
4. Map each Magento shipping method to PlentyONE shipping profile ID

**Example configuration:**

| Magento Method | Magento Title | PlentyONE Profile ID | PlentyONE Profile Name |
|----------------|---------------|----------------------|------------------------|
| `flatrate_flatrate` | Flat Rate | 1 | Standard Shipping |
| `tablerate_bestway` | Best Way | 2 | Express Shipping |
| `freeshipping_freeshipping` | Free Shipping | 3 | Free Shipping |
| `dhl_standard` | DHL Standard | 4 | DHL Standard |
| `dhl_express` | DHL Express | 5 | DHL Express |
| `ups_GND` | UPS Ground | 6 | UPS Ground |
| `fedex_FEDEX_2_DAY` | FedEx 2-Day | 7 | FedEx 2-Day |

#### Via Configuration

```php
'shipping_method_mapping' => [
    'flatrate_flatrate' => 1,           // Standard Shipping
    'tablerate_bestway' => 2,           // Express Shipping
    'freeshipping_freeshipping' => 3,   // Free Shipping
    'dhl_standard' => 4,                // DHL Standard
    'dhl_express' => 5,                 // DHL Express
    'ups_GND' => 6,                     // UPS Ground
    'fedex_FEDEX_2_DAY' => 7,           // FedEx 2-Day
    'usps_0_FCLE' => 8                  // USPS Priority
]
```

### Shipping Method Mapping Examples

#### Standard Magento Shipping

```php
'shipping_method_mapping' => [
    // Flat Rate → Standard Shipping
    'flatrate_flatrate' => 1,

    // Table Rate → Best Way
    'tablerate_bestway' => 1,

    // Free Shipping → Free Shipping
    'freeshipping_freeshipping' => 3,

    // Store Pickup → Pickup
    'instore_pickup' => 10
]
```

#### Carrier-Specific Shipping

```php
'shipping_method_mapping' => [
    // DHL
    'dhl_standard' => 4,
    'dhl_express' => 5,
    'dhl_worldwide' => 5,

    // UPS
    'ups_01' => 6,        // UPS Next Day
    'ups_02' => 6,        // UPS 2nd Day
    'ups_03' => 6,        // UPS Ground
    'ups_GND' => 6,       // UPS Ground

    // FedEx
    'fedex_FEDEX_2_DAY' => 7,
    'fedex_FEDEX_GROUND' => 6,
    'fedex_PRIORITY_OVERNIGHT' => 5,

    // USPS
    'usps_0_FCLE' => 8,        // First-Class
    'usps_1' => 8,              // Priority Mail
    'usps_4' => 8               // Parcel Post
]
```

### Shipping Carrier Mapping

Map Magento carrier codes to PlentyONE carrier IDs (for tracking):

```php
'carrier_mapping' => [
    'dhl' => 1,       // DHL
    'ups' => 2,       // UPS
    'usps' => 3,      // USPS
    'fedex' => 4,     // FedEx
    'dhlexpress' => 1, // DHL Express
    'dpd' => 5,       // DPD
    'gls' => 6,       // GLS
    'hermes' => 7     // Hermes
]
```

### Testing Shipping Method Mapping

```bash
# Export order with specific shipping method
bin/magento plenty:order:export -i 100 --verbose

# Check shipping method in logs
tail -f var/log/plenty_order.log | grep "shipping_method"

# Verify in PlentyONE backend
# Orders → Order UI → [Order] → Shipping tab
```

### Troubleshooting Shipping Mapping

#### Issue: "Shipping Method Not Mapped"

**Error:**
```
Error: Shipping method 'ups_GND' is not mapped
Order export incomplete
```

**Solution:**

1. Get shipping method from order:
   ```sql
   SELECT shipping_method FROM sales_order WHERE entity_id = 100;
   ```

2. Add to mapping configuration

3. Verify shipping profile exists:
   ```sql
   SELECT * FROM plenty_client_config WHERE config_source = 'shipping_profile';
   ```

#### Issue: Wrong Shipping Profile Assigned

**Cause:** Incorrect ID in mapping

**Solution:**

1. Check available shipping profiles:
   ```bash
   bin/magento plenty:setup:collect:config --type=shipping --verbose
   ```

2. Update mapping with correct profile ID

3. Re-export order:
   ```bash
   bin/magento plenty:order:export -i 100 --force --verbose
   ```

## Advanced Mapping

### Fallback Mapping

Configure default methods for unmapped cases:

```php
'payment_method_mapping' => [
    // ... specific mappings ...
    '_default' => 1  // Default to Invoice if no mapping found
],

'shipping_method_mapping' => [
    // ... specific mappings ...
    '_default' => 1  // Default to Standard Shipping
]
```

### Conditional Mapping

Map based on order conditions:

```php
'conditional_shipping_mapping' => [
    'rules' => [
        [
            'condition' => 'order_total > 100',
            'shipping_method' => 'freeshipping_freeshipping',
            'plenty_profile_id' => 3
        ],
        [
            'condition' => 'country_id = "US"',
            'carrier' => 'ups',
            'plenty_profile_id' => 6
        ]
    ]
]
```

### Multi-Store Mapping

Different mappings per store view:

```php
'store_specific_mapping' => [
    'payment' => [
        1 => [  // Store ID 1 (US Store)
            'stripe_payments' => 6,
            'paypal_express' => 4
        ],
        2 => [  // Store ID 2 (DE Store)
            'stripe_payments' => 6,
            'sofort' => 9,
            'klarna_kp' => 8
        ]
    ],
    'shipping' => [
        1 => [  // US Store
            'ups_GND' => 6,
            'fedex_FEDEX_2_DAY' => 7
        ],
        2 => [  // DE Store
            'dhl_standard' => 4,
            'dhl_express' => 5
        ]
    ]
]
```

## Order Status Mapping

### Magento to PlentyONE Status Mapping

Map Magento order statuses to PlentyONE order statuses:

```php
'order_status_mapping' => [
    'export' => [  // Magento → PlentyONE
        'pending' => '3.0',           // New order
        'processing' => '5.0',        // In process
        'complete' => '7.0',          // Completed
        'canceled' => '8.0',          // Cancelled
        'holded' => '4.5',            // On hold
        'closed' => '7.0'             // Completed
    ],
    'import' => [  // PlentyONE → Magento
        '3.0' => 'pending',           // New
        '5.0' => 'processing',        // In process
        '7.0' => 'complete',          // Shipped
        '7.5' => 'complete',          // Delivered
        '8.0' => 'canceled',          // Cancelled
        '9.0' => 'complete'           // Completed
    ]
]
```

### Status Mapping Configuration

1. **SoftCommerce → Profiles → Manage Profiles → [Order Profile]**
2. **Configuration → Status Mapping**
3. Map each status bidirectionally

**Common PlentyONE Status IDs:**

| Status ID | Status Name | Recommended Magento Status |
|-----------|-------------|----------------------------|
| 1.0 | [1] Incomplete data | pending |
| 3.0 | [3] Waiting for payment | pending_payment |
| 4.0 | [4] In preparation for shipping | processing |
| 5.0 | [5] Cleared for shipping | processing |
| 7.0 | [7] Outgoing items booked | complete |
| 8.0 | [8] Cancelled | canceled |
| 9.0 | [9] Return | complete |

## Validation and Testing

### Validate Mapping Configuration

```bash
# Check for unmapped methods
mysql> SELECT DISTINCT method FROM sales_order_payment
WHERE method NOT IN (
    SELECT DISTINCT config_value FROM core_config_data
    WHERE path LIKE '%payment_method_mapping%'
);

mysql> SELECT DISTINCT shipping_method FROM sales_order
WHERE shipping_method NOT IN (
    SELECT DISTINCT config_value FROM core_config_data
    WHERE path LIKE '%shipping_method_mapping%'
);
```

### Test Complete Order Flow

```bash
# 1. Create test order with specific payment/shipping
# Via Magento frontend or admin

# 2. Export order
bin/magento plenty:order:export --increment_id=000000123 --verbose

# 3. Verify in PlentyONE
# Check payment method, shipping profile, and status

# 4. Update status in PlentyONE

# 5. Import updates
bin/magento plenty:order:collect --date-updated="$(date +%Y-%m-%d)"
bin/magento plenty:order:import --verbose

# 6. Verify status updated in Magento
```

## Best Practices

1. **Map All Methods:**
   - Ensure every payment method is mapped
   - Map all active shipping methods
   - Use fallback mappings for safety

2. **Document Mappings:**
   - Keep mapping documentation current
   - Note any custom or non-standard mappings
   - Version control configuration

3. **Test Thoroughly:**
   - Test each payment method
   - Test each shipping method
   - Test all status transitions

4. **Monitor Unmapped Methods:**
   - Set up alerts for unmapped methods
   - Review logs for "not mapped" errors
   - Add new methods proactively

5. **Keep Synchronized:**
   - Re-collect after PlentyONE changes
   - Update mappings when adding new methods
   - Test after configuration changes

6. **Use Meaningful IDs:**
   - Verify PlentyONE IDs before mapping
   - Don't guess - always confirm
   - Document ID sources

## Maintenance

### Update Mappings

```bash
# Re-collect after PlentyONE changes
bin/magento plenty:setup:collect:config --type=payment,shipping --verbose

# Update mapping in profile configuration

# Clear cache
bin/magento cache:flush

# Test with sample order
bin/magento plenty:order:export -i 100 --verbose
```

### Audit Mappings

```sql
-- Find unmapped payment methods (last 30 days)
SELECT DISTINCT sop.method, COUNT(*) as order_count
FROM sales_order_payment sop
JOIN sales_order so ON sop.parent_id = so.entity_id
WHERE so.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY sop.method
ORDER BY order_count DESC;

-- Find unmapped shipping methods
SELECT DISTINCT shipping_method, COUNT(*) as order_count
FROM sales_order
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY shipping_method
ORDER BY order_count DESC;
```

## Related Documentation

- **[Order Synchronization Testing](/docs/testing/order-synchronization)** - Test order sync
- **[Order Issues](/docs/troubleshooting/order-issues)** - Troubleshoot order problems
- **[First Synchronization](/docs/testing/first-sync)** - Initial sync guide
- **[Profile Configuration](/docs/profiles/create-profile)** - Configure profiles

---

**Pro Tip:** Create a mapping reference sheet for your team showing all active payment and shipping methods with their corresponding PlentyONE IDs. Update it whenever you add new methods to keep everyone aligned.
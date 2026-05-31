---
sidebar_position: 3
title: Product Type & Variation Mapping
description: Map complex product types and variations between Magento and PlentyONE
---

# Product Type & Variation Mapping

This guide focuses on mapping complex product types and variations between Magento and PlentyONE, including configurable products, bundles, and product variations.

## Product Type Overview

### Magento Product Types

| Type | Description | PlentyONE Equivalent |
|------|-------------|----------------------|
| **Simple** | Single product, no options | Item with single variation |
| **Configurable** | Product with options (size, color) | Item with multiple variations |
| **Bundle** | Set of products sold together | Item bundle |
| **Grouped** | Related products displayed together | Not directly supported |
| **Virtual** | Non-physical product | Item with virtual flag |
| **Downloadable** | Digital product | Item with download |

### PlentyONE Product Structure

```
Item (Main Product)
├─ Variation 1 (Main Variation - required)
│  ├─ Attributes (size, color, etc.)
│  ├─ Barcode
│  ├─ Price
│  └─ Stock
├─ Variation 2
│  ├─ Attributes
│  ├─ Barcode
│  ├─ Price
│  └─ Stock
└─ ...
```

**Key Concepts:**
- Every item must have at least one **main variation**
- Variations are defined by attribute combinations
- Each variation has its own SKU, price, and stock

## Simple Product Mapping

### Magento Simple Product

```php
// Magento simple product
SKU: SHIRT-001
Name: Basic T-Shirt
Price: $19.99
Stock: 100
```

### PlentyONE Mapping

```json
{
  "item": {
    "id": 100,
    "texts": {
      "name": "Basic T-Shirt"
    },
    "variations": [
      {
        "id": 1000,
        "number": "SHIRT-001",
        "isMain": true,
        "prices": [
          {
            "price": 19.99
          }
        ],
        "stock": [
          {
            "stockNet": 100
          }
        ]
      }
    ]
  }
}
```

**Synchronization:**
```bash
# Export simple product
bin/magento plenty:item:export --sku=SHIRT-001 --verbose

# Output:
# ✓ Created item 100
# ✓ Created main variation 1000
# ✓ Set price: $19.99
# ✓ Set stock: 100
```

## Configurable Product Mapping

### Understanding Configurable Products

**Magento Configurable:**
- Parent product (configurable)
- Child products (simple) for each combination
- Configurable attributes (size, color)

**PlentyONE Equivalent:**
- Single item
- Multiple variations (one per combination)
- Variation attributes

### Example: Configurable Product with Size and Color

**Magento Structure:**

```
Parent: SHIRT-CONF (Configurable)
├─ Child: SHIRT-CONF-S-RED (Simple - Size S, Red)
├─ Child: SHIRT-CONF-S-BLUE (Simple - Size S, Blue)
├─ Child: SHIRT-CONF-M-RED (Simple - Size M, Red)
├─ Child: SHIRT-CONF-M-BLUE (Simple - Size M, Blue)
├─ Child: SHIRT-CONF-L-RED (Simple - Size L, Red)
└─ Child: SHIRT-CONF-L-BLUE (Simple - Size L, Blue)
```

**PlentyONE Structure:**

```json
{
  "item": {
    "id": 101,
    "texts": {
      "name": "Configurable T-Shirt"
    },
    "variations": [
      {
        "id": 1001,
        "number": "SHIRT-CONF-S-RED",
        "isMain": true,
        "variationAttributes": [
          {"attributeId": 1, "valueId": 1},  // Size: S
          {"attributeId": 2, "valueId": 10}  // Color: Red
        ]
      },
      {
        "id": 1002,
        "number": "SHIRT-CONF-S-BLUE",
        "isMain": false,
        "variationAttributes": [
          {"attributeId": 1, "valueId": 1},  // Size: S
          {"attributeId": 2, "valueId": 11}  // Color: Blue
        ]
      }
      // ... more variations
    ]
  }
}
```

### Configurable Attribute Mapping

#### Step 1: Export Attributes

```bash
# Export configurable attributes to PlentyONE
bin/magento plenty:attribute:export --attribute=size --verbose
bin/magento plenty:attribute:export --attribute=color --verbose

# Output:
# ✓ Created attribute: size (ID: 1)
#   ✓ Created value: S (ID: 1)
#   ✓ Created value: M (ID: 2)
#   ✓ Created value: L (ID: 3)
# ✓ Created attribute: color (ID: 2)
#   ✓ Created value: Red (ID: 10)
#   ✓ Created value: Blue (ID: 11)
#   ✓ Created value: Green (ID: 12)
```

#### Step 2: Configure Attribute Mapping

```php
'configurable_attribute_mapping' => [
    'size' => [
        'plenty_attribute_id' => 1,
        'value_mapping' => [
            'S' => 1,
            'M' => 2,
            'L' => 3,
            'XL' => 4
        ]
    ],
    'color' => [
        'plenty_attribute_id' => 2,
        'value_mapping' => [
            'Red' => 10,
            'Blue' => 11,
            'Green' => 12,
            'Black' => 13,
            'White' => 14
        ]
    ]
]
```

#### Step 3: Export Configurable Product

```bash
# Export configurable product with all variations
bin/magento plenty:item:export --sku=SHIRT-CONF --verbose

# Output:
# ✓ Created item 101
# ✓ Created main variation 1001 (S, Red)
# ✓ Created variation 1002 (S, Blue)
# ✓ Created variation 1003 (M, Red)
# ✓ Created variation 1004 (M, Blue)
# ✓ Created variation 1005 (L, Red)
# ✓ Created variation 1006 (L, Blue)
# ✓ Linked variations to attributes
```

### Configurable Product Configuration

```php
'configurable_product_config' => [
    // Export strategy
    'export_children_as_variations' => true,  // Default: true
    'create_main_variation_from' => 'first_child',  // or 'parent'

    // Attribute handling
    'inherit_parent_attributes' => [
        'name',
        'description',
        'short_description',
        'brand',
        'manufacturer'
    ],

    // Variation-specific attributes
    'variation_attributes' => [
        'size',
        'color',
        'sku',
        'price',
        'weight',
        'barcode'
    ],

    // Main variation selection
    'main_variation_rules' => [
        'lowest_price' => false,
        'most_stock' => false,
        'specific_attributes' => [
            'size' => 'M',
            'color' => 'Red'
        ]
    ]
]
```

## Bundle Product Mapping

### Magento Bundle Product

```php
// Bundle: Camping Kit
Parent: CAMP-KIT-001 (Bundle)
├─ Item 1: TENT-001 (Simple) x 1
├─ Item 2: SLEEP-BAG-001 (Simple) x 2
└─ Item 3: LANTERN-001 (Simple) x 1
```

### PlentyONE Bundle

```json
{
  "item": {
    "id": 102,
    "itemType": "bundle",
    "texts": {
      "name": "Camping Kit"
    },
    "variations": [
      {
        "id": 1010,
        "number": "CAMP-KIT-001",
        "isMain": true,
        "bundleComponents": [
          {
            "componentVariationId": 100,
            "quantity": 1
          },
          {
            "componentVariationId": 101,
            "quantity": 2
          },
          {
            "componentVariationId": 102,
            "quantity": 1
          }
        ]
      }
    ]
  }
}
```

### Export Bundle Product

```bash
# Ensure component products are exported first
bin/magento plenty:item:export --sku=TENT-001 --verbose
bin/magento plenty:item:export --sku=SLEEP-BAG-001 --verbose
bin/magento plenty:item:export --sku=LANTERN-001 --verbose

# Export bundle product
bin/magento plenty:item:export --sku=CAMP-KIT-001 --verbose

# Output:
# ✓ Created bundle item 102
# ✓ Created main variation 1010
# ✓ Added component: TENT-001 (qty: 1)
# ✓ Added component: SLEEP-BAG-001 (qty: 2)
# ✓ Added component: LANTERN-001 (qty: 1)
```

### Bundle Configuration

```php
'bundle_product_config' => [
    // Export components first
    'auto_export_components' => true,

    // Bundle pricing
    'price_calculation' => 'sum_of_components',  // or 'fixed'

    // Stock handling
    'stock_calculation' => 'minimum_component',  // or 'independent'

    // Component options
    'export_optional_components' => true,
    'export_component_quantities' => true
]
```

## Variation Attribute Mapping

### Define Variation Attributes

Variation attributes differentiate variations of the same product:

```php
'variation_attributes' => [
    'size' => [
        'plenty_attribute_id' => 1,
        'is_variation_defining' => true,
        'values' => [
            'XS' => 1,
            'S' => 2,
            'M' => 3,
            'L' => 4,
            'XL' => 5,
            'XXL' => 6
        ]
    ],
    'color' => [
        'plenty_attribute_id' => 2,
        'is_variation_defining' => true,
        'values' => [
            'Red' => 10,
            'Blue' => 11,
            'Green' => 12,
            'Yellow' => 13,
            'Black' => 14,
            'White' => 15
        ]
    ],
    'material' => [
        'plenty_attribute_id' => 3,
        'is_variation_defining' => false,  // Not a variation attribute
        'is_property' => true               // Regular property instead
    ]
]
```

### Variation Naming

Configure how variation names/numbers are generated:

```php
'variation_naming' => [
    'pattern' => '{parent_sku}-{size}-{color}',
    'separator' => '-',
    'lowercase' => false,
    'replace_spaces' => true
]

// Examples:
// SHIRT-001 + Size: L + Color: Red = SHIRT-001-L-Red
// SHOE-100 + Size: 42 + Color: Black = SHOE-100-42-Black
```

## Special Product Types

### Virtual Products

```php
'virtual_product_config' => [
    'mark_as_virtual' => true,
    'skip_shipping_profile' => true,
    'stock_handling' => 'unlimited'  // or 'managed'
]
```

**Export:**
```bash
bin/magento plenty:item:export --sku=VIRTUAL-001 --verbose

# Output:
# ✓ Created item 103 (virtual)
# ✓ Disabled shipping requirement
# ✓ Set unlimited stock
```

### Downloadable Products

```php
'downloadable_product_config' => [
    'export_as_digital' => true,
    'include_download_links' => true,
    'property_for_download_url' => 104
]
```

### Grouped Products

**Note:** Grouped products are not directly supported by PlentyONE.

**Options:**
1. **Export as related items:**
   ```php
   'grouped_product_handling' => 'export_as_related'
   ```

2. **Export as bundle:**
   ```php
   'grouped_product_handling' => 'convert_to_bundle'
   ```

3. **Skip export:**
   ```php
   'grouped_product_handling' => 'skip'
   ```

## SKU and Barcode Mapping

### SKU Mapping

```php
'sku_mapping' => [
    // Magento SKU → PlentyONE Variation Number
    'magento_attribute' => 'sku',
    'plenty_field' => 'variations.number',

    // SKU transformation
    'transform' => [
        'remove_prefix' => 'MAG-',
        'add_prefix' => 'PLENTY-',
        'uppercase' => false
    ]
]
```

### Barcode Mapping

```php
'barcode_mapping' => [
    'gtin' => [
        'magento_attribute' => 'gtin',
        'plenty_barcode_type' => 'GTIN',
        'plenty_barcode_id' => 1
    ],
    'ean' => [
        'magento_attribute' => 'ean',
        'plenty_barcode_type' => 'EAN',
        'plenty_barcode_id' => 2
    ],
    'upc' => [
        'magento_attribute' => 'upc',
        'plenty_barcode_type' => 'UPC',
        'plenty_barcode_id' => 3
    ],
    'isbn' => [
        'magento_attribute' => 'isbn',
        'plenty_barcode_type' => 'ISBN',
        'plenty_barcode_id' => 4
    ]
]
```

**Export barcodes:**
```bash
bin/magento plenty:item:export --sku=PRODUCT-001 --verbose

# Output:
# ✓ Created variation 1020
# ✓ Added barcode GTIN: 1234567890123
# ✓ Added barcode EAN: 4012345678901
```

## Testing Product Type Mapping

### Test Simple Product

```bash
bin/magento plenty:item:export --sku=SIMPLE-001 --verbose

# Verify:
# - Item created
# - Single main variation
# - Correct price and stock
```

### Test Configurable Product

```bash
bin/magento plenty:item:export --sku=CONFIG-001 --verbose

# Verify:
# - Item created with all variations
# - Attributes linked correctly
# - Each variation has unique SKU
# - Prices and stock per variation
```

### Test Bundle Product

```bash
bin/magento plenty:item:export --sku=BUNDLE-001 --verbose

# Verify:
# - Bundle item created
# - All components present
# - Quantities correct
# - Price calculation correct
```

### Verification Queries

```sql
-- Check variation mapping
SELECT
    p.sku,
    pr.plenty_item_id,
    pr.plenty_variation_id,
    pr.variation_attributes
FROM catalog_product_entity p
JOIN plenty_item_relation pr ON p.entity_id = pr.magento_product_id
WHERE p.sku = 'CONFIG-001';

-- Check attribute mapping
SELECT
    pv.plenty_variation_id,
    pv.attribute_id,
    pv.attribute_value_id,
    pa.attribute_code
FROM plenty_item_variation_attribute pv
JOIN plenty_attribute_entity pa ON pv.attribute_id = pa.plenty_attribute_id
WHERE pv.plenty_item_id = 101;
```

## Troubleshooting Product Mapping

### Issue: Variations Not Created

**Cause:** Missing attribute mapping or invalid attribute values.

**Solution:**
```bash
# Check attribute mapping
bin/magento plenty:attribute:collect --verbose

# View attribute mapping
mysql> SELECT * FROM plenty_attribute_entity WHERE magento_attribute_code IN ('size', 'color');

# Re-export with debug
bin/magento plenty:item:export --sku=CONFIG-001 --verbose --debug
```

### Issue: Main Variation Not Set

**Cause:** No variation marked as main.

**Solution:**
```php
// Configure main variation selection
'main_variation_rules' => [
    'first_child' => true  // Use first variation as main
]
```

### Issue: Bundle Components Missing

**Cause:** Component products not exported yet.

**Solution:**
```bash
# Export components first
bin/magento plenty:item:export --sku=COMPONENT-1,COMPONENT-2,COMPONENT-3

# Then export bundle
bin/magento plenty:item:export --sku=BUNDLE-001
```

## Best Practices

1. **Export Attributes First:**
   ```bash
   bin/magento plenty:attribute:collect
   bin/magento plenty:attribute:export
   ```

2. **Test with Simple Products:**
   - Verify basic mapping works
   - Then progress to complex types

3. **Map Configurable Attributes Explicitly:**
   - Don't rely on automatic detection
   - Define value mappings clearly

4. **Export Components Before Bundles:**
   - Ensure all components exist
   - Verify component variations

5. **Use Consistent SKU Patterns:**
   - Makes troubleshooting easier
   - Enables batch operations

6. **Monitor Variation Count:**
   - Large number of variations (>100) may cause performance issues
   - Consider splitting into multiple items

7. **Document Custom Mappings:**
   - Keep mapping documentation updated
   - Note any special handling

## Related Documentation

- **[Attribute Mapping](/docs/mapping/attributes)** - General attribute mapping
- **[First Synchronization](/docs/testing/first-sync)** - Initial sync guide
- **[Profile Configuration](/docs/profiles/create-profile)** - Configure profiles
- **[Troubleshooting](/docs/troubleshooting/common-issues)** - Common issues

---

**Pro Tip:** When working with configurable products, export a single configurable product with 2-3 variations first. Verify the structure in PlentyONE before exporting your entire catalog. This helps catch mapping issues early when they're easier to fix.
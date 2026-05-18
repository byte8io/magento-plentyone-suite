---
sidebar_position: 8
title: PlentyONE Storefront Plugin
description: Display PlentyONE data directly in Magento storefront
---

# PlentyONE Storefront Plugin

The **PlentyONE Storefront plugin** enables direct display of PlentyONE data on your Magento storefront, providing real-time inventory information, availability status, and other ERP data to customers.

## Overview

**Package**: `softcommerce/module-plenty-storefront`
**Category**: Frontend & Display
**License**: OSL-3.0 / AFL-3.0
**Status**: Production Ready

## Features

- **Real-Time Stock Display**: Show PlentyONE stock levels on product pages
- **Warehouse Availability**: Display stock availability by warehouse
- **Delivery Time**: Show estimated delivery times from PlentyONE
- **Stock Status**: Real-time stock status (In Stock, Low Stock, Out of Stock)
- **Multi-Source Display**: Show inventory across multiple PlentyONE warehouses
- **Custom Attributes**: Display PlentyONE properties on product pages

## Use Cases

### Real-Time Stock Display
**Scenario**: Show accurate stock levels from PlentyONE

**Frontend Display**:
```
Product: Blue T-Shirt (Size M)
Stock: 47 units available
Status: In Stock
Warehouse: Main Warehouse (35), Outlet (12)
```

**Plugin Action**:
- Fetches current stock from PlentyONE API
- Displays aggregated stock levels
- Shows warehouse breakdown
- Updates in real-time or cached intervals

### Delivery Time Estimation
**Scenario**: Display estimated delivery based on PlentyONE data

**Frontend Display**:
```
Product: Gaming Laptop
Availability: In Stock
Estimated Delivery: 2-3 business days
Ships From: Central Warehouse
```

**Plugin Action**:
- Retrieves delivery estimates from PlentyONE
- Calculates based on warehouse location
- Displays customer-facing delivery time
- Updates based on stock location

### Multi-Warehouse Availability
**Scenario**: Show stock across multiple locations

**Frontend Display**:
```
Product: Office Chair
Total Available: 28 units

Warehouse Breakdown:
• Main Warehouse (Berlin): 15 units
• Regional Warehouse (Munich): 8 units
• Retail Store (Hamburg): 5 units
```

**Plugin Action**:
- Queries all warehouses in PlentyONE
- Aggregates availability
- Displays location-specific stock
- Enables store pickup options

### Low Stock Warning
**Scenario**: Alert customers when stock is running low

**Frontend Display**:
```
Product: Limited Edition Poster
Stock: Only 3 left!
Status: Low Stock - Order soon
```

**Plugin Action**:
- Monitors stock threshold
- Displays low stock warning
- Creates urgency messaging
- Syncs with PlentyONE inventory

## Requirements

### Magento Components
- Standard Magento frontend (Luma theme or custom)
- Magento cache system configured

### Mage2Plenty Modules
- `softcommerce/module-plenty-client` - Required for API communication
- `softcommerce/module-plenty-stock` - Required for inventory data

### System Requirements
- Magento 2.4.4 - 2.4.8
- PHP 8.1 - 8.4
- Mage2Plenty connector installed and configured

## Installation

### Via Composer

```bash
# Install the plugin
composer require softcommerce/module-plenty-storefront

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
bin/magento module:status SoftCommerce_PlentyStorefront

# Should show as enabled
```

## Configuration

### Enable Storefront Features

1. Navigate to **Stores → Configuration → Mage2Plenty → Storefront**
2. Enable desired features:
   - Real-time stock display
   - Warehouse availability breakdown
   - Delivery time estimation
   - Low stock warnings

### Stock Display Settings

```
Configuration Options:
├── Enable Real-Time Stock: Yes/No
├── Cache Duration: 300 seconds (5 minutes)
├── Show Warehouse Breakdown: Yes/No
├── Low Stock Threshold: 5 units
├── Display Delivery Time: Yes/No
└── Stock Format: "X units" or "In Stock/Out of Stock"
```

### Cache Configuration

For performance, configure caching:
- **Real-Time Mode**: No cache, live API calls (slower but accurate)
- **Cached Mode**: Cache for X minutes (faster, slightly delayed)
- **Hybrid Mode**: Cache with async refresh (recommended)

## How It Works

### Stock Display Flow

```
Customer Views Product Page
    ↓
Plugin Checks Cache
    ↓
Cache Valid? → Yes → Display Cached Stock
    ↓ No
Query PlentyONE API
    ↓
Retrieve Stock Data
    ↓
Format for Display
    ↓
Cache Result
    ↓
Display to Customer
```

### Data Refresh Strategy

1. **On Page Load**: Check cache first
2. **Cache Miss**: Fetch from PlentyONE API
3. **Cache Hit**: Display cached data
4. **Background Refresh**: Update cache asynchronously
5. **Real-Time Option**: Skip cache for critical products

### Frontend Integration

The plugin integrates at multiple points:
- **Product Page**: Stock levels, delivery time
- **Category Page**: Stock status badges
- **Cart Page**: Availability validation
- **Checkout**: Final stock check

## Troubleshooting

### Stock Not Displaying

**Problem**: PlentyONE stock levels not showing on storefront

**Solutions**:
1. Verify plugin is enabled:
   ```bash
   bin/magento module:status SoftCommerce_PlentyStorefront
   ```

2. Check configuration:
   - Stores → Configuration → Mage2Plenty → Storefront
   - Verify "Enable Real-Time Stock" is enabled

3. Clear cache:
   ```bash
   bin/magento cache:clean
   bin/magento cache:flush
   ```

4. Check API connectivity:
   ```bash
   tail -f var/log/softcommerce/plenty/api.log
   ```

5. Verify PlentyONE API credentials

### Incorrect Stock Levels

**Problem**: Stock numbers don't match PlentyONE

**Solutions**:
1. Check cache settings - may be showing outdated cache
2. Clear stock cache:
   ```bash
   bin/magento cache:clean stock
   ```

3. Verify warehouse mapping is correct
4. Check stock synchronization is running
5. Review API response in logs
6. Ensure correct product SKU mapping

### Performance Issues

**Problem**: Product pages loading slowly

**Solutions**:
1. Enable caching:
   - Stores → Configuration → Mage2Plenty → Storefront
   - Set appropriate cache duration (300-600 seconds)

2. Use Full Page Cache (Varnish):
   ```bash
   bin/magento cache:enable full_page
   ```

3. Implement async stock loading:
   - Enable AJAX stock updates
   - Load stock after page render

4. Optimize API calls:
   - Batch requests where possible
   - Increase cache duration for stable products

5. Monitor performance:
   ```bash
   tail -f var/log/system.log | grep "stock"
   ```

### Warehouse Breakdown Not Showing

**Problem**: Can't see per-warehouse stock levels

**Solutions**:
1. Verify feature is enabled in configuration
2. Check warehouse mapping is configured
3. Ensure PlentyONE returns warehouse-specific data
4. Review API response structure
5. Check frontend template includes warehouse display block

## Best Practices

### Performance Optimization
1. **Cache Strategy**: Use appropriate cache duration (5-10 minutes typical)
2. **AJAX Loading**: Load stock asynchronously for faster page loads
3. **CDN Caching**: Cache static content, bypass for stock data
4. **API Throttling**: Implement rate limiting for API calls

### User Experience
1. **Loading Indicators**: Show loading state while fetching stock
2. **Fallback Display**: Show generic "In Stock" if API unavailable
3. **Error Handling**: Graceful degradation when PlentyONE unreachable
4. **Mobile Friendly**: Ensure stock display works on mobile devices

### Data Accuracy
1. **Regular Sync**: Keep base Magento stock synchronized
2. **Cache Invalidation**: Clear cache when stock changes significantly
3. **Threshold Alerts**: Set up alerts for stock discrepancies
4. **Monitoring**: Track API response times and errors

### Multi-Store Setup
1. **Store-Specific Config**: Configure cache per store view
2. **Warehouse Assignment**: Map warehouses to specific stores
3. **Regional Display**: Show relevant warehouses per region
4. **Language Support**: Ensure stock messages support all languages

## Frontend Customization

### Template Blocks

The plugin provides layout blocks you can customize:

```xml
<!-- In your theme's layout XML -->
<block class="SoftCommerce\PlentyStorefront\Block\Product\Stock"
       name="product.stock.plenty"
       template="SoftCommerce_PlentyStorefront::product/stock.phtml"/>
```

### Custom Templates

Override templates in your theme:
```
app/design/frontend/[Vendor]/[Theme]/
  SoftCommerce_PlentyStorefront/
    templates/
      product/
        stock.phtml (stock display)
        warehouse.phtml (warehouse breakdown)
        delivery.phtml (delivery time)
```

### CSS Styling

Default classes for styling:
```css
.plenty-stock-container { }
.plenty-stock-status { }
.plenty-stock-level { }
.plenty-warehouse-breakdown { }
.plenty-delivery-time { }
.plenty-low-stock-warning { }
```

## Related Plugins

### Stock & Inventory
- **[Stock Import Profile](/docs/profiles/stock-import)** - Stock synchronization

### Frontend
- No other frontend plugins currently

### Order Export
- **[Order Export Profile](/docs/profiles/order-export)** - Order synchronization

## Support

### Getting Help

If you encounter issues:

- 📧 **Email**: support@byte8.io
- 📞 **Phone**: +44 2080 587 795 (GMT working hours)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/softcommerceltd/mage2plenty-os/issues)

### Source Code

- **Location**: `/packages/modules/module-plenty-storefront`
- **License**: OSL-3.0 / AFL-3.0
- **Contributions**: Welcome via pull requests

## Version Information

Check current version:
```bash
composer show softcommerce/module-plenty-storefront
```

## Related Documentation

- **[Free Plugins Overview](/docs/extensions/free-plugins)** - All available plugins
- **[Stock Import Profile](/docs/profiles/stock-import)** - Stock synchronization setup

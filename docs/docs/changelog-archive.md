---
sidebar_position: 99
title: Changelog Archive
description: Historical releases for Mage2Plenty connector (2024 and earlier)
---

# Changelog Archive

This page contains release history for Mage2Plenty versions prior to 1.6.0 (September 2024).

For current releases, see the [main Changelog](/docs/changelog).

---

## Version 1.5.9 - August 17, 2024

### softcommerce/module-core [1.5.2]
- **Fix**: Applied a fix to `\SoftCommerce\Core\Model\Store\WebsiteStorage::getStoreIdToWebsiteId` method where argument data type for `$storeId` was changed from string to an integer [#10]

### softcommerce/module-plenty-attribute [1.4.0]
- **Feature**: Introduce new functionality to manage manufacture synchronisation [#5]

### softcommerce/module-plenty-attribute-rest-api [1.2.7]
- **Compatibility**: Compatibility with new functionality introduced in `SoftCommerce_PlentyAttribute` [#1]

### softcommerce/module-plenty-category-profile [1.3.11]
- **Compatibility**: Introduce support for Magento 2.4.7 [#8]

### softcommerce/module-plenty-item [1.4.6]
- **Compatibility**: Introduce support for Magento 2.4.7 [#9]

### softcommerce/module-plenty-item-profile [1.7.6]
- **Compatibility**: Compatibility with new functionality introduced in `SoftCommerce_PlentyAttribute` [#34]
- **Compatibility**: Introduce support for Magento 2.4.7 [#33]

### softcommerce/module-profile-config [1.2.12]
- **Compatibility**: Introduce support for Magento 2.4.7 [#4]

---

## Version 1.5.8 - May 28, 2024

### softcommerce/module-core [1.5.1]
- **Feature**: Added service & processor interface wrapper for dependant modules that use data processing

### softcommerce/module-plenty-item-profile [1.7.5]
- **Feature**: Add an option to collect + import items from within the product page view #32

### softcommerce/module-profile [1.4.1]
- **Enhancement**: Preserve an array key for context services in `SoftCommerce\Profile\Model\ServiceAbstract\Service::initServices` [#4]

---

## Version 1.5.7 - May 16, 2024

### softcommerce/module-plenty-item-profile [1.7.4]
- **Fix**: Deprecated Functionality: Creation of dynamic property `SoftCommerce\PlentyItemProfile\...\ItemStorage::$variationIdToItemId` is deprecated [#31]

---

## Version 1.5.6 - April 25, 2024

### PHP 8.3 Compatibility Update

Multiple modules updated for PHP 8.3 compatibility:

- softcommerce/module-plenty-attribute [1.3.2]
- softcommerce/module-plenty-attribute-rest-api [1.2.6]
- softcommerce/module-plenty-category-profile-schedule [1.2.5]
- softcommerce/module-plenty-category-rest-api [1.2.4]
- softcommerce/module-plenty-client-rest-api [1.2.7]
- softcommerce/module-plenty-customer [1.3.0]
- softcommerce/module-plenty-customer-rest-api [1.2.6]
- softcommerce/module-plenty-item-profile-schedule [1.3.0]
- softcommerce/module-plenty-item-rest-api [1.3.0]
- softcommerce/module-plenty-log [1.2.7]
- softcommerce/module-plenty-order-rest-api [1.2.9]
- softcommerce/module-plenty-property [1.3.2]
- softcommerce/module-plenty-property-rest-api [1.2.6]
- softcommerce/module-plenty-rest-api [1.3.6]
- softcommerce/module-plenty-stock-profile-schedule [1.2.9]
- softcommerce/module-plenty-stock-rest-api [1.2.7]
- softcommerce/module-profile-history [1.2.8]
- softcommerce/module-profile-queue [1.1.1]
- softcommerce/module-profile-schedule [1.3.6]

### New Features

#### softcommerce/module-plenty-client [1.3.3]
- **Feature**: Introduce new config data collect management interface [#3]

#### softcommerce/module-plenty-order-client [1.3.0]
- **Feature**: Create order item property type "product options" to enable exporting additional order item information [#4]
- **Feature**: Introduce new order property management to create and handle custom order item attributes [#2]

---

## Version 1.5.5 - April 22, 2024

### softcommerce/module-plenty-category [1.2.9]
- **Compatibility**: Introduced support for PHP 8.3

### softcommerce/module-plenty-client [1.3.2]
- **Feature**: Introduce new method to retrieve client data by locale [#2]
- **Compatibility**: Introduced support for PHP 8.3

### softcommerce/module-plenty-item [1.4.5]
- **Compatibility**: Introduced support for PHP 8.3
- **Enhancement**: Removed unused etc/config.xml that has no purpose

### softcommerce/module-plenty-item-client [1.2.8]
- **Compatibility**: Introduced support for PHP 8.3

### softcommerce/module-plenty-item-profile [1.7.2]
- **Feature**: Add attribute mapping for availability fields [#29]

### softcommerce/module-plenty-stock [1.3.6]
- **Compatibility**: Introduced support for PHP 8.3
- **Enhancement**: Added new methods `getReservedBundle` and `setReservedBundle` to `SoftCommerce\PlentyStock\Api\Data\InventoryInterface`

### softcommerce/module-plenty-stock-client [1.2.7]
- **Compatibility**: Introduced support for PHP 8.3
- **Enhancement**: Added new methods to `SoftCommerce\PlentyStockClient\Api\Data\WarehouseLocationInterface`

### softcommerce/module-plenty-stock-profile [1.5.1]
- **Enhancement**: Include stock calculation for reservation bundle [#16]

---

## Version 1.5.4 - March 25, 2024

### softcommerce/module-plenty-item-profile [1.7.1]
- **Enhancement**: Added an option to allow/disallow child product name generation based on parent name and attributes [#28]

---

## Version 1.5.3 - March 21, 2024

### softcommerce/module-core [1.5.0]
- **Compatibility**: Introduced compatibility with PHP type declaration [#9]
- **Compatibility**: Introduced support for PHP 8.3 [#8]
- **Feature**: Implement functionality to support UI form scope data [#7]

### softcommerce/module-plenty-category-profile [1.3.10]
- **Compatibility**: Introduced support for PHP 8.3 [#7]
- **Enhancement**: Improvements to UI form components for category configuration profile [#6]

### softcommerce/module-plenty-customer-profile [1.1.0]
- **Enhancement**: An option to retrieve a referrer ID by store scope [#9]
- **Compatibility**: Introduced support for PHP 8.3 [#8]
- **Enhancement**: Improvements to UI form components for customer profile configuration [#7]

### softcommerce/module-plenty-item-profile [1.7.0]
- **Compatibility**: Introduced support for PHP 8.3 [#27]
- **Enhancement**: Improvements to UI form components for item profile configuration [#26]

### softcommerce/module-plenty-order [1.4.0]
- **Compatibility**: Introduced support for PHP 8.3 [#7]
- **Enhancement**: Introduced compatibility with PHP type declaration [#6]

### softcommerce/module-plenty-order-profile [1.7.0]
- **Compatibility**: Introduced support for PHP 8.3 [#35]
- **Feature**: Introduced support for scoped configuration within profile UI form components [#34]

### softcommerce/module-plenty-order-profile-schedule [1.2.12]
- **Compatibility**: Introduced support for PHP 8.3 [#3]

### softcommerce/module-plenty-profile [1.4.0]
- **Enhancement**: Changes to profile configuration where referrer ID is now retrieved by store scope instead of website [#2]
- **Compatibility**: Introduced support for PHP 8.3 [#1]

### softcommerce/module-plenty-stock-profile [1.5.0]
- **Feature**: Introduced support for scoped configuration within profile UI form components [#15]
- **Compatibility**: Introduced support for PHP 8.3 [#14]

### softcommerce/module-profile [1.4.0]
- **Feature**: Introduced functionality to support UI form scoped data [#3]
- **Compatibility**: Introduced support for PHP 8.3 [#2]

### softcommerce/module-profile-config [1.2.11]
- **Compatibility**: Introduced support for PHP 8.3 [#2]

---

## Earlier Versions

For releases prior to March 2024, please contact [support@softcommerce.io](mailto:support@softcommerce.io) for historical release information.

---

## Return to Current Releases

View the [main Changelog](/docs/changelog) for recent releases.

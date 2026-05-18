---
sidebar_position: 98
title: Changelog
description: Release history for Mage2Plenty connector
---

# Changelog

All notable changes to the Mage2Plenty connector. This project follows [Semantic Versioning](https://semver.org/).

:::tip Latest Release
**v3.4.0** - 2026-05-13 | [object Object]
:::



































































## module-plenty-stock-profile v2.1.0

**Released:** 2026-05-13

### ✨ New Features

- prune stale plenty_stock_entity rows after one-time full collect

### 🐛 Bug Fixes

- always create inventory_source_item row on initial stock import even at qty 0
- detect orphaned client reservations from unassigned warehouses

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.0)

---

## module-plenty-order-profile v2.5.0

**Released:** 2026-05-13

### ✨ New Features

- add scheduled cleanup for plenty_order_entity storage

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.5.0)

---

## module-plenty-item-profile v3.3.0

**Released:** 2026-05-13

### ✨ New Features

- add scheduled item-mapping data integrity check
- add plenty:item:purge-orphans CLI command

### 🐛 Bug Fixes

- align export response to commands by SKU/externalId, not array index
- drain plenty_item_export_queue and honour process_batch_size

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v3.3.0)

---

## module-plenty-client v2.1.4

**Released:** 2026-05-13

### 🐛 Bug Fixes

- advance REQUEST_INDEX per response item in non-associative batch bodies

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.4)

---

## module-plenty-stock-profile v2.0.8

**Released:** 2026-04-22

### 🐛 Bug Fixes

- propagate profile ID to collect service in StockCollect

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.8)

---

## module-plenty-profile v2.2.1

**Released:** 2026-04-22

### 🐛 Bug Fixes

- honor per-mapping locale in StoreConfig::buildStoreData

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.2.1)

---

## module-plenty-order-profile v2.4.4

**Released:** 2026-04-22

### 🐛 Bug Fixes

- key order item discount gross-up on catalog price basis
- widen order export claim to block only processing status
- resolve discount_tax config at store scope in Promotion generator
- respect Magento discount_tax config when grossing up order item discount
- prevent duplicate order export via atomic claim
- propagate profile ID to collect service in OrderCollect

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.4.4)

---

## module-plenty-order v2.1.0

**Released:** 2026-04-22

### ✨ New Features

- add claim() method with negative predicate for order status

### 🐛 Bug Fixes

- add atomic compare-and-swap to UpdateSalesOrderStatus

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.0)

---

## module-plenty-item-profile v3.2.0

**Released:** 2026-04-22

### ✨ New Features

- add None option to Magento price attribute dropdown

### 🐛 Bug Fixes

- guard null name in ConfigAttribute child product name generation
- propagate profile ID to collect services in schedule queue processors
- resolve image ID lookup failures during variation image assignment
- resolve DELETE batch validation errors on PIM variation endpoints

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v3.2.0)

---

## module-plenty-category-profile v2.0.4

**Released:** 2026-04-22

### 🐛 Bug Fixes

- propagate profile ID to collect service in CategoryCollect

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.4)

---

## module-profile-notification v2.1.2

**Released:** 2026-04-02

### 🐛 Bug Fixes

- resolve email template rendering crash and broken conditional directives

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.2)

---

## module-plenty-stock-profile v2.0.7

**Released:** 2026-04-02

### 🐛 Bug Fixes

- prevent json_extract errors on corrupt inventory_reservation metadata

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.7)

---

## module-plenty-order-profile v2.4.3

**Released:** 2026-04-02

### 🐛 Bug Fixes

- clean up shipment generator and fix CLI option conflict
- use total PlentyONE variation qty for shipment item quantity
- resolve back-shipment stock deficit for duplicate SKU order lines
- allow follow-up shipments when conditional rules are active

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.4.3)

---

## module-plenty-order v2.0.7

**Released:** 2026-04-02

### 🐛 Bug Fixes

- add JSON_VALID guard to inventory_reservation metadata queries

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.7)

---

## module-plenty-item-profile v3.1.1

**Released:** 2026-04-02

### 🐛 Bug Fixes

- preserve parent request data for post-processors in configurable import

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v3.1.1)

---

## module-profile-notification v2.1.1

**Released:** 2026-03-24

### 🐛 Bug Fixes

- improve notification not found error message with ID context
- resolve MySQL Error 1093 in notification cleanup batch delete
- respect "Enable Notifications" config toggle for all write operations
- resolve notification table bloat causing disk exhaustion and cleanup failure

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.1)

---

## module-profile v3.0.5

**Released:** 2026-03-24

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v3.0.5)

---

## module-plenty-stock-profile v2.0.6

**Released:** 2026-03-24

### 🐛 Bug Fixes

- Performance: add sleep interval to stock reservation queue consumer

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.6)

---

## module-plenty-stock v2.0.2

**Released:** 2026-03-24

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.2)

---

## module-plenty-property v2.0.5

**Released:** 2026-03-24

### 🐛 Bug Fixes

- Performance: add sleep interval to message queue consumers

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.5)

---

## module-plenty-profile v2.2.0

**Released:** 2026-03-24

### ✨ New Features

- add agnostic action handler pool for setup message queue consumer

### 🐛 Bug Fixes

- add missing composer dependency on module-profile-notification
- Performance: add sleep interval to setup queue consumers

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.2.0)

---

## module-plenty-order-profile v2.4.2

**Released:** 2026-03-24

### 🐛 Bug Fixes

- prevent cancellation of orders with existing credit notes in PlentyONE
- Performance: add sleep interval to order collect queue consumer
- resolve creditmemo not created for canceled orders with status condition

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.4.2)

---

## module-plenty-order v2.0.6

**Released:** 2026-03-24

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.6)

---

## module-plenty-item-profile v3.1.0

**Released:** 2026-03-24

### ✨ New Features

- auto-create missing attribute values and skip variations with unresolved values
- move media checksum computation to async message queue handler

### 🐛 Bug Fixes

- inject variationId into dedicated endpoint payload items
- surface batch execution errors to CLI and UI via message collector
- prevent memory leak in retry registry and harden SKU availability check
- add circuit breaker to prevent infinite relation link reprocessing loop
- allow post-processors to save error results when SKU is available
- Performance: add sleep interval to item collect queue consumer

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v3.1.0)

---

## module-plenty-item v2.4.1

**Released:** 2026-03-24

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.4.1)

---

## module-plenty-customer v2.1.3

**Released:** 2026-03-24

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.3)

---

## module-plenty-client v2.1.3

**Released:** 2026-03-24

### 🐛 Bug Fixes

- exclude request payload from API error logs unless verbose mode is enabled

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.3)

---

## module-plenty-category v2.2.2

**Released:** 2026-03-24

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.2.2)

---

## module-plenty-attribute v2.0.4

**Released:** 2026-03-24

### 🐛 Bug Fixes

- Performance: add sleep interval to message queue consumers

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.4)

---

## module-core v2.4.1

**Released:** 2026-03-24

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.4.1)

---

## module-plenty-item-profile-staging v2.0.1

**Released:** 2026-03-16

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-plenty-category-profile-staging v2.0.1

**Released:** 2026-03-16

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-profile-schedule v2.0.3

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.3)

---

## module-profile-queue v2.0.1

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-profile-notification v2.1.0

**Released:** 2026-03-13

### ✨ New Features

- include notification details in batch summary email

### 🐛 Bug Fixes

- improve notification batching and context enrichment
- suppress duplicate batch notification emails

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.0)

---

## module-profile-history v2.0.1

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-profile v3.0.4

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v3.0.4)

---

## module-plenty-stock-profile v2.0.5

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.5)

---

## module-plenty-stock v2.0.1

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-plenty-property v2.0.4

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.4)

---

## module-plenty-profile v2.1.2

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.2)

---

## module-plenty-order-profile v2.4.1

**Released:** 2026-03-13

### 🐛 Bug Fixes

- resolve order export pagination infinite loop
- add name fallback for guest orders with missing customer name
- mark non-retryable error orders as SKIPPED in database

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.4.1)

---

## module-plenty-order v2.0.5

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.5)

---

## module-plenty-log v2.0.2

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.2)

---

## module-plenty-item-profile v3.0.2

**Released:** 2026-03-13

### 🐛 Bug Fixes

- prevent post-processors from running when type processor fails or is skipped

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v3.0.2)

---

## module-plenty-item v2.4.0

**Released:** 2026-03-13

### ✨ New Features

- add plenty_variation_entity lookup for SKU to variation ID resolution

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.4.0)

---

## module-plenty-customer-profile v2.1.2

**Released:** 2026-03-13

### 🐛 Bug Fixes

- resolve customer class ID from group mapping during contact export

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.2)

---

## module-plenty-customer v2.1.2

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.2)

---

## module-plenty-client v2.1.2

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.2)

---

## module-plenty-category-profile v2.0.3

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.3)

---

## module-plenty-category v2.2.1

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.2.1)

---

## module-plenty-attribute v2.0.3

**Released:** 2026-03-13

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.3)

---

## module-core v2.4.0

**Released:** 2026-03-13

### ✨ New Features

- add rebrand notice and update copyright headers to Byte8 Ltd

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.4.0)

---

## module-plenty-item-profile v3.0.1

**Released:** 2026-02-16

### 🐛 Bug Fixes

- skip new non-visible child products from export queue in observer

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v3.0.1)

---

## module-profile-notification v2.0.1

**Released:** 2026-02-16

### 🐛 Bug Fixes

- remove @media-common guard from adminhtml LESS

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-profile v3.0.3

**Released:** 2026-02-16

### 🐛 Bug Fixes

- remove @media-common guard from adminhtml LESS

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v3.0.3)

---

## module-plenty-stock-profile v2.0.4

**Released:** 2026-02-16

### 🐛 Bug Fixes

- remove @media-common guard from adminhtml LESS

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.4)

---

## module-plenty-property v2.0.3

**Released:** 2026-02-16

### 🐛 Bug Fixes

- skip redundant property group export when groups already exist
- save property data immediately after export for product export availability

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.3)

---

## module-plenty-profile v2.1.1

**Released:** 2026-02-16

### 🐛 Bug Fixes

- improve system property setup command output and status tracking

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.1)

---

## module-plenty-order-profile v2.4.0

**Released:** 2026-02-16

### ✨ New Features

- add configurable retry limits and email notifications for failed order exports
- add partial amount refund and shipping support for credit memo import
- add sales_order duplicate detection to detect-duplicates command

### 🐛 Bug Fixes

- correct label typo in creditmemo order status field
- require credit note order type as prerequisite for creditmemo creation
- always aggregate batch messages and clean up memory during order import
- remove unreliable external order lookup on export failure
- resolve order export infinite loop caused by SearchCriteria caching
- use null-safe operator for customer extension attributes
- return null early when shipping package ID is zero
- add validation to prevent duplicate plenty_order_id assignment

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.4.0)

---

## module-plenty-order v2.0.4

**Released:** 2026-02-16

### 🐛 Bug Fixes

- resolve incorrect null return for zero quantity in order item model

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.4)

---

## module-plenty-item-profile v3.0.0

**Released:** 2026-02-16

### ⚠️ Breaking Changes

:::danger Important
- redesign product export with command-based architecture
:::

### ✨ New Features

- redesign product export with command-based architecture

### 🐛 Bug Fixes

- align CLI progress bar with export service callback events
- use existing Magento SKU when product found during custom attribute mapping

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v3.0.0)

---

## module-plenty-item v2.3.0

**Released:** 2026-02-16

### ✨ New Features

- add selective cache removal and dimension field mapping to data providers
- add "Select All" support for product export queue admin grid
- resolve parent configurable products when adding children to export queue
- add plenty_item_id and plenty_variation_id to configurable product variations grid

### 🐛 Bug Fixes

- disable broken export row action in queue listing
- correct shipping profile query filter and code style
- resolve order import failure when custom attribute mapping is enabled

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.3.0)

---

## module-plenty-client v2.1.1

**Released:** 2026-02-16

### 🐛 Bug Fixes

- update setup command default timeouts to match API client defaults
- set sensible default API timeouts instead of unlimited

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.1)

---

## module-plenty-attribute v2.0.2

**Released:** 2026-02-16

### 🐛 Bug Fixes

- save attribute data immediately after export to PlentyONE

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.2)

---

## module-core v2.3.0

**Released:** 2026-02-16

### ✨ New Features

- add email notification service for admin alerts

### 🐛 Bug Fixes

- remove @media-common guard from adminhtml LESS

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.3.0)

---

## module-plenty-item-profile v3.0.0

**Released:** 2026-02-15

### ⚠️ Breaking Changes

- Redesigned product export with command-based architecture replacing the legacy Generator/Processor pattern
- New Command/Collector/Executor pipeline for product data export
- Data builders for variation properties, sales prices, purchase prices, barcodes, images and categories
- Dry-run mode for previewing exports without making changes to PlentyONE
- SKU and status-based filtering for targeted exports
- Batch execution with configurable batch sizes

### 🐛 Bug Fixes

- Align CLI progress bar with export service callback events for real-time per-product progress tracking

---

## module-plenty-item v2.3.0

**Released:** 2026-02-15

### ✨ New Features

- Resolve parent configurable products when adding child products to export queue
- Add "Select All" support for product export queue admin grid mass actions
- Add selective cache removal and dimension field mapping to variation data providers

### 🐛 Bug Fixes

- Correct shipping profile query filter and improve code style consistency

---

## module-core v2.3.0

**Released:** 2026-02-15

### ✨ New Features

- Add email notification service for admin alerts via ProfileNotification integration

---

## module-plenty-order-profile v2.4.0

**Released:** 2026-02-15

### ✨ New Features

- Add configurable retry limits and email notifications for failed order exports (replaces hardcoded 12-hour retry window with configurable max attempts, default 3)

### 🔄 Refactoring

- Migrate integrity check email to centralized ProfileNotification service

### 🐛 Bug Fixes

- Remove unreliable external order lookup on export failure
- Always aggregate batch messages and clean up memory during order import

---

## module-plenty-attribute v2.0.2

**Released:** 2026-02-15

### 🔄 Refactoring

- Simplify attribute data cache reset to full-clear only

### 🐛 Bug Fixes

- Save attribute data immediately after export to PlentyONE for availability in subsequent operations

---

## module-plenty-client v2.1.1

**Released:** 2026-02-15

### 🐛 Bug Fixes

- Set sensible default API timeouts (60s connection, 120s request) instead of unlimited

---

## module-plenty-profile v2.1.1

**Released:** 2026-02-15

### 🐛 Bug Fixes

- Improve system property setup command output and status tracking

---

## module-plenty-property v2.0.3

**Released:** 2026-02-15

### 🔄 Refactoring

- Use shared REST API interfaces for property group collection

### 🐛 Bug Fixes

- Save property data immediately after export for product export availability
- Skip redundant property group export when groups already exist in PlentyONE

---







































## module-profile-schedule v2.0.2

**Released:** 2026-01-12

### 🐛 Bug Fixes

- add missing model property declaration in Save controller

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.2)

---

## module-profile v3.0.2

**Released:** 2026-01-12

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v3.0.2)

---

## module-plenty-stock-profile v2.0.3

**Released:** 2026-01-12

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.3)

---

## module-plenty-property v2.0.2

**Released:** 2026-01-12

### 🐛 Bug Fixes

- improve FlushData controller to properly delete property data

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.2)

---

## module-plenty-profile v2.1.0

**Released:** 2026-01-12

### ✨ New Features

- add TagOptions UI component and comprehensive documentation

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.0)

---

## module-plenty-order-profile v2.3.0

**Released:** 2026-01-12

### ✨ New Features

- add order tag management and enhance export configuration

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.3.0)

---

## module-plenty-order v2.0.3

**Released:** 2026-01-12

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.3)

---

## module-plenty-item-profile v2.1.0

**Released:** 2026-01-12

### ✨ New Features

- add product export infrastructure and image checksum computation

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.0)

---

## module-plenty-item v2.2.0

**Released:** 2026-01-12

### ✨ New Features

- add ItemDataProvider, VariationDataProvider and batch response handling

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.2.0)

---

## module-plenty-customer-profile v2.1.1

**Released:** 2026-01-12

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.1)

---

## module-plenty-customer v2.1.1

**Released:** 2026-01-12

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.1)

---

## module-plenty-client v2.1.0

**Released:** 2026-01-12

### ✨ New Features

- add Tag management system for PlentyONE tags

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.0)

---

## module-plenty-category-profile v2.0.2

**Released:** 2026-01-12

### 🐛 Bug Fixes

- use getDefaultName for category path resolution

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.2)

---

## module-plenty-category v2.2.0

**Released:** 2026-01-12

### ✨ New Features

- add getDefaultName method to Category and improve CategoryIdCache

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.2.0)

---

## module-core v2.2.0

**Released:** 2026-01-12

### ✨ New Features

- add MediaChecksumComputeService and memory reset for MediaManagement

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.2.0)

---

## module-plenty-stock-profile v2.0.2

**Released:** 2025-12-19

### 🐛 Bug Fixes

- add explicit string cast for SKU in reservation processing

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.2)

---

## module-plenty-profile v2.0.2

**Released:** 2025-12-19

### 🐛 Bug Fixes

- correct time duration formatting for float values

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.2)

---

## module-plenty-order-profile v2.2.0

**Released:** 2025-12-19

### ✨ New Features

- improve order address handling and add diagnostic commands

### 🐛 Bug Fixes

- prevent order address entity_id mutation breaking PackStation plugin

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.2.0)

---

## module-plenty-order v2.0.2

**Released:** 2025-12-19

### 🐛 Bug Fixes

- improve type safety in order address and metadata handling

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.2)

---

## module-plenty-item v2.1.0

**Released:** 2025-12-19

### ✨ New Features

- add validated SKU to item/variation resolver

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.0)

---

## module-plenty-customer-profile v2.1.0

**Released:** 2025-12-19

### ✨ New Features

- refactor address relation enrichment and improve contact export

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.0)

---

## module-plenty-customer v2.1.0

**Released:** 2025-12-19

### ✨ New Features

- add order address ID support and fix address option constants

### 🐛 Bug Fixes

- improve address matching with street, company and normalization

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.0)

---

## module-core v2.1.0

**Released:** 2025-12-19

### ✨ New Features

- add CronHeartbeat service for monitoring cron system health

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.0)

---

## module-profile-schedule v2.0.1

**Released:** 2025-11-27

_Internal changes and maintenance updates._

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-profile v3.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v3.0.1)

---

## module-plenty-stock-profile v2.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility
- **stock**: use resolved profile ID in stock collection queue handler

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-plenty-property v2.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-plenty-profile v2.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-plenty-order-profile v2.1.0

**Released:** 2025-11-27

### ✨ New Features

- **order**: add comprehensive order status change detection
- **order**: add automatic parent order status sync for credit notes
- **order**: enhance batch processing with comprehensive message tracking
- **order**: add intelligent status update system
- **order**: add incomplete order detection system
- **invoice**: add payment method filtering for invoice creation

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.0)

---

## module-plenty-order v2.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility
- Performance: **database**: add composite index for order detection queries

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-plenty-log v2.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-plenty-item v2.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-plenty-customer-profile v2.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-plenty-customer v2.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-plenty-client v2.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-plenty-category-profile v2.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility
- Performance: **category-export**: optimize export process and improve status reporting

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-plenty-category v2.1.0

**Released:** 2025-11-27

### ✨ New Features

- **category**: add runtime cache and mapping for category IDs

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.1.0)

---

## module-plenty-attribute v2.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- remove typed class constants for PHP 8.1/8.2 compatibility

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## module-core v2.0.1

**Released:** 2025-11-27

### 🐛 Bug Fixes

- replace union type with mixed for laminas-code compatibility
- remove typed class constants for PHP 8.1/8.2 compatibility

[View Release on GitHub](https://github.com/softcommerceltd/mage2plenty-os/releases/tag/v2.0.1)

---

## [2.0.0] - 2025-11-07

### Added
- PHP 8.4 compatibility across all modules
- Comprehensive Admin Notification system with real-time grid and severity levels
- Setup integration system with CLI and Admin UI wizard
- Profile auto-configuration with intelligent mapping suggestions
- CLI progress bars with entity-level tracking
- Product identifier mapping via custom attributes (use any attribute instead of SKU for product matching)
- Display variation ID and source code in Sales Order items
- Support for importing shipments with tracking IDs
- Live cron schedule monitoring UI
- HTML email templates
- Improved stock reservation calculation with accurate quantity tracking
- PlentyONE Stock Sync Status in product view page showing import processing status and quantity changes
- Inventory Reservations panel in product view page displaying reserved quantity per source with on-hand summary
- Automatic retry for failed order exports (highly requested feature for handling PlentyONE server downtime)
- Comprehensive stock listing at Catalog → Inventory → Stocks with reservation details
- Comprehensive reservation listing at Catalog → Inventory → Reservations with source code assignments
- New CLI commands: Map order relations, map item relations, map stock relations, show profile status, purge PlentyONE data
- MessageCollector replacing MessageStorage
- ProductDataRegistry system replacing SkuPool

### Changed
- **BREAKING:** Minimum PHP version raised to 8.1
- **BREAKING:** Consolidated 15 modules into parent modules:
  - 9 REST API modules → parent modules
  - 4 Client modules → parent modules
  - 3 Schedule modules → profile modules
- **BREAKING:** API interfaces relocated to `Api/*` namespace (configuration interfaces specifically to `Api/Config`)
- **BREAKING:** MessageStorage deprecated in favor of MessageCollector
- Implemented PHP 8.3 constructor property promotion across all modules
- Enhanced type safety with readonly properties
- Improved dependency injection using interfaces
- Refactored to ProcessorGuard pattern in profile module

### Fixed
- Order cancellation synchronization with PlentyONE
- Notification system compatibility with MessageCollector
- URL rewrite conflicts during import
- Race conditions in batch processing
- Token refresh logic for expired refresh tokens

### Removed
- Deprecated Processor architecture from core module
- Old wizard configurator
- 15 consolidated modules (see Changed section)

## [1.15.1] - 2025-08-20

### Fixed
- Improved error messages for warehouse mapping issues
- Resolved one-to-many warehouse mapping for multi-warehouse shipments

## [1.15.0] - 2025-08-08

### Added
- Commands to create referrers (module-plenty-client)
- Commands to delete orders and payments (module-plenty-order-profile)
- Improved data collection commands for customer, item, order, stock, and log modules

## [1.14.0] - 2025-07-10

### Changed
- Enhanced client token refresh logic to check refresh token expiration before use (#72)

---

For detailed release information, see our [blog posts](/blog/tags/release) or [GitHub releases](https://github.com/softcommerceltd/mage2plenty-os/releases).
## Changelog

# mage2plenty-suite [3.4.0] 13 May 2026

### softcommerce/module-plenty-client [2.1.4]
- **Fix**: advance REQUEST_INDEX per response item in non-associative batch bodies

### softcommerce/module-plenty-item-profile [3.3.0]
- **Feature**: add scheduled item-mapping data integrity check
- **Feature**: add plenty:item:purge-orphans CLI command
- **Fix**: align export response to commands by SKU/externalId, not array index
- **Fix**: drain plenty_item_export_queue and honour process_batch_size

### softcommerce/module-plenty-order-profile [2.5.0]
- **Feature**: add scheduled cleanup for plenty_order_entity storage

### softcommerce/module-plenty-stock-profile [2.1.0]
- **Feature**: prune stale plenty_stock_entity rows after one-time full collect
- **Fix**: always create inventory_source_item row on initial stock import even at qty 0
- **Fix**: detect orphaned client reservations from unassigned warehouses


# mage2plenty-suite [3.3.0] 22 Apr 2026

### softcommerce/module-plenty-category-profile [2.0.4]
- **Fix**: propagate profile ID to collect service in CategoryCollect

### softcommerce/module-plenty-item-profile [3.2.0]
- **Feature**: add None option to Magento price attribute dropdown
- **Fix**: guard null name in ConfigAttribute child product name generation
- **Fix**: propagate profile ID to collect services in schedule queue processors
- **Fix**: resolve image ID lookup failures during variation image assignment
- **Fix**: resolve DELETE batch validation errors on PIM variation endpoints

### softcommerce/module-plenty-order [2.1.0]
- **Feature**: add claim() method with negative predicate for order status
- **Fix**: add atomic compare-and-swap to UpdateSalesOrderStatus

### softcommerce/module-plenty-order-profile [2.4.4]
- **Fix**: key order item discount gross-up on catalog price basis
- **Fix**: widen order export claim to block only processing status
- **Fix**: resolve discount_tax config at store scope in Promotion generator
- **Fix**: respect Magento discount_tax config when grossing up order item discount
- **Fix**: prevent duplicate order export via atomic claim
- **Fix**: propagate profile ID to collect service in OrderCollect

### softcommerce/module-plenty-profile [2.2.1]
- **Fix**: honor per-mapping locale in StoreConfig::buildStoreData

### softcommerce/module-plenty-stock-profile [2.0.8]
- **Fix**: propagate profile ID to collect service in StockCollect


# mage2plenty-suite [3.2.1] 02 Apr 2026

### softcommerce/module-plenty-item-profile [3.1.1]
- **Fix**: preserve parent request data for post-processors in configurable import

### softcommerce/module-plenty-order [2.0.7]
- **Fix**: add JSON_VALID guard to inventory_reservation metadata queries

### softcommerce/module-plenty-order-profile [2.4.3]
- **Fix**: clean up shipment generator and fix CLI option conflict
- **Fix**: use total PlentyONE variation qty for shipment item quantity
- **Fix**: resolve back-shipment stock deficit for duplicate SKU order lines
- **Fix**: allow follow-up shipments when conditional rules are active

### softcommerce/module-plenty-stock-profile [2.0.7]
- **Fix**: prevent json_extract errors on corrupt inventory_reservation metadata

### softcommerce/module-profile-notification [2.1.2]
- **Fix**: resolve email template rendering crash and broken conditional directives


# mage2plenty-suite [3.2.0] 24 Mar 2026

### softcommerce/module-plenty-attribute [2.0.4]
- **Performance**: add sleep interval to message queue consumers

### softcommerce/module-plenty-client [2.1.3]
- **Fix**: exclude request payload from API error logs unless verbose mode is enabled

### softcommerce/module-plenty-item-profile [3.1.0]
- **Feature**: auto-create missing attribute values and skip variations with unresolved values
- **Feature**: move media checksum computation to async message queue handler
- **Fix**: inject variationId into dedicated endpoint payload items
- **Fix**: surface batch execution errors to CLI and UI via message collector
- **Fix**: prevent memory leak in retry registry and harden SKU availability check
- **Fix**: add circuit breaker to prevent infinite relation link reprocessing loop
- **Fix**: allow post-processors to save error results when SKU is available
- **Performance**: add sleep interval to item collect queue consumer

### softcommerce/module-plenty-order-profile [2.4.2]
- **Fix**: prevent cancellation of orders with existing credit notes in PlentyONE
- **Fix**: resolve creditmemo not created for canceled orders with status condition
- **Performance**: add sleep interval to order collect queue consumer

### softcommerce/module-plenty-profile [2.2.0]
- **Feature**: add agnostic action handler pool for setup message queue consumer
- **Fix**: add missing composer dependency on module-profile-notification
- **Performance**: add sleep interval to setup queue consumers

### softcommerce/module-plenty-property [2.0.5]
- **Performance**: add sleep interval to message queue consumers

### softcommerce/module-plenty-stock-profile [2.0.6]
- **Performance**: add sleep interval to stock reservation queue consumer

### softcommerce/module-profile-notification [2.1.1]
- **Fix**: improve notification not found error message with ID context
- **Fix**: resolve MySQL Error 1093 in notification cleanup batch delete
- **Fix**: respect "Enable Notifications" config toggle for all write operations
- **Fix**: resolve notification table bloat causing disk exhaustion and cleanup failure


# mage2plenty-suite [3.1.0] 13 Mar 2026

### softcommerce/module-core [2.4.0]
- **Feature**: add rebrand notice and update copyright headers to Byte8 Ltd

### softcommerce/module-plenty-customer-profile [2.1.2]
- **Fix**: resolve customer class ID from group mapping during contact export

### softcommerce/module-plenty-item [2.4.0]
- **Feature**: add plenty_variation_entity lookup for SKU to variation ID resolution

### softcommerce/module-plenty-item-profile [3.0.2]
- **Fix**: prevent post-processors from running when type processor fails or is skipped

### softcommerce/module-plenty-order-profile [2.4.1]
- **Fix**: resolve order export pagination infinite loop
- **Fix**: add name fallback for guest orders with missing customer name
- **Fix**: mark non-retryable error orders as SKIPPED in database

### softcommerce/module-profile-notification [2.1.0]
- **Feature**: include notification details in batch summary email
- **Fix**: improve notification batching and context enrichment
- **Fix**: suppress duplicate batch notification emails


# mage2plenty-suite [3.0.1] 16 Feb 2026

### softcommerce/module-plenty-item-profile [3.0.1]
- **Fix**: skip new non-visible child products from export queue in observer


# mage2plenty-suite [3.0.0] 16 Feb 2026

### softcommerce/module-core [2.3.0]
- **Feature**: add email notification service for admin alerts
- **Fix**: remove @media-common guard from adminhtml LESS

### softcommerce/module-plenty-attribute [2.0.2]
- **Fix**: save attribute data immediately after export to PlentyONE

### softcommerce/module-plenty-client [2.1.1]
- **Fix**: update setup command default timeouts to match API client defaults
- **Fix**: set sensible default API timeouts instead of unlimited

### softcommerce/module-plenty-item [2.3.0]
- **Feature**: add selective cache removal and dimension field mapping to data providers
- **Feature**: add "Select All" support for product export queue admin grid
- **Feature**: resolve parent configurable products when adding children to export queue
- **Feature**: add plenty_item_id and plenty_variation_id to configurable product variations grid
- **Fix**: disable broken export row action in queue listing
- **Fix**: correct shipping profile query filter and code style
- **Fix**: resolve order import failure when custom attribute mapping is enabled

### softcommerce/module-plenty-item-profile [3.0.0]
- **BREAKING CHANGE**: feat!: redesign product export with command-based architecture
- **Fix**: align CLI progress bar with export service callback events
- **Fix**: use existing Magento SKU when product found during custom attribute mapping

### softcommerce/module-plenty-order [2.0.4]
- **Fix**: resolve incorrect null return for zero quantity in order item model

### softcommerce/module-plenty-order-profile [2.4.0]
- **Feature**: add configurable retry limits and email notifications for failed order exports
- **Feature**: add partial amount refund and shipping support for credit memo import
- **Feature**: add sales_order duplicate detection to detect-duplicates command
- **Fix**: correct label typo in creditmemo order status field
- **Fix**: require credit note order type as prerequisite for creditmemo creation
- **Fix**: always aggregate batch messages and clean up memory during order import
- **Fix**: remove unreliable external order lookup on export failure
- **Fix**: resolve order export infinite loop caused by SearchCriteria caching
- **Fix**: use null-safe operator for customer extension attributes
- **Fix**: return null early when shipping package ID is zero
- **Fix**: add validation to prevent duplicate plenty_order_id assignment

### softcommerce/module-plenty-profile [2.1.1]
- **Fix**: improve system property setup command output and status tracking

### softcommerce/module-plenty-property [2.0.3]
- **Fix**: skip redundant property group export when groups already exist
- **Fix**: save property data immediately after export for product export availability

### softcommerce/module-plenty-stock-profile [2.0.4]
- **Fix**: remove @media-common guard from adminhtml LESS

### softcommerce/module-profile [3.0.3]
- **Fix**: remove @media-common guard from adminhtml LESS

### softcommerce/module-profile-notification [2.0.1]
- **Fix**: remove @media-common guard from adminhtml LESS


# mage2plenty-suite [2.3.0] 12 Jan 2026

### softcommerce/module-core [2.2.0]
- **Feature**: add MediaChecksumComputeService and memory reset for MediaManagement

### softcommerce/module-plenty-category [2.2.0]
- **Feature**: add getDefaultName method to Category and improve CategoryIdCache

### softcommerce/module-plenty-category-profile [2.0.2]
- **Fix**: use getDefaultName for category path resolution

### softcommerce/module-plenty-client [2.1.0]
- **Feature**: add Tag management system for PlentyONE tags

### softcommerce/module-plenty-item [2.2.0]
- **Feature**: add ItemDataProvider, VariationDataProvider and batch response handling

### softcommerce/module-plenty-item-profile [2.1.0]
- **Feature**: add product export infrastructure and image checksum computation

### softcommerce/module-plenty-order-profile [2.3.0]
- **Feature**: add order tag management and enhance export configuration

### softcommerce/module-plenty-profile [2.1.0]
- **Feature**: add TagOptions UI component and comprehensive documentation

### softcommerce/module-plenty-property [2.0.2]
- **Fix**: improve FlushData controller to properly delete property data

### softcommerce/module-profile-schedule [2.0.2]
- **Fix**: add missing model property declaration in Save controller


# mage2plenty-suite [2.2.0] 19 Dec 2025

### softcommerce/module-core [2.1.0]
- **Feature**: add CronHeartbeat service for monitoring cron system health

### softcommerce/module-plenty-customer [2.1.0]
- **Feature**: add order address ID support and fix address option constants
- **Fix**: improve address matching with street, company and normalization

### softcommerce/module-plenty-customer-profile [2.1.0]
- **Feature**: refactor address relation enrichment and improve contact export

### softcommerce/module-plenty-item [2.1.0]
- **Feature**: add validated SKU to item/variation resolver

### softcommerce/module-plenty-order [2.0.2]
- **Fix**: improve type safety in order address and metadata handling

### softcommerce/module-plenty-order-profile [2.2.0]
- **Feature**: improve order address handling and add diagnostic commands
- **Fix**: prevent order address entity_id mutation breaking PackStation plugin

### softcommerce/module-plenty-profile [2.0.2]
- **Fix**: correct time duration formatting for float values

### softcommerce/module-plenty-stock-profile [2.0.2]
- **Fix**: add explicit string cast for SKU in reservation processing


# mage2plenty-suite [2.1.0] 27 Nov 2025

### softcommerce/module-core [2.0.1]
- **Fix**: replace union type with mixed for laminas-code compatibility
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility

### softcommerce/module-plenty-attribute [2.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility

### softcommerce/module-plenty-category [2.1.0]
- **Feature**: add runtime cache and mapping for category IDs

### softcommerce/module-plenty-category-profile [2.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility
- **Performance**: optimize export process and improve status reporting

### softcommerce/module-plenty-client [2.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility

### softcommerce/module-plenty-customer [2.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility

### softcommerce/module-plenty-customer-profile [2.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility

### softcommerce/module-plenty-item [2.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility

### softcommerce/module-plenty-item-profile [2.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility

### softcommerce/module-plenty-log [2.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility

### softcommerce/module-plenty-order [2.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility
- **Performance**: add composite index for order detection queries

### softcommerce/module-plenty-order-profile [2.1.0]
- **Feature**: add comprehensive order status change detection
- **Feature**: add automatic parent order status sync for credit notes
- **Feature**: enhance batch processing with comprehensive message tracking
- **Feature**: add intelligent status update system
- **Feature**: add incomplete order detection system
- **Feature**: add payment method filtering for invoice creation
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility

### softcommerce/module-plenty-profile [2.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility

### softcommerce/module-plenty-property [2.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility

### softcommerce/module-plenty-stock-profile [2.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility
- **Fix**: use resolved profile ID in stock collection queue handler

### softcommerce/module-profile [3.0.1]
- **Fix**: remove typed class constants for PHP 8.1/8.2 compatibility


# mage2plenty-suite [2.0.0] 07 Nov 2025

### Added
- **Feature**: PHP 8.4 compatibility across all modules
- **Feature**: Comprehensive Admin Notification system with real-time grid and severity levels
- **Feature**: Setup integration system with CLI and Admin UI wizard
- **Feature**: Profile auto-configuration with intelligent mapping suggestions
- **Feature**: CLI progress bars with entity-level tracking
- **Feature**: Product identifier mapping via custom attributes (use any attribute instead of SKU for product matching)
- **Feature**: Display variation ID and source code in Sales Order items
- **Feature**: Support for importing shipments with tracking IDs
- **Feature**: Live cron schedule monitoring UI
- **Feature**: HTML email templates
- **Feature**: Improved stock reservation calculation with accurate quantity tracking
- **Feature**: PlentyONE Stock Sync Status in product view page showing import processing status and quantity changes
- **Feature**: Inventory Reservations panel in product view page displaying reserved quantity per source with on-hand summary
- **Feature**: Automatic retry for failed order exports (highly requested feature for handling PlentyONE server downtime)
- **Feature**: Comprehensive stock listing at Catalog → Inventory → Stocks with reservation details
- **Feature**: Comprehensive reservation listing at Catalog → Inventory → Reservations with source code assignments
- **Feature**: New CLI commands: Map order relations, map item relations, map stock relations, show profile status, purge PlentyONE data
- **Feature**: MessageCollector replacing MessageStorage
- **Feature**: ProductDataRegistry system replacing SkuPool

### Changed
- **BREAKING CHANGE**: Minimum PHP version raised to 8.1
- **BREAKING CHANGE**: Consolidated 15 modules into parent modules (9 REST API modules, 4 Client modules, 3 Schedule modules)
- **BREAKING CHANGE**: API interfaces relocated to `Api/*` namespace (configuration interfaces specifically to `Api/Config`)
- **BREAKING CHANGE**: MessageStorage deprecated in favor of MessageCollector
- **Feature**: Implemented PHP 8.3 constructor property promotion across all modules
- **Feature**: Enhanced type safety with readonly properties
- **Feature**: Improved dependency injection using interfaces
- **Feature**: Refactored to ProcessorGuard pattern in profile module

### Fixed
- **Fix**: Order cancellation synchronization with PlentyONE
- **Fix**: Notification system compatibility with MessageCollector
- **Fix**: URL rewrite conflicts during import
- **Fix**: Race conditions in batch processing
- **Fix**: Token refresh logic for expired refresh tokens

### Removed
- Deprecated Processor architecture from core module
- Old wizard configurator
- 15 consolidated modules


# mage2plenty-suite [1.15.1] 20 Aug 2025

### softcommerce/module-plenty-order-profile [1.13.1]
- **Fix**: improve error messages for warehouse mapping issues

### softcommerce/module-plenty-stock-profile [1.7.6]
- **Fix**: resolve one-to-many warehouse mapping for multi-warehouse shipments


# mage2plenty-suite [1.15.0] 08 Aug 2025

### softcommerce/module-plenty-client [1.5.0]
- **Feature**: Add commands to create referrers

### softcommerce/module-plenty-customer-client [1.3.0]
- **Feature**: Improve customer data collection command

### softcommerce/module-plenty-item-client [1.4.0]
- **Feature**: Improve item data collection command

### softcommerce/module-plenty-log [1.3.0]
- **Feature**: Improve log collection and processing commands

### softcommerce/module-plenty-order-client [1.6.0]
- **Feature**: Improve order data collection command

### softcommerce/module-plenty-order-profile [1.13.0]
- **Feature**: Add commands to delete orders and payments

### softcommerce/module-plenty-stock-client [1.3.0]
- **Feature**: Improve stock data collection command


# mage2plenty-suite [1.14.1] 14 Jul 2025

### softcommerce/module-plenty-attribute [1.5.3]
- ## softcommerce/module-plenty-attribute [1.5.2] - **Enhancement**: Added a setup script to remove attribute entries from the `plenty_attribute_entity` table after migrating manufacturers to a dedicated table
- ## softcommerce/module-plenty-attribute [1.5.1] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-attribute [1.5.0] - **Feature**: Add attributes for manufacturer model to facilitate GPSR data for Product Safety Regulation [#40]
- ## softcommerce/module-plenty-attribute [1.4.2] - **Feature**: Introduce compatibility with `softcommerce/magento-core` module [#17]

### softcommerce/module-plenty-attribute-rest-api [1.2.10]
- ## softcommerce/module-plenty-attribute-rest-api [1.2.9] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-attribute-rest-api [1.2.8] - **Compatibility**: Added REST API collect functionality for compatability with GH feature: #40 [https://github.com/softcommerceltd/mage2plenty-os/issues/40]

### softcommerce/module-plenty-category [1.3.1]
- ## softcommerce/module-plenty-category [1.3.0] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-category [1.2.11] - **Feature**: Introduce compatibility with `softcommerce/magento-core` module [#17]

### softcommerce/module-plenty-category-profile [1.4.1]
- ## softcommerce/module-plenty-category-profile [1.4.0] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-category-profile [1.3.13] - **Compatibility**: Applied compatibility for profile common configuration paths [#27]

### softcommerce/module-plenty-category-profile-schedule [1.2.7]
- ## softcommerce/module-plenty-category-profile-schedule [1.2.6] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta

### softcommerce/module-plenty-category-rest-api [1.2.6]
- ## softcommerce/module-plenty-category-rest-api [1.2.5] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta

### softcommerce/module-plenty-client [1.4.5]
- ## softcommerce/module-plenty-client [1.4.4] - **Enhancement**: Improved the client token refresh logic to check if the refresh token has expired before using it. This prevents unnecessary login attempts and makes the token handling more robust. [#72]
- ## softcommerce/module-plenty-client [1.4.3] - **Enhancement**: Removed unused database schema declaration.
- ## softcommerce/module-plenty-client [1.4.2] - **Enhancement**: Added an option to clear client repository runtime cached data - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta

### softcommerce/module-plenty-client-rest-api [1.3.3]
- ## softcommerce/module-plenty-client-rest-api [1.3.2] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-client-rest-api [1.3.1] - **Fix**: SoftCommerce\PlentyClientRestApi\Model\Response\ConfigDataBuilder::buildItemArrayResponse(): Argument #1 ($item) must be of type array, string given #36

### softcommerce/module-plenty-customer [1.3.5]
- ## softcommerce/module-plenty-customer [1.3.4] - **Enhancement**: Removed unused database schema declaration.
- ## softcommerce/module-plenty-customer [1.3.3] - **Fix**: Fix Unique Constraints in Database Schema for Plenty Address Relations [#55]
- ## softcommerce/module-plenty-customer [1.3.2] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta

### softcommerce/module-plenty-customer-client [1.2.10]
- ## softcommerce/module-plenty-customer-client [1.2.9] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-customer-client [1.2.8] - **Enhancement**: Minor changes to codebase `SoftCommerce\PlentyCustomerClient\Model\AddressOptionTypeManagement`

### softcommerce/module-plenty-customer-profile [1.1.5]
- ## softcommerce/module-plenty-customer-profile [1.1.4] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-customer-profile [1.1.3] - **Compatibility**: Applied compatibility for profile common configuration paths [#27]

### softcommerce/module-plenty-customer-rest-api [1.2.8]
- ## softcommerce/module-plenty-customer-rest-api [1.2.7] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta

### softcommerce/module-plenty-item [1.6.2]
- ## softcommerce/module-plenty-item [1.6.1] - **Enhancement** Add isShippingType() Method to Plenty Item Modules [#69]
- ## softcommerce/module-plenty-item [1.6.0] - **Feature**: Allow Export of "Not Visible Individually" Products to PlentyMarkets [#66] - **Enhancement**: Add Pagination to Product Chooser Modal in Product Export Listing [#65]
- ## softcommerce/module-plenty-item [1.5.1] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-item [1.5.0] - **Feature**: Introduce a feature to delete local item storage from admin UI [#23]
- ## softcommerce/module-plenty-item [1.4.8] - **Enhancement**: Added new methods to `SoftCommerce\PlentyItem\Model\Service\SaveProductItemVariationIdMappingInterface`

### softcommerce/module-plenty-item-client [1.3.1]
- ## softcommerce/module-plenty-item-client [1.3.0] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-item-client [1.2.10] - **Enhancement**: Remove `stock_warehouse_dimension, stock_warehouse_location and stock_warehouse_location_details` configs from client data collection process

### softcommerce/module-plenty-item-profile [1.13.2]
- ## softcommerce/module-plenty-item-profile [1.13.1] - **Fix**: Resolved an issue where the image import process would stop prematurely if the `namesData` array was empty. The logic has been adjusted to ensure the process continues, allowing for more flexible image handling. [#71]
- ## softcommerce/module-plenty-item-profile [1.13.0] - **Feature**: Allow Export of "Not Visible Individually" Products to PlentyMarkets [#66]
- ## softcommerce/module-plenty-item-profile [1.12.0] - **Feature**: New CLI Command to Clear Product Mappings [#61] - **Fix**: Override Configurable Attribute Values on Product Export [#60]
- ## softcommerce/module-plenty-item-profile [1.11.3] - **Compatibility**: Proper Cache Invalidation for Varnish After Product Import [#59]
- ## softcommerce/module-plenty-item-profile [1.11.2] - **Enhancement**: Validation error found :: attribute values do not match the other variations [#57]
- ## softcommerce/module-plenty-item-profile [1.11.1] - **Enhancement**: Removed unused database schema declaration.
- ## softcommerce/module-plenty-item-profile [1.11.0] - **Enhancement**: Optimize Image Handling to Prevent Unnecessary Downloads During Item and Variation Collection [#51]
- ## softcommerce/module-plenty-item-profile [1.10.0] - **Enhancement**: Added an enhancement to accurately align the import of image sort orders with the data in the PlentyONE system. This change ensures that images maintain the correct sequence and display order based on PlentyONE's configuration. [#44] - **Enhancement**: Introduced an enhancement to correctly remove outdated super attributes from configurable products. Previously, old configuration attributes remained in the system even after being deleted in PlentyONE, causing inconsistencies. This update ensures that any attributes removed in PlentyONE are now properly deleted and no longer remain in the system. [#43] - **Fix**: Applied a fix for TypeError: str_replace(): Argument #3 ($subject) must be of type array|string, null given in softcommerce/module-plenty-item-profile/Ui/Component/Form/PlentyAttributeOptions.php:50
- ## softcommerce/module-plenty-item-profile [1.9.3] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-item-profile [1.9.2] - **Fix**: TypeError: SoftCommerce\PlentyItemProfile\Model\ItemExportService\Processor\Item::retrieveSkuByItemId() must be of type array, string given [#30]
- ## softcommerce/module-plenty-item-profile [1.9.1] - **Compatibility**: Applied compatibility for profile common configuration paths [#27]
- ## softcommerce/module-plenty-item-profile [1.9.0] - **Feature**: Introduce a feature to map product SKUs to Item and Variation IDs [#24] - **Feature**: Introduce a feature to schedule item collect process from the admin UI [#22] - **Fix**: Add a fix for duplicate client images deletion functionality [#18]
- ## softcommerce/module-plenty-item-profile [1.8.3] - **Enhancement**: An option to configure media image export type. E.g. Images can be exported by providing either a direct URL or a base64 encoded image data. [#21] - **Enhancement**: Allow mapping properties with type scope global to attributes with type scope website/store [#20] - **Fix**: Fix massaction responsible for deleting client items externally [#19] - **Enhancement**: Add an option to resolve duplicate client images [#18]
- ## softcommerce/module-plenty-item-profile [1.8.2] - **Feature**: Introduce compatibility with `softcommerce/magento-core` module [#17]

### softcommerce/module-plenty-item-profile-schedule [1.3.2]
- ## softcommerce/module-plenty-item-profile-schedule [1.3.1] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta

### softcommerce/module-plenty-item-rest-api [1.3.2]
- ## softcommerce/module-plenty-item-rest-api [1.3.1] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta

### softcommerce/module-plenty-log [1.2.9]
- ## softcommerce/module-plenty-log [1.2.8] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta

### softcommerce/module-plenty-order [1.5.3]
- ## softcommerce/module-plenty-order [1.5.2] - **Feature**: Added support for order comments, allowing comments to be stored and retrieved with order data. [#70]
- ## softcommerce/module-plenty-order [1.5.1] - **Enhancement**: Apply Descending Sort Order to getOrdersById Interface Collection [#56]
- ## softcommerce/module-plenty-order [1.5.0] - **Feature**: Added functionality to refresh sales order grid using CLI [#45]
- ## softcommerce/module-plenty-order [1.4.2] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta

### softcommerce/module-plenty-order-client [1.5.1]
- ## softcommerce/module-plenty-order-client [1.5.0] - **Feature**: Compatibility with shipping tracking functionality [#52]
- ## softcommerce/module-plenty-order-client [1.4.2] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-order-client [1.4.1] - **Enhancement**: Remove `stock_warehouse_dimension, stock_warehouse_location and stock_warehouse_location_details` configs from client data collection process

### softcommerce/module-plenty-order-profile [1.12.1]
- ## softcommerce/module-plenty-order-profile [1.12.0]
- ## softcommerce/module-plenty-order-profile [1.11.1] - **Fix** Support Multiple Tracking Numbers in Order Shipping Import [#68] - **Enhancement** Ensure Sales Order Grid Reindexing for Orders Skipped by Export [#67]
- ## softcommerce/module-plenty-order-profile [1.11.0] - **Feature**: Option to Exclude Warehouse Assignment on Order Line Items [#62]
- ## softcommerce/module-plenty-order-profile [1.10.2] - **Fix** Ensure Customer Address Relation Is Always Assigned [#58]
- ## softcommerce/module-plenty-order-profile [1.10.1] - **Enhancement** Added the ability to conditionally add product options to order line items based on defined rules.
- ## softcommerce/module-plenty-order-profile [1.10.0] - **Feature**: Add Support for Exporting Shipment Tracking Information from Magento to Plenty [#52] - **Feature**: Implement Channel-Based Restrictions for Order Export Functionality [#50]
- ## softcommerce/module-plenty-order-profile [1.9.2] - **Enhancement**: A fix has been implemented to correct VAT rate exports for order items. Previously, bundle items without a VAT reference in the Magento sales order table were mistakenly exported with a 0% VAT rate, and this update ensures the correct rate is now exported. [#49]
- ## softcommerce/module-plenty-order-profile [1.9.1] - **Enhancement**: Optimized stock source assignment: Orders with default stock sources now reference item configuration for reservation checks, reducing resource overhead. [#48]
- ## softcommerce/module-plenty-order-profile [1.9.0] - **Feature**: Added new feature to map PlentyONE and Magento orders using CLI [#46]
- ## softcommerce/module-plenty-order-profile [1.8.2] - **Enhancement**: Applied a fix to resolved an issue affecting orders from third-party sales channels. These orders were getting stuck in the scheduling queue repeatedly because their status wasn't updating properly after processing. This caused the system to attempt processing them over and over without success. The fix ensures that the status updates correctly, preventing orders from being stuck and allowing them to move through the system smoothly
- ## softcommerce/module-plenty-order-profile [1.8.1] -- **Fix**: SourceItemRepository::getQtyPhysical(): Argument #2 ($sourceCode) must be of type string, null given, called in /../softcommerce/module-plenty-order-profile/Model/OrderImportService/Generator/Shipment.php on line 247 [#42]
- ## softcommerce/module-plenty-order-profile [1.8.0] - **Feature**: Added an option to export product options for orders #41 - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-order-profile [1.7.6] - **Enhancement**: Improvements to shipment creation for out of stock items [#39]
- ## softcommerce/module-plenty-order-profile [1.7.5] - **Enhancement**: Added an option to control the export of order shipping profiles [#35]
- ## softcommerce/module-plenty-order-profile [1.7.4] - **Enhancement**: Added a functionality to handle cancelled order status synchronisation [#34]
- ## softcommerce/module-plenty-order-profile [1.7.3] - **Enhancement**: Generate unique ID for guest customers that is required for PM contact number [#28] - **Compatibility**: Applied compatibility for profile common configuration paths [#27]

### softcommerce/module-plenty-order-profile-schedule [1.3.2]
- ## softcommerce/module-plenty-order-profile-schedule [1.3.1] - **Enhancement**: Efficient Order Export Using Status Filters [#63]
- ## softcommerce/module-plenty-order-profile-schedule [1.3.0] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta
- ## softcommerce/module-plenty-order-profile-schedule [1.2.15] - **Enhancement**: Added an interception plugin to handle order cancellation synchronisation [#34]
- ## softcommerce/module-plenty-order-profile-schedule [1.2.14] - **Enhancement**: Added order cancel event to handle cancelled order status synchronisation [#34]

### softcommerce/module-plenty-order-rest-api [1.4.1]
- ## softcommerce/module-plenty-order-rest-api [1.4.0] - **Feature**: Compatibility with shipping tracking functionality [#52]
- ## softcommerce/module-plenty-order-rest-api [1.3.1] - **Compatibility**: Added compatibility for PHP 8.4 and Magento 2.4.8-beta

### softcommerce/module-plenty-profile [1.5.3]
- ## softcommerce/module-plenty-profile [1.5.2] - **Enhancement**: Removed unused database schema declaration.
- ## softcommerce/module-plenty-profile [1.5.1] - **Enhancement**: Included `servicepoint` type to account for `pakshop` facility.
- ## softcommerce/module-plenty-profile [1.5.0] - **Feature**: Profiles that share common configuration paths can now be saved simultaneously from any profile [#27]
- Added release auto generation

### softcommerce/module-plenty-property [1.3.9]
- ## softcommerce/module-plenty-property [1.3.8] - **Enhancement**: Removed unused database schema declaration.
- ## softcommerce/module-plenty-property [1.3.7] - **Enhancement**: Included `servicepoint` type to account for `pakshop` facility.
- ## softcommerce/module-plenty-property [1.3.6] - **Fix**: Argument #1 ($responseItem) must be of type array, string given in SoftCommerce\PlentyProperty\Profile\PropertyExportService\Processor\BatchProcessor::retrievePropertyId() [#31]
- ## softcommerce/module-plenty-property [1.3.5] - **Enhancement**: An option to override `isGlobal` condition in `SoftCommerce\PlentyProperty\Model\AttributeToPropertyTypeMappingInterface::getPropertyTypeByAttribute`
- ## softcommerce/module-plenty-property [1.3.4] - **Feature**: Introduce compatibility with `softcommerce/magento-core` module [#17]

### softcommerce/module-plenty-property-rest-api [1.2.8]
- ## softcommerce/module-plenty-property-rest-api [1.2.7] - **Enhancement**: Included `servicepoint` type to account for `pakshop` facility.

### softcommerce/module-plenty-rest-api [1.3.10]
- ## softcommerce/module-plenty-rest-api [1.3.9] - **Enhancement**: Enhance Batch Request Method to Allow Grouping Responses by Resource URI [#53]
- ## softcommerce/module-plenty-rest-api [1.3.8] - **Enhancement**: Included `servicepoint` type to account for `pakshop` facility.
- ## softcommerce/module-plenty-rest-api [1.3.7] - **Fix**: Argument #1 ($item) must be of type array, string given in SoftCommerce\PlentyCustomerRestApi\Model\Response\AddressDataBuilder::buildItemResponse(): [#32]

### softcommerce/module-plenty-stock [1.4.3]
- ## softcommerce/module-plenty-stock [1.4.2] - **Enhancement**: Removed unused database schema declaration.
- ## softcommerce/module-plenty-stock [1.4.1] - **Enhancement**: Created new interface for item stock configuration that allows quick verification of stock management status. This enhancement optimizes the overall efficiency of stock management within our system. [#47]
- ## softcommerce/module-plenty-stock [1.4.0] - **Enhancement**: Included `servicepoint` type to account for `pakshop` facility.
- ## softcommerce/module-plenty-stock [1.3.9] - **Enhancement**: Improvements to Order Item source selection algorithm [#38]
- ## softcommerce/module-plenty-stock [1.3.8] - **Fix**: Too few arguments to function SoftCommerce\PlentyStock\Model\GetOrderItemSourceSelection::generateInventoryRequest() 3 passed, exactly 4 [#33]
- ## softcommerce/module-plenty-stock [1.3.7] - **Enhancement**: Addressed minor performance improvements for `SoftCommerce\PlentyStock\Model\GetOrderItemSourceSelection::generateInventoryRequest()`

### softcommerce/module-plenty-stock-client [1.2.10]
- ## softcommerce/module-plenty-stock-client [1.2.9] - **Enhancement**: Included `servicepoint` type to account for `pakshop` facility.

### softcommerce/module-plenty-stock-profile [1.7.4]
- ## softcommerce/module-plenty-stock-profile [1.7.3] - **Enhancement**: Minor codebase style improvements.
- ## softcommerce/module-plenty-stock-profile [1.7.2] - **Enhancement**: Included `servicepoint` type to account for `pakshop` facility.
- ## softcommerce/module-plenty-stock-profile [1.7.1] - **Enhancement**: Improvements to Order Item source selection algorithm [#38]
- ## softcommerce/module-plenty-stock-profile [1.7.0] - **Compatibility**: Applied compatibility for profile common configuration paths [#27] - **Feature**: Introduce custom Source Selection Algorithm to achieve precise NET calculation by accounting for reservations [#26]

### softcommerce/module-plenty-stock-profile-schedule [1.3.1]
- ## softcommerce/module-plenty-stock-profile-schedule [1.3.0] - **Enhancement**: Included `servicepoint` type to account for `pakshop` facility.
- ## softcommerce/module-plenty-stock-profile-schedule [1.2.10] - **Fix** CRITICAL: Message has been rejected: Profile ID is not set [#37]

### softcommerce/module-plenty-stock-rest-api [1.2.9]
- ## softcommerce/module-plenty-stock-rest-api [1.2.8] - **Enhancement**: Included `servicepoint` type to account for `pakshop` facility.

### softcommerce/module-profile-config [1.3.1]
- ## softcommerce/module-profile-config [1.3.0] - **Enhancement**: Included `servicepoint` type to account for `pakshop` facility.
- ## softcommerce/module-profile-config [1.2.13] - **Fix**: Apply a fix where profile config scope writer saves value as array opposed to serialised data [#29]

### softcommerce/module-profile-history [1.2.10]
- ## softcommerce/module-profile-history [1.2.9] - **Enhancement**: Included `servicepoint` type to account for `pakshop` facility.

### softcommerce/module-profile-queue [2.0.0]
- **BREAKING CHANGE**: feat!: add PHP 8.3/8.4 compatibility and modernize queue module
- Merge dev-v2.0.0 into master for v2.0.0 release

### softcommerce/module-profile-schedule [2.0.0]
- **BREAKING CHANGE**: feat!: upgrade to PHP 8.1+ with comprehensive modernization
- **BREAKING CHANGE**: feat!: add PHP 8.3/8.4 compatibility and modernize schedule module
- **Feature**: add comprehensive cron schedule monitoring UI


# Mage2PlentyOs [1.14.0] 10 Jul 2025

### softcommerce/module-plenty-client [1.4.4]
- **Enhancement**: Improved the client token refresh logic to check if the refresh token has expired before using it. This prevents unnecessary login attempts and makes the token handling more robust. [#72]

### softcommerce/module-plenty-item-profile [1.13.1]
- **Fix**: Resolved an issue where the image import process would stop prematurely if the `namesData` array was empty. The logic has been adjusted to ensure the process continues, allowing for more flexible image handling. [#71]

### softcommerce/module-plenty-order [1.5.2]
- **Feature**: Added support for order comments, allowing comments to be stored and retrieved with order data. [#70]

### softcommerce/module-plenty-order-profile [1.12.0]

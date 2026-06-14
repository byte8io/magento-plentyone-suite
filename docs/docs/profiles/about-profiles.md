---
sidebar_position: 1
title: About Profiles
description: Understanding profiles and how they manage data synchronization between Magento and PlentyONE
---

# About Profiles

Profiles are the core mechanism for managing data synchronization between Magento 2 and PlentyONE. They provide a flexible, configurable way to automate bidirectional data exchange with minimal manual effort.

## What Are Profiles?

A **Profile** is a configured synchronization task that defines:

- **What data** to synchronize (products, orders, categories, stock, customers)
- **Which direction** to sync (import from PlentyONE, export to PlentyONE, or bidirectional)
- **How to process** the data (field mappings, transformations, filters)
- **When to run** (manual execution, scheduled cron, or event-triggered)

Think of profiles as "sync jobs" that handle specific data transfer operations between your Magento store and PlentyONE ERP system.

## How Profiles Work

### Data Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │ Export  │             │ Import  │             │
│   Magento   │────────>│   Profile   │────────>│  PlentyONE  │
│             │         │             │         │             │
│             │<────────│   (Sync)    │<────────│             │
│             │ Import  │             │ Export  │             │
└─────────────┘         └─────────────┘         └─────────────┘
```

### Execution Flow

1. **Trigger**: Profile execution starts (manual, cron, or event)
2. **Collect**: Retrieve data from source system via API/database
3. **Transform**: Apply mappings, filters, and business logic
4. **Validate**: Check data integrity and requirements
5. **Process**: Transfer data to destination system
6. **Update**: Sync status, create entities, update records
7. **Log**: Record results, errors, and execution details

### Profile Lifecycle

```
[Created] → [Configured] → [Tested] → [Active] → [Running] → [Completed]
                ↓                          ↓          ↓
            [Disabled]                [Paused]   [Failed]
```

- **Created**: Profile exists but not configured
- **Configured**: Settings defined, ready for testing
- **Tested**: Validated with test execution
- **Active**: Enabled and available for execution
- **Running**: Currently processing data
- **Completed**: Execution finished successfully
- **Disabled**: Temporarily deactivated
- **Paused**: Execution halted mid-process
- **Failed**: Execution encountered fatal error

## Profile Types

Mage2Plenty includes several pre-configured profile types:

### Category Profiles

| Profile Type | Direction | Purpose |
|-------------|-----------|---------|
| **Category Import** | PlentyONE → Magento | Import category structure from PlentyONE |
| **Category Export** | Magento → PlentyONE | Export Magento categories to PlentyONE |

**Use Cases**:
- Initial category structure setup
- Maintaining consistent category hierarchy
- Adding new categories from PlentyONE
- Syncing category names and descriptions

### Product (Item) Profiles

| Profile Type | Direction | Purpose |
|-------------|-----------|---------|
| **Product Import** | PlentyONE → Magento | Import products from PlentyONE catalog |
| **Product Export** | Magento → PlentyONE | Export Magento products to PlentyONE |

**Use Cases**:
- Initial product catalog import
- New product additions
- Product detail updates (prices, descriptions, images)
- Variant/configurable product management
- Attribute synchronization

### Order Profiles

| Profile Type | Direction | Purpose |
|-------------|-----------|---------|
| **Order Import** | PlentyONE → Magento | Import orders from PlentyONE (marketplace orders) |
| **Order Export** | Magento → PlentyONE | Export Magento orders to PlentyONE for fulfillment |

**Use Cases**:
- Export Magento web orders to PlentyONE for processing
- Import marketplace orders (Amazon, eBay) from PlentyONE
- Order status synchronization
- Shipment tracking updates
- Invoice data exchange

### Stock Profiles

| Profile Type | Direction | Purpose |
|-------------|-----------|---------|
| **Stock Import** | PlentyONE → Magento | Import inventory levels from PlentyONE |

**Use Cases**:
- Real-time stock level updates
- Multi-warehouse inventory sync
- Stock reservation management
- Backorder status updates

### Customer Profiles

| Profile Type | Direction | Purpose |
|-------------|-----------|---------|
| **Customer Import** | PlentyONE → Magento | Import customer data from PlentyONE |
| **Customer Export** | Magento → PlentyONE | Export Magento customers to PlentyONE |

**Use Cases**:
- Customer account synchronization
- Address book updates
- Customer group mapping
- B2B customer management

## Profile Architecture

### Components

Each profile consists of several key components:

#### 1. Profile Entity

The main profile record containing:
- **Profile ID**: Unique identifier
- **Name**: Human-readable profile name
- **Type ID**: Profile type identifier (e.g., `plenty_item_import`)
- **Status**: Current status (enabled/disabled)
- **Created At**: Creation timestamp
- **Updated At**: Last modification timestamp

#### 2. Configuration

Profile-specific settings:
- **Store Mapping**: Which Magento stores to sync
- **Client Mapping**: PlentyONE client/warehouse association
- **Field Mappings**: Attribute to property mappings
- **Filters**: Data selection criteria
- **Options**: Profile-specific behavior settings

#### 3. Schedule

Automated execution settings:
- **Cron Expression**: When to run (e.g., `*/15 * * * *` for every 15 minutes)
- **Time Zone**: Execution time zone
- **Enabled**: Schedule active/inactive

#### 4. History

Execution tracking:
- **Execution ID**: Unique execution identifier
- **Start Time**: When execution started
- **End Time**: When execution completed
- **Status**: Success/failure/partial
- **Processed Count**: Number of records processed
- **Error Count**: Number of errors
- **Messages**: Execution log messages

#### 5. Queue

Asynchronous processing:
- **Queue Name**: Message queue identifier
- **Priority**: Execution priority
- **Max Retries**: Retry attempts for failures
- **Consumer**: Background worker processing queue

### Data Storage

Profiles store data in several database tables:

| Table | Purpose |
|-------|---------|
| `byte8_profile_entity` | Main profile records |
| `byte8_profile_config` | Profile configuration |
| `byte8_profile_schedule` | Cron schedule settings |
| `byte8_profile_history` | Execution history |
| `byte8_profile_queue` | Async queue messages |
| `plenty_*_entity` | Synced entity data (products, orders, etc.) |

## Profile Features

### Flexible Scheduling

Profiles support multiple execution methods:

**Manual Execution**:
- Run on-demand from admin panel
- Execute via CLI commands
- Trigger from custom code

**Cron Scheduling**:
- Standard cron expressions
- Multiple schedules per profile
- Time zone support
- Execution window restrictions

**Event-Driven**:
- Triggered by Magento events (order placed, product saved)
- API webhooks from PlentyONE
- Custom event observers

### Data Mapping

Sophisticated mapping capabilities:

**Field Mapping**:
- Magento attributes ↔ PlentyONE properties
- Custom attribute mapping
- Multi-language support
- Default value assignment

**Value Transformation**:
- Data type conversion
- Format standardization
- Unit conversion (currency, measurements)
- Custom transformation logic

**Conditional Logic**:
- IF-THEN rules
- Data validation
- Filter conditions
- Business rule enforcement

### Error Handling

Robust error management:

**Retry Logic**:
- Automatic retry on transient failures
- Configurable retry attempts
- Exponential backoff
- Dead letter queue for permanent failures

**Error Logging**:
- Detailed error messages
- Stack traces for debugging
- Error categorization (critical, warning, info)
- Email notifications for critical errors

**Partial Processing**:
- Continue processing on item-level failures
- Rollback support for batch operations
- Transaction management
- Data integrity protection

### Performance Optimization

Built-in performance features:

**Batch Processing**:
- Process multiple records per request
- Configurable batch sizes
- Memory management
- Progress tracking

**Async Processing**:
- Message queue support
- Background workers
- Non-blocking operations
- Scalable architecture

**Caching**:
- Configuration caching
- API response caching
- Entity data caching
- Cache invalidation strategies

**Rate Limiting**:
- API call throttling
- Respect PlentyONE rate limits
- Adaptive rate adjustment
- Queue-based pacing

## Pre-Installed Profiles

Mage2Plenty includes 7 pre-configured profiles:

### 1. Category Export

**Type ID**: `plenty_category_export`
**Direction**: Magento → PlentyONE
**Purpose**: Export Magento category structure to PlentyONE

**Default Configuration**:
- Exports all active categories
- Maintains category hierarchy
- Syncs category names and descriptions
- Maps to PlentyONE category IDs

### 2. Category Import

**Type ID**: `plenty_category_import`
**Direction**: PlentyONE → Magento
**Purpose**: Import PlentyONE categories to Magento

**Default Configuration**:
- Imports all PlentyONE categories
- Creates Magento category structure
- Syncs multi-language names
- Maintains parent-child relationships

### 3. Product Export

**Type ID**: `plenty_item_export`
**Direction**: Magento → PlentyONE
**Purpose**: Export Magento products to PlentyONE

**Default Configuration**:
- Exports simple and configurable products
- Syncs product attributes
- Uploads product images
- Maps prices and stock

### 4. Product Import

**Type ID**: `plenty_item_import`
**Direction**: PlentyONE → Magento
**Purpose**: Import PlentyONE items to Magento

**Default Configuration**:
- Imports items and variations
- Creates Magento products
- Downloads and assigns images
- Sets prices and stock levels

### 5. Order Export

**Type ID**: `plenty_order_export`
**Direction**: Magento → PlentyONE
**Purpose**: Export Magento orders to PlentyONE for fulfillment

**Default Configuration**:
- Exports new orders automatically
- Syncs customer data
- Maps payment methods
- Maps shipping methods

### 6. Order Import

**Type ID**: `plenty_order_import`
**Direction**: PlentyONE → Magento
**Purpose**: Import PlentyONE orders to Magento

**Default Configuration**:
- Imports marketplace orders
- Creates Magento orders
- Assigns payment method
- Sets order status

### 7. Stock Import

**Type ID**: `plenty_stock_import`
**Direction**: PlentyONE → Magento
**Purpose**: Import stock levels from PlentyONE

**Default Configuration**:
- Imports stock quantities
- Updates Magento inventory
- Supports Multi-Source Inventory (MSI)
- Maps warehouse to stock source

## Profile Uniqueness

:::warning One Profile Per Type
Profiles are **unique by type**. You can only have ONE profile of each type in the system.

For example, you cannot create two "Product Import" profiles. If you need different import scenarios, use:
- **Filters** to control which data is processed
- **Store mappings** to sync to different stores
- **Configuration options** to customize behavior
:::

**Why This Limitation?**
- Prevents duplicate processing
- Ensures data consistency
- Simplifies scheduling
- Avoids conflicts

**Workaround for Multiple Scenarios**:
- Use filters to create different data subsets
- Schedule different execution times
- Use CLI with parameters for variations

## Profile Management

### Admin Interface

Access profiles via: **Byte8 → PlentyONE → Profiles**

**Available Actions**:
- **View**: See profile details
- **Edit**: Modify configuration
- **Execute**: Run manually
- **Schedule**: Configure cron
- **Disable**: Temporarily deactivate
- **Delete**: Remove profile (use with caution)
- **View History**: See execution logs
- **Export Config**: Download configuration

## Best Practices

### Profile Configuration

1. **Start Simple**: Begin with basic configuration, add complexity gradually
2. **Test Thoroughly**: Use test data before enabling on production
3. **Document Changes**: Keep notes on custom mappings and logic
4. **Version Control**: Export configurations for backup

### Scheduling

1. **Avoid Peak Times**: Schedule resource-intensive profiles during off-peak hours
2. **Stagger Executions**: Don't run all profiles simultaneously
3. **Monitor Performance**: Track execution times and adjust schedules
4. **Set Realistic Intervals**: Balance data freshness with system load

### Data Integrity

1. **Use Filters**: Process only necessary data
2. **Validate Before Sync**: Implement pre-sync validation
3. **Monitor Errors**: Review error logs regularly
4. **Test Rollback**: Ensure you can undo changes if needed

### Performance

1. **Optimize Batch Sizes**: Find the sweet spot for your data volume
2. **Enable Caching**: Use configuration and data caching
3. **Use Async Processing**: Enable queue processing for large operations
4. **Monitor Resources**: Track CPU, memory, and database usage

### Security

1. **Restrict Access**: Limit who can create/modify profiles
2. **Audit Changes**: Review profile modification logs
3. **Secure Credentials**: Use encrypted configuration
4. **Monitor API Usage**: Track unusual activity patterns

## Monitoring and Troubleshooting

### Monitoring Profiles

**Key Metrics**:
- Execution frequency and duration
- Success/failure rates
- Records processed per execution
- Error counts and types
- API call volume
- Resource utilization

**Monitoring Tools**:
- Profile history dashboard
- Execution logs
- Email notifications
- Custom monitoring integration

### Common Issues

**Profile Not Executing**:
- Check cron is running
- Verify schedule is enabled
- Review profile status
- Check for errors in cron_schedule table

**Partial Data Sync**:
- Review filters and conditions
- Check data validation rules
- Verify field mappings
- Review error logs for failed items

**Performance Issues**:
- Reduce batch size
- Increase timeout values
- Enable async processing
- Optimize database queries

**Data Inconsistencies**:
- Verify mapping configuration
- Check for duplicate records
- Review transformation logic
- Validate data sources

## Next Steps

Now that you understand profiles:

1. 📝 **[Creating a Profile](/docs/profiles/create-profile)** - Learn how to create and configure profiles
2. 📊 **[Product Import](/docs/profiles/product-import)** - Configure product synchronization
3. 🛒 **[Order Export](/docs/profiles/order-export)** - Set up order processing
4. 📈 **[Stock Import](/docs/profiles/stock-import)** - Maintain inventory levels
5. ⏰ **[Scheduling](/docs/profiles/scheduling)** - Automate profile execution

## Related Documentation

- [Configuration Overview](/docs/configuration/overview)
- [Profile Configuration](/docs/configuration/profile-configuration)
- [Initial Setup Wizard](/docs/configuration/initial-setup)
- [Troubleshooting Profiles](/docs/troubleshooting/profile-issues)
- [CLI Commands](/docs/cli-commands)
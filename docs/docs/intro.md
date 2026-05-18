---
sidebar_position: 1
title: Getting Started
description: Get started with Mage2Plenty - Enterprise Magento 2 to PlentyONE Integration
---

# Getting Started with Mage2Plenty

Welcome to **Mage2Plenty** - the enterprise-grade connector that seamlessly integrates your Magento 2 e-commerce platform with PlentyONE ERP system.

:::danger Upgrading to v2.0.0? Important Information
**Mage2Plenty v2.0.0 is a major release with breaking changes.**

If you're upgrading from v1.x, please read the [v1.x to v2.0.0 Migration Guide](/docs/installation/upgrade-v1-to-v2) before updating. This version includes module consolidation that requires manual composer.json changes.

**Key Changes:**
- 15 modules consolidated (e.g., `module-plenty-*-rest-api` merged into parent modules)
- PHP 8.1+ required (PHP 8.0 no longer supported)
- Profile Notification system with email alerts and monitoring
- Product Mapping Identifier - choose attribute for matching PlentyONE variations
- RabbitMQ support for async processing
- New Setup Wizard for streamlined configuration
- 100x faster imports for large catalogs

[Read the full migration guide →](/docs/installation/upgrade-v1-to-v2)
:::

## What is Mage2Plenty?

Mage2Plenty is a powerful, bi-directional integration solution that automates critical business processes between Magento 2 and PlentyONE. It eliminates manual data entry, reduces errors, and ensures data consistency across both platforms.

### Key Features

- 📦 **Product Synchronization** - Sync products, categories, attributes, and media
- 📊 **Inventory Management** - Real-time stock updates with MSI support
- 🛒 **Order Processing** - Automated order export and status updates
- 👥 **Customer Sync** - Keep customer data synchronized across platforms
- ⚙️ **Flexible Configuration** - Comprehensive admin panel for mappings and rules
- 🚀 **Enterprise Ready** - Built for scale with multi-store support

## What You'll Need

Before you begin, make sure you have:

1. **Mage2Plenty License** - [Purchase the extension](https://mage2plenty.com/magento2-plentymarkets-connector/) for your Magento edition
2. **[System Requirements](/docs/system-requirements)** - Check if your environment meets all requirements
3. **PlentyONE Account** - Active PlentyONE account with API access
4. **Magento 2.4.4+** - Compatible Magento installation
5. **Composer** - For installing the extension

## Quick Start

Follow these steps to get Mage2Plenty up and running. **Complete all 7 steps** for a successful integration.

### Step 1: Check System Requirements

First, verify your system meets all [requirements](/docs/system-requirements):

- Magento 2.4.4 or higher
- PHP 8.1 or higher
- MySQL 8.0 or MariaDB 10.6
- Required PHP extensions (including curl, json, openssl, xml, zip, mbstring)

### Step 2: Install Mage2Plenty Connector

#### Setup Composer Repository

After purchasing the extension, you'll receive access to a private Composer repository:

```bash
# Add the private repository
composer config repositories.private-packagist composer https://softcommerce.repo.packagist.com/your-repository-name/

# Setup authentication (use token as username)
composer config --global --auth http-basic.softcommerce.repo.packagist.com token your-access-token
```

#### Install the Package

For **Magento Open Source**:
```bash
composer require softcommerce/mage2plenty-os
```

For **Adobe Commerce**:
```bash
composer require softcommerce/mage2plenty-ac
```

#### Complete Installation

```bash
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy
bin/magento cache:flush
```

For detailed installation instructions, see:
- [Composer Installation Guide](/docs/installation/composer-installation) - For direct purchases
- [Marketplace Installation Guide](/docs/installation/marketplace-composer-installation) - For Magento Marketplace purchases

### Step 3: Configure Client Connection

Configure your PlentyONE API connection using the interactive setup wizard:

```bash
bin/magento plenty:setup:client
```

This wizard will guide you through:
- PlentyONE API credentials (URL, Client ID, username, password)
- Core system settings (logging, mail notifications)
- REST API connection parameters
- Automatic connection testing

Or configure manually via admin panel at **SoftCommerce → PlentyONE → Manage Client Connection**

### Step 4: Configure Profile System & Notifications

Set up profile execution settings and notification system:

```bash
bin/magento plenty:setup:profile:system
```

This configures:
- Profile history retention
- Notification settings and log levels
- Email alerts for critical errors
- Batch notification intervals
- Performance settings

### Step 5: Collect Configuration Data from PlentyONE

Collect essential configuration data (referrers, shipping methods, VAT rates, etc.):

```bash
bin/magento plenty:setup:collect:config
```

This retrieves system configuration from PlentyONE including:
- Referrers and order referrers
- Shipping profiles and methods
- VAT configurations
- Payment methods
- Warehouses and stock sources

### Step 6: Create System Attributes in PlentyONE

Create required system properties and attributes in PlentyONE:

```bash
bin/magento plenty:setup:create
```

This creates:
- Default referrer and media type referrers
- Customer properties
- Item properties (attribute sets, property groups)
- Order properties

:::tip Quick Setup
**Steps 5 and 6 can be run together** using the orchestrator command:

```bash
bin/magento plenty:setup:init
```

This automatically executes both `plenty:setup:collect:config` and `plenty:setup:create` in the correct order.

Options:
- `--modules=referrer,customer,item,order` - Setup specific modules only
- `--skip-collect` - Only create properties (skip collection)
- `--skip-create` - Only collect config (skip creation)
- `--dry-run` - Preview what will be done
:::

### Step 7: Collect Initial Data from PlentyONE

Collect business data from PlentyONE (attributes, properties, categories, etc.):

```bash
bin/magento plenty:setup:collect:data
```

This collects:
- Attributes and attribute sets
- Properties and property groups
- Categories and category structures
- Product data (optional)
- Customer data (optional)

:::info
After collecting data, you can map and configure it in the Magento Admin panel under **SoftCommerce → PlentyONE**.
:::

### Verification Steps

After completing the setup, verify everything is working:

```bash
# Run system check
bin/magento plenty:system:check

# Test PlentyONE connection
bin/magento plenty:client:test

# Flush cache
bin/magento cache:flush
```

## What's Next?

Now that setup is complete, configure your integration profiles:

- 📖 **[Setup Auto-Configuration](/docs/profiles/setup-auto-config)** - Automatically configure profiles
- 🔧 **[Product Import Profile](/docs/profiles/product-import)** - Configure product synchronization
- 📦 **[Order Export Profile](/docs/profiles/order-export)** - Setup order processing
- 📊 **[Stock Import Profile](/docs/profiles/stock-import)** - Configure inventory sync
- 👥 **[Customer Sync](/docs/profiles/customer-import)** - Setup customer synchronization
- 📚 **[All Profiles](/docs/profiles/about-profiles)** - Explore all available profiles

## Need Help?

- 📧 **Email Support**: support@softcommerce.io
- 📞 **Phone**: +44 2080 587 795 (GMT working hours)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/softcommerceltd/mage2plenty-os/issues)
- 📖 **Documentation**: Browse this site for comprehensive guides

## Video Tutorial

:::warning Outdated Content
This video shows a previous version of the setup process. While the core configuration concepts and form fields remain similar, **the setup wizard interface and workflow have changed**. Follow the written documentation above for current instructions.

**What's Still Relevant:**
- ✅ Configuration form fields and their purposes
- ✅ PlentyONE credential requirements
- ✅ Connection testing concepts
- ✅ General setup workflow

**What's Changed:**
- ❌ New CLI wizards available (`bin/magento plenty:setup:client` and `bin/magento plenty:setup:profile:system`)
- ❌ Updated admin menu paths (now **SoftCommerce → PlentyONE**)
- ❌ Enhanced connection testing and validation
- ❌ Automated token management
:::

<div style={{position: 'relative', paddingBottom: '56.25%', height: 0}}>
  <iframe
    style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
    src="https://www.youtube.com/embed/vhurmQVNPQQ"
    title="Mage2Plenty Connection Configuration"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</div>

:::tip Pro Tip
Enable RabbitMQ for asynchronous profile processing to significantly improve performance, especially for large catalogs.
:::

## Architecture Overview

```mermaid
graph LR
    A[Magento 2] <-->|Mage2Plenty| B[PlentyONE ERP]
    A -->|Products| B
    A -->|Orders| B
    B -->|Inventory| A
    B -->|Prices| A
    B -->|Status Updates| A
```

Understanding this bi-directional architecture helps you configure the integration effectively.

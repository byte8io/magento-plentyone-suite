---
sidebar_position: 2
title: System Requirements
description: Preliminary requirements for Mage2Plenty connector
---

# System Requirements

Before you begin, ensure you have the following requirements met for successful installation and operation of Mage2Plenty.

## PlentyONE Account

PlentyONE connects and automates every process of your online business. It is a full-service e-commerce ERP system that specialises in multi-channel online business.

To find out more, please visit PlentyMarkets: [plentyone.com](https://www.plentyone.com/)

## Mage2Plenty Connector

Ensure you have purchased and installed the latest [Mage2Plenty](https://mage2plenty.com/magento2-plentymarkets-connector/) extension for Magento 2.

**Installation Method**: Mage2Plenty is distributed exclusively through a **secure private Packagist repository**. Direct downloads are not provided. This approach ensures:

- 🔒 **Secure Distribution** - Licensed access only via Composer authentication
- 🔄 **Easy Updates** - Simple `composer update` commands for latest versions
- 📦 **Dependency Management** - Automatic handling of all required packages
- ✅ **Version Control** - Track and manage versions across environments

After purchasing, you'll receive access credentials to our private repository. See the [Installation Guide](/docs/installation/composer-installation) for detailed setup instructions.

:::info Need Help?
If you require further help, contact us at **support@byte8.io** or give us a call on **+44 2080 587 795** during working hours (GMT).
:::

## Magento 2.x Release

Our extension is compatible with **Magento 2.4.4** and later versions.

### Supported Magento Versions

- Magento 2.4.4
- Magento 2.4.5
- Magento 2.4.6
- Magento 2.4.7
- Magento 2.4.8 (latest)

:::tip
To download the latest Magento, please visit [Magento Download Releases](https://magento.com/tech-resources/download) page.

To view Magento system requirements, visit [System requirements](https://experienceleague.adobe.com/docs/commerce-operations/installation-guide/system-requirements.html) page.
:::

## PHP Requirements

Mage2Plenty requires **PHP 8.1** or higher.

### Supported PHP Versions

| Version | Status |
|---------|--------|
| PHP 8.1 | ✅ Minimum required |
| PHP 8.2 | ✅ Recommended |
| PHP 8.3 | ✅ Fully supported |
| PHP 8.4 | ✅ Fully supported |

### Required PHP Extensions

The following PHP extensions must be installed and enabled:

| Extension | Purpose |
|-----------|---------|
| `ext-bcmath` | For arbitrary precision mathematics |
| `ext-ctype` | For character type checking |
| `ext-curl` | For API communication with PlentyMarkets |
| `ext-dom` | For XML processing |
| `ext-gd` or `ext-imagick` | For image processing |
| `ext-intl` | For internationalization functions |
| `ext-json` | For JSON processing |
| `ext-mbstring` | For multi-byte string handling |
| `ext-openssl` | For secure communications |
| `ext-pdo_mysql` | For database connectivity |
| `ext-simplexml` | For XML parsing |
| `ext-soap` | For SOAP API support |
| `ext-sodium` | For encryption (PHP 8.1+) |
| `ext-xsl` | For XSL transformations |
| `ext-zip` | For archive handling |

## PHP cURL Library

Mage2Plenty uses cURL for API communication with PlentyMarkets.

### cURL Requirements

- **Minimum version**: libcurl 7.29.0 or later
- **Recommended version**: libcurl 7.68.0 or later
- **PHP 8.1+ compatible**: Ensure your cURL build supports PHP 8.1+

### Checking cURL Version

You can check your cURL version using:

```bash
php -i | grep -i curl
```

Or create a PHP file with:

```php
<?php
phpinfo();
```

Look for the cURL section to verify:
- cURL support is enabled
- cURL version meets requirements
- SSL/TLS protocols are supported

### cURL Configuration for PHP 8.1+

For PHP 8.1 and higher, ensure these cURL options are properly configured:

```php
// Example cURL configuration compatible with PHP 8.1+
CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_2_0,
CURLOPT_SSLVERSION => CURL_SSLVERSION_TLSv1_2,
CURLOPT_SSL_VERIFYHOST => 2,
CURLOPT_SSL_VERIFYPEER => true
```

You can find the latest libcurl package here: [curl.haxx.se](https://curl.haxx.se)

## Database Requirements

| Database | Minimum Version |
|----------|----------------|
| MySQL | 8.0 or higher |
| MariaDB | 10.6 or higher |

## Web Server Requirements

- **Apache** 2.4 with mod_rewrite enabled
- **nginx** 1.x

## SSL Certificate

- Valid SSL certificate required for production environments
- TLS 1.2 or higher

## Memory Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| PHP memory_limit | 2GB | 4GB |
| MySQL max_allowed_packet | 64MB | - |

## Composer

- **Composer 2.2** or later required for installation

## Additional Requirements

### Redis (Recommended)

- Redis 6.2 or higher for cache and sessions
- Improves performance significantly

### Elasticsearch / OpenSearch

- Elasticsearch 7.17 or OpenSearch 1.2+ for catalog search
- Required for Magento 2.4.4+

### Message Queue (Highly Recommended)

- RabbitMQ 3.9+ or AWS MQ for asynchronous operations
- Highly recommended for profile processing

## System Check Command

After installation, run the system check to verify all requirements are met:

```bash
bin/magento plenty:system:check
```

This command will verify all requirements are met for Mage2Plenty operation and provide detailed feedback on any missing dependencies or configuration issues.

## Quick Reference Checklist

Use this checklist to verify your environment is ready:

- [ ] PlentyONE account created and configured
- [ ] Magento 2.4.4+ installed and running
- [ ] PHP 8.1+ with all required extensions
- [ ] MySQL 8.0+ or MariaDB 10.6+
- [ ] Composer 2.2+ installed
- [ ] SSL certificate configured
- [ ] Adequate memory limits set
- [ ] Redis configured (recommended)
- [ ] Elasticsearch/OpenSearch installed (required for Magento 2.4.4+)
- [ ] RabbitMQ configured (recommended)

# Mage2Plenty - Magento PlentyONE Integration

Metapackage of bundled modules for seamless Magento 2 and PlentyONE integration.

## Requirements

### Magento
- **Magento 2.4.4** or later (2.4.8 recommended)
- Magento Open Source or Adobe Commerce

### PHP
| Version | Status |
|---------|--------|
| PHP 8.1 | ✅ Minimum required |
| PHP 8.2 | ✅ Supported |
| PHP 8.3 | ✅ Fully supported |
| PHP 8.4 | ✅ Fully supported |

### Database
- MySQL 8.0+ or MariaDB 10.6+

### Additional
- Composer 2.2+
- Elasticsearch 7.17+ or OpenSearch 1.2+
- Redis 6.2+ (recommended)

## Installation

### 1. Add Composer Repository

Add your private repository to composer.json:

```bash
composer config repositories.private-packagist composer https://byte8.repo.packagist.com/repository-name/
```

Or manually edit `composer.json`:

```json
{
    "repositories": [
        {
            "type": "composer",
            "url": "https://byte8.repo.packagist.com/repository-name/"
        }
    ]
}
```

> **Note**: Replace `repository-name` with the actual repository name provided in your purchase confirmation.

### 2. Setup Authentication

Choose one of the following methods:

**Method 1: Global Authentication (Recommended)**

```bash
composer config --global --auth http-basic.byte8.repo.packagist.com token your-access-token
```

**Method 2: Environment Variable**

```bash
export COMPOSER_AUTH='{"http-basic": {"byte8.repo.packagist.com": {"username": "token", "password": "your-access-token"}}}'
```

**Method 3: Interactive**

Composer will prompt for credentials when running any command:

```
Authentication required (byte8.repo.packagist.com):
Username: token
Password: your-access-token
```

### 3. Install Extension

**For Magento Open Source:**

```bash
composer require byte8/mage2plenty-os
```

**For Adobe Commerce:**

```bash
composer require byte8/mage2plenty-ac
```

**Install Specific Version:**

```bash
# Latest version (Magento 2.4.6 - 2.4.8)
composer require byte8/mage2plenty-os ^2.1

# For Magento 2.4.4 - 2.4.5
composer require byte8/mage2plenty-os ^1.15
```

### 4. Post Installation

**Production Mode:**

```bash
bin/magento maintenance:enable
bin/magento setup:upgrade
bin/magento deploy:mode:set production
bin/magento maintenance:disable
```

**Development Mode:**

```bash
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento cache:flush
```

## Documentation

For complete documentation, visit: [mage2plenty-guide.byte8.io](https://mage2plenty-guide.byte8.io/)

- [System Requirements](https://mage2plenty-guide.byte8.io/docs/system-requirements)
- [Installation Guide](https://mage2plenty-guide.byte8.io/docs/installation/composer-installation)
- [Configuration](https://mage2plenty-guide.byte8.io/docs/configuration/initial-setup)
- [Changelog](https://mage2plenty-guide.byte8.io/docs/changelog)

## Support

- **Email**: support@byte8.io
- **Phone**: +44 2080 587 795 (GMT working hours)
- **WhatsApp**: +44 7737 927 707
- **Slack**: byte8ltd.slack.com
- **Issues**: [GitHub Issues](https://github.com/byte8ltd/mage2plenty-os/issues)

## License

Proprietary - See LICENSE.txt

---

<p align="center">
    <a href="https://byte8.co.uk/">
        <img src="https://byte8.co.uk/pub/media/banner/logo.svg" width="200" alt="Soft Commerce Ltd" />
    </a>
    <br />
    <a href="https://byte8.co.uk/">https://byte8.co.uk/</a>
</p>

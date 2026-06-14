<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="assets/byte8-logo-dark.svg" />
        <img src="assets/byte8-logo-light.svg" height="56" alt="Byte8" />
    </picture>
</p>

<h1 align="center">Magento PlentyONE Integration</h1>

<p align="center">Metapackage of bundled modules for seamless Magento 2 and PlentyONE integration.</p>

> **Licensed extension.** The PlentyONE integration must be purchased first at
> **[byte8.io/integrations/plentyone](https://byte8.io/integrations/plentyone)**.
> Your purchase confirmation includes the access token required for installation below.

## Requirements

### Magento
- **Magento 2.4.4** or later (2.4.9 recommended)
- Magento Open Source or Adobe Commerce

### PHP
| Version | Status |
|---------|--------|
| PHP 8.1 | ✅ Minimum required |
| PHP 8.2 | ✅ Supported |
| PHP 8.3 | ✅ Fully supported |
| PHP 8.4 | ✅ Fully supported |
| PHP 8.5 | ✅ Fully supported |

### Database
- MySQL 8.0+ or MariaDB 10.6+

### Additional
- Composer 2.2+
- Elasticsearch 7.17+ or OpenSearch 2.19+
- Redis 7.2+ (recommended)

## Installation

### 1. Add the Byte8 Composer Registry

Packages are served from the Byte8 registry at `https://byte8.packages.cargoman.io`.

```bash
composer config repositories.cargoman '{"type":"composer","url":"https://byte8.packages.cargoman.io"}'
```

### 2. Authenticate

```bash
composer config http-basic.byte8.packages.cargoman.io token YOUR_TOKEN
```

> **Note**: Replace `YOUR_TOKEN` with the access token from your purchase confirmation.

### 3. Install Extension

**For Magento Open Source:**

```bash
composer require byte8/magento-plentyone-suite
```

**For Adobe Commerce:**

```bash
composer require byte8/magento-plentyone-suite-ac
```

**Install a Specific Version:**

```bash
composer require byte8/magento-plentyone-suite ^4.0
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

For complete documentation, visit: [docs.byte8.io/plentyone](https://docs.byte8.io/plentyone)

- [System Requirements](https://docs.byte8.io/plentyone/docs/system-requirements)
- [Installation Guide](https://docs.byte8.io/plentyone/docs/installation/composer-installation)
- [Configuration](https://docs.byte8.io/plentyone/docs/configuration/initial-setup)
- [Changelog](https://docs.byte8.io/plentyone/docs/changelog)

## Support

- **Email**: hello@support.byte8.io
- **Phone**: +44 2080 587 795 (GMT working hours)
- **WhatsApp**: +44 7737 927 707
- **Slack**: byte8io.slack.com
- **Issues**: [GitHub Issues](https://github.com/byte8io/magento-plentyone-suite/issues)

## License

Proprietary - See LICENSE.txt

---

<p align="center">
    <a href="https://byte8.io/">
        <picture>
            <source media="(prefers-color-scheme: dark)" srcset="assets/byte8-logo-dark.svg" />
            <img src="assets/byte8-logo-light.svg" height="48" alt="Byte8" />
        </picture>
    </a>
    <br />
    <a href="https://byte8.io/">https://byte8.io/</a>
</p>

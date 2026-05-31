---
sidebar_position: 2
title: Install Extension Using Commerce Marketplace
description: A guide to help you install PlentyONE Integration extension for Magento 2 using Commerce Marketplace composer
---

# Install Extension Using Commerce Marketplace

This guide will help you install the Mage2Plenty extension for Magento 2 using Composer via the Commerce Marketplace (repo.magento.com).

:::info Direct Purchase?
If the extension was purchased directly from our website, please refer to [Composer Installation](/docs/installation/composer-installation) instead.
:::

## About Commerce Marketplace

Magento uses [Composer](https://getcomposer.org/) to manage components and their dependencies. When you purchase an extension from Commerce Marketplace, the composer packages are automatically made available through `repo.magento.com`.

## Prerequisites

Before you begin, ensure you have:

1. **Magento Marketplace Account** - Created at [marketplace.magento.com](https://marketplace.magento.com/)
2. **Access Keys** - Generated from your Marketplace account
3. **Mage2Plenty Purchase** - Extension purchased from Commerce Marketplace
4. **System Requirements** - Your environment meets all [system requirements](/docs/system-requirements)

## Getting Your Access Keys

If you haven't already created Marketplace access keys:

1. Log in to your [Magento Marketplace account](https://marketplace.magento.com/)
2. Go to **My Profile** → **Access Keys**
3. Click **Create A New Access Key**
4. Give it a descriptive name (e.g., "Production Server")
5. Copy both the **Public Key** (username) and **Private Key** (password)

:::warning Keep Keys Secure
- Never commit your access keys to version control
- Add `auth.json` to your `.gitignore` file
- Treat your private key like a password
- Regenerate keys if they are ever compromised
:::

## Installation Steps

### 1. Authenticate with Marketplace

First, configure Composer to authenticate with the Magento Marketplace:

```bash
composer config --global --auth http-basic.repo.magento.com <public-key> <private-key>
```

Replace `<public-key>` and `<private-key>` with your actual Marketplace access keys.

:::tip Alternative: Interactive Authentication
If you prefer, you can skip this step and Composer will prompt you for credentials when needed. The credentials will then be saved automatically.
:::

### 2. Verify Marketplace Repository

Ensure your `composer.json` includes the Magento Marketplace repository:

```json
{
    "repositories": [
        {
            "type": "composer",
            "url": "https://repo.magento.com/"
        }
    ]
}
```

:::info Default Configuration
This repository is typically already configured in Magento installations. You usually don't need to add it manually.
:::

### 3. Install Extension

Now you can install the Mage2Plenty extension.

#### For Magento Open Source

```bash
composer require byte8/magento-plentyone-suite
```

#### For Adobe Commerce (Cloud and On-Premises)

```bash
composer require byte8/magento-plentyone-suite-ac
```

:::info Latest Compatible Version
The above commands will install the extension compatible with the latest Magento release.
:::

#### Install Specific Version

To install an extension compatible with a specific Magento version, append the appropriate version constraint:

```bash
# For Magento 2.4.7
composer require byte8/magento-plentyone-suite ~1.15.0

# For Magento 2.4.6
composer require byte8/magento-plentyone-suite ~1.14.0

# For Magento 2.4.4
composer require byte8/magento-plentyone-suite ~1.13.0
```

:::warning System Requirements
Magento 2.4.4+ requires PHP 8.1 or higher. Ensure your environment meets all [system requirements](/docs/system-requirements) before installation.
:::

:::tip Version Information
- Latest stable version: **1.15.1**
- Compatible with: **Magento 2.4.7+**
- Refer to [Magento Version Compatibility](/docs/magento-version-compatibility) for a complete list of compatible versions
:::

### 4. Post Installation

After installing the extension via Composer, you need to run Magento's setup commands.

#### For Production Mode

```bash
bin/magento maintenance:enable
bin/magento setup:upgrade
bin/magento deploy:mode:set production
bin/magento maintenance:disable
```

:::info Production Deployment
In production mode, Magento will automatically:
- Compile dependency injection
- Deploy static content
- Clear caches
:::

#### For Development Mode

```bash
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento cache:flush
```

#### Verify Installation

Check that the module is installed and enabled:

```bash
bin/magento module:status Byte8_PlentyCore
```

You should see output confirming the module is enabled.

## Marketplace vs Direct Purchase

### Key Differences

| Aspect | Marketplace | Direct Purchase |
|--------|-------------|-----------------|
| **Repository** | repo.magento.com | Byte8 Cargoman |
| **Authentication** | Marketplace Access Keys | Custom Access Token |
| **Updates** | Through Marketplace | Through Private Repo |
| **Support** | Via Marketplace | Direct Support |
| **Licensing** | Marketplace Terms | Direct License |

### Which Should I Use?

- **Use Marketplace Installation** if you purchased through Commerce Marketplace
- **Use Direct Installation** if you purchased directly from the Byte8 (former SoftCommerce) website

Both methods install the same extension with identical functionality.

## Troubleshooting

### Authentication Fails

If you receive authentication errors with repo.magento.com:

1. Verify your Marketplace access keys are correct
2. Ensure you've accepted the Marketplace terms for Mage2Plenty
3. Check that your Marketplace account is in good standing
4. Try regenerating your access keys

### Extension Not Found

If Composer can't find the package:

1. Ensure you've purchased the extension from Marketplace
2. Log in to Marketplace and verify the purchase appears in "My Purchases"
3. Wait a few minutes after purchase (sometimes takes time to sync)
4. Contact Marketplace support if the issue persists

### Version Conflicts

If Composer reports dependency conflicts:

1. Update your Magento installation to the latest patch version
2. Try specifying a compatible Mage2Plenty version explicitly
3. Run `composer update --dry-run` to see what would change
4. Check [Magento Version Compatibility](/docs/magento-version-compatibility)

### Memory Limit Errors

If you encounter memory limit errors during installation:

```bash
# Increase memory limit temporarily
php -d memory_limit=-1 /usr/bin/composer require byte8/magento-plentyone-suite
```

## Updating from Marketplace

To update the extension to the latest version:

```bash
composer update byte8/magento-plentyone-suite  # or byte8/magento-plentyone-suite-ac
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento cache:flush
```

:::tip Check for Updates
We release updates every two weeks. Check the [Changelog](/blog) regularly or enable notifications in your Marketplace account to stay informed.
:::

## Next Steps

Now that you have Mage2Plenty installed, you can proceed to configure your connector:

1. 📋 **[Initial Setup](/docs/configuration/initial-setup)** - Complete the initial configuration
2. ⚙️ **[Client Configuration](/docs/configuration/client-configuration)** - Configure connection settings
3. 📊 **[Profile Setup](/docs/profiles/about-profiles)** - Set up synchronization profiles
4. ✅ **[System Check](/docs/system-requirements#system-check-command)** - Verify your setup

## Getting Help

If you encounter any issues during installation:

- 📧 **Email Support**: support@byte8.io
- 📞 **Phone**: +44 2080 587 795 (GMT working hours)
- 🛒 **Marketplace Support**: Through your Marketplace account
- 📖 **Documentation**: Browse this site for comprehensive guides
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/byte8/mage2plenty/issues)

## Additional Resources

- [Magento Marketplace User Guide](https://docs.magento.com/marketplace/user_guide/buyers/install-extension.html)
- [Composer Authentication](https://devdocs.magento.com/guides/v2.4/install-gde/prereq/connect-auth.html)
- [System Requirements](/docs/system-requirements)
- [Magento Version Compatibility](/docs/magento-version-compatibility)

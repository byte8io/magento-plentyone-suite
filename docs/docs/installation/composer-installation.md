---
sidebar_position: 1
title: Install Extension Using Composer
description: A guide to help you install PlentyONE Integration extension for Magento 2 using composer
---

# Install Extension Using Composer

This guide will help you install the Mage2Plenty extension for Magento 2 using Composer with our Byte8 Cargoman registry.

:::info Marketplace Purchase?
If the extension was purchased from [Magento Marketplace](https://marketplace.magento.com/), please refer to [Commerce Marketplace Composer Installation](/docs/installation/marketplace-composer-installation) instead.
:::

## About Composer and the Byte8 Cargoman Registry

We use [Composer](https://getcomposer.org/) to manage components and their dependencies. Our composer packages are hosted on the Byte8 [Cargoman](https://cargoman.io/) registry — a fast, reliable and secure composer repository for PHP packages.

After you purchase the extension, you'll be provided with:
- An authentication token to access the registry

## Installation Steps

### 1. Add Composer Repository

First, add the Byte8 Cargoman repository to your `composer.json` and set up authentication to access the required packages.

#### Option A: Using Composer Command (Recommended)

```bash
composer config repositories.cargoman '{"type":"composer","url":"https://byte8.packages.cargoman.io"}'
```

#### Option B: Manual Configuration

Alternatively, manually edit the `composer.json` file and add the following custom repository:

```json
{
    "repositories": {
        "cargoman": {
            "type": "composer",
            "url": "https://byte8.packages.cargoman.io"
        }
    }
}
```

### 2. Setup Authentication

You can setup authentication in one of the following three ways:

#### Method 1: Project Authentication (Recommended)

Store the authentication credentials in your project's `auth.json`:

```bash
composer config http-basic.byte8.packages.cargoman.io token YOUR_TOKEN
```

:::info Replace Credentials
- Use the literal word `token` as the username
- Replace `YOUR_TOKEN` with the actual access token provided in your purchase confirmation email
:::

To store credentials in your global Composer `auth.json` instead, add the `--global --auth` flags:

```bash
composer config --global --auth http-basic.byte8.packages.cargoman.io token YOUR_TOKEN
```

#### Method 2: Environment Variable

Store the authentication credentials using an environment variable:

```bash
export COMPOSER_AUTH='{"http-basic": {"byte8.packages.cargoman.io": {"username": "token", "password": "YOUR_TOKEN"}}}'
```

This is particularly useful for CI/CD environments.

#### Method 3: Interactive Authentication

Run any Composer command and Composer will automatically prompt you to enter authentication credentials if no authentication is configured:

```bash
Authentication required (byte8.packages.cargoman.io):
Username: token
Password: YOUR_TOKEN
```

The credentials will then be stored in your Composer `auth.json`.

:::warning Keep Credentials Secure
- Never commit your auth.json file to version control
- Add `auth.json` to your `.gitignore` file
- Treat your access token like a password
:::

### 3. Install Extension

Now you're ready to install the Mage2Plenty extension.

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

## Troubleshooting

### Authentication Fails

If you receive authentication errors:

1. Verify your credentials are correct
2. Check that your license is active
3. Ensure you're using "token" as the username
4. Contact support if the issue persists

### Composer Memory Issues

If you encounter memory limit errors:

```bash
# Increase memory limit for this command only
php -d memory_limit=-1 /usr/bin/composer require byte8/magento-plentyone-suite
```

### Version Conflicts

If Composer reports dependency conflicts:

1. Update your Magento installation to the latest patch version
2. Try specifying a compatible Mage2Plenty version explicitly
3. Run `composer update --dry-run` to see what would change

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
- 📖 **Documentation**: Browse this site for guides
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/byte8/mage2plenty/issues)

## Video Tutorial

<div style={{position: 'relative', paddingBottom: '56.25%', height: 0, marginTop: '2rem', marginBottom: '2rem'}}>
  <iframe
    style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
    src="https://www.youtube.com/embed/your-installation-video-id"
    title="Mage2Plenty Installation Tutorial"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</div>

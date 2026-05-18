---
sidebar_position: 1
title: Configuration Overview
description: Overview of Mage2Plenty system configuration options
---

# Configuration Overview

This section covers all system configuration options for Mage2Plenty. Proper configuration is essential for successful integration between Magento 2 and PlentyONE.

## Configuration Sections

Mage2Plenty configuration is organized into several main sections:

### 1. Core Configuration

Located at: **Stores → Configuration → Soft Commerce → Core Configuration**

This section includes global settings that affect the entire Mage2Plenty extension:

- **Developer Settings**: Logging, debugging, and email notifications
- **UI Settings**: Interface customization options
- **Module List**: View all installed Soft Commerce modules

See [Core Configuration](/docs/configuration/core-configuration) for details.

### 2. PlentyONE Integration

Located at: **Stores → Configuration → Soft Commerce → PlentyONE Integration**

This section contains PlentyONE-specific settings:

- **Authentication Settings**: Connection credentials and client information
- **REST API Settings**: API connection parameters and timeouts
- **API Logging**: REST API request/response logging options

See [Client Configuration](/docs/configuration/client-configuration) for details.

### 3. Profile Configuration

Located at: **SoftCommerce → PlentyONE → Profiles**

Individual profiles for managing synchronization:

- Product Import/Export
- Category Import/Export
- Order Import/Export
- Stock Import
- Customer Import/Export

See [Profile Configuration](/docs/profiles/about-profiles) for details.

## Quick Configuration Checklist

Use this checklist to verify your configuration is complete:

### Initial Setup

- [ ] Reviewed [System Requirements](/docs/system-requirements)
- [ ] Created PlentyONE admin user
- [ ] Collected required credentials
- [ ] Configured authentication settings
- [ ] Tested API connection

### Core Settings

- [ ] Configured log rotation
- [ ] Set up API logging
- [ ] Enabled email notifications (if needed)
- [ ] Configured UI settings

### Profile Setup

- [ ] Created profiles for required entities
- [ ] Configured field mappings
- [ ] Set up synchronization schedules
- [ ] Tested profiles in dry-run mode

## Configuration Hierarchy

Mage2Plenty uses Magento's standard configuration scope hierarchy:

```
Global (Default)
    ↓
Website
    ↓
Store View
```

### Scope Levels

| Setting Type | Global | Website | Store View |
|--------------|--------|---------|------------|
| Core Configuration | ✅ | ❌ | ❌ |
| Authentication | ✅ | ✅ | ❌ |
| API Settings | ✅ | ❌ | ❌ |
| Client IDs | ✅ | ✅ | ❌ |
| Profile Config | ✅ | ✅ | ✅ |

:::info Single Client System
Mage2Plenty operates on a **single-client architecture**. There is only ONE PlentyONE client connection per Magento installation. Client data is stored in `core_config_data` under the `plenty/client_config/*` paths.
:::

## Configuration Storage

Configuration is stored in Magento's database:

| Table | Contents |
|-------|----------|
| `core_config_data` | System configuration values |
| `softcommerce_plenty_profile` | Profile configurations |
| `softcommerce_plenty_profile_entity` | Profile entity data |

## Configuration Commands

Use these CLI commands to manage configuration:

```bash
# View configuration
bin/magento config:show plenty

# Set configuration value
bin/magento config:set plenty/client_config/url "https://your-plenty-url.com"

# Show sensitive configuration (encrypted)
bin/magento config:sensitive:set

# Clear configuration cache
bin/magento cache:clean config
```

## Configuration Best Practices

### Security

1. **Never commit credentials** - Add `app/etc/config.php` and `app/etc/env.php` to `.gitignore`
2. **Use encrypted fields** - Passwords are automatically encrypted
3. **Restrict admin access** - Only authorized users should access configuration
4. **Rotate credentials** - Change passwords periodically

### Performance

1. **Enable log rotation** - Prevent log files from growing too large
2. **Use selective API logging** - Log only necessary content
3. **Configure appropriate timeouts** - Balance reliability and performance
4. **Use message queues** - Enable async processing for large operations

### Maintenance

1. **Document changes** - Keep track of configuration modifications
2. **Test in staging** - Always test configuration changes before production
3. **Monitor logs** - Regular

ly review logs for issues
4. **Back up configuration** - Export configuration before major changes

## Environment-Specific Configuration

For different environments (dev, staging, production):

### Option 1: Environment Variables

```bash
# In app/etc/env.php
'system' => [
    'default' => [
        'plenty' => [
            'client_config' => [
                'url' => getenv('PLENTY_URL'),
                'username' => getenv('PLENTY_USERNAME'),
                'password' => getenv('PLENTY_PASSWORD')
            ]
        ]
    ]
]
```

### Option 2: Configuration Files

Use separate configuration files per environment:

```bash
# Development
app/etc/config.dev.php

# Staging
app/etc/config.staging.php

# Production
app/etc/config.prod.php
```

### Option 3: Config Management

Use Magento's config management:

```bash
# Dump configuration
bin/magento app:config:dump

# Import configuration
bin/magento app:config:import
```

## Troubleshooting Configuration

### Configuration Not Saving

**Symptoms**: Changes don't persist after saving

**Solutions**:
1. Check file permissions on `app/etc`
2. Clear cache: `bin/magento cache:flush`
3. Check for database connection issues
4. Review system.log for errors

### Cannot Access Configuration

**Symptoms**: Configuration page not visible or accessible

**Solutions**:
1. Clear cache: `bin/magento cache:flush`
2. Check admin user permissions
3. Verify module is enabled: `bin/magento module:status`
4. Run setup upgrade: `bin/magento setup:upgrade`

### Configuration Override Issues

**Symptoms**: Expected configuration not being used

**Solutions**:
1. Check scope (Global vs Website vs Store View)
2. Review config overrides in `app/etc/env.php`
3. Check for programmatic overrides in code
4. Use `bin/magento config:show` to see effective values

## Migration and Backup

### Export Configuration

```bash
# Export configuration to JSON
bin/magento app:config:dump scopes

# Backup configuration
bin/magento setup:backup --code --media --db
```

### Import Configuration

```bash
# Import configuration
bin/magento app:config:import

# Apply configuration changes
bin/magento setup:upgrade
bin/magento cache:flush
```

## Next Steps

Now that you understand the configuration overview, proceed to:

1. 📋 **[Core Configuration](/docs/configuration/core-configuration)** - Set up core settings
2. 🔌 **[Client Configuration](/docs/configuration/client-configuration)** - Configure PlentyONE connection
3. 📊 **[Profile Setup](/docs/profiles/about-profiles)** - Create synchronization profiles
4. ✅ **[Testing](/docs/testing/connection-test)** - Test your configuration

## Getting Help

If you need assistance with configuration:

- 📧 **Email Support**: support@softcommerce.io
- 📞 **Phone**: +44 2080 587 795 (GMT working hours)
- 📖 **Documentation**: Browse this site for detailed guides
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/byte8/mage2plenty/issues)

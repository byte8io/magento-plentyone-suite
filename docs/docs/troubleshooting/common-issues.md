---
sidebar_position: 1
title: Common Issues & Solutions
description: Quick solutions to frequently encountered problems
---

# Common Issues & Solutions

This guide covers the most frequently encountered issues with Mage2Plenty and their solutions.

## Connection & Authentication Issues

### Issue: "401 Unauthorized" Error

**Symptoms:**
```
Error: 401 Unauthorized
Failed to authenticate with PlentyONE API
```

**Causes:**
- Invalid username or password
- User account disabled
- User lacks API access permissions

**Solutions:**

1. **Verify credentials:**
   ```bash
   bin/magento config:show plenty/client_config/username
   bin/magento config:show plenty/client_config/url
   ```

2. **Test credentials directly:**
   ```bash
   curl -X POST https://your-domain.plentymarkets-cloud01.com/rest/login \
     -H "Content-Type: application/json" \
     -d '{"username":"your-user","password":"your-pass"}'
   ```

3. **Check user permissions in PlentyONE:**
   - Go to **Setup → Settings → User → Accounts**
   - Verify user has **API access** enabled
   - Check user is **active**

4. **Update credentials:**
   ```bash
   bin/magento config:set plenty/client_config/username "your-username"
   bin/magento config:set plenty/client_config/password "your-password" --lock-env
   bin/magento cache:flush
   ```

### Issue: "Connection Timed Out"

**Symptoms:**
```
Connection to PlentyONE API timed out
```

**Causes:**
- Firewall blocking outbound connections
- Incorrect API URL
- Network connectivity issues

**Solutions:**

1. **Test basic connectivity:**
   ```bash
   curl -I https://your-domain.plentymarkets-cloud01.com
   ping your-domain.plentymarkets-cloud01.com
   ```

2. **Check firewall rules:**
   - Ensure port 443 (HTTPS) is open for outbound connections
   - Whitelist `*.plentymarkets-cloud*.com` domains

3. **Verify API URL:**
   ```bash
   bin/magento config:show plenty/client_config/url
   # Should be: https://your-domain.plentymarkets-cloud01.com
   ```

### Issue: "SSL Certificate Verification Failed"

**Solution:**
```bash
# Update CA certificates (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install ca-certificates

# Update CA certificates (CentOS/RHEL)
sudo yum update ca-certificates
```

## Setup & Configuration Issues

### Issue: "Module Not Found" or "Module Disabled"

**Symptoms:**
```
Module 'Byte8_PlentyProfile' is not enabled
```

**Solutions:**

1. **Check module status:**
   ```bash
   bin/magento module:status | grep Byte8
   ```

2. **Enable modules:**
   ```bash
   bin/magento module:enable Byte8_PlentyProfile
   bin/magento setup:upgrade
   bin/magento cache:flush
   ```

3. **Verify installation:**
   ```bash
   composer show byte8/* | grep byte8
   ```

### Issue: "Client ID Not Configured"

**Symptoms:**
```
Error: Client ID is not configured
Cannot proceed without client configuration
```

**Solution:**
```bash
# Run setup wizard
bin/magento plenty:setup:client

# Or set manually
bin/magento config:set plenty/client_config/client_id <your_client_id>
bin/magento cache:flush
```

### Issue: "Missing Required Mapping"

**Symptoms:**
```
Error: Required mapping not configured
Missing payment method mapping
```

**Solutions:**

1. **Check profile configuration:**
   - Navigate to **Admin → Plenty Profiles → [Profile] → Configuration**
   - Complete all required mapping sections

2. **Export and review configuration:**
   ```bash
   bin/magento profile:export:config --profile=<profile_id>
   ```

3. **Common missing mappings:**
   - Payment method mapping
   - Shipping method mapping
   - Order status mapping
   - Store-to-locale mapping

## Synchronization Issues

### Issue: Product Export Fails with "Category Not Found"

**Solution:**
```bash
# Export categories first
bin/magento plenty:category:export --profile=<profile_id>

# Then retry product export
bin/magento plenty:item:export --sku=TEST-SKU
```

### Issue: Images Not Uploading

**Common causes:**
- Image files too large (>5MB)
- Invalid image format
- Permission issues

**Solutions:**

1. **Check file permissions:**
   ```bash
   chmod 644 pub/media/catalog/product/*/*.jpg
   ```

2. **Verify image format:**
   ```bash
   file pub/media/catalog/product/path/to/image.jpg
   # Must be JPG, PNG, or GIF
   ```

3. **Resize large images:**
   ```bash
   mogrify -resize 2000x2000\> pub/media/catalog/product/*/*.jpg
   ```

### Issue: Duplicate Products Created

**Cause:** Product mapping relation not created

**Solution:**
```bash
# Re-map products
bin/magento plenty:item:map

# Verify mapping
mysql> SELECT * FROM plenty_item_relation;
```

## Performance Issues

### Issue: Slow Synchronization

**Solutions:**

1. **Increase batch sizes:**
   - Edit profile configuration
   - Increase `collection_size` to 200-500

2. **Enable queue processing:**
   ```bash
   bin/magento queue:consumers:start plentyItemExportConsumer --max-messages=1000 &
   ```

3. **Optimize MySQL:**
   ```sql
   OPTIMIZE TABLE plenty_item;
   OPTIMIZE TABLE plenty_order;
   ```

4. **Increase PHP memory:**
   ```ini
   ; php.ini
   memory_limit = 2G
   max_execution_time = 300
   ```

### Issue: Memory Exhausted

**Symptoms:**
```
Fatal error: Allowed memory size exhausted
```

**Solutions:**

1. **Increase PHP memory limit:**
   ```bash
   php -d memory_limit=2G bin/magento plenty:item:import
   ```

2. **Process in smaller batches:**
   ```bash
   # Instead of all products
   bin/magento plenty:item:import --category=10
   ```

3. **Use pagination:**
   - Configure profile with smaller page sizes
   - Enable queue-based processing

## Queue & Cron Issues

### Issue: Queue Messages Stuck

**Solution:**
```bash
# Check queue status
bin/magento queue:consumers:list

# Reset stuck messages
mysql> UPDATE queue_message
       SET status='new'
       WHERE status='in_progress'
       AND updated_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);

# Restart consumers
sudo supervisorctl restart all
```

### Issue: Cron Not Running

**Solutions:**

1. **Verify cron installation:**
   ```bash
   crontab -l | grep magento
   ```

2. **Reinstall cron:**
   ```bash
   bin/magento cron:install
   ```

3. **Manually trigger cron:**
   ```bash
   bin/magento cron:run
   ```

4. **Check cron logs:**
   ```bash
   tail -f var/log/cron.log
   ```

## Data Integrity Issues

### Issue: Stock Levels Not Updating

**Solutions:**

1. **Force stock recollection:**
   ```bash
   bin/magento plenty:stock:collect --profile=<profile_id>
   bin/magento plenty:stock:import --profile=<profile_id>
   ```

2. **Check MSI configuration:**
   ```bash
   bin/magento plenty:stock:assign-source --sku=TEST-SKU --source=default
   ```

3. **Check for stock drift between Magento and PlentyONE:**
   ```bash
   bin/magento plenty:stock:drift:report
   ```

4. **Clean up orphaned stock rows** (preview first with `--dry-run`):
   ```bash
   # Rows whose variation no longer exists in PlentyONE
   bin/magento plenty:stock:cleanup:orphan --dry-run

   # Rows for warehouses removed from PlentyONE
   bin/magento plenty:stock:cleanup:warehouse --dry-run
   ```

### Issue: Order Status Not Syncing

**Solutions:**

1. **Verify status mapping:**
   - Check profile configuration
   - Ensure all Magento statuses are mapped

2. **Force order update:**
   ```bash
   bin/magento plenty:order:collect --date-updated="$(date +%Y-%m-%d)"
   bin/magento plenty:order:import
   ```

3. **Check order mapping:**
   ```bash
   bin/magento plenty:order:map
   ```

## Debugging Tips

### Enable Debug Logging

```bash
# Enable debug mode
bin/magento config:set plenty/log_config/is_active_debug 1

# Set log level
bin/magento config:set plenty/log_config/log_level debug

# Flush cache
bin/magento cache:flush
```

### View Logs

```bash
# API logs
tail -f var/log/plenty_api.log

# Error logs
tail -f var/log/plenty_error.log

# Module-specific logs
tail -f var/log/plenty_order.log
tail -f var/log/plenty_item.log
tail -f var/log/plenty_stock.log
```

### Database Inspection

```sql
-- Check profile history
SELECT * FROM byte8_profile_history
WHERE profile_id = 1
ORDER BY created_at DESC LIMIT 10;

-- Check item mappings
SELECT * FROM plenty_item_relation
WHERE magento_product_id = 123;

-- Check order mappings
SELECT * FROM plenty_order_relation
WHERE magento_order_id = 456;
```

## Getting Help

If issues persist after trying these solutions:

1. **Collect diagnostic information:**
   ```bash
   bin/magento plenty:system:check > system-check.log
   ```

2. **Gather logs:**
   ```bash
   tar -czf logs.tar.gz var/log/plenty*.log
   ```

3. **Export configuration:**
   ```bash
   bin/magento profile:export:config --profile=all > config.json
   ```

4. **Contact support with:**
   - System check output
   - Relevant log files
   - Profile configuration
   - Steps to reproduce

## Related Documentation

- **[Connection Testing](/docs/testing/connection-test)** - Test API connectivity
- **[Profile Configuration](/docs/profiles/create-profile)** - Configure profiles
- **[API Errors](/docs/troubleshooting/api-errors)** - Detailed API error reference
- **[Order Issues](/docs/troubleshooting/order-issues)** - Order-specific problems
- **[Profile Issues](/docs/troubleshooting/profile-issues)** - Profile execution problems

---

**Pro Tip:** Most issues can be resolved by ensuring proper configuration. Always run `bin/magento plenty:system:check` first when troubleshooting.

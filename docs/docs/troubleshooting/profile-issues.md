---
sidebar_position: 4
title: Profile Execution Issues
description: Troubleshoot profile configuration and execution problems
---

# Profile Execution Issues

This guide covers issues related to profile configuration, execution, and management in the Mage2Plenty system.

## Profile Configuration Issues

### Issue: "Profile Not Found"

**Symptoms:**
```
Error: Profile with ID 1 does not exist
Cannot execute profile
```

**Causes:**
- Profile deleted or never created
- Wrong profile ID specified
- Database inconsistency

**Solutions:**

1. **List existing profiles:**
   ```bash
   # Via database
   mysql> SELECT entity_id, name, type_id, status FROM byte8_profile;

   # Via Admin
   # Navigate to: Byte8 → Profiles → Manage Profiles
   ```

2. **Create missing profile:**
   - If profile doesn't exist, create it via Admin panel
   - **Byte8 → Profiles → Manage Profiles → Add New Profile**

3. **Verify profile ID:**
   ```bash
   # Check which profile IDs exist
   mysql> SELECT entity_id, name FROM byte8_profile WHERE type_id = 'plenty_item_import';
   ```

### Issue: "Profile Configuration Incomplete"

**Symptoms:**
```
Error: Required configuration missing
- Client ID not configured
- Store mapping not configured
- Attribute mapping missing
```

**Cause:** Profile created but not fully configured.

**Solutions:**

1. **Run auto-configuration:**
   ```bash
   # If profile supports auto-config, it will detect and suggest fixes
   # Navigate to profile in Admin, modal will appear with suggestions
   ```

2. **Manual configuration checklist:**
   - ✅ **Client Configuration:**
     - Client ID selected
   - ✅ **Store Configuration:**
     - Store-to-locale mapping configured
   - ✅ **Type-Specific Configuration:**
     - For items: Attribute mapping, price config, stock config
     - For orders: Status mapping, payment/shipping method mapping
     - For categories: Root category mapping

3. **Verify configuration:**
   ```bash
   # Export profile configuration to review
   bin/magento profile:export:config --profile=1

   # Check database
   mysql> SELECT path, value FROM byte8_profile_config WHERE profile_id = 1;
   ```

### Issue: "Client ID Not Configured"

**Symptoms:**
```
Error: Client ID is not configured for profile
Cannot proceed with synchronization
```

**Solution:**

```bash
# 1. Get available client ID
bin/magento plenty:system:check

# 2. Configure in profile
# Byte8 → Profiles → Manage Profiles → [Profile]
# Configuration → Client Configuration → Client ID

# Or set via database (emergency only)
mysql> INSERT INTO byte8_profile_config (profile_id, path, value)
VALUES (1, 'plenty_item_import/client_config/client_id', '12345');
```

### Issue: "Invalid Profile Type"

**Symptoms:**
```
Error: Profile type 'plenty_item_import' is not registered
Cannot load profile
```

**Cause:** Module not enabled or not installed.

**Solutions:**

1. **Check module status:**
   ```bash
   bin/magento module:status | grep -i plenty
   ```

2. **Enable missing modules:**
   ```bash
   # For item profiles
   bin/magento module:enable Byte8_PlentyItemProfile

   # For order profiles
   bin/magento module:enable Byte8_PlentyOrderProfile

   # For stock profiles
   bin/magento module:enable Byte8_PlentyStockProfile

   # Apply changes
   bin/magento setup:upgrade
   bin/magento cache:flush
   ```

3. **Verify module installation:**
   ```bash
   composer show byte8/* | grep plenty
   ```

## Profile Execution Issues

### Issue: Profile Runs But No Data Syncs

**Symptoms:**
- Profile execution completes without errors
- No data imported or exported
- "0 entities processed" in output

**Causes:**
- No entities match the profile filters
- Collection phase finds no data
- Date filters too restrictive
- Data already synchronized

**Solutions:**

1. **Check profile filters:**
   ```bash
   # View profile configuration
   bin/magento profile:export:config --profile=1

   # Look for filters:
   # - date_from / date_to
   # - status filters
   # - category filters
   # - store filters
   ```

2. **Test without filters:**
   ```bash
   # For item import
   bin/magento plenty:item:collect --verbose
   bin/magento plenty:item:import --verbose

   # For order export
   bin/magento plenty:order:export --status=processing --verbose
   ```

3. **Check if data exists:**
   ```bash
   # For item import - check PlentyONE has items
   # For order export - check Magento has orders
   mysql> SELECT COUNT(*) FROM sales_order WHERE status = 'processing';
   ```

4. **Review execution logs:**
   ```bash
   tail -f var/log/plenty_item.log
   tail -f var/log/plenty_order.log
   tail -f var/log/plenty_stock.log
   ```

### Issue: Profile Execution Times Out

**Symptoms:**
```
Fatal error: Maximum execution time of 300 seconds exceeded
Profile execution incomplete
```

**Causes:**
- Large data set
- Insufficient timeout settings
- Slow API responses
- Complex data processing

**Solutions:**

1. **Increase PHP timeout:**
   ```ini
   ; php.ini
   max_execution_time = 3600
   ```

2. **Run with custom timeout:**
   ```bash
   php -d max_execution_time=3600 bin/magento plenty:item:import --verbose
   ```

3. **Reduce batch size:**
   - Navigate to profile configuration
   - Reduce `collection_size` (e.g., from 500 to 100)
   - Reduce `page_size` for API requests

4. **Use queue-based processing:**
   ```bash
   # Process asynchronously
   bin/magento queue:consumers:start plentyItemImportConsumer --max-messages=500 &
   ```

5. **Split into smaller operations:**
   ```bash
   # Instead of full sync
   bin/magento plenty:item:import

   # Process by category
   bin/magento plenty:item:import --category=10
   bin/magento plenty:item:import --category=20
   ```

### Issue: "Memory Limit Exhausted"

**Symptoms:**
```
Fatal error: Allowed memory size of 134217728 bytes exhausted
Profile execution failed
```

**Solutions:**

1. **Increase memory limit:**
   ```bash
   php -d memory_limit=2G bin/magento plenty:item:import --verbose
   ```

2. **Optimize profile configuration:**
   - Reduce batch size
   - Enable pagination
   - Disable unnecessary data loading

3. **Process in smaller chunks:**
   ```bash
   # By date range
   bin/magento plenty:item:collect --date-updated="2025-01-01/2025-01-15"
   bin/magento plenty:item:import --verbose

   bin/magento plenty:item:collect --date-updated="2025-01-16/2025-01-31"
   bin/magento plenty:item:import --verbose
   ```

4. **Use queue consumers:**
   - Queue processing has lower memory footprint
   - Each message processed independently

### Issue: Profile Execution Hangs

**Symptoms:**
- Profile starts but never completes
- No progress for extended period
- No errors in logs
- Process appears stuck

**Causes:**
- Deadlock in database
- Waiting for API response
- Infinite loop in custom code
- Lock file not released

**Solutions:**

1. **Check for lock files:**
   ```bash
   # Check for profile locks
   mysql> SELECT * FROM flag WHERE flag_code LIKE '%profile%lock%';

   # Remove stale locks (if older than 1 hour)
   mysql> DELETE FROM flag WHERE flag_code LIKE '%profile%lock%' AND last_update < DATE_SUB(NOW(), INTERVAL 1 HOUR);
   ```

2. **Check running processes:**
   ```bash
   # Find stuck PHP processes
   ps aux | grep "bin/magento plenty"

   # Kill stuck process if necessary
   kill -9 <pid>
   ```

3. **Check database locks:**
   ```sql
   -- MySQL
   SHOW PROCESSLIST;
   SHOW ENGINE INNODB STATUS\G

   -- Look for locked queries
   SELECT * FROM INFORMATION_SCHEMA.INNODB_LOCKS;
   ```

4. **Increase API timeout:**
   ```bash
   bin/magento config:set plenty/client_config/timeout 300
   bin/magento cache:flush
   ```

### Issue: Duplicate Data Processing

**Symptoms:**
- Same entities processed multiple times
- Duplicate items created
- Profile runs longer than expected
- "Already processed" warnings in logs

**Cause:** Missing or incorrect entity mapping.

**Solutions:**

1. **Rebuild entity mappings:**
   ```bash
   # For items
   bin/magento plenty:item:map

   # For orders (requires filters)
   bin/magento plenty:order:map --date-from="2025-01-01" --date-to="2025-01-13"

   # Note: Customers are mapped automatically by email address
   # No manual mapping command is needed for customers
   ```

2. **Verify mapping tables:**
   ```sql
   -- Check item mapping
   SELECT COUNT(*), COUNT(DISTINCT magento_product_id), COUNT(DISTINCT plenty_item_id)
   FROM plenty_item_relation;

   -- Should have same counts for all three columns
   ```

3. **Clean up duplicate mappings:**
   ```sql
   -- Find duplicates
   SELECT magento_product_id, COUNT(*)
   FROM plenty_item_relation
   GROUP BY magento_product_id
   HAVING COUNT(*) > 1;

   -- Remove duplicates (keep newest)
   DELETE t1 FROM plenty_item_relation t1
   INNER JOIN plenty_item_relation t2
   WHERE t1.entity_id < t2.entity_id
     AND t1.magento_product_id = t2.magento_product_id;
   ```

## Cron and Scheduling Issues

### Issue: Scheduled Profile Not Running

**Symptoms:**
- Profile configured with schedule
- Cron enabled but profile never executes
- No entries in profile history

**Causes:**
- Cron not installed or not running
- Profile schedule disabled
- Cron job configuration error
- Magento cron group disabled

**Solutions:**

1. **Verify cron installation:**
   ```bash
   crontab -l | grep magento
   ```

2. **Install/reinstall cron:**
   ```bash
   bin/magento cron:install
   ```

3. **Check profile schedule config:**
   ```sql
   SELECT * FROM byte8_profile_config
   WHERE path LIKE '%schedule%'
   AND profile_id = 1;
   ```

4. **Manually run cron:**
   ```bash
   # Run Magento cron
   bin/magento cron:run

   # Check cron schedule table
   mysql> SELECT * FROM cron_schedule WHERE job_code LIKE '%plenty%' ORDER BY scheduled_at DESC LIMIT 10;
   ```

5. **Enable schedule for profile:**
   ```bash
   # Via Admin
   # Byte8 → Profiles → Manage Profiles → [Profile]
   # Schedule Tab → Enable Schedule: Yes

   # Via CLI
   bin/magento config:set plenty_profile/schedule/<profile_id>/enabled 1
   ```

6. **Check cron logs:**
   ```bash
   tail -f var/log/cron.log
   ```

### Issue: Cron Jobs Run But Profile Doesn't Execute

**Symptoms:**
- Cron entries created in `cron_schedule` table
- Status shows as "success"
- But profile doesn't actually run

**Causes:**
- Profile conditions not met
- Schedule expression wrong
- Profile silently fails early
- Wrong cron group configuration

**Solutions:**

1. **Check cron schedule entries:**
   ```sql
   SELECT job_code, status, messages, scheduled_at, executed_at, finished_at
   FROM cron_schedule
   WHERE job_code LIKE '%plenty_profile%'
   ORDER BY scheduled_at DESC
   LIMIT 10;
   ```

2. **Review cron messages:**
   ```sql
   SELECT messages FROM cron_schedule
   WHERE job_code LIKE '%plenty_profile%'
   AND messages IS NOT NULL
   ORDER BY scheduled_at DESC;
   ```

3. **Test profile manually:**
   ```bash
   # If this works but cron doesn't, it's a cron configuration issue
   bin/magento plenty:item:import --verbose
   ```

4. **Check crontab.xml configuration:**
   ```bash
   # Verify module's crontab.xml exists
   find vendor/byte8 -name crontab.xml

   # Check for syntax errors
   ```

### Issue: Multiple Profile Instances Running Simultaneously

**Symptoms:**
- Multiple instances of same profile running
- Database locks and conflicts
- Unpredictable results
- Performance degradation

**Cause:** Cron overlap - profile takes longer than cron interval.

**Solutions:**

1. **Increase cron interval:**
   ```bash
   # If profile takes 20 minutes, don't run every 15 minutes
   # Change from */15 * * * * to */30 * * * *
   ```

2. **Enable cron locking:**
   ```php
   // In profile configuration
   'use_cron_lock' => true
   ```

3. **Verify no overlap:**
   ```sql
   SELECT job_code, status, scheduled_at, executed_at, finished_at
   FROM cron_schedule
   WHERE job_code = 'plenty_profile_item_import'
   AND status = 'running';

   -- Should return 0 rows when not running, 1 row max when running
   ```

4. **Kill duplicate processes:**
   ```bash
   # Find duplicate processes
   ps aux | grep "plenty:item:import"

   # Kill extras (keep one)
   kill <pid>
   ```

## Profile History and Logging Issues

### Issue: No Profile History Recorded

**Symptoms:**
- Profile executes successfully
- No entries in profile history table
- Cannot track execution history

**Cause:** History recording not enabled or database issue.

**Solutions:**

1. **Enable history recording:**
   ```bash
   # Via Admin
   # Byte8 → Profiles → Manage Profiles → [Profile]
   # Configuration → History → Enable: Yes
   ```

2. **Check database table:**
   ```sql
   -- Verify table exists
   SHOW TABLES LIKE 'byte8_profile_history';

   -- Check for recent entries
   SELECT * FROM byte8_profile_history ORDER BY created_at DESC LIMIT 10;
   ```

3. **Verify database permissions:**
   ```bash
   # MySQL user should have INSERT/UPDATE permissions on profile tables
   ```

### Issue: Log Files Not Created

**Symptoms:**
- Logs enabled but files not created
- Empty log files
- Cannot debug profile execution

**Solutions:**

1. **Verify logging is enabled:**
   ```bash
   bin/magento config:show plenty/log_config/is_active
   bin/magento config:show plenty/log_config/log_level
   ```

2. **Enable logging:**
   ```bash
   bin/magento config:set plenty/log_config/is_active 1
   bin/magento config:set plenty/log_config/log_level info
   bin/magento cache:flush
   ```

3. **Check file permissions:**
   ```bash
   # Ensure var/log directory is writable
   ls -la var/log/

   # Fix permissions if needed
   chmod 755 var/log
   chown www-data:www-data var/log
   ```

4. **Test logging:**
   ```bash
   # Run command with verbose flag
   bin/magento plenty:item:import --verbose

   # Check if log file is created
   ls -la var/log/plenty_*.log
   ```

## Profile Performance Issues

### Issue: Profile Execution Very Slow

**Symptoms:**
- Profile takes hours to complete
- Single entity processing takes minutes
- System resources underutilized

**Causes:**
- Large batch sizes
- Inefficient queries
- API rate limiting
- Network latency
- Missing database indexes

**Solutions:**

1. **Optimize batch size:**
   - Test different collection sizes
   - Find optimal balance (usually 100-500)

2. **Enable parallel processing:**
   ```bash
   # Start multiple queue consumers
   for i in {1..3}; do
       bin/magento queue:consumers:start plentyItemImportConsumer &
   done
   ```

3. **Add database indexes:**
   ```sql
   -- Check for missing indexes
   SHOW INDEX FROM plenty_item;

   -- Add indexes on commonly queried columns
   ALTER TABLE plenty_item ADD INDEX idx_sku (sku);
   ALTER TABLE plenty_item ADD INDEX idx_plenty_item_id (plenty_item_id);
   ```

4. **Optimize API requests:**
   - Enable gzip compression
   - Use appropriate filters to reduce data
   - Increase API timeout for large responses

5. **Schedule during off-peak hours:**
   ```bash
   # Run heavy syncs at night
   0 2 * * * /usr/bin/php /path/bin/magento plenty:item:import
   ```

### Issue: Profile Consumes Too Much CPU/Memory

**Symptoms:**
- Server CPU at 100%
- High memory usage
- System becomes unresponsive
- Other services affected

**Solutions:**

1. **Limit resource usage:**
   ```bash
   # Use nice to lower priority
   nice -n 10 bin/magento plenty:item:import

   # Limit memory
   php -d memory_limit=512M bin/magento plenty:item:import
   ```

2. **Process in smaller batches:**
   - Reduce `collection_size`
   - Add delays between batches

3. **Use ionice for I/O:**
   ```bash
   # Lower I/O priority
   ionice -c 2 -n 7 bin/magento plenty:item:import
   ```

4. **Schedule appropriately:**
   - Run during low-traffic periods
   - Stagger different profile executions
   - Avoid running multiple heavy profiles simultaneously

## Debugging Profile Issues

### Enable All Debug Logging

```bash
# Enable debug logging
bin/magento config:set plenty/log_config/is_active 1
bin/magento config:set plenty/log_config/is_active_debug 1
bin/magento config:set plenty/log_config/log_level debug
bin/magento cache:flush
```

### View Profile Execution Details

```bash
# View profile history
mysql> SELECT * FROM byte8_profile_history
       WHERE profile_id = 1
       ORDER BY created_at DESC LIMIT 10;

# View profile configuration
mysql> SELECT path, value FROM byte8_profile_config
       WHERE profile_id = 1;

# Export configuration for review
bin/magento profile:export:config --profile=1
```

### Test Profile Execution

```bash
# Run profile manually with verbose output
bin/magento plenty:item:import --verbose

# Test specific entity
bin/magento plenty:item:import -i 100 --verbose

# Check execution time
time bin/magento plenty:item:import
```

## Prevention Best Practices

1. **Monitor profile execution regularly:**
   ```bash
   # Check for failures daily
   mysql> SELECT COUNT(*) FROM byte8_profile_history
          WHERE status = 'error' AND DATE(created_at) = CURDATE();
   ```

2. **Set up alerts:**
   - Email notifications on profile failures
   - Slack/Discord webhooks for errors
   - Monitoring dashboard for execution times

3. **Test configuration changes:**
   - Always test in staging first
   - Validate with single entity before bulk operations
   - Monitor first few executions after changes

4. **Keep logs rotated:**
   ```bash
   # Configure logrotate for Magento logs
   # /etc/logrotate.d/magento
   /var/www/magento/var/log/*.log {
       daily
       rotate 14
       compress
       missingok
       notifempty
   }
   ```

5. **Regular maintenance:**
   ```bash
   # Clean old profile history (older than 90 days)
   mysql> DELETE FROM byte8_profile_history
          WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

   # Optimize tables monthly
   mysql> OPTIMIZE TABLE byte8_profile_history;
   mysql> OPTIMIZE TABLE plenty_item;
   ```

## Getting Help

If profile issues persist:

1. **Collect diagnostic data:**
   ```bash
   # System check
   bin/magento plenty:system:check > system-check.log

   # Profile configuration
   bin/magento profile:export:config --profile=1 > profile-config.json

   # Recent history
   mysql> SELECT * FROM byte8_profile_history
          WHERE profile_id = 1
          ORDER BY created_at DESC LIMIT 20;
   ```

2. **Gather logs:**
   ```bash
   tar -czf profile-logs.tar.gz var/log/plenty_*.log var/log/cron.log
   ```

3. **Contact support with:**
   - Profile configuration
   - Execution history
   - Log files
   - Steps to reproduce
   - Expected vs actual behavior

## Related Documentation

- **[Profile Creation](/docs/profiles/create-profile)** - Create and configure profiles
- **[Profile Scheduling](/docs/profiles/scheduling)** - Automate profile execution
- **[Common Issues](/docs/troubleshooting/common-issues)** - General troubleshooting
- **[API Errors](/docs/troubleshooting/api-errors)** - API error reference

---

**Pro Tip:** Most profile execution issues can be diagnosed by running the profile manually with `--verbose` flag. This provides detailed output about each step of the process.

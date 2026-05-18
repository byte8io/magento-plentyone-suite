---
sidebar_position: 1
title: Connection Testing
description: Test and verify your PlentyONE API connection
---

# Connection Testing

Before starting data synchronization, it's crucial to verify that Mage2Plenty can successfully connect to your PlentyONE system. This guide covers various methods to test and troubleshoot your API connection.

## Quick Connection Test

The fastest way to test your connection is using the system check command:

```bash
bin/magento plenty:system:check
```

This comprehensive command checks:
- ✅ System requirements (PHP, Magento versions)
- ✅ Required PHP extensions
- ✅ Module status
- ✅ Client configuration (URL, credentials)
- ✅ File system permissions
- ✅ **API connection to PlentyONE**

### Example Output

```
PlentyONE System Check
======================

System Requirements
-------------------
✅ PHP Version         8.3.0      Required: 8.1.0+
✅ Magento Version     2.4.8      Required: 2.4.4+
✅ PHP Memory Limit    2G         Recommended: 2G+

API Connection
--------------
Testing connection to PlentyONE API...
✓ Connection test successful! Found 2 webstore(s).

Summary
-------
All checks passed!
System is ready to use.
```

## Dedicated Connection Test

For a focused connection test without other system checks:

```bash
bin/magento plenty:client:test
```

This command specifically tests:
- Authentication with PlentyONE API
- Access token generation
- Basic API endpoint accessibility
- Webstore configuration retrieval

### Successful Connection

```bash
✓ Successfully connected to PlentyONE
✓ Access token obtained
✓ Found 2 configured webstore(s)

Connection details:
  URL: https://your-domain.plentymarkets-cloud01.com
  Client ID: 12345
  User ID: 1
```

### Failed Connection

If the connection fails, you'll see specific error messages:

```bash
✗ Connection failed: Invalid credentials
✗ Error: 401 Unauthorized

Please check:
1. API URL is correct
2. Username and password are valid
3. User has API access permissions
```

## Testing API Token Management

To test token generation and caching:

```bash
# Generate new access token
bin/magento plenty:client:token

# Force refresh token
bin/magento plenty:client:token --refresh
```

This is useful for:
- Verifying OAuth flow works correctly
- Testing token refresh mechanism
- Debugging authentication issues

## Configuration Verification

### Via Admin Panel

1. Navigate to **SoftCommerce → PlentyONE → Manage Client Connection**
2. Click **Test Connection** button
3. Check status indicators:
   - 🟢 Green = Connection successful
   - 🔴 Red = Connection failed (see error message)

### Via CLI Wizard

Run the setup wizard which includes connection testing:

```bash
bin/magento plenty:setup:client
```

The wizard will:
1. Collect API credentials
2. Test connection automatically
3. Save configuration if successful
4. Provide detailed error messages if failed

## Common Connection Issues

### Issue: "Connection timed out"

**Causes:**
- Firewall blocking outbound HTTPS connections
- Incorrect API URL
- PlentyONE system temporarily unavailable

**Solutions:**
```bash
# Test basic connectivity
curl -I https://your-domain.plentymarkets-cloud01.com

# Check firewall rules
# Ensure port 443 (HTTPS) is open for outbound connections

# Verify URL in configuration
bin/magento config:show plenty/client_config/url
```

### Issue: "401 Unauthorized"

**Causes:**
- Invalid username or password
- User account disabled in PlentyONE
- User lacks API access permissions

**Solutions:**
1. **Verify credentials in PlentyONE backend:**
   - Go to Setup → Settings → User → Accounts
   - Check user is active and has API rights

2. **Update credentials:**
   ```bash
   bin/magento config:set plenty/client_config/username "your-username"
   bin/magento config:set plenty/client_config/password "your-password" --lock-env
   bin/magento cache:flush
   ```

3. **Test with API client (for debugging):**
   ```bash
   curl -X POST https://your-domain.plentymarkets-cloud01.com/rest/login \
     -H "Content-Type: application/json" \
     -d '{"username":"your-user","password":"your-pass"}'
   ```

### Issue: "SSL certificate verification failed"

**Cause:**
- Missing or outdated CA certificates on server

**Solution:**
```bash
# Update CA certificates (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install ca-certificates

# Update CA certificates (CentOS/RHEL)
sudo yum update ca-certificates

# For development only: Disable SSL verification (NOT recommended for production)
# Add to di.xml temporarily for debugging
```

### Issue: "Rate limit exceeded"

**Cause:**
- Too many API requests in short timeframe
- Shared access token across multiple processes

**Solution:**
- Implement proper request throttling
- Use queue-based processing (`bin/magento queue:consumers:start`)
- Space out manual testing commands
- Check for concurrent cron jobs

## Monitoring API Health

### Check API Response Time

```bash
# Measure API call performance
time bin/magento plenty:client:test
```

**Expected response time:** < 2 seconds

If response time is consistently slow:
- Check network latency between servers
- Verify PlentyONE system status
- Consider upgrading your PlentyONE plan

### View API Logs

API interaction logs are stored in:

```
var/log/plenty_api.log          # All API requests/responses
var/log/plenty_api_error.log    # API errors only
```

Enable detailed logging:

```bash
# Enable debug mode
bin/magento config:set plenty/log_config/is_active_debug 1

# Run test
bin/magento plenty:client:test

# Review logs
tail -f var/log/plenty_api.log
```

## Network Requirements

Ensure your Magento server can reach:

| Service | URL Pattern | Port | Protocol |
|---------|-------------|------|----------|
| PlentyONE API | `*.plentymarkets-cloud*.com` | 443 | HTTPS |
| PlentyONE CDN | `cdn*.plentymarkets.com` | 443 | HTTPS |

### Testing Network Connectivity

```bash
# Test DNS resolution
nslookup your-domain.plentymarkets-cloud01.com

# Test HTTPS connectivity
openssl s_client -connect your-domain.plentymarkets-cloud01.com:443

# Test with timeout
timeout 10 curl -I https://your-domain.plentymarkets-cloud01.com
```

## Automated Connection Monitoring

Set up automated connection checks with cron:

```bash
# Add to crontab (check every 15 minutes)
*/15 * * * * /usr/bin/php /path/to/magento/bin/magento plenty:client:test >> /var/log/plenty_connection_monitor.log 2>&1
```

For alerting integration:

```bash
#!/bin/bash
# /path/to/check_plenty_connection.sh

/usr/bin/php /path/to/magento/bin/magento plenty:client:test > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "PlentyONE connection failed" | mail -s "Alert: Mage2Plenty Connection Down" admin@example.com
fi
```

## Next Steps

Once your connection test is successful:

1. ✅ **[Run Initial Setup](/docs/profiles/scheduling)** - Configure system properties
2. ✅ **[Create Your First Profile](/docs/profiles/create-profile)** - Set up synchronization
3. ✅ **[Test First Sync](/docs/testing/first-sync)** - Perform initial data sync test

## Troubleshooting Resources

- **[Common Issues](/docs/troubleshooting/common-issues)** - General problems and solutions
- **[API Errors](/docs/troubleshooting/api-errors)** - Detailed API error reference
- **[API Logging](/docs/configuration/api-logging)** - Configure detailed logging

## Related Commands

```bash
# Complete system check
bin/magento plenty:system:check

# Test connection only
bin/magento plenty:client:test

# Manage access token
bin/magento plenty:client:token [--refresh]

# Setup wizard (includes connection test)
bin/magento plenty:setup:client

# View configuration
bin/magento config:show plenty/client_config
```

---

**Need Help?** If connection tests continue to fail, contact support with:
- Complete output of `bin/magento plenty:system:check`
- Contents of `var/log/plenty_api_error.log`
- Your PlentyONE system URL (without credentials)
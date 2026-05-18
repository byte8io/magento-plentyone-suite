---
sidebar_position: 3
title: Client Configuration
description: Configure PlentyONE API connection and authentication settings
---

# Client Configuration

The Client Configuration section contains all settings required to connect Magento 2 to your PlentyONE ERP system. This includes authentication credentials, API settings, and logging options.

:::warning Prerequisites
Before configuring the connection, ensure you have:
- Reviewed [System Requirements](/docs/system-requirements)
- Created a PlentyONE admin user
- Collected all required credentials
- Verified network connectivity to PlentyONE
:::

## Accessing Client Configuration

1. Log in to your Magento Admin panel
2. Navigate to **Stores → Configuration**
3. In the left panel, expand **Soft Commerce**
4. Select **PlentyONE Integration**

:::tip Navigation Path
**Stores → Configuration → Soft Commerce → PlentyONE Integration**
:::

## Quick Setup Options

Before manually configuring settings, you have two convenient options available through the Actions menu:

### Initial Setup Wizard

**Recommended for first-time setup!**

The Initial Setup Wizard provides a step-by-step guide to configure your PlentyONE connection and collect essential configuration data.

**How to Access**:
1. Navigate to **Stores → Configuration → Soft Commerce → PlentyONE Integration**
2. In the **Authentication Settings** section header, click the **Actions** dropdown button
3. Select **Run Setup Wizard**

**What the Wizard Does**:
- **Step 1**: Tests your API connection
- **Step 2**: Collects configuration data from PlentyONE (warehouses, shipping providers, payment methods, etc.)
- **Step 3**: Creates required properties in PlentyONE for Magento integration
- **Step 4**: Reviews setup and completes initial configuration

:::tip First-Time Users
If this is your first time setting up Mage2Plenty, we strongly recommend using the Initial Setup Wizard. It automates many manual configuration steps and ensures all required PlentyONE properties are created correctly.
:::

**See**: [Initial Setup Wizard](/docs/configuration/initial-setup) for detailed step-by-step instructions.

### Purge All Data

**Use with caution!**

The Purge All Data function removes all synchronized data and configuration collected from PlentyONE, allowing you to start fresh.

**How to Access**:
1. Navigate to **Stores → Configuration → Soft Commerce → PlentyONE Integration**
2. In the **Authentication Settings** section header, click the **Actions** dropdown button
3. Select **Purge All Data**
4. Confirm the action

**What Gets Purged**:
- All collected configuration data (warehouses, shipping methods, payment methods, etc.)
- PlentyONE property mappings
- Profile execution history
- Cached API responses
- Synchronized metadata

**What Does NOT Get Purged**:
- Your authentication credentials (URL, username, password, client ID, etc.)
- Actual products, orders, categories, or customer data in Magento
- Actual data in PlentyONE
- Profile configurations (profiles themselves remain, only their history is cleared)

:::danger Destructive Action
Purging data is irreversible! You will need to run the Initial Setup Wizard again or manually reconfigure all settings. Only use this if you need to completely reset your integration setup.
:::

**When to Use Purge**:
- ✅ Starting fresh with a different PlentyONE system
- ✅ Switching from staging to production environment
- ✅ After major PlentyONE system changes
- ✅ Troubleshooting persistent configuration issues
- ❌ Normal operation (not needed regularly)

## Authentication Settings

These settings establish the connection between Magento and PlentyONE using OAuth 2.0 authentication.

### OAuth 2.0 Authentication

Mage2Plenty uses **REST API** with **OAuth 2.0** protocol for authorization and the "Bearer" authentication scheme to transmit access tokens.

**Token Management**:
- Access tokens are valid for **24 hours**
- When access token expires, the connector automatically uses the refresh token to obtain a new access token
- If refresh token is unavailable (initial connection), username and password are used to obtain both tokens
- Tokens are stored securely in Magento's encrypted configuration

:::info Automatic Token Refresh
The connector handles token refreshes automatically. You don't need to manually manage tokens.
:::

### Setting Up PlentyONE Admin User

:::tip Dedicated User
We recommend creating a separate admin user dedicated to managing the Magento connection. This provides better security and audit tracking.
:::

**Steps to Create Admin User in PlentyONE**:

1. Log in to your PlentyONE backend system
2. Navigate to **Setup → Settings → User → Accounts**
3. Click the **New** button to open the user form
4. Enter the following information:
   - **Username**: `magento-api` (or your preferred name)
   - **Password**: Strong, unique password
   - **UI Language**: **English** (Required!)
   - **Access Level**: **Admin** (Required!)
   - **Email**: Valid email address
5. Save the new user

:::danger Critical Requirements
- **UI Language** MUST be set to **English**
- **Access Level** MUST be set to **Admin**

Without these settings, the API connection will not work correctly!
:::

### Obtaining Required Information

Before configuring Magento, collect the following information from PlentyONE:

#### 1. Client ID (Plenty ID)

**Location**: Setup → Client → [Select your main client] → Settings → **Plenty ID**

This is your PlentyONE system's main ID number.

**Example**: `12345`

#### 2. Client URL (Domain)

**Location**: Setup → Client → [Select your main client] → Settings → **Domain**

This is your PlentyONE system's domain URL.

**Example**: `https://your-store.plentymarkets-cloud.com`

:::warning HTTPS Required
The URL MUST use HTTPS (secure protocol). HTTP connections are not supported.
:::

#### 3. Store ID

**Location**: Setup → Client → [Select your main client] → Settings → **Store ID**

This is your main store ID in PlentyONE.

**Example**: `1`

#### 4. Owner ID (User ID)

**Location**: Setup → Settings → User → Accounts → [Select the API user] → **User ID**

This is the ID of the admin user you created for the Magento connection.

**Example**: `100`

### Configuration Fields

#### Client Name

**Field**: `name`
**Path**: `plenty/client_config/name`
**Type**: Text
**Required**: No
**Scope**: Global
**Default**: Empty

A friendly name for this connection (for your reference only).

**Example**: `Magento Production` or `Mage2Plenty Connection`

**Configuration**:
1. Navigate to **Stores → Configuration → Soft Commerce → PlentyONE Integration**
2. Expand **Authentication Settings**
3. Enter a descriptive name in **Client Name**

#### Client URL

**Field**: `url`
**Path**: `plenty/client_config/url`
**Type**: Text (URL validation)
**Required**: Yes
**Scope**: Global
**Validation**: Must be valid URL with HTTPS, no whitespace

Your PlentyONE system's domain URL.

**Format**: `https://your-store.plentymarkets-cloud.com`

**Examples**:
```
✅ https://mystore.plentymarkets-cloud.com
✅ https://shop.plentymarkets.eu
❌ http://mystore.plentymarkets.com  (HTTP not allowed)
❌ mystore.plentymarkets.com          (Missing protocol)
❌ https://mystore.com/               (Trailing slash)
```

#### Client Username

**Field**: `username`
**Path**: `plenty/client_config/username`
**Type**: Text
**Required**: Yes
**Scope**: Global
**Validation**: Required, no whitespace

The username of the PlentyONE admin user created for API access.

**Example**: `magento-api`

:::tip Case Sensitive
Usernames are case-sensitive. Ensure you enter it exactly as created in PlentyONE.
:::

#### Client Password

**Field**: `password`
**Path**: `plenty/client_config/password`
**Type**: Password (encrypted/obscured)
**Backend Model**: `Magento\Config\Model\Config\Backend\Encrypted`
**Required**: Yes
**Scope**: Global
**Validation**: Required, no whitespace

The password for the PlentyONE admin user.

**Security Features**:
- Password is automatically encrypted when saved
- Displayed as asterisks in the admin panel
- Stored securely in Magento's encrypted configuration
- Never logged in plain text

:::warning Password Security
- Use a strong, unique password
- Never share or commit passwords to version control
- Rotate passwords periodically
- Use different passwords for dev/staging/production
:::

#### Client ID

**Field**: `client_id`
**Path**: `plenty/client_config/client_id`
**Type**: Text
**Required**: Yes
**Scope**: Global, Website
**Validation**: Required, no whitespace

Your PlentyONE system's Plenty ID.

**Example**: `12345`

**Where to Find**: Setup → Client → [Your Client] → Settings → Plenty ID

#### Owner ID

**Field**: `owner_id`
**Path**: `plenty/client_config/owner_id`
**Type**: Text
**Required**: Yes
**Scope**: Global, Website
**Validation**: Required, no whitespace

The User ID of the PlentyONE admin user for API access.

**Example**: `100`

**Where to Find**: Setup → Settings → User → Accounts → [API User] → User ID

:::info Not Owner Account
This is the **User ID** of the API user, not the owner account ID. Make sure you're using the correct ID.
:::

#### Client Store ID

**Field**: `store_id`
**Path**: `plenty/client_config/store_id`
**Type**: Text
**Required**: Yes
**Scope**: Global, Website
**Validation**: Required, no whitespace

Your PlentyONE store ID.

**Example**: `1`

**Where to Find**: Setup → Client → [Your Client] → Settings → Store ID

### Configuration Example

Here's a complete authentication configuration example:

```
Client Name: Magento Production
Client URL: https://mystore.plentymarkets-cloud.com
Client Username: magento-api
Client Password: ****************
Client ID: 12345
Owner ID: 100
Client Store ID: 1
```

## REST API Settings

These settings control how Magento communicates with the PlentyONE REST API.

### Connection Retry

**Field**: `connection_retry`
**Path**: `plenty/api_config/connection_retry`
**Type**: Number
**Default**: `3`
**Scope**: Global

Number of retry attempts in case of connection errors.

**How It Works**:
1. Initial API request
2. If fails → Wait 1 second → Retry #1
3. If fails → Wait 2 seconds → Retry #2
4. If fails → Wait 4 seconds → Retry #3
5. If still fails → Log error and abort

**Recommended Values**:
- **Development**: `1` (faster feedback)
- **Staging**: `3` (balanced)
- **Production**: `5` (maximum reliability)

**Example**:
```bash
bin/magento config:set plenty/api_config/connection_retry 5
```

### Connection Timeout

**Field**: `connection_timeout`
**Path**: `plenty/api_config/connection_timeout`
**Type**: Number (seconds)
**Default**: `60`
**Scope**: Global

Maximum time to wait for initial connection to be established.

**Description**: How long to wait for the server to respond to the connection request. When not configured, the API client uses a default of 60 seconds (previously unlimited).

**Recommended Values**:
- **Fast Network**: `10-15` seconds
- **Normal Network**: `30-60` seconds
- **Slow/International**: `60-90` seconds

**Impact**:
- Too low: False failures on slow networks
- Too high: Longer waits when server is actually down

### Request Timeout

**Field**: `request_timeout`
**Path**: `plenty/api_config/request_timeout`
**Type**: Number (seconds)
**Default**: `120`
**Scope**: Global

Maximum time to wait for API request to complete.

**Description**: How long to wait for the entire request/response cycle to complete after connection is established. When not configured, the API client uses a default of 120 seconds (previously unlimited).

**Recommended Values**:
- **Simple Requests**: `30-60` seconds
- **Complex Requests**: `90-120` seconds
- **Bulk Operations**: `180-300` seconds

**Considerations**:
- Large product catalogs need longer timeouts
- Image uploads require more time
- Consider server processing time

### Debug Mode

**Field**: `debug_mode`
**Path**: `plenty/api_config/debug_mode`
**Type**: Yes/No
**Default**: No
**Scope**: Global

Enable debug mode for REST API calls to show additional information in logs.

**When Enabled**:
- Logs detailed request/response information
- Includes HTTP headers
- Shows API endpoints called
- Records response times
- Captures error details

**Log Output Example**:

```
[2025-10-12 14:30:45] DEBUG: API Request
Method: GET
URL: https://mystore.plentymarkets-cloud.com/rest/items
Headers: {
    "Authorization": "Bearer eyJ0eXAiOiJKV1Q...",
    "Content-Type": "application/json"
}

[2025-10-12 14:30:46] DEBUG: API Response
Status: 200 OK
Time: 1.25s
Headers: {...}
Body: {...}
```

**Use Cases**:
- ✅ Development and testing
- ✅ Troubleshooting connection issues
- ✅ Debugging API errors
- ❌ Production (generates large log files)

:::warning Performance Impact
Debug mode significantly increases log file size. Only enable when needed for troubleshooting.
:::

### Verbose cURL Mode

**Field**: `verbose_mode`
**Path**: `plenty/api_config/verbose_mode`
**Type**: Yes/No
**Default**: No
**Scope**: Global

Enable verbose mode for cURL requests to show detailed connection information.

**When Enabled**:
- Shows DNS resolution details
- Displays SSL/TLS handshake information
- Logs TCP connection details
- Records redirect chains
- Captures timing breakdown

**Log Output Example**:

```
* Trying 185.141.58.152:443...
* Connected to mystore.plentymarkets-cloud.com (185.141.58.152) port 443
* ALPN, offering h2
* ALPN, offering http/1.1
* successfully set certificate verify locations:
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* ALPN, server accepted to use h2
* Server certificate:
*  subject: CN=*.plentymarkets-cloud.com
*  start date: Dec 01 00:00:00 2024 GMT
*  expire date: Dec 31 23:59:59 2025 GMT
*  subjectAltName: host "mystore.plentymarkets-cloud.com" matched cert's "*.plentymarkets-cloud.com"
* Connection state changed (HTTP/2 confirmed)
* Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
* Using Stream ID: 1 (easy handle 0x7f9c1c808e00)
> GET /rest/items HTTP/2
> Host: mystore.plentymarkets-cloud.com
> user-agent: Magento/2.4.7 (Mage2Plenty/1.15.1)
> accept: */*
```

**Use Cases**:
- ✅ Debugging SSL/TLS issues
- ✅ Troubleshooting DNS problems
- ✅ Investigating connection failures
- ✅ Network diagnostics
- ❌ Normal operation (extremely verbose)

:::caution Extremely Verbose
This mode generates massive log files. Only enable for specific troubleshooting tasks.
:::

## API Logging Settings

Control what API data is logged for monitoring and debugging.

### Log REST API

**Field**: `is_active_api_log`
**Path**: `plenty/developer_config/is_active_api_log`
**Type**: Yes/No
**Default**: No
**Scope**: Global

Enable logging of API request and response data to files.

**When Enabled**:
- All API calls are logged
- Request and response data recorded
- Timestamps and durations captured
- Error details preserved
- Logged to `var/log/softcommerce/plenty/api.log`

**Configuration**:
1. Navigate to **Stores → Configuration → Soft Commerce → PlentyONE Integration**
2. Expand **Client REST API Settings**
3. Set **Log REST API** to **Yes**
4. Configure **Log contents** (see below)
5. Click **Save Config**

### Log Contents Filter

**Field**: `api_log_content_filter`
**Path**: `plenty/developer_config/api_log_content_filter`
**Type**: Multiselect
**Source Model**: `SoftCommerce\PlentyClient\Model\Source\ApiLogContentsFilter`
**Depends On**: `is_active_api_log` = Yes
**Scope**: Global

Select which content types to include in API logs.

**Available Options**:
- **Request URL** - Log the API endpoint being called
- **Request Headers** - Log HTTP request headers
- **Request Body** - Log request payload
- **Response Headers** - Log HTTP response headers
- **Response Body** - Log response payload
- **Error Details** - Log detailed error information
- **Timing Information** - Log request duration

**Recommended Combinations**:

**Minimal Logging** (Low disk usage):
```
✓ Request URL
✓ Error Details
✓ Timing Information
```

**Standard Logging** (Balanced):
```
✓ Request URL
✓ Request Body
✓ Response Body
✓ Error Details
✓ Timing Information
```

**Full Logging** (Maximum detail, high disk usage):
```
✓ Request URL
✓ Request Headers
✓ Request Body
✓ Response Headers
✓ Response Body
✓ Error Details
✓ Timing Information
```

**Example Log Entry**:

```json
{
    "timestamp": "2025-10-12T14:30:45+00:00",
    "request": {
        "url": "https://mystore.plentymarkets-cloud.com/rest/items",
        "method": "GET",
        "headers": {
            "Authorization": "Bearer eyJ0eXAiOiJKV1Q...",
            "Content-Type": "application/json"
        },
        "body": null
    },
    "response": {
        "status": 200,
        "headers": {
            "Content-Type": "application/json",
            "X-Plenty-Global-Data-Reset": "0"
        },
        "body": {
            "page": 1,
            "entries": [...]
        }
    },
    "duration": 1.25,
    "memory": "25MB"
}
```

## Testing the Connection

After configuring authentication settings:

1. Scroll to the bottom of the **Authentication Settings** section
2. Click the **Test Connection** button
3. Wait for the test to complete

**Possible Results**:

**✅ Success**:
```
Connection successful!
- Server: https://mystore.plentymarkets-cloud.com
- Client ID: 12345
- API Version: 1.0
- Response Time: 0.85s
```

**❌ Failure**:
```
Connection failed!
- Error: Invalid credentials
- HTTP Status: 401 Unauthorized
- Please check your username and password
```

:::tip Test Before Saving
Always test the connection before saving configuration to ensure credentials are correct.
:::

## Configuration via CLI

```bash
# View all client configuration
bin/magento config:show plenty

# Set authentication details
bin/magento config:set plenty/client_config/url "https://mystore.plentymarkets-cloud.com"
bin/magento config:set plenty/client_config/username "magento-api"
bin/magento config:set plenty/client_config/client_id "12345"
bin/magento config:set plenty/client_config/owner_id "100"
bin/magento config:set plenty/client_config/store_id "1"

# Configure API settings
bin/magento config:set plenty/api_config/connection_retry 5
bin/magento config:set plenty/api_config/connection_timeout 60
bin/magento config:set plenty/api_config/request_timeout 120

# Enable logging
bin/magento config:set plenty/developer_config/is_active_api_log 1

# Test connection
bin/magento plenty:client:test

# Clear cache
bin/magento cache:flush
```

## Troubleshooting

### Connection Timeout

**Problem**: "Connection timeout" error when testing

**Solutions**:
1. Verify PlentyONE URL is correct and accessible
2. Check firewall rules allow HTTPS connections
3. Increase `connection_timeout` value
4. Test URL in browser: `https://your-url.com/rest`
5. Check DNS resolution: `nslookup your-url.com`

### Invalid Credentials

**Problem**: "401 Unauthorized" or "Invalid credentials"

**Solutions**:
1. Verify username and password are correct (case-sensitive)
2. Check user has Admin access in PlentyONE
3. Verify user's UI Language is set to English
4. Try logging in to PlentyONE backend with same credentials
5. Regenerate password if needed

### SSL Certificate Error

**Problem**: "SSL certificate problem" or "unable to verify certificate"

**Solutions**:
1. Ensure URL uses HTTPS (not HTTP)
2. Check server's SSL certificate is valid
3. Update cURL and OpenSSL versions
4. Verify certificate chain is complete
5. Check system date/time is correct

### Token Refresh Failures

**Problem**: Frequent "Token expired" errors

**Solutions**:
1. Check system time is synchronized (NTP)
2. Verify refresh token is being saved
3. Review `var/log/softcommerce/plenty/client.log`
4. Clear Magento cache
5. Reconfigure authentication settings

## Security Best Practices

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Don't reuse passwords

2. **Rotate Credentials**
   - Change passwords every 90 days
   - Update after staff changes
   - Use different credentials per environment

3. **Limit Access**
   - Restrict admin panel access
   - Use role-based permissions
   - Enable two-factor authentication

4. **Monitor Activity**
   - Review API logs regularly
   - Set up email alerts for failures
   - Monitor for suspicious activity

5. **Secure Configuration**
   - Never commit credentials to git
   - Use environment variables for sensitive data
   - Encrypt configuration backups

## Next Steps

Now that you've configured the client connection:

1. ✅ **[Test Connection](/docs/testing/connection-test)** - Verify connectivity
2. 📊 **[Create Profiles](/docs/profiles/about-profiles)** - Set up synchronization
3. 📝 **[API Logging](/docs/configuration/api-logging)** - Configure detailed logging
4. 🔄 **[First Sync](/docs/testing/first-sync)** - Perform first data sync

## Related Documentation

- [Configuration Overview](/docs/configuration/overview)
- [Core Configuration](/docs/configuration/core-configuration)
- [System Requirements](/docs/system-requirements)
- [OAuth 2.0 Authentication](https://oauth.net/2/)
- [PlentyONE REST API Documentation](https://developers.plentymarkets.com/rest-doc)

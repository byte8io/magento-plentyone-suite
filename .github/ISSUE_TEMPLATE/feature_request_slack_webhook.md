---
name: Slack Webhook Notifications
about: Add Slack webhook integration for profile notifications
title: '[FEATURE] Slack Webhook Notifications'
labels: enhancement, notification
assignees: ''
---

## Feature Description

Add Slack webhook integration to the Profile Notification system (`module-profile-notification`), enabling real-time alerts and batch summaries to be sent directly to Slack channels.

## Business Value

- Immediate visibility of critical errors in team Slack channels
- Centralized monitoring without requiring Admin panel access
- Improved incident response time through real-time notifications
- Better team collaboration on profile execution issues

## Current State

The Profile Notification system currently supports:
- Admin UI notification grid
- Email notifications (immediate critical alerts and batch summaries)
- Severity-based filtering (debug, notice, warning, error, critical)
- CLI commands for manual notification management

**Missing:** Slack webhook integration

## Proposed Implementation

### 1. Configuration (Admin: System > Configuration > Byte8 > Profile Notification > Slack)

Add new configuration fields in `etc/adminhtml/system.xml`:

```xml
<group id="slack" translate="label" showInDefault="1" showInWebsite="0" showInStore="0" sortOrder="30">
    <label>Slack Notifications</label>
    <field id="enabled" translate="label comment" type="select" sortOrder="10" showInDefault="1">
        <label>Enable Slack Notifications</label>
        <source_model>Magento\Config\Model\Config\Source\Yesno</source_model>
        <comment>Send notifications to Slack via webhook</comment>
    </field>
    <field id="webhook_url" translate="label comment" type="obscure" sortOrder="20" showInDefault="1">
        <label>Webhook URL</label>
        <backend_model>Magento\Config\Model\Config\Backend\Encrypted</backend_model>
        <comment><![CDATA[Slack Incoming Webhook URL. <a href="https://api.slack.com/messaging/webhooks" target="_blank">Create webhook</a>]]></comment>
        <depends>
            <field id="enabled">1</field>
        </depends>
    </field>
    <field id="threshold" translate="label comment" type="select" sortOrder="30" showInDefault="1">
        <label>Minimum Severity</label>
        <source_model>Byte8\ProfileNotification\Model\Config\Source\Severity</source_model>
        <comment>Only send notifications at or above this severity level</comment>
        <depends>
            <field id="enabled">1</field>
        </depends>
    </field>
    <field id="real_time_critical" translate="label comment" type="select" sortOrder="40" showInDefault="1">
        <label>Immediate Critical Alerts</label>
        <source_model>Magento\Config\Model\Config\Source\Yesno</source_model>
        <comment>Send critical notifications immediately (bypasses batching)</comment>
        <depends>
            <field id="enabled">1</field>
        </depends>
    </field>
    <field id="include_link" translate="label comment" type="select" sortOrder="50" showInDefault="1">
        <label>Include Admin Link</label>
        <source_model>Magento\Config\Model\Config\Source\Yesno</source_model>
        <comment>Add link to Admin notification page</comment>
        <depends>
            <field id="enabled">1</field>
        </depends>
    </field>
</group>
```

### 2. Sender Class

Create `Model/Sender/SlackSender.php`:

```php
<?php
namespace Byte8\ProfileNotification\Model\Sender;

use Byte8\ProfileNotification\Api\Data\NotificationInterface;
use Magento\Framework\HTTP\Client\Curl;
use Magento\Framework\Serialize\Serializer\Json;
use Psr\Log\LoggerInterface;

class SlackSender implements SenderInterface
{
    public function __construct(
        private ConfigInterface $config,
        private Curl $curl,
        private Json $json,
        private LoggerInterface $logger
    ) {}

    public function send(array $notifications): bool
    {
        if (!$this->config->isSlackEnabled()) {
            return false;
        }

        $webhookUrl = $this->config->getSlackWebhookUrl();
        if (!$webhookUrl) {
            $this->logger->error('Slack webhook URL not configured');
            return false;
        }

        try {
            $payload = $this->buildPayload($notifications);

            $this->curl->setOption(CURLOPT_RETURNTRANSFER, true);
            $this->curl->setOption(CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            $this->curl->post($webhookUrl, $this->json->serialize($payload));

            $response = $this->curl->getBody();
            $statusCode = $this->curl->getStatus();

            if ($statusCode !== 200) {
                $this->logger->error("Slack webhook failed: {$statusCode} - {$response}");
                return false;
            }

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Slack notification error: ' . $e->getMessage());
            return false;
        }
    }

    private function buildPayload(array $notifications): array
    {
        $count = count($notifications);
        $severityCounts = [];

        foreach ($notifications as $notification) {
            $severity = $notification->getSeverity();
            $severityCounts[$severity] = ($severityCounts[$severity] ?? 0) + 1;
        }

        $color = $this->getSeverityColor($notifications[0]->getSeverity());

        $fields = [];
        foreach ($severityCounts as $severity => $count) {
            $fields[] = [
                'title' => ucfirst($severity),
                'value' => $count,
                'short' => true
            ];
        }

        $text = $count === 1
            ? "*{$notifications[0]->getTitle()}*\n{$notifications[0]->getMessage()}"
            : "*{$count} Profile Notifications*";

        $attachment = [
            'color' => $color,
            'text' => $text,
            'fields' => $fields,
            'footer' => 'Mage2Plenty',
            'ts' => time()
        ];

        if ($this->config->shouldIncludeAdminLink()) {
            $attachment['actions'] = [
                [
                    'type' => 'button',
                    'text' => 'View in Admin',
                    'url' => $this->getAdminUrl()
                ]
            ];
        }

        return ['attachments' => [$attachment]];
    }

    private function getSeverityColor(string $severity): string
    {
        return match($severity) {
            'critical' => 'danger',
            'error' => 'warning',
            'warning' => '#FFA500',
            'notice' => 'good',
            default => '#808080'
        };
    }
}
```

### 3. Integration Points

**Reuse existing notification flow:**
- Hook into existing `NotificationRepositoryInterface::save()` via observer
- Use same severity filtering logic as email notifications
- Integrate with batch processing system

**Observer example:**
```php
class SendSlackNotification implements ObserverInterface
{
    public function execute(Observer $observer)
    {
        $notification = $observer->getEvent()->getNotification();

        if ($this->shouldSendImmediately($notification)) {
            $this->slackSender->send([$notification]);
        }
        // Otherwise handled by batch processor
    }
}
```

### 4. CLI Command Enhancement

Extend existing batch command to support Slack:

```bash
bin/magento byte8:notification:send-batch-emails --channel=slack
bin/magento byte8:notification:send-batch-emails --channel=all
```

## Testing Requirements

1. **Unit Tests:**
   - SlackSender payload building
   - Configuration validation
   - Error handling

2. **Integration Tests:**
   - Webhook URL validation
   - Notification filtering by severity
   - Batch processing

3. **Manual Testing:**
   - Configure Slack webhook in Admin
   - Trigger test notification
   - Verify message formatting in Slack
   - Test critical immediate alerts
   - Verify batch summaries

## Acceptance Criteria

- [ ] Admin configuration for Slack webhook URL and settings
- [ ] Webhook URL stored securely (encrypted)
- [ ] Severity-based filtering works (reuse existing logic)
- [ ] Critical notifications sent immediately (if enabled)
- [ ] Batch notifications work with existing batch system
- [ ] Proper error handling and logging
- [ ] Slack message formatting with severity colors
- [ ] Optional link to Admin notification page
- [ ] CLI command supports `--channel=slack` flag
- [ ] Documentation updated with Slack setup instructions

## Dependencies

**External:**
- Slack workspace with Incoming Webhooks enabled
- Slack webhook URL (created by user)

**Internal:**
- `module-profile-notification` (existing)
- Magento HTTP client (`Magento\Framework\HTTP\Client\Curl`)
- No new Composer dependencies required

## Estimated Effort

**2-4 hours** for a developer familiar with the codebase:
- Configuration: 30 minutes
- Sender class: 1 hour
- Integration/Observer: 30 minutes
- Testing: 1 hour
- Documentation: 30 minutes

## Documentation Requirements

Update `/docs/monitoring/profiles.md` and `/docs/monitoring/admin-notifications.md`:

```markdown
### Slack Notifications

Send profile notifications directly to Slack channels:

**Setup:**

1. Create Slack Incoming Webhook:
   - Go to https://api.slack.com/apps
   - Create New App > From scratch
   - Add Incoming Webhooks feature
   - Create webhook for target channel
   - Copy webhook URL

2. Configure in Magento:
```bash
bin/magento config:set byte8_profile_notification/slack/enabled 1
bin/magento config:set byte8_profile_notification/slack/webhook_url "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
bin/magento config:set byte8_profile_notification/slack/threshold error
bin/magento config:set byte8_profile_notification/slack/real_time_critical 1
bin/magento cache:flush
```

3. Test notification:
```bash
bin/magento byte8:notification:send-batch-emails --channel=slack --preview
```

## Additional Notes

- **Security:** Webhook URL must be encrypted in `core_config_data`
- **Rate Limiting:** Slack allows 1 message per second - use batching for high-volume
- **Message Format:** Use Slack's attachment format for rich formatting
- **Backward Compatibility:** Feature is opt-in, no impact on existing email notifications

## References

- [Slack Incoming Webhooks Documentation](https://api.slack.com/messaging/webhooks)
- [Slack Message Formatting](https://api.slack.com/reference/surfaces/formatting)
- [Existing Email Notification Implementation](packages/modules/module-profile-notification/Model/Sender/EmailSender.php)
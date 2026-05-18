import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'system-requirements',
    'magento-version-compatibility',
    {
      type: 'category',
      label: 'Installation',
      collapsed: false,
      items: [
        'installation/composer-installation',
        'installation/marketplace-composer-installation',
        'installation/upgrade-v1-to-v2',
        'installation/upgrade-new-connector',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'configuration/overview',
        'configuration/initial-setup',
        'configuration/core-configuration',
        'configuration/client-configuration',
        'configuration/profile-configuration',
        'configuration/payment-configuration',
        'configuration/api-logging',
      ],
    },
    {
      type: 'category',
      label: 'Profiles',
      items: [
        'profiles/about-profiles',
        'profiles/create-profile',
        'profiles/setup-auto-config',
        'profiles/scheduling',
        'profiles/product-export',
        'profiles/product-import',
        'profiles/category-export',
        'profiles/category-import',
        'profiles/customer-export',
        'profiles/customer-import',
        'profiles/order-export',
        'profiles/order-import',
        'profiles/stock-import',
      ],
    },
    {
      type: 'category',
      label: 'Mapping',
      items: [
        'mapping/attributes',
        'mapping/product-attributes',
        'mapping/product-identifiers',
        'mapping/payment-methods',
      ],
    },
    {
      type: 'category',
      label: 'Testing',
      items: [
        'testing/connection-test',
        'testing/first-sync',
        'testing/order-synchronization',
      ],
    },
    {
      type: 'category',
      label: 'Monitoring',
      items: [
        'monitoring/profiles',
        'monitoring/api-performance',
        'monitoring/admin-notifications',
        'monitoring/address-data-integrity',
      ],
    },
    {
      type: 'category',
      label: 'Extensions & plugins',
      items: [
        'extensions/free-plugins',
        'extensions/plenty-storefront',
        'extensions/packstation',
        'extensions/swissup-checkout-fields',
        'extensions/amasty-gift-card',
        'extensions/amasty-promo',
        'extensions/amasty-rewards',
        'extensions/amasty-cash-on-delivery',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/common-issues',
        'troubleshooting/api-errors',
        'troubleshooting/order-issues',
        'troubleshooting/profile-issues',
      ],
    },
    'cli-commands',
    'changelog',
    'changelog-archive',
  ],
};

export default sidebars;

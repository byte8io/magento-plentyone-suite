import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Byte8 PlentyONE Connector',
  tagline:
    'Magento 2 ⇆ PlentyONE. Official appointed partner integration — products, orders, stock, marketplace, customers.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  // Production URL — served under unified docs domain (Cloudflare Pages + Worker router).
  // See infra/docs-router in the byte8.io monorepo + docs/DOCS_SITE_MIGRATION.md.
  url: 'https://docs.byte8.io',
  baseUrl: '/plentyone/',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl:
            'https://github.com/byte8io/magento-plentyone-suite/edit/main/docs/',
        },
        blog: {
          showReadingTime: true,
          blogTitle: 'Changelog & updates',
          blogDescription: 'Release notes for the Byte8 PlentyONE Connector',
          postsPerPage: 10,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/byte8io/magento-plentyone-suite/edit/main/docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // Capture-phase click interceptor that forces same-tab navigation for DocSearch
  // hits pointing at sibling docs.byte8.io sites. See the module for the SEO/UX
  // rationale (replaces externalUrlRegex).
  clientModules: ['./src/clientModules/fix-docsearch-nav.ts'],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Byte8',
      logo: {
        alt: 'Byte8 PlentyONE Connector',
        src: 'img/logo.svg',
        srcDark: 'img/logo.svg',
        width: 32,
        height: 32,
      },
      items: [
        {
          href: 'https://docs.byte8.io/',
          label: '← All docs',
          position: 'left',
          target: '_self',
          rel: null,
        },
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        { to: '/blog', label: 'Changelog', position: 'left' },
        {
          href: 'https://byte8.io/integrations/plentyone#pricing',
          label: 'Pricing',
          position: 'left',
        },
        {
          href: 'https://github.com/byte8io/magento-plentyone-suite',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
        {
          href: 'https://byte8.io/integrations/plentyone/demo',
          label: 'Request demo',
          position: 'right',
          className: 'navbar-cta-button',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'Byte8',
        src: 'img/logo.svg',
        href: 'https://byte8.io',
        width: 32,
        height: 32,
      },
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting started', to: '/docs/intro' },
            { label: 'Installation', to: '/docs/installation/composer-installation' },
            { label: 'Configuration', to: '/docs/configuration/overview' },
            { label: 'Profiles', to: '/docs/profiles/about-profiles' },
            { label: 'Troubleshooting', to: '/docs/troubleshooting/common-issues' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'Changelog', to: '/blog' },
            { label: 'PlentyONE product page', href: 'https://byte8.io/integrations/plentyone' },
            { label: 'Request demo', href: 'https://byte8.io/integrations/plentyone/demo' },
            { label: 'GitHub', href: 'https://github.com/byte8io/magento-plentyone-suite' },
          ],
        },
        {
          title: 'Byte8',
          items: [
            { label: 'byte8.io', href: 'https://byte8.io' },
            { label: 'All integrations', href: 'https://byte8.io/integrations' },
            { label: 'Contact', href: 'mailto:helo@byte8.io' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Byte8 Ltd. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.vsDark,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['php', 'bash', 'json', 'xml-doc', 'tsx', 'sql', 'graphql', 'yaml'],
    },
    // Algolia DocSearch — cross-product search across every docs.byte8.io/* site.
    // Public Search-Only credentials (designed to ship in client JS, restricted to
    // read-only queries on this index). Safe to commit.
    algolia: {
      appId: 'VWO679B1LI',
      apiKey: 'b3f3b5b76b0d684e50796c9e045b41e5',
      indexName: 'Byte8 Documentation Site',
      contextualSearch: false,
      searchPagePath: 'search',
      // Cross-site navigation handled by src/clientModules/fix-docsearch-nav.ts —
      // intentionally NOT using externalUrlRegex (which would make Docusaurus's
      // <Link> emit absolute URLs with target="_blank", hurting internal-link SEO).
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

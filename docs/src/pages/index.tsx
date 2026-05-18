import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

interface FeatureCardProps {
  href: string;
  icon: string;
  title: string;
  body: string;
  cta: string;
}

function FeatureCard({ href, icon, title, body, cta }: FeatureCardProps) {
  return (
    <Link to={href} className={styles.featureCard}>
      <span className={styles.featureIcon} aria-hidden>{icon}</span>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureBody}>{body}</p>
      <span className={styles.featureFooter}>{cta} ↘</span>
    </Link>
  );
}

export default function Home(): React.ReactElement {
  return (
    <Layout
      title="Byte8 PlentyONE Connector — Magento 2 ⇆ PlentyONE"
      description="Official appointed-partner Magento 2 integration for PlentyONE. Products, orders, stock, customers, marketplace, with full MSI and v2 streaming pipeline for 100K+ SKU catalogs."
    >
      <main>
        {/* Hero */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>Magento 2 · PlentyONE · Appointed partner</span>
            <h1 className={styles.heroTitle}>
              Magento 2 ⇆ PlentyONE.{' '}
              <span className={styles.heroTitleAccent}>Enterprise grade.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              The official PlentyONE Magento integration. Products, orders, stock,
              customers, and marketplace imports synced both ways with
              configurable conflict resolution. v2 streaming pipeline holds up at
              100K+ SKU catalogs — 100× faster than v1, with item-isolated error
              handling so one bad row never poisons the batch.
            </p>
            <div className={styles.heroCtas}>
              <Link className="button button--primary button--lg" to="/docs/intro">
                Get started
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/installation/composer-installation">
                Install via Composer
              </Link>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <span className={styles.statValue}>100×</span>
                <span className={styles.statLabel}>v2 vs v1 throughput</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>100K+</span>
                <span className={styles.statLabel}>SKUs per catalog</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>15→1 min</span>
                <span className={styles.statLabel}>Stock sync tier ladder</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>MSI</span>
                <span className={styles.statLabel}>Multi-source inventory</span>
              </div>
            </div>
          </div>
        </section>

        {/* Core capabilities */}
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Core sync</span>
            <p className={styles.sectionLead}>
              Products, orders, stock, and customers flow between Magento and
              PlentyONE — bidirectional, per-profile, idempotent.
            </p>
          </header>

          <div className={styles.cardGrid}>
            <FeatureCard
              href="/docs/profiles/product-export"
              icon="📦"
              title="Products & variations"
              body="Export simple, configurable, bundle, and grouped products to PlentyONE. v2 pipeline streams variations through the PIM scroll API — no whole-catalog loads. Configurable-product MSI gap closed via the inventory-configurable-product bridge."
              cta="Product profiles"
            />
            <FeatureCard
              href="/docs/profiles/order-export"
              icon="🧾"
              title="Orders & marketplaces"
              body="Magento web orders export to PlentyONE for fulfilment with full pipeline: collection → customer → quote → order → invoice → shipment → credit memo. Marketplace orders from Amazon and eBay flow back via PlentyONE."
              cta="Order pipeline"
            />
            <FeatureCard
              href="/docs/profiles/stock-import"
              icon="📊"
              title="Stock & MSI"
              body="PlentyONE warehouses map to Magento MSI sources. Row-level locking for concurrency safety. Stock-sync interval ladders 15 min → 5 min → 1 min by tier. Reservations handled correctly across multi-warehouse setups."
              cta="Stock import"
            />
          </div>
        </section>

        {/* Mapping + extensibility */}
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Mapping & extensibility</span>
            <p className={styles.sectionLead}>
              Every connector quirk is configurable from the Magento admin —
              no code patches required.
            </p>
          </header>

          <div className={styles.cardGrid}>
            <FeatureCard
              href="/docs/mapping/attributes"
              icon="🔗"
              title="Attribute & property mapping"
              body="Map Magento product attributes to PlentyONE properties bidirectionally. Choose a custom identifier attribute for matching PlentyONE variations — no more SKU-only assumptions."
              cta="Attribute mapping"
            />
            <FeatureCard
              href="/docs/mapping/payment-methods"
              icon="💳"
              title="Payment & shipping methods"
              body="Per-tenant payment / shipping method mappings ensure orders route to the right PlentyONE codes. Bridges for Amasty COD, Amasty Gift Card, DHL Packstation ship in the metapackage."
              cta="Method mapping"
            />
            <FeatureCard
              href="/docs/extensions/free-plugins"
              icon="🧩"
              title="Free + third-party plugins"
              body="Bridges to Amasty Promo / Rewards, Swissup Checkout Fields, Webkul, and the official PlentyONE storefront ship as separate Composer modules — install only what your store actually uses."
              cta="Extensions"
            />
          </div>
        </section>

        {/* Operational visibility */}
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Monitoring & visibility</span>
            <p className={styles.sectionLead}>
              See profile health, API performance, and admin alerts without
              leaving the Magento admin you already live in.
            </p>
          </header>

          <div className={styles.cardGrid}>
            <FeatureCard
              href="/docs/monitoring/profiles"
              icon="⏱️"
              title="Profile execution monitoring"
              body="Per-profile run history, success / failure counts, queue depth, and SLA charts inside the Magento admin. Spot stuck batches before a customer notices."
              cta="Profile monitoring"
            />
            <FeatureCard
              href="/docs/monitoring/api-performance"
              icon="📈"
              title="API performance"
              body="Live request / response timing, error-rate tracking, and rate-limit headroom for both Magento and PlentyONE endpoints. Identify slow profiles, not just failed ones."
              cta="API performance"
            />
            <FeatureCard
              href="/docs/monitoring/admin-notifications"
              icon="🔔"
              title="Admin notifications"
              body="Email + on-screen alerts on profile failures, dead-letter accumulation, or API drift. Per-recipient routing — operators see queue issues, finance sees order-export failures."
              cta="Notifications"
            />
          </div>
        </section>

        {/* CTA band */}
        <section className={styles.ctaBand}>
          <h2 className={styles.ctaTitle}>Get a hosted demo before you commit.</h2>
          <p className={styles.ctaSubtitle}>
            We spin up a Magento + PlentyONE pairing on Byte8 infrastructure,
            pre-loaded with realistic data, for up to 14 days. No Composer
            access until you subscribe — no "install, extract, cancel" risk.
          </p>
          <div className={styles.heroCtas}>
            <Link className="button button--primary button--lg" to="https://byte8.io/integrations/plentyone/demo">
              Request demo
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/intro">
              Read the docs
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}

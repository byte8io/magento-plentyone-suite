---
version: 4.0.0
date: 2026-06-14
product: mage2plenty
type: announcement
---

# Mage2Plenty is now Byte8 — namespace transition (v4.0.0)

We've completed our transition from **SoftCommerce** to **Byte8**, and the PlentyONE connector has moved to its new home. This is the same connector you already rely on — re-homed under the Byte8 brand, with a leaner module set behind the scenes.

## What's changed

- **Byte8 namespace** — PHP namespaces (`SoftCommerce\*` → `Byte8\*`), Composer packages (`softcommerce/*` → `byte8/*`), and Magento module names (`SoftCommerce_*` → `Byte8_*`) now use the Byte8 brand.
- **Consolidated modules** — we merged the finer-grained modules into their parent modules to reduce footprint and ongoing maintenance, which means fewer packages to manage and faster, more predictable upgrades.
- **Thoroughly battle-tested** — the transition was validated end-to-end on dedicated migration environments, against both clean installs and real upgrades from live SoftCommerce datasets, before this release.

## Nothing breaks today — you have 3 months

Your current installation keeps working. You can continue using your existing Composer package — **`softcommerce/mage2plenty-os`** (or **`softcommerce/mage2plenty-ac`** for Adobe Commerce) — and it will keep receiving releases for the **next 3 months, until 14 September 2026**.

After that date, switch to the new packages to keep getting updates:

- **Magento Open Source:** `byte8/magento-plentyone-suite`
- **Adobe Commerce:** `byte8/magento-plentyone-suite-ac`

## When you migrate — a database migration runs

Alongside the namespace change, a few database tables were renamed (the `softcommerce_profile_*` tables → `byte8_profile_*`). **All of your `plenty_*` data — items, orders, stock, customers, mappings, profiles, settings — is preserved**, and the rename is handled automatically by `bin/magento setup:upgrade`. You do **not** need to run any SQL by hand.

Because it is a database migration, please **back up first and run it on staging** before production.

👉 **[Read the full announcement →](https://docs.byte8.io/plentyone/blog/mage2plenty-v4-0-release)**
👉 **[Read the full migration guide →](https://docs.byte8.io/plentyone/docs/installation/upgrade-softcommerce-to-byte8)**

## Questions?

If you'd like help planning your migration, reply to this email or reach us through the support channels in your account. We're happy to walk through it with you.

— The Byte8 Team

---

*P.S. Running this on production? Our zero-downtime Magento deployer [Orbit](https://byte8.io/products/orbit) applies the migration atomically with a post-deploy health check and automatic rollback — [learn more](https://byte8.io/products/orbit).*

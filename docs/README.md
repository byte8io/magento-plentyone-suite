# Byte8 PlentyONE Connector — Documentation Site

Docusaurus 3 site for the [Byte8 PlentyONE Connector](https://byte8.io/integrations/plentyone) — the official appointed-partner Magento 2 ⇆ PlentyONE integration.

Hosted at **https://docs.byte8.io/plentyone/** — served under the unified Byte8 docs domain via Cloudflare Pages and a path-based Worker router (see `infra/docs-router/` in the byte8.io monorepo).

## Local development

```bash
nvm use            # picks up Node 22 from .nvmrc (if present)
pnpm install
pnpm start
```

Opens at `http://localhost:3000/plentyone/` (the `baseUrl` prefix is honoured in dev too).

## Production build

```bash
pnpm build
```

Output goes to `build/`. Deployed via **Cloudflare Pages**:

- **Project:** `docs-magento-plentyone` (TBD — wire up in Cloudflare dashboard)
- **Build command:** `pnpm install --frozen-lockfile && pnpm build`
- **Build output:** `build`
- **Production URL:** `https://docs.byte8.io/plentyone/`

Once Pages is wired, add an entry to `infra/docs-router/src/index.ts` in the byte8.io monorepo:

```ts
{ prefix: "plentyone", origin: "docs-magento-plentyone.pages.dev" }
```

Then `pnpm run deploy` from that directory.

## Editing

- **Doc pages** live under `docs/` — mirror the sidebar order in `sidebars.ts`.
- **Homepage** (`/`) lives under `src/pages/index.tsx`. The navbar + footer "Pricing" / "Request demo" links point straight to `byte8.io/integrations/plentyone` so the marketing site stays the single source of truth for commercial details.
- **Theme overrides** live in `src/css/custom.css` — PlentyONE teal accent (`#27878E`), matching the byte8.io marketing aesthetic and the `/integrations/plentyone` page exactly. Don't edit Docusaurus defaults inline; change the variables in the `:root` and `[data-theme='dark']` blocks.
- **Blog** = changelog. One markdown file per release under `blog/`, authored as `byte8` (see `blog/authors.yml`).

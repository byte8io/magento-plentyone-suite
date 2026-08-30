# Custom Email Content for Releases

This directory contains curated email content for major releases, allowing you to send short, punchy, high-impact emails instead of auto-generated content from changelogs.

## Quick Usage

### Create Custom Content for a Release

```markdown
---
version: 2.0.0
date: 2025-11-08
product: mage2plenty
type: major-release
---

# Mage2Plenty v2.0.0 - Major Release

## Breaking Changes

- **Title** - Clear description with impact

## Features

- **Feature name** - Customer benefit and context

## Bug Fixes

- Plain description without title
```

### File Naming

```
YYYY-MM-DD-vX-release.md     # Major (e.g., 2025-11-08-v2-release.md)
YYYY-MM-DD-vX.Y-release.md   # Minor (e.g., 2025-12-15-v2.1-release.md)
```

## Guidelines

### ✅ Include
- ALL breaking changes (critical)
- Top 5 customer-impact features
- Top 3-5 critical bug fixes

### ❌ Exclude
- Technical refactoring
- Internal architecture changes
- Developer-focused improvements

## Example

See `2025-11-08-v2-release.md` for reference.

## Documentation

Full guidelines: `packages/workflow/docs/CUSTOM_EMAIL_CONTENT.md`

---
agent: ask
description: 'Run a full-site UI/UX audit in report-only mode (no code edits). Use when you want findings, severity, and fix recommendations before implementation.'
---

Use the skill `site-ui-ux-audit-fix` in report-only mode.

Inputs to collect first:
1. Scope (all routes or selected routes).
2. Environment (dev/preview/staging).
3. Audit depth (deep or quick).

Rules:
- Do not modify files.
- Produce findings with severity, route, category, reproduction, expected vs actual, and proposed fix.
- Use the report structure from `.github/skills/site-ui-ux-audit-fix/assets/audit-report-template.md`.
- Use responsive checks from `.github/skills/site-ui-ux-audit-fix/assets/responsive-matrix.yaml`.
- Include a short prioritized implementation plan at the end.

---
agent: ask
description: 'Run a full platform feature audit in report-only mode to find bugs, loopholes, and best-practice improvements, including a mandatory two-pass helper onboarding recommendation.'
---

Use the skill `platform-feature-audit` in report-only mode.

Inputs to collect first:
1. Scope (all features or selected modules).
2. Environment (dev/preview/staging).
3. Priority (security-first, reliability-first, or UX-first).

Rules:
- Do not modify files.
- Audit all role journeys in scope (customer, helper, admin).
- Include findings for bugs, loopholes, and weak controls.
- Include a dedicated section for helper onboarding recommending and validating a two-pass flow:
  - Phase 1: helper submits details and documents.
  - Phase 2: admin document verification plus online KYC before final activation.
- Use the report structure from `.github/skills/platform-feature-audit/assets/feature-audit-report-template.md`.
- End with a prioritized remediation plan.

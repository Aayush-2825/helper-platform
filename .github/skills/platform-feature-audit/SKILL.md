---
name: platform-feature-audit
description: 'Audit platform features end-to-end to find bugs, loopholes, security and logic risks, and best-practice improvements. Includes domain-specific checks for helper onboarding and KYC approval flow.'
argument-hint: 'Provide scope (all features or selected modules), environment (dev/staging/prod), and mode (report-only or fix-safe).'
user-invocable: true
---

# Platform Feature Audit Agent

## What This Skill Produces
- A feature-by-feature audit across product flows.
- Findings for bugs, loopholes, data integrity risks, authorization gaps, and UX bottlenecks.
- Severity-ranked recommendations with best-practice alternatives.
- Optional safe fixes (if fix-safe mode is requested).

## Best For
- Release readiness checks.
- Security and business-logic hardening.
- Post-MVP stabilization and quality improvement.
- Product architecture recommendations before scaling.

## Inputs To Confirm Before Starting
1. Scope: all features or selected modules.
2. Environment: local/dev/staging/production-like.
3. Mode: report-only (default) or fix-safe.
4. Priority: security-first, reliability-first, or UX-first.

Default assumptions for this repository:
- Scope: all major role journeys (customer, helper, admin).
- Mode: report-only.
- Priority: security + reliability first.

## Audit Dimensions (Mandatory)
1. Functional correctness
- Broken flows, invalid states, missing edge-case handling, error swallowing.

2. Authorization and access control
- Role bypasses, missing ownership checks, insecure direct object reference risks.

3. Business-logic loopholes
- Race conditions, duplicate submits, invalid state transitions, amount/tax mismatches.

4. Data integrity
- Missing constraints, partial writes, transaction boundary mistakes, eventual consistency gaps.

5. API and validation quality
- Input validation completeness, schema drift, unclear error contracts, idempotency gaps.

6. Realtime reliability
- Presence assumptions, stale state handling, retry/backoff, duplicate event processing.

7. UX and operational resilience
- Dead ends, unclear status messages, missing retries/fallbacks, poor auditability for admins.

## Domain-Specific Rule: Helper Onboarding Must Support Two-Pass Approval
During every audit, enforce and evaluate this recommended architecture:

Phase 1: Draft submission
- Helper enters profile and required documents as done today.
- Submission is accepted into a pending review queue.
- Helper account cannot access active booking features yet.

Phase 2: Verification and final approval
- Admin reviews documents and either requests correction or marks document verification complete.
- Helper completes online KYC check only after document verification.
- Final helper activation happens only if both checks pass.

Required controls to check:
- Explicit onboarding states with guarded transitions (no direct jump to approved).
- Immutable audit log for admin decisions and KYC outcomes.
- Idempotent submit/resubmit endpoints.
- Clear helper-visible status and actionable next step messaging.
- API-level authorization so unapproved helpers cannot accept jobs.

## Workflow
1. Build feature inventory and map role-based user journeys.
2. Identify trust boundaries and critical state machines.
3. Execute read-path and write-path checks per feature.
4. Document findings with reproducible steps and impact.
5. Produce ranked remediation recommendations.
6. If fix-safe mode: apply low-risk fixes and re-validate.

## Output Format
Use the template from `./assets/feature-audit-report-template.md`.

Minimum required sections:
1. Scope and assumptions.
2. Feature coverage matrix.
3. Findings by severity with evidence and exploit path.
4. Loophole analysis (how abuse could happen).
5. Best-practice recommendations (short-term and long-term).
6. Dedicated helper onboarding two-pass recommendation section.
7. Validation or test gaps and next action plan.

## Severity Model
- Critical: security breach, financial loss, privilege escalation, or production outage risk.
- High: major user-impact bug, data integrity risk, or workflow bypass with workaround.
- Medium: reliability, validation, or UX issue that increases support burden.
- Low: quality, clarity, or maintainability concern with limited direct impact.

## Execution Modes
- report-only (default): no edits; produce findings and recommendations.
- fix-safe: apply only low-risk fixes that do not alter core product behavior.

## Example Invocations
- /platform-feature-audit all features in apps/web and apps/realtime, report-only, security-first
- /platform-feature-audit helper onboarding and approval flow, report-only, reliability-first
- /platform-feature-audit booking, payment, payout, and notifications, fix-safe, reliability-first

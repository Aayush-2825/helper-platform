---
name: site-ui-ux-audit-fix
description: 'Analyze a full website UI and UX end-to-end, detect visual, interaction, accessibility, responsive, and content issues, then implement fixes. Use when you ask to audit the whole site, find UI bugs, improve UX, run frontend quality checks, or fix usability problems.'
argument-hint: 'Provide: target scope (all routes or selected routes), environment (dev/staging), and priority (speed or depth).'
user-invocable: true
---

# Site UI and UX Audit and Fix

## What This Skill Produces
- A route-by-route UI and UX audit.
- A prioritized issue list (critical, major, minor).
- Concrete code fixes for issues that can be safely auto-fixed.
- A verification pass (lint, tests, responsive checks) and a short change report.
- Default behavior: deep audit with safe auto-fixes enabled.

## When to Use
- You want a complete UI/UX health check of the site.
- You want problems found and fixed, not only reported.
- You are preparing for release and need design/quality hardening.
- You suspect regressions in layout, navigation, forms, accessibility, or responsiveness.

## Inputs To Confirm Before Starting
1. Scope: entire site or specific routes/features.
2. Environment: local dev, preview, or staging URL.
3. Priority mode: quick sweep (faster) or deep audit (thorough).
4. Execution mode: auto-fix or report-only.
5. Guardrails: cosmetic fixes only, or include structural component refactors.

Default assumptions for this repository:
- Scope: workspace skill for this repository.
- Mode: deep audit.
- Execution: auto-fix safe issues by default.
- Mandatory checks: accessibility, responsive behavior, visual consistency, copy/UX clarity, and perceived performance.

## Workflow
1. Build a route inventory.
2. Capture baseline behavior on desktop and mobile breakpoints.
3. Find issues across visual design, interaction, accessibility, responsiveness, and content clarity.
4. Triage and prioritize issues by user impact.
5. Implement safe fixes in small batches.
6. Re-run checks and confirm each fix is resolved.
7. Summarize resolved issues, remaining risks, and follow-up tasks.

## Detailed Procedure

### 1) Route and Flow Inventory
- Enumerate pages, layouts, and major user journeys (landing, auth, search, booking, checkout, profile, dashboards).
- Identify critical paths first (high traffic or revenue-critical).
- Note route-level dependencies (auth state, feature flags, device width, data loading states).
- Start route ordering from [route-priority defaults](./assets/route-priority.yaml), then adjust to match current project routes.

Completion check:
- Every route in scope is listed with at least one primary user flow.

### 2) Baseline Capture
- Open each route and collect baseline observations for:
  - Layout structure and visual hierarchy.
  - Interaction states (hover, focus, active, disabled, loading, error, empty).
  - Mobile and tablet behavior.
- Use the [responsive matrix](./assets/responsive-matrix.yaml) as the default viewport and state checklist.
- Capture representative screenshots when needed for before/after validation.

Completion check:
- Baseline notes exist for all critical flows in both desktop and mobile widths.

### 3) Multi-Dimension Issue Detection
Check each route against these dimensions:

1. Visual consistency
- Spacing rhythm, typography scale, icon alignment, contrast, color consistency, component variants.

2. Interaction quality
- Broken buttons/links, poor affordance, unclear feedback, missing loading or error states, confusing navigation.

3. Accessibility
- Keyboard access, focus visibility/order, semantic markup, labels, aria usage, contrast, touch targets.

4. Responsive behavior
- Overflow/clipping, layout breakage at breakpoints, unreadable text, unusable controls on small screens.

5. Content and UX clarity
- Ambiguous labels, unclear CTAs, validation copy, onboarding hints, empty state guidance.

6. Performance perception
- Layout shift, skeleton/loading quality, image handling, janky transitions.

Completion check:
- Every issue includes route, severity, reproduction steps, expected behavior, and fix idea.

### 4) Triage and Plan
- Rank issues by severity:
  - Critical: blocks task completion or causes major confusion.
  - Major: hurts usability significantly but has workaround.
  - Minor: polish or low-impact inconsistency.
- Batch fixes by area (shared components first, then page-specific issues).

Branching logic:
- If a shared component causes repeated defects, fix component first before per-page patches.
- If issue is uncertain (design intent unclear), stop and request clarification before editing.
- If fix is risky (large refactor), propose incremental patch and fallback plan.

Completion check:
- Ordered fix plan exists with dependencies and risk notes.

### 5) Implement Fixes
- Apply smallest safe change set for each batch.
- Preserve existing design system patterns unless the issue is caused by those patterns.
- Prefer reusable component fixes over duplicated per-page fixes.
- Keep edits scoped; avoid unrelated refactors.

Quality rules while fixing:
- Maintain consistent spacing and typography tokens.
- Ensure all interactive elements remain keyboard reachable.
- Confirm success, loading, error, and empty states are represented.
- Preserve desktop and mobile behavior.

### 6) Validate Fixes
Run relevant checks after each batch:
- Lint and type checks.
- Unit/integration tests where present.
- Responsive pass using [responsive matrix](./assets/responsive-matrix.yaml).
- Quick keyboard-only pass for critical routes.

Completion check:
- No new errors from changed files.
- Fixed issues reproduce as resolved.
- No visible regressions in adjacent UI.

### 7) Final Report
Provide:
- Fixed issues grouped by severity and route.
- Remaining issues and why they were deferred.
- Regressions checked.
- Suggested next improvements.
- Use the [audit report template](./assets/audit-report-template.md) for consistent output structure.

## Execution Modes
- Auto-fix mode (default): apply safe, scoped fixes and validate.
- Report-only mode: perform full audit and recommendations without editing files.

Branching logic for mode:
- If execution mode is report-only, skip implementation steps and produce a prioritized fix plan.
- If execution mode is auto-fix, apply only low-to-medium risk fixes without product-behavior changes unless requested.

## How This Skill Uses Other Skills
- If a route uses shadcn patterns, apply the shadcn skill for component-level correctness and consistency.
- If the request includes auth-specific UX surfaces, use relevant auth skills for flow-specific correctness.
- Use this skill as the orchestration layer, and specialized skills for focused subsystems.

## Mandatory Check Matrix
Every invocation must include all categories below:
- Accessibility: keyboard flow, focus visibility/order, semantics, labels, contrast.
- Responsive: mobile, tablet, desktop layout integrity and interaction usability.
- Visual consistency: spacing, typography, icon and component alignment, token usage.
- Copy and UX clarity: CTA clarity, form labels, validation messages, empty/error states.
- Perceived performance: loading states, layout shift, and transition smoothness.

## Output Format
1. Scope and audit mode used.
2. Route priority and responsive matrix references used.
3. Issue list with severity, route, and root cause.
4. Fixes applied (file-level summary).
5. Validation results.
6. Remaining risks and next steps.

## Example Invocations
- /site-ui-ux-audit-fix all routes in apps/web, deep audit, include safe auto-fixes
- /site-ui-ux-audit-fix booking and checkout flows only, quick sweep, report-only
- /site-ui-ux-audit-fix staging URL full pass with accessibility priority
- /site-ui-ux-audit-report-only all routes in apps/web, deep audit, no code edits

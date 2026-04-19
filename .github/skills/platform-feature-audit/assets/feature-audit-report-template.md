# Platform Feature Audit Report Template

## Audit Context
- Scope:
- Environment:
- Mode: Report-only | Fix-safe
- Priority: Security-first | Reliability-first | UX-first
- Date:

## Feature Coverage Matrix
| Feature | Roles | Read Paths Checked | Write Paths Checked | Status |
|---|---|---|---|---|
| Helper onboarding | Helper, Admin | Yes | Yes | Complete |

## Findings Summary
| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |

## Detailed Findings
| ID | Severity | Feature | Category | Reproduction | Expected | Actual | Impact | Exploit/Failure Path | Recommendation | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| AUD-001 | High | Example feature | Business logic | Steps... | Should... | Does... | ... | ... | ... | Open |

## Loophole Analysis
| ID | Loophole | Preconditions | Abuse Path | Impact | Mitigation |
|---|---|---|---|---|---|
| LOOP-001 | Example loophole | ... | ... | ... | ... |

## Helper Onboarding Two-Pass Recommendation
- Current flow observations:
- Gaps identified:
- Proposed target flow:

### Phase 1: Draft and Submission
- Data capture and document upload.
- Submit to pending review queue.
- Account remains restricted from live booking operations.

### Phase 2: Verification and Approval
- Admin document verification decision.
- Online KYC triggered after document verification.
- Final approval only when all checks pass.

### Required Safeguards
- State machine with allowed transitions only.
- API authorization gates tied to approval state.
- Admin/KYC audit trail with immutable timestamps.
- Resubmission and retry behavior with idempotency keys.
- Helper-facing status page with clear next action.

## Best-Practice Recommendations
### Short-Term (1-2 sprints)
1. 
2. 
3. 

### Mid-Term (1-2 months)
1. 
2. 
3. 

### Long-Term (Quarter+)
1. 
2. 
3. 

## Validation and Testing Gaps
- Missing tests:
- Missing telemetry:
- Missing alerting:

## Action Plan
1. 
2. 
3. 

# Security Overview & Recommendations

This document captures the current security posture and recommended hardening steps.

## Current Security Controls

- Authentication & sessions: `better-auth` with Drizzle adapter. Sessions use encrypted JWE cookies and configurable expiry.
- Email verification & password reset flows with configurable token expiry and revoke-on-reset.
- WebSocket auth: token-based verification using `REALTIME_WS_AUTH_SECRET` (or shared `AUTH_SECRET`).
- Broadcast endpoint protected by `REALTIME_BROADCAST_SECRET` header (optional).
- Payment webhooks validated with HMAC using `RAZORPAY_WEBHOOK_SECRET`.

## Environment secrets (must be protected)

- `BETTER_AUTH_SECRET`, `AUTH_SECRET`, `REALTIME_WS_AUTH_SECRET`, `REALTIME_BROADCAST_SECRET`
- `DATABASE_URL*`, `REDIS_URL`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_JSON` and OAuth secrets

## Recommendations

1. Secrets Management
   - Store all secrets in a managed secret store (e.g., Vercel/Cloud provider secrets, HashiCorp Vault, AWS Secrets Manager) — do not commit to repo or .env files.

2. WebSocket scaling & auth
   - When scaling, introduce Redis (or another message bus) for cross-instance socket routing and use short-lived signed tokens for WS auth.

3. Transport security
   - Enforce HTTPS everywhere in production and enable `useSecureCookies` for `better-auth`.
   - Set strict cookie attributes (SameSite=Strict/Lax, HttpOnly, Secure) and implement CSRF protection across write endpoints.

4. Webhook security
   - Validate signatures for all external webhooks and implement retry/exponential backoff for idempotency.

5. Rate limiting
   - The `better-auth` rate limits sign-in/sign-up; extend rate limiting to sensitive endpoints (payments, broadcast) at the API gateway or application layer.

6. Observability and alerting
   - Integrate centralized error tracking (Sentry, Datadog) and structured logs for the realtime service. Add alerts for high error rates, DB slow queries, and queue growth.

7. Data protection
   - Encrypt sensitive PII at rest where required, mask logs, and audit access to KYC artifacts.

8. Dependency management
   - Regularly run dependency scanning (Snyk, Dependabot) and patch critical vulnerabilities promptly.

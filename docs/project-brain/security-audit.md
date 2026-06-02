# Security Audit & Risk Assessment

This document is compiled from the perspective of a Senior Application Security Engineer. It audits the Helper Platform monorepo encompassing the web application, real-time express gateway, and database layer.

---

## 1. Core Security Analysis

### 1. Authentication System
- **Implementation**: Handled primarily by `better-auth`. Provides Email/Password and OAuth.
- **Assessment**: Highly robust default posture. `better-auth` complies with modern cryptography standards (scrypt/Argon2 for passwords). 
- **Risk**: Without strict anomaly-based login rate limiting, brute-force or credential stuffing attacks against the email/password endpoint are possible, requiring custom rate-limiting middleware.

### 2. Authorization Model
- **Implementation**: B2B Tenant features leverage organizations. RBAC concepts exist.
- **Assessment**: Next.js App Router relies on explicit data fetching guards. Server Actions *must* manually verify user ID and roles against the accessed resource.
- **Risk**: Broken Object Level Authorization (BOLA/IDOR). Failing to verify that `customer A` owns `booking B` in `POST /api/bookings/[id]/cancel` allows cross-account mutation.

### 3. Session Handling
- **Implementation**: Secure, HTTP-Only, SameSite JWE cookies managed by `better-auth`.
- **Assessment**: Safe against client-side script reads. Extracted and mapped to Next.js middleware natively. 

### 4. JWT/Token Handling (WebSockets)
- **Implementation**: `GET /api/realtime/ws-token` issues a custom JWT signed by `REALTIME_WS_AUTH_SECRET` for the browser to upgrade the Express WS connection.
- **Assessment**: The browser must hold this token temporarily. If passed in the URL (e.g., `wss://...?token=XYZ`), the token will leak in load balancer access logs.
- **Risk**: WebSocket token leakage via query strings. Token playback if expiration windows (`exp`) are too wide.

### 5. API Security
- **Implementation**: Serverless Next.js API Routes + Internal Express Broadcast endpoint (`/api/realtime/broadcast`).
- **Assessment**: The internal broadcast endpoint is protected by a static pre-shared key (`REALTIME_BROADCAST_SECRET`). 
- **Risk**: If the broadcast secret leaks, any internal or external actor can push fraudulent events directly into the browser sockets of all customers/helpers.

### 6. Input Validation
- **Implementation**: Centralized Zod validators (`packages/validators`).
- **Assessment**: Excellent defense-in-depth posture. Shared schemas guarantee that Next.js backends evaluate exactly what the React client constrained.

### 7. XSS Risks (Cross-Site Scripting)
- **Implementation**: React 19 natively escapes rendering strings.
- **Assessment**: Low risk inside standard components.
- **Risk**: The dispute messenger (`dispute_message` table) and Helper Bio (`helper_profile.bio`). If any component renders these via `dangerouslySetInnerHTML` for markdown parsing without DOMPurify, Stored XSS will execute in the Admin portal.

### 8. CSRF Risks (Cross-Site Request Forgery)
- **Implementation**: Next.js Server Actions leverage built-in Origin/Host header checking. `better-auth` validates CSRF context natively.
- **Assessment**: Generally protected by default framework restrictions.

### 9. SQL Injection Risks
- **Implementation**: Drizzle ORM entirely.
- **Assessment**: Drizzle forces parameterized queries. SQLi is effectively neutralized unless the `sql\`raw\`` utility string is used dangerously with unescaped external variables.

### 10. Rate Limiting
- **Implementation**: Basic edge configurations. No intense application-level leaky buckets mapped.
- **Assessment**: **Critical Risk**. Unprotected endpoints like `/api/verifications/video-kyc/schedule` can be triggered repeatedly, scheduling thousands of Google Calendar events and exhausting the Google API quota.

### 11. Secret Management
- **Implementation**: Standard `.env` variables mapped locally and inside Vercel/Railway.
- **Assessment**: A `GOOGLE_SERVICE_ACCOUNT_JSON` is executed via scripts. If physical `.json` secrets are committed to the repo, it results in instantaneous compromise of the Google Workspace.

### 12. Environment Variable Exposure
- **Implementation**: Next.js exposes `NEXT_PUBLIC_` bounds.
- **Assessment**: Developers must strictly avoid prefixing `REALTIME_BROADCAST_SECRET`, `RAZORPAY_KEY_SECRET`, or DB urls with `NEXT_PUBLIC_`. Doing so bundles the key into the browser JS.

### 13. File Upload Security
- **Implementation**: Direct-to-CDN via `POST /api/cloudinary/sign`.
- **Assessment**: The client gets a signature and uploads the file bypassing the server.
- **Risk**: If the signature timestamp does not explicitly lock down MIME-types, dimensions, and strict file sizes (`e.g., max 5MB PDF/JPG`), an attacker can host 10GB malware payloads onto the startup’s Cloudinary billing account.

### 14. AI Prompt Injection Risks
- **Implementation**: Not currently deployed (Future feature).
- **Assessment**: When the dispute AI chatbot is deployed, malicious system instructions placed inside `dispute_message` text by bad-actor helpers or customers can break the prompt bounds.

### 15. Dependency Vulnerabilities
- **Implementation**: Managed by pnpm lockfile.
- **Assessment**: Frequent updates required for Next.js, Express, `ws`, and specific parser libraries.

---

## 2. Threat Modeling & Prioritization

### Critical Vulnerabilities
1. **Unconstrained Direct-to-Cloud Uploads**: The Cloudinary upload signing doesn't restrict malicious payloads or size buckets by default, leading to financial exhaustion or malware distribution.
2. **Denial of Wallet / Quota Drain**: The Google API calendar generator lacks strict rate limits. An attacker can spam `POST /api/verifications/video-kyc/schedule`. 

### Medium Risks
1. **WebSocket Query String Token Leaks**: Passing JWTs in connection URIs causes access log persistence.
2. **Missing BOLA/IDOR Guards**: Accidental omission of `where userId = session.user.id` on deep entity fetches (like `/api/bookings/[id]/receipt`) can expose other users' PII/Invoices.
3. **Internal Pre-Shared Key Management**: Relying on a single `REALTIME_BROADCAST_SECRET` is brittle. A compromised edge function exposes the entire real-time stream.

### Low Risks
1. **Serverless Function Timeouts**: Massive arrays of Webhooks processing sync logic could cause a 504.
2. **XSS via Admin Markdown**: Safely constrained, but reliant on developers not bypassing React's `dangerouslySetInnerHTML`.

---

## 3. Exploitation Scenarios

**Scenario 1: BOLA on Booking Receipts**
- *Attacker* creates an account, books a job, and gets ID `bk_123`.
- *Attacker* notices the URL pattern `/api/bookings/bk_123/receipt`.
- *Attacker* writes a script to request `/api/bookings/bk_100/receipt` to `bk_200/receipt`.
- *Result*: Attacker downloads receipts detailing PII (Names, Addresses, Phone Numbers) of customers and helpers across the platform.

**Scenario 2: Cloudinary Bankruptcy**
- *Attacker* requests `POST /api/cloudinary/sign` as a newly registered helper.
- *Attacker* receives the valid signature and bypasses the Next.js frontend, curling directly to Cloudinary with a 50GB MKV file of pirated movies multiplexed.
- *Result*: Cloudinary accepts the upload because the signature is mathematically valid. Startup owes $5,000 for bandwidth and storage abuse.

---

## 4. Security Hardening Roadmap

### Phase 1 (Immediate - Sprint 1)
- [ ] **Lockdown File Uploads**: Update `/api/cloudinary/sign` to explicitly include `folder`, `format`, and `max_file_size` constraints inside the cryptographic signature generator.
- [ ] **Global Rate Limiting Layer**: Apply an Edge Middleware (like Upstash Ratelimit or Vercel KV) protecting authentication, SMS/Email OTP, and API gateway requests globally.
- [ ] **WebSocket Header Migration**: Move the WS Token from query parameters to the `Sec-WebSocket-Protocol` header standard during socket upgrade handshake.

### Phase 2 (Near Term)
- [ ] **BOLA/IDOR Regression Test**: Audit all `GET` and `POST` handlers inside `apps/web/src/app/api` to enforce `.where(and(eq(table.id, target), eq(table.userId, user.id)))`.
- [ ] **Strict Content Security Policy (CSP)**: Apply Next.js middleware headers to block inline scripts, framing, and unauthorized API connections.
- [ ] **Webhook Authentication Wrap**: Migrate the Razorpay `POST` webhooks to explicitly evaluate payload signatures before allocating generic serverless computational time.

### Phase 3 (Long Term)
- [ ] **Secrets Rotation Routine**: Establish periodic rotation of the `REALTIME_BROADCAST_SECRET` and `REALTIME_WS_AUTH_SECRET`.
- [ ] **AI Input Sanitization**: When developing matching or chatbot AIs, pass all user data through an LLM sanitizer preventing command overrides.
- [ ] **Automated Dynamic App Sec Testing (DAST)**: Integrate OWASP ZAP or equivalent tools onto the deployment CI/CD pipeline blocking PRs with discovered logic flaws.
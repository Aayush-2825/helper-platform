# Authentication Flow

This document details the authentication infrastructure powering the Helper Platform.

## Technology Stack
- **Provider**: `better-auth`
- **Location**: Next.js App Router (`apps/web/src/app/api/auth/[...all]/route.ts`)

## Capabilities Enabled
- **Local Credentials**: Email & Password sign in.
- **Social Login**: Google OAuth connection support.
- **Sessions**: JWT/JWE based session handling via secure server cookies.
- **Multi-Factor Auth (MFA)**: Verification hooks enabled via the `.twoFactor()` plugin logic.
- **Organizations (B2B)**: Role Based Access Control targeting tenant architectures natively.

## Client Flows

### Sign-Up Flow
1. **User Action**: Client submits email and password.
2. **Library Hook**: Next.js client component triggers `auth.signUp.email()`.
3. **Persistance**: Underlying model checks database constraint flags.
4. **Subsystem Triggers**: 
    - Inserts core entity bounds in `user` table. 
    - Publishes Email Provider target templates. 
    - Attaches automatic sessions if email double verification checks aren’t enforced.

### Sign-In Flow 
1. **User Action**: Provides credentials or clicks Social Auth target.
2. **Generation**: `better-auth` maps against db structures, confirming hashes or OAuth claims.
3. **Session Creation**: Cryptographically securely signed payload written to `cookies`.
4. **App Routing**: Vercel/NextJS routing intercepts logic pushing user towards onboarding or respective dashboard boundaries (`/helper` vs `/customer`).

### Socket Auth (Realtime Cross-Auth)
Because `better-auth` executes its logic firmly within the `next-js` execution wrapper, protecting the Node.js websocket layers (`apps/realtime`) requires token injection logic decoupled from traditional REST sessions.

1. **Client requests token**: The authenticated Next.js client asks the backend `/api/realtime/ws-token` for a short term ticket.
2. **Web server mints token**: Reads internal `better-auth` session token and derives a tightly scoped `.sign(REALTIME_WS_AUTH_SECRET)` payload structure.
3. **Handshake**: Target client opens `wss://` URI placing generated specific tokens into the protocol array.
4. **Node Server validates**: Express middleware parses secret checking signatures independently against the key and matches `userId` fields to accept downstream socket binds.
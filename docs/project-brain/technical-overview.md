# Technical Overview

## Executive Summary
The **Helper Platform** is a real-time, on-demand marketplace connecting customers with vetted service providers (helpers). It solves the business problem of discovering, verifying, booking, and securely paying for reliable, localized help. By orchestrating a robust, multi-portal system with integrated Video KYC onboarding, localized dispatch matching, and real-time socket communications, the platform provides end-to-end management of the service lifecycle—from request to rating.

## Tech Stack Table

| Category | Technology / Library |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router), React 19 |
| **Styling & UI** | TailwindCSS, shadcn/ui (`packages/ui`) |
| **Backend (Web)** | Next.js API Routes (Server Actions & Route Handlers) |
| **Backend (Real-time)** | Node.js Express 5 + `ws` module |
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM (`drizzle-kit`) |
| **Authentication** | `better-auth` (Email/Password, OAuth, JWE Cookies) |
| **Hosting (Target)** | Web: Vercel/Serverless; Real-time: Stateful host (AWS/Render) |
| **State Management** | React Server Components, Client Hooks (Context) |
| **API Architecture** | REST API & custom WebSocket payloads |
| **File Storage** | Cloudinary (Docs, Profile Pictures) |
| **Payment Gateway** | Razorpay (Payments & Escrow/Payouts) |
| **AI/LLM Integrations** | None natively implemented yet (MCP SDK present) |
| **Third-Party Integrations**| Resend (Email), Google Calendar/Meet (Video KYC) |
| **Monorepo Manager** | Turborepo (`turbo.json`) and pnpm workspaces |

## Folder Structure Tree
The project follows a standard modern monorepo structure designed for strongly-typed cross-service package sharing.

```text
helper-platform-main/
├── apps/
│   ├── realtime/           # Stateful Express/WS Node.js server
│   │   ├── src/
│   │   │   ├── handlers/   # Socket message decoders
│   │   │   ├── ws/         # Active Dispatcher / connection register
│   │   │   └── index.ts    # Service entrypoint
│   └── web/                # Main Next.js application
│       ├── public/         # Static assets and Service Workers (push)
│       └── src/
│           ├── app/        # React 19/Next.js 16 App Router (UI & API)
│           ├── components/ # Local web components
│           ├── features/   # Feature-based domain logic
│           └── lib/        # Better-auth and 3rd party clients
├── packages/
│   ├── db/                 # Centralized Drizzle schema & migrations
│   │   ├── src/schema/     # Cross-app data models
│   │   └── drizzle/        # Auto-generated SQL migrations
│   ├── ui/                 # Shared React component library (shadcn/ui base)
│   ├── eslint-config/      # Workspace shared linting rules
│   ├── typescript-config/  # Workspace shared TS base configs
│   └── validators/         # Shared Zod / validation schemas
├── package.json            # Root workspace definitions
├── pnpm-workspace.yaml     # Package workspace declarations
└── turbo.json              # Monorepo pipeline orchestrator
```

## System Flow Explanation

### 1. Booking Flow (Customer -> Helper)
1. Customer initiates a booking request via `apps/web`.
2. Next.js Route handlers validate payment intents via Razorpay and `INSERT` records into PostgreSQL (utilizing models from `packages/db`).
3. Next.js triggers a secure internal REST HTTP call (`POST /api/realtime/broadcast`) to the `apps/realtime` server containing the dispatch payload.
4. `apps/realtime` keeps the notification event in-process, checks active WebSocket connections, and pushes the event explicitly to matching helper connected clients.
5. Helper receives the WebSocket ping, reviews, and executes `POST /api/bookings/[id]/accept`, which shifts the database status via Next.js.

### 2. Video KYC Onboarding (Helper -> Admin)
1. Helper registers and uploads documents. Documents are pushed directly to Cloudinary using signed upload links (`POST /api/cloudinary/sign`).
2. Helper proceeds to Video Verification, picking available slots from `/api/helpers/video-kyc/slots`.
3. System hits Google Calendar API to create a scheduled event generating a Google Meet or Jitsi link bridging to the Admin team.
4. Profile activation occurs via Admin portal hitting the `helper_profile` table to update statuses post-call.

## Environment Variable Dependencies
A successful deployment depends on the following critical environment variable configurations across nodes:
- `DATABASE_URL`: Primary PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: Secret key for session/JWE signing.
- `REALTIME_WS_AUTH_SECRET`: Local key used to sign temporary WebSocket auth tokens.
- `REALTIME_BROADCAST_SECRET`: Token protecting the internal push endpoints on the realtime app.
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Financial gateway configurations.
- `CLOUDINARY_URL`: Target strings for document upload.
- `GOOGLE_SERVICE_ACCOUNT_JSON`: Holds necessary secrets for Video KYC Calendar generation (referenced in `scripts/env-google-service-account.ts`).

## Architectural Decisions

1. **Split-Server Architecture**: The decision to separate `apps/web` (serverless Next.js) and `apps/realtime` (stateful Node.js) avoids long-lived websocket connections breaking serverless execution timeout limits (like Vercel’s 10s-60s timeout limit).
2. **Centralized Schema (`packages/db`)**: Providing strict Drizzle definitions via a Turborepo package prevents structure drift between the background jobs (Express) and the core application (Next.js).
3. **Database-Backed Queues**: Acknowledging connection drops, the WebSocket architecture falls back gracefully to `notification_queue` database polling on reconnects instead of relying purely on network availability.

## Risks & Technical Debt

- **Scaling WebSockets (Single Point of Failure)**: The current `WsDispatcher.ts` operates entirely in-memory. If the realtime server scales to multiple instances behind a load balancer, standard instances cannot broadcast to clients attached to neighbor instances. The repo no longer carries a pub/sub scaffold, so Redis-backed fanout remains a future architecture decision rather than a hidden implementation detail.
- **Relational Polling**: The recovery of notification events via POSTGRES DB queries on socket reconnect can bottleneck and lock the DB pool under thundering herd conditions (e.g., all active apps reconnecting after an outage).
- **Concurrency Locking**: Core booking matching requires rigorous `FOR UPDATE` transaction locks to prevent double-booking if multiple helpers accept overlapping jobs simultaneously across different HTTP threads.
- **Webhook Storming**: Razorpay network callbacks run synchronously on Next.js API paths; heavy external retry bursts could max out lambda concurrency limits.
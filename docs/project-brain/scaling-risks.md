# Scaling & Technical Risks

This document highlights critical bottlenecks, dependencies, and single points of failure across the current technical design footprint, which need remediation prior to expansive multi-region scaling.

## 1. Realtime Cross-PubSub Delivery (Immediate Bottleneck)
**Risk Level:** HIGH
**Description**: The current WebSocket implementation inside `apps/realtime` operates entirely as an in-process register (`WsDispatcher.ts`). 
- **The Problem**: If the real-time application scales behind a standard load balancer across two individual processes (Node A and Node B), `userId: 1` connecting to Node A and `userId: 2` connecting to Node B physically cannot communicate live.
- **The Event Pipeline Limitation**: When `apps/web` issues a POST to `/api/realtime/broadcast`, the routing controller expects to ping active instances locally.
- **Remediation Plan**: Introduce **Redis Pub/Sub**. The `WsDispatcher` needs to wrap all messages out against Redis channels and passively subscribe identically. 

## 2. Notification Queue Sync Race Conditions
**Risk Level:** MEDIUM
**Description**: Whenever users reconnect back to `apps/realtime`, the engine runs local fetches sweeping `notification_queue` to flush missing tasks. 
- **The Problem**: On reconnect thundering-herd incidents (ex: widespread web server crash), polling thousands of heavy queries across postgres causes deadlocks on CPU compute targets.
- **Remediation Plan**: Transition core fast-streaming payload logs off the core monolithic relational postgres target, pushing temporary streaming objects fully onto Redis streams or a Kafka pipeline target.

## 3. Distributed Lock Matching Contention
**Risk Level:** HIGH
**Description**: Currently, pushing helper notifications outwards toward generic `bookingCandidates` relies heavily on fast table scanning mapping geolocation grids.
- **The Problem**: As helper databases grow significantly and concurrent customer bookings overlap grids simultaneously, the monolithic target PostgreSQL faces large query loads generating unique sorting rank tables on-the-fly.
- **The Associated Risk**: Multi-transaction accept/reject workflows from differing helpers accepting overlapping tasks might execute concurrently without hard Row-Level Locks implemented.
- **Remediation Plan**: Ensure robust `FOR UPDATE` blocking logic maps across all `booking_candidate` selections resolving acceptance commits. Enable PostGIS targeting logic optimizations mapped heavily in table schema sets.

## 4. Heavy-Write Payload Monitoring (Webhook Constraints)
**Risk Level:** MEDIUM
**Description**: Webhooks inbound from Razorpay and similar third-party providers execute actively within the main `apps/web` node infrastructure natively interacting directly into the Database layer synchronous paths.
- **The Problem**: Massive webhook storms block underlying Vercel serverless connections resulting in timeout 504 errors on payload acceptance.
- **Remediation Plan**: Utilize specific message broker targets specifically dumping inbound unstructured webhook maps toward isolated consumer functions out of band from `web` dependencies logic frameworks.

## 5. Web Push Expiration Polling
**Risk Level:** LOW
**Description**: Background verification execution checking on `helper_web_push_subscription` items maps heavily reliant on Vercel external Chron schedules.
- **The Problem**: Dropping or failed external API configurations results in dead jobs. 
- **Remediation Plan**: Transition to continuous running internal polling architectures inside `apps/realtime` infrastructure mappings.
Here’s a **clean, production-grade `.md` reference file** you can keep in your repo (e.g., `SYSTEM_DESIGN.md`).
This is not just notes — it explains **what + why + how**.

---

```md
# 🚀 Real-Time Booking & Matching System (Backend Design)

## 📌 Goal

Build a real-time service marketplace system similar to:
- Uber
- Urban Company
- Swiggy Genie

Core features:
- Helper discovery (by category + radius)
- Real-time booking & matching
- WebSocket-based communication
- Live tracking with ETA
- Failure handling & reassignment

---

# 🏗️ Architecture Overview

```

Frontend (Next.js)
↓
Backend API (Node.js + WebSocket)
↓
PostgreSQL (persistent data)
↓
Redis (real-time state + geo queries)
↓
OSRM (routing + ETA)

```

---

# 🧱 Tech Stack

| Layer | Tech | Why |
|------|------|-----|
| API | Node.js + Express/Fastify | Lightweight, scalable |
| WebSocket | Socket.IO | Easy room-based communication |
| DB | PostgreSQL + Drizzle | Strong schema + relations |
| Cache | Redis | Real-time + geo queries |
| Routing | OSRM | Free ETA + route calculation |

---

# 📁 Folder Structure

```

backend/
├── src/
│   ├── modules/
│   │   ├── booking/
│   │   ├── helper/
│   │   ├── matching/
│   │   └── tracking/
│   │
│   ├── websocket/
│   │   ├── socket.ts
│   │   ├── handlers/
│   │
│   ├── services/
│   │   ├── osrm.service.ts
│   │   ├── redis.service.ts
│   │   └── matching.service.ts
│   │
│   ├── jobs/
│   │   ├── heartbeat.job.ts
│   │   └── timeout.job.ts
│   │
│   └── server.ts

```

---

# 🧠 Core Concepts

---

## 1. Booking Lifecycle (State Machine)

```

requested → matched → accepted → tracking → completed
↓
cancelled
↓
reassigning

```

### Why?
- Prevents inconsistent UI
- Makes backend predictable
- Enables retry logic

---

## 2. Matching Engine

### Input:
- user location (lat/lng)
- service category
- radius

---

### Flow:

```

Find helpers in DB
↓
Filter live helpers (Redis)
↓
Filter availability = online
↓
Get ETA via OSRM
↓
Sort by ETA
↓
Pick top N helpers
↓
Send booking request via WebSocket

```

---

### Why Redis?

PostgreSQL is too slow for:
- real-time location updates
- frequent reads

Redis provides:
- fast reads/writes
- geo queries
- in-memory performance

---

## 3. Redis Data Design

### Store helper location:

```

GEOADD helpers_geo lng lat helperId

```

### Store helper data:

```

helper:{id} → {
lat,
lng,
status,
lastSeen
}

```

---

### Why GEO?

- radius-based search is O(log n)
- perfect for nearby helper queries

---

## 4. WebSocket Design

---

### Rooms

| Room | Purpose |
|------|--------|
| helper:{id} | individual helper |
| booking:{id} | booking updates |

---

### Events

#### Helper → Server
```

location:update
booking:accept
booking:reject
heartbeat

```

---

#### Server → Helper
```

booking:request
booking:cancelled

```

---

#### Server → User
```

booking:matched
helper:location
booking:reassigning

````

---

### Why WebSockets?

HTTP polling:
- slow ❌
- expensive ❌

WebSocket:
- real-time ✅
- efficient ✅

---

## 5. Acceptance Logic (CRITICAL)

### Problem:
Multiple helpers may accept simultaneously → race condition

---

### Solution (Atomic DB Update):

```sql
UPDATE booking
SET status = 'accepted', helper_id = ?
WHERE id = ? AND status = 'requested'
````

---

### Why?

* Only ONE helper succeeds
* prevents double assignment

---

## 6. Tracking System

---

### Flow:

```
Helper sends location
    ↓
Update Redis
    ↓
Broadcast to booking room
    ↓
Frontend updates marker
```

---

### Optimization:

* throttle ETA calculation (2–3 sec)
* avoid recalculating every update

---

## 7. OSRM Integration

### API:

```
/route/v1/driving/{lng1},{lat1};{lng2},{lat2}
```

---

### Returns:

* distance
* duration (ETA)

---

### Why OSRM?

* free
* fast
* self-hostable later

---

## 8. Radius Expansion Strategy

---

### Progressive Search:

```
5 km → 8 km → 12 km → 15 km
```

---

### Why?

* prioritizes nearby helpers
* avoids unnecessary load
* improves UX

---

## 9. Failure Handling

---

### Case 1: Helper Rejects

* move to next helper

---

### Case 2: No Response (timeout)

```
10 sec → retry
```

---

### Case 3: Helper Offline

Detect:

```
lastSeen > 10 sec
```

---

### Case 4: Helper Not Moving

```
no movement > 30 sec
AND ETA not decreasing
```

---

### Action:

* cancel helper
* reassign booking

---

## 10. Background Jobs

---

### 1. Heartbeat Monitor

```
if lastSeen > 10 sec → offline
```

---

### 2. Idle Detection

```
if no movement → reassign
```

---

### 3. Acceptance Timeout

```
if no accept in 10 sec → next helper
```

---

## 11. Cancellation Policy

---

### Phase 1 (0–60 sec)

* free cancellation

---

### Phase 2 (mid)

* small fee

---

### Phase 3 (late / near)

* high fee or block

---

### Why?

* protects helpers
* prevents abuse

---

## 12. Real-Time Optimization

---

### Use THROTTLE (not debounce)

```
update ETA every 2–3 sec
```

---

### Why?

* smooth UI
* less computation

---

## 13. System Flow Summary

```
User books
   ↓
Booking created
   ↓
Matching starts
   ↓
Helpers notified
   ↓
First accept wins
   ↓
Tracking starts
   ↓
Live updates + ETA
   ↓
Failure?
   ↓
Reassign
```

---

# 🚀 Implementation Plan

---

## Phase 1

* WebSocket setup
* helper location updates
* Redis integration

---

## Phase 2

* matching engine
* OSRM integration

---

## Phase 3

* booking acceptance logic
* tracking UI

---

## Phase 4

* failure handling
* retries + radius expansion

---

# ⚠️ Common Mistakes

❌ Using only PostgreSQL for real-time
❌ No atomic booking update
❌ No state machine
❌ Recalculating ETA on every update
❌ Infinite radius expansion

---

# 🎯 Final Outcome

This system supports:

* real-time matching
* scalable architecture
* fault tolerance
* production-level reliability

---


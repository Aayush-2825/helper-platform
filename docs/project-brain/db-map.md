# Database Architecture Deep Dive

This document provides a comprehensive analysis of the database layer orchestrated by Drizzle ORM inside `packages/db`.

---

## 1. Schema & Models Breakdown

### Authentication & Identity
- **`user`**: Core identity (email, password_hash, role constraints). Managed by `better-auth`.
- **`session`, `account`, `verification`**: Auth tokens, OAuth bindings, and OTP storage.

### Helpers (Supply Side)
- **`helper_profile`**: 1:1 with `user` (`userId` unique constraint). Stores availability, rating averages, radius limits, and category enums.
- **`helper_onboarding_draft`**: JSONB payload storage preserving form states natively.
- **`helper_kyc_document`**: Document URLs (Cloudinary), expiration dates, reviewer Admin IDs.
- **`video_kyc_session`**: Maps Google Calendar event IDs, `meet_link`, attempt counts, and `scheduled_at` metrics.
- **`helper_web_push_subscription`**: P256DH token bindings for browser service workers.

### Bookings (Marketplace Core)
- **`booking`**: The mega-transaction entity connecting a Customer to a Helper. Stores geolocations, final amounts, commissions, contact codes, and strict timeline stamps (`requestedAt`, `scheduledFor`, `startedAt`, `completedAt`).
- **`booking_candidate`**: Volatile rows representing dispatch pings. Maps a `booking_id` to a `helper_profile_id` with statuses like `pending`, `accepted`, `rejected`, or `timeout`.
- **`booking_status_event`**: Operational Append-Only Log (Audit stream for all state changes on a booking).

### Financials & Payments
- **`payment_transaction`**: Central ledger storing Razorpay Order IDs, amounts, split logic.
- **`payout`**: Escrow release batches grouping multiple transactions for helper withdrawal wires.
- **`booking_receipt`**: Tax invoice tracking pointing to external S3/PDF URLs.

### Post-Job Analytics
- **`review`**: 1:1 (or 1:M) link holding Star metrics, comments, and reviewer identifiers.
- **`dispute` & `dispute_message`**: Conflict logic tracking severity locks and holding conversation JSONB strings.

### Operations & Real-time
- **`service_category`, `service_subcategory`**: Static pricing definitions shaping marketplace offerings.
- **`notification_event`**: Broad dispatch logs.
- **`notification_queue`**: Stateful polling table acting as the fallback message broker.

---

## 2. Database Relationship Map (ERD)

```mermaid
erDiagram
    user ||--o1 helper_profile : has
    user ||--o{ session : maintains
    helper_profile ||--o{ helper_kyc_document : uploads
    helper_profile ||--o{ video_kyc_session : attends
    
    user ||--o{ booking : creates_as_customer
    helper_profile ||--o{ booking : accepts_job
    
    booking ||--o{ booking_candidate : pings
    booking ||--o{ payment_transaction : triggers
    booking ||--o{ booking_status_event : audits
    booking ||--o1 review : receives
    booking ||--o1 dispute : blocks
```

---

## 3. Primary/Foreign Keys & Indexing Strategy

### Constraints & Cascades
- **Primary Keys**: Defined globally using string-based `text('id').primaryKey()` rather than UUID limits. This allows explicit nanoids/cuid injections. 
- **Foreign Keys**: heavily structured to prevent orphaned reads:
  - `onDelete: "restrict"` is used heavily on critical financial/booking nodes (cannot delete a user who has active bookings).
  - `onDelete: "cascade"` is present on volatile mappings (deleting a `booking` will wipe `booking_candidate` arrays instantly).

### Indexing Strategies
The schema leverages dense compound indexing optimizations targeting query planner paths:
- **Single Target Indexes**: `booking_customerId_idx`, `helperKycDocument_status_idx`.
- **Compound Lookup Indexes**: `index("booking_status_requestedAt_idx").on(table.status, table.requestedAt)` – Highly optimized for "Show me all active bookings requested today".
- **Unique Indexes**: Used specifically to constrain 1:1 extensions natively without application locks (`uniqueIndex("helperProfile_userId_uidx")`).

---

## 4. Query Patterns & Risk Analysis

### Expensive Queries
- **Candidate Evaluation**: Finding helpers for a booking requires spanning `helper_profile.service_city` mapping out `latitude`/`longitude` points using mathematical bounds (Haversine/Pythagorean logic) mapped over standard SQL Numeric types heavily taxing CPU on execution.
- **Queue Sweeping**: `notification_queue` polling executes wide interval `SELECT * WHERE user_id = X` operations repeatedly per TCP connection, fragmenting buffer caches on spikes.

### N+1 Query Risks
- **Admin Fetching**: Listing `booking` models alongside `user` details, `helper_profile` context, and `payment_transaction` rows faces catastrophic N+1 risks unless `db.query.booking.findMany({ with: { helper: true }})` applies internal DataLoader pattern joins via Drizzle seamlessly. 

### Missing Indexes / Anti-Patterns
1. **No Spatial Search**: The `latitude`/`longitude` columns in `booking` are stored as `numeric(10,7)`. Searching radii distances requires standard mathematical index bypasses (Full Table Scans). **Requirement**: Shift to `PostGIS` bounding box indices (`GIST`).
2. **Missing Text Trigrams**: Searching helper or customer names/phones lacks `pg_trgm` indices, blocking fast autocomplete functionalities.

---

## 5. Security & Operational Assessment

### Data Normalization Quality
- **High Normalization**: Most repeating datasets are broken outward (e.g. `booking_status_event` handles historical statuses instead of polluting the `booking` row with multiple `timestamp` arrays).
- **Accepted De-normalization**: Native stringified ENUMS inside `helper_profile.primary_category` prevent tiny joined configuration tables from slowing down reads. `JSONB` handles volatile drafts (`helper_onboarding_draft`) avoiding brittle schema migrations on form changes.

### Audit Logging Systems
- Handled actively on domain objects rather than globally.
- `booking_status_event` serves as a rigid state machine timeline protecting against race conditions and customer-service lying ("Helper never marked start"). Admin changes require explicit trigger rows inserted alongside entity updates.

### Soft Delete Systems
- **Assessment**: The database actively *LACKS* a generic `deleted_at` paradigm natively across the entity matrix.
- Most relationships rely on `CASCADE` and explicit removal or strict `restrict`. `helper_profile.isActive = false` acts as a soft-flag, but transactional rows disappear entirely if explicitly `DELETE` flagged on `drizzle`.

---

## 6. Suggested Architectural Optimizations

1. **Implement PostGIS for Geospatial Mapping**:
   Re-align `latitude` and `longitude` to native `geometry(Point, 4326)`. Deploy `ST_DWithin` functions to rank `booking_candidates` exponentially faster than application-layer math over SQL.

2. **Transition Real-time Queue to In-Memory Target**:
   `notification_queue` exists purely as a volatile array of events to be dropped instantly upon consumption. Pushing this schema explicitly entirely to **Redis Streams** removes massive index bloat, IOPS tax, and autovacuum exhaustion on the PostgreSQL Primary instance.

3. **Re-implement Archival vs Deletion limits**:
   Attach rigorous `deleted_at` fields on `booking` and `payment_transaction` entities explicitly to avoid devastating `CASCADE` accidental executions wiping ledger tracking for compliance auditing.
This package runs the realtime websocket service for Helper Platform.

## Development

Run the service in watch mode:

```bash
pnpm dev
```

The service listens on `http://localhost:4001` by default.

- Health endpoint: `GET /`
- Health aliases: `GET /health`, `GET /health/live`, `GET /health/ready`, `GET /api/realtime/health`
- Websocket endpoints: `ws://localhost:4001/ws` and `ws://localhost:4001/api/realtime/ws`
- Event publish endpoints: `POST /events` and `POST /api/realtime/events`
- Realtime operations endpoints: `POST /api/realtime/ops/helper-presence`, `POST /api/realtime/ops/location-updates`, `POST /api/realtime/ops/booking-events`, `POST /api/realtime/ops/subscriptions`, `POST /api/realtime/ops/notification-queue`, `POST /api/realtime/ops/incoming-jobs`

Publish event example:

```bash
curl -X POST http://localhost:4001/api/realtime/events \
	-H "Content-Type: application/json" \
	-d '{"event":"booking.accepted","data":{"bookingId":"bk_123"}}'
```

Helper presence example:

```bash
curl -X POST http://localhost:4001/api/realtime/ops/helper-presence \
	-H "Content-Type: application/json" \
	-d '{"helperUserId":"hlp_9","status":"online","latitude":12.9123,"longitude":77.6421,"availableSlots":2}'
```

Set `PORT` to override the default:

```bash
PORT=4010 pnpm dev
```

## Build

```bash
pnpm build
pnpm start
```

This compiles TypeScript into `dist/` and starts the service with Node.js.

## Message Model

Incoming websocket messages are broadcast to all connected clients with this envelope:

```json
{
	"type": "broadcast",
	"payload": "<raw-message>",
	"timestamp": "2026-03-22T10:00:00.000Z"
}
```

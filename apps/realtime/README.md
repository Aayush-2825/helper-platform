This package runs the realtime websocket service for Helper Platform.

## Development

Run the service in watch mode:

```bash
pnpm dev
```

The service listens on `http://localhost:3001` by default.

- Health check: `GET /health` or `GET /api/realtime/health`
- WebSocket endpoint (recommended): `ws://localhost:3001/api/realtime/ws?userId=<user-id>`
- Broadcast endpoint: `POST /api/realtime/broadcast`
- Nearby helper HTTP endpoint: `GET /api/helpers/nearby`

Publish event example:

```bash
curl -X POST http://localhost:3001/api/realtime/broadcast \
	-H "Content-Type: application/json" \
	-d '{"event":"booking_update","data":{"bookingId":"bk_123","eventType":"accepted"},"targetUserIds":["cus_1","hlp_2"]}'
```

Booking request WebSocket message example:

```bash
{"type":"booking_request","bookingId":"9baf9e6a-8f81-48e8-a11f-0f520251ca82","targetUserIds":["hlp_2"]}
```

Set `PORT` to override the default:

```bash
PORT=4010 pnpm dev
```

Set `CORS_ORIGIN` for allowed browser origins (comma-separated):

```bash
CORS_ORIGIN="http://localhost:3000,https://helper-platform-web.vercel.app"
```

## Build

```bash
pnpm build
pnpm start
```

This compiles TypeScript into `dist/` and starts the service with Node.js.

## Message Model

Server outbound events are delivered with this envelope:

```json
{
	"type": "event",
	"event": "booking_update",
	"data": {
		"bookingId": "bk_123",
		"eventType": "accepted"
	}
}
```

Supported inbound message types:

- `booking_request`
- `booking_update`
- `helper_search`
- `booking_accept`
- `booking_reject`
- `booking_start`
- `booking_cancel` (legacy alias: `cancel_search`)
- `helper_presence`
- `location_update`
- `notification`
- `payment_update`

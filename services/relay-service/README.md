# Relay Service

Lightweight Node/Express service that stores Seattle Heartbeat relay packets and broadcasts updates via REST + WebSocket.

## Scripts
```bash
pnpm install      # install deps
pnpm dev          # run with tsx watch on :4001
pnpm build        # compile to dist/
pnpm start        # run compiled output
```

## Endpoints
- `GET /health`
- `GET /relay` — list packets
- `POST /relay` — create packet
- `PATCH /relay/:id` — update status/notes
- `DELETE /relay/:id`
- `POST /seed` — load sample data
- `WS /ws` — push events (`relay.created`, `relay.updated`, `relay.deleted`, `relay.snapshot`)

## Environment
- `PORT` (default `4001`)
- TODO: add persistence layer (SQLite/Prisma) and auth for production.

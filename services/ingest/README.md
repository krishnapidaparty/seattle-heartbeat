# Seattle Heartbeat – Ingestion Scripts

Small helper scripts that pull live public data and publish relay packets to the local relay service.

## Setup

```bash
cd services/ingest
pnpm install
```

Set the relay base URL if it isn’t running on the default:

```bash
export RELAY_BASE_URL="http://localhost:4001"
```

## NOAA Weather Alerts

Polls the National Weather Service API for active alerts in Washington State, filters for King County / Seattle mentions, and emits relay packets per alert.

```bash
pnpm weather
```

Each alert is posted with:

- `category`: `weather:<event-name>`
- `origin`: closest Seattle neighborhood based on the alert polygon
- `targets`: preset list based on hazard type (wind/flood/heat)
- `impactScore`: derived from NOAA severity
- `urgency`: derived from NOAA urgency
- `window`: onset → end timestamps
- `requestedActions`: NOAA instructions (or defaults)

Run the script periodically (e.g., every 10 minutes) to keep relays fresh.

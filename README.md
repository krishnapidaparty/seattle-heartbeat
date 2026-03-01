# Seattle Heartbeat

Seattle Heartbeat is a neighborhood-to-neighborhood relay network for civic operations. Autonomous agents monitor local signals (events, traffic, emergencies) within each Seattle neighborhood, package urgent findings into structured "relay" packets, and coordinate pre-emptive responses across the city via ClawUI, OpenClaw, and external data feeds.

## What's new

**Ingestion workspace** (`services/ingest/`) with a NOAA weather alerts script that pulls real hazard data from [api.weather.gov](https://api.weather.gov), maps it to Seattle neighborhoods, and posts relay packets automatically.

- Script derives **impact score** from NOAA severity, **urgency** from NOAA urgency, and picks **targets** and **actions** based on hazard type (wind, flood, heat, etc.).
- Uses the actual NOAA feed—if there are no active alerts, it simply reports *"No active weather alerts for WA."*

See [How to run the weather ingest](#noaa-weather-ingest) below.

## Repo Layout

```
seattle-heartbeat/
├── README.md                # Top-level overview
├── docs/                    # Detailed specs, architecture, and planning
├── ui/                      # ClawUI hybrid workspace configuration (see docs/ui-setup)
└── services/
    ├── relay-service/       # Lightweight service for relay packets (Node/Express)
    └── ingest/              # NOAA weather alerts → relay packets (run pnpm weather)
```

## Quick Start

1. **Install prerequisites**
   - Node.js 22+
   - pnpm (preferred) or npm
   - Git, OpenClaw CLI configured with gateway access

2. **Clone ClawUI Starter Kit into `ui/`**
   ```bash
   cd ui
   git clone https://github.com/GeneralJerel/clawuikit.git .
   pnpm install
   cp .env.example .env
   # Fill in OpenRouter/OpenAI + OpenClaw gateway credentials
   ```

3. **Relay service**
   ```bash
   cd services/relay-service
   pnpm install
   pnpm dev
   ```
   The service exposes simple REST/WebSocket endpoints for relay packets.

4. **Run ClawUI in Hybrid mode**
   ```bash
   cd ui
   pnpm dev
   ```

5. **Wire agents + integrations** by following the docs in `/docs`.

## NOAA weather ingest

Pull current NOAA alerts and emit relays (relay service must be running on port 4001):

```bash
cd services/ingest
pnpm install              # already done once, but safe

# Point at your relay base (defaults to http://localhost:4001)
export RELAY_BASE_URL="http://localhost:4001"

# Pull current NOAA alerts and emit relays
pnpm weather
```

If NOAA has active alerts that include King County / Seattle, they’ll show up in the Relay Feed panel in your UI. You can cron this script (e.g. every 10 min) or run it manually.

## Resources
- [ClawUI Starter Kit](https://github.com/GeneralJerel/clawuikit)
- [OpenClaw Docs](https://docs.openclaw.ai)
- [CopilotKit](https://www.copilotkit.ai/)
- [Vapi](https://vapi.ai)
- [Composio](https://composio.dev)
- [Auth0 for AI Agents](https://auth0.com/ai)

### Fire 911 ingest

Pull Seattle Fire 911 incidents from the open data feed and turn them into relays:

```bash
cd services/ingest
export RELAY_BASE_URL="http://localhost:4001"
pnpm fire
```

Optionally set `SOCRATA_APP_TOKEN` for higher rate limits.

### Weather condition ingest

Use Open-Meteo to emit relays when wind/humidity/temp thresholds trigger:

```bash
cd services/ingest
export RELAY_BASE_URL="http://localhost:4001"
pnpm weather:conditions
```

### SPD blotter ingest

Pull major incidents from the SPD blog RSS feed:

```bash
cd services/ingest
export RELAY_BASE_URL="http://localhost:4001"
pnpm spd:blotter
```

### Events ingest

Use MLB's public schedule to post upcoming Mariners home games:

```bash
cd services/ingest
export RELAY_BASE_URL="http://localhost:4001"
pnpm events:mariners
```


### Eventbrite ingest

Set `EVENTBRITE_TOKEN` and run:

```bash
cd services/ingest
export EVENTBRITE_TOKEN="<token>"
export RELAY_BASE_URL="http://localhost:4001"
pnpm events:eventbrite
```

### Traffic ingest

Use Seattle's bridge counts to emit relays when crossings spike:

```bash
cd services/ingest
export RELAY_BASE_URL="http://localhost:4001"
pnpm traffic:bridges
```

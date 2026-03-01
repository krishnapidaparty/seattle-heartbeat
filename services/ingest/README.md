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

When there are **no active NOAA alerts** for WA, the script posts nothing, so the Relay Feed stays empty. To post a **sample weather relay** for testing when the feed is empty, set:

```bash
export SAMPLE_WEATHER_IF_EMPTY=1
pnpm weather
```

Then refresh the UI to see the sample entry.

### Run every 10 minutes (cron)

Use the runner script so cron has a single command to run:

```bash
# Make sure the script is executable (already done if you followed setup)
chmod +x services/ingest/run-weather.sh
```

Add a crontab entry (run `crontab -e` and paste the line below; fix the path if your repo lives elsewhere):

```cron
# NOAA weather ingest every 10 minutes (ensure PATH includes pnpm)
*/10 * * * * PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/share/pnpm:$PATH" /Users/kpidaparty/Library/CloudStorage/OneDrive-Chewy.com,LLC/Desktop/seattle-heartbeat/services/ingest/run-weather.sh >> /tmp/seattle-weather-ingest.log 2>&1
```

Leave the relay service running (`pnpm dev` in `services/relay-service`) so posted relays are received. Logs go to `/tmp/seattle-weather-ingest.log`.

## Fire 911 ingest

Fetch active Seattle Fire 911 incidents from the public Socrata feed (last 30 minutes) and emit relays for each call.

```bash
cd services/ingest
export RELAY_BASE_URL="http://localhost:4001"
pnpm fire
```

Set `SOCRATA_APP_TOKEN` if you have a token for higher rate limits.

## Weather condition thresholds

Poll Open-Meteo for current temperature / humidity / wind per neighborhood and emit relays when thresholds trigger (e.g., high winds, slick roads, heat).

```bash
cd services/ingest
export RELAY_BASE_URL="http://localhost:4001"
pnpm weather:conditions
```

## SPD blotter ingest

Scrape the official SPD blotter RSS feed for major incidents (shootings, robberies, assaults) and emit relays when a new article appears.

```bash
cd services/ingest
export RELAY_BASE_URL="http://localhost:4001"
pnpm spd:blotter
```

## Mariners events ingest

Pull upcoming Mariners (or other stadium) games via the MLB stats API and emit relays for SoDo/Downtown.

```bash
cd services/ingest
export RELAY_BASE_URL="http://localhost:4001"
pnpm events:mariners
```

Set `SAMPLE_EVENTS_IF_EMPTY=1` if there are no home games this week but you still want a demo packet.


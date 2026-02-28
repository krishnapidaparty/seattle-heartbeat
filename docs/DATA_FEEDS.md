# External Data Feeds

| Feed | API | Usage |
| --- | --- | --- |
| Events & Permits | Seattle Special Events API / Ticketmaster / Eventbrite | Detect stadium games, parades, protests; derive crowd size + neighborhoods impacted. |
| Weather | Open-Meteo / NOAA | Micro-forecasts + severe alerts (wind, rain, heat) per neighborhood polygon. |
| Transit & Traffic | King County Metro GTFS-realtime, WSDOT traffic flow, TomTom congestion | Monitor route disruptions, travel times, crowding indicators near key corridors. |
| 911 / Civic Dispatch | Seattle Open Data (Real-Time Fire 911, Police 911) | Inputs for accidents, fires, medical incidents. |
| Utilities | Seattle City Light outage feed (optional) | Anticipate power disruptions affecting services. |
| Synthetic Metrics | Mocked telemetry (infra load, staff levels) | Demonstrate agent reasoning even without sensitive internal data. |

## Ingestion Strategy
1. **Polling Workers**: Node cron jobs (or OpenClaw automations) fetch data every 1–5 minutes, normalize into a shared schema.
2. **Neighborhood Mapping**: Each record tagged to a neighborhood polygon (GeoJSON) using lat/long or permit address.
3. **Impact Score**: Compute `impact = crowd_factor + severity + (1 - available_capacity)`.
4. **Relay Trigger**: If `impact >= 0.8` or category in {multi-vehicle accident, structure fire, severe weather}, emit urgent relay packet.
5. **Storage**: Persist latest context snapshot per neighborhood for UI display, plus append to historical log for trend charts.

## Sample Payload (Event)
```json
{
  "id": "evt_kingdome_20260228",
  "type": "event",
  "source": "ticketmaster",
  "neighborhood": "SoDo",
  "startTime": "2026-02-28T17:00:00-08:00",
  "attendance": 42000,
  "severity": 0.6,
  "notes": "Mariners opener, expect heavy ingress 4-5 PM"
}
```

Agents consume these normalized payloads to reason about relays and recommended mitigations.

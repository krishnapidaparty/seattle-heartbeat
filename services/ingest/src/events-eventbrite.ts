#!/usr/bin/env tsx

import { postRelay } from "./postRelay";
import { closestNeighborhood } from "./neighborhoods";

const TOKEN = process.env.EVENTBRITE_TOKEN;
if (!TOKEN) {
  console.error("EVENTBRITE_TOKEN env var is required");
  process.exit(1);
}

const BASE_URL = "https://www.eventbriteapi.com/v3/events/search/";

(async () => {
  const params = new URLSearchParams({
    "location.address": "Seattle, WA",
    "location.within": "15km",
    "expand": "venue",
    "sort_by": "date",
    "start_date.range_start": new Date().toISOString(),
    "start_date.range_end": new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  });

  console.log("Fetching Eventbrite events…");
  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  if (!res.ok) throw new Error(`Eventbrite API failed ${res.status}`);
  const data = await res.json();
  const events: any[] = data.events ?? [];
  let posted = 0;

  for (const event of events.slice(0, 10)) {
    const name = event.name?.text ?? "Event";
    const start = event.start?.local ?? event.start?.utc;
    const venue = event.venue ?? {};
    const lat = parseFloat(venue.latitude ?? "NaN");
    const lon = parseFloat(venue.longitude ?? "NaN");
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const hood = closestNeighborhood(lat, lon);

    await postRelay({
      id: `eventbrite-${event.id}`,
      origin: hood.id,
      targets: [hood.id, ...(hood.id === "SoDo" ? ["Downtown"] : [])],
      category: "event:eventbrite",
      impactScore: 0.55,
      urgency: "normal",
      window: start ?? "upcoming",
      requestedActions: [
        `Expect crowds near ${venue.address?.localized_address_display ?? hood.name}.`,
      ],
      notes: `${name} — ${start ? new Date(start).toLocaleString() : "TBD"}`,
    }).catch((err) => console.error("Failed to post Eventbrite relay", err));
    posted += 1;
  }

  console.log(`Posted ${posted} Eventbrite events.`);
})();

#!/usr/bin/env tsx

import { closestNeighborhood } from "./neighborhoods";
import { postRelay } from "./postRelay";

const NOAA_URL = "https://api.weather.gov/alerts/active?area=WA";

function scoreFromSeverity(severity?: string) {
  switch (severity) {
    case "Extreme":
      return 1;
    case "Severe":
      return 0.9;
    case "Moderate":
      return 0.7;
    case "Minor":
      return 0.4;
    default:
      return 0.3;
  }
}

function urgencyFromNOAA(urgency?: string): "normal" | "urgent" {
  if (!urgency) return "normal";
  return /immediate|expected/i.test(urgency) ? "urgent" : "normal";
}

function targetsForEvent(kind: string) {
  if (/wind|storm|thunder/i.test(kind)) {
    return ["Ballard", "QueenAnne", "WestSeattle"];
  }
  if (/flood|rain/i.test(kind)) {
    return ["SoDo", "Downtown", "WestSeattle"];
  }
  if (/heat|air quality/i.test(kind)) {
    return ["Downtown", "CapitolHill", "Ballard"];
  }
  return ["Downtown", "CapitolHill"];
}

(async () => {
  console.log("Fetching NOAA alerts…");
  const res = await fetch(NOAA_URL, {
    headers: {
      "User-Agent": "SeattleHeartbeatIngester/1.0 (hello@seattleheartbeat.local)",
      Accept: "application/geo+json",
    },
  });

  if (!res.ok) {
    throw new Error(`NOAA request failed: ${res.status}`);
  }

  const data = await res.json();
  const features: any[] = data.features ?? [];

  if (!features.length) {
    console.log("No active weather alerts for WA.");
    return;
  }

  const now = Date.now();
  const pushes: Promise<unknown>[] = [];

  for (const feature of features) {
    const props = feature.properties ?? {};
    const areaDesc: string = props.areaDesc ?? "";
    if (!/king|puget|seattle/i.test(areaDesc)) continue;

    const event: string = props.event ?? "Weather Alert";
    const severity: string | undefined = props.severity;
    const urgency: string | undefined = props.urgency;

    const geometry = feature.geometry;
    let lat = 47.6062;
    let lon = -122.3321;

    if (geometry?.type === "Polygon" && geometry.coordinates?.[0]?.length) {
      const coords = geometry.coordinates[0];
      const avg = coords.reduce(
        (acc: { lat: number; lon: number }, [lng, lt]: [number, number]) => {
          acc.lat += lt;
          acc.lon += lng;
          return acc;
        },
        { lat: 0, lon: 0 },
      );
      lat = avg.lat / coords.length;
      lon = avg.lon / coords.length;
    }

    const origin = closestNeighborhood(lat, lon).id;
    const targets = targetsForEvent(event);
    const impactScore = scoreFromSeverity(severity);
    const urgencyLabel = urgencyFromNOAA(urgency);
    const onset = props.onset ? new Date(props.onset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "now";
    const ends = props.ends
      ? new Date(props.ends).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "later today";

    const requestedActions: string[] = [];
    if (props.instruction) {
      requestedActions.push(props.instruction.slice(0, 180));
    } else if (/wind/i.test(event)) {
      requestedActions.push("Secure outdoor items and avoid parking under trees");
    } else if (/rain|flood/i.test(event)) {
      requestedActions.push("Watch for standing water on low roads and allow transit delays");
    } else {
      requestedActions.push("Monitor local news and check on neighbors");
    }

    const packetId = feature.id ?? `noaa-${props.id ?? now}`;

    pushes.push(
      postRelay({
        id: packetId,
        origin,
        targets,
        category: `weather:${event.toLowerCase().replace(/\s+/g, "-")}`,
        impactScore,
        urgency: urgencyLabel,
        window: `${onset} → ${ends}`,
        requestedActions,
        notes: props.headline ?? props.description?.slice(0, 200),
      })
        .then(() =>
          console.log(`Posted weather relay for ${event} (${origin}) → ${targets.join(", ")}`),
        )
        .catch((err) => console.error("Relay POST failed", err)),
    );
  }

  await Promise.all(pushes);
  console.log(`Weather ingest complete. Posted ${pushes.length} relays.`);
})();

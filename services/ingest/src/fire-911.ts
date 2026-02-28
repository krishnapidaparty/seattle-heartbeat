#!/usr/bin/env tsx

import { closestNeighborhood } from "./neighborhoods";
import { postRelay } from "./postRelay";

const DATASET_URL = "https://data.seattle.gov/resource/kzjm-xkqj.json";

function impactFromType(type?: string) {
  const t = (type ?? "").toLowerCase();
  if (!t) return 0.4;
  if (t.includes("rescue") || t.includes("fire")) return 0.85;
  if (t.includes("motor vehicle") || t.includes("aid")) return 0.6;
  if (t.includes("hazard")) return 0.7;
  return 0.45;
}

function actionsFromType(type?: string): string[] {
  const t = (type ?? "").toLowerCase();
  if (t.includes("fire"))
    return ["Avoid the block and keep windows closed if smoke is visible."];
  if (t.includes("rescue"))
    return ["Expect emergency vehicles; yield space on surrounding streets."];
  if (t.includes("motor vehicle"))
    return ["Anticipate traffic delays near the incident while crews respond."];
  if (t.includes("hazard"))
    return ["Stay clear of the area until crews clear the hazard; monitor SDOT alerts."];
  return ["Monitor Seattle Fire updates; yield to responding units."];
}

function formatWindow(iso?: string) {
  if (!iso) return "now";
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

(async () => {
  const sinceTs = Date.now() - 30 * 60 * 1000;
  const params = new URLSearchParams({
    "$limit": "200",
    "$order": "datetime DESC",
  });

  const headers: Record<string, string> = {
    "User-Agent": "SeattleHeartbeatIngester/1.0",
  };
  const socrataToken = process.env.SOCRATA_APP_TOKEN;
  if (socrataToken) headers["X-App-Token"] = socrataToken;

  console.log("Fetching Seattle Fire 911 incidents…");
  const res = await fetch(`${DATASET_URL}?${params.toString()}`, { headers });
  if (!res.ok) {
    throw new Error(`Fire 911 request failed: ${res.status}`);
  }

  const incidents: Array<Record<string, any>> = await res.json();
  const recent = incidents.filter((incident) => {
    const ts = Date.parse(incident.datetime ?? "");
    return !Number.isNaN(ts) && ts >= sinceTs;
  });

  if (!recent.length) {
    console.log("No incidents in the last 30 minutes.");
    return;
  }

  let count = 0;
  for (const incident of recent) {
    const lat = parseFloat(incident.latitude ?? "");
    const lon = parseFloat(incident.longitude ?? "");
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const origin = closestNeighborhood(lat, lon).id;
    const type = incident.type ?? "Fire Incident";
    const impactScore = impactFromType(type);
    const urgency = impactScore >= 0.8 ? "urgent" : "normal";
    const window = `${formatWindow(incident.datetime)} → +30m`;
    const targets = origin === "SoDo" ? [origin, "Downtown"] : [origin];

    try {
      await postRelay({
        id: `fire-${incident.incident_number}`,
        origin,
        targets,
        category: `fire:${type.toLowerCase().replace(/\s+/g, "-")}`,
        impactScore,
        urgency,
        window,
        requestedActions: actionsFromType(type),
        notes: `${type} at ${incident.address ?? "unknown location"}`,
      });
      count += 1;
    } catch (err) {
      console.error("Failed to post fire relay", err);
    }
  }

  console.log(`Posted/updated ${count} fire 911 relays.`);
})();

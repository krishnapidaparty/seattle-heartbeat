#!/usr/bin/env tsx

import { postRelay } from "./postRelay";
import { closestNeighborhood } from "./neighborhoods";

const ACCESS_CODE = process.env.WSDOT_ACCESS_CODE;
if (!ACCESS_CODE) {
  console.error("WSDOT_ACCESS_CODE env var is required");
  process.exit(1);
}

const API_URL = `https://wsdot.wa.gov/traffic/api/TravelTimes/TravelTimesREST.svc/GetTravelTimesAsJson?AccessCode=${ACCESS_CODE}`;

function mapNeighborhood(name?: string) {
  const lower = (name ?? "").toLowerCase();
  if (lower.includes("i-5") && lower.includes("downtown")) return "Downtown";
  if (lower.includes("sr 99") || lower.includes("alaskan")) return "SoDo";
  if (lower.includes("ballard") || lower.includes("fremont")) return "Ballard";
  if (lower.includes("queen anne") || lower.includes("mercerdale")) return "QueenAnne";
  if (lower.includes("west seattle")) return "WestSeattle";
  if (lower.includes("capitol") || lower.includes("madison")) return "CapitolHill";
  return closestNeighborhood(47.6062, -122.3321).id;
}

function severity(current?: number, average?: number) {
  if (typeof current !== "number" || typeof average !== "number") return null;
  if (current >= average + 10 || current / average >= 1.4) {
    return { score: 0.8, urgency: "urgent" as const };
  }
  if (current >= average + 5 || current / average >= 1.2) {
    return { score: 0.6, urgency: "normal" as const };
  }
  return null;
}

(async () => {
  console.log("Fetching WSDOT travel times…");
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`WSDOT API failed ${res.status}`);
  const text = await res.text();
  const data = JSON.parse(text);
  const routes: any[] = Array.isArray(data) ? data : [];
  let posted = 0;

  for (const route of routes) {
    const info = severity(route.CurrentTime, route.AverageTime);
    if (!info) continue;
    const hoodId = mapNeighborhood(route.Name);
    await postRelay({
      id: `traffic-${route.TravelTimeID}`,
      origin: hoodId,
      targets: [hoodId, ...(hoodId === "SoDo" ? ["Downtown"] : [])],
      category: "traffic:travel-time",
      impactScore: info.score,
      urgency: info.urgency,
      window: route.TimeUpdated ?? new Date().toISOString(),
      requestedActions: [
        `Travel time ${route.CurrentTime} min (avg ${route.AverageTime}) on ${route.Name}.`,
      ],
      notes: route.Description ?? route.Name ?? "WSDOT route",
    }).catch((err) => console.error("Failed to post traffic relay", err));
    posted += 1;
  }

  console.log(`Posted ${posted} traffic relays.`);
})();

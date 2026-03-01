#!/usr/bin/env tsx

import { postRelay } from "./postRelay";
import { closestNeighborhood } from "./neighborhoods";

const ACCESS_CODE = process.env.WSDOT_ACCESS_CODE;
if (!ACCESS_CODE) {
  console.error("WSDOT_ACCESS_CODE env var is required");
  process.exit(1);
}

const API_URL = `https://wsdot.wa.gov/traffic/api/TravelTimes/TravelTimesREST.svc/GetTravelTimesAsJson?AccessCode=${ACCESS_CODE}`;

function decodeWSDOTDate(value?: string) {
  if (!value) return null;
  const match = /\/Date\((\d+)/.exec(value);
  if (match) return new Date(Number(match[1]));
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

function mapNeighborhood(name?: string) {
  const lower = (name ?? "").toLowerCase();
  if (lower.includes("i-5") && lower.includes("downtown")) return "Downtown";
  if (lower.includes("sr 99") || lower.includes("alaskan")) return "SoDo";
  if (lower.includes("ballard") || lower.includes("fremont")) return "Ballard";
  if (lower.includes("queen anne") || lower.includes("mercer")) return "QueenAnne";
  if (lower.includes("west seattle")) return "WestSeattle";
  if (lower.includes("capitol") || lower.includes("madison")) return "CapitolHill";
  return closestNeighborhood(47.6062, -122.3321).id;
}

function severity(current?: number, average?: number) {
  if (typeof current !== "number" || typeof average !== "number") return null;
  const ratio = current / Math.max(average, 1);
  if (current >= average + 10 || ratio >= 1.4) {
    return { score: 0.85, urgency: "urgent" as const };
  }
  if (current >= average + 5 || ratio >= 1.2) {
    return { score: 0.65, urgency: "normal" as const };
  }
  return null;
}

(async () => {
  console.log("Fetching WSDOT travel times…");
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`WSDOT API failed ${res.status}`);
  const payload = await res.json();
  const routes: any[] = Array.isArray(payload) ? payload : [];

  const alerts = routes
    .map((route) => {
      const info = severity(route.CurrentTime, route.AverageTime);
      if (!info) return null;
      const updatedAt = decodeWSDOTDate(route.TimeUpdated);
      if (!updatedAt) return null;
      if (Date.now() - updatedAt.getTime() > 2 * 60 * 60 * 1000) return null; // keep <2h old
      return {
        route,
        info,
        updatedAt,
        delta: (route.CurrentTime ?? 0) - (route.AverageTime ?? 0),
      };
    })
    .filter(Boolean) as Array<{ route: any; info: { score: number; urgency: "urgent" | "normal" }; updatedAt: Date; delta: number }>;

  alerts.sort((a, b) => b.info.score - a.info.score || b.delta - a.delta);
  const topAlerts = alerts.slice(0, 8);

  let posted = 0;
  for (const { route, info, updatedAt } of topAlerts) {
    const hoodId = mapNeighborhood(route.Name);
    const description = route.Description ?? route.Name ?? "WSDOT route";

    await postRelay({
      id: `traffic-${route.TravelTimeID}`,
      origin: hoodId,
      targets: [hoodId, ...(hoodId === "SoDo" ? ["Downtown"] : [])],
      category: "traffic:travel-time",
      impactScore: info.score,
      urgency: info.urgency,
      window: updatedAt.toISOString(),
      requestedActions: [`${description}: ${route.CurrentTime} min (avg ${route.AverageTime})`],
      notes: description,
    }).catch((err) => console.error("Failed to post traffic relay", err));
    posted += 1;
  }

  console.log(`Posted ${posted} traffic relays.`);
})();

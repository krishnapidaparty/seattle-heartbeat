#!/usr/bin/env tsx

import { postRelay } from "./postRelay";
import { closestNeighborhood } from "./neighborhoods";

const DATASET_URL = "https://data.seattle.gov/resource/4xy5-26gy.json";
const SOC_ID = process.env.SOCRATA_APP_TOKEN;

const BRIDGES = [
  {
    id: "fremont",
    column: "fremont_bridge",
    name: "Fremont Bridge",
    origin: "Ballard",
    targets: ["Ballard", "QueenAnne"],
  },
];

function urgencyForCount(count: number) {
  if (count >= 90) return { score: 0.75, urgency: "urgent" as const };
  if (count >= 30) return { score: 0.6, urgency: "normal" as const };
  return null;
}

(async () => {
  const params = new URLSearchParams({
    "$limit": "1",
    "$order": "date DESC",
  });

  const headers: Record<string, string> = {
    "User-Agent": "SeattleHeartbeatIngester/1.0",
  };
  if (SOC_ID) headers["X-App-Token"] = SOC_ID;

  console.log("Fetching SDOT bridge traffic…");
  const res = await fetch(`${DATASET_URL}?${params.toString()}`, { headers });
  if (!res.ok) throw new Error(`Traffic dataset failed ${res.status}`);
  const records: Array<Record<string, any>> = await res.json();
  if (!records.length) {
    console.log("No bridge records returned.");
    return;
  }

  const record = records[0];
  const window = record.date ?? new Date().toISOString();
  let posted = 0;

  for (const bridge of BRIDGES) {
    const raw = record[bridge.column];
    const count = Number(raw);
    if (!Number.isFinite(count)) continue;
    const urgency = urgencyForCount(count);
    if (!urgency) continue;

    await postRelay({
      id: `traffic-${bridge.id}-${window}`,
      origin: bridge.origin,
      targets: bridge.targets,
      category: "traffic:bridge-flow",
      impactScore: urgency.score,
      urgency: urgency.urgency,
      window,
      requestedActions: [
        `Heavy bridge volume (~${count} crossings/hr) on ${bridge.name}. Consider alternate routes.`,
      ],
      notes: `${bridge.name} counts ${count} at ${window}`,
    }).catch((err) => console.error("Failed to post traffic relay", err));
    posted += 1;
  }

  console.log(`Posted ${posted} traffic relays.`);
})();

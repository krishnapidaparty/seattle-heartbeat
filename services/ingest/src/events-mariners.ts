#!/usr/bin/env tsx

import { postRelay } from "./postRelay";

const TEAM_ID = 136; // Seattle Mariners
const VENUE_SO_DO = ["T-Mobile Park", "Lumen Field", "Climate Pledge Arena"];

function targetsForVenue(name: string) {
  if (/t-mobile park|lumen field/i.test(name)) {
    return ["SoDo", "Downtown"];
  }
  if (/climate pledge|seattle center/i.test(name)) {
    return ["QueenAnne", "Downtown"];
  }
  return ["Downtown"];
}

(async () => {
  const start = new Date();
  const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${TEAM_ID}&startDate=${startStr}&endDate=${endStr}`;

  console.log("Fetching Mariners schedule…");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MLB API failed ${res.status}`);
  const data = await res.json();

  const dates = data.dates ?? [];
  let posted = 0;
  for (const date of dates) {
    for (const game of date.games ?? []) {
      if (game.seriesDescription === "Spring Training") continue;
      const venueName = game.venue?.name ?? "Seattle";
      const isHome = game.teams?.home?.team?.id === TEAM_ID;
      if (!isHome) continue;

      const gameTime = game.gameDate;
      const opponents = game.teams?.away?.team?.name ?? "Opponent";
      const id = `event-${game.gamePk}`;
      const targets = targetsForVenue(venueName);

      await postRelay({
        id,
        origin: targets[0],
        targets,
        category: `event:mariners-game`,
        impactScore: 0.6,
        urgency: "normal",
        window: `${gameTime}`,
        requestedActions: [
          `Expect heavy traffic around ${venueName}. Transit recommended.`,
        ],
        notes: `${opponents} at Mariners — ${new Date(gameTime).toLocaleString()}`,
      });
      posted += 1;
    }
  }


  console.log(`Posted ${posted} Mariners events.`);
})();

#!/usr/bin/env tsx

import { closestNeighborhood } from "./neighborhoods";
import { postRelay } from "./postRelay";
import { XMLParser } from "fast-xml-parser";

const RSS_URL = "https://spdblotter.seattle.gov/feed/";

function conditionFromTitle(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("shots") || lower.includes("shooting")) return "shots-fired";
  if (lower.includes("robbery") || lower.includes("carjacking")) return "robbery";
  if (lower.includes("assault")) return "assault";
  if (lower.includes("burglary") || lower.includes("prowler")) return "burglary";
  return "incident";
}

(async () => {
  console.log("Fetching SPD Blotter RSS…");
  const res = await fetch(RSS_URL);
  if (!res.ok) throw new Error(`SPD RSS failed: ${res.status}`);
  const xml = await res.text();

  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const items: any[] = doc?.rss?.channel?.item ? (Array.isArray(doc.rss.channel.item) ? doc.rss.channel.item : [doc.rss.channel.item]) : [];
  const now = Date.now();
  let posted = 0;

  for (const item of items.slice(0, 5)) {
    const title = item.title ?? "SPD Incident";
    const pubDate: string | undefined = item.pubDate || item["dc:date"];
    const link: string | undefined = item.link || item["atom:link"]?.["@_href"];
    const description: string = item.description ?? "";

    const publishedTs = pubDate ? Date.parse(pubDate) : null;
    if (publishedTs && now - publishedTs > 7 * 24 * 60 * 60 * 1000) continue;

    const locationMatch = description.match(/(?:near|at) ([A-Za-z ]+,? [A-Za-z ]+)/i);
    const location = locationMatch ? locationMatch[1] : "Seattle";

    const hoodId = (() => {
      const lower = location.toLowerCase();
      if (lower.includes("ballard")) return "Ballard";
      if (lower.includes("sodo")) return "SoDo";
      if (lower.includes("queen anne")) return "QueenAnne";
      if (lower.includes("capitol hill") || lower.includes("first hill")) return "CapitolHill";
      if (lower.includes("west seattle")) return "WestSeattle";
      return "Downtown";
    })();

    const condition = conditionFromTitle(title);

    await postRelay({
      id: `spd-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      origin: hoodId,
      targets: [hoodId],
      category: `crime:${condition}`,
      impactScore: condition === "shots-fired" ? 0.9 : 0.65,
      urgency: condition === "shots-fired" ? "urgent" : "normal",
      window: pubDate ?? "today",
      requestedActions: [
        condition === "shots-fired"
          ? "Stay indoors until SPD clears the area and expect police activity."
          : "Expect police presence; report suspicious activity to SPD."
      ],
      notes: link ? `${title} — ${link}` : title,
    }).catch((err) => console.error("Failed to post SPD relay", err));
    posted += 1;
  }

  console.log(`Posted ${posted} SPD blotter relays.`);
})();

export type Neighborhood = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: "Downtown", name: "Downtown", lat: 47.6062, lon: -122.3321 },
  { id: "SoDo", name: "SoDo", lat: 47.5901, lon: -122.3344 },
  { id: "CapitolHill", name: "Capitol Hill", lat: 47.6231, lon: -122.3207 },
  { id: "Ballard", name: "Ballard", lat: 47.6687, lon: -122.3847 },
  { id: "QueenAnne", name: "Queen Anne", lat: 47.6372, lon: -122.3560 },
  { id: "WestSeattle", name: "West Seattle", lat: 47.5625, lon: -122.3860 },
];

export function closestNeighborhood(lat: number, lon: number) {
  let best = NEIGHBORHOODS[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const hood of NEIGHBORHOODS) {
    const dLat = lat - hood.lat;
    const dLon = lon - hood.lon;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < bestDist) {
      best = hood;
      bestDist = dist;
    }
  }
  return best;
}

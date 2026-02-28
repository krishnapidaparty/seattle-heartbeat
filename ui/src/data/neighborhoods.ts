export type NeighborhoodInfo = {
  id: string;
  name: string;
  description: string;
  personas: string[];
  lat: number;
  lon: number;
};

export const NEIGHBORHOODS: NeighborhoodInfo[] = [
  {
    id: "Downtown",
    name: "Downtown",
    description: "Commercial core, office commuters, tourist foot traffic",
    personas: ["commuters", "tourists"],
    lat: 47.6062,
    lon: -122.3321,
  },
  {
    id: "SoDo",
    name: "SoDo",
    description: "Stadium district + industrial corridor",
    personas: ["game-day", "logistics"],
    lat: 47.5901,
    lon: -122.3344,
  },
  {
    id: "CapitolHill",
    name: "Capitol Hill",
    description: "Dense residential + nightlife",
    personas: ["residents", "nightlife"],
    lat: 47.6231,
    lon: -122.3207,
  },
  {
    id: "Ballard",
    name: "Ballard",
    description: "Mixed residential + maritime",
    personas: ["families", "maritime"],
    lat: 47.6687,
    lon: -122.3847,
  },
  {
    id: "QueenAnne",
    name: "Queen Anne",
    description: "Residential hill + Seattle Center",
    personas: ["families", "events"],
    lat: 47.6372,
    lon: -122.356,
  },
  {
    id: "WestSeattle",
    name: "West Seattle",
    description: "Peninsula neighborhoods reachable via bridge",
    personas: ["commuters", "families"],
    lat: 47.5625,
    lon: -122.386,
  },
];

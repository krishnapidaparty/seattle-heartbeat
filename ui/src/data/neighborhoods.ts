export type NeighborhoodInfo = {
  id: string;
  name: string;
  description: string;
  personas: string[];
};

export const NEIGHBORHOODS: NeighborhoodInfo[] = [
  {
    id: "Downtown",
    name: "Downtown",
    description: "Commercial core, office commuters, tourist foot traffic",
    personas: ["commuters", "tourists"]
  },
  {
    id: "SoDo",
    name: "SoDo",
    description: "Stadium district + industrial corridor",
    personas: ["game-day", "logistics"]
  },
  {
    id: "CapitolHill",
    name: "Capitol Hill",
    description: "Dense residential + nightlife",
    personas: ["residents", "nightlife"]
  },
  {
    id: "Ballard",
    name: "Ballard",
    description: "Mixed residential + maritime",
    personas: ["families", "maritime"]
  },
  {
    id: "QueenAnne",
    name: "Queen Anne",
    description: "Residential hill + Seattle Center",
    personas: ["families", "events"]
  },
  {
    id: "WestSeattle",
    name: "West Seattle",
    description: "Peninsula neighborhoods reachable via bridge",
    personas: ["commuters", "families"]
  }
];

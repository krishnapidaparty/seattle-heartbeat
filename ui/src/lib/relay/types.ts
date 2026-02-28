export type RelayStatus =
  | "detected"
  | "queued"
  | "acknowledged"
  | "in_action"
  | "resolved";

export interface RelayPacket {
  id: string;
  origin: string;
  targets: string[];
  category: string;
  impactScore: number;
  urgency: "normal" | "urgent";
  window: string;
  requestedActions: string[];
  status: RelayStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type RelayEvent =
  | { type: "relay.created"; data: RelayPacket }
  | { type: "relay.updated"; data: RelayPacket }
  | { type: "relay.deleted"; data: RelayPacket }
  | { type: "relay.snapshot"; data: RelayPacket[] };

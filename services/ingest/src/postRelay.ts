const RELAY_BASE_URL =
  process.env.RELAY_BASE_URL ?? "http://localhost:4001";

export interface RelayPayload {
  id?: string;
  origin: string;
  targets: string[];
  category: string;
  impactScore: number;
  urgency: "normal" | "urgent";
  window: string;
  requestedActions: string[];
  notes?: string;
}

export async function postRelay(payload: RelayPayload) {
  const res = await fetch(`${RELAY_BASE_URL.replace(/\/$/, "")}/relay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Relay POST failed: ${res.status} ${body}`);
  }

  return res.json();
}

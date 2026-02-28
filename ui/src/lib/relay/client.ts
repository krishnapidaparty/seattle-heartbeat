import { RelayEvent, RelayPacket } from "./types";

const DEFAULT_BASE_URL = "http://localhost:4001";

export function getRelayBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_RELAY_SERVICE_URL?.replace(/\/$/, "") ||
    DEFAULT_BASE_URL
  );
}

export async function fetchRelays(): Promise<RelayPacket[]> {
  const res = await fetch(`${getRelayBaseUrl()}/relay`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Failed to load relays: ${res.status}`);
  }

  return (await res.json()) as RelayPacket[];
}

export function openRelaySocket(onEvent: (event: RelayEvent) => void) {
  const base = getRelayBaseUrl();
  const wsUrl = base.replace(/^http/, "ws");
  const socket = new WebSocket(`${wsUrl}/ws`);

  socket.addEventListener("message", (msg) => {
    try {
      const data = JSON.parse(msg.data) as RelayEvent;
      if (data?.type) {
        onEvent(data);
      }
    } catch (err) {
      console.error("relay ws parse error", err);
    }
  });

  return socket;
}

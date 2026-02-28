"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchRelays, openRelaySocket } from "@/lib/relay/client";
import { RelayEvent, RelayPacket } from "@/lib/relay/types";

interface RelayContextValue {
  relays: RelayPacket[];
  isLoading: boolean;
  error?: string;
  lastUpdated?: string;
}

const RelayContext = createContext<RelayContextValue | undefined>(undefined);

export function RelayProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [relays, setRelays] = useState<RelayPacket[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [lastUpdated, setLastUpdated] = useState<string>();
  const socketRef = useRef<WebSocket | null>(null);

  const handleEvent = useCallback((event: RelayEvent) => {
    setRelays((current) => {
      switch (event.type) {
        case "relay.created":
          return [event.data, ...current.filter((r) => r.id !== event.data.id)];
        case "relay.updated":
          return current.map((r) => (r.id === event.data.id ? event.data : r));
        case "relay.deleted":
          return current.filter((r) => r.id !== event.data.id);
        case "relay.snapshot":
          return event.data;
        default:
          return current;
      }
    });
    setLastUpdated(new Date().toISOString());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchRelays();
        if (!cancelled) {
          setRelays(data);
          setLastUpdated(new Date().toISOString());
          setError(undefined);
        }
      } catch (err) {
        console.error("relay fetch failed", err);
        if (!cancelled) setError("Unable to reach relay service");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const socket = openRelaySocket((event) => handleEvent(event));
    socketRef.current = socket;

    socket.addEventListener("open", () => setError(undefined));
    socket.addEventListener("close", () => {
      setTimeout(() => {
        if (!cancelled) load();
      }, 2000);
    });

    return () => {
      cancelled = true;
      socket.close();
    };
  }, [handleEvent]);

  const value = useMemo(
    () => ({ relays, isLoading, error, lastUpdated }),
    [relays, isLoading, error, lastUpdated],
  );

  return <RelayContext.Provider value={value}>{children}</RelayContext.Provider>;
}

export function useRelayContext() {
  const ctx = useContext(RelayContext);
  if (!ctx) {
    throw new Error("useRelayContext must be used within RelayProvider");
  }
  return ctx;
}

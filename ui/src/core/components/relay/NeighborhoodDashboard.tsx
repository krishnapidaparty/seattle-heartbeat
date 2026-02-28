"use client";

import { useMemo } from "react";
import { useRelayContext } from "@/core/providers/RelayContext";
import { NEIGHBORHOODS } from "@/data/neighborhoods";
import { RelayPacket } from "@/lib/relay/types";
import { RelayFeedPanel } from "./RelayFeedPanel";

type StatusLevel = "normal" | "elevated" | "critical";

function determineStatus(hoodId: string, relays: RelayPacket[]): StatusLevel {
  const active = relays.filter((relay) => relay.status !== "resolved");
  const relevant = active.filter(
    (relay) => relay.origin === hoodId || relay.targets.includes(hoodId),
  );

  if (relevant.some((r) => r.urgency === "urgent" || r.impactScore >= 0.8)) {
    return "critical";
  }
  if (relevant.length > 0) {
    return "elevated";
  }
  return "normal";
}

function statusLabel(level: StatusLevel) {
  switch (level) {
    case "critical":
      return {
        label: "Critical",
        badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
      };
    case "elevated":
      return {
        label: "Elevated",
        badge:
          "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
      };
    default:
      return {
        label: "Normal",
        badge:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
      };
  }
}

export function NeighborhoodDashboard() {
  const { relays, isLoading } = useRelayContext();

  const neighborhoods = useMemo(() => {
    return NEIGHBORHOODS.map((hood) => {
      const status = determineStatus(hood.id, relays);
      const impactingRelays = relays
        .filter(
          (relay) =>
            relay.status !== "resolved" &&
            (relay.origin === hood.id || relay.targets.includes(hood.id)),
        )
        .slice(0, 3);
      return { ...hood, status, impactingRelays };
    });
  }, [relays]);

  return (
    <div className="flex h-full flex-col gap-6 bg-background">
      <header className="border-b border-foreground/10 px-6 py-4">
        <p className="text-xs uppercase tracking-wide text-foreground/40">
          Seattle Heartbeat
        </p>
        <h1 className="text-2xl font-semibold">Neighborhood Overview</h1>
        <p className="text-sm text-foreground/50">
          Live signals across six priority neighborhoods. Status updates every
          few minutes from weather, events, and incidents.
        </p>
      </header>

      <div className="flex flex-1 gap-6 px-6 pb-6">
        <section className="flex-1 overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {neighborhoods.map((hood) => {
              const { label, badge } = statusLabel(hood.status);
              return (
                <article
                  key={hood.id}
                  className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold">{hood.name}</h2>
                      <p className="text-xs text-foreground/50">
                        {hood.description}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge}`}
                    >
                      {label}
                    </span>
                  </div>

                  {hood.impactingRelays.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-xs text-foreground/70">
                      {hood.impactingRelays.map((relay) => (
                        <li key={`${hood.id}-${relay.id}`} className="rounded-lg bg-background/80 p-2">
                          <p className="font-medium">
                            {relay.category.replace("weather:", "").replace(/-/g, " ")}
                          </p>
                          <p className="text-foreground/50">
                            {relay.notes || relay.requestedActions[0]}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs text-foreground/40">
                      {isLoading
                        ? "Checking signals…"
                        : "No active relays impacting this area."}
                    </p>
                  )}

                  <p className="mt-3 text-[11px] uppercase tracking-wide text-foreground/30">
                    Personas: {hood.personas.join(", ")}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="w-96 shrink-0">
          <RelayFeedPanel />
        </aside>
      </div>
    </div>
  );
}

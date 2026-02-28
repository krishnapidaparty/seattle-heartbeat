"use client";

import { useMemo } from "react";
import { useRelayContext } from "@/core/providers/RelayContext";
import { RelayPacket } from "@/lib/relay/types";

function formatTimestamp(iso?: string) {
  if (!iso) return "--";
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusBadge(status: RelayPacket["status"]) {
  switch (status) {
    case "resolved":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20";
    case "in_action":
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/20";
    case "acknowledged":
      return "bg-sky-100 text-sky-800 dark:bg-sky-500/20";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-700/40";
  }
}

export function RelayFeedPanel() {
  const { relays, isLoading, error, lastUpdated } = useRelayContext();

  const ordered = useMemo(
    () =>
      [...relays].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [relays],
  );

  return (
    <div className="flex w-96 shrink-0 flex-col rounded-2xl border border-foreground/10 bg-background/70 p-4 backdrop-blur">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">Relay Feed</p>
          <p className="text-xs text-foreground/40">
            {isLoading ? "syncing…" : `Updated ${formatTimestamp(lastUpdated)}`}
          </p>
        </div>
        {error ? (
          <span className="text-xs text-red-500">{error}</span>
        ) : null}
      </div>

      <div className="mt-3 space-y-3 overflow-y-auto">
        {ordered.length === 0 && !isLoading ? (
          <p className="text-xs text-foreground/40">
            No relay packets yet. Trigger a seed to see activity.
          </p>
        ) : (
          ordered.slice(0, 8).map((relay) => (
            <article
              key={relay.id}
              className="rounded-xl border border-foreground/10 p-3 text-sm"
            >
              <div className="flex items-center justify-between text-xs font-medium">
                <span>{relay.origin} → {relay.targets.join(", ")}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge(relay.status)}`}
                >
                  {relay.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-1 text-xs text-foreground/60">
                {relay.category} · urgency {relay.urgency}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-foreground/70">
                {relay.requestedActions.map((action) => (
                  <li key={action} className="flex items-start gap-1">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-foreground/30" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
              {relay.notes ? (
                <p className="mt-2 text-xs text-foreground/50">{relay.notes}</p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}

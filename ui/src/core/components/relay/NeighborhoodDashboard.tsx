"use client";

import { useMemo } from "react";
import { useRelayContext } from "@/core/providers/RelayContext";
import { NEIGHBORHOODS } from "@/data/neighborhoods";
import { useWeatherConditions } from "@/hooks/useWeatherConditions";
import { RelayPacket } from "@/lib/relay/types";
import { RelayFeedPanel } from "./RelayFeedPanel";

type StatusLevel = "normal" | "elevated" | "critical";
type FeedKey = "weather" | "fire" | "crime" | "traffic";

const FEED_TYPES: { key: FeedKey; label: string }[] = [
  { key: "weather", label: "Weather" },
  { key: "fire", label: "Fire / 911" },
  { key: "crime", label: "SPD" },
  { key: "traffic", label: "Transit & Traffic" },
];

export function NeighborhoodDashboard() {
  const { relays } = useRelayContext();
  const { conditions: weatherConditions, error: weatherError } = useWeatherConditions();

  const neighborhoods = useMemo(() => {
    return NEIGHBORHOODS.map((hood) => {
      const status = determineStatus(hood.id, relays);
      return { ...hood, status };
    });
  }, [relays]);

  const citySummary = summarizeRelays(relays);

  return (
    <div className="flex h-full flex-col gap-6 bg-gradient-to-b from-white via-slate-50 to-white px-6 pb-6">
      <header className="pt-6">
        <p className="text-xs uppercase tracking-[0.6em] text-foreground/40">
          Live board · Updated in seconds
        </p>
        <h1 className="mt-2 text-4xl font-extrabold text-foreground">
          Seattle Heartbeat
        </h1>
        <p className="mt-3 max-w-3xl text-base text-foreground/60">
          Hyperlocal weather, civic signals, and mobility stress for Seattle’s core neighborhoods.
          Tap a tile to see the feeds powering @copilot and @clawpilot in the build session.
        </p>
      </header>

      <CitySummary summary={citySummary} />

      <div className="flex flex-1 gap-6">
        <section className="flex-1 overflow-y-auto space-y-4">
          <div className="grid gap-4 lg:grid-cols-3 sm:grid-cols-2">
            {neighborhoods.map((hood) => (
              <NeighborhoodCard
                key={hood.id}
                hoodId={hood.id}
                name={hood.name}
                description={hood.description}
                status={hood.status}
                relays={relays}
                weather={weatherConditions[hood.id]}
                weatherError={weatherError}
              />
            ))}
          </div>
        </section>

        <aside className="w-96 shrink-0">
          <RelayFeedPanel />
        </aside>
      </div>
    </div>
  );
}

function NeighborhoodCard({
  hoodId,
  name,
  description,
  status,
  relays,
  weather,
  weatherError,
}: {
  hoodId: string;
  name: string;
  description: string;
  status: StatusLevel;
  relays: RelayPacket[];
  weather?: { temperatureC: number | null; humidity: number | null; windKmh: number | null };
  weatherError?: string;
}) {
  const accent = tileAccent(status);
  const headline = tileHeadline(hoodId, relays);

  return (
    <article
      className={`rounded-3xl border p-5 shadow-sm transition hover:shadow-md ${accent.container}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/40">{description}</p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground">{name}</h2>
          <p className="mt-2 text-sm text-foreground/60">
            {weather
              ? `${formatNumber(weather.temperatureC)}°C · ${formatNumber(weather.humidity)}% humidity · ${formatNumber(weather.windKmh)} km/h winds`
              : weatherError ?? "Loading weather…"}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accent.badge}`}>
          {statusLabel(status)}
        </span>
      </div>

      <p className="mt-4 rounded-2xl bg-white/70 p-3 text-sm leading-relaxed text-foreground/70">
        {headline}
      </p>

      <div className="mt-4 grid gap-2 text-[11px] lg:grid-cols-4 sm:grid-cols-2">
        {FEED_TYPES.map(({ key, label }) => {
          const summary = feedSummary(key, hoodId, relays);
          return (
            <div key={key} className={`rounded-2xl px-3 py-2 ${tileAccent(summary.level).panel}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground/60">
                {label}
              </p>
              <p className="mt-1 text-xs leading-snug text-foreground/70">{summary.text}</p>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function CitySummary({
  summary,
}: {
  summary: { message: string; stats: { label: string; value: string }[] };
}) {
  return (
    <div className="rounded-3xl border bg-white/60 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">City snapshot</p>
          <p className="mt-2 text-lg text-foreground/80">{summary.message}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {summary.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900">
              {stat.value} <span className="text-emerald-600">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function determineStatus(hoodId: string, relays: RelayPacket[]): StatusLevel {
  const active = relays.filter(
    (relay) => relay.status !== "resolved" && (relay.origin === hoodId || relay.targets.includes(hoodId)),
  );
  if (active.some((relay) => relay.urgency === "urgent" || relay.impactScore >= 0.8)) return "critical";
  if (active.length > 0) return "elevated";
  return "normal";
}

function tileHeadline(hoodId: string, relays: RelayPacket[]) {
  const relevant = relays
    .filter((relay) => relay.status !== "resolved" && (relay.origin === hoodId || relay.targets.includes(hoodId)))
    .sort((a, b) => (a.urgency === "urgent" ? -1 : 1));
  if (!relevant.length) return "All clear. No active civic or weather signals.";
  const relay = relevant[0];
  const dateLabel = formatDateLabel(relay.window);
  const base = relay.notes || relay.requestedActions?.[0] || relay.category;
  return `${dateLabel ? `${dateLabel} · ` : ""}${base}`;
}

function feedSummary(feed: FeedKey, hoodId: string, relays: RelayPacket[]) {
  const prefix =
    feed === "crime" ? "crime:" : feed === "fire" ? "fire:" : feed === "traffic" ? "traffic:" : "weather:";
  const relevant = relays.filter(
    (relay) =>
      relay.status !== "resolved" &&
      (relay.origin === hoodId || relay.targets.includes(hoodId)) &&
      relay.category.startsWith(prefix),
  );
  if (!relevant.length) return { level: "normal" as StatusLevel, text: "All clear" };
  const hasCritical = relevant.some((r) => r.urgency === "urgent" || r.impactScore >= 0.8);
  const latest = relevant[0];
  const dateLabel = formatDateLabel(latest.window);
  const text = latest.notes || latest.requestedActions?.[0] || latest.category;
  return {
    level: hasCritical ? "critical" : "elevated",
    text: `${dateLabel ? `${dateLabel} — ` : ""}${text}`,
  };
}

function summarizeRelays(relays: RelayPacket[]) {
  const total = relays.length;
  const urgent = relays.filter((r) => r.urgency === "urgent").length;
  const byFeed: Record<FeedKey, number> = { weather: 0, fire: 0, crime: 0, traffic: 0 };
  relays.forEach((relay) => {
    const match = FEED_TYPES.find(({ key }) => relay.category.startsWith(key === "traffic" ? "traffic:" : `${key}:`));
    if (match) byFeed[match.key] += 1;
  });

  const busiest = Object.entries(byFeed)
    .sort((a, b) => b[1] - a[1])
    .find(([, count]) => count > 0);

  const message = busiest
    ? `${busiest[1]} active ${busiest[0]} alerts; ${urgent} flagged urgent.`
    : "City is calm across all feeds.";

  return {
    message,
    stats: [
      { label: "active relays", value: total.toString() },
      { label: "urgent", value: urgent.toString() },
      { label: "weather", value: byFeed.weather.toString() },
      { label: "fire", value: byFeed.fire.toString() },
      { label: "SPD", value: byFeed.crime.toString() },
      { label: "traffic", value: byFeed.traffic.toString() },
    ],
  };
}

function tileAccent(level: StatusLevel) {
  switch (level) {
    case "critical":
      return {
        container: "border-red-200 bg-red-50/80",
        badge: "bg-red-500/20 text-red-700",
        panel: "bg-white/70 text-red-800",
      };
    case "elevated":
      return {
        container: "border-amber-200 bg-amber-50/70",
        badge: "bg-amber-500/20 text-amber-700",
        panel: "bg-white/80 text-amber-800",
      };
    default:
      return {
        container: "border-emerald-100 bg-white",
        badge: "bg-emerald-500/20 text-emerald-700",
        panel: "bg-emerald-50 text-emerald-800",
      };
  }
}

function statusLabel(level: StatusLevel) {
  if (level === "critical") return "Critical";
  if (level === "elevated") return "Elevated";
  return "Normal";
}

function formatDateLabel(window?: string) {
  if (!window) return "";
  const parsed = Date.parse(window);
  if (Number.isNaN(parsed)) return window;
  return new Date(parsed).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  return Math.round(value).toString();
}

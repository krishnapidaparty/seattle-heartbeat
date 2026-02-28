#!/usr/bin/env tsx

import { NEIGHBORHOODS } from "./neighborhoods";
import { postRelay } from "./postRelay";

const API_BASE = "https://api.open-meteo.com/v1/forecast";

interface CurrentWeatherResponse {
  current?: {
    time: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
  };
}

type ConditionResult = {
  condition: string;
  notes: string;
  requestedActions: string[];
  impactScore: number;
  urgency: "normal" | "urgent";
};

function evaluateConditions(
  hoodId: string,
  weather: CurrentWeatherResponse,
): ConditionResult[] {
  const out: ConditionResult[] = [];
  const current = weather.current ?? {};
  const temp = current.temperature_2m ?? null; // °C
  const humidity = current.relative_humidity_2m ?? null; // %
  const wind = current.wind_speed_10m ?? null; // km/h

  if (wind !== null && wind >= 45) {
    out.push({
      condition: "high-wind",
      notes: `Winds around ${wind} km/h near ${hoodId}`,
      requestedActions: [
        "Secure outdoor items, expect tree debris, and use extra caution on bridges.",
      ],
      impactScore: wind >= 60 ? 0.75 : 0.6,
      urgency: wind >= 60 ? "urgent" : "normal",
    });
  }

  if (temp !== null && humidity !== null && humidity >= 90 && temp <= 2) {
    out.push({
      condition: "slick-roads",
      notes: `Cold + high humidity (${temp}°C / ${humidity}%) may create slick streets in ${hoodId}.`,
      requestedActions: [
        "Leave extra stopping distance and watch for black ice near shaded blocks.",
      ],
      impactScore: 0.55,
      urgency: "normal",
    });
  }

  if (temp !== null && temp >= 32) {
    out.push({
      condition: "heat",
      notes: `Temperature around ${temp}°C in ${hoodId}.`,
      requestedActions: [
        "Stay hydrated, limit strenuous activity, and check on neighbors/pets.",
      ],
      impactScore: temp >= 35 ? 0.8 : 0.65,
      urgency: temp >= 35 ? "urgent" : "normal",
    });
  }

  return out;
}

async function fetchCurrentWeather(lat: number, lon: number) {
  const url = `${API_BASE}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed ${res.status}`);
  }
  return (await res.json()) as CurrentWeatherResponse;
}

(async () => {
  console.log("Fetching Open-Meteo current conditions…");
  let posted = 0;

  for (const hood of NEIGHBORHOODS) {
    try {
      const weather = await fetchCurrentWeather(hood.lat, hood.lon);
      const conditions = evaluateConditions(hood.id, weather);
      for (const condition of conditions) {
        await postRelay({
          id: `wx-${hood.id}-${condition.condition}`,
          origin: hood.id,
          targets: [hood.id],
          category: `weather:${condition.condition}`,
          impactScore: condition.impactScore,
          urgency: condition.urgency,
          window: `${weather.current?.time ?? "now"} → +1h`,
          requestedActions: condition.requestedActions,
          notes: condition.notes,
        });
        posted += 1;
      }
    } catch (err) {
      console.error(`Failed to fetch weather for ${hood.name}`, err);
    }
  }

  console.log(`Weather condition ingest complete. Posted ${posted} relays.`);
})();

"use client";

import { useEffect, useState } from "react";
import { NEIGHBORHOODS } from "@/data/neighborhoods";
import { fetchConditions, WeatherConditions } from "@/lib/weather/getConditions";

export type WeatherByNeighborhood = Record<string, WeatherConditions>;

export function useWeatherConditions(refreshMs = 5 * 60 * 1000) {
  const [conditions, setConditions] = useState<WeatherByNeighborhood>({});
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    async function loadOnce() {
      setLoading(true);
      try {
        const entries = await Promise.all(
          NEIGHBORHOODS.map(async (hood) => {
            try {
              const result = await fetchConditions(hood.lat, hood.lon);
              return [hood.id, result] as const;
            } catch (err) {
              console.error("weather fetch failed", hood.id, err);
              return [hood.id, null] as const;
            }
          }),
        );
        if (!cancelled) {
          const map: WeatherByNeighborhood = {};
          entries.forEach(([id, result]) => {
            if (result) map[id] = result;
          });
          setConditions(map);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) setError("Unable to load weather conditions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOnce();
    const interval = setInterval(loadOnce, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refreshMs]);

  return { conditions, isLoading, error };
}

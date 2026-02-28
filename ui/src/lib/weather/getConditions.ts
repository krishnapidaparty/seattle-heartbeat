export type WeatherConditions = {
  temperatureC: number | null;
  humidity: number | null;
  windKmh: number | null;
  time?: string;
};

const API_BASE = "https://api.open-meteo.com/v1/forecast";

export async function fetchConditions(lat: number, lon: number) {
  const url = `${API_BASE}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo error ${res.status}`);
  const data = await res.json();
  const current = data.current ?? {};
  const temp = typeof current.temperature_2m === "number" ? current.temperature_2m : null;
  const humidity =
    typeof current.relative_humidity_2m === "number"
      ? current.relative_humidity_2m
      : null;
  const wind =
    typeof current.wind_speed_10m === "number"
      ? current.wind_speed_10m
      : null;
  return {
    temperatureC: temp,
    humidity,
    windKmh: wind,
    time: current.time,
  } satisfies WeatherConditions;
}

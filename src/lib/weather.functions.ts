import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  city: z.string().trim().min(1).max(80),
  country: z.string().trim().max(80).optional().default(""),
});

export type WeatherResult = {
  place: string;
  country: string;
  description: string;
  main: string;
  icon: string;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  clouds: number;
  visibility: number | null;
  sunrise: number | null;
  sunset: number | null;
  timezone: number;
  lat: number;
  lon: number;
};

export const getWeather = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<WeatherResult> => {
    const apiKey = process.env["OPENWEATHER_API_KEY"];
    if (!apiKey) throw new Error("Weather service is not configured.");

    const query = [data.city, data.country].filter(Boolean).join(",");
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      query,
    )}&units=metric&APPID=${apiKey}`;

    const res = await fetch(url);
    if (res.status === 404) {
      throw new Error("We couldn't find that place. Check the city and country spelling.");
    }
    if (!res.ok) {
      throw new Error("The weather service is unavailable right now. Please try again.");
    }

    const json = (await res.json()) as any;

    return {
      place: json.name ?? data.city,
      country: json.sys?.country ?? data.country,
      description: json.weather?.[0]?.description ?? "unknown",
      main: json.weather?.[0]?.main ?? "Unknown",
      icon: json.weather?.[0]?.icon ?? "01d",
      temp: Math.round(json.main?.temp ?? 0),
      feelsLike: Math.round(json.main?.feels_like ?? 0),
      tempMin: Math.round(json.main?.temp_min ?? 0),
      tempMax: Math.round(json.main?.temp_max ?? 0),
      humidity: json.main?.humidity ?? 0,
      pressure: json.main?.pressure ?? 0,
      windSpeed: Math.round((json.wind?.speed ?? 0) * 3.6),
      clouds: json.clouds?.all ?? 0,
      visibility: typeof json.visibility === "number" ? json.visibility : null,
      sunrise: json.sys?.sunrise ?? null,
      sunset: json.sys?.sunset ?? null,
      timezone: json.timezone ?? 0,
      lat: json.coord?.lat ?? 0,
      lon: json.coord?.lon ?? 0,
    };
  });

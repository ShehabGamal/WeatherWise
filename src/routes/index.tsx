import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  Search,
  Loader2,
  Shirt,
  Bus,
  MapPin,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  CloudSun,
} from "lucide-react";

import { getWeather, type WeatherResult } from "@/lib/weather.functions";
import { buildRecommendations, type Recommendation } from "@/lib/recommendations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkyGuide — Weather with Local Travel Tips" },
      {
        name: "description",
        content:
          "Enter any city and country to see live weather plus tailored clothing, transport and destination recommendations.",
      },
      { property: "og:title", content: "SkyGuide — Weather with Local Travel Tips" },
      {
        property: "og:description",
        content:
          "Live weather for any city with smart clothing, transport and sightseeing recommendations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function formatTime(unix: number | null, tzOffset: number) {
  if (!unix) return "—";
  const d = new Date((unix + tzOffset) * 1000);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-panel flex min-w-0 items-center gap-3 rounded-xl px-3 py-3">
      <span className="shrink-0 text-primary">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="block truncate text-sm font-semibold">{value}</span>
      </span>
    </div>
  );
}

function RecoCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: Recommendation[];
}) {
  return (
    <section className="glass-panel rounded-2xl p-5">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold sm:text-lg">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          {icon}
        </span>
        <span className="truncate">{title}</span>
      </h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.title} className="min-w-0">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Index() {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const fetchWeather = useServerFn(getWeather);

  const mutation = useMutation<WeatherResult, Error, { city: string; country: string }>({
    mutationFn: (vars) => fetchWeather({ data: vars }),
  });

  const weather = mutation.data;
  const reco = weather ? buildRecommendations(weather) : null;

  return (
    <main className="sky-canvas min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <CloudSun className="h-4 w-4 text-primary" /> SkyGuide
          </p>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">
            Weather, and what to do about it
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Type a city and country to get live conditions plus what to wear, how to get around and
            where to go.
          </p>
        </header>

        <form
          className="mx-auto mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!city.trim()) return;
            mutation.mutate({ city: city.trim(), country: country.trim() });
          }}
        >
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (e.g. Cairo)"
            aria-label="City"
            className="glass-panel w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country (optional, e.g. EG)"
            aria-label="Country"
            className="glass-panel w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Get weather
          </button>
        </form>

        {mutation.isError && (
          <p className="mx-auto mt-5 max-w-2xl rounded-xl border border-destructive/40 bg-destructive/15 px-4 py-3 text-center text-sm">
            {mutation.error.message}
          </p>
        )}

        {weather && reco && (
          <div className="mt-10 space-y-6">
            <section className="glass-panel rounded-3xl p-6 sm:p-8">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-bold sm:text-3xl">
                    {weather.place}
                    {weather.country ? `, ${weather.country}` : ""}
                  </h2>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">
                    {weather.description} · feels like {weather.feelsLike}°C
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt={weather.description}
                    className="h-16 w-16"
                    loading="lazy"
                  />
                  <span className="text-4xl font-bold sm:text-5xl">{weather.temp}°</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <Metric
                  icon={<Droplets className="h-5 w-5" />}
                  label="Humidity"
                  value={`${weather.humidity}%`}
                />
                <Metric
                  icon={<Wind className="h-5 w-5" />}
                  label="Wind"
                  value={`${weather.windSpeed} km/h`}
                />
                <Metric
                  icon={<Gauge className="h-5 w-5" />}
                  label="Pressure"
                  value={`${weather.pressure} hPa`}
                />
                <Metric
                  icon={<Eye className="h-5 w-5" />}
                  label="Visibility"
                  value={
                    weather.visibility === null ? "—" : `${(weather.visibility / 1000).toFixed(1)} km`
                  }
                />
                <Metric
                  icon={<Sunrise className="h-5 w-5" />}
                  label="Sunrise"
                  value={formatTime(weather.sunrise, weather.timezone)}
                />
                <Metric
                  icon={<Sunset className="h-5 w-5" />}
                  label="Sunset"
                  value={formatTime(weather.sunset, weather.timezone)}
                />
                <Metric
                  icon={<CloudSun className="h-5 w-5" />}
                  label="Cloud cover"
                  value={`${weather.clouds}%`}
                />
                <Metric
                  icon={<MapPin className="h-5 w-5" />}
                  label="Range"
                  value={`${weather.tempMin}° / ${weather.tempMax}°`}
                />
              </div>
            </section>

            <h2 className="text-center text-xl font-semibold sm:text-2xl">{reco.headline}</h2>

            <div className="grid gap-5 md:grid-cols-3">
              <RecoCard
                icon={<Shirt className="h-5 w-5" />}
                title="What to wear"
                items={reco.clothing}
              />
              <RecoCard
                icon={<Bus className="h-5 w-5" />}
                title="Getting around"
                items={reco.transport}
              />
              <RecoCard
                icon={<MapPin className="h-5 w-5" />}
                title="Where to go"
                items={reco.destinations}
              />
            </div>
          </div>
        )}

        {!weather && !mutation.isPending && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Try Cairo, EG · Tokyo, JP · Reykjavik, IS
          </p>
        )}
      </div>
    </main>
  );
}

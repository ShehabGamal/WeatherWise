import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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

import {
  getWeather,
  searchCities,
  type CitySuggestion,
  type WeatherResult,
} from "@/lib/weather.functions";
import { buildRecommendations, type Recommendation } from "@/lib/recommendations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WeatherWise — Weather with Local Travel Tips" },
      {
        name: "description",
        content:
          "Enter any city and country to see live weather plus tailored clothing, transport and destination recommendations.",
      },
      { property: "og:title", content: "WeatherWise — Weather with Local Travel Tips" },
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
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [searching, setSearching] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const fetchWeather = useServerFn(getWeather);
  const fetchCities = useServerFn(searchCities);

  const mutation = useMutation<WeatherResult, Error, { city: string; country: string }>({
    mutationFn: (vars) => fetchWeather({ data: vars }),
  });

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const results = await fetchCities({ data: q });
        setSuggestions(results);
        setOpen(results.length > 0);
        setHighlight(-1);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, fetchCities]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (s: CitySuggestion) => {
    setQuery(s.state ? `${s.name}, ${s.state}, ${s.country}` : `${s.name}, ${s.country}`);
    setOpen(false);
    mutation.mutate({ city: s.name, country: s.country });
  };

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    const [city, ...rest] = q.split(",").map((p) => p.trim());
    setOpen(false);
    mutation.mutate({ city: city ?? q, country: rest.join(", ") });
  };

  const weather = mutation.data;
  const reco = weather ? buildRecommendations(weather) : null;

  return (
    <main className="sky-canvas min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <CloudSun className="h-4 w-4 text-primary" /> WeatherWise
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
          className="mx-auto mt-8 flex w-full max-w-2xl gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (highlight >= 0 && suggestions[highlight]) {
              pick(suggestions[highlight]);
            } else {
              submit();
            }
          }}
        >
          <div ref={boxRef} className="relative min-w-0 flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              onKeyDown={(e) => {
                if (!open) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlight((h) => Math.max(h - 1, -1));
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder="Search a city… (e.g. Cairo)"
              aria-label="City"
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              autoComplete="off"
              className="glass-panel w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            {searching && (
              <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
            {open && (
              <ul
                role="listbox"
                className="glass-panel absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-auto rounded-xl p-1 shadow-lg"
              >
                {suggestions.map((s, i) => (
                  <li key={`${s.name}-${s.country}-${s.state ?? ""}`} role="option" aria-selected={i === highlight}>
                    <button
                      type="button"
                      onClick={() => pick(s)}
                      onMouseEnter={() => setHighlight(i)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        i === highlight ? "bg-primary/15" : ""
                      }`}
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-primary" />
                      <span className="min-w-0 truncate font-medium">{s.name}</span>
                      <span className="min-w-0 truncate text-muted-foreground">
                        {s.state ? `${s.state}, ` : ""}{s.country}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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

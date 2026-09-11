import type { WeatherResult } from "./weather.functions";

export type Recommendation = { title: string; detail: string };

export type Recommendations = {
  clothing: Recommendation[];
  transport: Recommendation[];
  destinations: Recommendation[];
  headline: string;
};

const isWet = (main: string) => ["Rain", "Drizzle", "Thunderstorm", "Snow"].includes(main);

export function buildRecommendations(w: WeatherResult): Recommendations {
  const clothing: Recommendation[] = [];
  const transport: Recommendation[] = [];
  const destinations: Recommendation[] = [];

  // ---- Clothing, driven by temperature ----
  if (w.temp <= 0) {
    clothing.push(
      { title: "Heavy insulated coat", detail: "Down or thermal-lined — it is freezing outside." },
      { title: "Hat, gloves, scarf", detail: "Cover every exposed patch of skin." },
      { title: "Thermal base layers", detail: "Wool or synthetic, never cotton next to the skin." },
    );
  } else if (w.temp <= 10) {
    clothing.push(
      { title: "Warm coat over a sweater", detail: "Layers you can open once you start walking." },
      { title: "Closed shoes with socks", detail: "Keep your feet warm and dry." },
    );
  } else if (w.temp <= 18) {
    clothing.push(
      { title: "Light jacket or hoodie", detail: "Mild now, cooler after sunset." },
      { title: "Long trousers", detail: "Comfortable for a full day outdoors." },
    );
  } else if (w.temp <= 27) {
    clothing.push(
      { title: "T-shirt and light trousers", detail: "Pleasant all day — pack a thin layer for evening." },
      { title: "Comfortable walking shoes", detail: "Perfect weather for covering distance on foot." },
    );
  } else if (w.temp <= 34) {
    clothing.push(
      { title: "Breathable cotton or linen", detail: "Loose, light colours reflect the heat." },
      { title: "Sunglasses and a cap", detail: "Shade your eyes and scalp." },
      { title: "Refillable water bottle", detail: "Drink before you feel thirsty." },
    );
  } else {
    clothing.push(
      { title: "Minimal, very light clothing", detail: "Extreme heat — avoid dark, tight fabrics." },
      { title: "Wide-brim hat and SPF 50", detail: "Stay in shade between 11:00 and 16:00." },
      { title: "Electrolyte drinks", detail: "Water alone is not enough in this heat." },
    );
  }

  if (isWet(w.main)) {
    clothing.push({
      title: w.main === "Snow" ? "Waterproof boots" : "Waterproof jacket and umbrella",
      detail: `Expect ${w.description}.`,
    });
  }
  if (w.windSpeed >= 30) {
    clothing.push({ title: "Windbreaker", detail: `Gusts around ${w.windSpeed} km/h.` });
  }
  if (w.humidity >= 75 && w.temp >= 24) {
    clothing.push({ title: "Moisture-wicking fabrics", detail: `Humidity is ${w.humidity}% — it feels sticky.` });
  }

  // ---- Transport ----
  if (isWet(w.main) || w.windSpeed >= 35) {
    transport.push(
      { title: "Metro, tram or bus", detail: "Covered transport keeps you dry between stops." },
      { title: "Ride-hailing or taxi", detail: "Worth it for short hops in bad weather." },
      { title: "Avoid two wheels", detail: "Wet or windy roads make bikes and scooters risky." },
    );
  } else if (w.temp >= 33) {
    transport.push(
      { title: "Air-conditioned transport", detail: "Skip long waits at open-air stops." },
      { title: "Short walks between shade", detail: "Plan routes with trees, arcades or malls." },
    );
  } else if (w.temp <= 2) {
    transport.push(
      { title: "Public transport", detail: "Roads and pavements may be icy." },
      { title: "Drive gently if needed", detail: "Longer braking distance in the cold." },
    );
  } else {
    transport.push(
      { title: "Walk the centre", detail: "Ideal conditions for exploring on foot." },
      { title: "Rent a bike or scooter", detail: "Clear skies and a comfortable temperature." },
      { title: "Open-top or ferry tours", detail: "Great visibility for sightseeing today." },
    );
  }
  if (w.visibility !== null && w.visibility < 3000) {
    transport.push({ title: "Allow extra travel time", detail: "Low visibility can delay traffic and flights." });
  }

  // ---- Destinations ----
  const indoor = [
    { title: "Museums and galleries", detail: "Perfect shelter with plenty to see." },
    { title: "Covered markets and cafés", detail: "Local food without the weather." },
    { title: "Cinema, aquarium or library", detail: "Easy hours to pass indoors." },
  ];
  const outdoor = [
    { title: "Parks and gardens", detail: "Make the most of the open air." },
    { title: "Old town walking route", detail: "Streets, squares and street food." },
    { title: "Viewpoints at golden hour", detail: "Clear enough for long views." },
  ];
  const hot = [
    { title: "Water: lakes, pools, coast", detail: "The best way to handle this heat." },
    { title: "Shaded gardens and courtyards", detail: "Cooler pockets in the city." },
    { title: "Evening night markets", detail: "Go out after the sun drops." },
  ];
  const cold = [
    { title: "Thermal baths or spa", detail: "Warm up properly." },
    { title: "Historic cafés and bakeries", detail: "Hot drinks and shelter." },
    { title: "Winter viewpoints", detail: "Short, bundled-up outings." },
  ];

  if (isWet(w.main)) destinations.push(...indoor);
  else if (w.temp >= 32) destinations.push(...hot);
  else if (w.temp <= 5) destinations.push(...cold);
  else destinations.push(...outdoor);

  const headline = isWet(w.main)
    ? `Plan around the ${w.description} in ${w.place}`
    : w.temp >= 32
      ? `Beat the heat in ${w.place}`
      : w.temp <= 5
        ? `Wrap up warm in ${w.place}`
        : `A good day to be out in ${w.place}`;

  return { clothing, transport, destinations, headline };
}

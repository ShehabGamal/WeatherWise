# WeatherWise 🌤️

A smart, responsive weather application that goes beyond the forecast. Enter a city (and optionally a country) and get real-time weather conditions **plus personalized recommendations** — what to wear, how to get around, and places worth visiting — all tailored to the location and its current conditions.

Built with ❤️ (and a little help from Mr Lovable 🤖).

---

## ✨ Features

- **Real-time weather lookup** — search by city and country, powered by the OpenWeatherMap API.
- **👕 Clothing recommendations** — what to wear based on temperature, rain, wind and humidity.
- **🚇 Transport suggestions** — the smartest ways to get around given the current conditions.
- **📍 Destination ideas** — places to visit that fit the weather and the location.
- **📱 Fully responsive** — a polished experience on phones, tablets and desktops, installable on mobile home screens via the browser.
- **🔐 Secure by design** — the OpenWeatherMap API key lives on the server and is never exposed to the browser.

## 🛠️ Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Framework  | TanStack Start (React 19, full-stack, SSR)        |
| Language   | TypeScript                                        |
| Styling    | Tailwind CSS v4                                   |
| Data       | OpenWeatherMap API                                |
| Backend    | TanStack Start server functions (edge runtime)    |
| Build tool | Vite                                              |

## 🏗️ Architecture

```text
src/
├── routes/
│   ├── __root.tsx        # App shell, fonts, global layout, metadata
│   └── index.tsx         # Main page: search form + results dashboard
├── lib/
│   ├── weather.functions.ts   # Server function: calls OpenWeatherMap
│   │                          # (API key read from server env, never shipped to client)
│   └── recommendations.ts     # Pure logic: turns weather data into
│                              # clothing / transport / destination advice
└── styles.css            # Tailwind v4 theme tokens
```

**How a search flows:**

1. The user submits a city and optional country.
2. A typed RPC server function calls `api.openweathermap.org` with the secret key.
3. The raw response is normalized and passed through the recommendation engine.
4. The UI renders current conditions and three recommendation cards, adapting layout to screen size.

## 🚀 Getting Started

### Prerequisites

- Node.js (or [Bun](https://bun.sh))
- An OpenWeatherMap API key — get one free at <https://openweathermap.org/api>

### Setup

```sh
git clone <this-repository-url>
cd <repository-name>
npm install        # or: bun install
```

Create a `.env` file with your API key:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

Run the dev server:

```sh
npm run dev        # or: bun run dev
```

Open <http://localhost:8080> and search for your favorite city. 🌍

## 📦 Deployment

The app deploys as an edge-ready full-stack web app (e.g. via Lovable's one-click publish). Because it's a responsive web app, it runs everywhere — Android, iOS and desktop — directly from the browser, and can be installed to the home screen like a native app.

## 🙏 Credits

Weather data by [OpenWeatherMap](https://openweathermap.org). This project was brought to life with **Mr Lovable** — AI pair-programmer extraordinaire — who wrote the code, wired the API, and made it live. <#

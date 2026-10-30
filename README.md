# ⚡ AeroWeather Intelligence CI/CD Platform

> Modern, full-stack weather intelligence web application featuring live Doppler radar, interactive global weather maps, 24-hour projections, 6-day forecasts, atmospheric metrics, Spring Boot backend, and automated GitHub Actions CI/CD deployment to GitHub Pages.

[![Deploy to GitHub Pages](https://github.com/ShaikMuktharBasha/cicd_weatherApp/actions/workflows/deploy.yml/badge.svg)](https://github.com/ShaikMuktharBasha/cicd_weatherApp/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-38bdf8?style=flat&logo=github)](https://ShaikMuktharBasha.github.io/cicd_weatherApp/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Live Demo

The weather web application is automatically built and deployed via GitHub Actions to GitHub Pages:
👉 **[https://ShaikMuktharBasha.github.io/cicd_weatherApp/](https://ShaikMuktharBasha.github.io/cicd_weatherApp/)**

---

## 🏗️ Project Architecture

```
cicd_weatherApp/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD deployment to GitHub Pages
├── Frontend/                   # Modernized AeroWeather 2.0 Web Application
│   ├── css/
│   │   └── style.css           # Glassmorphic dark design system & tokens
│   ├── js/
│   │   ├── main.js             # Core weather engine, radar map & canvas atmosphere
│   │   ├── search.js           # Search explorer module
│   │   └── world.js            # World capitals & saved places module
│   ├── img/                    # High-res 3D weather icons
│   ├── index.html              # Main weather intelligence dashboard
│   ├── search.html             # Dedicated search explorer view
│   ├── world.html              # Global capitals & saved places view
│   ├── build.js                # Fast static packaging script for CI/CD
│   ├── Dockerfile              # Multi-stage production Nginx container
│   ├── nginx.conf              # Nginx server configuration with caching
│   └── package.json            # Scripts & dependencies
├── Backend/                    # Spring Boot REST API Service
├── k8s/                        # Kubernetes manifests (deployments, services, ingress)
├── docker-compose.yml          # Local container orchestration
└── README.md                   # Platform documentation
```

---

## 🌟 Key Application Features

- **🎨 Modern Glassmorphic Dark Aesthetics**: Tailored dark space palette, glassmorphism (`backdrop-filter: blur(20px)`), subtle neon glow accents, and Google Fonts (**Outfit** & **Inter**).
- **🌌 Dynamic Atmosphere Canvas**: Live canvas engine rendering ambient sunbeams, gentle rain streaks, soft clouds, and twinkling night sky particles based on real-time atmospheric conditions.
- **🗺️ Interactive Weather Radar & Global Map**:
  - High-contrast, watermark-free **Esri World Dark Canvas** base map.
  - **Live Layer Switching**:
    - 🌡️ Temperature Heatmap (`temp_new`)
    - 🌧️ Real-Time Rain Radar (via Doppler radar tiles)
    - ☁️ Global Cloud Coverage (`clouds_new`)
    - 💨 Wind Stream Velocity (`wind_new`)
  - **Click-to-Inspect**: Click anywhere on Earth to drop an interactive radar pin and inspect localized weather data on demand.
  - Quick-fly city shortcut pills (London, Tokyo, New York, Paris, Mumbai, Sydney, Dubai, Singapore).
  - Built-in map search bar & fullscreen toggle.
- **⏱️ 24-Hour Hourly Forecast**: Smooth horizontal carousel displaying upcoming 3-hour increments with temperature, weather icon, and precipitation probabilities.
- **📅 6-Day Extended Projections**: Daily forecast list with high/low temperature bars and visual gradients.
- **🧭 8 Essential Meteorological Tiles**: Feels like, Humidity & dew point, Wind Compass with rotating needle, Barometric pressure, Visibility, Cloud cover, Solar schedule arc, and UV index.
- **💡 Smart Lifestyle Insights**: Contextual advice on clothing, outdoor workout conditions, umbrella reminders, and sun protection.
- **🚨 Severe Weather Alerts**: Automatic detection and warning banners for extreme heatwaves, heavy downpours, high winds, and severe storms.
- **🌍 World Places & Saved Favorites**: LocalStorage-persisted favorites manager to pin, monitor, or remove global cities.
- **🌡️ °C / °F Unit Switcher**: Instant global temperature conversion across hero cards, hourly sliders, 7-day outlooks, and map pins.

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)

### Development Server
```bash
cd Frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Test & Build
```bash
cd Frontend
npm test
npm run build
```

---

## 🐳 Docker Deployment

### Run with Docker Compose:
```bash
docker-compose up --build -d
```
Access the application at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔄 GitHub Actions CI/CD Pipeline

The `.github/workflows/deploy.yml` workflow runs automatically on every push to `main`:
1. **Validate**: Runs JavaScript syntax and asset integrity checks.
2. **Build**: Packages static web assets into `Frontend/dist`.
3. **Deploy**: Deploys artifact to GitHub Pages with zero downtime.

---

## 📄 License

MIT License. Developed by [Shaik Mukhtar Basha](https://github.com/ShaikMuktharBasha).

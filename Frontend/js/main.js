/**
 * AEROWEATHER INTELLIGENCE - CORE APPLICATION LOGIC
 * Real-time Weather, Forecast, Canvas Atmosphere, and Interactive Leaflet Radar Map
 */

// Configuration & State
const CONFIG = {
  apiKey: "1e3e8f230b6064d27976e41163a82b77",
  defaultCity: "Mumbai",
  defaultLat: 19.0760,
  defaultLon: 72.8777,
  defaultCountry: "IN",
  units: "C", // "C" or "F"
  formspreeEndpoint: "https://formspree.io/f/xzzjpgnz"
};

const STATE = {
  currentCity: CONFIG.defaultCity,
  currentCountry: CONFIG.defaultCountry,
  currentLat: CONFIG.defaultLat,
  currentLon: CONFIG.defaultLon,
  currentWeatherData: null,
  forecastData: null,
  unit: localStorage.getItem("aero_unit") || CONFIG.units,
  weatherMapInstance: null,
  savedCities: JSON.parse(localStorage.getItem("aero_saved_cities")) || [
    { name: "New York", country: "US", lat: 40.7128, lon: -74.0060 },
    { name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
    { name: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503 },
    { name: "Paris", country: "FR", lat: 48.8566, lon: 2.3522 },
    { name: "Dubai", country: "AE", lat: 25.2048, lon: 55.2708 },
    { name: "Singapore", country: "SG", lat: 1.3521, lon: 103.8198 },
    { name: "Sydney", country: "AU", lat: -33.8688, lon: 151.2093 }
  ]
};

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

function formatTemp(celsius) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return "--\u00B0";
  if (STATE.unit === "F") {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}\u00B0`;
  }
  return `${Math.round(celsius)}\u00B0`;
}

function getWeatherIconPath(mainCondition) {
  if (!mainCondition) return "img/sun.png";
  const cond = mainCondition.toLowerCase();
  if (cond.includes("rain") || cond.includes("drizzle")) return "img/rain.png";
  if (cond.includes("cloud") || cond.includes("overcast")) return "img/cloud.png";
  if (cond.includes("snow") || cond.includes("sleet")) return "img/snow.png";
  if (cond.includes("thunder")) return "img/thunderstorm.png";
  if (cond.includes("mist") || cond.includes("fog")) return "img/mist.png";
  if (cond.includes("haze") || cond.includes("smoke") || cond.includes("dust")) return "img/haze.png";
  if (cond.includes("wind")) return "img/wind.png";
  return "img/sun.png";
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const msgEl = document.getElementById("toast-message");
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.querySelector("i").className = isError
    ? "fa-solid fa-triangle-exclamation"
    : "fa-solid fa-circle-check";
  toast.querySelector("i").style.color = isError ? "var(--accent-rose)" : "var(--accent-cyan)";

  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

// Live Clock & Date
function updateClock() {
  const timeEl = document.getElementById("live-time-display");
  if (!timeEl) return;
  const now = new Date();
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };
  timeEl.textContent = now.toLocaleDateString("en-US", options);
}
setInterval(updateClock, 1000);
updateClock();

// ==========================================================================
// BACKGROUND ATMOSPHERE CANVAS SYSTEM
// ==========================================================================

class WeatherCanvas {
  constructor() {
    this.canvas = document.getElementById("weather-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.weatherType = "clear";
    this.animId = null;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);

    window.addEventListener("resize", this.resize);
    this.resize();
    this.setWeather("clear");
    this.loop();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  setWeather(type) {
    this.weatherType = type;
    this.particles = [];
    const count = type === "rain" ? 140 : type === "snow" ? 80 : 45;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        len: Math.random() * 20 + 10,
        speed: Math.random() * 8 + 6,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.15,
        twinkleSpeed: Math.random() * 0.02 + 0.005
      });
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.weatherType === "rain") {
      this.ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      this.ctx.lineWidth = 1.2;
      this.particles.forEach(p => {
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - 2, p.y + p.len);
        this.ctx.stroke();

        p.y += p.speed;
        p.x -= 1;
        if (p.y > this.height) {
          p.y = -10;
          p.x = Math.random() * this.width;
        }
      });
    } else if (this.weatherType === "snow") {
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      this.particles.forEach(p => {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        p.y += p.speed * 0.25;
        p.x += Math.sin(p.y * 0.02) * 0.5;
        if (p.y > this.height) {
          p.y = -5;
          p.x = Math.random() * this.width;
        }
      });
    } else {
      // Clear or cloudy night/day subtle ambient stars / specks
      this.particles.forEach(p => {
        p.opacity += Math.sin(Date.now() * p.twinkleSpeed) * 0.01;
        p.opacity = Math.max(0.1, Math.min(0.7, p.opacity));

        this.ctx.fillStyle = `rgba(186, 230, 253, ${p.opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        p.y -= 0.15;
        if (p.y < 0) p.y = this.height;
      });
    }

    this.animId = requestAnimationFrame(this.loop);
  }
}

let canvasAtmosphere = null;

// ==========================================================================
// WEATHER DATA FETCH & DASHBOARD RENDER
// ==========================================================================

async function fetchWeatherByCoords(lat, lon, preferredName = null) {
  try {
    const refreshBtn = document.getElementById("refresh-weather-btn");
    if (refreshBtn) refreshBtn.querySelector("i").classList.add("fa-spin");

    // Fetch Current Weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${CONFIG.apiKey}`;
    const curRes = await fetch(currentUrl);
    if (!curRes.ok) throw new Error("Could not fetch current weather data.");
    const curData = await curRes.json();

    // Fetch 5-Day / 3-Hour Forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${CONFIG.apiKey}`;
    const foreRes = await fetch(forecastUrl);
    if (!foreRes.ok) throw new Error("Could not fetch forecast data.");
    const foreData = await foreRes.json();

    STATE.currentWeatherData = curData;
    STATE.forecastData = foreData;
    STATE.currentLat = lat;
    STATE.currentLon = lon;
    STATE.currentCity = preferredName || curData.name;
    STATE.currentCountry = curData.sys?.country || "";

    // Save last active coordinates
    localStorage.setItem("aero_last_lat", lat);
    localStorage.setItem("aero_last_lon", lon);
    localStorage.setItem("aero_last_city", STATE.currentCity);

    // Render UI components
    renderHeroCard(curData);
    renderHourlyForecast(foreData);
    renderMetrics(curData);
    renderDailyForecast(foreData);
    renderInsights(curData, foreData);
    checkSevereAlerts(curData);

    // Update map marker and center
    if (STATE.weatherMapInstance) {
      STATE.weatherMapInstance.updateMapCenter(lat, lon, STATE.currentCity, curData.main?.temp, curData.weather?.[0]?.main);
    }

    // Update dynamic background atmosphere
    const mainCondition = (curData.weather?.[0]?.main || "").toLowerCase();
    if (canvasAtmosphere) {
      if (mainCondition.includes("rain") || mainCondition.includes("drizzle")) {
        canvasAtmosphere.setWeather("rain");
      } else if (mainCondition.includes("snow")) {
        canvasAtmosphere.setWeather("snow");
      } else {
        canvasAtmosphere.setWeather("clear");
      }
    }

    showToast(`Weather updated for ${STATE.currentCity}`);
  } catch (err) {
    console.error("Fetch weather error:", err);
    showToast(err.message || "Failed to load weather.", true);
  } finally {
    const refreshBtn = document.getElementById("refresh-weather-btn");
    if (refreshBtn) refreshBtn.querySelector("i").classList.remove("fa-spin");
  }
}

async function fetchWeatherByCityName(cityName) {
  try {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${CONFIG.apiKey}`;
    const res = await fetch(geoUrl);
    const data = await res.json();
    if (!data || data.length === 0) {
      showToast(`City "${cityName}" not found.`, true);
      return;
    }
    const location = data[0];
    await fetchWeatherByCoords(location.lat, location.lon, location.name);
  } catch (err) {
    console.error("City search error:", err);
    showToast("Error searching city.", true);
  }
}

// Render Hero Section
function renderHeroCard(data) {
  document.getElementById("current-city-name").textContent = STATE.currentCity;
  document.getElementById("current-country-badge").textContent = STATE.currentCountry;

  const latText = `${Math.abs(data.coord.lat).toFixed(2)}\u00B0 ${data.coord.lat >= 0 ? "N" : "S"}`;
  const lonText = `${Math.abs(data.coord.lon).toFixed(2)}\u00B0 ${data.coord.lon >= 0 ? "E" : "W"}`;
  document.getElementById("current-coords-display").textContent = `${latText}, ${lonText}`;

  const conditionDesc = data.weather?.[0]?.description || "Clear Sky";
  document.getElementById("condition-text").textContent = conditionDesc;

  document.getElementById("temp-max-val").textContent = formatTemp(data.main?.temp_max);
  document.getElementById("temp-min-val").textContent = formatTemp(data.main?.temp_min);

  document.getElementById("current-temp-val").textContent = STATE.unit === "F"
    ? Math.round((data.main?.temp * 9) / 5 + 32)
    : Math.round(data.main?.temp);

  document.getElementById("feels-like-val").textContent = formatTemp(data.main?.feels_like);

  const iconPath = getWeatherIconPath(data.weather?.[0]?.main);
  document.getElementById("current-weather-icon").src = iconPath;
}

// Render Hourly Forecast (Next 24 Hours / 8 intervals)
function renderHourlyForecast(forecast) {
  const container = document.getElementById("hourly-forecast-container");
  if (!container || !forecast?.list) return;

  container.innerHTML = "";
  const next8 = forecast.list.slice(0, 8);

  next8.forEach((item, index) => {
    const date = new Date(item.dt * 1000);
    const timeLabel = index === 0 ? "Now" : date.toLocaleTimeString([], { hour: "numeric" });
    const popPercent = Math.round((item.pop || 0) * 100);
    const icon = getWeatherIconPath(item.weather?.[0]?.main);

    const card = document.createElement("div");
    card.className = `hourly-card ${index === 0 ? "active-hour" : ""}`;
    card.innerHTML = `
      <span class="hourly-time">${timeLabel}</span>
      <img class="hourly-icon" src="${icon}" alt="${item.weather?.[0]?.description || 'Forecast'}">
      <span class="hourly-temp">${formatTemp(item.main?.temp)}</span>
      ${popPercent > 10 ? `<span class="hourly-pop"><i class="fa-solid fa-umbrella"></i> ${popPercent}%</span>` : `<span class="hourly-pop" style="color:var(--text-muted);"><i class="fa-solid fa-wind"></i> ${Math.round(item.wind?.speed || 0)}</span>`}
    `;
    container.appendChild(card);
  });
}

// Render Weather Metrics Grid
function renderMetrics(data) {
  const temp = data.main?.temp || 0;
  const humidity = data.main?.humidity || 0;
  const feelsLike = data.main?.feels_like || 0;
  const windSpeed = data.wind?.speed || 0;
  const windDeg = data.wind?.deg || 0;
  const pressure = data.main?.pressure || 1013;
  const visibilityKm = ((data.visibility || 10000) / 1000).toFixed(1);
  const cloudPercent = data.clouds?.all || 0;

  // Feels Like
  document.getElementById("metric-feels-like").textContent = STATE.unit === "F"
    ? Math.round((feelsLike * 9) / 5 + 32)
    : Math.round(feelsLike);
  const tempDiff = feelsLike - temp;
  document.getElementById("metric-feels-desc").textContent =
    Math.abs(tempDiff) < 2 ? "Similar to actual temperature" :
    tempDiff > 0 ? "Humidity makes it feel warmer" : "Wind makes it feel cooler";

  // Humidity & Dew Point
  document.getElementById("metric-humidity").textContent = humidity;
  const dewPoint = (temp - (100 - humidity) / 5).toFixed(0);
  document.getElementById("metric-dewpoint").textContent = `Dew point is ${formatTemp(dewPoint)}`;

  // Wind Speed & Compass
  const speedUnit = STATE.unit === "F" ? "mph" : "km/h";
  const speedValue = STATE.unit === "F" ? Math.round(windSpeed * 0.621371) : Math.round(windSpeed * 3.6);
  document.getElementById("metric-wind-speed").textContent = speedValue;
  document.getElementById("metric-wind-unit").textContent = speedUnit;

  const arrow = document.getElementById("compass-arrow");
  if (arrow) arrow.style.transform = `rotate(${windDeg}deg)`;

  const windLabels = ["North", "NNE", "NE", "ENE", "East", "ESE", "SE", "SSE", "South", "SSW", "SW", "WSW", "West", "WNW", "NW", "NNW"];
  const dirIndex = Math.round(windDeg / 22.5) % 16;
  document.getElementById("metric-wind-dir").textContent = `${windLabels[dirIndex]} (${windDeg}\u00B0)`;

  // Pressure
  document.getElementById("metric-pressure").textContent = pressure;
  document.getElementById("metric-pressure-desc").textContent =
    pressure > 1013 ? "High barometric pressure (Clear)" : "Low pressure system";

  // Visibility
  document.getElementById("metric-visibility").textContent = visibilityKm;
  document.getElementById("metric-visibility-desc").textContent =
    visibilityKm >= 10 ? "Crystal clear optical visibility" :
    visibilityKm >= 5 ? "Moderate visibility" : "Hazy / reduced visibility";

  // Cloud Cover & Fill
  document.getElementById("metric-cloud-cover").textContent = cloudPercent;
  document.getElementById("metric-cloud-desc").textContent =
    cloudPercent < 20 ? "Clear and open skies" :
    cloudPercent < 60 ? "Partly cloudy conditions" : "Overcast sky cover";
  const cloudFill = document.getElementById("metric-cloud-fill");
  if (cloudFill) cloudFill.style.width = `${cloudPercent}%`;

  const humFill = document.getElementById("metric-humidity-fill");
  if (humFill) humFill.style.width = `${humidity}%`;

  // Sun Schedule
  if (data.sys?.sunrise && data.sys?.sunset) {
    const sunriseDate = new Date(data.sys.sunrise * 1000);
    const sunsetDate = new Date(data.sys.sunset * 1000);
    document.getElementById("metric-sunrise").textContent = sunriseDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    document.getElementById("metric-sunset").textContent = sunsetDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const now = Date.now();
    const totalDaylight = data.sys.sunset - data.sys.sunrise;
    const progress = Math.max(0, Math.min(1, (now / 1000 - data.sys.sunrise) / totalDaylight));
    document.getElementById("sun-arc-progress").style.width = `${(progress * 100).toFixed(0)}%`;

    const isDay = now / 1000 >= data.sys.sunrise && now / 1000 <= data.sys.sunset;
    document.getElementById("daylight-remaining").textContent = isDay ? "Currently daylight hours" : "Nighttime hours";
  }

  // UV Index Estimation
  let uvEst = 4;
  if (cloudPercent > 70) uvEst = 2;
  else if (cloudPercent < 20 && temp > 28) uvEst = 8;
  else if (temp > 24) uvEst = 6;
  document.getElementById("metric-uv-index").textContent = uvEst;
  document.getElementById("metric-uv-desc").textContent =
    uvEst >= 8 ? "Very high - protect skin" :
    uvEst >= 6 ? "High - sunglasses & sunscreen" : "Moderate exposure risk";
  const uvFill = document.getElementById("metric-uv-fill");
  if (uvFill) {
    uvFill.style.width = `${Math.min(100, Math.round((uvEst / 11) * 100))}%`;
    uvFill.style.background = uvEst >= 8 ? "var(--accent-rose)" : uvEst >= 6 ? "var(--accent-amber)" : "var(--accent-emerald)";
  }
}

// Render 6-Day Daily Forecast
function renderDailyForecast(forecast) {
  const listEl = document.getElementById("daily-forecast-list");
  if (!listEl || !forecast?.list) return;

  listEl.innerHTML = "";

  // Group 3-hour forecasts by date
  const daysMap = {};
  forecast.list.forEach(item => {
    const dateStr = item.dt_txt.split(" ")[0];
    if (!daysMap[dateStr]) daysMap[dateStr] = [];
    daysMap[dateStr].push(item);
  });

  const dayKeys = Object.keys(daysMap).slice(0, 6);

  // Compute weekly absolute min and max for the Apple Weather range bar
  let weekMin = Infinity;
  let weekMax = -Infinity;
  dayKeys.forEach(k => {
    daysMap[k].forEach(item => {
      if (item.main.temp_min < weekMin) weekMin = item.main.temp_min;
      if (item.main.temp_max > weekMax) weekMax = item.main.temp_max;
    });
  });
  const tempRange = Math.max(1, weekMax - weekMin);

  dayKeys.forEach((key, index) => {
    const items = daysMap[key];
    const temps = items.map(i => i.main.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const midItem = items[Math.floor(items.length / 2)];
    const condition = midItem.weather?.[0]?.description || "Clear";
    const icon = getWeatherIconPath(midItem.weather?.[0]?.main);

    const dateObj = new Date(key);
    const dayName = index === 0 ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Apple Weather-style proportional range bar
    const leftPct = Math.max(0, Math.min(100, ((minTemp - weekMin) / tempRange) * 100));
    const rightPct = Math.max(0, Math.min(100, ((weekMax - maxTemp) / tempRange) * 100));

    const row = document.createElement("div");
    row.className = "daily-row";
    row.innerHTML = `
      <div class="daily-day-info">
        <span class="daily-day-name">${dayName}</span>
        <span class="daily-date">${formattedDate}</span>
      </div>
      <img class="daily-icon" src="${icon}" alt="${condition}">
      <span class="daily-desc-pop">${condition}</span>
      <div class="daily-temp-bar-container">
        <span class="daily-temp-min">${formatTemp(minTemp)}</span>
        <div class="daily-temp-bar">
          <div class="daily-temp-bar-fill" style="left: ${leftPct.toFixed(1)}%; right: ${rightPct.toFixed(1)}%;"></div>
        </div>
        <span class="daily-temp-max">${formatTemp(maxTemp)}</span>
      </div>
    `;
    listEl.appendChild(row);
  });
}

// Render Lifestyle Insights
function renderInsights(current, forecast) {
  const temp = current.main?.temp || 20;
  const rainProb = (forecast?.list?.[0]?.pop || 0) * 100;

  // Clothing
  const clothingEl = document.getElementById("insight-clothing");
  if (temp > 28) {
    clothingEl.textContent = "Light breathable cotton and open footwear recommended. Stay cool!";
  } else if (temp < 12) {
    clothingEl.textContent = "Warm layered jacket, scarf, and insulated sweater recommended.";
  } else {
    clothingEl.textContent = "Comfortable light jacket or full sleeves are ideal for today's mild air.";
  }

  // Outdoor
  const outdoorEl = document.getElementById("insight-outdoor");
  if (rainProb > 40) {
    outdoorEl.textContent = "Showers probable. Prefer indoor workouts or carry weatherproof gear.";
  } else if (temp > 35) {
    outdoorEl.textContent = "High heat index. Avoid strenuous outdoor activities during peak sun hours.";
  } else {
    outdoorEl.textContent = "Great conditions for jogging, cycling, or visiting local parks.";
  }

  // Umbrella
  const umbrellaEl = document.getElementById("insight-umbrella");
  if (rainProb > 30) {
    umbrellaEl.textContent = `High chance of rain (${rainProb.toFixed(0)}%). Don't forget your umbrella!`;
  } else {
    umbrellaEl.textContent = "Dry skies ahead. No umbrella needed for your commutes.";
  }

  // Sun Protection
  const sunEl = document.getElementById("insight-sun");
  if (temp > 26 && (current.clouds?.all || 0) < 40) {
    sunEl.textContent = "Strong UV exposure. Sunglasses and SPF 30+ sunscreen recommended.";
  } else {
    sunEl.textContent = "Moderate UV levels. Regular skin protection is sufficient.";
  }
}

// Check Severe Alerts
function checkSevereAlerts(data) {
  const banner = document.getElementById("weather-alert-banner");
  const titleEl = document.getElementById("alert-title-text");
  const descEl = document.getElementById("alert-desc-text");
  if (!banner || !titleEl || !descEl) return;

  const temp = data.main?.temp || 20;
  const wind = data.wind?.speed || 0;
  const main = (data.weather?.[0]?.main || "").toLowerCase();

  let alertTitle = "";
  let alertDesc = "";

  if (temp >= 38) {
    alertTitle = "Extreme Heat Advisory";
    alertDesc = `High temperature of ${Math.round(temp)}\u00B0C detected. Stay hydrated and avoid prolonged direct sun.`;
  } else if (wind >= 20) {
    alertTitle = "High Wind Warning";
    alertDesc = `Strong wind gusts up to ${Math.round(wind * 3.6)} km/h detected. Secure loose outdoor fixtures.`;
  } else if (main.includes("thunder")) {
    alertTitle = "Severe Thunderstorm Alert";
    alertDesc = "Thunderstorms and lightning detected in your region. Seek indoor shelter.";
  } else if (main.includes("snow") && temp <= 0) {
    alertTitle = "Freezing Winter Conditions";
    alertDesc = "Sub-zero temperatures and snow. Drive with caution due to potential icy roads.";
  }

  if (alertTitle) {
    titleEl.textContent = alertTitle;
    descEl.textContent = alertDesc;
    banner.style.display = "flex";
  } else {
    banner.style.display = "none";
  }
}

// ==========================================================================
// INTERACTIVE LEAFLET WEATHER MAP SYSTEM (ESRI DARK + RAINVIEWER / OPENWEATHER)
// ==========================================================================

class WeatherRadarMap {
  constructor() {
    this.map = null;
    this.activeWeatherLayer = "temp";
    this.weatherOverlay = null;
    this.markerGroup = null;
    this.currentLocationMarker = null;
    this.rainViewerTileUrl = null;

    this.initMap();
    this.initRainViewer();
    this.initLayerControls();
    this.initCityPills();
    this.initMapSearch();
    this.initFullscreen();
  }

  initMap() {
    const mapContainer = document.getElementById("weather-map");
    if (!mapContainer || typeof L === "undefined") return;

    // Premium Esri World Dark Gray Base (No API key needed, zero watermark, clean dark aesthetic)
    this.map = L.map("weather-map", {
      zoomControl: true,
      minZoom: 2,
      maxZoom: 16
    }).setView([STATE.currentLat, STATE.currentLon], 6);

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
      maxZoom: 16
    }).addTo(this.map);

    // City & Country Boundary reference labels
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
      attribution: "",
      maxZoom: 16,
      opacity: 0.8
    }).addTo(this.map);

    this.markerGroup = L.layerGroup().addTo(this.map);

    // Initial weather layer
    this.setWeatherLayer("temp");

    // Add global hubs to map
    this.loadGlobalHubMarkers();

    // Map Click Inspector: Click anywhere to inspect weather
    this.map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      this.inspectCoordinateWeather(lat, lng);
    });
  }

  async initRainViewer() {
    try {
      const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
      const data = await res.json();
      if (data.radar && data.radar.past && data.radar.past.length > 0) {
        const latest = data.radar.past[data.radar.past.length - 1];
        this.rainViewerTileUrl = `${data.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;
      }
    } catch (e) {
      console.warn("RainViewer init fallback:", e);
    }
  }

  setWeatherLayer(layerType) {
    if (!this.map) return;
    this.activeWeatherLayer = layerType;

    if (this.weatherOverlay) {
      this.map.removeLayer(this.weatherOverlay);
      this.weatherOverlay = null;
    }

    if (layerType === "precipitation") {
      // Use RainViewer Doppler Radar if available, or OpenWeather precipitation
      const radarUrl = this.rainViewerTileUrl || `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${CONFIG.apiKey}`;
      this.weatherOverlay = L.tileLayer(radarUrl, {
        opacity: 0.8,
        zIndex: 10
      }).addTo(this.map);
    } else {
      const layerMap = {
        temp: "temp_new",
        clouds: "clouds_new",
        wind: "wind_new"
      };
      const endpoint = layerMap[layerType] || "temp_new";
      const tileUrl = `https://tile.openweathermap.org/map/${endpoint}/{z}/{x}/{y}.png?appid=${CONFIG.apiKey}`;

      this.weatherOverlay = L.tileLayer(tileUrl, {
        opacity: 0.7,
        zIndex: 10
      }).addTo(this.map);
    }
  }

  initLayerControls() {
    const buttons = document.querySelectorAll(".layer-btn");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const layer = btn.getAttribute("data-layer");
        this.setWeatherLayer(layer);
      });
    });
  }

  async loadGlobalHubMarkers() {
    const hubs = [
      { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
      { name: "Delhi", lat: 28.6139, lon: 77.2090 },
      { name: "London", lat: 51.5074, lon: -0.1278 },
      { name: "New York", lat: 40.7128, lon: -74.0060 },
      { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
      { name: "Paris", lat: 48.8566, lon: 2.3522 },
      { name: "Dubai", lat: 25.2048, lon: 55.2708 },
      { name: "Sydney", lat: -33.8688, lon: 151.2093 }
    ];

    for (const hub of hubs) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${hub.lat}&lon=${hub.lon}&units=metric&appid=${CONFIG.apiKey}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();

        const icon = getWeatherIconPath(data.weather?.[0]?.main);
        const temp = Math.round(data.main?.temp || 0);

        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div class="weather-map-marker" title="${hub.name}: ${temp}\u00B0C">
              <img class="map-marker-icon" src="${icon}" alt="${data.weather?.[0]?.main}">
              <span class="map-marker-name">${hub.name}</span>
              <span class="map-marker-temp">${temp}\u00B0</span>
            </div>
          `,
          iconSize: [80, 28],
          iconAnchor: [40, 14]
        });

        const marker = L.marker([hub.lat, hub.lon], { icon: customIcon });

        const popupContent = `
          <div class="map-popup-card">
            <div class="map-popup-title">${hub.name}, ${data.sys?.country || ""}</div>
            <div class="map-popup-temp-row">
              <span class="map-popup-temp">${temp}\u00B0C</span>
              <img src="${icon}" style="width:32px; height:32px;">
            </div>
            <div class="map-popup-desc">${data.weather?.[0]?.description || ""}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Humidity: ${data.main?.humidity}% \u2022 Wind: ${Math.round(data.wind?.speed * 3.6)} km/h</div>
            <button class="map-popup-btn" onclick="fetchWeatherByCoords(${hub.lat}, ${hub.lon}, '${hub.name}')">
              View Full Weather
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
        this.markerGroup.addLayer(marker);
      } catch (e) {
        console.warn("Could not load marker for", hub.name, e);
      }
    }
  }

  async inspectCoordinateWeather(lat, lng) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${CONFIG.apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      const name = data.name || "Pinpoint Location";
      const icon = getWeatherIconPath(data.weather?.[0]?.main);
      const temp = Math.round(data.main?.temp || 0);

      L.popup()
        .setLatLng([lat, lng])
        .setContent(`
          <div class="map-popup-card">
            <div class="map-popup-title">${name}</div>
            <div class="map-popup-temp-row">
              <span class="map-popup-temp">${temp}\u00B0C</span>
              <img src="${icon}" style="width:32px; height:32px;">
            </div>
            <div class="map-popup-desc">${data.weather?.[0]?.description || ""}</div>
            <button class="map-popup-btn" onclick="fetchWeatherByCoords(${lat}, ${lng}, '${name}')">
              Select This Location
            </button>
          </div>
        `)
        .openOn(this.map);
    } catch (e) {
      console.error("Inspect error:", e);
    }
  }

  updateMapCenter(lat, lon, cityName, temp, mainCond) {
    if (!this.map) return;
    this.map.flyTo([lat, lon], 7, { duration: 1.5 });

    if (this.currentLocationMarker) {
      this.map.removeLayer(this.currentLocationMarker);
    }

    const icon = getWeatherIconPath(mainCond);
    const customIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="weather-map-marker" style="border-color: #f59e0b; box-shadow: 0 0 16px rgba(245, 158, 11, 0.6);">
          <img class="map-marker-icon" src="${icon}">
          <span class="map-marker-name">${cityName}</span>
          <span class="map-marker-temp" style="color: #f59e0b;">${Math.round(temp || 0)}\u00B0</span>
        </div>
      `,
      iconSize: [85, 30],
      iconAnchor: [42, 15]
    });

    this.currentLocationMarker = L.marker([lat, lon], { icon: customIcon }).addTo(this.map);
  }

  initCityPills() {
    document.querySelectorAll(".city-pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const lat = parseFloat(btn.getAttribute("data-lat"));
        const lon = parseFloat(btn.getAttribute("data-lon"));
        const city = btn.getAttribute("data-city");
        fetchWeatherByCoords(lat, lon, city);
      });
    });
  }

  initMapSearch() {
    const input = document.getElementById("map-quick-search");
    if (!input) return;

    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        const query = input.value.trim();
        if (!query) return;
        try {
          const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${CONFIG.apiKey}`;
          const res = await fetch(geoUrl);
          const data = await res.json();
          if (data && data.length > 0) {
            const loc = data[0];
            fetchWeatherByCoords(loc.lat, loc.lon, loc.name);
            input.value = "";
          } else {
            showToast("Location not found on map.", true);
          }
        } catch (err) {
          showToast("Map search failed.", true);
        }
      }
    });
  }

  initFullscreen() {
    const btn = document.getElementById("map-fullscreen-btn");
    const container = document.querySelector(".map-viewport-wrapper");
    if (!btn || !container) return;

    btn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.warn("Fullscreen request error:", err);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }
}

// ==========================================================================
// SAVED CITIES / WORLD WEATHER GRID
// ==========================================================================

async function renderSavedCities() {
  const grid = document.getElementById("saved-cities-grid");
  const addTrigger = document.getElementById("add-city-trigger");
  if (!grid) return;

  // Clear existing city cards, keep the add trigger tile
  const existingCards = grid.querySelectorAll(".city-weather-card");
  existingCards.forEach(c => c.remove());

  for (let i = 0; i < STATE.savedCities.length; i++) {
    const city = STATE.savedCities[i];
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${CONFIG.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      const card = document.createElement("div");
      card.className = "city-weather-card";
      card.innerHTML = `
        <div class="city-card-header">
          <div>
            <div class="city-card-title">${city.name}</div>
            <div class="city-card-country">${city.country || data.sys?.country || ""}</div>
          </div>
          <button class="city-card-delete-btn" title="Remove City" data-index="${i}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
        <div class="city-card-body">
          <div class="city-card-temp">${formatTemp(data.main?.temp)}</div>
          <img class="city-card-icon" src="${getWeatherIconPath(data.weather?.[0]?.main)}" alt="Weather">
        </div>
        <div class="city-card-footer">
          <span style="text-transform: capitalize;">${data.weather?.[0]?.description || ""}</span>
          <span>H: ${data.main?.humidity}%</span>
        </div>
      `;

      // Select city on card click
      card.addEventListener("click", (e) => {
        if (e.target.closest(".city-card-delete-btn")) return;
        fetchWeatherByCoords(city.lat, city.lon, city.name);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      // Delete city handler
      const delBtn = card.querySelector(".city-card-delete-btn");
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        STATE.savedCities.splice(i, 1);
        localStorage.setItem("aero_saved_cities", JSON.stringify(STATE.savedCities));
        renderSavedCities();
        showToast(`Removed ${city.name} from favorites.`);
      });

      grid.insertBefore(card, addTrigger);
    } catch (e) {
      console.warn("Could not fetch city", city.name, e);
    }
  }
}

// Add City to Saved Favorites
function initAddCityModal() {
  const trigger = document.getElementById("add-city-trigger");
  if (!trigger) return;

  trigger.addEventListener("click", async () => {
    const inputCity = prompt("Enter a city name to save to favorites (e.g. Berlin, Tokyo, Rome):");
    if (!inputCity || !inputCity.trim()) return;

    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(inputCity.trim())}&limit=1&appid=${CONFIG.apiKey}`;
      const res = await fetch(geoUrl);
      const data = await res.json();
      if (!data || data.length === 0) {
        showToast("City not found.", true);
        return;
      }
      const loc = data[0];
      const exists = STATE.savedCities.some(c => c.name.toLowerCase() === loc.name.toLowerCase());
      if (exists) {
        showToast(`${loc.name} is already in your saved list.`);
        return;
      }
      STATE.savedCities.push({
        name: loc.name,
        country: loc.country,
        lat: loc.lat,
        lon: loc.lon
      });
      localStorage.setItem("aero_saved_cities", JSON.stringify(STATE.savedCities));
      renderSavedCities();
      showToast(`Added ${loc.name} to favorites!`);
    } catch (err) {
      showToast("Failed to add city.", true);
    }
  });
}

// ==========================================================================
// SEARCH AUTOCOMPLETE & USER ACTIONS
// ==========================================================================

function initSearch() {
  const searchInput = document.getElementById("city-search-input");
  const searchBtn = document.getElementById("search-submit-btn");
  const dropdown = document.getElementById("search-dropdown");
  let debounceTimeout = null;

  if (!searchInput || !dropdown) return;

  async function performSearch(query) {
    if (!query || query.length < 2) {
      dropdown.classList.remove("show");
      dropdown.innerHTML = "";
      return;
    }

    try {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${CONFIG.apiKey}`;
      const res = await fetch(url);
      const results = await res.json();

      if (!results || results.length === 0) {
        dropdown.innerHTML = `<div class="dropdown-item" style="cursor:default; color:var(--text-muted);">No locations found</div>`;
        dropdown.classList.add("show");
        return;
      }

      dropdown.innerHTML = results.map(loc => `
        <div class="dropdown-item" data-lat="${loc.lat}" data-lon="${loc.lon}" data-name="${loc.name}">
          <div class="dropdown-item-left">
            <i class="fa-solid fa-location-dot" style="color:var(--accent-cyan);"></i>
            <span>${loc.name}${loc.state ? `, ${loc.state}` : ""}</span>
          </div>
          <span class="dropdown-item-country">${loc.country}</span>
        </div>
      `).join("");

      dropdown.classList.add("show");

      dropdown.querySelectorAll(".dropdown-item").forEach(item => {
        item.addEventListener("click", () => {
          const lat = parseFloat(item.getAttribute("data-lat"));
          const lon = parseFloat(item.getAttribute("data-lon"));
          const name = item.getAttribute("data-name");
          if (!isNaN(lat) && !isNaN(lon)) {
            fetchWeatherByCoords(lat, lon, name);
            searchInput.value = "";
            dropdown.classList.remove("show");
          }
        });
      });
    } catch (e) {
      console.warn("Search autocomplete error:", e);
    }
  }

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      performSearch(searchInput.value.trim());
    }, 280);
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = searchInput.value.trim();
      if (val) {
        fetchWeatherByCityName(val);
        dropdown.classList.remove("show");
        searchInput.value = "";
      }
    }
  });

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const val = searchInput.value.trim();
      if (val) {
        fetchWeatherByCityName(val);
        dropdown.classList.remove("show");
        searchInput.value = "";
      }
    });
  }

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-search-wrapper")) {
      dropdown.classList.remove("show");
    }
  });
}

// Geolocation Handler
function initGeolocation() {
  const geoBtn = document.getElementById("geolocation-btn");
  if (!geoBtn) return;

  geoBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", true);
      return;
    }

    geoBtn.querySelector("i").classList.add("fa-spin");
    showToast("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        geoBtn.querySelector("i").classList.remove("fa-spin");
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        geoBtn.querySelector("i").classList.remove("fa-spin");
        console.warn("Geolocation denied or error:", err);
        showToast("Location permission denied. Showing default city.", true);
      },
      { timeout: 10000 }
    );
  });
}

// Unit Switcher (°C <-> °F)
function initUnitToggle() {
  const toggleBtn = document.getElementById("unit-toggle-btn");
  if (!toggleBtn) return;

  toggleBtn.textContent = `\u00B0${STATE.unit}`;

  toggleBtn.addEventListener("click", () => {
    STATE.unit = STATE.unit === "C" ? "F" : "C";
    localStorage.setItem("aero_unit", STATE.unit);
    toggleBtn.textContent = `\u00B0${STATE.unit}`;

    // Re-render components with new unit
    if (STATE.currentWeatherData) {
      renderHeroCard(STATE.currentWeatherData);
      renderMetrics(STATE.currentWeatherData);
    }
    if (STATE.forecastData) {
      renderHourlyForecast(STATE.forecastData);
      renderDailyForecast(STATE.forecastData);
    }
    renderSavedCities();
    showToast(`Switched units to \u00B0${STATE.unit}`);
  });
}

// Refresh Button
function initRefresh() {
  const refreshBtn = document.getElementById("refresh-weather-btn");
  if (!refreshBtn) return;

  refreshBtn.addEventListener("click", () => {
    fetchWeatherByCoords(STATE.currentLat, STATE.currentLon, STATE.currentCity);
  });
}

// Weather Alert Dismiss
function initAlertDismiss() {
  const alertCloseBtn = document.getElementById("alert-close-btn");
  const alertBanner = document.getElementById("weather-alert-banner");
  if (alertCloseBtn && alertBanner) {
    alertCloseBtn.addEventListener("click", () => {
      alertBanner.style.display = "none";
    });
  }
}

// Formspree Feedback Submission
function initFeedbackForm() {
  const form = document.getElementById("feedback-form");
  const statusEl = document.getElementById("feedback-status");
  if (!form || !statusEl) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("feedback-name").value.trim();
    const email = document.getElementById("feedback-email").value.trim();
    const message = document.getElementById("feedback-message").value.trim();

    statusEl.className = "feedback-status-msg";
    statusEl.style.display = "block";
    statusEl.textContent = "Sending feedback...";

    try {
      const res = await fetch(CONFIG.formspreeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      if (res.ok) {
        statusEl.className = "feedback-status-msg success";
        statusEl.textContent = "Thank you! Your feedback has been received.";
        form.reset();
        showToast("Feedback sent successfully!");
      } else {
        throw new Error("Feedback submission failed.");
      }
    } catch (err) {
      statusEl.className = "feedback-status-msg error";
      statusEl.textContent = "Could not send feedback. Please try again later.";
      showToast("Failed to submit feedback.", true);
    }
  });
}

// ==========================================================================
// APPLICATION BOOTSTRAP
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Canvas Atmosphere
  canvasAtmosphere = new WeatherCanvas();

  // 2. Initialize Weather Map
  STATE.weatherMapInstance = new WeatherRadarMap();

  // 3. Initialize Interactive Features
  initSearch();
  initGeolocation();
  initUnitToggle();
  initRefresh();
  initAlertDismiss();
  initAddCityModal();
  initFeedbackForm();

  // 4. Load Saved Favorite Places
  renderSavedCities();

  // 5. Initial Weather Load (check for saved last coordinates or default)
  const savedLat = localStorage.getItem("aero_last_lat");
  const savedLon = localStorage.getItem("aero_last_lon");
  const savedCity = localStorage.getItem("aero_last_city");

  if (savedLat && savedLon) {
    fetchWeatherByCoords(parseFloat(savedLat), parseFloat(savedLon), savedCity);
  } else {
    fetchWeatherByCoords(CONFIG.defaultLat, CONFIG.defaultLon, CONFIG.defaultCity);
  }
});

/**
 * AEROWEATHER - WORLD CITIES & GLOBAL HUBS CONTROLLER
 * Real-time local timezone clocks, mini radar overview, and live metrics
 */

const API_KEY = "1e3e8f230b6064d27976e41163a82b77";
let currentUnit = localStorage.getItem("aero_unit") || "C";
let miniMap = null;
let mapMarkers = [];

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

function formatTemp(celsius) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return "--°";
  if (currentUnit === "F") {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°`;
  }
  return `${Math.round(celsius)}°`;
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

function getSavedCities() {
  return JSON.parse(localStorage.getItem("aero_saved_cities")) || [
    { name: "New York", country: "US", lat: 40.7128, lon: -74.0060 },
    { name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
    { name: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503 },
    { name: "Paris", country: "FR", lat: 48.8566, lon: 2.3522 },
    { name: "Dubai", country: "AE", lat: 25.2048, lon: 55.2708 },
    { name: "Singapore", country: "SG", lat: 1.3521, lon: 103.8198 },
    { name: "Sydney", country: "AU", lat: -33.8688, lon: 151.2093 },
    { name: "Mumbai", country: "IN", lat: 19.0760, lon: 72.8777 }
  ];
}

function calculateLocalTime(timezoneOffsetSeconds) {
  const utcDate = new Date();
  const utcTime = utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000);
  const cityTime = new Date(utcTime + (timezoneOffsetSeconds * 1000));
  return cityTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Mini Map initialization
function initMiniMap(cities) {
  const container = document.getElementById("world-mini-map");
  if (!container || typeof L === "undefined") return;

  if (!miniMap) {
    miniMap = L.map("world-mini-map", {
      zoomControl: false,
      attributionControl: false,
      minZoom: 1,
      maxZoom: 10
    }).setView([20, 0], 2);

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 16
    }).addTo(miniMap);
  }

  // Clear existing markers
  mapMarkers.forEach(m => miniMap.removeLayer(m));
  mapMarkers = [];

  cities.forEach(city => {
    const customIcon = L.divIcon({
      className: "custom-mini-map-pin",
      html: `
        <div style="background: rgba(56, 189, 248, 0.9); width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 10px #38bdf8; border: 2px solid white;"></div>
      `,
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });

    const marker = L.marker([city.lat, city.lon], { icon: customIcon })
      .bindTooltip(city.name, { permanent: false, direction: "top", className: "map-tooltip-dark" })
      .addTo(miniMap);

    marker.on("click", () => {
      localStorage.setItem("aero_last_lat", city.lat);
      localStorage.setItem("aero_last_lon", city.lon);
      localStorage.setItem("aero_last_city", city.name);
      window.location.href = "index.html";
    });

    mapMarkers.push(marker);
  });
}

async function renderWorldGrid() {
  const container = document.getElementById("world-cities-container");
  if (!container) return;

  container.innerHTML = "";
  const cities = getSavedCities();

  // Update total count
  const totalCountEl = document.getElementById("stat-total-cities");
  if (totalCountEl) totalCountEl.textContent = `${cities.length} Cities`;

  initMiniMap(cities);

  let hottest = { name: "--", temp: -999 };
  let coldest = { name: "--", temp: 999 };

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      const tempC = data.main?.temp || 0;
      if (tempC > hottest.temp) hottest = { name: city.name, temp: tempC };
      if (tempC < coldest.temp) coldest = { name: city.name, temp: tempC };

      const timezoneOffset = data.timezone || 0;
      const localTimeStr = calculateLocalTime(timezoneOffset);
      const isDay = data.dt >= data.sys?.sunrise && data.dt <= data.sys?.sunset;
      const dayNightIcon = isDay ? "fa-solid fa-sun" : "fa-solid fa-moon";
      const iconPath = getWeatherIconPath(data.weather?.[0]?.main);

      const card = document.createElement("div");
      card.className = `city-weather-card ${isDay ? "is-day" : "is-night"}`;
      card.innerHTML = `
        <div class="city-card-header">
          <div>
            <div class="city-card-title">${city.name}</div>
            <div class="city-card-country-row">
              <span class="city-card-country">${city.country || data.sys?.country || ""}</span>
              <span class="city-local-time"><i class="${dayNightIcon}"></i> ${localTimeStr}</span>
            </div>
          </div>
          <button class="city-card-delete-btn" title="Remove City" data-index="${i}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
        <div class="city-card-body">
          <div class="city-card-temp">${formatTemp(tempC)}</div>
          <img class="city-card-icon" src="${iconPath}" alt="Weather">
        </div>
        <div class="city-card-footer">
          <span style="text-transform: capitalize;">${data.weather?.[0]?.description || ""}</span>
          <span>Wind: ${Math.round((data.wind?.speed || 0) * 3.6)} km/h</span>
        </div>
      `;

      // Select city on card click
      card.addEventListener("click", (e) => {
        if (e.target.closest(".city-card-delete-btn")) return;
        localStorage.setItem("aero_last_lat", city.lat);
        localStorage.setItem("aero_last_lon", city.lon);
        localStorage.setItem("aero_last_city", city.name);
        window.location.href = "index.html";
      });

      // Delete city handler
      const delBtn = card.querySelector(".city-card-delete-btn");
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        cities.splice(i, 1);
        localStorage.setItem("aero_saved_cities", JSON.stringify(cities));
        renderWorldGrid();
        showToast(`Removed ${city.name} from saved list.`);
      });

      container.appendChild(card);
    } catch (e) {
      console.warn("Failed to fetch world city:", city.name, e);
    }
  }

  // Update Hottest / Coldest stats
  const hottestEl = document.getElementById("stat-hottest");
  const coldestEl = document.getElementById("stat-coldest");
  if (hottestEl && hottest.temp !== -999) hottestEl.textContent = `${hottest.name} (${formatTemp(hottest.temp)})`;
  if (coldestEl && coldest.temp !== 999) coldestEl.textContent = `${coldest.name} (${formatTemp(coldest.temp)})`;
}

// Add City Flow
async function addCityByQuery(cityName) {
  if (!cityName || !cityName.trim()) return;
  try {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName.trim())}&limit=1&appid=${API_KEY}`;
    const res = await fetch(geoUrl);
    const data = await res.json();

    if (!data || data.length === 0) {
      showToast("City not found.", true);
      return;
    }

    const loc = data[0];
    const saved = getSavedCities();
    const exists = saved.some(c => c.name.toLowerCase() === loc.name.toLowerCase());

    if (exists) {
      showToast(`${loc.name} is already in your tracked list.`);
      return;
    }

    saved.push({
      name: loc.name,
      country: loc.country,
      lat: loc.lat,
      lon: loc.lon
    });

    localStorage.setItem("aero_saved_cities", JSON.stringify(saved));
    renderWorldGrid();
    showToast(`Added ${loc.name} to global list!`);
  } catch (err) {
    showToast("Error adding place.", true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderWorldGrid();

  // Unit Switcher
  const unitBtn = document.getElementById("world-unit-toggle");
  if (unitBtn) {
    unitBtn.textContent = `\u00B0${currentUnit}`;
    unitBtn.addEventListener("click", () => {
      currentUnit = currentUnit === "C" ? "F" : "C";
      localStorage.setItem("aero_unit", currentUnit);
      unitBtn.textContent = `\u00B0${currentUnit}`;
      renderWorldGrid();
      showToast(`Switched units to \u00B0${currentUnit}`);
    });
  }

  // Search input & Autocomplete in World Page
  const addInput = document.getElementById("world-add-input");
  const dropdown = document.getElementById("world-dropdown");
  let debounceTimeout = null;

  if (addInput && dropdown) {
    addInput.addEventListener("input", () => {
      clearTimeout(debounceTimeout);
      const val = addInput.value.trim();
      if (val.length < 2) {
        dropdown.classList.remove("show");
        return;
      }

      debounceTimeout = setTimeout(async () => {
        try {
          const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(val)}&limit=4&appid=${API_KEY}`;
          const res = await fetch(url);
          const results = await res.json();

          if (!results || results.length === 0) {
            dropdown.innerHTML = `<div class="dropdown-item" style="cursor:default; color:var(--text-muted);">No locations found</div>`;
            dropdown.classList.add("show");
            return;
          }

          dropdown.innerHTML = results.map(loc => `
            <div class="dropdown-item" data-name="${loc.name}">
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
              const name = item.getAttribute("data-name");
              addCityByQuery(name);
              addInput.value = "";
              dropdown.classList.remove("show");
            });
          });
        } catch (e) {
          console.warn("Autocomplete error:", e);
        }
      }, 300);
    });

    addInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        addCityByQuery(addInput.value);
        addInput.value = "";
        dropdown.classList.remove("show");
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".add-city-inline-box")) {
        dropdown.classList.remove("show");
      }
    });
  }

  // Quick Chips
  document.querySelectorAll(".quick-add-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const city = chip.getAttribute("data-city");
      addCityByQuery(city);
    });
  });
});

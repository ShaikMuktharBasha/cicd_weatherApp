/**
 * AEROWEATHER - WORLD CITIES & SAVED PLACES LOGIC
 */

const API_KEY = "1e3e8f230b6064d27976e41163a82b77";

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

async function renderWorldGrid() {
  const container = document.getElementById("world-cities-container");
  if (!container) return;

  container.innerHTML = "";
  const cities = getSavedCities();

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${API_KEY}`;
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
          <button class="city-card-delete-btn" title="Remove" data-index="${i}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
        <div class="city-card-body">
          <div class="city-card-temp">${Math.round(data.main?.temp || 0)}┬░</div>
          <img class="city-card-icon" src="${getWeatherIconPath(data.weather?.[0]?.main)}" alt="Weather">
        </div>
        <div class="city-card-footer">
          <span style="text-transform: capitalize;">${data.weather?.[0]?.description || ""}</span>
          <span>Wind: ${Math.round((data.wind?.speed || 0) * 3.6)} km/h</span>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.closest(".city-card-delete-btn")) return;
        localStorage.setItem("aero_last_lat", city.lat);
        localStorage.setItem("aero_last_lon", city.lon);
        localStorage.setItem("aero_last_city", city.name);
        window.location.href = "index.html";
      });

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
}

document.addEventListener("DOMContentLoaded", () => {
  renderWorldGrid();

  const addBtn = document.getElementById("add-world-city-btn");
  if (addBtn) {
    addBtn.addEventListener("click", async () => {
      const input = prompt("Enter city name to add (e.g. Amsterdam, Seoul, Toronto):");
      if (!input || !input.trim()) return;

      try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(input.trim())}&limit=1&appid=${API_KEY}`;
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
          showToast(`${loc.name} is already in your world list.`);
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
    });
  }
});

/**
 * AEROWEATHER - DEDICATED CITY SEARCH & EXPLORER MODULE
 */

const API_KEY = "1e3e8f230b6064d27976e41163a82b77";
let lastFoundLocation = null;

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

async function searchCity(cityName) {
  const resultCard = document.getElementById("search-result-display");
  if (!cityName || !cityName.trim()) return;

  try {
    showToast(`Searching for "${cityName}"...`);
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName.trim())}&limit=1&appid=${API_KEY}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      showToast(`City "${cityName}" not found. Try another search.`, true);
      return;
    }

    const loc = geoData[0];
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&units=metric&appid=${API_KEY}`;
    const wRes = await fetch(weatherUrl);
    const data = await wRes.json();

    lastFoundLocation = {
      name: loc.name,
      country: loc.country,
      lat: loc.lat,
      lon: loc.lon
    };

    // Populate Results
    document.getElementById("res-city-name").textContent = loc.name;
    document.getElementById("res-country-badge").textContent = loc.country || data.sys?.country || "";
    document.getElementById("res-condition-text").textContent = data.weather?.[0]?.description || "Clear";
    document.getElementById("res-temp-val").textContent = `${Math.round(data.main?.temp || 0)}┬░`;
    document.getElementById("res-feels-like").textContent = `Feels like ${Math.round(data.main?.feels_like || 0)}┬░`;
    document.getElementById("res-weather-icon").src = getWeatherIconPath(data.weather?.[0]?.main);

    document.getElementById("res-wind").textContent = `${Math.round((data.wind?.speed || 0) * 3.6)} km/h`;
    document.getElementById("res-humidity").textContent = `${data.main?.humidity || 0}%`;
    document.getElementById("res-pressure").textContent = `${data.main?.pressure || 1013} hPa`;
    document.getElementById("res-visibility").textContent = `${((data.visibility || 10000) / 1000).toFixed(1)} km`;

    // Save as last city for main dashboard
    localStorage.setItem("aero_last_lat", loc.lat);
    localStorage.setItem("aero_last_lon", loc.lon);
    localStorage.setItem("aero_last_city", loc.name);

    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth" });
    showToast(`Found weather for ${loc.name}!`);
  } catch (err) {
    console.error("Search error:", err);
    showToast("Failed to fetch weather data.", true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("dedicated-search-input");
  const searchBtn = document.getElementById("search-action-btn");
  const saveFavBtn = document.getElementById("save-favorite-btn");

  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        searchCity(searchInput.value);
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      searchCity(searchInput.value);
    });
  }

  // Quick Chips
  document.querySelectorAll(".search-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const city = chip.getAttribute("data-city");
      if (searchInput) searchInput.value = city;
      searchCity(city);
    });
  });

  // Save to Favorites
  if (saveFavBtn) {
    saveFavBtn.addEventListener("click", () => {
      if (!lastFoundLocation) return;
      const saved = JSON.parse(localStorage.getItem("aero_saved_cities")) || [];
      const exists = saved.some(c => c.name.toLowerCase() === lastFoundLocation.name.toLowerCase());

      if (exists) {
        showToast(`${lastFoundLocation.name} is already saved in your favorites.`);
        return;
      }

      saved.push(lastFoundLocation);
      localStorage.setItem("aero_saved_cities", JSON.stringify(saved));
      showToast(`Saved ${lastFoundLocation.name} to favorites!`);
    });
  }
});

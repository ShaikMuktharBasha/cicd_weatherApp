// Live date, day, and time updater
function updateLiveDate() {
    const dateElem = document.querySelector('.date');
    if (!dateElem) return;
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const day = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    const time = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'});
    dateElem.textContent = `${day}, ${month} ${date}, ${year} | ${time}`;
}

setInterval(updateLiveDate, 1000);
updateLiveDate();
let apiKey = "1e3e8f230b6064d27976e41163a82b77";
const searchInput = document.querySelector('.searchinput');
let autocompleteBox = null;

// Create autocomplete box
function createAutocompleteBox() {
    autocompleteBox = document.createElement('div');
    autocompleteBox.className = 'autocomplete-box';
    autocompleteBox.style.position = 'absolute';
    autocompleteBox.style.background = 'var(--card-bg)';
    autocompleteBox.style.border = '1px solid #3b82f6';
    autocompleteBox.style.borderRadius = '12px';
    autocompleteBox.style.zIndex = 1000;
    autocompleteBox.style.width = searchInput.offsetWidth + 'px';
    autocompleteBox.style.maxHeight = '150px';
    autocompleteBox.style.overflowY = 'auto';
    autocompleteBox.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
    autocompleteBox.style.display = 'none';
    searchInput.parentNode.appendChild(autocompleteBox);
}

createAutocompleteBox();

// Fetch city suggestions from OpenWeatherMap
async function fetchCitySuggestions(query) {
    if (!query) return [];
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(item => `${item.name}${item.state ? ', ' + item.state : ''}, ${item.country}`);
}

searchInput.addEventListener('input', async function () {
    const value = searchInput.value.trim();
    if (!value) {
        autocompleteBox.style.display = 'none';
        return;
    }
    const suggestions = await fetchCitySuggestions(value);
    if (suggestions.length === 0) {
        autocompleteBox.style.display = 'none';
        return;
    }
    autocompleteBox.innerHTML = '';
    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.textContent = suggestion;
        div.style.padding = '10px 12px';
        div.style.cursor = 'pointer';
        div.style.color = 'var(--font-color-main)';
        div.style.borderBottom = '1px solid rgba(59, 130, 246, 0.2)';
        div.style.transition = 'background 0.2s ease';
        div.addEventListener('mousedown', function () {
            searchInput.value = suggestion;
            autocompleteBox.style.display = 'none';
        });
        div.addEventListener('mouseenter', function () {
            div.style.background = 'rgba(59, 130, 246, 0.1)';
        });
        div.addEventListener('mouseleave', function () {
            div.style.background = 'transparent';
        });
        autocompleteBox.appendChild(div);
    });
    const rect = searchInput.getBoundingClientRect();
    autocompleteBox.style.top = (searchInput.offsetTop + searchInput.offsetHeight) + 'px';
    autocompleteBox.style.left = searchInput.offsetLeft + 'px';
    autocompleteBox.style.display = 'block';
});

document.addEventListener('click', function (e) {
    if (autocompleteBox && !autocompleteBox.contains(e.target) && e.target !== searchInput) {
        autocompleteBox.style.display = 'none';
    }
});
const cityBox = document.querySelector('.city-box');
const errorMessage = document.querySelector('.error-message');
const normalMessage = document.querySelector('.normal-message');
const addedMessage = document.querySelector('.added-message');
const addSection = document.querySelector('.add-section');
const addButton = document.querySelector('.button');
const btnIcon = document.querySelector('.btn-icon');
let modalTimeout = null;
let modalOpenTime = 0;

// Toggle add section
addButton.addEventListener('click', () => {
    if (addSection.classList.contains('open')) {
        // Check if modal has been open for at least 5 seconds
        const timeElapsed = Date.now() - modalOpenTime;
        if (timeElapsed >= 5000) {
            closeModal();
        } else {
            // Show message that modal needs to stay open longer
            showTemporaryMessage('Please wait 5 seconds before closing', 2000);
        }
    } else {
        openModal();
    }
});

function openModal() {
    addSection.classList.add('open');
    btnIcon.className = 'fa-solid fa-circle-xmark btn-icon';
    document.body.classList.add('modal-open');
    modalOpenTime = Date.now();

    // Start countdown display
    startCountdown();

    // Auto-close after 5 seconds if no interaction
    modalTimeout = setTimeout(() => {
        if (addSection.classList.contains('open')) {
            closeModal();
        }
    }, 5000);
}

function closeModal() {
    addSection.classList.remove('open');
    btnIcon.className = 'fa-solid fa-circle-plus btn-icon';
    document.body.classList.remove('modal-open');
    if (modalTimeout) {
        clearTimeout(modalTimeout);
        modalTimeout = null;
    }
    // Remove countdown
    removeCountdown();
}

function startCountdown() {
    // Remove any existing countdown
    removeCountdown();

    // Create countdown container
    const countdown = document.createElement('div');
    countdown.className = 'countdown-timer';
    countdown.innerHTML = `
        <div class="countdown-text">Auto-close in <span class="countdown-number">5</span>s</div>
        <div class="countdown-bar">
            <div class="countdown-progress"></div>
        </div>
    `;

    countdown.style.cssText = `
        position: absolute;
        top: 10px;
        right: 20px;
        background: rgba(59, 130, 246, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        z-index: 1001;
        backdrop-filter: blur(5px);
    `;

    addSection.appendChild(countdown);

    // Animate countdown
    let timeLeft = 5;
    const countdownNumber = countdown.querySelector('.countdown-number');
    const countdownProgress = countdown.querySelector('.countdown-progress');

    countdownProgress.style.cssText = `
        height: 3px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 2px;
        width: 100%;
        transition: width 1s linear;
    `;

    const interval = setInterval(() => {
        timeLeft--;
        countdownNumber.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(interval);
            removeCountdown();
        }
    }, 1000);

    // Store interval for cleanup
    countdown.dataset.intervalId = interval;
}

function removeCountdown() {
    const countdown = document.querySelector('.countdown-timer');
    if (countdown) {
        const intervalId = countdown.dataset.intervalId;
        if (intervalId) {
            clearInterval(intervalId);
        }
        countdown.remove();
    }
}

function showTemporaryMessage(message, duration = 2000) {
    // Remove any existing temporary message
    const existingMsg = document.querySelector('.temp-message');
    if (existingMsg) {
        existingMsg.remove();
    }

    // Create and show temporary message
    const tempMsg = document.createElement('div');
    tempMsg.className = 'temp-message';
    tempMsg.textContent = message;
    tempMsg.style.cssText = `
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1001;
        pointer-events: none;
    `;

    addSection.appendChild(tempMsg);

    // Remove after duration
    setTimeout(() => {
        if (tempMsg.parentNode) {
            tempMsg.remove();
        }
    }, duration);
}


// Add input event listener to reset timer when user types
searchInput.addEventListener('input', () => {
    if (addSection.classList.contains('open') && modalTimeout) {
        // Reset the timer when user starts typing
        clearTimeout(modalTimeout);
        removeCountdown();
        startCountdown();

        modalTimeout = setTimeout(() => {
            if (addSection.classList.contains('open')) {
                closeModal();
            }
        }, 5000);
    }
});

// Add city on Enter and persist in localStorage
searchInput.addEventListener('keydown', async function (event) {
    if (event.key === 'Enter') {
        const cityName = searchInput.value.trim();
        if (!cityName) return;
        const data = await fetchCityWeather(cityName);
        if (data) {
            addCityBox(data);
            saveCityToStorage(data.name);
            errorMessage.style.display = 'none';
            normalMessage.style.display = 'none';
            addedMessage.textContent = 'Successfully added ✔';
            addedMessage.style.display = 'block';
            // Auto-close popup after 1s
            setTimeout(() => {
                closeModal();
                addedMessage.style.display = 'none';
            }, 1000);
        } else {
            errorMessage.style.display = 'block';
            normalMessage.style.display = 'none';
            addedMessage.style.display = 'none';
        }
        searchInput.value = '';
    }
});

function saveCityToStorage(cityName) {
    let cities = JSON.parse(localStorage.getItem('worldCities') || '[]');
    if (!cities.includes(cityName)) {
        cities.push(cityName);
        localStorage.setItem('worldCities', JSON.stringify(cities));
    }
}

async function loadCitiesFromStorage() {
    let cities = JSON.parse(localStorage.getItem('worldCities') || '[]');
    for (const city of cities) {
        const data = await fetchCityWeather(city);
        if (data) addCityBox(data);
    }
}

// Load cities on page load
window.addEventListener('DOMContentLoaded', loadCitiesFromStorage);

async function fetchCityWeather(cityName) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${cityName}&appid=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        return data;
    } catch {
        return null;
    }
}

function getWeatherIcon(main) {
    if (main === "Rain") return "img/rain.png";
    if (main === "Clear" || main === "Clear Sky") return "img/sun.png";
    if (main === "Snow") return "img/snow.png";
    if (main === "Clouds" || main === "Smoke") return "img/cloud.png";
    if (main === "Mist" || main === "Fog") return "img/mist.png";
    if (main === "Haze") return "img/haze.png";
    if (main === "Thunderstorm") return "img/thunderstorm.png";
    return "img/sun.png";
}

function addCityBox(data) {
    const box = document.createElement('div');
    box.className = 'box';
    box.innerHTML = `
        <div class="weather-box">
            <div class="weather-header">
                <div class="city-name">${data.name}, ${data.sys.country}</div>
                <div class="weather-description">${data.weather[0].description}</div>
            </div>
            <div class="weather-main">
                <div class="temp-section">
                    <div class="current-temp">${Math.floor(data.main.temp)}°</div>
                    <div class="feels-like">Feels like ${Math.floor(data.main.feels_like)}°</div>
                </div>
                <div class="weather-icon">
                    <img src="${getWeatherIcon(data.weather[0].main)}" alt="${data.weather[0].main}" />
                </div>
            </div>
            <div class="weather-details">
                <div class="detail-item">
                    <i class="fa-solid fa-droplet"></i>
                    <span>${data.main.humidity}%</span>
                </div>
                <div class="detail-item">
                    <i class="fa-solid fa-wind"></i>
                    <span>${Math.floor(data.wind.speed)} m/s</span>
                </div>
                <div class="detail-item">
                    <i class="fa-solid fa-gauge"></i>
                    <span>${data.main.pressure} hPa</span>
                </div>
                <div class="detail-item">
                    <i class="fa-solid fa-temperature-half"></i>
                    <span>${Math.floor(data.main.temp_min)}°/${Math.floor(data.main.temp_max)}°</span>
                </div>
            </div>
            <div class="sun-times">
                <div class="sun-item">
                    <i class="fa-solid fa-sun"></i>
                    <span>${new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
                <div class="sun-item">
                    <i class="fa-solid fa-moon"></i>
                    <span>${new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
            </div>
        </div>
    `;
    cityBox.appendChild(box);
}

// Weather Map System with Leaflet
class WeatherMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentView = 'temperature';
        this.regions = [];
        this.initializeMap();
        this.setupMapControls();
    }

    initializeMap() {
        const mapContainer = document.querySelector('.weather-map');
        console.log('World Map container found:', mapContainer);
        if (!mapContainer) {
            console.error('World Map container not found!');
            return;
        }

        // Initialize Leaflet map centered on India
        this.map = L.map(mapContainer).setView([20.5937, 78.9629], 5);
        console.log('World Map initialized:', this.map);

        // Add OpenStreetMap tiles
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(this.map);

        // Define major cities/regions for weather map
        this.regions = [
            { id: 'mumbai', name: 'Mumbai', lat: 19.0760, lng: 72.8777, state: 'MH' },
            { id: 'delhi', name: 'Delhi', lat: 28.7041, lng: 77.1025, state: 'DL' },
            { id: 'bangalore', name: 'Bangalore', lat: 12.9716, lng: 77.5946, state: 'KA' },
            { id: 'chennai', name: 'Chennai', lat: 13.0827, lng: 80.2707, state: 'TN' },
            { id: 'kolkata', name: 'Kolkata', lat: 22.5726, lng: 88.3639, state: 'WB' },
            { id: 'hyderabad', name: 'Hyderabad', lat: 17.3850, lng: 78.4867, state: 'TS' },
            { id: 'pune', name: 'Pune', lat: 18.5204, lng: 73.8567, state: 'MH' },
            { id: 'ahmedabad', name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, state: 'GJ' },
            { id: 'jaipur', name: 'Jaipur', lat: 26.9124, lng: 75.7873, state: 'RJ' },
            { id: 'surat', name: 'Surat', lat: 21.1702, lng: 72.8311, state: 'GJ' },
            { id: 'lucknow', name: 'Lucknow', lat: 26.8467, lng: 80.9462, state: 'UP' },
            { id: 'kanpur', name: 'Kanpur', lat: 26.4499, lng: 80.3319, state: 'UP' },
            { id: 'nagpur', name: 'Nagpur', lat: 21.1458, lng: 79.0882, state: 'MH' },
            { id: 'indore', name: 'Indore', lat: 22.7196, lng: 75.8577, state: 'MP' },
            { id: 'thane', name: 'Thane', lat: 19.2183, lng: 72.9781, state: 'MH' },
            { id: 'bhopal', name: 'Bhopal', lat: 23.2599, lng: 77.4126, state: 'MP' },
            { id: 'visakhapatnam', name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, state: 'AP' },
            { id: 'pimpri-chinchwad', name: 'Pimpri', lat: 18.6298, lng: 73.7997, state: 'MH' },
            { id: 'patna', name: 'Patna', lat: 25.5941, lng: 85.1376, state: 'BR' },
            { id: 'vadodara', name: 'Vadodara', lat: 22.3072, lng: 73.1812, state: 'GJ' },
            { id: 'ghaziabad', name: 'Ghaziabad', lat: 28.6692, lng: 77.4538, state: 'UP' },
            { id: 'ludhiana', name: 'Ludhiana', lat: 30.9010, lng: 75.8573, state: 'PB' }
        ];

        this.updateWeatherData();
    }

    async updateWeatherData() {
        for (const region of this.regions) {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${region.lat}&lon=${region.lng}&units=metric&appid=${apiKey}`
                );
                const data = await response.json();
                region.weather = data.weather[0];
                region.temperature = Math.round(data.main.temp);
                region.humidity = data.main.humidity;
                region.windSpeed = data.wind.speed;
            } catch (error) {
                console.error(`Error fetching weather for ${region.name}:`, error);
                region.weather = { main: 'Clear', description: 'Clear sky' };
                region.temperature = 20;
                region.humidity = 50;
                region.windSpeed = 5;
            }
        }
        this.renderWeatherMarkers();
    }

    renderWeatherMarkers() {
        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        this.regions.forEach(region => {
            const marker = this.createWeatherMarker(region);
            this.markers.push(marker);
        });
    }

    createWeatherMarker(region) {
        const iconHtml = this.getWeatherIcon(region.weather.main);
        const popupContent = this.createPopupContent(region);

        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'weather-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const marker = L.marker([region.lat, region.lng], { icon: customIcon })
            .addTo(this.map)
            .bindPopup(popupContent);

        return marker;
    }

    getWeatherIcon(weatherMain) {
        const iconMap = {
            'Clear': '<i class="fas fa-sun" style="color: #FFD700;"></i>',
            'Clouds': '<i class="fas fa-cloud" style="color: #B0C4DE;"></i>',
            'Rain': '<i class="fas fa-cloud-rain" style="color: #4682B4;"></i>',
            'Drizzle': '<i class="fas fa-cloud-rain" style="color: #4682B4;"></i>',
            'Thunderstorm': '<i class="fas fa-bolt" style="color: #FFD700;"></i>',
            'Snow': '<i class="fas fa-snowflake" style="color: #FFFFFF;"></i>',
            'Mist': '<i class="fas fa-smog" style="color: #D3D3D3;"></i>',
            'Fog': '<i class="fas fa-smog" style="color: #D3D3D3;"></i>',
            'Haze': '<i class="fas fa-smog" style="color: #D3D3D3;"></i>'
        };
        return iconMap[weatherMain] || iconMap['Clear'];
    }

    createPopupContent(region) {
        return `
            <div style="font-family: Arial, sans-serif; min-width: 200px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">${region.name}, ${region.state}</h4>
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    ${this.getWeatherIcon(region.weather.main)}
                    <span style="margin-left: 8px; font-size: 18px; font-weight: bold;">${region.temperature}°C</span>
                </div>
                <p style="margin: 4px 0; color: #666;">${region.weather.description}</p>
                <div style="font-size: 12px; color: #888;">
                    <div>Humidity: ${region.humidity}%</div>
                    <div>Wind: ${region.windSpeed} m/s</div>
                </div>
            </div>
        `;
    }

    setupMapControls() {
        const controlButtons = document.querySelectorAll('.map-control-btn');
        controlButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                controlButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                // Update current view
                this.currentView = button.dataset.view;
                // For now, just log the view change
                console.log('Map view changed to:', this.currentView);
            });
        });
    }
}

// Initialize weather map when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('World page loaded, initializing weather map...');
    const weatherMap = new WeatherMap();
});

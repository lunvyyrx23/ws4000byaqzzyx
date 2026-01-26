const cityEl = document.getElementById('city-name');
const statusEl = document.getElementById('status');
const detailsEl = document.getElementById('details');

// Helper to fetch JSON data
async function getData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
}

async function fetchWeather(lat, lon, displayName) {
    try {
        statusEl.textContent = "CONNECTING...";
        statusEl.classList.add('pulse');
        
        // 1. Get NWS Grid Point
        const pointsData = await getData(`https://api.weather.gov/points/${lat},${lon}`);
        
        // 2. Get Forecast from that point
        const forecastData = await getData(pointsData.properties.forecast);
        const current = forecastData.properties.periods[0];
        
        // Update UI
        cityEl.textContent = displayName;
        statusEl.style.display = "none";
        detailsEl.style.display = "block";
        
        document.getElementById('temp').textContent = current.temperature;
        document.getElementById('cond').textContent = current.shortForecast;
        document.getElementById('wind').textContent = `${current.windSpeed} ${current.windDirection}`;
    } catch (e) {
        statusEl.textContent = "NWS DATA UNAVAILABLE";
        statusEl.classList.remove('pulse');
        console.error(e);
    }
}

async function searchCity(query) {
    statusEl.style.display = "block";
    detailsEl.style.display = "none";
    statusEl.textContent = "LOCATING...";
    statusEl.classList.add('pulse');

    try {
        const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=1`;
        const data = await getData(searchUrl);
        
        if (data && data.length > 0) {
            const name = data[0].display_name.split(',')[0];
            fetchWeather(data[0].lat, data[0].lon, name);
        } else {
            statusEl.textContent = "CITY NOT FOUND";
            statusEl.classList.remove('pulse');
        }
    } catch (e) {
        statusEl.textContent = "CONNECTION ERROR";
        statusEl.classList.remove('pulse');
    }
}

function triggerPrompt() {
    const city = prompt("ENTER US CITY (e.g. Miami, FL):");
    if (city) searchCity(city);
}

// Controls
window.addEventListener('keydown', (e) => { 
    if (e.key === '/') {
        e.preventDefault();
        triggerPrompt();
    }
});

let lastTap = 0;
window.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
        e.preventDefault();
        triggerPrompt();
    }
    lastTap = now;
});

// Auto-detect location on startup
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (p) => fetchWeather(p.coords.latitude.toFixed(4), p.coords.longitude.toFixed(4), "LOCAL WEATHER"),
            () => { 
                statusEl.textContent = "READY - PRESS / TO START"; 
                statusEl.classList.remove('pulse'); 
            }
        );
    }
};

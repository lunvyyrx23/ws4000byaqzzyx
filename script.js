const PROXY = "https://api.allorigins.win/get?url=";

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase().replace(/,/g, "");
    document.getElementById('time').textContent = timeStr;
    document.getElementById('date').textContent = dateStr;
}
setInterval(updateClock, 1000);

// --- UPDATED WEATHER FETCH ---
async function fetchWeather(lat, lon) {
    try {
        const url = `https://api.weather.gov/points/${lat},${lon}`;
        // Using AllOrigins to bypass CORS issues
        const response = await fetch(`${PROXY}${encodeURIComponent(url)}`);
        const data = JSON.parse((await response.json()).contents);
        
        const forecastUrl = data.properties.forecast;
        const forecastRes = await fetch(`${PROXY}${encodeURIComponent(forecastUrl)}`);
        const forecastData = JSON.parse((await forecastRes.json()).contents);
        const current = forecastData.properties.periods[0];

        // Update UI
        document.getElementById('station-name').textContent = data.properties.relativeLocation.properties.city.toUpperCase();
        document.getElementById('big-temp').textContent = current.temperature + "°";
        document.getElementById('cond-text').textContent = current.shortForecast.toUpperCase();
        document.getElementById('wind-val').textContent = `${current.windDirection} ${current.windSpeed}`;
    } catch (err) {
        console.error(err);
        document.getElementById('station-name').textContent = "STATION ERROR - RETRYING";
    }
}

// Controls
function toggleDarkMode() { document.body.classList.toggle('dark-mode'); document.body.classList.toggle('light-mode'); }
function toggleFullscreen() { document.getElementById('screen').classList.toggle('full-mode'); }

async function manualSearch() {
    const city = document.getElementById('city-input').value;
    const geo = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`);
    const res = await geo.json();
    if(res[0]) fetchWeather(res[0].lat, res[0].lon);
}

window.onload = () => {
    updateClock();
    navigator.geolocation.getCurrentPosition(
        p => fetchWeather(p.coords.latitude, p.coords.longitude),
        () => fetchWeather(40.7128, -74.0060) // Default NYC
    );
};

const PROXY = "https://api.allorigins.win/get?url=";

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase().replace(/,/g, "");
    document.getElementById('time').textContent = timeStr;
    document.getElementById('date').textContent = dateStr;
}
setInterval(updateClock, 1000);

async function fetchWeather(lat, lon) {
    try {
        // Step 1: Get the Grid Point
        const pointUrl = `https://api.weather.gov/points/${lat},${lon}`;
        const pRes = await fetch(`${PROXY}${encodeURIComponent(pointUrl)}`);
        const pRaw = await pRes.json();
        const pData = JSON.parse(pRaw.contents);
        
        // Step 2: Get the Forecast
        const fUrl = pData.properties.forecast;
        const fRes = await fetch(`${PROXY}${encodeURIComponent(fUrl)}`);
        const fRaw = await fRes.json();
        const fData = JSON.parse(fRaw.contents);
        const cur = fData.properties.periods[0];

        // Step 3: Update Screen
        const city = pData.properties.relativeLocation.properties.city;
        const state = pData.properties.relativeLocation.properties.state;
        
        document.getElementById('station-name').textContent = `${city}, ${state}`.toUpperCase();
        document.getElementById('big-temp').textContent = cur.temperature + "°";
        document.getElementById('cond-text').textContent = cur.shortForecast.toUpperCase();
        document.getElementById('wind-val').textContent = `${cur.windDirection} ${cur.windSpeed}`;
    } catch (err) {
        document.getElementById('station-name').textContent = "OFFLINE - RETRYING";
        console.error("Weather Error:", err);
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}

function toggleFullscreen() {
    document.getElementById('screen').classList.toggle('full-mode');
}

async function manualSearch() {
    const val = document.getElementById('city-input').value;
    if(!val) return;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${val}`);
    const data = await res.json();
    if(data[0]) fetchWeather(data[0].lat, data[0].lon);
}

window.onload = () => {
    updateClock();
    navigator.geolocation.getCurrentPosition(
        p => fetchWeather(p.coords.latitude, p.coords.longitude),
        () => fetchWeather(40.7128, -74.0060) // Default NYC
    );
};

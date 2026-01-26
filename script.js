const PROXY = "https://api.allorigins.win/get?url=";

// --- CLOCK FUNCTION ---
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase().replace(/,/g, "");
    
    if(document.getElementById('time')) document.getElementById('time').textContent = timeStr;
    if(document.getElementById('date')) document.getElementById('date').textContent = dateStr;
}
setInterval(updateClock, 1000);

// --- DASHBOARD CONTROLS ---

function toggleDarkMode() {
    const body = document.body;
    const btn = document.getElementById('mode-btn');
    if (body.classList.contains('light-mode')) {
        body.classList.replace('light-mode', 'dark-mode');
        btn.textContent = "Light Mode";
    } else {
        body.classList.replace('dark-mode', 'light-mode');
        btn.textContent = "Dark Mode";
    }
}

function toggleFullscreen() {
    const screen = document.getElementById('screen');
    screen.classList.toggle('mini-mode');
    screen.classList.toggle('full-mode');
}

// --- WEATHER FETCHING LOGIC ---

async function fetchWeather(lat, lon) {
    try {
        // 1. Get Forecast Office
        const pUrl = `https://api.weather.gov/points/${lat},${lon}`;
        const pRes = await fetch(`${PROXY}${encodeURIComponent(pUrl)}`);
        const pData = JSON.parse((await pRes.json()).contents);
        
        // 2. Get Forecast Data
        const fRes = await fetch(`${PROXY}${encodeURIComponent(pData.properties.forecast)}`);
        const fData = JSON.parse((await fRes.json()).contents);
        const cur = fData.properties.periods[0];

        // 3. Get Station Name
        const sRes = await fetch(`${PROXY}${encodeURIComponent(pData.properties.observationStations)}`);
        const sData = JSON.parse((await sRes.json()).contents);
        
        // Update Screen
        document.getElementById('station-name').textContent = sData.features[0].properties.name.toUpperCase();
        document.getElementById('big-temp').textContent = cur.temperature + "°";
        document.getElementById('cond-text').textContent = cur.shortForecast.toUpperCase();
        document.getElementById('wind-val').textContent = `${cur.windDirection} ${cur.windSpeed}`;
    } catch (err) {
        document.getElementById('station-name').textContent = "STATION ERROR";
    }
}

// --- SEARCH WITH CONFIRMATION ---

async function manualSearch() {
    const input = document.getElementById('city-input').value;
    if (!input) return;

    try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`);
        const geoData = await geoRes.json();
        
        if (geoData.length > 0) {
            const cityName = geoData[0].display_name.split(',')[0];
            const confirmGo = confirm(`Change weather station to: ${cityName}?`);
            
            if (confirmGo) {
                fetchWeather(geoData[0].lat, geoData[0].lon);
                document.getElementById('city-input').value = ""; // Clear box
            }
        } else {
            alert("Location not found.");
        }
    } catch (err) {
        alert("Search error.");
    }
}

// --- INITIAL LOAD ---
window.onload = () => {
    updateClock();
    navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4)),
        () => { document.getElementById('station-name').textContent = "USE SEARCH BELOW"; }
    );
};

const PROXY = "https://api.allorigins.win/get?url=";

function updateClock() {
    const now = new Date();
    document.getElementById('time').textContent = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase();
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase().replace(/,/g, "");
}
setInterval(updateClock, 1000);

// --- FETCHING LOGIC ---
async function fetchWeather(lat, lon) {
    try {
        const pRes = await fetch(`${PROXY}${encodeURIComponent(`https://api.weather.gov/points/${lat},${lon}`)}`);
        const pData = JSON.parse((await pRes.json()).contents);
        
        const fRes = await fetch(`${PROXY}${encodeURIComponent(pData.properties.forecast)}`);
        const fData = JSON.parse((await fRes.json()).contents);
        const cur = fData.properties.periods[0];

        const sRes = await fetch(`${PROXY}${encodeURIComponent(pData.properties.observationStations)}`);
        const sData = JSON.parse((await sRes.json()).contents);
        
        document.getElementById('station-name').textContent = sData.features[0].properties.name.toUpperCase();
        document.getElementById('big-temp').textContent = cur.temperature + "°";
        document.getElementById('cond-text').textContent = cur.shortForecast.toUpperCase();
        document.getElementById('wind-val').textContent = `${cur.windDirection} ${cur.windSpeed}`;
    } catch (err) {
        document.getElementById('station-name').textContent = "STATION ERROR";
    }
}

// --- SEARCH LOGIC (The "/" and Double-Tap) ---
async function searchCity() {
    const input = prompt("ENTER CITY, STATE OR ZIP CODE:");
    if (!input) return;

    document.getElementById('station-name').textContent = "SEARCHING...";
    try {
        // Use Nominatim to turn the text into Lat/Lon
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`);
        const geoData = await geoRes.json();
        if (geoData.length > 0) {
            fetchWeather(geoData[0].lat, geoData[0].lon);
        } else {
            alert("CITY NOT FOUND");
            document.getElementById('station-name').textContent = "READY";
        }
    } catch (err) {
        alert("SEARCH ERROR");
    }
}

// Listen for "/" key
window.addEventListener('keydown', (e) => {
    if (e.key === '/') {
        e.preventDefault();
        searchCity();
    }
});

// Listen for Double-Tap (iPad friendly)
let lastTap = 0;
window.addEventListener('touchend', (e) => {
    const curTime = new Date().getTime();
    const tapLen = curTime - lastTap;
    if (tapLen < 300 && tapLen > 0) {
        e.preventDefault();
        searchCity();
    }
    lastTap = curTime;
});

window.onload = () => {
    updateClock();
    navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4)),
        () => { document.getElementById('station-name').textContent = "TAP SCREEN TO SEARCH"; }
    );
};

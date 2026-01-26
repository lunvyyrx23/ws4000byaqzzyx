const PROXY = "https://api.allorigins.win/get?url=";

function updateClock() {
    const now = new Date();
    document.getElementById('time').textContent = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase();
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase().replace(/,/g, "");
}
setInterval(updateClock, 1000);

async function fetchWeather(lat, lon) {
    try {
        const pUrl = `https://api.weather.gov/points/${lat},${lon}`;
        const pRes = await fetch(`${PROXY}${encodeURIComponent(pUrl)}`);
        const pData = JSON.parse((await pRes.json()).contents);
        
        const fRes = await fetch(`${PROXY}${encodeURIComponent(pData.properties.forecast)}`);
        const fData = JSON.parse((await fRes.json()).contents);
        const cur = fData.properties.periods[0];

        // Fetch local station name
        const sRes = await fetch(`${PROXY}${encodeURIComponent(pData.properties.observationStations)}`);
        const sData = JSON.parse((await sRes.json()).contents);
        
        document.getElementById('station-name').textContent = sData.features[0].properties.name.toUpperCase();
        document.getElementById('big-temp').textContent = cur.temperature + "°";
        document.getElementById('cond-text').textContent = cur.shortForecast.toUpperCase();
        document.getElementById('wind-val').textContent = `${cur.windDirection} ${cur.windSpeed}`;

    } catch (err) {
        document.getElementById('station-name').textContent = "STATION UNAVAILABLE";
    }
}

window.onload = () => {
    updateClock();
    navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4)),
        () => { document.getElementById('station-name').textContent = "LOCATION BLOCKED"; }
    );
};

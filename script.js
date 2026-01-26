const PROXY = "https://api.allorigins.win/get?url=";

function updateClock() {
    const now = new Date();
    document.getElementById('time').textContent = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase();
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase().replace(/,/g, "");
}
setInterval(updateClock, 1000);

async function fetchWeather(lat, lon) {
    try {
        // Step 1: Get Station Metadata
        const pRes = await fetch(`${PROXY}${encodeURIComponent(`https://api.weather.gov/points/${lat},${lon}`)}`);
        const pData = JSON.parse((await pRes.json()).contents);
        
        // Step 2: Get Observations (METAR)
        const sRes = await fetch(`${PROXY}${encodeURIComponent(pData.properties.observationStations)}`);
        const sData = JSON.parse((await sRes.json()).contents);
        const obsRes = await fetch(`${PROXY}${encodeURIComponent(`${sData.features[0].id}/observations/latest`)}`);
        const ob = JSON.parse((await obsRes.json()).contents).properties;

        // Update UI with Observation Data
        document.getElementById('station-name').textContent = sData.features[0].properties.name.toUpperCase();
        document.getElementById('big-temp').textContent = Math.round((ob.temperature.value * 9/5) + 32) + "°";
        document.getElementById('cond-text').textContent = ob.textDescription.toUpperCase();
        document.getElementById('hum').textContent = Math.round(ob.relativeHumidity.value) + "%";
        document.getElementById('dew').textContent = Math.round((ob.dewpoint.value * 9/5) + 32) + "°";
        document.getElementById('vis').textContent = Math.round(ob.visibility.value / 1609.34) + " MI.";
        document.getElementById('pres').textContent = (ob.barometricPressure.value / 3386.39).toFixed(2);
        
        // Handling Wind
        const speed = Math.round(ob.windSpeed.value * 0.621371) || 0;
        document.getElementById('wind-val').textContent = speed > 0 ? `${ob.windDirection.value}° ${speed}` : "CALM";

    } catch (err) {
        document.getElementById('cond-text').textContent = "ERROR LOADING DATA";
    }
}

window.onload = () => {
    navigator.geolocation.getCurrentPosition(pos => fetchWeather(pos.coords.latitude, pos.coords.longitude));
    updateClock();
};

/* =========================
   WEATHER.GOV API LAYER
   No UI here.
   Just data.
========================= */

let apiState = {
  lat: null,
  lon: null,
  forecastHourlyUrl: null,
  stationsUrl: null
};

/* =========================
   INITIALIZE BY CITY
   Uses weather.gov /points
========================= */

async function apiInitFromCity(city, state) {
  // Use NWS Geo endpoint instead of nominatim
  const geoRes = await fetch(
    `https://api.weather.gov/search?query=${encodeURIComponent(city)}`,
    { cache: "no-store" }
  );

  const geo = await geoRes.json();

  if (!geo?.features?.length) {
    throw new Error("City not found via NWS");
  }

  const coords = geo.features[0].geometry.coordinates;
  const lon = coords[0];
  const lat = coords[1];

  state.lat = lat;
  state.lon = lon;

  const pointRes = await fetch(
    `https://api.weather.gov/points/${lat},${lon}`,
    { cache: "no-store" }
  );

  const pointData = await pointRes.json();

  state.forecastHourlyUrl = pointData.properties.forecastHourly;
  state.stationsUrl = pointData.properties.observationStations;

  return { lat, lon };
}

/* =========================
   GET HOURLY FORECAST
========================= */

async function apiGetHourly(state) {
  if (!state.forecastHourlyUrl) throw new Error("Hourly URL missing");

  const res = await fetch(state.forecastHourlyUrl, { cache: "no-store" });
  const data = await res.json();

  return data.properties.periods || [];
}

/* =========================
   GET CURRENT OBS
========================= */

async function apiGetObservation(state) {
  if (!state.stationsUrl) throw new Error("Stations URL missing");

  const stationsRes = await fetch(state.stationsUrl, { cache: "no-store" });
  const stations = await stationsRes.json();

  const firstStation =
    stations?.features?.[0]?.properties?.stationIdentifier;

  if (!firstStation) return null;

  const obsRes = await fetch(
    `https://api.weather.gov/stations/${firstStation}/observations/latest`,
    { cache: "no-store" }
  );

  const obs = await obsRes.json();
  return obs.properties || null;
}

/* =========================
   REGIONAL ENGINE
   Accurate basemap pan
   + Station temp fetch
========================= */

/* ===== Basemap Projection ===== */

const BASEMAP_BOUNDS = {
  minLon: -125.0,
  maxLon: -66.5,
  minLat: 24.0,
  maxLat: 49.5
};

const BASEMAP_ZOOM = 560;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function mercY(latDeg) {
  const lat = clamp(latDeg, -85, 85) * Math.PI / 180;
  return Math.log(Math.tan(Math.PI / 4 + lat / 2));
}

function getBasemapPosition(lat, lon) {
  const xNorm =
    (lon - BASEMAP_BOUNDS.minLon) /
    (BASEMAP_BOUNDS.maxLon - BASEMAP_BOUNDS.minLon);

  const yMin = mercY(BASEMAP_BOUNDS.minLat);
  const yMax = mercY(BASEMAP_BOUNDS.maxLat);
  const yNow = mercY(lat);

  const yNorm = (yMax - yNow) / (yMax - yMin);

  const edge = clamp((100 / BASEMAP_ZOOM) * 160, 2, 8);

  const xPct = clamp(xNorm * 100, edge, 100 - edge);
  const yPct = clamp(yNorm * 100, edge, 100 - edge);

  return { xPct, yPct };
}

function panRegionalMap(lat, lon) {
  const { xPct, yPct } = getBasemapPosition(lat, lon);

  const screen = document.getElementById("ws4000-screen");

  screen.style.backgroundPosition = `center, ${xPct}% ${yPct}%`;
  screen.style.backgroundSize = `100% 100%, ${BASEMAP_ZOOM}%`;
}

/* =========================
   REGIONAL STATION FETCH
========================= */

const regionalStations = [
  { id: "KATL", name: "ATL", x: 14, y: 58 },
  { id: "KSAV", name: "SAV", x: 24, y: 72 },
  { id: "KCLT", name: "CLT", x: 66, y: 38 },
  { id: "KCAE", name: "CAE", x: 61, y: 49 },
  { id: "KCHS", name: "CHS", x: 50, y: 67 },
  { id: "KAGS", name: "AGS", x: 45, y: 57 }
];

async function fetchRegionalStations() {
  const promises = regionalStations.map(st =>
    fetch(
      `https://api.weather.gov/stations/${st.id}/observations/latest`,
      { cache: "no-store" }
    )
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const tempC = data?.properties?.temperature?.value;
        const tempF = tempC != null ? cToF(tempC) : "--";

        const desc = data?.properties?.textDescription || "Cloudy";

        return {
          ...st,
          temp: tempF,
          icon: getIconFromText(desc)
        };
      })
      .catch(() => ({
        ...st,
        temp: "--",
        icon: getIconFromText("Cloudy")
      }))
  );

  return Promise.all(promises);
}

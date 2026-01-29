/* =========================
   UNIT CONVERSIONS
========================= */

function mphFromKph(kph) {
  if (kph == null || Number.isNaN(kph)) return null;
  return Math.round(kph * 0.621371);
}

function fFromC(c) {
  if (c == null || Number.isNaN(c)) return null;
  return Math.round((c * 9/5) + 32);
}

function ftFromM(m) {
  if (m == null || Number.isNaN(m)) return null;
  return Math.round(m * 3.28084);
}

/* =========================
   WIND CHILL (NWS Formula)
========================= */

function calcWindChillF(tempF, windMph) {
  if (tempF == null || windMph == null) return null;
  if (tempF > 50) return null;
  if (windMph <= 3) return null;

  const v16 = Math.pow(windMph, 0.16);
  const wc =
    35.74 +
    0.6215 * tempF -
    35.75 * v16 +
    0.4275 * tempF * v16;

  return Math.round(wc);
}

/* =========================
   CEILING CALCULATION
========================= */

function ceilingFromObs(obsProps) {
  const layers = obsProps?.cloudLayers;
  if (!Array.isArray(layers) || !layers.length) return "--";

  const ceilingKinds = new Set(["BKN", "OVC", "VV"]);

  const ceilings = layers
    .filter(l =>
      ceilingKinds.has((l?.amount || "").toUpperCase()) &&
      l?.base?.value != null
    )
    .map(l => ftFromM(l.base.value))
    .filter(v => v != null);

  if (!ceilings.length) return "UNLM";

  return Math.min(...ceilings) + " FT";
}

/* =========================
   MAP PAN / MERCATOR
========================= */

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function mercY(latDeg) {
  const lat = clamp(latDeg, -85, 85) * Math.PI / 180;
  return Math.log(Math.tan(Math.PI / 4 + lat / 2));
}

function latLonToBasemapPosition(lat, lon, bounds, zoom) {
  const xNorm =
    (lon - bounds.minLon) /
    (bounds.maxLon - bounds.minLon);

  const yMin = mercY(bounds.minLat);
  const yMax = mercY(bounds.maxLat);
  const yNow = mercY(lat);

  const yNorm = (yMax - yNow) / (yMax - yMin);

  const edge = clamp((100 / zoom) * 160, 1.5, 10);

  return {
    xPct: clamp(xNorm * 100, edge, 100 - edge),
    yPct: clamp(yNorm * 100, edge, 100 - edge)
  };
}

/* =========================
   ICON MAPPER
========================= */

function getGifName(txt, isList = false) {
  const baseUrl = isList
    ? "https://wsbylunv.neocities.org/yea/folder/"
    : "https://wsbylunv.neocities.org/yea/";

  txt = (txt || "").toLowerCase();

  let icon = "Cloudy.gif";

  if (txt.includes("thunder") || txt.includes("t-storm"))
    icon = "Scattered-Tstorms-1992.gif";
  else if (txt.includes("mostly cloudy"))
    icon = "Mostly-Cloudy-1992.gif";
  else if (txt.includes("partly cloudy"))
    icon = "Partly-Cloudy.gif";
  else if (txt.includes("clear") || txt.includes("sunny") || txt.includes("fair"))
    icon = "Sunny.gif";
  else if (txt.includes("rain") || txt.includes("showers"))
    icon = "Rain-1992.gif";

  return baseUrl + icon;
}

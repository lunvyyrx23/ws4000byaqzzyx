/* =========================
   PAGE RENDERERS
   UI only. No API calls.
========================= */

function renderCurrent(hourlyData, obsData) {
  if (!hourlyData?.length) return;

  const now = hourlyData[0];

  document.getElementById("temp-value").innerText =
    (now.temperature ?? "--") + "°";

  document.getElementById("cond-text").innerText =
    (now.shortForecast || "").toUpperCase();

  document.getElementById("weather-icon").src =
    getIconFromText(now.shortForecast);

  const stats = document.getElementById("stats");

  if (!obsData) {
    stats.innerHTML = "NO OBS DATA";
    return;
  }

  const humidity =
    obsData.relativeHumidity?.value != null
      ? Math.round(obsData.relativeHumidity.value) + "%"
      : "--";

  const dew =
    obsData.dewpoint?.value != null
      ? cToF(obsData.dewpoint.value) + "°"
      : "--";

  stats.innerHTML =
    `HUMIDITY: ${humidity}<br>` +
    `DEWPOINT: ${dew}`;
}

/* =========================
   LOCAL OBS PAGE
========================= */

function renderLocalObs(obsData) {
  const wrap = document.getElementById("obs-rows");

  if (!obsData) {
    wrap.innerHTML = `<div style="padding:40px;">NO OBS DATA</div>`;
    return;
  }

  const temp =
    obsData.temperature?.value != null
      ? cToF(obsData.temperature.value) + "°"
      : "--";

  const wind =
    obsData.windSpeed?.value != null
      ? kphToMph(obsData.windSpeed.value) + " MPH"
      : "--";

  wrap.innerHTML = `
    <div class="obs-row">
      <div>TEMPERATURE</div><div></div><div></div>
      <div style="text-align:right;">${temp}</div>
    </div>
    <div class="obs-row">
      <div>WIND</div><div></div><div></div>
      <div style="text-align:right;">${wind}</div>
    </div>
  `;
}

/* =========================
   HOURLY PAGE
========================= */

function renderHourly(hourlyData) {
  const wrap = document.getElementById("hourly-rows");

  if (!hourlyData?.length) {
    wrap.innerHTML = `<div style="padding:40px;">NO HOURLY DATA</div>`;
    return;
  }

  wrap.innerHTML = hourlyData.slice(0, 8).map(p => `
    <div class="row-style hourly-row">
      <div>${formatTime(p.startTime)}</div>
      <div><img class="list-icon" src="${getIconFromText(p.shortForecast)}"></div>
      <div style="display:flex; justify-content:space-between;">
        <div>${p.shortForecast.toUpperCase()}</div>
        <div class="temp-num">${p.temperature}°</div>
      </div>
    </div>
  `).join("");
}

/* =========================
   TRAVEL PAGE
========================= */

function renderTravel(travelData) {
  const wrap = document.getElementById("travel-rows");

  if (!travelData?.length) {
    wrap.innerHTML = `<div style="padding:40px;">NO TRAVEL DATA</div>`;
    return;
  }

  wrap.innerHTML = travelData.map(row => `
    <div class="row-style travel-row">
      <div>${row.city}</div>
      <div><img class="list-icon" src="${row.icon}"></div>
      <div class="temp-num">${row.temp}°</div>
      <div class="wind-num">${row.wind}</div>
    </div>
  `).join("");
}

/* =========================
   REGIONAL PAGE
========================= */

function renderRegional(stationsData) {
  const obsTable = document.getElementById("obs-table");

  if (!stationsData?.length) {
    obsTable.innerHTML = `<div style="padding:40px;">NO REGIONAL DATA</div>`;
    return;
  }

  obsTable.innerHTML = stationsData.map(st => `
    <div style="position:absolute;
                left:${st.x}%;
                top:${st.y}%;
                transform:translate(-50%,-50%);
                display:flex;
                flex-direction:column;
                align-items:center;
                z-index:25;">
      <div style="color:white; font-size:36px;">${st.temp}</div>
      <img src="${st.icon}" style="width:55px;">
      <div style="color:#ffff00; font-size:18px;">${st.name}</div>
    </div>
  `).join("");
}

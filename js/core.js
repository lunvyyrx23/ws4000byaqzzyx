/* =========================
   CORE ENGINE
   Page Loop + Navigation
========================= */

const screen = document.getElementById("ws4000-screen");

let pageList = ["current", "local-obs", "hourly", "travel", "regional-obs"];
let pageIndex = 0;
let isPaused = false;
let loopTimer = null;

/* =========================
   PAGE LOOP
========================= */

function startLoop() {
  if (isPaused) return;
  clearTimeout(loopTimer);
  loopTimer = setTimeout(nextPage, 8000);
}

function nextPage() {
  if (isPaused) return;
  pageIndex = (pageIndex + 1) % pageList.length;
  setPage(pageList[pageIndex]);
  startLoop();
}

function togglePause() {
  isPaused = !isPaused;
  const btn = document.getElementById("pause-btn");
  btn.innerText = isPaused ? "RESUME EMULATOR" : "PAUSE EMULATOR";

  if (isPaused) clearTimeout(loopTimer);
  else startLoop();
}

function forcePage(page) {
  clearTimeout(loopTimer);
  pageIndex = pageList.indexOf(page);
  if (pageIndex < 0) pageIndex = 0;
  setPage(page);
  startLoop();
}

/* =========================
   PAGE SWITCHER
========================= */

function showOnly(ids) {
  const all = ["current-content","obs-table","hourly-content","travel-content"];
  all.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = ids.includes(id) ? "block" : "none";
  });
}

function setPage(page) {
  screen.classList.remove("travel-bg","regional-bg");

  if (page === "current") {
    document.getElementById("page-header").innerHTML = "CURRENT<br>CONDITIONS";
    showOnly(["current-content"]);
  }

  else if (page === "local-obs") {
    document.getElementById("page-header").innerHTML = "LOCAL<br>OBSERVATIONS";
    showOnly(["obs-table"]);
    if (typeof renderLocalObs === "function") renderLocalObs();
  }

  else if (page === "hourly") {
    document.getElementById("page-header").innerHTML = "HOURLY<br>FORECAST";
    showOnly(["hourly-content"]);
    if (typeof renderHourly === "function") renderHourly();
  }

  else if (page === "travel") {
    document.getElementById("page-header").innerHTML = "TRAVEL<br>FORECAST";
    screen.classList.add("travel-bg");
    showOnly(["travel-content"]);
    if (typeof renderTravel === "function") renderTravel();
  }

  else if (page === "regional-obs") {
    document.getElementById("page-header").innerHTML = "REGIONAL<br>OBSERVATIONS";
    screen.classList.add("regional-bg");
    showOnly(["obs-table"]);
    if (typeof updateRegionalDisplay === "function") updateRegionalDisplay();
  }
}

/* =========================
   SCANLINES
========================= */

let scanOn = true;

function toggleScanlines() {
  scanOn = !scanOn;
  document.body.classList.toggle("scan-off", !scanOn);

  const btn = document.getElementById("scan-btn");
  btn.innerText = scanOn ? "SCANLINES: ON" : "SCANLINES: OFF";
  btn.style.background = scanOn ? "#0b3" : "#555";
}

/* =========================
   INIT
========================= */

window.startEmulator = function () {
  setPage("current");
  pageIndex = 0;
  startLoop();
};

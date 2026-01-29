/* =========================
   MUSIC ENGINE
========================= */

const audioPlayer = document.getElementById("bg-audio");
const musicInfo = document.getElementById("music-info");

let playlist = [];
let shuffledQueue = [];
let currentTrackIndex = 0;
let musicStarted = false;
let muted = false;

/* ===== Default WS-style Playlist ===== */

const defaultPlaylist = [
  { name: "Catch the Sun", url: "https://raw.githubusercontent.com/netbymatt/ws4kp-music/main/Catch%20the%20Sun.mp3" },
  { name: "Crisp Day", url: "https://raw.githubusercontent.com/netbymatt/ws4kp-music/main/Crisp%20day.mp3" },
  { name: "Downpour", url: "https://raw.githubusercontent.com/netbymatt/ws4kp-music/main/Downpour.mp3" },
  { name: "Fall Colors", url: "https://raw.githubusercontent.com/netbymatt/ws4kp-music/main/Fall%20colors.mp3" },
  { name: "Moonlit Sky", url: "https://raw.githubusercontent.com/netbymatt/ws4kp-music/main/Moonlit%20sky.mp3" },
  { name: "Rolling Clouds", url: "https://raw.githubusercontent.com/netbymatt/ws4kp-music/main/Rolling%20Clouds.mp3" },
  { name: "Spring Shower", url: "https://raw.githubusercontent.com/netbymatt/ws4kp-music/main/Spring%20Shower.mp3" },
  { name: "Strong Breeze", url: "https://raw.githubusercontent.com/netbymatt/ws4kp-music/main/Strong%20Breeze.mp3" }
];

function initMusic() {
  playlist = [...defaultPlaylist];
  shufflePlaylist();
}

function shufflePlaylist() {
  shuffledQueue = [...playlist].sort(() => Math.random() - 0.5);
  currentTrackIndex = 0;
}

function playNextTrack() {
  if (!shuffledQueue.length || currentTrackIndex >= shuffledQueue.length) {
    shufflePlaylist();
  }

  const track = shuffledQueue[currentTrackIndex];
  currentTrackIndex++;

  audioPlayer.src = track.url;
  audioPlayer.muted = muted;

  audioPlayer.play()
    .then(() => {
      musicInfo.innerText = (track.name || "PLAYING").toUpperCase();
    })
    .catch(() => {
      musicInfo.innerText = "CLICK UPDATE FOR AUDIO";
    });
}

audioPlayer.onended = playNextTrack;

function startMusic() {
  if (!musicStarted) {
    initMusic();
    playNextTrack();
    musicStarted = true;
  } else {
    audioPlayer.play().catch(()=>{});
  }
}

function toggleMute() {
  muted = !muted;
  audioPlayer.muted = muted;

  document.getElementById("mute-btn").innerText =
    muted ? "UNMUTE MUSIC" : "MUTE MUSIC";
}

/* =========================
   External Playlist Loader
========================= */

async function loadExternalPlaylist() {
  const url = document.getElementById("playlistUrl").value.trim();
  if (!url) return;

  try {
    const r = await fetch(url, { cache: "no-store" });
    const j = await r.json();

    let tracks = null;

    if (Array.isArray(j)) tracks = j;
    else if (j && Array.isArray(j.tracks)) tracks = j.tracks;

    tracks = (tracks || [])
      .filter(t => t && typeof t.url === "string")
      .map(t => ({
        name: t.name || t.title || "TRACK",
        url: t.url
      }));

    if (!tracks.length) throw new Error("No tracks");

    playlist = tracks;
    shufflePlaylist();
    musicInfo.innerText = "PLAYLIST LOADED";

    if (musicStarted) playNextTrack();

  } catch (e) {
    console.error(e);
    musicInfo.innerText = "PLAYLIST LOAD FAILED";
  }
}

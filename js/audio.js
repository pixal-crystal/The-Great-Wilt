"use strict";
/* =====================================================================
   THE GREAT WILT — Ambient Music & Audio Engine
   Music: 6 Fantasy Ambient Tracks by AlkaKrab
   - Whispers of the Eldertree -> The Twilight Trunk (trunk)
   - Crystal Veil             -> The Glass-Marsh (glass)
   - Scepter of Shadows       -> The Silt-Floor (silt)
   - Realm of Emberlight      -> The Sun-Crown (sun)
   - Enchanted Labyrinth      -> The Iron Roots (roots)
   - Starsong Prophecy        -> Main Theme, Outskirts Tutorial & Ending
   ===================================================================== */

const MUSIC_TRACKS = {
  eldertree: {
    id: "eldertree",
    title: "Whispers of the Eldertree",
    file: "assets/music/whispers-of-the-eldertree.mp3",
    environment: "The Twilight Trunk",
    region: "trunk",
    desc: "Ancient wood, bark ridges, and glowing amber sap pools.",
  },
  crystal: {
    id: "crystal",
    title: "Crystal Veil",
    file: "assets/music/crystal-veil.mp3",
    environment: "The Glass-Marsh",
    region: "glass",
    desc: "Flooded ruins, solar glass, and prismatic moss.",
  },
  shadows: {
    id: "shadows",
    title: "Scepter of Shadows",
    file: "assets/music/scepter-of-shadows.mp3",
    environment: "The Silt-Floor",
    region: "silt",
    desc: "Sunken skyscrapers, toxic mist, and glowing spores.",
  },
  emberlight: {
    id: "emberlight",
    title: "Realm of Emberlight",
    file: "assets/music/realm-of-emberlight.mp3",
    environment: "The Sun-Crown",
    region: "sun",
    desc: "High-altitude golden canopy and open rope-bridges.",
  },
  labyrinth: {
    id: "labyrinth",
    title: "Enchanted Labyrinth",
    file: "assets/music/enchanted-labyrinth.mp3",
    environment: "The Iron Roots",
    region: "roots",
    desc: "Twisted subterranean roots and the ancient Root-Core.",
  },
  starsong: {
    id: "starsong",
    title: "Starsong Prophecy",
    file: "assets/music/starsong-prophecy.mp3",
    environment: "Main Theme & Outskirts",
    region: "tutorial",
    desc: "Mystical prophecy, canopy outskirts, and season's end.",
  },
};

const AUDIO_STORAGE_KEY = "greatWiltRPG_audio";

let audioUnlocked = false;
let musicVolume = 0.65;
let musicMuted = false;
let currentTrackId = null;
let currentAudio = null;
let fadingAudio = null;
let fadeTimer = 0;
const FADE_DURATION = 1.8; // seconds for smooth crossfade
let lastReportedTrack = null;
let previewOverrideId = null; // for testing/preview in settings

// Audio element cache to avoid garbage collection and reload latencies
const audioCache = {};

function getTrackAudio(id) {
  if (!MUSIC_TRACKS[id]) return null;
  if (!audioCache[id]) {
    const a = new Audio(MUSIC_TRACKS[id].file);
    a.loop = true;
    a.preload = "auto";
    a.addEventListener("ended", () => {
      // Safety fallback to guarantee looping
      if (a === currentAudio && !musicMuted) a.play().catch(() => {});
    });
    audioCache[id] = a;
  }
  return audioCache[id];
}

function loadAudioSettings() {
  try {
    const s = localStorage.getItem(AUDIO_STORAGE_KEY);
    if (s) {
      const p = JSON.parse(s);
      if (typeof p.volume === "number") musicVolume = Math.max(0, Math.min(1, p.volume));
      if (typeof p.muted === "boolean") musicMuted = p.muted;
    }
  } catch (e) {}
}

function saveAudioSettings() {
  try {
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify({
      volume: musicVolume,
      muted: musicMuted,
    }));
  } catch (e) {}
}

function getEffectiveTargetVolume() {
  if (musicMuted) return 0;
  // In encounter mode, duck slightly so kinetic ricochets and combat impacts have acoustic space
  const duck = (typeof mode !== "undefined" && mode === "encounter") ? 0.78 : 1.0;
  return musicVolume * duck;
}

function resolveEnvironmentTrack() {
  if (previewOverrideId && MUSIC_TRACKS[previewOverrideId]) {
    return previewOverrideId;
  }
  if (typeof mode !== "undefined") {
    if (mode === "title") return "starsong";
    if (mode === "ending") return "starsong";
  }
  const loc = (typeof G !== "undefined" && G && G.loc) ? G.loc : "title";
  if (loc === "tutorial") return "starsong";
  if (loc === "trunk") return "eldertree";
  if (loc === "glass") return "crystal";
  if (loc === "silt") return "shadows";
  if (loc === "sun") return "emberlight";
  if (loc === "roots") return "labyrinth";
  return "starsong";
}

function playTrack(trackId, immediate = false) {
  if (!MUSIC_TRACKS[trackId]) return;
  if (currentTrackId === trackId && currentAudio && !currentAudio.paused && !fadingAudio) {
    return;
  }

  const nextAudio = getTrackAudio(trackId);
  if (!nextAudio) return;

  const targetVol = getEffectiveTargetVolume();

  if (immediate || !currentAudio || currentAudio.paused) {
    if (currentAudio && currentAudio !== nextAudio) {
      currentAudio.pause();
      currentAudio.volume = 0;
    }
    if (fadingAudio && fadingAudio !== nextAudio) {
      fadingAudio.pause();
      fadingAudio.volume = 0;
      fadingAudio = null;
    }
    currentAudio = nextAudio;
    currentTrackId = trackId;
    fadeTimer = FADE_DURATION;
    currentAudio.volume = targetVol;
    if (audioUnlocked && !musicMuted) {
      currentAudio.play().catch(() => {});
    }
    notifyTrackChange(trackId);
    return;
  }

  // Crossfade transition
  if (fadingAudio && fadingAudio !== nextAudio) {
    fadingAudio.pause();
    fadingAudio.volume = 0;
  }
  fadingAudio = currentAudio;
  currentAudio = nextAudio;
  currentTrackId = trackId;
  fadeTimer = 0;

  currentAudio.volume = 0;
  if (audioUnlocked && !musicMuted) {
    currentAudio.play().catch(() => {});
  }
  notifyTrackChange(trackId);
}

function notifyTrackChange(trackId) {
  if (lastReportedTrack === trackId) return;
  lastReportedTrack = trackId;
  const track = MUSIC_TRACKS[trackId];
  if (!track) return;
  if (typeof mode !== "undefined" && mode === "world" && typeof toast === "function" && !musicMuted) {
    toast(`🎵 Now Playing: ${track.title} (${track.environment})`, "#aae0a4");
  }
  if (typeof renderHud === "function") renderHud();
}

function updateMusic(dt) {
  const desiredTrack = resolveEnvironmentTrack();

  if (desiredTrack !== currentTrackId) {
    playTrack(desiredTrack);
  }

  const targetVol = getEffectiveTargetVolume();

  // Progress crossfade
  if (fadingAudio) {
    fadeTimer += dt;
    const progress = Math.min(1, fadeTimer / FADE_DURATION);

    const inVol = Math.sin(progress * Math.PI * 0.5) * targetVol;
    const outVol = Math.cos(progress * Math.PI * 0.5) * targetVol;

    if (currentAudio) currentAudio.volume = Math.max(0, Math.min(1, inVol));
    if (fadingAudio) fadingAudio.volume = Math.max(0, Math.min(1, outVol));

    if (progress >= 1) {
      if (fadingAudio) {
        fadingAudio.pause();
        fadingAudio.volume = 0;
        fadingAudio = null;
      }
      if (currentAudio) currentAudio.volume = targetVol;
    }
  } else if (currentAudio) {
    // Volume smoothing for volume slider or mute/ducking changes
    if (Math.abs(currentAudio.volume - targetVol) > 0.02) {
      currentAudio.volume = currentAudio.volume + (targetVol - currentAudio.volume) * Math.min(1, dt * 6);
    } else {
      currentAudio.volume = targetVol;
    }
  }
}

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  ensureEnvironmentMusic();
}

function ensureEnvironmentMusic() {
  const targetTrack = resolveEnvironmentTrack();
  if (currentTrackId !== targetTrack || !currentAudio || currentAudio.paused) {
    playTrack(targetTrack, false);
  } else if (currentAudio && !musicMuted && currentAudio.paused) {
    currentAudio.play().catch(() => {});
  }
}

function toggleMusicMute() {
  unlockAudio();
  musicMuted = !musicMuted;
  saveAudioSettings();
  const targetVol = getEffectiveTargetVolume();
  if (currentAudio) {
    if (musicMuted) {
      currentAudio.volume = 0;
    } else {
      currentAudio.volume = targetVol;
      currentAudio.play().catch(() => {});
    }
  }
  const track = MUSIC_TRACKS[currentTrackId];
  const msg = musicMuted ? "🔇 Ambient Music Muted" : `🎵 Music Unmuted: ${track ? track.title : "Ambient"}`;
  if (typeof toast === "function") toast(msg, musicMuted ? "#ff9a9a" : "#6fcf6a");
  if (typeof renderHud === "function") renderHud();
  if (typeof refreshPanel === "function" && typeof panelOpen !== "undefined" && panelOpen) refreshPanel();
}

function setMusicVolume(val) {
  unlockAudio();
  musicVolume = Math.max(0, Math.min(1, val));
  if (musicMuted && musicVolume > 0) {
    musicMuted = false;
  }
  saveAudioSettings();
  if (currentAudio && !musicMuted) {
    currentAudio.volume = getEffectiveTargetVolume();
    if (currentAudio.paused) currentAudio.play().catch(() => {});
  }
}

function previewTrack(trackId) {
  unlockAudio();
  previewOverrideId = trackId;
  playTrack(trackId);
  const track = MUSIC_TRACKS[trackId];
  if (typeof toast === "function" && track) {
    toast(`Previewing: ${track.title} (${track.environment})`, "#ffe46a");
  }
  if (typeof refreshPanel === "function" && typeof panelOpen !== "undefined" && panelOpen) refreshPanel();
}

function clearPreview() {
  previewOverrideId = null;
  ensureEnvironmentMusic();
  if (typeof toast === "function") {
    toast("Resumed automatic environment music", "#6fcf6a");
  }
  if (typeof refreshPanel === "function" && typeof panelOpen !== "undefined" && panelOpen) refreshPanel();
}

function isMusicMuted() {
  return musicMuted;
}

function getMusicVolume() {
  return musicVolume;
}

function getCurrentTrackInfo() {
  return MUSIC_TRACKS[currentTrackId] || MUSIC_TRACKS[resolveEnvironmentTrack()];
}

function getPreviewTrackId() {
  return previewOverrideId;
}

// User interaction listeners for browser autoplay policy
["pointerdown", "keydown", "click", "touchstart"].forEach(evt => {
  window.addEventListener(evt, unlockAudio, { passive: true, capture: true });
});

// Initialize on script load
loadAudioSettings();

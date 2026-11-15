const VW = 384, VH = 240;
const cv = document.getElementById("game"), ctx = cv.getContext("2d");
let S = 3;
function resize() {
  S = Math.max(1, Math.floor(Math.min(innerWidth / VW, innerHeight / VH)));
  cv.width = VW * S; cv.height = VH * S; cv.style.width = VW * S + "px"; cv.style.height = VH * S + "px";
}
addEventListener("resize", resize); resize();
function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
}
function updateFsBtn() {
  const b = document.getElementById("fs-btn");
  if (!b) return;
  const fs = isFullscreen();
  b.innerHTML = fs ? "✕ Exit Fullscreen" : "⛶ Enter Fullscreen";
}
function toggleFullscreen() {
  if (!isFullscreen()) {
    const el = document.documentElement;
    const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (rfs) rfs.call(el).catch(() => {});
  } else {
    const efs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (efs) efs.call(document).catch(() => {});
  }
}
["fullscreenchange","webkitfullscreenchange","mozfullscreenchange","MSFullscreenChange"].forEach(ev => {
  document.addEventListener(ev, () => { resize(); updateFsBtn(); });
});
updateFsBtn();

/* ---------------- controls & bindings ---------------- */
const DEFAULT_BINDINGS = {
  up: ["w", "arrowup"],
  down: ["s", "arrowdown"],
  left: ["a", "arrowleft"],
  right: ["d", "arrowright"],
  run: ["shift"],
  interact: ["e", "enter"],
  quests: ["q"],
  pack: ["tab", "i"],
  pulse: ["m"],
  settings: ["o"],
  parry: [" "],
  tonic: ["h"],
  bomb: ["b"],
  act1: ["1"],
  act2: ["2"],
  act3: ["3"],
  fullscreen: ["f11"],
  toggleui: ["u"],
  flashlight: ["g", "l"],
};

const BINDING_ACTIONS = [
  { id: "up", label: "Move Up", category: "Movement" },
  { id: "down", label: "Move Down", category: "Movement" },
  { id: "left", label: "Move Left", category: "Movement" },
  { id: "right", label: "Move Right", category: "Movement" },
  { id: "run", label: "Run / Dash", category: "Movement" },
  { id: "interact", label: "Interact / Confirm", category: "Interactions" },
  { id: "flashlight", label: "Toggle Silt Flashlight", category: "Interactions" },
  { id: "quests", label: "Quests Menu", category: "Menus" },
  { id: "pack", label: "Inventory (Pack & Grafts)", category: "Menus" },
  { id: "pulse", label: "The Pulse Map", category: "Menus" },
  { id: "settings", label: "Settings Menu", category: "Menus" },
  { id: "parry", label: "Wall Parry", category: "Combat" },
  { id: "tonic", label: "Drink Sap Tonic", category: "Combat" },
  { id: "bomb", label: "Throw Resin Bomb", category: "Combat" },
  { id: "act1", label: "Graft Ability 1", category: "Combat" },
  { id: "act2", label: "Graft Ability 2", category: "Combat" },
  { id: "act3", label: "Graft Ability 3", category: "Combat" },
  { id: "fullscreen", label: "Toggle Fullscreen", category: "Display" },
  { id: "toggleui", label: "Toggle All On-Screen UI", category: "Display" },
];

let BINDINGS = loadBindings();
function loadBindings() {
  try {
    const s = localStorage.getItem("greatWilt_bindings");
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed.pack && parsed.pack.includes("e") && parsed.interact && parsed.interact.includes("f")) {
        parsed.pack = ["tab", "i"];
        parsed.interact = ["e", "enter"];
        saveBindings();
      }
      if (parsed.fullscreen && parsed.fullscreen.includes("f") && (!parsed.interact || parsed.interact.includes("f"))) {
        parsed.fullscreen = parsed.fullscreen.filter(k => k !== "f");
        if (!parsed.fullscreen.length) parsed.fullscreen.push("f11");
      }
      if (parsed.flashlight && parsed.flashlight.includes("f")) {
        parsed.flashlight = parsed.flashlight.map(k => k === "f" ? "g" : k);
        saveBindings();
      }
      return { ...DEFAULT_BINDINGS, ...parsed };
    }
  } catch (_) {}
  return JSON.parse(JSON.stringify(DEFAULT_BINDINGS));
}
function saveBindings() {
  try {
    localStorage.setItem("greatWilt_bindings", JSON.stringify(BINDINGS));
  } catch (_) {}
}
function resetBindings() {
  BINDINGS = JSON.parse(JSON.stringify(DEFAULT_BINDINGS));
  saveBindings();
}

function keyLabel(k) {
  if (!k) return "None";
  if (k === " ") return "Space";
  if (k === "arrowup") return "▲ Up";
  if (k === "arrowdown") return "▼ Down";
  if (k === "arrowleft") return "◀ Left";
  if (k === "arrowright") return "▶ Right";
  if (k === "shift") return "Shift";
  if (k === "escape") return "Esc";
  if (k === "enter") return "Enter";
  if (k === "tab") return "Tab";
  return k.toUpperCase();
}

function isActionDown(action) {
  const list = BINDINGS[action] || [];
  return list.some(k => keys[k]);
}
function isActionPressed(action) {
  const list = BINDINGS[action] || [];
  return list.some(k => pressed[k]);
}
function consumeAction(action) {
  const list = BINDINGS[action] || [];
  let found = false;
  for (const k of list) {
    if (pressed[k]) {
      found = true;
      pressed[k] = false;
    }
  }
  return found;
}
function isActionKey(action, key) {
  const list = BINDINGS[action] || [];
  return list.includes(key);
}

let rebindingAction = null;
function startRebind(action) {
  rebindingAction = action;
  refreshPanel();
}

const keys = {}; let pressed = {};
addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  if (rebindingAction) {
    e.preventDefault();
    e.stopPropagation();
    if (k !== "escape") {
      BINDINGS[rebindingAction] = [k];
      saveBindings();
    }
    rebindingAction = null;
    refreshPanel();
    return;
  }
  if (!keys[k]) pressed[k] = true;
  keys[k] = true;
  if ([" ","arrowup","arrowdown","arrowleft","arrowright","tab"].includes(k)) e.preventDefault();
  onKeyUI(k);
});
addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
addEventListener("blur", () => { for (const k in keys) keys[k] = false; });
const mouse = { x:0, y:0, down:false };
function toInternal(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * VW, (e.clientY - r.top) / r.height * VH]; }
cv.addEventListener("pointerdown", e => { [mouse.x, mouse.y] = toInternal(e); if (e.button === 2) { if (E) E.aim = null; return; } mouse.down = true; try { cv.setPointerCapture(e.pointerId); } catch (_) {} if (mode === "encounter") encPointerDown(); });
cv.addEventListener("pointermove", e => { [mouse.x, mouse.y] = toInternal(e); });
cv.addEventListener("pointerup", e => { [mouse.x, mouse.y] = toInternal(e); mouse.down = false; if (mode === "encounter") encPointerUp(); });
cv.addEventListener("contextmenu", e => e.preventDefault());

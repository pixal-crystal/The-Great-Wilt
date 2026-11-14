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
  b.innerHTML = fs ? "✕ Exit (F)" : "⛶ Fullscreen";
  b.title = fs ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)";
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
const keys = {}; let pressed = {};
addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  if (!keys[k]) pressed[k] = true; keys[k] = true;
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

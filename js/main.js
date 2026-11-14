let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  ctx.setTransform(S, 0, 0, S, 0, 0); ctx.imageSmoothingEnabled = false;
  try {
    if (mode === "world" && M) { if (!uiOpen()) updateWorld(dt); else document.getElementById("prompt").classList.add("hidden"); if (mode === "world") drawWorld(); }
    else if (mode === "encounter" && E) { if (!uiOpen()) updateEncounter(dt); if (E) drawEncounter(); }
    else { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, VW, VH); }
  } catch (err) { console.error(err); }
  tickDialog(dt);
  if (fade.dir) { fade.a += fade.dir * dt * 4; if (fade.a >= 1 && fade.dir > 0) { fade.a = 1; fade.dir = -1; const cb = fade.cb; fade.cb = null; if (cb) cb(); } if (fade.a <= 0 && fade.dir < 0) { fade.a = 0; fade.dir = 0; } }
  if (fade.a > 0) { ctx.setTransform(S, 0, 0, S, 0, 0); ctx.fillStyle = `rgba(0,0,0,${fade.a})`; ctx.fillRect(0, 0, VW, VH); }
  hudT -= dt; if (hudT <= 0 && mode === "world") { hudT = 0.25; renderHud(); }
  pressed = {};
  requestAnimationFrame(frame);
}
[PATHS.icons32, PATHS.icons16, PATHS.tiles16, PATHS.tiles32, ...[16,4,3,9,31,1,14,27,19].map(charPath),
 ...Object.values(TINY).map(s => PATHS.tiny + s.file), ...Object.values(BIGS).map(s => PATHS.dungeon + s.file)].forEach(img);
showTitle();
requestAnimationFrame(frame);

let mode = "title", M = null, PL = null, FOL = null, WFOES = [], WARDEN = null, trail = [], encCooldown = 0, worldT = 0, interactTarget = null;
const fade = { a:0, dir:0, cb:null };
function doFade(cb) { fade.dir = 1; fade.cb = cb; }
function getWorld(id) { if (!WORLDS[id]) WORLDS[id] = genRegion(id); return WORLDS[id]; }
function enterRegion(id, from) {
  M = getWorld(id); G.loc = id;
  let sx = M.camp.x, sy = M.camp.y + 44;
  if (id === "roots") { sx = 28 * TL + 8; sy = 4 * TL; }
  if (from) { const e = M.exits.find(e => e.to === from); if (e) { sx = e.spawnX; sy = e.spawnY; } }
  PL = { x:sx, y:sy, dir:0, t:0, moving:false }; FOL = { x:sx, y:sy - 2, dir:0, t:0 }; trail = [];
  spawnFoes(); spawnWarden();
  mode = "world"; encCooldown = 1; save(); renderHud();
}
function spawnFoes() {
  WFOES = [];
  const A = AREA(G.loc), st = REGIONS[G.loc] ? status(G.regions[G.loc].bal) : "depleted";
  let n = G.loc === "roots" ? 9 : { balanced:4, depleted:6, enraged:8 }[st];
  const types = [...A.foes]; if (st === "enraged" && G.loc !== "roots") types.push("husk", "husk");
  const spots = M.spawnSpots;
  for (let i = 0, tries = 0; i < n && spots.length && tries < 200; tries++) {
    const s = spots[Math.floor(Math.random() * spots.length)], x = (s % MW) * TL + 8, y = (Math.floor(s / MW) + 1) * TL - 2;
    if (Math.hypot(x - PL.x, y - PL.y) < 110) continue;
    WFOES.push({ type:types[i % types.length], x, y, dir:0, t:Math.random(), tx:x, ty:y, wait:Math.random() * 2, stun:0, home:{ x, y } }); i++;
  }
}
function spawnWarden() {
  WARDEN = null;
  if (G.loc === "roots") { if (!G.coreDown) { const c = M.nodes.find(n => n.type === "core"); WARDEN = { type:"coreGuardian", x:c.x, y:c.y - 40, t:0 }; } return; }
  if (G.regions[G.loc].warden) WARDEN = { type:REGIONS[G.loc].warden, x:M.lair.x, y:M.lair.y, t:0 };
}
function solidAt(px, py) {
  const tx = Math.floor(px / TL), ty = Math.floor(py / TL);
  if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true;
  const t = M.T[ty * MW + tx];
  if (t === T_WALK) return false;
  if ((t === T_WATER || t === T_SAP) && has("gillFronds")) return false;
  return true;
}
const feetBlocked = (x, y) => solidAt(x - 4, y - 3) || solidAt(x + 4, y - 3) || solidAt(x - 4, y) || solidAt(x + 4, y);
function tryMove(o, dx, dy) {
  let moved = false;
  if (dx && !feetBlocked(o.x + dx, o.y)) { o.x += dx; moved = true; }
  if (dy && !feetBlocked(o.x, o.y + dy)) { o.y += dy; moved = true; }
  return moved;
}
const nodeUsed = n => n.type === "chest" ? !!G.opened[G.loc + n.id] : n.type === "bunker" ? !!(G.regions[G.loc] && G.regions[G.loc].bunker) : n.type === "core" ? false : G.used[G.loc + n.id] === G.day;
const NODE_INFO = {
  sap:{ label:"Tap Amber Sap", icon:ICON.sap, base:"sapPool", yield:{ sap:[1,3] } },
  seeds:{ label:"Gather Seeds", icon:ICON.seeds, base:"bush", yield:{ seeds:[1,2] } },
  scrap:{ label:"Salvage Scrap", icon:ICON.scrap, base:"logs", yield:{ scrap:[1,2] } },
  crystal:{ label:"Chip Moss Crystal", icon:ICON.crystal, base:"rock2", yield:{ crystal:[1,2] } },
  spores:{ label:"Collect Spores", icon:ICON.spores, base:"mrock2", yield:{ spores:[1,3] } },
  waste:{ label:"Clear Industrial Waste", icon:ICON.clear, base:"log" },
  chest:{ label:"Open Cache", icon:ICON.chest, base:"chest" },
  bunker:{ label:"Sealed Bunker", icon:ICON.lock, base:"door" },
  core:{ label:"The Root-Core", icon:ICON.echo, base:"core" },
};
function updateWorld(dt) {
  worldT += dt;
  let mx = (keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0);
  let my = (keys["s"] || keys["arrowdown"] ? 1 : 0) - (keys["w"] || keys["arrowup"] ? 1 : 0);
  PL.moving = false;
  if (mx || my) {
    const l = Math.hypot(mx, my); mx /= l; my /= l;
    let spd = keys["shift"] ? 104 : 68;
    const tt = M.T[Math.floor(PL.y / TL) * MW + Math.floor(PL.x / TL)];
    if (tt === T_WATER || tt === T_SAP) spd *= 0.5;
    PL.dir = Math.abs(mx) > Math.abs(my) ? (mx < 0 ? 1 : 2) : (my < 0 ? 3 : 0);
    PL.moving = tryMove(PL, mx * spd * dt, my * spd * dt);
    PL.t += dt * (keys["shift"] ? 1.5 : 1);
    if (PL.moving) { trail.push({ x:PL.x, y:PL.y, dir:PL.dir }); if (trail.length > 80) trail.shift(); }
  }
  const tgt = trail[trail.length - 14];
  FOL.moving = false;
  if (tgt) { const d = Math.hypot(tgt.x - FOL.x, tgt.y - FOL.y); if (d > 0.5) { FOL.moving = true; FOL.x += (tgt.x - FOL.x) * Math.min(1, dt * 10); FOL.y += (tgt.y - FOL.y) * Math.min(1, dt * 10); FOL.dir = tgt.dir; FOL.t += dt; } }
  for (const e of M.exits) {
    const near = e.side === "N" ? PL.y < 12 : e.side === "S" ? PL.y > MH * TL - 6 : e.side === "W" ? PL.x < 8 : PL.x > MW * TL - 8;
    const along = e.side === "N" || e.side === "S" ? Math.abs(PL.x - (e.at * TL + 8)) < 30 : Math.abs(PL.y - (e.at * TL + 8)) < 30;
    if (near && along) { travelTo(e.to); return; }
  }
  encCooldown = Math.max(0, encCooldown - dt);
  const safe = G.loc !== "roots" && Math.hypot(PL.x - M.camp.x, PL.y - M.camp.y) < 70;
  for (const f of WFOES) {
    f.t += dt;
    if (f.stun > 0) { f.stun -= dt; f.moving = false; continue; }
    const F = FOES[f.type], d = Math.hypot(PL.x - f.x, PL.y - f.y) || 1;
    let vx = 0, vy = 0;
    if (d < 90 && !safe && encCooldown <= 0) { vx = (PL.x - f.x) / d; vy = (PL.y - f.y) / d; f.moving = tryMove(f, vx * F.speed * 0.95 * dt, vy * F.speed * 0.95 * dt); f.chasing = true; }
    else {
      f.chasing = false;
      if (f.wait > 0) { f.wait -= dt; f.moving = false; }
      else { const dx = f.tx - f.x, dy = f.ty - f.y, dd = Math.hypot(dx, dy);
        if (dd < 2) { f.wait = 1 + Math.random() * 2.5; f.tx = f.home.x + (Math.random() - 0.5) * 120; f.ty = f.home.y + (Math.random() - 0.5) * 90; }
        else { vx = dx / dd; vy = dy / dd; f.moving = tryMove(f, vx * 18 * dt, vy * 18 * dt); if (!f.moving) { f.wait = 0.5; f.tx = f.x; f.ty = f.y; } } }
    }
    if (vx || vy) f.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 1 : 2) : (vy < 0 ? 3 : 0);
    if (d < 12 && encCooldown <= 0 && !safe) { startEncounterFromWorld(f); return; }
  }
  interactTarget = findInteract();
  const pr = document.getElementById("prompt");
  if (interactTarget) { pr.classList.remove("hidden"); pr.innerHTML = `<kbd>E</kbd> ${interactTarget.label}`; } else pr.classList.add("hidden");
  if (interactTarget && (pressed["e"] || pressed[" "] || pressed["enter"])) { pr.classList.add("hidden"); interactTarget.fn(); }
}
function findInteract() {
  const cands = [];
  if (G.loc !== "roots") cands.push({ x:M.camp.x, y:M.camp.y + 2, r:46, label:"Strider-Caravan camp", fn:campDialog });
  for (const n of M.npcs) cands.push({ x:n.x, y:n.y, r:22, label:`Talk to ${n.name}`, fn:() => npcDialog(n) });
  for (const n of M.nodes) if (!nodeUsed(n) || n.type === "bunker") cands.push({ x:n.x, y:n.y, r:20, label:NODE_INFO[n.type].label, fn:() => nodeInteract(n) });
  if (WARDEN) cands.push({ x:WARDEN.x, y:WARDEN.y, r:40, label:`Approach the ${FOES[WARDEN.type].name}`, fn:wardenDialog });
  let best = null, bd = 1e9;
  for (const c of cands) { const d = Math.hypot(c.x - PL.x, c.y - PL.y); if (d < c.r && d < bd) { bd = d; best = c; } }
  return best;
}
function travelTo(to) {
  if (to === "roots" && G.echoes.length < 3) {
    PL.y -= 16;
    return say(["Calcified root-walls seal the way down to the Iron Roots.", `You need 3 Root Echoes to understand how to pass. (You have ${G.echoes.length}.)`], { icon:ROOTS.icon, name:"The Iron Roots" });
  }
  if (fade.dir) return;
  const from = G.loc;
  doFade(() => { advancePhase(2); if (G.over) return; log(`Travelled to ${AREA(to).name}.`); enterRegion(to, from); toast(`${AREA(to).name}`); });
}

/* ---------- world interactions ---------- */
function nodeInteract(n) {
  const id = G.loc, R = REGIONS[id], st = R ? status(G.regions[id].bal) : "balanced", info = NODE_INFO[n.type];
  if (["sap","seeds","scrap","crystal","spores"].includes(n.type)) {
    if (st === "enraged") return say(["The forest recoils from your hand. Nothing can be harvested while the Warden rages."]);
    const mult = st === "depleted" ? 0.5 : 1;
    let got = gain(info.yield, mult);
    if (G.companion === "kaelen" && (n.type === "scrap" || n.type === "sap")) got += " " + gain({ scrap:1 });
    if (G.companion === "bram" && n.type === "scrap") got += " " + gain({ scrap:1 });
    if (n.type === "seeds" && Math.random() < 0.25) got += " " + gain({ rareSeeds:1 });
    G.used[id + n.id] = G.day; changeBal(id, -4); advancePhase(1);
    toast(`${info.label}: ${got || "nothing"}${R ? ` <span style="color:#e8cf4a">(−4 balance)</span>` : ""}`); log(`Harvested ${n.type}.`); return save();
  }
  if (n.type === "waste") {
    const amt = 6 + (G.companion === "sylva" ? 3 : 0);
    return say(["Rusted pre-collapse machinery leaks into the soil here.", `Clear it? (+${amt} balance, +1 scrap, takes time)`], { icon:ICON.clear, name:"Industrial waste",
      options:[{ label:"Clear it", fn:() => { G.used[id + n.id] = G.day; changeBal(id, amt); const got = gain({ scrap:1 }); advancePhase(1); toast(`Waste cleared: +${amt} balance ${got}`, "#9ad04a"); log("Cleared waste."); save(); } }, { label:"Leave it" }] });
  }
  if (n.type === "chest") {
    G.opened[id + n.id] = true;
    const got = gain({ rareSeeds:1, coins:[6,12], sap:[0,2], potions:Math.random() < 0.4 ? 1 : 0 });
    toast(`Cache: ${got}`, "#ffd27a"); return save();
  }
  if (n.type === "bunker") {
    if (G.regions[id].bunker) return say(["The bunker is empty now. Only humming walls remain."]);
    if (G.companion !== "bram") return say(["A sealed pre-collapse bunker door, crusted with moss.", "Bram & Pip could probably crack this open."], { icon:ICON.lock, name:"Sealed bunker" });
    const key = id + "Bunker";
    G.regions[id].bunker = true; G.echoes.push(key); const got = gain({ scrap:3, crystal:1, coins:10 }); advancePhase(1);
    log("Opened a bunker: Root Echo."); save();
    return say(["Bram wedges his wrench into the seal while Pip flutters through a vent...", "Click. Hiss. The door groans open.", ECHOES[key], `Root Echo recovered (${G.echoes.length}/3).`], { char:CHAR.bram, name:"Bram & Pip", onClose:() => toast(`Bunker loot: ${got}`) });
  }
  if (n.type === "core") return coreDialog();
}
function npcDialog(n) {
  if (n.kind === "merchant") {
    const id = G.loc, R = REGIONS[id], st = status(G.regions[id].bal);
    if (st === "enraged") return say(["Not now! The Warden's prowling — I've boarded up the stall."], { char:n.char, name:n.name });
    if (R.industrial && overgrown()) return say(["Keep your rot outside, plant-thing.", "Prune those grafts and maybe we'll talk."], { char:n.char, name:n.name });
    return say([R.rootSinger ? "The roots hum your name, traveller. Trade?" : "Fresh stock off the highways. What'll it be?"], { char:n.char, name:n.name, options:[{ label:"Trade", fn:() => openPanel(shopPanel) }, { label:"Ask about the forest", fn:() => say([forestRumor(id)], { char:n.char, name:n.name }) }, { label:"Leave" }] });
  }
  if (n.kind === "elder") {
    return say(["Child of graft and bark. The Root-Singers can re-weave your grafts...", "...or prune the wild growth that clings to you."], { char:n.char, name:n.name,
      options:[{ label:"Re-weave grafts", fn:() => openPanel(loadoutPanel) },
        { label:"Prune taint & heal (2 sap)", disabled:(G.taint > 0 || G.hp < maxHp()) ? (canAfford({ sap:2 }) ? null : "need 2 sap") : "nothing to prune", fn:() => { pay({ sap:2 }); G.taint = 0; G.hp = maxHp(); toast("Pruned. Taint reset; fully healed.", "#9ad04a"); save(); } },
        { label:"Leave" }] });
  }
}
function forestRumor(id) {
  const s = status(G.regions[id].bal);
  if (s === "enraged") return "The forest's furious. Hunt the Warden, or bring rare seeds and sap for a Restoration Ritual.";
  if (s === "depleted") return "Too much harvesting. Clear some of that rusted waste and the place breathes easier.";
  return "Balanced, for now. Don't take more than the forest can give.";
}
function campDialog() {
  say(["The Strider-Caravan kneels by the campfire, chewing leaves."], { icon:IC(1,8), name:"Strider-Caravan",
    options:[{ label:"Rest until dawn (heal)", fn:() => doFade(() => { G.phase = 0; advanceDay(); if (G.over) return showCollapse(); G.hp = maxHp(); log("Rested at camp."); spawnFoes(); spawnWarden(); toast(`Day ${G.day}. You wake rested.`, "#9ad04a"); save(); }) },
      { label:"Caravan (companions, upgrades, crafting)", fn:() => openPanel(campPanel) }, { label:"Leave" }] });
}
function wardenDialog() {
  const W = FOES[WARDEN.type];
  if (WARDEN.type === "coreGuardian") return say(["A calcified sentinel uncoils before the Root-Core. It has no voice — only the PALE protocol's hum."], { name:W.name, icon:ICON.warden, options:[{ label:"Fight", fn:() => startEncounter([WARDEN.type], { boss:true }) }, { label:"Back away" }] });
  const cost = { rareSeeds:2, sap:3, seeds:2 };
  say([`The ${W.name} towers over the clearing, ${G.loc === "sun" ? "blazing" : G.loc === "trunk" ? "dripping resin" : G.loc === "silt" ? "exhaling pale spores" : "refracting light"}.`, "Hunt it for a mythic graft, or sing it to sleep with a Restoration Ritual."],
    { name:W.name, icon:ICON.warden, options:[
      { label:"Hunt the Warden (boss fight)", fn:() => startEncounter([WARDEN.type], { boss:true }) },
      { label:"Restoration Ritual (2 rare seeds, 3 sap, 2 seeds)", disabled:canAfford(cost) ? null : "missing materials", fn:() => ritual(cost) },
      { label:"Leave" }] });
}
function ritual(cost) {
  const id = G.loc, r = G.regions[id];
  pay(cost); r.bal = 75; r.warden = false; G.stats.rituals++; WARDEN = null; advancePhase(1);
  const lines = ["You plant the rare seeds in cleared soil and hum the old Root-Singer canticle...", "The Warden sinks into the earth, and the forest exhales."];
  if (!r.echo) { r.echo = true; G.echoes.push(id); lines.push("The neural-root hums a memory into you:", ECHOES[id]); log("Root Echo received."); }
  log("Restoration Ritual performed."); save();
  say(lines, { char:CHAR.player, name:"Restoration Ritual" });
}
function coreDialog() {
  if (WARDEN) return say(["The PALE Sentinel blocks the way."]);
  const opts = [
    { label:"Symbiosis — merge with the neural-root", disabled:(overgrown() || G.stats.rituals >= 2) ? null : "be Overgrown, or perform 2 rituals", fn:() => ending("symbiosis") },
    { label:"Dominion — sever the root with Kaelen's tech", disabled:(G.companion === "kaelen" && G.res.scrap >= 10) ? null : "travel with Kaelen + 10 scrap", fn:() => ending("dominion") },
    { label:"Migration — build the ark and leave", disabled:(G.companion === "bram" && Object.values(G.upgrades).every(Boolean)) ? null : "travel with Bram & Pip + all 3 caravan upgrades", fn:() => ending("migration") },
    { label:"Not yet" }];
  say([...G.echoes.map(k => ECHOES[k]), "The truth: the forest is VERDANT-9, a terraforming project left running with no off-switch.", "The Great Wilt is its security protocol, PALE, waking to 'reset' an ecosystem that drifted from spec.", "The Root-Core pulses in front of you. Choose the forest's future."], { icon:ROOTS.icon, name:"The Root-Core", options:opts });
}

/* ---------- world drawing ---------- */
function drawWorld() {
  const camX = clamp(Math.round(PL.x - VW / 2), 0, MW * TL - VW), camY = clamp(Math.round(PL.y - 10 - VH / 2), 0, MH * TL - VH);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, VW, VH);
  ctx.drawImage(M.bg, camX, camY, VW, VH, 0, 0, VW, VH);
  const t = worldT, list = [];
  const vis = (x, y) => x > camX - 60 && x < camX + VW + 60 && y > camY - 10 && y < camY + VH + 80;
  for (const o of M.objs) if (vis(o.x, o.y)) list.push({ y:o.y, d:() => { const r = TS16[o.key]; t16(ctx, o.key, o.x - camX - r[2] / 2, o.y - camY - r[3] + 1); } });
  if (G.loc !== "roots") list.push({ y:M.camp.fy, d:() => t16(ctx, Math.floor(t * 6) % 2 ? "fire1" : "fire2", M.camp.fx - camX - 8, M.camp.fy - camY - 13) });
  for (const n of M.nodes) if (vis(n.x, n.y)) list.push({ y:n.y, d:() => drawNode(n, n.x - camX, n.y - camY, t) });
  for (const n of M.npcs) if (vis(n.x, n.y)) list.push({ y:n.y, d:() => { drawChar(ctx, n.char, n.dir, 1, n.x - camX, n.y - camY); if (Math.hypot(PL.x - n.x, PL.y - n.y) < 50) outlineText(ctx, n.name, n.x - camX, n.y - camY - 23, "#ffe9a8", "6px 'Pixelify Sans'"); } });
  const dark = AREA(G.loc).dark && !has("echoBulb") && !has("mycelCrown");
  for (const f of WFOES) if (vis(f.x, f.y)) {
    if (dark && Math.hypot(f.x - PL.x, f.y - PL.y) > 70) continue;
    list.push({ y:f.y, d:() => { const F = FOES[f.type]; const sc = F.spr[0] === "big" ? 0.75 : 1;
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(f.x - camX, f.y - camY, 6, 2, 0, 0, 7); ctx.fill();
      drawFoeSprite(ctx, F.spr, f.moving ? "walk" : "idle", f.t, f.dir, f.x - camX, f.y - camY - (F.flying ? 3 + Math.sin(t * 4 + f.x) * 2 : 0), sc, f.stun > 0 ? 0.5 : 1);
      if (f.chasing) outlineText(ctx, "!", f.x - camX, f.y - camY - 18, "#ff5a5a", "bold 9px 'Pixelify Sans'"); } });
  }
  if (WARDEN && vis(WARDEN.x, WARDEN.y)) list.push({ y:WARDEN.y, d:() => { const F = FOES[WARDEN.type], X = WARDEN.x - camX, Y = WARDEN.y - camY;
    const g = ctx.createRadialGradient(X, Y - 14, 2, X, Y - 14, 34); g.addColorStop(0, "rgba(255,40,40,0.4)"); g.addColorStop(1, "rgba(255,40,40,0)"); ctx.fillStyle = g; ctx.fillRect(X - 40, Y - 50, 80, 70);
    drawFoeSprite(ctx, F.spr, "idle", t, 0, X, Y, F.spr[0] === "big" ? 1.3 : 2.2); outlineText(ctx, F.name, X, Y - 42, "#ff8a80", "7px 'Pixelify Sans'"); } });
  list.push({ y:FOL.y, d:() => drawChar(ctx, COMPANIONS[G.companion].char, FOL.dir, FOL.moving ? [0,1,2,1][Math.floor(FOL.t * 8) % 4] : 1, FOL.x - camX, FOL.y - camY) });
  list.push({ y:PL.y + 0.1, d:() => { const X = PL.x - camX, Y = PL.y - camY;
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(X, Y, 6, 2, 0, 0, 7); ctx.fill();
    drawChar(ctx, CHAR.player, PL.dir, PL.moving ? [0,1,2,1][Math.floor(PL.t * 8) % 4] : 1, X, Y);
    if (overgrown()) { ctx.strokeStyle = "#58b84f"; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { const a = t + i * 2.1; ctx.beginPath(); ctx.arc(X, Y - 10, 10, a, a + 0.8); ctx.stroke(); } } } });
  list.sort((a, b) => a.y - b.y); for (const it of list) it.d();
  for (const e of M.exits) {
    const X = (e.side === "W" ? 34 : e.side === "E" ? MW * TL - 34 : e.at * TL + 8) - camX, Y = (e.side === "N" ? 22 : e.side === "S" ? MH * TL - 10 : e.at * TL + 8) - camY;
    if (X > -60 && X < VW + 60 && Y > -20 && Y < VH + 20) { const locked = e.to === "roots" && G.echoes.length < 3;
      outlineText(ctx, `${{ N:"▲", S:"▼", W:"◀", E:"▶" }[e.side]} ${AREA(e.to).name}${locked ? " (sealed)" : ""}`, X, Y, locked ? "#bbb" : "#ffe46a", "7px 'Pixelify Sans'"); }
  }
  const A = AREA(G.loc);
  if (A.tint) { ctx.fillStyle = A.tint; ctx.fillRect(0, 0, VW, VH); }
  const st = REGIONS[G.loc] ? status(G.regions[G.loc].bal) : null;
  if (st === "enraged") { const g = ctx.createRadialGradient(VW / 2, VH / 2, 80, VW / 2, VH / 2, 240); g.addColorStop(0, "rgba(200,0,0,0)"); g.addColorStop(1, `rgba(200,0,0,${0.28 + Math.sin(t * 3) * 0.08})`); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
  if (st === "depleted") { ctx.fillStyle = "rgba(120,110,40,0.08)"; ctx.fillRect(0, 0, VW, VH); }
  const phaseTint = ["rgba(255,190,140,0.08)", null, "rgba(150,60,20,0.16)", "rgba(10,20,70,0.42)"][G.phase];
  if (phaseTint) { ctx.fillStyle = phaseTint; ctx.fillRect(0, 0, VW, VH); }
  if (dark || G.phase === 3) drawLight(PL.x - camX, PL.y - camY - 10, dark ? 70 : 110, dark ? 0.9 : 0.4);
  if (interactTarget && !uiOpen()) { const X = interactTarget.x - camX, Y = interactTarget.y - camY - 30 + Math.sin(t * 5) * 1.5; ctx.fillStyle = "#000"; ctx.fillRect(X - 5, Y - 6, 10, 9); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.strokeRect(X - 5.5, Y - 6.5, 11, 10); outlineText(ctx, "E", X, Y + 1, "#ffe46a", "7px 'Pixelify Sans'"); }
}
const lightCv = document.createElement("canvas"); lightCv.width = VW; lightCv.height = VH;
function drawLight(x, y, r, a) {
  const l = lightCv.getContext("2d");
  l.globalCompositeOperation = "source-over"; l.clearRect(0, 0, VW, VH); l.fillStyle = `rgba(2,2,8,${a})`; l.fillRect(0, 0, VW, VH);
  l.globalCompositeOperation = "destination-out";
  const g = l.createRadialGradient(x, y, r * 0.3, x, y, r); g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
  l.fillStyle = g; l.beginPath(); l.arc(x, y, r, 0, 7); l.fill();
  ctx.drawImage(lightCv, 0, 0);
}
function drawNode(n, X, Y, t) {
  const info = NODE_INFO[n.type], used = nodeUsed(n);
  if (info.base === "sapPool") { ctx.fillStyle = used ? "#7a5520" : "#e0a030"; ctx.beginPath(); ctx.ellipse(X, Y - 2, 8, 3.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#ffd27a"; ctx.fillRect(X - 3, Y - 4, 2, 1); }
  else if (info.base === "core") { const g = ctx.createRadialGradient(X, Y - 14, 1, X, Y - 14, 18); g.addColorStop(0, "#f0e0ff"); g.addColorStop(0.4, "rgba(180,140,255,0.7)"); g.addColorStop(1, "rgba(120,80,200,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y - 14, 18 + Math.sin(t * 2) * 2, 0, 7); ctx.fill(); }
  else { const r = TS16[info.base]; t16(ctx, info.base, X - r[2] / 2, Y - r[3] + 1, undefined, undefined, used && n.type !== "chest" ? 0.5 : 1); }
  if (n.type === "chest" && used) return;
  if (!used || n.type === "bunker") { const by = Y - 24 + Math.sin(t * 3 + X) * 1.5; icon16(ctx, n.type === "bunker" && used ? ICON.echo : info.icon, X - 6, by, 12, used ? 0.4 : 1); }
}

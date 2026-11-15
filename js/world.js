let mode = "title", M = null, PL = null, FOL = null, WFOES = [], WARDEN = null, trail = [], encCooldown = 0, worldT = 0, interactTarget = null;
const cam = { x: 0, y: 0, vx: 0, vy: 0, leadX: 0, leadY: 0, init: false };
function smoothDamp(current, target, velHolder, key, smoothTime, maxSpeed, dt) {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const originalTo = target;
  const maxChange = maxSpeed * smoothTime;
  change = Math.max(-maxChange, Math.min(maxChange, change));
  target = current - change;
  const temp = (velHolder[key] + omega * change) * dt;
  velHolder[key] = (velHolder[key] - omega * temp) * exp;
  let output = target + (change + temp) * exp;
  if ((originalTo - current > 0) === (output > originalTo)) {
    output = originalTo;
    velHolder[key] = 0;
  }
  return output;
}
const fade = { a:0, dir:0, cb:null };
function doFade(cb) { fade.dir = 1; fade.cb = cb; }
function getWorld(id) { if (id === "tutorial") return (WORLDS[id] = WORLDS[id] || buildTutorialWorld()); if (!WORLDS[id]) { WORLDS[id] = genRegion(id); applyCuts(WORLDS[id], id); } return WORLDS[id]; }
function enterRegion(id, from) {
  M = getWorld(id); G.loc = id;
  setTimeout(() => discover(id), 600);
  let sx = M.camp.x, sy = M.camp.y + 44;
  if (id === "roots") { sx = 28 * TL + 8; sy = 4 * TL; }
  if (M.start && !from) { sx = M.start.x; sy = M.start.y; }
  if (from) { const e = M.exits.find(e => e.to === from); if (e) { sx = e.spawnX; sy = e.spawnY; } }
  PL = { x:sx, y:sy, dir:0, t:0, moving:false }; FOL = { x:sx, y:sy - 2, dir:0, t:0 }; trail = [];
  worldStamina = maxWorldStamina(); worldStaExhausted = false; worldStaBarFade = 0;
  if (id === "silt" || id === "roots") {
    if (G.flashlight == null) G.flashlight = true;
    const fK = (typeof BINDINGS !== "undefined" && BINDINGS.flashlight && BINDINGS.flashlight[0]) ? keyLabel(BINDINGS.flashlight[0]) : "G";
    toast(`🔦 Silt Flashlight ready! Press [${fK}] to toggle.`, "#ffe46a");
  }
  cam.init = false;
  cam.vx = 0; cam.vy = 0;
  cam.leadX = 0; cam.leadY = 0;
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
  if (!G.regions[G.loc]) return;
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
function sweepMove(o, delta, isX) {
  if (!delta) return 0;
  if (!feetBlocked(isX ? o.x + delta : o.x, isX ? o.y : o.y + delta)) {
    if (isX) o.x += delta; else o.y += delta;
    return delta;
  }
  let low = 0, high = delta;
  for (let i = 0; i < 5; i++) {
    const mid = (low + high) * 0.5;
    if (!feetBlocked(isX ? o.x + mid : o.x, isX ? o.y : o.y + mid)) {
      low = mid;
    } else {
      high = mid;
    }
  }
  if (Math.abs(low) > 0.02) {
    if (isX) o.x += low; else o.y += low;
    return low;
  }
  return 0;
}
function tryMoveAxis(o, delta, isX) {
  if (!delta) return 0;
  let moved = sweepMove(o, delta, isX);
  if (Math.abs(moved) >= Math.abs(delta) * 0.8) return moved;

  // Corner assist: check if nudging on perpendicular axis smoothly clears an obstacle corner
  const step = Math.min(Math.abs(delta), 1.2);
  let bestNudge = 0;
  for (let offset = 1; offset <= 4; offset++) {
    const canNeg = !feetBlocked(isX ? o.x + delta : o.x - offset, isX ? o.y - offset : o.y + delta);
    const canPos = !feetBlocked(isX ? o.x + delta : o.x + offset, isX ? o.y + offset : o.y + delta);
    if (canNeg && !canPos) { bestNudge = -step; break; }
    if (canPos && !canNeg) { bestNudge = step; break; }
  }
  if (bestNudge !== 0) {
    if (isX) o.y += bestNudge; else o.x += bestNudge;
    const retry = sweepMove(o, delta, isX);
    if (Math.abs(retry) > Math.abs(moved)) moved = retry;
  }
  return moved;
}
function tryMove(o, dx, dy) {
  let mx = tryMoveAxis(o, dx, true);
  let my = tryMoveAxis(o, dy, false);
  if (dx && dy) {
    if (Math.abs(mx) > 0.02 && Math.abs(my) < 0.02) {
      const extraX = (Math.sign(dx) * Math.hypot(dx, dy)) - mx;
      if (extraX * dx > 0) mx += sweepMove(o, extraX, true);
    } else if (Math.abs(my) > 0.02 && Math.abs(mx) < 0.02) {
      const extraY = (Math.sign(dy) * Math.hypot(dx, dy)) - my;
      if (extraY * dy > 0) my += sweepMove(o, extraY, false);
    }
  }
  return Math.abs(mx) > 0.02 || Math.abs(my) > 0.02;
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
  updateFlowers(dt);
  if (typeof tutWorldTick === "function" && tutWorldTick(dt)) return;
  let mx = (isActionDown("right") || keys["d"] || keys["arrowright"] ? 1 : 0) - (isActionDown("left") || keys["a"] || keys["arrowleft"] ? 1 : 0);
  let my = (isActionDown("down") || keys["s"] || keys["arrowdown"] ? 1 : 0) - (isActionDown("up") || keys["w"] || keys["arrowup"] ? 1 : 0);
  PL.moving = false;
  const isMoving = (mx !== 0 || my !== 0);
  const wantsRun = (isActionDown("run") || keys["shift"]);
  const maxSta = typeof maxWorldStamina === "function" ? maxWorldStamina() : 100;

  let isSprinting = false;
  if (isMoving && wantsRun && !worldStaExhausted && worldStamina > 0) {
    isSprinting = true;
    worldStamina = Math.max(0, worldStamina - dt * 25);
    worldStaRegenDelay = 0.65;
    worldStaBarFade = 2.0;
    if (worldStamina <= 0) {
      worldStaExhausted = true;
      toast("💨 Out of breath! (Exhausted)", "#e0473f");
    }
  } else {
    if (worldStaRegenDelay > 0) {
      worldStaRegenDelay -= dt;
    } else if (worldStamina < maxSta) {
      const regenRate = (!isMoving ? 46 : 18) + (typeof staminaRegen === "function" ? staminaRegen() * 5 : 5);
      worldStamina = Math.min(maxSta, worldStamina + dt * regenRate);
      if (worldStaExhausted && worldStamina >= maxSta * 0.35) {
        worldStaExhausted = false;
        toast("Caught your breath!", "#6fcf6a");
      }
    }
    if (worldStamina >= maxSta) {
      worldStaBarFade = Math.max(0, worldStaBarFade - dt * 2);
    } else {
      worldStaBarFade = Math.max(worldStaBarFade, 1.2);
    }
  }

  const sFill = document.getElementById("hud-sta-fill");
  const sTxt = document.getElementById("hud-sta-txt");
  if (sFill && sTxt) {
    const pct = Math.max(0, Math.min(100, (worldStamina / maxSta) * 100));
    sFill.style.width = pct + "%";
    sFill.style.background = worldStaExhausted ? "#e0473f" : (pct < 25 ? "#f1a340" : "#5fb3ff");
    sTxt.textContent = worldStaExhausted ? `EXHAUSTED` : `${Math.ceil(worldStamina)}/${maxSta}`;
  }

  PL.vx = PL.vx || 0;
  PL.vy = PL.vy || 0;
  let targetVx = 0, targetVy = 0;
  if (isMoving) {
    const l = Math.hypot(mx, my);
    const nx = mx / l, ny = my / l;
    let spd = isSprinting ? 104 : (worldStaExhausted ? 36 : 68);
    const tt = M.T[Math.floor(PL.y / TL) * MW + Math.floor(PL.x / TL)];
    if (tt === T_WATER || tt === T_SAP) spd *= 0.5;
    targetVx = nx * spd;
    targetVy = ny * spd;
    PL.dir = Math.abs(mx) > Math.abs(my) ? (mx < 0 ? 1 : 2) : (my < 0 ? 3 : 0);
  }

  // Responsive yet smooth velocity acceleration and deceleration
  const accel = isMoving ? 30 : 36;
  const vFactor = 1 - Math.exp(-accel * dt);
  PL.vx += (targetVx - PL.vx) * vFactor;
  PL.vy += (targetVy - PL.vy) * vFactor;
  if (!isMoving && Math.hypot(PL.vx, PL.vy) < 1.2) { PL.vx = 0; PL.vy = 0; }

  const curSpd = Math.hypot(PL.vx, PL.vy);
  if (curSpd > 0.8) {
    PL.moving = tryMove(PL, PL.vx * dt, PL.vy * dt);
    PL.t += dt * (isSprinting ? 1.5 : 1) * Math.min(1.2, curSpd / 68);
    if (PL.moving) { trail.push({ x:PL.x, y:PL.y, dir:PL.dir }); if (trail.length > 80) trail.shift(); }
  } else {
    PL.moving = false;
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
    if (d < foeNoticeRange(F) && !safe && encCooldown <= 0) {
      vx = (PL.x - f.x) / d; vy = (PL.y - f.y) / d;
      // Walking speed of player is 68 px/s. Enemies chase faster than walking speed (74-89 px/s),
      // requiring the player to sprint (104 px/s) or break aggro to escape.
      const chaseSpd = Math.max(74, 70 + ((F.speed || 30) - 20) * 0.7);
      f.moving = tryMove(f, vx * chaseSpd * dt, vy * chaseSpd * dt);
      f.chasing = true;
    }
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
  if (interactTarget) { pr.classList.remove("hidden"); pr.innerHTML = `<kbd>${keyLabel((BINDINGS.interact && BINDINGS.interact[0]) || "e")}</kbd> ${interactTarget.label}`; } else pr.classList.add("hidden");
  if (interactTarget && (consumeAction("interact") || pressed["e"] || pressed[" "] || pressed["enter"])) { pr.classList.add("hidden"); interactTarget.fn(); }

  const maxCamX = Math.max(0, MW * TL - VW);
  const maxCamY = Math.max(0, MH * TL - VH);

  // Subtle lookahead lead in movement direction
  const moveMag = Math.hypot(mx, my) || 1;
  const targetLeadX = isMoving ? (mx / moveMag) * (isSprinting ? 22 : 14) : 0;
  const targetLeadY = isMoving ? (my / moveMag) * (isSprinting ? 16 : 10) : 0;
  const leadFactor = 1 - Math.exp(-4.5 * dt);
  cam.leadX = (cam.leadX || 0) + (targetLeadX - (cam.leadX || 0)) * leadFactor;
  cam.leadY = (cam.leadY || 0) + (targetLeadY - (cam.leadY || 0)) * leadFactor;

  const targetCamX = clamp(PL.x + cam.leadX - VW / 2, 0, maxCamX);
  const targetCamY = clamp(PL.y - 10 + cam.leadY - VH / 2, 0, maxCamY);

  if (!cam.init) {
    cam.x = targetCamX;
    cam.y = targetCamY;
    cam.vx = 0;
    cam.vy = 0;
    cam.init = true;
  } else {
    cam.vx = cam.vx || 0;
    cam.vy = cam.vy || 0;
    cam.x = smoothDamp(cam.x, targetCamX, cam, "vx", 0.15, 1200, dt);
    cam.y = smoothDamp(cam.y, targetCamY, cam, "vy", 0.15, 1200, dt);
    cam.x = clamp(cam.x, 0, maxCamX);
    cam.y = clamp(cam.y, 0, maxCamY);
  }
}
function findInteract() {
  if (G.loc === "tutorial") return tutInteract();
  const cands = [];
  if (G.loc !== "roots") cands.push({ x:M.camp.x, y:M.camp.y + 2, r:46, label:"Strider-Caravan camp", fn:campDialog });
  for (const n of M.npcs) cands.push({ x:n.x, y:n.y, r:22, label:`Talk to ${n.name}`, fn:() => npcDialog(n) });
  for (const c of pruneCandidates()) cands.push(c);
  for (const n of M.nodes) if (!nodeUsed(n) || n.type === "bunker") cands.push({ x:n.x, y:n.y, r:20, label:NODE_INFO[n.type].label, fn:() => nodeInteract(n) });
  if (WARDEN) cands.push({ x:WARDEN.x, y:WARDEN.y, r:40, label:`Approach the ${FOES[WARDEN.type].name}`, fn:wardenDialog });
  let best = null, bd = 1e9;
  for (const c of cands) { const d = Math.hypot(c.x - PL.x, c.y - PL.y); if (d < c.r && d < bd) { bd = d; best = c; } }
  return best;
}
function travelTo(to) {
  const reqLvl = (typeof REGION_REQ_LVL !== "undefined" && REGION_REQ_LVL[to]) || 1;
  const pLvl = (G && G.lvl) || 1;
  if (pLvl < reqLvl) {
    if (PL.y < 16) PL.y += 20;
    else if (PL.y > MH * TL - 16) PL.y -= 20;
    else if (PL.x < 16) PL.x += 20;
    else if (PL.x > MW * TL - 16) PL.x -= 20;

    toast(`🔒 ${AREA(to).name} is sealed! Requires Level ${reqLvl} (You are Lv ${pLvl}).`, "#ff6b6b");
    return say([
      `Dense briar-thorns and calcified spore-vines choke the highway leading to ${AREA(to).name}.`,
      `Your symbiosis and vitality are not yet hardened enough to survive this zone.`,
      `Required: <b>Level ${reqLvl}</b> (Current: Level ${pLvl}). Defeat enemies, gather spore-essence, or complete contracts to level up.`
    ], { icon: ICON.lock, name: "Passage Blocked" });
  }

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
    G.used[id + n.id] = G.day; changeBal(id, -4); advancePhase(1); gainXP(1, "Extraction contract", "squad");
    toast(`${info.label}: ${got || "nothing"}${R ? ` <span style="color:#e8cf4a">(−4 balance)</span>` : ""}`); log(`Harvested ${n.type}.`); return save();
  }
  if (n.type === "waste") {
    const amt = 6 + (G.companion === "sylva" ? 3 : 0);
    return say(["Rusted pre-collapse machinery leaks into the soil here.", `Clear it? (+${amt} balance, +1 scrap, takes time)`], { icon:ICON.clear, name:"Industrial waste",
      options:[{ label:"Clear it", fn:() => { G.used[id + n.id] = G.day; changeBal(id, amt); const got = gain({ scrap:1 }); advancePhase(1); toast(`Waste cleared: +${amt} balance ${got}`, "#9ad04a"); log("Cleared waste."); gainXP(3, "Purified a blighted grove", "squad"); save(); } }, { label:"Leave it" }] });
  }
  if (n.type === "chest") {
    G.opened[id + n.id] = true;
    const got = gain({ rareSeeds:1, coins:[6,12], sap:[0,2], potions:Math.random() < 0.4 ? 1 : 0 });
    toast(`Cache: ${got}`, "#ffd27a"); gainXP(2, "Found a hidden cache"); return save();
  }
  if (n.type === "bunker") {
    if (G.regions[id].bunker) return say(["The bunker is empty now. Only humming walls remain."]);
    if (G.companion !== "bram") return say(["A sealed pre-collapse bunker door, crusted with moss.", "Bram & Pip could probably crack this open."], { icon:ICON.lock, name:"Sealed bunker" });
    const key = id + "Bunker";
    gainXP(8, "Breached a pre-collapse ruin"); G.regions[id].bunker = true; G.echoes.push(key); const got = gain({ scrap:3, crystal:1, coins:10 }); advancePhase(1);
    log("Opened a bunker: Root Echo."); const relicLine = grantRelic("pruner"); save();
    return say(["Bram wedges his wrench into the seal while Pip flutters through a vent...", "Click. Hiss. The door groans open.", ECHOES[key], `Root Echo recovered (${G.echoes.length}/3).`, ...(relicLine ? ["Racked on the bunker wall: a terraforming engineer's chainsaw-greatsword.", relicLine] : [])], { char:CHAR.bram, name:"Bram & Pip", onClose:() => toast(`Bunker loot: ${got}`) });
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
  if (n.kind === "questGiver") {
    const echoes = G.echoes.length;
    const prog = computeQuestProgress(G);
    const lines = [
      "I record the Strider-Caravan's Chronicle and track our campaign against Protocol PALE.",
      echoes >= 3
        ? "The three Root Echoes harmonize together! The acoustic barrier south of the Silt-Floor is broken — the Iron Roots lie open below."
        : `We have recovered ${echoes}/3 Root Echoes (${prog.pct}% campaign progress). Consult my chronicle for active contracts and objectives.`
    ];
    return say(lines, {
      char: n.char,
      name: n.name,
      options: [
        { label: "View Quests & Objectives", fn: () => openPanel(questsPanel) },
        { label: "Claim Milestone Supplies", fn: () => claimQuestRewards(n) },
        { label: "Ask about regional rumors", fn: () => say([questRumor(G.loc)], { char: n.char, name: n.name }) },
        { label: "Leave" }
      ]
    });
  }
}
function claimQuestRewards(n) {
  G.claimedQuests = G.claimedQuests || {};
  const rewards = [];
  if (G.echoes.length >= 1 && !G.claimedQuests.echo1) {
    G.claimedQuests.echo1 = true;
    G.res.coins += 15; G.res.sap += 2;
    rewards.push("First Root Echo: +15 coins, +2 sap");
  }
  if (G.echoes.length >= 2 && !G.claimedQuests.echo2) {
    G.claimedQuests.echo2 = true;
    G.res.coins += 20; G.res.sap += 3;
    rewards.push("Second Root Echo: +20 coins, +3 sap");
  }
  if (G.echoes.length >= 3 && !G.claimedQuests.echo3) {
    G.claimedQuests.echo3 = true;
    G.res.coins += 30; G.res.rareSeeds += 1; G.gp = (G.gp || 0) + 1;
    rewards.push("Third Root Echo (Iron Roots Unsealed): +30 coins, +1 rare seed, +1 GP");
  }
  const hasVault = (G.regions.silt && G.regions.silt.bunker) || (G.regions.glass && G.regions.glass.bunker);
  if (hasVault && !G.claimedQuests.bunker) {
    G.claimedQuests.bunker = true;
    G.res.coins += 20; G.res.scrap += 3;
    rewards.push("Vault Breached: +20 coins, +3 scrap");
  }
  const allUpgrades = Object.values(G.upgrades).every(Boolean);
  if (allUpgrades && !G.claimedQuests.upgrades) {
    G.claimedQuests.upgrades = true;
    G.res.coins += 25; G.res.crystal += 2;
    rewards.push("Caravan Fully Upgraded: +25 coins, +2 crystals");
  }

  if (rewards.length) {
    save();
    return say(["Splendid fieldwork, Graftwarden! The Caravan Council authorizes these milestone supplies:", ...rewards], { char: n.char, name: n.name, onClose: () => toast("Milestone rewards claimed!", "#6fcf6a") });
  }
  return say(["No unclaimed milestone supplies right now.", "Chart new Root Echoes, breach pre-collapse bunkers, or upgrade the Caravan to unlock more."], { char: n.char, name: n.name });
}
function questRumor(id) {
  if (id === "sun") return "The Sun-Warden patrols the high sky-bridges. Slay it in combat or perform a Restoration Ritual with rare seeds to claim the Sun-Crown Echo.";
  if (id === "trunk") return "The Twilight Trunk holds our central camp. Keep regional balance above 60 to prevent the Trunk-Warden from waking.";
  if (id === "silt") return "A pre-collapse bunker is hidden in the silt mist. Travel with Bram & Pip to crack the seal and recover an acoustic Root Echo.";
  if (id === "glass") return "The Glass-Marsh houses both an Apex Warden and a buried vault. Either can provide a Root Echo.";
  return "The Iron Roots lie deep beneath the Silt-Floor. Three Root Echoes are needed to breach the acoustic gate.";
}
function forestRumor(id) {
  const s = status(G.regions[id].bal);
  if (s === "enraged") return "The forest's furious. Hunt the Warden, or bring rare seeds and sap for a Restoration Ritual.";
  if (s === "depleted") return "Too much harvesting. Clear some of that rusted waste and the place breathes easier.";
  return "Balanced, for now. Don't take more than the forest can give.";
}
function campDialog() {
  say(["The Strider-Caravan kneels by the campfire, chewing leaves."], { icon:IC(1,8), name:"Strider-Caravan",
    options:[{ label:"Rest until dawn (heal)", fn:() => doFade(() => { G.phase = 0; advanceDay(); if (G.over) return showCollapse(); G.hp = maxHp(); worldStamina = maxWorldStamina(); worldStaExhausted = false; log("Rested at camp."); spawnFoes(); spawnWarden(); toast(`Day ${G.day}. You wake rested.`, "#9ad04a"); save(); }) },
      { label:"Caravan (companions, upgrades, crafting)", fn:() => openPanel(campPanel) },
      { label:"Workbench & Armory (swords)", fn:() => openPanel(armoryPanel) },
      { label:"Caravan Chronicle & Quests (Vael)", fn:() => openPanel(questsPanel) },
      { label:"Field Guide (Tutorial & Lore)", fn:() => openPanel(tutorialPanel) },
      { label:"Leave" }] });
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
  pay(cost); r.bal = 75; r.warden = false; G.stats.rituals++; WARDEN = null; advancePhase(1); gainXP(12, "Restoration Ritual", "squad");
  const lines = ["You plant the rare seeds in cleared soil and hum the old Root-Singer canticle...", "The Warden sinks into the earth, and the forest exhales."];
  if (!r.echo) { r.echo = true; G.echoes.push(id); lines.push("The neural-root hums a memory into you:", ECHOES[id]); log("Root Echo received."); }
  const fangLine = grantRelic("fang"); if (fangLine) lines.push("From the sleeping Warden's roots, a living wooden blade unfurls toward your hand.", fangLine);
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
  const maxCamX = Math.max(0, MW * TL - VW);
  const maxCamY = Math.max(0, MH * TL - VH);
  const camX = clamp(Math.round(cam.x), 0, maxCamX);
  const camY = clamp(Math.round(cam.y), 0, maxCamY);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, VW, VH);
  ctx.drawImage(M.bg, camX, camY, VW, VH, 0, 0, VW, VH);
  drawFlowers(camX, camY);
  const t = worldT, list = [];
  const vis = (x, y) => x > camX - 60 && x < camX + VW + 60 && y > camY - 10 && y < camY + VH + 80;
  for (const o of M.objs) if (vis(o.x, o.y)) list.push({ y:o.y, d:() => { const r = TS16[o.key]; t16(ctx, o.key, Math.round(o.x) - camX - r[2] / 2, Math.round(o.y) - camY - r[3] + 1); } });
  if (G.loc !== "roots") list.push({ y:M.camp.fy, d:() => t16(ctx, Math.floor(t * 6) % 2 ? "fire1" : "fire2", Math.round(M.camp.fx) - camX - 8, Math.round(M.camp.fy) - camY - 13) });
  for (const n of M.nodes) if (vis(n.x, n.y)) list.push({ y:n.y, d:() => drawNode(n, Math.round(n.x) - camX, Math.round(n.y) - camY, t) });
  for (const n of M.npcs) if (vis(n.x, n.y)) list.push({ y:n.y, d:() => { const nx = Math.round(n.x) - camX, ny = Math.round(n.y) - camY; drawChar(ctx, n.char, n.dir, 1, nx, ny); if (Math.hypot(PL.x - n.x, PL.y - n.y) < 50) outlineText(ctx, n.name, nx, ny - 23, "#ffe9a8", "6px 'Pixelify Sans'"); } });
  const dark = AREA(G.loc).dark && !has("echoBulb") && !has("mycelCrown");
  const flashOn = G && G.flashlight !== false;
  const dirAngles = { 0: Math.PI / 2, 1: Math.PI, 2: 0, 3: -Math.PI / 2 };
  let flashAngle = dirAngles[PL.dir] ?? Math.PI / 2;
  const px = Math.round(PL.x) - camX, py = Math.round(PL.y) - camY - 10;
  if (!PL.moving && typeof mouse !== "undefined" && (mouse.x || mouse.y)) {
    const mdx = mouse.x - px, mdy = mouse.y - py;
    if (Math.hypot(mdx, mdy) > 14) flashAngle = Math.atan2(mdy, mdx);
  }
  for (const f of WFOES) if (vis(f.x, f.y)) {
    const d = Math.hypot(f.x - PL.x, f.y - PL.y);
    const inCone = flashOn && inFlashlight(f.x, f.y, PL.x, PL.y, flashAngle, 0.52, 210);
    if (dark && d > 70 && !inCone) continue;
    const fx = Math.round(f.x) - camX, fy = Math.round(f.y) - camY;
    list.push({ y:f.y, d:() => { const F = FOES[f.type]; const sc = F.spr[0] === "big" ? 0.75 : 1;
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(fx, fy, 6, 2, 0, 0, 7); ctx.fill();
      drawFoeSprite(ctx, F.spr, f.moving ? "walk" : "idle", f.t, f.dir, fx, fy - (F.flying ? 3 + Math.sin(t * 4 + f.x) * 2 : 0), sc, f.stun > 0 ? 0.5 : 1);
      if (f.chasing) outlineText(ctx, "!", fx, fy - 18, "#ff5a5a", "bold 9px 'Pixelify Sans'");
      else if (inCone && d > 70) outlineText(ctx, "!", fx, fy - 18, "#ffe46a", "bold 8px 'Pixelify Sans'");
      if (Math.hypot(f.x - PL.x, f.y - PL.y) < 80 || inCone) { const el = enemyLevel(G.loc), tr = enemyTier(el); outlineText(ctx, `Lv${el}`, fx, fy + 7, tr.col, "5px 'Pixelify Sans'"); } } });
  }
  if (WARDEN && vis(WARDEN.x, WARDEN.y)) list.push({ y:WARDEN.y, d:() => { const F = FOES[WARDEN.type], X = Math.round(WARDEN.x) - camX, Y = Math.round(WARDEN.y) - camY;
    const g = ctx.createRadialGradient(X, Y - 14, 2, X, Y - 14, 34); g.addColorStop(0, "rgba(255,40,40,0.4)"); g.addColorStop(1, "rgba(255,40,40,0)"); ctx.fillStyle = g; ctx.fillRect(X - 40, Y - 50, 80, 70);
    drawFoeSprite(ctx, F.spr, "idle", t, 0, X, Y, F.spr[0] === "big" ? 1.3 : 2.2); outlineText(ctx, F.name, X, Y - 42, "#ff8a80", "7px 'Pixelify Sans'"); } });
  if (!(G.tut && G.loc === "tutorial" && ["intro", "walk"].includes(G.tut.step))) {
    const folX = Math.round(FOL.x) - camX, folY = Math.round(FOL.y) - camY;
    list.push({ y:FOL.y, d:() => drawChar(ctx, COMPANIONS[G.companion].char, FOL.dir, FOL.moving ? [0,1,2,1][Math.floor(FOL.t * 8) % 4] : 1, folX, folY) });
  }
  const plX = Math.round(PL.x) - camX, plY = Math.round(PL.y) - camY;
  list.push({ y:PL.y + 0.1, d:() => {
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(plX, plY, 6, 2, 0, 0, 7); ctx.fill();
    drawChar(ctx, CHAR.player, PL.dir, PL.moving ? [0,1,2,1][Math.floor(PL.t * 8) % 4] : 1, plX, plY);
    if (overgrown()) { ctx.strokeStyle = "#58b84f"; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { const a = t + i * 2.1; ctx.beginPath(); ctx.arc(plX, plY - 10, 10, a, a + 0.8); ctx.stroke(); } }
    if (worldStaExhausted) {
      outlineText(ctx, "PANTING...", plX, plY - 26, "#ff6b6b", "6px 'Pixelify Sans'");
      if (Math.floor(t * 4) % 2 === 0) {
        ctx.fillStyle = "rgba(160, 220, 255, 0.85)";
        ctx.fillRect(plX + (PL.dir === 1 ? -6 : 6), plY - 14, 1.5, 2);
      }
    }
    if (worldStaBarFade > 0) {
      const alpha = Math.min(1, worldStaBarFade);
      const maxS = typeof maxWorldStamina === "function" ? maxWorldStamina() : 100;
      const pct = Math.max(0, Math.min(1, worldStamina / maxS));
      const bw = 20, bh = 3, bx = Math.round(plX - bw / 2), by = Math.round(plY - 24);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(10, 14, 18, 0.85)";
      ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      ctx.fillStyle = "#222a30";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = worldStaExhausted ? "#e0473f" : (pct < 0.25 ? "#f1a340" : "#5fb3ff");
      ctx.fillRect(bx, by, Math.round(bw * pct), bh);
      ctx.restore();
    }
  } });
  if (G.loc === "tutorial" && typeof tutDrawables === "function") tutDrawables(list, camX, camY, t);
  list.sort((a, b) => a.y - b.y); for (const it of list) it.d();
  for (const e of M.exits) {
    const X = (e.side === "W" ? 34 : e.side === "E" ? MW * TL - 34 : e.at * TL + 8) - camX, Y = (e.side === "N" ? 22 : e.side === "S" ? MH * TL - 10 : e.at * TL + 8) - camY;
    if (X > -60 && X < VW + 60 && Y > -20 && Y < VH + 20) {
      const reqLvl = (typeof REGION_REQ_LVL !== "undefined" && REGION_REQ_LVL[e.to]) || 1;
      const pLvl = (G && G.lvl) || 1;
      const lvlLock = pLvl < reqLvl;
      const echoLock = e.to === "roots" && G.echoes.length < 3;
      const locked = lvlLock || echoLock;
      const tag = lvlLock ? ` [🔒 Lv ${reqLvl}]` : echoLock ? " (sealed)" : "";
      outlineText(ctx, `${{ N:"▲", S:"▼", W:"◀", E:"▶" }[e.side]} ${AREA(e.to).name}${tag}`, X, Y, locked ? "#ff7a7a" : "#ffe46a", "7px 'Pixelify Sans'");
    }
  }
  const A = AREA(G.loc);
  if (A.tint) { ctx.fillStyle = A.tint; ctx.fillRect(0, 0, VW, VH); }
  const st = REGIONS[G.loc] ? status(G.regions[G.loc].bal) : null;
  if (st === "enraged") { const g = ctx.createRadialGradient(VW / 2, VH / 2, 80, VW / 2, VH / 2, 240); g.addColorStop(0, "rgba(200,0,0,0)"); g.addColorStop(1, `rgba(200,0,0,${0.28 + Math.sin(t * 3) * 0.08})`); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
  if (st === "depleted") { ctx.fillStyle = "rgba(120,110,40,0.08)"; ctx.fillRect(0, 0, VW, VH); }
  const phaseTint = ["rgba(255,190,140,0.08)", null, "rgba(150,60,20,0.16)", "rgba(10,20,70,0.42)"][G.phase];
  if (phaseTint) { ctx.fillStyle = phaseTint; ctx.fillRect(0, 0, VW, VH); }
  let cone = null;
  if (flashOn && (dark || G.phase === 3)) {
    cone = { angle: flashAngle, spread: 0.52, range: 210 };
  }
  if (dark || G.phase === 3) drawLight(px, py, dark ? (flashOn ? 42 : 70) : 110, dark ? 0.92 : 0.45, cone);
  if (interactTarget && !uiOpen()) { const X = Math.round(interactTarget.x) - camX, Y = Math.round(interactTarget.y) - camY - 30 + Math.sin(t * 5) * 1.5; ctx.fillStyle = "#000"; ctx.fillRect(X - 5, Y - 6, 10, 9); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.strokeRect(X - 5.5, Y - 6.5, 11, 10); outlineText(ctx, keyLabel((BINDINGS.interact && BINDINGS.interact[0]) || "e"), X, Y + 1, "#ffe46a", "7px 'Pixelify Sans'"); }
  if (G.loc === "tutorial" && typeof tutOverlay === "function") tutOverlay(camX, camY, t);
}
function inFlashlight(tx, ty, px, py, angle, spread, range) {
  const dx = tx - px, dy = ty - py;
  const d = Math.hypot(dx, dy);
  if (d > range) return false;
  let diff = Math.atan2(dy, dx) - angle;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  return Math.abs(diff) <= spread;
}
const lightCv = document.createElement("canvas"); lightCv.width = VW; lightCv.height = VH;
function drawLight(x, y, r, a, cone = null) {
  const l = lightCv.getContext("2d");
  l.globalCompositeOperation = "source-over"; l.clearRect(0, 0, VW, VH); l.fillStyle = `rgba(2,2,8,${a})`; l.fillRect(0, 0, VW, VH);
  l.globalCompositeOperation = "destination-out";
  const baseR = cone ? Math.max(34, r * 0.6) : r;
  const g = l.createRadialGradient(x, y, baseR * 0.25, x, y, baseR);
  g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
  l.fillStyle = g; l.beginPath(); l.arc(x, y, baseR, 0, 7); l.fill();

  if (cone) {
    const { angle, spread, range } = cone;
    const cg = l.createRadialGradient(x, y, 14, x, y, range);
    cg.addColorStop(0, "rgba(0,0,0,1)");
    cg.addColorStop(0.75, "rgba(0,0,0,0.85)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    l.fillStyle = cg;
    l.beginPath();
    l.moveTo(x, y);
    l.arc(x, y, range, angle - spread, angle + spread);
    l.closePath();
    l.fill();
  }

  ctx.drawImage(lightCv, 0, 0);

  if (cone) {
    const { angle, spread, range } = cone;
    ctx.save();
    const bg = ctx.createRadialGradient(x, y, 8, x, y, range);
    bg.addColorStop(0, "rgba(255, 238, 170, 0.28)");
    bg.addColorStop(0.5, "rgba(255, 220, 130, 0.12)");
    bg.addColorStop(0.85, "rgba(255, 195, 90, 0.04)");
    bg.addColorStop(1, "rgba(255, 180, 60, 0)");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, range, angle - spread, angle + spread);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fffdf0";
    ctx.shadowColor = "#ffe680";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * 5, y + Math.sin(angle) * 5, 2, 0, 7);
    ctx.fill();
    ctx.shadowBlur = 0;

    const t = typeof worldT !== "undefined" ? worldT : (typeof E !== "undefined" ? E.t : 0);
    ctx.fillStyle = "rgba(255, 250, 220, 0.65)";
    for (let i = 0; i < 7; i++) {
      const dist = ((i * 31 + t * 24) % (range - 20)) + 15;
      const offs = Math.sin(t * 1.5 + i * 2.3) * (spread * 0.7 * (dist / range));
      const px2 = x + Math.cos(angle + offs) * dist;
      const py2 = y + Math.sin(angle + offs) * dist;
      ctx.fillRect(Math.round(px2), Math.round(py2), 1.5, 1.5);
    }
    ctx.restore();
  }
}
function drawNode(n, X, Y, t) {
  const info = NODE_INFO[n.type], used = nodeUsed(n);
  if (info.base === "sapPool") { ctx.fillStyle = used ? "#7a5520" : "#e0a030"; ctx.beginPath(); ctx.ellipse(X, Y - 2, 8, 3.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#ffd27a"; ctx.fillRect(X - 3, Y - 4, 2, 1); }
  else if (info.base === "core") { const g = ctx.createRadialGradient(X, Y - 14, 1, X, Y - 14, 18); g.addColorStop(0, "#f0e0ff"); g.addColorStop(0.4, "rgba(180,140,255,0.7)"); g.addColorStop(1, "rgba(120,80,200,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y - 14, 18 + Math.sin(t * 2) * 2, 0, 7); ctx.fill(); }
  else { const r = TS16[info.base]; t16(ctx, info.base, X - r[2] / 2, Y - r[3] + 1, undefined, undefined, used && n.type !== "chest" ? 0.5 : 1); }
  if (n.type === "chest" && used) return;
  if (!used || n.type === "bunker") { const by = Y - 24 + Math.sin(t * 3 + (n.x || 0) * 0.05) * 1.5; icon16(ctx, n.type === "bunker" && used ? ICON.echo : info.icon, X - 6, by, 12, used ? 0.4 : 1); }
}

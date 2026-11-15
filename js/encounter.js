let E = null;
const BOX = { x:62, y:44, w:260, h:140 };
const tierOf = s => s >= 450 ? 3 : s >= 320 ? 2 : s >= 170 ? 1 : 0;
const TIER_COL = ["#5fb3ff", "#ffd94a", "#ff5a3c", "#ffffff"];
const TIER_NAME = ["BLUE", "YELLOW", "RED", "WHITE-HOT"];
const TIER_MULT = [1, 1.6, 2.4, 3];
const STYLE = [[12,"WILT-BREAKER"],[8,"PINBALL WIZARD"],[5,"KINETIC FLURRY"],[3,"TRIPLE RICOCHET"],[2,"DOUBLE BANK"]];
const ATTACK_SPEED = 90;
function makeFoe(ty, x, y, lvl) {
  const F = FOES[ty], sc = F.scale || 1, hp = 1;
  return scaleFoe({ type:ty, F, x, y, vx:0, vy:0, r:(F.spr[0] === "big" ? 7 : 6) * sc, hp, maxHp:hp, dir:1, t:Math.random(), hitCd:0, contactCd:0.8, atk:0, hurt:0, stun:0, slow:0, dying:0,
    fireCd:1 + Math.random(), hopCd:1 + Math.random(), state:"track", stT:2 + Math.random() * 2, patT:2, patI:0, queue:[], moving:false }, lvl ?? enemyLevel(G.loc, F.boss));
}
function startEncounterFromWorld(wf) {
  const group = [wf, ...WFOES.filter(o => o !== wf && Math.hypot(o.x - wf.x, o.y - wf.y) < 80)].slice(0, 3);
  startEncounter(group.map(g => g.type), { src:group });
}
function startEncounter(types, opts = {}) {
  DLG = null; document.getElementById("dialog").classList.add("hidden"); document.getElementById("prompt").classList.add("hidden");
  const region = G.loc;
  E = { region, t:0, rects:[], foes:[], bullets:[], fx:[], floats:[], clones:[], zones:[], sap:[], spikes:[], prisms:[], beams:[], src:opts.src || [], boss:!!opts.boss,
    p:{ x:BOX.x + 36, y:BOX.y + BOX.h / 2, vx:0, vy:0, r:6, dir:2, cracks:0, iframes:1.0, stun:0, brace:0, invis:0, dashCd:0, crackCd:0, t:0, trail:[] },
    aim:null, combo:0, best:0, restT:0, parryBuf:0, wallWin:0, stamina:maxStamina(), kinetic:0, critHits:0, compT:2.5, flee:0, killed:[], calmed:0, blightK:0, beastK:0,
    wind:{ state:"idle", t:4, dx:0, dy:0 }, miasmaT:0, sunT:0, mycelT:1, shake:0, prismCd:0, over:null, overT:0, intro:1.3, flash:0.6 };
  buildArena(region);
  swordEncInit(); if (E.fuelMsg) float(E.p.x, E.p.y - 20, E.fuelMsg, E.fueled ? "#ffb35a" : "#999");
  const n = types.length;
  types.forEach((ty, i) => E.foes.push(makeFoe(ty, BOX.x + BOX.w - 50 - (i % 2) * 34, BOX.y + 30 + (n === 1 ? BOX.h / 2 - 30 : i * (BOX.h - 60) / Math.max(1, n - 1)))));
  G.stats.fights++;
  mode = "encounter"; renderHud();
}
function buildArena(R) {
  const b = BOX, add = (x, y, w, h, type) => E.rects.push({ x, y, w, h, type });
  add(b.x - 10, b.y - 10, b.w + 20, 10, "stone"); add(b.x - 10, b.y + b.h, b.w + 20, 10, "stone");
  add(b.x - 10, b.y, 10, b.h, "stone"); add(b.x + b.w, b.y, 10, b.h, "stone");
  const rx = () => b.x + 70 + Math.random() * (b.w - 130), ry = () => b.y + 18 + Math.random() * (b.h - 50);
  if (R === "sun") { add(b.x + 70, b.y, 46, 4, "bumper"); add(b.x + 150, b.y + b.h - 4, 46, 4, "bumper"); add(rx(), ry(), 14, 14, "stone"); }
  if (R === "trunk") { add(b.x, b.y + 30, 4, 44, "moss"); add(b.x + b.w - 4, b.y + 70, 4, 44, "moss"); add(rx(), ry(), 16, 12, "stone");
    for (let i = 0; i < 3; i++) E.sap.push({ x:rx(), y:ry() + 10, r:12 + Math.random() * 6 }); E.spikes.push({ x:rx(), y:b.y + b.h - 10, w:30, h:8 }); }
  if (R === "silt") { add(b.x + 110, b.y + 20, 8, 44, "cracked"); add(b.x + 175, b.y + 76, 8, 44, "cracked"); add(b.x + 140, b.y + b.h - 4, 40, 4, "moss"); add(b.x + 30, b.y, 36, 4, "bumper"); }
  if (R === "glass") { add(b.x + 90, b.y, 44, 4, "bumper"); add(b.x + b.w - 4, b.y + 40, 4, 50, "bumper"); add(rx(), ry(), 12, 12, "stone");
    E.prisms.push({ x:b.x + 120, y:b.y + 50, r:6 }, { x:b.x + 190, y:b.y + 100, r:6 });
    E.beams.push({ axis:"h", pos:b.y + 40, state:"off", t:2.5 }, { axis:"v", pos:b.x + 160, state:"off", t:4.5 }); }
  if (R === "roots") { add(b.x + 120, b.y + 26, 8, 40, "cracked"); add(b.x + 120, b.y + 80, 8, 36, "cracked"); add(b.x + 60, b.y + b.h - 4, 40, 4, "bumper");
    E.spikes.push({ x:b.x + 180, y:b.y, w:40, h:7 }); E.beams.push({ axis:"h", pos:b.y + 100, state:"off", t:3.5 }); }
}
const pSpeed = () => Math.hypot(E.p.vx, E.p.vy);
const hostiles = () => E.foes.filter(f => !f.dead && !f.dying && !f.calm && !f.phantom);
function encKey(k) {
  if (E.over) { if (E.overT > 0.8 && (["enter"," ","e"].includes(k) || isActionKey("interact", k))) finishEncounter(); return; }
  if (E.intro > 0) return;
  if (isActionKey("parry", k) || k === " ") { if (E.wallWin > 0) { parry(); E.wallWin = 0; } else E.parryBuf = swordParryWin(); }
  if (isActionKey("run", k) || k === "shift") dash();
  if (isActionKey("tonic", k) || k === "h") usePotion();
  if (isActionKey("bomb", k) || k === "b") throwBomb();
  const L = activeList();
  if (isActionKey("act1", k) && L[0]) return useActive(L[0]);
  if (isActionKey("act2", k) && L[1]) return useActive(L[1]);
  if (isActionKey("act3", k) && L[2]) return useActive(L[2]);
  const n = parseInt(k, 10); if (n >= 1 && n <= L.length) useActive(L[n - 1]);
}
function encPointerDown() {
  if (!E) return;
  if (E.over) { if (E.overT > 0.8) finishEncounter(); return; }
  if (E.intro > 0) return;
  if (E.p.stun > 0) return float(E.p.x, E.p.y - 16, "STUNNED", "#aaa");
  E.aim = { sx:mouse.x, sy:mouse.y };
}
function launchSpeed(len) { const maxL = 400 * (has("storm") ? 1.3 : has("glider") ? 1.15 : 1); return (100 + Math.min(1, len / 60) * (maxL - 100)) * swordLaunchMult(); }
function encPointerUp() {
  if (!E || !E.aim) return;
  const a = E.aim; E.aim = null;
  const dx = a.sx - mouse.x, dy = a.sy - mouse.y, len = Math.hypot(dx, dy);
  if (len < 5) return;
  const moving = pSpeed() > 60;
  if (moving && E.stamina < 1) return float(E.p.x, E.p.y - 16, "NO STAMINA", "#5fb3ff");
  if (moving) E.stamina -= 1;
  const sp = launchSpeed(len);
  E.p.vx = dx / len * sp; E.p.vy = dy / len * sp;
  E.fx.push({ type:"ring", x:E.p.x, y:E.p.y, t:0, col:TIER_COL[tierOf(sp)] });
}
function launchVec() {
  if (!E.aim) return null;
  const dx = E.aim.sx - mouse.x, dy = E.aim.sy - mouse.y, len = Math.hypot(dx, dy); if (len < 5) return null;
  const sp = launchSpeed(len); return [dx / len * sp, dy / len * sp];
}
function float(x, y, s, col = "#fff") { E.floats.push({ x, y, s, col, t:0 }); }
function crack() {
  const p = E.p; p.cracks++; float(p.x, p.y - 18, "CRACK", "#9fd3ff"); E.shake = 0.15;
  if (p.cracks >= 3) { p.cracks = 0; p.stun = 1.0; float(p.x, p.y - 26, "SHATTER!", "#ff8080"); hurtPlayer(2, { env:true, unavoidable:true }); E.fx.push({ type:"shards", x:p.x, y:p.y, t:0 }); }
}
function parry() {
  const p = E.p, s = pSpeed(); if (s < 1) return;
  const ns = Math.min(640, Math.max(s * 2, 260)); p.vx *= ns / s; p.vy *= ns / s;
  if (p.cracks > 0) p.cracks--;
  if (has("amber")) E.kinetic = Math.min(5, E.kinetic + 1);
  E.combo++; float(p.x, p.y - 20, "PARRY! KINETIC BOOST", "#ffe46a"); E.fx.push({ type:"ring", x:p.x, y:p.y, t:0, col:"#fff", big:true }); E.shake = 0.1;
  swordOnParry();
}
function dash() {
  const p = E.p; if (p.dashCd > 0 || E.stamina < 1 || p.stun > 0) return;
  let dx = (keys["d"] ? 1 : 0) - (keys["a"] ? 1 : 0), dy = (keys["s"] ? 1 : 0) - (keys["w"] ? 1 : 0);
  if (!dx && !dy) { dx = mouse.x - p.x; dy = mouse.y - p.y; }
  const l = Math.hypot(dx, dy) || 1; p.vx += dx / l * 240; p.vy += dy / l * 240; p.iframes = Math.max(p.iframes, 0.28 + 0.01 * maxStamina()); p.dashCd = 0.55; E.stamina -= 1;
  E.fx.push({ type:"ring", x:p.x, y:p.y, t:0, col:"#9fe8f0" });
}
function hurtPlayer(d, o = {}) {
  const p = E.p; if (E.over) return;
  if (!o.unavoidable && (p.iframes > 0 || (p.invis > 0 && !o.env))) return;
  if (o.energy && has("prism")) { float(p.x, p.y - 16, "REFLECT", "#9fe8f0"); if (o.bullet) { o.bullet.vx *= -1; o.bullet.vy *= -1; o.bullet.friendly = true; } return; }
  if (!o.unavoidable && has("ocelli") && Math.random() < 0.25) { float(p.x, p.y - 16, "DODGE", "#9fe8f0"); p.iframes = 0.3; return; }
  if (o.fire && overgrown()) d *= 2;
  if (o.env && G.companion === "sylva") d = Math.ceil(d / 2);
  if (p.brace > 0) d = Math.ceil(d / 2);
  if (has("amber")) E.kinetic = Math.min(5, E.kinetic + 1);
  G.hp = Math.max(0, G.hp - d); p.iframes = 0.8; E.combo = 0; E.shake = 0.2;
  float(p.x, p.y - 14, "-" + d, o.fire ? "#ffb35a" : "#ff6b6b");
  if (o.fire && !o.self) swordOnFire();
  if (G.hp <= 0) endEncounter("lose");
}
function damageFoe(f, d, o = {}) {
  if (f.dead || f.dying) return;
  if (f.phantom) { f.dead = true; float(f.x, f.y - 10, "only spores…", "#b48be8"); return; }
  if (o.fire && f.mutant) mutantBurst(f);
  if (f.dead || f.dying) return;
  f.hp -= d; f.hurt = 0.25; float(f.x, f.y - 14 * (f.F.scale || 1), d > 0 ? "-" + d : "CLANK", d > 0 ? (o.col || "#fff") : "#aaa");
  if (f.hp <= 0) { f.dying = 0.7; E.killed.push(f.type); if (f.F.blight) E.blightK++; else if (!f.F.boss) E.beastK++; E.fx.push({ type:"burst", x:f.x, y:f.y, t:0 }); }
}
function hitDamage(spd) { return Math.max(1, baseDmg() + [0, 0, 1, 2][tierOf(spd)] + (E.combo >= 10 ? 2 : E.combo >= 5 ? 1 : 0)); }
function activeList() {
  const L = [];
  if (has("vineWhip")) L.push({ id:"lash", name:"Lash", icon:GRAFTS.vineWhip.icon, cost:2 });
  if (has("beetle")) L.push({ id:"brace", name:"Brace", icon:GRAFTS.beetle.icon, cost:1 });
  if (has("amber")) L.push({ id:"release", name:"Release", icon:GRAFTS.amber.icon, cost:2, need:() => E.kinetic > 0 });
  if (has("prism")) L.push({ id:"refract", name:"Refract", icon:GRAFTS.prism.icon, cost:3 });
  if (has("pheromone")) L.push({ id:"calm", name:"Calm", icon:GRAFTS.pheromone.icon, cost:2 });
  if (has("sunlens")) L.push({ id:"focus", name:"Focus", icon:GRAFTS.sunlens.icon, cost:3 });
  return L.slice(0, 5);
}
function useActive(a) {
  const p = E.p;
  if (E.stamina < a.cost) return float(p.x, p.y - 16, "NO STAMINA", "#5fb3ff");
  if (a.need && !a.need()) return float(p.x, p.y - 16, "NO CHARGE", "#aaa");
  const hs = hostiles();
  if (a.id === "lash") {
    if (!hs.length) return; const t = hs.reduce((m, f) => Math.hypot(f.x - mouse.x, f.y - mouse.y) < Math.hypot(m.x - mouse.x, m.y - mouse.y) ? f : m);
    const dx = t.x - p.x, dy = t.y - p.y, l = Math.hypot(dx, dy) || 1; p.vx = dx / l * 420; p.vy = dy / l * 420; E.fx.push({ type:"vine", x:p.x, y:p.y, x2:t.x, y2:t.y, t:0 });
  }
  if (a.id === "brace") { p.brace = 3; float(p.x, p.y - 16, "BRACE", "#9fe8f0"); }
  if (a.id === "release") {
    const k = E.kinetic; E.kinetic = 0; E.fx.push({ type:"ring", x:p.x, y:p.y, t:0, col:"#ffb35a", big:true });
    for (const f of hs) { const d = dist(f, p) || 1; if (d < 52) { damageFoe(f, symPow() + k, { col:"#ffb35a" }); if (!f.F.boss) { f.vx += (f.x - p.x) / d * 160; f.vy += (f.y - p.y) / d * 160; } } }
    E.bullets = E.bullets.filter(b => b.friendly || Math.hypot(b.x - p.x, b.y - p.y) > 52);
  }
  if (a.id === "refract") { p.invis = 2.5; float(p.x, p.y - 16, "REFRACT", "#9fe8f0"); }
  if (a.id === "calm") {
    const beasts = E.foes.filter(f => !f.dead && !f.dying && !f.calm && (f.F.beast || f.phantom) && !f.F.boss).sort((a, b) => dist(a, p) - dist(b, p));
    if (!beasts.length) return float(p.x, p.y - 16, "NO BEASTS", "#aaa");
    const f = beasts[0]; if (f.phantom) { f.dead = true; } else { f.calm = 0.01; E.calmed++; float(f.x, f.y - 14, "CALMED", "#9ad04a"); }
  }
  if (a.id === "focus") {
    const dx = mouse.x - p.x, dy = mouse.y - p.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    E.fx.push({ type:"beam", x:p.x, y:p.y, x2:p.x + ux * 400, y2:p.y + uy * 400, t:0 });
    for (const f of hs) { const rx = f.x - p.x, ry = f.y - p.y, proj = rx * ux + ry * uy; if (proj > 0 && Math.abs(rx * uy - ry * ux) < f.r + 4) damageFoe(f, 1 + 2 * symPow(), { col:"#ffe08a" }); }
  }
  E.stamina -= a.cost;
}
function usePotion() { if (G.res.potions < 1 || G.hp >= maxHp()) return; G.res.potions--; G.hp = Math.min(maxHp(), G.hp + 4); float(E.p.x, E.p.y - 16, "+4", "#7dff7a"); }
function throwBomb() { if (G.res.bombs < 1) return; G.res.bombs--; E.zones.push({ x:clamp(mouse.x, BOX.x, BOX.x + BOX.w), y:clamp(mouse.y, BOX.y, BOX.y + BOX.h), r:26, t:0.45, bomb:true }); }
function collideRect(o, r, R) {
  const px = clamp(o.x, R.x, R.x + R.w), py = clamp(o.y, R.y, R.y + R.h);
  const dx = o.x - px, dy = o.y - py, d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return null;
  const d = Math.sqrt(d2); let nx, ny;
  if (d < 1e-4) {
    const l = o.x - R.x, rr = R.x + R.w - o.x, t = o.y - R.y, bb = R.y + R.h - o.y, m = Math.min(l, rr, t, bb);
    nx = m === l ? -1 : m === rr ? 1 : 0; ny = nx ? 0 : (m === t ? -1 : 1);
    if (nx) o.x = nx < 0 ? R.x - r : R.x + R.w + r; else o.y = ny < 0 ? R.y - r : R.y + R.h + r;
  } else { nx = dx / d; ny = dy / d; o.x = px + nx * r; o.y = py + ny * r; }
  return [nx, ny];
}
function updateEncounter(rdt) {
  if (E.intro > 0) { E.intro -= rdt; E.flash = Math.max(0, E.flash - rdt); return; }
  if (E.over) { E.overT += rdt; return; }
  const ts = E.aim ? (has("ocelli") ? 0.08 : 0.2) : 1, dt = rdt * ts, p = E.p, R = E.region;
  E.t += dt; p.t += dt;
  E.parryBuf = Math.max(0, E.parryBuf - rdt); E.wallWin = Math.max(0, E.wallWin - rdt); E.shake = Math.max(0, E.shake - rdt);
  for (const k of ["iframes","stun","brace","invis","dashCd","crackCd"]) p[k] = Math.max(0, (p[k] || 0) - dt);
  E.prismCd = Math.max(0, E.prismCd - dt);
  E.stamina = Math.min(maxStamina(), E.stamina + dt * staminaRegen());
  swordTick(dt);
  if (keys["escape"] && !E.boss) { E.flee += rdt; if (E.flee > 1) return endEncounter("flee"); } else E.flee = 0;
  let sp = pSpeed(), walking = false;
  if (sp < 60 && !E.aim && p.stun <= 0) {
    const ix = (isActionDown("right") || keys["d"] || keys["arrowright"] ? 1 : 0) - (isActionDown("left") || keys["a"] || keys["arrowleft"] ? 1 : 0), iy = (isActionDown("down") || keys["s"] || keys["arrowdown"] ? 1 : 0) - (isActionDown("up") || keys["w"] || keys["arrowup"] ? 1 : 0);
    if (ix || iy) { const l = Math.hypot(ix, iy); p.vx = ix / l * 48; p.vy = iy / l * 48; walking = true; }
    else if (sp < 50) { p.vx *= Math.exp(-8 * dt); p.vy *= Math.exp(-8 * dt); }
  }
  p.walking = walking;
  if (R === "sun") {
    const w = E.wind; w.t -= dt;
    if (w.t <= 0) { if (w.state === "idle") { w.state = "warn"; w.t = G.companion === "sylva" ? 1.5 : 1; const a = pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]); w.dx = Math.cos(a); w.dy = Math.sin(a); }
      else if (w.state === "warn") { w.state = "gust"; w.t = 1.6; } else { w.state = "idle"; w.t = 4 + Math.random() * 2; } }
    if (w.state === "gust") { if (!has("glider") && !has("storm")) { p.vx += w.dx * 240 * dt; p.vy += w.dy * 240 * dt; } for (const f of E.foes) if (!f.F.flying && !f.F.boss) { f.vx += w.dx * 120 * dt; f.vy += w.dy * 120 * dt; } }
  }
  if ((R === "sun" || R === "glass") && has("photosynth")) { E.sunT += dt; if (E.sunT > 6) { E.sunT = 0; G.hp = Math.min(maxHp(), G.hp + 1); } }
  const inSap = E.sap.some(s => Math.hypot(p.x - s.x, p.y - s.y) < s.r);
  const k = inSap && !has("gillFronds") && !has("resinTitan") ? 4 : walking ? 0 : 0.55;
  p.vx *= Math.exp(-k * dt); p.vy *= Math.exp(-k * dt);
  sp = pSpeed();
  if (sp < 14 && !walking) { p.vx = p.vy = 0; }
  if (sp < 40) { E.restT += dt; if (E.restT > 0.3 && E.combo) { E.best = Math.max(E.best, E.combo); E.combo = 0; } } else E.restT = 0;
  const steps = Math.max(1, Math.ceil(sp * dt / 2.5));
  for (let s = 0; s < steps; s++) {
    p.x += p.vx * dt / steps; p.y += p.vy * dt / steps;
    for (const Rc of E.rects) { if (Rc.dead) continue; const n = collideRect(p, p.r, Rc); if (n) wallHit(Rc, n[0], n[1]); }
    for (const f of E.foes) {
      if (f.dead || f.dying || f.calm) continue;
      const d = dist(p, f); if (d >= p.r + f.r + (pSpeed() >= ATTACK_SPEED && !walking ? swordReach(pSpeed()) : 0)) continue;
      const nx = (p.x - f.x) / (d || 1), ny = (p.y - f.y) / (d || 1), spd = pSpeed();
      const rr = Math.max(d, p.r + f.r + 0.5); p.x = f.x + nx * rr; p.y = f.y + ny * rr;
      if (f.phantom) { damageFoe(f, 1); continue; }
      if (spd >= ATTACK_SPEED && !walking) {
        if (f.hitCd <= 0) {
          swordStrike(f, spd); f.hitCd = 0.22; E.combo++;
          if (!f.F.boss) { const kb = 0.45 * (sword().knock || 1); f.vx -= nx * spd * kb; f.vy -= ny * spd * kb; }
          E.fx.push({ type:"spark", x:(p.x + f.x) / 2, y:(p.y + f.y) / 2, t:0, col:TIER_COL[tierOf(spd)] });
        }
        const vn = p.vx * nx + p.vy * ny; if (vn < 0) { p.vx -= 2 * vn * nx; p.vy -= 2 * vn * ny; } p.vx *= 0.92; p.vy *= 0.92;
      } else if (f.contactCd <= 0 && f.stun <= 0) { hurtPlayer(f.dmg, { fire:f.F.fire }); f.contactCd = 1.0; f.atk = 0.3; }
      if (E.over) return;
    }
    if (pSpeed() >= ATTACK_SPEED && !walking) for (const f of E.foes) if (f.part && !f.dead && !f.dying) hitBossPart(f, pSpeed());
    for (const pr of E.prisms) if (E.prismCd <= 0 && pSpeed() >= 170 && Math.hypot(p.x - pr.x, p.y - pr.y) < p.r + pr.r) {
      E.prismCd = 1.2; const a = Math.atan2(p.vy, p.vx), s2 = pSpeed() * 1.1;
      E.clones.push({ x:p.x, y:p.y, vx:Math.cos(a + 0.55) * s2, vy:Math.sin(a + 0.55) * s2, life:3, hit:new Map() });
      p.vx = Math.cos(a - 0.3) * s2; p.vy = Math.sin(a - 0.3) * s2; float(pr.x, pr.y - 10, "SPLIT!", "#9fe8f0"); triggerPrism("PRISM");
    }
  }
  if (sp > 20) p.dir = Math.abs(p.vx) > Math.abs(p.vy) ? (p.vx < 0 ? 1 : 2) : (p.vy < 0 ? 3 : 0);
  p.trail.push({ x:p.x, y:p.y, c:TIER_COL[tierOf(sp)] }); if (p.trail.length > 18) p.trail.shift();
  for (const sk of E.spikes) if (p.x > sk.x - 4 && p.x < sk.x + sk.w + 4 && p.y > sk.y - 4 && p.y < sk.y + sk.h + 4 && p.iframes <= 0) { hurtPlayer(1, { env:true }); if (!E.over) crack(); }
  if (E.over) return;
  for (const bm of E.beams) {
    bm.t -= dt;
    if (bm.t <= 0) { if (bm.state === "off") { bm.state = "warn"; bm.t = G.companion === "sylva" ? 1.5 : 1; } else if (bm.state === "warn") { bm.state = "on"; bm.t = 0.5; bm.hit = new Set(); } else { bm.state = "off"; bm.t = 2 + Math.random() * 2.5; if (bm.temp) bm.dead = true; } }
    if (bm.state === "on") {
      const onLine = o => bm.axis === "h" ? Math.abs(o.y - bm.pos) < 5 : Math.abs(o.x - bm.pos) < 5;
      if (onLine(p) && !bm.hit.has("p") && p.invis <= 0) { bm.hit.add("p"); if (has("prism")) float(p.x, p.y - 16, "REFLECT", "#9fe8f0"); else { hurtPlayer(2, { energy:true, env:true }); if (!E.over) crack(); } }
      for (const f of hostiles()) if (onLine(f) && !bm.hit.has(f)) { bm.hit.add(f); damageFoe(f, 2, { col:"#ffb35a" }); }
    }
  }
  if (E.over) return;
  E.beams = E.beams.filter(b => !b.dead);
  if (R === "silt" && !has("sporeFilter") && !has("mycelCrown")) {
    E.stamina = Math.max(0, E.stamina - dt * 1.0);
    if (E.stamina <= 0.05) { E.miasmaT += dt; if (E.miasmaT > 2) { E.miasmaT = 0; hurtPlayer(1, { env:true, unavoidable:true });
      if (!E.over && E.foes.filter(f => f.phantom && !f.dead).length < 2) { const ph = makeFoe("siltShade", BOX.x + 40 + Math.random() * (BOX.w - 80), BOX.y + 20 + Math.random() * (BOX.h - 40)); ph.phantom = true; ph.hp = ph.maxHp = 1; ph.F = { ...FOES.siltShade, name:"???" }; E.foes.push(ph); float(p.x, p.y - 20, "the mist moves…", "#b48be8"); } } }
  }
  if (E.over) return;
  if (has("mycelCrown")) { E.mycelT -= dt; if (E.mycelT <= 0) { E.mycelT = 1; for (const f of hostiles()) if (dist(f, p) < 34) damageFoe(f, symPow(), { col:"#c9a8ff" }); } }
  for (const z of E.zones) {
    z.t -= dt;
    if (z.t <= 0 && !z.done) { z.done = true; E.fx.push({ type:"boom", x:z.x, y:z.y, t:0, r:z.r });
      if (z.bomb) { for (const f of hostiles()) if (Math.hypot(f.x - z.x, f.y - z.y) < z.r + f.r) damageFoe(f, 2 + symPow() + (E.sap.some(s => Math.hypot(f.x - s.x, f.y - s.y) < s.r) ? 2 : 0), { col:"#ffb35a", fire:true });
        for (const Rc of E.rects) if (Rc.type === "cracked" && !Rc.dead && Math.hypot(Rc.x + Rc.w / 2 - z.x, Rc.y + Rc.h / 2 - z.y) < z.r + 20) { Rc.dead = true; float(Rc.x, Rc.y, "CRUMBLE", "#ccc"); } }
      else if (Math.hypot(p.x - z.x, p.y - z.y) < z.r) { if (has("photosynth") || has("storm")) { G.hp = Math.min(maxHp(), G.hp + 1); float(p.x, p.y - 16, "+1 sunlight", "#7dff7a"); } else hurtPlayer(z.dmg, { fire:true, env:true }); } }
  }
  if (E.over) return;
  E.zones = E.zones.filter(z => !z.done);
  for (const f of E.foes) updateFoe(f, dt);
  if (E.over) return;
  const live = E.foes.filter(f => !f.dead);
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) { const a = live[i], b = live[j], d = dist(a, b), m = a.r + b.r; if (d < m && d > 0) { const push = (m - d) / 2, nx = (a.x - b.x) / d, ny = (a.y - b.y) / d; a.x += nx * push; a.y += ny * push; b.x -= nx * push; b.y -= ny * push; } }
  for (const b of E.bullets) {
    b.life -= dt; b.x += b.vx * dt; b.y += b.vy * dt; b.t = (b.t || 0) + dt;
    if (!b.pierceBox && (b.x < BOX.x || b.x > BOX.x + BOX.w || b.y < BOX.y || b.y > BOX.y + BOX.h)) b.life = 0;
    if (!b.pierceBox) for (const Rc of E.rects) if (!Rc.dead && b.x > Rc.x && b.x < Rc.x + Rc.w && b.y > Rc.y && b.y < Rc.y + Rc.h) b.life = 0;
    if (b.life <= 0) continue;
    if (b.friendly) { for (const f of hostiles()) if (Math.hypot(f.x - b.x, f.y - b.y) < f.r + b.r && !(b.hitSet && b.hitSet.has(f))) { if (b.dmg > 0) damageFoe(f, b.dmg, { col:b.col || "#fff", fire:b.fire }); if (b.comp) onCompanionBolt(b, f); if (b.slow) f.slow = 3; if (b.stun) f.stun = 1.4; if (b.pierce) { (b.hitSet || (b.hitSet = new Set())).add(f); continue; } b.life = 0; break; } }
    else if (Math.hypot(p.x - b.x, p.y - b.y) < p.r + b.r - 1 && p.invis <= 0) { hurtPlayer(b.dmg, { energy:b.energy, fire:b.fire, bullet:b }); if (!b.friendly) b.life = 0; if (E.over) return; }
  }
  E.bullets = E.bullets.filter(b => b.life > 0);
  for (const c of E.clones) {
    c.life -= dt; c.vx *= Math.exp(-0.4 * dt); c.vy *= Math.exp(-0.4 * dt);
    c.x += c.vx * dt; c.y += c.vy * dt;
    for (const Rc of E.rects) if (!Rc.dead) { const n = collideRect(c, 4, Rc); if (n) { const vn = c.vx * n[0] + c.vy * n[1]; if (vn < 0) { c.vx -= 2 * vn * n[0]; c.vy -= 2 * vn * n[1]; } } }
    for (const f of hostiles()) if (dist(c, f) < f.r + 4 && !(c.hit.get(f) > E.t)) { c.hit.set(f, E.t + 0.4); damageFoe(f, Math.max(1, Math.round(hitDamage(Math.hypot(c.vx, c.vy)) * 0.7)), { col:"#9fe8f0" }); }
  }
  E.clones = E.clones.filter(c => c.life > 0);
  E.compT -= dt;
  if (E.compT <= 0) {
    const hs = hostiles(), cx = BOX.x - 26, cy = BOX.y + BOX.h - 18;
    if (hs.length) {
      const t = hs.reduce((m, f) => dist(f, E.p) < dist(m, E.p) ? f : m);
      const dx = t.x - cx, dy = t.y - cy, l = Math.hypot(dx, dy) || 1;
      const cid = G.companion, bd = compBoltDmg(cid);
      if (cid === "kaelen") E.bullets.push({ x:cx, y:cy, vx:dx / l * 230, vy:dy / l * 230, r:3, dmg:bd, life:2, friendly:true, pierceBox:true, fire:true, comp:cid, pierce:compPerk("kaelen", 6), col:"#ffb35a", color:"#ffd2a0" });
      else if (cid === "sylva") E.bullets.push({ x:cx, y:cy, vx:dx / l * 180, vy:dy / l * 180, r:3, dmg:bd, life:2, friendly:true, pierceBox:true, slow:true, comp:cid, col:"#c9a8ff", color:"#c9a8ff" });
      else for (let m = 0; m < (compPerk("bram", 9) ? 2 : 1); m++) { const tg = m ? (hs.filter(o => o !== t)[0] || t) : t, ex = tg.x - cx, ey = tg.y - cy, el = Math.hypot(ex, ey) || 1; E.bullets.push({ x:cx, y:cy - m * 6, vx:ex / el * 150, vy:ey / el * 150, r:3, dmg:bd, life:2.5, friendly:true, pierceBox:true, stun:true, comp:cid, col:"#ffd27a", color:"#ffe9a8", moth:true }); }
      E.compT = compCooldown(cid);
      swordOnCompanionShot();
    } else E.compT = 1;
  }
  for (const x of E.fx) x.t += rdt; E.fx = E.fx.filter(x => x.t < 0.6);
  for (const fl of E.floats) fl.t += rdt; E.floats = E.floats.filter(fl => fl.t < 1);
  if (!hostiles().length && !E.foes.some(f => f.dying > 0 && !f.dead)) endEncounter("win");
}
function wallHit(Rc, nx, ny) {
  const p = E.p, spd = pSpeed(), vn = p.vx * nx + p.vy * ny;
  if (vn >= 0) return;
  if (Rc.type === "moss") { p.vx = p.vy = 0; if (spd > 60) { float(p.x, p.y - 14, "ABSORBED", "#7fd26a"); E.best = Math.max(E.best, E.combo); E.combo = 0; } return; }
  if (Rc.type === "cracked" && spd >= 320) { Rc.dead = true; p.vx *= 0.85; p.vy *= 0.85; float(Rc.x + Rc.w / 2, Rc.y, "SMASH!", "#ffe46a"); E.fx.push({ type:"shards", x:Rc.x + Rc.w / 2, y:Rc.y + Rc.h / 2, t:0 }); E.combo++; if (Math.random() < 0.5) { gain({ scrap:1 }); float(Rc.x, Rc.y + 10, "+scrap", "#ccc"); } return; }
  p.vx -= 2 * vn * nx; p.vy -= 2 * vn * ny;
  if (Rc.type === "bumper") { const s = pSpeed() || 1, ns = Math.max(260, s * 1.6); p.vx *= ns / s; p.vy *= ns / s; float(p.x, p.y - 12, "BUMPER", "#ff6bff"); }
  else { p.vx *= 0.9; p.vy *= 0.9; }
  if (spd < 30) return;
  E.fx.push({ type:"spark", x:p.x - nx * p.r, y:p.y - ny * p.r, t:0, col:TIER_COL[tierOf(spd)] });
  if (spd >= ATTACK_SPEED) E.combo++;
  if (!p.walking && spd >= 60 && spd < 170 && Rc.type !== "bumper" && p.brace <= 0 && !has("resinTitan") && (!p.crackCd || p.crackCd <= 0)) {
    crack();
    p.crackCd = 0.35;
  }
  if (spd >= 320 && has("amber")) E.kinetic = Math.min(5, E.kinetic + 1);
  if (E.parryBuf > 0) { E.parryBuf = 0; parry(); } else E.wallWin = swordParryWin();
}
function fireAt(f, n, spread, speed, extra = {}) {
  const p = E.p, base = Math.atan2(p.y - f.y, p.x - f.x);
  for (let i = 0; i < n; i++) { const a = base + (n > 1 ? (i - (n - 1) / 2) * spread : 0);
    E.bullets.push({ x:f.x, y:f.y - 4, vx:Math.cos(a) * speed, vy:Math.sin(a) * speed, r:3, dmg:extra.dmg || f.dmg, life:4, energy:extra.energy ?? f.F.energy, fire:extra.fire ?? f.F.fire, spr:f.F.spr[0] === "tiny" && TINY[f.F.spr[1]].proj ? f.F.spr : null, color:extra.color || (f.F.energy ? "#9fe8ff" : f.F.fire ? "#ffb35a" : "#d9c9f5") }); }
}
function radial(f, n, speed, extra = {}) {
  const off = Math.random() * Math.PI;
  for (let i = 0; i < n; i++) { const a = off + i / n * Math.PI * 2;
    E.bullets.push({ x:f.x, y:f.y - 4, vx:Math.cos(a) * speed, vy:Math.sin(a) * speed, r:extra.r || 3, dmg:extra.dmg || f.dmg, life:extra.life || 4, energy:f.F.energy, fire:f.F.fire, spr:null, color:extra.color || (f.F.energy ? "#9fe8ff" : f.F.fire ? "#ffb35a" : "#d9c9f5") }); }
}
function updateFoe(f, dt) {
  if (f.dead) return;
  f.t += dt;
  if (f.dying > 0) { f.dying -= dt; if (f.dying <= 0) f.dead = true; return; }
  if (f.calm) { f.calm += dt; f.x += 30 * dt; if (f.calm > 1.6) f.dead = true; return; }
  for (const k of ["hitCd","contactCd","hurt","stun","slow","atk"]) f[k] = Math.max(0, f[k] - dt);
  if (f.part) f.part.hitCd = Math.max(0, f.part.hitCd - dt);
  swordTickFoe(f, dt); if (f.dead || f.dying) return;
  const p = E.p, F = f.F, dx = p.x - f.x, dy = p.y - f.y, d = Math.hypot(dx, dy) || 1;
  const seen = p.invis <= 0;
  let spd = F.speed * (f.slow > 0 ? 0.5 : 1); if (f.stun > 0) spd = 0;
  let mx = 0, my = 0;
  const ai = f.phantom ? "chase" : F.ai;
  if (ai === "chase") { if (seen) { mx = dx / d; my = dy / d; } }
  else if (ai === "hopper") { f.hopCd -= dt; if (f.hopCd <= 0 && seen && f.stun <= 0) { f.vx += dx / d * 140; f.vy += dy / d * 140; f.hopCd = 1.5 + Math.random() * 0.5; } spd = 0; }
  else if (ai === "shooter") {
    if (seen) { if (d < 60) { mx = -dx / d; my = -dy / d; } else if (d > 100) { mx = dx / d; my = dy / d; } else { mx = -dy / d * 0.6; my = dx / d * 0.6; } }
    f.fireCd -= dt; if (f.fireCd <= 0 && seen && f.stun <= 0) { fireAt(f, F.proj.n, F.proj.spread, F.proj.speed, { energy:F.proj.energy, fire:F.proj.fire }); f.fireCd = F.proj.cd; f.atk = 0.3; }
  }
  else if (ai === "spore") { if (seen) { mx = dx / d * 0.6; my = dy / d * 0.6; } f.fireCd -= dt; if (f.fireCd <= 0 && f.stun <= 0) { radial(f, 6, 42, { dmg:1, life:5, color:"#c9a8ff" }); f.fireCd = 3.2; f.atk = 0.3; } }
  if (ai === "charger" || (ai === "boss" && f.state !== "track")) chargerAI(f, dt, dx, dy, d, seen);
  if (ai === "charger" && f.state === "track" && seen) { mx = dx / d * 0.7; my = dy / d * 0.7; }
  if (ai === "boss") bossAI(f, dt, dx, dy, d, seen, (a, b) => { mx = a; my = b; });
  const inSap = E.sap.some(s => Math.hypot(f.x - s.x, f.y - s.y) < s.r) && !F.sapImmune;
  const drag = f.state === "charge" ? 0 : inSap ? 5 : (ai === "hopper" ? 3 : 4);
  f.vx *= Math.exp(-drag * dt); f.vy *= Math.exp(-drag * dt);
  const sm = inSap ? 0.4 : 1;
  f.x += (mx * spd * sm + f.vx) * dt; f.y += (my * spd * sm + f.vy) * dt;
  for (const Rc of E.rects) if (!Rc.dead) { const n = collideRect(f, f.r, Rc); if (n && f.state === "charge") { const vn = f.vx * n[0] + f.vy * n[1]; if (vn < 0) { f.vx -= 2 * vn * n[0]; f.vy -= 2 * vn * n[1]; } } }
  const mvx = mx * spd + f.vx, mvy = my * spd + f.vy;
  if (Math.abs(mvx) + Math.abs(mvy) > 3) f.dir = Math.abs(mvx) > Math.abs(mvy) ? (mvx < 0 ? 1 : 2) : (mvy < 0 ? 3 : 0);
  f.moving = Math.abs(mvx) + Math.abs(mvy) > 3;
}
function chargerAI(f, dt, dx, dy, d, seen) {
  f.stT -= dt;
  if (f.state === "track" && f.stT <= 0 && seen) { f.state = "wind"; f.stT = G.companion === "sylva" ? 0.9 : 0.6; f.cdx = dx / d; f.cdy = dy / d; }
  else if (f.state === "wind" && f.stT <= 0) { f.state = "charge"; f.stT = 0.8; f.vx = f.cdx * 185; f.vy = f.cdy * 185; f.atk = 0.8; }
  else if (f.state === "charge") { const s = Math.hypot(f.vx, f.vy) || 1; f.vx = f.vx / s * 185; f.vy = f.vy / s * 185;
    if (f.stT <= 0) { f.state = "track"; f.stT = 2.5 + Math.random() * 1.5; f.vx *= 0.2; f.vy *= 0.2; } }
}
function bossAI(f, dt, dx, dy, d, seen, setMove) {
  const F = f.F;
  if (f.state === "track" && seen) setMove(dx / d * 0.6, dy / d * 0.6);
  if (f.queue.length) { f.queue[0].t -= dt; if (f.queue[0].t <= 0) f.queue.shift().fn(); }
  f.patT -= dt;
  if (f.patT > 0 || f.state !== "track" || f.stun > 0) return;
  const pats = { flare:["burst","flare","aimed","charge"], sap:["burst","sap","charge","aimed"], spores:["spores","aimed","burst","spores"], beam:["beam","burst","aimed","beam"], summon:["summon","burst","charge","aimed"] }[F.special];
  let pat = pats[f.patI++ % pats.length]; f.patT = 2.6; f.atk = 0.5;
  if (f.part && f.part.broken && ["flare","sap","spores","beam","summon"].includes(pat)) pat = f.patI % 2 ? "burst" : "aimed";
  const p = E.p, warn = G.companion === "sylva" ? 1.4 : 0.9;
  if (pat === "burst") radial(f, 12, 72);
  if (pat === "aimed") for (let i = 0; i < 3; i++) f.queue.push({ t:0.25, fn:() => fireAt(f, 3, 0.25, 115, { dmg:Math.max(1, f.dmg - 1) }) });
  if (pat === "charge") { f.stT = 0; chargerAI(f, 0, dx, dy, d, true); }
  if (pat === "flare") for (let i = 0; i < 3; i++) E.zones.push({ x:clamp(p.x + (Math.random() - 0.5) * 70, BOX.x + 10, BOX.x + BOX.w - 10), y:clamp(p.y + (Math.random() - 0.5) * 50, BOX.y + 10, BOX.y + BOX.h - 10), r:20, t:warn + 0.1, dmg:f.dmg });
  if (pat === "sap") { if (E.sap.length < 6) for (let i = 0; i < 2; i++) E.sap.push({ x:BOX.x + 40 + Math.random() * (BOX.w - 80), y:BOX.y + 20 + Math.random() * (BOX.h - 40), r:14 }); radial(f, 6, 50, { color:"#e0a030" }); }
  if (pat === "spores") radial(f, 10, 38, { life:6, r:4, color:"#c9a8ff" });
  if (pat === "beam") E.beams.push({ axis:"h", pos:p.y, state:"warn", t:warn, temp:true }, { axis:"v", pos:p.x, state:"warn", t:warn, temp:true });
  if (pat === "summon" && hostiles().length < 4) E.foes.push(makeFoe(Math.random() < 0.5 ? "rootDemon" : "husk", f.x - 24, clamp(f.y + (Math.random() - 0.5) * 30, BOX.y + 10, BOX.y + BOX.h - 10)));
}
function endEncounter(res) {
  if (E.over) return;
  E.over = res; E.overT = 0; E.best = Math.max(E.best, E.combo); E.aim = null;
  G.stats.bestCombo = Math.max(G.stats.bestCombo, E.best);
}
function finishEncounter() {
  const res = E.over, id = E.region, A = AREA(id);
  const lines = [];
  let after = null;
  if (res === "win") {
    const reward = {}; for (const [k, r] of Object.entries(A.yield)) reward[k] = [Math.ceil(r[0] * 0.5), Math.ceil(r[1] * 0.8) + Math.floor(E.killed.length / 2)];
    let got = gain(reward);
    const org = Math.round(E.beastK * 0.6) + (E.boss ? 3 : 0); if (org) got += " " + gain({ organs:org });
    if (compPerk("bram", 6) && G.companion === "bram") got += " " + gain({ coins:[2, 5], scrap:1 });
    const xpWon = E.foes.filter(f => !f.phantom && (f.calm || f.hp <= 0)).reduce((s, f) => s + foeXP(f), 0);
    if (xpWon) { lines.push(`+${xpWon} XP from Spore-Essence.`); setTimeout(() => gainXP(xpWon, "Spore-Essence"), 50); }
    let bal = E.blightK * 3 - E.beastK * 2 + E.calmed * 2;
    G.stats.kills += E.killed.length; G.stats.calms += E.calmed;
    lines.push(`Victory! Best combo: ${E.best}${E.best >= 2 ? ` — ${(STYLE.find(s => E.best >= s[0]) || [0, ""])[1]}` : ""}.`);
    if (E.boss && id === "roots") { G.coreDown = true; WARDEN = null; bal = 0; lines.push("The PALE Sentinel crumbles into chalk. The Root-Core lies open."); got += " " + gain({ coins:20 }); }
    else if (E.boss) {
      const r = G.regions[id], mg = MYTHIC[id];
      r.warden = false; r.bal = 45; bal = 0; G.taint += 2; G.stats.hunts++; WARDEN = null;
      if (!G.owned.includes(mg)) G.owned.push(mg);
      got += " " + gain({ rareSeeds:1, coins:20 });
      lines.push(`From its heart you carve a mythic graft: ${GRAFTS[mg].name}. The wounded forest settles at 45 balance (+2 taint).`);
      if (!r.echo) { r.echo = true; G.echoes.push(id); lines.push("A memory floods out of the dying Warden:", ECHOES[id]); log("Root Echo received."); }
      const relic = id === "glass" ? "prismEdge" : id === "sun" ? "pruner" : null;
      if (relic) { const rl = grantRelic(relic); if (rl) lines.push(id === "glass" ? "Fused glass from the Leviathan's carapace sharpens into a blade of refracted light." : "Wedged in the Warden's nest: a pre-collapse chainsaw-greatsword, still humming.", rl); }
      log(`Hunted the ${FOES[REGIONS[id].warden].name}.`);
    } else {
      if (REGIONS[id] && status(G.regions[id].bal) === "enraged") G.taint += 1;
      if (bal && REGIONS[id]) changeBal(id, bal); else bal = 0;
    }
    toast(`Spoils: ${got || "nothing"}${bal ? ` · balance ${bal > 0 ? "+" : ""}${bal}` : ""}`);
    WFOES = WFOES.filter(w => !E.src.includes(w));
    encCooldown = 1.5;
  } else if (res === "flee") {
    const lost = Math.floor(G.res.sap / 3); G.res.sap -= lost;
    lines.push(`You scramble out of the fight${lost ? `, spilling ${lost} sap` : ""}.`);
    for (const w of E.src) w.stun = 3; encCooldown = 2.5;
  } else {
    const ls = Math.floor(G.res.sap / 2), lc = Math.floor(G.res.coins / 3); G.res.sap -= ls; G.res.coins -= lc;
    G.hp = Math.floor(maxHp() * 0.4);
    lines.push("You shatter...", `${COMPANIONS[G.companion].name} drags you back to the caravan. Lost ${ls} sap and ${lc} barter bits.`);
    after = () => doFade(() => { G.phase = 0; advanceDay(); if (G.over) return showCollapse(); enterRegion(G.loc === "roots" ? "silt" : G.loc); });
  }
  E = null; mode = "world"; save(); renderHud();
  say(lines, { char:CHAR.player, name:res === "win" ? "Victory" : res === "flee" ? "Escaped" : "Defeat", onClose:after });
}

/* ---------- encounter drawing ---------- */
function drawEncounter() {
  const t = E.t, p = E.p, R = E.region;
  ctx.save();
  if (E.shake > 0) {
    const mag = Math.min(2.5, E.shake * 15);
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
  }
  ctx.fillStyle = "#000"; ctx.fillRect(-4, -4, VW + 8, VH + 8);
  const bgc = { sun:"rgba(255,200,80,", trunk:"rgba(230,140,40,", silt:"rgba(160,110,255,", glass:"rgba(90,220,255,", roots:"rgba(255,60,60," }[R];
  ctx.strokeStyle = bgc + "0.12)"; ctx.lineWidth = 1;
  for (let i = -2; i < 16; i++) { const o = (performance.now() / 120) % 32; ctx.beginPath(); ctx.moveTo(i * 32 + o, 0); ctx.lineTo(i * 32 + o - 60, VH); ctx.stroke(); }
  ctx.fillStyle = "#06090a"; ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
  ctx.fillStyle = bgc + "0.05)"; for (let y = BOX.y; y < BOX.y + BOX.h; y += 10) for (let x = BOX.x + ((y - BOX.y) / 10 % 2) * 10; x < BOX.x + BOX.w; x += 20) ctx.fillRect(x, y, 10, 10);
  for (const s of E.sap) { ctx.fillStyle = "rgba(225,140,25,0.55)"; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * 0.7, 0, 0, 7); ctx.fill(); ctx.fillStyle = "rgba(255,210,120,0.6)"; ctx.fillRect(s.x - 3, s.y - 2, 4, 1); }
  for (const sk of E.spikes) { ctx.fillStyle = "#b02a2a"; for (let x = sk.x; x < sk.x + sk.w; x += 6) { ctx.beginPath(); ctx.moveTo(x, sk.y + sk.h); ctx.lineTo(x + 3, sk.y); ctx.lineTo(x + 6, sk.y + sk.h); ctx.fill(); } }
  for (const bm of E.beams) {
    if (bm.state === "off") continue;
    ctx.save();
    if (bm.state === "warn") { ctx.strokeStyle = `rgba(255,80,80,${0.4 + Math.sin(performance.now() / 30) * 0.3})`; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; }
    else { ctx.strokeStyle = "#ffe9c0"; ctx.lineWidth = 3; ctx.shadowColor = "#ff9a3c"; ctx.shadowBlur = 8; }
    ctx.beginPath(); if (bm.axis === "h") { ctx.moveTo(BOX.x, bm.pos); ctx.lineTo(BOX.x + BOX.w, bm.pos); } else { ctx.moveTo(bm.pos, BOX.y); ctx.lineTo(bm.pos, BOX.y + BOX.h); } ctx.stroke(); ctx.restore();
  }
  for (const z of E.zones) if (!z.done) { ctx.strokeStyle = z.bomb ? "#ffb35a" : `rgba(255,220,90,${0.5 + Math.sin(performance.now() / 40) * 0.4})`; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
  for (const Rc of E.rects) {
    if (Rc.dead) continue;
    const inside = Rc.x >= BOX.x - 1 && Rc.x + Rc.w <= BOX.x + BOX.w + 1 && Rc.y >= BOX.y - 1 && Rc.y + Rc.h <= BOX.y + BOX.h + 1;
    if (!inside) continue;
    if (Rc.type === "bumper") { ctx.fillStyle = `hsl(${300 + Math.sin(t * 4) * 30},100%,60%)`; ctx.shadowColor = "#ff6bff"; ctx.shadowBlur = 6; ctx.fillRect(Rc.x, Rc.y, Rc.w, Rc.h); ctx.shadowBlur = 0; }
    else if (Rc.type === "moss") { ctx.fillStyle = "#2f6b2a"; ctx.fillRect(Rc.x, Rc.y, Rc.w, Rc.h); ctx.fillStyle = "#58b84f"; for (let i = 0; i < Math.max(Rc.w, Rc.h); i += 3) ctx.fillRect(Rc.x + (Rc.w > Rc.h ? i : 1), Rc.y + (Rc.w > Rc.h ? 1 : i), 2, 2); }
    else if (Rc.type === "cracked") { ctx.fillStyle = "#5b5560"; ctx.fillRect(Rc.x, Rc.y, Rc.w, Rc.h); ctx.strokeStyle = "#1c1820"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Rc.x + 1, Rc.y + 4); ctx.lineTo(Rc.x + Rc.w - 2, Rc.y + Rc.h / 3); ctx.lineTo(Rc.x + 2, Rc.y + Rc.h * 0.7); ctx.lineTo(Rc.x + Rc.w - 1, Rc.y + Rc.h - 3); ctx.stroke(); }
    else { ctx.fillStyle = "#3a3f44"; ctx.fillRect(Rc.x, Rc.y, Rc.w, Rc.h); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.strokeRect(Rc.x + 0.5, Rc.y + 0.5, Rc.w - 1, Rc.h - 1); }
  }
  for (const pr of E.prisms) { ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(t * 2); ctx.fillStyle = E.prismCd > 0 ? "rgba(160,240,255,0.4)" : "#a6eef5"; ctx.shadowColor = "#9fe8ff"; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 0); ctx.lineTo(0, 7); ctx.lineTo(-5, 0); ctx.fill(); ctx.restore(); }
  const lv = launchVec();
  if (lv) drawTrajectory(lv[0], lv[1]);
  for (const f of [...E.foes].sort((a, b) => a.y - b.y)) {
    if (f.dead) continue;
    const sc = f.F.scale || 1, a = f.calm ? Math.max(0, 1 - f.calm / 1.6) : f.phantom ? 0.45 + Math.sin(t * 6) * 0.2 : (f.hurt > 0 && Math.floor(performance.now() / 33) % 2 ? 0.35 : 1);
    ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.beginPath(); ctx.ellipse(f.x, f.y + 1, f.r, f.r * 0.35, 0, 0, 7); ctx.fill();
    if (f.state === "wind") { ctx.strokeStyle = `rgba(255,60,60,${0.5 + Math.sin(performance.now() / 25) * 0.5})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(f.x, f.y - 6 * sc, f.r + 4, 0, 7); ctx.stroke(); }
    const anim = f.dying > 0 ? "death" : f.hurt > 0 ? "hit" : (f.atk > 0 ? "atk" : f.moving ? "walk" : "idle");
    drawFoeSprite(ctx, f.F.spr, anim, f.dying > 0 ? 0.7 - f.dying : f.t, f.dir, f.x, f.y + 1, sc, a);
    if (f.part && !f.part.broken && !f.dying) { const pp = partPos(f), pr = 4 + Math.sin(t * 6) * 1; ctx.save(); ctx.shadowColor = "#ffe46a"; ctx.shadowBlur = 6; ctx.strokeStyle = "#ffe46a"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(pp.x, pp.y, pr + 1, 0, 7); ctx.stroke(); ctx.fillStyle = "rgba(255,228,106,0.35)"; ctx.fill(); ctx.restore(); outlineText(ctx, f.part.name, pp.x, pp.y - 8, "#ffe46a", "5px 'Pixelify Sans'"); }
    if (f.mutant && !f.dying) { ctx.fillStyle = `rgba(255,150,60,${0.5 + Math.sin(t * 8) * 0.3})`; ctx.beginPath(); ctx.arc(f.x + 4, f.y - 10 * sc, 2.5, 0, 7); ctx.fill(); }
    if (f.marked && !f.dying) { ctx.fillStyle = "#9ad04a"; ctx.fillRect(f.x - 1, f.y - 18 * sc, 2, 2); }
    if (f.stun > 0) outlineText(ctx, "✶", f.x, f.y - 16 * sc, "#ffe46a", "8px sans-serif");
    if (f.calm) outlineText(ctx, "♥", f.x, f.y - 16 * sc, "#9ad04a", "8px sans-serif");
  }
  for (const c of E.clones) drawChar(ctx, CHAR.player, 2, 1, c.x, c.y + 9, 0.45);
  for (let i = 1; i < p.trail.length; i++) { const a = p.trail[i - 1], b = p.trail[i]; ctx.strokeStyle = b.c; ctx.globalAlpha = i / p.trail.length * 0.8; ctx.lineWidth = 1 + i / p.trail.length * 4; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  ctx.globalAlpha = 1;
  const sp = pSpeed(), tier = tierOf(sp);
  const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 14); g.addColorStop(0, TIER_COL[tier] + "aa"); g.addColorStop(1, TIER_COL[tier] + "00");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, 7); ctx.fill();
  const pa = p.invis > 0 ? 0.3 : (p.iframes > 0 && Math.floor(performance.now() / 50) % 2 ? 0.5 : 1);
  drawChar(ctx, CHAR.player, p.dir, sp > 20 ? [0,1,2,1][Math.floor(p.t * 12) % 4] : 1, p.x, p.y + 9, pa);
  drawSword(p, sp);
  if (p.cracks) { ctx.strokeStyle = "rgba(220,240,255,0.95)"; ctx.lineWidth = 0.8; for (let i = 0; i < p.cracks * 3; i++) { const a = i * 2.4 + 0.5; ctx.beginPath(); ctx.moveTo(p.x, p.y - 2); ctx.lineTo(p.x + Math.cos(a) * 7, p.y - 2 + Math.sin(a) * 8); ctx.lineTo(p.x + Math.cos(a + 0.4) * 10, p.y - 2 + Math.sin(a + 0.4) * 10); ctx.stroke(); } }
  if (p.brace > 0) { ctx.strokeStyle = "#9fe8f0"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y - 1, 10, 0, 7); ctx.stroke(); }
  if (overgrown()) { ctx.strokeStyle = "#58b84f"; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { const a = t * 2 + i * 2.1; ctx.beginPath(); ctx.arc(p.x, p.y - 1, 11, a, a + 0.8); ctx.stroke(); } }
  for (const b of E.bullets) {
    if (b.moth) { icon16(ctx, IC(59, 13), b.x - 5, b.y - 5, 10); continue; }
    if (b.spr && drawProj(ctx, b.spr, b.x, b.y, Math.atan2(b.vy, b.vx), b.t || 0)) continue;
    ctx.fillStyle = b.color || "#fff"; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 4; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  }
  for (const x of E.fx) {
    const k = x.t / 0.6;
    if (x.type === "ring") { ctx.strokeStyle = x.col; ctx.globalAlpha = 1 - k; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x.x, x.y, (x.big ? 40 : 16) * k + 4, 0, 7); ctx.stroke(); }
    if (x.type === "spark") { ctx.fillStyle = x.col; ctx.globalAlpha = 1 - k; for (let i = 0; i < 6; i++) { const a = i * 1.05 + x.x; ctx.fillRect(x.x + Math.cos(a) * k * 14, x.y + Math.sin(a) * k * 14, 1.5, 1.5); } }
    if (x.type === "burst") { ctx.fillStyle = "#fff"; ctx.globalAlpha = 1 - k; for (let i = 0; i < 10; i++) { const a = i * 0.63; ctx.fillRect(x.x + Math.cos(a) * k * 20, x.y - 6 + Math.sin(a) * k * 20, 2, 2); } }
    if (x.type === "shards") { ctx.fillStyle = "#cfe8ff"; ctx.globalAlpha = 1 - k; for (let i = 0; i < 12; i++) { const a = i * 0.52; ctx.fillRect(x.x + Math.cos(a) * k * 24, x.y + Math.sin(a) * k * 24 + k * k * 10, 2, 1); } }
    if (x.type === "boom") { ctx.fillStyle = `rgba(255,170,60,${0.6 * (1 - k)})`; ctx.beginPath(); ctx.arc(x.x, x.y, x.r * (0.6 + k * 0.5), 0, 7); ctx.fill(); }
    if (x.type === "vine" || x.type === "beam") { ctx.strokeStyle = x.type === "vine" ? "#58b84f" : "#ffe9a0"; ctx.globalAlpha = 1 - k; ctx.lineWidth = x.type === "beam" ? 4 : 2; ctx.beginPath(); ctx.moveTo(x.x, x.y); ctx.lineTo(x.x2, x.y2); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  const dark = (R === "silt" || R === "roots") && !has("echoBulb") && !has("mycelCrown");
  if (dark) { ctx.save(); ctx.beginPath(); ctx.rect(BOX.x, BOX.y, BOX.w, BOX.h); ctx.clip(); drawLight(p.x, p.y, 62, 0.92); ctx.restore(); }
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(BOX.x - 1, BOX.y - 1, BOX.w + 2, BOX.h + 2);
  if (R === "sun" && E.wind.state !== "idle") { const w = E.wind, col = w.state === "warn" ? `rgba(255,255,255,${0.4 + Math.sin(performance.now() / 50) * 0.4})` : "#e9f6ff";
    for (let i = 0; i < 6; i++) { const ox = BOX.x + 20 + ((i * 47 + (w.state === "gust" ? t * 160 : 0)) % (BOX.w - 40)), oy = BOX.y + 20 + (i * 31) % (BOX.h - 40);
      outlineText(ctx, w.dx > 0.5 ? "»" : w.dx < -0.5 ? "«" : w.dy > 0 ? "v" : "^", ox, oy, col, "10px 'Pixelify Sans'"); }
    outlineText(ctx, w.state === "warn" ? "GUST INCOMING" : "GUST!", BOX.x + BOX.w / 2, BOX.y - 4, "#e9f6ff", "7px 'Pixelify Sans'"); }
  const C = COMPANIONS[G.companion];
  drawChar(ctx, C.char, 2, Math.floor(performance.now() / 330) % 2 ? 1 : 0, BOX.x - 26, BOX.y + BOX.h - 2);
  outlineText(ctx, C.name, BOX.x - 26, BOX.y + BOX.h + 8, "#9fd3ff", "6px 'Pixelify Sans'");
  ctx.restore();
  drawEncHud(); drawSwordHud();
  if (E.intro > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.max(0, E.flash)})`; ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, VH / 2 - 22, VW, 44);
    outlineText(ctx, E.boss ? `${E.foes[0].F.name} attacks!` : `${E.foes.map(f => f.F.name).join(", ")} ${E.foes.length > 1 ? "draw" : "draws"} near!`, VW / 2, VH / 2 - 4, "#ffe46a", "11px 'Pixelify Sans'");
    outlineText(ctx, "Drag back & release to launch · Space at impact = PARRY", VW / 2, VH / 2 + 12, "#fff", "7px 'Pixelify Sans'"); }
  if (E.over) {
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, 0, VW, VH);
    outlineText(ctx, E.over === "win" ? "VICTORY" : E.over === "flee" ? "ESCAPED" : "SHATTERED", VW / 2, VH / 2 - 6, E.over === "win" ? "#ffe46a" : "#ff8080", "18px 'Pixelify Sans'");
    if (E.overT > 0.8) outlineText(ctx, "Press Enter / click", VW / 2, VH / 2 + 14, "#fff", "8px 'Pixelify Sans'");
  }
}
function drawTrajectory(vx, vy) {
  const p = E.p, o = { x:p.x, y:p.y, vx, vy }, dt = 1 / 60, steps = has("echoBulb") ? 150 : 80;
  for (let i = 0; i < steps; i++) {
    o.vx *= Math.exp(-0.55 * dt); o.vy *= Math.exp(-0.55 * dt);
    let stop = false;
    for (let s = 0; s < 3 && !stop; s++) { o.x += o.vx * dt / 3; o.y += o.vy * dt / 3;
      for (const Rc of E.rects) { if (Rc.dead) continue; const n = collideRect(o, p.r, Rc); if (n) { const vn = o.vx * n[0] + o.vy * n[1]; if (vn < 0) { if (Rc.type === "moss") { stop = true; break; } o.vx -= 2 * vn * n[0]; o.vy -= 2 * vn * n[1]; if (Rc.type === "bumper") { o.vx *= 1.6; o.vy *= 1.6; } } } } }
    if (i % 3 === 0) { ctx.globalAlpha = 1 - i / steps; ctx.fillStyle = TIER_COL[tierOf(Math.hypot(o.vx, o.vy))]; ctx.fillRect(o.x - 1, o.y - 1, 2, 2); }
    if (stop || Math.hypot(o.vx, o.vy) < 20) break;
  }
  ctx.globalAlpha = 1;
  if (E.aim) { ctx.strokeStyle = "#ffffff88"; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(E.aim.sx, E.aim.sy); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); ctx.setLineDash([]); }
}
function drawEncHud() {
  const p = E.p;
  const hs = E.foes.filter(f => !f.dead && !f.phantom && !f.calm);
  hs.slice(0, 4).forEach((f, i) => { const x = 8 + i * 94, y = 6;
    const tr = enemyTier(f.lvl), ar = Math.max(0, f.armor - f.armorCrack);
    outlineText(ctx, `Lv${f.lvl} ${f.F.name}`, x, y + 6, f.F.boss ? "#ff8a80" : "#fff", "7px 'Pixelify Sans'", "left");
    outlineText(ctx, `${tr.name}${ar ? ` · Bark-Armor ${ar}` : ""}${f.mutant ? " · Spore-sac" : ""}`, x, y + 20, tr.col, "5px 'Pixelify Sans'", "left");
    ctx.fillStyle = "#222"; ctx.fillRect(x, y + 9, 86, 4); ctx.fillStyle = f.F.boss ? "#ff3b3b" : "#e0473f"; ctx.fillRect(x, y + 9, 86 * Math.max(0, f.hp) / f.maxHp, 4);
    outlineText(ctx, `${Math.max(0, Math.ceil(f.hp))}/${f.maxHp}`, x + 86, y + 6, "#ddd", "5px 'Pixelify Sans'", "right");
    if (f.part && !f.part.broken) { ctx.fillStyle = "#332"; ctx.fillRect(x, y + 22, 50, 2); ctx.fillStyle = "#ffe46a"; ctx.fillRect(x, y + 22, 50 * f.part.hp / f.part.maxHp, 2); outlineText(ctx, f.part.name, x + 53, y + 25, "#ffe46a", "5px 'Pixelify Sans'", "left"); } });
  const by = BOX.y + BOX.h + 6;
  outlineText(ctx, "HP", BOX.x, by + 7, "#fff", "7px 'Pixelify Sans'", "left");
  ctx.fillStyle = "#300"; ctx.fillRect(BOX.x + 14, by + 1, 70, 7); ctx.fillStyle = "#ffdf3a"; ctx.fillRect(BOX.x + 14, by + 1, 70 * G.hp / maxHp(), 7);
  outlineText(ctx, `${Math.ceil(G.hp)}/${maxHp()}`, BOX.x + 88, by + 7, "#fff", "7px 'Pixelify Sans'", "left");
  outlineText(ctx, "ST", BOX.x, by + 18, "#fff", "7px 'Pixelify Sans'", "left");
  for (let i = 0; i < maxStamina(); i++) { ctx.fillStyle = i < Math.floor(E.stamina) ? "#5fb3ff" : "#123"; ctx.fillRect(BOX.x + 14 + i * Math.min(7, 70 / maxStamina()), by + 12, Math.min(6, 70 / maxStamina() - 1), 6); }
  outlineText(ctx, "SHELL", BOX.x + 90, by + 18, "#fff", "7px 'Pixelify Sans'", "left");
  for (let i = 0; i < 3; i++) { ctx.strokeStyle = i < p.cracks ? "#ff8080" : "#9fd3ff"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(BOX.x + 118 + i * 9, by + 12); ctx.lineTo(BOX.x + 122 + i * 9, by + 18); ctx.lineTo(BOX.x + 126 + i * 9, by + 12); ctx.closePath(); ctx.stroke(); }
  if (has("amber")) outlineText(ctx, `KINETIC ${E.kinetic}`, BOX.x + 150, by + 18, "#ffb35a", "7px 'Pixelify Sans'", "left");
  const sp = pSpeed(), tier = tierOf(sp);
  outlineText(ctx, `${TIER_NAME[tier]} ${Math.round(sp)}`, BOX.x + BOX.w, by + 7, TIER_COL[tier], "7px 'Pixelify Sans'", "right");
  if (E.combo >= 2) { const st = STYLE.find(s => E.combo >= s[0]); outlineText(ctx, `x${E.combo} ${st ? st[1] : ""}`, BOX.x + BOX.w, by + 18, "#ffe46a", "8px 'Pixelify Sans'", "right"); }
  const L = activeList(); let hx = BOX.x; const hy = VH - 24;
  [...L.map((a, i) => ({ key:String(i + 1), icon:a.icon, name:a.name, ok:E.stamina >= a.cost && (!a.need || a.need()) })),
   { key:"H", icon:ICON.potions, name:`Tonic ${G.res.potions}`, ok:G.res.potions > 0 }, { key:"B", icon:ICON.bombs, name:`Bomb ${G.res.bombs}`, ok:G.res.bombs > 0 },
   { key:"⇧", icon:IC(121, 0), name:"Dash", ok:E.stamina >= 2 }].forEach(s => {
    ctx.globalAlpha = s.ok ? 1 : 0.35; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.strokeRect(hx + 0.5, hy + 0.5, 15, 15); icon16(ctx, s.icon, hx + 2, hy + 2, 12);
    outlineText(ctx, s.key, hx + 2, hy + 6, "#ffe46a", "6px 'Pixelify Sans'", "left");
    outlineText(ctx, s.name, hx + 8, hy + 22, "#ddd", "5px 'Pixelify Sans'"); ctx.globalAlpha = 1; hx += 30; });
  outlineText(ctx, E.boss ? "Bosses can't be fled" : (E.flee > 0 ? "Fleeing…" : "Hold Esc to flee"), VW - 8, VH - 6, "#888", "6px 'Pixelify Sans'", "right");
  outlineText(ctx, "SPACE: parry at impact", VW - 8, VH - 14, E.wallWin > 0 ? "#ffe46a" : "#888", "6px 'Pixelify Sans'", "right");
  for (const fl of E.floats) outlineText(ctx, fl.s, fl.x, fl.y - fl.t * 14, fl.col, "7px 'Pixelify Sans'");
}

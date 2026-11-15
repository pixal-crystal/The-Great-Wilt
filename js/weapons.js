/* =========================================================================
   SWORDS — living weapons, salvaged pre-collapse tech, or a hybrid of both.
   Frames (archetypes) + Relics, Bio-Grafting vs Tech-Forging upgrade trees,
   and three modular component slots (Edge / Core / Hilt).
   Combat model: the player IS the projectile, so the sword modifies every
   ricochet strike (damage, reach, status effects, parries, launch power).
   ========================================================================= */

const SWORDS = {
  /* ---------- base frames ---------- */
  cleaver: { name:"Chitin-Cleaver", icon:IC(105,2), col:"#d8b27a", lean:"Root-Singer", style:"Heavy / Bruiser",
    lore:"A heavy, curved broadsword forged from the shed carapace of a colossal stag-beetle, reinforced with ironwood.",
    perk:"+1 damage. Cleaves armor at any speed, staggers foes (0.5s) and hurls them back hard. −10% launch power.",
    dmg:1.35, launch:0.9, armorBreak:true, stagger:0.5, knock:1.5 },
  sabre: { name:"Solar-Sabre", icon:IC(107,9), col:"#ffd25a", lean:"Industrialist", style:"Fast / Precision",
    lore:"A salvaged pre-collapse turbine blade fitted with a copper coil and a mirror-glass edge that catches sunlight.",
    perk:"+12% launch power and a wider parry window. In sunlit regions (Sun-Crown, Glass-Marsh) hits set foes burning.",
    dmg:0.95, launch:1.12, parryWin:0.22, sunBurn:true, salvage:{ scrap:5, crystal:2 } },
  briar: { name:"Briar-Whipblade", icon:IC(109,0), col:"#7fd26a", lean:"Root-Singer", style:"Mid-Range / Crowd Control",
    lore:"A segmented sword held together by living, thorny tendons. It lashes outward on heavy attacks.",
    perk:"Strikes reach 6px further (16px at red-hot). Each hit drags nearby foes toward you and envenoms the target.",
    dmg:1, launch:1, reach:6, reachHot:16, pull:true, venom:true, salvage:{ seeds:4, organs:2 } },
  channeler: { name:"Sap-Channeler", icon:IC(108,6), col:"#ffab3c", lean:"Hybrid", style:"Elemental / Status",
    lore:"A hollow, translucent amber-glass rapier with a pressurized reservoir in the hilt.",
    perk:"Every thrust injects liquid resin: target slowed 3s and takes damage over time. Spore cores fire on every thrust.",
    dmg:0.9, launch:1.05, inject:true, salvage:{ sap:4, crystal:1, scrap:2 } },

  /* ---------- legendary relics (quest rewards) ---------- */
  pruner: { name:"The First Pruner", relic:true, icon:IC(108,0), col:"#ff6a3c", lean:"Industrialist", style:"Relic · Chainsaw Greatsword",
    lore:"A massive two-handed industrial chainsaw-greatsword once used by pre-collapse terraforming engineers.",
    perk:"+2 damage, chews through armor and cracked stone at any speed. In the overworld, press Interact beside trees, stumps and logs to rev through them and open new paths.",
    dmg:1.6, launch:0.92, armorBreak:true, smash:true, pruneWorld:true,
    quest:"Breach a pre-collapse bunker with Bram & Pip, or hunt the Corona Warden of the Sun-Crown." },
  fang: { name:"Heartwood's Fang", relic:true, icon:IC(110,0), col:"#a8f58a", lean:"Root-Singer", style:"Relic · Living Katana",
    lore:"A living wooden katana grown from the central neural-root of the forest.",
    perk:"Never dulls, adds no Symbiosis and needs no fuel. Leaves glowing flowers where you step; wild beasts won't hunt you, and strikes may calm beasts outright (25%).",
    dmg:1.15, launch:1.08, neverDull:true, calmBeasts:true,
    quest:"Sing a Warden to sleep with a Restoration Ritual." },
  prismEdge: { name:"Prism-Edge", relic:true, icon:IC(107,3), col:"#9fe8ff", lean:"Hybrid", style:"Relic · Refracting Glass",
    lore:"Forged from the fused glass of the Glass-Marsh.",
    perk:"Every swing hits twice. When struck by sunlight (sunlit regions), a prism or a companion's shot, it splits into three phantom blades for 10s — every strike hits three times.",
    dmg:1.05, launch:1.05, prismSplit:true,
    quest:"Hunt the Prism Leviathan of the Glass-Marsh." },
};
const FRAME_IDS = ["cleaver", "sabre", "briar", "channeler"];
const RELIC_IDS = ["pruner", "fang", "prismEdge"];

/* ---------- modular components ---------- */
const PART_SLOTS = { edge:"The Edge", core:"The Core / Reservoir", hilt:"The Hilt / Grip" };
const PART_SLOT_HINT = { edge:"Damage type & elemental effect", core:"Special ability & resource", hilt:"Synergy with your grafts" };
const PARTS = {
  nettle:  { slot:"edge", name:"Nettle-Thorn Serration", lean:"Bio", icon:IC(15,0), cost:{ seeds:2, organs:1 },
    desc:"Hits inflict Bleed (1 dmg/s, stacks ×3) and slow the target." },
  thermal: { slot:"edge", name:"Thermal Filament", lean:"Tech", icon:IC(62,1), cost:{ scrap:3, crystal:1 },
    desc:"Superheated edge slices through armor (+2 dmg vs armored). Builds HEAT — at full heat it scalds you for 2 unless insulated." },
  blight:  { slot:"edge", name:"Calcified Blight-Shard", lean:"Corrupted", icon:IC(10,7), cost:{ crystal:2, spores:2 },
    desc:"+60% damage to blighted, mutated creatures — but slowly drains your stamina while equipped." },
  sporeSac:{ slot:"core", name:"Spore-Sac Gland", lean:"Bio", icon:IC(65,8), cost:{ spores:3, organs:1 },
    desc:"Red-hot strikes (or Sap-Channeler thrusts) burst a paralytic spore cloud, stunning foes nearby for 1.2s (3s cooldown)." },
  piston:  { slot:"core", name:"Kinetic Piston", lean:"Tech", icon:IC(13,5), cost:{ scrap:4, sap:1 },
    desc:"Parries store kinetic energy; your next strike unleashes a shockwave (3 dmg) that knocks enemies back." },
  photo:   { slot:"core", name:"Photosynth-Crystal", lean:"Hybrid", icon:IC(10,1), cost:{ crystal:2, seeds:2 },
    desc:"Recharges stamina 60% faster while fighting in sunlit regions." },
  tendon:  { slot:"hilt", name:"Tendon-Wrap", lean:"Bio", icon:IC(30,1), cost:{ organs:2, seeds:1 },
    desc:"Wires into your arm grafts: +2% launch power per point of Symbiosis." },
  rubber:  { slot:"hilt", name:"Insulated Rubber-Grip", lean:"Tech", icon:IC(115,14), cost:{ scrap:2, sap:2 },
    desc:"Shields you from your own weapon: no heat scalding, no Blight-Shard drain, and fire no longer withers bio-grafted blades." },
};
const LEAN_COL = { Bio:"#7fd26a", Tech:"#ffb35a", Hybrid:"#9fe8ff", Corrupted:"#c9a8ff", "Root-Singer":"#7fd26a", Industrialist:"#ffb35a" };

/* ---------- upgrade trees ---------- */
const BIO_TREE = [
  { cost:{ organs:1, seeds:2 },                 perk:"+1 DMG · life-steal (12% per hit heals 1) · edge regrows 4/s" },
  { cost:{ organs:2, spores:2, rareSeeds:1 },   perk:"Spore-venom on every hit · life-steal 24% · regrows 8/s" },
  { cost:{ organs:3, spores:3, rareSeeds:2 },   perk:"+1 DMG · bioluminescent bloom: life-steal 36% · stronger venom · regrows 12/s" },
];
const TECH_TREE = [
  { cost:{ scrap:3, sap:1 },                    perk:"+1 DMG · kinetic burst: red-hot strikes explode around the target (1 dmg)" },
  { cost:{ scrap:5, crystal:2, sap:2 },         perk:"Armor-piercing heat edge · bursts deal 2" },
  { cost:{ scrap:7, crystal:3, sap:3 },         perk:"+1 DMG · mechanical parry-counter: every parry fires a shockwave (1+SP dmg) · bursts deal 3" },
];

/* ---------- state helpers ---------- */
function ensureArms() {
  if (!G) return;
  if (G.res.organs == null) G.res.organs = 0;
  const a = G.arms || (G.arms = {});
  a.equipped = a.equipped || "cleaver";
  a.owned = a.owned || ["cleaver"];
  if (!a.owned.includes(a.equipped)) a.owned.push(a.equipped);
  a.lv = a.lv || {};
  a.parts = a.parts || [];
  a.slots = a.slots || { edge:null, core:null, hilt:null };
  a.cuts = a.cuts || {};
}
const sword = () => SWORDS[(G && G.arms && G.arms.equipped) || "cleaver"];
const swordLvOf = id => (G.arms.lv[id] || (G.arms.lv[id] = { bio:0, tech:0 }));
const swordBio = () => (G && G.arms) ? swordLvOf(G.arms.equipped).bio : 0;
const swordTech = () => (G && G.arms) ? swordLvOf(G.arms.equipped).tech : 0;
const hasPart = id => !!(G && G.arms) && Object.values(G.arms.slots).includes(id);
/* Bio-grafting feeds your Symbiosis meter (Heartwood's Fang is already part of the forest). */
const bladeSymb = () => (G && G.arms && !sword().neverDull) ? swordBio() : 0;
const isSunlit = id => !!(REGIONS[id] && REGIONS[id].sunlit);
/* Loud pistons and capacitors alert predators from further away. */
function foeNoticeRange(F) {
  if (sword().calmBeasts && F.beast) return 0;
  return 90 + 18 * swordTech();
}
function acquireSword(id, quiet) {
  ensureArms();
  if (G.arms.owned.includes(id)) return false;
  G.arms.owned.push(id);
  if (!quiet) toast(`New blade: ${SWORDS[id].name}`, "#ffe08a");
  log(`Acquired ${SWORDS[id].name}.`);
  return true;
}
function grantRelic(id) {
  if (!acquireSword(id, true)) return "";
  toast(`Relic blade claimed: ${SWORDS[id].name}!`, "#ffe08a");
  return `Relic sword claimed: ${SWORDS[id].name}! Equip it from the Armory.`;
}
function equipSword(id) { if (!G.arms.owned.includes(id)) return; G.arms.equipped = id; G.hp = Math.min(G.hp, maxHp()); save(); refreshPanel(); }
function swordDmgMult() { return sword().dmg || 1; }

/* ---------- overworld: Pruner cutting + Heartwood flowers ---------- */
const WOODY = ["tree", "otree", "deadtree", "deadtree2", "stump", "log"];
let FLOWERS = [], flowerT = 0;
function objTiles(o) { const fw = (OBJ[o.key] || { fw:1 }).fw; const tx = Math.round(o.x / TL - fw / 2), ty = Math.floor(o.y / TL); return { tx, ty, fw }; }
function clearObj(W, o) {
  const { tx, ty, fw } = objTiles(o);
  for (let x = tx; x < tx + fw; x++) { if (x < 0 || x >= MW) continue; const i = ty * MW + x; W.T[i] = T_WALK; W.objAt[i] = 0; W.kind[i] = 0; }
  W.objs = W.objs.filter(q => q !== o);
}
function applyCuts(W, id) {
  if (!G || !G.arms || !G.arms.cuts[id]) return;
  const set = new Set(G.arms.cuts[id]);
  for (const o of [...W.objs]) if (set.has(`${o.x},${o.y}`)) clearObj(W, o);
}
function pruneCandidates() {
  if (!sword().pruneWorld || !M) return [];
  const out = [];
  for (const o of M.objs) {
    if (!WOODY.includes(o.key)) continue;
    const { tx, ty } = objTiles(o);
    if (M.kind[ty * MW + tx] === 1) continue; // never cut the region's border wall
    out.push({ x:o.x, y:o.y, r:24, label:"Rev the First Pruner — cut through", fn:() => pruneObj(o) });
  }
  return out;
}
function pruneObj(o) {
  clearObj(M, o);
  (G.arms.cuts[G.loc] || (G.arms.cuts[G.loc] = [])).push(`${o.x},${o.y}`);
  let got = gain({ scrap:Math.random() < 0.35 ? 1 : 0, seeds:Math.random() < 0.3 ? 1 : 0 });
  if (Math.random() < 0.15) got += " " + gain({ coins:[4, 9] }) + " (a hidden cache behind the roots!)";
  if (REGIONS[G.loc]) changeBal(G.loc, -1);
  toast(`BRRRRRM — the overgrowth gives way. ${got}${REGIONS[G.loc] ? ` <span style="color:#e8cf4a">(−1 balance)</span>` : ""}`, "#ffb35a");
  save();
}
function updateFlowers(dt) {
  for (const f of FLOWERS) f.t += dt;
  FLOWERS = FLOWERS.filter(f => f.t < 4);
  if (!sword().calmBeasts || !PL || !PL.moving) return;
  flowerT -= dt;
  if (flowerT <= 0) { flowerT = 0.14; FLOWERS.push({ x:PL.x + (Math.random() - 0.5) * 6, y:PL.y + (Math.random() - 0.5) * 3, t:0, c:["#ffd6f2", "#fff27a", "#a8f58a", "#9fe8ff"][Math.floor(Math.random() * 4)] }); if (FLOWERS.length > 60) FLOWERS.shift(); }
}
function drawFlowers(camX, camY) {
  for (const f of FLOWERS) {
    const a = f.t < 3 ? 1 : 1 - (f.t - 3), X = Math.round(f.x - camX), Y = Math.round(f.y - camY);
    ctx.globalAlpha = Math.max(0, a) * 0.9; ctx.fillStyle = f.c;
    ctx.fillRect(X - 1, Y, 3, 1); ctx.fillRect(X, Y - 1, 1, 3);
    ctx.fillStyle = "#fff"; ctx.fillRect(X, Y, 1, 1);
  }
  ctx.globalAlpha = 1;
}

/* ---------- combat hooks ---------- */
const techLv = () => (E && E.fueled) ? swordTech() : 0;
function swordEncInit() {
  E.sharp = 100; E.heat = 0; E.piston = false; E.sporeCd = 0; E.prismBlade = 0; E.prismBladeCd = 0; E.sunPrismT = 2.5; E.fueled = false;
  if (swordTech() > 0) {
    if (G.res.sap >= 1) { G.res.sap--; E.fueled = true; E.fuelMsg = "SAP FUEL −1"; }
    else E.fuelMsg = "NO SAP FUEL — tech dormant";
  }
}
function swordLaunchMult() { let m = sword().launch || 1; if (hasPart("tendon")) m *= 1 + 0.02 * symbiosis(); return m; }
function swordReach(spd) { const S = sword(); if (!S.reach) return 0; return tierOf(spd) >= 2 ? S.reachHot : S.reach; }
function swordPierces() { return !!sword().armorBreak || hasPart("thermal") || techLv() >= 2; }
function swordParryWin() { return sword().parryWin || 0.13; }
function addDot(f, type, dur, dps, max = 1) {
  f.dots = f.dots || [];
  const d = f.dots.find(x => x.type === type);
  if (d) { d.t = Math.max(d.t, dur); d.stacks = Math.min(max, d.stacks + 1); d.dps = Math.max(d.dps, dps); }
  else f.dots.push({ type, t:dur, dps, stacks:1, acc:0 });
}
const DOT_COL = { burn:"#ffb35a", venom:"#7fd26a", resin:"#ffab3c", bleed:"#ff6b6b", poison:"#b6f07a" };
function swordTickFoe(f, dt) {
  if (!f.dots || !f.dots.length) return;
  for (const d of f.dots) {
    d.t -= dt; d.acc += d.dps * d.stacks * dt;
    while (d.acc >= 1 && !f.dying && !f.dead) { d.acc -= 1; damageFoe(f, 1, { col:DOT_COL[d.type], fire:d.type === "burn" }); }
  }
  f.dots = f.dots.filter(d => d.t > 0);
}
function shockwave(x, y, r, dmg, col, skip) {
  E.fx.push({ type:"ring", x, y, t:0, col, big:true });
  for (const o of hostiles()) {
    if (o === skip) continue;
    const d = Math.hypot(o.x - x, o.y - y) || 1;
    if (d < r + o.r) { damageFoe(o, dmg, { col }); if (!o.F.boss) { o.vx += (o.x - x) / d * 150; o.vy += (o.y - y) / d * 150; } }
  }
}
const FRAME_FLAT = { cleaver:1, sabre:0, briar:0, channeler:0, pruner:2, fang:1, prismEdge:0 };
/* Layered growth: level (Might) → frame flat bonus → upgrade-level bonus → components / extra hits. */
function swordFlat() { const id = G.arms.equipped, L = swordLvOf(id), up = Math.max(L.bio, L.tech); return (FRAME_FLAT[id] || 0) + (up >= 1 ? 1 : 0) + (up >= 3 ? 1 : 0); }
function swordDamage(f, base) {
  let d = base + swordFlat();
  if (E.sharp < 30) d -= 1;                                  // a dull edge loses a point
  if (hasPart("blight") && (f.F.blight || f.mutant)) d += 1;
  if (f.marked) d += compPerk("sylva", 9) ? 2 : 1;           // Sylva's Spore Mark
  if (E.critHits > 0) { d += 2; E.critHits--; float(f.x, f.y - 26, "CRIT!", "#ffe46a"); }   // Pip's Weak-Point Flare
  return Math.max(1, d);
}
function armorOf(f) { return Math.max(0, (f.armor || 0) - (f.armorCrack || 0)); }
/* One ricochet strike against a foe — replaces the plain hit. */
function swordStrike(f, spd) {
  let dmg = swordDamage(f, hitDamage(spd));
  const ar = swordPierces() ? 0 : armorOf(f);
  dmg = Math.max(0, dmg - ar);                                // Bark-Armor soaks damage
  if (hasPart("thermal") && armorOf(f) > 0) dmg += 1;
  const col = TIER_COL[tierOf(spd)], fire = hasPart("thermal") || (sword().sunBurn && isSunlit(E.region));
  const hits = sword().prismSplit ? (E.prismBlade > 0 ? 3 : 2) : 1;
  if (dmg <= 0) { damageFoe(f, 0, { col }); float(f.x, f.y - 22, "BLOCKED — armor!", "#aaa"); return; }
  for (let i = 0; i < hits && !f.dying && !f.dead; i++) damageFoe(f, dmg, { col:i ? "#9fe8ff" : col, fire });
  swordOnHit(f, spd);
}
function swordOnHit(f, spd) {
  const S = sword(), p = E.p, bio = swordBio(), tech = techLv(), alive = () => !f.dying && !f.dead;
  if (!S.neverDull) E.sharp = Math.max(0, E.sharp - 5);
  /* frame traits */
  if (S.stagger && !f.F.boss && alive()) f.stun = Math.max(f.stun, S.stagger);
  if (S.sunBurn && isSunlit(E.region)) addDot(f, "burn", 3, 0.5 * symPow());
  if (S.venom) { f.slow = Math.max(f.slow, 2); addDot(f, "venom", 3, 0.5 * symPow()); }
  if (S.pull) for (const o of hostiles()) if (o !== f && !o.F.boss) { const d = dist(o, p) || 1; if (d < 80) { o.vx += (p.x - o.x) / d * 110; o.vy += (p.y - o.y) / d * 110; } }
  if (S.inject) { f.slow = Math.max(f.slow, 3); addDot(f, "resin", 3, 0.5 * symPow()); }
  if (S.calmBeasts && f.F.beast && !f.F.boss && alive() && Math.random() < 0.25) { f.calm = 0.01; E.calmed++; float(f.x, f.y - 14, "CALMED", "#a8f58a"); }
  /* components */
  if (hasPart("nettle")) { f.slow = Math.max(f.slow, 1.5); addDot(f, "bleed", 3, 0.5 * symPow(), 3); }
  if (hasPart("thermal")) {
    E.heat += 20;
    if (E.heat >= 100) { E.heat = 0; if (hasPart("rubber")) float(p.x, p.y - 22, "HEAT VENTED", "#ffd2a0"); else { float(p.x, p.y - 22, "OVERHEAT!", "#ff8a50"); hurtPlayer(1, { fire:true, unavoidable:true, self:true }); } }
  }
  if (hasPart("sporeSac") && E.sporeCd <= 0 && (tierOf(spd) >= 2 || S.inject)) {
    E.sporeCd = 3; E.fx.push({ type:"ring", x:f.x, y:f.y, t:0, col:"#c9a8ff", big:true }); float(f.x, f.y - 20, "SPORE CLOUD", "#c9a8ff");
    for (const o of hostiles()) if (Math.hypot(o.x - f.x, o.y - f.y) < 36 + o.r) o.stun = Math.max(o.stun, 1 + 0.2 * symPow());
  }
  if (hasPart("piston") && E.piston) { E.piston = false; float(f.x, f.y - 20, "PISTON BLAST", "#ffb35a"); shockwave(f.x, f.y, 50, 1 + symPow(), "#ffb35a"); }
  /* Root-Singer bio-grafting */
  if (bio > 0) {
    if (Math.random() < 0.12 * bio) { const h = 1; G.hp = Math.min(maxHp(), G.hp + h); float(p.x, p.y - 18, `+${h} life-steal`, "#7dff7a"); }
    if (bio >= 2) addDot(f, "poison", 3, (bio >= 3 ? 1 : 0.5) * symPow());
  }
  /* Industrialist tech-forging */
  if (tech > 0 && tierOf(spd) >= 2) { E.fx.push({ type:"boom", x:f.x, y:f.y, t:0, r:28 }); shockwave(f.x, f.y, 28, tech, "#ffb35a", f); }
}
function swordOnParry() {
  const p = E.p;
  if (hasPart("piston") && !E.piston) { E.piston = true; float(p.x, p.y - 28, "PISTON CHARGED", "#ffb35a"); }
  if (techLv() >= 3) shockwave(p.x, p.y, 48, 1 + symPow(), "#ffd2a0");
}
function swordOnFire() {
  const bio = swordBio();
  if (bio > 0 && !sword().neverDull && !hasPart("rubber")) { E.sharp = Math.max(0, E.sharp - 15 * bio); float(E.p.x, E.p.y - 24, "BLADE WITHERS", "#ffb35a"); }
}
function triggerPrism(src) {
  if (!sword().prismSplit || E.prismBlade > 0 || E.prismBladeCd > 0) return;
  E.prismBlade = 10; E.prismBladeCd = 20;
  float(E.p.x, E.p.y - 26, `${src}: PRISM SPLIT ×3`, "#9fe8ff");
  E.fx.push({ type:"ring", x:E.p.x, y:E.p.y, t:0, col:"#9fe8ff", big:true });
}
function swordTick(dt) {
  const S = sword(), bio = swordBio();
  E.sporeCd = Math.max(0, E.sporeCd - dt);
  E.heat = Math.max(0, E.heat - 6 * dt);
  if (S.neverDull) E.sharp = 100; else if (bio > 0) E.sharp = Math.min(100, E.sharp + 4 * bio * dt);
  if (hasPart("blight") && !hasPart("rubber")) E.stamina = Math.max(0, E.stamina - 0.3 * dt);
  if (hasPart("photo") && isSunlit(E.region)) E.stamina = Math.min(maxStamina(), E.stamina + 0.5 * dt);
  if (S.prismSplit) {
    E.prismBlade = Math.max(0, E.prismBlade - dt); E.prismBladeCd = Math.max(0, E.prismBladeCd - dt);
    if (isSunlit(E.region)) { E.sunPrismT -= dt; if (E.sunPrismT <= 0) { E.sunPrismT = 4; triggerPrism("SUNLIGHT"); } }
  }
}
function swordOnCompanionShot() { triggerPrism("FLARE"); }

/* ---------- combat drawing ---------- */
function drawSword(p, sp) {
  const S = sword();
  const a = sp > 20 ? Math.atan2(p.vy, p.vx) : [Math.PI / 2, Math.PI, 0, -Math.PI / 2][p.dir];
  const len = (S.reach ? (tierOf(sp) >= 2 ? 16 : 11) : 10) + (S.relic ? 2 : 0);
  const ox = p.x + Math.cos(a) * 4, oy = p.y - 2 + Math.sin(a) * 4;
  const blade = (ang, alpha, col) => {
    ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = S.dmg >= 1.3 ? 2.5 : 1.5;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(ang) * len, oy + Math.sin(ang) * len); ctx.stroke();
  };
  ctx.save();
  if (swordBio() > 0 && !S.neverDull) { ctx.shadowColor = "#7fd26a"; ctx.shadowBlur = 3 + swordBio() * 2; }
  else if (techLv() > 0) { ctx.shadowColor = "#ffb35a"; ctx.shadowBlur = 3 + techLv() * 2; }
  if (E.prismBlade > 0) { blade(a - 0.5, 0.55, "#9fe8ff"); blade(a + 0.5, 0.55, "#c9a8ff"); }
  ctx.globalAlpha = 1; ctx.save(); ctx.translate(ox, oy); ctx.rotate(a + Math.PI / 4);
  const sz = (S.dmg >= 1.3 ? 14 : 12) + (tierOf(sp) >= 2 && S.reachHot ? 4 : 0);
  icon16(ctx, S.icon, -2, -sz + 2, sz); ctx.restore();
  if (E.heat > 70) { ctx.globalAlpha = 0.5; blade(a, 0.5, "#ff8a50"); }
  ctx.globalAlpha = 1; ctx.fillStyle = "#3a2a1a"; ctx.fillRect(ox - 1, oy - 1, 2, 2);
  ctx.restore();
}
function drawSwordHud() {
  const S = sword(), x = 4; let y = BOX.y + 2;
  icon16(ctx, S.icon, x, y, 12);
  outlineText(ctx, S.name.replace("The ", ""), x + 14, y + 8, S.col, "5px 'Pixelify Sans'", "left"); y += 18;
  const bar = (label, v, col) => {
    outlineText(ctx, label, x, y + 4, "#ddd", "5px 'Pixelify Sans'", "left");
    ctx.fillStyle = "#222"; ctx.fillRect(x + 20, y, 32, 4); ctx.fillStyle = col; ctx.fillRect(x + 20, y, 32 * clamp(v, 0, 1), 4); y += 9;
  };
  bar("EDGE", E.sharp / 100, E.sharp > 60 ? "#e8f0f0" : E.sharp > 30 ? "#e8cf4a" : "#e0473f");
  if (hasPart("thermal")) bar("HEAT", E.heat / 100, "#ff8a50");
  if (S.prismSplit) bar("PRISM", E.prismBlade > 0 ? E.prismBlade / 10 : 1 - E.prismBladeCd / 20, E.prismBlade > 0 ? "#9fe8ff" : "#466");
  const tags = [];
  if (swordBio()) tags.push([`BIO ${swordBio()}`, "#7fd26a"]);
  if (swordTech()) tags.push([E.fueled ? `TECH ${swordTech()}` : "TECH (no fuel)", E.fueled ? "#ffb35a" : "#777"]);
  if (E.piston) tags.push(["PISTON READY", "#ffb35a"]);
  for (const [s, c] of tags) { outlineText(ctx, s, x, y + 4, c, "5px 'Pixelify Sans'", "left"); y += 8; }
}


/* ---------- the Strider-Caravan workbench & armory ---------- */
const atWorkbench = () => !!(M && G && G.loc !== "roots" && PL && Math.hypot(PL.x - M.camp.x, PL.y - M.camp.y) < 90);
function salvageSword(id) { const c = SWORDS[id].salvage; if (!atWorkbench() || !c || !canAfford(c)) return; pay(c); acquireSword(id); save(); refreshPanel(); }
function craftPart(id) { const c = PARTS[id].cost; if (!atWorkbench() || G.arms.parts.includes(id) || !canAfford(c)) return; pay(c); G.arms.parts.push(id); toast(`Crafted: ${PARTS[id].name}`, "#ffe08a"); save(); refreshPanel(); }
function installPart(id) { if (!G.arms.parts.includes(id)) return; G.arms.slots[PARTS[id].slot] = id; save(); refreshPanel(); }
function removePart(slot) { G.arms.slots[slot] = null; save(); refreshPanel(); }
function upgradeSword(path) {
  const id = G.arms.equipped, S = SWORDS[id], lv = swordLvOf(id), other = path === "bio" ? "tech" : "bio";
  if (S.relic || !atWorkbench() || lv[other] > 0) return;
  const step = (path === "bio" ? BIO_TREE : TECH_TREE)[lv[path]]; if (!step || !canAfford(step.cost)) return;
  pay(step.cost); lv[path]++;
  toast(path === "bio" ? `${S.name} drinks the graft — roots creep around the hilt (Bio ${lv.bio}).` : `${S.name} is bolted and pressurised (Tech ${lv.tech}).`, path === "bio" ? "#7fd26a" : "#ffb35a");
  log(`${path === "bio" ? "Bio-grafted" : "Tech-forged"} ${S.name} to ${lv[path]}.`); save(); refreshPanel();
}
function armoryPanel() {
  ensureArms();
  const S = sword(), id = G.arms.equipped, lv = swordLvOf(id), bench = atWorkbench();
  const benchNote = bench ? `<span style="color:#6fcf6a">At the caravan workbench — crafting, salvaging and upgrades available.</span>` : `<span class="muted">Swap blades and parts anywhere. Crafting, salvaging and upgrades need the Strider-Caravan workbench (stand by your camp).</span>`;
  const blades = [...FRAME_IDS, ...RELIC_IDS].map(k => {
    const W = SWORDS[k], own = G.arms.owned.includes(k), on = k === id, L = swordLvOf(k);
    const act = on ? `<span class="small" style="color:#6fcf6a">Wielding</span>` : own ? `<button onclick="equipSword('${k}')">Wield</button>`
      : W.relic ? `<span class="small muted">Relic quest: ${W.quest}</span>` : `<button ${bench && canAfford(W.salvage) ? "" : "disabled"} onclick="salvageSword('${k}')">Salvage — ${costHTML(W.salvage)}</button>`;
    return `<div class="card ${on ? "on" : ""}" style="${own ? "" : "opacity:.75"}"><div class="row">${iconHTML(W.icon, 32)}<div style="flex:1"><b style="color:${W.col}">${W.name}</b><div class="small muted">${W.style} · <span style="color:${LEAN_COL[W.lean] || "#ccc"}">${W.lean}</span>${L.bio ? ` · <span style="color:#7fd26a">Bio ${L.bio}</span>` : ""}${L.tech ? ` · <span style="color:#ffb35a">Tech ${L.tech}</span>` : ""}</div></div></div>
      <div class="small" style="margin:4px 0"><i>${W.lore}</i></div><div class="small muted">${W.perk}</div><div style="margin-top:6px">${act}</div></div>`;
  }).join("");
  const slots = Object.keys(PART_SLOTS).map(slot => {
    const cur = G.arms.slots[slot], owned = G.arms.parts.filter(k => PARTS[k].slot === slot && k !== cur);
    return `<div class="card"><b>${PART_SLOTS[slot]}</b> <span class="small muted">— ${PART_SLOT_HINT[slot]}</span>
      <div class="row" style="margin-top:6px">${cur ? `${iconHTML(PARTS[cur].icon, 28)}<div style="flex:1"><b>${PARTS[cur].name}</b> <span class="tag" style="color:${LEAN_COL[PARTS[cur].lean]}">${PARTS[cur].lean}</span><div class="small muted">${PARTS[cur].desc}</div></div><button onclick="removePart('${slot}')">Remove</button>` : `<span class="small muted">Empty slot</span>`}</div>
      ${owned.length ? `<div class="row" style="margin-top:6px">${owned.map(k => `<button onclick="installPart('${k}')">${iconHTML(PARTS[k].icon, 18)}Fit ${PARTS[k].name}</button>`).join("")}</div>` : ""}</div>`;
  }).join("");
  const craft = Object.entries(PARTS).map(([k, pt]) => { const own = G.arms.parts.includes(k);
    return `<button style="justify-content:flex-start;text-align:left" ${own || !bench || !canAfford(pt.cost) ? "disabled" : ""} onclick="craftPart('${k}')">${iconHTML(pt.icon, 24)}<span><b>${pt.name}</b> <span class="tag" style="color:${LEAN_COL[pt.lean]}">${pt.lean}</span><br><span class="small muted">${own ? "Already crafted" : costHTML(pt.cost)}</span></span></button>`; }).join("");
  const tree = (path, T, title, col, pros, cons) => {
    const other = path === "bio" ? "tech" : "bio", locked = lv[other] > 0;
    const steps = T.map((st, i) => `<div class="small" style="color:${i < lv[path] ? col : "#888"}">${i < lv[path] ? "●" : "○"} Lv ${i + 1}: ${st.perk}</div>`).join("");
    const next = T[lv[path]];
    const btn = S.relic ? `<span class="small muted">Relics can't be re-grafted or re-forged.</span>` : locked ? `<span class="small muted">Locked — this blade is already ${other === "bio" ? "Bio-Grafted" : "Tech-Forged"}. A blade can be grafted or forged, never both.</span>`
      : next ? `<button ${bench && canAfford(next.cost) ? "" : "disabled"} onclick="upgradeSword('${path}')">${path === "bio" ? "Graft" : "Forge"} Lv ${lv[path] + 1} — ${costHTML(next.cost)}</button>` : `<span class="small" style="color:${col}">Fully ${path === "bio" ? "grafted" : "forged"}.</span>`;
    return `<div class="card" style="border-color:${col}55"><b style="color:${col}">${title}</b><div class="small" style="margin:4px 0">${pros}</div><div class="small muted" style="margin-bottom:4px">${cons}</div>${steps}<div style="margin-top:6px">${btn}</div></div>`;
  };
  return `${panelTabsHTML("armory")}
    <div class="row">${iconHTML(S.icon, 48)}<div style="flex:1"><h2 style="color:${S.col}">${S.name}</h2><div class="small muted">${S.style} · ${S.perk}</div></div></div>
    <div class="small" style="margin:6px 0">${benchNote}</div>
    <h3>Upgrade: Grafting vs Forging</h3><div class="grid">
      ${tree("bio", BIO_TREE, "Root-Singer Path · Bio-Grafting", "#7fd26a", "Feed the blade monster organs, spores and vines: life-steal, spore-venom and a self-regrowing edge.", "Each level adds +1 Symbiosis (industrial towns grow wary) and fire withers the blade unless insulated.")}
      ${tree("tech", TECH_TREE, "Canopy Industrialist Path · Tech-Forging", "#ffb35a", "Bolt on pistons, solar capacitors and sap-tanks: kinetic bursts, armor-piercing heat, parry-counters.", "Burns 1 Amber Sap as fuel each fight (no sap = dormant tech) and the noise draws predators from further away.")}
    </div>
    <h3>Components</h3><div class="grid">${slots}</div>
    <h3>Craft components</h3><div class="grid">${craft}</div>
    <h3>Blades</h3><div class="grid">${blades}</div>
    <div class="small muted" style="margin-top:8px">Monster Organs drop from beasts you defeat (not calm). Merchants also sell some components.</div>`;
}

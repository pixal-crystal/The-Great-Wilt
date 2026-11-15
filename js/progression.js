/* =========================================================================
   PROGRESSION — low-number growth (start at 1 DMG / 10 HP / 5 Stamina).
   Levels, XP ("Bloom & Salvage"), Growth Points, companion levels with
   milestone perks, and "The Forest Adapts" enemy scaling.
   ========================================================================= */
const MAX_LVL = 20;
const xpToNext = l => 5 + 3 * l;                 // L1→2: 8 XP, L2→3: 11, L3→4: 14 ...
/* Zones are capped so early regions stay early — come back at Lv 10 and feel heroic. */
const ZONE_LVL = { trunk:[1, 4], sun:[1, 4], glass:[3, 8], silt:[5, 12], roots:[10, 17] };
const ENEMY_TIERS = [
  { min:1,  name:"Sprout",    col:"#9ad04a" },
  { min:5,  name:"Hardened",  col:"#e8cf4a" },
  { min:10, name:"Symbiotic", col:"#ff9a3c" },
  { min:15, name:"Ancient",   col:"#ff5a5a" },
];
const enemyTier = l => [...ENEMY_TIERS].reverse().find(t => l >= t.min);
const DISCOVER_XP = { sun:[8, "Reached the high-altitude Sun-Crown"], glass:[6, "Charted the Glass-Marsh"], silt:[6, "Descended to the Silt-Floor"], roots:[15, "Breached the Iron Roots"] };
const STAT_INFO = {
  vit:  { name:"Vigor", short:"HP", col:"#ff6b6b", desc:"+2 Max HP and heals 2 HP per point. Hardens your body against lethal strikes." },
  might:{ name:"Might", short:"DMG", col:"#ff8a6a", desc:"+1 base damage on every ricochet strike. Going from 1 to 2 doubles your power." },
  sp:   { name:"Symbiosis Power", short:"SP", col:"#9ad04a", desc:"Potency of graft abilities, damage-over-time ticks and sword-core specials." },
  agi:  { name:"Agility", short:"STA", col:"#5fb3ff", desc:"+1 Combat Stamina charge & +20 World Sprint Stamina. Accelerates breath recovery." },
};
const COMP_PERKS = {
  kaelen:[ { lvl:3, name:"Armor Crack", desc:"Steam-lance bolts lower the target's armor by 1 for the rest of the fight — your 1 DMG strikes become 2 DMG." },
           { lvl:6, name:"Pressure Lance", desc:"Bolts punch through every enemy in their path and crack armor by 2." },
           { lvl:9, name:"Overdrive", desc:"Fires twice as often." } ],
  sylva: [ { lvl:3, name:"Spore Mark", desc:"Darts mark the target with glowing fungi: every hit on it deals +1 bonus bio damage." },
           { lvl:6, name:"Mycelial Web", desc:"Marks spread to a second nearby enemy." },
           { lvl:9, name:"Rot Bloom", desc:"Marked enemies take +2 instead of +1." } ],
  bram:  [ { lvl:3, name:"Weak-Point Flare", desc:"Pip flares flying or armored enemies: your next 3 strikes crit for +2 DMG." },
           { lvl:6, name:"Salvage Eye", desc:"Pip finds extra Barter Bits and scrap after every won fight." },
           { lvl:9, name:"Twin Moths", desc:"Pip brings a friend — two flares per volley." } ],
};

function ensureProgress() {
  if (!G) return;
  if (G.lvl == null) { G.lvl = 1; G.xp = 0; G.gp = 0; G.attr = { might:1, sp:1, agi:5, vit:0 }; }
  G.attr = G.attr || { might:1, sp:1, agi:5, vit:0 };
  if (G.attr.vit == null) G.attr.vit = 0;
  G.staminaUps = G.staminaUps || 0;
  G.hpUps = G.hpUps || 0;
  G.party = G.party || {};
  for (const id in COMPANIONS) G.party[id] = Object.assign({ lvl:1, xp:0, gp:0, might:0, tempo:0 }, G.party[id] || {});
  G.discovered = G.discovered || { trunk:true };
  G.hp = Math.min(G.hp, maxHp());
}
const symPow = () => (G && G.attr ? G.attr.sp : 1);
const staminaRegen = () => 0.6 + 0.08 * maxStamina();
const compPerk = (id, lvl) => !!(G.party && G.party[id] && G.party[id].lvl >= lvl);

function hpUpgradeCost() {
  const rank = (G && G.hpUps) || 0;
  return {
    sap: 2 + Math.floor(rank * 1.5),
    scrap: 2 + rank,
    coins: 10 + rank * 8
  };
}
function upgradeHp() {
  if (!G) return;
  const cost = hpUpgradeCost();
  if (!canAfford(cost)) return;
  pay(cost);
  G.hpUps = (G.hpUps || 0) + 1;
  G.hp = Math.min(maxHp(), G.hp + 2);
  toast(`❤️ Heartwood Infused! Rank ${G.hpUps}: Max HP ${maxHp()} (+2)`, "#ff6b6b");
  save();
  refreshPanel();
  renderHud();
}

function staminaUpgradeCost() {
  const rank = (G && G.staminaUps) || 0;
  return {
    sap: 2 + Math.floor(rank * 1.5),
    seeds: 2 + rank,
    coins: 8 + rank * 6
  };
}
function upgradeStamina() {
  if (!G) return;
  const cost = staminaUpgradeCost();
  if (!canAfford(cost)) return;
  pay(cost);
  G.staminaUps = (G.staminaUps || 0) + 1;
  worldStamina = maxWorldStamina();
  toast(`⚡ Stamina Upgraded! Rank ${G.staminaUps}: Max Sprint ${maxWorldStamina()} · Combat ${maxStamina()}`, "#5fb3ff");
  save();
  refreshPanel();
  renderHud();
}

/* ---------- XP ---------- */
function levelUpUnit(u, maxL) {
  let ups = 0;
  while (u.lvl < maxL && u.xp >= xpToNext(u.lvl)) { u.xp -= xpToNext(u.lvl); u.lvl++; u.gp = (u.gp || 0) + 1; ups++; }
  if (u.lvl >= maxL) u.xp = 0;
  return ups;
}
/* scope "hero": you + the companion travelling with you. scope "squad": the whole caravan. */
function gainXP(n, why, scope = "hero") {
  if (!G || n <= 0) return;
  ensureProgress();
  G.xp += n;
  const ups = levelUpUnit(G, MAX_LVL);
  if (ups) { G.hp = Math.min(maxHp(), G.hp + ups); toast(`<b style="color:#ffe46a">LEVEL UP! Lv ${G.lvl}</b> · +${ups} max HP · +${ups} Growth Point${ups > 1 ? "s" : ""} — spend in Pack (I)`, "#ffe46a"); log(`Reached level ${G.lvl}.`); }
  const comps = scope === "squad" ? Object.keys(COMPANIONS) : [G.companion];
  for (const id of comps) {
    const c = G.party[id], before = c.lvl; c.xp += n;
    if (levelUpUnit(c, MAX_LVL)) {
      toast(`${COMPANIONS[id].name} reached Lv ${c.lvl}!`, "#9fd3ff");
      for (const pk of COMP_PERKS[id]) if (before < pk.lvl && c.lvl >= pk.lvl) toast(`${COMPANIONS[id].name} learned <b>${pk.name}</b>`, "#9fd3ff");
    }
  }
  toast(`+${n} XP · ${why}${scope === "squad" ? " (whole squad)" : ""}`, scope === "squad" ? "#9ad04a" : "#d9c9f5");
  save();
}
function spendGP(stat) {
  if (!G.gp || !STAT_INFO[stat]) return;
  G.gp--;
  G.attr[stat] = (G.attr[stat] || 0) + 1;
  if (stat === "vit") {
    G.hp = Math.min(maxHp(), G.hp + 2);
    toast("❤️ Vigor Increased! +2 Max HP", "#ff6b6b");
  }
  save();
  refreshPanel();
}
function spendCompGP(id, stat) { const c = G.party[id]; if (!c.gp) return; c.gp--; c[stat]++; save(); refreshPanel(); }
function discover(id) {
  ensureProgress();
  if (G.discovered[id]) return;
  G.discovered[id] = true;
  const d = DISCOVER_XP[id]; if (d) gainXP(d[0], d[1], "hero");
}

/* ---------- The Forest Adapts: enemy scaling ---------- */
function enemyLevel(region, boss) {
  const [a, b] = ZONE_LVL[region] || [1, 4];
  return boss ? b : clamp(G.lvl, a, b);
}
function foeMaxHp(F, l) {
  if (F.boss) return Math.round(l <= 4 ? 30 + 4 * l : 40 + 7 * l);           // Warden lvl 4: 46 · lvl 8: 96 · lvl 17: 159
  const base = l <= 4 ? 2.5 + 1.4 * l : l <= 9 ? 12 + 2.5 * (l - 5) : l <= 14 ? 30 + 5 * (l - 10) : 50 + 7 * (l - 15);
  return Math.max(2, Math.round(base * clamp(F.hp / 13, 0.7, 1.5)));
}
function foeArmor(F, l) { return (l >= 5 ? 1 : 0) + (l >= 15 ? 1 : 0) + (F.armored ? 1 : 0); }   // Bark-Armor
function foeDmg(F, l) { return 1 + Math.floor(l / 5) + (F.dmg >= 5 ? 1 : 0) + (F.boss ? 1 : 0); }
function foeXP(f) { return f.F.boss ? 8 + f.lvl : 1 + Math.floor(f.lvl / 3); }
const BOSS_PART = { flare:"Corona Mane", sap:"Resin Tail", spores:"Spore Crown", beam:"Lens Eye", summon:"Calcified Core" };
function scaleFoe(f, lvl) {
  f.lvl = lvl; f.hp = f.maxHp = foeMaxHp(f.F, lvl); f.armor = foeArmor(f.F, lvl); f.dmg = foeDmg(f.F, lvl); f.armorCrack = 0;
  if (!f.F.boss && lvl >= 10 && Math.random() < 0.6) f.mutant = true;      // glowing spore-sacs that burst under fire
  if (f.F.boss) { const hp = Math.round(f.maxHp * 0.25); f.part = { name:BOSS_PART[f.F.special] || "Weak Point", hp, maxHp:hp, broken:false, hitCd:0 }; }
  return f;
}
function partPos(f) { const s = f.F.scale || 1; return { x:f.x + f.r * 1.05, y:f.y - 9 * s }; }
function hitBossPart(f, spd) {
  const pt = f.part; if (!pt || pt.broken || pt.hitCd > 0) return false;
  const pp = partPos(f), p = E.p;
  if (Math.hypot(p.x - pp.x, p.y - pp.y) > p.r + 5 + swordReach(spd)) return false;
  const dmg = Math.max(1, hitDamage(spd));
  pt.hp -= dmg; pt.hitCd = 0.25; float(pp.x, pp.y - 8, `-${dmg}`, "#ffe46a");
  if (pt.hp <= 0) {
    pt.broken = true; f.stun = Math.max(f.stun, 1.5);
    float(f.x, f.y - 30, `${pt.name.toUpperCase()} SEVERED!`, "#ffe46a"); E.fx.push({ type:"shards", x:pp.x, y:pp.y, t:0 }); E.shake = 0.25;
    float(f.x, f.y - 20, "its signature attack is gone", "#ddd");
  }
  return true;
}
/* Elemental mutation: fire makes the spore-sac burst. */
function mutantBurst(f) {
  if (!f.mutant || f.dying || f.dead) return;
  f.mutant = false;
  float(f.x, f.y - 22, "SPORE-SAC BURSTS!", "#ff9a3c"); E.fx.push({ type:"boom", x:f.x, y:f.y, t:0, r:30 });
  damageFoe(f, 3 + symPow(), { col:"#ff9a3c" });
  for (const o of hostiles()) if (o !== f && Math.hypot(o.x - f.x, o.y - f.y) < 32 + o.r) damageFoe(o, 1 + symPow(), { col:"#ff9a3c" });
}

/* ---------- companions in fights ---------- */
function compBoltDmg(id) { const c = G.party[id]; return { kaelen:1, sylva:1, bram:0 }[id] + c.might + Math.floor((c.lvl - 1) / 4); }
function compCooldown(id) { const c = G.party[id]; return Math.max(1.2, { kaelen:4, sylva:5, bram:5 }[id] * (1 - 0.12 * c.tempo) * (id === "kaelen" && compPerk(id, 9) ? 0.5 : 1)); }
function onCompanionBolt(b, f) {
  const id = b.comp;
  if (id === "kaelen" && (compPerk("kaelen", 3) || G.loc === "tutorial")) { const cr = compPerk("kaelen", 6) ? 2 : 1; if (f.armor - f.armorCrack > 0 && f.armorCrack < cr) { f.armorCrack = cr; float(f.x, f.y - 18, "ARMOR CRACKED", "#ffb35a"); } }
  if (id === "sylva" && compPerk("sylva", 3)) {
    f.marked = true; float(f.x, f.y - 18, "SPORE MARK", "#9ad04a");
    if (compPerk("sylva", 6)) { const o = hostiles().filter(o => o !== f && !o.marked).sort((a, b) => dist(a, f) - dist(b, f))[0]; if (o) o.marked = true; }
  }
  if (id === "bram" && compPerk("bram", 3) && (f.F.flying || f.armor - f.armorCrack > 0 || f.F.boss)) { E.critHits = 3; float(f.x, f.y - 18, "WEAK POINT!", "#ffe46a"); }
}

/* ---------- panels ---------- */
function statsHTML() {
  ensureProgress();
  const need = xpToNext(G.lvl);
  const rows = Object.entries(STAT_INFO).map(([k, s]) => `<div class="card row"><div style="flex:1"><b style="color:${s.col}">${s.name}</b> <span class="tag">${s.short} ${G.attr[k]}</span><div class="small muted">${s.desc}</div></div>
    <button ${G.gp ? "" : "disabled"} onclick="spendGP('${k}')">+1</button></div>`).join("");
  const hpRank = G.hpUps || 0;
  const hCost = hpUpgradeCost();
  const canAffordHp = canAfford(hCost);
  const hpCard = `<div class="card row" style="border-color:#ff6b6b66;background:#1a0909;margin-top:8px">
    <div style="flex:1">
      <b style="color:#ff6b6b">🪵 Heartwood Infusion (Rank ${hpRank})</b>
      <div class="small muted">Reinforce your bark-flesh with amber sap and scrap to permanently expand maximum health.</div>
      <div class="small" style="color:#ffe46a;margin-top:2px">Max HP: <b>${maxHp()}</b> (+2 HP per upgrade)</div>
    </div>
    <button ${canAffordHp ? "" : "disabled"} onclick="upgradeHp()">Upgrade Health — ${costHTML(hCost)}</button>
  </div>`;
  const rank = G.staminaUps || 0;
  const sCost = staminaUpgradeCost();
  const canAffordSta = canAfford(sCost);
  const staCard = `<div class="card row" style="border-color:#5fb3ff66;background:#09121a;margin-top:8px">
    <div style="flex:1">
      <b style="color:#5fb3ff">🫁 Spore-Lung Conditioning (Rank ${rank})</b>
      <div class="small muted">Condition your lungs with amber sap and seeds to permanently expand your stamina reserves.</div>
      <div class="small" style="color:#ffe46a;margin-top:2px">Sprint Stamina: <b>${maxWorldStamina()}</b> (+20) · Combat Stamina: <b>${maxStamina()}</b> (+1)</div>
    </div>
    <button ${canAffordSta ? "" : "disabled"} onclick="upgradeStamina()">Upgrade Stamina — ${costHTML(sCost)}</button>
  </div>`;
  return `<div class="row" style="gap:14px"><div><b style="font-size:20px;color:#ffe46a">Lv ${G.lvl}</b></div>
      <div style="flex:1;min-width:200px"><div class="small muted">XP ${G.lvl >= MAX_LVL ? "MAX" : `${G.xp}/${need}`}</div><div class="meter"><i style="width:${G.lvl >= MAX_LVL ? 100 : G.xp / need * 100}%;background:linear-gradient(90deg,#b48be8,#ffe46a)"></i></div></div>
      <div class="small">HP <b>${maxHp()}</b> · DMG <b>${baseDmg()}</b> · SP <b>${symPow()}</b> · STA <b>${maxStamina()}</b> (Sprint <b>${maxWorldStamina()}</b>)</div>
      ${G.gp ? `<span class="tag" style="color:#ffe46a;border-color:#ffe46a">${G.gp} Growth Point${G.gp > 1 ? "s" : ""} to spend</span>` : ""}</div>
    <div class="grid" style="margin-top:6px">${rows}</div>
    ${hpCard}
    ${staCard}
    <div class="small muted" style="margin-top:4px">Each level: +1 max HP automatically and 1 Growth Point (spend on Vigor, Might, Symbiosis, or Agility). Health and Stamina can also be directly upgraded above using foraged resources!</div>`;
}
function compProgressHTML(id) {
  ensureProgress();
  const c = G.party[id], need = xpToNext(c.lvl);
  const perks = COMP_PERKS[id].map(pk => `<div class="small" style="color:${c.lvl >= pk.lvl ? "#9fd3ff" : "#777"}">${c.lvl >= pk.lvl ? "★" : "☆"} Lv ${pk.lvl} <b>${pk.name}</b> — ${pk.desc}</div>`).join("");
  return `<div style="margin-top:6px"><div class="row small"><b>Lv ${c.lvl}</b><div class="meter" style="flex:1;min-width:80px"><i style="width:${c.lvl >= MAX_LVL ? 100 : c.xp / need * 100}%;background:#9fd3ff"></i></div><span class="muted">${c.xp}/${need}</span></div>
    <div class="small muted">Support shot: ${compBoltDmg(id) ? `${compBoltDmg(id)} dmg` : "stun only"} every ${compCooldown(id).toFixed(1)}s${c.gp ? ` · <span style="color:#ffe46a">${c.gp} GP</span>` : ""}</div>
    ${c.gp ? `<div class="row" style="margin:4px 0"><button onclick="spendCompGP('${id}','might')">+1 Power (shot dmg)</button><button onclick="spendCompGP('${id}','tempo')">+1 Tempo (fires faster)</button></div>` : ""}
    ${perks}</div>`;
}

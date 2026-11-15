let G = null;
const PHASES = ["Dawn","Day","Dusk","Night"];
function newGame() {
  G = { day:1, phase:0, loc:"trunk",
    regions:{ sun:{ bal:72, warden:false, echo:false }, trunk:{ bal:58, warden:false, echo:false }, silt:{ bal:34, warden:false, echo:false, bunker:false }, glass:{ bal:50, warden:false, echo:false, bunker:false } },
    res:{ sap:3, seeds:2, rareSeeds:1, scrap:2, crystal:0, spores:0, coins:18, potions:2, bombs:1, organs:0 },
    hp:10, taint:0, owned:["vineWhip","gillFronds","pheromone"], equipped:{ resp:["gillFronds"], limb:["vineWhip"], sense:["pheromone"] },
    companion:"sylva", upgrades:{ greenhouse:false, refinery:false, mast:false }, staminaUps:0, hpUps:0, echoes:[],
    stats:{ hunts:0, rituals:0, kills:0, calms:0, fights:0, bestCombo:0 }, drift:{}, log:[], used:{}, opened:{}, coreDown:false, over:false };
  computeDrift(); ensureArms(); ensureProgress();
  worldStamina = maxWorldStamina(); worldStaExhausted = false; worldStaRegenDelay = 0; worldStaBarFade = 0;
}
const save = () => { try { if (G && !G.over) localStorage.setItem("greatWiltRPG", JSON.stringify(G)); } catch (e) {} };
const loadSave = () => { try { const s = localStorage.getItem("greatWiltRPG"); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
function log(m) { G.log.unshift(`D${G.day} ${m}`); if (G.log.length > 60) G.log.pop(); }
const equippedList = () => [...G.equipped.resp, ...G.equipped.limb, ...G.equipped.sense];
const has = id => equippedList().includes(id);
const graftLoad = () => equippedList().reduce((s, id) => s + GRAFTS[id].tier, 0);
const symbiosis = () => graftLoad() + G.taint + (typeof bladeSymb === "function" ? bladeSymb() : 0);
const overgrown = () => symbiosis() > SYMB_CAP;
const maxHp = () => 10 + ((G && G.lvl) || 1) - 1 + ((G && G.attr && G.attr.vit) ? G.attr.vit * 2 : 0) + (((G && G.hpUps) || 0) * 2) + (overgrown() ? 2 : 0) + (has("resinTitan") ? 2 : 0);
const baseDmg = () => ((G && G.attr) ? G.attr.might : 1) + (has("thorn") ? 1 : 0) + (has("resinTitan") ? 2 : 0) + (overgrown() ? 1 : 0);
const maxStamina = () => ((G && G.attr ? G.attr.agi : 5) + ((G && G.staminaUps) || 0));
const maxWorldStamina = () => maxStamina() * 20;
let worldStamina = 100, worldStaExhausted = false, worldStaRegenDelay = 0, worldStaBarFade = 0;
function isAtCamp() {
  if (typeof mode !== "undefined" && mode !== "world") return false;
  if (typeof M !== "undefined" && M && M.camp && typeof PL !== "undefined" && PL && typeof G !== "undefined" && G && G.loc !== "roots") {
    return Math.hypot(PL.x - M.camp.x, PL.y - M.camp.y) < 85;
  }
  return false;
}
function isNearNPC(kind) {
  if (typeof mode !== "undefined" && mode !== "world") return false;
  if (typeof M !== "undefined" && M && M.npcs && typeof PL !== "undefined" && PL) {
    return M.npcs.some(n => n.kind === kind && Math.hypot(PL.x - n.x, PL.y - n.y) < 65);
  }
  return false;
}
const status = b => b >= 60 ? "balanced" : b >= 30 ? "depleted" : "enraged";
const STATUS_LABEL = { balanced:"Balanced", depleted:"Depleted", enraged:"Enraged" };
const STATUS_COLOR = { balanced:"#6fcf6a", depleted:"#e8cf4a", enraged:"#e0473f" };
const adj = (a, b) => EDGES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
function computeDrift() {
  const d = {};
  for (const id in REGIONS) {
    let v = 1 + rnd(0, 2) + (id === "silt" ? 2 : id === "glass" ? 1 : 0);
    for (const n in REGIONS) if (n !== id && adj(n, id) && status(G.regions[n].bal) === "enraged") v += 1;
    d[id] = v;
  }
  G.drift = d;
}
function changeBal(id, delta) {
  if (!REGIONS[id]) return;
  const r = G.regions[id], before = status(r.bal);
  r.bal = clamp(r.bal + delta, 0, 100);
  if (status(r.bal) === "enraged" && before !== "enraged") { r.warden = true; toast(`${REGIONS[id].name} turns crimson — an Apex Warden rises!`, "#ff8a80"); log(`${REGIONS[id].name} enraged; Warden rises.`); if (G.loc === id && M && M.id === id) spawnWarden(); }
}
function advanceDay() {
  G.day++;
  for (const id in REGIONS) changeBal(id, -G.drift[id]);
  computeDrift();
  if (Object.keys(REGIONS).every(id => status(G.regions[id].bal) === "enraged")) G.over = "collapse";
  save();
}
function advancePhase(n) {
  G.phase += n;
  while (G.phase >= 4) { G.phase -= 4; advanceDay(); toast(`Day ${G.day} — the forest drifts.`); }
  if (G.over === "collapse") showCollapse();
}
function gain(obj, mult = 1) {
  const parts = [];
  for (const k in obj) {
    let v = Array.isArray(obj[k]) ? rnd(obj[k][0], obj[k][1]) : obj[k];
    v = Math.ceil(v * mult);
    if (v > 0) { G.res[k] = (G.res[k] || 0) + v; parts.push(`${iconHTML(ICON[k], 16)}+${v}`); }
  }
  return parts.join(" ");
}
const canAfford = c => Object.entries(c).every(([k, v]) => (G.res[k] || 0) >= v);

function computeQuestProgress(st) {
  if (!st) return { completed: 0, total: 10, pct: 0, currentGoal: "Begin a new season to awaken in the Twilight Trunk.", goals: [] };
  const echoes = (st.echoes || []);
  const goals = [
    { id: "echo_sun", name: "Sun-Crown Echo", done: echoes.includes("sun") || !!(st.regions && st.regions.sun && st.regions.sun.echo) },
    { id: "echo_trunk", name: "Twilight Trunk Echo", done: echoes.includes("trunk") || !!(st.regions && st.regions.trunk && st.regions.trunk.echo) },
    { id: "echo_silt", name: "Silt-Floor Echo", done: echoes.includes("silt") || !!(st.regions && st.regions.silt && (st.regions.silt.echo || st.regions.silt.bunker)) },
    { id: "echo_glass", name: "Glass-Marsh Echo", done: echoes.includes("glass") || !!(st.regions && st.regions.glass && (st.regions.glass.echo || st.regions.glass.bunker)) },
    { id: "roots_unsealed", name: "Unseal the Iron Roots (3 Echoes)", done: echoes.length >= 3 },
    { id: "bunker_vault", name: "Breach Pre-Collapse Vault", done: !!((st.regions && st.regions.silt && st.regions.silt.bunker) || (st.regions && st.regions.glass && st.regions.glass.bunker)) },
    { id: "up_greenhouse", name: "Greenhouse Hydroponics", done: !!(st.upgrades && st.upgrades.greenhouse) },
    { id: "up_refinery", name: "Amber Refinery Workbench", done: !!(st.upgrades && st.upgrades.refinery) },
    { id: "up_mast", name: "Pulse-Beacon Mast", done: !!(st.upgrades && st.upgrades.mast) },
    { id: "core_resolved", name: "Resolve Protocol PALE (Root-Core)", done: !!st.coreDown },
  ];
  const completed = goals.filter(g => g.done).length;
  const total = goals.length;
  const pct = Math.round((completed / total) * 100);
  let currentGoal = "Gather 3 Root Echoes to unseal the subterranean Iron Roots.";
  if (echoes.length >= 3) {
    currentGoal = st.coreDown ? "Choose the forest's final destiny at the Root-Core." : "Enter the Iron Roots south of the Silt-Floor and reach the Root-Core.";
  } else {
    const nextUnfound = goals.find(g => !g.done);
    if (nextUnfound) currentGoal = `Active target: ${nextUnfound.name}`;
  }
  return { completed, total, pct, currentGoal, goals };
}
const pay = c => { for (const k in c) G.res[k] -= c[k]; };
const costHTML = c => Object.entries(c).map(([k, v]) => `${iconHTML(ICON[k], 16)}${v}`).join(" ");

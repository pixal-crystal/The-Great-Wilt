let G = null;
const PHASES = ["Dawn","Day","Dusk","Night"];
function newGame() {
  G = { day:1, phase:0, loc:"trunk",
    regions:{ sun:{ bal:72, warden:false, echo:false }, trunk:{ bal:58, warden:false, echo:false }, silt:{ bal:34, warden:false, echo:false, bunker:false }, glass:{ bal:50, warden:false, echo:false, bunker:false } },
    res:{ sap:3, seeds:2, rareSeeds:1, scrap:2, crystal:0, spores:0, coins:18, potions:2, bombs:1 },
    hp:30, taint:0, owned:["vineWhip","gillFronds","pheromone"], equipped:{ resp:["gillFronds"], limb:["vineWhip"], sense:["pheromone"] },
    companion:"sylva", upgrades:{ greenhouse:false, refinery:false, mast:false }, echoes:[],
    stats:{ hunts:0, rituals:0, kills:0, calms:0, fights:0, bestCombo:0 }, drift:{}, log:[], used:{}, opened:{}, coreDown:false, over:false };
  computeDrift();
}
const save = () => { try { if (G && !G.over) localStorage.setItem("greatWiltRPG", JSON.stringify(G)); } catch (e) {} };
const loadSave = () => { try { const s = localStorage.getItem("greatWiltRPG"); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
function log(m) { G.log.unshift(`D${G.day} ${m}`); if (G.log.length > 60) G.log.pop(); }
const equippedList = () => [...G.equipped.resp, ...G.equipped.limb, ...G.equipped.sense];
const has = id => equippedList().includes(id);
const graftLoad = () => equippedList().reduce((s, id) => s + GRAFTS[id].tier, 0);
const symbiosis = () => graftLoad() + G.taint;
const overgrown = () => symbiosis() > SYMB_CAP;
const maxHp = () => 30 + (overgrown() ? 10 : 0) + (has("resinTitan") ? 6 : 0);
const baseDmg = () => Math.round((4 + (has("thorn") ? 2 : 0) + (has("resinTitan") ? 4 : 0)) * (overgrown() ? 1.5 : 1));
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
const pay = c => { for (const k in c) G.res[k] -= c[k]; };
const costHTML = c => Object.entries(c).map(([k, v]) => `${iconHTML(ICON[k], 16)}${v}`).join(" ");

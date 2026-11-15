const MW = 56, MH = 40, TL = 16;
const T_WALK = 0, T_VOID = 1, T_WATER = 2, T_SAP = 3, T_WALL = 4;
const OBJ = {
  tree:{ fw:2 }, otree:{ fw:2 }, deadtree:{ fw:2 }, deadtree2:{ fw:2 }, boulder:{ fw:2 }, mboulder:{ fw:2 }, stump:{ fw:1 }, log:{ fw:2 },
  tent:{ fw:3, fh:2 }, sunflower:{ fw:1, soft:true }, cattail:{ fw:1, soft:true }, tallgrass:{ fw:1, soft:true },
};
const WORLDS = {};
function rnd2(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
function genRegion(id) {
  const rng = mulberry32(SEEDS[id]);
  const N = MW * MH, ix = (x, y) => y * MW + x, inb = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH;
  const W = { id, G:new Array(N), baseG:new Array(N), T:new Uint8Array(N), path:new Uint8Array(N), kind:new Uint8Array(N), objAt:new Uint8Array(N), objs:[], decor:[], nodes:[], npcs:[], exits:[] };
  const base = { sun:["grass2","grass","grass2"], trunk:["green","grass","green","grass2"], silt:["dgrass","dgrass2"], glass:["grass","grass2"], roots:["rockfloor"] }[id];
  for (let i = 0; i < N; i++) {
    const bg = base[Math.floor(rng() * base.length)];
    W.G[i] = bg;
    W.baseG[i] = bg;
  }
  const camp = { x:28, y:20 };
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    if (id === "roots") { W.T[ix(x, y)] = T_WALL; W.kind[ix(x, y)] = 4; }
    else if (x < 2 || y < 2 || x >= MW - 2 || y >= MH - 2) { W.T[ix(x, y)] = T_WALL; W.kind[ix(x, y)] = 1; }
  }
  const mark = (x, y) => { for (const [a, b] of [[0,0],[1,0],[0,1],[1,1]]) if (inb(x + a, y + b)) W.path[ix(x + a, y + b)] = 1; };
  function carve(ax, ay, bx, by) {
    let x = ax, y = ay, g = 0;
    while ((x !== bx || y !== by) && g++ < 900) {
      mark(x, y);
      const dx = Math.sign(bx - x), dy = Math.sign(by - y);
      if (dx && dy) { if (rng() < 0.5) x += dx; else y += dy; }
      else if (dx) { x += dx; if (rng() < 0.14) y = clamp(y + (rng() < 0.5 ? 1 : -1), 2, MH - 4); }
      else { y += dy; if (rng() < 0.14) x = clamp(x + (rng() < 0.5 ? 1 : -1), 2, MW - 4); }
    }
    mark(bx, by);
  }
  const blob = (cx, cy, r, fn) => { for (let y = -r - 1; y <= r + 1; y++) for (let x = -r - 1; x <= r + 1; x++) {
    const d = Math.hypot(x, y * 1.15) / r + (hash2(cx + x, cy + y, SEEDS[id]) - 0.5) * 0.45; if (d < 1 && inb(cx + x, cy + y)) fn(cx + x, cy + y); } };
  // exits
  for (const e of EXITS[id]) {
    const [ex, ey] = e.side === "N" ? [e.at, 0] : e.side === "S" ? [e.at, MH - 1] : e.side === "W" ? [0, e.at] : [MW - 1, e.at];
    for (let k = -1; k <= 1; k++) for (let d = 0; d < 3; d++) {
      const x = e.side === "N" || e.side === "S" ? ex + k : (e.side === "W" ? d : MW - 1 - d);
      const y = e.side === "W" || e.side === "E" ? ey + k : (e.side === "N" ? d : MH - 1 - d);
      W.T[ix(x, y)] = T_WALK; W.kind[ix(x, y)] = 0; W.G[ix(x, y)] = id === "roots" ? "rockfloor" : "dirt";
    }
    if (id !== "roots") carve(camp.x, camp.y, clamp(ex, 1, MW - 3), clamp(ey, 1, MH - 3));
    const sp = e.side === "N" ? [e.at * TL + 8, 3 * TL + 4] : e.side === "S" ? [e.at * TL + 8, (MH - 3) * TL] : e.side === "W" ? [3 * TL, e.at * TL + 10] : [(MW - 3) * TL, e.at * TL + 10];
    W.exits.push({ ...e, tx:ex, ty:ey, spawnX:sp[0], spawnY:sp[1] });
  }
  const farFromCamp = (x, y, r) => Math.hypot(x - camp.x, y - camp.y) > r;
  if (id === "sun") for (let i = 0; i < 9; i++) { const cx = rnd2(rng, 6, MW - 7), cy = rnd2(rng, 5, MH - 6); if (farFromCamp(cx, cy, 8)) blob(cx, cy, 3 + Math.floor(rng() * 4), (x, y) => { if (W.T[ix(x, y)] === T_WALK) W.T[ix(x, y)] = T_VOID; }); }
  if (id === "trunk") for (let i = 0; i < 6; i++) { const cx = rnd2(rng, 5, MW - 6), cy = rnd2(rng, 5, MH - 6); if (farFromCamp(cx, cy, 7)) blob(cx, cy, 2 + Math.floor(rng() * 3), (x, y) => { if (W.T[ix(x, y)] === T_WALK) W.T[ix(x, y)] = T_SAP; }); }
  if (id === "glass") for (let i = 0; i < 7; i++) { const cx = rnd2(rng, 5, MW - 6), cy = rnd2(rng, 5, MH - 6); if (farFromCamp(cx, cy, 7)) blob(cx, cy, 3 + Math.floor(rng() * 4), (x, y) => { if (W.T[ix(x, y)] === T_WALK) W.T[ix(x, y)] = T_WATER; }); }
  if (id === "silt") for (let i = 0; i < 14; i++) { const w = 2 + Math.floor(rng() * 3), h = 2 + Math.floor(rng() * 2), x0 = rnd2(rng, 3, MW - 7), y0 = rnd2(rng, 3, MH - 6);
    if (!farFromCamp(x0, y0, 7)) continue; for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (W.T[ix(x, y)] === T_WALK) { W.T[ix(x, y)] = T_WALL; W.kind[ix(x, y)] = 2; } }
  if (id === "roots") {
    const open = (x, y) => { if (inb(x, y) && x > 0 && x < MW - 1 && y < MH - 1) { W.T[ix(x, y)] = T_WALK; W.kind[ix(x, y)] = 0; } };
    const rooms = [{ x:28, y:5 }]; for (let i = 0; i < 7; i++) rooms.push({ x:rnd2(rng, 7, MW - 8), y:rnd2(rng, 7 + i * 3, Math.min(MH - 9, 10 + i * 4)) });
    rooms.push({ x:28, y:MH - 7 });
    rooms.forEach((r, i) => { blob(r.x, r.y, i === rooms.length - 1 ? 6 : 3 + Math.floor(rng() * 3), open); if (i) { const p = rooms[i - 1]; let x = p.x, y = p.y; while (x !== r.x || y !== r.y) { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) open(x + a, y + b); if (x !== r.x && (rng() < 0.5 || y === r.y)) x += Math.sign(r.x - x); else y += Math.sign(r.y - y); } } });
    for (let d = 0; d < 6; d++) for (let k = -1; k <= 1; k++) open(28 + k, d);
    W.coreAt = { x:28, y:MH - 7 };
  }
  // paths -> walkable (plank bridges over sky, water and sap)
  if (id !== "roots") {
    // Connect camp to exits with paths
    for (const e of EXITS[id]) {
      const [ex, ey] = e.side === "N" ? [e.at, 0] : e.side === "S" ? [e.at, MH - 1] : e.side === "W" ? [0, e.at] : [MW - 1, e.at];
      carve(camp.x, camp.y, clamp(ex, 1, MW - 3), clamp(ey, 1, MH - 3));
    }
    // Also connect camp to NPC hubs and nearby nodes
    carve(camp.x, camp.y, camp.x + 3, camp.y + 1);
    carve(camp.x, camp.y, camp.x - 3, camp.y + 1);

    for (let i = 0; i < N; i++) if (W.path[i]) {
      if (W.kind[i] === 1) continue;
      const t = W.T[i];
      if (t === T_VOID || t === T_WATER || t === T_SAP) {
        // Choose plank orientation based on adjacent path tiles
        const px = i % MW, py = Math.floor(i / MW);
        const hasH = (px > 0 && W.path[i - 1]) || (px < MW - 1 && W.path[i + 1]);
        const hasV = (py > 0 && W.path[i - MW]) || (py < MH - 1 && W.path[i + MW]);
        W.T[i] = T_WALK;
        W.G[i] = (hasH && !hasV) ? "plankH" : "plankV";
      } else {
        W.T[i] = T_WALK;
        W.kind[i] = 0;
        W.G[i] = "dirt";
      }
    }
    blob(camp.x, camp.y, 4, (x, y) => { const i = ix(x, y); W.T[i] = T_WALK; W.kind[i] = 0; W.G[i] = "dirt"; });
  }
  const free = (x, y) => inb(x, y) && W.T[ix(x, y)] === T_WALK && !W.path[ix(x, y)] && !W.objAt[ix(x, y)];
  function place(key, tx, ty, force) {
    const o = OBJ[key] || { fw:1, soft:true }, fw = o.fw, fh = o.fh || 1;
    for (let y = ty - fh + 1; y <= ty; y++) for (let x = tx; x < tx + fw; x++) {
      if (!inb(x, y)) return false;
      if (!force && !free(x, y)) return false;
      if (force && (W.objAt[ix(x, y)] || (key !== "tent" && W.path[ix(x, y)]))) return false;
    }
    for (let y = ty - fh + 1; y <= ty; y++) for (let x = tx; x < tx + fw; x++) { const i = ix(x, y); W.objAt[i] = 1; if (!o.soft) { W.T[i] = T_WALL; if (!W.kind[i]) W.kind[i] = 3; } }
    W.objs.push({ key, x:(tx + fw / 2) * TL, y:(ty + 1) * TL - 1 });
    return true;
  }
  if (id !== "roots") {
    place("tent", camp.x - 1, camp.y - 1, true);
    W.camp = { x:camp.x * TL + 8, y:camp.y * TL, fx:(camp.x + 0.5) * TL, fy:(camp.y + 2) * TL };
    W.T[ix(camp.x, camp.y + 1)] = T_WALL; W.objAt[ix(camp.x, camp.y + 1)] = 1;
  } else W.camp = { x:28 * TL + 8, y:5 * TL };
  const borderKeys = { sun:["tree","otree","otree"], trunk:["otree","tree","tree"], silt:["deadtree","deadtree2","tree"], glass:["tree","tree","otree"] }[id];
  if (borderKeys) for (let y = 1; y < MH; y += 2) for (let x = 0; x < MW; x += 2) if (W.kind[ix(x, y)] === 1 && rng() < 0.85) place(borderKeys[Math.floor(rng() * 3)], x, y, true);
  const props = { sun:[["tree",22],["otree",22],["sunflower",14],["stump",6],["tallgrass",8]], trunk:[["otree",30],["tree",22],["stump",14],["log",12],["tallgrass",14]],
    silt:[["deadtree",14],["deadtree2",12],["mboulder",14],["boulder",6],["tallgrass",14],["stump",6]], glass:[["boulder",16],["tree",14],["tallgrass",8],["mboulder",6]],
    roots:[["boulder",10],["mboulder",8]] }[id];
  for (const [key, n] of props) for (let i = 0, k = 0; i < n && k < 400; k++) { const x = rnd2(rng, 2, MW - 4), y = rnd2(rng, 3, MH - 3); if (farFromCamp(x, y, 5) && place(key, x, y)) i++; }
  if (id === "glass") for (let y = 2; y < MH - 2; y++) for (let x = 2; x < MW - 2; x++) if (W.T[ix(x, y)] === T_WALK && !W.path[ix(x, y)] && rng() < 0.3 && [[1,0],[-1,0],[0,1],[0,-1]].some(([a, b]) => W.T[ix(x + a, y + b)] === T_WATER)) place("cattail", x, y);
  const deco = { sun:["flowers","redflower","bush","rock"], trunk:["redflower","flower2","bush","clover","rock"], silt:["mrock","mrock2","flower2","deadbush"], glass:["flowers","rock","rock2","bush"], roots:["rock","rock2","mrock"] }[id];
  for (let i = 0; i < 160; i++) { const x = rnd2(rng, 1, MW - 2), y = rnd2(rng, 1, MH - 2); if (W.T[ix(x, y)] === T_WALK && !W.objAt[ix(x, y)] && !W.path[ix(x, y)] && W.G[ix(x, y)] !== "dirt") W.decor.push({ key:deco[Math.floor(rng() * deco.length)], x:x * TL + 8 + (rng() - 0.5) * 6, y:(y + 1) * TL - 1 }); }
  // reachability
  const reach = new Int16Array(N).fill(-1), q = [];
  const start = id === "roots" ? [28, 5] : [camp.x, camp.y + 2];
  reach[ix(start[0], start[1])] = 0; q.push(start);
  while (q.length) { const [x, y] = q.shift(); for (const [a, b] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + a, ny = y + b; if (inb(nx, ny) && reach[ix(nx, ny)] < 0 && W.T[ix(nx, ny)] === T_WALK) { reach[ix(nx, ny)] = reach[ix(x, y)] + 1; q.push([nx, ny]); } } }
  W.reach = reach;
  const spots = []; for (let i = 0; i < N; i++) if (reach[i] > 6 && !W.objAt[i] && !W.path[i]) spots.push(i);
  const used = [];
  const takeSpot = (minD = 5, filter) => { for (let k = 0; k < 300; k++) { const i = spots[Math.floor(rng() * spots.length)]; if (i == null) return null; const x = i % MW, y = Math.floor(i / MW);
    if (filter && !filter(x, y, i)) continue; if (used.some(u => Math.hypot(u[0] - x, u[1] - y) < minD)) continue; used.push([x, y]); return [x, y]; } return null; };
  const A = AREA(id);
  let nid = 0;
  for (const [type, n] of Object.entries(A.nodes || {})) for (let i = 0; i < n; i++) { const s = takeSpot(); if (s) W.nodes.push({ id:`n${nid++}`, type, x:s[0] * TL + 8, y:(s[1] + 1) * TL - 2 }); }
  if (id !== "roots") for (let i = 0; i < 3; i++) { const s = takeSpot(); if (s) W.nodes.push({ id:`w${i}`, type:"waste", x:s[0] * TL + 8, y:(s[1] + 1) * TL - 2 }); }
  for (let i = 0; i < (id === "roots" ? 3 : 2); i++) { const s = takeSpot(8); if (s) W.nodes.push({ id:`c${i}`, type:"chest", x:s[0] * TL + 8, y:(s[1] + 1) * TL - 2 }); }
  if (A.bunker) { const s = takeSpot(6, (x, y) => reach[ix(x, y)] > 18); if (s) W.nodes.push({ id:"bunker", type:"bunker", x:s[0] * TL + 8, y:(s[1] + 1) * TL - 2 }); }
  let best = -1, bi = 0; for (let i = 0; i < N; i++) if (reach[i] > best && !W.objAt[i] && !W.path[i] && W.kind[i] === 0) { best = reach[i]; bi = i; }
  W.lair = { x:(bi % MW) * TL + 8, y:(Math.floor(bi / MW) + 1) * TL - 2 };
  if (id === "roots") W.nodes.push({ id:"core", type:"core", x:W.coreAt.x * TL + 8, y:(W.coreAt.y + 1) * TL - 2 });
  if (id !== "roots") {
    const R = REGIONS[id];
    W.npcs.push({ kind:"merchant", char:R.merchant.char, name:R.merchant.name, x:W.camp.x + 52, y:W.camp.y + 20, dir:1 });
    if (R.sanctuary) W.npcs.push({ kind:"elder", char:CHAR.elder, name:"Root-Singer Elder", x:W.camp.x - 44, y:W.camp.y + 22, dir:2 });
    // nudge NPCs off the path to the nearest clear, reachable tile
    const offPath = (tx, ty) => inb(tx, ty) && W.T[ix(tx, ty)] === T_WALK && !W.path[ix(tx, ty)] && !W.objAt[ix(tx, ty)] && reach[ix(tx, ty)] >= 0;
    for (const n of W.npcs) {
      const tx = Math.floor(n.x / TL), ty = Math.floor((n.y - 1) / TL);
      if (offPath(tx, ty)) continue;
      let found = null;
      for (let r = 1; r < 8 && !found; r++) for (let dy = -r; dy <= r && !found; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        if (offPath(tx + dx, ty + dy)) { found = [tx + dx, ty + dy]; break; }
      }
      if (found) { n.x = found[0] * TL + 8; n.y = (found[1] + 1) * TL - 2; W.objAt[ix(found[0], found[1])] = 1; }
    }
  }
  W.spawnSpots = spots.filter(i => reach[i] > 12);
  W.bg = bakeBg(W);
  return W;
}
function bakeBg(W) {
  const c = document.createElement("canvas"); c.width = MW * TL; c.height = MH * TL;
  const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
  const ix = (a, b) => b * MW + a;

  const isDirtPath = (tx, ty) => {
    if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return false;
    const g = W.G[ix(tx, ty)];
    return g === "dirt" || (typeof g === "string" && g.startsWith("dirt"));
  };

  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) {
    const i = ix(tx, ty), t = W.T[i], X = tx * TL, Y = ty * TL;
    if (t === T_VOID) {
      x.fillStyle = `hsl(200,70%,${76 + (ty / MH) * 10}%)`; x.fillRect(X, Y, TL, TL);
      if (hash2(tx, ty, 9) < 0.1) { x.fillStyle = "#ffffffcc"; x.beginPath(); x.ellipse(X + 8, Y + 9, 9, 3, 0, 0, 7); x.fill(); }
      continue;
    }

    // Always draw base biome terrain first so dirt/paths transition seamlessly
    if (W.baseG && W.baseG[i]) {
      t16(x, W.baseG[i], X, Y, TL, TL);
    }

    // Path rendering with 9-slice autotile transitions
    if (W.G[i] === "dirt") {
      const hasT = isDirtPath(tx, ty - 1);
      const hasB = isDirtPath(tx, ty + 1);
      const hasL = isDirtPath(tx - 1, ty);
      const hasR = isDirtPath(tx + 1, ty);
      let pathTile = "dirt";
      if (hasT && hasB && hasL && hasR) pathTile = "dirt_c";
      else if (!hasT && !hasL && hasR && hasB) pathTile = "dirt_tl";
      else if (!hasT && !hasR && hasL && hasB) pathTile = "dirt_tr";
      else if (!hasB && !hasL && hasR && hasT) pathTile = "dirt_bl";
      else if (!hasB && !hasR && hasL && hasT) pathTile = "dirt_br";
      else if (!hasT && hasB) pathTile = "dirt_t";
      else if (!hasB && hasT) pathTile = "dirt_b";
      else if (!hasL && hasR) pathTile = "dirt_l";
      else if (!hasR && hasL) pathTile = "dirt_r";
      t16(x, pathTile, X, Y, TL, TL);
    } else {
      t16(x, W.G[i], X, Y, TL, TL);
    }

    if (t === T_WATER) t16(x, "water", X, Y, TL, TL);
    if (t === T_SAP) {
      t16(x, "water", X, Y, TL, TL);
      x.fillStyle = "rgba(190,95,5,0.88)"; x.fillRect(X, Y, TL, TL);
      x.fillStyle = "rgba(255,190,70,0.35)"; x.fillRect(X + (tx * 7 % 10), Y + 3 + (ty * 5 % 9), 5, 1);
      if (hash2(tx, ty, 4) < 0.3) { x.fillStyle = "#ffe0a0"; x.fillRect(X + 4, Y + 9, 2, 2); }
    }
    if (W.G[i] === "plankV") {
      x.fillStyle = "rgba(0,0,0,0.22)"; x.fillRect(X, Y + 14, TL, 2);
    } else if (W.G[i] === "plankH") {
      x.fillStyle = "rgba(0,0,0,0.22)"; x.fillRect(X + 14, Y, 2, TL);
    }
    if (t === T_WALL && W.kind[i] === 2) t16(x, "steps", X, Y, TL, TL);
    if (t === T_WALL && W.kind[i] === 4) {
      x.fillStyle = "rgba(6,4,12,0.9)"; x.fillRect(X, Y, TL, TL);
      if (ty + 1 < MH && W.T[ix(tx, ty + 1)] === T_WALK) { x.fillStyle = "#3a3340"; x.fillRect(X, Y + 12, TL, 4); }
    }
    if (t === T_WALL && W.kind[i] === 1) { x.fillStyle = "rgba(0,0,0,0.3)"; x.fillRect(X, Y, TL, TL); }
    if (ty + 1 < MH && W.T[ix(tx, ty + 1)] === T_VOID) {
      x.fillStyle = "#6b4a2a"; x.fillRect(X, Y + 13, TL, 3);
      x.fillStyle = "#3d2914"; x.fillRect(X, Y + 15, TL, 1);
    }
    if ((t === T_WATER || t === T_SAP) && ty > 0 && W.T[ix(tx, ty - 1)] === T_WALK) {
      x.fillStyle = "rgba(255,255,255,0.35)"; x.fillRect(X, Y, TL, 1);
    }
  }
  for (const d of W.decor) { const r = TS16[d.key]; t16(x, d.key, d.x - r[2] / 2, d.y - r[3]); }
  return c;
}

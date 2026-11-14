function symbMeterHTML() {
  const s = symbiosis(), max = 14;
  return `<div class="row small" style="justify-content:space-between"><span>${iconHTML(ICON.symb, 16)} Symbiosis ${s}/${SYMB_CAP}</span><span style="color:${overgrown() ? "#e0473f" : "#a7ada3"}">${overgrown() ? "OVERGROWTH: +50% dmg, +10 HP, fire ×2, industrial towns refuse you" : `grafts ${graftLoad()} + taint ${G.taint}`}</span></div>
    <div class="meter ${overgrown() ? "over" : ""}"><i style="width:${Math.min(100, s / max * 100)}%"></i><b style="left:${SYMB_CAP / max * 100}%"></b></div>`;
}
function slotsHTML(editable) {
  return `<div class="slots">${["resp","limb","sense"].map(sl => `<span class="small muted">${SLOT_NAMES[sl]}</span><div class="row">${[0,1].map(i => { const id = G.equipped[sl][i];
    return id ? (editable ? `<button title="Unequip" onclick="unequip('${sl}','${id}')">${iconHTML(GRAFTS[id].icon, 24)}<span class="small">${GRAFTS[id].name} <span class="tag">T${GRAFTS[id].tier}</span></span></button>` : `<div class="cell f" title="${esc(GRAFTS[id].name + ": " + GRAFTS[id].desc)}">${iconHTML(GRAFTS[id].icon, 28)}<span class="t">${GRAFTS[id].tier}</span></div>`) : `<div class="cell"></div>`; }).join("")}</div>`).join("")}</div>`;
}
function unequip(sl, id) { G.equipped[sl] = G.equipped[sl].filter(x => x !== id); G.hp = Math.min(G.hp, maxHp()); refreshPanel(); }
function equip(id) { const sl = GRAFTS[id].slot; if (G.equipped[sl].length < 2) G.equipped[sl].push(id); refreshPanel(); }
function loadoutPanel() {
  const avail = G.owned.filter(id => !has(id)).map(id => { const g = GRAFTS[id], full = G.equipped[g.slot].length >= 2;
    return `<button style="justify-content:flex-start;text-align:left;width:100%" ${full ? "disabled" : ""} onclick="equip('${id}')">${iconHTML(g.icon, 28)}<span><b>${g.name}</b> <span class="tag">${SLOT_NAMES[g.slot]} · T${g.tier}</span>${g.mythic ? ' <span class="tag" style="color:#ffe08a">mythic</span>' : ""}<br><span class="small muted">${g.desc}</span></span></button>`; }).join("") || `<div class="muted small">Every graft you own is woven in.</div>`;
  return `<h2>Graft Loadout</h2>${symbMeterHTML()}<h3>Woven grafts (click to remove)</h3>${slotsHTML(true)}<h3>Owned grafts</h3><div style="display:flex;flex-direction:column;gap:6px">${avail}</div>`;
}
function shopPanel() {
  const id = G.loc, R = REGIONS[id], st = status(G.regions[id].bal);
  let m = st === "depleted" ? 1.5 : 1; if (R.rootSinger && has("pheromone")) m *= 0.8; if (R.rootSinger && overgrown()) m *= 0.9;
  const rows = R.shop.map(([kind, key, base]) => { const price = Math.ceil(base * m);
    if (kind === "graft") { const g = GRAFTS[key], own = G.owned.includes(key);
      return `<div class="card row">${iconHTML(g.icon, 32)}<div style="flex:1"><b>${g.name}</b> <span class="tag">${SLOT_NAMES[g.slot]} · T${g.tier}</span><div class="small muted">${g.desc}</div></div><button ${own || G.res.coins < price ? "disabled" : ""} onclick="buy('graft','${key}',${price})">${own ? "Owned" : iconHTML(ICON.coins, 16) + price}</button></div>`; }
    return `<div class="card row">${iconHTML(ICON[key], 32)}<div style="flex:1"><b>${RES_NAMES[key]}</b></div><button ${G.res.coins < price ? "disabled" : ""} onclick="buy('item','${key}',${price})">${iconHTML(ICON.coins, 16)}${price}</button></div>`; }).join("");
  const sm = st === "depleted" ? 0.7 : 1, sp = { sap:3, scrap:4, crystal:5, spores:2, seeds:1 };
  const sells = Object.entries(sp).map(([k, v]) => { const pr = Math.max(1, Math.floor(v * sm)); return `<button ${G.res[k] < 1 ? "disabled" : ""} onclick="sell('${k}',${pr})">${iconHTML(ICON[k], 16)}→${iconHTML(ICON.coins, 16)}${pr}</button>`; }).join("");
  return `<div class="row">${charHTML(R.merchant.char, 3)}<div><h2>${R.merchant.name}</h2><div class="small muted">Prices ×${m.toFixed(2)}${st === "depleted" ? " (scarcity)" : ""} · You have ${iconHTML(ICON.coins, 16)}${G.res.coins}</div></div></div>
    <h3>Buy</h3><div style="display:flex;flex-direction:column;gap:6px">${rows}</div><h3>Sell</h3><div class="row">${sells}</div>`;
}
function buy(kind, key, price) { if (G.res.coins < price) return; G.res.coins -= price; if (kind === "graft") { G.owned.push(key); toast(`New graft: ${GRAFTS[key].name}`, "#9ad04a"); } else G.res[key]++; refreshPanel(); }
function sell(k, pr) { if (G.res[k] < 1) return; G.res[k]--; G.res.coins += pr; refreshPanel(); }
function refineryRecipes() { const k = G.companion === "kaelen" ? 1 : 0; return [["bombs", { sap:Math.max(1, 2 - k), crystal:1 }], ["potions", { sap:Math.max(1, 2 - k), seeds:1 }]]; }
function campPanel() {
  const comps = Object.entries(COMPANIONS).map(([id, C]) => `<div class="card ${G.companion === id ? "on" : ""}"><div class="row">${charHTML(C.char, 3)}<div style="flex:1"><b>${C.name}</b><div class="small muted">${C.role}</div></div></div>
    <div class="small" style="margin:4px 0">${C.blurb}</div><ul class="small muted" style="margin:0;padding-left:16px">${C.perks.map(p => `<li>${p}</li>`).join("")}</ul>
    <div style="margin-top:6px">${G.companion === id ? `<span class="small" style="color:#6fcf6a">Travelling with you</span>` : `<button onclick="G.companion='${id}';refreshPanel()">Bring along</button>`}</div></div>`).join("");
  const ups = Object.entries(UPGRADES).map(([id, U]) => `<div class="card"><div class="row">${iconHTML(U.icon, 32)}<div style="flex:1"><b>${U.name}</b><div class="small muted">${U.desc}</div></div></div>
    <div style="margin-top:6px">${G.upgrades[id] ? `<span class="small" style="color:#6fcf6a">Built</span>` : `<button ${canAfford(U.cost) ? "" : "disabled"} onclick="build('${id}')">Build — ${costHTML(U.cost)}</button>`}</div></div>`).join("");
  const breed = G.upgrades.greenhouse ? BREED.map(([gid, cost]) => { const g = GRAFTS[gid], own = G.owned.includes(gid);
    return `<button style="justify-content:flex-start;text-align:left" ${own || !canAfford(cost) ? "disabled" : ""} onclick="breedGraft('${gid}')">${iconHTML(g.icon, 24)}<span><b>${g.name}</b><br><span class="small muted">${own ? "Already cultivated" : costHTML(cost)}</span></span></button>`; }).join("") : `<div class="small muted">Build the Apothecary Greenhouse to breed grafts.</div>`;
  const refine = G.upgrades.refinery ? refineryRecipes().map(([k, c]) => `<button ${canAfford(c) ? "" : "disabled"} onclick="refine('${k}')">${iconHTML(ICON[k], 20)}${RES_NAMES[k]} — ${costHTML(c)}</button>`).join(" ") : `<div class="small muted">Build the Sap-Refinery to craft bombs and tonics.</div>`;
  return `<div class="row">${tileHTML("tent", 0.5)}<div><h2>The Strider-Caravan</h2><div class="small muted">Your rolling home on the canopy highways.</div></div></div>
    <div class="row" style="margin-top:8px"><button ${G.res.potions < 1 || G.hp >= maxHp() ? "disabled" : ""} onclick="G.res.potions--;G.hp=Math.min(maxHp(),G.hp+12);refreshPanel()">${iconHTML(ICON.potions, 20)}Drink Sap Tonic (+12 HP)</button>
    ${G.upgrades.greenhouse ? `<button onclick="openPanel(loadoutPanel)">${iconHTML(IC(15,7), 20)}Re-weave grafts</button>` : ""}</div>
    <h3>Companions</h3><div class="grid">${comps}</div><h3>Upgrades</h3><div class="grid">${ups}</div>
    <h3>Greenhouse breeding</h3><div class="grid">${breed}</div><h3>Refinery</h3><div class="row">${refine}</div>`;
}
function build(id) { const U = UPGRADES[id]; if (!canAfford(U.cost)) return; pay(U.cost); G.upgrades[id] = true; toast(`Built: ${U.name}`, "#9ad04a"); refreshPanel(); }
function breedGraft(gid) { const c = BREED.find(b => b[0] === gid)[1]; if (!canAfford(c)) return; pay(c); G.owned.push(gid); toast(`Bred: ${GRAFTS[gid].name}`, "#9ad04a"); refreshPanel(); }
function refine(k) { const c = refineryRecipes().find(r => r[0] === k)[1]; if (!canAfford(c)) return; pay(c); G.res[k]++; refreshPanel(); }
function invPanel() {
  const res = Object.keys(RES_NAMES).map(k => `<span class="row" style="gap:4px">${iconHTML(ICON[k], 22)}${RES_NAMES[k]}: <b>${G.res[k]}</b></span>`).join("");
  return `<div class="row">${charHTML(CHAR.player, 3)}<div><h2>Graftwarden</h2><div class="small muted">HP ${Math.ceil(G.hp)}/${maxHp()} · Ricochet damage ${baseDmg()} · Day ${G.day} (${PHASES[G.phase]}) · Root Echoes ${G.echoes.length}/3</div></div></div>
    <h3>Grafts</h3>${symbMeterHTML()}<div style="margin-top:6px">${slotsHTML(false)}</div>
    <div class="small muted" style="margin-top:4px">Re-weave grafts with a Root-Singer Elder (Twilight Trunk, Silt-Floor) or at camp once the Greenhouse is built. Owned: ${G.owned.map(id => GRAFTS[id].name).join(", ")}</div>
    <h3>Pack</h3><div class="grid small">${res}</div>
    <h3>Fighting (Kinetic Ricochet)</h3><div class="small">Drag back from anywhere and release to launch yourself — time slows while you aim. Speed is power: <span style="color:#5fb3ff">blue</span> → <span style="color:#ffd94a">yellow</span> → <span style="color:#ff5a3c">red</span> → white-hot.
    Slow wall hits crack your shell (3 cracks = shatter). Tap <kbd>Space</kbd> the instant you hit a wall to PARRY: double speed and repair a crack. Chain bounces for style ranks and bonus damage.
    When slow you're vulnerable — <kbd>WASD</kbd> to walk, <kbd>Shift</kbd> to dash (i-frames). Graft abilities on <kbd>1</kbd>–<kbd>5</kbd>, <kbd>H</kbd> tonic, <kbd>B</kbd> bomb at cursor.
    Pink bumpers boost you, mossy walls stop you dead, cracked stone only breaks at red speed, prisms split you in two.</div>
    <h3>Journal</h3><div class="small muted" style="max-height:160px;overflow:auto">${G.log.map(l => `<div>${esc(l)}</div>`).join("") || "—"}</div>
    <div class="row" style="margin-top:12px"><button onclick="closePanel();quitToTitle()">Save & quit to title</button></div>`;
}
function quitToTitle() { save(); mode = "title"; E = null; document.getElementById("prompt").classList.add("hidden"); showTitle(); }
let pulseBg = null;
function buildPulseBg() {
  if (!ok(img(PATHS.tiles32))) return null;
  const W = 960, H = 620, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"); x.imageSmoothingEnabled = false; const rng = mulberry32(1337);
  const P = { ...REGIONS, roots:ROOTS };
  for (let y = 0; y < H; y += 32) for (let xx = 0; xx < W; xx += 32) { const d = y / H, r = rng(); t32(x, d < 0.3 ? (r < 0.55 ? "grass2" : "grass") : d < 0.58 ? (r < 0.6 ? "green" : "grass") : d < 0.86 ? (r < 0.6 ? "dgrass" : "dgrass2") : "rockfloor", xx, y); }
  const inE = (px, py, cx, cy, rx, ry) => ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 < 1;
  for (let y = 0; y < H; y += 32) for (let xx = 0; xx < W; xx += 32) { const mx = xx + 16, my = y + 16;
    if (inE(mx, my, P.sun.pos[0], P.sun.pos[1], 112, 58)) t32(x, "plankH", xx, y); if (inE(mx, my, P.trunk.pos[0], P.trunk.pos[1], 70, 46)) t32(x, "dirt", xx, y);
    if (inE(mx, my, P.silt.pos[0], P.silt.pos[1], 100, 66)) t32(x, "rockfloor", xx, y); if (inE(mx, my, P.glass.pos[0] + 10, P.glass.pos[1] + 8, 135, 82)) t32(x, "water", xx, y); }
  for (const [a, b] of EDGES) { const [x1, y1] = P[a].pos, [x2, y2] = P[b].pos, cx = (x1 + x2) / 2 + 30, cy = (y1 + y2) / 2;
    for (let t = 0; t <= 1; t += 0.012) { const u = 1 - t; t32(x, "dirt", u*u*x1 + 2*u*t*cx + t*t*x2 - 9, u*u*y1 + 2*u*t*cy + t*t*y2 - 9, 0.56); } }
  const decos = [];
  for (let i = 0; i < 500 && decos.length < 70; i++) { const px = rng() * W, py = 30 + rng() * (H - 20), d = py / H;
    const pool = d < 0.3 ? ["tree","otree","sunflower"] : d < 0.58 ? ["tree","otree","stump","log"] : d < 0.86 ? ["deadtree","deadtree2","mboulder"] : ["deadtree","boulder"];
    const key = pool[Math.floor(rng() * pool.length)], r = TS32[key];
    if (Object.values(P).some(n => Math.hypot(n.pos[0] - px, n.pos[1] + 30 - py) < 110 || Math.hypot(n.pos[0] - px, n.pos[1] - (py - r[3] / 2)) < 100)) continue;
    if (decos.some(o => Math.abs(o.x - px) < 60 && Math.abs(o.y - py) < 36)) continue; decos.push({ x:px, y:py, key }); }
  decos.sort((a, b) => a.y - b.y); for (const d of decos) { const r = TS32[d.key]; t32(x, d.key, d.x - r[2] / 2, d.y - r[3]); }
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(255,214,110,0.22)"); g.addColorStop(0.5, "rgba(0,0,0,0.05)"); g.addColorStop(1, "rgba(0,0,0,0.6)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  return c;
}
function pulsePanel() {
  setTimeout(drawPulse, 0);
  return `<h2>The Pulse</h2><div class="small muted">Living heatmap of each region's ecological balance. Every day each region drifts toward crimson. ${G.upgrades.mast || G.companion === "sylva" ? "▼ shows tomorrow's expected loss." : "Build a Signal-Mast (or travel with Sylva) to see the forecast."}</div>
    <canvas id="pulsec" width="960" height="620" style="width:100%;margin-top:8px;image-rendering:pixelated"></canvas>
    <div class="row small" style="margin-top:6px"><span style="color:#6fcf6a">■ Balanced ≥60</span><span style="color:#e8cf4a">■ Depleted 30–59</span><span style="color:#e0473f">■ Enraged &lt;30 (Apex Warden)</span><span class="muted">· Press M or Esc to close</span></div>`;
}
function drawPulse() {
  const c = document.getElementById("pulsec"); if (!c) return;
  const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
  if (!pulseBg) pulseBg = buildPulseBg();
  if (pulseBg) x.drawImage(pulseBg, 0, 0); else { x.fillStyle = "#1b2a1f"; x.fillRect(0, 0, 960, 620); }
  const lbl = (s, px, py, col, font) => { x.font = font; x.textAlign = "center"; x.lineWidth = 4; x.strokeStyle = "#000"; x.strokeText(s, px, py); x.fillStyle = col; x.fillText(s, px, py); };
  for (const id in REGIONS) { const st = status(G.regions[id].bal), [px, py] = REGIONS[id].pos, col = STATUS_COLOR[st];
    const rg = x.createRadialGradient(px, py, 10, px, py, 125); rg.addColorStop(0, col + "66"); rg.addColorStop(1, col + "00"); x.fillStyle = rg; x.beginPath(); x.arc(px, py, 125, 0, 7); x.fill(); }
  { const [px, py] = ROOTS.pos, open = G.echoes.length >= 3; t32(x, "door", px - 14, py - 52, 1, open ? 1 : 0.6); if (!open) icon32(x, ICON.lock, px + 8, py - 24, 24); lbl(ROOTS.name + (open ? "" : ` (${G.echoes.length}/3 echoes)`), px, py + 18, open ? "#d9c9f5" : "#bbb", "15px 'Pixelify Sans'"); }
  for (const id in REGIONS) { const R = REGIONS[id], r = G.regions[id], st = status(r.bal), [px, py] = R.pos;
    x.fillStyle = "#0b100dcc"; x.strokeStyle = STATUS_COLOR[st]; x.lineWidth = 3; x.beginPath(); x.arc(px, py, 30, 0, 7); x.fill(); x.stroke();
    icon32(x, R.icon, px - 20, py - 20, 40); lbl(R.name, px, py + 50, "#f6f0dc", "16px 'Pixelify Sans'");
    lbl(`${STATUS_LABEL[st]} · ${r.bal}${G.upgrades.mast || G.companion === "sylva" ? `  ▼${G.drift[id]}` : ""}`, px, py + 66, STATUS_COLOR[st], "13px 'Pixelify Sans'");
    if (r.warden) icon32(x, ICON.warden, px + 22, py - 44, 28); if (r.echo) icon32(x, ICON.echo, px - 50, py - 44, 24); }
  const here = AREA(G.loc).pos, im = img(charPath(CHAR.player));
  if (ok(im)) x.drawImage(im, 16, 0, 16, 20, here[0] + 34, here[1] - 40, 32, 40);
  lbl("YOU", here[0] + 50, here[1] - 44, "#ffe46a", "12px 'Pixelify Sans'");
}

function symbMeterHTML() {
  const s = symbiosis(), max = 14;
  return `<div class="row small" style="justify-content:space-between"><span>${iconHTML(ICON.symb, 16)} Symbiosis ${s}/${SYMB_CAP}</span><span style="color:${overgrown() ? "#e0473f" : "#a7ada3"}">${overgrown() ? "OVERGROWTH: +1 damage, +2 max HP, fire ×2, industrial towns refuse you" : `grafts ${graftLoad()} + taint ${G.taint}${bladeSymb() ? ` + blade ${bladeSymb()}` : ""}`}</span></div>
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
    if (kind === "part") { const pt = PARTS[key], own = G.arms.parts.includes(key);
      return `<div class="card row">${iconHTML(pt.icon, 32)}<div style="flex:1"><b>${pt.name}</b> <span class="tag">Sword · ${PART_SLOTS[pt.slot]}</span> <span class="tag" style="color:${LEAN_COL[pt.lean]}">${pt.lean}</span><div class="small muted">${pt.desc}</div></div><button ${own || G.res.coins < price ? "disabled" : ""} onclick="buy('part','${key}',${price})">${own ? "Owned" : iconHTML(ICON.coins, 16) + price}</button></div>`; }
    if (kind === "graft") { const g = GRAFTS[key], own = G.owned.includes(key);
      return `<div class="card row">${iconHTML(g.icon, 32)}<div style="flex:1"><b>${g.name}</b> <span class="tag">${SLOT_NAMES[g.slot]} · T${g.tier}</span><div class="small muted">${g.desc}</div></div><button ${own || G.res.coins < price ? "disabled" : ""} onclick="buy('graft','${key}',${price})">${own ? "Owned" : iconHTML(ICON.coins, 16) + price}</button></div>`; }
    return `<div class="card row">${iconHTML(ICON[key], 32)}<div style="flex:1"><b>${RES_NAMES[key]}</b></div><button ${G.res.coins < price ? "disabled" : ""} onclick="buy('item','${key}',${price})">${iconHTML(ICON.coins, 16)}${price}</button></div>`; }).join("");
  const sm = st === "depleted" ? 0.7 : 1, sp = { sap:3, scrap:4, crystal:5, spores:2, seeds:1 };
  const sells = Object.entries(sp).map(([k, v]) => { const pr = Math.max(1, Math.floor(v * sm)); return `<button ${G.res[k] < 1 ? "disabled" : ""} onclick="sell('${k}',${pr})">${iconHTML(ICON[k], 16)}→${iconHTML(ICON.coins, 16)}${pr}</button>`; }).join("");
  return `<div class="row">${charHTML(R.merchant.char, 3)}<div><h2>${R.merchant.name}</h2><div class="small muted">Prices ×${m.toFixed(2)}${st === "depleted" ? " (scarcity)" : ""} · You have ${iconHTML(ICON.coins, 16)}${G.res.coins}</div></div></div>
    <h3>Buy</h3><div style="display:flex;flex-direction:column;gap:6px">${rows}</div><h3>Sell</h3><div class="row">${sells}</div>`;
}
function buy(kind, key, price) { if (G.res.coins < price) return; G.res.coins -= price; if (kind === "graft") { G.owned.push(key); toast(`New graft: ${GRAFTS[key].name}`, "#9ad04a"); } else if (kind === "part") { G.arms.parts.push(key); toast(`New sword part: ${PARTS[key].name}`, "#ffe08a"); } else G.res[key]++; refreshPanel(); }
function sell(k, pr) { if (G.res[k] < 1) return; G.res[k]--; G.res.coins += pr; refreshPanel(); }
function refineryRecipes() { const k = G.companion === "kaelen" ? 1 : 0; return [["bombs", { sap:Math.max(1, 2 - k), crystal:1 }], ["potions", { sap:Math.max(1, 2 - k), seeds:1 }]]; }
function panelTabsHTML(activeTab) {
  const pK = keyLabel((BINDINGS.pack && BINDINGS.pack[0]) || "tab");
  const mK = keyLabel((BINDINGS.pulse && BINDINGS.pulse[0]) || "m");
  const oK = keyLabel((BINDINGS.settings && BINDINGS.settings[0]) || "o");
  const atCamp = typeof isAtCamp === "function" && isAtCamp();
  const nearVael = (typeof isNearNPC === "function" && isNearNPC("questGiver")) || atCamp;

  let tabs = `
    <button class="panel-tab ${activeTab === 'inv' ? 'active' : ''}" onclick="openPanel(invPanel)">${iconHTML(ICON.chest, 16)} Inventory [${pK}]</button>
    <button class="panel-tab ${activeTab === 'pulse' ? 'active' : ''}" onclick="openPanel(pulsePanel)">${iconHTML(REGIONS.sun ? REGIONS.sun.icon : ICON.day, 16)} The Pulse [${mK}]</button>
  `;

  if (atCamp) {
    tabs += `
      <button class="panel-tab ${activeTab === 'camp' ? 'active' : ''}" onclick="openPanel(campPanel)">${tileHTML("tent", 0.35)} Caravan</button>
      <button class="panel-tab ${activeTab === 'armory' ? 'active' : ''}" onclick="openPanel(armoryPanel)">${iconHTML(sword().icon, 16)} Armory</button>
    `;
  } else {
    tabs += `
      <button class="panel-tab locked" disabled title="Only accessible at the Strider-Caravan camp">${tileHTML("tent", 0.35)} Caravan <span class="tab-loc-tag">At Camp</span></button>
      <button class="panel-tab locked" disabled title="Only accessible at the Strider-Caravan workbench at camp">${iconHTML(sword().icon, 16)} Armory <span class="tab-loc-tag">At Camp</span></button>
    `;
  }

  if (nearVael) {
    tabs += `<button class="panel-tab ${activeTab === 'quests' ? 'active' : ''}" onclick="openPanel(questsPanel)">${iconHTML(ICON.echo, 16)} Quests</button>`;
  } else {
    tabs += `<button class="panel-tab locked" disabled title="Only accessible from Chronicle-Keeper Vael at camp">${iconHTML(ICON.echo, 16)} Quests <span class="tab-loc-tag">At Vael</span></button>`;
  }

  tabs += `
    <button class="panel-tab ${activeTab === 'tutorial' ? 'active' : ''}" onclick="openPanel(tutorialPanel)">📖 Field Guide</button>
    <button class="panel-tab ${activeTab === 'settings' ? 'active' : ''}" onclick="openPanel(settingsPanel)">⚙ Settings [${oK}]</button>
  `;

  return `<div class="panel-tabs">${tabs}</div>`;
}

function questsPanel() {
  const echoesCount = G.echoes.length;
  const rootsUnlocked = echoesCount >= 3;

  const echoSources = [
    {
      region: "sun",
      name: "The Sun-Crown Echo",
      desc: "Recovered by hunting the Sun-Warden or calming it via Restoration Ritual.",
      done: G.echoes.includes("sun") || (G.regions.sun && G.regions.sun.echo),
    },
    {
      region: "trunk",
      name: "The Twilight Trunk Echo",
      desc: "Recovered by hunting the Trunk-Warden or calming it via Restoration Ritual.",
      done: G.echoes.includes("trunk") || (G.regions.trunk && G.regions.trunk.echo),
    },
    {
      region: "silt",
      name: "The Silt-Floor Echo",
      desc: "Recovered from Silt-Warden (hunt/ritual) or by breaching the pre-collapse vault with Bram &amp; Pip.",
      done: G.echoes.includes("silt") || (G.regions.silt && (G.regions.silt.echo || G.regions.silt.bunker)),
    },
    {
      region: "glass",
      name: "The Glass-Marsh Echo",
      desc: "Recovered from Glass-Warden (hunt/ritual) or by breaching the pre-collapse vault with Bram &amp; Pip.",
      done: G.echoes.includes("glass") || (G.regions.glass && (G.regions.glass.echo || G.regions.glass.bunker)),
    },
  ];

  const symbReady = overgrown() || G.stats.rituals >= 2;
  const domReady = G.companion === "kaelen" && G.res.scrap >= 10;
  const migReady = G.companion === "bram" && Object.values(G.upgrades).every(Boolean);

  const regionCards = Object.entries(REGIONS).map(([id, R]) => {
    const reg = G.regions[id];
    const st = status(reg.bal);
    const col = STATUS_COLOR[st];
    let advice = "";
    if (st === "enraged") {
      advice = `<span style="color:#e0473f;font-weight:600">⚠ Apex Warden prowling! Hunt it in combat or perform a Restoration Ritual at camp (2 Rare Seeds, 3 Sap, 2 Seeds) to prevent total collapse.</span>`;
    } else if (st === "depleted") {
      advice = `<span style="color:#e8cf4a">Ecosystem strained. Clear rusted industrial waste patches (+6 balance, +1 scrap) to revive the soil.</span>`;
    } else {
      advice = `<span style="color:#6fcf6a">Canopy stable. Daily drift is −${G.drift[id] || 2} balance/day. Harvest moderately.</span>`;
    }
    return `<div class="card" style="border-left:4px solid ${col}">
      <div class="row" style="justify-content:space-between">
        <span class="row" style="gap:6px">${iconHTML(R.icon, 20)}<b>${R.name}</b></span>
        <span class="chip ${st}">${STATUS_LABEL[st]} ${reg.bal}/100</span>
      </div>
      <div class="small muted" style="margin:4px 0 6px">${R.desc}</div>
      <div class="small">${advice}</div>
    </div>`;
  }).join("");

  const upsList = Object.entries(UPGRADES).map(([uid, U]) => {
    const built = G.upgrades[uid];
    return `<div class="quest-step ${built ? "done" : "pending"}">
      <span class="chk">${built ? "✓" : "○"}</span>
      <div style="flex:1"><b>${U.name}</b>: ${built ? `<span style="color:#6fcf6a">Operational</span>` : `<span class="muted">${costHTML(U.cost)}</span>`} <span class="small muted">(${U.desc})</span></div>
    </div>`;
  }).join("");

  const bunkersList = [
    { loc: "silt", name: "Silt-Floor Pre-Collapse Vault", done: G.regions.silt && G.regions.silt.bunker },
    { loc: "glass", name: "Glass-Marsh Pre-Collapse Vault", done: G.regions.glass && G.regions.glass.bunker },
  ].map(b => `<div class="quest-step ${b.done ? "done" : "pending"}">
    <span class="chk">${b.done ? "✓" : "○"}</span>
    <div style="flex:1"><b>${b.name}</b>: ${b.done ? `<span style="color:#6fcf6a">Breached &amp; Echo Decoded</span>` : (G.companion === "bram" ? `<span style="color:#ffe46a">Bram &amp; Pip ready — locate mossy bunker door</span>` : `<span class="muted">Bring Bram &amp; Pip to crack the seal</span>`)}</div>
  </div>`).join("");

  return `<div class="row" style="gap:12px;margin-bottom:12px;align-items:center;background:#181818;border:2px solid #5a4b28;border-radius:4px;padding:8px 12px">${charHTML(CHAR.questGiver, 3)}<div><h2 style="margin:0;color:#ffe46a">Caravan Chronicle &amp; Contracts</h2><div class="small muted">Recorded by Chronicle-Keeper Vael · Strider-Caravan</div></div></div>
    <div class="row" style="justify-content:space-between;margin-bottom:8px">
      <div>
        <h2>Quests &amp; Objectives</h2>
        <div class="small muted">Track the Great Wilt, canopy biomes, and caravan milestones.</div>
      </div>
      <div class="row" style="gap:6px">
        <span class="chip ${rootsUnlocked ? "balanced" : "depleted"}">${iconHTML(ICON.echo, 14)} ${echoesCount}/3 Root Echoes</span>
        <span class="chip ${overgrown() ? "enraged" : "balanced"}">${iconHTML(ICON.symb, 14)} Symbiosis ${symbiosis()}/${SYMB_CAP}</span>
      </div>
    </div>

    <!-- MAIN QUEST -->
    <div class="quest-card main">
      <div class="quest-header">
        <span class="quest-title">${iconHTML(ICON.echo, 20)} MAIN QUEST: Protocol PALE &amp; The Iron Roots</span>
        <span class="chip ${rootsUnlocked ? "balanced" : "depleted"}">${rootsUnlocked ? "Roots Unsealed" : "Echoes Needed"}</span>
      </div>
      <div class="small" style="margin-bottom:10px;line-height:1.4">
        A calcifying blight creeps upward from the subterranean <b>Iron Roots</b>. Ancient protocol <b>PALE</b> is preparing to reset VERDANT-9.
        Retrieve <b>3 Root Echoes</b> to bypass the acoustic barrier south of the Silt-Floor, penetrate the Iron Roots, and reach the Root-Core.
      </div>

      <div style="font-weight:600;font-size:14px;color:var(--amber);margin-bottom:6px">Stage 1: Gather 3 Root Echoes (${echoesCount}/3)</div>
      <div style="margin-left:4px;margin-bottom:10px">
        ${echoSources.map(s => `
          <div class="quest-step ${s.done ? "done" : "pending"}">
            <span class="chk">${s.done ? "✓" : "○"}</span>
            <div style="flex:1"><b>${s.name}</b> — <span class="${s.done ? "muted" : ""}">${s.desc}</span> ${s.done ? `<span style="color:#6fcf6a;font-weight:600"> [RECOVERED]</span>` : `<span class="muted">[Pending]</span>`}</div>
          </div>
        `).join("")}
      </div>

      <div style="font-weight:600;font-size:14px;color:var(--amber);margin-bottom:6px">Stage 2: Breach The Iron Roots</div>
      <div class="quest-step ${rootsUnlocked ? "done" : "pending"}" style="margin-left:4px;margin-bottom:10px">
        <span class="chk">${rootsUnlocked ? "✓" : "○"}</span>
        <div style="flex:1">
          <b>Iron Roots Southern Gate</b>:
          ${rootsUnlocked ? `<span style="color:#6fcf6a;font-weight:600">UNSEALED!</span> Travel south through the Silt-Floor exit down into the Iron Roots.` : `<span style="color:#e8cf4a">SEALED</span> — Collect ${3 - echoesCount} more Root Echo(es) to learn the passkey.`}
        </div>
      </div>

      <div style="font-weight:600;font-size:14px;color:var(--amber);margin-bottom:6px">Stage 3: Endings Preparation (At the Root-Core)</div>
      <div class="grid" style="margin-top:6px">
        <div class="card ${symbReady ? "on" : ""}">
          <div class="row" style="justify-content:space-between"><b>Symbiosis</b> <span class="tag ${symbReady ? "balanced" : ""}" style="color:${symbReady ? "#6fcf6a" : "var(--muted)"}">${symbReady ? "Ready" : "Incomplete"}</span></div>
          <div class="small muted" style="margin:4px 0">Merge with the neural-root to rewrite PALE.</div>
          <div class="small">Req: Overgrowth (${overgrown() ? "✓ Yes" : "No, " + symbiosis() + "/8"}) OR 2 Rituals (${G.stats.rituals >= 2 ? "✓ " + G.stats.rituals + "/2" : G.stats.rituals + "/2"}).</div>
        </div>
        <div class="card ${domReady ? "on" : ""}">
          <div class="row" style="justify-content:space-between"><b>Dominion</b> <span class="tag ${domReady ? "balanced" : ""}" style="color:${domReady ? "#6fcf6a" : "var(--muted)"}">${domReady ? "Ready" : "Incomplete"}</span></div>
          <div class="small muted" style="margin:4px 0">Sever the Root-Core with industrial steam technology.</div>
          <div class="small">Req: Active companion Kaelen (${G.companion === "kaelen" ? "✓ Yes" : "Travel with Kaelen"}) + 10 Scrap (${G.res.scrap >= 10 ? "✓ " + G.res.scrap + "/10" : G.res.scrap + "/10"}).</div>
        </div>
        <div class="card ${migReady ? "on" : ""}">
          <div class="row" style="justify-content:space-between"><b>Migration</b> <span class="tag ${migReady ? "balanced" : ""}" style="color:${migReady ? "#6fcf6a" : "var(--muted)"}">${migReady ? "Ready" : "Incomplete"}</span></div>
          <div class="small muted" style="margin:4px 0">Reinforce the Strider-Caravan and flee into the open sea.</div>
          <div class="small">Req: Active companion Bram &amp; Pip (${G.companion === "bram" ? "✓ Yes" : "Travel with Bram"}) + All 3 Caravan Upgrades (${Object.values(G.upgrades).filter(Boolean).length}/3).</div>
        </div>
      </div>
    </div>

    <!-- REGIONAL ECOLOGY -->
    <h3>Canopy Stewardship (Regional Balance)</h3>
    <div class="grid">${regionCards}</div>

    <!-- CARAVAN & VAULTS -->
    <div class="grid" style="margin-top:14px">
      <div class="card">
        <div class="quest-title" style="margin-bottom:6px">${tileHTML("tent", 0.4)} Caravan Upgrades</div>
        <div class="small muted" style="margin-bottom:8px">Build facilities on the Strider-Caravan to expand your survival options.</div>
        ${upsList}
      </div>
      <div class="card">
        <div class="quest-title" style="margin-bottom:6px">${iconHTML(ICON.lock, 18)} Pre-Collapse Bunkers</div>
        <div class="small muted" style="margin-bottom:8px">Ancient Directorate facilities hidden under the canopy ruins.</div>
        ${bunkersList}
      </div>
    </div>

    <!-- EXPEDITION LOG -->
    <h3>Recent Expedition Log</h3>
    <div class="small muted" style="max-height:120px;overflow:auto;background:#090909;border:1px solid #333;padding:8px 10px;border-radius:3px">
      ${G.log.slice(0, 15).map(l => `<div>${esc(l)}</div>`).join("") || "— No log entries yet —"}
    </div>
  `;
}

function campPanel() {
  const comps = Object.entries(COMPANIONS).map(([id, C]) => `<div class="card ${G.companion === id ? "on" : ""}"><div class="row">${charHTML(C.char, 3)}<div style="flex:1"><b>${C.name}</b><div class="small muted">${C.role}</div></div></div>
    <div class="small" style="margin:4px 0">${C.blurb}</div><ul class="small muted" style="margin:0;padding-left:16px">${C.perks.map(p => `<li>${p}</li>`).join("")}</ul>${compProgressHTML(id)}
    <div style="margin-top:6px">${G.companion === id ? `<span class="small" style="color:#6fcf6a">Travelling with you</span>` : `<button onclick="G.companion='${id}';refreshPanel()">Bring along</button>`}</div></div>`).join("");
  const hRank = G.hpUps || 0;
  const hCost = hpUpgradeCost();
  const canAffordHp = canAfford(hCost);
  const hpCampCard = `<div class="card" style="border-color:#ff6b6b55;background:#1a0909"><div class="row">${iconHTML(ICON.hp, 32)}<div style="flex:1"><b>Heartwood Infusion (Rank ${hRank})</b><div class="small muted">Reinforce bark-flesh to expand max health (+2 HP). Max HP: ${maxHp()}.</div></div></div>
    <div style="margin-top:6px"><button ${canAffordHp ? "" : "disabled"} onclick="upgradeHp()">Upgrade Health — ${costHTML(hCost)}</button></div></div>`;
  const rank = G.staminaUps || 0;
  const sCost = staminaUpgradeCost();
  const canAffordSta = canAfford(sCost);
  const staCampCard = `<div class="card" style="border-color:#5fb3ff55;background:#09121a"><div class="row">${iconHTML(ICON.stamina, 32)}<div style="flex:1"><b>Spore-Lung Conditioning (Rank ${rank})</b><div class="small muted">Expand sprint and combat breath reserves. Sprint: ${maxWorldStamina()} · Combat: ${maxStamina()}.</div></div></div>
    <div style="margin-top:6px"><button ${canAffordSta ? "" : "disabled"} onclick="upgradeStamina()">Upgrade Stamina — ${costHTML(sCost)}</button></div></div>`;
  const ups = Object.entries(UPGRADES).map(([id, U]) => `<div class="card"><div class="row">${iconHTML(U.icon, 32)}<div style="flex:1"><b>${U.name}</b><div class="small muted">${U.desc}</div></div></div>
    <div style="margin-top:6px">${G.upgrades[id] ? `<span class="small" style="color:#6fcf6a">Built</span>` : `<button ${canAfford(U.cost) ? "" : "disabled"} onclick="build('${id}')">Build — ${costHTML(U.cost)}</button>`}</div></div>`).join("");
  const breed = G.upgrades.greenhouse ? BREED.map(([gid, cost]) => { const g = GRAFTS[gid], own = G.owned.includes(gid);
    return `<button style="justify-content:flex-start;text-align:left" ${own || !canAfford(cost) ? "disabled" : ""} onclick="breedGraft('${gid}')">${iconHTML(g.icon, 24)}<span><b>${g.name}</b><br><span class="small muted">${own ? "Already cultivated" : costHTML(cost)}</span></span></button>`; }).join("") : `<div class="small muted">Build the Apothecary Greenhouse to breed grafts.</div>`;
  const refine = G.upgrades.refinery ? refineryRecipes().map(([k, c]) => `<button ${canAfford(c) ? "" : "disabled"} onclick="refine('${k}')">${iconHTML(ICON[k], 20)}${RES_NAMES[k]} — ${costHTML(c)}</button>`).join(" ") : `<div class="small muted">Build the Sap-Refinery to craft bombs and tonics.</div>`;
  return `${panelTabsHTML("camp")}
    <div class="row">${tileHTML("tent", 0.5)}<div><h2>The Strider-Caravan</h2><div class="small muted">Your rolling home on the canopy highways.</div></div></div>
    <div class="row" style="margin-top:8px"><button ${G.res.potions < 1 || G.hp >= maxHp() ? "disabled" : ""} onclick="G.res.potions--;G.hp=Math.min(maxHp(),G.hp+4);refreshPanel()">${iconHTML(ICON.potions, 20)}Drink Sap Tonic (+4 HP)</button>
    ${G.upgrades.greenhouse ? `<button onclick="openPanel(loadoutPanel)">${iconHTML(IC(15,7), 20)}Re-weave grafts</button>` : ""}</div>
    <h3>Companions</h3><div class="grid">${comps}</div><h3>Upgrades</h3><div class="grid">${ups}${hpCampCard}${staCampCard}</div><h3>Greenhouse breeding</h3><div class="grid">${breed}</div><h3>Refinery</h3><div class="row">${refine}</div>`;
}
function build(id) { const U = UPGRADES[id]; if (!canAfford(U.cost)) return; pay(U.cost); G.upgrades[id] = true; toast(`Built: ${U.name}`, "#9ad04a"); refreshPanel(); }
function breedGraft(gid) { const c = BREED.find(b => b[0] === gid)[1]; if (!canAfford(c)) return; pay(c); G.owned.push(gid); toast(`Bred: ${GRAFTS[gid].name}`, "#9ad04a"); refreshPanel(); }
function refine(k) { const c = refineryRecipes().find(r => r[0] === k)[1]; if (!canAfford(c)) return; pay(c); G.res[k]++; refreshPanel(); }
function invPanel() {
  const res = Object.keys(RES_NAMES).map(k => `<span class="row" style="gap:4px">${iconHTML(ICON[k], 22)}${RES_NAMES[k]}: <b>${G.res[k]}</b></span>`).join("");
  return `${panelTabsHTML("inv")}
    <div class="row">${charHTML(CHAR.player, 3)}<div><h2>Graftwarden</h2><div class="small muted">HP ${Math.ceil(G.hp)}/${maxHp()} · Ricochet damage ${baseDmg()} · Day ${G.day} (${PHASES[G.phase]}) · Root Echoes ${G.echoes.length}/3</div></div></div>
    <h3>Level &amp; Growth</h3>${statsHTML()}
    <h3>Grafts</h3>${symbMeterHTML()}<div style="margin-top:6px">${slotsHTML(false)}</div>
    <div class="small muted" style="margin-top:4px">Re-weave grafts with a Root-Singer Elder (Twilight Trunk, Silt-Floor) or at camp once the Greenhouse is built. Owned: ${G.owned.map(id => GRAFTS[id].name).join(", ")}</div>
    <h3>Blade</h3><div class="card row">${iconHTML(sword().icon, 32)}<div style="flex:1"><b style="color:${sword().col}">${sword().name}</b> <span class="tag">${sword().style}</span><div class="small muted">${sword().perk}</div><div class="small">Parts: ${Object.entries(G.arms.slots).map(([s, id]) => id ? PARTS[id].name : `<span class="muted">no ${s}</span>`).join(" · ")}${swordBio() ? ` · <span style="color:#7fd26a">Bio-Graft ${swordBio()}</span>` : ""}${swordTech() ? ` · <span style="color:#ffb35a">Tech-Forge ${swordTech()}</span>` : ""}</div></div>${typeof isAtCamp === "function" && isAtCamp() ? `<button onclick="openPanel(armoryPanel)">Armory Workbench</button>` : `<button disabled title="Only accessible at the Strider-Caravan workbench at camp">Workbench (At Camp)</button>`}</div>
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
  return `${panelTabsHTML("pulse")}
    <h2>The Pulse</h2><div class="small muted">Living heatmap of each region's ecological balance. Every day each region drifts toward crimson. ${G.upgrades.mast || G.companion === "sylva" ? "▼ shows tomorrow's expected loss." : "Build a Signal-Mast (or travel with Sylva) to see the forecast."}</div>
    <canvas id="pulsec" width="960" height="620" style="width:100%;margin-top:8px;image-rendering:pixelated"></canvas>
    <div class="row small" style="margin-top:6px"><span style="color:#6fcf6a">■ Balanced ≥60</span><span style="color:#e8cf4a">■ Depleted 30–59</span><span style="color:#e0473f">■ Enraged &lt;30 (Apex Warden)</span><span style="color:#ff6b6b">🔒 Locked (Level requirement)</span><span class="muted">· Press M, Tab, or Esc to close</span></div>`;
}
function drawPulse() {
  const c = document.getElementById("pulsec"); if (!c) return;
  const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
  if (!pulseBg) pulseBg = buildPulseBg();
  if (pulseBg) x.drawImage(pulseBg, 0, 0); else { x.fillStyle = "#1b2a1f"; x.fillRect(0, 0, 960, 620); }
  const lbl = (s, px, py, col, font) => { x.font = font; x.textAlign = "center"; x.lineWidth = 4; x.strokeStyle = "#000"; x.strokeText(s, px, py); x.fillStyle = col; x.fillText(s, px, py); };
  for (const id in REGIONS) { const st = status(G.regions[id].bal), [px, py] = REGIONS[id].pos, col = STATUS_COLOR[st];
    const rg = x.createRadialGradient(px, py, 10, px, py, 125); rg.addColorStop(0, col + "66"); rg.addColorStop(1, col + "00"); x.fillStyle = rg; x.beginPath(); x.arc(px, py, 125, 0, 7); x.fill(); }
  {
    const [px, py] = ROOTS.pos;
    const reqLvl = (typeof REGION_REQ_LVL !== "undefined" && REGION_REQ_LVL.roots) || 8;
    const pLvl = (G && G.lvl) || 1;
    const lvlLock = pLvl < reqLvl;
    const echoLock = G.echoes.length < 3;
    const open = !lvlLock && !echoLock;
    t32(x, "door", px - 14, py - 52, 1, open ? 1 : 0.6);
    if (!open) icon32(x, ICON.lock, px + 8, py - 24, 24);
    lbl(ROOTS.name + (open ? "" : lvlLock ? ` [🔒 Lv ${reqLvl}]` : ` (${G.echoes.length}/3 echoes)`), px, py + 18, open ? "#d9c9f5" : "#ff7a7a", "15px 'Pixelify Sans'");
  }
  for (const id in REGIONS) {
    const R = REGIONS[id], r = G.regions[id], st = status(r.bal), [px, py] = R.pos;
    const reqLvl = (typeof REGION_REQ_LVL !== "undefined" && REGION_REQ_LVL[id]) || 1;
    const pLvl = (G && G.lvl) || 1;
    const isLocked = pLvl < reqLvl;
    x.fillStyle = isLocked ? "#150a0acc" : "#0b100dcc";
    x.strokeStyle = isLocked ? "#ff5555" : STATUS_COLOR[st];
    x.lineWidth = 3;
    x.beginPath(); x.arc(px, py, 30, 0, 7); x.fill(); x.stroke();
    icon32(x, R.icon, px - 20, py - 20, 40);
    if (isLocked) icon32(x, ICON.lock, px - 12, py - 46, 24);
    lbl(R.name + (isLocked ? ` [🔒 Lv ${reqLvl}]` : ""), px, py + 50, isLocked ? "#ff9a9a" : "#f6f0dc", "16px 'Pixelify Sans'");
    lbl(isLocked ? `LOCKED · Requires Lv ${reqLvl}` : `${STATUS_LABEL[st]} · ${r.bal}${G.upgrades.mast || G.companion === "sylva" ? `  ▼${G.drift[id]}` : ""}`, px, py + 66, isLocked ? "#ff6b6b" : STATUS_COLOR[st], "13px 'Pixelify Sans'");
    if (r.warden) icon32(x, ICON.warden, px + 22, py - 44, 28);
    if (r.echo) icon32(x, ICON.echo, px - 50, py - 44, 24);
  }
  const here = AREA(G.loc).pos, im = img(charPath(CHAR.player));
  if (ok(im)) x.drawImage(im, 16, 0, 16, 20, here[0] + 34, here[1] - 40, 32, 40);
  lbl("YOU", here[0] + 50, here[1] - 44, "#ffe46a", "12px 'Pixelify Sans'");
}

function settingsPanel() {
  const fs = isFullscreen();
  const cats = ["Movement", "Interactions", "Combat", "Menus", "Display", "Audio"];

  const catHTML = cats.map(cat => {
    const list = BINDING_ACTIONS.filter(a => a.category === cat);
    const rows = list.map(a => {
      const isRebinding = rebindingAction === a.id;
      const curKey = (BINDINGS[a.id] && BINDINGS[a.id][0]) || "";
      const label = isRebinding ? `<span style="color:#ffe46a">Press any key... (Esc to cancel)</span>` : `<kbd style="font-size:13px;padding:3px 8px;background:#222">${keyLabel(curKey)}</kbd>`;
      return `<div class="row" style="justify-content:space-between;padding:6px 10px;background:#111;border:1px solid #333;border-radius:3px;margin-bottom:4px">
        <span style="font-size:13px"><b>${a.label}</b></span>
        <button style="${isRebinding ? "border-color:var(--amber);background:#332912" : ""}" onclick="startRebind('${a.id}')">${label}</button>
      </div>`;
    }).join("");

    return `<div style="margin-bottom:12px">
      <div style="font-size:14px;color:var(--amber);font-weight:600;margin-bottom:6px">${cat}</div>
      ${rows}
    </div>`;
  }).join("");

  return `${panelTabsHTML("settings")}
    <div class="row" style="justify-content:space-between;margin-bottom:10px">
      <div>
        <h2>Settings &amp; Controls</h2>
        <div class="small muted">Configure display options and customize your keyboard controls.</div>
      </div>
    </div>

    <!-- DISPLAY / FULLSCREEN -->
    <div class="card" style="margin-bottom:14px">
      <div style="font-size:15px;font-weight:600;color:var(--amber);margin-bottom:6px">Screen &amp; Display</div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <b>Fullscreen Mode</b>
          <div class="small muted">Scale the game to fill your entire display. Shortcut: <kbd>${keyLabel((BINDINGS.fullscreen && BINDINGS.fullscreen[0]) || "f11")}</kbd></div>
        </div>
        <button id="fs-btn" class="pri" style="font-size:14px;padding:6px 14px" onclick="toggleFullscreen();setTimeout(refreshPanel,60)">
          ${fs ? "✕ Exit Fullscreen" : "⛶ Enter Fullscreen"}
        </button>
      </div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <b>Clean Screen Mode (Hide All UI)</b>
          <div class="small muted">Temporarily hide all HUD boxes, menus, and helpers for an uncluttered cinematic view. Shortcut: <kbd>${keyLabel((BINDINGS.toggleui && BINDINGS.toggleui[0]) || "u")}</kbd></div>
        </div>
        <button onclick="toggleAllUI();refreshPanel()">
          ${uiGlobalHidden ? "👁 Restore All UI [U]" : "👁 Clean Screen [U]"}
        </button>
      </div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <b>Top Menu Bar</b>
          <div class="small muted">Quick navigation buttons at top center. Click [▲ Hide] or [☰ Menu ▾] on screen anytime.</div>
        </div>
        <button onclick="toggleTopBar(${G && G.hideTopBar ? 'true' : 'false'});refreshPanel()">
          ${G && G.hideTopBar ? "☰ Expand Top Bar" : "▲ Collapse Top Bar"}
        </button>
      </div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <b>Player Status Box (Top-Left)</b>
          <div class="small muted">Health, stamina, level, and ecosystem meters. Click [—] / [＋] directly on HUD to collapse/expand.</div>
        </div>
        <button onclick="toggleHudL(${G && G.hudLCollapsed ? 'false' : 'true'});refreshPanel()">
          ${G && G.hudLCollapsed ? "＋ Expand Status" : "— Collapse Status"}
        </button>
      </div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <b>Resources Bar (Top-Right)</b>
          <div class="small muted">All 10 inventory resource counters. Click [—] / [＋] directly on HUD to collapse/expand.</div>
        </div>
        <button onclick="toggleHudR(${G && G.hudRCollapsed ? 'false' : 'true'});refreshPanel()">
          ${G && G.hudRCollapsed ? "＋ Expand Resources" : "— Collapse Resources"}
        </button>
      </div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <b>Quest Tracker (On Screen)</b>
          <div class="small muted">Track active objectives and Root Echoes on screen while playing. Click [—] / [＋] to collapse/expand.</div>
        </div>
        <button onclick="toggleQuestTracker(${G && G.questTrackerCollapsed ? 'false' : 'true'});refreshPanel()">
          ${G && G.questTrackerCollapsed ? "＋ Expand Quest Tracker" : "— Collapse Quest Tracker"}
        </button>
      </div>
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <b>Controls Helper Bar (Bottom-Left)</b>
          <div class="small muted">Key shortcuts helper in bottom-left. Click [✕] or [⌨ Controls ▴] to collapse/expand anytime.</div>
        </div>
        <button onclick="toggleKeysBar(${G && G.hideKeys ? 'true' : 'false'});refreshPanel()">
          ${G && G.hideKeys ? "⌨ Expand Controls" : "✕ Collapse Controls"}
        </button>
      </div>
      <div class="row" style="justify-content:space-between;align-items:center">
        <div>
          <b>Silt Flashlight</b>
          <div class="small muted">Toggle halogen beam to pierce darkness in the Silt-Floor, Iron Roots, and night. Shortcut: <kbd>${keyLabel((BINDINGS.flashlight && BINDINGS.flashlight[0]) || "g")}</kbd></div>
        </div>
        <button onclick="toggleFlashlight();refreshPanel()">
          ${G && G.flashlight !== false ? "🔦 Flashlight: ON" : "Flashlight: OFF"}
        </button>
      </div>
    </div>

    <!-- AMBIENT MUSIC & AUDIO -->
    <div class="card" style="margin-bottom:14px">
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-size:15px;font-weight:600;color:var(--amber)">🎵 Ambient Music &amp; Audio</div>
        <div class="small muted">6 Fantasy Ambient Tracks by AlkaKrab</div>
      </div>

      <!-- Current Track & Mute -->
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px;padding:8px 10px;background:#111;border:1px solid #333;border-radius:3px">
        <div>
          <div><b>Status:</b> ${typeof isMusicMuted === "function" && isMusicMuted() ? '<span style="color:#ff6b6b">🔇 Muted</span>' : '<span style="color:#6fcf6a">🎵 Playing</span>'} · <b>Now Playing:</b> <span style="color:#ffe46a">${typeof getCurrentTrackInfo === "function" ? getCurrentTrackInfo().title : "Ambient"}</span> <span class="tag">${typeof getCurrentTrackInfo === "function" ? getCurrentTrackInfo().environment : ""}</span></div>
          <div class="small muted" style="margin-top:2px">${typeof getCurrentTrackInfo === "function" ? getCurrentTrackInfo().desc : ""}</div>
        </div>
        <div class="row" style="gap:6px">
          ${typeof getPreviewTrackId === "function" && getPreviewTrackId() ? '<button onclick="clearPreview()" title="Resume automatic environment soundtrack">↺ Auto Mode</button>' : ''}
          <button class="${typeof isMusicMuted === "function" && isMusicMuted() ? '' : 'pri'}" onclick="toggleMusicMute();refreshPanel()">
            ${typeof isMusicMuted === "function" && isMusicMuted() ? '🔇 Unmute Music [N]' : '🎵 Mute Music [N]'}
          </button>
        </div>
      </div>

      <!-- Volume Slider -->
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px;padding:8px 10px;background:#111;border:1px solid #333;border-radius:3px">
        <div>
          <b>Music Volume:</b> <span id="vol-pct" style="color:var(--amber);font-weight:600">${typeof getMusicVolume === "function" ? Math.round(getMusicVolume() * 100) : 65}%</span>
          <div class="small muted">Dynamic ambient crossfading adapts seamlessly between biomes and encounters.</div>
        </div>
        <div class="row" style="gap:8px">
          <input type="range" min="0" max="100" value="${typeof getMusicVolume === "function" ? Math.round(getMusicVolume() * 100) : 65}" style="width:140px;cursor:pointer"
            oninput="if(typeof setMusicVolume==='function') setMusicVolume(this.value / 100);document.getElementById('vol-pct').innerText = this.value + '%'">
        </div>
      </div>

      <!-- Biome Soundtracks & Previews -->
      <div style="font-size:13px;font-weight:600;color:var(--amber);margin:10px 0 6px">Environment Soundtracks &amp; Soundboard</div>
      <div class="grid" style="grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:6px">
        ${typeof MUSIC_TRACKS !== "undefined" ? Object.values(MUSIC_TRACKS).map(tr => {
          const curInfo = typeof getCurrentTrackInfo === "function" ? getCurrentTrackInfo() : null;
          const isCur = curInfo && curInfo.id === tr.id;
          const isMuted = typeof isMusicMuted === "function" && isMusicMuted();
          return `<div class="card ${isCur ? 'on' : ''}" style="padding:6px 10px;background:#0d0d0d">
            <div class="row" style="justify-content:space-between;align-items:center">
              <div>
                <b style="color:${isCur ? '#ffe46a' : '#ddd'};font-size:13px">${tr.title}</b>
                <div class="small muted">🌍 ${tr.environment}</div>
              </div>
              <button style="font-size:11px;padding:2px 7px" onclick="previewTrack('${tr.id}')">
                ${isCur && !isMuted ? '▶ Active' : '▷ Audition'}
              </button>
            </div>
          </div>`;
        }).join('') : ''}
      </div>
    </div>

    <!-- CONTROLS & KEYBINDINGS -->
    <div class="card">
      <div class="row" style="justify-content:space-between;margin-bottom:8px">
        <div style="font-size:15px;font-weight:600;color:var(--amber)">Controls &amp; Keybindings</div>
        <button onclick="resetBindings();refreshPanel()" title="Restore default key controls">↺ Reset to Defaults</button>
      </div>
      <div class="small muted" style="margin-bottom:12px">Click any key button below to change it. Press your new key on the keyboard, or <kbd>Esc</kbd> to cancel.</div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px">
        ${catHTML}
      </div>
    </div>
  `;
}

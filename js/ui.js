function toast(html, col) {
  const d = document.createElement("div");
  d.innerHTML = html;
  d.title = "Click to close";
  d.style.cursor = "pointer";
  if (col) d.style.color = col;
  d.onclick = () => d.remove();
  document.getElementById("toast").appendChild(d);
  setTimeout(() => d.remove(), 3300);
}
let DLG = null;
function say(lines, opt = {}) { DLG = { lines: [].concat(lines), i: 0, shown: 0, opt, sel: 0, _openTime: performance.now() }; drawDialog(); document.getElementById("dialog").classList.remove("hidden"); }
function dlgOptions() { return DLG && DLG.i === DLG.lines.length - 1 && DLG.shown >= DLG.lines[DLG.i].length ? (DLG.opt.options || []) : []; }
function drawDialog() {
  if (!DLG) return;
  const el = document.getElementById("dialog"), o = DLG.opt, line = DLG.lines[DLG.i];
  const opts = dlgOptions();
  if (DLG.sel >= opts.length) DLG.sel = 0;
  el.innerHTML = `<button class="dlg-x" onclick="event.stopPropagation();closeDialog()" title="Close dialog (Esc)">✕ Esc</button>
    <div class="por">${o.char != null ? charHTML(o.char, 4) : o.icon != null ? iconHTML(o.icon, 56) : ""}</div>
    <div style="flex:1"><div class="nm">${o.name ? esc(o.name) : ""}</div><div class="tx">${esc(line.slice(0, Math.floor(DLG.shown)))}</div>
    <div class="opts">${opts.map((op, i) => `<div class="opt ${i === DLG.sel ? "sel" : ""} ${op.disabled ? "dis" : ""}" data-i="${i}">${esc(op.label)}${op.disabled ? ` <span class="small">(${esc(op.disabled)})</span>` : ""}</div>`).join("")}</div></div>
    ${!opts.length && DLG.shown >= line.length ? `<div class="more">▼</div>` : ""}`;
  el.querySelectorAll(".opt").forEach(d => { d.onclick = ev => { ev.stopPropagation(); DLG.sel = +d.dataset.i; chooseOpt(); }; d.onmouseenter = () => { if (DLG && DLG.sel !== +d.dataset.i) { DLG.sel = +d.dataset.i; drawDialog(); } }; });
}
document.getElementById("dialog").addEventListener("click", e => { if (!e.target.closest(".opt") && !e.target.closest(".dlg-x")) advanceDialog(); });
document.addEventListener("click", e => {
  if (DLG && DLG._openTime && (performance.now() - DLG._openTime > 150)) {
    if (!e.target.closest("#dialog") && !e.target.closest("#prompt")) {
      closeDialog();
    }
  }
});
function advanceDialog() {
  if (!DLG) return;
  const line = DLG.lines[DLG.i];
  if (DLG.shown < line.length) { DLG.shown = line.length; return drawDialog(); }
  if (DLG.i < DLG.lines.length - 1) { DLG.i++; DLG.shown = 0; return drawDialog(); }
  if ((DLG.opt.options || []).length) return;
  closeDialog();
}
function closeDialog() { const cb = DLG && DLG.opt.onClose; DLG = null; document.getElementById("dialog").classList.add("hidden"); if (cb) cb(); }
function chooseOpt() {
  const op = dlgOptions()[DLG.sel]; if (!op || op.disabled) return;
  DLG = null; document.getElementById("dialog").classList.add("hidden");
  if (op.fn) op.fn();
}
function tickDialog(dt) {
  if (!DLG) return; const line = DLG.lines[DLG.i];
  if (DLG.shown < line.length) { DLG.shown = Math.min(line.length, DLG.shown + dt * 55); drawDialog(); }
}
let panelOpen = false, panelRender = null;
function canAccessPanel(render) {
  if (!render) return { allowed:true };
  if (render === settingsPanel || (typeof tutorialPanel !== "undefined" && render === tutorialPanel) || render === invPanel || render === pulsePanel) return { allowed:true };
  if (typeof tutGrowthPanel !== "undefined" && render === tutGrowthPanel) return { allowed:true };
  if (typeof tutLoadoutPanel !== "undefined" && render === tutLoadoutPanel) return { allowed:true };
  const atCamp = typeof isAtCamp === "function" && isAtCamp();
  if (typeof campPanel !== "undefined" && render === campPanel) {
    if (!atCamp) return { allowed:false, reason:"The Strider-Caravan menu can only be accessed at your camp!" };
    return { allowed:true };
  }
  if (typeof armoryPanel !== "undefined" && render === armoryPanel) {
    if (!atCamp) return { allowed:false, reason:"The Workbench & Armory can only be accessed at the Strider-Caravan camp!" };
    return { allowed:true };
  }
  if (typeof questsPanel !== "undefined" && render === questsPanel) {
    const nearVael = (typeof isNearNPC === "function" && isNearNPC("questGiver")) || atCamp;
    if (!nearVael) return { allowed:false, reason:"Quests & Chronicle are only accessible from Chronicle-Keeper Vael at camp!" };
    return { allowed:true };
  }
  if (typeof shopPanel !== "undefined" && render === shopPanel) {
    const nearShop = typeof isNearNPC === "function" && isNearNPC("merchant");
    if (!nearShop) return { allowed:false, reason:"The Shop can only be accessed by speaking directly with a Merchant!" };
    return { allowed:true };
  }
  if (typeof loadoutPanel !== "undefined" && render === loadoutPanel) {
    const nearElder = typeof isNearNPC === "function" && isNearNPC("elder");
    const hasGreenhouse = atCamp && G && G.upgrades && G.upgrades.greenhouse;
    if (!nearElder && !hasGreenhouse) {
      return { allowed:false, reason:"Graft re-weaving can only be performed at a Root-Singer Elder or Caravan Greenhouse!" };
    }
    return { allowed:true };
  }
  return { allowed:true };
}
function openPanel(render) {
  const check = canAccessPanel(render);
  if (!check.allowed) {
    toast(`🔒 ${check.reason}`, "#ff6b6b");
    return;
  }
  panelRender = render;
  panelOpen = true;
  document.getElementById("panel").classList.remove("hidden");
  refreshPanel();
}
function refreshPanel() {
  if (!panelOpen) return;
  document.getElementById("pbox").innerHTML = `
    <button class="x panel-top-close-btn" onclick="closePanel()" title="Close panel (Esc)">✕ Close [Esc]</button>
  ` + panelRender() + `
    <div class="panel-bottom-bar" style="margin-top:20px;padding-top:12px;border-top:1px solid #333;display:flex;justify-content:center">
      <button class="panel-footer-close-btn" onclick="closePanel()" title="Close panel (Esc)">✕ Close Window [Esc]</button>
    </div>
  `;
  renderHud();
}
function closePanel() {
  const was = panelRender;
  panelOpen = false;
  panelRender = null;
  const p = document.getElementById("panel");
  if (p) p.classList.add("hidden");
  save();
  if (typeof onPanelClosed === "function") onPanelClosed(was);
}
document.getElementById("panel").addEventListener("click", e => { if (e.target.id === "panel") closePanel(); });

var uiGlobalHidden = false;
function toggleTopBar(show) { if (!G) G = {}; G.hideTopBar = typeof show === "boolean" ? !show : !G.hideTopBar; renderHud(); save(); }
function toggleKeysBar(show) { if (!G) G = {}; G.hideKeys = typeof show === "boolean" ? !show : !G.hideKeys; renderHud(); save(); }
function toggleHudVisible(show) { if (!G) G = {}; G.hideHud = typeof show === "boolean" ? !show : !G.hideHud; renderHud(); save(); }
function toggleHudL(force) { if (!G) G = {}; G.hudLCollapsed = typeof force === "boolean" ? force : !G.hudLCollapsed; renderHud(); save(); }
function toggleHudR(force) { if (!G) G = {}; G.hudRCollapsed = typeof force === "boolean" ? force : !G.hudRCollapsed; renderHud(); save(); }
function toggleQuestTracker(force) { if (!G) G = {}; G.questTrackerCollapsed = typeof force === "boolean" ? force : !G.questTrackerCollapsed; renderHud(); save(); }
function toggleAllUI(force) {
  uiGlobalHidden = typeof force === "boolean" ? force : !uiGlobalHidden;
  renderHud();
  if (uiGlobalHidden) {
    toast("👁 Clean Screen: UI Hidden. Click [Show UI] or press [U] to restore.", "#ffe46a");
  } else {
    toast("👁 UI Restored.", "#6fcf6a");
  }
}
function toggleFlashlight() {
  if (!G) return;
  G.flashlight = G.flashlight === false ? true : false;
  renderHud();
  save();
  toast(G.flashlight ? "🔦 Silt Flashlight ON" : "Flashlight OFF", G.flashlight ? "#ffe46a" : "#aaa");
}

const uiOpen = () => !!DLG || panelOpen || fade.a > 0.6;
function onKeyUI(k) {
  if (isActionKey("fullscreen", k)) { toggleFullscreen(); pressed[k] = false; return; }
  if (isActionKey("toggleui", k)) { toggleAllUI(); pressed[k] = false; return; }
  if (isActionKey("flashlight", k) || k === "g" || k === "l") {
    if (mode === "world" || mode === "encounter") {
      toggleFlashlight();
      pressed[k] = false;
      return;
    }
  }
  if (panelOpen) {
    if (k === "escape" ||
        ((isActionKey("pack", k) || k === "tab") && panelRender === invPanel) ||
        (isActionKey("quests", k) && panelRender === questsPanel) ||
        (isActionKey("pulse", k) && panelRender === pulsePanel) ||
        (isActionKey("settings", k) && panelRender === settingsPanel)) {
      closePanel();
    } else if (isActionKey("quests", k)) {
      openPanel(questsPanel);
    } else if (isActionKey("pack", k) || k === "tab") {
      openPanel(invPanel);
    } else if (isActionKey("pulse", k)) {
      openPanel(pulsePanel);
    } else if (isActionKey("settings", k)) {
      openPanel(settingsPanel);
    }
    pressed[k] = false;
    return;
  }
  if (mode === "title" || mode === "ending") return;
  if (DLG) {
    if (k === "escape") { closeDialog(); pressed[k] = false; return; }
    const opts = dlgOptions();
    if (opts.length && (k === "arrowup" || isActionKey("up", k))) { DLG.sel = (DLG.sel + opts.length - 1) % opts.length; drawDialog(); }
    else if (opts.length && (k === "arrowdown" || isActionKey("down", k))) { DLG.sel = (DLG.sel + 1) % opts.length; drawDialog(); }
    else if (["enter", " ", "z"].includes(k) || isActionKey("interact", k)) { if (opts.length) chooseOpt(); else advanceDialog(); }
    pressed[k] = false;
    return;
  }
  if (mode === "world") {
    if (k === "escape") { openPanel(settingsPanel); pressed[k] = false; }
    else if (isActionKey("quests", k)) { openPanel(questsPanel); pressed[k] = false; }
    else if (isActionKey("pulse", k)) { openPanel(pulsePanel); pressed[k] = false; }
    else if (isActionKey("pack", k) || k === "tab") { openPanel(invPanel); pressed[k] = false; }
    else if (isActionKey("settings", k)) { openPanel(settingsPanel); pressed[k] = false; }
  }
  if (mode === "encounter" && E) encKey(k);
}
let hudT = 0;
function renderHud() {
  const show = mode === "world" && !uiGlobalHidden;
  const showHud = show && !G?.hideHud;
  const hudEl = document.getElementById("hud");
  if (hudEl) hudEl.classList.toggle("hidden", !showHud);

  const showKeys = show && !G?.hideKeys;
  const kb = document.getElementById("keys");
  if (kb) kb.classList.toggle("hidden", !showKeys);
  const keb = document.getElementById("keys-expand-btn");
  if (keb) keb.classList.toggle("hidden", !show || showKeys);

  const showTop = show && !G?.hideTopBar;
  const tb = document.getElementById("top-bar"); if (tb) tb.classList.toggle("hidden", !showTop);
  const otb = document.getElementById("open-top-btn"); if (otb) otb.classList.toggle("hidden", !show || showTop);
  const sb = document.getElementById("settings-btn"); if (sb) sb.classList.toggle("hidden", !show);
  const urb = document.getElementById("ui-restore-btn"); if (urb) urb.classList.toggle("hidden", mode !== "world" || !uiGlobalHidden);
  const invBtn = document.getElementById("inv-btn"); if (invBtn) invBtn.title = `Inventory (${keyLabel(BINDINGS.pack[0])})`;

  const fb = document.getElementById("flash-btn");
  if (fb) {
    const isDark = G && (G.loc === "silt" || G.loc === "roots" || G.phase === 3);
    fb.classList.toggle("hidden", !isDark);
    const flashOn = G && G.flashlight !== false;
    fb.style.borderColor = flashOn ? "var(--amber)" : "#555";
    fb.style.color = flashOn ? "#ffe46a" : "var(--muted)";
    const fK = keyLabel((BINDINGS.flashlight && BINDINGS.flashlight[0]) || "g");
    fb.innerHTML = `🔦 ${flashOn ? "Light ON" : "Light OFF"} [${fK}]`;
  }

  if (!show || !G) return;
  const A = AREA(G.loc), r = G.regions[G.loc];
  const st = r ? status(r.bal) : null;
  const maxS = typeof maxWorldStamina === "function" ? maxWorldStamina() : 100;
  const curS = typeof worldStamina === "number" ? worldStamina : maxS;
  const staPct = Math.max(0, Math.min(100, Math.round(curS / maxS * 100)));
  const isEx = typeof worldStaExhausted !== "undefined" && worldStaExhausted;
  const staCol = isEx ? "#e0473f" : (staPct < 25 ? "#f1a340" : "#5fb3ff");

  // Left HUD (Status) - Collapsible
  const hl = document.getElementById("hudL");
  if (hl) {
    if (G.hudLCollapsed) {
      hl.className = "box collapsed";
      hl.title = "Click to expand status";
      hl.onclick = () => toggleHudL(false);
      hl.innerHTML = `<span>${iconHTML(ICON.hp, 16)} <b style="color:#ff6b6b">${Math.ceil(G.hp)}</b>/${maxHp()}</span>
        <span style="margin-left:4px">${iconHTML(ICON.stamina, 16)} <b id="hud-sta-txt" style="color:${staCol}">${Math.ceil(curS)}</b>/${maxS}<span id="hud-sta-fill" style="display:none"></span></span>
        <span class="muted">· ${A.name}</span>
        <button class="hud-mini-btn" onclick="event.stopPropagation();toggleHudL(false)" title="Expand status (＋)">＋</button>`;
    } else {
      hl.className = "box";
      hl.title = "";
      hl.onclick = null;
      hl.innerHTML = `<div class="hud-header">
        <div class="row" style="gap:6px">${iconHTML(ICON.hp, 18)}<div class="bar"><i style="width:${G.hp / maxHp() * 100}%;background:#e0473f"></i></div><span class="small">${Math.ceil(G.hp)}/${maxHp()}</span> <span class="small" style="color:#ffe46a">Lv ${G.lvl || 1}</span><div class="bar" style="width:50px"><i style="width:${G.lvl >= MAX_LVL ? 100 : (G.xp || 0) / xpToNext(G.lvl || 1) * 100}%;background:#b48be8"></i></div>${G.gp ? `<span class="small" style="color:#ffe46a">+${G.gp} GP</span>` : ""}</div>
        <button class="hud-mini-btn" onclick="toggleHudL(true)" title="Collapse status (—)">—</button>
      </div>
      <div class="row" style="gap:6px;margin-top:2px">${iconHTML(ICON.stamina, 18)}<div class="bar"><i id="hud-sta-fill" style="width:${staPct}%;background:${staCol}"></i></div><span id="hud-sta-txt" class="small">${Math.ceil(curS)}/${maxS}</span></div>
      <div class="small" style="margin-top:2px">${iconHTML(A.icon, 16)} ${A.name} ${st ? `<span class="chip ${st}">${STATUS_LABEL[st]} ${r.bal}</span>` : ""}</div>
      <div class="small muted">Day ${G.day} · ${PHASES[G.phase]} · ${iconHTML(ICON.echo, 14)} ${G.echoes.length}/3 · Symbiosis <span style="color:${overgrown() ? "#e0473f" : "#9ad04a"}">${symbiosis()}/${SYMB_CAP}</span></div>`;
    }
  }

  // Quest Tracker HUD (Left side under Status) - Collapsible
  const hq = document.getElementById("hudQuest");
  if (hq) {
    if (G.hideQuestTracker) {
      hq.classList.add("hidden");
    } else {
      hq.classList.remove("hidden");
      const prog = typeof computeQuestProgress === "function" ? computeQuestProgress(G) : { pct: 0, currentGoal: "Explore the canopy" };
      const echoes = G.echoes || [];
      const rootsUnlocked = echoes.length >= 3;

      if (G.questTrackerCollapsed) {
        hq.className = "box collapsed quest-tracker";
        hq.title = "Click to expand quest tracker";
        hq.onclick = () => toggleQuestTracker(false);
        hq.innerHTML = `<span>${iconHTML(ICON.echo, 14)} <b style="color:var(--amber)">Quest:</b> <span class="small" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${prog.currentGoal}</span> <span class="chip balanced" style="font-size:10px;padding:0 4px">${prog.pct}%</span></span>
          <button class="hud-mini-btn" onclick="event.stopPropagation();toggleQuestTracker(false)" title="Expand quest tracker (＋)">＋</button>`;
      } else {
        hq.className = "box quest-tracker";
        hq.title = "";
        hq.onclick = null;

        const echoSteps = [
          { name: "Sun-Crown Echo (Lv 2+)", done: echoes.includes("sun") || !!(G.regions && G.regions.sun && G.regions.sun.echo) },
          { name: "Twilight Trunk Echo", done: echoes.includes("trunk") || !!(G.regions && G.regions.trunk && G.regions.trunk.echo) },
          { name: "Silt-Floor Echo / Vault (Lv 5+)", done: echoes.includes("silt") || !!(G.regions && G.regions.silt && (G.regions.silt.echo || G.regions.silt.bunker)) },
          { name: "Glass-Marsh Echo / Vault (Lv 3+)", done: echoes.includes("glass") || !!(G.regions && G.regions.glass && (G.regions.glass.echo || G.regions.glass.bunker)) },
        ];

        const stepsHtml = echoSteps.map(s => `
          <div class="quest-tracker-step ${s.done ? "done" : "pending"}">
            <span style="font-weight:600">${s.done ? "✓" : "○"}</span>
            <span style="flex:1">${s.name} ${s.done ? '<b style="color:#6fcf6a">[Done]</b>' : ''}</span>
          </div>
        `).join("");

        const gateStatus = rootsUnlocked
          ? `<span style="color:#6fcf6a;font-weight:600">UNSEALED!</span> Enter South of Silt-Floor`
          : `<span style="color:#e8cf4a">SEALED</span> (${3 - echoes.length} more Echoes needed)`;

        hq.innerHTML = `
          <div class="hud-header">
            <span class="small" style="color:var(--amber);font-weight:600">${iconHTML(ICON.echo, 14)} Quest Tracker (${prog.pct}%)</span>
            <button class="hud-mini-btn" onclick="toggleQuestTracker(true)" title="Collapse quest tracker (—)">—</button>
          </div>
          <div class="small" style="color:#ffe46a;font-weight:600;margin:2px 0 4px;line-height:1.3">▶ ${prog.currentGoal}</div>
          <div class="meter" style="height:5px;margin-bottom:6px"><i style="width:${prog.pct}%;background:linear-gradient(90deg,#9ad04a,#ffe46a)"></i></div>
          <div class="small" style="color:#ccc;margin-bottom:2px"><b>Root Echoes:</b> ${echoes.length}/3 collected</div>
          ${stepsHtml}
          <div class="small" style="margin-top:4px;padding-top:4px;border-top:1px dashed #444">
            <b>Iron Roots Gate:</b> ${gateStatus}
          </div>
        `;
      }
    }
  }

  // Right HUD (Resources / Inventory) - Collapsible
  const hr = document.getElementById("hudR");
  if (hr) {
    const allKeys = ["sap", "seeds", "rareSeeds", "scrap", "crystal", "spores", "coins", "potions", "bombs", "organs"];
    const ownedKeys = allKeys.filter(k => (G.res[k] || 0) > 0);

    if (G.hudRCollapsed) {
      hr.className = "box collapsed";
      hr.title = "Click to expand inventory";
      hr.onclick = () => toggleHudR(false);
      hr.innerHTML = `<span>${iconHTML(ICON.coins, 16)} <b>${G.res.coins}</b></span>
        <span class="muted" style="margin-left:4px">🎒 Items (${ownedKeys.length})</span>
        <button class="hud-mini-btn" onclick="event.stopPropagation();toggleHudR(false)" title="Expand inventory (＋)">＋</button>`;
    } else {
      hr.className = "box res";
      hr.title = "";
      hr.onclick = null;
      const itemsHtml = ownedKeys.length > 0
        ? ownedKeys.map(k => `<span class="res-item" title="${RES_NAMES[k]}: ${G.res[k]}">${iconHTML(ICON[k], 16)} <span class="res-name">${RES_NAMES[k]}</span>: <b class="res-qty">${G.res[k]}</b></span>`).join("")
        : `<span class="small muted">Empty pack</span>`;
      hr.innerHTML = `
        <div class="hud-header" style="width:100%;margin-bottom:4px;gap:8px">
          <span class="small" style="color:#ffe46a;font-weight:600">🎒 Items (${ownedKeys.length})</span>
          <button class="hud-mini-btn" onclick="toggleHudR(true)" title="Collapse inventory (—)">—</button>
        </div>
        <div class="res-list">${itemsHtml}</div>
      `;
    }
  }

  const fK = keyLabel((BINDINGS.flashlight && BINDINGS.flashlight[0]) || "g");
  const isDark = G && (G.loc === "silt" || G.loc === "roots" || G.phase === 3);
  const flashHint = isDark ? ` · <kbd>${fK}</kbd> flashlight` : "";
  const uK = keyLabel((BINDINGS.toggleui && BINDINGS.toggleui[0]) || "u");
  if (kb) {
    kb.innerHTML = `<span><kbd>${keyLabel(BINDINGS.up[0])}${keyLabel(BINDINGS.left[0])}${keyLabel(BINDINGS.down[0])}${keyLabel(BINDINGS.right[0])}</kbd> move · <kbd>${keyLabel(BINDINGS.run[0])}</kbd> run · <kbd>${keyLabel(BINDINGS.interact[0])}</kbd> interact · <kbd>${keyLabel(BINDINGS.pack[0])}</kbd> inventory · <kbd>${keyLabel(BINDINGS.pulse[0])}</kbd> map · <kbd>${keyLabel(BINDINGS.settings[0])}</kbd> settings${flashHint} · <kbd>${uK}</kbd> clean view</span> <button class="keys-x-btn" onclick="toggleKeysBar(false)" title="Hide controls helper">✕</button>`;
  }
}

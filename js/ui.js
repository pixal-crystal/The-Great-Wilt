function toast(html, col) { const d = document.createElement("div"); d.innerHTML = html; if (col) d.style.color = col; document.getElementById("toast").appendChild(d); setTimeout(() => d.remove(), 3300); }
let DLG = null;
function say(lines, opt = {}) { DLG = { lines: [].concat(lines), i: 0, shown: 0, opt, sel: 0 }; drawDialog(); document.getElementById("dialog").classList.remove("hidden"); }
function dlgOptions() { return DLG && DLG.i === DLG.lines.length - 1 && DLG.shown >= DLG.lines[DLG.i].length ? (DLG.opt.options || []) : []; }
function drawDialog() {
  if (!DLG) return;
  const el = document.getElementById("dialog"), o = DLG.opt, line = DLG.lines[DLG.i];
  const opts = dlgOptions();
  if (DLG.sel >= opts.length) DLG.sel = 0;
  el.innerHTML = `<div class="por">${o.char != null ? charHTML(o.char, 4) : o.icon != null ? iconHTML(o.icon, 56) : ""}</div>
    <div style="flex:1"><div class="nm">${o.name ? esc(o.name) : ""}</div><div class="tx">${esc(line.slice(0, Math.floor(DLG.shown)))}</div>
    <div class="opts">${opts.map((op, i) => `<div class="opt ${i === DLG.sel ? "sel" : ""} ${op.disabled ? "dis" : ""}" data-i="${i}">${esc(op.label)}${op.disabled ? ` <span class="small">(${esc(op.disabled)})</span>` : ""}</div>`).join("")}</div></div>
    ${!opts.length && DLG.shown >= line.length ? `<div class="more">▼</div>` : ""}`;
  el.querySelectorAll(".opt").forEach(d => { d.onclick = ev => { ev.stopPropagation(); DLG.sel = +d.dataset.i; chooseOpt(); }; d.onmouseenter = () => { if (DLG && DLG.sel !== +d.dataset.i) { DLG.sel = +d.dataset.i; drawDialog(); } }; });
}
document.getElementById("dialog").addEventListener("click", e => { if (!e.target.closest(".opt")) advanceDialog(); });
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
function openPanel(render) { panelRender = render; panelOpen = true; document.getElementById("panel").classList.remove("hidden"); refreshPanel(); }
function refreshPanel() { if (!panelOpen) return; document.getElementById("pbox").innerHTML = `<button class="x" onclick="closePanel()">✕ Esc</button>` + panelRender(); renderHud(); }
function closePanel() { panelOpen = false; panelRender = null; document.getElementById("panel").classList.add("hidden"); save(); }
const uiOpen = () => !!DLG || panelOpen || fade.a > 0.6;
function onKeyUI(k) {
  if (isActionKey("fullscreen", k)) { toggleFullscreen(); pressed[k] = false; return; }
  if (panelOpen) {
    if (k === "escape" ||
        ((isActionKey("pack", k) || k === "e") && panelRender === invPanel) ||
        (isActionKey("quests", k) && panelRender === questsPanel) ||
        (isActionKey("pulse", k) && panelRender === pulsePanel) ||
        (isActionKey("settings", k) && panelRender === settingsPanel)) {
      closePanel();
    } else if (isActionKey("quests", k)) {
      openPanel(questsPanel);
    } else if (isActionKey("pack", k) || k === "e") {
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
    const opts = dlgOptions();
    if (opts.length && (k === "arrowup" || isActionKey("up", k))) { DLG.sel = (DLG.sel + opts.length - 1) % opts.length; drawDialog(); }
    else if (opts.length && (k === "arrowdown" || isActionKey("down", k))) { DLG.sel = (DLG.sel + 1) % opts.length; drawDialog(); }
    else if (["enter", " ", "z"].includes(k) || isActionKey("interact", k)) { if (opts.length) chooseOpt(); else advanceDialog(); }
    else if (k === "escape" && opts.length) { const leave = opts.findIndex(o => /leave|not now|back|not yet/i.test(o.label)); if (leave >= 0) { DLG.sel = leave; chooseOpt(); } }
    pressed[k] = false;
    return;
  }
  if (mode === "world") {
    if (isActionKey("quests", k)) { openPanel(questsPanel); pressed[k] = false; }
    else if (isActionKey("pulse", k)) { openPanel(pulsePanel); pressed[k] = false; }
    else if (isActionKey("pack", k) || k === "e") { openPanel(invPanel); pressed[k] = false; }
    else if (isActionKey("settings", k)) { openPanel(settingsPanel); pressed[k] = false; }
  }
  if (mode === "encounter" && E) encKey(k);
}
let hudT = 0;
function renderHud() {
  const show = mode === "world";
  document.getElementById("hud").classList.toggle("hidden", !show);
  document.getElementById("keys").classList.toggle("hidden", !show);
  const tb = document.getElementById("top-bar"); if (tb) tb.classList.toggle("hidden", !show);
  const sb = document.getElementById("settings-btn"); if (sb) sb.classList.toggle("hidden", !show);
  const invBtn = document.getElementById("inv-btn"); if (invBtn) invBtn.title = `Inventory (${keyLabel(BINDINGS.pack[0])})`;
  if (!show || !G) return;
  const A = AREA(G.loc), r = G.regions[G.loc];
  const st = r ? status(r.bal) : null;
  document.getElementById("hudL").innerHTML = `<div class="row" style="gap:6px">${iconHTML(ICON.hp, 18)}<div class="bar"><i style="width:${G.hp / maxHp() * 100}%;background:#e0473f"></i></div><span class="small">${Math.ceil(G.hp)}/${maxHp()}</span> <span class="small" style="color:#ffe46a">Lv ${G.lvl || 1}</span><div class="bar" style="width:50px"><i style="width:${G.lvl >= MAX_LVL ? 100 : (G.xp || 0) / xpToNext(G.lvl || 1) * 100}%;background:#b48be8"></i></div>${G.gp ? `<span class="small" style="color:#ffe46a">+${G.gp} GP</span>` : ""}</div>
    <div class="small">${iconHTML(A.icon, 16)} ${A.name} ${st ? `<span class="chip ${st}">${STATUS_LABEL[st]} ${r.bal}</span>` : ""}</div>
    <div class="small muted">Day ${G.day} · ${PHASES[G.phase]} · ${iconHTML(ICON.echo, 14)} ${G.echoes.length}/3 · Symbiosis <span style="color:${overgrown() ? "#e0473f" : "#9ad04a"}">${symbiosis()}/${SYMB_CAP}</span></div>`;
  document.getElementById("hudR").innerHTML = ["sap", "seeds", "rareSeeds", "scrap", "crystal", "spores", "coins", "potions", "bombs", "organs"].map(k => `<span title="${RES_NAMES[k]}">${iconHTML(ICON[k], 18)}${G.res[k]}</span>`).join("");
  document.getElementById("keys").innerHTML = `<kbd>${keyLabel(BINDINGS.up[0])}${keyLabel(BINDINGS.left[0])}${keyLabel(BINDINGS.down[0])}${keyLabel(BINDINGS.right[0])}</kbd> move · <kbd>${keyLabel(BINDINGS.run[0])}</kbd> run · <kbd>${keyLabel(BINDINGS.interact[0])}</kbd> interact · <kbd>${keyLabel(BINDINGS.quests[0])}</kbd> quests · <kbd>${keyLabel(BINDINGS.pack[0])}</kbd> inventory · <kbd>${keyLabel(BINDINGS.pulse[0])}</kbd> map · <kbd>${keyLabel(BINDINGS.settings[0])}</kbd> settings`;
}

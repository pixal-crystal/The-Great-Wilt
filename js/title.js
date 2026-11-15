function showTitle() {
  mode = "title"; renderHud(); DLG = null; document.getElementById("dialog").classList.add("hidden");
  const s = loadSave(), el = document.getElementById("title"); el.classList.remove("hidden");
  const prog = computeQuestProgress(s);
  el.innerHTML = `<div class="in">
    <div class="row" style="justify-content:center;gap:16px;align-items:flex-end">${charHTML(CHAR.kaelen, 3)}${charHTML(CHAR.sylva, 3)}${charHTML(CHAR.player, 4)}${charHTML(CHAR.bram, 3)}${charHTML(CHAR.questGiver, 3)}${tileHTML("tent", 0.6)}</div>
    <h1>The Great Wilt</h1>
    <p class="muted" style="font-size:17px">A pale, silent, calcifying blight spreads from the Iron Roots. Walk the canopy, keep the forest in balance, and ricochet through anything that stands in your way.</p>
    <div class="box" style="margin:16px auto 14px;max-width:480px;text-align:left;padding:12px 16px;background:#000c;border:2px solid #5a4b28;border-radius:4px">
      <div class="row" style="justify-content:space-between;margin-bottom:6px">
        <span class="row" style="gap:6px;font-weight:600;color:#ffe46a;font-size:13px">${iconHTML(ICON.echo, 16)} Season Campaign Progress ${s && !s.over ? `(Day ${s.day})` : ""}</span>
        <span style="font-weight:600;color:#6fcf6a;font-size:13px">${prog.completed}/${prog.total} Goals (${prog.pct}%)</span>
      </div>
      <div class="bar" style="width:100%;height:10px;background:#181818;border:1px solid #665;border-radius:2px;overflow:hidden">
        <i style="width:${prog.pct}%;height:100%;background:linear-gradient(90deg, #7fd26a, #ffe46a);display:block"></i>
      </div>
      <div class="small muted" style="margin-top:6px">Current Milestone: <b style="color:#eee">${prog.currentGoal}</b></div>
    </div>
    <div class="row" style="justify-content:center;margin:18px 0">
      <button class="pri" onclick="beginGame(true)">Begin a new season</button>
      ${s && !s.over ? `<button onclick="beginGame(false)">Continue (Day ${s.day})</button>` : ""}
      <button onclick="openPanel(tutorialPanel)">📖 Field Guide / Tutorial</button>
      <button onclick="openPanel(settingsPanel)">⚙ Settings</button>
    </div>
    <div class="box" style="text-align:left;padding:12px 14px;font-size:14px">
      <b style="color:#f0b440">Explore</b> — <kbd>WASD</kbd> walk, <kbd>Shift</kbd> run, <kbd>E</kbd> talk / harvest / open, <kbd>Tab</kbd> inventory, <kbd>M</kbd> Pulse map, <kbd>O</kbd> settings. Talk to Chronicle-Keeper Vael in camp for quests and contracts.<br>
      <b style="color:#f0b440">Fight</b> — touch a monster to enter an encounter box. <b>Drag back and release</b> to slingshot yourself into enemies. Faster = harder hits.
      <kbd>Space</kbd> right as you hit a wall = <b>Parry</b>. <kbd>Shift</kbd> dash, <kbd>1</kbd>–<kbd>5</kbd> graft abilities, <kbd>H</kbd> tonic, <kbd>B</kbd> bomb, hold <kbd>Esc</kbd> to flee.
    </div>
    <div class="small muted" style="margin-top:14px">Characters: Super Retro World Character Pack by Gif (@gif_not_jif), Noiracide (@Noiracide) &amp; Romi (@DessRomaric) ·
    Enemies: Tiny Enemies Vol1 by Vryell (@Vryell) and Tiny RPG Character Asset Pack 02 · Tiles &amp; icons: Raven Fantasy — Clockwork Raven Studios.</div></div>`;
}
function beginGame(fresh) {
  if (fresh) newGame(); else { G = loadSave(); if (!G) newGame(); }
  ensureArms(); ensureProgress();
  for (const k in WORLDS) delete WORLDS[k];
  document.getElementById("title").classList.add("hidden");
  if (fresh) return startOpening();
  enterRegion(G.loc);
  if (false) say(["The Great Wilt spreads from the Iron Roots: pale, silent, calcifying.", "Your Strider-Caravan is parked here in the Twilight Trunk. Sylva sits by the fire, blindfold fluttering.",
    "\"The forest is drifting out of balance, Graftwarden. Harvest gently. Clear the waste. And when beasts come for you...\"", "\"...remember: speed is power. Pull back, and let go.\""],
    { char:CHAR.sylva, name:"Sylva", options:[{ label:"Open Field Guide (Tutorial)", fn:() => openPanel(tutorialPanel) }, { label:"I'm ready. Let's explore the canopy." }] });
}
function ending(id) {
  const text = {
    symbiosis:"You press your grafted palm to the Root-Core. Ten thousand voices of bark and spore flood in — and you answer. PALE recompiles around your heartbeat. The blight softens into moss. Within a generation, children are born with leaf-veins under their skin, and the canopy sings back.",
    dominion:"Kaelen's steam-lance bites through the Root-Core's casing. The forest screams once, then falls silent. Turbines spin across the Sun-Crown, sap flows on schedule, and the blight halts at the fenced plantations. The settlements will never go cold again. Nor will they ever hear the forest again.",
    migration:"Bram welds the last ballast plate onto the Strider's shell while Pip circles the masthead. The great beast wades into the surf with your whole canopy-village on its back. Behind you, the Wilt takes the mainland. Ahead: the open ocean, and the unknown.",
  }[id];
  mode = "ending"; renderHud(); G.over = "ending"; document.getElementById("prompt").classList.add("hidden");
  try { localStorage.removeItem("greatWiltRPG"); } catch (e) {}
  const el = document.getElementById("title"); el.classList.remove("hidden");
  el.innerHTML = `<div class="in"><h1>${{ symbiosis:"Symbiosis", dominion:"Dominion", migration:"Migration" }[id]}</h1><p style="font-size:18px">${text}</p>
    <div class="box small" style="padding:10px;text-align:left">Days: ${G.day} · Fights: ${G.stats.fights} · Defeated: ${G.stats.kills} · Calmed: ${G.stats.calms} · Wardens hunted: ${G.stats.hunts} · Rituals: ${G.stats.rituals} · Best combo: ${G.stats.bestCombo}</div>
    <div style="margin-top:16px"><button class="pri" onclick="showTitle()">Back to title</button></div></div>`;
}
function showCollapse() {
  mode = "ending"; renderHud(); DLG = null; document.getElementById("dialog").classList.add("hidden"); document.getElementById("prompt").classList.add("hidden");
  try { localStorage.removeItem("greatWiltRPG"); } catch (e) {}
  const el = document.getElementById("title"); el.classList.remove("hidden");
  el.innerHTML = `<div class="in"><h1 style="color:#e0473f">The Canopy Falls</h1><p>Day ${G.day}. All four regions burn crimson. The forest's voice goes dark and the canopy settlements fall into the silt.</p><button class="pri" onclick="showTitle()">Try another season</button></div>`;
}

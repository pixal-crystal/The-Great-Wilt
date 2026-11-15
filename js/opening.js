/* =========================================================================
   OPENING — "The Canopy Routine"
   A playable, show-don't-tell tutorial: one mechanic per bridge.
     1. Movement & verticality  — deliver Sylva's spore basket to Kaelen
     2. First blade (1 DMG)     — Bramble-Vines with 3 HP
     3. Dodging                 — a Sap-Tide drops a Fledgling Sap-Beetle
     4. Teammate synergy        — a shell-backed beetle; Kaelen's Armor Crack
     5. First level-up          — spend your first Growth Point
     6. First graft             — Sylva's Photosynth-Leaf, watch the Symbiosis meter
     7. Ecosystem choice        — free the Canopy Stag or harvest the Amber node
   ========================================================================= */
const TUT = { name:"Sun-Crown Outskirts", icon:IC(61, 13), pos:[480, 92], foes:[], yield:{}, nodes:{}, tint:"rgba(255,205,90,0.08)", sunlit:true };
const SUNLIT_IDS = ["sun", "glass", "tutorial"];

/* starter blade, starter graft and the tutorial creatures */
SWORDS.trainer = { name:"Wood-Training Blade", icon:IC(105, 10), col:"#c8a070", lean:"Hybrid", style:"Starter",
  lore:"A practice blade whittled from ironwood. Kaelen swears it's 'basically a real sword'.",
  perk:"No bonuses — just you, your Might, and your speed.", dmg:1, launch:1 };
GRAFTS.photoLeaf = { name:"Photosynth-Leaf", slot:"resp", tier:1, icon:IC(15, 3), desc:"A starter graft from Sylva. Regenerates 1 HP every 6s in sunlight (Sun-Crown, Glass-Marsh, by day)." };
Object.assign(FOES, {
  bramble:     { name:"Bramble-Vines", spr:["tile", "deadbush"], scale:1.6, hp:3, dmg:0, speed:0, ai:"none", harmless:true, anchored:true, fixedDmg:1 },
  fledgeBeetle:{ name:"Fledgling Beetle", spr:["tiny", "Spider", 4], hp:3, dmg:1, speed:22, beast:true, ai:"charger", fixedDmg:1 },
  shellBeetle: { name:"Shell Beetle", spr:["tiny", "Spider", 0], hp:3, dmg:1, speed:16, beast:true, armored:true, ai:"chase", fixedDmg:1 },
});

const TUT_OBJECTIVE = {
  walk:"Deliver the glowing spore basket to Kaelen", vines:"Clear the Bramble-Vines with your new blade", tide:"Cross to the lookout platform",
  beetle2:"Take the rope-bridge down to the caravan", levelup:"Spend your first Growth Point", graft:"Visit Sylva's apothecary at the caravan",
  choice:"Something is tangled in the wire up ahead…", exit:"Ride the canopy highway down to the Twilight Trunk ▶",
};
/* path through the level, in tiles — the glowing moss follows it */
const TUT_ROUTE = [[5, 20], [10, 20], [17, 20], [23, 20], [27, 20], [31, 21], [31.5, 27], [31.5, 31], [33, 34], [41, 34], [47, 33], [55, 34]];
const TUT_GOAL = { intro:2, walk:2, vines:4, tide:5, beetle2:7, levelup:7, graft:8, choice:10, exit:11 };
const tP = (tx, ty) => ({ x:tx * TL + 8, y:(ty + 1) * TL - 2 });

function buildTutorialWorld() {
  const N = MW * MH, ix = (x, y) => y * MW + x, rng = mulberry32(777);
  const W = { id:"tutorial", G:new Array(N).fill("grass"), T:new Uint8Array(N).fill(T_VOID), path:new Uint8Array(N), kind:new Uint8Array(N), objAt:new Uint8Array(N),
    objs:[], decor:[], nodes:[], npcs:[], exits:[], spawnSpots:[] };
  const rect = (x0, y0, x1, y1, key) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = ix(x, y); W.T[i] = T_WALK; W.G[i] = key || (rng() < 0.5 ? "grass" : "grass2"); if (key) W.path[i] = 1; } };
  rect(2, 16, 7, 23);                 // P0 — your nest
  rect(8, 19, 13, 20, "plankH");      // B1 — first rope-bridge
  rect(14, 15, 20, 24);               // P1 — Kaelen's turbine perch
  rect(21, 19, 27, 20, "plankH");     // B2 — overgrown bridge
  rect(28, 14, 35, 25);               // P2 — lookout (Sap-Tide)
  rect(31, 26, 32, 30, "plankV");     // B3 — rope ladder-bridge down
  rect(23, 31, 38, 37);               // P3 — caravan landing
  rect(39, 33, 44, 34, "plankH");     // B4
  rect(45, 29, 55, 38);               // P4 — the wire tangle, highway head
  const solid = (x, y) => { const i = ix(x, y); W.T[i] = T_WALL; W.objAt[i] = 1; W.kind[i] = 3; };
  const obj = (key, tx, ty, fw = 2) => { W.objs.push({ key, x:(tx + fw / 2) * TL, y:(ty + 1) * TL - 1 }); for (let x = tx; x < tx + fw; x++) solid(x, ty); };
  obj("tree", 2, 16); obj("otree", 19, 15); obj("tree", 34, 14); obj("otree", 28, 24); obj("tree", 54, 29); obj("otree", 45, 38);
  for (const [k, x, y] of [["sunflower", 3, 22], ["sunflower", 15, 23], ["sunflower", 35, 22], ["tallgrass", 37, 36], ["sunflower", 53, 37]]) W.objs.push({ key:k, x:x * TL + 8, y:(y + 1) * TL - 1 });
  // the caravan: tent + campfire
  W.objs.push({ key:"tent", x:(26 + 1.5) * TL, y:(33 + 1) * TL - 1 }); for (let y = 32; y <= 33; y++) for (let x = 26; x <= 28; x++) solid(x, y);
  W.camp = { x:27.5 * TL, y:33 * TL, fx:30.5 * TL, fy:35 * TL }; solid(30, 34);
  W.lair = { x:W.camp.x, y:W.camp.y };
  // bramble wall across the second bridge
  W.bramble = [[24, 19], [24, 20]];
  if (["intro", "walk", "vines"].includes(G.tut.step)) for (const [x, y] of W.bramble) W.T[ix(x, y)] = T_WALL;
  // decor
  for (let i = 0; i < 70; i++) { const x = rnd2(rng, 1, MW - 2), y = rnd2(rng, 1, MH - 2); if (W.T[ix(x, y)] === T_WALK && !W.path[ix(x, y)] && !W.objAt[ix(x, y)]) W.decor.push({ key:["flowers", "redflower", "bush", "rock"][Math.floor(rng() * 4)], x:x * TL + 8, y:(y + 1) * TL - 1 }); }
  // people
  if (["intro", "walk"].includes(G.tut.step)) W.npcs.push({ kind:"tut", id:"kaelen", char:CHAR.kaelen, name:"Kaelen", ...tP(17, 18), dir:1 });
  W.npcs.push({ kind:"tut", id:"sylva", char:CHAR.sylva, name:"Sylva", ...tP(33, 34), dir:1 });
  W.exits.push({ side:"E", at:34, to:"trunk", tx:MW - 1, ty:34, spawnX:(MW - 3) * TL, spawnY:34 * TL + 10 });
  W.stag = { ...tP(48, 32), state:G.tut.choice ? "gone" : "tangled", t:0 };
  W.amber = { ...tP(51, 35), used:G.tut.choice === "harvest" };
  /* where to stand when (re)entering at each beat */
  const startAt = { intro:[5, 20], walk:[5, 20], vines:[19, 20], tide:[22, 20], tide2:[29, 20], beetle2:[31, 22], beetle2b:[31, 22], levelup:[31, 22], graft:[33, 36], choice:[36, 36], exit:[48, 34] }[G.tut.step] || [5, 20];
  W.start = tP(startAt[0], startAt[1]);
  W.bg = bakeBg(W);
  return W;
}

/* ---------- flow ---------- */
function startOpening() {
  G.tut = { step:"intro", moved:0, runs:0, wasRun:false, launches:0, dodges:0, tideT:0, banner:null };
  G.loc = "tutorial";
  G.arms.owned = ["trainer"]; G.arms.equipped = "trainer";
  enterRegion("tutorial");
  say(["Dawn over the Sun-Crown. The wind-turbines tick lazily above the boughs.",
    "Sylva left you a basket of glowing spores for Kaelen at his turbine perch across the rope-bridges.",
    "Kaelen's voice crackles over the wind-horn: \"Morning, Graftwarden! Want to warm up with some practice swings on your way over — or are you ready to move out?\""],
    { char:CHAR.kaelen, name:"Kaelen (wind-horn)", options:[
      { label:"Warm up — I'll bring the spores (tutorial)", fn:() => { G.tut.step = "walk"; save(); } },
      { label:"Ready to move out (skip tutorial — start at Lv 2 with starter gear)", fn:skipOpening }] });
}
function skipOpening() {
  G.tut.step = "done";
  G.lvl = 2; G.xp = 0; G.gp = Math.max(G.gp || 0, 1);
  acquireSword("trainer", true); acquireSword("cleaver", true); G.arms.equipped = "cleaver";
  if (!G.owned.includes("photoLeaf")) G.owned.push("photoLeaf");
  if (!has("photoLeaf") && G.equipped.resp.length < 2) G.equipped.resp.push("photoLeaf");
  G.hp = maxHp();
  doFade(() => { enterRegion("trunk"); arrivalDialog(true); });
}
function arrivalDialog(skipped) {
  G.tut.step = "done"; save();
  say([skipped ? "The Strider-Caravan lumbers down the canopy highway into the Twilight Trunk." : "The Strider-Caravan lumbers down the canopy highway. Below, the Twilight Trunk swallows the light.",
    "The Great Wilt spreads from the Iron Roots: pale, silent, calcifying. Sylva sits by the fire, blindfold fluttering.",
    "\"The forest is drifting out of balance, Graftwarden. Harvest gently. Clear the waste. And when beasts come for you...\"",
    `"...remember: speed is power. Pull back, and let go."${G.gp ? " (You have an unspent Growth Point — press I.)" : ""}`],
    { char:CHAR.sylva, name:"Sylva", options:[{ label:"I'm ready. Let's explore the canopy." }, ...(typeof tutorialPanel === "function" ? [{ label:"Open the Field Guide", fn:() => openPanel(tutorialPanel) }] : [])] });
}
function tutKaelen() {
  G.tut.step = "vines";
  M.npcs = M.npcs.filter(n => n.id !== "kaelen");
  G.companion = "kaelen";
  acquireSword("trainer", true); G.arms.equipped = "trainer";
  say(["Kaelen takes the basket and sniffs it. \"Sylva's spores. Still glowing. Good.\"",
    "\"Path's choked again — bramble's grown right over the bridge. Here, catch.\"",
    "He tosses you a Wood-Training Blade. \"Pull back and let go — you're the projectile. That blade only does 1 damage a hit, so those vines'll take three.\"",
    "Kaelen falls in behind you, steam-lance on his shoulder."], { char:CHAR.kaelen, name:"Kaelen", onClose:() => toast(`Kaelen joined you · New blade: Wood-Training Blade`, "#9fd3ff") });
}
function tutFight(id, types, opts = {}) {
  G.tut.fight = id; save();
  startEncounter(types, { noFlee:true });
  E.noFlee = true;
  for (const f of E.foes) { f.hp = f.maxHp = f.F.hp; f.ax = f.x; f.ay = f.y; if (f.F.anchored) { f.x = BOX.x + BOX.w - 70; f.y = BOX.y + BOX.h / 2 + 8; f.ax = f.x; f.ay = f.y; } }
  E.compT = opts.compT ?? 999;
  E.tutT = 0;
}
function tutAfterFight(res) {
  const id = G.tut.fight; G.tut.fight = null;
  if (res !== "win") return;
  if (id === "vines") {
    G.tut.step = "tide";
    for (const [x, y] of M.bramble) M.T[y * MW + x] = T_WALK;
    say(["The last vine snaps. Three hits for three HP — that blade really does just 1 damage.", "Kaelen: \"See? Speed carries you, the blade does the rest. Onward.\""], { char:CHAR.kaelen, name:"Kaelen" });
  } else if (id === "beetle1") {
    G.tut.step = "beetle2"; save();
  } else if (id === "beetle2") {
    G.tut.step = "levelup";
    const need = Math.max(0, xpToNext(1) - G.xp);
    if (G.lvl < 2) gainXP(need, "Spore-Essence from the beetles");
    setTimeout(() => say(["The beetles' husks drip glowing Spore-Essence — it seeps into your grafts. You feel... sharper.",
      "Kaelen: \"Level two! Every level you get stronger, and you choose how. Go on, spend it.\""],
      { char:CHAR.kaelen, name:"Kaelen", onClose:() => openPanel(tutGrowthPanel) }), 300);
  }
}
function tutGrowthPanel() {
  const card = (k, rec, extra) => { const s = STAT_INFO[k]; return `<div class="card ${rec ? "on" : ""}" style="flex:1;min-width:220px"><b style="color:${s.col};font-size:18px">${s.name}</b> ${rec ? `<span class="tag" style="color:#ffe46a;border-color:#ffe46a">Kaelen's pick</span>` : ""}
    <div class="small" style="margin:6px 0">${s.desc}</div><div class="small muted">${extra}</div><button class="pri" style="margin-top:8px" onclick="tutSpend('${k}')">Put my point into ${s.name}</button></div>`; };
  return `<h2 style="color:#ffe46a">LEVEL 2!</h2><div class="small">Every level grants <b>+1 max HP</b> automatically and <b>1 Growth Point</b>. Spend your first point:</div>
    <div class="row" style="margin-top:10px;align-items:stretch">
      ${card("vit", false, `Max HP ${maxHp()} → <b>${maxHp() + 2}</b>. Hardens body against lethal strikes.`)}
      ${card("might", true, `Damage ${baseDmg()} → <b>${baseDmg() + 1}</b>. Literally doubles your power.`)}
      ${card("agi", false, `Stamina ${maxStamina()} → <b>${maxStamina() + 1}</b>. One more relaunch or dodge per breath.`)}
      ${card("sp", false, `SP ${symPow()} → <b>${symPow() + 1}</b>. Stronger grafts, poisons and sword cores.`)}
    </div><div class="small muted" style="margin-top:8px">You can spend future points any time from the Pack (I).</div>`;
}
function tutSpend(stat) { spendGP(stat); closePanel(); }
function tutLoadoutPanel() {
  return `<div class="card" style="border-color:#9ad04a;margin-bottom:8px">${charHTML(CHAR.sylva, 2)} <b>Sylva:</b> "Press the Photosynth-Leaf into your <b>Respiratory</b> slot. Feel it root? Watch your <b>Symbiosis</b> meter — every graft feeds it. Too much and the forest starts growing <i>you</i>." <span class="small muted">(Click the leaf below to attach it, then close.)</span></div>` + loadoutPanel();
}
function onPanelClosed(render) {
  if (!G || !G.tut || G.tut.step === "done") return;
  if (render === tutGrowthPanel) {
    if (G.gp > 0) {
      toast("💡 Spend your Growth Point from your Pack [Tab] when ready.", "#ffe46a");
      return;
    }
    G.tut.step = "graft"; save();
    say([`Kaelen: "${G.attr.might >= 2 ? "Two damage a swing! That's double. Told you." : "Good choice. Every point counts at this size."}"`, "\"Sylva's waiting at the caravan below. She's got something for you.\""], { char:CHAR.kaelen, name:"Kaelen" });
  }
  if (render === tutLoadoutPanel) {
    if (!has("photoLeaf")) {
      toast("💡 Attach the Photosynth-Leaf in your inventory when ready.", "#9ad04a");
      return;
    }
    G.tut.step = "choice"; acquireSword("cleaver", true); save();
    say(["Sylva smiles. \"In sunlight it'll knit your wounds. Symbiosis went up by one — feel that? That's the forest, listening.\"",
      "Kaelen hands you a heavy curved blade. \"And take this Chitin-Cleaver — +1 damage. Equip it from the Armory when you like.\"",
      "Sylva tilts her head toward the highway. \"Something's hurting up ahead. Go — I'll ready the Strider.\""], { char:CHAR.sylva, name:"Sylva" });
  }
}
function tutSylva() {
  if (G.tut.step === "graft") {
    if (!G.owned.includes("photoLeaf")) G.owned.push("photoLeaf");
    return say(["Sylva turns her blindfolded face toward you. \"Spore-Essence on your skin. You've grown.\"",
      "\"Here — a Photosynth-Leaf. Your first graft from me. It drinks sunlight and gives it back as life.\""], { char:CHAR.sylva, name:"Sylva", onClose:() => openPanel(tutLoadoutPanel) });
  }
  say([G.tut.step === "choice" || G.tut.step === "exit" ? "\"The Strider is ready when you are. The highway is east.\"" : "\"Kaelen's perch is up past the bridges. Bring him the spores.\""], { char:CHAR.sylva, name:"Sylva" });
}
function tutChoice() {
  say(["A wounded Canopy Stag thrashes, tangled in rusted pre-collapse wire. Right beside it, a rare Amber-Sap node pulses gold.",
    "You can free the stag — or tap the node while it's pinned. Not both: the moment it's loose, it bolts and kicks the node apart. Or once the sap's drained, it tears free in a panic."],
    { icon:ICON.sap, name:"A choice on the highway", options:[
      { label:"Free the Stag (Root-Singer lean)", fn:() => {
        G.tut.choice = "free"; G.lean = "root"; M.stag.state = "freed";
        const got = gain({ organs:1, seeds:2 });
        G.regions.sun.bal = Math.max(G.regions.sun.bal, 90); changeBal("trunk", 8);
        toast(`Living Thorn (bio-grafting material): ${got}`, "#9ad04a"); toast("The Pulse: the Sun-Crown glows bright green.", "#6fcf6a");
        gainXP(4, "Freed the Canopy Stag", "squad");
        tutAfterChoice("The stag shakes itself loose, presses its brow to your hand, and drops a Living Thorn before bounding into the canopy. Across the Pulse, the Sun-Crown flares bright green.");
      } },
      { label:"Harvest the Amber node first (Industrialist lean)", fn:() => {
        G.tut.choice = "harvest"; G.lean = "industrial"; M.stag.state = "fled"; M.amber.used = true; G.wary = true;
        const got = gain({ sap:3, scrap:3 });
        toast(`Refined Sap for tech-forging: ${got}`, "#ffb35a"); toast("Wildlife will be a little more wary of you.", "#e8cf4a");
        gainXP(4, "Extracted rare Amber-Sap", "squad");
        tutAfterChoice("You drain the node clean — refined sap, perfect for tech-forging. The stag tears free in a panic and vanishes. Somewhere, the forest remembers.");
      } }] });
}
function tutAfterChoice(line) {
  G.tut.step = "exit"; save();
  say([line, "Kaelen: \"No wrong answers out here. Just consequences.\" He nods east. \"Highway's open. Let's ride.\""], { char:CHAR.kaelen, name:"Kaelen" });
}
function tutInteract() {
  const s = G.tut.step, c = [];
  for (const n of M.npcs) {
    if (n.id === "kaelen" && (s === "walk" || s === "intro")) c.push({ x:n.x, y:n.y, r:26, label:"Deliver the spore basket to Kaelen", fn:tutKaelen });
    if (n.id === "sylva") c.push({ x:n.x, y:n.y, r:24, label:s === "graft" ? "Visit Sylva's apothecary" : "Talk to Sylva", fn:tutSylva });
  }
  if (s === "vines") { const b = tP(23, 19); c.push({ x:b.x, y:b.y + 8, r:30, label:"Cut through the Bramble-Vines (3 HP)", fn:() => tutFight("vines", ["bramble"]) }); }
  if (s === "choice" && M.stag.state === "tangled") c.push({ x:M.stag.x, y:M.stag.y, r:34, label:"Approach the tangled stag", fn:tutChoice });
  let best = null, bd = 1e9;
  for (const q of c) { const d = Math.hypot(q.x - PL.x, q.y - PL.y); if (d < q.r && d < bd) { bd = d; best = q; } }
  return best;
}

/* ---------- per-frame (world) ---------- */
let tutSunT = 0, tutLast = null, tutShake = 0, tutFlash = 0;
function tutWorldTick(dt) {
  if (!G) return false;
  // Photosynth regeneration outside fights
  if ((has("photoLeaf") || has("photosynth")) && SUNLIT_IDS.includes(G.loc) && G.phase < 3 && G.hp < maxHp()) { tutSunT += dt; if (tutSunT > 6) { tutSunT = 0; G.hp = Math.min(maxHp(), G.hp + 1); } }
  if (!G.tut || G.tut.step === "done") return false;
  if (G.tut.step === "exit" && G.loc === "trunk") { arrivalDialog(false); return false; }
  if (G.loc !== "tutorial") return false;
  const T = G.tut;
  tutShake = Math.max(0, tutShake - dt); tutFlash = Math.max(0, tutFlash - dt);
  if (tutLast) T.moved += Math.hypot(PL.x - tutLast.x, PL.y - tutLast.y);
  tutLast = { x:PL.x, y:PL.y };
  const running = (isActionDown("run") || keys["shift"]) && PL.moving;
  if (running && !T.wasRun) T.runs++;
  T.wasRun = running;
  const tx = PL.x / TL, ty = PL.y / TL;
  // gates keep each lesson in its own space
  if (T.step === "levelup" && ty > 29) { PL.y = 29 * TL; }
  if (["tide", "beetle2", "levelup", "graft"].includes(T.step) && tx > 39) { PL.x = 39 * TL; if (!T.gateMsg) { T.gateMsg = 1; say(["Sylva calls from the caravan: \"Graftwarden! Come to the apothecary first.\""], { char:CHAR.sylva, name:"Sylva" }); } }
  if (T.step === "choice" && tx > 53) { PL.x = 53 * TL; toast("Something's tangled in the wire — take a look first.", "#e8cf4a"); }
  // scripted beats
  if (T.step === "tide" && tx >= 29) {
    if (!T.tideT) { T.tideT = 1.1; tutShake = 1.0; tutFlash = 0.6; toast("A Sap-Tide shakes the branches!", "#e8a93a"); }
    else { T.tideT -= dt; if (T.tideT <= 0) { T.tideT = 0; T.step = "tide2"; tutFight("beetle1", ["fledgeBeetle"]); return true; } }
  }
  if (T.step === "beetle2" && ty >= 26.5) { toast("Another beetle drops onto the bridge — its shell gleams!", "#e8a93a"); tutShake = 0.5; T.step = "beetle2b"; tutFight("beetle2", ["shellBeetle"], { compT:2.2 }); return true; }
  if (T.step === "tide2" && !E) T.step = "beetle2";       // reload safety
  if (T.step === "beetle2b" && !E) T.step = "beetle2";
  if (M.stag && M.stag.state !== "tangled" && M.stag.state !== "gone") { M.stag.t += dt; M.stag.x += dt * 70; M.stag.y -= dt * 20; if (M.stag.t > 3) M.stag.state = "gone"; }
  return false;
}
function tutDrawables(list, camX, camY, t) {
  const T = G.tut; if (!T) return;
  // glowing moss trail toward the current objective
  const goal = TUT_GOAL[T.step] ?? 0;
  list.push({ y:-1e9, d:() => {
    for (let i = 0; i < Math.min(goal, TUT_ROUTE.length - 1); i++) {
      const [ax, ay] = TUT_ROUTE[i], [bx, by] = TUT_ROUTE[i + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) * 1.4);
      for (let k = 0; k < n; k++) {
        const x = (ax + (bx - ax) * k / n) * TL + 8 - camX, y = (ay + (by - ay) * k / n) * TL + 10 - camY;
        if (x < -8 || x > VW + 8 || y < -8 || y > VH + 8) continue;
        const a = 0.35 + 0.35 * Math.sin(t * 3 - (i * 4 + k) * 0.7);
        ctx.fillStyle = `rgba(150,255,140,${a})`; ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
      }
    }
  } });
  // bramble wall
  if (["intro", "walk", "vines"].includes(T.step)) for (const [x, y] of M.bramble) list.push({ y:(y + 1) * TL, d:() => { t16(ctx, "deadbush", x * TL - camX - 4, y * TL - camY - 6, 24, 22); t16(ctx, "tallgrass", x * TL - camX + 2, y * TL - camY - 14, 14, 26, 0.9); } });
  // amber node + stag
  if (M.amber) list.push({ y:M.amber.y, d:() => { const X = M.amber.x - camX, Y = M.amber.y - camY; ctx.fillStyle = M.amber.used ? "#6a4a1a" : `rgba(232,160,48,${0.8 + Math.sin(t * 3) * 0.2})`; ctx.beginPath(); ctx.ellipse(X, Y - 2, 9, 4, 0, 0, 7); ctx.fill(); if (!M.amber.used) icon16(ctx, ICON.sap, X - 6, Y - 22 + Math.sin(t * 3) * 1.5, 12); } });
  if (M.stag && M.stag.state !== "gone") list.push({ y:M.stag.y, d:() => {
    const X = M.stag.x - camX, Y = M.stag.y - camY, tangled = M.stag.state === "tangled";
    drawFoeSprite(ctx, ["tiny", "Bear", 1], tangled ? "hit" : "walk", t, tangled ? 1 : 2, X, Y, 1.4, M.stag.state === "fled" ? 0.8 : 1);
    if (tangled) { ctx.strokeStyle = "#9aa3a8"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X - 12, Y - 18); ctx.lineTo(X + 10, Y - 4); ctx.moveTo(X - 10, Y - 4); ctx.lineTo(X + 12, Y - 16); ctx.moveTo(X - 14, Y - 10); ctx.lineTo(X + 14, Y - 11); ctx.stroke(); outlineText(ctx, "Canopy Stag", X, Y - 26, "#e8cf4a", "6px 'Pixelify Sans'"); }
  } });
}
function promptBubble(x, y, text, col = "#ffe46a") {
  ctx.font = "6px 'Pixelify Sans'"; const w = ctx.measureText(text).width + 8;
  ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(Math.round(x - w / 2), Math.round(y - 8), Math.round(w), 10);
  ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.strokeRect(Math.round(x - w / 2) + 0.5, Math.round(y - 8) + 0.5, Math.round(w) - 1, 9);
  outlineText(ctx, text, x, y, col, "6px 'Pixelify Sans'");
}
function tutOverlay(camX, camY, t) {
  const T = G.tut; if (!T || T.step === "done") return;
  if (tutFlash > 0) { ctx.fillStyle = `rgba(232,160,48,${tutFlash * 0.5})`; ctx.fillRect(0, 0, VW, VH); }
  const X = PL.x - camX, Y = PL.y - camY;
  const mv = keyLabel(BINDINGS.up && BINDINGS.up[0] || "w") + keyLabel(BINDINGS.left && BINDINGS.left[0] || "a") + keyLabel(BINDINGS.down && BINDINGS.down[0] || "s") + keyLabel(BINDINGS.right && BINDINGS.right[0] || "d");
  if (T.step === "walk" && T.moved < 80) promptBubble(X, Y - 26, `[${mv}] Move`);
  else if (T.step === "walk" && T.runs < 2 && PL.x > 8 * TL) promptBubble(X, Y - 26, `[${keyLabel((BINDINGS.run && BINDINGS.run[0]) || "shift")}] Run`);
  const obj = TUT_OBJECTIVE[T.step];
  if (obj) { ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(VW / 2 - 110, VH - 26, 220, 13); outlineText(ctx, `◆ ${obj}`, VW / 2, VH - 16, "#9ad04a", "7px 'Pixelify Sans'"); }
}

/* ---------- per-frame (encounter) ---------- */
function tutOnLaunch() { if (G && G.tut && G.loc === "tutorial") G.tut.launches++; }
function tutOnDash() { if (G && G.tut && G.loc === "tutorial") G.tut.dodges++; }
function tutDrawEnc() {
  if (!G || !G.tut || G.loc !== "tutorial" || !E) return;
  const T = G.tut, p = E.p, id = T.fight;
  E.tutT = (E.tutT || 0) + 1 / 60;
  for (const f of E.foes) if (f.F.anchored) { f.vx = f.vy = 0; f.x = f.ax; f.y = f.ay; }
  const banner = (s, col = "#ffe46a") => { ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(BOX.x, BOX.y + 2, BOX.w, 12); outlineText(ctx, s, BOX.x + BOX.w / 2, BOX.y + 11, col, "7px 'Pixelify Sans'"); };
  if (E.over || E.intro > 0) return;
  if (T.launches < 2) promptBubble(p.x, p.y - 20, "Drag back & release to launch");
  if (id === "vines") {
    const v = E.foes[0]; if (v && !v.dead) outlineText(ctx, `${Math.max(0, v.hp)} / 3 HP · your blade: 1 DMG`, v.x, v.y - 30, "#fff", "6px 'Pixelify Sans'");
    banner("Your blade deals 1 DMG — three hits clear 3 HP of vines.");
  }
  if (id === "beetle1") {
    const f = E.foes[0], dk = keyLabel((BINDINGS.run && BINDINGS.run[0]) || "shift");
    if (f && f.state === "wind") { ctx.save(); ctx.shadowColor = "#ff9a3c"; ctx.shadowBlur = 10; ctx.strokeStyle = "#ff9a3c"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x, f.y - 6, f.r + 5, 0, 7); ctx.stroke(); ctx.restore(); }
    if (T.dodges < 2 && f && (f.state === "wind" || f.state === "charge")) promptBubble(p.x, p.y + 22, `[${dk}] Dodge!`, "#ff9a3c");
    banner(T.dodges < 2 ? "It glows orange before it charges — dodge through it!" : "Nice dodging. Now slam into it while it recovers.", "#ff9a3c");
  }
  if (id === "beetle2") {
    const f = E.foes[0];
    if (f && !f.dead && !f.dying) {
      if (!f.armorCrack) banner("Its hardened shell blocks your 1 DMG (armor 1)… Kaelen's lining up a shot!", "#e8cf4a");
      else { banner("Kaelen's ARMOR CRACK shattered the shell — your 1 DMG lands now!", "#9ad04a"); ctx.strokeStyle = `rgba(150,255,140,${0.6 + Math.sin(E.tutT * 8) * 0.4})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(f.x, f.y - 6, f.r + 6, 0, 7); ctx.stroke(); }
    }
  }
}

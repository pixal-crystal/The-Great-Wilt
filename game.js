"use strict";
/* =====================================================================
   THE GREAT WILT — open-world RPG with Kinetic Ricochet encounters
   ===================================================================== */
const PATHS = {
  icons32: "assets/icons/raven-icons-32.png",
  icons16: "assets/icons/raven-icons-16.png",
  tiles16: "assets/tiles/green-forest-16.png",
  tiles32: "assets/tiles/green-forest-32.png",
  chars:   "assets/characters/",
  tiny:    "assets/enemies/tiny/",
  dungeon: "assets/enemies/dungeon/",
};
const fileURL = p => encodeURI(p);
const IMG = {}, assetErrors = new Set();
function assetError(p) {
  assetErrors.add(p); const e = document.getElementById("err"); e.style.display = "block";
  e.textContent = "Couldn't load: " + [...assetErrors].join("  |  ") + "  — keep index.html next to its assets/ folder.";
}
function img(path) { if (!IMG[path]) { const im = new Image(); im.onerror = () => assetError(path); im.src = fileURL(path); IMG[path] = im; } return IMG[path]; }
const ok = im => im && im.complete && im.naturalWidth > 0;
const charPath = n => `${PATHS.chars}character_${n}_frame16x20.png`;

/* ---------------- sprite tables ---------------- */
const TS32 = {chest:[32,22,32,36],rock:[132,10,26,18],rock2:[162,4,28,24],mrock:[132,42,26,18],mrock2:[162,36,28,24],boulder:[196,4,56,56],mboulder:[196,68,56,56],grass:[256,0,32,32],grass2:[288,0,32,32],deadbush:[320,0,30,30],dgrass:[352,0,32,32],dgrass2:[384,0,32,32],green:[256,32,32,32],bush:[288,32,32,30],tallgrass:[320,34,32,60],clover:[352,32,32,30],flowers:[384,32,32,28],flower2:[356,64,28,28],log:[256,66,62,26],deadtree:[4,70,82,84],deadtree2:[96,64,86,90],stump:[214,136,52,50],tree:[0,160,96,122],otree:[96,160,96,122],tent:[192,192,98,126],fire1:[352,128,32,26],fire2:[384,128,32,26],logs:[320,128,32,26],bag:[288,288,32,30],plankH:[544,192,30,32],plankV:[480,160,32,32],dirt:[576,32,32,32],rockfloor:[32,416,32,32],water:[768,32,32,32],steps:[352,256,32,32],cattail:[160,320,32,56],redflower:[192,322,30,28],sunflower:[416,2,32,56],door:[290,168,28,56],marker:[118,310,20,20]};
const TS16 = Object.fromEntries(Object.entries(TS32).map(([k, r]) => [k, r.map(v => Math.round(v / 2))]));
function t16(c, key, x, y, w, h, a = 1) {
  const r = TS16[key], im = img(PATHS.tiles16); if (!r || !ok(im)) return;
  if (a !== 1) { c.save(); c.globalAlpha *= a; }
  c.drawImage(im, r[0], r[1], r[2], r[3], Math.round(x), Math.round(y), w ?? r[2], h ?? r[3]);
  if (a !== 1) c.restore();
}
function t32(c, key, x, y, s = 1, a = 1) {
  const r = TS32[key], im = img(PATHS.tiles32); if (!r || !ok(im)) return;
  c.save(); c.globalAlpha *= a; c.imageSmoothingEnabled = false;
  c.drawImage(im, r[0], r[1], r[2], r[3], Math.round(x), Math.round(y), r[2] * s, r[3] * s); c.restore();
}
const IC = (r, c) => r * 16 + c;
function icon16(c, id, x, y, size = 16, a = 1) {
  const im = img(PATHS.icons16); if (!ok(im)) return;
  if (a !== 1) { c.save(); c.globalAlpha *= a; }
  c.drawImage(im, (id % 16) * 16, Math.floor(id / 16) * 16, 16, 16, Math.round(x), Math.round(y), size, size);
  if (a !== 1) c.restore();
}
function icon32(c, id, x, y, size = 32, a = 1) {
  const im = img(PATHS.icons32); if (!ok(im)) return;
  c.save(); c.globalAlpha *= a; c.imageSmoothingEnabled = false;
  c.drawImage(im, (id % 16) * 32, Math.floor(id / 16) * 32, 32, 32, Math.round(x), Math.round(y), size, size); c.restore();
}
const iconHTML = (id, size = 24) => { const r = Math.floor(id / 16), c = id % 16;
  return `<span class="ic" style="width:${size}px;height:${size}px;background-image:url('${fileURL(PATHS.icons32)}');background-size:${16*size}px auto;background-position:-${c*size}px -${r*size}px"></span>`; };
const charHTML = (n, s = 3, dir = 0, frame = 1) =>
  `<span class="ic" style="width:${16*s}px;height:${20*s}px;background-image:url('${fileURL(charPath(n))}');background-size:${48*s}px ${80*s}px;background-position:-${frame*16*s}px -${dir*20*s}px"></span>`;
const tileHTML = (key, s = 1) => { const r = TS32[key];
  return `<span class="ic" style="width:${r[2]*s}px;height:${r[3]*s}px;background-image:url('${fileURL(PATHS.tiles32)}');background-size:${832*s}px ${480*s}px;background-position:-${r[0]*s}px -${r[1]*s}px"></span>`; };
function drawChar(c, n, dir, frame, x, y, a = 1) {
  const im = img(charPath(n)); if (!ok(im)) return;
  if (a !== 1) { c.save(); c.globalAlpha *= a; }
  c.drawImage(im, frame * 16, dir * 20, 16, 20, Math.round(x - 8), Math.round(y - 20), 16, 20);
  if (a !== 1) c.restore();
}
// Tiny Enemies Vol1 (16x16). Rows per colour variant: down, right, up, left (row 0 is the header).
const TINY = {
  Toad:       { file:"Toad_16x16.png",       idle:[0,4], walk:[4,4], atk:[8,4],  hit:[12,1], death:[13,1] },
  Mushrooms:  { file:"Mushrooms_16x16.png",  idle:[0,4], walk:[4,4], atk:[8,4],  hit:[12,4], death:[16,4] },
  Bear:       { file:"Bear_16x16.png",       idle:[0,4], walk:[4,4], atk:[8,4],  hit:[12,1], death:[13,3] },
  Beholder:   { file:"Beholder_16x16.png",   idle:[0,4], walk:[4,4], atk:[8,4],  proj:[12,4], hit:[16,4], death:[20,4] },
  Spider:     { file:"Spider_16x16.png",     idle:[0,4], walk:[4,4], atk:[8,4],  hit:[0,1],  death:[12,4], deathRow0:true },
  Ghost:      { file:"Ghost_16x16.png",      idle:[0,4], walk:[4,4], atk:[8,4],  hit:[12,1], death:[13,3] },
  Imp:        { file:"Imp_16x16.png",        idle:[0,4], walk:[4,4], atk:[8,4],  proj:[12,4], hit:[16,1], death:[17,3] },
  Creature:   { file:"Creature_16x16.png",   idle:[0,4], walk:[4,4], atk:[8,4],  hit:[12,1], death:[13,3] },
  Shadow:     { file:"Shadow_16x16.png",     idle:[0,4], walk:[4,4], atk:[8,4],  hit:[12,1], death:[13,3] },
  Necromancer:{ file:"Necromancer_16x16.png",idle:[0,4], walk:[0,4], atk:[4,4],  proj:[8,4],  hit:[12,1], death:[13,3] },
};
const DIR_ROW = [0, 3, 1, 2]; // our dirs: 0 down, 1 left, 2 right, 3 up -> sheet rows
// Tiny RPG pack 02 (100x100 frames, facing right): rows idle, walk, attack01, attack02, hurt, death
const BIGS = {
  Demon: { file:"Demon_A.png", idle:[0,6], walk:[1,8], atk:[2,7], hit:[4,4], death:[5,4], fx:53, fy:59 },
  Blood: { file:"Blood_Monster_A.png", idle:[0,6], walk:[1,8], atk:[2,8], hit:[4,4], death:[5,4], fx:52, fy:57 },
};
function drawFoeSprite(c, spr, anim, t, dir, x, y, scale = 1, a = 1) {
  if (spr[0] === "tiny") {
    const sp = TINY[spr[1]], im = img(PATHS.tiny + sp.file); if (!ok(im)) return;
    const an = sp[anim] || sp.idle;
    const fr = an[0] + (anim === "death" ? Math.min(an[1] - 1, Math.floor(t * 7)) : Math.floor(t * 7) % an[1]);
    let row = DIR_ROW[dir] ?? 0; if (anim === "death" && sp.deathRow0) row = 0;
    c.save(); c.globalAlpha *= a;
    c.drawImage(im, fr * 16, (1 + spr[2] * 4 + row) * 16, 16, 16, Math.round(x - 8 * scale), Math.round(y - 15 * scale), 16 * scale, 16 * scale);
    c.restore();
  } else {
    const sp = BIGS[spr[1]], im = img(PATHS.dungeon + sp.file); if (!ok(im)) return;
    const an = sp[anim] || sp.idle;
    const fr = anim === "death" ? Math.min(an[1] - 1, Math.floor(t * 8)) : Math.floor(t * 9) % an[1];
    c.save(); c.globalAlpha *= a; c.translate(Math.round(x), Math.round(y)); if (dir === 1) c.scale(-1, 1);
    c.drawImage(im, fr * 100, an[0] * 100, 100, 100, -sp.fx * scale, -sp.fy * scale, 100 * scale, 100 * scale); c.restore();
  }
}
function drawProj(c, spr, x, y, ang, t) {
  const sp = TINY[spr[1]], im = img(PATHS.tiny + sp.file); if (!ok(im) || !sp.proj) return false;
  const fr = sp.proj[0] + Math.floor(t * 10) % sp.proj[1];
  c.save(); c.translate(x, y); c.rotate(ang);
  c.drawImage(im, fr * 16, (1 + spr[2] * 4 + 1) * 16, 16, 16, -8, -8, 16, 16); c.restore();
  return true;
}

/* ---------------- utils ---------------- */
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash2(x, y, s = 0) { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function outlineText(c, s, x, y, col = "#fff", font = "8px 'Pixelify Sans'", align = "center") {
  c.font = font; c.textAlign = align; c.lineJoin = "round"; c.lineWidth = 2.5; c.strokeStyle = "#000"; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y); c.textAlign = "left";
}

/* =====================================================================
   GAME DATA
   ===================================================================== */
const ICON = {
  sap:IC(31,8), seeds:IC(26,0), rareSeeds:IC(28,15), scrap:IC(13,3), crystal:IC(10,13), spores:IC(15,8), coins:IC(8,2), potions:IC(17,8), bombs:IC(47,11),
  echo:IC(20,14), hp:IC(41,2), stamina:IC(41,0), day:IC(0,11), symb:IC(41,12), lock:IC(7,15), warden:IC(53,15), clear:IC(57,0), chest:IC(0,5), sword:IC(45,0),
};
const RES_NAMES = { sap:"Amber Sap", seeds:"Seeds", rareSeeds:"Rare Seeds", scrap:"Pre-collapse Scrap", crystal:"Moss Crystal", spores:"Spores", coins:"Barter Bits", potions:"Sap Tonic", bombs:"Resin Bomb" };
const CHAR = { player:16, kaelen:4, sylva:3, bram:9, elder:31 };
const REGIONS = {
  sun: { name:"The Sun-Crown", icon:IC(61,13), pos:[480,92], industrial:true, sanctuary:false, sunlit:true,
    desc:"High-altitude canopy bathed in golden light; rope-bridges over open sky.",
    foes:["paleWisp","gliderImp","canopyBear"], warden:"sunWarden", merchant:{ char:1, name:"Turbine-Wright Oda" },
    yield:{ sap:[1,2], seeds:[1,2], coins:[3,6] }, nodes:{ sap:2, seeds:3, scrap:1 },
    shop:[["graft","glider",32],["item","potions",6],["item","bombs",9]], tint:"rgba(255,205,90,0.10)" },
  trunk: { name:"The Twilight Trunk", icon:IC(1,15), pos:[480,250], industrial:false, sanctuary:true, sunlit:false,
    desc:"Humid mid-layer of bark ridges, amber sap pools and hollow-tree markets.",
    foes:["amberToad","sapSpider","amberToad"], warden:"trunkWarden", merchant:{ char:14, name:"Hollow-Market Fenn" },
    yield:{ sap:[2,3], seeds:[1,2], coins:[3,6] }, nodes:{ sap:4, seeds:2 },
    shop:[["graft","amber",40],["graft","beetle",24],["graft","thorn",14],["item","rareSeeds",12],["item","potions",6]], tint:"rgba(120,55,0,0.16)" },
  silt: { name:"The Silt-Floor", icon:IC(15,10), pos:[300,432], industrial:false, sanctuary:true, rootSinger:true, dark:true, bunker:true,
    desc:"Pitch-black floor of sunken skyscrapers, glowing ferns and toxic mist.",
    foes:["sporeShroom","siltShade","paleWatcher"], warden:"siltWarden", merchant:{ char:27, name:"Root-Singer Moss" },
    yield:{ spores:[2,3], scrap:[1,2], coins:[2,5] }, nodes:{ spores:3, scrap:3 },
    shop:[["graft","sporeFilter",14],["graft","echoBulb",30],["graft","ocelli",30],["item","rareSeeds",10]], tint:"rgba(30,15,70,0.22)" },
  glass: { name:"The Glass-Marsh", icon:IC(1,9), pos:[660,432], industrial:true, sanctuary:false, sunlit:true, bunker:true,
    desc:"A flooded ruin where solar glass fused with crystal-growing moss.",
    foes:["prismEye","marshToad","shardCreature"], warden:"glassWarden", merchant:{ char:19, name:"Salvager Quill" },
    yield:{ crystal:[1,2], scrap:[1,2], coins:[4,7] }, nodes:{ crystal:3, scrap:2, seeds:1 },
    shop:[["graft","prism",44],["graft","gillFronds",16],["item","bombs",8],["item","potions",7]], tint:"rgba(90,210,255,0.08)" },
};
const ROOTS = { name:"The Iron Roots", icon:IC(15,13), pos:[480,560], dark:true, foes:["rootDemon","bloodHorror","rootDemon","husk"], yield:{ scrap:[1,3], coins:[4,8] }, nodes:{ scrap:3 } };
const AREA = id => id === "roots" ? ROOTS : REGIONS[id];
const EDGES = [["sun","trunk"],["trunk","silt"],["trunk","glass"],["silt","glass"],["silt","roots"]];
const EXITS = {
  trunk:[{ side:"N", at:28, to:"sun" }, { side:"S", at:14, to:"silt" }, { side:"S", at:42, to:"glass" }],
  sun:  [{ side:"S", at:28, to:"trunk" }],
  silt: [{ side:"N", at:28, to:"trunk" }, { side:"E", at:20, to:"glass" }, { side:"S", at:28, to:"roots" }],
  glass:[{ side:"N", at:28, to:"trunk" }, { side:"W", at:20, to:"silt" }],
  roots:[{ side:"N", at:28, to:"silt" }],
};
const SEEDS = { trunk:101, sun:202, silt:303, glass:404, roots:505 };

const GRAFTS = {
  gillFronds: { name:"Gill-Fronds", slot:"resp", tier:1, icon:IC(15,1), desc:"Wade through water and sap. Sap pools in fights don't slow you." },
  sporeFilter:{ name:"Spore-Filter Lung", slot:"resp", tier:1, icon:IC(15,6), desc:"Immune to Spore-Miasma stamina drain and hallucinations." },
  photosynth: { name:"Photosynth-Skin", slot:"resp", tier:2, icon:IC(60,13), desc:"Slowly regenerate HP in sunlit regions. Solar flares heal you." },
  glider:     { name:"Glider-Membrane", slot:"resp", tier:2, icon:IC(59,13), desc:"Sun-Crown signature. +15% launch power; wind gusts can't push you." },
  prism:      { name:"Prism-Carapace", slot:"resp", tier:3, icon:IC(113,2), desc:"Reflects energy bolts and refraction beams. Active Refract: intangible for 2.5s." },
  vineWhip:   { name:"Vine-Whip Tendon", slot:"limb", tier:1, icon:IC(50,4), desc:"Active Lash: whip toward the enemy nearest your cursor at red-hot speed." },
  thorn:      { name:"Thorn-Knuckles", slot:"limb", tier:1, icon:IC(105,8), desc:"Ricochet hits deal +2 damage." },
  beetle:     { name:"Beetle-Shield Forearm", slot:"limb", tier:2, icon:IC(53,3), desc:"Active Brace (3s): halve damage taken and no wall cracks." },
  amber:      { name:"Amber-Heart", slot:"limb", tier:3, icon:IC(61,6), desc:"Twilight Trunk signature. Red-hot wall hits and damage taken store kinetic charge. Active Release: shockwave." },
  pheromone:  { name:"Pheromone-Gland", slot:"sense", tier:1, icon:IC(16,7), desc:"Active Calm: pacify the nearest natural beast. Root-Singers give 20% off." },
  ocelli:     { name:"Compound-Ocelli", slot:"sense", tier:2, icon:IC(44,14), desc:"Deeper bullet-time while aiming; 25% chance to dodge hits." },
  echoBulb:   { name:"Echo-Bulb", slot:"sense", tier:2, icon:IC(59,2), desc:"Silt-Floor signature. Sonar pierces darkness and extends your trajectory preview." },
  storm:      { name:"Storm-Pinion", slot:"resp", tier:3, icon:IC(49,1), mythic:true, desc:"Mythic. +30% launch power, immune to wind and flares." },
  resinTitan: { name:"Resin-Titan Heart", slot:"limb", tier:3, icon:IC(47,5), mythic:true, desc:"Mythic. +4 damage, +6 max HP, never cracks, sap-immune." },
  mycelCrown: { name:"Mycel-Crown", slot:"sense", tier:3, icon:IC(65,12), mythic:true, desc:"Mythic. Miasma-immune; your spores sting nearby enemies every second." },
  sunlens:    { name:"Sunlens-Eye", slot:"sense", tier:3, icon:IC(132,13), mythic:true, desc:"Mythic. Active Focus Beam toward your cursor: 7 energy damage to everything on the line." },
};
const SLOT_NAMES = { resp:"Respiratory", limb:"Limbs", sense:"Sensory" };
const SYMB_CAP = 8;
const MYTHIC = { sun:"storm", trunk:"resinTitan", silt:"mycelCrown", glass:"sunlens" };
const BREED = [["sporeFilter",{ spores:3, seeds:1 }],["gillFronds",{ seeds:2, crystal:1 }],["thorn",{ seeds:2, sap:2 }],["vineWhip",{ seeds:3 }],["photosynth",{ rareSeeds:2, sap:2 }],["echoBulb",{ spores:4, crystal:2 }],["ocelli",{ crystal:3, spores:2 }]];
const COMPANIONS = {
  kaelen:{ name:"Kaelen", char:CHAR.kaelen, role:"Ex-Industrialist Sap-Harvester", blurb:"Pressurized steam-lance and mechanical exosuit. Skeptical of the forest.",
    perks:["In fights: fires a steam-lance bolt every 4s (5 fire dmg)","Harvesting scrap/sap yields +1 scrap","Refinery recipes cost 1 less sap"] },
  sylva:{ name:"Sylva", char:CHAR.sylva, role:"Mycelial Oracle", blurb:"Blindfolded mystic who sees through nearby fungal spores.",
    perks:["In fights: spore darts slow enemies; hazard warnings last longer & hazards hurt half","Pulse map shows tomorrow's drift","Clearing waste restores +3 extra balance"] },
  bram:{ name:"Bram & Pip", char:CHAR.bram, role:"Scavenger Duo", blurb:"A heavy-set tinkerer and his trained messenger-moth.",
    perks:["In fights: Pip dive-bombs an enemy every 5s, stunning it","Can crack sealed pre-collapse bunkers (Root Echoes)","Salvage yields +1 scrap"] },
};
const UPGRADES = {
  greenhouse:{ name:"Apothecary Greenhouse", icon:IC(15,7), cost:{ sap:4, scrap:3, seeds:2 }, desc:"Breed grafts, and re-weave your graft loadout at camp." },
  refinery:  { name:"Sap-Refinery", icon:IC(7,12), cost:{ scrap:4, sap:2 }, desc:"Refine sap into Resin Bombs and Sap Tonics." },
  mast:      { name:"Signal-Mast", icon:IC(2,9), cost:{ scrap:3, crystal:2 }, desc:"Pulse map shows tomorrow's ecosystem forecast." },
};
const ECHOES = {
  sun:"ROOT ECHO // CANOPY NODE\nVERDANT-9 TERRAFORMING ARRAY — canopy layer online.\nAtmospheric scrubbers at 340% of design capacity.",
  trunk:"ROOT ECHO // SAP NETWORK\nNeural-root lattice synchronized across 4 biomes.\nNOTE: no termination routine specified by the Directorate.",
  silt:"ROOT ECHO // FLOOR NODE\nSECURITY PROTOCOL 'PALE' — dormant.\nTrigger: ecosystem divergence > threshold.\nAction: calcify, sever, RESET.",
  glass:"ROOT ECHO // SOLAR SUBSTRATE\nPower re-routed to Root-Core.\nManual override: physically located at Root-Core, Iron Roots.",
  siltBunker:"BUNKER LOG // SILT-7\n'We built a forest that thinks.\nWe forgot to build it a way to stop.'",
  glassBunker:"BUNKER LOG // MARSH-2\nEvacuation manifest: ARK PROGRAM cancelled.\nOcean crossing deemed 'unnecessary — the forest will provide.'",
};
const FOES = {
  paleWisp:     { name:"Pale Wisp", spr:["tiny","Ghost",0], hp:10, dmg:3, speed:40, blight:true, ai:"chase", flying:true },
  gliderImp:    { name:"Glider Imp", spr:["tiny","Imp",4], hp:9, dmg:3, speed:32, beast:true, ai:"shooter", flying:true, proj:{ speed:95, n:1, spread:0, cd:2.2, fire:true } },
  canopyBear:   { name:"Canopy Bear", spr:["tiny","Bear",1], hp:18, dmg:5, speed:28, beast:true, ai:"charger" },
  amberToad:    { name:"Amber Toad", spr:["tiny","Toad",2], hp:11, dmg:3, speed:34, beast:true, ai:"hopper", sapImmune:true },
  sapSpider:    { name:"Sap Spider", spr:["tiny","Spider",4], hp:12, dmg:4, speed:46, beast:true, ai:"chase", sapImmune:true },
  sporeShroom:  { name:"Spore Shroom", spr:["tiny","Mushrooms",4], hp:10, dmg:3, speed:22, beast:true, ai:"spore" },
  siltShade:    { name:"Silt Shade", spr:["tiny","Shadow",4], hp:12, dmg:4, speed:44, blight:true, ai:"chase" },
  paleWatcher:  { name:"Pale Watcher", spr:["tiny","Beholder",0], hp:14, dmg:3, speed:20, blight:true, ai:"shooter", proj:{ speed:80, n:3, spread:0.35, cd:2.8 } },
  prismEye:     { name:"Prism Eye", spr:["tiny","Beholder",1], hp:13, dmg:3, speed:22, beast:true, ai:"shooter", proj:{ speed:115, n:1, spread:0, cd:1.9, energy:true } },
  marshToad:    { name:"Marsh Toad", spr:["tiny","Toad",0], hp:11, dmg:3, speed:34, beast:true, ai:"hopper" },
  shardCreature:{ name:"Shard Creature", spr:["tiny","Creature",1], hp:18, dmg:4, speed:26, blight:true, armored:true, ai:"chase" },
  husk:         { name:"Calcified Husk", spr:["tiny","Ghost",5], hp:14, dmg:4, speed:38, blight:true, ai:"chase" },
  rootDemon:    { name:"Root Demon", spr:["big","Demon"], hp:20, dmg:5, speed:40, blight:true, ai:"chase" },
  bloodHorror:  { name:"Calcified Horror", spr:["big","Blood"], hp:26, dmg:6, speed:28, blight:true, armored:true, ai:"charger" },
  sunWarden:    { name:"Corona Warden", spr:["tiny","Bear",3], scale:2.4, hp:90, dmg:6, speed:20, boss:true, fire:true, ai:"boss", special:"flare" },
  trunkWarden:  { name:"Resin Colossus", spr:["tiny","Bear",0], scale:2.6, hp:100, dmg:7, speed:16, boss:true, armored:true, fire:true, ai:"boss", special:"sap" },
  siltWarden:   { name:"Pale Mycelarch", spr:["tiny","Necromancer",0], scale:2.4, hp:85, dmg:6, speed:18, boss:true, blight:true, ai:"boss", special:"spores" },
  glassWarden:  { name:"Prism Leviathan", spr:["tiny","Beholder",1], scale:2.6, hp:90, dmg:6, speed:20, boss:true, energy:true, ai:"boss", special:"beam" },
  coreGuardian: { name:"PALE Sentinel", spr:["big","Blood"], scale:1.8, hp:120, dmg:7, speed:22, boss:true, blight:true, armored:true, ai:"boss", special:"summon" },
};

/* =====================================================================
   STATE
   ===================================================================== */
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

/* =====================================================================
   CANVAS / INPUT
   ===================================================================== */
const VW = 384, VH = 240;
const cv = document.getElementById("game"), ctx = cv.getContext("2d");
let S = 3;
function resize() {
  S = Math.max(1, Math.floor(Math.min(innerWidth / VW, innerHeight / VH)));
  cv.width = VW * S; cv.height = VH * S; cv.style.width = VW * S + "px"; cv.style.height = VH * S + "px";
}
addEventListener("resize", resize); resize();
function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
}
function updateFsBtn() {
  const b = document.getElementById("fs-btn");
  if (!b) return;
  const fs = isFullscreen();
  b.innerHTML = fs ? "✕ Exit (F)" : "⛶ Fullscreen";
  b.title = fs ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)";
}
function toggleFullscreen() {
  if (!isFullscreen()) {
    const el = document.documentElement;
    const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (rfs) rfs.call(el).catch(() => {});
  } else {
    const efs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (efs) efs.call(document).catch(() => {});
  }
}
["fullscreenchange","webkitfullscreenchange","mozfullscreenchange","MSFullscreenChange"].forEach(ev => {
  document.addEventListener(ev, () => { resize(); updateFsBtn(); });
});
updateFsBtn();
const keys = {}; let pressed = {};
addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  if (!keys[k]) pressed[k] = true; keys[k] = true;
  if ([" ","arrowup","arrowdown","arrowleft","arrowright","tab"].includes(k)) e.preventDefault();
  onKeyUI(k);
});
addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
addEventListener("blur", () => { for (const k in keys) keys[k] = false; });
const mouse = { x:0, y:0, down:false };
function toInternal(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * VW, (e.clientY - r.top) / r.height * VH]; }
cv.addEventListener("pointerdown", e => { [mouse.x, mouse.y] = toInternal(e); if (e.button === 2) { if (E) E.aim = null; return; } mouse.down = true; try { cv.setPointerCapture(e.pointerId); } catch (_) {} if (mode === "encounter") encPointerDown(); });
cv.addEventListener("pointermove", e => { [mouse.x, mouse.y] = toInternal(e); });
cv.addEventListener("pointerup", e => { [mouse.x, mouse.y] = toInternal(e); mouse.down = false; if (mode === "encounter") encPointerUp(); });
cv.addEventListener("contextmenu", e => e.preventDefault());

/* =====================================================================
   UI: toast, HUD, dialog, panels
   ===================================================================== */
function toast(html, col) { const d = document.createElement("div"); d.innerHTML = html; if (col) d.style.color = col; document.getElementById("toast").appendChild(d); setTimeout(() => d.remove(), 3300); }
let DLG = null;
function say(lines, opt = {}) { DLG = { lines:[].concat(lines), i:0, shown:0, opt, sel:0 }; drawDialog(); document.getElementById("dialog").classList.remove("hidden"); }
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
  if (k === "f") { toggleFullscreen(); pressed[k] = false; return; }
  if (mode === "title" || mode === "ending") return;
  if (panelOpen) { if (k === "escape" || (k === "i" && panelRender === invPanel) || (k === "m" && panelRender === pulsePanel)) closePanel(); pressed[k] = false; return; }
  if (DLG) {
    const opts = dlgOptions();
    if (opts.length && (k === "arrowup" || k === "w")) { DLG.sel = (DLG.sel + opts.length - 1) % opts.length; drawDialog(); }
    else if (opts.length && (k === "arrowdown" || k === "s")) { DLG.sel = (DLG.sel + 1) % opts.length; drawDialog(); }
    else if (["enter"," ","e","z"].includes(k)) { if (opts.length) chooseOpt(); else advanceDialog(); }
    else if (k === "escape" && opts.length) { const leave = opts.findIndex(o => /leave|not now|back|not yet/i.test(o.label)); if (leave >= 0) { DLG.sel = leave; chooseOpt(); } }
    pressed[k] = false;
    return;
  }
  if (mode === "world") {
    if (k === "m") { openPanel(pulsePanel); pressed[k] = false; }
    else if (k === "i" || k === "tab") { openPanel(invPanel); pressed[k] = false; }
  }
  if (mode === "encounter" && E) encKey(k);
}
let hudT = 0;
function renderHud() {
  const show = mode === "world";
  document.getElementById("hud").classList.toggle("hidden", !show);
  document.getElementById("keys").classList.toggle("hidden", !show);
  if (!show || !G) return;
  const A = AREA(G.loc), r = G.regions[G.loc];
  const st = r ? status(r.bal) : null;
  document.getElementById("hudL").innerHTML = `<div class="row" style="gap:6px">${iconHTML(ICON.hp, 18)}<div class="bar"><i style="width:${G.hp / maxHp() * 100}%;background:#e0473f"></i></div><span class="small">${Math.ceil(G.hp)}/${maxHp()}</span></div>
    <div class="small">${iconHTML(A.icon, 16)} ${A.name} ${st ? `<span class="chip ${st}">${STATUS_LABEL[st]} ${r.bal}</span>` : ""}</div>
    <div class="small muted">Day ${G.day} · ${PHASES[G.phase]} · ${iconHTML(ICON.echo, 14)} ${G.echoes.length}/3 · Symbiosis <span style="color:${overgrown() ? "#e0473f" : "#9ad04a"}">${symbiosis()}/${SYMB_CAP}</span></div>`;
  document.getElementById("hudR").innerHTML = ["sap","seeds","rareSeeds","scrap","crystal","spores","coins","potions","bombs"].map(k => `<span title="${RES_NAMES[k]}">${iconHTML(ICON[k], 18)}${G.res[k]}</span>`).join("");
  document.getElementById("keys").innerHTML = `<kbd>WASD</kbd> move · <kbd>Shift</kbd> run · <kbd>E</kbd> interact · <kbd>I</kbd> grafts & bag · <kbd>M</kbd> Pulse map · <kbd>F</kbd> fullscreen`;
}

/* =====================================================================
   WORLD GENERATION
   ===================================================================== */
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
  const W = { id, G:new Array(N), T:new Uint8Array(N), path:new Uint8Array(N), kind:new Uint8Array(N), objAt:new Uint8Array(N), objs:[], decor:[], nodes:[], npcs:[], exits:[] };
  const base = { sun:["grass2","grass","grass2"], trunk:["green","grass","green","grass2"], silt:["dgrass","dgrass2"], glass:["grass","grass2"], roots:["rockfloor"] }[id];
  for (let i = 0; i < N; i++) W.G[i] = base[Math.floor(rng() * base.length)];
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
  if (id !== "roots") for (let i = 0; i < N; i++) if (W.path[i]) {
    if (W.kind[i] === 1) continue;
    const t = W.T[i];
    if (t === T_VOID || t === T_WATER || t === T_SAP) { W.T[i] = T_WALK; W.G[i] = "plankV"; }
    else { W.T[i] = T_WALK; W.kind[i] = 0; W.G[i] = "dirt"; }
  }
  if (id !== "roots") blob(camp.x, camp.y, 4, (x, y) => { const i = ix(x, y); W.T[i] = T_WALK; W.kind[i] = 0; W.G[i] = "dirt"; });
  const free = (x, y) => inb(x, y) && W.T[ix(x, y)] === T_WALK && !W.path[ix(x, y)] && !W.objAt[ix(x, y)];
  function place(key, tx, ty, force) {
    const o = OBJ[key] || { fw:1, soft:true }, fw = o.fw, fh = o.fh || 1;
    for (let y = ty - fh + 1; y <= ty; y++) for (let x = tx; x < tx + fw; x++) {
      if (!inb(x, y)) return false;
      if (!force && !free(x, y)) return false;
      if (force && W.objAt[ix(x, y)]) return false;
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
  for (let i = 0; i < 160; i++) { const x = rnd2(rng, 1, MW - 2), y = rnd2(rng, 1, MH - 2); if (W.T[ix(x, y)] === T_WALK && !W.objAt[ix(x, y)]) W.decor.push({ key:deco[Math.floor(rng() * deco.length)], x:x * TL + 8 + (rng() - 0.5) * 6, y:(y + 1) * TL - 1 }); }
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
  let best = -1, bi = 0; for (let i = 0; i < N; i++) if (reach[i] > best && !W.objAt[i] && W.kind[i] === 0) { best = reach[i]; bi = i; }
  W.lair = { x:(bi % MW) * TL + 8, y:(Math.floor(bi / MW) + 1) * TL - 2 };
  if (id === "roots") W.nodes.push({ id:"core", type:"core", x:W.coreAt.x * TL + 8, y:(W.coreAt.y + 1) * TL - 2 });
  if (id !== "roots") {
    const R = REGIONS[id];
    W.npcs.push({ kind:"merchant", char:R.merchant.char, name:R.merchant.name, x:W.camp.x + 52, y:W.camp.y + 20, dir:1 });
    if (R.sanctuary) W.npcs.push({ kind:"elder", char:CHAR.elder, name:"Root-Singer Elder", x:W.camp.x - 44, y:W.camp.y + 22, dir:2 });
  }
  W.spawnSpots = spots.filter(i => reach[i] > 12);
  W.bg = bakeBg(W);
  return W;
}
function bakeBg(W) {
  const c = document.createElement("canvas"); c.width = MW * TL; c.height = MH * TL;
  const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
  const ix = (a, b) => b * MW + a;
  for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) {
    const i = ix(tx, ty), t = W.T[i], X = tx * TL, Y = ty * TL;
    if (t === T_VOID) {
      x.fillStyle = `hsl(200,70%,${76 + (ty / MH) * 10}%)`; x.fillRect(X, Y, TL, TL);
      if (hash2(tx, ty, 9) < 0.1) { x.fillStyle = "#ffffffcc"; x.beginPath(); x.ellipse(X + 8, Y + 9, 9, 3, 0, 0, 7); x.fill(); }
      continue;
    }
    t16(x, W.G[i], X, Y, TL, TL);
    if (t === T_WATER) t16(x, "water", X, Y, TL, TL);
    if (t === T_SAP) { t16(x, "water", X, Y, TL, TL); x.fillStyle = "rgba(190,95,5,0.88)"; x.fillRect(X, Y, TL, TL); x.fillStyle = "rgba(255,190,70,0.35)"; x.fillRect(X + (tx * 7 % 10), Y + 3 + (ty * 5 % 9), 5, 1); if (hash2(tx, ty, 4) < 0.3) { x.fillStyle = "#ffe0a0"; x.fillRect(X + 4, Y + 9, 2, 2); } }
    if (W.G[i] === "plankV") { x.fillStyle = "rgba(0,0,0,0.18)"; x.fillRect(X, Y + 14, TL, 2); }
    if (t === T_WALL && W.kind[i] === 2) t16(x, "steps", X, Y, TL, TL);
    if (t === T_WALL && W.kind[i] === 4) { x.fillStyle = "rgba(6,4,12,0.9)"; x.fillRect(X, Y, TL, TL); if (ty + 1 < MH && W.T[ix(tx, ty + 1)] === T_WALK) { x.fillStyle = "#3a3340"; x.fillRect(X, Y + 12, TL, 4); } }
    if (t === T_WALL && W.kind[i] === 1) { x.fillStyle = "rgba(0,0,0,0.3)"; x.fillRect(X, Y, TL, TL); }
    if (ty + 1 < MH && W.T[ix(tx, ty + 1)] === T_VOID) { x.fillStyle = "#6b4a2a"; x.fillRect(X, Y + 13, TL, 3); x.fillStyle = "#3d2914"; x.fillRect(X, Y + 15, TL, 1); }
    if ((t === T_WATER || t === T_SAP) && ty > 0 && W.T[ix(tx, ty - 1)] === T_WALK) { x.fillStyle = "rgba(255,255,255,0.35)"; x.fillRect(X, Y, TL, 1); }
  }
  for (const d of W.decor) { const r = TS16[d.key]; t16(x, d.key, d.x - r[2] / 2, d.y - r[3]); }
  return c;
}

/* =====================================================================
   WORLD RUNTIME
   ===================================================================== */
let mode = "title", M = null, PL = null, FOL = null, WFOES = [], WARDEN = null, trail = [], encCooldown = 0, worldT = 0, interactTarget = null;
const fade = { a:0, dir:0, cb:null };
function doFade(cb) { fade.dir = 1; fade.cb = cb; }
function getWorld(id) { if (!WORLDS[id]) WORLDS[id] = genRegion(id); return WORLDS[id]; }
function enterRegion(id, from) {
  M = getWorld(id); G.loc = id;
  let sx = M.camp.x, sy = M.camp.y + 44;
  if (id === "roots") { sx = 28 * TL + 8; sy = 4 * TL; }
  if (from) { const e = M.exits.find(e => e.to === from); if (e) { sx = e.spawnX; sy = e.spawnY; } }
  PL = { x:sx, y:sy, dir:0, t:0, moving:false }; FOL = { x:sx, y:sy - 2, dir:0, t:0 }; trail = [];
  spawnFoes(); spawnWarden();
  mode = "world"; encCooldown = 1; save(); renderHud();
}
function spawnFoes() {
  WFOES = [];
  const A = AREA(G.loc), st = REGIONS[G.loc] ? status(G.regions[G.loc].bal) : "depleted";
  let n = G.loc === "roots" ? 9 : { balanced:4, depleted:6, enraged:8 }[st];
  const types = [...A.foes]; if (st === "enraged" && G.loc !== "roots") types.push("husk", "husk");
  const spots = M.spawnSpots;
  for (let i = 0, tries = 0; i < n && spots.length && tries < 200; tries++) {
    const s = spots[Math.floor(Math.random() * spots.length)], x = (s % MW) * TL + 8, y = (Math.floor(s / MW) + 1) * TL - 2;
    if (Math.hypot(x - PL.x, y - PL.y) < 110) continue;
    WFOES.push({ type:types[i % types.length], x, y, dir:0, t:Math.random(), tx:x, ty:y, wait:Math.random() * 2, stun:0, home:{ x, y } }); i++;
  }
}
function spawnWarden() {
  WARDEN = null;
  if (G.loc === "roots") { if (!G.coreDown) { const c = M.nodes.find(n => n.type === "core"); WARDEN = { type:"coreGuardian", x:c.x, y:c.y - 40, t:0 }; } return; }
  if (G.regions[G.loc].warden) WARDEN = { type:REGIONS[G.loc].warden, x:M.lair.x, y:M.lair.y, t:0 };
}
function solidAt(px, py) {
  const tx = Math.floor(px / TL), ty = Math.floor(py / TL);
  if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true;
  const t = M.T[ty * MW + tx];
  if (t === T_WALK) return false;
  if ((t === T_WATER || t === T_SAP) && has("gillFronds")) return false;
  return true;
}
const feetBlocked = (x, y) => solidAt(x - 4, y - 3) || solidAt(x + 4, y - 3) || solidAt(x - 4, y) || solidAt(x + 4, y);
function tryMove(o, dx, dy) {
  let moved = false;
  if (dx && !feetBlocked(o.x + dx, o.y)) { o.x += dx; moved = true; }
  if (dy && !feetBlocked(o.x, o.y + dy)) { o.y += dy; moved = true; }
  return moved;
}
const nodeUsed = n => n.type === "chest" ? !!G.opened[G.loc + n.id] : n.type === "bunker" ? !!(G.regions[G.loc] && G.regions[G.loc].bunker) : n.type === "core" ? false : G.used[G.loc + n.id] === G.day;
const NODE_INFO = {
  sap:{ label:"Tap Amber Sap", icon:ICON.sap, base:"sapPool", yield:{ sap:[1,3] } },
  seeds:{ label:"Gather Seeds", icon:ICON.seeds, base:"bush", yield:{ seeds:[1,2] } },
  scrap:{ label:"Salvage Scrap", icon:ICON.scrap, base:"logs", yield:{ scrap:[1,2] } },
  crystal:{ label:"Chip Moss Crystal", icon:ICON.crystal, base:"rock2", yield:{ crystal:[1,2] } },
  spores:{ label:"Collect Spores", icon:ICON.spores, base:"mrock2", yield:{ spores:[1,3] } },
  waste:{ label:"Clear Industrial Waste", icon:ICON.clear, base:"log" },
  chest:{ label:"Open Cache", icon:ICON.chest, base:"chest" },
  bunker:{ label:"Sealed Bunker", icon:ICON.lock, base:"door" },
  core:{ label:"The Root-Core", icon:ICON.echo, base:"core" },
};
function updateWorld(dt) {
  worldT += dt;
  let mx = (keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0);
  let my = (keys["s"] || keys["arrowdown"] ? 1 : 0) - (keys["w"] || keys["arrowup"] ? 1 : 0);
  PL.moving = false;
  if (mx || my) {
    const l = Math.hypot(mx, my); mx /= l; my /= l;
    let spd = keys["shift"] ? 104 : 68;
    const tt = M.T[Math.floor(PL.y / TL) * MW + Math.floor(PL.x / TL)];
    if (tt === T_WATER || tt === T_SAP) spd *= 0.5;
    PL.dir = Math.abs(mx) > Math.abs(my) ? (mx < 0 ? 1 : 2) : (my < 0 ? 3 : 0);
    PL.moving = tryMove(PL, mx * spd * dt, my * spd * dt);
    PL.t += dt * (keys["shift"] ? 1.5 : 1);
    if (PL.moving) { trail.push({ x:PL.x, y:PL.y, dir:PL.dir }); if (trail.length > 80) trail.shift(); }
  }
  const tgt = trail[trail.length - 14];
  FOL.moving = false;
  if (tgt) { const d = Math.hypot(tgt.x - FOL.x, tgt.y - FOL.y); if (d > 0.5) { FOL.moving = true; FOL.x += (tgt.x - FOL.x) * Math.min(1, dt * 10); FOL.y += (tgt.y - FOL.y) * Math.min(1, dt * 10); FOL.dir = tgt.dir; FOL.t += dt; } }
  for (const e of M.exits) {
    const near = e.side === "N" ? PL.y < 12 : e.side === "S" ? PL.y > MH * TL - 6 : e.side === "W" ? PL.x < 8 : PL.x > MW * TL - 8;
    const along = e.side === "N" || e.side === "S" ? Math.abs(PL.x - (e.at * TL + 8)) < 30 : Math.abs(PL.y - (e.at * TL + 8)) < 30;
    if (near && along) { travelTo(e.to); return; }
  }
  encCooldown = Math.max(0, encCooldown - dt);
  const safe = G.loc !== "roots" && Math.hypot(PL.x - M.camp.x, PL.y - M.camp.y) < 70;
  for (const f of WFOES) {
    f.t += dt;
    if (f.stun > 0) { f.stun -= dt; f.moving = false; continue; }
    const F = FOES[f.type], d = Math.hypot(PL.x - f.x, PL.y - f.y) || 1;
    let vx = 0, vy = 0;
    if (d < 90 && !safe && encCooldown <= 0) { vx = (PL.x - f.x) / d; vy = (PL.y - f.y) / d; f.moving = tryMove(f, vx * F.speed * 0.95 * dt, vy * F.speed * 0.95 * dt); f.chasing = true; }
    else {
      f.chasing = false;
      if (f.wait > 0) { f.wait -= dt; f.moving = false; }
      else { const dx = f.tx - f.x, dy = f.ty - f.y, dd = Math.hypot(dx, dy);
        if (dd < 2) { f.wait = 1 + Math.random() * 2.5; f.tx = f.home.x + (Math.random() - 0.5) * 120; f.ty = f.home.y + (Math.random() - 0.5) * 90; }
        else { vx = dx / dd; vy = dy / dd; f.moving = tryMove(f, vx * 18 * dt, vy * 18 * dt); if (!f.moving) { f.wait = 0.5; f.tx = f.x; f.ty = f.y; } } }
    }
    if (vx || vy) f.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 1 : 2) : (vy < 0 ? 3 : 0);
    if (d < 12 && encCooldown <= 0 && !safe) { startEncounterFromWorld(f); return; }
  }
  interactTarget = findInteract();
  const pr = document.getElementById("prompt");
  if (interactTarget) { pr.classList.remove("hidden"); pr.innerHTML = `<kbd>E</kbd> ${interactTarget.label}`; } else pr.classList.add("hidden");
  if (interactTarget && (pressed["e"] || pressed[" "] || pressed["enter"])) { pr.classList.add("hidden"); interactTarget.fn(); }
}
function findInteract() {
  const cands = [];
  if (G.loc !== "roots") cands.push({ x:M.camp.x, y:M.camp.y + 2, r:46, label:"Strider-Caravan camp", fn:campDialog });
  for (const n of M.npcs) cands.push({ x:n.x, y:n.y, r:22, label:`Talk to ${n.name}`, fn:() => npcDialog(n) });
  for (const n of M.nodes) if (!nodeUsed(n) || n.type === "bunker") cands.push({ x:n.x, y:n.y, r:20, label:NODE_INFO[n.type].label, fn:() => nodeInteract(n) });
  if (WARDEN) cands.push({ x:WARDEN.x, y:WARDEN.y, r:40, label:`Approach the ${FOES[WARDEN.type].name}`, fn:wardenDialog });
  let best = null, bd = 1e9;
  for (const c of cands) { const d = Math.hypot(c.x - PL.x, c.y - PL.y); if (d < c.r && d < bd) { bd = d; best = c; } }
  return best;
}
function travelTo(to) {
  if (to === "roots" && G.echoes.length < 3) {
    PL.y -= 16;
    return say(["Calcified root-walls seal the way down to the Iron Roots.", `You need 3 Root Echoes to understand how to pass. (You have ${G.echoes.length}.)`], { icon:ROOTS.icon, name:"The Iron Roots" });
  }
  if (fade.dir) return;
  const from = G.loc;
  doFade(() => { advancePhase(2); if (G.over) return; log(`Travelled to ${AREA(to).name}.`); enterRegion(to, from); toast(`${AREA(to).name}`); });
}

/* ---------- world interactions ---------- */
function nodeInteract(n) {
  const id = G.loc, R = REGIONS[id], st = R ? status(G.regions[id].bal) : "balanced", info = NODE_INFO[n.type];
  if (["sap","seeds","scrap","crystal","spores"].includes(n.type)) {
    if (st === "enraged") return say(["The forest recoils from your hand. Nothing can be harvested while the Warden rages."]);
    const mult = st === "depleted" ? 0.5 : 1;
    let got = gain(info.yield, mult);
    if (G.companion === "kaelen" && (n.type === "scrap" || n.type === "sap")) got += " " + gain({ scrap:1 });
    if (G.companion === "bram" && n.type === "scrap") got += " " + gain({ scrap:1 });
    if (n.type === "seeds" && Math.random() < 0.25) got += " " + gain({ rareSeeds:1 });
    G.used[id + n.id] = G.day; changeBal(id, -4); advancePhase(1);
    toast(`${info.label}: ${got || "nothing"}${R ? ` <span style="color:#e8cf4a">(−4 balance)</span>` : ""}`); log(`Harvested ${n.type}.`); return save();
  }
  if (n.type === "waste") {
    const amt = 6 + (G.companion === "sylva" ? 3 : 0);
    return say(["Rusted pre-collapse machinery leaks into the soil here.", `Clear it? (+${amt} balance, +1 scrap, takes time)`], { icon:ICON.clear, name:"Industrial waste",
      options:[{ label:"Clear it", fn:() => { G.used[id + n.id] = G.day; changeBal(id, amt); const got = gain({ scrap:1 }); advancePhase(1); toast(`Waste cleared: +${amt} balance ${got}`, "#9ad04a"); log("Cleared waste."); save(); } }, { label:"Leave it" }] });
  }
  if (n.type === "chest") {
    G.opened[id + n.id] = true;
    const got = gain({ rareSeeds:1, coins:[6,12], sap:[0,2], potions:Math.random() < 0.4 ? 1 : 0 });
    toast(`Cache: ${got}`, "#ffd27a"); return save();
  }
  if (n.type === "bunker") {
    if (G.regions[id].bunker) return say(["The bunker is empty now. Only humming walls remain."]);
    if (G.companion !== "bram") return say(["A sealed pre-collapse bunker door, crusted with moss.", "Bram & Pip could probably crack this open."], { icon:ICON.lock, name:"Sealed bunker" });
    const key = id + "Bunker";
    G.regions[id].bunker = true; G.echoes.push(key); const got = gain({ scrap:3, crystal:1, coins:10 }); advancePhase(1);
    log("Opened a bunker: Root Echo."); save();
    return say(["Bram wedges his wrench into the seal while Pip flutters through a vent...", "Click. Hiss. The door groans open.", ECHOES[key], `Root Echo recovered (${G.echoes.length}/3).`], { char:CHAR.bram, name:"Bram & Pip", onClose:() => toast(`Bunker loot: ${got}`) });
  }
  if (n.type === "core") return coreDialog();
}
function npcDialog(n) {
  if (n.kind === "merchant") {
    const id = G.loc, R = REGIONS[id], st = status(G.regions[id].bal);
    if (st === "enraged") return say(["Not now! The Warden's prowling — I've boarded up the stall."], { char:n.char, name:n.name });
    if (R.industrial && overgrown()) return say(["Keep your rot outside, plant-thing.", "Prune those grafts and maybe we'll talk."], { char:n.char, name:n.name });
    return say([R.rootSinger ? "The roots hum your name, traveller. Trade?" : "Fresh stock off the highways. What'll it be?"], { char:n.char, name:n.name, options:[{ label:"Trade", fn:() => openPanel(shopPanel) }, { label:"Ask about the forest", fn:() => say([forestRumor(id)], { char:n.char, name:n.name }) }, { label:"Leave" }] });
  }
  if (n.kind === "elder") {
    return say(["Child of graft and bark. The Root-Singers can re-weave your grafts...", "...or prune the wild growth that clings to you."], { char:n.char, name:n.name,
      options:[{ label:"Re-weave grafts", fn:() => openPanel(loadoutPanel) },
        { label:"Prune taint & heal (2 sap)", disabled:(G.taint > 0 || G.hp < maxHp()) ? (canAfford({ sap:2 }) ? null : "need 2 sap") : "nothing to prune", fn:() => { pay({ sap:2 }); G.taint = 0; G.hp = maxHp(); toast("Pruned. Taint reset; fully healed.", "#9ad04a"); save(); } },
        { label:"Leave" }] });
  }
}
function forestRumor(id) {
  const s = status(G.regions[id].bal);
  if (s === "enraged") return "The forest's furious. Hunt the Warden, or bring rare seeds and sap for a Restoration Ritual.";
  if (s === "depleted") return "Too much harvesting. Clear some of that rusted waste and the place breathes easier.";
  return "Balanced, for now. Don't take more than the forest can give.";
}
function campDialog() {
  say(["The Strider-Caravan kneels by the campfire, chewing leaves."], { icon:IC(1,8), name:"Strider-Caravan",
    options:[{ label:"Rest until dawn (heal)", fn:() => doFade(() => { G.phase = 0; advanceDay(); if (G.over) return showCollapse(); G.hp = maxHp(); log("Rested at camp."); spawnFoes(); spawnWarden(); toast(`Day ${G.day}. You wake rested.`, "#9ad04a"); save(); }) },
      { label:"Caravan (companions, upgrades, crafting)", fn:() => openPanel(campPanel) }, { label:"Leave" }] });
}
function wardenDialog() {
  const W = FOES[WARDEN.type];
  if (WARDEN.type === "coreGuardian") return say(["A calcified sentinel uncoils before the Root-Core. It has no voice — only the PALE protocol's hum."], { name:W.name, icon:ICON.warden, options:[{ label:"Fight", fn:() => startEncounter([WARDEN.type], { boss:true }) }, { label:"Back away" }] });
  const cost = { rareSeeds:2, sap:3, seeds:2 };
  say([`The ${W.name} towers over the clearing, ${G.loc === "sun" ? "blazing" : G.loc === "trunk" ? "dripping resin" : G.loc === "silt" ? "exhaling pale spores" : "refracting light"}.`, "Hunt it for a mythic graft, or sing it to sleep with a Restoration Ritual."],
    { name:W.name, icon:ICON.warden, options:[
      { label:"Hunt the Warden (boss fight)", fn:() => startEncounter([WARDEN.type], { boss:true }) },
      { label:"Restoration Ritual (2 rare seeds, 3 sap, 2 seeds)", disabled:canAfford(cost) ? null : "missing materials", fn:() => ritual(cost) },
      { label:"Leave" }] });
}
function ritual(cost) {
  const id = G.loc, r = G.regions[id];
  pay(cost); r.bal = 75; r.warden = false; G.stats.rituals++; WARDEN = null; advancePhase(1);
  const lines = ["You plant the rare seeds in cleared soil and hum the old Root-Singer canticle...", "The Warden sinks into the earth, and the forest exhales."];
  if (!r.echo) { r.echo = true; G.echoes.push(id); lines.push("The neural-root hums a memory into you:", ECHOES[id]); log("Root Echo received."); }
  log("Restoration Ritual performed."); save();
  say(lines, { char:CHAR.player, name:"Restoration Ritual" });
}
function coreDialog() {
  if (WARDEN) return say(["The PALE Sentinel blocks the way."]);
  const opts = [
    { label:"Symbiosis — merge with the neural-root", disabled:(overgrown() || G.stats.rituals >= 2) ? null : "be Overgrown, or perform 2 rituals", fn:() => ending("symbiosis") },
    { label:"Dominion — sever the root with Kaelen's tech", disabled:(G.companion === "kaelen" && G.res.scrap >= 10) ? null : "travel with Kaelen + 10 scrap", fn:() => ending("dominion") },
    { label:"Migration — build the ark and leave", disabled:(G.companion === "bram" && Object.values(G.upgrades).every(Boolean)) ? null : "travel with Bram & Pip + all 3 caravan upgrades", fn:() => ending("migration") },
    { label:"Not yet" }];
  say([...G.echoes.map(k => ECHOES[k]), "The truth: the forest is VERDANT-9, a terraforming project left running with no off-switch.", "The Great Wilt is its security protocol, PALE, waking to 'reset' an ecosystem that drifted from spec.", "The Root-Core pulses in front of you. Choose the forest's future."], { icon:ROOTS.icon, name:"The Root-Core", options:opts });
}

/* ---------- world drawing ---------- */
function drawWorld() {
  const camX = clamp(Math.round(PL.x - VW / 2), 0, MW * TL - VW), camY = clamp(Math.round(PL.y - 10 - VH / 2), 0, MH * TL - VH);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, VW, VH);
  ctx.drawImage(M.bg, camX, camY, VW, VH, 0, 0, VW, VH);
  const t = worldT, list = [];
  const vis = (x, y) => x > camX - 60 && x < camX + VW + 60 && y > camY - 10 && y < camY + VH + 80;
  for (const o of M.objs) if (vis(o.x, o.y)) list.push({ y:o.y, d:() => { const r = TS16[o.key]; t16(ctx, o.key, o.x - camX - r[2] / 2, o.y - camY - r[3] + 1); } });
  if (G.loc !== "roots") list.push({ y:M.camp.fy, d:() => t16(ctx, Math.floor(t * 6) % 2 ? "fire1" : "fire2", M.camp.fx - camX - 8, M.camp.fy - camY - 13) });
  for (const n of M.nodes) if (vis(n.x, n.y)) list.push({ y:n.y, d:() => drawNode(n, n.x - camX, n.y - camY, t) });
  for (const n of M.npcs) if (vis(n.x, n.y)) list.push({ y:n.y, d:() => { drawChar(ctx, n.char, n.dir, 1, n.x - camX, n.y - camY); if (Math.hypot(PL.x - n.x, PL.y - n.y) < 50) outlineText(ctx, n.name, n.x - camX, n.y - camY - 23, "#ffe9a8", "6px 'Pixelify Sans'"); } });
  const dark = AREA(G.loc).dark && !has("echoBulb") && !has("mycelCrown");
  for (const f of WFOES) if (vis(f.x, f.y)) {
    if (dark && Math.hypot(f.x - PL.x, f.y - PL.y) > 70) continue;
    list.push({ y:f.y, d:() => { const F = FOES[f.type]; const sc = F.spr[0] === "big" ? 0.75 : 1;
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(f.x - camX, f.y - camY, 6, 2, 0, 0, 7); ctx.fill();
      drawFoeSprite(ctx, F.spr, f.moving ? "walk" : "idle", f.t, f.dir, f.x - camX, f.y - camY - (F.flying ? 3 + Math.sin(t * 4 + f.x) * 2 : 0), sc, f.stun > 0 ? 0.5 : 1);
      if (f.chasing) outlineText(ctx, "!", f.x - camX, f.y - camY - 18, "#ff5a5a", "bold 9px 'Pixelify Sans'"); } });
  }
  if (WARDEN && vis(WARDEN.x, WARDEN.y)) list.push({ y:WARDEN.y, d:() => { const F = FOES[WARDEN.type], X = WARDEN.x - camX, Y = WARDEN.y - camY;
    const g = ctx.createRadialGradient(X, Y - 14, 2, X, Y - 14, 34); g.addColorStop(0, "rgba(255,40,40,0.4)"); g.addColorStop(1, "rgba(255,40,40,0)"); ctx.fillStyle = g; ctx.fillRect(X - 40, Y - 50, 80, 70);
    drawFoeSprite(ctx, F.spr, "idle", t, 0, X, Y, F.spr[0] === "big" ? 1.3 : 2.2); outlineText(ctx, F.name, X, Y - 42, "#ff8a80", "7px 'Pixelify Sans'"); } });
  list.push({ y:FOL.y, d:() => drawChar(ctx, COMPANIONS[G.companion].char, FOL.dir, FOL.moving ? [0,1,2,1][Math.floor(FOL.t * 8) % 4] : 1, FOL.x - camX, FOL.y - camY) });
  list.push({ y:PL.y + 0.1, d:() => { const X = PL.x - camX, Y = PL.y - camY;
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(X, Y, 6, 2, 0, 0, 7); ctx.fill();
    drawChar(ctx, CHAR.player, PL.dir, PL.moving ? [0,1,2,1][Math.floor(PL.t * 8) % 4] : 1, X, Y);
    if (overgrown()) { ctx.strokeStyle = "#58b84f"; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { const a = t + i * 2.1; ctx.beginPath(); ctx.arc(X, Y - 10, 10, a, a + 0.8); ctx.stroke(); } } } });
  list.sort((a, b) => a.y - b.y); for (const it of list) it.d();
  for (const e of M.exits) {
    const X = (e.side === "W" ? 34 : e.side === "E" ? MW * TL - 34 : e.at * TL + 8) - camX, Y = (e.side === "N" ? 22 : e.side === "S" ? MH * TL - 10 : e.at * TL + 8) - camY;
    if (X > -60 && X < VW + 60 && Y > -20 && Y < VH + 20) { const locked = e.to === "roots" && G.echoes.length < 3;
      outlineText(ctx, `${{ N:"▲", S:"▼", W:"◀", E:"▶" }[e.side]} ${AREA(e.to).name}${locked ? " (sealed)" : ""}`, X, Y, locked ? "#bbb" : "#ffe46a", "7px 'Pixelify Sans'"); }
  }
  const A = AREA(G.loc);
  if (A.tint) { ctx.fillStyle = A.tint; ctx.fillRect(0, 0, VW, VH); }
  const st = REGIONS[G.loc] ? status(G.regions[G.loc].bal) : null;
  if (st === "enraged") { const g = ctx.createRadialGradient(VW / 2, VH / 2, 80, VW / 2, VH / 2, 240); g.addColorStop(0, "rgba(200,0,0,0)"); g.addColorStop(1, `rgba(200,0,0,${0.28 + Math.sin(t * 3) * 0.08})`); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
  if (st === "depleted") { ctx.fillStyle = "rgba(120,110,40,0.08)"; ctx.fillRect(0, 0, VW, VH); }
  const phaseTint = ["rgba(255,190,140,0.08)", null, "rgba(150,60,20,0.16)", "rgba(10,20,70,0.42)"][G.phase];
  if (phaseTint) { ctx.fillStyle = phaseTint; ctx.fillRect(0, 0, VW, VH); }
  if (dark || G.phase === 3) drawLight(PL.x - camX, PL.y - camY - 10, dark ? 70 : 110, dark ? 0.9 : 0.4);
  if (interactTarget && !uiOpen()) { const X = interactTarget.x - camX, Y = interactTarget.y - camY - 30 + Math.sin(t * 5) * 1.5; ctx.fillStyle = "#000"; ctx.fillRect(X - 5, Y - 6, 10, 9); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.strokeRect(X - 5.5, Y - 6.5, 11, 10); outlineText(ctx, "E", X, Y + 1, "#ffe46a", "7px 'Pixelify Sans'"); }
}
const lightCv = document.createElement("canvas"); lightCv.width = VW; lightCv.height = VH;
function drawLight(x, y, r, a) {
  const l = lightCv.getContext("2d");
  l.globalCompositeOperation = "source-over"; l.clearRect(0, 0, VW, VH); l.fillStyle = `rgba(2,2,8,${a})`; l.fillRect(0, 0, VW, VH);
  l.globalCompositeOperation = "destination-out";
  const g = l.createRadialGradient(x, y, r * 0.3, x, y, r); g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
  l.fillStyle = g; l.beginPath(); l.arc(x, y, r, 0, 7); l.fill();
  ctx.drawImage(lightCv, 0, 0);
}
function drawNode(n, X, Y, t) {
  const info = NODE_INFO[n.type], used = nodeUsed(n);
  if (info.base === "sapPool") { ctx.fillStyle = used ? "#7a5520" : "#e0a030"; ctx.beginPath(); ctx.ellipse(X, Y - 2, 8, 3.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = "#ffd27a"; ctx.fillRect(X - 3, Y - 4, 2, 1); }
  else if (info.base === "core") { const g = ctx.createRadialGradient(X, Y - 14, 1, X, Y - 14, 18); g.addColorStop(0, "#f0e0ff"); g.addColorStop(0.4, "rgba(180,140,255,0.7)"); g.addColorStop(1, "rgba(120,80,200,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y - 14, 18 + Math.sin(t * 2) * 2, 0, 7); ctx.fill(); }
  else { const r = TS16[info.base]; t16(ctx, info.base, X - r[2] / 2, Y - r[3] + 1, undefined, undefined, used && n.type !== "chest" ? 0.5 : 1); }
  if (n.type === "chest" && used) return;
  if (!used || n.type === "bunker") { const by = Y - 24 + Math.sin(t * 3 + X) * 1.5; icon16(ctx, n.type === "bunker" && used ? ICON.echo : info.icon, X - 6, by, 12, used ? 0.4 : 1); }
}

/* =====================================================================
   ENCOUNTER — Kinetic Ricochet
   ===================================================================== */
let E = null;
const BOX = { x:62, y:44, w:260, h:140 };
const tierOf = s => s >= 450 ? 3 : s >= 320 ? 2 : s >= 170 ? 1 : 0;
const TIER_COL = ["#5fb3ff", "#ffd94a", "#ff5a3c", "#ffffff"];
const TIER_NAME = ["BLUE", "YELLOW", "RED", "WHITE-HOT"];
const TIER_MULT = [1, 1.6, 2.4, 3];
const STYLE = [[12,"WILT-BREAKER"],[8,"PINBALL WIZARD"],[5,"KINETIC FLURRY"],[3,"TRIPLE RICOCHET"],[2,"DOUBLE BANK"]];
const ATTACK_SPEED = 90;
function makeFoe(ty, x, y) {
  const F = FOES[ty], sc = F.scale || 1, hp = Math.round(F.hp * (F.boss ? 1 : 1.6)) + Math.floor(G.day / 5) * 2;
  return { type:ty, F, x, y, vx:0, vy:0, r:(F.spr[0] === "big" ? 7 : 6) * sc, hp, maxHp:hp, dir:1, t:Math.random(), hitCd:0, contactCd:0.8, atk:0, hurt:0, stun:0, slow:0, dying:0,
    fireCd:1 + Math.random(), hopCd:1 + Math.random(), state:"track", stT:2 + Math.random() * 2, patT:2, patI:0, queue:[], moving:false };
}
function startEncounterFromWorld(wf) {
  const group = [wf, ...WFOES.filter(o => o !== wf && Math.hypot(o.x - wf.x, o.y - wf.y) < 80)].slice(0, 3);
  startEncounter(group.map(g => g.type), { src:group });
}
function startEncounter(types, opts = {}) {
  DLG = null; document.getElementById("dialog").classList.add("hidden"); document.getElementById("prompt").classList.add("hidden");
  const region = G.loc;
  E = { region, t:0, rects:[], foes:[], bullets:[], fx:[], floats:[], clones:[], zones:[], sap:[], spikes:[], prisms:[], beams:[], src:opts.src || [], boss:!!opts.boss,
    p:{ x:BOX.x + 36, y:BOX.y + BOX.h / 2, vx:0, vy:0, r:6, dir:2, cracks:0, iframes:1.0, stun:0, brace:0, invis:0, dashCd:0, t:0, trail:[] },
    aim:null, combo:0, best:0, restT:0, parryBuf:0, wallWin:0, stamina:10, kinetic:0, compT:2.5, flee:0, killed:[], calmed:0, blightK:0, beastK:0,
    wind:{ state:"idle", t:4, dx:0, dy:0 }, miasmaT:0, sunT:0, mycelT:1, shake:0, prismCd:0, over:null, overT:0, intro:1.3, flash:0.6 };
  buildArena(region);
  const n = types.length;
  types.forEach((ty, i) => E.foes.push(makeFoe(ty, BOX.x + BOX.w - 50 - (i % 2) * 34, BOX.y + 30 + (n === 1 ? BOX.h / 2 - 30 : i * (BOX.h - 60) / Math.max(1, n - 1)))));
  G.stats.fights++;
  mode = "encounter"; renderHud();
}
function buildArena(R) {
  const b = BOX, add = (x, y, w, h, type) => E.rects.push({ x, y, w, h, type });
  add(b.x - 10, b.y - 10, b.w + 20, 10, "stone"); add(b.x - 10, b.y + b.h, b.w + 20, 10, "stone");
  add(b.x - 10, b.y, 10, b.h, "stone"); add(b.x + b.w, b.y, 10, b.h, "stone");
  const rx = () => b.x + 70 + Math.random() * (b.w - 130), ry = () => b.y + 18 + Math.random() * (b.h - 50);
  if (R === "sun") { add(b.x + 70, b.y, 46, 4, "bumper"); add(b.x + 150, b.y + b.h - 4, 46, 4, "bumper"); add(rx(), ry(), 14, 14, "stone"); }
  if (R === "trunk") { add(b.x, b.y + 30, 4, 44, "moss"); add(b.x + b.w - 4, b.y + 70, 4, 44, "moss"); add(rx(), ry(), 16, 12, "stone");
    for (let i = 0; i < 3; i++) E.sap.push({ x:rx(), y:ry() + 10, r:12 + Math.random() * 6 }); E.spikes.push({ x:rx(), y:b.y + b.h - 10, w:30, h:8 }); }
  if (R === "silt") { add(b.x + 110, b.y + 20, 8, 44, "cracked"); add(b.x + 175, b.y + 76, 8, 44, "cracked"); add(b.x + 140, b.y + b.h - 4, 40, 4, "moss"); add(b.x + 30, b.y, 36, 4, "bumper"); }
  if (R === "glass") { add(b.x + 90, b.y, 44, 4, "bumper"); add(b.x + b.w - 4, b.y + 40, 4, 50, "bumper"); add(rx(), ry(), 12, 12, "stone");
    E.prisms.push({ x:b.x + 120, y:b.y + 50, r:6 }, { x:b.x + 190, y:b.y + 100, r:6 });
    E.beams.push({ axis:"h", pos:b.y + 40, state:"off", t:2.5 }, { axis:"v", pos:b.x + 160, state:"off", t:4.5 }); }
  if (R === "roots") { add(b.x + 120, b.y + 26, 8, 40, "cracked"); add(b.x + 120, b.y + 80, 8, 36, "cracked"); add(b.x + 60, b.y + b.h - 4, 40, 4, "bumper");
    E.spikes.push({ x:b.x + 180, y:b.y, w:40, h:7 }); E.beams.push({ axis:"h", pos:b.y + 100, state:"off", t:3.5 }); }
}
const pSpeed = () => Math.hypot(E.p.vx, E.p.vy);
const hostiles = () => E.foes.filter(f => !f.dead && !f.dying && !f.calm && !f.phantom);
function encKey(k) {
  if (E.over) { if (E.overT > 0.8 && ["enter"," ","e"].includes(k)) finishEncounter(); return; }
  if (E.intro > 0) return;
  if (k === " ") { if (E.wallWin > 0) { parry(); E.wallWin = 0; } else E.parryBuf = 0.13; }
  if (k === "shift") dash();
  if (k === "h") usePotion();
  if (k === "b") throwBomb();
  const L = activeList(); const n = parseInt(k, 10); if (n >= 1 && n <= L.length) useActive(L[n - 1]);
}
function encPointerDown() {
  if (!E) return;
  if (E.over) { if (E.overT > 0.8) finishEncounter(); return; }
  if (E.intro > 0) return;
  if (E.p.stun > 0) return float(E.p.x, E.p.y - 16, "STUNNED", "#aaa");
  E.aim = { sx:mouse.x, sy:mouse.y };
}
function launchSpeed(len) { const maxL = 400 * (has("storm") ? 1.3 : has("glider") ? 1.15 : 1); return 100 + Math.min(1, len / 60) * (maxL - 100); }
function encPointerUp() {
  if (!E || !E.aim) return;
  const a = E.aim; E.aim = null;
  const dx = a.sx - mouse.x, dy = a.sy - mouse.y, len = Math.hypot(dx, dy);
  if (len < 5) return;
  const moving = pSpeed() > 60;
  if (moving && E.stamina < 2) return float(E.p.x, E.p.y - 16, "NO STAMINA", "#5fb3ff");
  if (moving) E.stamina -= 2;
  const sp = launchSpeed(len);
  E.p.vx = dx / len * sp; E.p.vy = dy / len * sp;
  E.fx.push({ type:"ring", x:E.p.x, y:E.p.y, t:0, col:TIER_COL[tierOf(sp)] });
}
function launchVec() {
  if (!E.aim) return null;
  const dx = E.aim.sx - mouse.x, dy = E.aim.sy - mouse.y, len = Math.hypot(dx, dy); if (len < 5) return null;
  const sp = launchSpeed(len); return [dx / len * sp, dy / len * sp];
}
function float(x, y, s, col = "#fff") { E.floats.push({ x, y, s, col, t:0 }); }
function crack() {
  const p = E.p; p.cracks++; float(p.x, p.y - 18, "CRACK", "#9fd3ff"); E.shake = 0.15;
  if (p.cracks >= 3) { p.cracks = 0; p.stun = 1.0; float(p.x, p.y - 26, "SHATTER!", "#ff8080"); hurtPlayer(8, { env:true, unavoidable:true }); E.fx.push({ type:"shards", x:p.x, y:p.y, t:0 }); }
}
function parry() {
  const p = E.p, s = pSpeed(); if (s < 1) return;
  const ns = Math.min(640, Math.max(s * 2, 260)); p.vx *= ns / s; p.vy *= ns / s;
  if (p.cracks > 0) p.cracks--;
  if (has("amber")) E.kinetic = Math.min(5, E.kinetic + 1);
  E.combo++; float(p.x, p.y - 20, "PARRY! KINETIC BOOST", "#ffe46a"); E.fx.push({ type:"ring", x:p.x, y:p.y, t:0, col:"#fff", big:true }); E.shake = 0.1;
}
function dash() {
  const p = E.p; if (p.dashCd > 0 || E.stamina < 2 || p.stun > 0) return;
  let dx = (keys["d"] ? 1 : 0) - (keys["a"] ? 1 : 0), dy = (keys["s"] ? 1 : 0) - (keys["w"] ? 1 : 0);
  if (!dx && !dy) { dx = mouse.x - p.x; dy = mouse.y - p.y; }
  const l = Math.hypot(dx, dy) || 1; p.vx += dx / l * 240; p.vy += dy / l * 240; p.iframes = Math.max(p.iframes, 0.32); p.dashCd = 0.55; E.stamina -= 2;
  E.fx.push({ type:"ring", x:p.x, y:p.y, t:0, col:"#9fe8f0" });
}
function hurtPlayer(d, o = {}) {
  const p = E.p; if (E.over) return;
  if (!o.unavoidable && (p.iframes > 0 || (p.invis > 0 && !o.env))) return;
  if (o.energy && has("prism")) { float(p.x, p.y - 16, "REFLECT", "#9fe8f0"); if (o.bullet) { o.bullet.vx *= -1; o.bullet.vy *= -1; o.bullet.friendly = true; } return; }
  if (!o.unavoidable && has("ocelli") && Math.random() < 0.25) { float(p.x, p.y - 16, "DODGE", "#9fe8f0"); p.iframes = 0.3; return; }
  if (o.fire && overgrown()) d *= 2;
  if (o.env && G.companion === "sylva") d = Math.ceil(d / 2);
  if (p.brace > 0) d = Math.ceil(d / 2);
  if (has("amber")) E.kinetic = Math.min(5, E.kinetic + 1);
  G.hp = Math.max(0, G.hp - d); p.iframes = 0.8; E.combo = 0; E.shake = 0.2;
  float(p.x, p.y - 14, "-" + d, o.fire ? "#ffb35a" : "#ff6b6b");
  if (G.hp <= 0) endEncounter("lose");
}
function damageFoe(f, d, o = {}) {
  if (f.dead || f.dying) return;
  if (f.phantom) { f.dead = true; float(f.x, f.y - 10, "only spores…", "#b48be8"); return; }
  f.hp -= d; f.hurt = 0.25; float(f.x, f.y - 14 * (f.F.scale || 1), d > 0 ? "-" + d : "CLANK", d > 0 ? (o.col || "#fff") : "#aaa");
  if (f.hp <= 0) { f.dying = 0.7; E.killed.push(f.type); if (f.F.blight) E.blightK++; else if (!f.F.boss) E.beastK++; E.fx.push({ type:"burst", x:f.x, y:f.y, t:0 }); }
}
function hitDamage(spd) { return Math.max(1, Math.round(baseDmg() * TIER_MULT[tierOf(spd)] * (1 + 0.12 * Math.min(12, E.combo)))); }
function activeList() {
  const L = [];
  if (has("vineWhip")) L.push({ id:"lash", name:"Lash", icon:GRAFTS.vineWhip.icon, cost:3 });
  if (has("beetle")) L.push({ id:"brace", name:"Brace", icon:GRAFTS.beetle.icon, cost:2 });
  if (has("amber")) L.push({ id:"release", name:"Release", icon:GRAFTS.amber.icon, cost:3, need:() => E.kinetic > 0 });
  if (has("prism")) L.push({ id:"refract", name:"Refract", icon:GRAFTS.prism.icon, cost:4 });
  if (has("pheromone")) L.push({ id:"calm", name:"Calm", icon:GRAFTS.pheromone.icon, cost:3 });
  if (has("sunlens")) L.push({ id:"focus", name:"Focus", icon:GRAFTS.sunlens.icon, cost:5 });
  return L.slice(0, 5);
}
function useActive(a) {
  const p = E.p;
  if (E.stamina < a.cost) return float(p.x, p.y - 16, "NO STAMINA", "#5fb3ff");
  if (a.need && !a.need()) return float(p.x, p.y - 16, "NO CHARGE", "#aaa");
  const hs = hostiles();
  if (a.id === "lash") {
    if (!hs.length) return; const t = hs.reduce((m, f) => Math.hypot(f.x - mouse.x, f.y - mouse.y) < Math.hypot(m.x - mouse.x, m.y - mouse.y) ? f : m);
    const dx = t.x - p.x, dy = t.y - p.y, l = Math.hypot(dx, dy) || 1; p.vx = dx / l * 420; p.vy = dy / l * 420; E.fx.push({ type:"vine", x:p.x, y:p.y, x2:t.x, y2:t.y, t:0 });
  }
  if (a.id === "brace") { p.brace = 3; float(p.x, p.y - 16, "BRACE", "#9fe8f0"); }
  if (a.id === "release") {
    const k = E.kinetic; E.kinetic = 0; E.fx.push({ type:"ring", x:p.x, y:p.y, t:0, col:"#ffb35a", big:true });
    for (const f of hs) { const d = dist(f, p) || 1; if (d < 52) { damageFoe(f, 2 + 2 * k, { col:"#ffb35a" }); if (!f.F.boss) { f.vx += (f.x - p.x) / d * 160; f.vy += (f.y - p.y) / d * 160; } } }
    E.bullets = E.bullets.filter(b => b.friendly || Math.hypot(b.x - p.x, b.y - p.y) > 52);
  }
  if (a.id === "refract") { p.invis = 2.5; float(p.x, p.y - 16, "REFRACT", "#9fe8f0"); }
  if (a.id === "calm") {
    const beasts = E.foes.filter(f => !f.dead && !f.dying && !f.calm && (f.F.beast || f.phantom) && !f.F.boss).sort((a, b) => dist(a, p) - dist(b, p));
    if (!beasts.length) return float(p.x, p.y - 16, "NO BEASTS", "#aaa");
    const f = beasts[0]; if (f.phantom) { f.dead = true; } else { f.calm = 0.01; E.calmed++; float(f.x, f.y - 14, "CALMED", "#9ad04a"); }
  }
  if (a.id === "focus") {
    const dx = mouse.x - p.x, dy = mouse.y - p.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    E.fx.push({ type:"beam", x:p.x, y:p.y, x2:p.x + ux * 400, y2:p.y + uy * 400, t:0 });
    for (const f of hs) { const rx = f.x - p.x, ry = f.y - p.y, proj = rx * ux + ry * uy; if (proj > 0 && Math.abs(rx * uy - ry * ux) < f.r + 4) damageFoe(f, 7, { col:"#ffe08a" }); }
  }
  E.stamina -= a.cost;
}
function usePotion() { if (G.res.potions < 1 || G.hp >= maxHp()) return; G.res.potions--; G.hp = Math.min(maxHp(), G.hp + 12); float(E.p.x, E.p.y - 16, "+12", "#7dff7a"); }
function throwBomb() { if (G.res.bombs < 1) return; G.res.bombs--; E.zones.push({ x:clamp(mouse.x, BOX.x, BOX.x + BOX.w), y:clamp(mouse.y, BOX.y, BOX.y + BOX.h), r:26, t:0.45, bomb:true }); }
function collideRect(o, r, R) {
  const px = clamp(o.x, R.x, R.x + R.w), py = clamp(o.y, R.y, R.y + R.h);
  const dx = o.x - px, dy = o.y - py, d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return null;
  const d = Math.sqrt(d2); let nx, ny;
  if (d < 1e-4) {
    const l = o.x - R.x, rr = R.x + R.w - o.x, t = o.y - R.y, bb = R.y + R.h - o.y, m = Math.min(l, rr, t, bb);
    nx = m === l ? -1 : m === rr ? 1 : 0; ny = nx ? 0 : (m === t ? -1 : 1);
    if (nx) o.x = nx < 0 ? R.x - r : R.x + R.w + r; else o.y = ny < 0 ? R.y - r : R.y + R.h + r;
  } else { nx = dx / d; ny = dy / d; o.x = px + nx * r; o.y = py + ny * r; }
  return [nx, ny];
}
function updateEncounter(rdt) {
  if (E.intro > 0) { E.intro -= rdt; E.flash = Math.max(0, E.flash - rdt); return; }
  if (E.over) { E.overT += rdt; return; }
  const ts = E.aim ? (has("ocelli") ? 0.08 : 0.2) : 1, dt = rdt * ts, p = E.p, R = E.region;
  E.t += dt; p.t += dt;
  E.parryBuf = Math.max(0, E.parryBuf - rdt); E.wallWin = Math.max(0, E.wallWin - rdt); E.shake = Math.max(0, E.shake - rdt);
  for (const k of ["iframes","stun","brace","invis","dashCd"]) p[k] = Math.max(0, p[k] - dt);
  E.prismCd = Math.max(0, E.prismCd - dt);
  E.stamina = Math.min(10, E.stamina + dt * 1.3);
  if (keys["escape"] && !E.boss) { E.flee += rdt; if (E.flee > 1) return endEncounter("flee"); } else E.flee = 0;
  let sp = pSpeed(), walking = false;
  if (sp < 60 && !E.aim && p.stun <= 0) {
    const ix = (keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0), iy = (keys["s"] || keys["arrowdown"] ? 1 : 0) - (keys["w"] || keys["arrowup"] ? 1 : 0);
    if (ix || iy) { const l = Math.hypot(ix, iy); p.vx = ix / l * 48; p.vy = iy / l * 48; walking = true; }
    else if (sp < 50) { p.vx *= Math.exp(-8 * dt); p.vy *= Math.exp(-8 * dt); }
  }
  if (R === "sun") {
    const w = E.wind; w.t -= dt;
    if (w.t <= 0) { if (w.state === "idle") { w.state = "warn"; w.t = G.companion === "sylva" ? 1.5 : 1; const a = pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]); w.dx = Math.cos(a); w.dy = Math.sin(a); }
      else if (w.state === "warn") { w.state = "gust"; w.t = 1.6; } else { w.state = "idle"; w.t = 4 + Math.random() * 2; } }
    if (w.state === "gust") { if (!has("glider") && !has("storm")) { p.vx += w.dx * 240 * dt; p.vy += w.dy * 240 * dt; } for (const f of E.foes) if (!f.F.flying && !f.F.boss) { f.vx += w.dx * 120 * dt; f.vy += w.dy * 120 * dt; } }
  }
  if ((R === "sun" || R === "glass") && has("photosynth")) { E.sunT += dt; if (E.sunT > 2) { E.sunT = 0; G.hp = Math.min(maxHp(), G.hp + 1); } }
  const inSap = E.sap.some(s => Math.hypot(p.x - s.x, p.y - s.y) < s.r);
  const k = inSap && !has("gillFronds") && !has("resinTitan") ? 4 : walking ? 0 : 0.55;
  p.vx *= Math.exp(-k * dt); p.vy *= Math.exp(-k * dt);
  sp = pSpeed();
  if (sp < 14 && !walking) { p.vx = p.vy = 0; }
  if (sp < 40) { E.restT += dt; if (E.restT > 0.3 && E.combo) { E.best = Math.max(E.best, E.combo); E.combo = 0; } } else E.restT = 0;
  const steps = Math.max(1, Math.ceil(sp * dt / 2.5));
  for (let s = 0; s < steps; s++) {
    p.x += p.vx * dt / steps; p.y += p.vy * dt / steps;
    for (const Rc of E.rects) { if (Rc.dead) continue; const n = collideRect(p, p.r, Rc); if (n) wallHit(Rc, n[0], n[1]); }
    for (const f of E.foes) {
      if (f.dead || f.dying || f.calm) continue;
      const d = dist(p, f); if (d >= p.r + f.r) continue;
      const nx = (p.x - f.x) / (d || 1), ny = (p.y - f.y) / (d || 1), spd = pSpeed();
      p.x = f.x + nx * (p.r + f.r + 0.5); p.y = f.y + ny * (p.r + f.r + 0.5);
      if (f.phantom) { damageFoe(f, 1); continue; }
      if (spd >= ATTACK_SPEED && !walking) {
        if (f.hitCd <= 0) {
          let dmg = hitDamage(spd); if (f.F.armored && spd < 170) dmg = 0;
          damageFoe(f, dmg, { col:TIER_COL[tierOf(spd)] }); f.hitCd = 0.22; E.combo++;
          if (!f.F.boss) { f.vx -= nx * spd * 0.45; f.vy -= ny * spd * 0.45; }
          E.fx.push({ type:"spark", x:(p.x + f.x) / 2, y:(p.y + f.y) / 2, t:0, col:TIER_COL[tierOf(spd)] });
        }
        const vn = p.vx * nx + p.vy * ny; if (vn < 0) { p.vx -= 2 * vn * nx; p.vy -= 2 * vn * ny; } p.vx *= 0.92; p.vy *= 0.92;
      } else if (f.contactCd <= 0 && f.stun <= 0) { hurtPlayer(f.F.dmg, { fire:f.F.fire }); f.contactCd = 1.0; f.atk = 0.3; }
      if (E.over) return;
    }
    for (const pr of E.prisms) if (E.prismCd <= 0 && pSpeed() >= 170 && Math.hypot(p.x - pr.x, p.y - pr.y) < p.r + pr.r) {
      E.prismCd = 1.2; const a = Math.atan2(p.vy, p.vx), s2 = pSpeed() * 1.1;
      E.clones.push({ x:p.x, y:p.y, vx:Math.cos(a + 0.55) * s2, vy:Math.sin(a + 0.55) * s2, life:3, hit:new Map() });
      p.vx = Math.cos(a - 0.3) * s2; p.vy = Math.sin(a - 0.3) * s2; float(pr.x, pr.y - 10, "SPLIT!", "#9fe8f0");
    }
  }
  if (sp > 20) p.dir = Math.abs(p.vx) > Math.abs(p.vy) ? (p.vx < 0 ? 1 : 2) : (p.vy < 0 ? 3 : 0);
  p.trail.push({ x:p.x, y:p.y, c:TIER_COL[tierOf(sp)] }); if (p.trail.length > 18) p.trail.shift();
  for (const sk of E.spikes) if (p.x > sk.x - 4 && p.x < sk.x + sk.w + 4 && p.y > sk.y - 4 && p.y < sk.y + sk.h + 4 && p.iframes <= 0) { hurtPlayer(4, { env:true }); if (!E.over) crack(); }
  if (E.over) return;
  for (const bm of E.beams) {
    bm.t -= dt;
    if (bm.t <= 0) { if (bm.state === "off") { bm.state = "warn"; bm.t = G.companion === "sylva" ? 1.5 : 1; } else if (bm.state === "warn") { bm.state = "on"; bm.t = 0.5; bm.hit = new Set(); } else { bm.state = "off"; bm.t = 2 + Math.random() * 2.5; if (bm.temp) bm.dead = true; } }
    if (bm.state === "on") {
      const onLine = o => bm.axis === "h" ? Math.abs(o.y - bm.pos) < 5 : Math.abs(o.x - bm.pos) < 5;
      if (onLine(p) && !bm.hit.has("p") && p.invis <= 0) { bm.hit.add("p"); if (has("prism")) float(p.x, p.y - 16, "REFLECT", "#9fe8f0"); else { hurtPlayer(6, { energy:true, env:true }); if (!E.over) crack(); } }
      for (const f of hostiles()) if (onLine(f) && !bm.hit.has(f)) { bm.hit.add(f); damageFoe(f, 4, { col:"#ffb35a" }); }
    }
  }
  if (E.over) return;
  E.beams = E.beams.filter(b => !b.dead);
  if (R === "silt" && !has("sporeFilter") && !has("mycelCrown")) {
    E.stamina = Math.max(0, E.stamina - dt * 1.9);
    if (E.stamina <= 0.05) { E.miasmaT += dt; if (E.miasmaT > 2) { E.miasmaT = 0; hurtPlayer(1, { env:true, unavoidable:true });
      if (!E.over && E.foes.filter(f => f.phantom && !f.dead).length < 2) { const ph = makeFoe("siltShade", BOX.x + 40 + Math.random() * (BOX.w - 80), BOX.y + 20 + Math.random() * (BOX.h - 40)); ph.phantom = true; ph.hp = ph.maxHp = 1; ph.F = { ...FOES.siltShade, name:"???" }; E.foes.push(ph); float(p.x, p.y - 20, "the mist moves…", "#b48be8"); } } }
  }
  if (E.over) return;
  if (has("mycelCrown")) { E.mycelT -= dt; if (E.mycelT <= 0) { E.mycelT = 1; for (const f of hostiles()) if (dist(f, p) < 34) damageFoe(f, 2, { col:"#c9a8ff" }); } }
  for (const z of E.zones) {
    z.t -= dt;
    if (z.t <= 0 && !z.done) { z.done = true; E.fx.push({ type:"boom", x:z.x, y:z.y, t:0, r:z.r });
      if (z.bomb) { for (const f of hostiles()) if (Math.hypot(f.x - z.x, f.y - z.y) < z.r + f.r) damageFoe(f, 6 + (E.sap.some(s => Math.hypot(f.x - s.x, f.y - s.y) < s.r) ? 4 : 0), { col:"#ffb35a" });
        for (const Rc of E.rects) if (Rc.type === "cracked" && !Rc.dead && Math.hypot(Rc.x + Rc.w / 2 - z.x, Rc.y + Rc.h / 2 - z.y) < z.r + 20) { Rc.dead = true; float(Rc.x, Rc.y, "CRUMBLE", "#ccc"); } }
      else if (Math.hypot(p.x - z.x, p.y - z.y) < z.r) { if (has("photosynth") || has("storm")) { G.hp = Math.min(maxHp(), G.hp + 3); float(p.x, p.y - 16, "+3 sunlight", "#7dff7a"); } else hurtPlayer(z.dmg, { fire:true, env:true }); } }
  }
  if (E.over) return;
  E.zones = E.zones.filter(z => !z.done);
  for (const f of E.foes) updateFoe(f, dt);
  if (E.over) return;
  const live = E.foes.filter(f => !f.dead);
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) { const a = live[i], b = live[j], d = dist(a, b), m = a.r + b.r; if (d < m && d > 0) { const push = (m - d) / 2, nx = (a.x - b.x) / d, ny = (a.y - b.y) / d; a.x += nx * push; a.y += ny * push; b.x -= nx * push; b.y -= ny * push; } }
  for (const b of E.bullets) {
    b.life -= dt; b.x += b.vx * dt; b.y += b.vy * dt; b.t = (b.t || 0) + dt;
    if (!b.pierceBox && (b.x < BOX.x || b.x > BOX.x + BOX.w || b.y < BOX.y || b.y > BOX.y + BOX.h)) b.life = 0;
    if (!b.pierceBox) for (const Rc of E.rects) if (!Rc.dead && b.x > Rc.x && b.x < Rc.x + Rc.w && b.y > Rc.y && b.y < Rc.y + Rc.h) b.life = 0;
    if (b.life <= 0) continue;
    if (b.friendly) { for (const f of hostiles()) if (Math.hypot(f.x - b.x, f.y - b.y) < f.r + b.r) { damageFoe(f, b.dmg, { col:b.col || "#fff" }); if (b.slow) f.slow = 3; if (b.stun) f.stun = 1.4; b.life = 0; break; } }
    else if (Math.hypot(p.x - b.x, p.y - b.y) < p.r + b.r - 1 && p.invis <= 0) { hurtPlayer(b.dmg, { energy:b.energy, fire:b.fire, bullet:b }); if (!b.friendly) b.life = 0; if (E.over) return; }
  }
  E.bullets = E.bullets.filter(b => b.life > 0);
  for (const c of E.clones) {
    c.life -= dt; c.vx *= Math.exp(-0.4 * dt); c.vy *= Math.exp(-0.4 * dt);
    c.x += c.vx * dt; c.y += c.vy * dt;
    for (const Rc of E.rects) if (!Rc.dead) { const n = collideRect(c, 4, Rc); if (n) { const vn = c.vx * n[0] + c.vy * n[1]; if (vn < 0) { c.vx -= 2 * vn * n[0]; c.vy -= 2 * vn * n[1]; } } }
    for (const f of hostiles()) if (dist(c, f) < f.r + 4 && !(c.hit.get(f) > E.t)) { c.hit.set(f, E.t + 0.4); damageFoe(f, Math.max(1, Math.round(hitDamage(Math.hypot(c.vx, c.vy)) * 0.7)), { col:"#9fe8f0" }); }
  }
  E.clones = E.clones.filter(c => c.life > 0);
  E.compT -= dt;
  if (E.compT <= 0) {
    const hs = hostiles(), cx = BOX.x - 26, cy = BOX.y + BOX.h - 18;
    if (hs.length) {
      const t = hs.reduce((m, f) => dist(f, E.p) < dist(m, E.p) ? f : m);
      const dx = t.x - cx, dy = t.y - cy, l = Math.hypot(dx, dy) || 1;
      if (G.companion === "kaelen") { E.bullets.push({ x:cx, y:cy, vx:dx / l * 230, vy:dy / l * 230, r:3, dmg:5, life:2, friendly:true, pierceBox:true, col:"#ffb35a", color:"#ffd2a0" }); E.compT = 4; }
      else if (G.companion === "sylva") { E.bullets.push({ x:cx, y:cy, vx:dx / l * 180, vy:dy / l * 180, r:3, dmg:2, life:2, friendly:true, pierceBox:true, slow:true, col:"#c9a8ff", color:"#c9a8ff" }); E.compT = 5; }
      else { E.bullets.push({ x:cx, y:cy, vx:dx / l * 150, vy:dy / l * 150, r:3, dmg:1, life:2.5, friendly:true, pierceBox:true, stun:true, col:"#ffd27a", color:"#ffe9a8", moth:true }); E.compT = 5; }
    } else E.compT = 1;
  }
  for (const x of E.fx) x.t += rdt; E.fx = E.fx.filter(x => x.t < 0.6);
  for (const fl of E.floats) fl.t += rdt; E.floats = E.floats.filter(fl => fl.t < 1);
  if (!hostiles().length && !E.foes.some(f => f.dying > 0 && !f.dead)) endEncounter("win");
}
function wallHit(Rc, nx, ny) {
  const p = E.p, spd = pSpeed(), vn = p.vx * nx + p.vy * ny;
  if (vn >= 0) return;
  if (Rc.type === "moss") { p.vx = p.vy = 0; if (spd > 60) { float(p.x, p.y - 14, "ABSORBED", "#7fd26a"); E.best = Math.max(E.best, E.combo); E.combo = 0; } return; }
  if (Rc.type === "cracked" && spd >= 320) { Rc.dead = true; p.vx *= 0.85; p.vy *= 0.85; float(Rc.x + Rc.w / 2, Rc.y, "SMASH!", "#ffe46a"); E.fx.push({ type:"shards", x:Rc.x + Rc.w / 2, y:Rc.y + Rc.h / 2, t:0 }); E.combo++; if (Math.random() < 0.5) { gain({ scrap:1 }); float(Rc.x, Rc.y + 10, "+scrap", "#ccc"); } return; }
  p.vx -= 2 * vn * nx; p.vy -= 2 * vn * ny;
  if (Rc.type === "bumper") { const s = pSpeed() || 1, ns = Math.max(260, s * 1.6); p.vx *= ns / s; p.vy *= ns / s; float(p.x, p.y - 12, "BUMPER", "#ff6bff"); }
  else { p.vx *= 0.9; p.vy *= 0.9; }
  if (spd < 30) return;
  E.fx.push({ type:"spark", x:p.x - nx * p.r, y:p.y - ny * p.r, t:0, col:TIER_COL[tierOf(spd)] });
  if (spd >= ATTACK_SPEED) E.combo++;
  if (spd >= 60 && spd < 170 && Rc.type !== "bumper" && p.brace <= 0 && !has("resinTitan")) crack();
  if (spd >= 320 && has("amber")) E.kinetic = Math.min(5, E.kinetic + 1);
  if (E.parryBuf > 0) { E.parryBuf = 0; parry(); } else E.wallWin = 0.13;
}
function fireAt(f, n, spread, speed, extra = {}) {
  const p = E.p, base = Math.atan2(p.y - f.y, p.x - f.x);
  for (let i = 0; i < n; i++) { const a = base + (n > 1 ? (i - (n - 1) / 2) * spread : 0);
    E.bullets.push({ x:f.x, y:f.y - 4, vx:Math.cos(a) * speed, vy:Math.sin(a) * speed, r:3, dmg:extra.dmg || f.F.dmg, life:4, energy:extra.energy ?? f.F.energy, fire:extra.fire ?? f.F.fire, spr:f.F.spr[0] === "tiny" && TINY[f.F.spr[1]].proj ? f.F.spr : null, color:extra.color || (f.F.energy ? "#9fe8ff" : f.F.fire ? "#ffb35a" : "#d9c9f5") }); }
}
function radial(f, n, speed, extra = {}) {
  const off = Math.random() * Math.PI;
  for (let i = 0; i < n; i++) { const a = off + i / n * Math.PI * 2;
    E.bullets.push({ x:f.x, y:f.y - 4, vx:Math.cos(a) * speed, vy:Math.sin(a) * speed, r:extra.r || 3, dmg:extra.dmg || Math.max(2, f.F.dmg - 2), life:extra.life || 4, energy:f.F.energy, fire:f.F.fire, spr:null, color:extra.color || (f.F.energy ? "#9fe8ff" : f.F.fire ? "#ffb35a" : "#d9c9f5") }); }
}
function updateFoe(f, dt) {
  if (f.dead) return;
  f.t += dt;
  if (f.dying > 0) { f.dying -= dt; if (f.dying <= 0) f.dead = true; return; }
  if (f.calm) { f.calm += dt; f.x += 30 * dt; if (f.calm > 1.6) f.dead = true; return; }
  for (const k of ["hitCd","contactCd","hurt","stun","slow","atk"]) f[k] = Math.max(0, f[k] - dt);
  const p = E.p, F = f.F, dx = p.x - f.x, dy = p.y - f.y, d = Math.hypot(dx, dy) || 1;
  const seen = p.invis <= 0;
  let spd = F.speed * (f.slow > 0 ? 0.5 : 1); if (f.stun > 0) spd = 0;
  let mx = 0, my = 0;
  const ai = f.phantom ? "chase" : F.ai;
  if (ai === "chase") { if (seen) { mx = dx / d; my = dy / d; } }
  else if (ai === "hopper") { f.hopCd -= dt; if (f.hopCd <= 0 && seen && f.stun <= 0) { f.vx += dx / d * 140; f.vy += dy / d * 140; f.hopCd = 1.5 + Math.random() * 0.5; } spd = 0; }
  else if (ai === "shooter") {
    if (seen) { if (d < 60) { mx = -dx / d; my = -dy / d; } else if (d > 100) { mx = dx / d; my = dy / d; } else { mx = -dy / d * 0.6; my = dx / d * 0.6; } }
    f.fireCd -= dt; if (f.fireCd <= 0 && seen && f.stun <= 0) { fireAt(f, F.proj.n, F.proj.spread, F.proj.speed, { energy:F.proj.energy, fire:F.proj.fire }); f.fireCd = F.proj.cd; f.atk = 0.3; }
  }
  else if (ai === "spore") { if (seen) { mx = dx / d * 0.6; my = dy / d * 0.6; } f.fireCd -= dt; if (f.fireCd <= 0 && f.stun <= 0) { radial(f, 6, 42, { dmg:2, life:5, color:"#c9a8ff" }); f.fireCd = 3.2; f.atk = 0.3; } }
  if (ai === "charger" || (ai === "boss" && f.state !== "track")) chargerAI(f, dt, dx, dy, d, seen);
  if (ai === "charger" && f.state === "track" && seen) { mx = dx / d * 0.7; my = dy / d * 0.7; }
  if (ai === "boss") bossAI(f, dt, dx, dy, d, seen, (a, b) => { mx = a; my = b; });
  const inSap = E.sap.some(s => Math.hypot(f.x - s.x, f.y - s.y) < s.r) && !F.sapImmune;
  const drag = f.state === "charge" ? 0 : inSap ? 5 : (ai === "hopper" ? 3 : 4);
  f.vx *= Math.exp(-drag * dt); f.vy *= Math.exp(-drag * dt);
  const sm = inSap ? 0.4 : 1;
  f.x += (mx * spd * sm + f.vx) * dt; f.y += (my * spd * sm + f.vy) * dt;
  for (const Rc of E.rects) if (!Rc.dead) { const n = collideRect(f, f.r, Rc); if (n && f.state === "charge") { const vn = f.vx * n[0] + f.vy * n[1]; if (vn < 0) { f.vx -= 2 * vn * n[0]; f.vy -= 2 * vn * n[1]; } } }
  const mvx = mx * spd + f.vx, mvy = my * spd + f.vy;
  if (Math.abs(mvx) + Math.abs(mvy) > 3) f.dir = Math.abs(mvx) > Math.abs(mvy) ? (mvx < 0 ? 1 : 2) : (mvy < 0 ? 3 : 0);
  f.moving = Math.abs(mvx) + Math.abs(mvy) > 3;
}
function chargerAI(f, dt, dx, dy, d, seen) {
  f.stT -= dt;
  if (f.state === "track" && f.stT <= 0 && seen) { f.state = "wind"; f.stT = G.companion === "sylva" ? 0.9 : 0.6; f.cdx = dx / d; f.cdy = dy / d; }
  else if (f.state === "wind" && f.stT <= 0) { f.state = "charge"; f.stT = 0.8; f.vx = f.cdx * 185; f.vy = f.cdy * 185; f.atk = 0.8; }
  else if (f.state === "charge") { const s = Math.hypot(f.vx, f.vy) || 1; f.vx = f.vx / s * 185; f.vy = f.vy / s * 185;
    if (f.stT <= 0) { f.state = "track"; f.stT = 2.5 + Math.random() * 1.5; f.vx *= 0.2; f.vy *= 0.2; } }
}
function bossAI(f, dt, dx, dy, d, seen, setMove) {
  const F = f.F;
  if (f.state === "track" && seen) setMove(dx / d * 0.6, dy / d * 0.6);
  if (f.queue.length) { f.queue[0].t -= dt; if (f.queue[0].t <= 0) f.queue.shift().fn(); }
  f.patT -= dt;
  if (f.patT > 0 || f.state !== "track" || f.stun > 0) return;
  const pats = { flare:["burst","flare","aimed","charge"], sap:["burst","sap","charge","aimed"], spores:["spores","aimed","burst","spores"], beam:["beam","burst","aimed","beam"], summon:["summon","burst","charge","aimed"] }[F.special];
  const pat = pats[f.patI++ % pats.length]; f.patT = 2.6; f.atk = 0.5;
  const p = E.p, warn = G.companion === "sylva" ? 1.4 : 0.9;
  if (pat === "burst") radial(f, 12, 72);
  if (pat === "aimed") for (let i = 0; i < 3; i++) f.queue.push({ t:0.25, fn:() => fireAt(f, 3, 0.25, 115, { dmg:F.dmg - 2 }) });
  if (pat === "charge") { f.stT = 0; chargerAI(f, 0, dx, dy, d, true); }
  if (pat === "flare") for (let i = 0; i < 3; i++) E.zones.push({ x:clamp(p.x + (Math.random() - 0.5) * 70, BOX.x + 10, BOX.x + BOX.w - 10), y:clamp(p.y + (Math.random() - 0.5) * 50, BOX.y + 10, BOX.y + BOX.h - 10), r:20, t:warn + 0.1, dmg:5 });
  if (pat === "sap") { if (E.sap.length < 6) for (let i = 0; i < 2; i++) E.sap.push({ x:BOX.x + 40 + Math.random() * (BOX.w - 80), y:BOX.y + 20 + Math.random() * (BOX.h - 40), r:14 }); radial(f, 6, 50, { color:"#e0a030" }); }
  if (pat === "spores") radial(f, 10, 38, { dmg:3, life:6, r:4, color:"#c9a8ff" });
  if (pat === "beam") E.beams.push({ axis:"h", pos:p.y, state:"warn", t:warn, temp:true }, { axis:"v", pos:p.x, state:"warn", t:warn, temp:true });
  if (pat === "summon" && hostiles().length < 4) E.foes.push(makeFoe(Math.random() < 0.5 ? "rootDemon" : "husk", f.x - 24, clamp(f.y + (Math.random() - 0.5) * 30, BOX.y + 10, BOX.y + BOX.h - 10)));
}
function endEncounter(res) {
  if (E.over) return;
  E.over = res; E.overT = 0; E.best = Math.max(E.best, E.combo); E.aim = null;
  G.stats.bestCombo = Math.max(G.stats.bestCombo, E.best);
}
function finishEncounter() {
  const res = E.over, id = E.region, A = AREA(id);
  const lines = [];
  let after = null;
  if (res === "win") {
    const reward = {}; for (const [k, r] of Object.entries(A.yield)) reward[k] = [Math.ceil(r[0] * 0.5), Math.ceil(r[1] * 0.8) + Math.floor(E.killed.length / 2)];
    let got = gain(reward);
    let bal = E.blightK * 3 - E.beastK * 2 + E.calmed * 2;
    G.stats.kills += E.killed.length; G.stats.calms += E.calmed;
    lines.push(`Victory! Best combo: ${E.best}${E.best >= 2 ? ` — ${(STYLE.find(s => E.best >= s[0]) || [0, ""])[1]}` : ""}.`);
    if (E.boss && id === "roots") { G.coreDown = true; WARDEN = null; bal = 0; lines.push("The PALE Sentinel crumbles into chalk. The Root-Core lies open."); got += " " + gain({ coins:20 }); }
    else if (E.boss) {
      const r = G.regions[id], mg = MYTHIC[id];
      r.warden = false; r.bal = 45; bal = 0; G.taint += 2; G.stats.hunts++; WARDEN = null;
      if (!G.owned.includes(mg)) G.owned.push(mg);
      got += " " + gain({ rareSeeds:1, coins:20 });
      lines.push(`From its heart you carve a mythic graft: ${GRAFTS[mg].name}. The wounded forest settles at 45 balance (+2 taint).`);
      if (!r.echo) { r.echo = true; G.echoes.push(id); lines.push("A memory floods out of the dying Warden:", ECHOES[id]); log("Root Echo received."); }
      log(`Hunted the ${FOES[REGIONS[id].warden].name}.`);
    } else {
      if (REGIONS[id] && status(G.regions[id].bal) === "enraged") G.taint += 1;
      if (bal && REGIONS[id]) changeBal(id, bal); else bal = 0;
    }
    toast(`Spoils: ${got || "nothing"}${bal ? ` · balance ${bal > 0 ? "+" : ""}${bal}` : ""}`);
    WFOES = WFOES.filter(w => !E.src.includes(w));
    encCooldown = 1.5;
  } else if (res === "flee") {
    const lost = Math.floor(G.res.sap / 3); G.res.sap -= lost;
    lines.push(`You scramble out of the fight${lost ? `, spilling ${lost} sap` : ""}.`);
    for (const w of E.src) w.stun = 3; encCooldown = 2.5;
  } else {
    const ls = Math.floor(G.res.sap / 2), lc = Math.floor(G.res.coins / 3); G.res.sap -= ls; G.res.coins -= lc;
    G.hp = Math.floor(maxHp() * 0.4);
    lines.push("You shatter...", `${COMPANIONS[G.companion].name} drags you back to the caravan. Lost ${ls} sap and ${lc} barter bits.`);
    after = () => doFade(() => { G.phase = 0; advanceDay(); if (G.over) return showCollapse(); enterRegion(G.loc === "roots" ? "silt" : G.loc); });
  }
  E = null; mode = "world"; save(); renderHud();
  say(lines, { char:CHAR.player, name:res === "win" ? "Victory" : res === "flee" ? "Escaped" : "Defeat", onClose:after });
}

/* ---------- encounter drawing ---------- */
function drawEncounter() {
  const t = E.t, p = E.p, R = E.region;
  ctx.save();
  if (E.shake > 0) ctx.translate((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
  ctx.fillStyle = "#000"; ctx.fillRect(-4, -4, VW + 8, VH + 8);
  const bgc = { sun:"rgba(255,200,80,", trunk:"rgba(230,140,40,", silt:"rgba(160,110,255,", glass:"rgba(90,220,255,", roots:"rgba(255,60,60," }[R];
  ctx.strokeStyle = bgc + "0.12)"; ctx.lineWidth = 1;
  for (let i = -2; i < 16; i++) { const o = (performance.now() / 120) % 32; ctx.beginPath(); ctx.moveTo(i * 32 + o, 0); ctx.lineTo(i * 32 + o - 60, VH); ctx.stroke(); }
  ctx.fillStyle = "#06090a"; ctx.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
  ctx.fillStyle = bgc + "0.05)"; for (let y = BOX.y; y < BOX.y + BOX.h; y += 10) for (let x = BOX.x + ((y - BOX.y) / 10 % 2) * 10; x < BOX.x + BOX.w; x += 20) ctx.fillRect(x, y, 10, 10);
  for (const s of E.sap) { ctx.fillStyle = "rgba(225,140,25,0.55)"; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * 0.7, 0, 0, 7); ctx.fill(); ctx.fillStyle = "rgba(255,210,120,0.6)"; ctx.fillRect(s.x - 3, s.y - 2, 4, 1); }
  for (const sk of E.spikes) { ctx.fillStyle = "#b02a2a"; for (let x = sk.x; x < sk.x + sk.w; x += 6) { ctx.beginPath(); ctx.moveTo(x, sk.y + sk.h); ctx.lineTo(x + 3, sk.y); ctx.lineTo(x + 6, sk.y + sk.h); ctx.fill(); } }
  for (const bm of E.beams) {
    if (bm.state === "off") continue;
    ctx.save();
    if (bm.state === "warn") { ctx.strokeStyle = `rgba(255,80,80,${0.4 + Math.sin(performance.now() / 30) * 0.3})`; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; }
    else { ctx.strokeStyle = "#ffe9c0"; ctx.lineWidth = 3; ctx.shadowColor = "#ff9a3c"; ctx.shadowBlur = 8; }
    ctx.beginPath(); if (bm.axis === "h") { ctx.moveTo(BOX.x, bm.pos); ctx.lineTo(BOX.x + BOX.w, bm.pos); } else { ctx.moveTo(bm.pos, BOX.y); ctx.lineTo(bm.pos, BOX.y + BOX.h); } ctx.stroke(); ctx.restore();
  }
  for (const z of E.zones) if (!z.done) { ctx.strokeStyle = z.bomb ? "#ffb35a" : `rgba(255,220,90,${0.5 + Math.sin(performance.now() / 40) * 0.4})`; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
  for (const Rc of E.rects) {
    if (Rc.dead) continue;
    const inside = Rc.x >= BOX.x - 1 && Rc.x + Rc.w <= BOX.x + BOX.w + 1 && Rc.y >= BOX.y - 1 && Rc.y + Rc.h <= BOX.y + BOX.h + 1;
    if (!inside) continue;
    if (Rc.type === "bumper") { ctx.fillStyle = `hsl(${300 + Math.sin(t * 4) * 30},100%,60%)`; ctx.shadowColor = "#ff6bff"; ctx.shadowBlur = 6; ctx.fillRect(Rc.x, Rc.y, Rc.w, Rc.h); ctx.shadowBlur = 0; }
    else if (Rc.type === "moss") { ctx.fillStyle = "#2f6b2a"; ctx.fillRect(Rc.x, Rc.y, Rc.w, Rc.h); ctx.fillStyle = "#58b84f"; for (let i = 0; i < Math.max(Rc.w, Rc.h); i += 3) ctx.fillRect(Rc.x + (Rc.w > Rc.h ? i : 1), Rc.y + (Rc.w > Rc.h ? 1 : i), 2, 2); }
    else if (Rc.type === "cracked") { ctx.fillStyle = "#5b5560"; ctx.fillRect(Rc.x, Rc.y, Rc.w, Rc.h); ctx.strokeStyle = "#1c1820"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Rc.x + 1, Rc.y + 4); ctx.lineTo(Rc.x + Rc.w - 2, Rc.y + Rc.h / 3); ctx.lineTo(Rc.x + 2, Rc.y + Rc.h * 0.7); ctx.lineTo(Rc.x + Rc.w - 1, Rc.y + Rc.h - 3); ctx.stroke(); }
    else { ctx.fillStyle = "#3a3f44"; ctx.fillRect(Rc.x, Rc.y, Rc.w, Rc.h); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.strokeRect(Rc.x + 0.5, Rc.y + 0.5, Rc.w - 1, Rc.h - 1); }
  }
  for (const pr of E.prisms) { ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(t * 2); ctx.fillStyle = E.prismCd > 0 ? "rgba(160,240,255,0.4)" : "#a6eef5"; ctx.shadowColor = "#9fe8ff"; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 0); ctx.lineTo(0, 7); ctx.lineTo(-5, 0); ctx.fill(); ctx.restore(); }
  const lv = launchVec();
  if (lv) drawTrajectory(lv[0], lv[1]);
  for (const f of [...E.foes].sort((a, b) => a.y - b.y)) {
    if (f.dead) continue;
    const sc = f.F.scale || 1, a = f.calm ? Math.max(0, 1 - f.calm / 1.6) : f.phantom ? 0.45 + Math.sin(t * 6) * 0.2 : (f.hurt > 0 && Math.floor(performance.now() / 33) % 2 ? 0.35 : 1);
    ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.beginPath(); ctx.ellipse(f.x, f.y + 1, f.r, f.r * 0.35, 0, 0, 7); ctx.fill();
    if (f.state === "wind") { ctx.strokeStyle = `rgba(255,60,60,${0.5 + Math.sin(performance.now() / 25) * 0.5})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(f.x, f.y - 6 * sc, f.r + 4, 0, 7); ctx.stroke(); }
    const anim = f.dying > 0 ? "death" : f.hurt > 0 ? "hit" : (f.atk > 0 ? "atk" : f.moving ? "walk" : "idle");
    drawFoeSprite(ctx, f.F.spr, anim, f.dying > 0 ? 0.7 - f.dying : f.t, f.dir, f.x, f.y + 1, sc, a);
    if (f.stun > 0) outlineText(ctx, "✶", f.x, f.y - 16 * sc, "#ffe46a", "8px sans-serif");
    if (f.calm) outlineText(ctx, "♥", f.x, f.y - 16 * sc, "#9ad04a", "8px sans-serif");
  }
  for (const c of E.clones) drawChar(ctx, CHAR.player, 2, 1, c.x, c.y + 9, 0.45);
  for (let i = 1; i < p.trail.length; i++) { const a = p.trail[i - 1], b = p.trail[i]; ctx.strokeStyle = b.c; ctx.globalAlpha = i / p.trail.length * 0.8; ctx.lineWidth = 1 + i / p.trail.length * 4; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  ctx.globalAlpha = 1;
  const sp = pSpeed(), tier = tierOf(sp);
  const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 14); g.addColorStop(0, TIER_COL[tier] + "aa"); g.addColorStop(1, TIER_COL[tier] + "00");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, 7); ctx.fill();
  const pa = p.invis > 0 ? 0.3 : (p.iframes > 0 && Math.floor(performance.now() / 50) % 2 ? 0.5 : 1);
  drawChar(ctx, CHAR.player, p.dir, sp > 20 ? [0,1,2,1][Math.floor(p.t * 12) % 4] : 1, p.x, p.y + 9, pa);
  if (p.cracks) { ctx.strokeStyle = "rgba(220,240,255,0.95)"; ctx.lineWidth = 0.8; for (let i = 0; i < p.cracks * 3; i++) { const a = i * 2.4 + 0.5; ctx.beginPath(); ctx.moveTo(p.x, p.y - 2); ctx.lineTo(p.x + Math.cos(a) * 7, p.y - 2 + Math.sin(a) * 8); ctx.lineTo(p.x + Math.cos(a + 0.4) * 10, p.y - 2 + Math.sin(a + 0.4) * 10); ctx.stroke(); } }
  if (p.brace > 0) { ctx.strokeStyle = "#9fe8f0"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y - 1, 10, 0, 7); ctx.stroke(); }
  if (overgrown()) { ctx.strokeStyle = "#58b84f"; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { const a = t * 2 + i * 2.1; ctx.beginPath(); ctx.arc(p.x, p.y - 1, 11, a, a + 0.8); ctx.stroke(); } }
  for (const b of E.bullets) {
    if (b.moth) { icon16(ctx, IC(59, 13), b.x - 5, b.y - 5, 10); continue; }
    if (b.spr && drawProj(ctx, b.spr, b.x, b.y, Math.atan2(b.vy, b.vx), b.t || 0)) continue;
    ctx.fillStyle = b.color || "#fff"; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 4; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  }
  for (const x of E.fx) {
    const k = x.t / 0.6;
    if (x.type === "ring") { ctx.strokeStyle = x.col; ctx.globalAlpha = 1 - k; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x.x, x.y, (x.big ? 40 : 16) * k + 4, 0, 7); ctx.stroke(); }
    if (x.type === "spark") { ctx.fillStyle = x.col; ctx.globalAlpha = 1 - k; for (let i = 0; i < 6; i++) { const a = i * 1.05 + x.x; ctx.fillRect(x.x + Math.cos(a) * k * 14, x.y + Math.sin(a) * k * 14, 1.5, 1.5); } }
    if (x.type === "burst") { ctx.fillStyle = "#fff"; ctx.globalAlpha = 1 - k; for (let i = 0; i < 10; i++) { const a = i * 0.63; ctx.fillRect(x.x + Math.cos(a) * k * 20, x.y - 6 + Math.sin(a) * k * 20, 2, 2); } }
    if (x.type === "shards") { ctx.fillStyle = "#cfe8ff"; ctx.globalAlpha = 1 - k; for (let i = 0; i < 12; i++) { const a = i * 0.52; ctx.fillRect(x.x + Math.cos(a) * k * 24, x.y + Math.sin(a) * k * 24 + k * k * 10, 2, 1); } }
    if (x.type === "boom") { ctx.fillStyle = `rgba(255,170,60,${0.6 * (1 - k)})`; ctx.beginPath(); ctx.arc(x.x, x.y, x.r * (0.6 + k * 0.5), 0, 7); ctx.fill(); }
    if (x.type === "vine" || x.type === "beam") { ctx.strokeStyle = x.type === "vine" ? "#58b84f" : "#ffe9a0"; ctx.globalAlpha = 1 - k; ctx.lineWidth = x.type === "beam" ? 4 : 2; ctx.beginPath(); ctx.moveTo(x.x, x.y); ctx.lineTo(x.x2, x.y2); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  const dark = (R === "silt" || R === "roots") && !has("echoBulb") && !has("mycelCrown");
  if (dark) { ctx.save(); ctx.beginPath(); ctx.rect(BOX.x, BOX.y, BOX.w, BOX.h); ctx.clip(); drawLight(p.x, p.y, 62, 0.92); ctx.restore(); }
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(BOX.x - 1, BOX.y - 1, BOX.w + 2, BOX.h + 2);
  if (R === "sun" && E.wind.state !== "idle") { const w = E.wind, col = w.state === "warn" ? `rgba(255,255,255,${0.4 + Math.sin(performance.now() / 50) * 0.4})` : "#e9f6ff";
    for (let i = 0; i < 6; i++) { const ox = BOX.x + 20 + ((i * 47 + (w.state === "gust" ? t * 160 : 0)) % (BOX.w - 40)), oy = BOX.y + 20 + (i * 31) % (BOX.h - 40);
      outlineText(ctx, w.dx > 0.5 ? "»" : w.dx < -0.5 ? "«" : w.dy > 0 ? "v" : "^", ox, oy, col, "10px 'Pixelify Sans'"); }
    outlineText(ctx, w.state === "warn" ? "GUST INCOMING" : "GUST!", BOX.x + BOX.w / 2, BOX.y - 4, "#e9f6ff", "7px 'Pixelify Sans'"); }
  const C = COMPANIONS[G.companion];
  drawChar(ctx, C.char, 2, Math.floor(performance.now() / 330) % 2 ? 1 : 0, BOX.x - 26, BOX.y + BOX.h - 2);
  outlineText(ctx, C.name, BOX.x - 26, BOX.y + BOX.h + 8, "#9fd3ff", "6px 'Pixelify Sans'");
  ctx.restore();
  drawEncHud();
  if (E.intro > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.max(0, E.flash)})`; ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, VH / 2 - 22, VW, 44);
    outlineText(ctx, E.boss ? `${E.foes[0].F.name} attacks!` : `${E.foes.map(f => f.F.name).join(", ")} ${E.foes.length > 1 ? "draw" : "draws"} near!`, VW / 2, VH / 2 - 4, "#ffe46a", "11px 'Pixelify Sans'");
    outlineText(ctx, "Drag back & release to launch · Space at impact = PARRY", VW / 2, VH / 2 + 12, "#fff", "7px 'Pixelify Sans'"); }
  if (E.over) {
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, 0, VW, VH);
    outlineText(ctx, E.over === "win" ? "VICTORY" : E.over === "flee" ? "ESCAPED" : "SHATTERED", VW / 2, VH / 2 - 6, E.over === "win" ? "#ffe46a" : "#ff8080", "18px 'Pixelify Sans'");
    if (E.overT > 0.8) outlineText(ctx, "Press Enter / click", VW / 2, VH / 2 + 14, "#fff", "8px 'Pixelify Sans'");
  }
}
function drawTrajectory(vx, vy) {
  const p = E.p, o = { x:p.x, y:p.y, vx, vy }, dt = 1 / 60, steps = has("echoBulb") ? 150 : 80;
  for (let i = 0; i < steps; i++) {
    o.vx *= Math.exp(-0.55 * dt); o.vy *= Math.exp(-0.55 * dt);
    let stop = false;
    for (let s = 0; s < 3 && !stop; s++) { o.x += o.vx * dt / 3; o.y += o.vy * dt / 3;
      for (const Rc of E.rects) { if (Rc.dead) continue; const n = collideRect(o, p.r, Rc); if (n) { const vn = o.vx * n[0] + o.vy * n[1]; if (vn < 0) { if (Rc.type === "moss") { stop = true; break; } o.vx -= 2 * vn * n[0]; o.vy -= 2 * vn * n[1]; if (Rc.type === "bumper") { o.vx *= 1.6; o.vy *= 1.6; } } } } }
    if (i % 3 === 0) { ctx.globalAlpha = 1 - i / steps; ctx.fillStyle = TIER_COL[tierOf(Math.hypot(o.vx, o.vy))]; ctx.fillRect(o.x - 1, o.y - 1, 2, 2); }
    if (stop || Math.hypot(o.vx, o.vy) < 20) break;
  }
  ctx.globalAlpha = 1;
  if (E.aim) { ctx.strokeStyle = "#ffffff88"; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(E.aim.sx, E.aim.sy); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); ctx.setLineDash([]); }
}
function drawEncHud() {
  const p = E.p;
  const hs = E.foes.filter(f => !f.dead && !f.phantom && !f.calm);
  hs.slice(0, 4).forEach((f, i) => { const x = 8 + i * 94, y = 6;
    outlineText(ctx, f.F.name + (f.F.armored ? " [armored]" : ""), x, y + 6, f.F.boss ? "#ff8a80" : "#fff", "7px 'Pixelify Sans'", "left");
    ctx.fillStyle = "#222"; ctx.fillRect(x, y + 9, 86, 4); ctx.fillStyle = f.F.boss ? "#ff3b3b" : "#e0473f"; ctx.fillRect(x, y + 9, 86 * Math.max(0, f.hp) / f.maxHp, 4); });
  const by = BOX.y + BOX.h + 6;
  outlineText(ctx, "HP", BOX.x, by + 7, "#fff", "7px 'Pixelify Sans'", "left");
  ctx.fillStyle = "#300"; ctx.fillRect(BOX.x + 14, by + 1, 70, 7); ctx.fillStyle = "#ffdf3a"; ctx.fillRect(BOX.x + 14, by + 1, 70 * G.hp / maxHp(), 7);
  outlineText(ctx, `${Math.ceil(G.hp)}/${maxHp()}`, BOX.x + 88, by + 7, "#fff", "7px 'Pixelify Sans'", "left");
  outlineText(ctx, "ST", BOX.x, by + 18, "#fff", "7px 'Pixelify Sans'", "left");
  for (let i = 0; i < 10; i++) { ctx.fillStyle = i < Math.floor(E.stamina) ? "#5fb3ff" : "#123"; ctx.fillRect(BOX.x + 14 + i * 7, by + 12, 6, 6); }
  outlineText(ctx, "SHELL", BOX.x + 90, by + 18, "#fff", "7px 'Pixelify Sans'", "left");
  for (let i = 0; i < 3; i++) { ctx.strokeStyle = i < p.cracks ? "#ff8080" : "#9fd3ff"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(BOX.x + 118 + i * 9, by + 12); ctx.lineTo(BOX.x + 122 + i * 9, by + 18); ctx.lineTo(BOX.x + 126 + i * 9, by + 12); ctx.closePath(); ctx.stroke(); }
  if (has("amber")) outlineText(ctx, `KINETIC ${E.kinetic}`, BOX.x + 150, by + 18, "#ffb35a", "7px 'Pixelify Sans'", "left");
  const sp = pSpeed(), tier = tierOf(sp);
  outlineText(ctx, `${TIER_NAME[tier]} ${Math.round(sp)}`, BOX.x + BOX.w, by + 7, TIER_COL[tier], "7px 'Pixelify Sans'", "right");
  if (E.combo >= 2) { const st = STYLE.find(s => E.combo >= s[0]); outlineText(ctx, `x${E.combo} ${st ? st[1] : ""}`, BOX.x + BOX.w, by + 18, "#ffe46a", "8px 'Pixelify Sans'", "right"); }
  const L = activeList(); let hx = BOX.x; const hy = VH - 24;
  [...L.map((a, i) => ({ key:String(i + 1), icon:a.icon, name:a.name, ok:E.stamina >= a.cost && (!a.need || a.need()) })),
   { key:"H", icon:ICON.potions, name:`Tonic ${G.res.potions}`, ok:G.res.potions > 0 }, { key:"B", icon:ICON.bombs, name:`Bomb ${G.res.bombs}`, ok:G.res.bombs > 0 },
   { key:"⇧", icon:IC(121, 0), name:"Dash", ok:E.stamina >= 2 }].forEach(s => {
    ctx.globalAlpha = s.ok ? 1 : 0.35; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.strokeRect(hx + 0.5, hy + 0.5, 15, 15); icon16(ctx, s.icon, hx + 2, hy + 2, 12);
    outlineText(ctx, s.key, hx + 2, hy + 6, "#ffe46a", "6px 'Pixelify Sans'", "left");
    outlineText(ctx, s.name, hx + 8, hy + 22, "#ddd", "5px 'Pixelify Sans'"); ctx.globalAlpha = 1; hx += 30; });
  outlineText(ctx, E.boss ? "Bosses can't be fled" : (E.flee > 0 ? "Fleeing…" : "Hold Esc to flee"), VW - 8, VH - 6, "#888", "6px 'Pixelify Sans'", "right");
  outlineText(ctx, "SPACE: parry at impact", VW - 8, VH - 14, E.wallWin > 0 ? "#ffe46a" : "#888", "6px 'Pixelify Sans'", "right");
  for (const fl of E.floats) outlineText(ctx, fl.s, fl.x, fl.y - fl.t * 14, fl.col, "7px 'Pixelify Sans'");
}

/* =====================================================================
   PANELS (shop, camp, loadout, inventory, pulse map)
   ===================================================================== */
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

/* =====================================================================
   TITLE / ENDINGS
   ===================================================================== */
function showTitle() {
  mode = "title"; renderHud(); DLG = null; document.getElementById("dialog").classList.add("hidden");
  const s = loadSave(), el = document.getElementById("title"); el.classList.remove("hidden");
  el.innerHTML = `<div class="in">
    <div class="row" style="justify-content:center;gap:16px;align-items:flex-end">${charHTML(CHAR.kaelen, 3)}${charHTML(CHAR.sylva, 3)}${charHTML(CHAR.player, 4)}${charHTML(CHAR.bram, 3)}${tileHTML("tent", 0.6)}</div>
    <h1>The Great Wilt</h1>
    <p class="muted" style="font-size:17px">A pale, silent, calcifying blight spreads from the Iron Roots. Walk the canopy, keep the forest in balance, and ricochet through anything that stands in your way.</p>
    <div class="row" style="justify-content:center;margin:18px 0">
      <button class="pri" onclick="beginGame(true)">Begin a new season</button>
      ${s && !s.over ? `<button onclick="beginGame(false)">Continue (Day ${s.day})</button>` : ""}
    </div>
    <div class="box" style="text-align:left;padding:12px 14px;font-size:14px">
      <b style="color:#f0b440">Explore</b> — <kbd>WASD</kbd> walk, <kbd>Shift</kbd> run, <kbd>E</kbd> talk / harvest / open, <kbd>I</kbd> grafts &amp; bag, <kbd>M</kbd> Pulse map, <kbd>F</kbd> fullscreen. Walk off a map edge to travel (takes half a day).<br>
      <b style="color:#f0b440">Fight</b> — touch a monster to enter an encounter box. <b>Drag back and release</b> to slingshot yourself into enemies. Faster = harder hits.
      <kbd>Space</kbd> right as you hit a wall = <b>Parry</b>. <kbd>Shift</kbd> dash, <kbd>1</kbd>–<kbd>5</kbd> graft abilities, <kbd>H</kbd> tonic, <kbd>B</kbd> bomb, hold <kbd>Esc</kbd> to flee.
    </div>
    <div class="small muted" style="margin-top:14px">Characters: Super Retro World Character Pack by Gif (@gif_not_jif), Noiracide (@Noiracide) &amp; Romi (@DessRomaric) ·
    Enemies: Tiny Enemies Vol1 by Vryell (@Vryell) and Tiny RPG Character Asset Pack 02 · Tiles &amp; icons: Raven Fantasy — Clockwork Raven Studios.</div></div>`;
}
function beginGame(fresh) {
  if (fresh) newGame(); else { G = loadSave(); if (!G) newGame(); }
  for (const k in WORLDS) delete WORLDS[k];
  document.getElementById("title").classList.add("hidden");
  enterRegion(G.loc);
  if (fresh) say(["The Great Wilt spreads from the Iron Roots: pale, silent, calcifying.", "Your Strider-Caravan is parked here in the Twilight Trunk. Sylva sits by the fire, blindfold fluttering.",
    "\"The forest is drifting out of balance, Graftwarden. Harvest gently. Clear the waste. And when beasts come for you...\"", "\"...remember: speed is power. Pull back, and let go.\""], { char:CHAR.sylva, name:"Sylva" });
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

/* =====================================================================
   MAIN LOOP
   ===================================================================== */
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  ctx.setTransform(S, 0, 0, S, 0, 0); ctx.imageSmoothingEnabled = false;
  try {
    if (mode === "world" && M) { if (!uiOpen()) updateWorld(dt); else document.getElementById("prompt").classList.add("hidden"); if (mode === "world") drawWorld(); }
    else if (mode === "encounter" && E) { if (!uiOpen()) updateEncounter(dt); if (E) drawEncounter(); }
    else { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, VW, VH); }
  } catch (err) { console.error(err); }
  tickDialog(dt);
  if (fade.dir) { fade.a += fade.dir * dt * 4; if (fade.a >= 1 && fade.dir > 0) { fade.a = 1; fade.dir = -1; const cb = fade.cb; fade.cb = null; if (cb) cb(); } if (fade.a <= 0 && fade.dir < 0) { fade.a = 0; fade.dir = 0; } }
  if (fade.a > 0) { ctx.setTransform(S, 0, 0, S, 0, 0); ctx.fillStyle = `rgba(0,0,0,${fade.a})`; ctx.fillRect(0, 0, VW, VH); }
  hudT -= dt; if (hudT <= 0 && mode === "world") { hudT = 0.25; renderHud(); }
  pressed = {};
  requestAnimationFrame(frame);
}
[PATHS.icons32, PATHS.icons16, PATHS.tiles16, PATHS.tiles32, ...[16,4,3,9,31,1,14,27,19].map(charPath),
 ...Object.values(TINY).map(s => PATHS.tiny + s.file), ...Object.values(BIGS).map(s => PATHS.dungeon + s.file)].forEach(img);
showTitle();
requestAnimationFrame(frame);

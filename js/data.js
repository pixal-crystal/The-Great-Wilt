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

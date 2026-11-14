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
  const yOff = (frame === 1) ? 1 : 0;
  c.drawImage(im, frame * 16, dir * 20, 16, 20, Math.round(x - 8), Math.round(y - 20 + yOff), 16, 20);
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

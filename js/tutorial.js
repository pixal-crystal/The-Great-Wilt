/* =========================================================================
   TUTORIAL & FIELD GUIDE — Comprehensive interactive guide to The Great Wilt.
   Explains the biopunk/solarpunk lore, the PALE protocol threat, the kinetic
   slingshot combat system, living weapons & forging, grafts & symbiosis,
   canopy stewardship (The Pulse), companions, and controls.
   ========================================================================= */

let currentTutorialTab = "world";

function setTutorialTab(tab) {
  currentTutorialTab = tab;
  refreshPanel();
}

function tutorialPanel() {
  const tabs = [
    { id: "world", icon: iconHTML(ICON.echo, 16), label: "1. The World & Lore" },
    { id: "combat", icon: iconHTML(IC(121, 0), 16), label: "2. Kinetic Combat" },
    { id: "weapons", icon: iconHTML(ICON.sword, 16), label: "3. Living Weapons" },
    { id: "grafts", icon: iconHTML(ICON.symb, 16), label: "4. Grafts & Growth" },
    { id: "pulse", icon: iconHTML(REGIONS.sun.icon, 16), label: "5. Canopy Ecology" },
    { id: "controls", icon: "🎮", label: "6. Controls Quick-Sheet" },
  ];

  const navHTML = `<div class="guide-nav">
    ${tabs.map(t => `
      <button class="guide-nav-btn ${currentTutorialTab === t.id ? "active" : ""}" onclick="setTutorialTab('${t.id}')">
        ${t.icon} ${t.label}
      </button>
    `).join("")}
  </div>`;

  let contentHTML = "";
  switch (currentTutorialTab) {
    case "world":
      contentHTML = tutorialWorldHTML();
      break;
    case "combat":
      contentHTML = tutorialCombatHTML();
      break;
    case "weapons":
      contentHTML = tutorialWeaponsHTML();
      break;
    case "grafts":
      contentHTML = tutorialGraftsHTML();
      break;
    case "pulse":
      contentHTML = tutorialPulseHTML();
      break;
    case "controls":
      contentHTML = tutorialControlsHTML();
      break;
    default:
      contentHTML = tutorialWorldHTML();
  }

  return `${panelTabsHTML("tutorial")}
    <div class="row" style="justify-content:space-between;margin-bottom:10px">
      <div>
        <h2>📖 Field Guide &amp; Tutorial</h2>
        <div class="small muted">Everything you need to know about the canopy, the blight, and survival.</div>
      </div>
    </div>
    ${navHTML}
    ${contentHTML}
  `;
}

/* ---------- 1. THE WORLD & LORE ---------- */
function tutorialWorldHTML() {
  return `
    <div class="guide-hero">
      <div class="row" style="gap:12px;margin-bottom:8px">
        <span style="font-size:32px">🌿</span>
        <div>
          <div style="font-size:18px;font-weight:600;color:var(--amber)">VERDANT-9 &amp; The Great Wilt</div>
          <div class="small muted">A biopunk / solarpunk post-collapse survival RPG</div>
        </div>
      </div>
      <div style="font-size:14px;line-height:1.5">
        Centuries ago, human terraforming engineers launched <b>VERDANT-9</b>: a titanic bio-canopy engineered to scrub the atmosphere
        and sustain an eternal living ecosystem. But the Old World collapsed, and the project was left running with <b>no off-switch</b>.
        Over centuries, the forest mutated, sprouted neural roots, and drifted far from its original Directorate specifications.
      </div>
    </div>

    <div class="guide-callout warn">
      <b>⚠ The Threat: Protocol PALE</b><br>
      Deep beneath the canopy in <b>The Iron Roots</b>, an automated security protocol named <b>PALE</b> has awakened.
      Detecting that the ecosystem has drifted from spec, PALE has begun a silent, calcifying purge known as <b>The Great Wilt</b>.
      If left unchecked, PALE will petrify the canopy and exterminate all living inhabitants.
    </div>

    <h3>Your Mission: The Graftwarden</h3>
    <div class="card" style="margin-bottom:12px;line-height:1.45">
      You are the <b>Graftwarden</b>, a nomad who can weave living mutated flora and ancient cybernetics directly into your flesh.
      You travel aboard the <b>Strider-Caravan</b>—a walking village built atop a colossal domesticated canopy beast.
      To stop the reset, you must explore four distinct canopy biomes, recover <b>3 Root Echoes</b> (acoustic memories of the terraformers),
      breach the acoustic gate to the Iron Roots, and decide the fate of VERDANT-9 at the <b>Root-Core</b>.
    </div>

    <h3>The Strider-Caravan Companions</h3>
    <div class="guide-grid">
      <div class="card">
        <div class="row">${charHTML(CHAR.sylva, 2.5)}<div><b>Sylva</b><div class="small muted">Mycelial Oracle</div></div></div>
        <div class="small" style="margin-top:6px;line-height:1.4">Blindfolded mystic attuned to fungal spores. Slows enemies in combat, provides advance hazard warnings, and clears industrial waste with extra balance gain.</div>
      </div>
      <div class="card">
        <div class="row">${charHTML(CHAR.kaelen, 2.5)}<div><b>Kaelen</b><div class="small muted">Ex-Industrialist</div></div></div>
        <div class="small" style="margin-top:6px;line-height:1.4">Exosuit engineer who favors human machines over nature. Fires high-damage steam-lance bolts in battle and increases scrap yields from salvage.</div>
      </div>
      <div class="card">
        <div class="row">${charHTML(CHAR.bram, 2.5)}<div><b>Bram &amp; Pip</b><div class="small muted">Scavenger Duo</div></div></div>
        <div class="small" style="margin-top:6px;line-height:1.4">A burly tinkerer and his trained messenger-moth. Pip stuns enemies in battle, while Bram can breach sealed pre-collapse Director bunkers to retrieve lost Root Echoes.</div>
      </div>
    </div>

    <h3>The Three Endings (At the Root-Core)</h3>
    <div class="guide-grid">
      <div class="card" style="border-left:4px solid #6fcf6a">
        <b style="color:#6fcf6a">1. Symbiosis (Root-Singer)</b>
        <div class="small muted" style="margin:4px 0">Merge with the neural-root to rewrite PALE into harmony.</div>
        <div class="small"><b>Requirements:</b> Reach Overgrowth (Symbiosis &gt; 8) OR perform 2 Restoration Rituals.</div>
      </div>
      <div class="card" style="border-left:4px solid #ffb35a">
        <b style="color:#ffb35a">2. Dominion (Industrialist)</b>
        <div class="small muted" style="margin:4px 0">Sever the Root-Core with industrial steam technology.</div>
        <div class="small"><b>Requirements:</b> Travel with Kaelen + hold at least 10 Scrap in inventory.</div>
      </div>
      <div class="card" style="border-left:4px solid #5fb3ff">
        <b style="color:#5fb3ff">3. Migration (The Ark)</b>
        <div class="small muted" style="margin:4px 0">Reinforce the Strider-Caravan and flee into the open sea.</div>
        <div class="small"><b>Requirements:</b> Travel with Bram &amp; Pip + construct all 3 Caravan Upgrades.</div>
      </div>
    </div>
  `;
}

/* ---------- 2. KINETIC COMBAT ---------- */
function tutorialCombatHTML() {
  return `
    <div class="guide-hero">
      <div class="row" style="gap:12px;margin-bottom:8px">
        <span style="font-size:32px">🏹</span>
        <div>
          <div style="font-size:18px;font-weight:600;color:var(--amber)">Kinetic Ricochet Combat</div>
          <div class="small muted">You are the projectile — speed is your weapon</div>
        </div>
      </div>
      <div style="font-size:14px;line-height:1.5">
        In The Great Wilt, you don't swing a stationary sword. When touching a creature in the world, you enter a kinetic combat arena.
        <b>Click and drag back anywhere on the screen to aim, then release to launch yourself</b> like a slingshot!
        Time slows to a crawl while you hold your aim.
      </div>
    </div>

    <h3>Speed Tiers &amp; Damage Multipliers</h3>
    <div class="guide-grid">
      <div class="card" style="border-left:4px solid #5fb3ff">
        <b style="color:#5fb3ff">Blue Tier (&lt;170 px/s)</b>
        <div class="small" style="margin-top:4px">1.0× Damage. Slow bounce. If you hit a hard wall at this speed, your shell will crack!</div>
      </div>
      <div class="card" style="border-left:4px solid #ffd94a">
        <b style="color:#ffd94a">Yellow Tier (170–319 px/s)</b>
        <div class="small" style="margin-top:4px">1.6× Damage. Safe wall collision speed. Deals solid momentum damage to unarmored foes.</div>
      </div>
      <div class="card" style="border-left:4px solid #ff5a3c">
        <b style="color:#ff5a3c">Red Tier (320–449 px/s)</b>
        <div class="small" style="margin-top:4px">2.4× Damage. Pierces enemy armor, breaks cracked stone obstacles, and charges kinetic weapon bursts!</div>
      </div>
      <div class="card" style="border-left:4px solid #ffffff">
        <b style="color:#ffffff">White-Hot Tier (≥450 px/s)</b>
        <div class="small" style="margin-top:4px">3.0× Damage. Maximum devastating impact. Obliterates normal foes and tears through bosses.</div>
      </div>
    </div>

    <div class="guide-callout tip">
      <div style="font-size:15px;font-weight:600;color:var(--amber);margin-bottom:4px">⚡ Master the Wall Parry (<kbd>Space</kbd>)</div>
      <div>
        The split second you impact any arena wall, tap <kbd>Space</kbd>! A successful <b>WALL PARRY</b>:
        <ul style="margin:4px 0 0;padding-left:18px">
          <li><b>Doubles your velocity instantly</b>, propelling you back into the fight at high speed.</li>
          <li><b>Repairs 1 crack</b> on your shell, keeping you from shattering.</li>
          <li><b>Increases your Combo Rank</b> for style bonuses and damage multipliers.</li>
          <li>Charges stored Kinetic Pistons and triggers tech shockwaves.</li>
        </ul>
      </div>
    </div>

    <h3>Shell Cracks &amp; Shattering</h3>
    <div class="card" style="margin-bottom:12px;line-height:1.4">
      Hitting a wall at low speed without parrying inflicts a <b>Shell Crack</b> (displayed as 3 shell icons in the HUD).
      If you take <b>3 Cracks</b>, your shell <b>SHATTERS</b>: you are stunned for 1.0s, take heavy internal damage, and your combo resets!
    </div>

    <h3>Arena Hazards &amp; Tactical Elements</h3>
    <div class="guide-grid">
      <div class="card">
        <b style="color:#ff6bff">Magenta Bumpers</b>
        <div class="small muted" style="margin-top:4px">Rubberized barriers that launch you forward at 1.6× speed with no crack penalty.</div>
      </div>
      <div class="card">
        <b style="color:#58b84f">Moss Walls &amp; Sap Pools</b>
        <div class="small muted" style="margin-top:4px">Absorbs momentum, bringing you to a complete stop and resetting your combo. Avoid when rushing!</div>
      </div>
      <div class="card">
        <b style="color:#9fe8ff">Refraction Prisms</b>
        <div class="small muted" style="margin-top:4px">Striking a crystal prism at high speed splits you into two phantom ricochets that attack enemies simultaneously!</div>
      </div>
      <div class="card">
        <b style="color:#ffb35a">Combat Consumables</b>
        <div class="small muted" style="margin-top:4px">Press <kbd>H</kbd> to drink Sap Tonic (+12 HP) or <kbd>B</kbd> to throw a high-explosive Resin Bomb at your cursor!</div>
      </div>
    </div>
  `;
}

/* ---------- 3. LIVING WEAPONS ---------- */
function tutorialWeaponsHTML() {
  return `
    <div class="guide-hero">
      <div class="row" style="gap:12px;margin-bottom:8px">
        <span style="font-size:32px">⚔</span>
        <div>
          <div style="font-size:18px;font-weight:600;color:var(--amber)">Living Weapons &amp; The Armory</div>
          <div class="small muted">Biological evolution vs. Industrial machinery</div>
        </div>
      </div>
      <div style="font-size:14px;line-height:1.5">
        Swords in Verdant-9 aren't standard steel—they are living bio-weapons, salvaged pre-collapse technology, or a hybrid of both.
        Your equipped blade modifies every single kinetic strike, reach, parry window, and elemental reaction in battle.
      </div>
    </div>

    <h3>The 4 Base Sword Archetypes</h3>
    <div class="guide-grid">
      <div class="card" style="border-left:4px solid #d8b27a">
        <div class="row" style="justify-content:space-between"><b>Chitin-Cleaver</b> <span class="tag">Heavy / Bruiser</span></div>
        <div class="small muted" style="margin:4px 0">Forged from the shed carapace of a colossal stag-beetle, reinforced with ironwood.</div>
        <div class="small"><b>Perks:</b> 1.35× damage multiplier. Cleaves armor at any speed, staggers beasts for 0.5s, and knocks foes back hard. −10% launch power.</div>
      </div>
      <div class="card" style="border-left:4px solid #ffd25a">
        <div class="row" style="justify-content:space-between"><b>Solar-Sabre</b> <span class="tag">Fast / Precision</span></div>
        <div class="small muted" style="margin:4px 0">A salvaged pre-collapse turbine blade fitted with a copper coil and mirror-glass edge.</div>
        <div class="small"><b>Perks:</b> +12% launch power and a wider parry window. When fighting in sunlit regions (Sun-Crown, Glass-Marsh), hits set foes ablaze.</div>
      </div>
      <div class="card" style="border-left:4px solid #7fd26a">
        <div class="row" style="justify-content:space-between"><b>Briar-Whipblade</b> <span class="tag">Mid-Range / Crowd Control</span></div>
        <div class="small muted" style="margin:4px 0">A segmented sword held together by living, thorny tendons that uncoils on attacks.</div>
        <div class="small"><b>Perks:</b> Extended strike reach (+6px to +16px at red speed). Drags distant enemies toward you and inflicts venomous poison.</div>
      </div>
      <div class="card" style="border-left:4px solid #ffab3c">
        <div class="row" style="justify-content:space-between"><b>Sap-Channeler</b> <span class="tag">Elemental / Status</span></div>
        <div class="small muted" style="margin:4px 0">A hollow, translucent amber-glass rapier with a pressurized hilt reservoir.</div>
        <div class="small"><b>Perks:</b> Injects liquid resin on thrust attacks, heavily slowing foes and causing damage over time. Spore cores trigger on every strike.</div>
      </div>
    </div>

    <h3>Legendary Relic Swords</h3>
    <div class="guide-grid">
      <div class="card" style="border-left:4px solid #ff6a3c">
        <b style="color:#ff6a3c">The First Pruner</b> <span class="tag">Chainsaw Greatsword</span>
        <div class="small" style="margin-top:4px">Massive industrial terraforming chainsaw (1.6× damage). Breaks armor and stone walls. <b>In the overworld, press <kbd>F</kbd> near trees, logs, and stumps to rev through them and open secret shortcuts!</b></div>
      </div>
      <div class="card" style="border-left:4px solid #a8f58a">
        <b style="color:#a8f58a">Heartwood's Fang</b> <span class="tag">Living Katana</span>
        <div class="small" style="margin-top:4px">Grown from the neural-root. Never dulls, needs no fuel, leaves blooming flower trails as you walk, calms aggressive beasts, and can pacify foes on strike.</div>
      </div>
      <div class="card" style="border-left:4px solid #9fe8ff">
        <b style="color:#9fe8ff">Prism-Edge</b> <span class="tag">Refracting Glass</span>
        <div class="small" style="margin-top:4px">Forged from Marsh glass. When bathed in sunlight or struck by a companion's flare, it splits into 3 phantom blades for 10s—tripling all strike counts!</div>
      </div>
    </div>

    <h3>Grafting vs. Forging: The Upgrade Paths</h3>
    <div class="guide-grid">
      <div class="card" style="border-left:4px solid #7fd26a">
        <b style="color:#7fd26a">Root-Singer Bio-Grafting</b>
        <div class="small" style="margin-top:4px">Feed monster organs, spores, and rare seeds to grow root tendrils around the hilt.</div>
        <ul class="small" style="margin:4px 0;padding-left:16px">
          <li><b>Rank 1:</b> Life-steal (12% chance per hit to heal 1 HP) + edge regrows 4/s.</li>
          <li><b>Rank 2:</b> Spore-venom on every hit + 24% life-steal + edge regrows 8/s.</li>
          <li><b>Rank 3:</b> Bioluminescent bloom: 36% life-steal (heals 2 HP), deadly venom, edge regrows 12/s.</li>
          <li><i>Cost:</i> Adds to your Symbiosis meter; vulnerable to extreme fire without rubber grip.</li>
        </ul>
      </div>
      <div class="card" style="border-left:4px solid #ffb35a">
        <b style="color:#ffb35a">Industrialist Tech-Forging</b>
        <div class="small" style="margin-top:4px">Bolt on salvaged pistons, solar capacitors, and pressurized sap-tanks.</div>
        <ul class="small" style="margin:4px 0;padding-left:16px">
          <li><b>Rank 1:</b> Kinetic bursts: red-hot strikes detonate in an explosive radius (2 dmg).</li>
          <li><b>Rank 2:</b> Superheated edge cuts through armor; bursts deal 4 dmg.</li>
          <li><b>Rank 3:</b> Mechanical parry-counter: every parry fires a 4 dmg shockwave; bursts deal 6 dmg.</li>
          <li><i>Cost:</i> Requires 1 Amber Sap fuel per fight; loud machinery alerts predators from further away.</li>
        </ul>
      </div>
    </div>

    <h3>3 Swappable Modular Components</h3>
    <div class="card" style="line-height:1.45">
      Every sword has three customization sockets you can re-fit at the Caravan Workbench:
      <ul style="margin:6px 0;padding-left:18px">
        <li><b>The Edge:</b> Nettle-Thorn Serration (Bleed &amp; Slow), Thermal Filament (Armor melt &amp; heat), or Calcified Blight-Shard (+60% damage vs mutated foes).</li>
        <li><b>The Core / Reservoir:</b> Spore-Sac Gland (Paralytic spore clouds), Kinetic Piston (Stores parry power for shockwaves), or Photosynth-Crystal (Sunlight stamina recharge).</li>
        <li><b>The Hilt / Grip:</b> Tendon-Wrap (+2% launch speed per point of Symbiosis) or Insulated Rubber-Grip (Complete immunity to weapon overheating, blight drain, and fire withering).</li>
      </ul>
    </div>
  `;
}

/* ---------- 4. GRAFTS & GROWTH ---------- */
function tutorialGraftsHTML() {
  return `
    <div class="guide-hero">
      <div class="row" style="gap:12px;margin-bottom:8px">
        <span style="font-size:32px">🧬</span>
        <div>
          <div style="font-size:18px;font-weight:600;color:var(--amber)">Grafts, Symbiosis &amp; Character Growth</div>
          <div class="small muted">Body modification and biological risk/reward</div>
        </div>
      </div>
      <div style="font-size:14px;line-height:1.5">
        As a Graftwarden, you do not wear armor. Instead, you weave living biological tissue into your body across three slots:
        <b>Respiratory</b> (lungs/gills), <b>Limbs</b> (muscles/exoskeletons), and <b>Sensory</b> (eyes/sonar).
      </div>
    </div>

    <h3>The Symbiosis Meter &amp; Overgrowth</h3>
    <div class="card" style="margin-bottom:12px;line-height:1.4">
      Every graft you weave adds to your <b>Symbiosis Meter</b>. When your Symbiosis exceeds the threshold (<b>8</b>), you enter <b>OVERGROWTH</b>:
      <div class="guide-grid" style="margin-top:8px">
        <div class="card" style="border-left:4px solid #6fcf6a">
          <b style="color:#6fcf6a">Overgrowth Benefits</b>
          <ul class="small" style="margin:4px 0;padding-left:16px">
            <li><b>+50% Base Damage</b> on all kinetic attacks.</li>
            <li><b>+10 Max Health</b> added to your pool.</li>
            <li>Enables the <b>Symbiosis Ending</b> at the Root-Core.</li>
          </ul>
        </div>
        <div class="card" style="border-left:4px solid #e0473f">
          <b style="color:#e0473f">Overgrowth Penalties</b>
          <ul class="small" style="margin:4px 0;padding-left:16px">
            <li><b>Fire Damage ×2:</b> Flame attacks and flares burn you severely.</li>
            <li><b>Social Rejection:</b> Industrialist merchants in the Sun-Crown and Glass-Marsh refuse to trade with you, calling you a plant-monster!</li>
          </ul>
        </div>
      </div>
      <div class="small muted" style="margin-top:6px">Tip: You can prune taint and wild growth at any Root-Singer Elder or at camp once the Greenhouse is built.</div>
    </div>

    <h3>Leveling Up &amp; Growth Points (GP)</h3>
    <div class="card" style="line-height:1.45">
      Defeating mutated beasts and blighted horrors in combat awards <b>XP</b>.
      Whenever you level up, you gain <b>Growth Points (GP)</b> to spend directly in your <b>Inventory (<kbd>E</kbd>)</b>:
      <ul style="margin:6px 0;padding-left:18px">
        <li><b>Vital Root (+4 Max HP):</b> Expands your total health pool to survive harder boss strikes.</li>
        <li><b>Kinetic Piston (+5% Launch Power):</b> Increases your base slingshot launch velocity, helping you hit Red and White-Hot tiers easily.</li>
        <li><b>Chitin Plating (Shell Resilience):</b> Reduces internal damage suffered when taking shell cracks or shattering.</li>
      </ul>
    </div>
  `;
}

/* ---------- 5. CANOPY ECOLOGY ---------- */
function tutorialPulseHTML() {
  return `
    <div class="guide-hero">
      <div class="row" style="gap:12px;margin-bottom:8px">
        <span style="font-size:32px">🗺</span>
        <div>
          <div style="font-size:18px;font-weight:600;color:var(--amber)">Canopy Stewardship &amp; The Pulse</div>
          <div class="small muted">Ecosystem balance is your life support</div>
        </div>
      </div>
      <div style="font-size:14px;line-height:1.5">
        VERDANT-9 consists of four linked regional biomes: <b>The Sun-Crown</b> (high canopy), <b>The Twilight Trunk</b> (mid bark ridges),
        <b>The Silt-Floor</b> (toxic ruins), and <b>The Glass-Marsh</b> (flooded ruins). Press <kbd>M</kbd> to open <b>The Pulse</b>, a living ecological heatmap.
      </div>
    </div>

    <h3>Regional Balance (0–100)</h3>
    <div class="guide-grid">
      <div class="card" style="border-left:4px solid #6fcf6a">
        <b style="color:#6fcf6a">Balanced (≥60)</b>
        <div class="small" style="margin-top:4px">Thriving nature. Standard shop prices, abundant resource nodes, and passive fauna.</div>
      </div>
      <div class="card" style="border-left:4px solid #e8cf4a">
        <b style="color:#e8cf4a">Depleted (30–59)</b>
        <div class="small" style="margin-top:4px">Strained ecology. Nodes yield 50% less materials, and merchant scarcity markups raise shop prices by 50%!</div>
      </div>
      <div class="card" style="border-left:4px solid #e0473f">
        <b style="color:#e0473f">Enraged (&lt;30)</b>
        <div class="small" style="margin-top:4px"><b>Ecological Crisis!</b> Merchants board up their stalls, harvesting is blocked, and an <b>Apex Warden</b> awakens to hunt you!</div>
      </div>
    </div>

    <div class="guide-callout warn">
      <b>💀 Total Collapse Game Over</b><br>
      Every day that passes, each region drifts downward in balance. If all four regions become <b>Enraged simultaneously</b>,
      the canopy collapses, the settlements fall into the silt, and the season ends in defeat.
    </div>

    <h3>How to Restore &amp; Protect the Canopy</h3>
    <div class="guide-grid">
      <div class="card">
        <b>1. Clear Industrial Waste (<kbd>F</kbd>)</b>
        <div class="small muted" style="margin-top:4px">Locate pre-collapse rusted machinery leaking toxic residue. Clearing it grants +6 balance (+9 with Sylva) and yields valuable scrap.</div>
      </div>
      <div class="card">
        <b>2. Restoration Rituals</b>
        <div class="small muted" style="margin-top:4px">Collect 2 Rare Seeds, 3 Sap, and 2 Seeds. Perform a canticle at camp or before an Apex Warden to pacify it and reset regional balance to 75.</div>
      </div>
      <div class="card">
        <b>3. Harvest in Moderation</b>
        <div class="small muted" style="margin-top:4px">Tapping amber sap or harvesting crystal nodes drains −4 balance per node. Do not over-harvest an already depleted region.</div>
      </div>
      <div class="card">
        <b>4. Target Mutated Blight</b>
        <div class="small muted" style="margin-top:4px">In combat, slaying calcified blight monsters restores balance, while slaughtering natural native beasts harms balance.</div>
      </div>
    </div>
  `;
}

/* ---------- 6. CONTROLS QUICK-SHEET ---------- */
function tutorialControlsHTML() {
  const pK = keyLabel((BINDINGS.pack && BINDINGS.pack[0]) || "e");
  const iK = keyLabel((BINDINGS.interact && BINDINGS.interact[0]) || "f");
  const qK = keyLabel((BINDINGS.quests && BINDINGS.quests[0]) || "q");
  const mK = keyLabel((BINDINGS.pulse && BINDINGS.pulse[0]) || "m");
  const oK = keyLabel((BINDINGS.settings && BINDINGS.settings[0]) || "o");
  const rK = keyLabel((BINDINGS.run && BINDINGS.run[0]) || "shift");

  return `
    <div class="guide-hero">
      <div class="row" style="gap:12px;margin-bottom:8px">
        <span style="font-size:32px">🎮</span>
        <div>
          <div style="font-size:18px;font-weight:600;color:var(--amber)">Controls &amp; Keybindings Quick-Sheet</div>
          <div class="small muted">Fully customizable in the Settings (<kbd>${oK}</kbd>) menu</div>
        </div>
      </div>
      <div style="font-size:14px;line-height:1.5">
        Here is your complete quick-reference card for overworld exploration, menus, and kinetic combat.
      </div>
    </div>

    <h3>Exploration &amp; Movement</h3>
    <div class="guide-grid">
      <div class="card row" style="justify-content:space-between">
        <b>Move Player</b>
        <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or <kbd>Arrows</kbd></span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Run / Sprint</b>
        <span><kbd>${rK}</kbd></span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Interact / Talk / Harvest</b>
        <span><kbd>${iK}</kbd> or <kbd>Enter</kbd></span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Inventory &amp; Pack (Toggle)</b>
        <span><kbd>${pK}</kbd></span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Quests &amp; Objectives</b>
        <span><kbd>${qK}</kbd></span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>The Pulse (Biome Map)</b>
        <span><kbd>${mK}</kbd></span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Settings &amp; Rebinds</b>
        <span><kbd>${oK}</kbd></span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Toggle Fullscreen</b>
        <span><kbd>${keyLabel((BINDINGS.fullscreen && BINDINGS.fullscreen[0]) || "f11")}</kbd></span>
      </div>
    </div>

    <h3>Kinetic Combat Encounters</h3>
    <div class="guide-grid">
      <div class="card row" style="justify-content:space-between">
        <b>Slingshot Aim &amp; Launch</b>
        <span class="small muted">Click &amp; Drag back, release to launch</span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Wall Parry (Timing!)</b>
        <span><kbd>Space</kbd> at wall impact</span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Combat Dash (i-frames)</b>
        <span><kbd>${rK}</kbd> (uses 2 ST)</span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Drink Sap Tonic (+12 HP)</b>
        <span><kbd>${keyLabel((BINDINGS.tonic && BINDINGS.tonic[0]) || "h")}</kbd></span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Throw Resin Bomb</b>
        <span><kbd>${keyLabel((BINDINGS.bomb && BINDINGS.bomb[0]) || "b")}</kbd></span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Active Graft Abilities</b>
        <span><kbd>1</kbd> · <kbd>2</kbd> · <kbd>3</kbd></span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Flee Combat (Non-Boss)</b>
        <span>Hold <kbd>Esc</kbd> for 1.0s</span>
      </div>
      <div class="card row" style="justify-content:space-between">
        <b>Close / Back / Pause</b>
        <span><kbd>Esc</kbd></span>
      </div>
    </div>

    <div class="row" style="margin-top:14px;justify-content:center">
      <button class="pri" onclick="openPanel(settingsPanel)">⚙ Open Settings to Customize Controls</button>
    </div>
  `;
}


export type PatchNote = {
  highlights: string[]
  source?: string
}

export const PATCH_NOTES: Record<string, PatchNote> = {
  // Pre-Season
  'OT6.5': {
    highlights: ['Early Fortnite alpha prototype', 'Basic Save the World gameplay', 'Unreal Engine 4.12 build'],
    source: 'https://fortnite.fandom.com/wiki/Patch_Notes',
  },
  'OT11': {
    highlights: ['Improved Save the World systems', 'UE 4.16 upgrade', 'Closer to final pre-release build'],
  },
  '1.0': {
    highlights: ['Certification build before official launch', 'Final Save the World pre-release version', 'Core gameplay loop finalized'],
  },
  '1.2.0': {
    highlights: ['Early post-launch patch', 'Bug fixes and stability improvements'],
  },
  '1.7.2': {
    highlights: ['Battle Royale mode added (Sept 2017)', '100 player PvP on a single map', 'Storm circle and bus drop mechanics'],
    source: 'https://fortnite.fandom.com/wiki/V1.7.2_(Battle_Royale)',
  },

  // Season 1
  '1.8.0': {
    highlights: ['Scoped Assault Rifle added', 'Supply Drops introduced', 'Bush consumable added'],
    source: 'https://fortnite.fandom.com/wiki/V1.8_(Battle_Royale)',
  },
  '1.8.1': {
    highlights: ['Smoke Grenades added', 'Map quality and lighting improvements'],
  },
  '1.8.2': {
    highlights: ['Launch Pad added', 'Stats page introduced', 'Various bug fixes'],
  },
  '1.9.0': {
    highlights: ['Cozy Campfire added', 'Duos mode made permanent', 'General balance adjustments'],
    source: 'https://fortnite.fandom.com/wiki/V1.9_(Battle_Royale)',
  },
  '1.9.1': {
    highlights: ['Holiday-themed Battle Bus', 'Bug fixes and stability'],
  },
  '1.10.0': {
    highlights: ['Tilted Towers and Shifty Shafts added', 'Map update with new POIs', 'Hunting Rifle added'],
    source: 'https://fortnite.fandom.com/wiki/V1.10_(Battle_Royale)',
  },

  // Season 2
  '1.11.0': {
    highlights: ['Season 2 Battle Pass introduced', 'Knight-themed skins', 'Lucky Landing added'],
    source: 'https://fortnite.fandom.com/wiki/V1.11_(Battle_Royale)',
  },
  '2.1.0': {
    highlights: ['Chug Jug added', 'Minigun introduced', 'Matchmaking improvements'],
  },
  '2.2.0': {
    highlights: ['Shopping Cart (early vehicle)', 'Bug fixes'],
  },
  '2.3.0': {
    highlights: ['Tilted Towers meteors visible', 'Crossbow added (later vaulted)', 'Limited Time Modes expanded'],
  },
  '2.4.0': {
    highlights: ['Guided Missile added (limited time)', 'Bug fixes and weapon balance'],
  },
  '2.4.2': {
    highlights: ['Guided Missile temporarily vaulted', 'Replay system improvements'],
  },
  '2.5.0': {
    highlights: ['Port-a-Fort added', 'Close Encounters LTM', 'Weapon balance tweaks'],
  },

  // Season 3
  '3.00': {
    highlights: ['Season 3 Battle Pass', 'Hand Cannon (Deagle) added', 'New POIs across the map'],
    source: 'https://fortnite.fandom.com/wiki/V3.0_(Battle_Royale)',
  },
  '3.10': {
    highlights: ['Hunting Rifle added', '60 FPS on consoles', 'Building improvements'],
  },
  '3.10.1': {
    highlights: ['Bug fixes and stability improvements'],
  },
  '3.20.1': {
    highlights: ['New weapon: Heavy Shotgun', 'Hoverboard in Save the World'],
  },
  '3.30': {
    highlights: ['Llama spawn rate reduced', 'Vending Machines added', 'Turbo Building improvements'],
  },
  '3.50': {
    highlights: ['C4 Remote Explosives buffed', 'Port-a-Fort now rare loot', 'Bug fixes'],
  },
  '3.60': {
    highlights: ['Shopping Cart (vehicle) added', 'Comet/Meteor getting closer in sky', 'Season 3 finale approaching'],
  },

  // Season 4
  '4.00': {
    highlights: ['Meteor strikes Dusty Depot — Dusty Divot created', 'Hop Rocks (low gravity consumables) added', 'Season 4 Superhero Battle Pass'],
    source: 'https://fortnite.fandom.com/wiki/V4.0_(Battle_Royale)',
  },
  '4.10': {
    highlights: ['Close Encounters LTM', 'Burst Assault Rifle improved'],
  },
  '4.20': {
    highlights: ['Stink Bombs added', 'Apples (health item) added'],
  },
  '4.40': {
    highlights: ['Dual Pistols added', 'Stink Bombs drop rate adjusted'],
  },
  '4.40.1': {
    highlights: ['Playground LTM (first creative mode)', 'Bug fixes'],
  },
  '4.50': {
    highlights: ['Compact SMG (P90) added', 'SMG meta begins', 'Building material HP reduced'],
  },
  '4.50.1': {
    highlights: ['Rocket Launch event version', 'Visitor launches rocket from villain lair', 'Rifts appear in the sky'],
  },

  // Season 5
  '5.00': {
    highlights: ['Rifts bring new biome — desert (Paradise Palms)', 'ATK (All Terrain Kart) vehicle added', 'Season 5 Battle Pass — Worlds Collide theme'],
    source: 'https://fortnite.fandom.com/wiki/V5.0_(Battle_Royale)',
  },
  '5.00.1': {
    highlights: ['Birthday event challenges', 'Bug fixes from season launch'],
  },
  '5.10': {
    highlights: ['Compact SMG (P90) added', 'Rifts fully active across map'],
  },
  '5.21.1': {
    highlights: ['Heavy Sniper Rifle added', 'Rift-to-Go item introduced'],
  },
  '5.30': {
    highlights: ['Kevin the Cube spawns from lightning near Paradise Palms', 'Rift Zones begin forming', 'Score Royale LTM'],
    source: 'https://fortnite.fandom.com/wiki/V5.30_(Battle_Royale)',
  },
  '5.40': {
    highlights: ['Kevin the Cube rolls across the map', 'Low-gravity rune zones created', 'Suppressed AR added'],
    source: 'https://fortnite.fandom.com/wiki/V5.40_(Battle_Royale)',
  },
  '5.41': {
    highlights: ['Kevin reaches Loot Lake and dissolves into the water', 'Loot Lake becomes bouncy', 'Season 5 finale'],
  },

  // Season 6
  '6.00': {
    highlights: ['Kevin rises from Loot Lake with a floating island', 'Shadow Stones for invisibility', 'Season 6 Battle Pass — Darkness Rises'],
    source: 'https://fortnite.fandom.com/wiki/V6.0_(Battle_Royale)',
  },
  '6.01': {
    highlights: ['Floating island moves to first corrupted zone', 'Chiller Trap added'],
  },
  '6.01.1': {
    highlights: ['Island absorbs energy from corrupted zone', 'Bug fixes'],
  },
  '6.02': {
    highlights: ['Quad Crasher vehicle added', 'Island visits Wailing Woods corrupted zone'],
  },
  '6.02.1': {
    highlights: ['Island continues absorbing rune energy', 'Balance adjustments'],
  },
  '6.10': {
    highlights: ['Quadcrasher everywhere', 'Island near Retail Row', 'Tournaments system added'],
  },
  '6.10.1': {
    highlights: ['In-game tournament improvements', 'Island traveling'],
  },
  '6.10.2': {
    highlights: ['Kevin cracking on the island', 'Map changes around rune sites'],
  },
  '6.20': {
    highlights: ['Butterfly Event — Kevin explodes, players enter rift dimension', 'Leaky Lake transforms into peaceful island', 'Six Shooter added'],
    source: 'https://fortnite.fandom.com/wiki/V6.20_(Battle_Royale)',
  },
  '6.21': {
    highlights: ['Kevin fragments reform at Leaky Lake', 'Mounted Turret added', 'Glider Redeploy tested'],
  },
  '6.22': {
    highlights: ['Heavy AR (AK-47) added', 'Kevin continues reassembling'],
  },
  '6.30': {
    highlights: ['Kevin reforms and explodes in final burst', 'Team Rumble LTM added (permanent later)', 'Dynamite added'],
    source: 'https://fortnite.fandom.com/wiki/V6.30_(Battle_Royale)',
  },
  '6.31': {
    highlights: ['Season 6 finale', 'Leaky Lake aftermath', 'Sword weapon teased'],
  },

  // Season 7
  '7.00': {
    highlights: ['Iceberg collides with island — snow biome added', 'Planes (X-4 Stormwing) added', 'Wraps (weapon skins) introduced', 'Creative Mode launched'],
    source: 'https://fortnite.fandom.com/wiki/V7.0_(Battle_Royale)',
  },
  '7.10': {
    highlights: ['Boombox added', '14 Days of Fortnite event'],
  },
  '7.20': {
    highlights: ['Ice Storm event — Ice King covers map in snow', 'Scoped Revolver added', 'One Shot LTM'],
  },
  '7.30': {
    highlights: ['Chiller Grenades added', 'Solid Gold LTM returns'],
  },
  '7.40': {
    highlights: ['Infantry Rifle added', 'Earthquake tremors begin (teasing Season 8)', 'Driftboard added'],
  },

  // Season 8
  '8.00': {
    highlights: ['Volcano erupts — Wailing Woods destroyed, Sunny Steps and Lazy Lagoon added', 'Pirate Cannons', 'Free Season 8 Battle Pass event'],
    source: 'https://fortnite.fandom.com/wiki/V8.0_(Battle_Royale)',
  },
  '8.20': {
    highlights: ['Floor is Lava LTM', 'Poison Dart Trap added'],
  },
  '8.30': {
    highlights: ['Reboot Vans added (teammate respawning)', 'Buccaneer Bounty event'],
  },
  '8.40': {
    highlights: ['Air Royale LTM', 'Infantry Rifle reworked to hitscan'],
  },
  '8.50': {
    highlights: ['Unvaulting Event — community votes to unvault Drum Gun', 'Volcano erupts, destroys Tilted Towers and Retail Row'],
    source: 'https://fortnite.fandom.com/wiki/V8.50_(Battle_Royale)',
  },
  '8.51': {
    highlights: ['Tilted and Retail in ruins from lava', 'Season 8 finale version'],
  },

  // Season 9
  '9.00': {
    highlights: ['Neo Tilted and Mega Mall replace destroyed POIs', 'Slipstreams (wind tunnels) added', 'Combat Shotgun introduced'],
    source: 'https://fortnite.fandom.com/wiki/V9.0_(Battle_Royale)',
  },
  '9.01': {
    highlights: ['Tactical Assault Rifle added', 'Storm Flip introduced'],
  },
  '9.10': {
    highlights: ['Hot Spots (drones above POIs)', 'Semi-Auto Sniper vaulted'],
  },
  '9.20': {
    highlights: ['Storm Scout Sniper Rifle added', 'Proximity Grenade Launcher'],
  },
  '9.21': {
    highlights: ['Air Strike item added', 'Bug fixes'],
  },
  '9.30': {
    highlights: ['Chug Splash added', 'Revolver unvaulted', '14 Days of Summer event'],
  },
  '9.40': {
    highlights: ['Final Showdown event — Cattus (monster) vs Doggus (mecha)', 'Tactical Shotgun buffed'],
    source: 'https://fortnite.fandom.com/wiki/V9.40_(Battle_Royale)',
  },
  '9.41': {
    highlights: ['Post-event — Cattus skeleton in ocean, Mecha statue', 'Season 9 finale version'],
  },

  // Season X
  '10.00': {
    highlights: ['Zero Point becomes unstable', 'B.R.U.T.E. Mech suit added (controversial)', 'Rift Zones warp POIs to past versions'],
    source: 'https://fortnite.fandom.com/wiki/V10.0_(Battle_Royale)',
  },
  '10.00.1': {
    highlights: ['B.R.U.T.E. balance adjustments', 'Bug fixes'],
  },
  '10.10': {
    highlights: ['Retail Row returns (zombie rift zone)', 'Junk Rift item added'],
  },
  '10.20': {
    highlights: ['Tilted Town rift zone (no building, Wild West)', 'Zapper Trap added'],
  },
  '10.31': {
    highlights: ['Gotham City rift zone replaces Tilted Town', 'Batman crossover event'],
  },
  '10.40': {
    highlights: ['The End event — Visitor activates rockets, black hole consumes the island', 'Two-day black hole downtime before Chapter 2'],
    source: 'https://fortnite.fandom.com/wiki/V10.40_(Battle_Royale)',
  },

  // Chapter 2 Season 1
  '11.00': {
    highlights: ['Chapter 2 launches — brand new Apollo island', '13 new named locations', 'Swimming, fishing, boats, hideables added'],
    source: 'https://fortnite.fandom.com/wiki/V11.00_(Battle_Royale)',
  },
  '11.10': {
    highlights: ['Fortnitemares 2019', 'Storm King LTM'],
  },
  '11.30': {
    highlights: ['Winterfest 2019 with daily presents', 'Snowball Launcher returns'],
  },
  '11.31': {
    highlights: ['Star Wars crossover — Lightsabers added', 'Exclusive in-game movie scene'],
  },
  '11.40': {
    highlights: ['Sidegrading feature added', 'Harpoon Gun changes'],
  },

  // Chapter 2 Season 2
  '12.00': {
    highlights: ['Spy theme — Ghost vs Shadow factions', 'The Agency, The Yacht, The Rig, The Grotto, The Shark', 'Mythic boss weapons introduced'],
    source: 'https://fortnite.fandom.com/wiki/V12.00_(Battle_Royale)',
  },
  '12.10': {
    highlights: ['Crash Pad added', 'Proximity Mine introduced'],
  },
  '12.20': {
    highlights: ['Choppa (helicopter) added', 'Spy Games LTM'],
  },
  '12.21': {
    highlights: ['Bug fixes and helicopter adjustments'],
  },
  '12.40': {
    highlights: ['Kingsman Umbrella added', 'Travis Scott event version'],
    source: 'https://fortnite.fandom.com/wiki/V12.40_(Battle_Royale)',
  },
  '12.41': {
    highlights: ['Travis Scott Astronomical event', 'Party Royale mode added'],
  },
  '12.50': {
    highlights: ['Spy Games expanded', 'Storm the Agency challenges'],
  },
  '12.60': {
    highlights: ['The Device/Doomsday event prep', 'Water levels rising'],
  },
  '12.61': {
    highlights: ['The Device event — Midas activates Doomsday device', 'The Bridge and Jonesy revealed', 'Wall of water surrounds island'],
    source: 'https://fortnite.fandom.com/wiki/V12.61_(Battle_Royale)',
  },

  // Chapter 2 Season 3
  '13.00': {
    highlights: ['Map partially flooded', 'Sharks, loot sharks added', 'Marauders spawn from rifts'],
  },
  '13.20': {
    highlights: ['Cars added as vehicles', 'Water receding, new areas revealed'],
  },
  '13.30': {
    highlights: ['Cars drivable with gas system', 'Water continues to recede'],
  },
  '13.40': {
    highlights: ['Water mostly receded', 'Coral Castle fully accessible'],
  },

  // Chapter 2 Season 4
  '14.00': {
    highlights: ['Marvel Nexus War crossover', 'Thor, Iron Man, She-Hulk, Wolverine', 'Stark Industries, Doom Domain POIs'],
  },
  '14.30': {
    highlights: ['Fortnitemares 2020 — Shadow Midas', 'Ghostbusters crossover'],
  },
  '14.40': {
    highlights: ['Lachlan skin tournament', 'Venom mythic ability'],
  },
  '14.60': {
    highlights: ['Galactus event — players use Battle Bus bombs', 'End of Nexus War', 'Chapter 2 Season 5 tease'],
  },

  // Chapter 2 Season 5+
  '15.00': {
    highlights: ['Zero Point exposed at center of map', 'The Mandalorian crossover', 'Sand Tunneling mechanic'],
  },
  '15.20': {
    highlights: ['Predator boss at Stealthy Stronghold', 'Exotic weapons expanded'],
  },
  '15.21': {
    highlights: ['Bug fixes and balance changes'],
  },
  '15.30': {
    highlights: ['Mando Bounty LTM', 'Lever Action weapons'],
  },
  '15.50': {
    highlights: ['Air Royale returns', 'Season finale approaching'],
  },

  '16.00': {
    highlights: ['Primal theme — crafting system added', 'Makeshift, Primal, Mechanical weapon tiers', 'Spire Tower at center'],
  },
  '16.10': {
    highlights: ['Recycler weapon added', 'Crafting adjustments'],
  },
  '16.20': {
    highlights: ['Unstable Bow added', 'Spire challenges'],
  },
  '16.30': {
    highlights: ['Prop-ifier item added', 'Bug fixes'],
  },
  '16.40': {
    highlights: ['Exotic weapons from NPCs', 'NBA crossover'],
  },
  '16.50': {
    highlights: ['Season finale — Foundation seals Zero Point'],
  },

  '17.10': {
    highlights: ['Alien Nanites and Inflate-A-Bull added', 'Cosmic Summer event'],
  },
  '17.20': {
    highlights: ['Grab-itron gravity gun added', 'Abductors return'],
  },
  '17.30': {
    highlights: ['Zyg and Choppy boss', 'Prop Gun added'],
  },
  '17.40': {
    highlights: ['Sideways Scythe and Minigun added', 'Cube Queen teased'],
  },
  '17.50': {
    highlights: ['Rift Tour (Ariana Grande concert)', 'Season finale version'],
  },

  '18.00': {
    highlights: ['The Sideways introduced — cube-corrupted zones', 'Cube Queen storyline begins', 'New map POIs'],
  },
  '18.10': {
    highlights: ['Combat AR and Combat Pistol added', 'Convergence grows'],
  },
  '18.20': {
    highlights: ['Fortnitemares 2021', 'Cube Town appears'],
  },
  '18.21': {
    highlights: ['Bug fixes and Fortnitemares adjustments'],
  },
  '18.30': {
    highlights: ['Convergence grows larger', 'New Sideways weapons'],
  },
  '18.40': {
    highlights: ['The End Chapter 2 — Cube Queen event', 'Island flips upside down'],
  },

  // Chapter 3
  '19.00': {
    highlights: ['Chapter 3 launches — Artemis island', 'Spider-Man web-shooters', 'Sliding mechanic, tents, Victory Crowns'],
  },
  '19.01': {
    highlights: ['Winterfest 2021', 'Bug fixes and balance'],
  },
  '19.10': {
    highlights: ['Klombo (dinosaur creature) added', 'Tilted Towers rebuilt'],
  },
  '19.30': {
    highlights: ['Covert Cavern added', 'Foundation unmasked as The Rock'],
  },
  '19.40': {
    highlights: ['Doctor Strange crossover', 'Season finale approaching'],
  },

  '20.00': {
    highlights: ['IO vs Seven war', 'Tanks and siege cannons', 'No-build mode introduced'],
  },
  '20.10': {
    highlights: ['Jetpacks return', 'IO drill sites'],
  },
  '20.20': {
    highlights: ['IO Airship appeared', 'Drum Shotgun unvaulted'],
  },
  '20.30': {
    highlights: ['Lantern Fest event', 'Seven Outposts expanded'],
  },
  '20.40': {
    highlights: ['Collision event — IO vs Seven final battle', 'Zero Point protected'],
  },

  '21.00': {
    highlights: ['Reality Tree planted at center of map', 'Darth Vader boss', 'Baller and Rideable Wolves return'],
  },
  '21.10': {
    highlights: ['Naruto rivals crossover', 'Reality Tree growing'],
  },
  '21.20': {
    highlights: ['Dragon Ball crossover', 'Kamehameha and Nimbus Cloud'],
  },
  '21.50': {
    highlights: ['Chrome spreading across map', 'Season finale approaching'],
  },
  '21.51': {
    highlights: ['Season finale version', 'Chrome corruption spreading'],
  },

  '22.00': {
    highlights: ['Chrome theme — Chrome Splash item', 'Herald boss at Herald Sanctum', 'EvoChrome weapons (level up with damage)'],
  },
  '22.40': {
    highlights: ['Fracture event — Chapter 3 ending', 'Island fragments merge into new reality'],
  },
}

export function getPatchNotes(displayName: string): PatchNote | undefined {
  return PATCH_NOTES[displayName]
}

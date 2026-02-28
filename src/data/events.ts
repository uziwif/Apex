export type VersionEvent = {
  event: string
  stageNote?: string
}

export const VERSION_EVENTS: Record<string, VersionEvent> = {
  // Season 4 — Meteor & Rocket Launch
  'season4-4-00': { event: 'Meteor Impact', stageNote: 'Meteor destroys Dusty Depot, creating Dusty Divot' },
  'season4-4-40-1': { event: 'Rocket Launch', stageNote: 'Visitor launches rocket from villain lair, creates rifts in the sky' },
  'season4-4-50': { event: 'Rocket Launch', stageNote: 'Post-rocket — rifts intensify across the map' },
  'season4-4-50-1': { event: 'Rocket Launch', stageNote: 'Season finale — massive rift appears above the map' },

  // Season 5 — Kevin the Cube progression
  'season5-5-00': { event: 'Worlds Collide', stageNote: 'Rift brings new locations — Paradise Palms, Lazy Links, Viking Village' },
  'season5-5-00-1': { event: 'Worlds Collide', stageNote: 'Rifts continue spawning objects and locations' },
  'season5-5-10': { event: 'Worlds Collide', stageNote: 'ATKs added, rifts still active across the map' },
  'season5-5-21-1': { event: 'Worlds Collide', stageNote: 'Rift activity increasing, lightning strikes begin' },
  'season5-5-30': { event: 'Kevin the Cube', stageNote: 'Kevin the Cube spawns near Paradise Palms from a lightning strike' },
  'season5-5-40': { event: 'Kevin the Cube', stageNote: 'Kevin rolls across the map, leaving low-gravity rune zones' },
  'season5-5-41': { event: 'Kevin the Cube', stageNote: 'Kevin reaches Loot Lake and dissolves into the water' },

  // Season 6 — Floating Island & Kevin explosion
  'season6-6-00': { event: 'Floating Island', stageNote: 'Kevin rises from Loot Lake carrying a floating island with house' },
  'season6-6-01': { event: 'Floating Island', stageNote: 'Island begins moving toward first corrupted zone (Fatal Fields)' },
  'season6-6-01-1': { event: 'Floating Island', stageNote: 'Island absorbs energy from corrupted zone, moves on' },
  'season6-6-02': { event: 'Floating Island', stageNote: 'Island visits corrupted zone near Wailing Woods' },
  'season6-6-02-1': { event: 'Floating Island', stageNote: 'Island continues absorbing rune energy' },
  'season6-6-10': { event: 'Floating Island', stageNote: 'Island reaches corrupted zone near Retail Row' },
  'season6-6-10-1': { event: 'Floating Island', stageNote: 'Island traveling between final rune locations' },
  'season6-6-10-2': { event: 'Floating Island', stageNote: 'Island nears final corrupted zone, Kevin cracking' },
  'season6-6-20': { event: 'Butterfly Event', stageNote: 'Kevin cracks open — Butterfly event transforms Leaky Lake into a calm island' },
  'season6-6-21': { event: 'Post-Butterfly', stageNote: 'Kevin fragments scattered around Leaky Lake, reforming' },
  'season6-6-22': { event: 'Post-Butterfly', stageNote: 'Kevin continues reassembling above Leaky Lake' },
  'season6-6-30': { event: 'Kevin Explosion', stageNote: 'Kevin fully reforms and explodes, destroying the island' },
  'season6-6-31': { event: 'Season Finale', stageNote: 'Aftermath of Kevin explosion, Leaky Lake returns to normal' },

  // Season 7 — Ice Storm
  'season7-7-00': { event: 'Season Launch', stageNote: 'Iceberg collides with island, adds Polar Peak and Happy Hamlet' },
  'season7-7-20': { event: 'Ice Storm', stageNote: 'Ice King covers the map in snow, Ice Storm event begins' },

  // Season 8 — Volcano & Unvaulting
  'season8-8-00': { event: 'Season Launch', stageNote: 'Volcano erupts near Wailing Woods, Sunny Steps and Lazy Lagoon added' },
  'season8-8-50': { event: 'Unvaulting', stageNote: 'Community votes to unvault Drum Gun, volcano erupts' },
  'season8-8-51': { event: 'Volcano Aftermath', stageNote: 'Tilted Towers and Retail Row destroyed by lava' },

  // Season 9 — Future theme & Monster vs Mecha
  'season9-9-00': { event: 'Season Launch', stageNote: 'Neo Tilted and Mega Mall replace destroyed POIs' },
  'season9-9-40': { event: 'Final Showdown', stageNote: 'Cattus (monster) vs Doggus (mecha) battle event' },
  'season9-9-41': { event: 'Post-Showdown', stageNote: 'Cattus skeleton in ocean, Mecha statue at Pressure Plant' },

  // Season X — The End
  'seasonx-10-00': { event: 'Season Launch', stageNote: 'Zero Point becomes unstable, Rift Zones appear' },
  'seasonx-10-31': { event: 'Rift Zones', stageNote: 'Gotham City rift zone appears, map changes accelerate' },
  'seasonx-10-40': { event: 'The End', stageNote: 'The End event — black hole consumes the entire island' },

  // Chapter 2 Season 1
  'ch2s1-11-00': { event: 'Chapter 2 Launch', stageNote: 'Brand new map — Apollo island with 13 new POIs' },
  'ch2s1-11-30': { event: 'Winterfest', stageNote: 'Winterfest 2019 event with presents and challenges' },

  // Chapter 2 Season 2 — Doomsday
  'ch2s2-12-00': { event: 'Season Launch', stageNote: 'The Agency, Ghost vs Shadow spy theme' },
  'ch2s2-12-61': { event: 'The Device', stageNote: 'Doomsday event — storm pushed back, The Bridge revealed' },

  // Chapter 2 Season 4 — Marvel / Galactus
  'ch2s4-14-00': { event: 'Nexus War', stageNote: 'Marvel crossover — Thor, Iron Man, Wolverine arrive' },
  'ch2s4-14-60': { event: 'Galactus Event', stageNote: 'Galactus attacks the island, players use Battle Bus bombs to defeat him' },

  // Chapter 2 Season 8 — Cube Queen
  'ch2s8-18-40': { event: 'The End', stageNote: 'Cube Queen event — the island flips, Chapter 2 ends' },

  // Chapter 3 Season 2 — Collision
  'ch3s2-20-40': { event: 'Collision', stageNote: 'IO vs The Seven final battle event' },

  // Chapter 3 Season 4 — Fracture
  'ch3s4-22-40': { event: 'Fracture', stageNote: 'End of Chapter 3 event — island fragments reform' },
}

export function getVersionEvent(id: string): VersionEvent | undefined {
  return VERSION_EVENTS[id]
}

export function getAllEventNames(): string[] {
  const names = new Set<string>()
  for (const e of Object.values(VERSION_EVENTS)) {
    names.add(e.event)
  }
  return [...names]
}

export function hasEvent(id: string): boolean {
  return id in VERSION_EVENTS
}

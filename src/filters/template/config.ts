import { type BuildProfile, type BuildSpecificOptions } from "../shared"

// Build-wide preferences used by links, weapons, early items, and shields.
export const buildProfile = {
  // preferredColors: ["R", "G", "B"],
  // preferredArmour: ["armour", "evasion", "armour-evasion"],
  // preferredWeapons: { itemClasses: ["Two Hand Axes", "Two Hand Maces"], minAps: 1.3 },
  // weaponPhases: [
  //   { itemClasses: ["Two Hand Axes"], baseTypes: ["Driftwood Maul"], untilAreaLevel: 28 },
  //   { itemClasses: ["One Hand Swords"] }, // starts at area level 29
  // ],
  // shieldProgression: "early",
} satisfies BuildProfile

export const buildSpecificOptions = {
  links: {
    // twoLinkMaxAreaLevel: 9,
    // threeLinkMaxAreaLevel: 33,
    // fourLinkMaxAreaLevel: 61,
    // genericThreeLinksEnabled: false,
    // genericFourLinksEnabled: false,
    // threeLinkTtsCutoffLevel: 23,
    // fourLinkTtsCutoffLevel: 50,
  },
  highlightedEquipment: {
    // Add build-specific bases or item classes here.
    // highlights: [{ baseTypes: ["Rusted Hatchet"] }],
  },
  gemCallouts: {
    // Each gem listed here gets its own TTS callout speaking its name.
    // gems: ["Empower Support", "Enlighten Support"],
  },
  jewellery: {
    // amulets: ["Amber", "Jade", "Lapis"],
    // amuletMaxAreaLevel: 24,
    // basicRingMaxAreaLevel: 16,
    // elementalRingMaxAreaLevel: 24,
    // beltMaxAreaLevel: 24,
  },
  early: {},
  flasks: {
    // utilityFlasks: ["Jade", "Quartz"],
    // lifeMaxAreaLevel: 40,
    // manaMaxAreaLevel: 40,
  },
  tinctures: {
    // baseTypes: ["Prismatic Tincture"],
  },
  rareItems: {
    // maxAreaLevel: 70, // hard cutoff; rare items are uncapped when this is unset
  },
  magicItems: {
    // bigMaxAreaLevel: 9,
    // smallMaxAreaLevel: 24,
  },
  normalItems: {
    // maxAreaLevel: 4,
  },
} satisfies BuildSpecificOptions

import { type BuildProfile, type BuildSpecificOptions } from "../shared"

// Build-wide preferences used by links, weapons, early items, and shields.
export const buildProfile = {
  // preferredColors: ["R", "G", "B"],
  // preferredArmour: ["armour", "evasion", "armour-evasion"],
  // preferredWeapons: { itemClasses: ["Two Hand Axes", "Two Hand Maces"], minAps: 1.3 },
  // earlyWeapons: {
  //   itemClasses: ["Two Hand Axes", "Two Hand Maces"],
  //   baseTypes: ["Stone Axe", "Driftwood Maul"],
  //   minAps: 1.3,
  // },
  // shieldProgression: "early",
} satisfies BuildProfile

export const buildSpecificOptions = {
  links: {
    // twoLinkMaxAreaLevel: 9,
    // threeLinkMaxAreaLevel: 33,
    // fourLinkMaxAreaLevel: 53,
    // genericThreeLinksEnabled: false,
    // genericFourLinksEnabled: false,
    // twoLinkSoundId: 2,
    // threeLinkSoundId: 3,
  },
  highlightedEquipment: {
    // Add build-specific bases or item classes here.
    // highlights: [{ baseTypes: ["Rusted Hatchet"] }],
  },
  jewellery: {
    // amulets: ["Amber", "Jade", "Lapis"],
    // amuletMaxAreaLevel: 24,
    // basicRingMaxAreaLevel: 16,
    // elementalRingMaxAreaLevel: 24,
    // beltMaxAreaLevel: 24,
  },
  early: {},
  tinctures: {
    // baseTypes: ["Prismatic Tincture"],
  },
  rareItems: {
    // maxAreaLevel: 70, // hard cutoff; rare items are uncapped when this is unset
  },
  magicItems: {
    // maxAreaLevel: 9,
  },
  normalItems: {
    // maxAreaLevel: 4,
  },
} satisfies BuildSpecificOptions

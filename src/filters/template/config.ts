import { type BuildProfile, type BuildSpecificOptions } from "../shared"

export const buildProfile = {
  preferredArmourTypes: [] as const,
  preferredWeaponItemClasses: [] as const,
  shieldProgression: "early",
} as const satisfies BuildProfile

export const buildSpecificOptions: BuildSpecificOptions = {
  links: {
    twoLinkPatterns: [],
    threeLinkPatterns: [],
    genericThreeLinksEnabled: true,
    fourLinkPatterns: [],
    genericFourLinksEnabled: true,
  },
  jewellery: {
    amulets: [],
  },
  rareItems: {},
  magicItems: {},
  normalItems: {},
  tinctures: {
    baseTypes: [],
  },
  highlightedEquipment: {
    highlights: [],
  },
  early: {
    weaponHighlights: [],
    showRustic: true,
    includeMomentumColors: true,
  },
  earlySockets: {},
} as const

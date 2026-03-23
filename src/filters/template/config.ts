import { type BuildProfile, type BuildSpecificOptions } from "../shared"

export const buildProfile = {
  preferredArmourTypes: [],
  preferredWeaponItemClasses: [],
  earlyWeapons: {
    itemClasses: [],
    baseTypes: [],
    // minAps: 1.3,
  },
  shieldProgression: "early",
} satisfies BuildProfile

export const buildSpecificOptions: BuildSpecificOptions = {
  links: {
    twoLinkPatterns: [],
    threeLinkPatterns: [],
    goodThreeLinksEnabled: true,
    genericThreeLinksEnabled: false,
    fourLinkPatterns: [],
    goodFourLinksEnabled: true,
    genericFourLinksEnabled: false,
  },
  highlightedEquipment: {
    highlights: [],
  },
  jewellery: {
    amulets: [],
  },
  early: {
    weaponHighlights: [],
    showRustic: true,
    includeMomentumColors: true,
  },
  earlySockets: {},
  tinctures: {
    baseTypes: [],
  },
  rareItems: {},
  magicItems: {},
  normalItems: {},
}

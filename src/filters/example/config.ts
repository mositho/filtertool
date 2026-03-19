import { type BuildProfile, type BuildSpecificOptions } from "../shared"

/* Set your preferred armour types and shield progression here.
`preferredArmourTypes` is also used as the default source for generic 4-link rules,
so for most builds you do not need to repeat those in `links.genericFourLinks`.
Only set `links.genericFourLinks` if you want to override that default.

`shieldProgression` controls how long shields get extra highlighting:
- `"none"`: never
- `"early"`: early only, default max area level 12
- `"full"`: all leveling long

You can also use `{ mode: "early", maxAreaLevel: 10 }` if you want to override the default early cutoff. */
export const buildProfile = {
  preferredArmourTypes: ["armour", "evasion"] as const,
  shieldProgression: "early",
} as const satisfies BuildProfile

export const buildSpecificOptions = {
  links: {
    twoLinkPatterns: [
      // Early 2-links you want to see.
      "RG",
      "GG",
    ],
    threeLinkPatterns: [
      // 3-links for your build.
      "RRG",
      "RGG",
      "RGB",
    ],
    fourLinkPatterns: [
      // 4-links for your build.
      "RRRG",
      "RRGG",
      "RGGG",
    ],
    // Optional override if you want different generic 4-links than `preferredArmourTypes`.
    // genericFourLinks: ["armour", "armour-evasion", "evasion"],
  },
  socketBases: {
    desiredThreeSocketGroups: [
      // Desired 2-link color groups on early 3-socket armour bases.
      "RG",
      "GG",
    ],
  },
  rareItems: {
    weaponItemClasses: [
      // Optional rare weapon classes to specially highlight.
      // "Two Hand Axes",
      // "Two Hand Maces",
    ],
  },
  tinctures: {
    baseTypes: [
      // Optional tinctures for your build.
      "Prismatic Tincture",
    ],
  },
  highlightedEquipment: {
    highlights: [
      // Specific base types you always want highlighted.
      { baseTypes: ["Rusted Hatchet", "Boarding Axe"] },
      // You can also highlight an entire item class.
      { itemClasses: ["One Hand Axes"] },
      // Optional rarity-specific highlight.
      {
        baseTypes: ["Stone Axe", "Jade Chopper"],
        rarityOperator: "==",
        rarity: "Rare",
      },
    ],
  },
  earlyActs: {
    weaponHighlights: [
      // Strong early weapon bases.
      { baseTypes: ["Stone Axe", "Driftwood Maul", "Corroded Blade"] },
      // You can also highlight a whole weapon class.
      { itemClasses: ["Two Hand Maces"] },
    ],
    showRustic: true,
    includeMomentumColors: true,
  },
  earlySocketFallbacks: {
    weaponItemClasses: [
      // Weapon classes to include in very early fallback socket rules.
      "Two Hand Axes",
      "Two Hand Maces",
    ],
  },
} as const satisfies BuildSpecificOptions

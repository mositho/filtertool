import { type BuildProfile, type BuildSpecificOptions } from "../shared"

/* Set your preferred armour types and shield progression here.
`preferredArmourTypes` is always literal.
For example, `["armour", "evasion"]` covers only `"armour"` and `"evasion"`,
and `["armour-evasion"]` covers only `"armour-evasion"`.

`preferredArmourTypes` is also used as the default source for generic 4-link rules,
so for most builds you do not need to repeat those in `links.genericFourLinks`.
Only set `links.genericFourLinks` if you want to override that default.

`preferredWeaponItemClasses` is reused by the rare, magic and normal item sections.
Only set `rareItems.weaponItemClasses`, `magicItems.weaponItemClasses`, or
`normalItems.weaponItemClasses` if you want to override that shared default.

`earlySockets.weaponItemClasses` also defaults to `preferredWeaponItemClasses`,
so you only need to set it if the early socket section should use a different list.

`shieldProgression` controls shield handling for:
- `RGG` shield 3-link rule
- early shield link/base highlights
- preferred rare shield highlighting
- `"none"`: never
- `"early"`: early only, default max area level 12
- `"full"`: all leveling long
You can also use `{ mode: "early", maxAreaLevel: 10 }` if you want to override the default early cutoff. */

export const buildProfile = {
  preferredArmourTypes: ["armour", "evasion", "armour-evasion"] as const,
  preferredWeaponItemClasses: ["Two Hand Axes", "Two Hand Maces"] as const,
  shieldProgression: "early",
} as const satisfies BuildProfile

export const buildSpecificOptions = {
  links: {
    // Useful override if your build wants 2-links longer or shorter than the shared default.
    // twoLinkMaxAreaLevel: 9,
    twoLinkPatterns: [
      // Early 2-links you want to see on armour pieces.
      "RG",
      "GG",
      // You can also set a custom level cap per pattern.
      // { pattern: "RB", itemClasses: ["Boots", "Gloves"], maxAreaLevel: 16 },
    ],
    threeLinkPatterns: [
      // 3-links for your build.
      "RRG",
      "RGG",
      "RGB",
      // Example with a custom item-class scope or cap.
      // { pattern: "GGB", itemClasses: ["Body Armours", "Gloves"], maxAreaLevel: 28 },
    ],
    // Set to false if you only want to see the explicit 3-link patterns above.
    // genericThreeLinks: false,
    fourLinkPatterns: [
      // 4-links for your build.
      "RRRG",
      "RRGG",
      "RGGG",
      // Example with a custom level cap.
      // { pattern: "RRRB", maxAreaLevel: 45 },
    ],
    // Set to false if you only want to see the explicit 4-link patterns above.
    // genericFourLinksEnabled: false,
    // Optional override if you want different generic 4-links than `preferredArmourTypes`.
    // genericFourLinks: ["armour", "armour-evasion", "evasion"],
  },
  socketBases: {
    // Early 3-socket armour bases that already contain a good 2-link for your build.
    desiredThreeSocketGroups: ["RG", "GG"],
  },
  rareItems: {
    // Optional override if your rare-item section should use different weapon classes.
    // weaponItemClasses: ["Two Hand Axes", "Two Hand Maces"],
  },
  magicItems: {
    // Optional override if your magic-item section should use different weapon classes.
    // weaponItemClasses: ["Two Hand Axes", "Two Hand Maces"],
    // weaponBaseTypes: ["Stone Axe", "Driftwood Maul"],
  },
  normalItems: {
    // Optional override if your normal-item section should use different weapon classes.
    // weaponItemClasses: ["Two Hand Axes", "Two Hand Maces"],
    // weaponBaseTypes: ["Stone Axe", "Driftwood Maul"],
  },
  tinctures: {
    baseTypes: [
      // Optional tinctures for your build.
      "Prismatic Tincture",
    ],
  },
  highlightedEquipment: {
    highlights: [
      // Specific bases you always want to keep visible.
      { baseTypes: ["Rusted Hatchet", "Boarding Axe"] },
      // You can also highlight an entire item class.
      { itemClasses: ["One Hand Axes"] },
      // `rarities` is handy when you want the same bases highlighted for multiple rarities.
      {
        baseTypes: ["Stone Axe", "Jade Chopper"],
        rarities: ["Normal", "Rare"],
      },
      // You can also attach a custom sound or builtin sound id.
      // { baseTypes: ["Corroded Blade"], soundFileName: "pop.mp3", maxAreaLevel: 16 },
      // { itemClasses: ["Two Hand Maces"], soundId: 1, maxAreaLevel: 16 },
    ],
  },
  early: {
    weaponHighlights: [
      // Strong early weapon bases.
      { baseTypes: ["Stone Axe", "Driftwood Maul", "Corroded Blade"] },
      // You can also highlight a whole weapon class.
      { itemClasses: ["Two Hand Maces"] },
      // And optionally give individual entries their own level cap.
      // { baseTypes: ["Crude Bow"], maxAreaLevel: 10 },
    ],
    // Disable this for caster builds that don't care about rustic bases
    showRustic: true,
    // Disable if you're a ruthless enjoyer
    includeMomentumColors: true,
  },
  earlySockets: {
    // These classes/bases only feed the early 2-socket / 3-socket socket section.
    // weaponItemClasses defaults to `preferredWeaponItemClasses`.
    // weaponItemClasses: ["Two Hand Axes", "Two Hand Maces"],
    // Optional specific bases for the same early socket rules.
    // weaponBaseTypes: ["Stone Axe", "Driftwood Maul"],
  },
} as const satisfies BuildSpecificOptions

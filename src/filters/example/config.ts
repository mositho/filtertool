import { type BuildProfile, type BuildSpecificOptions } from "../shared"

/* Set your preferred armour types and shield progression here.
`preferredArmourTypes` is always literal. For example, `["armour", "evasion"]`
only covers `armour` and `evasion`, while `["armour-evasion"]` only covers
`armour-evasion`.

`preferredArmourTypes` also feeds `links.genericFourLinks` by default, so you
only need to set `links.genericFourLinks` if you want a different generic 4-link mix.

`preferredWeaponItemClasses` is reused by the rare, normal, and early socket sections.
Only set `rareItems.weaponItemClasses`, `normalItems.weaponItemClasses`, or
`earlySockets.weaponItemClasses` if one of those sections should use a different list.

`shieldProgression` controls:
- the shield `RGG` 3-link rule
- early shield link/base highlights
- early socket shield handling
- preferred rare shield highlighting
- `none`: never
- `early`: early only, max area level 12 (default value)
- `full`: all leveling long
You can also use `{ mode: "early", maxAreaLevel: 10 }` to override the default early cutoff. */

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
      // Any RGB order works here.
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
    // Shared cap for 3-links that you can override
    // threeLinkMaxAreaLevel: 33,
    // Set to false if you only want to see the explicit 3-link patterns above.
    genericThreeLinks: true,
    fourLinkPatterns: [
      // 4-links for your build.
      "RRRG",
      "RRGG",
      "RGGG",
      // Example with a custom level cap.
      // { pattern: "RRRB", maxAreaLevel: 45 },
    ],
    // Shared cap for 4-links that you can override
    // fourLinkMaxAreaLevel: 53,
    // Set to false if you only want to see the explicit 4-link patterns above.
    genericFourLinksEnabled: true,
    // Optional override if you want different generic 4-links than `preferredArmourTypes`.
    // genericFourLinks: ["armour", "armour-evasion", "evasion"],
  },
  jewellery: {
    // Select which amulets are visible. Leave unset to show all three.
    amulets: ["Amber", "Lapis"],
    // Optional override for the low-level iron/coral ring cutoff.
    // basicRingMaxAreaLevel: 16,
    // Optional override for the sapphire/ruby/topaz/two-stone ring cutoff.
    // elementalRingMaxAreaLevel: 24,
    // Optional override for leather/heavy belt cutoff.
    // beltMaxAreaLevel: 24,
    // Optional override for leveling amulet cutoff.
    // amuletMaxAreaLevel: 24,
  },
  rareItems: {
    // Optional override for how long the rare-item section stays visible.
    // maxAreaLevel: 45,
    // Optional override if your rare-item section should use different weapon classes.
    // weaponItemClasses: ["Two Hand Axes", "Two Hand Maces"],
  },
  magicItems: {
    // Optional override for how long the magic-item section stays visible.
    // maxAreaLevel: 9,
  },
  normalItems: {
    // Optional override for how long the normal-item section stays visible.
    // maxAreaLevel: 4,
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

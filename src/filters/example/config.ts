import { type BuildProfile, type BuildSpecificOptions } from "../shared"

/* Set your preferred armour types and shield progression here.
`preferredArmourTypes` is always literal. For example, `["armour", "evasion"]`
only covers `armour` and `evasion`, while `["armour-evasion"]` only covers
`armour-evasion`.

`preferredArmourTypes` also feeds the "good" 4-link section by default, so you
only need to set `links.goodFourLinks` if you want a different preferred 4-link mix.

`preferredWeaponItemClasses` creates a dedicated preferred-weapons section for
your leveling weapons. `preferredWeaponMinAps` can narrow that list further.

`earlyWeapons` is a separate shared query for the early weapon highlight, early socket,
and momentum-color sections, including explicit base types. If `earlyWeapons` is omitted
or left empty, those sections fall back to the preferred weapon query.
Only set `early.momentumColors` if momentum colors should use a different weapon query.

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
  preferredArmourTypes: ["armour", "evasion", "armour-evasion"],
  preferredWeaponItemClasses: ["Two Hand Axes", "Two Hand Maces"],
  // preferredWeaponMinAps: 1.3,
  // Shared early weapon query for early highlights, early sockets, and momentum colors.
  // earlyWeapons: {
  //   itemClasses: ["Two Hand Axes", "Two Hand Maces"],
  //   baseTypes: ["Stone Axe", "Driftwood Maul"],
  //   minAps: 1.3,
  // },
  shieldProgression: "early",
} satisfies BuildProfile

export const buildSpecificOptions: BuildSpecificOptions = {
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
    // Set to false if you do not want the derived "good 3-link" matches from your 2-link patterns.
    // goodThreeLinksEnabled: true,
    // Set to true if you want to see any 3-links.
    genericThreeLinksEnabled: false,
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
    // Set to false if you do not want the preferred/type-based "good" 4-links.
    goodFourLinksEnabled: true,
    // Set to true if you want to see any remaining 4-links beyond the selected and preferred ones.
    genericFourLinksEnabled: false,
    // Optional override if you want different preferred/type-based 4-links than `preferredArmourTypes`.
    // goodFourLinks: ["armour", "armour-evasion", "evasion"],
  },
  highlightedEquipment: {
    highlights: [
      // Specific bases you always want to keep visible as manual highlight overrides.
      { baseTypes: ["Rusted Hatchet", "Boarding Axe"] },
      // You can also highlight an entire item class.
      { itemClasses: ["One Hand Axes"] },
      // `rarities` is handy when you want the same bases highlighted for multiple rarities.
      {
        baseTypes: ["Stone Axe", "Jade Chopper"],
        rarities: ["Normal", "Rare"],
      },
      // Weapon item-class highlights get area cutoffs by default.
      // Exact base-type highlights do not, unless you set `weaponCutoffEnabled: true`.
      // `weaponCutoffOverlap` controls how many area levels a base overlaps with the next drop-level step.
      // It defaults to 5.
      // Set `weaponCutoffEnabled: false` if you want a weapon item class to stay highlighted indefinitely.
      // { itemClasses: ["Two Hand Axes"], weaponCutoffEnabled: false },
      // { baseTypes: ["Boarding Axe"], weaponCutoffEnabled: true, weaponCutoffOverlap: 8 },
      // You can also attach a custom sound or builtin sound id.
      // { baseTypes: ["Corroded Blade"], soundFileName: "pop.mp3", maxAreaLevel: 16 },
      // { itemClasses: ["Two Hand Maces"], soundId: 1, maxAreaLevel: 16 },
    ],
  },
  jewellery: {
    // Select which amulets are visible. Doesn't affect rare amulets
    amulets: ["Amber", "Lapis"],
    // Optional override for leveling amulet cutoff.
    // amuletMaxAreaLevel: 24,
    // Optional override for the low-level iron/coral ring cutoff.
    // basicRingMaxAreaLevel: 16,
    // Optional override for the sapphire/ruby/topaz/two-stone ring cutoff.
    // elementalRingMaxAreaLevel: 24,
    // Optional override for leather/heavy belt cutoff.
    // beltMaxAreaLevel: 24,
  },
  early: {
    // Disable this for caster builds that don't care about rustic bases
    showRustic: true,
    // Disable if you do not want the shared momentum-color handling.
    includeMomentumColors: true,
    // Optional override if your momentum colors should use a different target set.
    // momentumColors: { itemClasses: ["Two Hand Axes"], minAps: 1.3 },
  },
  earlySockets: {
    // Enable the shared early 2-socket / 3-socket socket section.
    // This always uses `buildProfile.earlyWeapons`, or the preferred weapon query if that is empty.
  },
  tinctures: {
    baseTypes: [
      // Optional tinctures for your build.
      "Prismatic Tincture",
    ],
  },
  rareItems: {
    // Optional override for how long the rare-item section stays visible.
    // maxAreaLevel: 45,
  },
  magicItems: {
    // Optional override for how long the magic-item section stays visible.
    // maxAreaLevel: 9,
  },
  normalItems: {
    // Optional override for how long the normal-item section stays visible.
    // maxAreaLevel: 4,
  },
}

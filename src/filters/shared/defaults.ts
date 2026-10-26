import { loadJsonOverride, loadOptionalOverride, mergeDeep } from "./user-overrides"

const GLOBAL_EARLY_MAX_AREA_LEVEL = 12

export const baseFilterDefaults = {
  shieldProgression: "early",
  preferredColors: ["R", "G", "B"],
  preferredArmour: [],
  links: {
    genericThreeLinkMaxAreaLevel: undefined as number | undefined,
    rules: {} as Record<string, import("./sections/options").EquipmentRuleConfig>,
    twoLinkMaxAreaLevel: 9,
    threeLinkTtsCutoffLevel: 23,
    threeLinkMaxAreaLevel: 33,
    fourLinkTtsCutoffLevel: 50,
    fourLinkMaxAreaLevel: 61,
    genericThreeLinksEnabled: false,
    genericFourLinksEnabled: false,
  },
  // These do not affect the rare jewellery rules
  jewellery: {
    basicRingMaxAreaLevel: 16,
    elementalRingMaxAreaLevel: 33,
    beltMaxAreaLevel: 24,
    amuletMaxAreaLevel: 24,
    amulets: ["Amber", "Jade", "Lapis", "Turquoise", "Citrine", "Agate", "Onyx"],
  },
  early: {
    shieldMaxAreaLevel: undefined as number | undefined,
    rules: {} as Record<string, import("./sections/options").EquipmentRuleConfig>,
    earlyMaxAreaLevel: GLOBAL_EARLY_MAX_AREA_LEVEL,
    twoSocketMaxAreaLevel: 7,
    threeSocketMaxAreaLevel: undefined as number | undefined,
    earlyBootsMaxAreaLevel: 24,
  },
  rareItems: {
    rules: {} as Record<string, import("./sections/options").EquipmentRuleConfig>,
    // Rare items are uncapped by default; set this to a level to hide them past it.
    maxAreaLevel: undefined as number | undefined,
  },
  magicItems: {
    rules: {} as Record<string, import("./sections/options").EquipmentRuleConfig>,
    bigMaxAreaLevel: 9,
    smallMaxAreaLevel: 24,
  },
  normalItems: {
    rules: {} as Record<string, import("./sections/options").EquipmentRuleConfig>,
    maxAreaLevel: 4,
  },
  tinctures: {
    baseTypes: [],
  },
  flasks: {
    utilityFlasks: ["Jade", "Quartz", "Quicksilver", "Silver", "Granite"],
  },
  misc: {
    whetstoneRecipe: true,
    showRusticSash: true,
  },
} as const

export const filterDefaults = mergeDeep(baseFilterDefaults, loadUserDefaults())

function loadUserDefaults() {
  return mergeDeep(
    loadOptionalOverride<typeof baseFilterDefaults>("./user-defaults", "userFilterDefaults"),
    loadJsonOverride<typeof baseFilterDefaults>("user-defaults.json"),
  )
}

/** Re-reads user defaults and updates `filterDefaults` in place so a running server reflects edits. */
export function refreshFilterDefaults(): void {
  const fresh = mergeDeep(baseFilterDefaults, loadUserDefaults())
  for (const key of Object.keys(filterDefaults)) {
    delete (filterDefaults as Record<string, unknown>)[key]
  }
  Object.assign(filterDefaults, fresh)
}

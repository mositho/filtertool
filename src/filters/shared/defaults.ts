import { loadJsonOverride, loadOptionalOverride, mergeDeep } from "./user-overrides"

const GLOBAL_EARLY_MAX_AREA_LEVEL = 12
const GLOBAL_PART_ONE_MAX_AREA_LEVEL = 45

export const baseFilterDefaults = {
  shieldProgression: "early",
  preferredColors: ["R", "G", "B"],
  preferredArmour: [],
  links: {
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
    earlyMaxAreaLevel: GLOBAL_EARLY_MAX_AREA_LEVEL,
    twoSocketMaxAreaLevel: 7,
    threeSocketMaxAreaLevel: GLOBAL_EARLY_MAX_AREA_LEVEL,
    earlyBootsMaxAreaLevel: 24,
  },
  rareItems: {
    partOneMaxAreaLevel: GLOBAL_PART_ONE_MAX_AREA_LEVEL,
    // Rare items are uncapped by default; set this to a level to hide them past it.
    maxAreaLevel: undefined as number | undefined,
  },
  magicItems: {
    maxAreaLevel: 9,
  },
  normalItems: {
    maxAreaLevel: 4,
  },
  tinctures: {
    baseTypes: ["Prismatic Tincture"],
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

const GLOBAL_EARLY_MAX_AREA_LEVEL = 12
const GLOBAL_PART_ONE_MAX_AREA_LEVEL = 45

export const filterDefaults = {
  campaign: {
    earlyMaxAreaLevel: GLOBAL_EARLY_MAX_AREA_LEVEL,
    partOneMaxAreaLevel: GLOBAL_PART_ONE_MAX_AREA_LEVEL,
  },
  shieldProgression: {
    mode: "early",
    earlyMaxAreaLevel: GLOBAL_EARLY_MAX_AREA_LEVEL,
  },
  links: {
    twoLinkMaxAreaLevel: 9,
    threeLinkMaxAreaLevel: 33,
    genericFourLinkMaxAreaLevel: 53,
  },
  socketBases: {
    maxAreaLevel: GLOBAL_PART_ONE_MAX_AREA_LEVEL,
    desiredThreeSocketGroups: ["RG"],
    desiredThreeSocketMaxAreaLevel: 20,
  },
  // These do not affect the rare jewellery rules
  jewellery: {
    basicRingMaxAreaLevel: 16,
    elementalRingMaxAreaLevel: 24,
    beltMaxAreaLevel: 24,
    amuletMaxAreaLevel: 24,
    amulets: ["Amber", "Jade", "Lapis"],
  },
  early: {
    earlyMaxAreaLevel: GLOBAL_EARLY_MAX_AREA_LEVEL,
    twoSocketMaxAreaLevel: 7,
    threeSocketMaxAreaLevel: GLOBAL_EARLY_MAX_AREA_LEVEL,
    momentumMaxAreaLevel: 20,
    earlyBootsMaxAreaLevel: 24,
    includeMomentumColors: true,
    showRustic: true,
  },
  rareItems: {
    maxAreaLevel: GLOBAL_PART_ONE_MAX_AREA_LEVEL,
  },
  magicItems: {
    maxAreaLevel: 9,
  },
  normalItems: {
    maxAreaLevel: 4,
  },
  chromaticItems: {
    smallMaxAreaLevel: 99,
    largeMaxAreaLevel: 20,
  },
  tinctures: {
    baseTypes: ["Prismatic Tincture"],
  },
} as const

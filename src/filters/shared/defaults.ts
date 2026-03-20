const GLOBAL_EARLY_MAX_AREA_LEVEL = 12
const GLOBAL_PART_ONE_MAX_AREA_LEVEL = 45

export const filterDefaults = {
  campaign: {
    earlyMaxAreaLevel: GLOBAL_EARLY_MAX_AREA_LEVEL,
    partOneMaxAreaLevel: GLOBAL_PART_ONE_MAX_AREA_LEVEL,
  },
  shieldProgression: {
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
  rareItems: {
    maxAreaLevel: GLOBAL_PART_ONE_MAX_AREA_LEVEL,
    earlyBootMaxAreaLevel: 24,
  },
  // These do not affect the rare jewellery rules
  jewellery: {
    basicRingMaxAreaLevel: 16,
    elementalRingMaxAreaLevel: 24,
    beltMaxAreaLevel: 24,
    amuletMaxAreaLevel: 24,
  },
  chromaticItems: {
    smallMaxAreaLevel: 99,
    largeMaxAreaLevel: 20,
  },
  tinctures: {
    baseTypes: ["Prismatic Tincture"],
  },
  early: {
    earlyMaxAreaLevel: GLOBAL_EARLY_MAX_AREA_LEVEL,
    twoSocketMaxAreaLevel: 7,
    threeSocketMaxAreaLevel: GLOBAL_EARLY_MAX_AREA_LEVEL,
    normalItemMaxAreaLevel: 4,
    magicItemMaxAreaLevel: 9,
    momentumMaxAreaLevel: 20,
    includeMomentumColors: true,
    showRustic: true,
  },
} as const

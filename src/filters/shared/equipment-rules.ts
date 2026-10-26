/** Keep generic equipment recognizable by rarity in both compiled rules and previews. */
export const EQUIPMENT_RARITY_TEXT = {
  magic: "#8888FF",
  rare: "#FFFF77",
} as const

/** Shared by the compiler and editor; dimensions are inventory cells, not sockets. */
export const EQUIPMENT_FOOTPRINTS = [
  { key: "1x1", width: 1, height: 1, size: 45 },
  { key: "1x2", width: 1, height: 2, size: 43 },
  { key: "2x1", width: 2, height: 1, size: 43 },
  { key: "1x3", width: 1, height: 3, size: 40 },
  { key: "1x4", width: 1, height: 4, size: 37 },
  { key: "2x2", width: 2, height: 2, size: 37 },
  { key: "2x3", width: 2, height: 3, size: 33 },
  { key: "2x4", width: 2, height: 4, size: 30 },
] as const

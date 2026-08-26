import { describe, it, expect } from "vitest"
import type { BuildProfile, BuildSpecificOptions, HighlightedBaseTypeConfig } from "../../src/filters/shared/sections/options"
import { schemaLeafPaths } from "../../src/config/form-schema"

type Complete<T> = T extends readonly (infer U)[]
  ? readonly Complete<U>[]
  : T extends (...args: any[]) => any
    ? T
    : T extends object
      ? { [K in keyof T]-?: Complete<T[K]> }
      : T

const fullHighlight: Complete<HighlightedBaseTypeConfig> = {
  name: "My Highlight",
  baseTypes: ["Rusted Hatchet"],
  itemClasses: ["One Hand Axes"],
  minAps: 1.3,
  linkedSockets: 0,
  minSockets: 0,
  weaponCutoffOverlap: 5,
  rarities: ["Normal"],
  minAreaLevel: 1,
  maxAreaLevel: 20,
  minItemLevel: 44,
  maxItemLevel: 60,
  perRarityCustomization: true,
  iconColor: "Cyan",
  iconShape: "Circle",
  iconSize: 2,
  soundId: 1,
  soundFileName: "custom.mp3",
  tts: "Top Level",
  normal: { iconColor: "Cyan", iconShape: "UpsideDownHouse", iconSize: 2, soundId: 1, soundFileName: "custom.mp3", tts: "Normal" },
  magic: { iconColor: "Blue", iconShape: "UpsideDownHouse", iconSize: 2, soundId: 2, soundFileName: "custom.mp3", tts: "Magic" },
  rare: { iconColor: "Yellow", iconShape: "UpsideDownHouse", iconSize: 2, soundId: 3, soundFileName: "custom.mp3", tts: "Rare" },
}

/**
 * A fully-populated config. Typed with `Complete<>` so that adding, removing or
 * renaming any field in `BuildProfile` / `BuildSpecificOptions` fails typecheck
 * until this object (and therefore the form schema) is updated to match.
 */
const canonicalConfig: Complete<BuildProfile> & Complete<BuildSpecificOptions> = {
  preferredColors: ["R", "G"],
  preferredArmour: ["armour"],
  preferredWeapons: fullHighlight,
  earlyWeapons: fullHighlight,
  shieldProgression: "early",
  links: {
    twoLinkMaxAreaLevel: 9,
    threeLinkMaxAreaLevel: 33,
    fourLinkMaxAreaLevel: 61,
    genericThreeLinksEnabled: true,
    genericFourLinksEnabled: true,
    threeLinkTtsCutoffLevel: 23,
    fourLinkTtsCutoffLevel: 50,
  },
  jewellery: {
    amulets: ["Amber"],
    amuletMaxAreaLevel: 24,
    basicRingMaxAreaLevel: 16,
    elementalRingMaxAreaLevel: 33,
    beltMaxAreaLevel: 24,
  },
  rareItems: { maxAreaLevel: 45 },
  magicItems: { maxAreaLevel: 9 },
  normalItems: { maxAreaLevel: 4 },
  tinctures: { baseTypes: ["Prismatic Tincture"] },
  highlightedEquipment: {
    highlights: [fullHighlight],
  },
  misc: { whetstoneRecipe: true, showRusticSash: true },
  early: {
    earlyMaxAreaLevel: 12,
    twoSocketMaxAreaLevel: 7,
    threeSocketMaxAreaLevel: 12,
    earlyBootsMaxAreaLevel: 24,
  },
}

function collectLeafPaths(obj: unknown, prefix: string, out: string[]): string[] {
  if (!obj || typeof obj !== "object") return out
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        collectLeafPaths(value[0], path, out)
      } else {
        out.push(path)
      }
    } else if (value && typeof value === "object") {
      collectLeafPaths(value, path, out)
    } else {
      out.push(path)
    }
  }
  return out
}

describe("form schema drift", () => {
  it("stays in sync with the TypeScript config types", () => {
    const schemaPaths = schemaLeafPaths()
    const configPaths = collectLeafPaths(canonicalConfig, "", []).sort()

    const missingFromSchema = configPaths.filter((path) => !schemaPaths.includes(path))
    const unknownInSchema = schemaPaths.filter((path) => !configPaths.includes(path))

    expect(missingFromSchema).toEqual([])
    expect(unknownInSchema).toEqual([])
  })
})

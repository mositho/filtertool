import { describe, it, expect } from "vitest"
import type {
  BuildProfile,
  BuildSpecificOptions,
  EquipmentRuleConfig,
  HighlightedBaseTypeConfig,
} from "../../src/filters/shared/sections/options"
import { BUILD_SPECIFIC_SCHEMA, DEFAULTS_SCHEMA, schemaLeafPaths } from "../../src/config/form-schema"
import { TEST_BASE_TYPE } from "../fixtures/base-types"

type Complete<T> = T extends readonly (infer U)[]
  ? readonly Complete<U>[]
  : T extends (...args: any[]) => any
    ? T
    : T extends object
      ? { [K in keyof T]-?: Complete<T[K]> }
      : T

const fullHighlight: Complete<HighlightedBaseTypeConfig> = {
  name: "My Highlight",
  baseTypes: [TEST_BASE_TYPE],
  itemClasses: ["One Hand Axes"],
  minAps: 1.3,
  linkedSockets: 0,
  minSockets: 0,
  weaponCutoffOverlap: 10,
  rarities: ["Normal"],
  minAreaLevel: 1,
  maxAreaLevel: 20,
  minItemLevel: 44,
  maxItemLevel: 60,
  width: { operator: "==", value: 2 },
  height: { operator: ">=", value: 3 },
  perRarityCustomization: true,
  iconColor: "Cyan",
  iconShape: "Circle",
  iconSize: 2,
  soundId: 1,
  soundFileName: "custom.mp3",
  tts: "Top Level",
  style: { preset: "currencyA", text: "#111111", background: "#222222", backgroundOpacity: 0.5, border: "#333333", size: 40 },
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
  weaponPhases: [{ ...fullHighlight, maxAreaLevel: 28 }],
  shieldProgression: "early",
  links: {
    genericThreeLinkMaxAreaLevel: 12,
    rules: {},
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
  flasks: { utilityFlasks: ["Jade"] },
  rareItems: { maxAreaLevel: 45, rules: {} },
  magicItems: { bigMaxAreaLevel: 9, smallMaxAreaLevel: 24, rules: {} },
  normalItems: { maxAreaLevel: 4, rules: {} },
  tinctures: { baseTypes: ["Prismatic Tincture"] },
  highlightedEquipment: {
    highlights: [fullHighlight],
  },
  gemCallouts: {
    gems: ["Fireball"],
    styleOnly: [],
  },
  misc: { whetstoneRecipe: true, showRusticSash: true },
  early: {
    shieldMaxAreaLevel: 12,
    rules: {},
    earlyMaxAreaLevel: 12,
    twoSocketMaxAreaLevel: 7,
    threeSocketMaxAreaLevel: 16,
    earlyBootsMaxAreaLevel: 24,
  },
}

function collectLeafPaths(obj: unknown, prefix: string, out: string[]): string[] {
  if (!obj || typeof obj !== "object") return out
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (key === "rules") {
      out.push(path)
      continue
    }
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
  it("covers every built-in rule setting, including structured presentation controls", () => {
    const completeRule: Complete<EquipmentRuleConfig> = {
      enabled: true,
      maxAreaLevel: 30,
      soundCutoffLevel: 20,
      style: fullHighlight.style,
      icon: { enabled: true, iconColor: "Red", iconShape: "Star", iconSize: 1 },
      sound: { enabled: true, tts: "three_link", soundId: 3, soundFileName: "custom.mp3" },
    }
    const represented = new Set<string>()
    const walk = (section: {
      fields: { path: string; control: string }[]
      subsections?: (typeof BUILD_SPECIFIC_SCHEMA)[number]["subsections"]
    }) => {
      for (const field of section.fields) {
        const suffix = /\.rules\.[^.]+\.(.+)$/.exec(field.path)?.[1]
        if (!suffix) continue
        const children =
          field.control === "style"
            ? ["preset", "text", "background", "backgroundOpacity", "border", "size"]
            : field.control === "icon"
              ? ["enabled", "iconColor", "iconShape", "iconSize"]
              : field.control === "rule-sound"
                ? ["enabled", "tts", "soundId", "soundFileName"]
                : undefined
        if (children) for (const child of children) represented.add(`${suffix}.${child}`)
        else represented.add(suffix)
      }
      section.subsections?.forEach(walk)
    }
    BUILD_SPECIFIC_SCHEMA.forEach(walk)
    expect([...represented].sort()).toEqual(collectLeafPaths(completeRule, "", []).sort())
  })

  it("stays in sync with the TypeScript config types", () => {
    const schemaPaths = schemaLeafPaths()
    const configPaths = collectLeafPaths(canonicalConfig, "", []).sort()

    const missingFromSchema = configPaths.filter((path) => !schemaPaths.includes(path))
    const unknownInSchema = schemaPaths.filter((path) => !configPaths.includes(path))

    expect(missingFromSchema).toEqual([])
    expect(unknownInSchema).toEqual([])
  })

  it("offers the supported utility flask callouts in both filter and global defaults forms", () => {
    for (const schema of [BUILD_SPECIFIC_SCHEMA, DEFAULTS_SCHEMA]) {
      const equipment = schema.find((group) => group.key === "equipment")
      const flasks = equipment?.subsections?.find((section) => section.key === "flasks")
      const field = flasks?.fields.find((entry) => entry.path === "flasks.utilityFlasks")
      expect(field?.options).toEqual([
        "Quicksilver",
        "Bismuth",
        "Stibnite",
        "Amethyst",
        "Ruby",
        "Sapphire",
        "Topaz",
        "Silver",
        "Aquamarine",
        "Granite",
        "Jade",
        "Quartz",
        "Sulphur",
        "Basalt",
        "Diamond",
        "Gold",
        "Corundum",
        "Iron",
      ])
    }
  })

  it("does not offer per-filter controls as ineffective global defaults", () => {
    const paths = DEFAULTS_SCHEMA.flatMap((group) => [
      ...group.fields.map((field) => field.path),
      ...(group.subsections ?? []).flatMap((section) => [
        ...section.fields.map((field) => field.path),
        ...(section.subsections ?? []).flatMap((nested) => nested.fields.map((field) => field.path)),
      ]),
    ])
    expect(paths).not.toContain("weaponPhases")
    expect(paths).not.toContain("gemCallouts.gems")
    expect(paths).not.toContain("flasks.lifeMaxAreaLevel")
    expect(paths).not.toContain("flasks.manaMaxAreaLevel")
    expect(paths).not.toContain("rareItems.partOneMaxAreaLevel")
  })

  it("keeps the Rustic Sash toggle in Early while editing the build profile", () => {
    const early = BUILD_SPECIFIC_SCHEMA.find((group) => group.key === "early")
    const rusticSash = early?.subsections?.find((section) => section.key === "rusticSash")
    expect(rusticSash?.root).toBe("buildProfile")
    expect(rusticSash?.fields.map((field) => field.path)).toContain("misc.showRusticSash")
  })
})

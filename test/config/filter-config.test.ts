import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "fs"
import os from "os"
import path from "path"
import { MANIFEST_BY_ID } from "../../src/sounds/manifest"
import {
  deserializeFilterConfig,
  loadFilterConfig,
  readFilterConfig,
  serializeFilterConfig,
  writeFilterConfig,
  deserializeTts,
  serializeTts,
} from "../../src/filters/shared/config-loader"

let filterDir: string

beforeEach(() => {
  filterDir = fs.mkdtempSync(path.join(os.tmpdir(), "filtertool-config-"))
})

afterEach(() => {
  fs.rmSync(filterDir, { recursive: true, force: true })
})

describe("tts serialization", () => {
  it("serializes a manifest entry to its id string", () => {
    expect(serializeTts(MANIFEST_BY_ID.regal_orb)).toBe("regal_orb")
    expect(serializeTts("Rare Wand")).toBe("Rare Wand")
  })

  it("resolves a manifest id back to its entry and leaves ad-hoc text as a string", () => {
    expect(deserializeTts("regal_orb")).toEqual(MANIFEST_BY_ID.regal_orb)
    expect(deserializeTts("Rare Wand")).toBe("Rare Wand")
  })
})

describe("filter config serialization", () => {
  it("snapshots manifest entries to id strings", () => {
    const serialized = serializeFilterConfig({
      buildProfile: {},
      buildSpecificOptions: {
        highlightedEquipment: { highlights: [{ baseTypes: ["Rusted Hatchet"], rare: { tts: MANIFEST_BY_ID.regal_orb } }] },
      },
    })
    expect(serialized.buildSpecificOptions.highlightedEquipment?.highlights?.[0].rare?.tts).toBe("regal_orb")
  })

  it("preserves ad-hoc tts text", () => {
    const serialized = serializeFilterConfig({
      buildProfile: {},
      buildSpecificOptions: { highlightedEquipment: { highlights: [{ itemClasses: ["Wands"], rare: { tts: "Rare Wand" } }] } },
    })
    expect(serialized.buildSpecificOptions.highlightedEquipment?.highlights?.[0].rare?.tts).toBe("Rare Wand")
  })

  it("serializes a whole-highlight tts to a manifest id", () => {
    const serialized = serializeFilterConfig({
      buildProfile: {},
      buildSpecificOptions: { highlightedEquipment: { highlights: [{ itemClasses: ["Wands"], tts: MANIFEST_BY_ID.regal_orb }] } },
    })
    expect(serialized.buildSpecificOptions.highlightedEquipment?.highlights?.[0].tts).toBe("regal_orb")
  })

  it("round-trips a config back to the runtime shape", () => {
    const config = {
      buildProfile: { preferredColors: ["R", "G"] as const },
      buildSpecificOptions: {
        highlightedEquipment: { highlights: [{ baseTypes: ["Rusted Hatchet"], rare: { tts: MANIFEST_BY_ID.regal_orb } }] },
        links: { genericThreeLinksEnabled: false },
      },
    }
    const restored = deserializeFilterConfig(serializeFilterConfig(config))
    expect(restored.buildProfile).toEqual(config.buildProfile)
    expect(restored.buildSpecificOptions.highlightedEquipment?.highlights?.[0].rare?.tts).toEqual(MANIFEST_BY_ID.regal_orb)
  })
})

describe("filter config persistence", () => {
  it("serializes preferredWeapons tts to a manifest id", () => {
    const serialized = serializeFilterConfig({
      buildProfile: { preferredWeapons: { itemClasses: ["Wands"], rare: { tts: MANIFEST_BY_ID.regal_orb } } },
      buildSpecificOptions: {},
    })
    expect(serialized.buildProfile.preferredWeapons?.rare?.tts).toBe("regal_orb")
  })

  it("round-trips a config through config.json", () => {
    const config = {
      buildProfile: { preferredColors: ["R", "G"] as const },
      buildSpecificOptions: {
        links: { twoLinkMaxAreaLevel: 12 },
        highlightedEquipment: { highlights: [{ rare: { tts: "Rare Axe" } }] },
      },
    }
    writeFilterConfig(filterDir, config)
    expect(readFilterConfig(filterDir)).toEqual(config)
  })

  it("prefers config.json over the ts fallback", () => {
    writeFilterConfig(filterDir, { buildProfile: { preferredColors: ["B"] }, buildSpecificOptions: {} })
    const loaded = loadFilterConfig(filterDir, {
      buildProfile: { preferredColors: ["R", "G"] },
      buildSpecificOptions: { links: { twoLinkMaxAreaLevel: 99 } },
    })
    expect(loaded.buildProfile).toEqual({ preferredColors: ["B"] })
  })

  it("uses the ts fallback when no config.json exists", () => {
    const fallback = { buildProfile: { preferredColors: ["R"] as const }, buildSpecificOptions: { links: { twoLinkMaxAreaLevel: 9 } } }
    expect(loadFilterConfig(filterDir, fallback)).toEqual(fallback)
  })
})

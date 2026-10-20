import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "fs"
import os from "os"
import path from "path"
import { compileFilter } from "../../src/filters/shared/compile"
import { loadFilterConfig, writeFilterConfig } from "../../src/filters/shared/config-loader"
import { TEST_BASE_TYPE } from "../fixtures/base-types"

let filterDir: string

beforeEach(() => {
  filterDir = fs.mkdtempSync(path.join(os.tmpdir(), "filtertool-compile-"))
})

afterEach(() => {
  fs.rmSync(filterDir, { recursive: true, force: true })
})

describe("compileFilter", () => {
  it("compiles a default config into filter text", () => {
    const output = compileFilter({ buildProfile: {}, buildSpecificOptions: {} })
    expect(output).toContain("Show")
    expect(output).toMatch(/### /)
  })

  it("reflects build-specific options", () => {
    const withHighlight = compileFilter({
      buildProfile: {},
      buildSpecificOptions: { highlightedEquipment: { highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Rare"] }] } },
    })
    expect(withHighlight).toContain(`BaseType "${TEST_BASE_TYPE}"`)
    expect(withHighlight).toMatch(/Rarity == Rare/)
  })

  it("compiles a config.json-only filter (no config.ts required)", () => {
    writeFilterConfig(filterDir, {
      buildProfile: {},
      buildSpecificOptions: {
        highlightedEquipment: { highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Rare"] }] },
      },
    })
    const loaded = loadFilterConfig(filterDir)
    expect(loaded.buildSpecificOptions.highlightedEquipment?.highlights).toHaveLength(1)
    const output = compileFilter(loaded)
    expect(output).toContain(`BaseType "${TEST_BASE_TYPE}"`)
    expect(output).toMatch(/Rarity == Rare/)
  })
})

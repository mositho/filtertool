import { describe, it, expect } from "vitest"
import { pruneEmpty, stableStringify } from "../../frontend/src/path"

describe("pruneEmpty", () => {
  it("removes empty objects left behind by deletes", () => {
    const config = { buildProfile: {}, buildSpecificOptions: { magicItems: {} } }
    expect(pruneEmpty(config)).toEqual({})
  })

  it("removes empty arrays held as object values", () => {
    const config = { buildProfile: {}, buildSpecificOptions: { jewellery: { amulets: [] } } }
    expect(pruneEmpty(config)).toEqual({})
  })

  it("preserves array elements (highlight entries)", () => {
    const config = { buildSpecificOptions: { highlightedEquipment: { highlights: [{ name: "Foo" }] } } }
    expect(pruneEmpty(config)).toEqual(config)
  })

  it("makes empty-residue configs stringify equal", () => {
    const working = { buildProfile: {}, buildSpecificOptions: { links: {} } }
    const saved = { buildProfile: {}, buildSpecificOptions: {} }
    expect(stableStringify(pruneEmpty(working))).toBe(stableStringify(pruneEmpty(saved)))
  })
})

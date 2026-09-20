import { describe, it, expect } from "vitest"
import { SOUND_MANIFEST } from "../../src/sounds/manifest"

describe("sound manifest", () => {
  it("has no duplicate IDs across all categories", () => {
    const ids = SOUND_MANIFEST.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("has no duplicate filenames across all categories", () => {
    const filenames = SOUND_MANIFEST.map((e) => `${e.id}.mp3`)
    expect(new Set(filenames).size).toBe(filenames.length)
  })

  it("has entries", () => {
    expect(SOUND_MANIFEST.length).toBeGreaterThan(0)
  })

  it("every entry has a non-empty id and text", () => {
    for (const entry of SOUND_MANIFEST) {
      expect(entry.id).toBeTruthy()
      expect(entry.text).toBeTruthy()
    }
  })
})

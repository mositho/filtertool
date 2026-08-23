import { describe, it, expect, beforeEach } from "vitest"
import { DEFAULT_SOUND_PACK_FOLDER, generatedSoundTextToFileName, soundFileTTS, manifestSoundFile } from "../../src/sounds/paths"

beforeEach(() => {
  delete process.env.SOUNDS_FOLDER
})

describe("generatedSoundTextToFileName", () => {
  it("converts text to underscored filename", () => {
    expect(generatedSoundTextToFileName("Chaos Orb")).toBe("Chaos_Orb.mp3")
  })

  it("handles single words", () => {
    expect(generatedSoundTextToFileName("Life")).toBe("Life.mp3")
  })

  it("handles multiple spaces", () => {
    expect(generatedSoundTextToFileName("Three  Link  Body Armour")).toBe("Three__Link__Body_Armour.mp3")
  })

  it("keeps apostrophes in the filename", () => {
    expect(generatedSoundTextToFileName("Cat's Paw")).toBe("Cat's_Paw.mp3")
  })
})

describe("soundFileTTS", () => {
  it("returns path in the default sound pack folder", () => {
    const result = soundFileTTS("Chaos Orb")
    expect(result).toBe(`${DEFAULT_SOUND_PACK_FOLDER}/Chaos_Orb.mp3`)
  })

  it("respects SOUNDS_FOLDER override", () => {
    process.env.SOUNDS_FOLDER = "custom-sounds"
    const result = soundFileTTS("Exalted Orb")
    expect(result).toBe("custom-sounds/Exalted_Orb.mp3")
  })
})

describe("manifestSoundFile", () => {
  it("returns path based on entry id", () => {
    const result = manifestSoundFile({ id: "chaos_orb", text: "Chaos Orb" })
    expect(result).toBe(`${DEFAULT_SOUND_PACK_FOLDER}/chaos_orb.mp3`)
  })

  it("respects SOUNDS_FOLDER override", () => {
    process.env.SOUNDS_FOLDER = "custom-sounds"
    const result = manifestSoundFile({ id: "exalted_orb", text: "Exalted Orb" })
    expect(result).toBe("custom-sounds/exalted_orb.mp3")
  })
})

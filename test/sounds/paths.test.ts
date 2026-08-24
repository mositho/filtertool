import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "fs"
import os from "os"
import path from "path"
import { DEFAULT_SOUND_PACK_FOLDER, generatedSoundTextToFileName, soundFileTTS, manifestSoundFile } from "../../src/sounds/paths"
import { saveSettings } from "../../src/config/settings"

let settingsDir: string

beforeEach(() => {
  settingsDir = fs.mkdtempSync(path.join(os.tmpdir(), "filtertool-paths-"))
  process.env.FILTER_SETTINGS_DIR = settingsDir
})

afterEach(() => {
  delete process.env.FILTER_SETTINGS_DIR
  fs.rmSync(settingsDir, { recursive: true, force: true })
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
    expect(soundFileTTS("Chaos Orb")).toBe(`${DEFAULT_SOUND_PACK_FOLDER}/Chaos_Orb.mp3`)
  })

  it("respects the soundsFolder setting", () => {
    saveSettings(settingsDir, { soundsFolder: "custom-sounds", tts: { locale: "en-US", speed: 1.6 } })
    expect(soundFileTTS("Exalted Orb")).toBe("custom-sounds/Exalted_Orb.mp3")
  })
})

describe("manifestSoundFile", () => {
  it("returns path based on entry id", () => {
    expect(manifestSoundFile({ id: "chaos_orb", text: "Chaos", name: "Chaos Orb" })).toBe(`${DEFAULT_SOUND_PACK_FOLDER}/chaos_orb.mp3`)
  })

  it("respects the soundsFolder setting", () => {
    saveSettings(settingsDir, { soundsFolder: "custom-sounds", tts: { locale: "en-US", speed: 1.6 } })
    expect(manifestSoundFile({ id: "exalted_orb", text: "Exalted", name: "Exalted Orb" })).toBe("custom-sounds/exalted_orb.mp3")
  })
})

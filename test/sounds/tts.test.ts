import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "fs"
import os from "os"
import path from "path"
import { readTtsSettings, writeTtsSettings, DEFAULT_TTS_SETTINGS, ttsTextForFile } from "../../src/sounds/tts"
import { settingsPath } from "../../src/config/settings"

let settingsDir: string

beforeEach(() => {
  settingsDir = fs.mkdtempSync(path.join(os.tmpdir(), "filtertool-tts-"))
  process.env.FILTER_SETTINGS_DIR = settingsDir
})

afterEach(() => {
  delete process.env.FILTER_SETTINGS_DIR
  fs.rmSync(settingsDir, { recursive: true, force: true })
})

describe("TTS settings persistence", () => {
  it("returns defaults when no settings file exists", () => {
    expect(readTtsSettings()).toEqual(DEFAULT_TTS_SETTINGS)
  })

  it("persists and reads back settings", () => {
    const settings = { locale: "en-GB", speed: 2.0 }
    writeTtsSettings(settings)
    expect(readTtsSettings()).toEqual(settings)
  })

  it("merges partial settings with defaults", () => {
    writeTtsSettings({ locale: "en-AU", speed: 1.6 })
    expect(readTtsSettings().locale).toBe("en-AU")
  })

  it("falls back to defaults on malformed settings file", () => {
    fs.writeFileSync(settingsPath(settingsDir), "not-json")
    expect(readTtsSettings()).toEqual(DEFAULT_TTS_SETTINGS)
  })
})

describe("ttsTextForFile", () => {
  it("uses the manifest text for manifest sound ids", () => {
    expect(ttsTextForFile("turquoise_amulet.mp3")).toBe("Turquoise")
    expect(ttsTextForFile("sounds/onyx_amulet.mp3")).toBe("Onyx")
  })

  it("derives ad-hoc text from the filename", () => {
    expect(ttsTextForFile("Rare_Wand.mp3")).toBe("Rare Wand")
  })
})

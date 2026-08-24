import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "fs"
import os from "os"
import path from "path"
import {
  DEFAULT_TTS_SETTINGS,
  defaultSettings,
  ensureSettings,
  loadSettings,
  migrateFromLegacy,
  saveSettings,
  settingsPath,
  SETTINGS_FILE_NAME,
} from "../../src/config/settings"

let rootDir: string

beforeEach(() => {
  rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "filtertool-settings-"))
})

afterEach(() => {
  fs.rmSync(rootDir, { recursive: true, force: true })
})

describe("migrateFromLegacy", () => {
  it("seeds filter path and sounds folder from .env", () => {
    fs.writeFileSync(path.join(rootDir, ".env"), 'FILTER_PATH="/games/poe"\nSOUNDS_FOLDER="my-sounds"\n')
    const settings = migrateFromLegacy(rootDir)
    expect(settings.filterPath).toBe("/games/poe")
    expect(settings.soundsFolder).toBe("my-sounds")
  })

  it("seeds TTS settings from .tts-settings.json", () => {
    fs.writeFileSync(path.join(rootDir, ".tts-settings.json"), JSON.stringify({ locale: "de-DE", speed: 1.2 }))
    const settings = migrateFromLegacy(rootDir)
    expect(settings.tts).toEqual({ locale: "de-DE", speed: 1.2 })
  })

  it("returns defaults when no legacy files exist", () => {
    expect(migrateFromLegacy(rootDir)).toEqual({ filterPath: undefined, soundsFolder: undefined, tts: DEFAULT_TTS_SETTINGS })
  })
})

describe("ensureSettings", () => {
  it("creates settings.json seeded from legacy on first run", () => {
    fs.writeFileSync(path.join(rootDir, ".env"), 'FILTER_PATH="/games/poe"\n')
    const settings = ensureSettings(rootDir)
    expect(settings.filterPath).toBe("/games/poe")
    expect(fs.existsSync(path.join(rootDir, SETTINGS_FILE_NAME))).toBe(true)
  })

  it("does not overwrite an existing settings file", () => {
    saveSettings(rootDir, { filterPath: "/existing", tts: DEFAULT_TTS_SETTINGS })
    fs.writeFileSync(path.join(rootDir, ".env"), 'FILTER_PATH="/legacy"\n')
    const settings = ensureSettings(rootDir)
    expect(settings.filterPath).toBe("/existing")
  })
})

describe("loadSettings / saveSettings round-trip", () => {
  it("returns defaults when no settings file exists (without writing)", () => {
    const settings = loadSettings(rootDir)
    expect(settings).toEqual(defaultSettings())
    expect(fs.existsSync(settingsPath(rootDir))).toBe(false)
  })

  it("round-trips settings through JSON", () => {
    const settings = { filterPath: "/games/poe", soundsFolder: "custom", tts: { locale: "en-GB", speed: 2 } }
    saveSettings(rootDir, settings)
    expect(loadSettings(rootDir)).toEqual(settings)
  })

  it("merges missing fields with defaults", () => {
    fs.writeFileSync(settingsPath(rootDir), JSON.stringify({ filterPath: "/games/poe" }))
    expect(loadSettings(rootDir).tts).toEqual(DEFAULT_TTS_SETTINGS)
  })
})

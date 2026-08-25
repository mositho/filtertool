import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "fs"
import os from "os"
import path from "path"
import { readTtsSettings, writeTtsSettings, DEFAULT_TTS_SETTINGS, ttsTextForFile, staleManifestSoundIds } from "../../src/sounds/tts"
import { readGenerationState, writeGenerationState } from "../../src/sounds/generation-state"
import { MANIFEST_BY_ID } from "../../src/sounds/manifest"
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

describe("generation state", () => {
  it("round-trips the state file", () => {
    writeGenerationState({ "amethyst_ring.mp3": { text: "Amethyst", locale: "en-US", speed: 1.6 } })
    expect(readGenerationState()).toEqual({ "amethyst_ring.mp3": { text: "Amethyst", locale: "en-US", speed: 1.6 } })
  })

  it("returns an empty object when no state file exists", () => {
    expect(readGenerationState()).toEqual({})
  })
})

describe("staleManifestSoundIds", () => {
  it("flags all manifest sounds when no state exists", () => {
    const ids = staleManifestSoundIds({}, { locale: "en-US", speed: 1.6 })
    expect(ids).toContain("amethyst_ring")
    expect(ids.length).toBeGreaterThan(1)
  })

  it("flags a sound whose text changed", () => {
    const state = { "amethyst_ring.mp3": { text: "Amethyst Ring", locale: "en-US", speed: 1.6 } }
    expect(staleManifestSoundIds(state, { locale: "en-US", speed: 1.6 })).toContain("amethyst_ring")
  })

  it("flags a sound when the locale changed", () => {
    const entry = MANIFEST_BY_ID.amethyst_ring
    const state = { "amethyst_ring.mp3": { text: entry.text, locale: "en-US", speed: 1.6 } }
    expect(staleManifestSoundIds(state, { locale: "de-DE", speed: 1.6 })).toContain("amethyst_ring")
  })

  it("does not flag up-to-date sounds", () => {
    const entry = MANIFEST_BY_ID.amethyst_ring
    const state = { "amethyst_ring.mp3": { text: entry.text, locale: "en-US", speed: 1.6 } }
    expect(staleManifestSoundIds(state, { locale: "en-US", speed: 1.6 })).not.toContain("amethyst_ring")
  })
})

import fs from "fs"
import os from "os"
import path from "path"
import * as dotenv from "dotenv"

export type TtsSettings = {
  locale: string
  speed: number
}

export type AppSettings = {
  filterPath?: string
  soundsFolder?: string
  tts: TtsSettings
}

export const SETTINGS_FILE_NAME = "settings.json"
export const LEGACY_TTS_FILE_NAME = ".tts-settings.json"
export const LEGACY_ENV_FILE_NAME = ".env"

export const DEFAULT_TTS_SETTINGS: TtsSettings = {
  locale: "en-US",
  speed: 1.6,
}

/** Valid ffmpeg `atempo` range (a single atempo accepts 0.5–2.0). */
export const MIN_TTS_SPEED = 0.5
export const MAX_TTS_SPEED = 2.0

export const clampTtsSpeed = (speed: number): number => Math.min(MAX_TTS_SPEED, Math.max(MIN_TTS_SPEED, speed))

/** Google Translate TTS language codes (`lang` passed to the translate_tts endpoint). */
export const TTS_LOCALES = [
  "en-US",
  "en-GB",
  "en-AU",
  "en-CA",
  "en-IN",
  "en-IE",
  "en-ZA",
  "de-DE",
  "de-AT",
  "de-CH",
  "fr-FR",
  "fr-CA",
  "fr-CH",
  "it-IT",
  "es-ES",
  "es-MX",
  "es-US",
  "pt-BR",
  "pt-PT",
  "nl-NL",
  "nl-BE",
  "ru-RU",
  "pl-PL",
  "sv-SE",
  "da-DK",
  "nb-NO",
  "fi-FI",
  "is-IS",
  "cs-CZ",
  "sk-SK",
  "hu-HU",
  "ro-RO",
  "bg-BG",
  "hr-HR",
  "sl-SI",
  "sr-RS",
  "uk-UA",
  "el-GR",
  "tr-TR",
  "ar-SA",
  "he-IL",
  "hi-IN",
  "bn-IN",
  "ta-IN",
  "te-IN",
  "mr-IN",
  "gu-IN",
  "ur-PK",
  "id-ID",
  "ms-MY",
  "th-TH",
  "vi-VN",
  "tl-PH",
  "ja-JP",
  "ko-KR",
  "zh-CN",
  "zh-TW",
  "zh-HK",
  "ca-ES",
  "lt-LT",
  "lv-LV",
  "et-EE",
  "sw-KE",
  "af-ZA",
  "fa-IR",
  "az-AZ",
  "ka-GE",
  "hy-AM",
  "km-KH",
  "lo-LA",
  "my-MM",
  "si-LK",
  "am-ET",
  "ne-NP",
  "pa-IN",
  "ml-IN",
  "kn-IN",
] as const

export const DEFAULT_WIN_FILTER_PATH = path.join(os.homedir(), "Documents", "My Games", "Path of Exile")

export function repoRoot(): string {
  return process.env.FILTER_SETTINGS_DIR || path.resolve(__dirname, "..", "..")
}

export function settingsPath(rootDir: string = repoRoot()): string {
  return path.join(rootDir, SETTINGS_FILE_NAME)
}

export function defaultSettings(): AppSettings {
  return { filterPath: undefined, soundsFolder: undefined, tts: { ...DEFAULT_TTS_SETTINGS } }
}

function parseEnvFile(rootDir: string): Record<string, string> {
  const envPath = path.join(rootDir, LEGACY_ENV_FILE_NAME)
  if (!fs.existsSync(envPath)) return {}
  try {
    return dotenv.parse(fs.readFileSync(envPath, "utf-8"))
  } catch {
    return {}
  }
}

function readLegacyTtsSettings(rootDir: string): TtsSettings {
  const ttsPath = path.join(rootDir, LEGACY_TTS_FILE_NAME)
  if (!fs.existsSync(ttsPath)) return { ...DEFAULT_TTS_SETTINGS }
  try {
    return { ...DEFAULT_TTS_SETTINGS, ...JSON.parse(fs.readFileSync(ttsPath, "utf-8")) }
  } catch {
    return { ...DEFAULT_TTS_SETTINGS }
  }
}

/**
 * Reads the legacy `.env` (`FILTER_PATH`, `SOUNDS_FOLDER`) and `.tts-settings.json`
 * and returns the equivalent settings shape. Does not write anything.
 */
export function migrateFromLegacy(rootDir: string = repoRoot()): AppSettings {
  const env = parseEnvFile(rootDir)
  const tts = readLegacyTtsSettings(rootDir)
  const filterPath = env.FILTER_PATH || (process.platform === "win32" ? DEFAULT_WIN_FILTER_PATH : undefined)
  const soundsFolder = env.SOUNDS_FOLDER || undefined
  return { filterPath, soundsFolder, tts }
}

function readSettingsFile(rootDir: string): AppSettings | null {
  const filePath = settingsPath(rootDir)
  if (!fs.existsSync(filePath)) return null
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Partial<AppSettings>
    return {
      filterPath: typeof parsed.filterPath === "string" ? parsed.filterPath : undefined,
      soundsFolder: typeof parsed.soundsFolder === "string" ? parsed.soundsFolder : undefined,
      tts: { ...DEFAULT_TTS_SETTINGS, ...(parsed.tts ?? {}) },
    }
  } catch {
    return null
  }
}

/**
 * Reads settings from `settings.json`. Returns defaults when the file is missing
 * or malformed; never writes. This is the read-only path used at compile time so
 * that compiling a filter cannot produce filesystem side effects.
 */
export function loadSettings(rootDir: string = repoRoot()): AppSettings {
  return readSettingsFile(rootDir) ?? defaultSettings()
}

/**
 * Ensures `settings.json` exists, seeding it from the legacy `.env` and
 * `.tts-settings.json` on first run. Returns the resulting settings.
 */
export function ensureSettings(rootDir: string = repoRoot()): AppSettings {
  const existing = readSettingsFile(rootDir)
  if (existing) return existing
  const migrated = migrateFromLegacy(rootDir)
  saveSettings(rootDir, migrated)
  return migrated
}

export function saveSettings(rootDir: string = repoRoot(), settings: AppSettings): void {
  const filePath = settingsPath(rootDir)
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2) + "\n")
}

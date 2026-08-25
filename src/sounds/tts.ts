import * as fs from "fs"
import path from "path"
import { Readable } from "stream"
import ffmpegPath from "ffmpeg-static"
import axios from "axios"
import * as tts from "google-tts-api"
import { ensureSettings, clampTtsSpeed, loadSettings, repoRoot, saveSettings, type TtsSettings } from "../config/settings"
import { MANIFEST_BY_ID, SOUND_MANIFEST, type SoundManifestEntry, type SoundManifestId } from "./manifest"
import { SOUND_PACK_SOURCE_DIR } from "./paths"
import { readGenerationState, writeGenerationState, type GenerationState } from "./generation-state"

const ffmpeg = require("fluent-ffmpeg")
ffmpeg.setFfmpegPath(ffmpegPath)

export { DEFAULT_TTS_SETTINGS } from "../config/settings"
export type { TtsSettings } from "../config/settings"

export function readTtsSettings(): TtsSettings {
  return loadSettings().tts
}

export function writeTtsSettings(settings: TtsSettings): void {
  const current = ensureSettings()
  current.tts = { ...current.tts, ...settings }
  saveSettings(repoRoot(), current)
}

async function processedMp3(bufferData: Buffer, outputPath: string, speedMultiplier: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const inputStream = Readable.from(bufferData)
    ffmpeg(inputStream)
      .audioCodec("libmp3lame")
      .audioFilters(`atempo=${clampTtsSpeed(speedMultiplier)},apad=pad_len=22050,treble=g=6,volume=4dB`)
      .on("end", () => resolve())
      .on("error", (err: any) => reject(err))
      .save(outputPath)
  })
}

export async function generateTtsFile(text: string, outputPath: string, settings: TtsSettings): Promise<void> {
  const url = tts.getAudioUrl(text, {
    lang: settings.locale,
    host: "https://translate.google.com",
  })
  const response = await axios.get(url, { responseType: "arraybuffer" })
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  await processedMp3(Buffer.from(response.data), outputPath, settings.speed)
}

const pendingGenerations = new Map<string, Promise<void>>()

/**
 * The text a generated sound file should speak. Manifest sounds (whose filename
 * matches a manifest id) use the manifest's `text`; ad-hoc sounds fall back to
 * the filename with underscores turned into spaces.
 */
export function ttsTextForFile(filename: string): string {
  const id = path.basename(filename, path.extname(filename))
  const manifestEntry = (MANIFEST_BY_ID as Record<string, SoundManifestEntry | undefined>)[id]
  return manifestEntry?.text ?? id.replace(/_/g, " ")
}

export async function createTTSFile(filename: string): Promise<void> {
  if (process.env.FILTER_DISABLE_TTS_GENERATION === "1") return

  const target = filename.endsWith(".mp3") ? filename : `${filename}.mp3`

  if (fs.existsSync(target)) {
    return
  }

  if (pendingGenerations.has(target)) {
    return pendingGenerations.get(target)!
  }

  const promise = (async () => {
    try {
      const text = ttsTextForFile(target)
      const settings = readTtsSettings()
      console.log(`[TTS] Generating local TTS for "${text}" -> ${target}`)
      await generateTtsFile(text, target, settings)
    } catch (error) {
      console.warn(`[TTS] Failed to generate "${target}":`, error)
    } finally {
      pendingGenerations.delete(target)
    }
  })()

  pendingGenerations.set(target, promise)
  return promise
}

export async function waitForPendingGenerations(): Promise<void> {
  while (pendingGenerations.size > 0) {
    await Promise.allSettled(Array.from(pendingGenerations.values()))
  }
}

/**
 * Manifest sound ids whose existing `.mp3` is missing or was generated with a
 * different text, locale or speed than the current manifest/settings require.
 */
export function staleManifestSoundIds(state: GenerationState, settings: TtsSettings): SoundManifestId[] {
  return SOUND_MANIFEST.filter((entry) => {
    const previous = state[`${entry.id}.mp3`]
    if (!previous) return true
    return previous.text !== entry.text || previous.locale !== settings.locale || previous.speed !== settings.speed
  }).map((entry) => entry.id)
}

/**
 * Regenerates any manifest sound whose spoken text or TTS settings have changed
 * since it was last generated, then records the new signatures. Called on export
 * so that manifest text edits are re-spoken without a full `generate-sounds` run.
 */
export async function regenerateStaleManifestSounds(): Promise<number> {
  const settings = readTtsSettings()
  const state = readGenerationState()
  const stale = staleManifestSoundIds(state, settings)
  if (stale.length === 0) return 0

  for (const id of stale) {
    const entry = MANIFEST_BY_ID[id]
    const target = path.join(SOUND_PACK_SOURCE_DIR, `${id}.mp3`)
    console.log(`[TTS] Regenerating "${entry.text}" -> ${target}`)
    await generateTtsFile(entry.text, target, { locale: settings.locale, speed: settings.speed })
    state[`${id}.mp3`] = { text: entry.text, locale: settings.locale, speed: settings.speed }
  }

  writeGenerationState(state)
  return stale.length
}
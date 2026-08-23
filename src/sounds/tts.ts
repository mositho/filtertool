import * as fs from "fs"
import path from "path"
import { Readable } from "stream"
import ffmpegPath from "ffmpeg-static"
import axios from "axios"
import * as tts from "google-tts-api"

const ffmpeg = require("fluent-ffmpeg")
ffmpeg.setFfmpegPath(ffmpegPath)

export interface TtsSettings {
  locale: string
  slow: boolean
  speed: number
}

export const DEFAULT_TTS_SETTINGS: TtsSettings = {
  locale: "en-US",
  slow: false,
  speed: 1.6,
}

const SETTINGS_FILE = ".tts-settings.json"

export function readTtsSettings(): TtsSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8")
      return { ...DEFAULT_TTS_SETTINGS, ...JSON.parse(data) }
    }
  } catch {
    // ignore malformed file, use defaults
  }
  return { ...DEFAULT_TTS_SETTINGS }
}

export function writeTtsSettings(settings: TtsSettings): void {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2) + "\n")
}

async function processedMp3(bufferData: Buffer, outputPath: string, speedMultiplier: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const inputStream = Readable.from(bufferData)
    ffmpeg(inputStream)
      .audioCodec("libmp3lame")
      .audioFilters(`atempo=${speedMultiplier},apad=pad_len=22050,treble=g=6,volume=4dB`)
      .on("end", () => resolve())
      .on("error", (err: any) => reject(err))
      .save(outputPath)
  })
}

export async function generateTtsFile(text: string, outputPath: string, settings: TtsSettings): Promise<void> {
  const url = tts.getAudioUrl(text, {
    lang: settings.locale,
    slow: settings.slow,
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

export async function createTTSFile(filename: string): Promise<void> {
  const target = filename.endsWith(".mp3") ? filename : `${filename}.mp3`

  if (fs.existsSync(target)) {
    return
  }

  if (pendingGenerations.has(target)) {
    return pendingGenerations.get(target)!
  }

  const promise = (async () => {
    try {
      const text = path.basename(target, path.extname(target)).replace(/_/g, " ")
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

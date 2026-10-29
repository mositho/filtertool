import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import axios from "axios"
import { execFileSync } from "node:child_process"
import ffmpegPath from "ffmpeg-static"
import { createTTSFile, generateTtsFile, ttsAudioUrl } from "../../src/sounds/tts"
import { readGenerationState, TTS_PROCESSING_VERSION, writeGenerationState } from "../../src/sounds/generation-state"

/** Synthetic PCM WAV audio; tests never contact the TTS service. */
function testWav(amplitude = 0, duration = 0.1): Buffer {
  const dataSize = Math.round(22050 * duration) * 2
  const wav = Buffer.alloc(44 + dataSize)
  wav.write("RIFF", 0)
  wav.writeUInt32LE(36 + dataSize, 4)
  wav.write("WAVEfmt ", 8)
  wav.writeUInt32LE(16, 16)
  wav.writeUInt16LE(1, 20)
  wav.writeUInt16LE(1, 22)
  wav.writeUInt32LE(22050, 24)
  wav.writeUInt32LE(44100, 28)
  wav.writeUInt16LE(2, 32)
  wav.writeUInt16LE(16, 34)
  wav.write("data", 36)
  wav.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < dataSize / 2; i++) {
    wav.writeInt16LE(Math.round(amplitude * 32767 * Math.sin((2 * Math.PI * 440 * i) / 22050)), 44 + i * 2)
  }
  return wav
}

function audioLevels(file: string): { rmsDb: number; peak: number } {
  const pcm = execFileSync(ffmpegPath!, ["-i", file, "-f", "f32le", "-ac", "1", "-ar", "48000", "pipe:1"], {
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 16 * 1024 * 1024,
  })
  let squared = 0
  let peak = 0
  for (let i = 0; i < pcm.length; i += 4) {
    const sample = pcm.readFloatLE(i)
    squared += sample * sample
    peak = Math.max(peak, Math.abs(sample))
  }
  return { rmsDb: 10 * Math.log10(squared / (pcm.length / 4)), peak }
}

describe("TTS audio URL", () => {
  it("preserves the endpoint parameters and safely encodes text and locale", () => {
    const text = "Rare wand & café? #1"
    const url = new URL(ttsAudioUrl(text, "en-GB"))
    expect(url.origin + url.pathname).toBe("https://translate.google.com/translate_tts")
    expect(Object.fromEntries(url.searchParams)).toEqual({
      ie: "UTF-8",
      q: text,
      tl: "en-GB",
      total: "1",
      idx: "0",
      textlen: String(text.length),
      client: "tw-ob",
      prev: "input",
      ttsspeed: "1",
    })
  })

  it("preserves the 200-character limit", () => {
    expect(() => ttsAudioUrl("a".repeat(200), "en-US")).not.toThrow()
    expect(() => ttsAudioUrl("a".repeat(201), "en-US")).toThrow(RangeError)
  })
})

describe("TTS MP3 processing", () => {
  let directory: string

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "filtertool-audio-"))
    vi.spyOn(axios, "get").mockResolvedValue({ data: testWav() })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    fs.rmSync(directory, { recursive: true, force: true })
  })

  it.each([0.1, 1.6, 5])("encodes MP3 at speed %s, clamping out-of-range values", async (speed) => {
    const target = path.join(directory, "nested folder", "Rare wand & café.mp3")
    await generateTtsFile("Rare wand", target, { locale: "en-US", speed })
    expect(axios.get).toHaveBeenCalledWith(ttsAudioUrl("Rare wand", "en-US"), { responseType: "arraybuffer" })
    const audio = fs.readFileSync(target)
    expect(audio.length).toBeGreaterThan(100)
    expect(audio.subarray(0, 3).toString()).toBe("ID3")
    // Regeneration must replace an existing file without an interactive prompt.
    await generateTtsFile("Rare wand", target, { locale: "en-US", speed })
  })

  it("rejects invalid audio from the service", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: Buffer.from("not audio") })
    await expect(generateTtsFile("Wand", path.join(directory, "invalid.mp3"), { locale: "en-US", speed: 1.6 })).rejects.toThrow(
      "FFmpeg failed",
    )
  })

  it("propagates download errors without writing an output file", async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error("Download failed"))
    const target = path.join(directory, "missing.mp3")
    await expect(generateTtsFile("Wand", target, { locale: "en-US", speed: 1.6 })).rejects.toThrow("Download failed")
    expect(fs.existsSync(target)).toBe(false)
  })

  it.each([0.15, 1, 3])("normalizes quiet and loud recordings consistently (%s seconds) without clipping", async (duration) => {
    const levels: ReturnType<typeof audioLevels>[] = []
    for (const amplitude of [0.005, 0.5]) {
      vi.mocked(axios.get).mockResolvedValue({ data: testWav(amplitude, duration) })
      const target = path.join(directory, `${amplitude}.mp3`)
      await generateTtsFile("Wand", target, { locale: "en-US", speed: 1.6 })
      levels.push(audioLevels(target))
    }
    expect(Math.abs(levels[0].rmsDb - levels[1].rmsDb)).toBeLessThan(1)
    for (const level of levels) {
      expect(level.rmsDb).toBeGreaterThan(-22)
      expect(level.peak).toBeLessThan(0.95)
    }
  })

  it("regenerates an existing ad-hoc sound from the old processing version only once", async () => {
    const oldSettingsDir = process.env.FILTER_SETTINGS_DIR
    process.env.FILTER_SETTINGS_DIR = directory
    const target = path.join(directory, "Rare_Wand.mp3")
    fs.writeFileSync(target, "old audio")
    writeGenerationState({ "Rare_Wand.mp3": { text: "Rare Wand", locale: "en-US", speed: 1.6 } })
    try {
      await createTTSFile(target)
      expect(fs.readFileSync(target).subarray(0, 3).toString()).toBe("ID3")
      expect(readGenerationState()["Rare_Wand.mp3"].processingVersion).toBe(TTS_PROCESSING_VERSION)
      await createTTSFile(target)
      expect(axios.get).toHaveBeenCalledTimes(1)
    } finally {
      if (oldSettingsDir === undefined) delete process.env.FILTER_SETTINGS_DIR
      else process.env.FILTER_SETTINGS_DIR = oldSettingsDir
    }
  })
})

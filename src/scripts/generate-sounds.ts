import "dotenv/config"
import fs from "fs"
import path from "path"
import readline from "readline"
import { globSync } from "glob"
import { SOUND_MANIFEST } from "../sounds/manifest"
import { generateTtsFile, readTtsSettings, writeTtsSettings } from "../sounds/tts"
import { generatedSoundTextToFileName, getSoundPackTargetDir, SOUND_PACK_SOURCE_DIR } from "../sounds/paths"
import { findTtsConfigLiterals } from "../sounds/discover-tts"
import { syncSoundPack } from "./sync-sounds"

const SOURCE_DIR = `./${SOUND_PACK_SOURCE_DIR}`

interface CliFlags {
  locale: string
  speed: number
  yes: boolean
}

function parseArgs(): CliFlags {
  const args = process.argv.slice(2)
  const flags: CliFlags = { locale: "en-US", speed: 1.6, yes: false }
  const known = new Set(["--locale", "--speed", "--yes", "--help"])

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!known.has(arg)) {
      console.error(`Unknown flag: ${arg}`)
      console.error(`Usage: ts-node generate-sounds.ts [--locale en-US] [--speed 1.6] [--yes]`)
      process.exit(1)
    }
    if (arg === "--help") {
      console.log(`Usage: ts-node generate-sounds.ts [--locale en-US] [--speed 1.6] [--yes]
  --locale   Language locale (default: en-US)
  --speed    FFmpeg speed multiplier (default: 1.6)
  --yes      Skip confirmation prompt`)
      process.exit(0)
    }
    if (arg === "--yes") {
      flags.yes = true
    }
    if (arg === "--locale") {
      i++
      if (i >= args.length) {
        console.error("--locale requires a value")
        process.exit(1)
      }
      flags.locale = args[i]
    }
    if (arg === "--speed") {
      i++
      if (i >= args.length) {
        console.error("--speed requires a value")
        process.exit(1)
      }
      const parsed = parseFloat(args[i])
      if (isNaN(parsed) || parsed <= 0) {
        console.error("--speed must be a positive number")
        process.exit(1)
      }
      flags.speed = parsed
    }
  }
  return flags
}

interface TtsEntry {
  text: string
  filename: string
  source: "manifest" | "discovered"
}

function discoverTtsEntries(): TtsEntry[] {
  const seen = new Set<string>()
  const entries: TtsEntry[] = []

  for (const entry of SOUND_MANIFEST) {
    const filename = `${entry.id}.mp3`
    if (!seen.has(filename)) {
      seen.add(filename)
      entries.push({ text: entry.text, filename, source: "manifest" })
    }
  }

  const files = globSync("./src/filters/**/*.ts")
  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8")
    for (const text of findTtsConfigLiterals(content)) {
      const filename = generatedSoundTextToFileName(text)
      if (!seen.has(filename)) {
        seen.add(filename)
        entries.push({ text, filename, source: "discovered" })
      }
    }
  }

  return entries
}

async function confirm(flags: CliFlags): Promise<boolean> {
  if (flags.yes) return true
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question("Generate and replace the sound pack? This will overwrite existing files. (y/N) ", (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes")
    })
  })
}

async function generateWithRetry(
  text: string,
  outputPath: string,
  settings: { locale: string; speed: number },
  maxRetries = 3,
): Promise<void> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await generateTtsFile(text, outputPath, {
        locale: settings.locale,
        speed: settings.speed,
      })
      return
    } catch (error: any) {
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        console.warn(`[TTS] Attempt ${attempt + 1} failed for "${text}", retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        throw new Error(`Failed to generate TTS for "${text}": ${error?.message ?? error}`)
      }
    }
  }
}

function replaceSourcePack(stagingDir: string): void {
  if (fs.existsSync(SOURCE_DIR)) {
    for (const file of fs.readdirSync(SOURCE_DIR)) {
      fs.unlinkSync(path.join(SOURCE_DIR, file))
    }
  } else {
    fs.mkdirSync(SOURCE_DIR, { recursive: true })
  }
  for (const file of fs.readdirSync(stagingDir)) {
    fs.renameSync(path.join(stagingDir, file), path.join(SOURCE_DIR, file))
  }
}

export interface GenerateSoundsOptions {
  locale?: string
  speed?: number
  onProgress?: (done: number, total: number, text: string) => void
}

export interface GenerateSoundsResult {
  generated: number
}

export async function generateSounds(options: GenerateSoundsOptions = {}): Promise<GenerateSoundsResult> {
  const current = readTtsSettings()
  const settings = { locale: options.locale ?? current.locale, speed: options.speed ?? current.speed }
  const entries = discoverTtsEntries()

  // The server streams progress to the UI via `onProgress`, so keep the console
  // quiet in that mode; the CLI (no `onProgress`) keeps the full console output.
  const log: (message: string) => void = options.onProgress ? () => {} : (message) => console.log(message)

  const dynamicEntries = entries.filter((e) => e.source === "discovered")
  if (dynamicEntries.length > 0) {
    log(`Discovered ${dynamicEntries.length} TTS literal(s) from filter source`)
  }

  log(`Total entries to generate: ${entries.length}`)

  const stagingDir = fs.mkdtempSync("tts-staging-")

  try {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const outputPath = path.join(stagingDir, entry.filename)
      log(`[${i + 1}/${entries.length}] Generating "${entry.text}" -> ${entry.filename}`)
      options.onProgress?.(i, entries.length, entry.text)
      await generateWithRetry(entry.text, outputPath, settings)
    }
    options.onProgress?.(entries.length, entries.length, "")

    replaceSourcePack(stagingDir)
    log("Sound pack generated successfully.")

    writeTtsSettings({ locale: settings.locale, speed: settings.speed })
    log("Generation settings saved.")

    syncSoundPack()
    log(`Synced to ${getSoundPackTargetDir()}.`)

    return { generated: entries.length }
  } catch (error: any) {
    console.error("Generation failed:", error?.message ?? error)
    console.error("Sound pack was not modified.")
    throw error
  } finally {
    if (fs.existsSync(stagingDir)) {
      for (const file of fs.readdirSync(stagingDir)) {
        fs.unlinkSync(path.join(stagingDir, file))
      }
      fs.rmdirSync(stagingDir)
    }
  }
}

async function main(): Promise<void> {
  const flags = parseArgs()
  const confirmed = await confirm(flags)
  if (!confirmed) {
    console.log("Aborted.")
    return
  }
  try {
    await generateSounds({ locale: flags.locale, speed: flags.speed })
  } catch (error: any) {
    console.error("Generation failed:", error?.message ?? error)
    process.exit(1)
  }
}

if (require.main === module) {
  void main()
}

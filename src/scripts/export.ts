import "dotenv/config"
import fs from "fs"
import os from "os"
import path from "path"
import readline from "readline"
import { getSoundPackFolder, SOUND_PACK_SOURCE_DIR } from "../sounds/paths"
import { waitForPendingGenerations } from "../sounds/tts"
import { syncSoundPack } from "./syncSounds"

const DEFAULT_WIN_FILTER_PATH = path.join(os.homedir(), "Documents", "My Games", "Path of Exile")

export function resolveFilterPath(): string {
  const envPath = process.env.FILTER_PATH
  if (envPath) return envPath

  if (process.platform === "win32" && !envPath) {
    console.log(`FILTER_PATH not set in .env, defaulting to ${DEFAULT_WIN_FILTER_PATH}`)
    return DEFAULT_WIN_FILTER_PATH
  }

  throw new Error(
    "FILTER_PATH not set in .env and no default is available for this platform. Set FILTER_PATH in your .env file to your Path of Exile directory.",
  )
}

const warn = (text: string) => `\x1b[33m${text}\x1b[0m`

function detectSoundPackFolder(filterFilePath: string): string | null {
  if (!fs.existsSync(filterFilePath)) return null
  const content = fs.readFileSync(filterFilePath, "utf-8")
  const match = content.match(/CustomAlertSound\s+"([^/]+)\//)
  return match ? match[1] : null
}

function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes")
    })
  })
}

export const exportFilter = async (filterName: string, filterPath?: string, skipConfirm = false) => {
  const normalizedFilterName = filterName.toLowerCase()
  const resolvedPath = filterPath ?? resolveFilterPath()

  if (!resolvedPath) {
    throw new Error("No filter path set in environment variables.")
  }

  const { getFilter } = require(path.join(__dirname, "../filters", normalizedFilterName))

  if (!getFilter) {
    throw new Error("Invalid filter file.")
  }

  const filterFileName =
    [
      normalizedFilterName
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join(""),
    ].join("_") + ".filter"

  const filterFilePath = path.join(resolvedPath, filterFileName)
  const filterExists = fs.existsSync(filterFilePath)
  const soundFolder = getSoundPackFolder()

  if (filterExists && !skipConfirm) {
    const existingSoundFolder = detectSoundPackFolder(filterFilePath)
    const packFolderChanged = existingSoundFolder !== null && existingSoundFolder !== soundFolder

    if (packFolderChanged) {
      console.log(`\nExisting filter found: ${filterFileName}`)
      console.log(`Current sound pack folder: ${soundFolder}/`)
      console.log(`Filter references: ${existingSoundFolder}/`)
      console.log(
        warn("Sound pack folder changed. Rename the old filter file or the old sound pack folder to keep both filters working.\n"),
      )
    } else {
      console.log(`\nExisting filter found: ${filterFileName}`)
    }

    const confirmed = await confirm("Overwrite existing filter file? (y/N) ")
    if (!confirmed) {
      console.log("Export cancelled.")
      return null
    }
  }

  if (!fs.existsSync(`./${SOUND_PACK_SOURCE_DIR}`) || fs.readdirSync(`./${SOUND_PACK_SOURCE_DIR}`).length === 0) {
    console.log("No generated sound files found. Running generate-sounds to create them...")
    const { execSync } = require("child_process")
    execSync("npx ts-node ./src/scripts/generateSounds.ts --yes", { stdio: "inherit" })
  }

  fs.writeFileSync(filterFilePath, getFilter())

  await waitForPendingGenerations()
  syncSoundPack()

  if (!filterExists) {
    console.log(`Sound pack folder: ${soundFolder}/`)
  }

  return filterFileName
}

export const main = async () => {
  const rawArgs = process.argv.slice(2)
  const filterName = rawArgs.find((a) => !a.startsWith("--"))?.toLowerCase()
  const skipConfirm = rawArgs.includes("--yes")

  if (!filterName) {
    console.log("No filter name provided.\n")
    return
  }

  try {
    const filterFileName = await exportFilter(filterName, undefined, skipConfirm)
    if (filterFileName) {
      console.log(`Successfully exported filter: ${filterFileName}\n`)
    }
  } catch (err) {
    console.log("Error while compiling filter.", err)
  }
}

if (require.main === module) {
  void main()
}

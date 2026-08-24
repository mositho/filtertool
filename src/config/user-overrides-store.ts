import fs from "fs"
import path from "path"
import { refreshFilterDefaults } from "../filters/shared/defaults"
import { refreshFilterStyles } from "../filters/shared/styles"

export const USER_DEFAULTS_FILE = "user-defaults.json"
export const USER_STYLES_FILE = "user-styles.json"

export function userOverridesDir(): string {
  return path.join(__dirname, "..", "filters", "shared")
}

function readJson(dir: string, fileName: string): Record<string, unknown> {
  const filePath = path.join(dir, fileName)
  if (!fs.existsSync(filePath)) return {}
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Record<string, unknown>
  } catch {
    return {}
  }
}

function writeJson(dir: string, fileName: string, value: unknown): void {
  const filePath = path.join(dir, fileName)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n")
}

export function readUserDefaults(dir: string = userOverridesDir()): Record<string, unknown> {
  return readJson(dir, USER_DEFAULTS_FILE)
}

export function writeUserDefaults(value: unknown, dir: string = userOverridesDir()): void {
  writeJson(dir, USER_DEFAULTS_FILE, value)
  refreshFilterDefaults()
}

export function readUserStyles(dir: string = userOverridesDir()): Record<string, unknown> {
  return readJson(dir, USER_STYLES_FILE)
}

export function writeUserStyles(value: unknown, dir: string = userOverridesDir()): void {
  writeJson(dir, USER_STYLES_FILE, value)
  refreshFilterStyles()
}

import fs from "fs"
import path from "path"
import { slugToFilterFileName } from "./filter-identity"
import { readFilterConfig, writeFilterConfig, CONFIG_JSON_FILE_NAME, type FilterConfig } from "../filters/shared/config-loader"
import { EXCLUDED_FILTER_FOLDERS, isValidFilterName } from "./filter-name"

const INDEX_FILE = "index.ts"

function assertValidName(name: string): void {
  if (!isValidFilterName(name)) {
    throw new Error(`Invalid filter name "${name}".`)
  }
}

function filterDir(filtersRoot: string, name: string): string {
  return path.join(filtersRoot, name)
}

function readTemplateIndex(): string {
  const templateIndex = path.join(__dirname, "../filters/template", INDEX_FILE)
  return fs.readFileSync(templateIndex, "utf-8")
}

export function listFilters(filtersRoot: string): string[] {
  if (!fs.existsSync(filtersRoot)) return []
  return fs
    .readdirSync(filtersRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !EXCLUDED_FILTER_FOLDERS.has(entry.name))
    .map((entry) => entry.name)
    .sort()
}

export function emptyFilterConfig(): { buildProfile: {}; buildSpecificOptions: {} } {
  return { buildProfile: {}, buildSpecificOptions: {} }
}

export function createFilter(filtersRoot: string, name: string): string {
  assertValidName(name)
  const dir = filterDir(filtersRoot, name)
  if (fs.existsSync(dir)) {
    throw new Error(`Filter "${name}" already exists.`)
  }
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, INDEX_FILE), readTemplateIndex())
  writeFilterConfig(dir, emptyFilterConfig())
  return dir
}

export function duplicateFilter(filtersRoot: string, sourceName: string, newName: string): string {
  assertValidName(sourceName)
  assertValidName(newName)
  const sourceDir = filterDir(filtersRoot, sourceName)
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Filter "${sourceName}" does not exist.`)
  }
  const targetDir = filterDir(filtersRoot, newName)
  if (fs.existsSync(targetDir)) {
    throw new Error(`Filter "${newName}" already exists.`)
  }

  fs.mkdirSync(targetDir, { recursive: true })
  const sourceIndex = path.join(sourceDir, INDEX_FILE)
  fs.writeFileSync(
    path.join(targetDir, INDEX_FILE),
    fs.existsSync(sourceIndex) ? fs.readFileSync(sourceIndex, "utf-8") : readTemplateIndex(),
  )

  const sourceConfig = readFilterConfig(sourceDir)
  writeFilterConfig(targetDir, sourceConfig)
  return targetDir
}

export function renameFilter(filtersRoot: string, oldName: string, newName: string, filterPath?: string): string {
  assertValidName(oldName)
  assertValidName(newName)
  const sourceDir = filterDir(filtersRoot, oldName)
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Filter "${oldName}" does not exist.`)
  }
  const targetDir = filterDir(filtersRoot, newName)
  if (fs.existsSync(targetDir)) {
    throw new Error(`Filter "${newName}" already exists.`)
  }

  fs.renameSync(sourceDir, targetDir)
  removeGameFilter(filterPath, oldName)
  return targetDir
}

export function deleteFilter(filtersRoot: string, name: string, filterPath?: string, options: { deleteGameFile?: boolean } = {}): void {
  assertValidName(name)
  const dir = filterDir(filtersRoot, name)
  if (!fs.existsSync(dir)) {
    throw new Error(`Filter "${name}" does not exist.`)
  }
  fs.rmSync(dir, { recursive: true, force: true })
  if (options.deleteGameFile) {
    removeGameFilter(filterPath, name)
  }
}

/** Removes the exported `.filter` file for a filter, never touching the shared sound pack. */
export function removeGameFilter(filterPath: string | undefined, name: string): void {
  if (!filterPath) return
  const gameFile = path.join(filterPath, slugToFilterFileName(name))
  if (fs.existsSync(gameFile)) {
    fs.unlinkSync(gameFile)
  }
}

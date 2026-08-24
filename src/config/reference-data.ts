import fs from "fs"
import path from "path"
import { SOUND_MANIFEST } from "../sounds/manifest"
import { SOUND_PACK_SOURCE_DIR } from "../sounds/paths"
import { WEAPON_CLASSES } from "../types/weapon-base-data"
import { LEVELING_AMULETS } from "../filters/shared/sections/options"
import { MAX_TTS_SPEED, MIN_TTS_SPEED, TTS_LOCALES } from "./settings"

export const RARITIES = ["Normal", "Magic", "Rare", "Unique"] as const
export const LINK_COLORS = ["R", "G", "B"] as const
export const ARMOUR_TYPES = ["armour", "evasion", "es", "armour-evasion", "armour-es", "es-evasion"] as const
export const COLORS = ["Red", "Green", "Blue", "Brown", "White", "Yellow", "Cyan", "Grey", "Orange", "Pink", "Purple"] as const
export const SHAPES = [
  "Circle",
  "Diamond",
  "Hexagon",
  "Square",
  "Star",
  "Triangle",
  "Cross",
  "Moon",
  "Raindrop",
  "Kite",
  "Pentagon",
  "UpsideDownHouse",
] as const
export const OPERATORS = ["<", "<=", ">", ">=", "=", "==", "!="] as const
export const SHIELD_PROGRESSION_MODES = ["none", "early", "full"] as const
export const AMULETS = Object.keys(LEVELING_AMULETS) as (keyof typeof LEVELING_AMULETS)[]

const BASE_TYPES_CSV_PATH = path.join(__dirname, "../assets/BaseTypes.csv")

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ",") {
      row.push(field)
      field = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      field = ""
      if (row.length > 1 || row[0] !== "") rows.push(row)
      row = []
    } else {
      field += char
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field)
    if (row.length > 1 || row[0] !== "") rows.push(row)
  }
  return rows
}

export type BaseTypeReference = {
  itemClasses: string[]
  baseTypesByClass: Record<string, string[]>
}

let baseTypeCache: BaseTypeReference | null = null

export function loadBaseTypeReference(): BaseTypeReference {
  if (baseTypeCache) return baseTypeCache
  const content = fs.readFileSync(BASE_TYPES_CSV_PATH, "utf-8")
  const rows = parseCsv(content)
  const header = rows[0]
  const classIndex = header.indexOf("Class")
  const baseTypeIndex = header.indexOf("BaseType")

  const baseTypesByClass: Record<string, string[]> = {}
  for (let i = 1; i < rows.length; i++) {
    const itemClass = rows[i][classIndex]
    const baseType = rows[i][baseTypeIndex]
    if (!itemClass || !baseType) continue
    const list = baseTypesByClass[itemClass] ?? (baseTypesByClass[itemClass] = [])
    list.push(baseType)
  }

  const itemClasses = Object.keys(baseTypesByClass).sort()
  for (const itemClass of itemClasses) {
    baseTypesByClass[itemClass].sort()
  }

  baseTypeCache = { itemClasses, baseTypesByClass }
  return baseTypeCache
}

export function buildReferenceData() {
  const { itemClasses, baseTypesByClass } = loadBaseTypeReference()
  const soundsDir = path.join(__dirname, "..", "..", SOUND_PACK_SOURCE_DIR)
  return {
    itemClasses,
    baseTypesByClass,
    rarities: RARITIES,
    linkColors: LINK_COLORS,
    armourTypes: ARMOUR_TYPES,
    weaponClasses: WEAPON_CLASSES,
    amulets: AMULETS,
    colors: COLORS,
    shapes: SHAPES,
    operators: OPERATORS,
    shieldProgressionModes: SHIELD_PROGRESSION_MODES,
    ttsLocales: TTS_LOCALES,
    ttsSpeed: { min: MIN_TTS_SPEED, max: MAX_TTS_SPEED },
    sounds: SOUND_MANIFEST.map((entry) => ({
      id: entry.id,
      name: entry.name,
      hasFile: fs.existsSync(path.join(soundsDir, `${entry.id}.mp3`)),
    })),
  }
}

export type ReferenceData = ReturnType<typeof buildReferenceData>

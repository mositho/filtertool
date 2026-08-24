import fs from "fs"
import path from "path"

type PlainObject = Record<string, unknown>
export type DeepPartial<T> = T extends readonly (infer TValue)[]
  ? readonly DeepPartial<TValue>[]
  : T extends object
    ? { [TKey in keyof T]?: DeepPartial<T[TKey]> }
    : T

const isPlainObject = (value: unknown): value is PlainObject => typeof value === "object" && value !== null && !Array.isArray(value)

export const mergeDeep = <T>(base: T, override: DeepPartial<T>): T => {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override as T
  }

  const merged: PlainObject = { ...base }

  Object.entries(override).forEach(([key, overrideValue]) => {
    if (overrideValue === undefined) {
      return
    }

    const baseValue = merged[key]
    merged[key] = isPlainObject(baseValue) && isPlainObject(overrideValue) ? mergeDeep(baseValue, overrideValue) : overrideValue
  })

  return merged as T
}
export const loadOptionalOverride = <T>(modulePath: string, exportName: string): DeepPartial<T> => {
  if (process.env.FILTER_DISABLE_USER_OVERRIDES === "1") {
    return {} as DeepPartial<T>
  }

  try {
    const loadedModule = require(modulePath) as Record<string, DeepPartial<T> | undefined>
    return loadedModule[exportName] ?? ({} as DeepPartial<T>)
  } catch (error) {
    const moduleError = error as NodeJS.ErrnoException

    if (moduleError.code === "MODULE_NOT_FOUND" && moduleError.message.includes(modulePath)) {
      return {} as DeepPartial<T>
    }

    throw error
  }
}

const jsonOverrideCache = new Map<string, { mtimeMs: number; value: unknown }>()

/**
 * Loads a UI-owned JSON override (e.g. `user-defaults.json`). Returns an empty
 * override when the file is missing, disabled, or malformed. Results are cached
 * by file mtime so a long-running server picks up edits without restarting.
 */
export const loadJsonOverride = <T>(fileName: string): DeepPartial<T> => {
  if (process.env.FILTER_DISABLE_USER_OVERRIDES === "1") {
    return {} as DeepPartial<T>
  }

  const jsonPath = path.join(__dirname, fileName)
  if (!fs.existsSync(jsonPath)) {
    return {} as DeepPartial<T>
  }

  try {
    const stat = fs.statSync(jsonPath)
    const cached = jsonOverrideCache.get(jsonPath)
    if (cached && cached.mtimeMs === stat.mtimeMs) {
      return cached.value as DeepPartial<T>
    }
    const value = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as DeepPartial<T>
    jsonOverrideCache.set(jsonPath, { mtimeMs: stat.mtimeMs, value })
    return value
  } catch {
    return {} as DeepPartial<T>
  }
}

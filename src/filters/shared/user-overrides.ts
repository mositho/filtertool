type PlainObject = Record<string, unknown>

const isPlainObject = (value: unknown): value is PlainObject => typeof value === "object" && value !== null && !Array.isArray(value)

export const mergeDeep = <T>(base: T, override: Partial<T>): T => {
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

export const loadOptionalOverride = <T>(modulePath: string, exportName: string): Partial<T> => {
  try {
    const loadedModule = require(modulePath) as Record<string, Partial<T> | undefined>
    return loadedModule[exportName] ?? {}
  } catch (error) {
    const moduleError = error as NodeJS.ErrnoException

    if (moduleError.code === "MODULE_NOT_FOUND" && moduleError.message.includes(modulePath)) {
      return {}
    }

    throw error
  }
}

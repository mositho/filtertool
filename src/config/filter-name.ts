export const EXCLUDED_FILTER_FOLDERS = new Set(["shared", "template"])

/** Allowed filter name characters: letters (any case), digits, spaces, underscores and hyphens. */
export const FILTER_NAME_PATTERN = /^[a-zA-Z0-9 _-]+$/

export function isValidFilterName(name: string): boolean {
  const trimmed = name.trim()
  if (!trimmed) return false
  if (EXCLUDED_FILTER_FOLDERS.has(trimmed)) return false
  return FILTER_NAME_PATTERN.test(trimmed)
}

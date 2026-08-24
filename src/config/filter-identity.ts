export function slugToFilterFileName(filterName: string): string {
  const words = filterName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  const camel = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("")
  return `${camel || "Filter"}.filter`
}

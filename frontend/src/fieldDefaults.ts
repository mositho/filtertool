import { BUILD_PROFILE_SCHEMA, BUILD_SPECIFIC_SCHEMA, type FieldSubsection, type SchemaField } from "../../src/config/form-schema"
import { getPath, setPath, deletePath } from "./path"

const subsectionFields = (section: FieldSubsection): SchemaField[] => [
  ...section.fields,
  ...(section.subsections ?? []).flatMap(subsectionFields),
]
const fields = [...BUILD_PROFILE_SCHEMA, ...BUILD_SPECIFIC_SCHEMA].flatMap((group) => [
  ...group.fields,
  ...(group.subsections ?? []).flatMap(subsectionFields),
])

/** Resolve linked defaults without materializing them into the saved configuration. */
export function fieldDefault(
  field: SchemaField,
  local: Record<string, unknown>,
  shared: Record<string, unknown> = {},
  styles: Record<string, Record<string, unknown>> = {},
): unknown {
  if (field.path.endsWith(".style.size")) {
    const stylePath = field.path.slice(0, -5)
    const localStyle = getPath(local, stylePath) as Record<string, unknown> | undefined
    const schemaStyle = fields.find((candidate) => candidate.path === stylePath && candidate.control === "style")?.defaultValue
    const style = (localStyle ?? getPath(shared, stylePath) ?? schemaStyle ?? {}) as Record<string, unknown>
    return (localStyle ? undefined : style.size) ?? styles[String(style.preset)]?.size ?? field.defaultValue
  }
  const value = getPath(shared, field.path)
  if (value !== undefined) return value
  if (field.defaultFrom) {
    const { path, value: fallback } = field.defaultFrom
    const explicit = getPath(local, path) ?? getPath(shared, path)
    if (explicit !== undefined) return explicit
    const source = fields.find((candidate) => candidate.path === path)
    return source ? fieldDefault(source, local, shared, styles) : fallback
  }
  if (field.defaultWhen) {
    const { path, equals, defaultValue, value: whenValue } = field.defaultWhen
    return (getPath(local, path) ?? defaultValue) === equals ? whenValue : undefined
  }
  return field.defaultValue
}

/** The size shortcut edits the same style object without losing inherited colors/presets. */
export function setStyleSize(root: Record<string, unknown>, sizePath: string, value: unknown, shared: Record<string, unknown> = {}) {
  if (value === undefined) {
    deletePath(root, sizePath)
    return
  }
  const stylePath = sizePath.slice(0, -5)
  const style = getPath(root, stylePath) ?? getPath(shared, stylePath) ?? fields.find((field) => field.path === stylePath)?.defaultValue
  setPath(root, stylePath, { ...(style as Record<string, unknown>), size: value })
}

export function defaultSource(field: SchemaField, shared: Record<string, unknown> = {}): string | undefined {
  return getPath(shared, field.path) === undefined ? field.defaultFrom?.label : undefined
}

/** Only built-in rule cards move their enabled control into the header. */
export function ruleEnabledField(section: FieldSubsection): SchemaField | undefined {
  const styleField = [
    ...section.fields,
    ...(section.subsections ?? []).filter((child) => child.module).flatMap((child) => child.fields),
  ].find((field) => field.control === "style")
  return styleField ? section.fields.find((field) => field.control === "boolean" && field.path.endsWith(".enabled")) : undefined
}

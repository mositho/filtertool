import { ref } from "vue"

export type EntityClipboard = { kind: "highlight" | "weapon phase"; value: Record<string, unknown> }

/** Shared within the app so configurations can be copied between filters. */
export const entityClipboard = ref<EntityClipboard | null>(null)

export function copyEntity(kind: EntityClipboard["kind"], value: Record<string, unknown>) {
  entityClipboard.value = { kind, value: JSON.parse(JSON.stringify(value)) as Record<string, unknown> }
}

export function pasteEntity(kind: EntityClipboard["kind"]): Record<string, unknown> | undefined {
  if (entityClipboard.value?.kind !== kind) return undefined
  return JSON.parse(JSON.stringify(entityClipboard.value.value)) as Record<string, unknown>
}

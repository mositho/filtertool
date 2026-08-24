<script setup lang="ts">
import { computed, ref, watch } from "vue"
import {
  BUILD_PROFILE_SCHEMA,
  BUILD_SPECIFIC_SCHEMA,
  emptyWeaponHighlight,
  type FieldGroup,
  type FieldSubsection,
  type SchemaField,
} from "@schema/form-schema"
import type { FilterConfig, ReferenceData } from "../api"
import { getPath, setPath, deletePath } from "../path"
import FieldInput from "./FieldInput.vue"
import HighlightEditor from "./HighlightEditor.vue"
import HighlightCard from "./HighlightCard.vue"

const props = defineProps<{ modelValue: FilterConfig; reference: ReferenceData; defaults?: Record<string, unknown> }>()
const emit = defineEmits<{ "update:modelValue": [value: FilterConfig]; "previewSection": [section: string] }>()

function emitChange() {
  emit("update:modelValue", props.modelValue)
}

const buildProfile = computed(() => props.modelValue.buildProfile)
const buildSpecific = computed(() => props.modelValue.buildSpecificOptions)

const weaponBaseTypes = computed(() => props.reference.weaponClasses.flatMap((c) => props.reference.baseTypesByClass[c] ?? []))

function optionsFor(field: SchemaField): string[] {
  if (field.control !== "select" && field.control !== "multiselect") return []
  if (field.options && field.options.length > 0) return field.options
  switch (field.path) {
    case "preferredArmour":
      return props.reference.armourTypes
    case "earlyWeapons.itemClasses":
      return props.reference.weaponClasses
    case "earlyWeapons.baseTypes":
      return weaponBaseTypes.value
    case "jewellery.amulets":
      return props.reference.amulets
    case "tinctures.baseTypes":
      return props.reference.baseTypesByClass["Tinctures"] ?? []
    default:
      return []
  }
}

function defaultFor(root: Record<string, unknown>, field: SchemaField): unknown {
  if (props.defaults) {
    const shared = getPath(props.defaults, field.path)
    if (shared !== undefined) return shared
  }
  if (field.defaultWhen) {
    const { path, equals, defaultValue, value: whenValue } = field.defaultWhen
    const related = getPath(root, path)
    return (related === undefined ? defaultValue : related) === equals ? whenValue : undefined
  }
  return field.defaultValue
}

function fieldIsSet(root: Record<string, unknown>, field: SchemaField): boolean {
  return getPath(root, field.path) !== undefined
}

function effectiveValue(root: Record<string, unknown>, field: SchemaField): unknown {
  const value = getPath(root, field.path)
  return value !== undefined ? value : defaultFor(root, field)
}

/** Number fields show the default as a placeholder; other controls show it as a value. */
function displayValue(root: Record<string, unknown>, field: SchemaField): unknown {
  return field.control === "number" ? getPath(root, field.path) : effectiveValue(root, field)
}

function setFieldValue(root: Record<string, unknown>, field: SchemaField, value: unknown) {
  if (value === undefined) deletePath(root, field.path)
  else setPath(root, field.path, value)
  emitChange()
}

function placeholderFor(root: Record<string, unknown>, field: SchemaField): string | undefined {
  if (field.placeholder) return field.placeholder
  const when = field.placeholderWhen
  if (!when) return undefined
  const { path, equals, notEquals, defaultValue, value } = when
  const related = getPath(root, path)
  const resolved = related === undefined ? defaultValue : related
  if (equals !== undefined && resolved === equals) return value
  if (notEquals !== undefined && resolved !== notEquals) return value
  return undefined
}

function defaultValueLabel(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  if (Array.isArray(value)) return value.length ? value.join(", ") : undefined
  if (typeof value === "boolean") return value ? "On" : "Off"
  return String(value)
}

/** Placeholder for an unset field: its explicit placeholder, otherwise its default value. */
function displayPlaceholder(root: Record<string, unknown>, field: SchemaField): string | undefined {
  const explicit = placeholderFor(root, field)
  if (explicit !== undefined) return explicit
  return fieldIsSet(root, field) ? undefined : defaultValueLabel(defaultFor(root, field))
}

const highlightPath = "highlightedEquipment.highlights"
const highlights = computed(() => {
  const raw = getPath(buildSpecific.value, highlightPath)
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
})

function setHighlights(value: Record<string, unknown>[]) {
  setPath(buildSpecific.value, highlightPath, value)
  emitChange()
}

function useHighlight(path: string) {
  const highlight = ref<Record<string, unknown>>({})
  watch(
    () => getPath(buildProfile.value, path),
    (value) => {
      highlight.value =
        value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : emptyWeaponHighlight()
    },
    { immediate: true },
  )
  const onChange = () => {
    if (Object.keys(highlight.value).length > 0) setPath(buildProfile.value, path, highlight.value)
    else deletePath(buildProfile.value, path)
    emitChange()
  }
  return { highlight, onChange }
}

const highlightBindings: Record<string, ReturnType<typeof useHighlight>> = {
  preferredWeapons: useHighlight("preferredWeapons"),
  earlyWeapons: useHighlight("earlyWeapons"),
}

function isWide(field: SchemaField): boolean {
  return field.control === "multiselect" || field.control === "link-colors" || field.control === "highlight"
}

function subsectionRoot(groupRoot: Record<string, unknown>, subsection: FieldSubsection): Record<string, unknown> {
  if (subsection.root === "buildProfile") return buildProfile.value
  if (subsection.root === "buildSpecificOptions") return buildSpecific.value
  return groupRoot
}

function isVisible(root: Record<string, unknown>, field: SchemaField): boolean {
  if (!field.visibleWhen) return true
  const { path, equals, notEquals, defaultValue } = field.visibleWhen
  const value = getPath(root, path)
  const resolved = value === undefined ? defaultValue : value
  if (equals !== undefined && resolved !== equals) return false
  if (notEquals !== undefined && resolved === notEquals) return false
  return true
}

function visibleFields(root: Record<string, unknown>, fields: SchemaField[]): SchemaField[] {
  return fields.filter((field) => isVisible(root, field))
}

function previewSectionFor(group: FieldGroup, subsection?: FieldSubsection, field?: SchemaField): string | undefined {
  return field?.previewSection ?? subsection?.previewSection ?? group.previewSection
}

type SubsectionEntry = {
  key: string
  subsection: FieldSubsection
  group: FieldGroup
  root: Record<string, unknown>
  depth: number
  hasSiblingAbove: boolean
}

function subsectionEntries(group: FieldGroup, groupRoot: Record<string, unknown>): SubsectionEntry[] {
  const entries: SubsectionEntry[] = []
  const walk = (subsections: FieldSubsection[], parentRoot: Record<string, unknown>, depth: number) => {
    subsections.forEach((subsection, index) => {
      const root = subsectionRoot(parentRoot, subsection)
      entries.push({ key: `${depth}-${subsection.key}`, subsection, group, root, depth, hasSiblingAbove: index > 0 })
      walk(subsection.subsections ?? [], root, depth + 1)
    })
  }
  walk(group.subsections ?? [], groupRoot, 0)
  return entries
}

function onFocusIn(event: FocusEvent) {
  const target = event.target as HTMLElement | null
  const el = target?.closest?.("[data-preview-section]") as HTMLElement | null
  const section = el?.dataset.previewSection
  if (section) emit("previewSection", section)
}

const buildProfileGroups = computed(() => BUILD_PROFILE_SCHEMA.map((group) => ({ group, root: buildProfile.value })))
const buildSpecificGroups = computed(() => BUILD_SPECIFIC_SCHEMA.map((group) => ({ group, root: buildSpecific.value })))

const allGroups = computed(() => [...buildProfileGroups.value, ...buildSpecificGroups.value])

const collapsed = ref<Record<string, boolean>>({})

function isCollapsed(key: string): boolean {
  return !!collapsed.value[key]
}

function toggleSection(key: string) {
  collapsed.value = { ...collapsed.value, [key]: !collapsed.value[key] }
}

function collapseAll() {
  const next: Record<string, boolean> = { ...collapsed.value }
  for (const entry of allGroups.value) next[entry.group.key] = true
  collapsed.value = next
}

function expandAll() {
  collapsed.value = {}
}
</script>

<template>
  <div class="space-y-4" @focusin="onFocusIn">
    <div class="flex items-center justify-end gap-2">
      <button
        type="button"
        @click="collapseAll"
        class="rounded border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
      >
        Collapse all
      </button>
      <button
        type="button"
        @click="expandAll"
        class="rounded border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
      >
        Expand all
      </button>
    </div>

    <template v-for="entry in allGroups" :key="entry.group.key">
      <section class="rounded border border-neutral-800 bg-neutral-900/40" :data-preview-section="entry.group.previewSection">
        <button
          type="button"
          @click="toggleSection(entry.group.key)"
          class="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-neutral-900/40"
        >
          <span class="text-lg font-semibold uppercase tracking-wide text-neutral-200">{{ entry.group.title }}</span>
          <span class="text-neutral-400">{{ isCollapsed(entry.group.key) ? "▸" : "▾" }}</span>
        </button>

        <div v-show="!isCollapsed(entry.group.key)" class="px-4 pb-4">
          <p v-if="entry.group.description" class="mb-3 text-xs text-neutral-500">{{ entry.group.description }}</p>

          <HighlightEditor
            v-if="entry.group.key === 'highlightedEquipment'"
            :highlights="highlights"
            :reference="reference"
            @change="emitChange"
            @update:highlights="setHighlights"
          />

          <template v-else>
            <div v-if="entry.group.fields.length > 0" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                v-for="field in visibleFields(entry.root, entry.group.fields)"
                :key="field.path"
                :class="isWide(field) ? 'sm:col-span-2' : ''"
                :data-preview-section="previewSectionFor(entry.group, undefined, field)"
              >
                <FieldInput
                  v-if="field.control !== 'highlight'"
                  :field="field"
                  :value="displayValue(entry.root, field)"
                  :options="optionsFor(field)"
                  :placeholder="displayPlaceholder(entry.root, field)"
                  :defaulted="!fieldIsSet(entry.root, field) && defaultFor(entry.root, field) !== undefined"
                  :can-reset="fieldIsSet(entry.root, field)"
                  @update:value="setFieldValue(entry.root, field, $event)"
                  @reset="setFieldValue(entry.root, field, undefined)"
                />
                <HighlightCard
                  v-else
                  :highlight="highlightBindings[field.path].highlight.value"
                  :reference="reference"
                  :weapons-only="field.weaponsOnly"
                  @change="highlightBindings[field.path].onChange"
                />
              </div>
            </div>

            <div
              v-for="sub in subsectionEntries(entry.group, entry.root)"
              :key="sub.key"
              :class="sub.depth > 0 ? 'mt-2' : sub.hasSiblingAbove ? 'mt-4 border-t border-neutral-800/60 pt-3' : 'mt-4'"
              :data-preview-section="previewSectionFor(sub.group, sub.subsection)"
            >
              <h3
                class="mb-1 font-semibold uppercase tracking-wide"
                :class="sub.depth > 0 ? 'text-xs text-neutral-500' : 'text-sm text-neutral-400'"
              >
                {{ sub.subsection.title }}
              </h3>
              <p v-if="sub.subsection.description" class="mb-3 text-xs text-neutral-500">{{ sub.subsection.description }}</p>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  v-for="field in visibleFields(sub.root, sub.subsection.fields)"
                  :key="field.path"
                  :class="isWide(field) ? 'sm:col-span-2' : ''"
                  :data-preview-section="previewSectionFor(sub.group, sub.subsection, field)"
                >
                  <FieldInput
                    v-if="field.control !== 'highlight'"
                    :field="field"
                    :value="displayValue(sub.root, field)"
                    :options="optionsFor(field)"
                    :placeholder="displayPlaceholder(sub.root, field)"
                    :defaulted="!fieldIsSet(sub.root, field) && defaultFor(sub.root, field) !== undefined"
                    :can-reset="fieldIsSet(sub.root, field)"
                    @update:value="setFieldValue(sub.root, field, $event)"
                    @reset="setFieldValue(sub.root, field, undefined)"
                  />
                  <HighlightCard
                    v-else
                    :highlight="highlightBindings[field.path].highlight.value"
                    :reference="reference"
                    :weapons-only="field.weaponsOnly"
                    @change="highlightBindings[field.path].onChange"
                  />
                </div>
              </div>
            </div>
          </template>
        </div>
      </section>
    </template>
  </div>
</template>

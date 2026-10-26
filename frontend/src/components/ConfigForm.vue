<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { BUILD_PROFILE_SCHEMA, BUILD_SPECIFIC_SCHEMA, type FieldGroup, type FieldSubsection, type SchemaField } from "@schema/form-schema"
import type { FilterConfig, ReferenceData } from "../api"
import { getPath, setPath, deletePath } from "../path"
import FieldInput from "./FieldInput.vue"
import HighlightEditor from "./HighlightEditor.vue"
import WeaponProgression from "./WeaponProgression.vue"
import RuleAdvanced from "./RuleAdvanced.vue"
import { fieldDefault, defaultSource, ruleEnabledField, setStyleSize } from "../fieldDefaults"
import RuleHeader from "./RuleHeader.vue"

const props = defineProps<{ modelValue: FilterConfig; reference: ReferenceData; filterName: string; defaults?: Record<string, unknown> }>()
const emit = defineEmits<{ "update:modelValue": [value: FilterConfig]; "previewSection": [section: string] }>()

function emitChange() {
  emit("update:modelValue", props.modelValue)
}

const buildProfile = computed(() => props.modelValue.buildProfile)
const buildSpecific = computed(() => props.modelValue.buildSpecificOptions)

function optionsFor(field: SchemaField): string[] {
  if (field.control !== "select" && field.control !== "multiselect") return []
  if (field.options && field.options.length > 0) return field.options
  switch (field.path) {
    case "preferredArmour":
      return props.reference.armourTypes
    case "jewellery.amulets":
      return props.reference.amulets
    case "tinctures.baseTypes":
      return props.reference.baseTypesByClass["Tinctures"] ?? []
    case "gemCallouts.gems":
    case "gemCallouts.styleOnly":
      return [...props.reference.skillGems, ...props.reference.supportGems]
    default:
      return []
  }
}

function defaultFor(root: Record<string, unknown>, field: SchemaField): unknown {
  return fieldDefault(field, root, props.defaults, props.reference.styles)
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
  if (field.path.endsWith(".style.size")) setStyleSize(root, field.path, value, props.defaults)
  else if (value === undefined) deletePath(root, field.path)
  else setPath(root, field.path, value)
  emitChange()
}

function setRuleEnabled(root: Record<string, unknown>, field: SchemaField, value: boolean) {
  setFieldValue(root, field, value === defaultFor(root, field) ? undefined : value)
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
  if (field.placeholder === "uncapped" && defaultFor(root, field) !== undefined) return defaultValueLabel(defaultFor(root, field))
  const explicit = placeholderFor(root, field)
  if (explicit !== undefined) return explicit
  return fieldIsSet(root, field) ? undefined : defaultValueLabel(defaultFor(root, field))
}

const highlightPath = "highlightedEquipment.highlights"
const highlights = computed(() => {
  const raw = getPath(buildSpecific.value, highlightPath)
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
})

const weaponPhases = computed(() => (Array.isArray(buildProfile.value.weaponPhases) ? buildProfile.value.weaponPhases : []))

function setWeaponPhases(value: Record<string, unknown>[]) {
  if (value.length === 0) deletePath(buildProfile.value, "weaponPhases")
  else setPath(buildProfile.value, "weaponPhases", value)
  emitChange()
}

function setHighlights(value: Record<string, unknown>[]) {
  setPath(buildSpecific.value, highlightPath, value)
  emitChange()
}

function isWide(field: SchemaField): boolean {
  return field.fullWidth ?? ["multiselect", "link-colors", "style", "icon", "rule-sound"].includes(field.control)
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
  enabledField?: SchemaField
  group: FieldGroup
  root: Record<string, unknown>
  depth: number
  hasSiblingAbove: boolean
}

function subsectionEntries(group: FieldGroup, groupRoot: Record<string, unknown>): SubsectionEntry[] {
  const entries: SubsectionEntry[] = []
  const walk = (subsections: FieldSubsection[], parentRoot: Record<string, unknown>, depth: number, previewSection?: string) => {
    subsections.forEach((subsection, index) => {
      if (subsection.module) return
      const root = subsectionRoot(parentRoot, subsection)
      const resolved = { ...subsection, previewSection: subsection.previewSection ?? previewSection }
      entries.push({
        key: `${depth}-${subsection.key}`,
        subsection: resolved,
        enabledField: subsection.collapsed ? ruleEnabledField(subsection) : undefined,
        group,
        root,
        depth,
        hasSiblingAbove: index > 0,
      })
      if (!subsectionCollapsed(group.key, subsection)) walk(subsection.subsections ?? [], root, depth + 1, resolved.previewSection)
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

function defaultCollapsed(): Record<string, boolean> {
  return { buildProfile: true }
}

function loadCollapsed(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(`filtertool:collapsed:${props.filterName}`)
    if (saved) return { ...defaultCollapsed(), ...JSON.parse(saved) }
  } catch {
    // Fall back to the default view if stored state is unavailable or invalid.
  }
  return defaultCollapsed()
}

const collapsed = ref<Record<string, boolean>>(loadCollapsed())

function subsectionCollapsed(group: string, section: FieldSubsection): boolean {
  return collapsed.value[`${group}:${section.key}`] ?? section.collapsed ?? false
}

function toggleSubsection(group: string, section: FieldSubsection) {
  collapsed.value[`${group}:${section.key}`] = !subsectionCollapsed(group, section)
}

watch(
  collapsed,
  (value) => {
    try {
      localStorage.setItem(`filtertool:collapsed:${props.filterName}`, JSON.stringify(value))
    } catch {
      // The editor remains usable when browser storage is unavailable.
    }
  },
  { deep: true },
)

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
  const next: Record<string, boolean> = {}
  const expand = (group: string, sections: FieldSubsection[]) => {
    for (const section of sections) {
      next[`${group}:${section.key}`] = false
      expand(group, section.subsections ?? [])
    }
  }
  for (const { group } of allGroups.value) expand(group.key, group.subsections ?? [])
  collapsed.value = next
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
          :aria-expanded="!isCollapsed(entry.group.key)"
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

          <template v-else-if="entry.group.key === 'weaponProgression'">
            <WeaponProgression :phases="weaponPhases" :reference="reference" @update:phases="setWeaponPhases" @change="emitChange" />
          </template>

          <template v-else>
            <div v-if="entry.group.fields.length > 0" class="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
              <div
                v-for="field in visibleFields(entry.root, entry.group.fields)"
                :key="field.path"
                :class="['min-w-0', isWide(field) ? 'sm:col-span-2' : '']"
                :data-preview-section="previewSectionFor(entry.group, undefined, field)"
              >
                <FieldInput
                  :reference="reference"
                  :default-source="defaultSource(field, defaults)"
                  :field="field"
                  :value="displayValue(entry.root, field)"
                  :options="optionsFor(field)"
                  :placeholder="displayPlaceholder(entry.root, field)"
                  :defaulted="!fieldIsSet(entry.root, field) && defaultFor(entry.root, field) !== undefined"
                  :can-reset="fieldIsSet(entry.root, field)"
                  @update:value="setFieldValue(entry.root, field, $event)"
                  @reset="setFieldValue(entry.root, field, undefined)"
                />
              </div>
            </div>

            <div
              v-for="sub in subsectionEntries(entry.group, entry.root)"
              :key="sub.key"
              :class="sub.depth > 0 ? 'mt-2' : sub.hasSiblingAbove ? 'mt-4 border-t border-neutral-800/60 pt-3' : 'mt-4'"
              :style="{ marginLeft: `${sub.depth}rem` }"
              :data-preview-section="previewSectionFor(sub.group, sub.subsection)"
            >
              <RuleHeader
                v-if="sub.subsection.collapsed"
                :title="sub.subsection.title"
                :heading="sub.depth === 0"
                :expanded="!subsectionCollapsed(entry.group.key, sub.subsection)"
                :field="sub.enabledField"
                :enabled="sub.enabledField && effectiveValue(sub.root, sub.enabledField)"
                :defaulted="!sub.enabledField || !fieldIsSet(sub.root, sub.enabledField)"
                @toggle="toggleSubsection(entry.group.key, sub.subsection)"
                @change="sub.enabledField && setRuleEnabled(sub.root, sub.enabledField, $event)"
                @reset="sub.enabledField && setFieldValue(sub.root, sub.enabledField, undefined)"
              />
              <h3
                v-else
                class="mb-1 font-semibold uppercase tracking-wide"
                :class="sub.depth > 0 ? 'text-xs text-neutral-500' : 'text-sm text-neutral-400'"
              >
                {{ sub.subsection.title }}
              </h3>
              <p
                v-if="sub.subsection.description && !subsectionCollapsed(entry.group.key, sub.subsection)"
                class="mb-3 text-xs text-neutral-500"
              >
                {{ sub.subsection.description }}
              </p>
              <div v-show="!subsectionCollapsed(entry.group.key, sub.subsection)" class="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
                <div
                  v-for="field in visibleFields(sub.root, sub.subsection.fields).filter((field) => field !== sub.enabledField)"
                  :key="field.path"
                  :class="['min-w-0', isWide(field) ? 'sm:col-span-2' : '']"
                  :data-preview-section="previewSectionFor(sub.group, sub.subsection, field)"
                >
                  <FieldInput
                    :reference="reference"
                    :default-source="defaultSource(field, defaults)"
                    :field="field"
                    :value="displayValue(sub.root, field)"
                    :options="optionsFor(field)"
                    :placeholder="displayPlaceholder(sub.root, field)"
                    :defaulted="!fieldIsSet(sub.root, field) && defaultFor(sub.root, field) !== undefined"
                    :can-reset="fieldIsSet(sub.root, field)"
                    @update:value="setFieldValue(sub.root, field, $event)"
                    @reset="setFieldValue(sub.root, field, undefined)"
                  />
                </div>
              </div>
              <RuleAdvanced
                v-if="!subsectionCollapsed(entry.group.key, sub.subsection)"
                :modules="(sub.subsection.subsections ?? []).filter((child) => child.module)"
              >
                <template #default="{ field }">
                  <FieldInput
                    :reference="reference"
                    :default-source="defaultSource(field, defaults)"
                    :field="field"
                    :value="displayValue(sub.root, field)"
                    :options="optionsFor(field)"
                    :placeholder="displayPlaceholder(sub.root, field)"
                    :defaulted="!fieldIsSet(sub.root, field) && defaultFor(sub.root, field) !== undefined"
                    :can-reset="fieldIsSet(sub.root, field)"
                    @update:value="setFieldValue(sub.root, field, $event)"
                    @reset="setFieldValue(sub.root, field, undefined)"
                  />
                </template>
              </RuleAdvanced>
            </div>
          </template>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue"
import { api, type AppSettings, type ReferenceData } from "../api"
import { DEFAULTS_SCHEMA, type FieldGroup, type FieldSubsection, type SchemaField } from "@schema/form-schema"
import { getPath, setPath, deletePath, pruneEmpty, stableStringify } from "../path"
import FieldInput from "./FieldInput.vue"
import NumberField from "./NumberField.vue"

const settings = ref<AppSettings>({ filterPath: "", soundsFolder: "", tts: { locale: "en-US", speed: 1.6 } })
const saving = ref(false)
const exporting = ref(false)

const generating = ref(false)
const syncing = ref(false)
const soundProgress = ref("")

const userDefaults = ref<Record<string, unknown>>({})
const baseDefaults = ref<Record<string, unknown>>({})
const reference = ref<ReferenceData | null>(null)

const baseStyles = ref<Record<string, unknown>>({})
const userStyles = ref<Record<string, Record<string, unknown>>>({})

const DEFAULT_SIZE = 45
const MIN_STYLE_SIZE = 20
const DEFAULT_OPACITY = 245 / 255

async function load() {
  const [s, d, st, refData] = await Promise.all([api.getSettings(), api.getDefaults(), api.getStyles(), api.reference()])
  settings.value = { filterPath: s.filterPath ?? "", soundsFolder: s.soundsFolder ?? "", tts: s.tts }
  userDefaults.value = (d.userDefaults ?? {}) as Record<string, unknown>
  baseDefaults.value = (d.baseDefaults ?? {}) as Record<string, unknown>
  baseStyles.value = (st.baseStyles ?? {}) as Record<string, unknown>
  userStyles.value = (st.userStyles ?? {}) as Record<string, Record<string, unknown>>
  reference.value = refData as ReferenceData
  savedSnapshot.value = snapshot()
  lastSnapshot = savedSnapshot.value
  undoStack.value = []
  redoStack.value = []
}

onMounted(load)

const ttsLocales = computed(() => reference.value?.ttsLocales ?? [])
const ttsLocalesHint = computed(() => ttsLocales.value.join(", "))
const ttsSpeedMin = computed(() => reference.value?.ttsSpeed.min ?? 0.5)
const ttsSpeedMax = computed(() => reference.value?.ttsSpeed.max ?? 2.0)

function clampSpeed() {
  const speed = settings.value.tts.speed
  if (typeof speed !== "number" || Number.isNaN(speed)) {
    settings.value.tts.speed = ttsSpeedMin.value
    return
  }
  settings.value.tts.speed = Math.min(ttsSpeedMax.value, Math.max(ttsSpeedMin.value, speed))
}

async function onGenerateSounds() {
  generating.value = true
  soundProgress.value = ""
  try {
    await api.saveSettings(settings.value)
    await api.generateSounds((done, total, text) => {
      soundProgress.value = `Generating ${done}/${total}${text ? ` — ${text}` : ""}`
    })
    soundProgress.value = "Sounds generated and synced."
  } catch (e) {
    soundProgress.value = `Failed: ${(e as Error).message}`
  } finally {
    generating.value = false
  }
}

async function onSyncSounds() {
  syncing.value = true
  try {
    await api.saveSettings(settings.value)
    const { removed } = await api.syncSounds()
    soundProgress.value = removed > 0 ? `Synced (removed ${removed} stale file${removed === 1 ? "" : "s"}).` : "Sounds synced."
  } catch (e) {
    soundProgress.value = `Failed: ${(e as Error).message}`
  } finally {
    syncing.value = false
  }
}

type Feedback = { message: string; kind: "notice" | "error" }

async function saveAll(): Promise<Feedback> {
  saving.value = true
  try {
    await Promise.all([api.saveSettings(settings.value), api.saveDefaults(userDefaults.value), api.saveStyles(userStyles.value)])
    savedSnapshot.value = snapshot()
    return { message: "Saved", kind: "notice" }
  } catch (e) {
    return { message: (e as Error).message, kind: "error" }
  } finally {
    saving.value = false
  }
}

async function saveAllAndExport(): Promise<Feedback> {
  const saveResult = await saveAll()
  if (saveResult.kind === "error") return saveResult
  exporting.value = true
  try {
    const result = await api.exportAllFilters()
    if (result.total === 0) {
      return { message: "No filters to export", kind: "notice" }
    } else if (result.errors.length > 0) {
      return { message: `Exported ${result.exported}/${result.total} filters (${result.errors.length} failed)`, kind: "error" }
    }
    return { message: `Exported ${result.exported} filter${result.exported === 1 ? "" : "s"}`, kind: "notice" }
  } catch (e) {
    return { message: (e as Error).message, kind: "error" }
  } finally {
    exporting.value = false
  }
}

const RECORD_COALESCE_MS = 500
const MAX_HISTORY = 200

const savedSnapshot = ref("")
const undoStack = ref<string[]>([])
const redoStack = ref<string[]>([])
let lastSnapshot = ""
let lastRecordTime = 0

const canUndo = computed(() => undoStack.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)

function snapshot(): string {
  return stableStringify(pruneEmpty({ settings: settings.value, userDefaults: userDefaults.value, userStyles: userStyles.value }))
}

const dirty = computed(() => snapshot() !== savedSnapshot.value)

function recordChange() {
  const current = snapshot()
  if (current === lastSnapshot) return
  const now = Date.now()
  if (now - lastRecordTime >= RECORD_COALESCE_MS) {
    undoStack.value.push(lastSnapshot)
    if (undoStack.value.length > MAX_HISTORY) undoStack.value.shift()
    redoStack.value = []
  }
  lastSnapshot = current
  lastRecordTime = now
}

watch([settings, userDefaults, userStyles], recordChange, { deep: true })

function restore(snapshotJson: string) {
  lastSnapshot = snapshotJson
  const parsed = JSON.parse(snapshotJson) as {
    settings: AppSettings
    userDefaults: Record<string, unknown>
    userStyles: Record<string, Record<string, unknown>>
  }
  settings.value = parsed.settings
  userDefaults.value = parsed.userDefaults
  userStyles.value = parsed.userStyles
}

function undo() {
  if (!canUndo.value) return
  redoStack.value.push(snapshot())
  restore(undoStack.value.pop()!)
}

function redo() {
  if (!canRedo.value) return
  undoStack.value.push(snapshot())
  restore(redoStack.value.pop()!)
}

function discard() {
  if (!dirty.value) return
  undoStack.value.push(snapshot())
  redoStack.value = []
  restore(savedSnapshot.value)
}

defineExpose({
  dirty,
  canUndo,
  canRedo,
  saving,
  exporting,
  undo,
  redo,
  discard,
  reload: load,
  save: saveAll,
  saveAndExport: saveAllAndExport,
})

function defaultsValue(field: SchemaField): unknown {
  const value = getPath(userDefaults.value, field.path)
  return value === undefined ? getPath(baseDefaults.value, field.path) : value
}

function setDefaultsValue(field: SchemaField, value: unknown) {
  const base = getPath(baseDefaults.value, field.path)
  const isBase = value === undefined || (base !== undefined && stableStringify(value) === stableStringify(base))
  if (isBase) deletePath(userDefaults.value, field.path)
  else setPath(userDefaults.value, field.path, value)
}

function defaultsOptions(field: SchemaField): string[] {
  if (field.options && field.options.length > 0) return field.options
  switch (field.path) {
    case "preferredArmour":
      return reference.value?.armourTypes ?? []
    case "jewellery.amulets":
      return reference.value?.amulets ?? []
    case "tinctures.baseTypes":
      return reference.value?.baseTypesByClass["Tinctures"] ?? []
    default:
      return []
  }
}

function defaultsPathValue(path: string): unknown {
  const value = getPath(userDefaults.value, path)
  return value === undefined ? getPath(baseDefaults.value, path) : value
}

function isDefaultsVisible(field: SchemaField): boolean {
  if (!field.visibleWhen) return true
  const { path, equals, notEquals, defaultValue } = field.visibleWhen
  const value = defaultsPathValue(path)
  const resolved = value === undefined ? defaultValue : value
  if (equals !== undefined && resolved !== equals) return false
  if (notEquals !== undefined && resolved === notEquals) return false
  return true
}

function visibleDefaultsFields(fields: SchemaField[]): SchemaField[] {
  return fields.filter(isDefaultsVisible)
}

type DefaultsSubsectionEntry = { key: string; subsection: FieldSubsection; depth: number; hasSiblingAbove: boolean }

function defaultsSubsectionEntries(group: FieldGroup): DefaultsSubsectionEntry[] {
  const entries: DefaultsSubsectionEntry[] = []
  const walk = (subsections: FieldSubsection[], depth: number) => {
    subsections.forEach((subsection, index) => {
      entries.push({ key: `${depth}-${subsection.key}`, subsection, depth, hasSiblingAbove: index > 0 })
      walk(subsection.subsections ?? [], depth + 1)
    })
  }
  walk(group.subsections ?? [], 0)
  return entries
}

function effectiveStyle(key: string): Record<string, unknown> {
  return { ...((baseStyles.value[key] as Record<string, unknown>) ?? {}), ...(userStyles.value[key] ?? {}) }
}

function styleColor(style: Record<string, unknown>, prop: string): string {
  const value = style[prop]
  return typeof value === "string" ? value : "#000000"
}

function setStyleProp(key: string, prop: string, value: unknown) {
  const entry = { ...(userStyles.value[key] ?? {}) }
  if (value === "" || value === undefined || value === null) delete entry[prop]
  else entry[prop] = value
  if (Object.keys(entry).length === 0) delete userStyles.value[key]
  else userStyles.value[key] = entry
}

function resetStyle(key: string) {
  delete userStyles.value[key]
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!match) return null
  const value = Number.parseInt(match[1], 16)
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}

function swatchFrom(style: Record<string, unknown>): Record<string, string> {
  const rawSize = typeof style.size === "number" ? style.size : DEFAULT_SIZE
  const size = Math.max(MIN_STYLE_SIZE, rawSize)
  const opacity = typeof style.backgroundOpacity === "number" ? style.backgroundOpacity : DEFAULT_OPACITY
  const background = typeof style.background === "string" ? style.background : null
  const rgb = background ? hexToRgb(background) : null
  const fontSize = Math.round(size * 0.42)
  return {
    color: typeof style.text === "string" ? style.text : "#000000",
    backgroundColor: rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})` : "transparent",
    borderColor: typeof style.border === "string" ? style.border : "transparent",
    fontSize: `${fontSize}px`,
    height: `${Math.max(28, fontSize + 18)}px`,
  }
}

function swatchStyle(key: string): Record<string, string> {
  return swatchFrom(effectiveStyle(key))
}

const STYLE_SECTIONS: { title: string; keys: string[] }[] = [
  { title: "Currency", keys: ["currencyA", "currencyB", "currencyC", "gold", "goldHighStack"] },
  {
    title: "Links",
    keys: [
      "twoLink",
      "goodTwoLink",
      "selectedTwoLink",
      "threeLink",
      "goodThreeLink",
      "selectedThreeLink",
      "fourLink",
      "goodFourLink",
      "selectedFourLink",
      "sixSocket",
    ],
  },
  { title: "Shields", keys: ["earlyShieldLink", "earlyShieldBase"] },
  { title: "Flasks & Tinctures", keys: ["lifeFlask", "manaFlask", "utilityFlask", "tincture"] },
  { title: "Jewellery", keys: ["jewellery", "magicJewellery", "rareJewellery", "rareArmour", "chromatic"] },
  {
    title: "Highlights",
    keys: ["highlightedEquipment", "highlightedEquipmentRare", "highlightedEquipmentMagic", "highlightedEquipmentNormal"],
  },
]

const styleSections = computed(() => {
  const used = new Set(STYLE_SECTIONS.flatMap((section) => section.keys))
  const other = Object.keys(baseStyles.value).filter((key) => !used.has(key))
  return [...STYLE_SECTIONS, { title: "Other", keys: other }]
})

const collapsed = ref<Record<string, boolean>>({})

const STYLE_GRID_TEMPLATE = "minmax(7rem, 1fr) 2.75rem 2.75rem 2.75rem 3.5rem 4rem 5rem minmax(10rem, 2fr)"

function toggleSection(title: string) {
  collapsed.value[title] = !collapsed.value[title]
}

const defaultsCollapsed = ref<Record<string, boolean>>({})

function isDefaultsCollapsed(key: string): boolean {
  return !!defaultsCollapsed.value[key]
}

function toggleDefaultsGroup(key: string) {
  defaultsCollapsed.value = { ...defaultsCollapsed.value, [key]: !defaultsCollapsed.value[key] }
}

function collapseAllDefaults() {
  const next: Record<string, boolean> = { ...defaultsCollapsed.value }
  for (const group of DEFAULTS_SCHEMA) next[group.key] = true
  defaultsCollapsed.value = next
}

function expandAllDefaults() {
  defaultsCollapsed.value = {}
}

const settingsCollapsed = ref(false)

function toggleSettings() {
  settingsCollapsed.value = !settingsCollapsed.value
}

function collapseAllStyles() {
  const next: Record<string, boolean> = { ...collapsed.value }
  for (const section of styleSections.value) next[section.title] = true
  collapsed.value = next
}

function expandAllStyles() {
  collapsed.value = {}
}

type StyleSnapshot = { name: string; style: Record<string, unknown> }

const clipboard = ref<StyleSnapshot | null>(null)
const clipboardOpen = ref(false)

const SAVED_STYLES_KEY = "filtertool.savedStyles"

function loadSavedStyles(): StyleSnapshot[] {
  try {
    const raw = localStorage.getItem(SAVED_STYLES_KEY)
    const parsed = raw ? (JSON.parse(raw) as StyleSnapshot[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const savedStyles = ref<StyleSnapshot[]>(loadSavedStyles())

function persistSavedStyles() {
  try {
    localStorage.setItem(SAVED_STYLES_KEY, JSON.stringify(savedStyles.value))
  } catch {
    /* ignore */
  }
}

function copyStyle(key: string) {
  clipboard.value = { name: key, style: { ...effectiveStyle(key) } }
  clipboardOpen.value = true
}

function pasteStyle(key: string) {
  if (!clipboard.value) return
  userStyles.value[key] = { ...clipboard.value.style }
}

function saveClipboard() {
  if (!clipboard.value) return
  if (!savedStyles.value.some((entry) => entry.name === clipboard.value!.name)) {
    savedStyles.value.push({ ...clipboard.value })
    persistSavedStyles()
  }
}

function useSaved(name: string) {
  const saved = savedStyles.value.find((entry) => entry.name === name)
  if (saved) clipboard.value = { ...saved }
}

function removeSaved(name: string) {
  savedStyles.value = savedStyles.value.filter((entry) => entry.name !== name)
  persistSavedStyles()
}
</script>

<template>
  <div class="space-y-6">
    <section class="rounded border border-neutral-800 bg-neutral-900/40">
      <button
        type="button"
        @click="toggleSettings"
        class="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-neutral-900/40"
      >
        <span class="text-lg font-semibold uppercase tracking-wide text-neutral-200">Settings</span>
        <span class="text-neutral-400">{{ settingsCollapsed ? "▸" : "▾" }}</span>
      </button>
      <div v-show="!settingsCollapsed" class="px-4 pb-4">
        <div class="space-y-3">
          <div>
            <label class="block text-xs text-neutral-400" title="Where exported .filter files and sounds are written"
              >PoE Filter Path</label
            >
            <input
              v-model="settings.filterPath"
              class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
              placeholder="/path/to/Path of Exile"
            />
          </div>
          <div>
            <label class="block text-xs text-neutral-400" title="Folder name for the synced sound pack">Sounds Folder Name</label>
            <input
              v-model="settings.soundsFolder"
              class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
              placeholder="poeft-sounds-v2"
            />
          </div>
        </div>

        <div class="mt-4 border-t border-neutral-800/60 pt-3">
          <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Sounds</h3>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                class="block text-xs text-neutral-400"
                :title="`Language locale for generated TTS sounds. Available: ${ttsLocalesHint}`"
                >TTS Locale</label
              >
              <input
                v-model="settings.tts.locale"
                list="tts-locales"
                class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
              />
              <datalist id="tts-locales">
                <option v-for="locale in ttsLocales" :key="locale" :value="locale"></option>
              </datalist>
            </div>
            <div>
              <label
                class="block text-xs text-neutral-400"
                :title="`Playback speed multiplier for TTS. Clamped to ${ttsSpeedMin}–${ttsSpeedMax} (ffmpeg atempo range).`"
                >TTS Speed</label
              >
              <input
                v-model.number="settings.tts.speed"
                type="number"
                :min="ttsSpeedMin"
                :max="ttsSpeedMax"
                step="0.1"
                @blur="clampSpeed"
                class="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <p class="mt-2 text-xs text-neutral-500">Regenerate or sync the TTS sound pack. Generation uses your current TTS settings.</p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              @click="onGenerateSounds"
              :disabled="generating || syncing"
              class="rounded bg-blue-700 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ generating ? "Generating…" : "Generate sounds" }}
            </button>
            <button
              type="button"
              @click="onSyncSounds"
              :disabled="generating || syncing"
              class="rounded bg-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ syncing ? "Syncing…" : "Sync sounds" }}
            </button>
          </div>
          <p v-if="soundProgress" class="mt-2 text-xs text-neutral-400">{{ soundProgress }}</p>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <section class="rounded border border-neutral-800 bg-neutral-900/40">
        <div class="flex items-center justify-between gap-2 px-4 py-3">
          <h2 class="text-lg font-semibold uppercase tracking-wide text-neutral-200">Defaults</h2>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="collapseAllDefaults"
              class="rounded border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800"
            >
              Collapse all
            </button>
            <button
              type="button"
              @click="expandAllDefaults"
              class="rounded border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800"
            >
              Expand all
            </button>
          </div>
        </div>
        <div class="px-4 pb-4">
          <p class="mb-2 text-xs text-neutral-500">Used when a filter leaves a field unset.</p>

          <div v-for="group in DEFAULTS_SCHEMA" :key="group.key" class="mb-4">
            <button
              type="button"
              @click="toggleDefaultsGroup(group.key)"
              class="mb-1 flex w-full items-center justify-between gap-2 text-left hover:bg-neutral-900/40"
            >
              <span class="text-sm font-semibold uppercase tracking-wide text-neutral-400">{{ group.title }}</span>
              <span class="text-sm text-neutral-500">{{ isDefaultsCollapsed(group.key) ? "▸" : "▾" }}</span>
            </button>
            <div v-show="!isDefaultsCollapsed(group.key)">
              <div v-if="group.fields.length > 0" class="grid grid-cols-1 gap-3">
                <div v-for="field in visibleDefaultsFields(group.fields)" :key="field.path">
                  <FieldInput
                    :field="field"
                    :value="defaultsValue(field)"
                    :options="defaultsOptions(field)"
                    @update:value="setDefaultsValue(field, $event)"
                  />
                </div>
              </div>
              <div
                v-for="sub in defaultsSubsectionEntries(group)"
                :key="sub.key"
                :class="sub.hasSiblingAbove ? 'mt-4 border-t border-neutral-800/60 pt-3' : 'mt-3'"
              >
                <h5 class="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">{{ sub.subsection.title }}</h5>
                <div class="grid grid-cols-1 gap-3">
                  <div v-for="field in visibleDefaultsFields(sub.subsection.fields)" :key="field.path">
                    <FieldInput
                      :field="field"
                      :value="defaultsValue(field)"
                      :options="defaultsOptions(field)"
                      @update:value="setDefaultsValue(field, $event)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded border border-neutral-800 bg-neutral-900/40">
        <div class="flex items-center justify-between gap-2 px-4 py-3">
          <h2 class="text-lg font-semibold uppercase tracking-wide text-neutral-200">Styles</h2>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="collapseAllStyles"
              class="rounded border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800"
            >
              Collapse all
            </button>
            <button
              type="button"
              @click="expandAllStyles"
              class="rounded border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-800"
            >
              Expand all
            </button>
          </div>
        </div>
        <div class="px-4 pb-4">
          <p class="mb-2 text-xs text-neutral-500">Colors, sizes and opacity for the built-in style names.</p>

          <div v-for="section in styleSections" :key="section.title" class="mb-3 rounded border border-neutral-800">
            <button
              type="button"
              @click="toggleSection(section.title)"
              class="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold uppercase tracking-wide text-neutral-400 hover:bg-neutral-900/40"
            >
              <span>{{ section.title }}</span>
              <span>{{ collapsed[section.title] ? "▸" : "▾" }}</span>
            </button>

            <div v-if="!collapsed[section.title]" class="border-t border-neutral-800 px-3 py-2">
              <div
                class="mb-1 hidden items-center gap-3 text-[10px] uppercase text-neutral-600 md:grid"
                :style="{ gridTemplateColumns: STYLE_GRID_TEMPLATE }"
              >
                <span></span><span>Text</span><span>Bg</span><span>Border</span><span title="20–45">Size</span
                ><span title="1 = fully opaque, 0 = transparent">Opacity</span><span></span><span class="text-right">Preview</span>
              </div>

              <div v-for="key in section.keys" :key="key" class="py-2">
                <div class="hidden items-center gap-3 md:grid" :style="{ gridTemplateColumns: STYLE_GRID_TEMPLATE }">
                  <span class="min-w-0 truncate text-xs text-neutral-300" :title="key">{{ key }}</span>
                  <input
                    type="color"
                    :value="styleColor(effectiveStyle(key), 'text')"
                    @input="setStyleProp(key, 'text', ($event.target as HTMLInputElement).value)"
                    class="h-7 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
                  />
                  <input
                    type="color"
                    :value="styleColor(effectiveStyle(key), 'background')"
                    @input="setStyleProp(key, 'background', ($event.target as HTMLInputElement).value)"
                    class="h-7 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
                  />
                  <input
                    type="color"
                    :value="styleColor(effectiveStyle(key), 'border')"
                    @input="setStyleProp(key, 'border', ($event.target as HTMLInputElement).value)"
                    class="h-7 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
                  />
                  <NumberField
                    :model-value="(effectiveStyle(key).size as number) ?? DEFAULT_SIZE"
                    integer
                    :min="20"
                    :max="45"
                    @update:model-value="setStyleProp(key, 'size', $event)"
                  />
                  <NumberField
                    :model-value="(effectiveStyle(key).backgroundOpacity as number) ?? DEFAULT_OPACITY"
                    :step="0.05"
                    :min="0"
                    :max="1"
                    :decimals="2"
                    @update:model-value="setStyleProp(key, 'backgroundOpacity', $event)"
                  />
                  <div class="flex items-center gap-0.5">
                    <button
                      type="button"
                      @click="copyStyle(key)"
                      class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white"
                      title="Copy style"
                    >
                      <svg
                        class="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      :disabled="!clipboard"
                      @click="pasteStyle(key)"
                      class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      title="Paste style"
                    >
                      <svg
                        class="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1"></rect>
                      </svg>
                    </button>
                    <button
                      type="button"
                      :disabled="!userStyles[key]"
                      @click="resetStyle(key)"
                      class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      title="Reset style"
                    >
                      <svg
                        class="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                      </svg>
                    </button>
                  </div>
                  <div
                    class="flex w-full items-center justify-center justify-self-end overflow-hidden rounded border px-1 text-center"
                    :style="{ ...swatchStyle(key), borderWidth: '1px', borderStyle: 'solid' }"
                  >
                    <span class="truncate">{{ key }}</span>
                  </div>
                </div>

                <div class="rounded border border-neutral-800 p-2 md:hidden">
                  <div class="mb-2 flex items-center justify-between gap-2">
                    <span class="truncate text-sm font-medium text-neutral-200">{{ key }}</span>
                    <div class="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        @click="copyStyle(key)"
                        class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white"
                        title="Copy style"
                      >
                        <svg
                          class="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                      <button
                        type="button"
                        :disabled="!clipboard"
                        @click="pasteStyle(key)"
                        class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        title="Paste style"
                      >
                        <svg
                          class="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                          <rect x="8" y="2" width="8" height="4" rx="1"></rect>
                        </svg>
                      </button>
                      <button
                        type="button"
                        :disabled="!userStyles[key]"
                        @click="resetStyle(key)"
                        class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        title="Reset style"
                      >
                        <svg
                          class="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="1 4 1 10 7 10"></polyline>
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <label class="flex flex-col gap-1">
                      <span class="text-[10px] uppercase text-neutral-500">Text</span>
                      <input
                        type="color"
                        :value="styleColor(effectiveStyle(key), 'text')"
                        @input="setStyleProp(key, 'text', ($event.target as HTMLInputElement).value)"
                        class="h-8 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
                      />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-[10px] uppercase text-neutral-500">Bg</span>
                      <input
                        type="color"
                        :value="styleColor(effectiveStyle(key), 'background')"
                        @input="setStyleProp(key, 'background', ($event.target as HTMLInputElement).value)"
                        class="h-8 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
                      />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-[10px] uppercase text-neutral-500">Border</span>
                      <input
                        type="color"
                        :value="styleColor(effectiveStyle(key), 'border')"
                        @input="setStyleProp(key, 'border', ($event.target as HTMLInputElement).value)"
                        class="h-8 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
                      />
                    </label>
                  </div>
                  <div class="mt-2 grid grid-cols-2 gap-2">
                    <label class="flex flex-col gap-1">
                      <span class="text-[10px] uppercase text-neutral-500">Size</span>
                      <NumberField
                        :model-value="(effectiveStyle(key).size as number) ?? DEFAULT_SIZE"
                        integer
                        :min="20"
                        :max="45"
                        @update:model-value="setStyleProp(key, 'size', $event)"
                      />
                    </label>
                    <label class="flex flex-col gap-1">
                      <span class="text-[10px] uppercase text-neutral-500">Opacity</span>
                      <NumberField
                        :model-value="(effectiveStyle(key).backgroundOpacity as number) ?? DEFAULT_OPACITY"
                        :step="0.05"
                        :min="0"
                        :max="1"
                        :decimals="2"
                        @update:model-value="setStyleProp(key, 'backgroundOpacity', $event)"
                      />
                    </label>
                  </div>
                  <div
                    class="mt-2 flex items-center justify-center overflow-hidden rounded border"
                    :style="{ ...swatchStyle(key), borderWidth: '1px', borderStyle: 'solid' }"
                  >
                    <span class="truncate text-xs">{{ key }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-if="clipboardOpen" class="fixed bottom-4 right-4 z-50 w-80 rounded border border-neutral-700 bg-neutral-900 p-4 shadow-lg">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-sm font-semibold text-neutral-200">Clipboard</span>
        <button type="button" @click="clipboardOpen = false" class="text-neutral-400 hover:text-white">✕</button>
      </div>
      <template v-if="clipboard">
        <div
          class="flex min-w-0 items-center justify-center overflow-hidden rounded border px-1"
          :style="{ ...swatchFrom(clipboard.style), borderWidth: '1px', borderStyle: 'solid' }"
        >
          <span class="truncate">{{ clipboard.name }}</span>
        </div>
        <div class="mt-3 flex items-center gap-2">
          <button type="button" @click="saveClipboard" class="rounded bg-neutral-800 px-2.5 py-1 text-xs hover:bg-neutral-700">Save</button>
          <span class="text-xs text-neutral-500">Paste via the paste icon on any style.</span>
        </div>
      </template>
      <p v-else class="text-xs text-neutral-500">Nothing copied yet.</p>

      <div v-if="savedStyles.length > 0" class="mt-4">
        <div class="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Saved styles</div>
        <div v-for="saved in savedStyles" :key="saved.name" class="flex items-center gap-1 py-0.5">
          <button
            type="button"
            @click="useSaved(saved.name)"
            class="min-w-0 flex-1 truncate text-left text-xs text-neutral-300 hover:text-white"
            :title="`Use ${saved.name}`"
          >
            {{ saved.name }}
          </button>
          <button type="button" @click="removeSaved(saved.name)" class="text-neutral-500 hover:text-red-400" title="Remove saved style">
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { api, type AppSettings, type FilterConfig, type FilterInfo, type ReferenceData } from "./api"
import { EMPTY_FILTER_CONFIG } from "@schema/form-schema"
import { pruneEmpty, stableStringify } from "./path"
import Sidebar from "./components/Sidebar.vue"
import ConfigForm from "./components/ConfigForm.vue"
import PreviewPane from "./components/PreviewPane.vue"
import GlobalSettings from "./components/GlobalSettings.vue"

const filters = ref<FilterInfo[]>([])
const selected = ref<string | null>(null)
const config = ref<FilterConfig>(clone(EMPTY_FILTER_CONFIG))
const savedConfig = ref<FilterConfig>(clone(EMPTY_FILTER_CONFIG))
const reference = ref<ReferenceData | null>(null)
const defaults = ref<Record<string, unknown>>({})
const preview = ref("")
const previewOpen = ref(false)
const previewSection = ref<string | null>(null)
const view = ref<"filter" | "global">("filter")
const sidebarOpen = ref(false)
type FlashKind = "notice" | "create" | "duplicate" | "rename" | "delete" | "save" | "export" | "error"

const FLASH_META: Record<FlashKind, { icon: string; tone: string }> = {
  notice: { icon: "ℹ", tone: "border-green-800 bg-green-950/90 text-green-300" },
  create: { icon: "+", tone: "border-green-800 bg-green-950/90 text-green-300" },
  duplicate: { icon: "⧉", tone: "border-green-800 bg-green-950/90 text-green-300" },
  rename: { icon: "✎", tone: "border-green-800 bg-green-950/90 text-green-300" },
  delete: { icon: "✕", tone: "border-amber-800 bg-amber-950/90 text-amber-300" },
  save: { icon: "✓", tone: "border-green-800 bg-green-950/90 text-green-300" },
  export: { icon: "↑", tone: "border-green-800 bg-green-950/90 text-green-300" },
  error: { icon: "⚠", tone: "border-red-800 bg-red-950/90 text-red-300" },
}

const toast = ref<{ message: string; kind: FlashKind } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | undefined

const exporting = ref(false)
const exportingAll = ref(false)

const settings = ref<AppSettings | null>(null)
const showQuickstart = ref(false)
const quickstartPath = ref("")

const adding = ref(false)
const renaming = ref<string | null>(null)

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function flash(message: string, kind: FlashKind = "notice") {
  toast.value = { message, kind }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 4000)
}

const dirty = computed(() => stableStringify(pruneEmpty(config.value)) !== stableStringify(pruneEmpty(savedConfig.value)))

const undoStack = ref<string[]>([])
const redoStack = ref<string[]>([])
let lastSnapshot = JSON.stringify(config.value)
let lastRecordTime = 0
const RECORD_COALESCE_MS = 500
const MAX_HISTORY = 200

const canUndo = computed(() => undoStack.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)

function snapshot(): string {
  return JSON.stringify(config.value)
}

function resetHistory() {
  undoStack.value = []
  redoStack.value = []
  lastSnapshot = snapshot()
  lastRecordTime = 0
}

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

watch(config, recordChange, { deep: true })

function restore(snapshotJson: string) {
  lastSnapshot = snapshotJson
  config.value = JSON.parse(snapshotJson)
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

function discardChanges() {
  if (!dirty.value) return
  undoStack.value.push(snapshot())
  redoStack.value = []
  restore(JSON.stringify(savedConfig.value))
}

async function refreshFilters(selectName?: string) {
  const { filters: list } = await api.listFilters()
  filters.value = list
  if (selectName && list.some((f) => f.name === selectName)) {
    selected.value = selectName
  } else if (!selected.value || !list.some((f) => f.name === selected.value)) {
    selected.value = list[0]?.name ?? null
  }
}

async function loadConfig() {
  if (!selected.value) {
    config.value = clone(EMPTY_FILTER_CONFIG)
    savedConfig.value = clone(EMPTY_FILTER_CONFIG)
    preview.value = ""
    resetHistory()
    return
  }
  config.value = await api.getConfig(selected.value)
  savedConfig.value = clone(config.value)
  resetHistory()
  void refreshPreview()
}

watch(selected, () => void loadConfig())

async function refreshPreview() {
  if (!selected.value) {
    preview.value = ""
    return
  }
  try {
    const { output } = await api.preview(selected.value, config.value)
    preview.value = output
  } catch {
    /* preview is best-effort */
  }
}

let debounce: ReturnType<typeof setTimeout> | undefined
watch(
  config,
  () => {
    clearTimeout(debounce)
    debounce = setTimeout(() => void refreshPreview(), 400)
  },
  { deep: true },
)

async function saveOnly() {
  if (!selected.value) return
  await api.saveConfig(selected.value, config.value)
  savedConfig.value = clone(config.value)
}

async function onSave() {
  if (!selected.value) return
  try {
    await saveOnly()
    flash("Saved", "save")
  } catch (e) {
    flash((e as Error).message, "error")
  }
}

const globalRef = ref<InstanceType<typeof GlobalSettings> | null>(null)

const globalDirty = computed(() => globalRef.value?.dirty ?? false)
const globalCanUndo = computed(() => globalRef.value?.canUndo ?? false)
const globalCanRedo = computed(() => globalRef.value?.canRedo ?? false)
const globalSaving = computed(() => globalRef.value?.saving ?? false)
const globalExporting = computed(() => globalRef.value?.exporting ?? false)

async function onGlobalSave() {
  const result = await globalRef.value?.save()
  if (result) flash(result.message, result.kind)
  await refreshDefaults()
}

async function onGlobalExport() {
  const result = await globalRef.value?.saveAndExport()
  if (result) flash(result.message, result.kind)
  await refreshDefaults()
}

async function refreshDefaults() {
  try {
    const defaultsData = await api.getDefaults()
    defaults.value = (defaultsData.defaults ?? {}) as Record<string, unknown>
  } catch {
    /* best-effort */
  }
}

async function onSaveAndExport() {
  if (!selected.value) return
  exporting.value = true
  try {
    await api.saveConfig(selected.value, config.value)
    savedConfig.value = clone(config.value)
    const result = await api.exportFilter(selected.value, config.value)
    flash(`Exported ${result.fileName} to ${result.filterPath}`, "export")
  } catch (e) {
    flash((e as Error).message, "error")
  } finally {
    exporting.value = false
  }
}

async function onExportAll() {
  exportingAll.value = true
  try {
    if (selected.value && dirty.value) {
      await api.saveConfig(selected.value, config.value)
      savedConfig.value = clone(config.value)
    }
    const result = await api.exportAllFilters()
    if (result.total === 0) {
      flash("No filters to export")
    } else if (result.errors.length > 0) {
      flash(`Exported ${result.exported}/${result.total} filters (${result.errors.length} failed)`, "error")
    } else {
      flash(`Exported ${result.exported} filter${result.exported === 1 ? "" : "s"}`, "export")
    }
  } catch (e) {
    flash((e as Error).message, "error")
  } finally {
    exportingAll.value = false
  }
}

function confirmExportAll() {
  showExportAll.value = false
  void onExportAll()
}

const showUnsaved = ref(false)
const showExportAll = ref(false)
const pendingSelect = ref<string | null>(null)
const pendingView = ref<"filter" | "global">("filter")

function tryNavigate(name: string | null, toView: "filter" | "global") {
  if (dirty.value) {
    pendingSelect.value = name
    pendingView.value = toView
    showUnsaved.value = true
  } else {
    applyNavigation(name, toView)
  }
}

function applyNavigation(name: string | null, toView: "filter" | "global") {
  selected.value = name
  view.value = toView
}

async function confirmUnsavedSave() {
  showUnsaved.value = false
  try {
    await saveOnly()
    applyNavigation(pendingSelect.value, pendingView.value)
  } catch (e) {
    flash((e as Error).message, "error")
  }
}

function confirmUnsavedDiscard() {
  showUnsaved.value = false
  applyNavigation(pendingSelect.value, pendingView.value)
}

function onSelect(name: string) {
  sidebarOpen.value = false
  if (name === selected.value && view.value === "filter") return
  tryNavigate(name, "filter")
}

function onGlobal() {
  sidebarOpen.value = false
  tryNavigate(null, "global")
}

function onHome() {
  sidebarOpen.value = false
  tryNavigate(null, "filter")
}

function createFromLanding() {
  sidebarOpen.value = true
  adding.value = true
}

async function confirmQuickstart() {
  const path = quickstartPath.value.trim()
  if (!path) return
  const next: AppSettings = {
    filterPath: path,
    soundsFolder: settings.value?.soundsFolder,
    tts: settings.value?.tts ?? { locale: "en-US", speed: 1.6 },
  }
  try {
    await api.saveSettings(next)
    settings.value = next
    showQuickstart.value = false
    await globalRef.value?.reload()
  } catch (e) {
    flash((e as Error).message, "error")
  }
}

function skipQuickstart() {
  showQuickstart.value = false
}

async function onCreate(name: string) {
  try {
    await api.createFilter(name.trim())
    await refreshFilters(name.trim())
    flash(`Created filter "${name}"`, "create")
  } catch (e) {
    flash((e as Error).message, "error")
  }
}

async function onDuplicate(name: string) {
  const newName = `${name} copy`
  try {
    await api.duplicateFilter(name, newName)
    await refreshFilters(newName)
    renaming.value = newName
    flash(`Duplicated "${name}"`, "duplicate")
  } catch (e) {
    flash((e as Error).message, "error")
  }
}

async function onRename(name: string, newName: string) {
  try {
    await api.renameFilter(name, newName.trim())
    await refreshFilters(newName.trim())
    flash(`Renamed to "${newName}"`, "rename")
  } catch (e) {
    flash((e as Error).message, "error")
  }
}

const deleteTarget = ref<string | null>(null)

function onDelete(name: string) {
  deleteTarget.value = name
}

async function confirmDelete(deleteGameFile: boolean) {
  const name = deleteTarget.value
  deleteTarget.value = null
  if (!name) return
  try {
    await api.deleteFilter(name, deleteGameFile)
    await refreshFilters()
    flash(`Deleted "${name}"`, "delete")
  } catch (e) {
    flash((e as Error).message, "error")
  }
}

const title = computed(() => (view.value === "global" ? "Global Settings" : (selected.value ?? "Home")))

void (async () => {
  try {
    const [refData, defaultsData, settingsData] = await Promise.all([api.reference(), api.getDefaults(), api.getSettings()])
    reference.value = refData
    defaults.value = (defaultsData.defaults ?? {}) as Record<string, unknown>
    settings.value = settingsData
    if (!settingsData.filterPath) {
      showQuickstart.value = true
      quickstartPath.value = ""
    }
    await refreshFilters()
    if (selected.value) await loadConfig()
  } catch (e) {
    flash((e as Error).message, "error")
  }
})()

window.addEventListener("beforeunload", (event) => {
  if (!dirty.value && !globalDirty.value) return
  event.preventDefault()
  event.returnValue = ""
})

window.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement | null
  const tag = target?.tagName?.toLowerCase()
  if (tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable) return
  const mod = event.ctrlKey || event.metaKey
  if (!mod || event.altKey) return
  const key = event.key.toLowerCase()

  if (view.value === "global") {
    if (key === "z") {
      event.preventDefault()
      if (event.shiftKey) globalRef.value?.redo()
      else globalRef.value?.undo()
    } else if (key === "y") {
      event.preventDefault()
      globalRef.value?.redo()
    } else if (key === "s") {
      event.preventDefault()
      if (event.shiftKey) void onGlobalExport()
      else void onGlobalSave()
    }
    return
  }

  if (!selected.value) return
  if (key === "z") {
    event.preventDefault()
    if (event.shiftKey) redo()
    else undo()
  } else if (key === "y") {
    event.preventDefault()
    redo()
  } else if (key === "s") {
    event.preventDefault()
    if (event.shiftKey) void onSaveAndExport()
    else void onSave()
  }
})
</script>

<template>
  <div class="flex h-full">
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 md:hidden">
      <div class="absolute inset-0 bg-black/60" @click="sidebarOpen = false"></div>
      <div class="absolute inset-y-0 left-0 flex w-64">
        <Sidebar
          :filters="filters"
          :selected="selected"
          :view="view"
          :exporting="exportingAll"
          :adding="adding"
          :renaming="renaming"
          @select="onSelect"
          @export-all="showExportAll = true"
          @create="onCreate"
          @start-add="adding = true"
          @cancel-add="adding = false"
          @start-rename="renaming = $event"
          @cancel-rename="renaming = null"
          @duplicate="onDuplicate"
          @rename="onRename"
          @delete="onDelete"
          @global="onGlobal"
          @home="onHome"
        />
      </div>
    </div>

    <div class="hidden shrink-0 md:flex">
      <Sidebar
        :filters="filters"
        :selected="selected"
        :view="view"
        :exporting="exportingAll"
        :adding="adding"
        :renaming="renaming"
        @select="onSelect"
        @export-all="showExportAll = true"
        @create="onCreate"
        @start-add="adding = true"
        @cancel-add="adding = false"
        @start-rename="renaming = $event"
        @cancel-rename="renaming = null"
        @duplicate="onDuplicate"
        @rename="onRename"
        @delete="onDelete"
        @global="onGlobal"
        @home="onHome"
      />
    </div>

    <main class="flex-1 flex flex-col min-w-0">
      <header class="flex h-14 items-center justify-between gap-2 border-b border-neutral-800 px-3 sm:px-6">
        <div class="flex min-w-0 items-center gap-2">
          <button
            type="button"
            @click="sidebarOpen = true"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral-700 text-neutral-300 md:hidden"
            title="Filters"
          >
            ☰
          </button>
          <span
            v-if="(view === 'filter' && dirty) || (view === 'global' && globalDirty)"
            class="h-2 w-2 shrink-0 rounded-full bg-amber-400"
            title="Unsaved changes"
          ></span>
          <h1 class="truncate text-lg font-semibold">{{ title }}</h1>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <template v-if="view === 'filter' && selected">
            <button
              type="button"
              @click="undo"
              :disabled="!canUndo"
              class="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 text-neutral-300 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <svg
                class="h-4 w-4"
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
            <button
              type="button"
              @click="redo"
              :disabled="!canRedo"
              class="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 text-neutral-300 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-30"
              title="Redo (Ctrl+Shift+Z)"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"></path>
              </svg>
            </button>
            <button
              @click="discardChanges"
              :disabled="!dirty"
              class="rounded px-3 py-1.5 text-sm text-red-300 hover:bg-red-900/40 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
              title="Discard unsaved changes"
            >
              Discard
            </button>
            <span class="h-6 w-px bg-neutral-700"></span>
            <button @click="onSave" class="rounded bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700" title="Save config (Ctrl+S)">
              Save
            </button>
            <button
              @click="onSaveAndExport"
              :disabled="exporting"
              class="rounded bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
              title="Save and export to Path of Exile (Ctrl+Shift+S)"
            >
              {{ exporting ? "Exporting…" : "Export" }}
            </button>
            <button
              @click="previewOpen = true"
              class="rounded bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700 md:hidden"
              title="Show output preview"
            >
              Preview
            </button>
          </template>
          <template v-else-if="view === 'global'">
            <button
              type="button"
              @click="globalRef?.undo()"
              :disabled="!globalCanUndo"
              class="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 text-neutral-300 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <svg
                class="h-4 w-4"
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
            <button
              type="button"
              @click="globalRef?.redo()"
              :disabled="!globalCanRedo"
              class="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 text-neutral-300 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-30"
              title="Redo (Ctrl+Shift+Z)"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"></path>
              </svg>
            </button>
            <button
              @click="globalRef?.discard()"
              :disabled="!globalDirty"
              class="rounded px-3 py-1.5 text-sm text-red-300 hover:bg-red-900/40 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
              title="Discard unsaved changes"
            >
              Discard
            </button>
            <span class="h-6 w-px bg-neutral-700"></span>
            <button
              @click="onGlobalSave"
              :disabled="globalSaving || globalExporting"
              class="rounded bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
              title="Save settings, defaults and styles (Ctrl+S)"
            >
              {{ globalSaving ? "Saving…" : "Save" }}
            </button>
            <button
              @click="onGlobalExport"
              :disabled="globalSaving || globalExporting"
              class="rounded bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
              title="Save settings and export all filters (Ctrl+Shift+S)"
            >
              {{ globalExporting ? "Exporting…" : "Export" }}
            </button>
          </template>
        </div>
      </header>

      <div
        v-if="toast"
        class="pointer-events-none fixed left-1/2 top-4 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded border px-3 py-2 text-sm shadow-lg"
        :class="FLASH_META[toast.kind].tone"
      >
        <span class="shrink-0 leading-none">{{ FLASH_META[toast.kind].icon }}</span>
        <span>{{ toast.message }}</span>
      </div>

      <div class="flex-1 overflow-auto p-4 sm:p-6">
        <GlobalSettings v-show="view === 'global'" ref="globalRef" />
        <div v-if="view !== 'global' && selected && reference" class="space-y-4">
          <ConfigForm
            :key="selected"
            v-model="config"
            :reference="reference"
            :defaults="defaults"
            @preview-section="previewSection = $event"
          />
        </div>
        <div v-else-if="view !== 'global' && !selected" class="flex h-full items-center justify-center">
          <div class="w-full max-w-md rounded border border-neutral-800 bg-neutral-900/40 p-10 text-center">
            <div class="flex flex-col items-stretch gap-3">
              <button
                type="button"
                @click="createFromLanding"
                class="rounded bg-blue-700 px-6 py-3 text-base font-semibold text-white hover:bg-blue-600"
              >
                Create Filter
              </button>
              <button
                type="button"
                @click="onGlobal"
                class="rounded bg-neutral-300 px-6 py-3 text-base font-medium text-black hover:bg-neutral-200"
              >
                Global Settings
              </button>
            </div>
          </div>
        </div>
        <p v-else-if="view !== 'global'" class="text-neutral-500">Loading…</p>
      </div>
    </main>

    <aside
      v-if="view === 'filter' && selected"
      class="hidden shrink-0 flex-col border-l border-neutral-800 bg-neutral-950 md:flex"
      :class="previewOpen ? 'w-96' : 'w-10'"
    >
      <PreviewPane :preview="preview" v-model:open="previewOpen" :section="previewSection" />
    </aside>

    <div v-if="view === 'filter' && selected && previewOpen" class="fixed inset-0 z-40 flex flex-col bg-neutral-950 md:hidden">
      <PreviewPane :preview="preview" v-model:open="previewOpen" :section="previewSection" />
    </div>

    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="deleteTarget = null">
      <div class="w-96 max-w-[calc(100vw-2rem)] rounded border border-neutral-700 bg-neutral-900 p-5">
        <h2 class="mb-4 text-lg font-semibold">Delete "{{ deleteTarget }}"</h2>
        <div class="flex flex-col gap-2">
          <button @click="confirmDelete(false)" class="rounded bg-neutral-700 px-3 py-2 text-sm hover:bg-neutral-600">
            Delete local filter only
          </button>
          <button @click="confirmDelete(true)" class="rounded bg-red-700 px-3 py-2 text-sm hover:bg-red-600">
            Delete local + exported .filter
          </button>
          <button @click="deleteTarget = null" class="rounded border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div v-if="showExportAll" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="showExportAll = false">
      <div class="w-96 max-w-[calc(100vw-2rem)] rounded border border-neutral-700 bg-neutral-900 p-5">
        <h2 class="mb-2 text-lg font-semibold">Export All Filters</h2>
        <p class="mb-4 text-sm text-neutral-400">Save and export all filters to Path of Exile?</p>
        <div class="flex flex-col gap-2">
          <button @click="confirmExportAll" class="rounded bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">
            Save &amp; Export
          </button>
          <button @click="showExportAll = false" class="rounded border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div v-if="showUnsaved" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="showUnsaved = false">
      <div class="w-96 max-w-[calc(100vw-2rem)] rounded border border-neutral-700 bg-neutral-900 p-5">
        <h2 class="mb-2 text-lg font-semibold">Unsaved changes</h2>
        <p class="mb-4 text-sm text-neutral-400">You have unsaved changes. Save them before leaving?</p>
        <div class="flex flex-col gap-2">
          <button @click="confirmUnsavedSave" class="rounded bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">
            Save
          </button>
          <button @click="confirmUnsavedDiscard" class="rounded bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-600">
            Discard
          </button>
          <button @click="showUnsaved = false" class="rounded border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div v-if="showQuickstart" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div class="w-full max-w-lg rounded border border-neutral-700 bg-neutral-900 p-5">
        <h2 class="mb-2 text-lg font-semibold">Welcome to filtertool</h2>
        <p class="mb-4 text-sm text-neutral-400">
          Almost ready. Tell filtertool where your Path of Exile filters and sounds live, then create your first filter.
        </p>
        <div class="mb-4">
          <label class="mb-1 block text-xs text-neutral-400" title="Where exported .filter files and sounds are written"
            >PoE Filter Path</label
          >
          <input
            v-model="quickstartPath"
            class="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm"
            placeholder="/path/to/Path of Exile"
            @keydown.enter.prevent="confirmQuickstart"
          />
          <p class="mt-1 text-xs text-neutral-500">On Windows this defaults to your Documents\My Games\Path of Exile folder.</p>
        </div>
        <div class="flex justify-end gap-2">
          <button @click="skipQuickstart" class="rounded border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800">
            Skip for now
          </button>
          <button
            @click="confirmQuickstart"
            :disabled="!quickstartPath.trim()"
            class="rounded bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save &amp; Continue
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

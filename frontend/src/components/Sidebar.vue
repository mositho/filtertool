<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import type { FilterInfo } from "../api"
import { isValidFilterName } from "@schema/filter-name"

const props = defineProps<{
  filters: FilterInfo[]
  selected: string | null
  view: "filter" | "global"
  exporting: boolean
  adding: boolean
  renaming: string | null
}>()

const emit = defineEmits<{
  "select": [name: string]
  "create": [name: string]
  "start-add": []
  "cancel-add": []
  "start-rename": [name: string]
  "cancel-rename": []
  "duplicate": [name: string]
  "rename": [name: string, newName: string]
  "delete": [name: string]
  "global": []
  "home": []
  "exportAll": []
}>()

const NAME_ERROR = "Only letters, numbers, spaces, underscores and hyphens are allowed."

const newName = ref("")
const addInput = ref<HTMLInputElement | null>(null)
const addError = ref("")

const renameValue = ref("")
const renameInput = ref<HTMLInputElement | null>(null)
const renameError = ref("")

function setRenameInput(el: unknown) {
  renameInput.value = (el as HTMLInputElement) ?? null
}

watch(
  () => props.adding,
  async (isAdding) => {
    if (!isAdding) return
    newName.value = ""
    addError.value = ""
    await nextTick()
    addInput.value?.focus()
  },
)

function confirmAdd() {
  const name = newName.value.trim()
  if (!name) {
    emit("cancel-add")
    return
  }
  if (!isValidFilterName(name)) {
    addError.value = NAME_ERROR
    return
  }
  addError.value = ""
  newName.value = ""
  emit("create", name)
  emit("cancel-add")
}

watch(
  () => props.renaming,
  async (name) => {
    if (!name) return
    renameValue.value = name
    renameError.value = ""
    await nextTick()
    renameInput.value?.focus()
  },
)

function confirmRename() {
  const name = renameValue.value.trim()
  const oldName = props.renaming
  if (!oldName || !name || name === oldName) {
    emit("cancel-rename")
    return
  }
  if (!isValidFilterName(name)) {
    renameError.value = NAME_ERROR
    return
  }
  renameError.value = ""
  renameValue.value = ""
  emit("rename", oldName, name)
  emit("cancel-rename")
}
</script>

<template>
  <aside class="flex w-64 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950">
    <div class="flex h-14 items-center justify-between px-4 border-b border-neutral-800">
      <button type="button" @click="emit('home')" class="font-semibold hover:text-neutral-300" title="Show welcome screen">Filters</button>
      <button
        v-if="!adding"
        @click="emit('start-add')"
        class="rounded bg-blue-700 hover:bg-blue-600 w-7 h-7 text-sm leading-none"
        title="New filter"
      >
        +
      </button>
      <button
        v-else
        @mousedown.prevent="emit('cancel-add')"
        class="rounded bg-neutral-700 hover:bg-neutral-600 w-7 h-7 text-sm leading-none"
        title="Cancel"
      >
        ✕
      </button>
    </div>

    <button
      @click="emit('global')"
      class="flex items-center justify-center border-b border-neutral-800 bg-neutral-300 px-4 py-1.5 text-sm font-medium text-black hover:bg-neutral-200"
    >
      Global Settings
    </button>

    <nav class="flex-1 overflow-y-auto py-2">
      <button
        v-for="filter in filters"
        :key="filter.name"
        @click="emit('select', filter.name)"
        class="group flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-neutral-900"
        :class="view === 'filter' && selected === filter.name ? 'bg-neutral-900 text-white' : 'text-neutral-300'"
      >
        <input
          v-if="renaming === filter.name"
          :ref="setRenameInput"
          v-model="renameValue"
          @click.stop
          @keydown.enter.prevent="confirmRename"
          @keydown.esc="emit('cancel-rename')"
          @blur="confirmRename"
          class="w-full rounded border bg-neutral-900 px-1 py-0.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          :class="renameError ? 'border-red-500' : 'border-neutral-700'"
          :title="renameError || undefined"
        />
        <span v-else class="truncate" @dblclick.stop="emit('start-rename', filter.name)">{{ filter.name }}</span>
        <span v-if="renaming !== filter.name" class="hidden group-hover:flex gap-1">
          <button title="Duplicate" @click.stop="emit('duplicate', filter.name)" class="px-1 text-neutral-400 hover:text-white">⧉</button>
          <button title="Rename" @click.stop="emit('start-rename', filter.name)" class="px-1 text-neutral-400 hover:text-white">✎</button>
          <button title="Delete" @click.stop="emit('delete', filter.name)" class="px-1 text-neutral-400 hover:text-red-400">✕</button>
        </span>
      </button>
      <p v-if="filters.length === 0" class="px-4 py-2 text-sm text-neutral-500">No filters yet.</p>
      <div v-if="adding" class="px-4 py-2">
        <input
          ref="addInput"
          v-model="newName"
          @keydown.enter.prevent="confirmAdd"
          @keydown.esc="emit('cancel-add')"
          @blur="confirmAdd"
          placeholder="Filter name"
          class="w-full rounded border bg-neutral-900 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
          :class="addError ? 'border-red-500' : 'border-neutral-700'"
        />
        <p v-if="addError" class="mt-1 text-xs text-red-400">{{ addError }}</p>
      </div>
    </nav>

    <button
      @click="emit('exportAll')"
      :disabled="exporting"
      class="flex items-center justify-center gap-2 border-t border-neutral-800 bg-green-700 px-4 py-3 text-sm font-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span>{{ exporting ? "Exporting…" : "Export All" }}</span>
      <svg
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 19V5"></path>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
    </button>
  </aside>
</template>

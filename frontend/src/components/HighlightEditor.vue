<script setup lang="ts">
import { nextTick, ref } from "vue"
import type { ReferenceData } from "../api"
import { emptyHighlight } from "@schema/form-schema"
import HighlightCard from "./HighlightCard.vue"

const props = defineProps<{ highlights: Record<string, unknown>[]; reference: ReferenceData }>()
const emit = defineEmits<{ "update:highlights": [value: Record<string, unknown>[]]; "change": [] }>()

function add() {
  emit("update:highlights", [...props.highlights, emptyHighlight()])
}

function remove(index: number) {
  emit(
    "update:highlights",
    props.highlights.filter((_, i) => i !== index),
  )
}

function duplicate(index: number) {
  const copy = JSON.parse(JSON.stringify(props.highlights[index])) as Record<string, unknown>
  const copyName = `${title(props.highlights[index], index)} copy`
  copy.name = copyName
  const next = [...props.highlights]
  next.splice(index + 1, 0, copy)
  emit("update:highlights", next)
  void startRename(index + 1, copyName)
}

function title(highlight: Record<string, unknown>, index: number): string {
  const name = highlight.name
  return typeof name === "string" && name.trim() ? name : `Highlight ${index + 1}`
}

const renaming = ref<number | null>(null)
const renameValue = ref("")
const renameInput = ref<HTMLInputElement | null>(null)

function setRenameInput(el: unknown) {
  renameInput.value = (el as HTMLInputElement) ?? null
}

async function startRename(index: number, initialName?: string) {
  renaming.value = index
  renameValue.value = initialName ?? title(props.highlights[index], index)
  await nextTick()
  renameInput.value?.focus()
}

function cancelRename() {
  renaming.value = null
  renameValue.value = ""
}

function confirmRename(index: number) {
  if (renaming.value !== index) return
  const name = renameValue.value.trim()
  renaming.value = null
  renameValue.value = ""
  const next = props.highlights.map((highlight, i) => (i === index ? { ...highlight, name: name || undefined } : highlight))
  emit("update:highlights", next)
}
</script>

<template>
  <div class="space-y-3">
    <div v-for="(highlight, index) in highlights" :key="index" class="rounded border border-neutral-800 bg-neutral-900/40 p-3">
      <div class="mb-2 flex items-center gap-2">
        <button
          type="button"
          @click="remove(index)"
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-neutral-800 text-sm leading-none text-neutral-300 hover:bg-red-700 hover:text-white"
          :title="`Remove highlight ${index + 1}`"
        >
          −
        </button>
        <input
          v-if="renaming === index"
          :ref="setRenameInput"
          v-model="renameValue"
          @keydown.enter.prevent="confirmRename(index)"
          @keydown.esc="cancelRename"
          @blur="confirmRename(index)"
          class="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-sm font-medium text-neutral-200 focus:border-blue-500 focus:outline-none"
        />
        <span v-else class="text-sm font-medium text-neutral-300" @dblclick="startRename(index)">{{ title(highlight, index) }}</span>
        <span class="ml-auto flex items-center gap-1">
          <button
            type="button"
            @click="duplicate(index)"
            class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white"
            title="Duplicate highlight"
          >
            ⧉
          </button>
          <button
            type="button"
            @click="startRename(index)"
            class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white"
            title="Rename highlight"
          >
            ✎
          </button>
        </span>
      </div>
      <HighlightCard :highlight="highlight" :reference="reference" @change="emit('change')" />
    </div>
    <button type="button" @click="add" class="rounded bg-blue-700 px-3 py-1.5 text-sm hover:bg-blue-600">+ Add highlight</button>
  </div>
</template>

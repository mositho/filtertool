<script setup lang="ts">
import { nextTick, ref } from "vue"
import { emptyWeaponHighlight } from "@schema/form-schema"
import type { ReferenceData } from "../api"
import HighlightCard from "./HighlightCard.vue"
import NumberField from "./NumberField.vue"
import { areaLevelRangeError } from "@schema/range-validation"
import { copyEntity, entityClipboard, pasteEntity } from "../entityClipboard"

type Phase = Record<string, unknown> & { minAreaLevel?: number; maxAreaLevel?: number }
const props = defineProps<{ phases: Phase[]; reference: ReferenceData }>()
const emit = defineEmits<{ "update:phases": [value: Phase[]]; "change": [] }>()
const openPhase = ref<number | null>(null)
const renaming = ref<number | null>(null)
const renameValue = ref("")
const renameInput = ref<HTMLInputElement | null>(null)

function setRenameInput(el: unknown) {
  renameInput.value = (el as HTMLInputElement) ?? null
}

function title(phase: Phase, index: number): string {
  return typeof phase.name === "string" && phase.name.trim() ? phase.name : `Phase ${index + 1}`
}

function describe(phase: Phase): string {
  const classes = (phase.itemClasses as string[] | undefined) ?? []
  const bases = (phase.baseTypes as string[] | undefined) ?? []
  const targets = [...classes, ...bases]
  return `${targets.length ? targets.join(", ") : "Select weapons"} · Area Level ${phase.minAreaLevel ?? 0}–${phase.maxAreaLevel ?? "∞"}`
}

function updateAreaLevel(index: number, key: "minAreaLevel" | "maxAreaLevel", value: number | undefined) {
  const next = props.phases.map((phase) => ({ ...phase }))
  if (value === undefined) delete next[index][key]
  else next[index][key] = value
  emit("update:phases", next)
}

function addPhase() {
  emit("update:phases", [...props.phases, emptyWeaponHighlight()])
  openPhase.value = props.phases.length
}

function removePhase(index: number) {
  emit(
    "update:phases",
    props.phases.filter((_, i) => i !== index),
  )
  openPhase.value = null
}

async function startRename(index: number, initialName?: string) {
  renaming.value = index
  renameValue.value = initialName ?? title(props.phases[index], index)
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
  cancelRename()
  emit(
    "update:phases",
    props.phases.map((phase, i) => (i === index ? { ...phase, name: name || undefined } : phase)),
  )
}

function duplicatePhase(index: number) {
  const copy = JSON.parse(JSON.stringify(props.phases[index])) as Phase
  const copyName = `${title(props.phases[index], index)} copy`
  copy.name = copyName
  const next = [...props.phases]
  next.splice(index + 1, 0, copy)
  emit("update:phases", next)
  openPhase.value = index + 1
  void startRename(index + 1, copyName)
}

function copyPhase(index: number) {
  copyEntity("weapon phase", props.phases[index])
}

function pastePhase() {
  const value = pasteEntity("weapon phase")
  if (!value) return
  const next = [...props.phases, value as Phase]
  emit("update:phases", next)
  openPhase.value = next.length - 1
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex gap-2">
      <button type="button" class="rounded bg-blue-700 px-3 py-1.5 text-sm hover:bg-blue-600" @click="addPhase">+ Add weapon phase</button>
      <button
        type="button"
        class="rounded border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="entityClipboard?.kind !== 'weapon phase'"
        @click="pastePhase"
      >
        Paste
      </button>
    </div>
    <div v-for="(phase, index) in phases" :key="index" class="rounded border border-neutral-800 bg-neutral-950/60 p-3">
      <div class="disclosure-header -m-3 flex items-center gap-2 rounded p-3" @click.self="openPhase = openPhase === index ? null : index">
        <button
          type="button"
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-neutral-800 text-sm text-neutral-300 hover:bg-red-700 hover:text-white"
          :aria-label="`Remove phase ${index + 1}`"
          @click="removePhase(index)"
        >
          −
        </button>
        <input
          v-if="renaming === index"
          :ref="setRenameInput"
          v-model="renameValue"
          :aria-label="`Rename phase ${index + 1}`"
          class="min-w-0 flex-1 rounded border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-sm focus:border-blue-500 focus:outline-none"
          @keydown.enter.prevent="confirmRename(index)"
          @keydown.esc="cancelRename"
          @blur="confirmRename(index)"
        />
        <button
          v-else
          type="button"
          class="min-w-0 flex-1 rounded px-2 py-1 text-left text-sm text-neutral-200 hover:text-white"
          :aria-expanded="openPhase === index"
          @click="openPhase = openPhase === index ? null : index"
        >
          <span class="font-semibold">{{ openPhase === index ? "▾" : "▸" }} {{ title(phase, index) }}</span>
          <span class="ml-2 text-neutral-400">{{ describe(phase) }}</span>
        </button>
        <span class="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            class="rounded px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-700 hover:text-white"
            :aria-label="`Copy phase ${index + 1} to paste into this or another filter`"
            title="Copy this phase to paste into this or another filter"
            @click="copyPhase(index)"
          >
            Copy
          </button>
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white"
            :aria-label="`Duplicate phase ${index + 1}`"
            @click="duplicatePhase(index)"
          >
            ⧉
          </button>
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white"
            :aria-label="`Rename phase ${index + 1}`"
            @click="startRename(index)"
          >
            ✎
          </button>
        </span>
      </div>
      <div v-if="openPhase === index" class="mt-3 space-y-3">
        <div class="grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs text-neutral-400">Min Area Level</label>
            <NumberField
              :model-value="phase.minAreaLevel"
              :min="0"
              :invalid="!!areaLevelRangeError(phase)"
              integer
              placeholder="No min area level"
              @update:model-value="updateAreaLevel(index, 'minAreaLevel', $event)"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs text-neutral-400">Max Area Level</label>
            <NumberField
              :model-value="phase.maxAreaLevel"
              :min="0"
              :invalid="!!areaLevelRangeError(phase)"
              integer
              placeholder="No max area level"
              @update:model-value="updateAreaLevel(index, 'maxAreaLevel', $event)"
            />
          </div>
        </div>
        <p v-if="areaLevelRangeError(phase)" role="alert" class="text-xs text-red-400">{{ areaLevelRangeError(phase) }}</p>
        <HighlightCard :highlight="phase" :reference="reference" phase-mode @change="emit('change')" />
      </div>
    </div>
  </div>
</template>

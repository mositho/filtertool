<script setup lang="ts">
import { ref } from "vue"
import { emptyWeaponHighlight } from "@schema/form-schema"
import type { ReferenceData } from "../api"
import HighlightCard from "./HighlightCard.vue"
import NumberField from "./NumberField.vue"

type Phase = Record<string, unknown> & { minAreaLevel?: number; maxAreaLevel?: number }
const props = defineProps<{ phases: Phase[]; reference: ReferenceData }>()
const emit = defineEmits<{ "update:phases": [value: Phase[]]; "change": [] }>()
const openPhase = ref<number | null>(null)

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
</script>

<template>
  <div class="space-y-2">
    <div v-for="(phase, index) in phases" :key="index" class="rounded border border-neutral-800 bg-neutral-950/60 p-3">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="min-w-0 flex-1 text-left text-sm text-neutral-200 hover:text-white"
          :aria-expanded="openPhase === index"
          @click="openPhase = openPhase === index ? null : index"
        >
          <span class="font-semibold">{{ openPhase === index ? "▾" : "▸" }} Phase {{ index + 1 }}</span>
          <span class="ml-2 text-neutral-400">{{ describe(phase) }}</span>
        </button>
        <button
          type="button"
          class="text-xs text-neutral-400 hover:text-red-400"
          :aria-label="`Remove phase ${index + 1}`"
          @click="removePhase(index)"
        >
          Remove
        </button>
      </div>
      <div v-if="openPhase === index" class="mt-3 space-y-3">
        <div class="grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs text-neutral-400">Min Area Level</label>
            <NumberField
              :model-value="phase.minAreaLevel"
              :min="0"
              :max="phase.maxAreaLevel"
              integer
              placeholder="No min area level"
              @update:model-value="updateAreaLevel(index, 'minAreaLevel', $event)"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs text-neutral-400">Max Area Level</label>
            <NumberField
              :model-value="phase.maxAreaLevel"
              :min="phase.minAreaLevel ?? 0"
              integer
              placeholder="No max area level"
              @update:model-value="updateAreaLevel(index, 'maxAreaLevel', $event)"
            />
          </div>
        </div>
        <HighlightCard :highlight="phase" :reference="reference" phase-mode @change="emit('change')" />
      </div>
    </div>
    <button
      type="button"
      class="rounded bg-blue-700 px-3 py-1.5 text-sm hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
      @click="addPhase"
    >
      + Add weapon phase
    </button>
  </div>
</template>

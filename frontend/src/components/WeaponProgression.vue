<script setup lang="ts">
import { ref } from "vue"
import { emptyWeaponHighlight } from "@schema/form-schema"
import type { ReferenceData } from "../api"
import HighlightCard from "./HighlightCard.vue"
import NumberField from "./NumberField.vue"

type Phase = Record<string, unknown> & { untilAreaLevel?: number }
const props = defineProps<{ phases: Phase[]; reference: ReferenceData }>()
const emit = defineEmits<{ "update:phases": [value: Phase[]]; "change": [] }>()
const openPhase = ref<number | null>(null)

function start(index: number): number {
  return index === 0 ? 0 : (props.phases[index - 1].untilAreaLevel ?? 0) + 1
}

function latestEnd(index: number): number | undefined {
  const nextEnd = props.phases[index + 1]?.untilAreaLevel
  return nextEnd === undefined ? undefined : nextEnd - 1
}

function describe(phase: Phase, index: number): string {
  const classes = (phase.itemClasses as string[] | undefined) ?? []
  const bases = (phase.baseTypes as string[] | undefined) ?? []
  const targets = [...classes, ...bases]
  return `${targets.length ? targets.join(", ") : "Select weapons"} · area ${start(index)}–${phase.untilAreaLevel ?? "end"}`
}

function updateEnd(index: number, value: number | undefined) {
  if (value === undefined && index !== props.phases.length - 1) return
  const next = props.phases.map((phase) => ({ ...phase }))
  if (value === undefined) delete next[index].untilAreaLevel
  else next[index].untilAreaLevel = value
  emit("update:phases", next)
}

function addPhase() {
  if (props.phases.length && props.phases[props.phases.length - 1].untilAreaLevel === undefined) return
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
    <p class="text-xs text-neutral-500">
      Phases follow area level in order. Each weapon base stops at its drop level + 5 (adjustable under Advanced), or the phase end,
      whichever comes first. Ordinary item and link rules still apply afterward.
    </p>
    <div v-for="(phase, index) in phases" :key="index" class="rounded border border-neutral-800 bg-neutral-950/60 p-3">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="min-w-0 flex-1 text-left text-sm text-neutral-200 hover:text-white"
          :aria-expanded="openPhase === index"
          @click="openPhase = openPhase === index ? null : index"
        >
          <span class="font-semibold">{{ openPhase === index ? "▾" : "▸" }} Phase {{ index + 1 }}</span>
          <span class="ml-2 text-neutral-400">{{ describe(phase, index) }}</span>
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
        <div class="max-w-xs">
          <label class="mb-1 block text-xs text-neutral-400">End area level (blank for final phase)</label>
          <NumberField
            :model-value="phase.untilAreaLevel"
            :min="start(index)"
            :max="latestEnd(index)"
            integer
            placeholder="No end level"
            @update:model-value="updateEnd(index, $event)"
          />
        </div>
        <HighlightCard :highlight="phase" :reference="reference" weapons-only phase-mode @change="emit('change')" />
      </div>
    </div>
    <button
      type="button"
      class="rounded bg-blue-700 px-3 py-1.5 text-sm hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="phases.length > 0 && phases[phases.length - 1].untilAreaLevel === undefined"
      :title="
        phases.length > 0 && phases[phases.length - 1].untilAreaLevel === undefined
          ? 'Set an end level for the last phase first'
          : undefined
      "
      @click="addPhase"
    >
      + Add weapon phase
    </button>
    <p v-if="phases.length > 0 && phases[phases.length - 1].untilAreaLevel === undefined" class="text-xs text-neutral-500">
      This phase continues indefinitely. Set its end area level only if you want to add a following phase.
    </p>
  </div>
</template>

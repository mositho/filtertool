<script setup lang="ts">
import { computed } from "vue"
import type { ReferenceData } from "../api"
import { emptyGemCallout } from "@schema/form-schema"
import { getPath, setPath, deletePath } from "../path"
import { SOUND_FIELD_PATHS } from "@schema/form-schema"
import FieldLabel from "./FieldLabel.vue"
import MultiSelect from "./MultiSelect.vue"
import SoundSelector from "./SoundSelector.vue"
import IconPicker from "./IconPicker.vue"

const props = defineProps<{ callouts: Record<string, unknown>[]; reference: ReferenceData }>()
const emit = defineEmits<{ "update:callouts": [value: Record<string, unknown>[]]; "change": [] }>()

const gemOptions = computed(() => [...props.reference.skillGems, ...props.reference.supportGems])

function add() {
  emit("update:callouts", [...props.callouts, emptyGemCallout() as Record<string, unknown>])
}

function remove(index: number) {
  emit(
    "update:callouts",
    props.callouts.filter((_, i) => i !== index),
  )
}

function duplicate(index: number) {
  const copy = JSON.parse(JSON.stringify(props.callouts[index])) as Record<string, unknown>
  const next = [...props.callouts]
  next.splice(index + 1, 0, copy)
  emit("update:callouts", next)
}

function title(callout: Record<string, unknown>, index: number): string {
  const baseTypes = callout.baseTypes
  if (Array.isArray(baseTypes) && baseTypes.length > 0) return (baseTypes as string[]).join(", ")
  return `Callout ${index + 1}`
}

function onChange() {
  emit("change")
}

function fieldValue(callout: Record<string, unknown>, path: string): unknown {
  return getPath(callout, path)
}

function setField(callout: Record<string, unknown>, path: string, value: unknown) {
  if (value === undefined) deletePath(callout, path)
  else setPath(callout, path, value)
  onChange()
}

function applySound(callout: Record<string, unknown>, next: Record<string, unknown>) {
  for (const path of SOUND_FIELD_PATHS) deletePath(callout, path)
  for (const path of SOUND_FIELD_PATHS) {
    if (next[path] !== undefined) setPath(callout, path, next[path])
  }
  onChange()
}

function setIconShape(callout: Record<string, unknown>, shape: string) {
  if (shape === "") {
    deletePath(callout, "iconShape")
    deletePath(callout, "iconColor")
    deletePath(callout, "iconSize")
    onChange()
  } else {
    setField(callout, "iconShape", shape)
  }
}

function setIconColor(callout: Record<string, unknown>, color: string) {
  setField(callout, "iconColor", color)
}

function setIconSize(callout: Record<string, unknown>, size: number) {
  setField(callout, "iconSize", size)
}
</script>

<template>
  <div class="space-y-3">
    <div v-for="(callout, index) in callouts" :key="index" class="rounded border border-neutral-800 bg-neutral-900/40 p-3">
      <div class="mb-2 flex items-center gap-2">
        <button
          type="button"
          @click="remove(index)"
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-neutral-800 text-sm leading-none text-neutral-300 hover:bg-red-700 hover:text-white"
          :title="`Remove callout ${index + 1}`"
        >
          −
        </button>
        <span class="min-w-0 flex-1 truncate text-sm font-medium text-neutral-300">{{ title(callout, index) }}</span>
        <button
          type="button"
          @click="duplicate(index)"
          class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white"
          title="Duplicate callout"
        >
          ⧉
        </button>
      </div>

      <div class="space-y-3">
        <div class="space-y-1">
          <FieldLabel label="Gems" tooltip="Skill and support gems this callout matches." />
          <MultiSelect
            :model-value="(fieldValue(callout, 'baseTypes') as string[]) ?? []"
            :options="gemOptions"
            @update:model-value="setField(callout, 'baseTypes', $event)"
          />
        </div>

        <div>
          <IconPicker
            :shape="(fieldValue(callout, 'iconShape') as string) ?? ''"
            :color="(fieldValue(callout, 'iconColor') as string) ?? ''"
            :size="(fieldValue(callout, 'iconSize') as number) ?? 2"
            @update:shape="setIconShape(callout, $event)"
            @update:color="setIconColor(callout, $event)"
            @update:size="setIconSize(callout, $event)"
          />
        </div>

        <div>
          <SoundSelector :model-value="callout" :sounds="reference.sounds" @update:model-value="applySound(callout, $event)" />
        </div>
      </div>
    </div>
    <button type="button" @click="add" class="rounded bg-blue-700 px-3 py-1.5 text-sm hover:bg-blue-600">+ Add callout</button>
  </div>
</template>

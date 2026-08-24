<script setup lang="ts">
import { LINK_COLORS } from "@schema/form-schema"

const props = defineProps<{ modelValue: string[] }>()
const emit = defineEmits<{ "update:modelValue": [value: string[]] }>()

function toggle(value: string) {
  const current = props.modelValue ?? []
  const next = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]
  emit("update:modelValue", next)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      v-for="entry in LINK_COLORS"
      :key="entry.value"
      type="button"
      @click="toggle(entry.value)"
      class="flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold text-white transition-all"
      :class="
        (modelValue ?? []).includes(entry.value)
          ? 'scale-110 border-white ring-2 ring-white/60 drop-shadow'
          : 'border-neutral-700 hover:border-neutral-400'
      "
      :style="{ backgroundColor: entry.color }"
      :title="entry.value"
    >
      <span v-if="(modelValue ?? []).includes(entry.value)" class="drop-shadow">✓</span>
    </button>
  </div>
</template>

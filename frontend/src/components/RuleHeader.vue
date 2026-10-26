<script setup lang="ts">
import type { SchemaField } from "@schema/form-schema"

defineProps<{
  title: string
  expanded: boolean
  field?: SchemaField
  enabled?: unknown
  defaulted?: boolean
  heading?: boolean
}>()
const emit = defineEmits<{ toggle: []; change: [value: boolean]; reset: [] }>()
</script>

<template>
  <div class="mb-1 flex items-center rounded text-sm font-semibold text-neutral-400">
    <label
      v-if="field"
      class="flex shrink-0 cursor-pointer items-center pr-2 py-3"
      :data-field-path="field.path"
      :title="defaulted ? 'Rule enabled · using default' : 'Rule enabled'"
    >
      <input
        type="checkbox"
        class="h-4 w-4 cursor-pointer accent-blue-500"
        :checked="!!enabled"
        :aria-label="`${title} enabled`"
        @change="emit('change', ($event.target as HTMLInputElement).checked)"
      />
    </label>
    <button
      type="button"
      class="flex min-w-0 flex-1 items-center justify-between gap-3 py-3 text-left"
      :aria-expanded="expanded"
      @click="emit('toggle')"
    >
      <span :class="heading ? 'uppercase tracking-wide' : ''">{{ title }}</span>
      <span class="flex shrink-0 items-center gap-3">
        <span v-if="field && !enabled" class="text-xs font-normal text-neutral-500">Disabled</span>
        <span aria-hidden="true">{{ expanded ? "▾" : "▸" }}</span>
      </span>
    </button>
    <button
      v-if="field && !defaulted"
      type="button"
      class="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white"
      title="Use default"
      :aria-label="`${title}: Use default`"
      @click="emit('reset')"
    >
      ↺
    </button>
  </div>
</template>

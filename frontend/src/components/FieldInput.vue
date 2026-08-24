<script setup lang="ts">
import type { SchemaField } from "@schema/form-schema"
import FieldLabel from "./FieldLabel.vue"
import NumberField from "./NumberField.vue"
import Toggle from "./Toggle.vue"
import MultiSelect from "./MultiSelect.vue"
import SocketColorSelect from "./SocketColorSelect.vue"

defineProps<{
  field: SchemaField
  value: unknown
  options: string[]
  placeholder?: string
  defaulted?: boolean
  canReset?: boolean
}>()
const emit = defineEmits<{ "update:value": [value: unknown]; "reset": [] }>()
</script>

<template>
  <div v-if="field.control === 'boolean'" class="space-y-1">
    <div
      class="flex w-full cursor-pointer items-center justify-between gap-3 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 transition-colors hover:border-neutral-600"
      @click="emit('update:value', !value)"
    >
      <FieldLabel :label="field.label" :tooltip="field.tooltip" />
      <div class="flex items-center gap-2">
        <span v-if="defaulted" class="inline-flex h-5 items-center text-[10px] italic text-neutral-500">using default</span>
        <button
          v-if="canReset"
          type="button"
          @click.stop="emit('reset')"
          class="flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white"
          title="Use default"
        >
          <svg
            class="h-3 w-3"
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
        <Toggle :model-value="!!value" @update:model-value="emit('update:value', $event)" />
      </div>
    </div>
  </div>
  <div v-else class="space-y-1">
    <div class="flex items-center justify-between gap-2">
      <FieldLabel :label="field.label" :tooltip="field.tooltip" />
      <div class="flex h-5 shrink-0 items-center gap-1">
        <span v-if="defaulted" class="inline-flex h-5 items-center text-[10px] italic text-neutral-500">using default</span>
        <button
          v-if="canReset"
          type="button"
          @click="emit('reset')"
          class="flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white"
          title="Use default"
        >
          <svg
            class="h-3 w-3"
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
    <div>
      <MultiSelect
        v-if="field.control === 'multiselect'"
        :model-value="(value as string[]) ?? []"
        :options="options"
        @update:model-value="emit('update:value', $event)"
      />
      <NumberField
        v-else-if="field.control === 'number'"
        :model-value="value as number"
        :min="field.min"
        :max="field.max"
        :step="field.step"
        :integer="field.integer"
        :placeholder="placeholder ?? field.placeholder"
        @update:model-value="emit('update:value', $event)"
      />
      <select
        v-else-if="field.control === 'select'"
        :value="(value as string) ?? ''"
        @change="emit('update:value', ($event.target as HTMLSelectElement).value || undefined)"
        class="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
      >
        <option v-if="!field.noEmptyOption" value="">—</option>
        <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
      </select>
      <SocketColorSelect
        v-else-if="field.control === 'link-colors'"
        :model-value="(value as string[]) ?? []"
        @update:model-value="emit('update:value', $event)"
      />
    </div>
  </div>
</template>

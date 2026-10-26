<script setup lang="ts">
import type { SchemaField } from "@schema/form-schema"
import FieldLabel from "./FieldLabel.vue"
import NumberField from "./NumberField.vue"
import Toggle from "./Toggle.vue"
import MultiSelect from "./MultiSelect.vue"
import SocketColorSelect from "./SocketColorSelect.vue"
import StyleEditor from "./StyleEditor.vue"
import SoundSelector from "./SoundSelector.vue"
import IconPicker from "./IconPicker.vue"
import type { ReferenceData } from "../api"
import { computed } from "vue"

const props = defineProps<{
  field: SchemaField
  value: unknown
  options: string[]
  placeholder?: string
  defaulted?: boolean
  canReset?: boolean
  defaultSource?: string
  reference?: ReferenceData
}>()
const emit = defineEmits<{ "update:value": [value: unknown]; "reset": [] }>()
const defaultStyle = computed(() => {
  const style = (props.field.defaultValue ?? {}) as Record<string, unknown>
  return { ...(props.reference?.styles[String(style.preset)] ?? {}), ...style }
})

function updateIcon(key: string, value: unknown) {
  const icon = { ...((props.value ?? {}) as Record<string, unknown>), [key]: value }
  if (key !== "iconShape" && !icon.iconShape) icon.iconShape = "Circle"
  emit("update:value", { ...icon, enabled: key === "iconShape" ? value !== "" : true })
}
</script>

<template>
  <div class="min-w-0 space-y-1" :data-field-path="field.path">
    <div class="flex min-h-5 flex-wrap items-center justify-between gap-x-2 gap-y-1">
      <FieldLabel class="min-w-0" :label="field.label" :tooltip="field.tooltip" />
      <div class="flex min-w-0 flex-wrap items-center justify-end gap-1">
        <span v-if="defaulted" class="text-[10px] italic text-neutral-500"
          >using default<span v-if="defaultSource"> · {{ defaultSource }}</span></span
        >
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
    <div data-field-control>
      <div
        v-if="field.control === 'boolean'"
        class="flex h-[34px] w-full cursor-pointer items-center justify-between gap-3 rounded border border-neutral-700 bg-neutral-900 px-2 text-sm text-neutral-400 transition-colors hover:border-neutral-600"
        @click="emit('update:value', !value)"
      >
        <span>{{ value ? "On" : "Off" }}</span>
        <Toggle :aria-label="field.label" :model-value="!!value" @update:model-value="emit('update:value', $event)" />
      </div>
      <template v-else-if="field.control === 'style'">
        <StyleEditor
          :model-value="(value ?? {}) as Record<string, unknown>"
          :default-style="defaultStyle"
          :style-names="reference?.styleNames ?? []"
          :styles="reference?.styles ?? {}"
          @update:model-value="emit('update:value', $event)"
        />
      </template>
      <template v-else-if="field.control === 'rule-sound'">
        <SoundSelector
          :model-value="(value ?? {}) as Record<string, unknown>"
          :sounds="reference?.sounds ?? []"
          :default-label="(field.defaultValue as Record<string, unknown>)?.enabled ? 'Default per-slot callout' : undefined"
          @update:model-value="
            emit('update:value', {
              ...$event,
              enabled: $event.enabled === true || !!($event.tts || $event.soundId || $event.soundFileName),
            })
          "
        />
      </template>
      <IconPicker
        v-else-if="field.control === 'icon'"
        :shape="(value as Record<string, unknown>)?.enabled === false ? '' : String((value as Record<string, unknown>)?.iconShape ?? '')"
        :color="String((value as Record<string, unknown>)?.iconColor ?? 'Cyan')"
        :size="Number((value as Record<string, unknown>)?.iconSize ?? 2)"
        @update:shape="updateIcon('iconShape', $event)"
        @update:color="updateIcon('iconColor', $event)"
        @update:size="updateIcon('iconSize', $event)"
      />
      <MultiSelect
        v-else-if="field.control === 'multiselect'"
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

<script setup lang="ts">
import { computed } from "vue"
import NumberField from "./NumberField.vue"
import { styleClipboard } from "../styleClipboard"

const props = defineProps<{
  modelValue: Record<string, unknown>
  styleNames: string[]
  styles: Record<string, Record<string, unknown>>
}>()

const emit = defineEmits<{ "update:modelValue": [value: Record<string, unknown> | undefined] }>()

const DEFAULT_SIZE = 45
const MIN_STYLE_SIZE = 20
const DEFAULT_OPACITY = 245 / 255

const DEFAULT_TEXT = "#FFFFFF"
const DEFAULT_BACKGROUND = "#000000"
const DEFAULT_BORDER = "#FFFFFF"

const COLOR_DEFAULTS: Record<string, string> = {
  text: DEFAULT_TEXT,
  background: DEFAULT_BACKGROUND,
  border: DEFAULT_BORDER,
}

const OVERRIDE_KEYS = ["text", "background", "border", "size", "backgroundOpacity"] as const

const GRID_TEMPLATE = "minmax(7rem, 1fr) 2.75rem 2.75rem 2.75rem 3.5rem 4rem 5rem minmax(10rem, 2fr)"

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!match) return null
  const value = Number.parseInt(match[1], 16)
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}

const preset = computed(() => (typeof props.modelValue.preset === "string" ? props.modelValue.preset : ""))

function effectiveStyle(): Record<string, unknown> {
  const base = preset.value ? (props.styles[preset.value] ?? {}) : {}
  const merged: Record<string, unknown> = { ...base }
  for (const key of OVERRIDE_KEYS) {
    if (props.modelValue[key] !== undefined) merged[key] = props.modelValue[key]
  }
  return merged
}

const swatch = computed(() => {
  const style = effectiveStyle()
  const rawSize = typeof style.size === "number" ? style.size : DEFAULT_SIZE
  const size = Math.max(MIN_STYLE_SIZE, rawSize)
  const opacity = typeof style.backgroundOpacity === "number" ? style.backgroundOpacity : DEFAULT_OPACITY
  const background = typeof style.background === "string" ? style.background : DEFAULT_BACKGROUND
  const rgb = hexToRgb(background) ?? hexToRgb(DEFAULT_BACKGROUND)
  const fontSize = Math.round(size * 0.42)
  return {
    color: typeof style.text === "string" ? style.text : DEFAULT_TEXT,
    backgroundColor: rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${opacity})` : "transparent",
    borderColor: typeof style.border === "string" ? style.border : DEFAULT_BORDER,
    fontSize: `${fontSize}px`,
    height: `${Math.max(28, fontSize + 18)}px`,
  }
})

function colorValue(prop: string): string {
  const value = effectiveStyle()[prop]
  return typeof value === "string" ? value : (COLOR_DEFAULTS[prop] ?? "#000000")
}

function numberValue(prop: string, fallback: number): number {
  const value = effectiveStyle()[prop]
  return typeof value === "number" ? value : fallback
}

/** Selecting a preset applies it cleanly, discarding any inline edits. Empty means "Custom style". */
function setPreset(value: string) {
  emit("update:modelValue", value === "" ? undefined : { preset: value })
}

/** Editing a field detaches from any preset and turns the style into a full custom style. */
function editProp(prop: string, value: unknown) {
  const next: Record<string, unknown> = { ...effectiveStyle() }
  if (value === undefined || value === null || value === "") delete next[prop]
  else next[prop] = value
  emit("update:modelValue", next)
}

function resetStyle() {
  emit("update:modelValue", undefined)
}

function copyStyle() {
  styleClipboard.value = { name: preset.value || "Custom", style: effectiveStyle() }
}

function pasteStyle() {
  if (!styleClipboard.value) return
  emit("update:modelValue", { ...styleClipboard.value.style })
}
</script>

<template>
  <div class="space-y-2">
    <div class="hidden items-center gap-3 text-[10px] uppercase text-neutral-600 md:grid" :style="{ gridTemplateColumns: GRID_TEMPLATE }">
      <span>Preset</span><span>Text</span><span>Bg</span><span>Border</span><span title="20–45">Size</span
      ><span title="1 = fully opaque, 0 = transparent">Opacity</span><span></span><span class="text-right">Preview</span>
    </div>

    <div class="hidden items-center gap-3 md:grid" :style="{ gridTemplateColumns: GRID_TEMPLATE }">
      <select
        :value="preset"
        @change="setPreset(($event.target as HTMLSelectElement).value)"
        class="w-full min-w-0 rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
      >
        <option value="">Custom style</option>
        <option v-for="name in styleNames" :key="name" :value="name">{{ name }}</option>
      </select>
      <input
        type="color"
        :value="colorValue('text')"
        @input="editProp('text', ($event.target as HTMLInputElement).value)"
        class="h-7 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
      />
      <input
        type="color"
        :value="colorValue('background')"
        @input="editProp('background', ($event.target as HTMLInputElement).value)"
        class="h-7 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
      />
      <input
        type="color"
        :value="colorValue('border')"
        @input="editProp('border', ($event.target as HTMLInputElement).value)"
        class="h-7 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
      />
      <NumberField
        :model-value="numberValue('size', DEFAULT_SIZE)"
        integer
        :min="20"
        :max="45"
        @update:model-value="editProp('size', $event)"
      />
      <NumberField
        :model-value="numberValue('backgroundOpacity', DEFAULT_OPACITY)"
        :step="0.05"
        :min="0"
        :max="1"
        :decimals="2"
        @update:model-value="editProp('backgroundOpacity', $event)"
      />
      <div class="flex items-center gap-0.5">
        <button
          type="button"
          @click="copyStyle"
          class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white"
          title="Copy style"
        >
          <svg
            class="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button
          type="button"
          :disabled="!styleClipboard"
          @click="pasteStyle"
          class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          title="Paste style"
        >
          <svg
            class="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1"></rect>
          </svg>
        </button>
        <button
          type="button"
          :disabled="preset === '' && Object.keys(props.modelValue).length === 0"
          @click="resetStyle"
          class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          title="Reset style"
        >
          <svg
            class="h-3.5 w-3.5"
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
      <div
        class="flex w-full items-center justify-center justify-self-end overflow-hidden rounded border px-1 text-center"
        :style="{ ...swatch, borderWidth: '1px', borderStyle: 'solid' }"
      >
        <span class="truncate">{{ preset || "Custom" }}</span>
      </div>
    </div>

    <div class="rounded border border-neutral-800 p-2 md:hidden">
      <div class="mb-2 flex items-center justify-between gap-2">
        <select
          :value="preset"
          @change="setPreset(($event.target as HTMLSelectElement).value)"
          class="min-w-0 flex-1 rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
        >
          <option value="">Custom style</option>
          <option v-for="name in styleNames" :key="name" :value="name">{{ name }}</option>
        </select>
        <div class="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            @click="copyStyle"
            class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white"
            title="Copy style"
          >
            <svg
              class="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button
            type="button"
            :disabled="!styleClipboard"
            @click="pasteStyle"
            class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            title="Paste style"
          >
            <svg
              class="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1"></rect>
            </svg>
          </button>
          <button
            type="button"
            :disabled="preset === '' && Object.keys(props.modelValue).length === 0"
            @click="resetStyle"
            class="flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            title="Reset style"
          >
            <svg
              class="h-3.5 w-3.5"
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
      <div class="grid grid-cols-3 gap-2">
        <label class="flex flex-col gap-1">
          <span class="text-[10px] uppercase text-neutral-500">Text</span>
          <input
            type="color"
            :value="colorValue('text')"
            @input="editProp('text', ($event.target as HTMLInputElement).value)"
            class="h-8 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-[10px] uppercase text-neutral-500">Bg</span>
          <input
            type="color"
            :value="colorValue('background')"
            @input="editProp('background', ($event.target as HTMLInputElement).value)"
            class="h-8 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-[10px] uppercase text-neutral-500">Border</span>
          <input
            type="color"
            :value="colorValue('border')"
            @input="editProp('border', ($event.target as HTMLInputElement).value)"
            class="h-8 w-full cursor-pointer rounded border border-neutral-700 bg-transparent"
          />
        </label>
      </div>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <label class="flex flex-col gap-1">
          <span class="text-[10px] uppercase text-neutral-500">Size</span>
          <NumberField
            :model-value="numberValue('size', DEFAULT_SIZE)"
            integer
            :min="20"
            :max="45"
            @update:model-value="editProp('size', $event)"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-[10px] uppercase text-neutral-500">Opacity</span>
          <NumberField
            :model-value="numberValue('backgroundOpacity', DEFAULT_OPACITY)"
            :step="0.05"
            :min="0"
            :max="1"
            :decimals="2"
            @update:model-value="editProp('backgroundOpacity', $event)"
          />
        </label>
      </div>
      <div
        class="mt-2 flex items-center justify-center overflow-hidden rounded border"
        :style="{ ...swatch, borderWidth: '1px', borderStyle: 'solid' }"
      >
        <span class="truncate text-xs">{{ preset || "Custom" }}</span>
      </div>
    </div>
  </div>
</template>

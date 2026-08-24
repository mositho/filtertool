<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{
  modelValue?: number
  min?: number
  max?: number
  step?: number
  integer?: boolean
  placeholder?: string
  decimals?: number
}>()
const emit = defineEmits<{ "update:modelValue": [value: number | undefined] }>()

function format(value: number | undefined): string {
  if (value === undefined) return ""
  return props.decimals !== undefined ? value.toFixed(props.decimals) : String(value)
}

function sanitize(raw: string): string {
  if (props.integer) return raw.replace(/[^0-9]/g, "")
  const cleaned = raw.replace(/[^0-9.,]/g, "")
  const firstSep = cleaned.search(/[.,]/)
  if (firstSep === -1) return cleaned
  const intPart = cleaned.slice(0, firstSep)
  let fracPart = cleaned.slice(firstSep + 1).replace(/[.,]/g, "")
  if (props.decimals !== undefined) fracPart = fracPart.slice(0, props.decimals)
  return `${intPart}.${fracPart}`
}

function toNumber(raw: string): number | undefined {
  const normalized = raw.replace(",", ".")
  if (normalized === "" || normalized === ".") return undefined
  const value = Number(normalized)
  return Number.isNaN(value) ? undefined : value
}

const text = ref(format(props.modelValue))
const focused = ref(false)

watch(
  () => props.modelValue,
  (value) => {
    if (toNumber(text.value) !== value) text.value = format(value)
  },
)

function clamp(value: number): number {
  let result = value
  if (props.min !== undefined && result < props.min) result = props.min
  if (props.max !== undefined && result > props.max) result = props.max
  return result
}

function onInput(event: Event) {
  const el = event.target as HTMLInputElement
  const raw = sanitize(el.value)
  if (raw !== el.value) el.value = raw
  text.value = raw
  const value = toNumber(raw)
  emit("update:modelValue", value === undefined ? undefined : clamp(value))
}

function decimalsFor(step: number): number {
  const s = String(step)
  return s.includes(".") ? s.split(".")[1].length : 0
}

function stepBy(direction: number) {
  const step = props.step ?? (props.integer ? 1 : 0.05)
  const base = toNumber(text.value) ?? props.min ?? 0
  const decimals = props.decimals ?? decimalsFor(step)
  let next = Number((base + direction * step).toFixed(decimals))
  next = clamp(next)
  text.value = format(next)
  emit("update:modelValue", next)
}

function onWheel(event: WheelEvent) {
  if (!focused.value) return
  event.preventDefault()
  stepBy(event.deltaY < 0 ? 1 : -1)
}
</script>

<template>
  <div class="flex w-full items-stretch overflow-hidden rounded border border-neutral-700 bg-neutral-900 focus-within:border-neutral-500">
    <input
      type="text"
      inputmode="decimal"
      :value="text"
      :placeholder="placeholder ?? (integer ? 'e.g. 12' : 'e.g. 1.3')"
      @input="onInput"
      @wheel="onWheel"
      @focus="focused = true"
      @blur="focused = false"
      class="w-full min-w-0 bg-transparent px-2 py-1.5 text-sm outline-none"
    />
    <div class="flex flex-col border-l border-neutral-700">
      <button
        type="button"
        tabindex="-1"
        @click="stepBy(1)"
        class="flex flex-1 items-center justify-center px-1.5 text-[10px] leading-none text-neutral-400 hover:bg-neutral-700 hover:text-white"
        :title="`Increase by ${step ?? (integer ? 1 : 0.05)}`"
      >
        ▲
      </button>
      <button
        type="button"
        tabindex="-1"
        @click="stepBy(-1)"
        class="flex flex-1 items-center justify-center border-t border-neutral-700 px-1.5 text-[10px] leading-none text-neutral-400 hover:bg-neutral-700 hover:text-white"
        :title="`Decrease by ${step ?? (integer ? 1 : 0.05)}`"
      >
        ▼
      </button>
    </div>
  </div>
</template>

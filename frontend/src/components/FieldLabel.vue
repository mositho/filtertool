<script setup lang="ts">
import { ref } from "vue"

defineProps<{ label: string; tooltip?: string }>()

const tipPos = ref<{ left: number; top: number } | null>(null)
const TIP_WIDTH = 288
const EDGE = 8

function show(event: MouseEvent | FocusEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  let left = rect.left + rect.width / 2
  const minLeft = EDGE + TIP_WIDTH / 2
  const maxLeft = window.innerWidth - EDGE - TIP_WIDTH / 2
  if (maxLeft >= minLeft) left = Math.min(Math.max(left, minLeft), maxLeft)
  tipPos.value = { left, top: rect.top - EDGE }
}

function hide() {
  tipPos.value = null
}
</script>

<template>
  <label class="flex items-center gap-1 text-xs text-neutral-400">
    <span>{{ label }}</span>
    <span v-if="tooltip" class="relative inline-flex" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide">
      <span
        class="inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-neutral-600 text-[9px] leading-none text-neutral-400"
        >?</span
      >
      <span
        v-if="tipPos"
        class="pointer-events-none fixed z-[999] w-72 -translate-x-1/2 -translate-y-full whitespace-pre-line rounded border border-neutral-700 bg-neutral-900 p-2 text-left text-[11px] font-normal normal-case leading-relaxed tracking-normal text-neutral-300 shadow-lg"
        :style="{ left: `${tipPos.left}px`, top: `${tipPos.top}px` }"
        >{{ tooltip }}</span
      >
    </span>
  </label>
</template>

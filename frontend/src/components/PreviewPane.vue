<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"

const props = defineProps<{ preview: string; open: boolean; section?: string | null }>()
const emit = defineEmits<{ "update:open": [value: boolean] }>()

const scroller = ref<HTMLElement | null>(null)

const lines = computed(() => props.preview.split("\n"))

function headingOf(line: string): string | undefined {
  const match = /^###\s+(.+)$/.exec(line)
  return match ? match[1] : undefined
}

function scrollToSection(section: string | null | undefined) {
  if (!section || !scroller.value) return
  const el = scroller.value.querySelector<HTMLElement>(`[data-heading="${CSS.escape(section)}"]`)
  el?.scrollIntoView({ block: "start", behavior: "smooth" })
}

watch(
  () => props.section,
  (section) => {
    if (props.open) void nextTick(() => scrollToSection(section))
  },
)

watch(
  () => props.open,
  (open) => {
    if (open) void nextTick(() => scrollToSection(props.section))
  },
)
</script>

<template>
  <div v-if="!open" class="flex min-h-0 flex-1 flex-col items-center justify-between py-3">
    <span class="select-none text-xs text-neutral-500" style="writing-mode: vertical-rl">Output Preview</span>
    <button
      type="button"
      @click="emit('update:open', true)"
      class="flex h-7 w-7 items-center justify-center rounded border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white"
      title="Extend output preview"
    >
      ◀
    </button>
  </div>
  <div v-else class="flex min-h-0 flex-1 flex-col">
    <div class="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
      <span class="text-sm font-medium">Output Preview</span>
      <button
        type="button"
        @click="emit('update:open', false)"
        class="text-sm text-neutral-400 hover:text-white"
        title="Collapse output preview"
      >
        ▸
      </button>
    </div>
    <div ref="scroller" class="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-neutral-300">
      <div
        v-for="(line, index) in lines"
        :key="index"
        class="whitespace-pre"
        :data-heading="headingOf(line)"
        :class="headingOf(line) === section ? 'rounded bg-neutral-800' : ''"
        v-text="line === '' ? '\u00A0' : line"
      ></div>
    </div>
  </div>
</template>

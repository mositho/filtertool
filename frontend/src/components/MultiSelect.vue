<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"

const props = defineProps<{ modelValue: string[]; options: string[] }>()
const emit = defineEmits<{ "update:modelValue": [value: string[]] }>()

const query = ref("")
const open = ref(false)
const root = ref<HTMLElement | null>(null)

function onDocumentClick(event: MouseEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener("mousedown", onDocumentClick))
onBeforeUnmount(() => document.removeEventListener("mousedown", onDocumentClick))

const selected = computed(() => props.modelValue ?? [])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const opts = props.options.filter((o) => !selected.value.includes(o))
  return q ? opts.filter((o) => o.toLowerCase().includes(q)) : opts
})

function toggle(option: string) {
  const next = selected.value.includes(option) ? selected.value.filter((o) => o !== option) : [...selected.value, option]
  emit("update:modelValue", next)
}
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      @click="open = !open"
      class="flex min-h-9 w-full flex-wrap items-center gap-1 rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-left text-sm"
    >
      <span v-for="value in selected" :key="value" class="inline-flex items-center gap-1 rounded bg-neutral-800 px-1.5 py-0.5 text-xs">
        {{ value }}
        <span class="cursor-pointer text-neutral-400 hover:text-white" @click.stop="toggle(value)">×</span>
      </span>
      <span v-if="selected.length === 0" class="text-neutral-500">None selected</span>
    </button>

    <div v-if="open" class="absolute z-20 mt-1 w-full rounded border border-neutral-700 bg-neutral-900 shadow-lg">
      <input
        v-model="query"
        placeholder="Search…"
        class="w-full border-b border-neutral-700 bg-transparent px-2 py-1.5 text-sm outline-none"
      />
      <ul class="max-h-48 overflow-y-auto py-1 text-sm">
        <li v-for="option in filtered" :key="option">
          <label class="flex cursor-pointer items-center gap-2 px-2 py-1 hover:bg-neutral-800">
            <input type="checkbox" :checked="selected.includes(option)" @change="toggle(option)" />
            <span class="truncate">{{ option }}</span>
          </label>
        </li>
        <li v-if="filtered.length === 0" class="px-2 py-1 text-neutral-500">No matches</li>
      </ul>
    </div>
  </div>
</template>

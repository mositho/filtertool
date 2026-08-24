<script setup lang="ts">
const props = defineProps<{ shape: string; color: string }>()
const emit = defineEmits<{ "update:shape": [value: string]; "update:color": [value: string] }>()

const COLORS = [
  { name: "Red", hex: "#ff4d4d" },
  { name: "Green", hex: "#4ade80" },
  { name: "Blue", hex: "#60a5fa" },
  { name: "Brown", hex: "#8b5a2b" },
  { name: "White", hex: "#ffffff" },
  { name: "Yellow", hex: "#facc15" },
  { name: "Cyan", hex: "#22d3ee" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Orange", hex: "#fb923c" },
  { name: "Pink", hex: "#f472b6" },
  { name: "Purple", hex: "#a855f7" },
] as const

const SHAPES = [
  { name: "Circle", path: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18Z" },
  { name: "Diamond", path: "M12 2l10 10-10 10L2 12Z" },
  { name: "Hexagon", path: "M12 2l8.66 5v10L12 22l-8.66-5V7Z" },
  { name: "Square", path: "M4 4h16v16H4Z" },
  { name: "Star", path: "M12 2l2.94 6.06L21.5 9l-4.75 4.53L18 20.5 12 17l-6 3.5 1.25-6.97L2.5 9l6.56-.94Z" },
  { name: "Triangle", path: "M12 3l10 18H2Z" },
  { name: "Cross", path: "M10 2L14 2L16 8L22 10L22 14L16 16L14 22L10 22L8 16L2 14L2 10L8 8Z" },
  { name: "Moon", path: "M15.5 2.5A10 10 0 1 0 21.5 15A8 8 0 1 1 15.5 2.5Z" },
  { name: "Raindrop", path: "M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z" },
  { name: "Kite", path: "M12 22C12 22 5 14 5 9a7 7 0 0 1 14 0c0 5-7 13-7 13Z" },
  { name: "Pentagon", path: "M12 2l9 7-3.5 10h-11L3 9Z" },
  { name: "UpsideDownHouse", path: "M4 5h16v9l-8 7-8-7Z" },
] as const
</script>

<template>
  <div class="space-y-2">
    <div class="flex flex-wrap gap-1.5">
      <button
        type="button"
        @click="emit('update:shape', '')"
        class="flex h-6 w-6 items-center justify-center rounded border-2 transition-all"
        :class="shape === '' ? 'scale-110 border-white ring-2 ring-white/60' : 'border-neutral-700 hover:border-neutral-400'"
        title="No Icon"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9"></circle>
          <line x1="5" y1="5" x2="19" y2="19"></line>
        </svg>
      </button>
      <button
        v-for="s in SHAPES"
        :key="s.name"
        type="button"
        @click="emit('update:shape', s.name)"
        class="flex h-6 w-6 items-center justify-center rounded border-2 transition-all"
        :class="shape === s.name ? 'scale-110 border-white ring-2 ring-white/60' : 'border-neutral-700 hover:border-neutral-400'"
        :title="s.name"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-neutral-300" fill="currentColor">
          <path :d="s.path"></path>
        </svg>
      </button>
    </div>
    <div v-if="shape !== ''" class="flex flex-wrap gap-1.5">
      <button
        v-for="c in COLORS"
        :key="c.name"
        type="button"
        @click="emit('update:color', c.name)"
        class="h-6 w-6 rounded-full border-2 transition-all"
        :class="color === c.name ? 'scale-110 border-white ring-2 ring-white/60' : 'border-neutral-700 hover:border-neutral-400'"
        :style="{ backgroundColor: c.hex }"
        :title="c.name"
      ></button>
    </div>
  </div>
</template>

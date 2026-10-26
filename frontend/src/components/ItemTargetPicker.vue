<script setup lang="ts">
import { computed, ref } from "vue"
import type { ReferenceData } from "../api"

const props = defineProps<{ classes: string[]; bases: string[]; reference: ReferenceData; weaponOnly?: boolean }>()
const emit = defineEmits<{ "update:classes": [value: string[]]; "update:bases": [value: string[]] }>()
const search = ref("")
const classSearch = ref("")
const selectedClass = ref("")

const classes = computed(() => (props.weaponOnly ? [...props.reference.weaponClasses, "Shields"] : props.reference.itemClasses))
const filteredClasses = computed(() => {
  const query = classSearch.value.trim().toLowerCase()
  return query ? classes.value.filter((itemClass) => itemClass.toLowerCase().includes(query)) : classes.value
})
const bases = computed(() => {
  const candidates = selectedClass.value
    ? (props.reference.baseTypesByClass[selectedClass.value] ?? [])
    : classes.value.flatMap((itemClass) => props.reference.baseTypesByClass[itemClass] ?? [])
  const query = search.value.trim().toLowerCase()
  return query ? candidates.filter((base) => base.toLowerCase().includes(query)) : candidates
})

function toggleClass(itemClass: string) {
  emit(
    "update:classes",
    props.classes.includes(itemClass) ? props.classes.filter((entry) => entry !== itemClass) : [...props.classes, itemClass],
  )
}

function toggleBase(base: string) {
  emit("update:bases", props.bases.includes(base) ? props.bases.filter((entry) => entry !== base) : [...props.bases, base])
}
</script>

<template>
  <div class="space-y-2 rounded border border-neutral-800 p-2">
    <p class="text-xs text-neutral-500">Select {{ weaponOnly ? "weapon" : "item" }} classes, individual bases, or both.</p>
    <div v-if="props.classes.length || props.bases.length" class="flex flex-wrap gap-1">
      <button
        v-for="itemClass in props.classes"
        :key="`class-${itemClass}`"
        type="button"
        class="rounded bg-blue-900/70 px-2 py-1 text-xs text-blue-100 hover:bg-blue-800"
        :aria-label="`Remove item class ${itemClass}`"
        @click="toggleClass(itemClass)"
      >
        {{ itemClass }} ×
      </button>
      <button
        v-for="base in props.bases"
        :key="`base-${base}`"
        type="button"
        class="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
        :aria-label="`Remove base type ${base}`"
        @click="toggleBase(base)"
      >
        {{ base }} ×
      </button>
    </div>
    <details class="rounded border border-neutral-700">
      <summary class="rounded px-3 py-2 text-xs text-neutral-300">Choose {{ weaponOnly ? "weapon" : "item" }} classes</summary>
      <div class="space-y-2 px-2 pb-2">
        <input
          v-model="classSearch"
          type="search"
          aria-label="Search item classes"
          :placeholder="`Search ${weaponOnly ? 'weapon' : 'item'} classes…`"
          class="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs"
        />
        <div class="grid max-h-36 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
          <label v-for="itemClass in filteredClasses" :key="itemClass" class="flex items-center gap-2 text-xs text-neutral-300">
            <input type="checkbox" :checked="props.classes.includes(itemClass)" @change="toggleClass(itemClass)" />
            {{ itemClass }}
          </label>
          <span v-if="!filteredClasses.length" class="text-xs text-neutral-500">No matching classes</span>
        </div>
      </div>
    </details>
    <details class="rounded border border-neutral-700">
      <summary class="rounded px-3 py-2 text-xs text-neutral-300">Choose individual bases</summary>
      <div class="space-y-2 px-2 pb-2">
        <div class="flex flex-col gap-2 sm:flex-row">
          <select
            v-model="selectedClass"
            aria-label="Filter bases by class"
            class="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs"
          >
            <option value="">All {{ weaponOnly ? "weapon" : "item" }} classes</option>
            <option v-for="itemClass in classes" :key="itemClass" :value="itemClass">{{ itemClass }}</option>
          </select>
          <input
            v-model="search"
            type="search"
            aria-label="Search base types"
            placeholder="Search bases…"
            class="min-w-0 flex-1 rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs"
          />
        </div>
        <div class="grid max-h-40 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
          <label v-for="base in bases" :key="base" class="flex items-center gap-2 text-xs text-neutral-300">
            <input type="checkbox" :checked="props.bases.includes(base)" @change="toggleBase(base)" />
            {{ base }}
          </label>
          <span v-if="!bases.length" class="text-xs text-neutral-500">No matching bases</span>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>()
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    @click.stop="emit('update:modelValue', !modelValue)"
    class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
    :class="modelValue ? 'bg-blue-600' : 'bg-neutral-700'"
  >
    <span
      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
      :class="modelValue ? 'translate-x-4' : 'translate-x-0.5'"
    ></span>
  </button>
</template>

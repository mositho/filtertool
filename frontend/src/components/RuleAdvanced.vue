<script setup lang="ts">
import type { FieldSubsection } from "@schema/form-schema"
import AdvancedOptions from "./AdvancedOptions.vue"

defineProps<{ modules: FieldSubsection[] }>()
</script>

<template>
  <AdvancedOptions v-if="modules.length" class="mt-3">
    <div class="space-y-2">
      <div v-for="module in modules" :key="module.key" class="rounded border border-neutral-800 bg-neutral-950/60 p-2">
        <div class="space-y-2">
          <slot v-for="field in module.fields" :key="field.path" :field="field" />
        </div>
      </div>
    </div>
  </AdvancedOptions>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{
  modelValue: Record<string, unknown>
  sounds: { id: string; name: string; hasFile?: boolean }[]
}>()
const emit = defineEmits<{ "update:modelValue": [value: Record<string, unknown>] }>()

type SoundType = "none" | "preset" | "tts" | "alert" | "file"

function detectType(h: Record<string, unknown>): SoundType {
  if (typeof h.tts === "string" && h.tts) {
    return props.sounds.some((s) => s.id === h.tts) ? "preset" : "tts"
  }
  if (typeof h.soundFileName === "string" && h.soundFileName) return "file"
  if (typeof h.soundId === "number") return "alert"
  return "none"
}

function ttsTextFor(h: Record<string, unknown>): string {
  return typeof h.tts === "string" && !props.sounds.some((s) => s.id === h.tts) ? h.tts : ""
}

const type = ref<SoundType>(detectType(props.modelValue))
const preset = ref(typeof props.modelValue.tts === "string" ? props.modelValue.tts : "")
const ttsText = ref(ttsTextFor(props.modelValue))
const alert = ref(typeof props.modelValue.soundId === "number" ? props.modelValue.soundId : 1)
const file = ref(typeof props.modelValue.soundFileName === "string" ? props.modelValue.soundFileName : "")

function commit() {
  const h = { ...props.modelValue }
  delete h.tts
  delete h.soundFileName
  delete h.soundId
  if (type.value === "preset" && preset.value) h.tts = preset.value
  if (type.value === "tts" && ttsText.value) h.tts = ttsText.value
  if (type.value === "alert") h.soundId = alert.value
  if (type.value === "file" && file.value) h.soundFileName = file.value
  emit("update:modelValue", h)
}

let syncing = false

watch(
  [type, preset, ttsText, alert, file],
  () => {
    if (syncing) return
    commit()
  },
  { flush: "sync" },
)

// Re-sync when the parent replaces the highlight (undo/redo/discard/filter switch).
watch(
  () => props.modelValue,
  (h) => {
    syncing = true
    try {
      type.value = detectType(h)
      preset.value = typeof h.tts === "string" ? h.tts : ""
      ttsText.value = ttsTextFor(h)
      alert.value = typeof h.soundId === "number" ? h.soundId : 1
      file.value = typeof h.soundFileName === "string" ? h.soundFileName : ""
    } finally {
      syncing = false
    }
  },
)

const audio = ref<HTMLAudioElement | null>(null)
function play(id: string) {
  if (!audio.value) audio.value = new Audio()
  audio.value.src = `/api/sounds/file/${id}.mp3`
  void audio.value.play()
}

function playGame(n: number) {
  if (!audio.value) audio.value = new Audio()
  audio.value.src = `/api/sounds/game/${n}`
  void audio.value.play()
}

function onPresetChange(event: Event) {
  preset.value = (event.target as HTMLSelectElement).value
  if (preset.value && props.sounds.some((s) => s.id === preset.value && s.hasFile)) play(preset.value)
}

function onAlertChange(event: Event) {
  alert.value = Number((event.target as HTMLSelectElement).value)
  playGame(alert.value)
}
</script>

<template>
  <div class="space-y-2">
    <select v-model="type" class="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm">
      <option value="none">None</option>
      <option value="preset">TTS Template</option>
      <option value="tts">TTS Custom</option>
      <option value="alert">Game Template</option>
      <option value="file">File Custom</option>
    </select>

    <div v-if="type === 'preset'" class="flex gap-2">
      <select :value="preset" @change="onPresetChange" class="flex-1 rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm">
        <option value="">Select a sound…</option>
        <option v-for="sound in sounds" :key="sound.id" :value="sound.id">{{ sound.name }}</option>
      </select>
      <button
        v-if="preset && sounds.find((s) => s.id === preset)?.hasFile"
        type="button"
        @click="play(preset)"
        class="rounded bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700"
        title="Preview sound"
      >
        ▶
      </button>
    </div>

    <input
      v-else-if="type === 'tts'"
      v-model="ttsText"
      placeholder="e.g. Rare Wand"
      class="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
    />

    <div v-else-if="type === 'alert'" class="flex gap-2">
      <select :value="alert" @change="onAlertChange" class="flex-1 rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm">
        <option v-for="n in 16" :key="n" :value="n">{{ n }}</option>
      </select>
      <button
        type="button"
        @click="playGame(alert)"
        class="rounded bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700"
        title="Preview sound"
      >
        ▶
      </button>
    </div>

    <div v-else-if="type === 'file'" class="space-y-1">
      <input
        v-model="file"
        placeholder="e.g. custom-alert.mp3"
        class="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm"
      />
      <p class="text-[11px] leading-relaxed text-neutral-500">
        Place the file in the <code class="text-neutral-400">sounds/</code> folder — it's copied to the game's sound pack on export.
      </p>
    </div>
  </div>
</template>

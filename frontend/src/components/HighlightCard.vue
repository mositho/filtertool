<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue"
import { HIGHLIGHT_FIELDS, HIGHLIGHT_RARITIES, RARITY_HIGHLIGHT_KEYS, SOUND_FIELD_PATHS } from "@schema/form-schema"
import type { ReferenceData } from "../api"
import { getPath, setPath, deletePath } from "../path"
import FieldLabel from "./FieldLabel.vue"
import NumberField from "./NumberField.vue"
import Toggle from "./Toggle.vue"
import MultiSelect from "./MultiSelect.vue"
import SoundSelector from "./SoundSelector.vue"
import IconPicker from "./IconPicker.vue"

const props = defineProps<{
  highlight: Record<string, unknown>
  reference: ReferenceData
  weaponsOnly?: boolean
}>()
const emit = defineEmits<{ change: [] }>()

type ModuleId =
  | "minAps"
  | "linkedSockets"
  | "minSockets"
  | "minAreaLevel"
  | "maxAreaLevel"
  | "minItemLevel"
  | "maxItemLevel"
  | "weaponCutoff"
  | "icon"
  | "sound"

const FIELD_BY_PATH = Object.fromEntries(HIGHLIGHT_FIELDS.map((field) => [field.path, field]))

const matchModes = computed(() =>
  props.weaponsOnly ? (["baseTypes", "itemClasses"] as const) : (["any", "baseTypes", "itemClasses"] as const),
)

const itemClassOptions = computed(() => (props.weaponsOnly ? props.reference.weaponClasses : props.reference.itemClasses))

const MODULE_IDS: ModuleId[] = [
  "minAps",
  "linkedSockets",
  "minSockets",
  "minAreaLevel",
  "maxAreaLevel",
  "minItemLevel",
  "maxItemLevel",
  "weaponCutoff",
  "icon",
  "sound",
]

const MODULE_LABELS: Record<ModuleId, string> = {
  minAps: "Minimum Attack Speed",
  linkedSockets: "Minimum Linked Sockets",
  minSockets: "Minimum Sockets",
  minAreaLevel: "Minimum Area Level",
  maxAreaLevel: "Maximum Area Level",
  minItemLevel: "Minimum Item Level",
  maxItemLevel: "Maximum Item Level",
  weaponCutoff: "Weapon Cutoff",
  icon: "Icon",
  sound: "Sound",
}

function fieldSet(path: string): boolean {
  return getPath(props.highlight, path) !== undefined
}

const perRarity = computed(() => !!props.highlight.perRarityCustomization)

function computeActive(): Set<ModuleId> {
  return new Set(
    MODULE_IDS.filter((id) => {
      if (id === "weaponCutoff") return fieldSet("weaponCutoffOverlap")
      if (id === "icon") return !perRarity.value && (fieldSet("iconColor") || fieldSet("iconShape"))
      if (id === "sound") return !perRarity.value && (fieldSet("tts") || fieldSet("soundFileName") || fieldSet("soundId"))
      return fieldSet(id)
    }),
  )
}

function computeMode(): "any" | "baseTypes" | "itemClasses" {
  if (((props.highlight.baseTypes as unknown[] | undefined)?.length ?? 0) > 0) return "baseTypes"
  if (((props.highlight.itemClasses as unknown[] | undefined)?.length ?? 0) > 0) return "itemClasses"
  return props.weaponsOnly ? "itemClasses" : "any"
}

function readModules(): Set<ModuleId> {
  const stored = props.highlight.modules
  if (Array.isArray(stored)) {
    return new Set(stored.filter((id): id is ModuleId => MODULE_IDS.includes(id as ModuleId)))
  }
  return computeActive()
}

function persistModules() {
  if (active.value.size > 0) setPath(props.highlight, "modules", [...active.value])
  else deletePath(props.highlight, "modules")
  onChange()
}

const active = ref<Set<ModuleId>>(readModules())
const mode = ref<"any" | "baseTypes" | "itemClasses">(computeMode())

watch(
  () => props.highlight,
  () => {
    active.value = readModules()
    mode.value = computeMode()
  },
)

const hasWeaponClass = computed(() => {
  const classes = (fieldValue("itemClasses") as string[] | undefined) ?? []
  return classes.some((itemClass) => props.reference.weaponClasses.includes(itemClass))
})

const weaponCutoffAvailable = computed(() => mode.value === "itemClasses" && hasWeaponClass.value)

const availableModules = computed(() =>
  MODULE_IDS.filter((id) => {
    if (active.value.has(id)) return false
    if (id === "weaponCutoff" && !weaponCutoffAvailable.value) return false
    if ((id === "icon" || id === "sound") && perRarity.value) return false
    return true
  }),
)

const modulesOpen = ref(false)
const moduleMenu = ref<HTMLElement | null>(null)

function onDocumentClick(event: MouseEvent) {
  if (modulesOpen.value && moduleMenu.value && !moduleMenu.value.contains(event.target as Node)) {
    modulesOpen.value = false
  }
}

onMounted(() => document.addEventListener("mousedown", onDocumentClick))
onBeforeUnmount(() => document.removeEventListener("mousedown", onDocumentClick))

function chooseModule(id: ModuleId) {
  addModule(id)
  modulesOpen.value = false
}

function onChange() {
  emit("change")
}

function setField(path: string, value: unknown) {
  if (value === undefined) deletePath(props.highlight, path)
  else setPath(props.highlight, path, value)
  onChange()
}

function fieldValue(path: string): unknown {
  return getPath(props.highlight, path)
}

const allBaseTypes = computed(() => Object.values(props.reference.baseTypesByClass).flat())

const classFilter = ref("")

const baseTypeOptions = computed(() =>
  classFilter.value ? (props.reference.baseTypesByClass[classFilter.value] ?? []) : allBaseTypes.value,
)

function setMode(value: "any" | "baseTypes" | "itemClasses") {
  mode.value = value
  if (value !== "baseTypes") deletePath(props.highlight, "baseTypes")
  if (value !== "itemClasses") deletePath(props.highlight, "itemClasses")
  onChange()
}

const rarityValue = computed(() => (props.highlight.rarities as string[] | undefined) ?? [...HIGHLIGHT_RARITIES])

function setRarities(value: string[]) {
  setField("rarities", value)
}

function setPerRarity(value: boolean) {
  if (value) {
    for (const path of ["iconColor", "iconShape", "iconSize", "tts", "soundFileName", "soundId"]) deletePath(props.highlight, path)
  } else {
    for (const key of RARITY_HIGHLIGHT_KEYS) deletePath(props.highlight, key)
  }
  setField("perRarityCustomization", value || undefined)
  active.value = computeActive()
  persistModules()
}

function addModule(id: ModuleId) {
  active.value = new Set([...active.value, id])
  if (id === "weaponCutoff") setField("weaponCutoffOverlap", 5)
  persistModules()
}

function removeModule(id: ModuleId) {
  active.value = new Set([...active.value].filter((entry) => entry !== id))
  if (id === "weaponCutoff") {
    deletePath(props.highlight, "weaponCutoffOverlap")
  } else if (id === "icon") {
    deletePath(props.highlight, "iconColor")
    deletePath(props.highlight, "iconShape")
    deletePath(props.highlight, "iconSize")
  } else if (id === "sound") {
    for (const path of SOUND_FIELD_PATHS) deletePath(props.highlight, path)
  } else {
    deletePath(props.highlight, id)
  }
  persistModules()
}

function applyTopSound(next: Record<string, unknown>) {
  for (const path of SOUND_FIELD_PATHS) deletePath(props.highlight, path)
  for (const path of SOUND_FIELD_PATHS) {
    if (next[path] !== undefined) setPath(props.highlight, path, next[path])
  }
  onChange()
}

function setIconColor(color: string) {
  setField("iconColor", color)
}

function setIconSize(size: number) {
  setField("iconSize", size)
}

function setIconShape(shape: string) {
  if (shape === "") {
    deletePath(props.highlight, "iconShape")
    deletePath(props.highlight, "iconColor")
    deletePath(props.highlight, "iconSize")
    onChange()
  } else {
    setField("iconShape", shape)
  }
}

type RarityKey = "normal" | "magic" | "rare"
const EMPTY_RARITY: Record<string, unknown> = {}

function rarityKeyOf(rarity: string): RarityKey {
  return rarity.toLowerCase() as RarityKey
}

function rarityConfig(rarity: string): Record<string, unknown> {
  const config = props.highlight[rarityKeyOf(rarity)]
  return config && typeof config === "object" && !Array.isArray(config) ? (config as Record<string, unknown>) : EMPTY_RARITY
}

function rarityIconColor(rarity: string): string {
  return (rarityConfig(rarity).iconColor as string | undefined) ?? ""
}

function rarityIconShape(rarity: string): string {
  return (rarityConfig(rarity).iconShape as string | undefined) ?? ""
}

function rarityIconSize(rarity: string): number {
  return (rarityConfig(rarity).iconSize as number | undefined) ?? 2
}

function setRarityIconColor(rarity: string, color: string) {
  setField(`${rarityKeyOf(rarity)}.iconColor`, color)
}

function setRarityIconSize(rarity: string, size: number) {
  setField(`${rarityKeyOf(rarity)}.iconSize`, size)
}

function setRarityIconShape(rarity: string, shape: string) {
  const key = rarityKeyOf(rarity)
  if (shape === "") {
    deletePath(props.highlight, `${key}.iconShape`)
    deletePath(props.highlight, `${key}.iconColor`)
    deletePath(props.highlight, `${key}.iconSize`)
    onChange()
  } else {
    setField(`${key}.iconShape`, shape)
  }
}

function applyRaritySound(rarity: string, next: Record<string, unknown>) {
  const key = rarityKeyOf(rarity)
  for (const path of SOUND_FIELD_PATHS) deletePath(props.highlight, `${key}.${path}`)
  for (const path of SOUND_FIELD_PATHS) {
    if (next[path] !== undefined) setPath(props.highlight, `${key}.${path}`, next[path])
  }
  onChange()
}
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-1">
      <FieldLabel label="Match" tooltip="Choose what this highlight matches, or match anything." />
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in matchModes"
          :key="option"
          type="button"
          @click="setMode(option)"
          class="rounded px-2 py-1 text-xs"
          :class="mode === option ? 'bg-blue-700 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'"
        >
          {{ option === "any" ? "Anything" : option === "baseTypes" ? "Base Types" : "Item Classes" }}
        </button>
      </div>

      <template v-if="mode === 'itemClasses'">
        <MultiSelect
          :model-value="(fieldValue('itemClasses') as string[]) ?? []"
          :options="itemClassOptions"
          @update:model-value="setField('itemClasses', $event)"
        />
      </template>
      <template v-else-if="mode === 'baseTypes'">
        <select v-model="classFilter" class="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm">
          <option value="">All item classes</option>
          <option v-for="itemClass in itemClassOptions" :key="itemClass" :value="itemClass">{{ itemClass }}</option>
        </select>
        <MultiSelect
          :model-value="(fieldValue('baseTypes') as string[]) ?? []"
          :options="baseTypeOptions"
          @update:model-value="setField('baseTypes', $event)"
        />
      </template>
    </div>

    <div class="space-y-1">
      <FieldLabel label="Rarities" :tooltip="FIELD_BY_PATH.rarities?.tooltip" />
      <MultiSelect :model-value="rarityValue" :options="HIGHLIGHT_RARITIES" @update:model-value="setRarities($event)" />
      <div class="flex items-center gap-2 pt-1">
        <Toggle :model-value="perRarity" @update:model-value="setPerRarity($event)" />
        <span class="text-xs text-neutral-400">Customize per rarity</span>
      </div>
      <div v-if="perRarity" class="space-y-2">
        <p class="text-xs text-neutral-500">Configure icon and sound per selected rarity. Replaces any whole-highlight icon or sound.</p>
        <div v-for="rarity in rarityValue" :key="rarity" class="rounded border border-neutral-800 bg-neutral-950/60 p-2">
          <span class="text-sm font-medium text-neutral-300">{{ rarity }}</span>
          <div class="mt-2">
            <IconPicker
              :shape="rarityIconShape(rarity)"
              :color="rarityIconColor(rarity)"
              :size="rarityIconSize(rarity)"
              @update:shape="setRarityIconShape(rarity, $event)"
              @update:color="setRarityIconColor(rarity, $event)"
              @update:size="setRarityIconSize(rarity, $event)"
            />
          </div>
          <div class="mt-2">
            <SoundSelector
              :model-value="rarityConfig(rarity)"
              :sounds="reference.sounds"
              @update:model-value="applyRaritySound(rarity, $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <div v-for="id in [...active]" :key="id" class="rounded border border-neutral-800 bg-neutral-950/60 p-2">
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="removeModule(id)"
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-neutral-800 text-sm leading-none text-neutral-300 hover:bg-red-700 hover:text-white"
            :title="`Remove ${MODULE_LABELS[id]}`"
          >
            −
          </button>
          <span class="text-sm font-medium text-neutral-300">{{ MODULE_LABELS[id] }}</span>
        </div>

        <div class="mt-1 space-y-1">
          <template v-if="id === 'weaponCutoff'">
            <FieldLabel :label="FIELD_BY_PATH.weaponCutoffOverlap!.label" :tooltip="FIELD_BY_PATH.weaponCutoffOverlap?.tooltip" />
            <NumberField
              :model-value="fieldValue('weaponCutoffOverlap') as number"
              integer
              @update:model-value="setField('weaponCutoffOverlap', $event)"
            />
          </template>
          <template v-else-if="id === 'icon'">
            <IconPicker
              :shape="(fieldValue('iconShape') as string) ?? ''"
              :color="(fieldValue('iconColor') as string) ?? ''"
              :size="(fieldValue('iconSize') as number) ?? 2"
              @update:shape="setIconShape"
              @update:color="setIconColor"
              @update:size="setIconSize"
            />
          </template>
          <template v-else-if="id === 'sound'">
            <SoundSelector :model-value="highlight" :sounds="reference.sounds" @update:model-value="applyTopSound($event)" />
          </template>
          <template v-else>
            <NumberField
              :model-value="fieldValue(id) as number"
              :integer="FIELD_BY_PATH[id]?.integer"
              :step="FIELD_BY_PATH[id]?.step"
              :placeholder="FIELD_BY_PATH[id]?.placeholder"
              @update:model-value="setField(id, $event)"
            />
          </template>
        </div>
      </div>

      <div v-if="availableModules.length > 0" ref="moduleMenu" class="relative inline-block pt-1">
        <button
          type="button"
          @click="modulesOpen = !modulesOpen"
          class="rounded bg-blue-700 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
        >
          + Add module
        </button>
        <div
          v-if="modulesOpen"
          class="absolute left-0 top-full z-30 mt-1 w-64 rounded border border-neutral-700 bg-neutral-900 py-1 shadow-lg"
        >
          <button
            v-for="id in availableModules"
            :key="id"
            type="button"
            @click="chooseModule(id)"
            class="block w-full px-3 py-1.5 text-left text-sm text-neutral-300 hover:bg-neutral-800"
          >
            {{ MODULE_LABELS[id] }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

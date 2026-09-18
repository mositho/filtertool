import fs from "fs"
import path from "path"
import { MANIFEST_BY_ID, type SoundManifestId } from "../../sounds/manifest"
import type {
  BuildProfile,
  BuildSpecificOptions,
  GemCalloutConfig,
  HighlightedBaseTypeConfig,
  RarityHighlightConfig,
  TtsFile,
} from "./sections/options"

export type FilterConfig = {
  buildProfile: BuildProfile
  buildSpecificOptions: BuildSpecificOptions
}

export type SerializedRarityHighlight = Omit<RarityHighlightConfig, "tts"> & { tts?: string }
export type SerializedHighlight = Omit<HighlightedBaseTypeConfig, "normal" | "magic" | "rare" | "tts"> & {
  tts?: string
  normal?: SerializedRarityHighlight
  magic?: SerializedRarityHighlight
  rare?: SerializedRarityHighlight
}
export type SerializedHighlightedEquipment = { highlights?: readonly SerializedHighlight[] }
export type SerializedGemCallout = Omit<GemCalloutConfig, "tts"> & { tts?: string }
export type SerializedGemCallouts = { callouts?: readonly SerializedGemCallout[] }
export type SerializedBuildProfile = Omit<BuildProfile, "preferredWeapons" | "earlyWeapons"> & {
  preferredWeapons?: SerializedHighlight
  earlyWeapons?: SerializedHighlight
}

/**
 * The wire/storage shape of a filter config. `tts` values that refer to a sound
 * manifest entry are stored as their manifest id string; any other string is an
 * ad-hoc TTS phrase. This is what `config.json` contains and what the API serves.
 */
export type SerializedFilterConfig = {
  buildProfile: SerializedBuildProfile
  buildSpecificOptions: Omit<BuildSpecificOptions, "highlightedEquipment" | "gemCallouts"> & {
    highlightedEquipment?: SerializedHighlightedEquipment
    gemCallouts?: SerializedGemCallouts
  }
}

export const CONFIG_JSON_FILE_NAME = "config.json"
export const CONFIG_TS_MODULE_NAME = "config"

export function serializeTts(tts: TtsFile): string {
  return typeof tts === "string" ? tts : tts.id
}

export function deserializeTts(value: string): TtsFile {
  const entry = MANIFEST_BY_ID[value as SoundManifestId]
  return entry ?? value
}

function serializeRarityHighlight(config: RarityHighlightConfig | undefined): SerializedRarityHighlight | undefined {
  if (!config) return undefined
  const { tts, ...rest } = config
  return { ...rest, ...(tts !== undefined ? { tts: serializeTts(tts) } : {}) }
}

function deserializeRarityHighlight(config: SerializedRarityHighlight | undefined): RarityHighlightConfig | undefined {
  if (!config) return undefined
  const { tts, ...rest } = config
  return { ...rest, ...(tts !== undefined ? { tts: deserializeTts(tts) } : {}) }
}

function serializeHighlight(highlight: HighlightedBaseTypeConfig): SerializedHighlight {
  const { normal, magic, rare, tts, ...rest } = highlight
  return {
    ...rest,
    ...(tts !== undefined ? { tts: serializeTts(tts) } : {}),
    ...(normal !== undefined ? { normal: serializeRarityHighlight(normal) } : {}),
    ...(magic !== undefined ? { magic: serializeRarityHighlight(magic) } : {}),
    ...(rare !== undefined ? { rare: serializeRarityHighlight(rare) } : {}),
  }
}

function deserializeHighlight(highlight: SerializedHighlight): HighlightedBaseTypeConfig {
  const { normal, magic, rare, tts, ...rest } = highlight
  return {
    ...rest,
    ...(tts !== undefined ? { tts: deserializeTts(tts) } : {}),
    ...(normal !== undefined ? { normal: deserializeRarityHighlight(normal) } : {}),
    ...(magic !== undefined ? { magic: deserializeRarityHighlight(magic) } : {}),
    ...(rare !== undefined ? { rare: deserializeRarityHighlight(rare) } : {}),
  }
}

function serializeGemCallout(callout: GemCalloutConfig): SerializedGemCallout {
  const { tts, ...rest } = callout
  return { ...rest, ...(tts !== undefined ? { tts: serializeTts(tts) } : {}) }
}

function deserializeGemCallout(callout: SerializedGemCallout): GemCalloutConfig {
  const { tts, ...rest } = callout
  return { ...rest, ...(tts !== undefined ? { tts: deserializeTts(tts) } : {}) }
}

export function serializeFilterConfig(config: FilterConfig): SerializedFilterConfig {
  const { highlightedEquipment, gemCallouts, ...restOptions } = config.buildSpecificOptions
  const highlights = highlightedEquipment?.highlights
  const callouts = gemCallouts?.callouts
  const { preferredWeapons, earlyWeapons, ...restProfile } = config.buildProfile
  return {
    buildProfile: {
      ...restProfile,
      ...(preferredWeapons !== undefined ? { preferredWeapons: serializeHighlight(preferredWeapons) } : {}),
      ...(earlyWeapons !== undefined ? { earlyWeapons: serializeHighlight(earlyWeapons) } : {}),
    },
    buildSpecificOptions: {
      ...restOptions,
      ...(highlights
        ? {
            highlightedEquipment: {
              ...(highlightedEquipment && "highlights" in highlightedEquipment ? highlightedEquipment : {}),
              highlights: highlights.map(serializeHighlight),
            },
          }
        : {}),
      ...(callouts
        ? {
            gemCallouts: {
              ...(gemCallouts && "callouts" in gemCallouts ? gemCallouts : {}),
              callouts: callouts.map(serializeGemCallout),
            },
          }
        : {}),
    },
  }
}

export function deserializeFilterConfig(config: SerializedFilterConfig): FilterConfig {
  const { highlightedEquipment, gemCallouts, ...restOptions } = config.buildSpecificOptions
  const highlights = highlightedEquipment?.highlights
  const callouts = gemCallouts?.callouts
  const { preferredWeapons, earlyWeapons, ...restProfile } = config.buildProfile
  return {
    buildProfile: {
      ...restProfile,
      ...(preferredWeapons !== undefined ? { preferredWeapons: deserializeHighlight(preferredWeapons) } : {}),
      ...(earlyWeapons !== undefined ? { earlyWeapons: deserializeHighlight(earlyWeapons) } : {}),
    },
    buildSpecificOptions: {
      ...restOptions,
      ...(highlightedEquipment
        ? {
            highlightedEquipment: {
              ...highlightedEquipment,
              ...(highlights
                ? {
                    highlights: highlights.map(deserializeHighlight),
                  }
                : {}),
            },
          }
        : {}),
      ...(gemCallouts
        ? {
            gemCallouts: {
              ...gemCallouts,
              ...(callouts
                ? {
                    callouts: callouts.map(deserializeGemCallout),
                  }
                : {}),
            },
          }
        : {}),
    },
  }
}

function readConfigJson(filterDir: string): SerializedFilterConfig | null {
  const jsonPath = path.join(filterDir, CONFIG_JSON_FILE_NAME)
  if (!fs.existsSync(jsonPath)) return null
  try {
    return JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as SerializedFilterConfig
  } catch {
    return null
  }
}

/**
 * Loads a filter's config for compilation. `config.json` takes precedence over
 * `config.ts`; a filter defined only by `config.json` (no `config.ts`) loads
 * fine because the TS module is only required as a fallback.
 */
export function loadFilterConfig(filterDir: string, tsFallback?: FilterConfig): FilterConfig {
  const json = readConfigJson(filterDir)
  if (json) return deserializeFilterConfig(json)
  if (tsFallback) return tsFallback
  const mod = require(path.resolve(filterDir, CONFIG_TS_MODULE_NAME)) as {
    buildProfile?: BuildProfile
    buildSpecificOptions?: BuildSpecificOptions
  }
  return { buildProfile: mod.buildProfile ?? {}, buildSpecificOptions: mod.buildSpecificOptions ?? {} }
}

/** Reads the stored (serialized) config, snapshotting a TS fallback when no JSON exists. */
export function readFilterConfig(filterDir: string, tsFallback?: FilterConfig): SerializedFilterConfig {
  const json = readConfigJson(filterDir)
  if (json) return json
  const loaded = tsFallback ?? loadFilterConfig(filterDir)
  return serializeFilterConfig(loaded)
}

/** Writes a serialized config to `config.json` (used by the UI/API). */
export function writeFilterConfig(filterDir: string, config: SerializedFilterConfig): void {
  const jsonPath = path.join(filterDir, CONFIG_JSON_FILE_NAME)
  fs.writeFileSync(jsonPath, JSON.stringify(config, null, 2) + "\n")
}

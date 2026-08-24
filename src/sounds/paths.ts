import path from "path"
import { loadSettings } from "../config/settings"
import type { SoundManifestEntry } from "./manifest"

export const SOUND_PACK_SOURCE_DIR = "sounds"
export const GAME_SOUND_SOURCE_DIR = "sounds_poe"
export const SOUND_PACK_VERSION = 2
export const DEFAULT_SOUND_PACK_FOLDER = `poeft-sounds-v${SOUND_PACK_VERSION}`

const normalizeFolder = (folder: string) => folder.replace(/^[\\/]+|[\\/]+$/g, "")

export function getSoundPackFolder(): string {
  const settings = loadSettings()
  return normalizeFolder(settings.soundsFolder || DEFAULT_SOUND_PACK_FOLDER)
}

export function soundFile(file: string): string {
  const packFolder = getSoundPackFolder()
  if (file.startsWith(`${packFolder}/`)) {
    return file
  }
  return `${packFolder}/${file}`
}

export function soundFileTTS(file: string): string {
  return `${getSoundPackFolder()}/${generatedSoundTextToFileName(file)}`
}

export function manifestSoundFile(entry: SoundManifestEntry): string {
  return `${getSoundPackFolder()}/${entry.id}.mp3`
}

export function generatedSoundTextToFileName(text: string): string {
  return text.split(" ").join("_") + ".mp3"
}

export function getSoundPackTargetDir(): string {
  const filterPath = loadSettings().filterPath || ""
  const soundPackFolder = getSoundPackFolder()
  return filterPath ? path.join(filterPath, soundPackFolder) : soundPackFolder
}

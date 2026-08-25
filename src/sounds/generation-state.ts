import fs from "fs"
import path from "path"
import { repoRoot } from "../config/settings"

export type GenerationSignature = {
  /** The spoken text used to generate the sound. */
  text: string
  locale: string
  speed: number
}

/** Maps a sound filename (e.g. `amethyst_ring.mp3`) to the signature it was generated with. */
export type GenerationState = Record<string, GenerationSignature>

const STATE_FILE_NAME = ".tts-generation.json"

export function generationStatePath(): string {
  return path.join(repoRoot(), STATE_FILE_NAME)
}

export function readGenerationState(): GenerationState {
  try {
    const parsed = JSON.parse(fs.readFileSync(generationStatePath(), "utf-8"))
    return parsed && typeof parsed === "object" ? (parsed as GenerationState) : {}
  } catch {
    return {}
  }
}

export function writeGenerationState(state: GenerationState): void {
  fs.writeFileSync(generationStatePath(), JSON.stringify(state, null, 2) + "\n")
}

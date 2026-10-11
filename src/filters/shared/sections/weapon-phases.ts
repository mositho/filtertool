import type { WeaponPhaseConfig } from "./options"

const lower = (phase: WeaponPhaseConfig) => phase.minAreaLevel ?? -Infinity
const upper = (phase: WeaponPhaseConfig) => phase.maxAreaLevel ?? Infinity

const isNarrower = (first: WeaponPhaseConfig, second: WeaponPhaseConfig) =>
  lower(first) >= lower(second) && upper(first) <= upper(second) && (lower(first) > lower(second) || upper(first) < upper(second))

const bounds = (phase: WeaponPhaseConfig) => Number(phase.minAreaLevel !== undefined) + Number(phase.maxAreaLevel !== undefined)

/** First-match priority: contained ranges first; for incomparable ranges, more bounds then list order. */
export function orderedWeaponPhases(phases: readonly WeaponPhaseConfig[]): WeaponPhaseConfig[] {
  for (const [index, phase] of phases.entries()) {
    for (const [name, value] of [
      ["Min Area Level", phase.minAreaLevel],
      ["Max Area Level", phase.maxAreaLevel],
    ] as const) {
      if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
        throw new Error(`Weapon phase ${index + 1} has an invalid ${name}.`)
      }
    }
    if (phase.minAreaLevel !== undefined && phase.maxAreaLevel !== undefined && phase.minAreaLevel > phase.maxAreaLevel) {
      throw new Error(`Weapon phase ${index + 1} has a Min Area Level above its Max Area Level.`)
    }
  }

  const remaining = phases.map((phase, index) => ({ phase, index }))
  const ordered: WeaponPhaseConfig[] = []
  while (remaining.length > 0) {
    const candidates = remaining.filter((entry) => !remaining.some((other) => isNarrower(other.phase, entry.phase)))
    candidates.sort((a, b) => bounds(b.phase) - bounds(a.phase) || a.index - b.index)
    const selected = candidates[0]
    ordered.push(selected.phase)
    remaining.splice(remaining.indexOf(selected), 1)
  }
  return ordered
}

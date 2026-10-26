import type { Rule, StyleData } from "../../../types"
import { MANIFEST_BY_ID, type SoundManifestId } from "../../../sounds/manifest"
import { manifestSoundFile, soundFileTTS } from "../../../sounds/paths"
import { filterStyles, soundFile } from "../styles"
import type { EquipmentRuleConfig } from "./options"

/** Rule fields inherit individually; style/icon/sound are whole-control overrides. */
export function equipmentRule(
  defaults: Record<string, EquipmentRuleConfig>,
  overrides: Record<string, EquipmentRuleConfig> | undefined,
  key: string,
): EquipmentRuleConfig {
  return { ...defaults[key], ...overrides?.[key] }
}

export function presentEquipmentRule(target: Rule, config: EquipmentRuleConfig, base: StyleData = {}): Rule {
  const { preset, ...inline } = config.style ?? {}
  const styles = filterStyles as Record<string, StyleData>
  target.style({ ...base, ...(preset ? styles[preset] : {}), ...inline })
  if (config.icon?.enabled !== false && (config.icon?.iconColor || config.icon?.iconShape)) {
    target.icon(config.icon.iconColor ?? "Cyan", config.icon.iconShape ?? "Circle", config.icon.iconSize ?? 2)
  }
  const sound = config.sound
  if (sound?.enabled === false) return target
  if (sound?.tts) {
    const manifest = MANIFEST_BY_ID[sound.tts as SoundManifestId]
    target.tts(manifest ? manifestSoundFile(manifest) : soundFileTTS(sound.tts))
  } else if (sound?.soundFileName) target.customSound(soundFile(sound.soundFileName))
  else if (sound?.soundId !== undefined) target.sound(sound.soundId)
  return target
}

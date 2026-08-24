import rule from "../../../rule"
import type { Color, Mixin, NumberRange, Rule, Shape } from "../../../types"
import { filterStyles, soundFile, styleMixin } from "../styles"
import { soundFileTTS, manifestSoundFile } from "../../../sounds/paths"
import type { SoundManifestEntry } from "../../../sounds/manifest"
import { compileRules } from "./composition"
import type { TtsFile } from "./options"

export const buildTierCurrency = (
  style: keyof typeof filterStyles,
  entries: Array<{
    baseTypes: string[]
    iconColor: Color
    iconShape: Shape
    soundId?: NumberRange<1, 16>
    soundFileName?: string
    tts?: TtsFile
  }>,
) =>
  compileRules(
    rule(
      ...entries.map(({ baseTypes, iconColor, iconShape, soundId, soundFileName, tts }) => {
        const builtRule = rule()
          .baseType(...baseTypes)
          .icon(iconColor, iconShape)
        if (tts) builtRule.tts(typeof tts === "string" ? soundFileTTS(tts) : manifestSoundFile(tts))
        else if (soundFileName) builtRule.customSound(soundFile(soundFileName))
        else if (soundId !== undefined) builtRule.sound(soundId)
        return builtRule
      }),
    ).mixin(styleMixin(filterStyles[style])),
  )

export const buildFlaskRule = ({
  baseTypes,
  itemClass,
  rarity,
  maxAreaLevel,
  iconColor,
  text,
  style,
}: {
  baseTypes: readonly string[]
  itemClass: "Life Flasks" | "Mana Flasks"
  rarity: "Normal" | "Magic"
  maxAreaLevel?: number
  iconColor: Color
  text: SoundManifestEntry
  style: Mixin
}) => {
  const builtRule = rule()
    .itemClass(itemClass)
    .baseType(...baseTypes)
    .rarity("==", rarity)
    .icon(iconColor, "Raindrop")
    .mixin(style)
  if (maxAreaLevel !== undefined) builtRule.areaLevel("<=", maxAreaLevel)
  return builtRule.tts(manifestSoundFile(text))
}

export const buildFlaskSeries = ({
  itemClass,
  iconColor,
  style,
  entries,
}: {
  itemClass: "Life Flasks" | "Mana Flasks"
  iconColor: Color
  style: "lifeFlask" | "manaFlask"
  entries: Array<{ baseTypes: string[]; maxAreaLevel?: number; text: SoundManifestEntry }>
}) =>
  entries.flatMap(({ baseTypes, maxAreaLevel, text }) => [
    buildFlaskRule({
      itemClass,
      baseTypes,
      rarity: "Normal",
      maxAreaLevel,
      iconColor,
      text,
      style: styleMixin(filterStyles[style]),
    }),
    buildFlaskRule({
      itemClass,
      baseTypes,
      rarity: "Magic",
      maxAreaLevel,
      iconColor,
      text,
      style: styleMixin(filterStyles[style]),
    }),
  ])

export const buildUtilityFlaskRules = (entries: Array<{ baseType: string; text: SoundManifestEntry }>) =>
  entries.map(({ baseType, text }) =>
    rule()
      .itemClass("Utility Flasks")
      .baseType(baseType)
      .icon("Green", "Raindrop")
      .mixin(styleMixin(filterStyles.utilityFlask))
      .tts(manifestSoundFile(text)),
  )

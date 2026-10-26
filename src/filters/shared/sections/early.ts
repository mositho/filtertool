import rule from "../../../rule"
import { filterDefaults } from "../defaults"
import { filterStyles, styleMixin } from "../styles"
import { manifestSoundFile } from "../../../sounds/paths"
import { MANIFEST_BY_ID } from "../../../sounds/manifest"
import { compileRules, withHeading } from "./composition"
import { ARMOUR_CLASSES, defenceMixinMap } from "./item-classes"
import type { BuildProfile, EarlyConfig } from "./options"
import { resolveShieldProgressionMode } from "./options"
import { equipmentRule, presentEquipmentRule } from "./equipment-rule-config"

const RUSTIC_SASH_MAX_AREA_LEVEL = 12

export const twilightStrand = () => withHeading("Twilight Strand", compileRules(rule().rarity("==", "Normal").areaLevel("==", 1).size(45)))

export const earlySockets = ({
  earlyMaxAreaLevel = filterDefaults.early.earlyMaxAreaLevel,
  twoSocketMaxAreaLevel = filterDefaults.early.twoSocketMaxAreaLevel,
  threeSocketMaxAreaLevel = filterDefaults.early.threeSocketMaxAreaLevel ?? earlyMaxAreaLevel,
  rules,
}: EarlyConfig = {}) => {
  const armourRule = (count: number, cutoff: number, size: number) => {
    const config = equipmentRule(filterDefaults.early.rules, rules, `armour${count}`)
    return (
      config.enabled !== false &&
      presentEquipmentRule(
        rule()
          .sockets("==", count)
          .itemClass(...ARMOUR_CLASSES)
          .areaLevel("<=", config.maxAreaLevel ?? cutoff),
        config,
        { size },
      )
    )
  }

  return withHeading("Early Sockets", compileRules(armourRule(2, twoSocketMaxAreaLevel, 40), armourRule(3, threeSocketMaxAreaLevel, 45)))
}

export const early = ({
  shieldProgression,
  preferredArmour = filterDefaults.preferredArmour,
  earlyMaxAreaLevel = filterDefaults.early.earlyMaxAreaLevel,
  shieldMaxAreaLevel = filterDefaults.early.shieldMaxAreaLevel ?? earlyMaxAreaLevel,
  earlyBootsMaxAreaLevel = filterDefaults.early.earlyBootsMaxAreaLevel,
  misc,
}: Partial<BuildProfile> & EarlyConfig) => {
  const shieldMode = resolveShieldProgressionMode(shieldProgression)
  const showRusticSash = misc?.showRusticSash ?? filterDefaults.misc.showRusticSash
  return withHeading(
    "Early",
    compileRules(
      rule()
        .itemClass("Boots")
        .areaLevel("<=", earlyBootsMaxAreaLevel)
        .rarity("==", "Rare")
        .mixin(styleMixin(filterStyles.rareArmour))
        .tts(manifestSoundFile(MANIFEST_BY_ID.rare_boots)),
      shieldMode !== "none" &&
        rule().itemClass("Shields").areaLevel("<=", shieldMaxAreaLevel).mixin(styleMixin(filterStyles.earlyShieldBase)),
      ...(shieldMode === "full"
        ? preferredArmour.map((defenceType) =>
            rule()
              .itemClass("Shields")
              .areaLevel(">", shieldMaxAreaLevel)
              .rarity("==", "Rare")
              .mixin(styleMixin(filterStyles.rareArmour))
              .mixin(defenceMixinMap[defenceType]),
          )
        : []),
      showRusticSash &&
        rule()
          .baseType("Rustic")
          .itemClass("Belts")
          .areaLevel("<=", RUSTIC_SASH_MAX_AREA_LEVEL)
          .icon("White", "Pentagon")
          .mixin(styleMixin(filterStyles.jewellery))
          .tts(manifestSoundFile(MANIFEST_BY_ID.rustic_sash)),
    ),
  )
}

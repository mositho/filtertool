import rule from "../../../rule"
import { filterDefaults } from "../defaults"
import { filterStyles, styleMixin } from "../styles"
import { manifestSoundFile } from "../../../sounds/paths"
import { MANIFEST_BY_ID } from "../../../sounds/manifest"
import { compileRules, withHeading } from "./composition"
import { ARMOUR_CLASSES, defenceMixinMap } from "./item-classes"
import type { BuildProfile, EarlyConfig } from "./options"
import { resolveShieldProgressionMode } from "./options"
import { isWeaponBaseType, isWeaponItemClass, resolveWeaponBaseTypes } from "./weapon-queries"
import { WEAPON_BASE_DATA } from "../../../types/weapon-base-data"
import { orderedWeaponPhases } from "./weapon-phases"

const RUSTIC_SASH_MAX_AREA_LEVEL = 12

export const twilightStrand = () => withHeading("Twilight Strand", compileRules(rule().rarity("==", "Normal").areaLevel("==", 1).size(45)))

export const earlySockets = ({
  weaponPhases = [],
  twoSocketMaxAreaLevel = filterDefaults.early.twoSocketMaxAreaLevel,
  threeSocketMaxAreaLevel = filterDefaults.early.threeSocketMaxAreaLevel,
}: Partial<BuildProfile> & EarlyConfig = {}) => {
  const dropLevels = new Map<string, number>(WEAPON_BASE_DATA.map((weapon) => [weapon.baseType, weapon.dropLevel]))
  const weaponRules = orderedWeaponPhases(weaponPhases).flatMap((phase) => {
    const itemClasses = phase.itemClasses?.filter(isWeaponItemClass) ?? []
    const baseTypes = phase.baseTypes?.filter(isWeaponBaseType) ?? []
    const hasTargets = itemClasses.length > 0 || baseTypes.length > 0
    const bases = hasTargets ? resolveWeaponBaseTypes({ itemClasses, baseTypes, minAps: phase.minAps }) : []
    return (
      [
        { count: 2, cutoff: twoSocketMaxAreaLevel, size: 40 },
        { count: 3, cutoff: threeSocketMaxAreaLevel, size: 45 },
      ] as const
    ).flatMap(({ count, cutoff, size }) => {
      return bases.flatMap((baseType) => {
        const dropLevel = dropLevels.get(baseType)
        const maximum = Math.min(
          cutoff,
          phase.maxAreaLevel ?? cutoff,
          dropLevel === undefined ? cutoff : dropLevel + (phase.weaponCutoffOverlap ?? 5),
        )
        if (phase.minAreaLevel !== undefined && phase.minAreaLevel > maximum) return []
        const socketRule = rule().sockets("==", count).baseType(baseType).areaLevel("<=", maximum).size(size)
        if (phase.minAreaLevel !== undefined) socketRule.areaLevel(">=", phase.minAreaLevel)
        return [socketRule]
      })
    })
  })

  return withHeading(
    "Early Sockets",
    compileRules(
      rule()
        .sockets("==", 2)
        .itemClass(...ARMOUR_CLASSES)
        .areaLevel("<=", twoSocketMaxAreaLevel)
        .size(40),
      rule()
        .sockets("==", 3)
        .itemClass(...ARMOUR_CLASSES)
        .areaLevel("<=", threeSocketMaxAreaLevel)
        .size(45),
      ...weaponRules,
    ),
  )
}

export const early = ({
  shieldProgression,
  preferredArmour = filterDefaults.preferredArmour,
  earlyMaxAreaLevel = filterDefaults.early.earlyMaxAreaLevel,
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
        rule().itemClass("Shields").areaLevel("<=", earlyMaxAreaLevel).mixin(styleMixin(filterStyles.earlyShieldBase)),
      ...(shieldMode === "full"
        ? preferredArmour.map((defenceType) =>
            rule()
              .itemClass("Shields")
              .areaLevel(">", earlyMaxAreaLevel)
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

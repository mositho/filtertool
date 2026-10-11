import rule from "../../../rule"
import { filterDefaults } from "../defaults"
import { filterStyles, styleMixin } from "../styles"
import { manifestSoundFile } from "../../../sounds/paths"
import { MANIFEST_BY_ID } from "../../../sounds/manifest"
import { compileRules, withHeading } from "./composition"
import { ARMOUR_CLASSES, defenceMixinMap } from "./item-classes"
import type { BuildProfile, EarlyConfig } from "./options"
import { resolveShieldProgressionMode } from "./options"
import { resolveSharedWeaponQuery, resolveWeaponBaseTypes } from "./weapon-queries"
import { WEAPON_BASE_DATA } from "../../../types/weapon-base-data"

const RUSTIC_SASH_MAX_AREA_LEVEL = 12

export const twilightStrand = () => withHeading("Twilight Strand", compileRules(rule().rarity("==", "Normal").areaLevel("==", 1).size(45)))

export const earlySockets = ({
  preferredWeapons,
  weaponPhases,
  twoSocketMaxAreaLevel = filterDefaults.early.twoSocketMaxAreaLevel,
  threeSocketMaxAreaLevel = filterDefaults.early.threeSocketMaxAreaLevel,
}: Partial<BuildProfile> & EarlyConfig = {}) => {
  if (weaponPhases === undefined) {
    const query = resolveSharedWeaponQuery({ preferredWeapons })
    const hasTargets = query.itemClasses.length > 0 || query.baseTypes.length > 0
    const bases = hasTargets ? resolveWeaponBaseTypes({ itemClasses: query.itemClasses, baseTypes: query.baseTypes }) : []
    const itemClasses = [...ARMOUR_CLASSES, ...query.itemClasses]
    return withHeading(
      "Early Sockets",
      compileRules(
        rule()
          .sockets("==", 2)
          .itemClass(...itemClasses)
          .areaLevel("<=", twoSocketMaxAreaLevel)
          .size(40),
        bases.length > 0 &&
          rule()
            .sockets("==", 2)
            .baseType(...bases)
            .areaLevel("<=", twoSocketMaxAreaLevel)
            .size(40),
        rule()
          .sockets("==", 3)
          .itemClass(...itemClasses)
          .areaLevel("<=", threeSocketMaxAreaLevel)
          .size(45),
        bases.length > 0 &&
          rule()
            .sockets("==", 3)
            .baseType(...bases)
            .areaLevel("<=", threeSocketMaxAreaLevel)
            .size(45),
      ),
    )
  }

  const weaponTargets = weaponPhases.map((phase) => ({ ...phase, ...resolveSharedWeaponQuery({ preferredWeapons: phase }) }))
  const dropLevels = new Map<string, number>(WEAPON_BASE_DATA.map((weapon) => [weapon.baseType, weapon.dropLevel]))
  let fromAreaLevel = 0
  const weaponRules = weaponTargets.flatMap((target) => {
    const hasTargets = target.itemClasses.length > 0 || target.baseTypes.length > 0
    const bases = hasTargets
      ? resolveWeaponBaseTypes({ itemClasses: target.itemClasses, baseTypes: target.baseTypes, minAps: target.minAps })
      : []
    const phaseEnd = target.untilAreaLevel
    const from = fromAreaLevel
    if (phaseEnd !== undefined) fromAreaLevel = phaseEnd + 1
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
          phaseEnd ?? cutoff,
          dropLevel === undefined ? cutoff : dropLevel + (target.weaponCutoffOverlap ?? 5),
        )
        return from <= maximum
          ? [rule().sockets("==", count).baseType(baseType).areaLevel("<=", maximum).areaLevel(">=", from).size(size)]
          : []
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

import rule from "../../../rule"
import { filterDefaults } from "../defaults"
import { filterStyles, styleMixin } from "../styles"
import { manifestSoundFile } from "../../../sounds/paths"
import { MANIFEST_BY_ID } from "../../../sounds/manifest"
import { compileRules, withHeading } from "./composition"
import { buildHighlightedBaseTypeRules } from "./highlighted-equipment"
import { ARMOUR_CLASSES, defenceMixinMap } from "./item-classes"
import type { BuildProfile, EarlyConfig } from "./options"
import { resolveShieldProgressionMode } from "./options"
import { resolveSharedWeaponQuery, resolveWeaponBaseTypes } from "./weapon-queries"

const RUSTIC_SASH_MAX_AREA_LEVEL = 12

export const twilightStrand = () => withHeading("Twilight Strand", compileRules(rule().areaLevel("==", 1).size(45)))

export const earlySockets = ({
  earlyWeapons,
  preferredWeapons,
  twoSocketMaxAreaLevel = filterDefaults.early.twoSocketMaxAreaLevel,
  threeSocketMaxAreaLevel = filterDefaults.early.threeSocketMaxAreaLevel,
}: Partial<BuildProfile> & EarlyConfig = {}) => {
  const resolvedEarlyWeapons = resolveSharedWeaponQuery({ earlyWeapons, preferredWeapons })
  const resolvedWeaponBaseTypes = resolveWeaponBaseTypes({
    itemClasses: resolvedEarlyWeapons.itemClasses,
    baseTypes: resolvedEarlyWeapons.baseTypes,
  })
  const itemClasses = [...ARMOUR_CLASSES, ...resolvedEarlyWeapons.itemClasses]

  return withHeading(
    "Early Sockets",
    compileRules(
      rule()
        .sockets("==", 2)
        .itemClass(...itemClasses)
        .areaLevel("<=", twoSocketMaxAreaLevel)
        .size(40),
      resolvedWeaponBaseTypes.length > 0 &&
        rule()
          .sockets("==", 2)
          .baseType(...resolvedWeaponBaseTypes)
          .areaLevel("<=", twoSocketMaxAreaLevel)
          .size(40),
      rule()
        .sockets("==", 3)
        .itemClass(...itemClasses)
        .areaLevel("<=", threeSocketMaxAreaLevel)
        .size(45),
      resolvedWeaponBaseTypes.length > 0 &&
        rule()
          .sockets("==", 3)
          .baseType(...resolvedWeaponBaseTypes)
          .areaLevel("<=", threeSocketMaxAreaLevel)
          .size(45),
    ),
  )
}

export const early = ({
  earlyWeapons,
  shieldProgression,
  preferredArmour = filterDefaults.preferredArmour,
  earlyMaxAreaLevel = filterDefaults.early.earlyMaxAreaLevel,
  earlyBootsMaxAreaLevel = filterDefaults.early.earlyBootsMaxAreaLevel,
  misc,
}: Partial<BuildProfile> & EarlyConfig) => {
  const shieldMode = resolveShieldProgressionMode(shieldProgression)
  const showRusticSash = misc?.showRusticSash ?? filterDefaults.misc.showRusticSash
  const hasEarlyWeaponTargets = (earlyWeapons?.itemClasses?.length ?? 0) > 0 || (earlyWeapons?.baseTypes?.length ?? 0) > 0
  const earlyWeaponHighlights =
    earlyWeapons && hasEarlyWeaponTargets
      ? buildHighlightedBaseTypeRules({ ...earlyWeapons, maxAreaLevel: earlyWeapons.maxAreaLevel ?? earlyMaxAreaLevel })
      : []

  return withHeading(
    "Early",
    compileRules(
      ...earlyWeaponHighlights,
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

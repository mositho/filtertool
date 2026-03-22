import rule from "../../../rule"
import { filterDefaults } from "../defaults"
import { filterStyles, soundFile, styleMixin } from "../styles"
import {
  applyHighlightTargets,
  ARMOUR_CLASSES,
  BuildProfile,
  compileRules,
  EarlyConfig,
  EarlySocketsConfig,
  normalizeShieldProgressionConfig,
  resolveMixedItemClassWeaponQuery,
  resolveWeaponBaseTypes,
  SOCKETABLE_CLASSES,
  withHeading,
} from "./helpers"

export const twilightStrand = () =>
  withHeading(
    "Twilight Strand",
    compileRules(
      rule()
        .baseType("Rusted Sword", "Crude Bow", "Glass Shank", "Driftwood Wand", "Driftwood Club", "Driftwood Sceptre")
        .areaLevel("==", 1)
        .size(45),
      rule().itemClass("Gems").areaLevel("==", 1).size(45),
    ),
  )

export const earlySockets = ({
  preferredWeaponItemClasses = [],
  preferredWeaponMinAps,
  weaponItemClasses = preferredWeaponItemClasses,
  weaponBaseTypes = [],
  weaponMinAps = preferredWeaponMinAps,
}: EarlySocketsConfig & Partial<BuildProfile> = {}) => {
  const resolvedWeaponBaseTypes = resolveWeaponBaseTypes({
    itemClasses: weaponItemClasses,
    baseTypes: weaponBaseTypes,
    minAps: weaponMinAps,
  })
  const itemClasses = weaponMinAps === undefined ? [...ARMOUR_CLASSES, ...weaponItemClasses] : ARMOUR_CLASSES
  const twoSocketMaxAreaLevel = filterDefaults.early.twoSocketMaxAreaLevel
  const threeSocketMaxAreaLevel = filterDefaults.early.threeSocketMaxAreaLevel

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
  preferredWeaponItemClasses = [],
  preferredWeaponMinAps,
  weaponHighlights = [],
  earlyMaxAreaLevel = filterDefaults.campaign.earlyMaxAreaLevel,
  showRustic = filterDefaults.early.showRustic,
  includeMomentumColors = filterDefaults.early.includeMomentumColors,
  momentumColors,
  momentumMaxAreaLevel = filterDefaults.early.momentumMaxAreaLevel,
  shieldProgression,
}: EarlyConfig & Partial<BuildProfile>) => {
  const earlyBootsMaxAreaLevel = filterDefaults.early.earlyBootsMaxAreaLevel
  const shieldConfig = normalizeShieldProgressionConfig(shieldProgression)
  const defaultMomentumItemClasses = shieldConfig.enabled ? SOCKETABLE_CLASSES : ARMOUR_CLASSES
  const { itemClasses: momentumItemClasses, baseTypes: momentumBaseTypes } = resolveMixedItemClassWeaponQuery({
    itemClasses: momentumColors?.itemClasses ?? [...defaultMomentumItemClasses, ...preferredWeaponItemClasses],
    baseTypes: momentumColors?.baseTypes,
    minAps: momentumColors?.minAps ?? preferredWeaponMinAps,
  })
  const effectiveMomentumMaxAreaLevel = momentumColors?.maxAreaLevel ?? momentumMaxAreaLevel
  const buildMomentumRule = () =>
    rule()
      .socketGroup(">=", "RGG")
      .areaLevel("<=", effectiveMomentumMaxAreaLevel)
      .mixin(styleMixin(filterStyles.momentum))
      .icon("Orange", "Kite")
  const buildWeaponHighlightRules = ({ baseTypes, itemClasses, maxAreaLevel = earlyMaxAreaLevel }: (typeof weaponHighlights)[number]) => {
    const buildBaseRule = (rarity: "Rare" | "Magic" | "Normal") =>
      applyHighlightTargets(rule().rarity("==", rarity).areaLevel("<=", maxAreaLevel), { baseTypes, itemClasses })

    return [
      buildBaseRule("Rare").mixin(styleMixin(filterStyles.earlyWeaponRare)).icon("Yellow", "UpsideDownHouse").sound(3),
      buildBaseRule("Magic").mixin(styleMixin(filterStyles.earlyWeaponMagic)).icon("Blue", "UpsideDownHouse"),
      buildBaseRule("Normal").mixin(styleMixin(filterStyles.earlyWeaponNormal)).icon("Cyan", "UpsideDownHouse"),
    ]
  }

  return withHeading(
    "Early",
    compileRules(
      ...weaponHighlights.flatMap(buildWeaponHighlightRules),
      rule()
        .itemClass("Boots")
        .areaLevel("<=", earlyBootsMaxAreaLevel)
        .rarity("==", "Rare")
        .mixin(styleMixin(filterStyles.rareArmour))
        .customSound(soundFile("rare_boots.mp3")),
      shieldConfig.enabled &&
        rule()
          .itemClass("Shields")
          .socketGroup(">=", "RG")
          .areaLevel("<=", earlyMaxAreaLevel)
          .mixin(styleMixin(filterStyles.earlyShieldLink)),
      shieldConfig.enabled &&
        rule().itemClass("Shields").areaLevel("<=", earlyMaxAreaLevel).mixin(styleMixin(filterStyles.earlyShieldBase)),
      showRustic &&
        rule()
          .baseType("Rustic")
          .itemClass("Belts")
          .areaLevel("<=", earlyMaxAreaLevel)
          .icon("White", "Pentagon")
          .mixin(styleMixin(filterStyles.jewellery))
          .customSound(soundFile("rustic.mp3")),
      ...(includeMomentumColors
        ? [
            momentumItemClasses.length > 0 && buildMomentumRule().itemClass(...momentumItemClasses),
            momentumBaseTypes && momentumBaseTypes.length > 0 && buildMomentumRule().baseType(...momentumBaseTypes),
          ]
        : []),
    ),
  )
}

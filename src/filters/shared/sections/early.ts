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
  resolveSharedWeaponQuery,
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
  earlyWeapons,
  preferredWeaponItemClasses = [],
  preferredWeaponMinAps,
}: EarlySocketsConfig & Partial<BuildProfile> = {}) => {
  const resolvedEarlyWeapons = resolveSharedWeaponQuery({
    sharedWeapons: earlyWeapons,
    preferredWeaponItemClasses,
    preferredWeaponMinAps,
  })
  const resolvedWeaponBaseTypes = resolveWeaponBaseTypes({
    itemClasses: resolvedEarlyWeapons.itemClasses,
    baseTypes: resolvedEarlyWeapons.baseTypes,
    minAps: resolvedEarlyWeapons.minAps,
  })
  const effectiveWeaponItemClasses = resolvedEarlyWeapons.itemClasses
  const effectiveWeaponMinAps = resolvedEarlyWeapons.minAps
  const itemClasses = effectiveWeaponMinAps === undefined ? [...ARMOUR_CLASSES, ...effectiveWeaponItemClasses] : ARMOUR_CLASSES
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
  earlyWeapons,
  preferredWeaponItemClasses = [],
  preferredWeaponMinAps,
  earlyMaxAreaLevel = filterDefaults.campaign.earlyMaxAreaLevel,
  showRustic = filterDefaults.early.showRustic,
  includeMomentumColors = filterDefaults.early.includeMomentumColors,
  momentumColors,
  momentumMaxAreaLevel = filterDefaults.early.momentumMaxAreaLevel,
  shieldProgression,
}: EarlyConfig & Partial<BuildProfile>) => {
  const resolvedEarlyWeapons = resolveSharedWeaponQuery({
    sharedWeapons: earlyWeapons,
    preferredWeaponItemClasses,
    preferredWeaponMinAps,
  })
  const earlyBootsMaxAreaLevel = filterDefaults.early.earlyBootsMaxAreaLevel
  const shieldConfig = normalizeShieldProgressionConfig(shieldProgression)
  const defaultMomentumItemClasses = shieldConfig.enabled ? SOCKETABLE_CLASSES : ARMOUR_CLASSES
  const { itemClasses: momentumItemClasses = [], baseTypes: momentumBaseTypes = [] } = resolveMixedItemClassWeaponQuery({
    itemClasses: momentumColors?.itemClasses ?? [...defaultMomentumItemClasses, ...resolvedEarlyWeapons.itemClasses],
    baseTypes: momentumColors?.baseTypes ?? resolvedEarlyWeapons.baseTypes,
    minAps: momentumColors?.minAps ?? resolvedEarlyWeapons.minAps,
  })
  const effectiveMomentumMaxAreaLevel = momentumColors?.maxAreaLevel ?? momentumMaxAreaLevel
  const buildMomentumRule = () =>
    rule()
      .socketGroup(">=", "RGG")
      .areaLevel("<=", effectiveMomentumMaxAreaLevel)
      .mixin(styleMixin(filterStyles.momentum))
      .icon("Orange", "Kite")
  const buildWeaponHighlightRules = ({
    baseTypes,
    itemClasses,
    minAps,
    maxAreaLevel = earlyMaxAreaLevel,
  }: {
    baseTypes?: readonly string[]
    itemClasses?: readonly string[]
    minAps?: number
    maxAreaLevel?: number
  }) => {
    const { itemClasses: resolvedItemClasses, baseTypes: resolvedBaseTypes } = resolveMixedItemClassWeaponQuery({
      itemClasses,
      baseTypes,
      minAps,
    })
    const hasTargets = (resolvedItemClasses?.length ?? 0) > 0 || (resolvedBaseTypes?.length ?? 0) > 0

    if (!hasTargets) {
      return []
    }

    const buildBaseRule = (rarity: "Rare" | "Magic" | "Normal") =>
      applyHighlightTargets(rule().rarity("==", rarity).areaLevel("<=", maxAreaLevel), {
        baseTypes: resolvedBaseTypes.length > 0 ? resolvedBaseTypes : undefined,
        itemClasses: resolvedItemClasses,
      })

    return [
      buildBaseRule("Rare").mixin(styleMixin(filterStyles.highlightedEquipmentRare)).icon("Yellow", "UpsideDownHouse").sound(3),
      buildBaseRule("Magic").mixin(styleMixin(filterStyles.highlightedEquipmentMagic)).icon("Blue", "UpsideDownHouse"),
      buildBaseRule("Normal").mixin(styleMixin(filterStyles.highlightedEquipmentNormal)).icon("Cyan", "UpsideDownHouse"),
    ]
  }
  const sharedEarlyWeaponHighlights =
    resolvedEarlyWeapons.baseTypes.length > 0 || resolvedEarlyWeapons.itemClasses.length > 0 || resolvedEarlyWeapons.minAps !== undefined
      ? [resolvedEarlyWeapons]
      : []

  return withHeading(
    "Early",
    compileRules(
      ...sharedEarlyWeaponHighlights.flatMap(buildWeaponHighlightRules),
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

import rule from "../../../rule"
import { filterStyles, soundFile, styleMixin } from "../styles"
import { applyHighlightTargets, compileRules, EarlyActsConfig, EarlySocketFallbacksConfig, normalizeShieldProgressionConfig, SOCKETABLE_CLASSES, withHeading } from "./helpers"

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

export const earlySocketFallbacks = ({ weaponItemClasses = [], weaponBaseTypes = [] }: EarlySocketFallbacksConfig = {}) => {
  const itemClasses = [...SOCKETABLE_CLASSES, ...weaponItemClasses]

  return withHeading(
    "Early Socket Fallbacks",
    compileRules(
      rule()
        .sockets("==", 3)
        .itemClass(...itemClasses)
        .areaLevel("<=", 16)
        .size(45),
      weaponBaseTypes.length > 0 &&
        rule()
          .sockets("==", 3)
          .baseType(...weaponBaseTypes)
          .areaLevel("<=", 16)
          .size(45),
      rule()
        .socketGroup(">=", "G", "B", "R")
        .itemClass(...itemClasses)
        .areaLevel("<=", 10)
        .size(40),
      weaponBaseTypes.length > 0 &&
        rule()
          .socketGroup(">=", "G", "B", "R")
          .baseType(...weaponBaseTypes)
          .areaLevel("<=", 10)
          .size(40),
      rule()
        .rarity("==", "Magic")
        .itemClass(...itemClasses)
        .areaLevel("<=", 10)
        .size(40),
      weaponBaseTypes.length > 0 &&
        rule()
          .rarity("==", "Magic")
          .baseType(...weaponBaseTypes)
          .areaLevel("<=", 10)
          .size(40),
      rule()
        .rarity("==", "Normal")
        .itemClass(...itemClasses)
        .areaLevel("<=", 4)
        .size(40),
      weaponBaseTypes.length > 0 &&
        rule()
          .rarity("==", "Normal")
          .baseType(...weaponBaseTypes)
          .areaLevel("<=", 4)
          .size(40),
    ),
  )
}

export const earlyActs = ({
  weaponHighlights = [],
  shieldProgression,
  earlyMaxAreaLevel = 13,
  showRustic = true,
  includeMomentumColors = true,
  momentumSocketGroups = ["RRG"],
  momentumMaxAreaLevel = 20,
}: EarlyActsConfig) => {
  const shieldConfig = normalizeShieldProgressionConfig(shieldProgression)
  const buildWeaponHighlightRules = ({ baseTypes, itemClasses, maxAreaLevel = earlyMaxAreaLevel }: (typeof weaponHighlights)[number]) => {
    const buildBaseRule = (rarityOperator: "==" | "<") =>
      applyHighlightTargets(rule().rarity(rarityOperator, "Rare").areaLevel("<=", maxAreaLevel), { baseTypes, itemClasses })

    return [
      buildBaseRule("==").mixin(styleMixin(filterStyles.earlyWeaponRare)).icon("Yellow", "UpsideDownHouse").sound(3),
      buildBaseRule("<").mixin(styleMixin(filterStyles.earlyWeaponBase)).icon("Cyan", "UpsideDownHouse"),
    ]
  }

  return withHeading(
    "Early Acts",
    compileRules(
      ...weaponHighlights.flatMap(buildWeaponHighlightRules),
      shieldConfig.enabled &&
        rule()
          .itemClass("Shields")
          .socketGroup(">=", "RG")
          .areaLevel("<=", shieldConfig.maxAreaLevel)
          .mixin(styleMixin(filterStyles.earlyShieldLink)),
      shieldConfig.enabled &&
        rule()
          .itemClass("Shields")
          .baseES("==", 0)
          .areaLevel("<=", shieldConfig.maxAreaLevel)
          .mixin(styleMixin(filterStyles.earlyShieldBase)),
      showRustic &&
        rule()
          .baseType("Rustic")
          .itemClass("Belts")
          .areaLevel("<=", 12)
          .icon("White", "Pentagon")
          .mixin(styleMixin(filterStyles.rareAccessory))
          .customSound(soundFile("rustic.mp3")),
      includeMomentumColors &&
        rule()
          .socketGroup(">=", ...momentumSocketGroups)
          .areaLevel("<=", momentumMaxAreaLevel)
          .mixin(styleMixin(filterStyles.momentum))
          .icon("Orange", "Kite"),
    ),
  )
}

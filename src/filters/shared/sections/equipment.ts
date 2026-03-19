import rule from "../../../rule"
import { filterStyles, soundFile, styleMixin } from "../styles"
import {
  BuildProfile,
  buildFlaskSeries,
  buildGenericFourLinkRules,
  buildHighlightedBaseTypeRule,
  buildItemClassSocketRules,
  buildUtilityFlaskRules,
  ChromaticItemsConfig,
  compileRules,
  defenceMixinMap,
  getShieldThreeLinkSoundPrefix,
  getSocketPatternSoundPrefix,
  HighlightedEquipmentConfig,
  ARMOUR_CLASSES,
  LinksConfig,
  normalizeShieldProgressionConfig,
  normalizeGenericFourLinkConfig,
  normalizeSocketPatternConfig,
  RareItemsConfig,
  SOCKETABLE_CLASSES,
  SocketBasesConfig,
  TincturesConfig,
  withHeading,
} from "./helpers"

export const links = ({
  twoLinkPatterns = [],
  twoLinkMaxAreaLevel,
  threeLinkPatterns = [],
  threeLinkMaxAreaLevel = 33,
  fourLinkPatterns = [],
  genericFourLinks,
  preferredArmourTypes,
  shieldProgression,
}: LinksConfig & Partial<BuildProfile>) =>
  {
    const shieldConfig = normalizeShieldProgressionConfig(shieldProgression)
    const genericThreeLinkClasses = shieldConfig.enabled ? SOCKETABLE_CLASSES : ARMOUR_CLASSES
    const genericFourLinkEntries = genericFourLinks ?? preferredArmourTypes ?? []

    return withHeading(
      "Links",
      compileRules(
      rule().linkedSockets("=", 6).icon("Red", "Diamond").mixin(styleMixin(filterStyles.priorityA)).customSound(soundFile("6_link.mp3")),
      rule().linkedSockets("=", 5).icon("Orange", "Diamond").mixin(styleMixin(filterStyles.priorityB)).customSound(soundFile("5_link.mp3")),
      ...fourLinkPatterns.flatMap((entry) => {
        const { pattern, maxAreaLevel, itemClasses } = normalizeSocketPatternConfig(entry)

        return buildItemClassSocketRules({
          linkedSockets: 4,
          pattern,
          itemClasses,
          soundPrefix: getSocketPatternSoundPrefix(pattern),
          iconColor: "Cyan",
          maxAreaLevel,
          style: styleMixin(filterStyles.fourLink),
        })
      }),
      ...genericFourLinkEntries.flatMap((entry) => {
        const { defenceType, maxAreaLevel } = normalizeGenericFourLinkConfig(entry)

        return buildGenericFourLinkRules({
          defenceType,
          maxAreaLevel,
        })
      }),
      ...threeLinkPatterns.flatMap((entry) => {
        const { pattern, maxAreaLevel, itemClasses } = normalizeSocketPatternConfig(entry)

        return buildItemClassSocketRules({
          linkedSockets: 3,
          pattern,
          itemClasses,
          soundPrefix: getSocketPatternSoundPrefix(pattern),
          iconColor: "Green",
          maxAreaLevel,
          style: styleMixin(filterStyles.threeLink),
        })
      }),
      ...(shieldConfig.enabled
        ? threeLinkPatterns.flatMap((entry) => {
          const { pattern } = normalizeSocketPatternConfig(entry)

          return buildItemClassSocketRules({
            linkedSockets: 3,
            pattern,
            itemClasses: ["Shields"],
            soundPrefix: getShieldThreeLinkSoundPrefix(pattern),
            iconColor: "Green",
            maxAreaLevel: shieldConfig.maxAreaLevel,
            style: styleMixin(filterStyles.threeLink),
          })
        })
        : []),
      rule()
        .linkedSockets("==", 3)
        .itemClass(...genericThreeLinkClasses)
        .areaLevel("<=", threeLinkMaxAreaLevel)
        .icon("Green", "Diamond")
        .mixin(styleMixin(filterStyles.threeLink))
        .size(40),
      ...twoLinkPatterns.map((entry) => {
        const { pattern, maxAreaLevel, itemClasses } = normalizeSocketPatternConfig(entry)
        const builtRule = rule()
          .itemClass(...(itemClasses ?? SOCKETABLE_CLASSES))
          .socketGroup("==", pattern)
          .icon("Green", "Diamond")
          .mixin(styleMixin(filterStyles.twoLink))

        if (maxAreaLevel ?? twoLinkMaxAreaLevel) {
          builtRule.areaLevel("<=", maxAreaLevel ?? twoLinkMaxAreaLevel!)
        }

        return builtRule
      }),
      ),
    )
  }

export const sixSockets = () =>
  withHeading(
    "Six Sockets",
    compileRules(
      rule().sockets("==", 6).icon("Grey", "Diamond").mixin(styleMixin(filterStyles.sixSocket)).customSound(soundFile("6_socket.mp3")),
    ),
  )

export const highlightedEquipment = ({ highlights = [] }: HighlightedEquipmentConfig) =>
  withHeading("Highlighted Equipment", compileRules(...highlights.map(buildHighlightedBaseTypeRule)))

export const socketBases = ({
  preferredArmourTypes,
  itemClasses = ARMOUR_CLASSES,
  maxAreaLevel = 45,
  goodShieldBaseTypes = ["Painted Buckler", "War Buckler"],
  desiredThreeSocketGroups = ["RG"],
  goodThreeSocketMaxAreaLevel = 20,
  shieldProgression,
}: SocketBasesConfig & BuildProfile & { itemClasses?: typeof ARMOUR_CLASSES }) =>
  {
    const shieldConfig = normalizeShieldProgressionConfig(shieldProgression)

    return withHeading(
      "Socket Bases",
      compileRules(
      ...preferredArmourTypes.map((baseType) =>
        rule()
          .itemClass(...itemClasses)
          .sockets(">=", 4)
          .areaLevel("<=", maxAreaLevel)
          .mixin(defenceMixinMap[baseType])
          .icon("Cyan", "Diamond")
          .mixin(styleMixin(filterStyles.fourLink)),
      ),
      shieldConfig.enabled &&
        rule()
          .baseType(...goodShieldBaseTypes)
          .areaLevel("<=", shieldConfig.maxAreaLevel)
          .background(0, 50, 0)
          .size(45),
      rule()
        .sockets("==", 3)
        .itemClass(...itemClasses)
        .socketGroup(">=", ...desiredThreeSocketGroups)
        .areaLevel("<=", goodThreeSocketMaxAreaLevel)
        .border(255, 0, 127),
      ),
    )
  }

export const rareItems = ({
  preferredArmourTypes,
  weaponItemClasses = [],
  maxAreaLevel = 45,
  earlyBootClass = "Boots",
  earlyBootMaxAreaLevel = 24,
  shieldProgression,
}: RareItemsConfig & BuildProfile) => {
  const jewelleryClasses = ["Rings", "Amulets", "Belts"] as const
  const shieldConfig = normalizeShieldProgressionConfig(shieldProgression)

  return withHeading(
    "Rare Items",
    compileRules(
      rule()
        .itemClass(earlyBootClass)
        .areaLevel("<=", earlyBootMaxAreaLevel)
        .rarity("==", "Rare")
        .mixin(styleMixin(filterStyles.rareArmour))
        .customSound(soundFile("rare_boots.mp3")),
      rule().itemClass(earlyBootClass).rarity("==", "Rare").mixin(styleMixin(filterStyles.rareArmour)),
      ...preferredArmourTypes.map((baseType) =>
        rule()
          .itemClass(...ARMOUR_CLASSES)
          .areaLevel("<=", maxAreaLevel)
          .rarity("==", "Rare")
          .mixin(styleMixin(filterStyles.rareArmour))
          .mixin(defenceMixinMap[baseType]),
      ),
      rule()
        .itemClass(...ARMOUR_CLASSES)
        .rarity("==", "Rare")
        .areaLevel("<=", maxAreaLevel)
        .size(45),
      rule()
        .itemClass(...jewelleryClasses)
        .rarity("==", "Rare")
        .areaLevel("<=", maxAreaLevel)
        .size(45),
      shieldConfig.enabled &&
        rule().itemClass("Shields").rarity("==", "Rare").areaLevel("<=", shieldConfig.maxAreaLevel).size(45),
      weaponItemClasses.length > 0 &&
        rule()
          .itemClass(...weaponItemClasses)
          .rarity("==", "Rare")
          .icon("Cyan", "UpsideDownHouse")
          .mixin(styleMixin(filterStyles.highlightedEquipment)),
      rule().width("==", 2).height(">=", 4).areaLevel("<=", 12).rarity("==", "Rare").size(40),
      rule().width("==", 2).height(">=", 4).areaLevel("<=", maxAreaLevel).rarity("==", "Rare").size(35),
      rule().width("==", 2).height("==", 3).areaLevel("<=", 12).rarity("==", "Rare").size(45),
      rule().width("==", 2).height("==", 3).areaLevel("<=", maxAreaLevel).rarity("==", "Rare").size(40),
      rule().width("<=", 2).height("==", 1).rarity("==", "Rare").size(45),
      rule().areaLevel("<=", maxAreaLevel).rarity("==", "Rare").size(40),
    ),
  )
}

export const jewellery = () =>
  withHeading(
    "Jewellery",
    compileRules(
      rule()
        .baseType("Sapphire", "Ruby", "Topaz", "Two-Stone")
        .itemClass("Rings")
        .rarity("==", "Rare")
        .icon("Pink", "Moon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("rare_ring.mp3")),
      rule()
        .baseType("Amethyst")
        .itemClass("Rings")
        .rarity("==", "Rare")
        .icon("Brown", "Moon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("rare_amethyst.mp3")),
      rule()
        .baseType("Amethyst")
        .itemClass("Rings")
        .rarity("<=", "Rare")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("amethyst.mp3")),
      rule()
        .baseType("Iron")
        .itemClass("Rings")
        .areaLevel("<=", 16)
        .rarity("<=", "Rare")
        .icon("Purple", "Moon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("iron.mp3")),
      rule().baseType("Iron").itemClass("Rings").rarity("==", "Rare").icon("Purple", "Moon").mixin(styleMixin(filterStyles.rareAccessory)),
      rule()
        .baseType("Coral")
        .itemClass("Rings")
        .areaLevel("<=", 16)
        .rarity("<=", "Magic")
        .icon("Purple", "Moon")
        .mixin(styleMixin(filterStyles.rareAccessory)),
      rule().baseType("Coral").itemClass("Rings").rarity("==", "Rare").icon("Purple", "Moon").mixin(styleMixin(filterStyles.rareAccessory)),
      rule()
        .baseType("Sapphire")
        .itemClass("Rings")
        .areaLevel("<=", 45)
        .rarity("<=", "Rare")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("sapphire.mp3")),
      rule()
        .baseType("Ruby")
        .itemClass("Rings")
        .areaLevel("<=", 45)
        .rarity("<=", "Rare")
        .icon("Red", "Moon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("sapphire.mp3")),
      rule()
        .baseType("Topaz")
        .itemClass("Rings")
        .areaLevel("<=", 45)
        .rarity("<=", "Rare")
        .icon("Yellow", "Moon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("sapphire.mp3")),
      rule()
        .baseType("Two-Stone")
        .itemClass("Rings")
        .areaLevel("<=", 45)
        .rarity("<=", "Rare")
        .icon("Green", "Moon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("two_stone.mp3")),
      rule()
        .baseType("Leather")
        .itemClass("Belts")
        .rarity("==", "Rare")
        .icon("Yellow", "Pentagon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("rare_leather.mp3")),
      rule()
        .baseType("Leather")
        .itemClass("Belts")
        .areaLevel("<=", 45)
        .rarity("==", "Magic")
        .icon("Yellow", "Pentagon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("magic_leather.mp3")),
      rule()
        .baseType("Leather")
        .itemClass("Belts")
        .areaLevel("<=", 28)
        .rarity("==", "Normal")
        .icon("Yellow", "Pentagon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("leather_belt.mp3")),
      rule()
        .baseType("Heavy")
        .itemClass("Belts")
        .rarity("==", "Rare")
        .icon("Orange", "Pentagon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("rare_heavy.mp3")),
      rule()
        .baseType("Heavy")
        .itemClass("Belts")
        .areaLevel("<=", 45)
        .rarity("==", "Magic")
        .icon("Orange", "Pentagon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("magic_heavy.mp3")),
      rule()
        .baseType("Heavy")
        .itemClass("Belts")
        .areaLevel("<=", 28)
        .rarity("==", "Normal")
        .icon("Orange", "Pentagon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("heavy_belt.mp3")),
      rule()
        .baseType("Rustic")
        .itemClass("Belts")
        .rarity("==", "Rare")
        .icon("White", "Pentagon")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("rare_rustic.mp3")),
      rule().baseType("Chain").itemClass("Belts").areaLevel("<=", 12).mixin(styleMixin(filterStyles.rareAccessory)),
      rule()
        .baseType("Amber")
        .itemClass("Amulets")
        .areaLevel("<=", 24)
        .icon("Red", "Cross")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("amber.mp3")),
      rule()
        .baseType("Lapis")
        .itemClass("Amulets")
        .areaLevel("<=", 24)
        .icon("Red", "Cross")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("lapis.mp3")),
      rule()
        .baseType("Jade")
        .itemClass("Amulets")
        .areaLevel("<=", 24)
        .icon("Red", "Cross")
        .mixin(styleMixin(filterStyles.rareAccessory))
        .customSound(soundFile("jade.mp3")),
      rule()
        .baseType("Amber", "Jade", "Lapis", "Turquoise", "Onyx", "Agate", "Citrine")
        .itemClass("Amulets")
        .rarity("==", "Rare")
        .mixin(styleMixin(filterStyles.rareAccessory)),
    ),
  )

export const chromaticItems = ({ areaLevelCap = 20 }: ChromaticItemsConfig = {}) =>
  withHeading(
    "Chromatic Items",
    compileRules(
      rule()
        .width("==", 1)
        .height("==", 3)
        .socketGroup("==", "RGB")
        .mixin(styleMixin(filterStyles.chromatic))
        .customSound(soundFile("pop.mp3")),
      rule()
        .width("==", 2)
        .height("==", 2)
        .socketGroup("==", "RGB")
        .mixin(styleMixin(filterStyles.chromatic))
        .customSound(soundFile("pop.mp3")),
      rule()
        .width("==", 2)
        .height("==", 4)
        .socketGroup("==", "RGB")
        .areaLevel("<=", areaLevelCap)
        .mixin(styleMixin(filterStyles.chromatic))
        .customSound(soundFile("pop.mp3")),
    ),
  )

export const flasks = () =>
  withHeading(
    "Flasks",
    compileRules(
      ...buildFlaskSeries({
        itemClass: "Life Flasks",
        iconColor: "Red",
        style: "lifeFlask",
        entries: [
          { baseTypes: ["Small Life Flask"], maxAreaLevel: 12, soundFileName: "life.mp3" },
          { baseTypes: ["Medium Life Flask"], maxAreaLevel: 16, soundFileName: "medium_life.mp3" },
          { baseTypes: ["Large Life Flask"], maxAreaLevel: 24, soundFileName: "large_life.mp3" },
          { baseTypes: ["Greater Life Flask"], maxAreaLevel: 28, soundFileName: "greater_life.mp3" },
          { baseTypes: ["Grand Life Flask"], maxAreaLevel: 32, soundFileName: "grand_life.mp3" },
          { baseTypes: ["Giant Life Flask"], maxAreaLevel: 35, soundFileName: "giant_life.mp3" },
          { baseTypes: ["Colossal Life Flask"], maxAreaLevel: 40, soundFileName: "colossal_life.mp3" },
          { baseTypes: ["Hallowed Life Flask", "Divine Life Flask"], maxAreaLevel: 60, soundFileName: "life.mp3" },
        ],
      }),
      ...buildFlaskSeries({
        itemClass: "Mana Flasks",
        iconColor: "Blue",
        style: "manaFlask",
        entries: [
          { baseTypes: ["Small Mana Flask"], maxAreaLevel: 12, soundFileName: "mana.mp3" },
          { baseTypes: ["Medium Mana Flask"], maxAreaLevel: 16, soundFileName: "medium_mana.mp3" },
          { baseTypes: ["Large Mana Flask"], maxAreaLevel: 24, soundFileName: "large_mana.mp3" },
          { baseTypes: ["Greater Mana Flask"], maxAreaLevel: 28, soundFileName: "greater_mana.mp3" },
          { baseTypes: ["Grand Mana Flask"], maxAreaLevel: 32, soundFileName: "grand_mana.mp3" },
          { baseTypes: ["Giant Mana Flask"], maxAreaLevel: 42, soundFileName: "giant_mana.mp3" },
          { baseTypes: ["Colossal Mana Flask"], maxAreaLevel: 45, soundFileName: "mana.mp3" },
          { baseTypes: ["Sanctified Mana Flask"], maxAreaLevel: 60, soundFileName: "mana.mp3" },
          { baseTypes: ["Eternal Mana Flask", "Divine Mana Flask"], soundFileName: "mana.mp3" },
        ],
      }),
      ...buildUtilityFlaskRules([
        { baseType: "Jade", soundFileName: "jade.mp3" },
        { baseType: "Quartz", soundFileName: "quartz.mp3" },
        { baseType: "Quicksilver", soundFileName: "quicksilver.mp3" },
        { baseType: "Silver", soundFileName: "silver.mp3" },
      ]),
      rule()
        .itemClass("Utility Flasks")
        .icon("Grey", "Raindrop")
        .mixin(styleMixin(filterStyles.utilityFlask))
        .background(0, 0, 0)
        .sound(12),
    ),
  )

export const tinctures = ({ baseTypes = ["Prismatic Tincture"] }: TincturesConfig = {}) =>
  withHeading(
    "Tinctures",
    compileRules(
      rule()
        .baseType(...baseTypes)
        .icon("Red", "Raindrop")
        .mixin(styleMixin(filterStyles.tincture))
        .sound(6),
    ),
  )

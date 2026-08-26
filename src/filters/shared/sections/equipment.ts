import rule from "../../../rule"
import type { Rule } from "../../../types"
import { filterDefaults } from "../defaults"
import { filterStyles, styleMixin } from "../styles"
import { manifestSoundFile } from "../../../sounds/paths"
import { MANIFEST_BY_ID } from "../../../sounds/manifest"
import type { SoundManifestEntry } from "../../../sounds/manifest"
import { compileRules, withHeading } from "./composition"
import { buildHighlightedBaseTypeRules } from "./highlighted-equipment"
import { ARMOUR_CLASSES, defenceMixinMap, SOCKETABLE_CLASSES, WEAPON_CLASSES } from "./item-classes"
import { LEVELING_AMULETS, normalizeLevelingAmuletConfig, resolveShieldProgressionMode } from "./options"
import type {
  BuildProfile,
  EarlyConfig,
  HighlightedEquipmentConfig,
  JewelleryConfig,
  LinksConfig,
  MagicItemsConfig,
  MiscConfig,
  NormalItemsConfig,
  RareItemsConfig,
  TincturesConfig,
} from "./options"
import { buildFlaskSeries, buildUtilityFlaskRules } from "./rule-builders"

export const links = ({
  twoLinkMaxAreaLevel = filterDefaults.links.twoLinkMaxAreaLevel,
  threeLinkMaxAreaLevel = filterDefaults.links.threeLinkMaxAreaLevel,
  fourLinkMaxAreaLevel = filterDefaults.links.fourLinkMaxAreaLevel,
  fourLinkTtsCutoffLevel = filterDefaults.links.fourLinkTtsCutoffLevel,
  threeLinkTtsCutoffLevel = filterDefaults.links.threeLinkTtsCutoffLevel,
  preferredColors = filterDefaults.preferredColors,
  genericThreeLinksEnabled = filterDefaults.links.genericThreeLinksEnabled,
  genericFourLinksEnabled = filterDefaults.links.genericFourLinksEnabled,
  preferredArmour = filterDefaults.preferredArmour,
}: LinksConfig & Partial<BuildProfile>) => {
  const uniqueColors = [...new Set(preferredColors)]

  const buildLinkRules = ({
    linkedSockets,
    maxAreaLevel,
    ttsCutoffLevel,
    normalStyle,
    goodStyle,
    selectedStyle,
    genericEnabled = true,
  }: {
    linkedSockets: 2 | 3 | 4
    maxAreaLevel: number
    ttsCutoffLevel: number
    normalStyle: keyof typeof filterStyles
    goodStyle: keyof typeof filterStyles
    selectedStyle: keyof typeof filterStyles
    genericEnabled?: boolean
  }) => {
    const itemClasses = linkedSockets >= 3 ? ARMOUR_CLASSES : [undefined]
    const ttsCandidates = linkedSockets >= 3
    const buildBaseRule = (itemClass?: (typeof ARMOUR_CLASSES)[number]) =>
      rule()
        .itemClass(...(itemClass ? [itemClass] : ARMOUR_CLASSES))
        .linkedSockets("==", linkedSockets)
    const applySound = (builtRule: ReturnType<typeof buildBaseRule>, itemClass?: (typeof ARMOUR_CLASSES)[number]) => {
      if (ttsCandidates) {
        const slot = { "Body Armours": "body", "Gloves": "gloves", "Boots": "boots", "Helmets": "helm" } as const
        const id = `${linkedSockets}_${slot[itemClass!]}` as keyof typeof MANIFEST_BY_ID
        return builtRule.tts(manifestSoundFile(MANIFEST_BY_ID[id]))
      }

      return builtRule
    }

    const selectedRules = itemClasses.flatMap((itemClass) =>
      preferredArmour.flatMap((defenceType) =>
        uniqueColors.flatMap((color) => {
          const base = () =>
            buildBaseRule(itemClass)
              .mixin(defenceMixinMap[defenceType])
              .socketGroup(">=", color)
              .mixin(styleMixin(filterStyles[selectedStyle]))
          const withSound = applySound(base(), itemClass).areaLevel("<=", ttsCutoffLevel)
          const silent = base().areaLevel("<=", maxAreaLevel)
          return ttsCandidates ? [withSound, silent] : [silent]
        }),
      ),
    )

    const colourRules = itemClasses.flatMap((itemClass) =>
      uniqueColors.flatMap((color) => {
        const base = () => buildBaseRule(itemClass).socketGroup(">=", color).mixin(styleMixin(filterStyles[goodStyle]))
        const withSound = applySound(base(), itemClass).areaLevel("<=", ttsCutoffLevel)
        const silent = base().areaLevel("<=", maxAreaLevel)
        return ttsCandidates ? [withSound, silent] : [silent]
      }),
    )

    const armourRules = itemClasses.flatMap((itemClass) =>
      preferredArmour.flatMap((defenceType) => {
        const base = () => buildBaseRule(itemClass).mixin(defenceMixinMap[defenceType]).mixin(styleMixin(filterStyles[goodStyle]))
        const withSound = applySound(base(), itemClass).areaLevel("<=", ttsCutoffLevel)
        const silent = base().areaLevel("<=", maxAreaLevel)
        return ttsCandidates ? [withSound, silent] : [silent]
      }),
    )

    const goodRules = [...colourRules, ...armourRules]

    const normalRules = genericEnabled
      ? itemClasses.map((itemClass) =>
          buildBaseRule(itemClass)
            .mixin(styleMixin(filterStyles[normalStyle]))
            .size(linkedSockets === 2 ? 45 : 40)
            .areaLevel("<=", maxAreaLevel),
        )
      : []

    return [...selectedRules, ...goodRules, ...normalRules]
  }

  return withHeading(
    "Links",
    compileRules(
      rule()
        .linkedSockets("=", 6)
        .icon("Red", "Diamond")
        .mixin(styleMixin(filterStyles.currencyA))
        .tts(manifestSoundFile(MANIFEST_BY_ID.six_link)),
      rule()
        .linkedSockets("=", 5)
        .icon("Orange", "Diamond")
        .mixin(styleMixin(filterStyles.currencyB))
        .tts(manifestSoundFile(MANIFEST_BY_ID.five_link)),
      ...buildLinkRules({
        linkedSockets: 4,
        maxAreaLevel: fourLinkMaxAreaLevel,
        ttsCutoffLevel: fourLinkTtsCutoffLevel,
        normalStyle: "fourLink",
        goodStyle: "goodFourLink",
        selectedStyle: "selectedFourLink",
        genericEnabled: genericFourLinksEnabled,
      }),
      ...buildLinkRules({
        linkedSockets: 3,
        maxAreaLevel: threeLinkMaxAreaLevel,
        ttsCutoffLevel: threeLinkTtsCutoffLevel,
        normalStyle: "threeLink",
        goodStyle: "goodThreeLink",
        selectedStyle: "selectedThreeLink",
        genericEnabled: genericThreeLinksEnabled,
      }),
      ...buildLinkRules({
        linkedSockets: 2,
        maxAreaLevel: twoLinkMaxAreaLevel,
        ttsCutoffLevel: 0,
        normalStyle: "twoLink",
        goodStyle: "goodTwoLink",
        selectedStyle: "selectedTwoLink",
      }),
    ),
  )
}

export const sixSockets = () =>
  withHeading(
    "Six Sockets",
    compileRules(
      rule()
        .sockets("==", 6)
        .icon("Grey", "Diamond")
        .mixin(styleMixin(filterStyles.sixSocket))
        .tts(manifestSoundFile(MANIFEST_BY_ID.six_socket)),
    ),
  )

export const uniques = () =>
  withHeading("Uniques", compileRules(rule().rarity("==", "Unique").icon("Brown", "Star").mixin(styleMixin(filterStyles.unique)).sound(3)))

export const preferredWeapons = ({ preferredWeapons }: Partial<BuildProfile>) => {
  if (!preferredWeapons) return ""
  const hasTargets =
    (preferredWeapons.itemClasses?.length ?? 0) > 0 ||
    (preferredWeapons.baseTypes?.length ?? 0) > 0 ||
    preferredWeapons.minAps !== undefined
  if (!hasTargets) return ""

  const compiledRules = compileRules(...buildHighlightedBaseTypeRules(preferredWeapons))

  if (!compiledRules) {
    return ""
  }

  return withHeading("Preferred Weapons", compiledRules)
}

export const highlightedEquipment = ({ highlights = [] }: HighlightedEquipmentConfig = {}) => {
  const compiledRules = compileRules(...highlights.flatMap(buildHighlightedBaseTypeRules))

  if (!compiledRules) {
    return ""
  }

  return withHeading("Highlighted Equipment", compiledRules)
}

export const jewellery = ({
  amulets = filterDefaults.jewellery.amulets,
  basicRingMaxAreaLevel = filterDefaults.jewellery.basicRingMaxAreaLevel,
  elementalRingMaxAreaLevel = filterDefaults.jewellery.elementalRingMaxAreaLevel,
  beltMaxAreaLevel = filterDefaults.jewellery.beltMaxAreaLevel,
  amuletMaxAreaLevel = filterDefaults.jewellery.amuletMaxAreaLevel,
}: JewelleryConfig = {}) => {
  const buildAmuletRules = (baseType: string, entry: SoundManifestEntry) => {
    const rare = rule()
      .baseType(baseType)
      .itemClass("Amulets")
      .rarity("==", "Rare")
      .icon("Red", "Cross")
      .mixin(styleMixin(filterStyles.rareJewellery))
      .tts(manifestSoundFile(entry))
    const buildNonRare = (
      rarity: "Magic" | "Normal",
      style: (typeof filterStyles)["magicJewellery"] | (typeof filterStyles)["jewellery"],
    ) =>
      rule()
        .baseType(baseType)
        .itemClass("Amulets")
        .areaLevel("<=", amuletMaxAreaLevel)
        .rarity("==", rarity)
        .icon("Red", "Cross")
        .mixin(styleMixin(style))
        .tts(manifestSoundFile(entry))
    return [rare, buildNonRare("Magic", filterStyles.magicJewellery), buildNonRare("Normal", filterStyles.jewellery)]
  }

  return withHeading(
    "Jewellery",
    compileRules(
      rule()
        .baseType("Sapphire", "Ruby", "Topaz", "Two-Stone")
        .itemClass("Rings")
        .rarity("==", "Rare")
        .icon("Pink", "Moon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.rare_ring)),
      rule()
        .baseType("Amethyst")
        .itemClass("Rings")
        .rarity("==", "Rare")
        .icon("Brown", "Moon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.rare_amethyst)),
      rule()
        .baseType("Amethyst")
        .itemClass("Rings")
        .itemLevel(">=", 44)
        .rarity("==", "Magic")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.amethyst_ring)),
      rule()
        .baseType("Amethyst")
        .itemClass("Rings")
        .itemLevel(">=", 44)
        .rarity("==", "Normal")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.amethyst_ring)),
      rule()
        .baseType("Leather")
        .itemClass("Belts")
        .rarity("==", "Rare")
        .icon("Yellow", "Pentagon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.rare_leather)),
      rule()
        .baseType("Heavy")
        .itemClass("Belts")
        .rarity("==", "Rare")
        .icon("Orange", "Pentagon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.rare_heavy)),
      rule()
        .baseType("Rustic")
        .itemClass("Belts")
        .rarity("==", "Rare")
        .icon("White", "Pentagon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.rare_rustic)),
      rule()
        .baseType("Iron")
        .itemClass("Rings")
        .areaLevel("<=", basicRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Purple", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.iron_ring)),
      rule()
        .baseType("Iron")
        .itemClass("Rings")
        .areaLevel("<=", basicRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Purple", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.iron_ring)),
      rule()
        .baseType("Coral")
        .itemClass("Rings")
        .areaLevel("<=", basicRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Purple", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery)),
      rule()
        .baseType("Coral")
        .itemClass("Rings")
        .areaLevel("<=", basicRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Purple", "Moon")
        .mixin(styleMixin(filterStyles.jewellery)),
      rule()
        .baseType("Sapphire")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.sapphire_ring)),
      rule()
        .baseType("Sapphire")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.sapphire_ring)),
      rule()
        .baseType("Ruby")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Red", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.ruby_ring)),
      rule()
        .baseType("Ruby")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Red", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.ruby_ring)),
      rule()
        .baseType("Topaz")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Yellow", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.topaz_ring)),
      rule()
        .baseType("Topaz")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Yellow", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.topaz_ring)),
      rule()
        .baseType("Two-Stone")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Green", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.two_stone_ring)),
      rule()
        .baseType("Two-Stone")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Green", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.two_stone_ring)),
      rule()
        .baseType("Leather")
        .itemClass("Belts")
        .areaLevel("<=", beltMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Yellow", "Pentagon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.magic_leather)),
      rule()
        .baseType("Leather")
        .itemClass("Belts")
        .areaLevel("<=", beltMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Yellow", "Pentagon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.leather_belt)),
      rule()
        .baseType("Heavy")
        .itemClass("Belts")
        .areaLevel("<=", beltMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Orange", "Pentagon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.magic_heavy)),
      rule()
        .baseType("Heavy")
        .itemClass("Belts")
        .areaLevel("<=", beltMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Orange", "Pentagon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(manifestSoundFile(MANIFEST_BY_ID.heavy_belt)),
      rule().itemClass("Belts").rarity("==", "Rare").mixin(styleMixin(filterStyles.rareJewellery)),
      ...amulets.flatMap((entry) => {
        const { shortBaseType, entry: amuletEntry } = normalizeLevelingAmuletConfig(entry)
        return buildAmuletRules(shortBaseType, amuletEntry)
      }),
      rule()
        .baseType(...Object.keys(LEVELING_AMULETS), "Onyx")
        .itemClass("Amulets")
        .rarity("==", "Rare")
        .mixin(styleMixin(filterStyles.rareJewellery)),
    ),
  )
}

export const chromaticItems = () =>
  withHeading(
    "Chromatic Items",
    compileRules(
      rule()
        .width("==", 1)
        .height("==", 3)
        .socketGroup("==", "RGB")
        .mixin(styleMixin(filterStyles.chromatic))
        .tts(manifestSoundFile(MANIFEST_BY_ID.chromatic_recipe)),
      rule()
        .width("==", 2)
        .height("==", 2)
        .socketGroup("==", "RGB")
        .mixin(styleMixin(filterStyles.chromatic))
        .tts(manifestSoundFile(MANIFEST_BY_ID.chromatic_recipe)),
      rule()
        .width("==", 2)
        .height("==", 4)
        .socketGroup("==", "RGB")
        .mixin(styleMixin(filterStyles.chromatic))
        .tts(manifestSoundFile(MANIFEST_BY_ID.chromatic_recipe)),
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
          { baseTypes: ["Small Life Flask"], maxAreaLevel: 12, text: MANIFEST_BY_ID.life },
          { baseTypes: ["Medium Life Flask"], maxAreaLevel: 16, text: MANIFEST_BY_ID.medium_life },
          { baseTypes: ["Large Life Flask"], maxAreaLevel: 24, text: MANIFEST_BY_ID.large_life },
          { baseTypes: ["Greater Life Flask"], maxAreaLevel: 28, text: MANIFEST_BY_ID.greater_life },
          { baseTypes: ["Grand Life Flask"], maxAreaLevel: 32, text: MANIFEST_BY_ID.grand_life },
          { baseTypes: ["Giant Life Flask"], maxAreaLevel: 35, text: MANIFEST_BY_ID.giant_life },
          { baseTypes: ["Colossal Life Flask"], maxAreaLevel: 40, text: MANIFEST_BY_ID.colossal_life },
          { baseTypes: ["Hallowed Life Flask"], maxAreaLevel: 60, text: MANIFEST_BY_ID.life },
          { baseTypes: ["Divine Life Flask"], text: MANIFEST_BY_ID.life },
        ],
      }),
      ...buildFlaskSeries({
        itemClass: "Mana Flasks",
        iconColor: "Blue",
        style: "manaFlask",
        entries: [
          { baseTypes: ["Small Mana Flask"], maxAreaLevel: 12, text: MANIFEST_BY_ID.mana },
          { baseTypes: ["Medium Mana Flask"], maxAreaLevel: 16, text: MANIFEST_BY_ID.medium_mana },
          { baseTypes: ["Large Mana Flask"], maxAreaLevel: 24, text: MANIFEST_BY_ID.large_mana },
          { baseTypes: ["Greater Mana Flask"], maxAreaLevel: 28, text: MANIFEST_BY_ID.greater_mana },
          { baseTypes: ["Grand Mana Flask"], maxAreaLevel: 32, text: MANIFEST_BY_ID.grand_mana },
          { baseTypes: ["Giant Mana Flask"], maxAreaLevel: 36, text: MANIFEST_BY_ID.giant_mana },
          { baseTypes: ["Colossal Mana Flask"], maxAreaLevel: 40, text: MANIFEST_BY_ID.mana },
          { baseTypes: ["Sacred Mana Flask"], maxAreaLevel: 46, text: MANIFEST_BY_ID.mana },
          { baseTypes: ["Hallowed Mana Flask"], maxAreaLevel: 52, text: MANIFEST_BY_ID.mana },
          { baseTypes: ["Sanctified Mana Flask"], maxAreaLevel: 60, text: MANIFEST_BY_ID.mana },
          { baseTypes: ["Eternal Mana Flask", "Divine Mana Flask"], text: MANIFEST_BY_ID.mana },
        ],
      }),
      ...buildUtilityFlaskRules([
        { baseType: "Jade", text: MANIFEST_BY_ID.jade_flask },
        { baseType: "Quartz", text: MANIFEST_BY_ID.quartz_flask },
        { baseType: "Quicksilver", text: MANIFEST_BY_ID.quicksilver_flask },
        { baseType: "Silver", text: MANIFEST_BY_ID.silver_flask },
        { baseType: "Granite", text: MANIFEST_BY_ID.granite_flask },
      ]),
      rule()
        .itemClass("Utility Flasks")
        .icon("Grey", "Raindrop")
        .mixin(styleMixin(filterStyles.utilityFlask))
        .background(0, 0, 0)
        .sound(12),
    ),
  )

export const tinctures = ({ baseTypes = filterDefaults.tinctures.baseTypes }: TincturesConfig = {}) => {
  if (baseTypes.length === 0) return ""
  return withHeading(
    "Tinctures",
    compileRules(
      rule()
        .baseType(...baseTypes)
        .icon("Red", "Raindrop")
        .mixin(styleMixin(filterStyles.tincture))
        .sound(6),
    ),
  )
}

export const rareItems = ({
  preferredArmour = filterDefaults.preferredArmour,
  maxAreaLevel = filterDefaults.rareItems.maxAreaLevel,
  shieldProgression,
  earlyMaxAreaLevel = filterDefaults.early.earlyMaxAreaLevel,
}: RareItemsConfig & Partial<BuildProfile> & EarlyConfig) => {
  const partOneMaxAreaLevel = filterDefaults.rareItems.partOneMaxAreaLevel
  const shieldMode = resolveShieldProgressionMode(shieldProgression)
  const preferredRareItemClasses = shieldMode !== "none" ? [...ARMOUR_CLASSES, "Shields"] : ARMOUR_CLASSES

  const earlyLevel = maxAreaLevel === undefined ? earlyMaxAreaLevel : Math.min(earlyMaxAreaLevel, maxAreaLevel)
  const partOneLevel = maxAreaLevel === undefined ? partOneMaxAreaLevel : Math.min(partOneMaxAreaLevel, maxAreaLevel)
  const cap = (rareRule: Rule) => (maxAreaLevel === undefined ? rareRule : rareRule.areaLevel("<=", maxAreaLevel))

  return withHeading(
    "Rare Items",
    compileRules(
      ...preferredArmour.map((defenceType) =>
        rule()
          .itemClass(...preferredRareItemClasses)
          .areaLevel("<=", partOneLevel)
          .rarity("==", "Rare")
          .mixin(styleMixin(filterStyles.rareArmour))
          .mixin(defenceMixinMap[defenceType]),
      ),
      rule().width("==", 2).height(">=", 4).areaLevel("<=", earlyLevel).rarity("==", "Rare").size(40),
      rule().width("==", 2).height(">=", 4).areaLevel("<=", partOneLevel).rarity("==", "Rare").size(35),
      cap(rule().width("==", 2).height(">=", 4).rarity("==", "Rare").size(30)),
      rule().width("==", 2).height("==", 3).areaLevel("<=", earlyLevel).rarity("==", "Rare").size(45),
      rule().width("==", 2).height("==", 3).areaLevel("<=", partOneLevel).rarity("==", "Rare").size(40),
      cap(rule().width("==", 2).height("==", 3).rarity("==", "Rare").size(35)),
      cap(rule().width("==", 1).height("==", 1).rarity("==", "Rare").size(45)),
      rule().areaLevel("<=", earlyLevel).rarity("==", "Rare").size(45),
      rule().areaLevel("<=", partOneLevel).rarity("==", "Rare").size(40),
      cap(rule().rarity("==", "Rare").size(38)),
    ),
  )
}

export const magicItems = ({ maxAreaLevel = filterDefaults.magicItems.maxAreaLevel }: MagicItemsConfig = {}) =>
  withHeading("Magic Items", compileRules(rule().rarity("==", "Magic").areaLevel("<=", maxAreaLevel).size(40)))

export const whetstoneRecipe = ({ whetstoneRecipe = filterDefaults.misc.whetstoneRecipe }: MiscConfig = {}) => {
  if (!whetstoneRecipe) return ""
  return withHeading(
    "Whetstone Recipe",
    compileRules(
      rule()
        .quality(">=", 20)
        .rarity("==", "Normal")
        .itemClass(...WEAPON_CLASSES)
        .mixin(styleMixin(filterStyles.whetstoneRecipe))
        .tts(manifestSoundFile(MANIFEST_BY_ID.whet_recipe)),
    ),
  )
}

export const normalItems = ({ maxAreaLevel = filterDefaults.normalItems.maxAreaLevel }: NormalItemsConfig = {}) => {
  return withHeading(
    "Normal Items",
    compileRules(
      rule()
        .rarity("==", "Normal")
        .itemClass(...SOCKETABLE_CLASSES)
        .areaLevel("<=", maxAreaLevel)
        .size(40),
      rule().itemClass("Belts").rarity("==", "Normal").areaLevel("<=", maxAreaLevel).mixin(styleMixin(filterStyles.jewellery)),
    ),
  )
}

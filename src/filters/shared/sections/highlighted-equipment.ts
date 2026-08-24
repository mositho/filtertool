import rule from "../../../rule"
import type { BaseType, Color, ItemClass, NumberRange, Rarity, Rule, Shape } from "../../../types"
import { WEAPON_BASE_DATA } from "../../../types/weapon-base-data"
import { filterStyles, soundFile, styleMixin } from "../styles"
import { manifestSoundFile, soundFileTTS } from "../../../sounds/paths"
import type { WeaponItemClass } from "./item-classes"
import {
  HIGHLIGHTABLE_RARITIES,
  type HighlightableRarity,
  type HighlightedBaseTypeConfig,
  type RarityHighlightConfig,
  type TtsFile,
} from "./options"
import {
  isWeaponBaseType,
  isWeaponItemClass,
  resolveMixedItemClassWeaponQuery,
  resolveWeaponBaseTypes,
  type WeaponBaseType,
} from "./weapon-queries"

export const applyHighlightTargets = (
  target: Rule,
  { baseTypes, itemClasses }: { baseTypes?: readonly BaseType[]; itemClasses?: readonly ItemClass[] },
) => {
  if (baseTypes?.length) target.baseType(...baseTypes)
  if (itemClasses?.length) target.itemClass(...itemClasses)
  return target
}

const weaponInfo = new Map<WeaponBaseType, { itemClass: WeaponItemClass; dropLevel: number }>(
  WEAPON_BASE_DATA.map((weapon) => [weapon.baseType, { itemClass: weapon.itemClass, dropLevel: weapon.dropLevel }]),
)

const buildRule = ({
  selectedRarity,
  baseTypes,
  itemClasses,
  linkedSockets,
  minSockets,
  minAreaLevel,
  maxAreaLevel,
  iconColor,
  iconShape,
  soundId,
  soundFileName,
  tts,
}: {
  selectedRarity?: Rarity
  baseTypes?: readonly BaseType[]
  itemClasses?: readonly ItemClass[]
  linkedSockets?: number
  minSockets?: number
  minAreaLevel?: number
  maxAreaLevel?: number
  iconColor?: Color
  iconShape?: Shape
  soundId?: NumberRange<1, 16>
  soundFileName?: string
  tts?: TtsFile
}) => {
  const styles = {
    Rare: filterStyles.highlightedEquipmentRare,
    Magic: filterStyles.highlightedEquipmentMagic,
    Normal: filterStyles.highlightedEquipmentNormal,
  }
  const style =
    selectedRarity && selectedRarity in styles ? styles[selectedRarity as keyof typeof styles] : filterStyles.highlightedEquipment
  const base = rule().mixin(styleMixin(style))
  if (iconColor !== undefined || iconShape !== undefined) {
    base.icon(iconColor ?? "Cyan", iconShape ?? "UpsideDownHouse")
  }
  const builtRule = applyHighlightTargets(base, { baseTypes, itemClasses })
  if (selectedRarity) builtRule.rarity("==", selectedRarity)
  if (minAreaLevel !== undefined) builtRule.areaLevel(">=", minAreaLevel)
  if (maxAreaLevel !== undefined) builtRule.areaLevel("<=", maxAreaLevel)
  if (linkedSockets !== undefined) builtRule.linkedSockets(">=", linkedSockets)
  if (minSockets !== undefined) builtRule.sockets(">=", minSockets)
  if (tts) builtRule.tts(typeof tts === "string" ? soundFileTTS(tts) : manifestSoundFile(tts))
  else if (soundFileName) builtRule.customSound(soundFile(soundFileName))
  else if (soundId !== undefined) builtRule.sound(soundId)
  return builtRule
}

const cutoff = (baseType: WeaponBaseType, overlap: number) => {
  const info = weaponInfo.get(baseType)
  return info ? info.dropLevel + overlap : undefined
}

export const buildHighlightedBaseTypeRules = ({
  baseTypes,
  itemClasses,
  minAps,
  linkedSockets,
  minSockets,
  weaponCutoffOverlap,
  rarities: configuredRarities,
  minAreaLevel,
  maxAreaLevel,
  perRarityCustomization,
  iconColor,
  iconShape,
  soundId,
  soundFileName,
  tts,
  normal,
  magic,
  rare,
}: HighlightedBaseTypeConfig) => {
  const hasTargets = (baseTypes?.length ?? 0) > 0 || (itemClasses?.length ?? 0) > 0 || minAps !== undefined
  if (!hasTargets) return []

  const appliedRarities = configuredRarities?.length
    ? configuredRarities.filter((entry): entry is HighlightableRarity => HIGHLIGHTABLE_RARITIES.includes(entry))
    : [...HIGHLIGHTABLE_RARITIES]

  const topLevelStyling: RarityHighlightConfig = { iconColor, iconShape, soundId, soundFileName, tts }
  const rarityConfigs: Record<HighlightableRarity, RarityHighlightConfig> = {
    Normal: normal ?? {},
    Magic: magic ?? {},
    Rare: rare ?? {},
  }
  const stylingFor = (selectedRarity: HighlightableRarity): RarityHighlightConfig =>
    perRarityCustomization ? rarityConfigs[selectedRarity] : topLevelStyling

  const weaponClasses = itemClasses?.filter(isWeaponItemClass)
  const nonWeaponClasses = itemClasses?.filter((itemClass) => !isWeaponItemClass(itemClass))
  const makeRules = (selectedBaseTypes?: readonly BaseType[], selectedItemClasses?: readonly ItemClass[], maximum = maxAreaLevel) =>
    appliedRarities.map((selectedRarity) => {
      const builtRule = buildRule({
        selectedRarity,
        baseTypes: selectedBaseTypes?.length ? selectedBaseTypes : undefined,
        itemClasses: selectedItemClasses?.length ? selectedItemClasses : undefined,
        linkedSockets,
        minSockets,
        minAreaLevel,
        maxAreaLevel: maximum,
        ...stylingFor(selectedRarity),
      })
      return builtRule.rarity("==", selectedRarity)
    })
  if (weaponCutoffOverlap === undefined) {
    const resolved = resolveMixedItemClassWeaponQuery({ itemClasses, baseTypes, minAps })
    return makeRules(resolved.baseTypes, resolved.itemClasses)
  }
  const weaponBaseTypes = resolveWeaponBaseTypes({
    itemClasses: weaponClasses,
    baseTypes: baseTypes?.filter(isWeaponBaseType) ?? [],
    minAps,
  })
  const weapons = weaponBaseTypes.flatMap((baseType) => {
    const automatic = cutoff(baseType, weaponCutoffOverlap)
    return makeRules(
      [baseType],
      undefined,
      maxAreaLevel !== undefined && automatic !== undefined ? Math.min(maxAreaLevel, automatic) : (maxAreaLevel ?? automatic),
    )
  })
  const nonWeaponBases = baseTypes?.filter((baseType) => !isWeaponBaseType(baseType)) ?? []
  return [
    ...weapons,
    ...((nonWeaponClasses?.length ?? 0) > 0 || nonWeaponBases.length > 0 ? makeRules(nonWeaponBases, nonWeaponClasses) : []),
  ]
}

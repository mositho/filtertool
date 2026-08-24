import type { BaseType, ItemClass } from "../../../types"
import type { WeaponBaseType as GeneratedWeaponBaseType } from "../../../types/weapon-base-data"
import { WEAPON_BASE_DATA } from "../../../types/weapon-base-data"
import { WEAPON_CLASSES, type WeaponItemClass } from "./item-classes"
import type { HighlightedBaseTypeConfig } from "./options"

export type WeaponBaseType = GeneratedWeaponBaseType
export type WeaponBaseQuery = { itemClasses?: readonly WeaponItemClass[]; minAps?: number; maxDropLevel?: number }
export const isWeaponItemClass = (itemClass: ItemClass): itemClass is WeaponItemClass =>
  WEAPON_CLASSES.includes(itemClass as WeaponItemClass)
export const isWeaponBaseType = (baseType: BaseType): baseType is WeaponBaseType =>
  WEAPON_BASE_DATA.some((weapon) => weapon.baseType === baseType)
export const findWeaponBaseTypes = ({ itemClasses, minAps, maxDropLevel }: WeaponBaseQuery): WeaponBaseType[] =>
  WEAPON_BASE_DATA.filter(
    (weapon) =>
      (!itemClasses?.length || itemClasses.includes(weapon.itemClass)) &&
      (minAps === undefined || (weapon.aps ?? 0) >= minAps) &&
      (maxDropLevel === undefined || weapon.dropLevel <= maxDropLevel),
  ).map((weapon) => weapon.baseType)
export const resolveWeaponBaseTypes = ({
  itemClasses = [],
  baseTypes = [],
  minAps,
}: {
  itemClasses?: readonly WeaponItemClass[]
  baseTypes?: readonly WeaponBaseType[]
  minAps?: number
}): WeaponBaseType[] => [
  ...new Set([...baseTypes, ...findWeaponBaseTypes({ itemClasses: itemClasses.length ? itemClasses : undefined, minAps })]),
]
export const resolveMixedItemClassWeaponQuery = ({
  itemClasses,
  baseTypes = [],
  minAps,
}: {
  itemClasses?: readonly ItemClass[]
  baseTypes?: readonly BaseType[]
  minAps?: number
}) => {
  if (minAps === undefined) return { itemClasses, baseTypes }
  const weaponItemClasses = itemClasses?.filter(isWeaponItemClass)
  const nonWeaponItemClasses = itemClasses?.filter((itemClass) => !isWeaponItemClass(itemClass))
  return {
    itemClasses: nonWeaponItemClasses?.length ? nonWeaponItemClasses : undefined,
    baseTypes: [
      ...new Set([
        ...baseTypes,
        ...findWeaponBaseTypes({ itemClasses: weaponItemClasses?.length ? weaponItemClasses : undefined, minAps }),
      ]),
    ],
  }
}
export const resolveSharedWeaponQuery = ({
  earlyWeapons,
  preferredWeapons,
}: {
  earlyWeapons?: HighlightedBaseTypeConfig
  preferredWeapons?: HighlightedBaseTypeConfig
}) => {
  const hasExplicitTargets = (earlyWeapons?.itemClasses?.length ?? 0) > 0 || (earlyWeapons?.baseTypes?.length ?? 0) > 0
  return hasExplicitTargets
    ? {
        itemClasses: earlyWeapons?.itemClasses?.filter(isWeaponItemClass) ?? [],
        baseTypes: earlyWeapons?.baseTypes?.filter(isWeaponBaseType) ?? [],
      }
    : {
        itemClasses: preferredWeapons?.itemClasses?.filter(isWeaponItemClass) ?? [],
        baseTypes: preferredWeapons?.baseTypes?.filter(isWeaponBaseType) ?? [],
      }
}

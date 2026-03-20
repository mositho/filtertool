import type { Color, Mixin, Shape, StyleData } from "../../types"
export { getSoundPackFolder, soundFile } from "../../sounds/paths"
import { loadOptionalOverride, mergeDeep } from "./user-overrides"

export const DEFAULT_STYLE_SETTINGS = {
  size: 45,
  backgroundOpacity: 1,
} as const

// prettier-ignore
export const baseFilterStyles = {
  priorityA:                  { text: "#00A8FF", background: "#FFFFFF", border: "#00A8FF" },
  priorityB:                  { text: "#FFFFFF", background: "#00A8FF", border: "#FFFFFF" },
  priorityC:                  { text: "#00FFFF", background: "#000000", border: "#00FFFF" },
  earlyWeaponRare:            { text: "#FFFF00", background: "#000000", border: "#00FFFF" },
  earlyWeaponMagic:           { text: "#66B3FF", background: "#000000", border: "#00FFFF" },
  earlyWeaponNormal:          { text: "#D9FFFF", background: "#000000", border: "#00FFFF" },
  earlyShieldLink:            { text: "#FFFFFF", background: "#000000", border: "#FFC800" },
  earlyShieldBase:            { text: "#D9FFFF", background: "#000000", border: "#00FFFF" },
  momentum:                   { text: "#FFA500", background: "#320000", border: "#FF0000" },
  twoLink:                    { text: "#DADADA", background: "#000000", border: "#FFC800", backgroundOpacity: 0.9 },
  selectedTwoLink:            { text: "#FFFFFF", background: "#000000", border: "#FFC800" },
  threeLink:                  { text: "#FFFFFF", background: "#000000", border: "#51FF00", backgroundOpacity: 0.9 },
  selectedThreeLink:          { text: "#B9FF66", background: "#000000", border: "#B9FF66" },
  fourLink:                   { text: "#FFFFFF", background: "#000000", border: "#00FF88", backgroundOpacity: 0.9 },
  selectedFourLink:           { text: "#00FF95", background: "#000000", border: "#00FF95" },
  lifeFlask:                  { text: "#D26464", background: "#000000", border: "#D26464" },
  manaFlask:                  { text: "#2386FF", background: "#000000", border: "#2386FF" },
  utilityFlask:               { text: "#32C87D", background: "#003228", border: "#32C87D" },
  unique:                     { text: "#FF4400", background: "#000000", border: "#FF4400" },
  wisdom:                     { text: "#FF7D4E", background: "#000000", border: "#FF7D4E" },
  portal:                     { text: "#6A94FD", background: "#000000", border: "#6A94FD" },
  gem:                        { text: "#00FFFF", background: "#000000", border: "#000000" },
  chromatic:                  { text: "#F789FF", background: "#000000", border: "#F789FF", backgroundOpacity: 0.9, size: 40 },
  accessory:                  { text: "#F5D8FF", background: "#320046", border: "#C000FF" },
  magicAccessory:             { text: "#66B3FF", background: "#320046", border: "#C000FF" },
  rareAccessory:              { text: "#FFF34D", background: "#320046", border: "#C000FF" },
  rareArmour:                 { text: "#FFF34D", background: "#322800", border: "#FFF34D" },
  highlightedEquipment:       { text: "#005EFF", background: "#001928", border: "#00FFFF" },
  highlightedEquipmentRare:   { text: "#FFFF00", background: "#001515", border: "#00FFFF" },
  highlightedEquipmentMagic:  { text: "#66B3FF", background: "#001515", border: "#00FFFF" },
  highlightedEquipmentNormal: { text: "#D9FFFF", background: "#001515", border: "#00FFFF" },
  socketBaseRare:             { text: "#FFF34D", background: "#000000", border: "#FF007F" },
  socketBaseMagic:            { text: "#66B3FF", background: "#000000", border: "#FF007F" },
  socketBaseNormal:           { text: "#D9FFFF", background: "#000000", border: "#FF007F" },
  sixSocket:                  { text: "#FFFFFF", background: "#00A800", border: "#FFFFFF" },
  tincture:                   { text: "#FF415E", background: "#46001E", border: "#FF415E" },
  questItem:                  { text: "#00FF00", background: "#000000", border: "#00FF00" },
  divinationCard:             { text: "#8800ff", background: "#000000", border: "#8800ff" },
  maps:                       { text: "#FFFFFF", background: "#282828", border: "#FFFFFF" },
  fragments:                  { text: "#FF0032", background: "#000000", border: "#FF0032" },
  relics:                     { text: "#FF0032", background: "#280014", border: "#FF0032" },
  unknownItem:                { text: "#E100FF", background: "#000000", border: "#E100FF" },
} satisfies Record<string, StyleData>

export const filterStyles = mergeDeep(baseFilterStyles, loadOptionalOverride<typeof baseFilterStyles>("./user-styles", "userFilterStyles"))

export const styleMixin =
  (style: StyleData): Mixin =>
  (target) => {
    target.style(style)
  }

export const iconMixin =
  (color: Color, shape: Shape, size: 0 | 1 | 2 = 2): Mixin =>
  (target) => {
    target.icon(color, shape, size)
  }

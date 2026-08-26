import type { Color, Mixin, Shape, StyleData } from "../../types"
import { loadJsonOverride, loadOptionalOverride, mergeDeep } from "./user-overrides"
export { getSoundPackFolder, soundFile } from "../../sounds"

export const DEFAULT_STYLE_SETTINGS = {
  size: 45,
  backgroundOpacity: 245 / 255,
} as const

export const MIN_STYLE_SIZE = 20

const BACKGROUND_OPACITY = {
  low: 100 / 255,
  medium: 180 / 255,
  high: 230 / 255,
} as const

// prettier-ignore
export const baseFilterStyles = {
  currencyA:                  { text: "#00A8FF", background: "#FFFFFF", border: "#00A8FF" },
  currencyB:                  { text: "#FFFFFF", background: "#00A8FF", border: "#FFFFFF" },
  currencyC:                  { text: "#00FFFF", background: "#000000", border: "#00FFFF" },
  earlyShieldLink:            { text: "#000000", background: "#ffffff", border: "#ff0000" },
  earlyShieldBase:            { text: "#000000", background: "#d2d2d2", border: "#000000" },
  twoLink:                    { text: "#DADADA", background: "#000000", border: "#fdfb4e", backgroundOpacity: BACKGROUND_OPACITY.high },
  goodTwoLink:                { text: "#DADADA", background: "#000000", border: "#FFC800" },
  selectedTwoLink:            { text: "#FFFFFF", background: "#000000", border: "#FFC800" },
  threeLink:                  { text: "#B9FF66", background: "#000000", border: "#B9FF66", backgroundOpacity: BACKGROUND_OPACITY.high },
  goodThreeLink:              { text: "#B9FF66", background: "#000000", border: "#B9FF66" },
  selectedThreeLink:          { text: "#51FF00", background: "#000000", border: "#51FF00" },
  fourLink:                   { text: "#00ff80", background: "#000000", border: "#00ff80", backgroundOpacity: BACKGROUND_OPACITY.high },
  goodFourLink:               { text: "#00ff80", background: "#000000", border: "#00ff80" },
  selectedFourLink:           { text: "#00FF95", background: "#000000", border: "#00FF95" },
  lifeFlask:                  { text: "#D26464", background: "#000000", border: "#D26464" },
  manaFlask:                  { text: "#2386FF", background: "#000000", border: "#2386FF" },
  utilityFlask:               { text: "#32C87D", background: "#003228", border: "#32C87D" },
  gold:                       { text: "#DADADA", background: "#000000", border: "#000000", backgroundOpacity: BACKGROUND_OPACITY.low, size: 25 },
  goldHighStack:              { text: "#DADADA", background: "#000000", border: "#000000", backgroundOpacity: BACKGROUND_OPACITY.medium, size: 25 },
  unique:                     { text: "#FF4400", background: "#000000", border: "#FF4400" },
  wisdom:                     { text: "#FF7D4E", background: "#000000", border: "#FF7D4E" },
  portal:                     { text: "#6A94FD", background: "#000000", border: "#6A94FD" },
  gem:                        { text: "#00FFFF", background: "#000000", border: "#000000" },
  chromatic:                  { text: "#F789FF", background: "#000000", border: "#F789FF", backgroundOpacity: BACKGROUND_OPACITY.high, size: 40 },
  whetstoneRecipe:            { text: "#9e9e9e", background: "#000000", border: "#999999", backgroundOpacity: 0.96 },
  jewellery:                  { text: "#F5D8FF", background: "#320046", border: "#C000FF" },
  magicJewellery:             { text: "#66B3FF", background: "#320046", border: "#C000FF" },
  rareJewellery:              { text: "#FFF34D", background: "#320046", border: "#C000FF" },
  rareArmour:                 { text: "#FFF34D", background: "#322800", border: "#FFF34D" },
  highlightedEquipmentRare:   { text: "#FFFF00", background: "#001515", border: "#00FFFF" },
  highlightedEquipmentMagic:  { text: "#66B3FF", background: "#001515", border: "#00FFFF" },
  highlightedEquipmentNormal: { text: "#D9FFFF", background: "#001515", border: "#00FFFF" },
  sixSocket:                  { text: "#FFFFFF", background: "#00A800", border: "#FFFFFF" },
  tincture:                   { text: "#FF415E", background: "#46001E", border: "#FF415E" },
  questItem:                  { text: "#00FF00", background: "#000000", border: "#00FF00" },
  divinationCard:             { text: "#8800ff", background: "#000000", border: "#8800ff" },
  maps:                       { text: "#FFFFFF", background: "#282828", border: "#FFFFFF" },
  fragments:                  { text: "#FF0032", background: "#000000", border: "#FF0032" },
  relics:                     { text: "#FF0032", background: "#280014", border: "#FF0032" },
  unknownItem:                { text: "#E100FF", background: "#000000", border: "#E100FF" },
} satisfies Record<string, StyleData>

export const filterStyles = mergeDeep(baseFilterStyles, loadUserStyles())

function loadUserStyles() {
  return mergeDeep(
    loadOptionalOverride<typeof baseFilterStyles>("./user-styles", "userFilterStyles"),
    loadJsonOverride<typeof baseFilterStyles>("user-styles.json"),
  )
}

/** Re-reads user styles and updates `filterStyles` in place so a running server reflects edits. */
export function refreshFilterStyles(): void {
  const fresh = mergeDeep(baseFilterStyles, loadUserStyles())
  for (const key of Object.keys(filterStyles)) {
    delete (filterStyles as Record<string, unknown>)[key]
  }
  Object.assign(filterStyles, fresh)
}

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

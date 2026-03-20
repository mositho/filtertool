import type { Color, Mixin, Shape, StyleData } from "../../types"
export { getSoundPackFolder, soundFile } from "../../sounds/paths"

// prettier-ignore
export const filterStyles = {
  priorityA:            { text: "#00A8FF", background: "#FFFFFF", border: "#00A8FF", size: 45 },
  priorityB:            { text: "#FFFFFF", background: "#00A8FF", border: "#FFFFFF", size: 45 },
  priorityC:            { text: "#00FFFF", background: "#000000", border: "#00FFFF", size: 45 },
  earlyWeaponRare:      { text: "#FFFF00", background: "#001928", border: "#00FFFF", size: 45 },
  earlyWeaponBase:      { text: "#00FFFF", background: "#000000", border: "#00FFFF", size: 45 },
  earlyShieldLink:      { text: "#FFFFFF", background: "#281400", border: "#FF4400", size: 45 },
  earlyShieldBase:      { text: "#FFFFFF", background: "#000000", border: "#FF4400", size: 45 },
  momentum:             { text: "#FFA500", background: "#320000", border: "#FF0000", size: 45 },
  twoLink:              { text: "#FFC800", background: "#000000", border: "#FFC800", size: 45 },
  threeLink:            { text: "#00FF00", background: "#000000", border: "#00FF00", size: 45 },
  fourLink:             { text: "#00FF64", background: "#000000", border: "#00FF64", size: 45 },
  lifeFlask:            { text: "#D26464", background: "#000000", border: "#D26464", size: 45 },
  manaFlask:            { text: "#2386ff", background: "#000000", border: "#2386ff", size: 45 },
  utilityFlask:         { text: "#32C87D", background: "#003228", border: "#32C87D", size: 45 },
  unique:               { text: "#FF4400", background: "#000000", border: "#FF4400", size: 45 },
  wisdom:               { text: "#ff7d4e", background: "#000000", border: "#ff7d4e", size: 45 },
  portal:               { text: "#6a94fd", background: "#000000", border: "#6a94fd", size: 45 },
  gem:                  { text: "#00FFFF", background: "#2D0014", border: "#00FFFF", size: 45 },
  chromatic:            { text: "#FFFFFF", background: "#003200", border: "#00A800", size: 40 },
  rareAccessory:        { text: "#FFFFFF", background: "#320046", border: "#C000FF", size: 45 },
  rareArmour:           { text: "#FFFF64", background: "#322800", border: "#FFFF64", size: 45 },
  highlightedEquipment: { text: "#00FFFF", background: "#001928", border: "#00FFFF", size: 45 },
  sixSocket:            { text: "#FFFFFF", background: "#00A800", border: "#FFFFFF", size: 45 },
  tincture:             { text: "#FFFFFF", background: "#46001E", border: "#EB1937", size: 45 },
  questItem:            { text: "#00FF00", background: "#000000", border: "#00FF00", size: 45 },
  divinationCard:       { text: "#b8b8b8", background: "#000000", border: "#b8b8b8", size: 45 },
  maps:                 { text: "#FFFFFF", background: "#282828", border: "#FFFFFF", size: 45 },
  fragments:            { text: "#FF0032", background: "#000000", border: "#FF0032", size: 45 },
  relics:               { text: "#FF0032", background: "#280014", border: "#FF0032", size: 45 },
  unknownItem:          { text: "#e100ff", background: "#000000", border: "#e100ff", size: 45 },
} satisfies Record<string, StyleData>

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

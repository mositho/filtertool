import { type BuildProfile, type BuildSpecificOptions } from "../../src/filters/shared"

/** The empty config a freshly created filter starts with: every section present, nothing configured. */
export const buildProfile = {} satisfies BuildProfile

export const buildSpecificOptions = {
  links: {},
  highlightedEquipment: {},
  jewellery: {},
  early: {},
  tinctures: {},
  rareItems: {},
  magicItems: {},
  normalItems: {},
} satisfies BuildSpecificOptions

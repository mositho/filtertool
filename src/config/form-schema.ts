import type { BuildProfile, BuildSpecificOptions, HighlightedBaseTypeConfig } from "../filters/shared/sections/options"

export type SchemaControl = "number" | "boolean" | "select" | "multiselect" | "link-colors" | "highlight-list" | "highlight" | "sound"

export type SchemaField = {
  path: string
  label: string
  control: SchemaControl
  tooltip?: string
  /** Value shown when the config has nothing set; keeps the form prefilled with the effective default. */
  defaultValue?: unknown
  options?: string[]
  min?: number
  max?: number
  step?: number
  integer?: boolean
  /** Hide the empty "—" option in a select (for fields that always have a value). */
  noEmptyOption?: boolean
  /** Only render this field when another field's value matches. */
  visibleWhen?: { path: string; equals?: unknown; notEquals?: unknown; defaultValue?: unknown }
  /** Default shown only when another field matches; overrides `defaultValue`. */
  defaultWhen?: { path: string; equals: unknown; defaultValue?: unknown; value: unknown }
  /** Placeholder for empty inputs (overrides the control's default placeholder). */
  placeholder?: string
  /** Placeholder shown only when another field's value matches. */
  placeholderWhen?: { path: string; equals?: unknown; notEquals?: unknown; defaultValue?: unknown; value: string }
  /** Output filter section this field edits, used to scroll the preview. */
  previewSection?: string
  /** Restrict a highlight editor to weapon classes/base types. */
  weaponsOnly?: boolean
}

export type FieldSubsection = {
  key: string
  title: string
  description?: string
  fields: SchemaField[]
  /** Nested subsections rendered below this one. */
  subsections?: FieldSubsection[]
  /** Config root this subsection's fields live under; overrides the group's root. */
  root?: "buildProfile" | "buildSpecificOptions"
  /** Output filter section this subsection edits, used to scroll the preview. */
  previewSection?: string
}

export type FieldGroup = {
  key: string
  title: string
  description?: string
  fields: SchemaField[]
  subsections?: FieldSubsection[]
  /** Output filter section this group edits, used to scroll the preview. */
  previewSection?: string
}

// Note: must stay in sync with `HIGHLIGHTABLE_RARITIES` in sections/options.ts.
export const HIGHLIGHT_RARITIES = ["Normal", "Magic", "Rare"] as string[]

export const SOUND_FIELD_PATHS = ["tts", "soundFileName", "soundId"]

export const LINK_COLORS = [
  { value: "R", color: "#ff5c5c" },
  { value: "G", color: "#4ade80" },
  { value: "B", color: "#60a5fa" },
] as const

export const HIGHLIGHT_FIELDS: SchemaField[] = [
  { path: "baseTypes", label: "Base Types", control: "multiselect", options: [], tooltip: "Specific base types this highlight matches." },
  { path: "itemClasses", label: "Item Classes", control: "multiselect", options: [], tooltip: "Item classes this highlight matches." },
  {
    path: "rarities",
    label: "Rarities",
    control: "multiselect",
    options: HIGHLIGHT_RARITIES,
    tooltip: "Which rarities this highlight applies to. Defaults to Normal, Magic and Rare.",
  },
  {
    path: "minAps",
    label: "Minimum Attack Speed",
    control: "number",
    min: 0,
    step: 0.05,
    tooltip: "Minimum attack speed for matched weapons.",
  },
  {
    path: "linkedSockets",
    label: "Minimum Linked Sockets",
    control: "number",
    min: 0,
    max: 6,
    integer: true,
    placeholder: "e.g. 4",
    tooltip: "Number of linked sockets to require, e.g. 4. The maximum in the game is 6.",
  },
  {
    path: "minSockets",
    label: "Minimum Sockets",
    control: "number",
    min: 0,
    max: 6,
    integer: true,
    placeholder: "e.g. 4",
    tooltip: "Number of total sockets to require, e.g. 4 for a 4-socket item.",
  },
  {
    path: "minAreaLevel",
    label: "Minimum Area Level",
    control: "number",
    min: 0,
    integer: true,
    tooltip: "Only match items at or above this area level.",
  },
  {
    path: "maxAreaLevel",
    label: "Maximum Area Level",
    control: "number",
    min: 0,
    integer: true,
    tooltip: "Only match items at or below this area level.",
  },
  {
    path: "minItemLevel",
    label: "Minimum Item Level",
    control: "number",
    min: 0,
    integer: true,
    tooltip: "Only match items at or above this item level.",
  },
  {
    path: "maxItemLevel",
    label: "Maximum Item Level",
    control: "number",
    min: 0,
    integer: true,
    tooltip: "Only match items at or below this item level.",
  },
  {
    path: "weaponCutoffOverlap",
    label: "Overlap",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 5,
    tooltip: "A weapon base stays highlighted for this many area levels after it starts dropping (cutoff = drop level + overlap).",
  },
]

/** Per-rarity styling keys and their leaf fields on a highlight. */
export const RARITY_HIGHLIGHT_KEYS = ["normal", "magic", "rare"] as const
export const RARITY_HIGHLIGHT_PATHS = ["iconColor", "iconShape", "soundId", "soundFileName", "tts"] as const

/** Whole-highlight leaf fields (top-level icon/sound plus metadata). */
export const HIGHLIGHT_TOP_LEVEL_PATHS = [
  "name",
  "perRarityCustomization",
  "iconColor",
  "iconShape",
  "soundId",
  "soundFileName",
  "tts",
] as const

const buildProfileMain: SchemaField[] = [
  {
    path: "preferredColors",
    label: "Preferred Colors",
    control: "link-colors",
    defaultValue: ["R", "G", "B"],
    tooltip:
      "A link matches when it contains any of the selected colors (not all). With R, G and B selected, any red, green or blue link qualifies.",
  },
  {
    path: "preferredArmour",
    label: "Preferred Armour",
    control: "multiselect",
    options: [],
    tooltip: "Defence bases (armour, evasion, es, and hybrids) your build prefers for links.",
  },
]

const buildProfilePreferredWeapons: SchemaField[] = [
  {
    path: "preferredWeapons",
    label: "Preferred Weapons",
    control: "highlight",
    previewSection: "Preferred Weapons",
    weaponsOnly: true,
    tooltip: "Weapon classes and bases to highlight, with their rarities, cutoffs and sounds.",
  },
]

const buildEarlyWeapons: SchemaField[] = [
  {
    path: "earlyWeapons",
    label: "Early Weapons",
    control: "highlight",
    previewSection: "Early",
    weaponsOnly: true,
    tooltip: "Weapons to highlight during the early campaign, capped by the generic early max area level.",
  },
]

const buildEarlyShield: SchemaField[] = [
  {
    path: "shieldProgression",
    label: "Shield Progression",
    control: "select",
    options: ["none", "early", "full"],
    defaultValue: "early",
    noEmptyOption: true,
    tooltip:
      "none: no special highlighting for shields\nearly: highlight shields up to the early max area level\nfull: also highlight rare shields matching your preferred armour beyond the early cutoff",
  },
]

const buildEarlyGeneric: SchemaField[] = [
  {
    path: "early.earlyMaxAreaLevel",
    label: "Weapons & Shields",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 12,
    tooltip: "The shared cutoff for early weapon and shield highlighting, and for early rare-item sizing.",
  },
  {
    path: "early.twoSocketMaxAreaLevel",
    label: "Two Sockets",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 7,
    tooltip: "Area level up to which two-socket items are highlighted.",
  },
  {
    path: "early.threeSocketMaxAreaLevel",
    label: "Three Sockets",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 12,
    tooltip: "Area level up to which three-socket items are highlighted.",
  },
  {
    path: "early.earlyBootsMaxAreaLevel",
    label: "Rare Boots",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 24,
    tooltip: "Area level up to which rare boots are highlighted during the early campaign.",
  },
]

export const BUILD_PROFILE_SCHEMA: FieldGroup[] = [
  {
    key: "buildProfile",
    title: "Build profile",
    description: "Build-wide preferences shared by links, weapons, early items and shields.",
    previewSection: "Links",
    fields: buildProfileMain,
    subsections: [
      { key: "preferredWeapons", title: "Preferred weapons", previewSection: "Preferred Weapons", fields: buildProfilePreferredWeapons },
      { key: "shieldProgression", title: "Shield progression", previewSection: "Early", fields: buildEarlyShield },
    ],
  },
]

const linksAreaLevels: SchemaField[] = [
  {
    path: "links.twoLinkMaxAreaLevel",
    label: "Two Links",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 9,
    tooltip: "Area level up to which two-link items are shown.",
  },
  {
    path: "links.threeLinkMaxAreaLevel",
    label: "Three Links",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 33,
    tooltip: "Area level up to which three-link items are shown.",
  },
  {
    path: "links.fourLinkMaxAreaLevel",
    label: "Four Links",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 61,
    tooltip: "Area level up to which four-link items are shown.",
  },
]

const linksSoundCutoffs: SchemaField[] = [
  {
    path: "links.threeLinkTtsCutoffLevel",
    label: "Three Links",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 23,
    tooltip: "Up to this area level, three-links play a sound; beyond it they're silent.",
  },
  {
    path: "links.fourLinkTtsCutoffLevel",
    label: "Four Links",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 50,
    tooltip: "Up to this area level, four-links play a sound; beyond it they're silent.",
  },
]

const linksGeneric: SchemaField[] = [
  {
    path: "links.genericThreeLinksEnabled",
    label: "Three Links",
    control: "boolean",
    defaultValue: false,
    tooltip: "Show three-linked items even when they don't match your socket colors or armour.",
  },
  {
    path: "links.genericFourLinksEnabled",
    label: "Four Links",
    control: "boolean",
    defaultValue: false,
    tooltip: "Show four-linked items even when they don't match your socket colors or armour.",
  },
]

const equipmentRarityItems: SchemaField[] = [
  {
    path: "normalItems.maxAreaLevel",
    label: "Normal Items",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 4,
    previewSection: "Normal Items",
    tooltip: "Area level up to which normal items are shown. Only applies to items that don't match other rules.",
  },
  {
    path: "magicItems.maxAreaLevel",
    label: "Magic Items",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 9,
    previewSection: "Magic Items",
    tooltip: "Area level up to which magic items are shown. Only applies to items that don't match other rules.",
  },
  {
    path: "rareItems.maxAreaLevel",
    label: "Rare Items",
    control: "number",
    min: 0,
    integer: true,
    placeholder: "uncapped",
    previewSection: "Rare Items",
    tooltip: "Area level up to which rare items are shown; empty means uncapped. Only applies to items that don't match other rules.",
  },
]

const equipmentJewelleryAmulets: SchemaField[] = [
  {
    path: "jewellery.amulets",
    label: "Amulets",
    control: "multiselect",
    options: [],
    defaultValue: ["Amber", "Jade", "Lapis", "Turquoise", "Citrine", "Agate", "Onyx"],
    tooltip: "Amulet base types to highlight during leveling. Each plays its own drop sound.",
  },
]

const equipmentJewelleryCutoffs: SchemaField[] = [
  {
    path: "jewellery.amuletMaxAreaLevel",
    label: "Amulets",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 24,
    tooltip: "Area level up to which normal and magic amulets are highlighted.",
  },
  {
    path: "jewellery.basicRingMaxAreaLevel",
    label: "Basic Ring",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 16,
    tooltip: "Area level up to which basic rings (Iron, Coral) are highlighted (Magic and Normal).",
  },
  {
    path: "jewellery.elementalRingMaxAreaLevel",
    label: "Elemental Ring",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 33,
    tooltip: "Area level up to which elemental rings (Ruby, Sapphire, Topaz, Two-Stone) are highlighted (Magic and Normal).",
  },
  {
    path: "jewellery.beltMaxAreaLevel",
    label: "Belt",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 24,
    tooltip: "Area level up to which belts are highlighted (Magic and Normal).",
  },
]

const equipmentTinctures: SchemaField[] = [
  {
    path: "tinctures.baseTypes",
    label: "Base Types",
    control: "multiselect",
    options: [],
    defaultValue: ["Prismatic Tincture"],
    tooltip: "Tincture base types to highlight.",
  },
]

export const BUILD_SPECIFIC_SCHEMA: FieldGroup[] = [
  {
    key: "early",
    title: "Early",
    description: "Early-campaign weapon and item highlights.",
    previewSection: "Early",
    fields: [],
    subsections: [
      { key: "weapons", title: "Weapons", root: "buildProfile", previewSection: "Early", fields: buildEarlyWeapons },
      { key: "generic", title: "Area level cutoffs", previewSection: "Early", fields: buildEarlyGeneric },
    ],
  },
  {
    key: "links",
    title: "Links",
    description: "Which linked-socket items are shown and when they play a sound.",
    previewSection: "Links",
    fields: [],
    subsections: [
      { key: "areaLevels", title: "Area level cutoffs", fields: linksAreaLevels },
      { key: "soundCutoffs", title: "Sound cutoffs", fields: linksSoundCutoffs },
      {
        key: "generic",
        title: "Generic links",
        description: "Show linked items even when they don't match your socket colors or armour.",
        fields: linksGeneric,
      },
    ],
  },
  {
    key: "equipment",
    title: "Equipment",
    description: "Rarity thresholds, jewellery and tinctures.",
    fields: [],
    subsections: [
      {
        key: "jewellery",
        title: "Jewellery",
        previewSection: "Jewellery",
        fields: equipmentJewelleryAmulets,
        subsections: [
          { key: "jewelleryCutoffs", title: "Non-Rare max area level", previewSection: "Jewellery", fields: equipmentJewelleryCutoffs },
        ],
      },
      { key: "tinctures", title: "Tinctures", previewSection: "Tinctures", fields: equipmentTinctures },
      { key: "rarityItems", title: "Max Area Level", fields: equipmentRarityItems },
    ],
  },
  {
    key: "highlightedEquipment",
    title: "Highlights",
    description: "Build-specific item highlights.",
    previewSection: "Highlighted Equipment",
    fields: [
      {
        path: "highlightedEquipment.highlights",
        label: "Highlights",
        control: "highlight-list",
        tooltip:
          "Extra build-specific item highlights. Each can match base types or item classes and opt into modules for attack speed, linked sockets, area level, icons and sounds.",
      },
    ],
  },
]

export const FILTER_FORM_SCHEMA = {
  buildProfile: BUILD_PROFILE_SCHEMA,
  buildSpecificOptions: BUILD_SPECIFIC_SCHEMA,
}

/**
 * The full set of config leaf paths the UI form can edit. Special controls are
 * expanded into their constituent leaves so this can be diffed against the
 * TypeScript config types (see the drift test).
 */
export function schemaLeafPaths(): string[] {
  const paths: string[] = []
  const collectFields = (subsection: FieldSubsection): SchemaField[] => [
    ...subsection.fields,
    ...(subsection.subsections ?? []).flatMap(collectFields),
  ]
  for (const group of [...BUILD_PROFILE_SCHEMA, ...BUILD_SPECIFIC_SCHEMA]) {
    const fields = [...group.fields, ...(group.subsections ?? []).flatMap(collectFields)]
    for (const field of fields) {
      if (field.control === "highlight-list" || field.control === "highlight") {
        for (const highlightField of HIGHLIGHT_FIELDS) {
          paths.push(`${field.path}.${highlightField.path}`)
        }
        for (const topLevelPath of HIGHLIGHT_TOP_LEVEL_PATHS) {
          paths.push(`${field.path}.${topLevelPath}`)
        }
        for (const rarity of RARITY_HIGHLIGHT_KEYS) {
          for (const rarityPath of RARITY_HIGHLIGHT_PATHS) {
            paths.push(`${field.path}.${rarity}.${rarityPath}`)
          }
        }
      } else {
        paths.push(field.path)
      }
    }
  }
  return paths.sort()
}

/** A fresh highlight used as the seed for a newly added highlight row. */
export function emptyHighlight(): HighlightedBaseTypeConfig {
  return {}
}

/**
 * Seed for the build-profile weapon highlights (early/preferred weapons).
 * These default to per-rarity customization with the classic rarity icons
 * and an alert sound on rares.
 */
export function emptyWeaponHighlight(): HighlightedBaseTypeConfig {
  return {
    perRarityCustomization: true,
    weaponCutoffOverlap: 5,
    normal: { iconColor: "Cyan", iconShape: "UpsideDownHouse" },
    magic: { iconColor: "Blue", iconShape: "UpsideDownHouse" },
    rare: { iconColor: "Yellow", iconShape: "UpsideDownHouse", soundId: 3 },
  }
}

/** The empty filter config used for a brand-new filter. */
export const EMPTY_FILTER_CONFIG = {
  buildProfile: {} satisfies BuildProfile,
  buildSpecificOptions: {} satisfies BuildSpecificOptions,
}

function isHighlightControl(control: SchemaControl): boolean {
  return control === "highlight" || control === "highlight-list"
}

function stripHighlights(groups: FieldGroup[]): FieldGroup[] {
  const stripSubsections = (subsections?: FieldSubsection[]): FieldSubsection[] | undefined => {
    if (!subsections) return undefined
    const stripped = subsections
      .map((subsection) => ({
        ...subsection,
        fields: subsection.fields.filter((field) => !isHighlightControl(field.control)),
        subsections: stripSubsections(subsection.subsections),
      }))
      .filter((subsection) => subsection.fields.length > 0 || (subsection.subsections?.length ?? 0) > 0)
    return stripped.length > 0 ? stripped : undefined
  }

  return groups
    .map((group) => ({
      ...group,
      fields: group.fields.filter((field) => !isHighlightControl(field.control)),
      subsections: stripSubsections(group.subsections),
    }))
    .filter((group) => group.fields.length > 0 || (group.subsections?.length ?? 0) > 0)
}

/**
 * Editable shared-defaults fields. Mirrors the filter schema (same groups and
 * fields, minus highlights); values come from `baseFilterDefaults` (served as
 * `baseDefaults`).
 */
export const DEFAULTS_SCHEMA: FieldGroup[] = stripHighlights([...BUILD_PROFILE_SCHEMA, ...BUILD_SPECIFIC_SCHEMA])

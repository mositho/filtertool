import type { BuildProfile, BuildSpecificOptions, HighlightedBaseTypeConfig } from "../filters/shared/sections/options"
import { EQUIPMENT_FOOTPRINTS, EQUIPMENT_RARITY_TEXT } from "../filters/shared/equipment-rules"

export type SchemaControl =
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "link-colors"
  | "highlight-list"
  | "weapon-phases"
  | "sound"
  | "rule-sound"
  | "style"
  | "icon"

export type SchemaField = {
  fullWidth?: boolean
  path: string
  label: string
  control: SchemaControl
  tooltip?: string
  /** Value shown when the config has nothing set; keeps the form prefilled with the effective default. */
  defaultValue?: unknown
  defaultFrom?: { path: string; label: string; value?: unknown }
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
}

export type FieldSubsection = {
  /** Primary cutoff and size controls share a row on wider screens. */
  layout?: "cutoff-size"
  /** Presentation card inside the shared Advanced disclosure. */
  module?: boolean
  collapsed?: boolean
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

export const SIZE_OPERATORS = [
  { value: "==", label: "exactly" },
  { value: ">=", label: "at least" },
  { value: "<=", label: "at most" },
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
    defaultValue: 10,
    tooltip: "A weapon base stays highlighted for this many area levels after it starts dropping (cutoff = drop level + overlap).",
  },
]

/** Per-rarity styling keys and their leaf fields on a highlight. */
export const RARITY_HIGHLIGHT_KEYS = ["normal", "magic", "rare"] as const
export const RARITY_HIGHLIGHT_PATHS = ["iconColor", "iconShape", "iconSize", "soundId", "soundFileName", "tts"] as const

/** Whole-highlight leaf fields (top-level icon/sound plus metadata). */
export const HIGHLIGHT_TOP_LEVEL_PATHS = [
  "name",
  "perRarityCustomization",
  "iconColor",
  "iconShape",
  "iconSize",
  "soundId",
  "soundFileName",
  "tts",
] as const

/** Leaf paths of a highlight's size module (width/height operator + value). */
export const SIZE_CONSTRAINT_PATHS = ["width.operator", "width.value", "height.operator", "height.value"] as const

/** Leaf paths of a highlight's style module (preset reference + inline overrides). */
export const STYLE_PATHS = [
  "style.preset",
  "style.text",
  "style.background",
  "style.backgroundOpacity",
  "style.border",
  "style.size",
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

const buildProfileMisc: SchemaField[] = [
  {
    path: "misc.whetstoneRecipe",
    label: "Whetstone Recipe",
    control: "boolean",
    defaultValue: true,
    previewSection: "Whetstone Recipe",
    tooltip: "Show 20% quality normal weapons for the Blacksmith's Whetstone recipe.",
  },
]

const earlyRusticSash: SchemaField[] = [
  {
    path: "misc.showRusticSash",
    label: "Show Rustic Sash",
    control: "boolean",
    defaultValue: true,
    previewSection: "Early",
    tooltip: "Highlight Rustic Sash belts in early areas.",
  },
]

const buildEarlyGeneric: SchemaField[] = [
  {
    path: "early.earlyMaxAreaLevel",
    label: "Early Max Area Level",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 12,
    tooltip: "Shared default cutoff for early shields, three-socket items and generic three-links. Each can be overridden separately.",
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
    defaultFrom: { path: "early.earlyMaxAreaLevel", label: "Early Max Area Level", value: 12 },
    previewSection: "Early Sockets",
    tooltip: "Max Area Level for three-socket items, linked or unlinked. Follows Early Max Area Level unless overridden.",
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
  {
    path: "early.shieldMaxAreaLevel",
    label: "Early Shields · Max Area Level",
    control: "number",
    min: 0,
    integer: true,
    defaultFrom: { path: "early.earlyMaxAreaLevel", label: "Early Max Area Level", value: 12 },
    tooltip:
      "Ends early shield highlighting and starts preferred rare shields in Full progression mode. Follows Early Max Area Level unless overridden.",
  },
]

export const BUILD_PROFILE_SCHEMA: FieldGroup[] = [
  {
    key: "buildProfile",
    title: "Build profile",
    description: "Build-wide preferences shared by links, early items and shields.",
    previewSection: "Links",
    fields: buildProfileMain,
    subsections: [
      { key: "shieldProgression", title: "Shield progression", previewSection: "Early", fields: buildEarlyShield },
      { key: "misc", title: "Misc", fields: buildProfileMisc },
    ],
  },
  {
    key: "weaponProgression",
    title: "Weapon progression",
    description: "Choose weapons by Area Level; more-specific ranges take priority.",
    previewSection: "Weapon Progression",
    fields: [{ path: "weaponPhases", label: "Weapon phases", control: "weapon-phases" }],
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
    tooltip:
      "Area level up to which three-link items matching your socket colors or armour are shown. Enabling generic three-links extends them to this level too.",
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
    tooltip:
      "Up to this Area Level, three-links play a sound; beyond it they're silent. Sound never extends visibility. Generic three-links stop at their early cutoff unless extended.",
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
    path: "links.genericThreeLinkMaxAreaLevel",
    fullWidth: true,
    label: "Early Generic Three Links · Max Area Level",
    control: "number",
    min: 0,
    integer: true,
    defaultFrom: { path: "early.earlyMaxAreaLevel", label: "Early Max Area Level", value: 12 },
    tooltip:
      "Show generic three-links through this Area Level even when the extension toggle is off. Follows Early Max Area Level unless overridden; the three-link maximum still applies.",
  },
  {
    path: "links.genericThreeLinksEnabled",
    label: "Three Links",
    control: "boolean",
    defaultValue: false,
    tooltip: "Also show three-linked items past their early cutoff, even when they don't match your socket colors or armour.",
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
    path: "magicItems.smallMaxAreaLevel",
    label: "Small Magic Items",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 24,
    previewSection: "Magic Items",
    tooltip:
      "Small magic items fit within 2×2 in your inventory (jewellery, belts, gloves, boots, helmets, quivers). Shown up to this area level.",
  },
  {
    path: "magicItems.bigMaxAreaLevel",
    label: "Big Magic Items",
    control: "number",
    min: 0,
    integer: true,
    defaultValue: 9,
    previewSection: "Magic Items",
    tooltip:
      "Big magic items are larger than 2×2 in your inventory (body armour, two-handed weapons, bows, staves). Shown up to this area level.",
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

const equipmentFlasks: SchemaField[] = [
  {
    path: "flasks.utilityFlasks",
    label: "Utility Flasks",
    control: "multiselect",
    options: [
      "Quicksilver",
      "Bismuth",
      "Stibnite",
      "Amethyst",
      "Ruby",
      "Sapphire",
      "Topaz",
      "Silver",
      "Aquamarine",
      "Granite",
      "Jade",
      "Quartz",
      "Sulphur",
      "Basalt",
      "Diamond",
      "Gold",
      "Corundum",
      "Iron",
    ],
    defaultValue: ["Jade", "Quartz", "Quicksilver", "Silver", "Granite"],
    tooltip: "Utility flask base types that receive a dedicated callout; other utility flasks keep the generic style.",
  },
]

function ruleSection(
  path: string,
  title: string,
  style: Record<string, unknown>,
  maximum?: SchemaField["defaultFrom"],
  soundCutoff?: SchemaField["defaultFrom"],
  inlineSize = false,
): FieldSubsection {
  const styleField: SchemaField = { path: `${path}.style`, label: "Style", control: "style", defaultValue: style }
  return {
    key: path,
    title,
    collapsed: true,
    ...(inlineSize ? { layout: "cutoff-size" as const } : {}),
    fields: [
      { path: `${path}.enabled`, label: "Rule enabled", control: "boolean", defaultValue: true },
      ...(maximum
        ? [
            {
              path: `${path}.maxAreaLevel`,
              label: "Max Area Level",
              control: "number" as const,
              fullWidth: !inlineSize,
              min: 0,
              integer: true,
              defaultFrom: maximum,
              ...(maximum.value === undefined ? { placeholder: "uncapped" } : {}),
            },
          ]
        : []),
      ...(inlineSize
        ? [
            {
              path: `${path}.style.size`,
              label: "Size",
              control: "number" as const,
              min: 20,
              max: 45,
              integer: true,
              defaultValue: style.size ?? 45,
            },
          ]
        : []),
    ],
    subsections: [
      { key: `${path}.style`, title: "Style", module: true, fields: [styleField] },
      {
        key: `${path}.icon`,
        title: "Icon",
        module: true,
        fields: [{ path: `${path}.icon`, label: "Minimap icon", control: "icon", defaultValue: { enabled: false } }],
      },
      {
        key: `${path}.sound`,
        title: "Sound",
        module: true,
        fields: [
          ...(soundCutoff
            ? [
                {
                  path: `${path}.soundCutoffLevel`,
                  label: "Sound · Max Area Level",
                  control: "number" as const,
                  min: 0,
                  integer: true,
                  defaultFrom: soundCutoff,
                },
              ]
            : []),
          {
            path: `${path}.sound`,
            label: "Sound",
            control: "rule-sound",
            defaultValue: { enabled: !!soundCutoff },
            tooltip: soundCutoff
              ? "Uses the existing per-slot callout by default. Custom sounds stop at the sound cutoff too."
              : "Silent by default.",
          },
        ],
      },
    ],
  }
}

const socketRules = [2, 3].map((count) =>
  ruleSection(
    `early.rules.armour${count}`,
    `${count} Sockets · Armour`,
    { size: count === 2 ? 40 : 45 },
    {
      path: `early.${count === 2 ? "two" : "three"}SocketMaxAreaLevel`,
      label: `${count === 2 ? "Two" : "Three"} Sockets`,
      value: count === 2 ? 7 : undefined,
    },
    undefined,
    true,
  ),
)

const linkRules = [2, 3, 4].flatMap((count) =>
  ["selected", "good", "generic"].map((tier) => {
    const word = count === 2 ? "two" : count === 3 ? "three" : "four"
    const preset = `${tier === "generic" ? "" : tier}${tier === "generic" ? word : word[0].toUpperCase() + word.slice(1)}Link`
    return ruleSection(
      `links.rules.${count}${tier}`,
      `${count} Links · ${tier === "selected" ? "Colours + Armour" : tier === "good" ? "Colours or Armour" : "Generic"}`,
      { preset },
      { path: `links.${word}LinkMaxAreaLevel`, label: `${count} Links`, value: count === 2 ? 9 : count === 3 ? 33 : 61 },
      count === 2
        ? undefined
        : { path: `links.${word}LinkTtsCutoffLevel`, label: `${count} Links sound cutoff`, value: count === 3 ? 23 : 50 },
      true,
    )
  }),
)

const genericEquipment: FieldSubsection[] = [
  {
    key: "normalRules",
    title: "Normal",
    collapsed: true,
    previewSection: "Normal Items",
    fields: [],
    subsections: [
      ruleSection(
        "normalItems.rules.equipment",
        "Socketable Equipment",
        { size: 40 },
        { path: "normalItems.maxAreaLevel", label: "Normal Items", value: 4 },
      ),
      ruleSection(
        "normalItems.rules.belts",
        "Belts",
        { preset: "jewellery" },
        { path: "normalItems.maxAreaLevel", label: "Normal Items", value: 4 },
      ),
    ],
  },
  ...(["magic", "rare"] as const).map(
    (rarity): FieldSubsection => ({
      key: `${rarity}Rules`,
      title: rarity === "magic" ? "Magic" : "Rare",
      collapsed: true,
      previewSection: rarity === "magic" ? "Magic Items" : "Rare Items",
      fields: [],
      subsections: [
        ...EQUIPMENT_FOOTPRINTS.map(({ key, width, height, size }) =>
          ruleSection(
            `${rarity}Items.rules.${key}`,
            `${width}×${height} · ${width * height} inventory ${width * height === 1 ? "slot" : "slots"}`,
            { size, text: EQUIPMENT_RARITY_TEXT[rarity] },
            rarity === "rare"
              ? { path: "rareItems.maxAreaLevel", label: "Rare Items" }
              : {
                  path: `magicItems.${height <= 2 ? "small" : "big"}MaxAreaLevel`,
                  label: `${height <= 2 ? "Small" : "Big"} Magic Items`,
                  value: height <= 2 ? 24 : 9,
                },
            undefined,
            true,
          ),
        ),
      ],
    }),
  ),
]

export const BUILD_SPECIFIC_SCHEMA: FieldGroup[] = [
  {
    key: "early",
    title: "Early",
    description: "Early-campaign socket and item cutoffs.",
    previewSection: "Early",
    fields: [],
    subsections: [
      { key: "generic", title: "Area level cutoffs", previewSection: "Early", fields: buildEarlyGeneric },
      { key: "rusticSash", title: "Rustic Sash", root: "buildProfile", previewSection: "Early", fields: earlyRusticSash },
      {
        key: "socketRules",
        title: "Socket Rules",
        collapsed: true,
        previewSection: "Early Sockets",
        fields: [],
        subsections: socketRules,
      },
    ],
  },
  {
    key: "links",
    title: "Links",
    description: "Armour only; first matching link tier wins.",
    previewSection: "Links",
    fields: [],
    subsections: [
      { key: "areaLevels", title: "Area level cutoffs", fields: linksAreaLevels },
      { key: "soundCutoffs", title: "Sound cutoffs", fields: linksSoundCutoffs },
      {
        key: "generic",
        title: "Generic links",
        description: "Extend generic links beyond their early cutoff.",
        fields: linksGeneric,
      },
      { key: "linkRules", title: "Link Rules", collapsed: true, fields: [], subsections: linkRules },
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
      { key: "flasks", title: "Flasks", previewSection: "Flasks", fields: equipmentFlasks },
      { key: "rarityItems", title: "Max Area Level", fields: equipmentRarityItems },
      { key: "genericEquipment", title: "Equipment Rules", collapsed: true, fields: [], subsections: genericEquipment },
    ],
  },
  {
    key: "gems",
    title: "Gems",
    description: "Choose gems to highlight with a spoken callout, or highlight without sound.",
    previewSection: "Gems",
    fields: [
      {
        path: "gemCallouts.gems",
        label: "Gem style + sound",
        control: "multiselect",
        options: [],
        tooltip:
          'Each gem you add gets its own TTS callout speaking its name (e.g. picking "Fireball" plays a sound saying "Fireball"). Matched before the generic gem rules.',
      },
      {
        path: "gemCallouts.styleOnly",
        label: "Gem style only",
        control: "multiselect",
        options: [],
        tooltip: "Highlight selected gems with the gem style, without a sound. Matched before the generic gem rules.",
      },
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
      if (field.path.includes(".rules.")) {
        paths.push(field.path.split(".rules.")[0] + ".rules")
      } else if (field.control === "highlight-list" || field.control === "weapon-phases") {
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
        for (const sizePath of SIZE_CONSTRAINT_PATHS) {
          paths.push(`${field.path}.${sizePath}`)
        }
        for (const stylePath of STYLE_PATHS) {
          paths.push(`${field.path}.${stylePath}`)
        }
      } else {
        paths.push(field.path)
      }
    }
  }
  return [...new Set(paths)].sort()
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
    weaponCutoffOverlap: 10,
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
  return control === "highlight-list" || control === "weapon-phases"
}

// These are per-filter controls: their sections have no shared-default fallback.
const PER_FILTER_ONLY_FIELDS = new Set(["gemCallouts.gems", "gemCallouts.styleOnly"])

function isSharedDefaultField(field: SchemaField): boolean {
  return !isHighlightControl(field.control) && !PER_FILTER_ONLY_FIELDS.has(field.path)
}

function stripHighlights(groups: FieldGroup[]): FieldGroup[] {
  const stripSubsections = (subsections?: FieldSubsection[]): FieldSubsection[] | undefined => {
    if (!subsections) return undefined
    const stripped = subsections
      .map((subsection) => ({
        ...subsection,
        fields: subsection.fields.filter(isSharedDefaultField),
        subsections: stripSubsections(subsection.subsections),
      }))
      .filter((subsection) => subsection.fields.length > 0 || (subsection.subsections?.length ?? 0) > 0)
    return stripped.length > 0 ? stripped : undefined
  }

  return groups
    .map((group) => ({
      ...group,
      fields: group.fields.filter(isSharedDefaultField),
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

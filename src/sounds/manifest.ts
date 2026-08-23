export interface SoundManifestEntry {
  id: string
  text: string
}

export const CURRENCY_SOUNDS = [
  { id: "chaos_orb", text: "Chaos" },
  { id: "exalted_orb", text: "Exalted" },
  { id: "divine_orb", text: "Divine" },
  { id: "regal_orb", text: "Regal" },
  { id: "orb_of_chance", text: "Chance" },
  { id: "orb_of_binding", text: "Binding" },
  { id: "orb_of_scouring", text: "Scour" },
  { id: "orb_of_alchemy", text: "Alchemy" },
  { id: "orb_of_alteration", text: "Alt" },
  { id: "vaal_orb", text: "Vaal" },
  { id: "orb_of_regret", text: "Regret" },
  { id: "orb_of_fusing", text: "Fusing" },
  { id: "jewellers_orb", text: "Jeweller's" },
  { id: "chromatic_orb", text: "Chrome" },
  { id: "armourers_scrap", text: "Scrap" },
  { id: "orb_of_augmentation", text: "Augment" },
  { id: "orb_of_transmutation", text: "Trans" },
  { id: "blacksmiths_whetstone", text: "Whet" },
  { id: "wisdom_scroll", text: "Wisdom" },
  { id: "portal_scroll", text: "Portal" },
] as const satisfies readonly SoundManifestEntry[]

export const JEWELLERY_SOUNDS = [
  { id: "rare_ring", text: "Rare Ring" },
  { id: "rare_amethyst", text: "Rare Amethyst" },
  { id: "rare_leather", text: "Rare Leather" },
  { id: "rare_heavy", text: "Rare Heavy" },
  { id: "rare_rustic", text: "Rare Rustic" },
  { id: "amethyst_ring", text: "Amethyst Ring" },
  { id: "iron_ring", text: "Iron" },
  { id: "sapphire_ring", text: "Sapphire" },
  { id: "ruby_ring", text: "Ruby" },
  { id: "topaz_ring", text: "Topaz" },
  { id: "two_stone_ring", text: "Two-Stone" },
  { id: "magic_leather", text: "Magic Leather" },
  { id: "leather_belt", text: "Leather" },
  { id: "magic_heavy", text: "Magic Heavy" },
  { id: "heavy_belt", text: "Heavy" },
  { id: "amber_amulet", text: "Amber" },
  { id: "jade_amulet", text: "Jade" },
  { id: "lapis_amulet", text: "Lapis" },
  { id: "rustic_belt", text: "Rustic" },
] as const satisfies readonly SoundManifestEntry[]

export const FLASK_SOUNDS = [
  { id: "life", text: "Life" },
  { id: "medium_life", text: "Medium Life" },
  { id: "large_life", text: "Large Life" },
  { id: "greater_life", text: "Greater Life" },
  { id: "grand_life", text: "Grand Life" },
  { id: "giant_life", text: "Giant Life" },
  { id: "colossal_life", text: "Colossal Life" },
  { id: "hallowed_life", text: "Hallowed Life" },
  { id: "divine_life", text: "Divine Life" },
  { id: "mana", text: "Mana" },
  { id: "medium_mana", text: "Medium Mana" },
  { id: "large_mana", text: "Large Mana" },
  { id: "greater_mana", text: "Greater Mana" },
  { id: "grand_mana", text: "Grand Mana" },
  { id: "giant_mana", text: "Giant Mana" },
  { id: "colossal_mana", text: "Colossal Mana" },
  { id: "sacred_mana", text: "Sacred Mana" },
  { id: "hallowed_mana", text: "Hallowed Mana" },
  { id: "sanctified_mana", text: "Sanctified Mana" },
  { id: "eternal_mana", text: "Eternal Mana" },
  { id: "divine_mana", text: "Divine Mana" },
  { id: "jade_flask", text: "Jade" },
  { id: "quartz_flask", text: "Quartz" },
  { id: "quicksilver_flask", text: "Quicksilver" },
  { id: "silver_flask", text: "Silver" },
  { id: "granite_flask", text: "Granite" },
] as const satisfies readonly SoundManifestEntry[]

export const WEAPON_SOUNDS = [
  { id: "axe", text: "Axe" },
  { id: "bow", text: "Bow" },
  { id: "wand", text: "Wand" },
  { id: "mace", text: "Mace" },
  { id: "sword", text: "Sword" },
  { id: "staff", text: "Staff" },
  { id: "dagger", text: "Dagger" },
  { id: "claw", text: "Claw" },
  { id: "sceptre", text: "Sceptre" },
] as const satisfies readonly SoundManifestEntry[]

export const LINK_SOUNDS = [
  { id: "3_body", text: "Three Link Body" },
  { id: "3_gloves", text: "Three Link Gloves" },
  { id: "3_boots", text: "Three Link Boots" },
  { id: "3_helm", text: "Three Link Helmet" },
  { id: "3_shield", text: "Three Link Shield" },
  { id: "4_body", text: "Four Link Body" },
  { id: "4_gloves", text: "Four Link Gloves" },
  { id: "4_boots", text: "Four Link Boots" },
  { id: "4_helm", text: "Four Link Helmet" },
] as const satisfies readonly SoundManifestEntry[]

export const OTHER_SOUNDS = [
  { id: "six_link", text: "Six Link" },
  { id: "five_link", text: "Five Link" },
  { id: "six_socket", text: "Six Socket" },
  { id: "chromatic_recipe", text: "Chrome Recipe" },
  { id: "rare_boots", text: "Rare Boots" },
] as const satisfies readonly SoundManifestEntry[]

export const SOUND_MANIFEST = [
  ...CURRENCY_SOUNDS,
  ...JEWELLERY_SOUNDS,
  ...FLASK_SOUNDS,
  ...WEAPON_SOUNDS,
  ...LINK_SOUNDS,
  ...OTHER_SOUNDS,
] as const satisfies readonly SoundManifestEntry[]

export type SoundManifestId = (typeof SOUND_MANIFEST)[number]["id"]

export const MANIFEST_BY_ID = Object.fromEntries(SOUND_MANIFEST.map((e) => [e.id, e])) as Record<
  SoundManifestId,
  (typeof SOUND_MANIFEST)[number]
>

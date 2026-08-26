export interface SoundManifestEntry {
  id: string
  /** The text the TTS speaks. */
  text: string
  /** The full item name shown in the UI. */
  name: string
}

export const CURRENCY_SOUNDS = [
  { id: "chaos_orb", text: "Chaos", name: "Chaos Orb" },
  { id: "exalted_orb", text: "Exalted", name: "Exalted Orb" },
  { id: "divine_orb", text: "Divine", name: "Divine Orb" },
  { id: "regal_orb", text: "Regal", name: "Regal Orb" },
  { id: "orb_of_chance", text: "Chance", name: "Orb of Chance" },
  { id: "orb_of_binding", text: "Binding", name: "Orb of Binding" },
  { id: "orb_of_scouring", text: "Scour", name: "Orb of Scouring" },
  { id: "orb_of_alchemy", text: "Alchemy", name: "Orb of Alchemy" },
  { id: "orb_of_alteration", text: "Alt", name: "Orb of Alteration" },
  { id: "vaal_orb", text: "Vaal", name: "Vaal Orb" },
  { id: "orb_of_regret", text: "Regret", name: "Orb of Regret" },
  { id: "orb_of_fusing", text: "Fusing", name: "Orb of Fusing" },
  { id: "jewellers_orb", text: "Jeweller's", name: "Jeweller's Orb" },
  { id: "chromatic_orb", text: "Chrome", name: "Chromatic Orb" },
  { id: "armourers_scrap", text: "Scrap", name: "Armourer's Scrap" },
  { id: "orb_of_augmentation", text: "Augment", name: "Orb of Augmentation" },
  { id: "orb_of_transmutation", text: "Trans", name: "Orb of Transmutation" },
  { id: "blacksmiths_whetstone", text: "Whet", name: "Blacksmith's Whetstone" },
  { id: "wisdom_scroll", text: "Wisdom", name: "Wisdom Scroll" },
  { id: "portal_scroll", text: "Portal", name: "Portal Scroll" },
] as const satisfies readonly SoundManifestEntry[]

export const JEWELLERY_SOUNDS = [
  { id: "rare_ring", text: "Rare Ring", name: "Rare Ring" },
  { id: "rare_amethyst", text: "Rare Amethyst", name: "Rare Amethyst" },
  { id: "rare_leather", text: "Rare Leather", name: "Rare Leather" },
  { id: "rare_heavy", text: "Rare Heavy", name: "Rare Heavy" },
  { id: "rare_rustic", text: "Rare Rustic", name: "Rare Rustic" },
  { id: "amethyst_ring", text: "Amethyst", name: "Amethyst Ring" },
  { id: "iron_ring", text: "Iron", name: "Iron Ring" },
  { id: "sapphire_ring", text: "Sapphire", name: "Sapphire Ring" },
  { id: "ruby_ring", text: "Ruby", name: "Ruby Ring" },
  { id: "topaz_ring", text: "Topaz", name: "Topaz Ring" },
  { id: "two_stone_ring", text: "Two-Stone", name: "Two-Stone Ring" },
  { id: "magic_leather", text: "Magic Leather", name: "Magic Leather" },
  { id: "leather_belt", text: "Leather", name: "Leather Belt" },
  { id: "magic_heavy", text: "Magic Heavy", name: "Magic Heavy" },
  { id: "heavy_belt", text: "Heavy", name: "Heavy Belt" },
  { id: "amber_amulet", text: "Amber", name: "Amber Amulet" },
  { id: "jade_amulet", text: "Jade", name: "Jade Amulet" },
  { id: "lapis_amulet", text: "Lapis", name: "Lapis Amulet" },
  { id: "turquoise_amulet", text: "Turquoise", name: "Turquoise Amulet" },
  { id: "citrine_amulet", text: "Citrine", name: "Citrine Amulet" },
  { id: "agate_amulet", text: "Agate", name: "Agate Amulet" },
  { id: "onyx_amulet", text: "Onyx", name: "Onyx Amulet" },
  { id: "rustic_sash", text: "Rustic Sash", name: "Rustic Sash" },
] as const satisfies readonly SoundManifestEntry[]

export const FLASK_SOUNDS = [
  { id: "life", text: "Life", name: "Life Flask" },
  { id: "medium_life", text: "Medium Life", name: "Medium Life Flask" },
  { id: "large_life", text: "Large Life", name: "Large Life Flask" },
  { id: "greater_life", text: "Greater Life", name: "Greater Life Flask" },
  { id: "grand_life", text: "Grand Life", name: "Grand Life Flask" },
  { id: "giant_life", text: "Giant Life", name: "Giant Life Flask" },
  { id: "colossal_life", text: "Colossal Life", name: "Colossal Life Flask" },
  { id: "hallowed_life", text: "Hallowed Life", name: "Hallowed Life Flask" },
  { id: "divine_life", text: "Divine Life", name: "Divine Life Flask" },
  { id: "mana", text: "Mana", name: "Mana Flask" },
  { id: "medium_mana", text: "Medium Mana", name: "Medium Mana Flask" },
  { id: "large_mana", text: "Large Mana", name: "Large Mana Flask" },
  { id: "greater_mana", text: "Greater Mana", name: "Greater Mana Flask" },
  { id: "grand_mana", text: "Grand Mana", name: "Grand Mana Flask" },
  { id: "giant_mana", text: "Giant Mana", name: "Giant Mana Flask" },
  { id: "colossal_mana", text: "Colossal Mana", name: "Colossal Mana Flask" },
  { id: "sacred_mana", text: "Sacred Mana", name: "Sacred Mana Flask" },
  { id: "hallowed_mana", text: "Hallowed Mana", name: "Hallowed Mana Flask" },
  { id: "sanctified_mana", text: "Sanctified Mana", name: "Sanctified Mana Flask" },
  { id: "eternal_mana", text: "Eternal Mana", name: "Eternal Mana Flask" },
  { id: "divine_mana", text: "Divine Mana", name: "Divine Mana Flask" },
  { id: "jade_flask", text: "Jade", name: "Jade Flask" },
  { id: "quartz_flask", text: "Quartz", name: "Quartz Flask" },
  { id: "quicksilver_flask", text: "Quicksilver", name: "Quicksilver Flask" },
  { id: "silver_flask", text: "Silver", name: "Silver Flask" },
  { id: "granite_flask", text: "Granite", name: "Granite Flask" },
] as const satisfies readonly SoundManifestEntry[]

export const WEAPON_SOUNDS = [
  { id: "axe", text: "Axe", name: "Axe" },
  { id: "bow", text: "Bow", name: "Bow" },
  { id: "wand", text: "Wand", name: "Wand" },
  { id: "mace", text: "Mace", name: "Mace" },
  { id: "sword", text: "Sword", name: "Sword" },
  { id: "staff", text: "Staff", name: "Staff" },
  { id: "dagger", text: "Dagger", name: "Dagger" },
  { id: "claw", text: "Claw", name: "Claw" },
  { id: "sceptre", text: "Sceptre", name: "Sceptre" },
] as const satisfies readonly SoundManifestEntry[]

export const LINK_SOUNDS = [
  { id: "3_body", text: "Three Link Body", name: "Three Link Body" },
  { id: "3_gloves", text: "Three Link Gloves", name: "Three Link Gloves" },
  { id: "3_boots", text: "Three Link Boots", name: "Three Link Boots" },
  { id: "3_helm", text: "Three Link Helmet", name: "Three Link Helmet" },
  { id: "3_shield", text: "Three Link Shield", name: "Three Link Shield" },
  { id: "4_body", text: "Four Link Body", name: "Four Link Body" },
  { id: "4_gloves", text: "Four Link Gloves", name: "Four Link Gloves" },
  { id: "4_boots", text: "Four Link Boots", name: "Four Link Boots" },
  { id: "4_helm", text: "Four Link Helmet", name: "Four Link Helmet" },
] as const satisfies readonly SoundManifestEntry[]

export const OTHER_SOUNDS = [
  { id: "six_link", text: "Six Link", name: "Six Link" },
  { id: "five_link", text: "Five Link", name: "Five Link" },
  { id: "six_socket", text: "Six Socket", name: "Six Socket" },
  { id: "chromatic_recipe", text: "Chrome Recipe", name: "Chromatic Recipe" },
  { id: "whet_recipe", text: "Whet Recipe", name: "Blacksmith's Whetstone Recipe" },
  { id: "rare_boots", text: "Rare Boots", name: "Rare Boots" },
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

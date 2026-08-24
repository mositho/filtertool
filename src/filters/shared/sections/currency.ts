import rule from "../../../rule"
import { filterStyles, styleMixin } from "../styles"
import { compileRules, withHeading, withSubheading } from "./composition"
import { buildTierCurrency } from "./rule-builders"
import { manifestSoundFile } from "../../../sounds/paths"
import { MANIFEST_BY_ID } from "../../../sounds/manifest"
import { LEAGUESTART_CURRENCY_EXACT } from "./leaguestart-currency"

export const currency = () => {
  const gold = withSubheading(
    "Gold",
    compileRules(
      rule().itemClass("Gold").stackSize(">=", 50).mixin(styleMixin(filterStyles.goldHighStack)),
      rule().itemClass("Gold").mixin(styleMixin(filterStyles.gold)),
    ),
  )

  const sTierCurrency = withSubheading(
    "S Tier",
    buildTierCurrency("currencyA", [
      { baseTypes: ["Mirror of Kalandra", "Divine Orb"], iconColor: "Red", iconShape: "Star", soundId: 6 },
      { baseTypes: ["Orb of Annulment"], iconColor: "Red", iconShape: "Circle", soundId: 1 },
    ]),
  )

  const aTierCurrency = withSubheading(
    "A Tier",
    buildTierCurrency("currencyB", [
      { baseTypes: ["Exalted Orb"], iconColor: "Pink", iconShape: "Circle", soundId: 1 },
      { baseTypes: ["Ancient Orb"], iconColor: "Pink", iconShape: "Circle", soundId: 1 },
      { baseTypes: ["Gemcutter's Prism"], iconColor: "Pink", iconShape: "Circle", soundId: 1 },
      { baseTypes: ["Regal Orb"], iconColor: "Pink", iconShape: "Hexagon", tts: MANIFEST_BY_ID.regal_orb },
      { baseTypes: ["Orb of Chance"], iconColor: "Pink", iconShape: "Square", tts: MANIFEST_BY_ID.orb_of_chance },
      { baseTypes: ["Orb of Binding"], iconColor: "Pink", iconShape: "Diamond", tts: MANIFEST_BY_ID.orb_of_binding },
      { baseTypes: ["Orb of Scouring"], iconColor: "Yellow", iconShape: "Square", tts: MANIFEST_BY_ID.orb_of_scouring },
      { baseTypes: ["Orb of Alchemy"], iconColor: "Yellow", iconShape: "Hexagon", tts: MANIFEST_BY_ID.orb_of_alchemy },
      { baseTypes: ["Orb of Alteration"], iconColor: "Yellow", iconShape: "Circle", tts: MANIFEST_BY_ID.orb_of_alteration },
      { baseTypes: ["Vaal Orb"], iconColor: "Orange", iconShape: "Hexagon", tts: MANIFEST_BY_ID.vaal_orb },
      { baseTypes: ["Chaos Orb"], iconColor: "Orange", iconShape: "Circle", tts: MANIFEST_BY_ID.chaos_orb },
      { baseTypes: ["Orb of Regret"], iconColor: "Orange", iconShape: "Square", tts: MANIFEST_BY_ID.orb_of_regret },
    ]),
  )

  const bTierCurrency = withSubheading(
    "B Tier",
    buildTierCurrency("currencyC", [
      { baseTypes: ["Orb of Fusing"], iconColor: "Yellow", iconShape: "Diamond", tts: MANIFEST_BY_ID.orb_of_fusing },
      { baseTypes: ["Jeweller's Orb"], iconColor: "Yellow", iconShape: "Diamond", tts: MANIFEST_BY_ID.jewellers_orb },
      { baseTypes: ["Chromatic Orb"], iconColor: "Purple", iconShape: "Pentagon", tts: MANIFEST_BY_ID.chromatic_orb },
      { baseTypes: ["Armourer's Scrap"], iconColor: "White", iconShape: "Square", tts: MANIFEST_BY_ID.armourers_scrap },
      { baseTypes: ["Orb of Augmentation"], iconColor: "White", iconShape: "Circle", tts: MANIFEST_BY_ID.orb_of_augmentation },
      { baseTypes: ["Orb of Transmutation"], iconColor: "Cyan", iconShape: "Hexagon", tts: MANIFEST_BY_ID.orb_of_transmutation },
      { baseTypes: ["Blacksmith's Whetstone"], iconColor: "Cyan", iconShape: "Kite", tts: MANIFEST_BY_ID.blacksmiths_whetstone },
      { baseTypes: ["Essence"], iconColor: "Pink", iconShape: "Circle", soundId: 2 },
    ]),
  )

  const cTierCurrency = withSubheading(
    "Leaguestart Currency",
    compileRules(
      rule()
        .baseTypeExact(...LEAGUESTART_CURRENCY_EXACT)
        .icon("Blue", "Circle")
        .mixin(styleMixin(filterStyles.currencyC)),
    ),
  )

  return withHeading("Currency", gold, sTierCurrency, aTierCurrency, bTierCurrency, cTierCurrency)
}

export const scrolls = () =>
  withHeading(
    "Scrolls",
    compileRules(
      rule()
        .baseType("Scroll of Wisdom")
        .areaLevel("<=", 38)
        .icon("Brown", "Circle")
        .tts(manifestSoundFile(MANIFEST_BY_ID.wisdom_scroll))
        .mixin(styleMixin(filterStyles.wisdom)),
      rule().baseType("Scroll of Wisdom").icon("Brown", "Circle").mixin(styleMixin(filterStyles.wisdom)),
      rule()
        .baseType("Portal Scroll")
        .areaLevel("<=", 38)
        .icon("Blue", "Circle")
        .tts(manifestSoundFile(MANIFEST_BY_ID.portal_scroll))
        .mixin(styleMixin(filterStyles.portal)),
      rule().baseType("Portal Scroll").icon("Blue", "Circle").mixin(styleMixin(filterStyles.portal)),
    ),
  )

import { describe, expect, test } from "vitest"
import { buildProfile as emptyProfile, buildSpecificOptions as emptyOptions } from "./fixtures/empty-config"
import {
  early,
  filterDefaults,
  gems,
  highlightedEquipment,
  jewellery,
  links,
  magicItems,
  sixSockets,
  tinctures,
  twilightStrand,
  whetstoneRecipe,
} from "../src/filters/shared"
import { joinSections } from "../src/filters/shared/sections/composition"
import { resolveShieldProgressionMode } from "../src/filters/shared/sections/options"
import { resolveMixedItemClassWeaponQuery, resolveWeaponBaseTypes } from "../src/filters/shared/sections/weapon-queries"
import rule from "../src/rule"

describe("empty filter configuration", () => {
  test("exposes every configurable section", () => {
    expect(emptyProfile).toEqual({})
    expect(emptyOptions).toEqual({
      links: {},
      highlightedEquipment: {},
      gemCallouts: {},
      jewellery: {},
      early: {},
      tinctures: {},
      rareItems: {},
      magicItems: {},
      normalItems: {},
    })
  })
})

describe("jewellery", () => {
  test("uses defaults when no override is supplied", () => {
    expect(jewellery({})).toBe(jewellery())
  })

  test("can omit default amulet highlights", () => {
    expect(jewellery({ amulets: [] })).not.toMatch(/Amber Amulet|Jade Amulet|Lapis Amulet/)
  })

  test("shows normal and magic amethyst rings from item level 44 with a sound", () => {
    const output = jewellery({})

    expect(output).toMatch(/BaseType "Amethyst"/)
    expect(output).toMatch(/ItemLevel >= 44/)
    expect(output).toMatch(/Rarity == Normal/)
    expect(output).toMatch(/Rarity == Magic/)
    expect(output).toMatch(/poeft-sounds-v2\/amethyst_ring\.mp3/)
  })
})

describe("highlighted equipment", () => {
  test("applies only the requested rarity", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal"] }],
    })

    expect(output).toMatch(/BaseType "Rusted Hatchet"/)
    expect(output).toMatch(/Rarity == Normal/)
    expect(output).not.toMatch(/Rarity == Rare/)
    expect(output).not.toMatch(/Rarity == Magic/)
  })

  test("applies per-rarity icons", () => {
    const output = highlightedEquipment({
      highlights: [
        {
          baseTypes: ["Rusted Hatchet"],
          rarities: ["Normal", "Rare"],
          perRarityCustomization: true,
          normal: { iconColor: "Cyan", iconShape: "UpsideDownHouse" },
          rare: { iconColor: "Yellow", iconShape: "UpsideDownHouse" },
        },
      ],
    })

    expect(output).toMatch(/MinimapIcon 2 Cyan UpsideDownHouse/)
    expect(output).toMatch(/MinimapIcon 2 Yellow UpsideDownHouse/)
  })

  test("omits the minimap icon when no per-rarity icon is configured", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal"] }],
    })

    expect(output).not.toMatch(/MinimapIcon/)
  })

  test("applies a configured per-rarity icon", () => {
    const output = highlightedEquipment({
      highlights: [
        {
          baseTypes: ["Rusted Hatchet"],
          rarities: ["Normal"],
          perRarityCustomization: true,
          normal: { iconColor: "Red", iconShape: "Star" },
        },
      ],
    })

    expect(output).toMatch(/MinimapIcon 2 Red Star/)
  })

  test("applies a whole-highlight icon to every rarity", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal", "Rare"], iconColor: "Red", iconShape: "Star" }],
    })

    expect(output.match(/MinimapIcon 2 Red Star/g)).toHaveLength(2)
  })

  test("applies a whole-highlight sound to every rarity", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal", "Rare"], soundId: 5 }],
    })

    expect(output.match(/PlayAlertSound 5/g)).toHaveLength(2)
  })

  test("applies a whole-highlight icon size", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal"], iconColor: "Red", iconShape: "Star", iconSize: 0 }],
    })

    expect(output).toMatch(/MinimapIcon 0 Red Star/)
  })

  test("applies a per-rarity icon size", () => {
    const output = highlightedEquipment({
      highlights: [
        {
          baseTypes: ["Rusted Hatchet"],
          rarities: ["Normal"],
          perRarityCustomization: true,
          normal: { iconColor: "Red", iconShape: "Star", iconSize: 1 },
        },
      ],
    })

    expect(output).toMatch(/MinimapIcon 1 Red Star/)
  })

  test("requires a minimum number of sockets", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal"], minSockets: 4 }],
    })

    expect(output).toMatch(/Sockets >= 4/)
  })

  test("applies minimum and maximum item level", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal"], minItemLevel: 44, maxItemLevel: 70 }],
    })

    expect(output).toMatch(/ItemLevel >= 44/)
    expect(output).toMatch(/ItemLevel <= 70/)
  })

  test("applies minimum and maximum area level as a range", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal"], minAreaLevel: 10, maxAreaLevel: 40 }],
    })

    expect(output).toMatch(/AreaLevel >= 10/)
    expect(output).toMatch(/AreaLevel <= 40/)
  })

  test("applies an exact width and a minimum height", () => {
    const output = highlightedEquipment({
      highlights: [
        {
          baseTypes: ["Rusted Hatchet"],
          rarities: ["Normal"],
          width: { operator: "==", value: 2 },
          height: { operator: ">=", value: 3 },
        },
      ],
    })

    expect(output).toMatch(/Width == 2/)
    expect(output).toMatch(/Height >= 3/)
  })

  test("per-rarity customization overrides whole-highlight styling", () => {
    const output = highlightedEquipment({
      highlights: [
        {
          baseTypes: ["Rusted Hatchet"],
          rarities: ["Normal", "Rare"],
          perRarityCustomization: true,
          iconColor: "Red",
          iconShape: "Star",
          soundId: 5,
          normal: { iconColor: "Cyan", iconShape: "UpsideDownHouse" },
          rare: { iconColor: "Yellow", iconShape: "UpsideDownHouse" },
        },
      ],
    })

    expect(output).toMatch(/MinimapIcon 2 Cyan UpsideDownHouse/)
    expect(output).toMatch(/MinimapIcon 2 Yellow UpsideDownHouse/)
    expect(output).not.toMatch(/MinimapIcon 2 Red Star/)
    expect(output).not.toMatch(/PlayAlertSound 5/)
  })

  test("applies a named style to every rarity", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal", "Rare"], style: { preset: "currencyA" } }],
    })

    expect(output.match(/SetTextColor 0 168 255/g)).toHaveLength(2)
  })

  test("overrides a preset style with inline colors", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal"], style: { preset: "currencyA", border: "#FF0000" } }],
    })

    expect(output).toMatch(/SetTextColor 0 168 255/)
    expect(output).toMatch(/SetBorderColor 255 0 0/)
  })

  test("applies a fully custom style", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal"], style: { text: "#FFFFFF", background: "#000000" } }],
    })

    expect(output).toMatch(/SetTextColor 255 255 255/)
    expect(output).toMatch(/SetBackgroundColor 0 0 0 245/)
  })

  test("falls back to the per-rarity style when no style is set", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal"] }],
    })

    expect(output).toMatch(/SetTextColor 217 255 255/)
  })

  test("omits highlights with no targets", () => {
    const output = highlightedEquipment({
      highlights: [{}],
    })

    expect(output).toBe("")
    expect(output).not.toMatch(/Rarity/)
  })
})

describe("gems", () => {
  test("emits a callout rule per gem before the built-in gem rules", () => {
    const output = gems({ gems: ["Fireball", "Portal"] })

    expect(output).toMatch(/BaseType == "Fireball"/)
    expect(output).toMatch(/BaseType == "Portal"/)
    expect(output).toMatch(/MinimapIcon 2 Cyan Star/)
    expect(output).toMatch(/BaseType "Empower" "Enlighten" "Enhance"/)
  })

  test("speaks each gem's name via a custom alert sound", () => {
    const output = gems({ gems: ["Fireball"] })

    expect(output).toMatch(/BaseType == "Fireball"/)
    expect(output).toMatch(/CustomAlertSound "poeft-sounds-v2\/Fireball\.mp3"/)
  })

  test("strips ' Support' from a support gem's callout TTS", () => {
    const output = gems({ gems: ["Empower Support"] })

    expect(output).toMatch(/BaseType == "Empower Support"/)
    expect(output).toMatch(/CustomAlertSound "poeft-sounds-v2\/Empower\.mp3"/)
    expect(output).not.toMatch(/Empower_Support/)
  })

  test("omits per-gem callout sounds when no gems are configured", () => {
    expect(gems({})).not.toMatch(/CustomAlertSound/)
  })

  test("highlights each class's Twilight Strand starter skill gem with the gem callout style", () => {
    const output = gems({})

    expect(output).toMatch(
      /BaseType == "Heavy Strike" "Double Strike" "Burning Arrow" "Viper Strike" "Fireball" "Holy Strike" "Spectral Throw"/,
    )
    expect(output).toMatch(/SetBorderColor 0 255 255/)
    expect(output).toMatch(/SetFontSize 45/)
  })

  test("uses the current Templar starter gem, Holy Strike, not the old Glacial Hammer", () => {
    const output = gems({})

    expect(output).toMatch(/"Holy Strike"/)
    expect(output).not.toMatch(/"Glacial Hammer"/)
  })
})

describe("magic items", () => {
  test("shows small magic items for longer than big ones", () => {
    const output = magicItems({ bigMaxAreaLevel: 9, smallMaxAreaLevel: 24 })

    expect(output).toMatch(/Height <= 2/)
    expect(output).toMatch(/AreaLevel <= 24/)
    expect(output).toMatch(/Height >= 3/)
    expect(output).toMatch(/AreaLevel <= 9/)
  })
})

describe("links", () => {
  test("compiles a non-empty output with defaults", () => {
    const output = links({})

    expect(output).toBeTruthy()
    expect(output).toMatch("### Links")
  })

  test("includes six- and five-link rules", () => {
    const output = links({})

    expect(output).toMatch("LinkedSockets = 6")
    expect(output).toMatch("LinkedSockets = 5")
  })

  test("includes six-socket rule from sixSockets", () => {
    const output = sixSockets()

    expect(output).toMatch("### Six Sockets")
    expect(output).toMatch("Sockets == 6")
  })

  test("omits generic three-links when disabled but keeps selected links", () => {
    const withGenerics = links({ preferredColors: ["R", "G"], genericThreeLinksEnabled: true })
    const withoutGenerics = links({ preferredColors: ["R", "G"], genericThreeLinksEnabled: false })

    expect(withGenerics).toMatch("LinkedSockets == 3")
    expect(withoutGenerics).toMatch("LinkedSockets == 3")
    expect(withGenerics.length).toBeGreaterThan(withoutGenerics.length)
  })

  test("omits generic four-links when disabled but keeps selected links", () => {
    const withGenerics = links({ preferredColors: ["R", "G"], genericFourLinksEnabled: true })
    const withoutGenerics = links({ preferredColors: ["R", "G"], genericFourLinksEnabled: false })

    expect(withGenerics).toMatch("LinkedSockets == 4")
    expect(withoutGenerics).toMatch("LinkedSockets == 4")
    expect(withGenerics.length).toBeGreaterThan(withoutGenerics.length)
  })

  test("plays a per-slot sound for generic three- and four-links when enabled", () => {
    const output = links({
      preferredColors: [],
      preferredArmour: [],
      genericThreeLinksEnabled: true,
      genericFourLinksEnabled: true,
    })

    expect(output).toMatch(/CustomAlertSound "poeft-sounds-v2\/3_body\.mp3"/)
    expect(output).toMatch(/CustomAlertSound "poeft-sounds-v2\/3_gloves\.mp3"/)
    expect(output).toMatch(/CustomAlertSound "poeft-sounds-v2\/4_boots\.mp3"/)
  })

  test("produces shield rules when shield progression is enabled", () => {
    const withoutShields = early({ shieldProgression: "none" })
    const withShields = early({ shieldProgression: "full" })

    expect(withShields).toMatch('Class "Shields"')
    expect(withShields.length).toBeGreaterThan(withoutShields.length)
  })

  test("applies socket group filters when preferredColors is set", () => {
    const output = links({ preferredColors: ["R"] })

    expect(output).toMatch(/SocketGroup >=/)
  })
})

describe("early", () => {
  test("compiles a non-empty output with defaults", () => {
    const output = early({})

    expect(output).toBeTruthy()
    expect(output).toMatch("### Early")
  })

  test("shows rare boots rule", () => {
    const output = early({})

    expect(output).toMatch("Rarity == Rare")
    expect(output).toMatch('Class "Boots"')
  })

  test("shows rustic sash by default", () => {
    const output = early({})

    expect(output).toMatch('"Rustic"')
  })

  test("omits the rustic sash rule when disabled", () => {
    const output = early({ misc: { showRusticSash: false } })

    expect(output).not.toMatch('"Rustic"')
  })

  test("a manual early weapon max area level overrides the early max area level", () => {
    const withoutManual = early({ earlyWeapons: { itemClasses: ["One Hand Axes"] }, earlyMaxAreaLevel: 12 })
    const withManual = early({ earlyWeapons: { itemClasses: ["One Hand Axes"], maxAreaLevel: 30 }, earlyMaxAreaLevel: 12 })

    expect(withoutManual).toMatch(/AreaLevel <= 12/)
    expect(withoutManual).not.toMatch(/AreaLevel <= 30/)
    expect(withManual).toMatch(/AreaLevel <= 30/)
  })
})

describe("tinctures", () => {
  test("emits a rule for the default base types", () => {
    expect(tinctures({})).toMatch('BaseType "Prismatic Tincture"')
  })

  test("omits the section entirely when no base types are configured", () => {
    expect(tinctures({ baseTypes: [] })).toBe("")
  })
})

describe("whetstone recipe", () => {
  test("shows 20% quality normal weapons by default", () => {
    const output = whetstoneRecipe({})

    expect(output).toMatch(/Quality >= 20/)
    expect(output).toMatch(/Rarity == Normal/)
    expect(output).toMatch(/whet_recipe\.mp3/)
  })

  test("omits the section entirely when disabled", () => {
    expect(whetstoneRecipe({ whetstoneRecipe: false })).toBe("")
  })
})

describe("rule validity", () => {
  test("does not emit a dangling condition for empty values", () => {
    expect(rule().baseType().compile()).not.toMatch(/BaseType/)
    expect(rule().itemClass().compile()).not.toMatch(/Class/)
  })
})

describe("twilight strand", () => {
  test("shows normal items at area level 1 so white items aren't hidden", () => {
    const output = twilightStrand()

    expect(output).toMatch(/AreaLevel == 1/)
    expect(output).toMatch(/Rarity == Normal/)
    expect(output).not.toMatch(/BaseType/)
    expect(output).not.toMatch(/Class/)
  })
})

describe("section composition", () => {
  test("trims empty sections", () => {
    expect(joinSections(" first ", "", "\nsecond\n")).toBe("first\n\nsecond")
  })
})

describe("shield progression", () => {
  test("resolves the configured mode", () => {
    expect(resolveShieldProgressionMode("full")).toBe("full")
    expect(resolveShieldProgressionMode("none")).toBe("none")
    expect(resolveShieldProgressionMode(undefined)).toBe(filterDefaults.shieldProgression)
  })
})

describe("weapon queries", () => {
  test("preserves explicit bases and separates non-weapon classes", () => {
    expect(resolveWeaponBaseTypes({ baseTypes: ["Rusted Hatchet"] })).toContain("Rusted Hatchet")
    const query = resolveMixedItemClassWeaponQuery({ itemClasses: ["Rings", "One Hand Axes"], minAps: 1 })
    expect(query.itemClasses).toEqual(["Rings"])
    expect(query.baseTypes.length).toBeGreaterThan(0)
  })
})

import { describe, expect, test } from "vitest"
import { buildProfile as emptyProfile, buildSpecificOptions as emptyOptions } from "./fixtures/empty-config"
import { early, filterDefaults, highlightedEquipment, jewellery, links, sixSockets } from "../src/filters/shared"
import { joinSections } from "../src/filters/shared/sections/composition"
import { resolveShieldProgressionMode } from "../src/filters/shared/sections/options"
import { resolveMixedItemClassWeaponQuery, resolveWeaponBaseTypes } from "../src/filters/shared/sections/weapon-queries"

describe("empty filter configuration", () => {
  test("exposes every configurable section", () => {
    expect(emptyProfile).toEqual({})
    expect(emptyOptions).toEqual({
      links: {},
      highlightedEquipment: {},
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

  test("omits highlights with no targets", () => {
    const output = highlightedEquipment({
      highlights: [{}],
    })

    expect(output).toBe("")
    expect(output).not.toMatch(/Rarity/)
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

  test("always shows rustic belt", () => {
    const output = early({})

    expect(output).toMatch('"Rustic"')
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

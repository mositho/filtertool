import { describe, expect, test } from "vitest"
import { buildProfile as emptyProfile, buildSpecificOptions as emptyOptions } from "./fixtures/empty-config"
import {
  early,
  earlySockets,
  filterDefaults,
  flasks,
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
import { weaponPhases } from "../src/filters/shared/sections/equipment"
import { joinSections } from "../src/filters/shared/sections/composition"
import { compileFilter } from "../src/filters/shared/compile"
import { resolveShieldProgressionMode } from "../src/filters/shared/sections/options"
import { WEAPON_BASE_DATA } from "../src/types/weapon-base-data"
import {
  findWeaponBaseTypes,
  resolveMixedItemClassWeaponQuery,
  resolveWeaponBaseTypes,
} from "../src/filters/shared/sections/weapon-queries"
import { orderedWeaponPhases } from "../src/filters/shared/sections/weapon-phases"
import rule from "../src/rule"
import type { BaseType } from "../src/types"
import { TEST_BASE_TYPE, TEST_BASE_TYPE_TWO } from "./fixtures/base-types"

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

describe("flask tiers", () => {
  test("keeps individual life and mana cutoffs, leaving the final tiers uncapped", () => {
    const blocks = flasks({ utilityFlasks: [] }).split(/\nShow\n/)
    const smallLife = blocks.find((block) => block.includes('BaseType "Small Life Flask"'))
    const smallMana = blocks.find((block) => block.includes('BaseType "Small Mana Flask"'))
    const divineLife = blocks.find((block) => block.includes('BaseType "Divine Life Flask"'))
    const eternalMana = blocks.find((block) => block.includes('BaseType "Eternal Mana Flask"'))

    expect(smallLife).toContain("AreaLevel <= 12")
    expect(smallMana).toContain("AreaLevel <= 12")
    expect(divineLife).not.toContain("AreaLevel")
    expect(eternalMana).not.toContain("AreaLevel")
  })

  test("adds exact utility flask callouts and speaks the flask name without the suffix", () => {
    const output = flasks({ utilityFlasks: ["Bismuth"] })

    expect(output).toContain('BaseType == "Bismuth Flask"')
    expect(output).toContain('CustomAlertSound "poeft-sounds-v2/bismuth_flask.mp3"')
    expect(output).not.toContain('BaseType == "Jade Flask"')
  })
})

describe("weapon progression shields", () => {
  test("allows shields as phase item classes", () => {
    const output = weaponPhases([{ itemClasses: ["Shields"], maxAreaLevel: 28 }])

    expect(output).toContain('BaseType "Splintered Tower Shield"')
    expect(output).toContain('BaseType "Twig Spirit Shield"')
    expect(output).not.toContain('BaseType "Rusted Hatchet"')
    expect(output).toMatch(/BaseType "[^"]+ Shield" "[^"]+ Shield"/)
    expect(output).toContain("AreaLevel <= 28")
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
  test("matches classes and individual bases as alternatives", () => {
    const output = highlightedEquipment({
      highlights: [{ itemClasses: ["Rings"], baseTypes: [TEST_BASE_TYPE], rarities: ["Normal"] }],
    })
    const blocks = output.split(/\nShow\n/).filter((block) => block.includes("Rarity == Normal"))
    expect(blocks).toHaveLength(2)
    expect(blocks.some((block) => block.includes('Class == "Rings"') && !block.includes("BaseType"))).toBe(true)
    expect(blocks.some((block) => block.includes(`BaseType "${TEST_BASE_TYPE}"`) && !block.includes("Class"))).toBe(true)
  })

  test("applies only the requested rarity", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal"] }],
    })

    expect(output).toContain(`BaseType "${TEST_BASE_TYPE}"`)
    expect(output).toMatch(/Rarity == Normal/)
    expect(output).not.toMatch(/Rarity == Rare/)
    expect(output).not.toMatch(/Rarity == Magic/)
  })

  test("matches selected item classes exactly", () => {
    const output = highlightedEquipment({
      highlights: [{ itemClasses: ["Shields"], rarities: ["Normal"] }],
    })

    expect(output).toContain('Class == "Shields"')
    expect(output).not.toContain('Class "Shields"')
  })

  test("applies per-rarity icons", () => {
    const output = highlightedEquipment({
      highlights: [
        {
          baseTypes: [TEST_BASE_TYPE],
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
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal"] }],
    })

    expect(output).not.toMatch(/MinimapIcon/)
  })

  test("applies a configured per-rarity icon", () => {
    const output = highlightedEquipment({
      highlights: [
        {
          baseTypes: [TEST_BASE_TYPE],
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
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal", "Rare"], iconColor: "Red", iconShape: "Star" }],
    })

    expect(output.match(/MinimapIcon 2 Red Star/g)).toHaveLength(2)
  })

  test("applies a whole-highlight sound to every rarity", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal", "Rare"], soundId: 5 }],
    })

    expect(output.match(/PlayAlertSound 5/g)).toHaveLength(2)
  })

  test("applies a whole-highlight icon size", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal"], iconColor: "Red", iconShape: "Star", iconSize: 0 }],
    })

    expect(output).toMatch(/MinimapIcon 0 Red Star/)
  })

  test("applies a per-rarity icon size", () => {
    const output = highlightedEquipment({
      highlights: [
        {
          baseTypes: [TEST_BASE_TYPE],
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
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal"], minSockets: 4 }],
    })

    expect(output).toMatch(/Sockets >= 4/)
  })

  test("requires a minimum number of linked sockets", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal"], linkedSockets: 4 }],
    })

    expect(output).toMatch(/LinkedSockets >= 4/)
  })

  test("applies minimum and maximum item level", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal"], minItemLevel: 44, maxItemLevel: 70 }],
    })

    expect(output).toMatch(/ItemLevel >= 44/)
    expect(output).toMatch(/ItemLevel <= 70/)
  })

  test("applies a minimum attack speed to weapon highlights", () => {
    const selectedBases = findWeaponBaseTypes({ itemClasses: ["One Hand Axes"], minAps: 1.3 })
    const output = highlightedEquipment({
      highlights: [{ itemClasses: ["One Hand Axes"], rarities: ["Normal"], minAps: 1.3 }],
    })

    expect(selectedBases.length).toBeGreaterThan(0)
    expect(output).toContain(`BaseType ${selectedBases.map((baseType) => `"${baseType}"`).join(" ")}`)
    expect(output).not.toMatch(/Class/)
  })

  test("applies minimum and maximum area level as a range", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal"], minAreaLevel: 10, maxAreaLevel: 40 }],
    })

    expect(output).toMatch(/AreaLevel >= 10/)
    expect(output).toMatch(/AreaLevel <= 40/)
  })

  test("applies an exact width and a minimum height", () => {
    const output = highlightedEquipment({
      highlights: [
        {
          baseTypes: [TEST_BASE_TYPE],
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
          baseTypes: [TEST_BASE_TYPE],
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
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal", "Rare"], style: { preset: "currencyA" } }],
    })

    expect(output.match(/SetTextColor 0 168 255/g)).toHaveLength(2)
  })

  test("overrides a preset style with inline colors", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal"], style: { preset: "currencyA", border: "#FF0000" } }],
    })

    expect(output).toMatch(/SetTextColor 0 168 255/)
    expect(output).toMatch(/SetBorderColor 255 0 0/)
  })

  test("applies a fully custom style", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal"], style: { text: "#FFFFFF", background: "#000000" } }],
    })

    expect(output).toMatch(/SetTextColor 255 255 255/)
    expect(output).toMatch(/^SetBackgroundColor 0 0 0$/m)
  })

  test("falls back to the per-rarity style when no style is set", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: [TEST_BASE_TYPE], rarities: ["Normal"] }],
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

    expect(output).toMatch(/Height == 2/)
    expect(output).toMatch(/AreaLevel <= 24/)
    expect(output).toMatch(/Height == 3/)
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

  test("adds extra generic three-link rules when enabled", () => {
    const withGenerics = links({ preferredColors: ["R", "G"], genericThreeLinksEnabled: true })
    const withoutGenerics = links({ preferredColors: ["R", "G"], genericThreeLinksEnabled: false })

    expect(withGenerics).toMatch("LinkedSockets == 3")
    expect(withoutGenerics).toMatch("LinkedSockets == 3")
    expect(withGenerics.length).toBeGreaterThan(withoutGenerics.length)
  })

  test("always shows generic three-links up to the early max area level", () => {
    const output = links({
      preferredColors: [],
      preferredArmour: [],
      genericThreeLinksEnabled: false,
      earlyMaxAreaLevel: 12,
    })

    expect(output).toMatch(/AreaLevel <= 12/)
    expect(output).not.toMatch(/AreaLevel <= 33/)
  })

  test("extends generic three-links past the early max area level only when enabled", () => {
    const base = { preferredColors: [], preferredArmour: [], earlyMaxAreaLevel: 12 }
    const withGenerics = links({ ...base, genericThreeLinksEnabled: true })
    const withoutGenerics = links({ ...base, genericThreeLinksEnabled: false })

    expect(withGenerics).toMatch(/AreaLevel <= 33/)
    expect(withoutGenerics).not.toMatch(/AreaLevel <= 33/)
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
})

describe("tinctures", () => {
  test("uses global defaults for selected tinctures and hides all other tinctures", () => {
    const output = tinctures({})
    for (const baseType of filterDefaults.tinctures.baseTypes) {
      expect(output).toMatch(`BaseType "${baseType}"`)
    }
    expect(output).toMatch('Class "Tinctures"')
    expect(output).toMatch("Hide")
    if (filterDefaults.tinctures.baseTypes.length === 0) expect(output).not.toContain("Prismatic Tincture")
  })

  test("hides tinctures when no base types are configured", () => {
    const output = tinctures({ baseTypes: [] })
    expect(output).toMatch('Class "Tinctures"')
    expect(output).toMatch("Hide")
    expect(output).not.toContain("BaseType")
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
  test("a single weapon phase needs no Max Area Level", () => {
    const output = compileFilter({
      buildProfile: { weaponPhases: [{ baseTypes: ["Rusted Hatchet"] }] },
      buildSpecificOptions: {},
    })
    const weaponSection = output.split("### Weapon Progression")[1].split("### Six Sockets")[0]
    expect(weaponSection).toContain('BaseType "Rusted Hatchet"')
    expect(weaponSection).toContain("AreaLevel <= 12")
    expect(weaponSection).not.toContain("AreaLevel >= 29")
  })

  test("caps each weapon phase by its Max Area Level and the base's drop-level overlap", () => {
    const output = compileFilter({
      buildProfile: {
        weaponPhases: [
          { itemClasses: ["One Hand Axes", "Two Hand Axes"], maxAreaLevel: 28 },
          { itemClasses: ["Claws"], baseTypes: ["Gilded Axe"], minAreaLevel: 29 },
        ],
      },
      buildSpecificOptions: {},
    })
    const section = output.split("### Weapon Progression")[1].split("### Six Sockets")[0]
    expect(section).toContain("AreaLevel <= 28")
    expect(section).toContain("AreaLevel >= 29")
    expect(section).toContain('BaseType "Gilded Axe"')
    expect(section).toContain("AreaLevel <= 12")
    const gildedRules = section.split(/\nShow\n/).filter((block) => block.includes('BaseType "Gilded Axe"'))
    expect(gildedRules.length).toBeGreaterThan(0)
    expect(gildedRules.filter((block) => block.includes("AreaLevel >= 0")).every((block) => block.includes("AreaLevel <= 28"))).toBe(true)
    expect(gildedRules.some((block) => block.includes("AreaLevel >= 29"))).toBe(true)
    const rustedRules = section.split(/\nShow\n/).filter((block) => block.includes('BaseType "Rusted Hatchet"'))
    expect(rustedRules.length).toBeGreaterThan(0)
    expect(rustedRules.every((block) => !block.includes("AreaLevel >= 29"))).toBe(true)
  })

  test("uses a configured weapon cutoff overlap", () => {
    const weapon = WEAPON_BASE_DATA.find(({ itemClass }) => itemClass === "One Hand Axes")!
    const output = weaponPhases([{ baseTypes: [weapon.baseType], weaponCutoffOverlap: 2 }])

    expect(output).toContain(`AreaLevel <= ${weapon.dropLevel + 2}`)
  })

  test("defaults weapon progression overlap to ten area levels", () => {
    const weapon = WEAPON_BASE_DATA.find(({ itemClass }) => itemClass === "One Hand Axes")!
    const phase = { baseTypes: [weapon.baseType] }
    expect(weaponPhases([phase])).toContain(`AreaLevel <= ${weapon.dropLevel + 10}`)
  })

  test("weapon phases do not generate early weapon socket rules", () => {
    const output = compileFilter({
      buildProfile: {
        weaponPhases: [
          { itemClasses: ["One Hand Axes"], maxAreaLevel: 5 },
          { itemClasses: ["Claws"], minAreaLevel: 6 },
        ],
      },
      buildSpecificOptions: {},
    })
    const socketSection = output.split("### Early Sockets")[1].split("### Flasks")[0]
    expect(socketSection).not.toContain("BaseType")
    expect(socketSection).not.toContain("AreaLevel >= 6")
    expect(socketSection.match(/Sockets == [23]/g)).toHaveLength(2)
    expect(output.split("### Weapon Progression")[1].split("### Six Sockets")[0]).toContain('BaseType "Rusted Hatchet"')
  })

  test("multiple phases can have no Max Area Level", () => {
    const output = compileFilter({
      buildProfile: { weaponPhases: [{ baseTypes: [TEST_BASE_TYPE] }, { baseTypes: [TEST_BASE_TYPE_TWO] }] },
      buildSpecificOptions: {},
    })
    const section = output.split("### Weapon Progression")[1].split("### Six Sockets")[0]
    expect(section).toContain(`BaseType "${TEST_BASE_TYPE}"`)
    expect(section).toContain(`BaseType "${TEST_BASE_TYPE_TWO}"`)
    expect(section).not.toContain("AreaLevel >=")
  })

  test("an overlapping bounded phase takes priority over an all-run phase", () => {
    const output = compileFilter({
      buildProfile: {
        weaponPhases: [{ baseTypes: ["Gilded Axe"] }, { baseTypes: ["Gilded Axe"], maxAreaLevel: 28 }],
      },
      buildSpecificOptions: {},
    })
    const section = output.split("### Weapon Progression")[1].split("### Six Sockets")[0]
    expect(section.indexOf("AreaLevel <= 28")).toBeLessThan(section.indexOf("AreaLevel <= 38"))
  })

  test("puts a contained area-level range ahead of both its enclosing range and an all-run phase", () => {
    const allRun = { baseTypes: [TEST_BASE_TYPE] as const }
    const broad = { baseTypes: [TEST_BASE_TYPE] as const, maxAreaLevel: 28 }
    const narrow = { baseTypes: [TEST_BASE_TYPE] as const, minAreaLevel: 20, maxAreaLevel: 25 }
    expect(orderedWeaponPhases([allRun, broad, narrow])).toEqual([narrow, broad, allRun])
  })

  test("rejects a phase whose Min Area Level exceeds its Max Area Level", () => {
    expect(() =>
      compileFilter({
        buildProfile: { weaponPhases: [{ itemClasses: ["One Hand Axes"], minAreaLevel: 29, maxAreaLevel: 28 }] },
        buildSpecificOptions: {},
      }),
    ).toThrow(/Min Area Level must not exceed Max Area Level/)
  })

  test("ignores saved weapon socket overrides and only emits armour socket rules", () => {
    const output = earlySockets({ rules: { weapon2: { style: { text: "#123456" } }, weapon3: { maxAreaLevel: 99 } } })
    expect(output).not.toContain("BaseType")
    expect(output).not.toContain("SetTextColor 18 52 86")
    expect(output).not.toContain("AreaLevel <= 99")
    expect(output.match(/Class "Body Armours"/g)).toHaveLength(2)
  })

  test("preserves explicit bases and separates non-weapon classes", () => {
    expect(resolveWeaponBaseTypes({ baseTypes: [TEST_BASE_TYPE] })).toContain(TEST_BASE_TYPE)
    expect(resolveWeaponBaseTypes({ baseTypes: [TEST_BASE_TYPE] })).toEqual([TEST_BASE_TYPE])
    const query = resolveMixedItemClassWeaponQuery({ itemClasses: ["Rings", "One Hand Axes"], minAps: 1 })
    expect(query.itemClasses).toEqual(["Rings"])
    expect(query.baseTypes.length).toBeGreaterThan(0)
  })

  test("weapon phases with individually selected bases do not add every weapon", () => {
    const selectedBases: BaseType[] = [TEST_BASE_TYPE, TEST_BASE_TYPE_TWO]
    const output = compileFilter({
      buildProfile: { weaponPhases: [{ baseTypes: selectedBases }] },
      buildSpecificOptions: {},
    })
    const section = output.split("### Weapon Progression")[1].split("### Six Sockets")[0]
    expect(section).toContain(`BaseType ${selectedBases.map((baseType) => `"${baseType}"`).join(" ")}`)
    expect(section).not.toContain('BaseType "Long Bow"')
  })
})

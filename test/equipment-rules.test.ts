import { afterEach, describe, expect, it } from "vitest"
import { magicItems, normalItems, rareItems, links } from "../src/filters/shared/sections/equipment"
import { early, earlySockets } from "../src/filters/shared/sections/early"
import { filterDefaults } from "../src/filters/shared/defaults"
import { filterStyles } from "../src/filters/shared/styles"
import { EQUIPMENT_FOOTPRINTS } from "../src/filters/shared/equipment-rules"
import { compileFilter } from "../src/filters/shared/compile"
import { deserializeFilterConfig, serializeFilterConfig } from "../src/filters/shared/config-loader"

const initialDefaults = structuredClone(filterDefaults)
const initialStyles = structuredClone(filterStyles)
afterEach(() => {
  Object.assign(filterDefaults, structuredClone(initialDefaults))
  Object.assign(filterStyles, structuredClone(initialStyles))
})

const blocks = (output: string) => output.split(/\n(?=Show\n|Hide\n)/)
const footprint = (output: string, width: number, height: number) =>
  blocks(output).find((block) => block.includes(`Width == ${width}\n`) && block.includes(`Height == ${height}\n`))!

describe("generic equipment rules", () => {
  it.each(["Magic", "Rare"] as const)("sizes every %s footprint consistently without Area Level phases", (rarity) => {
    const output = rarity === "Magic" ? magicItems() : rareItems()
    for (const { width, height, size } of EQUIPMENT_FOOTPRINTS) {
      const block = footprint(output, width, height)
      expect(block).toContain(`SetFontSize ${size}`)
      expect(block).toContain(`Rarity == ${rarity}`)
      expect(block.split("\n")).toContain(rarity === "Rare" ? "SetTextColor 255 255 119" : "SetTextColor 136 136 255")
      expect(block.split("\n")).toContain("SetBorderColor 0 0 0")
      expect(block.split("\n")).toContain("SetBackgroundColor 0 0 0")
    }
    expect(blocks(output).filter((block) => block.includes("Width ==")).length).toBe(8)
  })

  it("keeps normal items at their old size and cutoff", () => {
    const output = normalItems()
    expect(output).toContain("SetFontSize 40")
    expect(output).toContain("AreaLevel <= 4")
    expect(output).not.toContain("Width")
    const equipment = blocks(output).find((block) => block.includes('Class "Body Armours"'))!
    expect(equipment.split("\n")).toContain("SetTextColor 200 200 200")
    expect(equipment.split("\n")).toContain("SetBorderColor 0 0 0")
    expect(equipment.split("\n")).toContain("SetBackgroundColor 0 0 0")
  })

  it.each(["Magic", "Rare"] as const)("preserves %s rarity colors for size-only overrides and respects custom colors", (rarity) => {
    const compile = rarity === "Magic" ? magicItems : rareItems
    const sizeOnly = footprint(compile({ rules: { "1x1": { style: { size: 31 } } } }), 1, 1)
    expect(sizeOnly).toContain("SetFontSize 31")
    expect(sizeOnly.split("\n")).toContain(rarity === "Rare" ? "SetTextColor 255 255 119" : "SetTextColor 136 136 255")
    const custom = footprint(compile({ rules: { "1x1": { style: { size: 31, text: "#123456" } } } }), 1, 1)
    expect(custom.split("\n")).toContain("SetTextColor 18 52 86")
  })

  it("preserves explicit background alpha, including fully opaque and transparent overrides", () => {
    for (const [opacity, alpha] of [
      [1, 255],
      [0, 0],
      [0.5, 128],
    ]) {
      const block = footprint(rareItems({ rules: { "1x1": { style: { backgroundOpacity: opacity } } } }), 1, 1)
      expect(block.split("\n")).toContain(`SetBackgroundColor 0 0 0 ${alpha}`)
    }
  })

  it("keeps the overall rare cutoff as an upper limit", () => {
    const output = rareItems({ maxAreaLevel: 30, rules: { "1x1": { maxAreaLevel: 50 } } })
    expect(footprint(output, 1, 1)).toContain("AreaLevel <= 30")
  })

  it("inherits individual rule fields globally, with whole-style overrides", () => {
    filterDefaults.magicItems.rules["2x4"] = { maxAreaLevel: 18, style: { size: 25, text: "#112233" } }
    let block = footprint(magicItems({ rules: { "2x4": { style: { size: 31 } } } }), 2, 4)
    expect(block).toContain("AreaLevel <= 18")
    expect(block).toContain("SetFontSize 31")
    expect(block.split("\n")).toContain("SetTextColor 136 136 255")
    block = footprint(magicItems(), 2, 4)
    expect(block).toContain("SetFontSize 25")
    expect(block).toContain("SetTextColor 17 34 51")
  })

  it("allows footprint cutoffs, minimap icons and sounds without changing other footprints", () => {
    const output = rareItems({
      rules: { "1x1": { maxAreaLevel: 20, icon: { iconColor: "Red", iconShape: "Star", iconSize: 1 }, sound: { soundId: 3 } } },
    })
    const small = footprint(output, 1, 1)
    expect(small).toContain("AreaLevel <= 20")
    expect(small).toContain("MinimapIcon 1 Red Star")
    expect(small).toContain("PlayAlertSound 3")
    expect(footprint(output, 2, 4)).not.toContain("AreaLevel")
  })

  it("preserves targeted rules ahead of generic sizing", () => {
    const output = compileFilter({ buildProfile: { preferredArmour: ["armour"] }, buildSpecificOptions: {} })
    expect(output.indexOf("### Links")).toBeLessThan(output.indexOf("### Rare Items"))
    expect(output.indexOf("### Jewellery")).toBeLessThan(output.indexOf("### Rare Items"))
    const rares = output.slice(output.indexOf("### Rare Items"), output.indexOf("### Magic Items"))
    expect(rares).not.toContain("BaseArmour")
    expect(rares).not.toContain("AreaLevel <= 45")
    expect(rares.match(/Width ==/g)).toHaveLength(8)
  })

  it("ignores saved preferred-armour overrides instead of generating the removed rare rule", () => {
    const output = rareItems({ rules: { preferredArmour: { style: { text: "#123456" }, maxAreaLevel: 77 } } })
    expect(output).not.toContain("SetTextColor 18 52 86")
    expect(output).not.toContain("AreaLevel <= 77")
    expect(output.match(/Width ==/g)).toHaveLength(8)
  })

  it("round-trips JSON-native rule settings without migrating explicit cutoffs", () => {
    const config = {
      buildProfile: {},
      buildSpecificOptions: {
        early: { threeSocketMaxAreaLevel: 16 },
        links: { rules: { "3generic": { style: { preset: "threeLink", size: 29 }, sound: { tts: "three sockets" } } } },
      },
    }
    expect(deserializeFilterConfig(serializeFilterConfig(config))).toEqual(config)
  })
})

describe("linked sockets and shared early cutoffs", () => {
  it("uses explicit game colors while retaining two- and three-socket rule sizes", () => {
    const output = earlySockets({})
    expect(blocks(output).find((block) => block.includes("Sockets == 2"))).toContain("SetFontSize 40")
    expect(blocks(output).find((block) => block.includes("Sockets == 3"))).toContain("SetFontSize 45")
    for (const block of blocks(output).filter((entry) => entry.includes("Sockets =="))) {
      expect(block.split("\n")).toContain("SetTextColor 200 200 200")
      expect(block.split("\n")).toContain("SetBackgroundColor 0 0 0")
      expect(block.split("\n")).toContain("SetBorderColor 0 0 0")
    }
  })

  it("respects global three-link style size, colours and opacity", () => {
    Object.assign(filterStyles.threeLink, { size: 27, text: "#123456", backgroundOpacity: 0.5 })
    const output = links({ preferredColors: [], preferredArmour: [] })
    const block = blocks(output).find((entry) => entry.includes("LinkedSockets == 3"))!
    expect(block).toContain("SetFontSize 27")
    expect(block).toContain("SetTextColor 18 52 86")
    expect(block).toContain("SetBackgroundColor 0 0 0 128")
    expect(block).not.toContain("SetFontSize 45")
    expect(block).toContain('Class "Body Armours"')
  })

  it("caps audible links at the visibility maximum, even if sound cutoff is higher", () => {
    const output = links({ preferredColors: ["R"], threeLinkMaxAreaLevel: 10, threeLinkTtsCutoffLevel: 23 })
    const matching = blocks(output).filter((entry) => entry.includes("LinkedSockets == 3"))
    expect(matching.length).toBeGreaterThan(0)
    for (const block of matching) expect(block).toContain("AreaLevel <= 10")
  })

  it("supports custom link presentation, silent overrides and two-link sounds", () => {
    const output = links({
      preferredColors: [],
      preferredArmour: [],
      rules: {
        "3generic": { style: { size: 26, border: "#010203" }, sound: { enabled: false } },
        "2generic": { sound: { soundId: 4 } },
      },
    })
    const matching = blocks(output).filter((entry) => entry.includes("LinkedSockets == 3"))
    for (const block of matching) {
      expect(block).toContain("SetFontSize 26")
      expect(block).toContain("SetBorderColor 1 2 3")
      expect(block).not.toContain("CustomAlertSound")
    }
    expect(blocks(output).find((entry) => entry.includes("LinkedSockets == 2"))).toContain("PlayAlertSound 4")
  })

  it("follows Early Max Area Level for shields, three sockets and generic three-links", () => {
    const shieldOutput = early({ earlyMaxAreaLevel: 19, shieldProgression: "full", preferredArmour: ["armour"] })
    expect(shieldOutput).toContain("AreaLevel <= 19")
    expect(shieldOutput).toContain("AreaLevel > 19")
    const socketOutput = earlySockets({ earlyMaxAreaLevel: 19 })
    expect(blocks(socketOutput).find((block) => block.includes("Sockets == 3"))).toContain("AreaLevel <= 19")
    const linkOutput = links({ earlyMaxAreaLevel: 19, preferredColors: [], preferredArmour: [] })
    expect(blocks(linkOutput).find((block) => block.includes("LinkedSockets == 3"))).toContain("AreaLevel <= 19")
  })

  it("keeps shield boundaries together and allows independent local/global overrides", () => {
    Object.assign(filterDefaults.early, { shieldMaxAreaLevel: 15, threeSocketMaxAreaLevel: 16 })
    Object.assign(filterDefaults.links, { genericThreeLinkMaxAreaLevel: 14 })
    const shields = early({ earlyMaxAreaLevel: 20, shieldMaxAreaLevel: 9, shieldProgression: "full", preferredArmour: ["armour"] })
    expect(shields).toContain("AreaLevel <= 9")
    expect(shields).toContain("AreaLevel > 9")
    expect(early({ earlyMaxAreaLevel: 20 })).toContain("AreaLevel <= 15")
    expect(earlySockets({ earlyMaxAreaLevel: 20 })).toContain("AreaLevel <= 16")
    expect(links({ earlyMaxAreaLevel: 20, preferredColors: [] })).toContain("AreaLevel <= 14")
    expect(earlySockets({ earlyMaxAreaLevel: 20, threeSocketMaxAreaLevel: 8 })).toContain("AreaLevel <= 8")
  })

  it("keeps link and socket overrides separate when compiling the whole filter", () => {
    const output = compileFilter({
      buildProfile: { preferredColors: [], preferredArmour: [] },
      buildSpecificOptions: {
        links: { rules: { "3generic": { style: { size: 24 } } } },
        early: { rules: { armour3: { style: { size: 39 } } } },
      },
    })
    expect(blocks(output).find((block) => block.includes("LinkedSockets == 3"))).toContain("SetFontSize 24")
    expect(blocks(output).find((block) => block.includes("Sockets == 3") && !block.includes("LinkedSockets"))).toContain("SetFontSize 39")
  })
})

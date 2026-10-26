// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { createApp, defineComponent, h, nextTick, reactive, type App } from "vue"
import ConfigForm from "../../frontend/src/components/ConfigForm.vue"
import FieldInput from "../../frontend/src/components/FieldInput.vue"
import StyleEditor from "../../frontend/src/components/StyleEditor.vue"
import { fieldDefault, setStyleSize } from "../../frontend/src/fieldDefaults"
import { getPath, setPath } from "../../frontend/src/path"
import {
  BUILD_SPECIFIC_SCHEMA,
  DEFAULTS_SCHEMA,
  type FieldGroup,
  type FieldSubsection,
  type SchemaField,
} from "../../src/config/form-schema"
import type { ReferenceData } from "../../frontend/src/api"

const reference: ReferenceData = {
  itemClasses: [],
  baseTypesByClass: {},
  skillGems: [],
  supportGems: [],
  rarities: [],
  linkColors: [],
  armourTypes: [],
  weaponClasses: [],
  amulets: [],
  colors: [],
  shapes: [],
  operators: [],
  shieldProgressionModes: [],
  styleNames: ["threeLink"],
  styles: { threeLink: { size: 28, text: "#123456" } },
  ttsLocales: [],
  ttsSpeed: { min: 0.5, max: 2 },
  sounds: [],
}
let app: App | undefined
let root: HTMLDivElement
afterEach(() => {
  app?.unmount()
  root?.remove()
  localStorage.clear()
})
function mount(component: unknown, props: Record<string, unknown>) {
  root = document.createElement("div")
  document.body.append(root)
  app = createApp(defineComponent({ setup: () => () => h(component as never, props as never) }))
  app.mount(root)
  return root
}
function fieldsOf(groups: FieldGroup[]): SchemaField[] {
  const nested = (section: FieldSubsection): SchemaField[] => [...section.fields, ...(section.subsections ?? []).flatMap(nested)]
  return groups.flatMap((group) => [...group.fields, ...(group.subsections ?? []).flatMap(nested)])
}
const fields = fieldsOf(BUILD_SPECIFIC_SCHEMA)
const field = (path: string) => fields.find((entry) => entry.path === path)!

describe("built-in equipment rule defaults", () => {
  it("inherits shortcut sizes from presets and keeps inherited colors when editing size", () => {
    const sizeField = field("rareItems.rules.1x1.style.size")
    const shared = { rareItems: { rules: { "1x1": { style: { preset: "threeLink", text: "#123456" } } } } }
    const local = {}
    expect(fieldDefault(sizeField, local, shared, reference.styles)).toBe(28)
    setStyleSize(local, sizeField.path, 31, shared)
    expect(getPath(local, "rareItems.rules.1x1.style")).toEqual({ preset: "threeLink", text: "#123456", size: 31 })
    setStyleSize(local, sizeField.path, undefined, shared)
    expect(fieldDefault(sizeField, local, shared, reference.styles)).toBe(28)
    expect(getPath(local, "rareItems.rules.1x1.style.text")).toBe("#123456")
    expect(fieldDefault(field("links.rules.3generic.style.size"), {}, {}, reference.styles)).toBe(28)
    expect(fieldDefault(field("links.rules.2generic.style.size"), {}, {}, reference.styles)).toBe(45)
    expect(fieldDefault(field("early.rules.armour2.style.size"), {})).toBe(40)
  })

  it("resolves linked defaults dynamically, including nested socket-rule defaults", () => {
    const local = { early: { earlyMaxAreaLevel: 21 } }
    expect(fieldDefault(field("early.threeSocketMaxAreaLevel"), local)).toBe(21)
    expect(fieldDefault(field("early.shieldMaxAreaLevel"), local)).toBe(21)
    expect(fieldDefault(field("links.genericThreeLinkMaxAreaLevel"), local)).toBe(21)
    expect(fieldDefault(field("early.rules.armour3.maxAreaLevel"), local)).toBe(21)
    expect(fieldDefault(field("early.threeSocketMaxAreaLevel"), local, { early: { threeSocketMaxAreaLevel: 16 } })).toBe(16)
    expect(fieldDefault(field("early.rules.armour3.maxAreaLevel"), local, { early: { threeSocketMaxAreaLevel: 16 } })).toBe(16)
    expect(fieldDefault(field("early.threeSocketMaxAreaLevel"), {}, { early: { earlyMaxAreaLevel: 17 } })).toBe(17)
    expect(local).toEqual({ early: { earlyMaxAreaLevel: 21 } })
  })

  it("offers every rule control globally as well as per filter", () => {
    const globalPaths = fieldsOf(DEFAULTS_SCHEMA).map((entry) => entry.path)
    for (const entry of fields.filter((entry) => entry.path.includes(".rules."))) expect(globalPaths).toContain(entry.path)
    expect(fields.filter((entry) => entry.path.startsWith("rareItems.rules.") && entry.control === "style")).toHaveLength(8)
    expect(fields.some((entry) => entry.path.startsWith("rareItems.rules.preferredArmour"))).toBe(false)
    expect(fields.some((entry) => entry.path === "rareItems.partOneMaxAreaLevel")).toBe(false)
    expect(fields.filter((entry) => entry.path.startsWith("links.rules.") && entry.control === "style")).toHaveLength(9)
    expect(fields.filter((entry) => entry.path.startsWith("early.rules.") && entry.control === "style")).toHaveLength(2)
    expect(fields.some((entry) => entry.path.startsWith("early.rules.weapon"))).toBe(false)
    expect(fields.some((entry) => entry.path.startsWith("early.rules.shield."))).toBe(false)
  })

  it("omits descriptions throughout the new rule groups and makes rule cutoffs full-width", () => {
    const check = (section: FieldSubsection) => {
      expect(section.description).toBeUndefined()
      for (const field of section.fields.filter((field) => field.path.endsWith(".maxAreaLevel"))) {
        expect(field.fullWidth).toBe(section.layout !== "cutoff-size")
      }
      section.subsections?.forEach(check)
    }
    for (const key of ["socketRules", "linkRules", "genericEquipment"]) {
      const section = BUILD_SPECIFIC_SCHEMA.flatMap((group) => group.subsections ?? []).find((section) => section.key === key)!
      check(section)
    }
  })

  it("shows inherited cutoffs, preserves explicit values, and restores inheritance with Use default", async () => {
    const modelValue = reactive({
      buildProfile: {},
      buildSpecificOptions: { early: { earlyMaxAreaLevel: 21, threeSocketMaxAreaLevel: 16 as number | undefined } },
    })
    mount(ConfigForm, { modelValue, filterName: "test", reference })
    const row = () =>
      [...root.querySelectorAll("label")]
        .find((label) => label.querySelector("span")?.textContent === "Three Sockets")!
        .closest(".space-y-1")!
    expect(row().querySelector("input")?.value).toBe("16")
    row().querySelector<HTMLButtonElement>('button[title="Use default"]')!.click()
    await nextTick()
    expect(modelValue.buildSpecificOptions.early.threeSocketMaxAreaLevel).toBeUndefined()
    expect(row().querySelector("input")?.placeholder).toBe("21")
    expect(row().textContent).toContain("Early Max Area Level")
    modelValue.buildSpecificOptions.early.earlyMaxAreaLevel = 25
    await nextTick()
    expect(row().querySelector("input")?.placeholder).toBe("25")
  })

  it("keeps advanced rule groups collapsed until requested", async () => {
    mount(ConfigForm, { modelValue: { buildProfile: {}, buildSpecificOptions: {} }, filterName: "test", reference })
    const button = (name: string) =>
      [...root.querySelectorAll<HTMLButtonElement>("button")].find((entry) => entry.textContent?.includes(name))!
    expect(button("Equipment Rules").getAttribute("aria-expanded")).toBe("false")
    expect(root.textContent).not.toContain("1×1")
    button("Equipment Rules").click()
    await nextTick()
    expect(button("Magic").getAttribute("aria-expanded")).toBe("false")
    button("Magic").click()
    await nextTick()
    expect(button("1×1").getAttribute("aria-expanded")).toBe("false")
    expect(button("Socket Rules").getAttribute("aria-expanded")).toBe("false")
    expect(button("Link Rules").getAttribute("aria-expanded")).toBe("false")
    for (const [title, depth] of [
      ["Socket Rules", 0],
      ["Link Rules", 0],
      ["Equipment Rules", 0],
      ["Magic", 1],
      ["1×1", 2],
    ] as const) {
      const header = button(title).parentElement!
      expect(header.classList.contains("px-4")).toBe(false)
      expect(header.parentElement!.style.marginLeft).toBe(`${depth}rem`)
      expect(button(title).querySelector("span")!.classList.contains("uppercase")).toBe(depth === 0)
      expect(button(title).querySelector("span")!.classList.contains("tracking-wide")).toBe(depth === 0)
    }
  })

  it("puts the checkbox in the header and keeps the shared collapsed Advanced section", async () => {
    mount(ConfigForm, { modelValue: { buildProfile: {}, buildSpecificOptions: {} }, filterName: "test", reference })
    const button = (name: string) =>
      [...root.querySelectorAll<HTMLButtonElement>("button")].find((entry) => entry.textContent?.trim().startsWith(name))!
    expect(root.textContent).not.toContain("Early Shield Rule")
    button("Socket Rules").click()
    await nextTick()
    button("2 Sockets · Armour").click()
    await nextTick()
    const header = button("2 Sockets · Armour").parentElement!
    const rule = header.parentElement!
    const grid = rule.querySelector(".grid")!
    expect(grid.classList.contains("items-end")).toBe(true)
    expect([...grid.querySelectorAll("[data-field-path]")].map((entry) => entry.getAttribute("data-field-path"))).toEqual([
      "early.rules.armour2.maxAreaLevel",
      "early.rules.armour2.style.size",
    ])
    const enabled = header.querySelector('[data-field-path="early.rules.armour2.enabled"]')!
    const maximum = grid.querySelector('[data-field-path="early.rules.armour2.maxAreaLevel"]')!
    expect(maximum.parentElement!.classList.contains("sm:col-span-2")).toBe(false)
    expect(header.classList.contains("px-4")).toBe(false)
    expect(rule.style.marginLeft).toBe("1rem")
    expect(enabled.getAttribute("title")).toContain("using default")
    expect(maximum.firstElementChild?.textContent).toContain("using default")
    expect(enabled.querySelector('input[type="checkbox"]')).not.toBeNull()
    expect(rule.querySelector('[role="switch"]')).toBeNull()
    const advanced = rule.querySelector("details")!
    expect(advanced.open).toBe(false)
    expect(advanced.querySelector("summary")?.textContent).toBe("Advanced")
    expect(rule.querySelectorAll("button[aria-expanded]")).toHaveLength(1)
    advanced.open = true
    await nextTick()
    expect(root.textContent).not.toContain("preview is illustrative")
    expect(button("2 Sockets · Armour").textContent).not.toContain("Size")
  })

  it.each([
    { group: "Socket Rules", title: "2 Sockets · Armour", path: "early.rules.armour2" },
    { group: "Link Rules", title: "2 Links · Generic", path: "links.rules.2generic" },
  ])("toggles a collapsed $title independently and can restore inherited state", async ({ group, title, path }) => {
    const modelValue = reactive({ buildProfile: {}, buildSpecificOptions: {} })
    const defaults = {}
    setPath(defaults, `${path}.enabled`, false)
    setPath(modelValue.buildSpecificOptions, `${path}.maxAreaLevel`, 17)
    mount(ConfigForm, { modelValue, filterName: "test", reference, defaults })
    const button = (name: string) =>
      [...root.querySelectorAll<HTMLButtonElement>("button")].find((entry) => entry.textContent?.trim().startsWith(name))!
    button(group).click()
    await nextTick()
    const disclosure = button(title)
    const header = disclosure.parentElement!
    const checkbox = header.querySelector<HTMLInputElement>('input[type="checkbox"]')!
    expect(checkbox.checked).toBe(false)
    checkbox.click()
    await nextTick()
    expect(getPath(modelValue.buildSpecificOptions, `${path}.enabled`)).toBe(true)
    expect(disclosure.getAttribute("aria-expanded")).toBe("false")
    checkbox.click()
    await nextTick()
    expect(getPath(modelValue.buildSpecificOptions, `${path}.enabled`)).toBeUndefined()
    expect(header.querySelector('button[title="Use default"]')).toBeNull()
    checkbox.click()
    await nextTick()
    disclosure.click()
    await nextTick()
    expect(checkbox.checked).toBe(true)
    expect(disclosure.getAttribute("aria-expanded")).toBe("true")
    header.querySelector<HTMLButtonElement>('button[title="Use default"]')!.click()
    await nextTick()
    expect(getPath(modelValue.buildSpecificOptions, `${path}.enabled`)).toBeUndefined()
    expect(getPath(modelValue.buildSpecificOptions, `${path}.maxAreaLevel`)).toBe(17)
    expect(checkbox.checked).toBe(false)
    expect(disclosure.getAttribute("aria-expanded")).toBe("true")
  })

  it.each([
    { group: "Socket Rules", title: "2 Sockets · Armour", path: "early.rules.armour2" },
    { group: "Link Rules", title: "2 Links · Generic", path: "links.rules.2generic" },
  ])("clears the $title override when toggled off and back to the default on state", async ({ group, title, path }) => {
    const modelValue = reactive({ buildProfile: {}, buildSpecificOptions: {} })
    mount(ConfigForm, { modelValue, filterName: "test", reference })
    const button = (name: string) =>
      [...root.querySelectorAll<HTMLButtonElement>("button")].find((entry) => entry.textContent?.trim().startsWith(name))!
    button(group).click()
    await nextTick()
    const header = button(title).parentElement!
    const checkbox = header.querySelector<HTMLInputElement>('input[type="checkbox"]')!
    expect(checkbox.checked).toBe(true)
    checkbox.click()
    await nextTick()
    expect(getPath(modelValue.buildSpecificOptions, `${path}.enabled`)).toBe(false)
    expect(header.querySelector('button[title="Use default"]')).not.toBeNull()
    checkbox.click()
    await nextTick()
    expect(checkbox.checked).toBe(true)
    expect(getPath(modelValue.buildSpecificOptions, `${path}.enabled`)).toBeUndefined()
    expect(header.querySelector('button[title="Use default"]')).toBeNull()
    expect(header.querySelector("label")?.title).toContain("using default")
  })

  it("previews unspecified style colors using the same defaults as the compiler", () => {
    mount(StyleEditor, { modelValue: {}, styleNames: [], styles: {} })
    expect([...root.querySelectorAll<HTMLInputElement>('input[type="color"]')].slice(0, 3).map((input) => input.value)).toEqual([
      "#c8c8c8",
      "#000000",
      "#000000",
    ])
    const preview = root.querySelector<HTMLElement>(".border[style]")!
    expect(preview.style.color).toBe("rgb(200, 200, 200)")
    expect(preview.style.backgroundColor).toBe("rgba(0, 0, 0, 0.941)")
    expect(preview.style.borderColor).toBe("rgb(0, 0, 0)")
  })

  it.each([
    { group: "Equipment Rules", rarity: "Magic", title: "1×1", path: "magicItems.rules.1x1" },
    { group: "Equipment Rules", rarity: "Rare", title: "1×1", path: "rareItems.rules.1x1" },
    { group: "Socket Rules", rarity: undefined, title: "2 Sockets · Armour", path: "early.rules.armour2" },
    { group: "Link Rules", rarity: undefined, title: "3 Links · Generic", path: "links.rules.3generic" },
  ])("keeps the $path size shortcut synchronized with Style in Advanced", async ({ group, rarity, title, path }) => {
    const modelValue = reactive({ buildProfile: {}, buildSpecificOptions: {} })
    mount(ConfigForm, { modelValue, filterName: "test", reference })
    const button = (name: string) =>
      [...root.querySelectorAll<HTMLButtonElement>("button")].find((entry) => entry.textContent?.trim().startsWith(name))!
    button(group).click()
    await nextTick()
    if (rarity) {
      button(rarity).click()
      await nextTick()
    }
    button(title).click()
    await nextTick()
    const cutoff = root.querySelector(`[data-field-path="${path}.maxAreaLevel"]`)!
    const style = root.querySelector(`[data-field-path="${path}.style"]`)!
    const size = root.querySelector(`[data-field-path="${path}.style.size"]`)!
    if (rarity) {
      const expected = rarity === "Rare" ? "#ffff77" : "#8888ff"
      expect(style.querySelector<HTMLInputElement>('input[type="color"]')!.value).toBe(expected)
    }
    expect(style.closest("details")).not.toBeNull()
    expect(size.closest("details")).toBeNull()
    expect(size.parentElement!.parentElement).toBe(cutoff.parentElement!.parentElement)
    expect(size.parentElement!.classList.contains("sm:col-span-2")).toBe(false)
    expect(cutoff.parentElement!.classList.contains("sm:col-span-2")).toBe(false)
    const rule = button(title).parentElement!.parentElement!
    expect(rule.querySelector("details")!.open).toBe(false)
    const shortcut = size.querySelector<HTMLInputElement>("input")!
    shortcut.value = "31"
    shortcut.dispatchEvent(new Event("input", { bubbles: true }))
    await nextTick()
    expect(getPath(modelValue.buildSpecificOptions, `${path}.style.size`)).toBe(31)
    rule.querySelector("details")!.open = true
    await nextTick()
    const advancedSize = style.querySelector<HTMLInputElement>('input[type="text"]')!
    expect(advancedSize.value).toBe("31")
    advancedSize.value = "27"
    advancedSize.dispatchEvent(new Event("input", { bubbles: true }))
    await nextTick()
    expect(shortcut.value).toBe("27")
    const color = style.querySelector<HTMLInputElement>('input[type="color"]')!
    color.value = "#123456"
    color.dispatchEvent(new Event("input", { bubbles: true }))
    await nextTick()
    expect(getPath(modelValue.buildSpecificOptions, `${path}.style.text`)).toBe("#123456")
    expect(getPath(modelValue.buildSpecificOptions, `${path}.style.size`)).toBe(27)
  })

  it("places the early generic-link cutoff on its own row before the toggles", () => {
    mount(ConfigForm, { modelValue: { buildProfile: {}, buildSpecificOptions: {} }, filterName: "test", reference })
    const cutoff = root.querySelector('[data-field-path="links.genericThreeLinkMaxAreaLevel"]')!
    const wrapper = cutoff.parentElement!
    expect(wrapper.classList.contains("sm:col-span-2")).toBe(true)
    const grid = wrapper.parentElement!
    expect(grid.firstElementChild).toBe(wrapper)
    expect(grid.classList.contains("items-end")).toBe(true)
  })

  it("distinguishes default slot callouts from an explicit silent override", async () => {
    const soundField = field("links.rules.3generic.sound")
    let saved: unknown
    mount(FieldInput, {
      "field": soundField,
      "value": soundField.defaultValue,
      "options": [],
      reference,
      "onUpdate:value": (value: unknown) => {
        saved = value
      },
    })
    const select = root.querySelector("select")!
    expect(select.value).toBe("default")
    select.value = "none"
    select.dispatchEvent(new Event("change", { bubbles: true }))
    await nextTick()
    expect(saved).toEqual({ enabled: false })
  })
})

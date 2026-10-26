// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { createApp, defineComponent, h, nextTick, type App } from "vue"
import type { ReferenceData } from "../../frontend/src/api"
import ConfigForm from "../../frontend/src/components/ConfigForm.vue"
import HighlightEditor from "../../frontend/src/components/HighlightEditor.vue"
import ItemTargetPicker from "../../frontend/src/components/ItemTargetPicker.vue"
import WeaponProgression from "../../frontend/src/components/WeaponProgression.vue"

vi.mock("../../frontend/src/components/HighlightCard.vue", () => ({ default: { template: "<div>Highlight options</div>" } }))

let app: App | undefined
let container: HTMLDivElement | undefined

function mount(component: unknown, props: Record<string, unknown>) {
  container = document.createElement("div")
  document.body.append(container)
  app = createApp(defineComponent({ setup: () => () => h(component as never, props as never) }))
  app.mount(container)
  return container
}

afterEach(() => {
  app?.unmount()
  app = undefined
  container?.remove()
  container = undefined
  localStorage.clear()
})

const reference = {
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
  styleNames: [],
  styles: {},
  ttsLocales: [],
  ttsSpeed: { min: 0.5, max: 2 },
  sounds: [],
} satisfies ReferenceData

describe("editor view controls", () => {
  it.each([
    { name: "highlight", component: HighlightEditor, entries: { highlights: [{}] } },
    { name: "weapon phase", component: WeaponProgression, entries: { phases: [{}] } },
  ])("expands a $name when clicking the full header padding", async ({ component, entries }) => {
    const root = mount(component, { ...entries, reference })
    const header = root.querySelector<HTMLButtonElement>("button[aria-expanded]")!
    const strip = header.closest<HTMLElement>(".disclosure-header")!
    expect(strip.classList.contains("-m-3")).toBe(true)
    expect(header.getAttribute("aria-expanded")).toBe("false")
    strip.click()
    await nextTick()
    expect(header.getAttribute("aria-expanded")).toBe("true")
    strip.click()
    await nextTick()
    expect(header.getAttribute("aria-expanded")).toBe("false")
  })

  it("defaults only Build Profile to collapsed and remembers each filter's view", async () => {
    const props = {
      modelValue: { buildProfile: {}, buildSpecificOptions: {} },
      reference,
      filterName: "leveling",
    }
    let root = mount(ConfigForm, props)
    const section = (title: string) =>
      [...root.querySelectorAll<HTMLButtonElement>("button")].find((button) => button.textContent?.includes(title))!

    expect(section("Build profile").getAttribute("aria-expanded")).toBe("false")
    expect(section("Weapon progression").getAttribute("aria-expanded")).toBe("true")
    section("Weapon progression").click()
    await nextTick()
    expect(localStorage.getItem("filtertool:collapsed:leveling")).toContain('"weaponProgression":true')

    app!.unmount()
    app = undefined
    root.remove()
    container = undefined
    root = mount(ConfigForm, props)
    expect(section("Weapon progression").getAttribute("aria-expanded")).toBe("false")

    app!.unmount()
    app = undefined
    root.remove()
    container = undefined
    mount(ConfigForm, { ...props, filterName: "another-filter" })
    const otherSection = [...container!.querySelectorAll<HTMLButtonElement>("button")].find((button) =>
      button.textContent?.includes("Weapon progression"),
    )!
    expect(otherSection.getAttribute("aria-expanded")).toBe("true")
  })

  it("toggles a highlight open and closed from its header", async () => {
    const root = mount(HighlightEditor, { highlights: [{}], reference })
    const header = root.querySelector<HTMLButtonElement>("button[aria-expanded]")!
    expect(header.getAttribute("aria-expanded")).toBe("false")
    header.click()
    await nextTick()
    expect(header.getAttribute("aria-expanded")).toBe("true")
    expect(root.textContent).toContain("Highlight options")
    header.click()
    await nextTick()
    expect(header.getAttribute("aria-expanded")).toBe("false")
    expect(root.textContent).not.toContain("Highlight options")
  })

  it.each([
    { weaponOnly: false, list: ["Rings", "Boots"], expected: "Rings" },
    { weaponOnly: true, list: ["One Hand Swords", "Bows"], expected: "Bows" },
  ])("searches $weaponOnly item classes", async ({ weaponOnly, list, expected }) => {
    const root = mount(ItemTargetPicker, {
      classes: [],
      bases: [],
      reference: { ...reference, itemClasses: list, weaponClasses: list },
      weaponOnly,
    })
    root.querySelector("summary")!.parentElement!.setAttribute("open", "")
    const search = root.querySelector<HTMLInputElement>('input[aria-label="Search item classes"]')!
    search.value = expected === "Rings" ? "ring" : "bow"
    search.dispatchEvent(new Event("input", { bubbles: true }))
    await nextTick()
    const labels = [...root.querySelectorAll("details:first-of-type label")].map((label) => label.textContent?.trim())
    expect(labels).toEqual([expected])
    if (weaponOnly) {
      search.value = "shield"
      search.dispatchEvent(new Event("input", { bubbles: true }))
      await nextTick()
      expect(root.querySelector("details:first-of-type label")?.textContent?.trim()).toBe("Shields")
    }
  })
})

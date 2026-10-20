// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { createApp, defineComponent, h, nextTick, reactive, type App } from "vue"
import HighlightCard from "../../frontend/src/components/HighlightCard.vue"
import type { ReferenceData } from "../../frontend/src/api"
import { TEST_BASE_TYPE } from "../fixtures/base-types"

let app: App | undefined
let container: HTMLDivElement | undefined

afterEach(() => {
  app?.unmount()
  container?.remove()
})

describe("highlight level inputs", () => {
  it("uses the shared target picker for item classes and individual bases", async () => {
    const highlight = reactive<Record<string, unknown>>({})
    const reference = {
      itemClasses: ["Rings", "One Hand Axes"],
      baseTypesByClass: { "Rings": [TEST_BASE_TYPE], "One Hand Axes": [TEST_BASE_TYPE] },
      weaponClasses: ["One Hand Axes"],
      sounds: [],
    } as unknown as ReferenceData
    container = document.createElement("div")
    document.body.append(container)
    app = createApp(defineComponent({ setup: () => () => h(HighlightCard, { highlight, reference }) }))
    app.mount(container)

    const summaries = container.querySelectorAll<HTMLElement>("summary")
    Array.from(summaries)
      .find((summary) => summary.textContent?.includes("Choose item classes"))!
      .click()
    const classLabel = Array.from(container.querySelectorAll<HTMLLabelElement>("label")).find(
      (label) => label.textContent?.trim() === "Rings",
    )!
    classLabel.querySelector<HTMLInputElement>("input")!.click()
    await nextTick()
    expect(highlight.itemClasses).toEqual(["Rings"])

    Array.from(summaries)
      .find((summary) => summary.textContent?.includes("Choose individual bases"))!
      .click()
    const classFilter = container.querySelector<HTMLSelectElement>('select[aria-label="Filter bases by class"]')!
    classFilter.value = "One Hand Axes"
    classFilter.dispatchEvent(new Event("change", { bubbles: true }))
    await nextTick()
    const baseLabel = Array.from(container.querySelectorAll<HTMLLabelElement>("label")).find(
      (label) => label.textContent?.trim() === TEST_BASE_TYPE,
    )!
    baseLabel.querySelector<HTMLInputElement>("input")!.click()
    await nextTick()
    expect(highlight.baseTypes).toEqual([TEST_BASE_TYPE])
    expect(highlight.itemClasses).toEqual(["Rings"])
  })

  it("shows feedback when Min Area Level is above Max Area Level", async () => {
    const highlight = reactive<Record<string, unknown>>({
      baseTypes: [TEST_BASE_TYPE],
      minAreaLevel: 30,
      maxAreaLevel: 28,
      modules: ["areaLevel"],
    })
    const reference = {
      itemClasses: [],
      baseTypesByClass: {},
      weaponClasses: [],
      sounds: [],
    } as unknown as ReferenceData
    container = document.createElement("div")
    document.body.append(container)
    app = createApp(
      defineComponent({
        setup: () => () => h(HighlightCard, { highlight, reference }),
      }),
    )
    app.mount(container)

    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Min Area Level must not exceed Max Area Level")
    const maxInput = Array.from(container.querySelectorAll<HTMLInputElement>("input")).filter((input) => input.placeholder === "e.g. 12")[1]
    expect(maxInput).toBeDefined()
    expect(maxInput.getAttribute("aria-invalid")).toBe("true")
    maxInput!.value = "31"
    maxInput!.dispatchEvent(new Event("input", { bubbles: true }))
    await nextTick()
    expect(highlight.maxAreaLevel).toBe(31)
    expect(container.querySelector('[role="alert"]')).toBeNull()
    expect(maxInput.hasAttribute("aria-invalid")).toBe(false)
  })

  it("shows feedback when Min Item Level is above Max Item Level", async () => {
    const highlight = reactive<Record<string, unknown>>({
      baseTypes: [TEST_BASE_TYPE],
      minItemLevel: 50,
      maxItemLevel: 40,
      modules: ["itemLevel"],
    })
    const reference = {
      itemClasses: [],
      baseTypesByClass: {},
      weaponClasses: [],
      sounds: [],
    } as unknown as ReferenceData
    container = document.createElement("div")
    document.body.append(container)
    app = createApp(
      defineComponent({
        setup: () => () => h(HighlightCard, { highlight, reference }),
      }),
    )
    app.mount(container)

    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Min Item Level must not exceed Max Item Level")
    const maxInput = Array.from(container.querySelectorAll<HTMLInputElement>("input")).filter((input) => input.placeholder === "e.g. 12")[1]
    maxInput.value = "60"
    maxInput.dispatchEvent(new Event("input", { bubbles: true }))
    await nextTick()
    expect(highlight.maxItemLevel).toBe(60)
    expect(container.querySelector('[role="alert"]')).toBeNull()
  })
})

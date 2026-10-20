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
  app = undefined
  container?.remove()
  container = undefined
})

describe("highlight modules", () => {
  it.each([
    ["minAps", "Minimum Attack Speed"],
    ["linkedSockets", "Minimum Linked Sockets"],
    ["minSockets", "Minimum Sockets"],
    ["areaLevel", "Area Level"],
    ["itemLevel", "Item Level"],
    ["weaponCutoff", "Weapon Cutoff"],
    ["size", "Size"],
    ["style", "Style"],
    ["icon", "Icon"],
    ["sound", "Sound"],
  ])("adds the %s module and persists its module id", async (moduleId, label) => {
    const highlight = reactive<Record<string, unknown>>({ baseTypes: [TEST_BASE_TYPE] })
    const reference = {
      itemClasses: ["Synthetic Weapon Class"],
      weaponClasses: ["Synthetic Weapon Class"],
      baseTypesByClass: { "Synthetic Weapon Class": [TEST_BASE_TYPE] },
      sounds: [],
      styles: {},
      styleNames: [],
    } as unknown as ReferenceData
    container = document.createElement("div")
    document.body.append(container)
    app = createApp(defineComponent({ setup: () => () => h(HighlightCard, { highlight, reference }) }))
    app.mount(container)

    Array.from(container.querySelectorAll<HTMLButtonElement>("button"))
      .find((button) => button.textContent?.includes("Add module"))!
      .click()
    await nextTick()
    Array.from(container.querySelectorAll<HTMLButtonElement>("button"))
      .find((button) => button.textContent?.trim() === label)!
      .click()
    await nextTick()

    expect(highlight.modules).toContain(moduleId)
    expect(container.textContent).toContain(label)
    app.unmount()
    app = undefined
    container.remove()
    container = undefined
  })
})

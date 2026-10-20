// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { createApp, defineComponent, h, nextTick, ref, type App } from "vue"
import WeaponProgression from "../../frontend/src/components/WeaponProgression.vue"
import type { ReferenceData } from "../../frontend/src/api"
import { TEST_BASE_TYPE, TEST_BASE_TYPE_TWO } from "../fixtures/base-types"

vi.mock("../../frontend/src/components/HighlightCard.vue", () => ({ default: { template: "<div />" } }))

let app: App | undefined
let container: HTMLDivElement | undefined

afterEach(() => {
  app?.unmount()
  container?.remove()
})

describe("weapon phase area level inputs", () => {
  it("lets a user type a valid two-digit Max Area Level without prepending the Min Area Level", async () => {
    const phases = ref<Array<{ minAreaLevel: number; maxAreaLevel?: number; baseTypes: string[] }>>([
      { minAreaLevel: 12, baseTypes: [TEST_BASE_TYPE] },
    ])
    container = document.createElement("div")
    document.body.append(container)
    app = createApp(
      defineComponent({
        setup: () => () =>
          h(WeaponProgression, {
            "phases": phases.value,
            "reference": {} as ReferenceData,
            "onUpdate:phases": (value: typeof phases.value) => (phases.value = value),
          }),
      }),
    )
    app.mount(container)
    ;(container.querySelector("button[aria-expanded]") as HTMLButtonElement).click()
    await nextTick()

    const maxInput = container.querySelectorAll<HTMLInputElement>('input[placeholder="No max area level"]')[0]
    maxInput.value = "2"
    maxInput.dispatchEvent(new Event("input", { bubbles: true }))
    await nextTick()
    maxInput.value += "8"
    maxInput.dispatchEvent(new Event("input", { bubbles: true }))
    await nextTick()

    expect(maxInput.value).toBe("28")
    expect(phases.value[0].maxAreaLevel).toBe(28)
  })

  it("shows feedback for an invalid range and clears it when corrected", async () => {
    const phases = ref<Array<{ minAreaLevel?: number; maxAreaLevel?: number }>>([{ minAreaLevel: 30, maxAreaLevel: 28 }])
    container = document.createElement("div")
    document.body.append(container)
    app = createApp(
      defineComponent({
        setup: () => () =>
          h(WeaponProgression, {
            "phases": phases.value,
            "reference": {} as ReferenceData,
            "onUpdate:phases": (value: typeof phases.value) => (phases.value = value),
          }),
      }),
    )
    app.mount(container)
    ;(container.querySelector("button[aria-expanded]") as HTMLButtonElement).click()
    await nextTick()
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Min Area Level must not exceed Max Area Level")

    const maxInput = container.querySelector<HTMLInputElement>('input[placeholder="No max area level"]')!
    expect(maxInput.getAttribute("aria-invalid")).toBe("true")
    maxInput.value = "31"
    maxInput.dispatchEvent(new Event("input", { bubbles: true }))
    await nextTick()
    expect(phases.value[0].maxAreaLevel).toBe(31)
    expect(container.querySelector('[role="alert"]')).toBeNull()
    expect(maxInput.hasAttribute("aria-invalid")).toBe(false)
  })

  it("duplicates a phase with its selections and lets it be renamed", async () => {
    const phases = ref<Array<Record<string, unknown>>>([{ baseTypes: [TEST_BASE_TYPE], maxAreaLevel: 28 }])
    container = document.createElement("div")
    document.body.append(container)
    app = createApp(
      defineComponent({
        setup: () => () =>
          h(WeaponProgression, {
            "phases": phases.value,
            "reference": {} as ReferenceData,
            "onUpdate:phases": (value: typeof phases.value) => (phases.value = value),
          }),
      }),
    )
    app.mount(container)
    ;(container.querySelector('[aria-label="Duplicate phase 1"]') as HTMLButtonElement).click()
    await nextTick()
    expect(phases.value).toHaveLength(2)
    expect(phases.value[1]).toMatchObject({ name: "Phase 1 copy", baseTypes: [TEST_BASE_TYPE], maxAreaLevel: 28 })

    const rename = container.querySelector<HTMLInputElement>('input[aria-label="Rename phase 2"]')!
    rename.value = "Early axes"
    rename.dispatchEvent(new Event("input", { bubbles: true }))
    rename.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    await nextTick()
    expect(phases.value[1].name).toBe("Early axes")
    ;(phases.value[1].baseTypes as string[]).push(TEST_BASE_TYPE_TWO)
    expect(phases.value[0].baseTypes).toEqual([TEST_BASE_TYPE])
  })
})

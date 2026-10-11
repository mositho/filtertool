// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { createApp, defineComponent, h, nextTick, ref, type App } from "vue"

const originalColor = "#112233"

vi.mock("../../frontend/src/api", () => ({
  api: {
    getSettings: async () => ({ filterPath: "", soundsFolder: "", tts: { locale: "en-US", speed: 1.6 } }),
    getDefaults: async () => ({ userDefaults: {}, baseDefaults: {}, defaults: {} }),
    getStyles: async () => ({ baseStyles: { lifeFlask: { text: originalColor } }, userStyles: {} }),
    reference: async () => ({
      ttsLocales: [],
      ttsSpeed: { min: 0.5, max: 2 },
      styleNames: [],
      styles: {},
      baseTypesByClass: {},
      amulets: [],
    }),
  },
}))

import GlobalSettings from "../../frontend/src/components/GlobalSettings.vue"

let app: App | undefined
let container: HTMLDivElement | undefined

afterEach(() => {
  app?.unmount()
  app = undefined
  container?.remove()
  container = undefined
})

describe("global settings style history", () => {
  it("restores a style on undo and still recognizes subsequent edits for discard", async () => {
    const exposed = ref<InstanceType<typeof GlobalSettings> | null>(null)
    container = document.createElement("div")
    document.body.append(container)
    app = createApp(defineComponent({ setup: () => () => h(GlobalSettings, { ref: exposed }) }))
    app.mount(container)
    await nextTick()
    await nextTick()
    const flaskSection = [...container.querySelectorAll<HTMLButtonElement>("button")].find((button) =>
      button.textContent?.includes("Flasks & Tinctures"),
    )!
    flaskSection.click()
    await nextTick()

    const getLifeFlaskTextColor = () => {
      const name = [...container!.querySelectorAll<HTMLElement>("span")].find((span) => span.textContent?.trim() === "lifeFlask")!
      return name.parentElement!.querySelector<HTMLInputElement>('input[type="color"]')!
    }
    const changeColor = (color: string) => {
      const input = getLifeFlaskTextColor()
      input.value = color
      input.dispatchEvent(new Event("input", { bubbles: true }))
    }

    changeColor("#aabbcc")
    await nextTick()
    expect(exposed.value?.dirty).toBe(true)
    ;(exposed.value as unknown as { undo: () => void }).undo()
    await nextTick()
    expect(getLifeFlaskTextColor().value).toBe(originalColor)
    expect(exposed.value?.dirty).toBe(false)

    changeColor("#445566")
    await nextTick()
    expect(exposed.value?.dirty).toBe(true)
    ;(exposed.value as unknown as { discard: () => void }).discard()
    await nextTick()
    expect(getLifeFlaskTextColor().value).toBe(originalColor)
    expect(exposed.value?.dirty).toBe(false)
  })
})

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
  it.each([
    { titles: ["Equipment", "Equipment Rules", "Rare", "1×1"], path: "rareItems.rules.1x1" },
    { titles: ["Early", "Socket Rules", "2 Sockets · Armour"], path: "early.rules.armour2" },
    { titles: ["Links", "Link Rules", "3 Links · Generic"], path: "links.rules.3generic" },
  ])("shows $path size alongside the cutoff while leaving Style in Advanced", async ({ titles, path }) => {
    container = document.createElement("div")
    document.body.append(container)
    app = createApp(GlobalSettings)
    app.mount(container)
    await nextTick()
    await nextTick()
    const button = (name: string) =>
      [...container!.querySelectorAll<HTMLButtonElement>("button")].find((entry) =>
        entry.querySelector("span")?.textContent?.startsWith(name),
      )!
    for (const title of titles) {
      button(title).click()
      await nextTick()
    }
    const cutoff = container.querySelector(`[data-field-path="${path}.maxAreaLevel"]`)!
    const style = container.querySelector(`[data-field-path="${path}.style"]`)!
    const size = container.querySelector(`[data-field-path="${path}.style.size"]`)!
    expect(style.closest("details")).not.toBeNull()
    expect(size.closest("details")).toBeNull()
    expect(size.parentElement!.parentElement).toBe(cutoff.parentElement!.parentElement)
    expect(size.parentElement!.parentElement!.classList.contains("sm:grid-cols-2")).toBe(true)
    const shortcut = size.querySelector<HTMLInputElement>("input")!
    shortcut.value = "31"
    shortcut.dispatchEvent(new Event("input", { bubbles: true }))
    await nextTick()
    expect(style.querySelector<HTMLInputElement>('input[type="text"]')!.value).toBe("31")
    expect(container.querySelector('[data-field-path="rareItems.partOneMaxAreaLevel"]')).toBeNull()
    expect(button(titles.at(-1)!).parentElement!.parentElement!.textContent).not.toContain("Preferred Armour")
  })

  it("uses the same Advanced disclosure for global built-in rules", async () => {
    container = document.createElement("div")
    document.body.append(container)
    app = createApp(GlobalSettings)
    app.mount(container)
    await nextTick()
    await nextTick()
    const button = (name: string) =>
      [...container!.querySelectorAll<HTMLButtonElement>("button")].find((entry) => entry.querySelector("span")?.textContent === name)!
    button("Early").click()
    await nextTick()
    button("Socket Rules").click()
    await nextTick()
    const parentHeader = button("Socket Rules").parentElement!
    expect(parentHeader.parentElement!.style.marginLeft).toBe("0rem")
    expect(button("Socket Rules").querySelector("span")!.classList.contains("uppercase")).toBe(true)
    expect(button("Socket Rules").querySelector("span")!.classList.contains("tracking-wide")).toBe(true)
    button("2 Sockets · Armour").click()
    await nextTick()
    const header = button("2 Sockets · Armour").parentElement!
    const rule = header.parentElement!
    expect(header.classList.contains("px-4")).toBe(false)
    expect(rule.style.marginLeft).toBe("1rem")
    expect(button("2 Sockets · Armour").querySelector("span")!.classList.contains("uppercase")).toBe(false)
    expect(rule.textContent).not.toContain("Body armour, gloves, boots and helmets.")
    expect(rule.querySelector("summary")?.textContent).toBe("Advanced")
    expect(rule.querySelector("details")?.open).toBe(false)
    expect(rule.querySelectorAll("button[aria-expanded]")).toHaveLength(1)
    const checkbox = header.querySelector<HTMLInputElement>('input[type="checkbox"]')!
    expect(checkbox.checked).toBe(true)
    checkbox.click()
    await nextTick()
    expect(checkbox.checked).toBe(false)
    expect(button("2 Sockets · Armour").getAttribute("aria-expanded")).toBe("true")
    expect(rule.querySelector('[data-field-control] [role="switch"]')).toBeNull()
    checkbox.click()
    await nextTick()
    expect(checkbox.checked).toBe(true)
    expect(header.querySelector('button[title="Use default"]')).toBeNull()
    expect(header.querySelector("label")?.title).toContain("using default")
    checkbox.click()
    await nextTick()
    header.querySelector<HTMLButtonElement>('button[title="Use default"]')!.click()
    await nextTick()
    expect(checkbox.checked).toBe(true)
    expect(header.querySelector('button[title="Use default"]')).toBeNull()
  })

  it("keeps global early cutoffs linked until explicitly overridden, and restores them with Use default", async () => {
    container = document.createElement("div")
    document.body.append(container)
    app = createApp(GlobalSettings)
    app.mount(container)
    await nextTick()
    await nextTick()
    const row = (name: string) =>
      [...container!.querySelectorAll("label")].find((label) => label.querySelector("span")?.textContent === name)!.closest(".space-y-1")!
    const setNumber = async (name: string, value: string) => {
      const input = row(name).querySelector("input")!
      input.value = value
      input.dispatchEvent(new Event("input", { bubbles: true }))
      await nextTick()
    }
    await setNumber("Early Max Area Level", "22")
    expect(row("Three Sockets").querySelector("input")?.value).toBe("22")
    expect(row("Early Shields · Max Area Level").querySelector("input")?.value).toBe("22")
    await setNumber("Three Sockets", "16")
    await setNumber("Early Max Area Level", "24")
    expect(row("Three Sockets").querySelector("input")?.value).toBe("16")
    row("Three Sockets").querySelector<HTMLButtonElement>('button[title="Use default"]')!.click()
    await nextTick()
    expect(row("Three Sockets").querySelector("input")?.value).toBe("24")
    expect(row("Three Sockets").textContent).toContain("Early Max Area Level")
  })

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

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import express from "express"
import fs from "fs"
import os from "os"
import path from "path"
import request from "supertest"
import { createApp } from "../../src/server/app"

let settingsRoot: string
let filtersRoot: string
let app: express.Express

beforeEach(() => {
  settingsRoot = fs.mkdtempSync(path.join(os.tmpdir(), "filtertool-server-"))
  filtersRoot = path.join(settingsRoot, "src", "filters")
  fs.mkdirSync(filtersRoot, { recursive: true })
  app = createApp({ filtersRoot, settingsRoot })
})

afterEach(() => {
  fs.rmSync(settingsRoot, { recursive: true, force: true })
})

describe("filters API", () => {
  it("lists filters and supports create/rename/delete", async () => {
    await request(app).post("/api/filters").send({ name: "alpha" }).expect(201)
    await request(app).post("/api/filters").send({ name: "beta" }).expect(201)

    const list = await request(app).get("/api/filters").expect(200)
    expect(list.body.filters.map((f: { name: string }) => f.name)).toEqual(["alpha", "beta"])

    await request(app).put("/api/filters/alpha/rename").send({ newName: "gamma" }).expect(200)
    const afterRename = await request(app).get("/api/filters").expect(200)
    expect(afterRename.body.filters.map((f: { name: string }) => f.name)).toEqual(["beta", "gamma"])

    await request(app).delete("/api/filters/gamma").expect(200)
    const afterDelete = await request(app).get("/api/filters").expect(200)
    expect(afterDelete.body.filters.map((f: { name: string }) => f.name)).toEqual(["beta"])
  })

  it("round-trips a filter config", async () => {
    await request(app).post("/api/filters").send({ name: "build" }).expect(201)
    const config = { buildProfile: {}, buildSpecificOptions: { links: { twoLinkMaxAreaLevel: 15 } } }
    await request(app).put("/api/filters/build/config").send(config).expect(200)
    const read = await request(app).get("/api/filters/build/config").expect(200)
    expect(read.body).toEqual(config)
    expect(fs.existsSync(path.join(filtersRoot, "build", "config.json"))).toBe(true)
  })

  it("compiles a live preview", async () => {
    await request(app).post("/api/filters").send({ name: "build" }).expect(201)
    const res = await request(app)
      .post("/api/filters/build/preview")
      .send({
        config: {
          buildProfile: {},
          buildSpecificOptions: { highlightedEquipment: { highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Rare"] }] } },
        },
      })
      .expect(200)
    expect(res.body.output).toMatch(/BaseType "Rusted Hatchet"/)
    expect(res.body.output).toMatch(/Rarity == Rare/)
  })

  it("returns reference data", async () => {
    const res = await request(app).get("/api/reference").expect(200)
    expect(res.body.itemClasses).toContain("Stackable Currency")
    expect(res.body.rarities).toEqual(["Normal", "Magic", "Rare", "Unique"])
    expect(res.body.sounds.length).toBeGreaterThan(0)
    expect(res.body.ttsLocales).toContain("en-US")
    expect(res.body.ttsSpeed).toEqual({ min: 0.5, max: 2 })
  })
})

describe("settings API", () => {
  it("persists settings", async () => {
    const settings = { filterPath: "/games/poe", soundsFolder: "custom", tts: { locale: "en-GB", speed: 1.5 } }
    await request(app).put("/api/settings").send(settings).expect(200)
    const read = await request(app).get("/api/settings").expect(200)
    expect(read.body.filterPath).toBe("/games/poe")
    expect(read.body.tts).toEqual({ locale: "en-GB", speed: 1.5 })
  })
})

describe("defaults and styles API", () => {
  it("persists user defaults", async () => {
    await request(app)
      .put("/api/defaults")
      .send({ links: { twoLinkMaxAreaLevel: 99 } })
      .expect(200)
    const read = await request(app).get("/api/defaults").expect(200)
    expect(read.body.userDefaults).toEqual({ links: { twoLinkMaxAreaLevel: 99 } })
  })

  it("persists user styles", async () => {
    await request(app)
      .put("/api/styles")
      .send({ unique: { text: "#123456" } })
      .expect(200)
    const read = await request(app).get("/api/styles").expect(200)
    expect(read.body.userStyles).toEqual({ unique: { text: "#123456" } })
  })
})

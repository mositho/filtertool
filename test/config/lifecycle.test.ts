import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "fs"
import os from "os"
import path from "path"
import { createFilter, deleteFilter, duplicateFilter, listFilters, renameFilter } from "../../src/config/lifecycle"
import { readFilterConfig } from "../../src/filters/shared/config-loader"

let filtersRoot: string
let filterPath: string

beforeEach(() => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "filtertool-lifecycle-"))
  filtersRoot = path.join(root, "filters")
  filterPath = path.join(root, "game")
  fs.mkdirSync(filtersRoot, { recursive: true })
  fs.mkdirSync(filterPath, { recursive: true })
})

afterEach(() => {
  fs.rmSync(path.dirname(filtersRoot), { recursive: true, force: true })
})

describe("createFilter", () => {
  it("creates a folder with an empty config and a layout", () => {
    createFilter(filtersRoot, "new-build")
    expect(fs.existsSync(path.join(filtersRoot, "new-build", "config.json"))).toBe(true)
    expect(fs.existsSync(path.join(filtersRoot, "new-build", "index.ts"))).toBe(true)
    expect(readFilterConfig(path.join(filtersRoot, "new-build"))).toEqual({ buildProfile: {}, buildSpecificOptions: {} })
  })

  it("rejects invalid and duplicate names", () => {
    expect(() => createFilter(filtersRoot, "bad/name")).toThrow()
    expect(() => createFilter(filtersRoot, "shared")).toThrow()
    createFilter(filtersRoot, "valid")
    expect(() => createFilter(filtersRoot, "valid")).toThrow()
  })

  it("accepts friendly names with spaces and capitals", () => {
    createFilter(filtersRoot, "My Cool Build")
    expect(fs.existsSync(path.join(filtersRoot, "My Cool Build", "config.json"))).toBe(true)
  })
})

describe("duplicateFilter", () => {
  it("copies an existing filter's config into a new filter", () => {
    createFilter(filtersRoot, "source")
    fs.writeFileSync(
      path.join(filtersRoot, "source", "config.json"),
      JSON.stringify({ buildProfile: { preferredColors: ["R"] }, buildSpecificOptions: { links: { twoLinkMaxAreaLevel: 5 } } }),
    )
    duplicateFilter(filtersRoot, "source", "copy")
    const config = readFilterConfig(path.join(filtersRoot, "copy"))
    expect(config.buildProfile).toEqual({ preferredColors: ["R"] })
    expect(config.buildSpecificOptions).toEqual({ links: { twoLinkMaxAreaLevel: 5 } })
  })
})

describe("renameFilter", () => {
  it("renames the folder and removes the old exported .filter", () => {
    createFilter(filtersRoot, "old-name")
    fs.writeFileSync(path.join(filterPath, "OldName.filter"), "Show\n")
    renameFilter(filtersRoot, "old-name", "new-name", filterPath)
    expect(fs.existsSync(path.join(filtersRoot, "new-name"))).toBe(true)
    expect(fs.existsSync(path.join(filtersRoot, "old-name"))).toBe(false)
    expect(fs.existsSync(path.join(filterPath, "OldName.filter"))).toBe(false)
  })
})

describe("deleteFilter", () => {
  it("deletes the local folder only by default", () => {
    createFilter(filtersRoot, "doomed")
    fs.writeFileSync(path.join(filterPath, "Doomed.filter"), "Show\n")
    deleteFilter(filtersRoot, "doomed", filterPath)
    expect(fs.existsSync(path.join(filtersRoot, "doomed"))).toBe(false)
    expect(fs.existsSync(path.join(filterPath, "Doomed.filter"))).toBe(true)
  })

  it("deletes the game filter when requested", () => {
    createFilter(filtersRoot, "doomed")
    fs.writeFileSync(path.join(filterPath, "Doomed.filter"), "Show\n")
    deleteFilter(filtersRoot, "doomed", filterPath, { deleteGameFile: true })
    expect(fs.existsSync(path.join(filterPath, "Doomed.filter"))).toBe(false)
  })
})

describe("listFilters", () => {
  it("lists user filters and excludes template and shared", () => {
    createFilter(filtersRoot, "alpha")
    createFilter(filtersRoot, "beta")
    fs.mkdirSync(path.join(filtersRoot, "shared"), { recursive: true })
    fs.mkdirSync(path.join(filtersRoot, "template"), { recursive: true })
    expect(listFilters(filtersRoot)).toEqual(["alpha", "beta"])
  })
})

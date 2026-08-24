import express from "express"
import fs from "fs"
import path from "path"
import { repoRoot, loadSettings, ensureSettings, saveSettings, type AppSettings } from "../config/settings"
import { createFilter, deleteFilter, duplicateFilter, listFilters, renameFilter } from "../config/lifecycle"
import {
  deserializeFilterConfig,
  readFilterConfig,
  writeFilterConfig,
  CONFIG_JSON_FILE_NAME,
  type SerializedFilterConfig,
} from "../filters/shared/config-loader"
import { compileFilter } from "../filters/shared/compile"
import { buildReferenceData } from "../config/reference-data"
import { exportFilter } from "../scripts/export"
import { generateSounds } from "../scripts/generate-sounds"
import { clean } from "../scripts/clean-sounds"
import { syncSoundPack } from "../scripts/sync-sounds"
import { getSoundPackFolder, GAME_SOUND_SOURCE_DIR, SOUND_PACK_SOURCE_DIR } from "../sounds/paths"
import { filterDefaults, baseFilterDefaults } from "../filters/shared/defaults"
import { filterStyles, baseFilterStyles } from "../filters/shared/styles"
import { readUserDefaults, writeUserDefaults, readUserStyles, writeUserStyles } from "../config/user-overrides-store"

export type ServerOptions = {
  filtersRoot?: string
  settingsRoot?: string
}

export function createApp(options: ServerOptions = {}) {
  const settingsRoot = options.settingsRoot ?? repoRoot()
  const filtersRoot = options.filtersRoot ?? path.join(settingsRoot, "src", "filters")
  const overridesDir = path.join(settingsRoot, "src", "filters", "shared")

  const app = express()
  app.use(express.json({ limit: "2mb" }))

  const filterDir = (name: string) => path.join(filtersRoot, name)

  const respond = (res: express.Response, status: number, body: unknown) => res.status(status).json(body)

  app.get("/api/filters", (_req, res) => {
    const filters = listFilters(filtersRoot).map((name) => ({
      name,
      hasConfigJson: fs.existsSync(path.join(filterDir(name), CONFIG_JSON_FILE_NAME)),
    }))
    respond(res, 200, { filters })
  })

  app.get("/api/filters/:name/config", (req, res) => {
    const name = req.params.name
    if (!fs.existsSync(filterDir(name))) return respond(res, 404, { error: `Filter "${name}" not found.` })
    respond(res, 200, readFilterConfig(filterDir(name)))
  })

  app.put("/api/filters/:name/config", (req, res) => {
    const name = req.params.name
    if (!fs.existsSync(filterDir(name))) return respond(res, 404, { error: `Filter "${name}" not found.` })
    const config = req.body as SerializedFilterConfig
    writeFilterConfig(filterDir(name), config)
    respond(res, 200, readFilterConfig(filterDir(name)))
  })

  app.post("/api/filters", (req, res) => {
    try {
      const { name } = req.body as { name?: string }
      if (!name) return respond(res, 400, { error: "A name is required." })
      createFilter(filtersRoot, name)
      respond(res, 201, { name })
    } catch (error) {
      respond(res, 400, { error: (error as Error).message })
    }
  })

  app.post("/api/filters/:name/duplicate", (req, res) => {
    try {
      const { newName } = req.body as { newName?: string }
      if (!newName) return respond(res, 400, { error: "A new name is required." })
      duplicateFilter(filtersRoot, req.params.name, newName)
      respond(res, 201, { name: newName })
    } catch (error) {
      respond(res, 400, { error: (error as Error).message })
    }
  })

  app.put("/api/filters/:name/rename", (req, res) => {
    try {
      const { newName } = req.body as { newName?: string }
      if (!newName) return respond(res, 400, { error: "A new name is required." })
      const filterPath = loadSettings(settingsRoot).filterPath
      renameFilter(filtersRoot, req.params.name, newName, filterPath)
      respond(res, 200, { name: newName })
    } catch (error) {
      respond(res, 400, { error: (error as Error).message })
    }
  })

  app.delete("/api/filters/:name", (req, res) => {
    try {
      const deleteGameFile = req.query.deleteGameFile === "true"
      const filterPath = loadSettings(settingsRoot).filterPath
      deleteFilter(filtersRoot, req.params.name, filterPath, { deleteGameFile })
      respond(res, 200, { ok: true })
    } catch (error) {
      respond(res, 400, { error: (error as Error).message })
    }
  })

  app.get("/api/reference", (_req, res) => {
    respond(res, 200, buildReferenceData())
  })

  app.post("/api/filters/:name/preview", (req, res) => {
    const name = req.params.name
    if (!fs.existsSync(filterDir(name))) return respond(res, 404, { error: `Filter "${name}" not found.` })
    const body = req.body as { config?: SerializedFilterConfig }
    const serialized = body.config ?? readFilterConfig(filterDir(name))
    const previous = process.env.FILTER_DISABLE_TTS_GENERATION
    process.env.FILTER_DISABLE_TTS_GENERATION = "1"
    try {
      const output = compileFilter(deserializeFilterConfig(serialized))
      respond(res, 200, { output })
    } catch (error) {
      respond(res, 400, { error: (error as Error).message })
    } finally {
      if (previous === undefined) delete process.env.FILTER_DISABLE_TTS_GENERATION
      else process.env.FILTER_DISABLE_TTS_GENERATION = previous
    }
  })

  app.post("/api/filters/:name/export", async (req, res) => {
    const name = req.params.name
    if (!fs.existsSync(filterDir(name))) return respond(res, 404, { error: `Filter "${name}" not found.` })
    const settings = ensureSettings(settingsRoot)
    if (!settings.filterPath) {
      return respond(res, 400, { error: "No filter path set. Set your Path of Exile folder in settings." })
    }
    try {
      const { config } = req.body as { config?: SerializedFilterConfig }
      if (config) writeFilterConfig(filterDir(name), config)
      const fileName = await exportFilter(name, settings.filterPath, true, filtersRoot)
      respond(res, 200, { fileName, filterPath: settings.filterPath, soundFolder: getSoundPackFolder() })
    } catch (error) {
      respond(res, 500, { error: (error as Error).message })
    }
  })

  app.post("/api/filters/export-all", async (_req, res) => {
    const settings = ensureSettings(settingsRoot)
    if (!settings.filterPath) {
      return respond(res, 400, { error: "No filter path set. Set your Path of Exile folder in settings." })
    }
    const names = listFilters(filtersRoot)
    const exported: string[] = []
    const errors: { name: string; error: string }[] = []
    for (const name of names) {
      try {
        const fileName = await exportFilter(name, settings.filterPath, true, filtersRoot)
        if (fileName) exported.push(fileName)
      } catch (error) {
        errors.push({ name, error: (error as Error).message })
      }
    }
    respond(res, 200, { exported: exported.length, total: names.length, errors })
  })

  app.get("/api/settings", (_req, res) => {
    respond(res, 200, loadSettings(settingsRoot))
  })

  app.put("/api/settings", (req, res) => {
    const settings = req.body as AppSettings
    saveSettings(settingsRoot, {
      filterPath: settings.filterPath,
      soundsFolder: settings.soundsFolder,
      tts: { ...loadSettings(settingsRoot).tts, ...(settings.tts ?? {}) },
    })
    respond(res, 200, loadSettings(settingsRoot))
  })

  app.get("/api/defaults", (_req, res) => {
    respond(res, 200, { defaults: filterDefaults, baseDefaults: baseFilterDefaults, userDefaults: readUserDefaults(overridesDir) })
  })

  app.put("/api/defaults", (req, res) => {
    writeUserDefaults(req.body ?? {}, overridesDir)
    respond(res, 200, { defaults: filterDefaults, userDefaults: readUserDefaults(overridesDir) })
  })

  app.get("/api/styles", (_req, res) => {
    respond(res, 200, { styles: filterStyles, baseStyles: baseFilterStyles, userStyles: readUserStyles(overridesDir) })
  })

  app.put("/api/styles", (req, res) => {
    writeUserStyles(req.body ?? {}, overridesDir)
    respond(res, 200, { styles: filterStyles, userStyles: readUserStyles(overridesDir) })
  })

  app.get("/api/sounds", (_req, res) => {
    const soundsDir = path.join(settingsRoot, SOUND_PACK_SOURCE_DIR)
    const { sounds } = buildReferenceData()
    respond(res, 200, {
      sounds: sounds.map((sound) => ({ ...sound, hasFile: fs.existsSync(path.join(soundsDir, `${sound.id}.mp3`)) })),
    })
  })

  app.get("/api/sounds/file/:file", (req, res) => {
    const file = req.params.file
    if (!/^[a-zA-Z0-9_'. -]+\.mp3$/.test(file)) {
      return respond(res, 400, { error: "Invalid sound file name." })
    }
    const filePath = path.join(settingsRoot, SOUND_PACK_SOURCE_DIR, file)
    if (!fs.existsSync(filePath)) return respond(res, 404, { error: "Sound file not found." })
    res.setHeader("Content-Type", "audio/mpeg")
    fs.createReadStream(filePath).pipe(res)
  })

  app.get("/api/sounds/game/:n", (req, res) => {
    const n = req.params.n
    if (!/^(1[0-6]|[1-9])$/.test(n)) return respond(res, 400, { error: "Invalid game sound id." })
    const filePath = path.join(settingsRoot, GAME_SOUND_SOURCE_DIR, `AlertSound${n}.mp3`)
    if (!fs.existsSync(filePath)) return respond(res, 404, { error: "Sound file not found." })
    res.setHeader("Content-Type", "audio/mpeg")
    fs.createReadStream(filePath).pipe(res)
  })

  app.post("/api/sounds/sync", async (_req, res) => {
    try {
      const removed = await clean()
      syncSoundPack()
      respond(res, 200, { removed })
    } catch (error) {
      respond(res, 500, { error: (error as Error).message })
    }
  })

  app.post("/api/sounds/generate", async (_req, res) => {
    res.setHeader("Content-Type", "application/x-ndjson")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("X-Accel-Buffering", "no")
    try {
      const result = await generateSounds({
        onProgress: (done, total, text) => {
          res.write(JSON.stringify({ type: "progress", done, total, text }) + "\n")
        },
      })
      res.write(JSON.stringify({ type: "done", generated: result.generated }) + "\n")
      res.end()
    } catch (error) {
      res.write(JSON.stringify({ type: "error", error: (error as Error).message }) + "\n")
      res.end()
    }
  })

  return app
}

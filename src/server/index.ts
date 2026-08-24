import "dotenv/config"
import express from "express"
import fs from "fs"
import path from "path"
import { createApp } from "./app"
import { ensureSettings, repoRoot } from "../config/settings"

const PORT = Number(process.env.PORT || 3001)

function serveFrontend(app: express.Express): void {
  const distDir = path.join(repoRoot(), "frontend", "dist")
  if (!fs.existsSync(distDir)) return
  app.use(express.static(distDir))
  app.use((_req, res) => res.sendFile(path.join(distDir, "index.html")))
}

export function startServer(port: number = PORT): void {
  ensureSettings()
  const app = createApp()
  serveFrontend(app)
  app.listen(port, () => {
    console.log(`filtertool server listening on http://localhost:${port}`)
  })
}

if (require.main === module) {
  startServer()
}

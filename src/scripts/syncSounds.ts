import "dotenv/config"
import fs from "fs"
import path from "path"
import { getSoundPackTargetDir, SOUND_PACK_SOURCE_DIR } from "../sounds/paths"

const SOURCE_DIR = `./${SOUND_PACK_SOURCE_DIR}`

export function syncSoundPack() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.log(`Sound source directory "${SOURCE_DIR}" not found. Run generate-sounds first.`)
    return
  }

  const files = fs.readdirSync(SOURCE_DIR)
  if (files.length === 0) {
    return
  }

  const targetDir = getSoundPackTargetDir()
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  const sourceFiles = new Set(files)
  for (const file of files) {
    fs.copyFileSync(path.join(SOURCE_DIR, file), path.join(targetDir, file))
  }

  for (const file of fs.readdirSync(targetDir)) {
    if (file.endsWith(".mp3") && !sourceFiles.has(file)) {
      fs.unlinkSync(path.join(targetDir, file))
    }
  }
}

function main() {
  syncSoundPack()
}

if (require.main === module) {
  main()
}

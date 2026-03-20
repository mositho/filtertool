import "dotenv/config"
import fs from "fs"
import path from "path"
import { getSoundPackTargetDir, SOUND_PACK_SOURCE_DIR } from "../sounds/paths"

const SOURCE_DIR = `./${SOUND_PACK_SOURCE_DIR}`
const OUTPUT_FILE = "./src/types/sounds/generated-sounds.d.ts"

function generate() {
  const files = fs.readdirSync(SOURCE_DIR)
  const targetDir = getSoundPackTargetDir()

  const typeContent = `
export type SoundFile = 
${files.map((name: string) => `  | '${name}'`).join("\n")};
  `.trim()

  if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
  }

  fs.writeFileSync(OUTPUT_FILE, typeContent)

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  for (const file of files) {
    fs.copyFileSync(path.join(SOURCE_DIR, file), path.join(targetDir, file))
  }
}

generate()

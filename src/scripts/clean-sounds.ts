import * as fs from "fs"

import { globSync } from "glob"
import { generatedSoundTextToFileName, SOUND_PACK_SOURCE_DIR } from "../sounds/paths"
import { SOUND_MANIFEST } from "../sounds/manifest"
import { findSoundFileLiterals, findSoundFileNameLiterals, findSoundFileTtsLiterals, findTtsConfigLiterals } from "../sounds/discover-tts"

function discoverReferencedFiles(): Set<string> {
  const files = new Set<string>(SOUND_MANIFEST.map((entry) => `${entry.id}.mp3`))

  const sourceFiles = globSync("./src/filters/**/*.ts")
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, "utf-8")
    for (const text of [...findTtsConfigLiterals(content), ...findSoundFileTtsLiterals(content)]) {
      files.add(generatedSoundTextToFileName(text))
    }
    for (const name of [...findSoundFileNameLiterals(content), ...findSoundFileLiterals(content)]) {
      files.add(name)
    }
  }

  return files
}

export async function clean(): Promise<number> {
  const soundDir = `./${SOUND_PACK_SOURCE_DIR}`

  if (!fs.existsSync(soundDir)) {
    console.log("Sound directory not found, nothing to clean.")
    return 0
  }

  const validNames = discoverReferencedFiles()

  const files = fs.readdirSync(soundDir)
  let removedCount = 0

  for (const file of files) {
    if (file.endsWith(".mp3") && !validNames.has(file)) {
      fs.unlinkSync(`./${SOUND_PACK_SOURCE_DIR}/${file}`)
      console.log(`-> Removed unused audio file: "${file}"`)
      removedCount++
    }
  }

  if (removedCount === 0) {
    console.log("No unused audio files found.")
  } else {
    console.log(`Removed ${removedCount} unused audio file(s).`)
  }

  return removedCount
}

if (require.main === module) {
  clean()
    .then((removed) => {
      if (removed > 0) console.log(`Cleaned up ${removed} file(s).`)
    })
    .catch((err) => {
      console.error("Sound cleanup failed:", err)
    })
}

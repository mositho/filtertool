import axios from "axios"
import { readFileSync, writeFileSync } from "fs"
import { dirname, join } from "path"

const BASE_TYPES_URL = "https://raw.githubusercontent.com/NeverSinkDev/FilterBlade-Public-Assets/main/FbPoe1Configs/BaseTypes.csv"
const BASE_TYPES_PATH = join(__dirname, "../assets/BaseTypes.csv")

async function updateBaseTypes() {
  const response = await axios.get<string>(BASE_TYPES_URL, { responseType: "text" })
  const upstreamContent = response.data
  const currentContent = readFileSync(BASE_TYPES_PATH, "utf8")

  if (currentContent === upstreamContent) {
    console.log("BaseTypes.csv is already up to date.")
    return
  }

  writeFileSync(BASE_TYPES_PATH, upstreamContent)
  console.log(`Updated ${join(dirname(BASE_TYPES_PATH), "BaseTypes.csv")} from upstream.`)
}

updateBaseTypes().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Failed to update BaseTypes.csv: ${message}`)
  process.exitCode = 1
})

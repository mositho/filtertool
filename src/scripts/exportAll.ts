import "dotenv/config"
import fs from "fs"
import path from "path"
import { exportFilter } from "./export"

const EXCLUDED_FILTERS = new Set(["example", "shared", "template"])

const main = async () => {
  const filtersRoot = path.join(__dirname, "../filters")
  const filterPath = process.env.FILTER_PATH

  if (!filterPath) {
    console.log("No filter path set in environment variables.\n")
    return
  }

  const filterNames = fs
    .readdirSync(filtersRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((entry) => !EXCLUDED_FILTERS.has(entry))
    .sort()

  if (filterNames.length === 0) {
    console.log("No filters found to export.\n")
    return
  }

  for (const filterName of filterNames) {
    try {
      const filterFileName = await exportFilter(filterName, filterPath)
      console.log(`Successfully exported filter: ${filterFileName}`)
    } catch (error) {
      console.log(`Error while compiling filter "${filterName}".`, error)
    }
  }

  console.log("")
}

main()

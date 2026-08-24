import "dotenv/config"
import path from "path"
import { listFilters } from "../config/lifecycle"
import { exportFilter, resolveFilterPath } from "./export"

const main = async () => {
  const filtersRoot = path.join(__dirname, "../filters")
  const filterPath = resolveFilterPath()
  const skipConfirm = process.argv.includes("--yes")

  const filterNames = listFilters(filtersRoot)

  if (filterNames.length === 0) {
    console.log("No filters found to export.\n")
    return
  }

  for (const filterName of filterNames) {
    try {
      const filterFileName = await exportFilter(filterName, filterPath, skipConfirm)
      if (filterFileName) {
        console.log(`Successfully exported filter: ${filterFileName}`)
      }
    } catch (error) {
      console.error(`Error while compiling filter "${filterName}".`, error)
    }
  }

  console.log("")
}

main()

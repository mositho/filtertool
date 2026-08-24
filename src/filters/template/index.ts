import { compileFilter, loadFilterConfig, type FilterConfig } from "../shared"

export const getFilter = (config?: FilterConfig) => compileFilter(config ?? loadFilterConfig(__dirname))

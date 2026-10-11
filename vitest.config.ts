import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
import path from "node:path"

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    alias: { "@schema": path.resolve(__dirname, "src/config") },
  },
})

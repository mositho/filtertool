export type FilterInfo = { name: string; hasConfigJson: boolean }

export type ReferenceData = {
  itemClasses: string[]
  baseTypesByClass: Record<string, string[]>
  rarities: string[]
  linkColors: string[]
  armourTypes: string[]
  weaponClasses: string[]
  amulets: string[]
  colors: string[]
  shapes: string[]
  operators: string[]
  shieldProgressionModes: string[]
  ttsLocales: string[]
  ttsSpeed: { min: number; max: number }
  sounds: { id: string; name: string; hasFile?: boolean }[]
}

export type AppSettings = {
  filterPath?: string
  soundsFolder?: string
  tts: { locale: string; speed: number }
}

export type Highlight = Record<string, unknown>

export type FilterConfig = {
  buildProfile: Record<string, unknown>
  buildSpecificOptions: Record<string, unknown>
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
})

export const api = {
  listFilters: () => request<{ filters: FilterInfo[] }>("/api/filters"),
  getConfig: (name: string) => request<FilterConfig>(`/api/filters/${name}/config`),
  saveConfig: (name: string, config: FilterConfig) => request<FilterConfig>(`/api/filters/${name}/config`, json("PUT", config)),
  createFilter: (name: string) => request<{ name: string }>("/api/filters", json("POST", { name })),
  duplicateFilter: (name: string, newName: string) =>
    request<{ name: string }>(`/api/filters/${name}/duplicate`, json("POST", { newName })),
  renameFilter: (name: string, newName: string) => request<{ name: string }>(`/api/filters/${name}/rename`, json("PUT", { newName })),
  deleteFilter: (name: string, deleteGameFile: boolean) =>
    request<{ ok: boolean }>(`/api/filters/${name}?deleteGameFile=${deleteGameFile}`, { method: "DELETE" }),
  reference: () => request<ReferenceData>("/api/reference"),
  preview: (name: string, config?: FilterConfig) =>
    request<{ output: string }>(`/api/filters/${name}/preview`, json("POST", config ? { config } : {})),
  exportFilter: (name: string, config?: FilterConfig) =>
    request<{ fileName: string; filterPath: string; soundFolder: string }>(
      `/api/filters/${name}/export`,
      json("POST", config ? { config } : {}),
    ),
  exportAllFilters: () =>
    request<{ exported: number; total: number; errors: { name: string; error: string }[] }>("/api/filters/export-all", json("POST", {})),
  getSettings: () => request<AppSettings>("/api/settings"),
  saveSettings: (settings: AppSettings) => request<AppSettings>("/api/settings", json("PUT", settings)),
  getDefaults: () =>
    request<{ defaults: Record<string, unknown>; baseDefaults: Record<string, unknown>; userDefaults: Record<string, unknown> }>(
      "/api/defaults",
    ),
  saveDefaults: (defaults: Record<string, unknown>) => request<Record<string, unknown>>("/api/defaults", json("PUT", defaults)),
  getStyles: () =>
    request<{ styles: Record<string, unknown>; baseStyles: Record<string, unknown>; userStyles: Record<string, unknown> }>("/api/styles"),
  saveStyles: (styles: Record<string, unknown>) => request<Record<string, unknown>>("/api/styles", json("PUT", styles)),
  sounds: () => request<{ sounds: { id: string; name: string; hasFile: boolean }[] }>("/api/sounds"),
  soundUrl: (id: string) => `/api/sounds/file/${id}.mp3`,
  generateSounds: async (onProgress: (done: number, total: number, text: string) => void): Promise<{ generated: number }> => {
    const res = await fetch("/api/sounds/generate", { method: "POST" })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`)
    }
    const reader = res.body?.getReader()
    if (!reader) throw new Error("Streaming is not supported by this browser.")
    const decoder = new TextDecoder()
    let buffer = ""
    let generated = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let newline = buffer.indexOf("\n")
      while (newline >= 0) {
        const line = buffer.slice(0, newline).trim()
        buffer = buffer.slice(newline + 1)
        newline = buffer.indexOf("\n")
        if (!line) continue
        const message = JSON.parse(line) as {
          type: string
          done?: number
          total?: number
          text?: string
          generated?: number
          error?: string
        }
        if (message.type === "progress" && message.done !== undefined && message.total !== undefined) {
          onProgress(message.done, message.total, message.text ?? "")
        } else if (message.type === "done") {
          generated = message.generated ?? generated
        } else if (message.type === "error") {
          throw new Error(message.error ?? "Sound generation failed")
        }
      }
    }
    return { generated }
  },
  syncSounds: () => request<{ removed: number }>("/api/sounds/sync", json("POST", {})),
}

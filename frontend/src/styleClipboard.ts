import { ref } from "vue"

export type StyleClipboard = { name: string; style: Record<string, unknown> }

/** Shared copy/paste clipboard for highlight style modules, so a style can be copied and pasted across highlights. */
export const styleClipboard = ref<StyleClipboard | null>(null)

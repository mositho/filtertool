const configLiteralRegex = (key: string): RegExp => new RegExp(`(?<=[\\{,]\\s*${key}\\s*:\\s*)(["'\`])(.*?)\\1`, "g")

const callLiteralRegex = (fn: string): RegExp => new RegExp(`${fn}\\(\\s*(["'\`])(.*?)\\1\\s*\\)`, "g")

const extractLiterals = (content: string, regex: RegExp): string[] => {
  const results: string[] = []
  regex.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    results.push(match[2])
  }
  return results
}

export function findTtsConfigLiterals(content: string): string[] {
  return extractLiterals(content, configLiteralRegex("tts"))
}

export function findSoundFileTtsLiterals(content: string): string[] {
  return extractLiterals(content, callLiteralRegex("soundFileTTS"))
}

export function findSoundFileNameLiterals(content: string): string[] {
  return extractLiterals(content, configLiteralRegex("soundFileName"))
}

export function findSoundFileLiterals(content: string): string[] {
  return extractLiterals(content, callLiteralRegex("soundFile"))
}

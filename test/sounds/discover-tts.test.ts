import { describe, it, expect } from "vitest"
import {
  findTtsConfigLiterals,
  findSoundFileTtsLiterals,
  findSoundFileNameLiterals,
  findSoundFileLiterals,
} from "../../src/sounds/discover-tts"

describe("findTtsConfigLiterals", () => {
  it("captures double-quoted strings with apostrophes", () => {
    expect(findTtsConfigLiterals(`{ baseTypes: ["Cat's Paw"], tts: "Cat's Paw" }`)).toEqual(["Cat's Paw"])
  })

  it("captures single-quoted strings", () => {
    expect(findTtsConfigLiterals(`{ tts: 'Chaos Orb' }`)).toEqual(["Chaos Orb"])
  })

  it("captures backtick strings", () => {
    expect(findTtsConfigLiterals("{ tts: `Chaos Orb` }")).toEqual(["Chaos Orb"])
  })

  it("ignores manifest references", () => {
    expect(findTtsConfigLiterals(`{ tts: MANIFEST_BY_ID.chaos_orb }`)).toEqual([])
  })

  it("captures multiple literals", () => {
    expect(findTtsConfigLiterals(`{ tts: "Cat's Paw" }, { tts: "Rare Axe" }`)).toEqual(["Cat's Paw", "Rare Axe"])
  })
})

describe("findSoundFileTtsLiterals", () => {
  it("captures literal text including apostrophes", () => {
    expect(findSoundFileTtsLiterals(`soundFileTTS("Cat's Paw")`)).toEqual(["Cat's Paw"])
  })
})

describe("findSoundFileNameLiterals", () => {
  it("captures filename values", () => {
    expect(findSoundFileNameLiterals(`{ soundFileName: "Leap_Axe.mp3" }`)).toEqual(["Leap_Axe.mp3"])
  })
})

describe("findSoundFileLiterals", () => {
  it("captures literal filenames", () => {
    expect(findSoundFileLiterals(`soundFile("Rare_Axe.mp3")`)).toEqual(["Rare_Axe.mp3"])
  })
})

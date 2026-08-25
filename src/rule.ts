import path from "path"
import { DEFAULT_STYLE_SETTINGS, MIN_STYLE_SIZE } from "./filters/shared/styles"
import { createTTSFile } from "./sounds/tts"
import { soundFile, SOUND_PACK_SOURCE_DIR } from "./sounds/paths"
import { Condition, Rule, RuleContent, StyleData } from "./types"

const hexToRgb = (hex: `#${string}`): [number, number, number] => {
  const value = hex.slice(1)
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : value

  return [parseInt(normalized.slice(0, 2), 16), parseInt(normalized.slice(2, 4), 16), parseInt(normalized.slice(4, 6), 16)]
}

/* Rule content
 * Serves as a proxy for accessing the map of conditions and their values,
 * so that you can use a rule() object as a container for several rules, where
 * transformations to that rule() object will apply to all rules it contains
 */
const operatorToken = (value: string): string | null => {
  const match = value.match(/^(<=|>=|==|!=|<|>|=)/)
  return match ? match[1] : null
}

const content = (rules: Rule[]): RuleContent => {
  return {
    map: [],
    rules: rules,

    // Set condition in map. If acting as a container will set condition in all
    // contained rules. A condition is replaced only when the same comparison
    // operator is set again, so ranges like `ItemLevel >= 44` + `ItemLevel <= 70`
    // can coexist as two conditions in one block. Empty values are ignored so a
    // rule never emits a dangling condition (e.g. `BaseType `).
    set(condition, value) {
      if (typeof value !== "string" || value.trim() === "") return
      if (this.rules.length > 0) {
        this.rules.map((r) => r.content.set(condition, value))
      } else {
        const operator = operatorToken(value)
        this.map = this.map.filter((c) => {
          if (!c.startsWith(`${condition} `)) return true
          if (operator === null) return false
          return operatorToken(c.slice(condition.length + 1)) !== operator
        })
        this.map.push(`${condition} ${value}`)
      }
    },

    clear(condition) {
      if (this.rules.length > 0) {
        this.rules.map((r) => r.content.clear(condition))
      } else {
        this.map = this.map.filter((c) => !c.includes(condition))
      }
    },

    // Compile map to a multiline .filter syntax string. If acting as a container
    // will compile all contained rules
    compile() {
      if (this.rules.length > 0) {
        return this.rules.map((r) => r.compile()).join("\n\n")
      } else {
        return this.map.join("\n")
      }
    },
  }
}

/* Rule object
 * Manages the methods used to set conditions in the rule content
 */
const rule = (...rules: Rule[]): Rule => {
  return {
    type: "show",
    disabled: false,
    content: content(rules),

    // Add content to the rule
    add(...content) {
      for (const item of content) {
        const [key, value] = item.split(/\s+/, 2) as [Condition, string]
        this.content.set(key, value)
      }
      return this
    },

    // Change rule type to hide and remove effects
    hide() {
      this.type = "hide"
      this.content.clear("MinimapIcon")
      this.content.clear("PlayAlertSound")
      this.content.clear("PlayAlertSoundPositional")
      this.content.clear("CustomAlertSound")
      this.content.clear("CustomAlertSoundOptional")
      this.content.clear("PlayEffect")
      return this
    },

    baseType(...baseType) {
      this.content.set("BaseType", baseType.map((item) => `"${item}"`).join(" "))
      return this
    },

    baseTypeExact(...baseType) {
      this.content.set("BaseType", "== " + baseType.map((item) => `"${item}"`).join(" "))
      return this
    },

    itemClass(...itemClass) {
      this.content.set("Class", itemClass.map((item) => `"${item}"`).join(" "))
      return this
    },

    itemClassExact(...itemClass) {
      this.content.set("Class", "== " + itemClass.map((item) => `"${item}"`).join(" "))
      return this
    },

    influence(...influences) {
      this.content.set("HasInfluence", influences.map((influence) => `"${influence}"`).join(" "))
      return this
    },

    effect(color, temp = false) {
      this.content.set("PlayEffect", `${color} ${temp ? "Temp" : ""}`)
      return this
    },

    // Style actions

    size(size) {
      this.content.set("SetFontSize", `${size}`)
      return this
    },

    sound(id, volume = 300, positional = false) {
      this.content.set(`PlayAlertSound${positional ? "Positional" : ""}`, `${id} ${volume}`)
      return this
    },

    tts(file, volume = 300, generate = true) {
      const relPath = soundFile(file)
      if (generate) {
        createTTSFile(path.join(SOUND_PACK_SOURCE_DIR, path.basename(file)))
      }
      this.content.set("CustomAlertSound", `"${relPath}" ${volume}`)
      return this
    },

    customSound(path, volume = 300) {
      this.content.set("CustomAlertSound", `"${path}" ${volume}`)
      return this
    },

    icon(color, shape, size = 2) {
      this.content.set("MinimapIcon", `${size} ${color} ${shape}`)
      return this
    },

    text(r, g, b, a) {
      this.content.set("SetTextColor", `${r} ${g} ${b} ${a !== undefined ? a : ""}`)
      return this
    },

    border(r, g, b, a) {
      this.content.set("SetBorderColor", `${r} ${g} ${b} ${a !== undefined ? a : ""}`)
      return this
    },

    background(r, g, b, a) {
      this.content.set("SetBackgroundColor", `${r} ${g} ${b} ${a !== undefined ? a : ""}`)
      return this
    },

    style(styleData?: StyleData) {
      if (!styleData) return this
      if (styleData.text !== undefined && styleData.text !== null) {
        const [r, g, b] = hexToRgb(styleData.text)
        this.text(r, g, b)
      }
      if (styleData.background !== undefined && styleData.background !== null) {
        const [r, g, b] = hexToRgb(styleData.background)
        const opacity = styleData.backgroundOpacity ?? DEFAULT_STYLE_SETTINGS.backgroundOpacity
        this.background(r, g, b, Math.round(opacity * 255))
      }
      if (styleData.border !== undefined && styleData.border !== null) {
        const [r, g, b] = hexToRgb(styleData.border)
        this.border(r, g, b)
      }
      this.size(Math.max(MIN_STYLE_SIZE, styleData.size ?? DEFAULT_STYLE_SETTINGS.size))
      return this
    },

    // Operator conditions

    hasExplicitMod(operator, ...mods) {
      this.content.set("HasExplicitMod", `${operator} ${mods.map((mod) => `"${mod}"`).join(" ")}`)
      return this
    },

    rarity(operator, ...rarity) {
      this.content.set("Rarity", `${operator} ${rarity.join(" ")}`)
      return this
    },

    socketGroup(operator, ...socketGroup) {
      this.content.set("SocketGroup", `${operator} ${socketGroup.map((s) => `"${s}"`).join(" ")}`)
      return this
    },

    hasEnchant(...enchants) {
      this.content.set("HasEnchantment", enchants.map((e) => `"${e}"`).join(" "))
      return this
    },

    sockets(operator, ...sockets) {
      this.content.set("Sockets", `${operator} ${sockets.join(" ")}`)
      return this
    },

    linkedSockets(operator, linkedSockets) {
      this.content.set("LinkedSockets", `${operator} ${linkedSockets}`)
      return this
    },

    stackSize(operator, stackSize) {
      this.content.set("StackSize", `${operator} ${stackSize}`)
      return this
    },

    itemLevel(operator, itemLevel) {
      this.content.set("ItemLevel", `${operator} ${itemLevel}`)
      return this
    },

    areaLevel(operator, areaLevel) {
      this.content.set("AreaLevel", `${operator} ${areaLevel}`)
      return this
    },

    dropLevel(operator, dropLevel) {
      this.content.set("DropLevel", `${operator} ${dropLevel}`)
      return this
    },

    width(operator, width) {
      this.content.set("Width", `${operator} ${width}`)
      return this
    },

    height(operator, height) {
      this.content.set("Height", `${operator} ${height}`)
      return this
    },

    baseArmour(operator, baseArmour) {
      this.content.set("BaseArmour", `${operator} ${baseArmour}`)
      return this
    },

    baseEvasion(operator, baseEvasion) {
      this.content.set("BaseEvasion", `${operator} ${baseEvasion}`)
      return this
    },

    baseES(operator, baseES) {
      this.content.set("BaseEnergyShield", `${operator} ${baseES}`)
      return this
    },

    baseWard(operator, baseWard) {
      this.content.set("BaseWard", `${operator} ${baseWard}`)
      return this
    },

    baseDefencePercentile(operator, baseDefencePercentile) {
      this.content.set("BaseDefencePercentile", `${operator} ${baseDefencePercentile}`)
      return this
    },

    gemLevel(operator, gemLevel) {
      this.content.set("GemLevel", `${operator} ${gemLevel}`)
      return this
    },

    mapTier(operator, mapTier) {
      this.content.set("MapTier", `${operator} ${mapTier}`)
      return this
    },

    quality(operator, quality) {
      this.content.set("Quality", `${operator} ${quality}`)
      return this
    },

    // Boolean conditions

    disable(disable) {
      // If there is no argument provided, the rule will be disabled. This is done instead of assigning
      // a default value to the argument in order to prevent the rule being disabled unintentionally by
      // passing an undefined value
      if (arguments.length === 0) {
        this.disabled = true
        return this
      }

      this.disabled = Boolean(disable)
      return this
    },

    transGem(transGem = true) {
      this.content.set("TransfiguredGem", `${transGem}`)
      return this
    },

    anyEnchant(anyEnchant = true) {
      this.content.set("AnyEnchantment", `${anyEnchant}`)
      return this
    },

    blightMap(blightMap = true) {
      this.content.set("BlightedMap", `${blightMap}`)
      return this
    },

    blightRavagedMap(blightRavagedMap = true) {
      this.content.set("UberBlightedMap", `${blightRavagedMap}`)
      return this
    },

    corrupted(corrupted = true) {
      this.content.set("Corrupted", `${corrupted}`)
      return this
    },

    elder(elder = true) {
      this.content.set("ElderItem", `${elder}`)
      return this
    },

    elderMap(elderMap = true) {
      this.content.set("ElderMap", `${elderMap}`)
      return this
    },

    synthItem(synthItem = true) {
      this.content.set("SynthesisedItem", `${synthItem}`)
      return this
    },

    shapedMap(shapedMap = true) {
      this.content.set("ShapedMap", `${shapedMap}`)
      return this
    },

    fractured(fractured = true) {
      this.content.set("FracturedItem", `${fractured}`)
      return this
    },

    identified(identified = true) {
      this.content.set("Identified", `${identified}`)
      return this
    },

    mirrored(mirrored = true) {
      this.content.set("Mirrored", `${mirrored}`)
      return this
    },

    hasImplicitMod(hasImplicitMod = true) {
      this.content.set("HasImplicitMod", `${hasImplicitMod}`)
      return this
    },

    replica(replica = true) {
      this.content.set("Replica", `${replica}`)
      return this
    },

    // Mixin - a function that will run for the rule
    mixin(mixin) {
      mixin(this)
      return this
    },

    // Compile the rule object to .filter syntax string.
    compile() {
      // If disabled dont compile to anything
      if (this.disabled) return ""

      if (rules.length > 0) {
        return this.content.compile()
      } else {
        return `${this.type === "show" ? "Show" : "Hide"}\n${this.content.compile()}`
      }
    },
  }
}

export default rule

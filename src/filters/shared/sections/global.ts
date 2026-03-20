import rule from "../../../rule"
import { filterStyles, styleMixin } from "../styles"
import { DIV_CARD_HIDE_LIST } from "./div-cards"
import { compileRules, REMAINING_EQUIPMENT_CLASSES, withHeading } from "./helpers"

export const uniques = () =>
  withHeading("Uniques", compileRules(rule().rarity("==", "Unique").icon("Brown", "Star").mixin(styleMixin(filterStyles.unique))))

export const gems = () =>
  withHeading(
    "Gems",
    compileRules(
      rule()
        .itemClass("Skill Gems", "Support Gems")
        .baseType("Empower", "Enlighten", "Enhance")
        .icon("Red", "Star")
        .mixin(styleMixin(filterStyles.gem)),
      rule().itemClass("Skill Gems").baseType("Vaal").icon("Cyan", "Triangle").mixin(styleMixin(filterStyles.gem)),
      rule().itemClass("Skill Gems", "Support Gems").mixin(styleMixin(filterStyles.gem)).size(35),
    ),
  )

export const questItems = () =>
  withHeading(
    "Quest Items",
    compileRules(rule().itemClass("Quest Items").mixin(styleMixin(filterStyles.questItem)).effect("Green").sound(3)),
  )

export const divinationCards = () =>
  withHeading(
    "Divination Cards",
    compileRules(
      rule()
        .baseType("The Heroic Shot", "Society's Remorse")
        .icon("Green", "Circle")
        .mixin(styleMixin(filterStyles.divinationCard))
        .sound(2),
      rule()
        .baseType(...DIV_CARD_HIDE_LIST)
        .itemClass("Divination Cards")
        .mixin(styleMixin(filterStyles.divinationCard))
        .hide(),
      rule().itemClass("Divination Cards").mixin(styleMixin(filterStyles.divinationCard)),
    ),
  )

export const misc = () =>
  withHeading(
    "Misc",
    compileRules(
      rule().itemClass("Vault Keys").style(filterStyles.priorityA).icon("Purple", "Star").sound(6).size(45),
      rule().itemClass("Maps", "Expedition Logbooks").style(filterStyles.maps).icon("White", "Square").sound(5),
      rule().itemClass("Map Fragments", "Misc Map Items").style(filterStyles.fragments).icon("Purple", "Circle").sound(4),
      rule().itemClass("Sanctum Research", "Relics").style(filterStyles.relics).icon("Red", "UpsideDownHouse").sound(5),
    ),
  )

export const hideEquipment = () =>
  withHeading(
    "Hide Equipment",
    compileRules(
      rule()
        .itemClass(...REMAINING_EQUIPMENT_CLASSES)
        .hide(),
    ),
  )

export const showUnknownItems = () => withHeading("Show Unknown Items", compileRules(rule().mixin(styleMixin(filterStyles.unknownItem))))

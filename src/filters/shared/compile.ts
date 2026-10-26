import {
  chromaticItems,
  flasks,
  highlightedEquipment,
  jewellery,
  links,
  magicItems,
  normalItems,
  rareItems,
  sixSockets,
  tinctures,
  uniques,
  weaponPhases,
  whetstoneRecipe,
} from "./sections/equipment"
import { currency, scrolls } from "./sections/currency"
import { early, earlySockets, twilightStrand } from "./sections/early"
import { divinationCards, gems, hideEquipment, misc, questItems, showUnknownItems } from "./sections/global"
import { joinSections } from "./sections/composition"
import type { FilterConfig } from "./config-loader"
import { filterRangeErrors } from "../../config/range-validation"

/**
 * The canonical filter section composition. Every filter shares this layout; the
 * only thing that varies between filters is their config, which is passed in.
 */
export function compileFilter(config: FilterConfig): string {
  const [error] = filterRangeErrors(config)
  if (error) throw new Error(error)
  const { buildProfile, buildSpecificOptions } = config
  return joinSections(
    currency(),
    scrolls(),
    gems(buildSpecificOptions.gemCallouts),
    links({ ...buildProfile, ...(buildSpecificOptions.links ?? {}), earlyMaxAreaLevel: buildSpecificOptions.early?.earlyMaxAreaLevel }),
    highlightedEquipment(buildSpecificOptions.highlightedEquipment),
    weaponPhases(buildProfile.weaponPhases ?? []),
    sixSockets(),
    jewellery(buildSpecificOptions.jewellery),
    early({ ...buildProfile, ...(buildSpecificOptions.early ?? {}) }),
    earlySockets(buildSpecificOptions.early),
    flasks(buildSpecificOptions.flasks),
    tinctures(buildSpecificOptions.tinctures),
    chromaticItems(),
    uniques(),
    rareItems(buildSpecificOptions.rareItems),
    magicItems(buildSpecificOptions.magicItems),
    whetstoneRecipe(buildProfile.misc),
    normalItems(buildSpecificOptions.normalItems),
    questItems(),
    divinationCards(),
    misc(),
    twilightStrand(),
    hideEquipment(),
    showUnknownItems(),
  )
}

import {
  chromaticItems,
  flasks,
  highlightedEquipment,
  jewellery,
  links,
  magicItems,
  normalItems,
  preferredWeapons,
  rareItems,
  sixSockets,
  tinctures,
  uniques,
} from "./sections/equipment"
import { currency, scrolls } from "./sections/currency"
import { early, earlySockets, twilightStrand } from "./sections/early"
import { divinationCards, gems, hideEquipment, misc, questItems, showUnknownItems } from "./sections/global"
import { joinSections } from "./sections/composition"
import type { FilterConfig } from "./config-loader"

/**
 * The canonical filter section composition. Every filter shares this layout; the
 * only thing that varies between filters is their config, which is passed in.
 */
export function compileFilter(config: FilterConfig): string {
  const { buildProfile, buildSpecificOptions } = config
  return joinSections(
    twilightStrand(),
    currency(),
    scrolls(),
    gems(),
    links({ ...buildProfile, ...(buildSpecificOptions.links ?? {}) }),
    highlightedEquipment(buildSpecificOptions.highlightedEquipment),
    preferredWeapons(buildProfile),
    sixSockets(),
    jewellery(buildSpecificOptions.jewellery),
    early({ ...buildProfile, ...(buildSpecificOptions.early ?? {}) }),
    earlySockets({ ...buildProfile, ...(buildSpecificOptions.early ?? {}) }),
    flasks(),
    tinctures(buildSpecificOptions.tinctures),
    chromaticItems(),
    uniques(),
    rareItems({ ...buildProfile, ...(buildSpecificOptions.rareItems ?? {}), ...(buildSpecificOptions.early ?? {}) }),
    magicItems(buildSpecificOptions.magicItems),
    normalItems(buildSpecificOptions.normalItems),
    questItems(),
    divinationCards(),
    misc(),
    hideEquipment(),
    showUnknownItems(),
  )
}

import type { baseFilterDefaults } from "./defaults"
import type { DeepPartial } from "./user-overrides"

export const userFilterDefaults: DeepPartial<typeof baseFilterDefaults> = {
  // Example:
  // links: {
  //   twoLinkMaxAreaLevel: 12,
  // },
  jewellery: {
    amuletMaxAreaLevel: 24,
  },
}

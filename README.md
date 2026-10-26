# poe filter tool

Build and export Path of Exile 1 item filters from a local web app. Configure leveling rules, preview the generated filter, and export custom TTS sound packs alongside it.

## Run the app

Requires [Node.js](https://nodejs.org/).

```bash
npm install
npm run filtertool
```

On first launch, set the **PoE Filter Path** to the folder where Path of Exile reads filters. You can change it later in **Global Settings**. On Windows, the app uses `<Documents>/My Games/Path of Exile` by default.

## Main functionality

- Create and manage multiple filters in the sidebar.
- Configure build preferences, weapon progression, item highlights, gem callouts, and shared leveling rules.
- Preview the compiled `.filter` output as you edit.
- **Save** stores a filter's configuration locally. **Save + Export** also writes its `.filter` file and syncs its sound pack to the configured PoE folder. **Export All** saves and exports every filter.
- Configure shared defaults and styles in **Global Settings**. Defaults apply where a filter has no explicit value.
- Expand **Equipment → Equipment Rules**, **Links → Link Rules**, or **Early → Socket Rules** to customize built-in rules. Magic/rare labels scale by inventory footprint; normal items retain their early-game sizing. Earlier matching links, highlights, weapon progression and jewellery rules still take priority.
- Unspecified style colors use explicit game defaults: normal text (200, 200, 200), magic equipment text (136, 136, 255), rare equipment text (255, 255, 119), and black border/background. Unset opacity omits alpha in the filter; the UI uses the game's default background alpha of 240. Explicit opacity overrides are preserved. Weapon phases default to a Drop Level + 10 cutoff; explicit overlap settings are preserved.
- **Early Max Area Level** is the default cutoff for early shields, three-socket items and early generic three-links. Their individual cutoffs can override it; **Use default** restores inheritance. A global override takes priority over this link unless a filter supplies its own override. Saved explicit cutoffs are preserved. The shield cutoff also controls the transition to preferred rare shields in Full progression mode.
- Socket-count rules apply only to armour and do not require links; weapons use weapon phases instead. A three-socket armour item can remain visible after a three-link rule stops matching if you extend its socket cutoff. Advanced controls start collapsed; unset rule fields inherit shared defaults, while explicit silent/disabled settings remain overrides.
- Generate custom TTS sounds or sync the existing sound pack from **Global Settings**. The exported filter references a versioned sound folder alongside the `.filter` file.

## Checks

```bash
npm run check
npm run frontend:build
```

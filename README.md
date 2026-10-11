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
- Generate custom TTS sounds or sync the existing sound pack from **Global Settings**. The exported filter references a versioned sound folder alongside the `.filter` file.

## Checks

```bash
npm run check
npm run frontend:build
```

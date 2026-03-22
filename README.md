# poe filter tool

Quickstart for building Path of Exile filters with shared sections and custom sounds.

This tool is currently built with leveling filters in mind. Any Contributions are very welcome.

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- An IDE or editor of your choice (recommend [Visual Studio Code](https://code.visualstudio.com/))

## Quickstart

1. Install dependencies.

```bash
npm install
```

2. Generate local type files and sound metadata.

```bash
npm run generate-types
npm run generate-sounds
```

These generated files are intentionally not committed, so a fresh clone may not have full autocomplete until you run those commands.

3. Set your Path of Exile filter folder in `.env`.

```env
FILTER_PATH="C:\Users\user\Documents\My Games\Path of Exile"
```

4. Copy [`src/filters/example`](src/filters/example) to a new folder under `src/filters/`.

5. Edit [`config.ts`](src/filters/example/config.ts).

For most standard filters, `config.ts` is the only file you need to touch. [`index.ts`](src/filters/example/index.ts) usually only needs changes if you want a different section layout or custom logic.

6. Export your filter.

If your filter folder is `src/filters/yourfilter`, run:

```bash
npm run export yourfilter
```

This also regenerates the typed item/sound files and syncs the sound pack before exporting.

To export every tracked filter under `src/filters/` in one go, run:

```bash
npm run export-all
```

## User Overrides

If you want personal shared defaults or styles for all filters you can add local override files.

- Create `src/filters/shared/user-defaults.ts` to override shared defaults
- Create `src/filters/shared/user-styles.ts` to override shared styles
- Both files are gitignored, so they stay local to your machine

Example files are included here:

- [`src/filters/shared/user-defaults.example.ts`](src/filters/shared/user-defaults.example.ts)
- [`src/filters/shared/user-styles.example.ts`](src/filters/shared/user-styles.example.ts)

These overrides are merged on top of the committed shared defaults and styles automatically.

## Sounds

The repository stores its checked-in sound files in `sounds/`.

By default, exported filters reference a `poeft-sounds/` folder next to your exported `.filter` file to avoid collisions, and the sound generation step copies the repo sounds there automatically.

Example:

```text
Path of Exile/
  Example.filter
  poeft-sounds/
    chaos.mp3
    regal.mp3
    ...
```

If you want to use a different folder name, set `SOUNDS_FOLDER` in `.env`:

```env
FILTER_PATH="C:\Users\user\Documents\My Games\Path of Exile"
SOUNDS_FOLDER="sounds"
```

You can sync the sound pack manually with:

```bash
npm run generate-sounds
```

## Notes

- Most config fields have autocomplete for Path of Exile item classes, base types and link patterns
- `soundFile("...")` also gets typed sound filename suggestions for literal filenames
- Custom filter folders under `src/filters/` are gitignored by default
- `src/assets/BaseTypes.csv` comes from the public FilterBlade assets repo and can be refreshed locally with `npm run update-base-types`
- A GitHub Actions workflow at `.github/workflows/update-base-types.yml` checks upstream weekly and opens a PR when the CSV changes

---

<sub>Thanks to Allex for the sounds and the core of the project.</sub>

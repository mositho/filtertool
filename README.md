# poe filter tool

Quickstart for building Path of Exile filters with shared sections and custom sounds.

This tool is currently built with leveling filters in mind. Any Contributions that extend its capabilities are very welcome.

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- An IDE or editor of your choice (recommend [Visual Studio Code](https://code.visualstudio.com/))

## Quickstart

1. Install dependencies.

```bash
npm install
```

2. Set your Path of Exile filter folder in `.env`.

```env
FILTER_PATH="C:\Users\user\Documents\My Games\Path of Exile"
```

1. Copy [`src/filters/example`](src/filters/example) to a new folder under `src/filters/`.

2. Edit [`config.ts`](src/filters/example/config.ts).

For most standard filters, `config.ts` is the only file you need to touch. [`index.ts`](/src/filters/example/index.ts) usually only needs changes if you want a different section layout or custom logic.

1. Export your filter.

```bash
npm run export filtername
```

If your filter folder is `src/filters/yourfilter`, run:

```bash
npm run export yourfilter
```

This also generates and syncs the sound pack before exporting.

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

You can generate and sync the sound pack manually with:

```bash
npm run generate-sounds
```

## Notes

- Most config fields have autocomplete for Path of Exile item classes, base types and link patterns
- `SOUNDS_FOLDER` only controls the target sound folder used by exported filters and by sound-pack syncing
- Custom filter folders under `src/filters/` are gitignored by default, while the shared example template stays tracked

---

<sub>Thanks to Allex for the sounds and the core of the project.</sub>

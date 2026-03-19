# poe filter tool

Quickstart for building Path of Exile filters with shared sections and custom sounds.

This tool is currently built with leveling filters in mind. Any Contributions that extend its capabilities are very welcome.

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- An IDE or editor of your choice
- [Visual Studio Code](https://code.visualstudio.com/) recommended for the best autocomplete experience

## Quickstart

1. Install dependencies.

```bash
npm install
```

2. Set your Path of Exile filter folder in `.env`.

```env
FILTER_PATH="C:\Users\user\Documents\My Games\Path of Exile"
```

3. Copy [`src/filters/example`](/home/moritz/workspace/poe/filtertool/src/filters/example) to a new folder under `src/filters/`.

4. Edit [`config.ts`](/home/moritz/workspace/poe/filtertool/src/filters/example/config.ts).

For most standard filters, `config.ts` is the only file you need to touch. [`index.ts`](/home/moritz/workspace/poe/filtertool/src/filters/example/index.ts) usually only needs changes if you want a different section layout or custom logic.

5. Extract the `poeft-sounds` zip file into your `FILTER_PATH` folder.

This should create a `poeft-sounds/` folder next to your exported `.filter` file.

Example:

```text
Path of Exile/
  Example.filter
  poeft-sounds/
    chaos.mp3
    regal.mp3
    ...
```

6. Export your filter.

```bash
npm run export filtername
```

If your filter folder is `src/filters/yourfilter`, run:

```bash
npm run export yourfilter
```

## Notes

- Most config fields have autocomplete for Path of Exile item classes, base types, link patterns, and tinctures.
- Custom filter folders under `src/filters/` are gitignored by default, while the shared example template stays tracked.

---

<sub>Thanks to Allex for the sounds and the core of the project.</sub>

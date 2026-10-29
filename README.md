<div align="center">

# Filtertool

[Get started](#get-started) · [Quick guide](#quick-guide) · [Releases](https://github.com/mositho/filtertool/releases) · [Filter terminology](GLOSSARY.md)

</div>

## Get started

Install [Node.js 24 LTS](https://nodejs.org/). Download and extract the source code from a [published release](https://github.com/mositho/filtertool/releases), or clone the repository for development. From that folder, run:

```bash
npm ci
npm run filtertool
```

The editor opens in your browser at **[localhost:5173](http://localhost:5173)**. Keep the terminal running; press `Ctrl+C` to stop.

> [!WARNING]
> Prefer published releases over the development version on `main`, which may break existing filters. Major releases can include breaking changes; read the release notes and back up your configurations before updating. Check your filters after exporting.

## Quick guide

1. **Check your game folder.** On Windows, **PoE Filter Path** in **Global Settings** will usually be filled in already. Only change it if it does not point to your game's filter folder.
2. **Create a filter.** Use the sidebar, then choose your weapons, armour, socket colours and item highlights.
3. **Save** keeps your configuration locally so you can return to it later. It does not update the in-game filter.
4. **Export** saves your configuration, writes the `.filter` file and syncs its sound pack to your game folder. Use **Export All** for every saved filter. Custom TTS generation needs an internet connection.
5. **Select it in PoE.** Choose the exported filter in the game's item-filter settings. After making changes, export again and reload it in-game.

**Output Preview** to inspect the generated filter text.

| Want to…                  | Use                                                      |
| :------------------------ | :------------------------------------------------------- |
| Export every saved filter | **Export All** in the sidebar                            |
| Share defaults and styles | **Global Settings**                                      |
| Fine-tune built-in rules  | **Equipment Rules**, **Link Rules**, or **Socket Rules** |
| Save / save and export    | `Ctrl+S` / `Ctrl+Shift+S`                                |
| Undo / redo               | `Ctrl+Z` / `Ctrl+Shift+Z`                                |

> [!CAUTION]
> Keep the exported sound folder alongside the `.filter` file. Moving or deleting it will break the filter.

[Development and release guide](CONTRIBUTING.md)

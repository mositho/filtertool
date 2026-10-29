# Development and releases

Use Node.js 24 (`.nvmrc`). See [README.md](README.md) for usage and [GLOSSARY.md](GLOSSARY.md) for filter terminology.

## Checks

```bash
npm ci
npm run check
npm run frontend:build
npm audit --audit-level=high
```

`check` runs backend/frontend typechecks, tests and formatting. Test exports with disposable configs and a temporary game folder; do not use personal game files or online TTS in automated tests.

## Dependencies

Dependabot opens weekly update PRs. When upgrading `ffmpeg-static`, review its install script and update the pinned `allowScripts` approval in `package.json`.

## Releases

Use semantic versioning: **major** for breaking changes, **minor** for compatible features, **patch** for compatible fixes. Use `-beta.N` for prereleases.

1. Update the version with `npm version <version> --no-git-tag-version`.
2. Run the checks above and manually verify startup, save/reopen and export.
3. Commit to `main` (directly or via PR) using Conventional Commits and wait for CI.
4. Tag the commit `v<package.json version>` and push the tag. The workflow runs Linux/Windows CI and creates a draft release.
5. Review the notes and publish manually. Document changes to generated rules, defaults and sounds, plus any required config edits—there is no automatic migration.

Releases contain source archives, not installers. Keep personal filters, settings, overrides and audio out of commits. AI agents must ask before committing, pushing, tagging or publishing.

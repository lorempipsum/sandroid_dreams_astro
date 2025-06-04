# Project Structure Review

This document summarises the current repository structure and suggests improvements to make the codebase easier to navigate and maintain.

## Current Layout

```
/ 
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   └── react/
│   ├── content/
│   ├── data/
│   ├── images/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   ├── types/
│   └── utils/
├── .github/
├── .vscode/
├── astro.config.mjs
├── package.json
└── other configuration files
```

## Configuration Highlights

* `astro.config.mjs` sets `site` to `https://sandroid.dev` and uses `react` and `mdx` integrations.
* `package.json` defines a build script that runs `check-filenames.sh` before `astro build`.
* `tsconfig.json` extends `astro/tsconfigs/strict` and enables React JSX.
* `vite.config.ts` stringifies JSON responses by default.

## Suggestions

### 1. Consolidate component folders
* React components live under `src/components/react` while Astro components live directly under `src/components`. Consider grouping them by feature instead of framework (e.g. `src/components/Button/` with React/Astro variants inside). This reduces deep nesting and clarifies where to find reusable UI pieces.

### 2. Move shell scripts into a dedicated directory
* `check-filenames.sh` and `remove_spaces_from_filename.sh` sit in the project root. Placing them under `scripts/` keeps the root clean and highlights that these scripts are optional helpers.

### 3. Remove OS‑generated files
* `src/assets/svg` contains duplicate `:com.dropbox.attrs` files. These appear to be metadata from macOS/Dropbox and can safely be removed from version control.

### 4. Ensure files end with a newline
* Many files (`*.astro`, `.ts`, `.scss`, etc.) do not end with a trailing newline. Adding one improves diff readability and complies with POSIX recommendations.

### 5. Use consistent code formatting
* Some config and source files mix tabs/spaces or have inconsistent indentation. Enforcing a formatter such as **Prettier** across the repo will keep styles consistent.

### 6. Organise image assets
* The `src/images` directory contains many photographs and art assets. If these grow large, consider moving long‑term static assets to `public/` or storing them in a separate repository or CDN to keep the main repo lightweight.

### 7. Provide clearer documentation
* The `README.md` mostly contains starter kit notes. A short overview of the project purpose, how to run scripts, and explanation of the data folders (`bristol-data`, `facilities.json`) would help newcomers.

### 8. Verify configuration files
* `vite.config.ts`, `tsconfig.json` and `astro.config.mjs` are minimal. Review whether additional settings (alias paths, environment variables) could be centralised to simplify imports and builds.

### 9. Document build workflow
* `package.json` runs `check-filenames.sh` before building. Adding a short note in the README helps contributors understand this pre-build step.

Implementing these suggestions should improve overall legibility and make it easier for new contributors to understand the repository layout.


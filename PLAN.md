# Static Site Port — Implementation Plan

## Overview
Eliminate the Express server by bundling computation logic for the browser and loading preset books as static JSON. Enables GitHub Pages deployment with zero server infrastructure.

## Out of Scope
- Changing computation logic (resolveChain, integerize, etc.)
- Changing localStorage book storage (already client-side)
- Import/export features

## Phase 1: Add esbuild, create browser bundle
### Changes
- `package.json`: Add `esbuild` as devDependency, add `bundle` script that builds `src/api/index.ts` → `dist/public/engine.js` as an IIFE exposing `RecipeEngine` global (or ESM — the HTML `<script>` tags can use `type="module"`)
- `tsconfig.json`: No changes needed — API code is already pure TS with no Node APIs
- `src/api/browser-entry.ts`: New file — imports and re-exports `resolveChain`, `integerize`, `getThroughput`, `buildProductionGraph` for the bundle entry point
- Update `build` script: `npm run clean && tsc && npm run copy-public && npm run bundle`

### Verification
- [ ] `npm run build` produces `dist/public/engine.js`
- [ ] `npm test` still passes (no changes to logic)

## Phase 2: Port index.html (editor)
### Changes
- `src/public/index.html`: Replace `fetch('/api/books')` preset list with `fetch('data/books.json')` → parse JSON → `Object.keys()`. Replace `fetch('/api/books/${name}')` with indexing into the fetched books object. Remove all server write calls (already using localStorage). Fix nav links to use relative paths (e.g. `calculator.html` not `/calculator.html`).

### Verification
- [ ] Editor loads preset books from static JSON
- [ ] Save/load/delete still work via localStorage
- [ ] Nav links work without Express routing

## Phase 3: Port calculator.html
### Changes
- `src/public/calculator.html`: Add `<script src="engine.js">` (or `type="module"` import). Replace `fetch('/api/resolve')` with direct `RecipeEngine.resolveChain(book, product, throughput)` call. Replace `fetch('/api/integerize')` with `RecipeEngine.integerize(chain)`. Replace `fetch('/api/throughput')` with `RecipeEngine.getThroughput(chain, product)` loop. Replace preset book loading same as Phase 2. Fix nav links.

### Verification
- [ ] Resolve/integerize/throughput work without server
- [ ] Graph renders correctly
- [ ] Both preset and local books work

## Phase 4: Port graph.html
### Changes
- `src/public/graph.html`: Add engine script. Replace `fetch('/api/graph/...')` and `fetch('/api/graph', POST)` with direct `RecipeEngine.buildProductionGraph(book)` call. Replace preset book loading same as Phase 2. Fix nav links.

### Verification
- [ ] Production graph renders for both preset and local books

## Phase 5: Clean up, update build & deploy
### Changes
- `package.json`: Remove `express` dependency and `@types/express` devDependency. Remove/rename `start` script. Update `build` to only produce static output.
- `src/server.ts`: Delete (or move to a `server/` dir if we want to keep it for local dev — user preference)
- `.github/workflows/pages.yml`: Update to copy `data/` into `dist/public/data/` so preset books are served alongside HTML
- `CLAUDE.md`: Update architecture notes

### Verification
- [ ] `npm run build` produces a self-contained `dist/public/` directory
- [ ] Opening `dist/public/index.html` via a local file server works end-to-end
- [ ] GitHub Pages workflow deploys correctly

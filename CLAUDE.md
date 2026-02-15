# Recipe Calculator

Factory/production chain calculator. Define products and recipes (with input/output quantities and durations), then resolve what constructors are needed to hit a target throughput.

## Commands
```bash
npm run build     # clean + tsc + bundle engine.js + copy static files to dist/public/
npm run serve     # serve dist/public/ locally (npx serve)
npm test          # vitest run
```

## Architecture

**Fully static site.** TypeScript, ESM modules. All computation runs in the browser via `engine.js` (bundled by esbuild from `src/api/`). Preset books served as static JSON from `data/books.json`. User books stored in localStorage. Deployed to GitHub Pages via `.github/workflows/pages.yml`.

### Types (`src/types/`)
- `Product`, `ItemStack`, `Recipe`, `RecipeBook` — core domain
- `ChainNode`, `ChainEdge`, `ProductionChain` — resolved chain (nodes have fractional `count`)
- `GraphEdge`, `ProductionGraph` — full recipe book graph with `ratio: [number, number]`

### API (`src/api/`)
Pure computation functions, no server dependencies. Bundled to `dist/public/engine.js` for browser use.
- `findRecipesFor(book, product)` — filter recipes producing a product
- `resolveChain(book, product, throughput?)` — recursive DFS to build production chain with constructor counts
- `integerize(chain)` — scale fractional counts to integers (brute-force scalar k=1..1000)
- `getThroughput(chain, product)` — net production rate (production minus consumption)
- `buildProductionGraph(book)` — full graph of all recipes with reduced A:B constructor ratios
- `browser-entry.ts` — esbuild entry point re-exporting all public functions

### Frontend (`src/public/`)
- `index.html` — Recipe book editor (create products, define recipes)
- `calculator.html` — Resolve production chains, visualize with Cytoscape (imports engine.js)
- `graph.html` — Full production graph of all recipes with ratio-labeled edges (imports engine.js)

### Tests (`src/__tests__/`)
Vitest. Shared fixtures in `fixtures.ts` with `simpleBook` (widget→cog→motor) and `awkwardBook` (fractional ratios).

## Lessons

- **Match by recipe name, not object reference.** After cloning/rebuilding nodes (e.g. in `integerize`), `Map` keyed on original node references breaks. Recipe name is the stable key.
- **Float arithmetic breaks GCD.** Durations like `3.3333` (representing 10/3) produce huge numerators when multiplied. Fix: brute-force a small scalar k where `a*k` and `b*k` are both near-integers, then round and reduce. Same pattern used in both `integerize` and `buildProductionGraph`.
- **Rebuild for changes to reach `dist/`.** The build pipeline: tsc → copy-public → esbuild bundle → copy data.
- **Cytoscape edge labels** need `text-wrap: 'wrap'`, `text-max-width` set generously, and `text-overflow-wrap: 'anywhere'` to avoid clipping on canvas.

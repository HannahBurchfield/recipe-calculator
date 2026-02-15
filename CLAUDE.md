# Recipe Calculator

Factory/production chain calculator. Define products and recipes (with input/output quantities and durations), then resolve what constructors are needed to hit a target throughput.

## Commands
```bash
npm run build     # clean + tsc + copy static files to dist/
npm start         # Express server on :3000
npm test          # vitest run
```

## Architecture

**TypeScript, ESM modules, Express 5.** All internal imports use `.js` extensions (NodeNext resolution). Static HTML frontend served from `src/public/` (copied to `dist/public/` at build time). No bundler — Cytoscape.js loaded from CDN.

### Types (`src/types/`)
- `Product`, `ItemStack`, `Recipe`, `RecipeBook` — core domain
- `ChainNode`, `ChainEdge`, `ProductionChain` — resolved chain (nodes have fractional `count`)
- `GraphEdge`, `ProductionGraph` — full recipe book graph with `ratio: [number, number]`

### API (`src/api/`)
- `findRecipesFor(book, product)` — filter recipes producing a product
- `resolveChain(book, product, throughput?)` — recursive DFS to build production chain with constructor counts
- `integerize(chain)` — scale fractional counts to integers (brute-force scalar k=1..1000)
- `getThroughput(chain, product)` — net production rate (production minus consumption)
- `buildProductionGraph(book)` — full graph of all recipes with reduced A:B constructor ratios

### Server (`src/server.ts`)
REST API over recipe books stored in `data/books.json`. Key endpoints: CRUD on `/api/books/:name`, `POST /api/resolve`, `POST /api/integerize`, `GET /api/graph/:name`.

### Frontend (`src/public/`)
- `index.html` — Recipe book editor (create products, define recipes)
- `calculator.html` — Resolve production chains, visualize with Cytoscape
- `graph.html` — Full production graph of all recipes with ratio-labeled edges

### Tests (`src/__tests__/`)
Vitest. Shared fixtures in `fixtures.ts` with `simpleBook` (widget→cog→motor) and `awkwardBook` (fractional ratios).

## Lessons

- **Match by recipe name, not object reference.** After cloning/rebuilding nodes (e.g. in `integerize`), `Map` keyed on original node references breaks. Recipe name is the stable key.
- **Float arithmetic breaks GCD.** Durations like `3.3333` (representing 10/3) produce huge numerators when multiplied. Fix: brute-force a small scalar k where `a*k` and `b*k` are both near-integers, then round and reduce. Same pattern used in both `integerize` and `buildProductionGraph`.
- **Express static serves from disk each request** but you still need to rebuild (`npm run build`) for changes to reach `dist/`. The `copy-public` script handles static files.
- **Cytoscape edge labels** need `text-wrap: 'wrap'`, `text-max-width` set generously, and `text-overflow-wrap: 'anywhere'` to avoid clipping on canvas.

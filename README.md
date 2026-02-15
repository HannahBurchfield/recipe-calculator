# recipe-calculator

Store recipes from factory games (e.g. 2 widgets + 1 cog → 1 motor in 2s) and calculate production ratios and throughput.

## Roadmap

- [x] Define core data structures (Product, Recipe, RecipeBook, ProductionChain)
- [x] Resolve production chains back to source materials
- [x] Calculate throughput for any product in a chain
- [x] Integerize fractional constructor counts (stoichiometry)
- [x] Add tests
- [x] Recipe book editor UI with localStorage persistence
- [x] Production chain calculator with Cytoscape graph visualization
- [x] Full production graph view with constructor ratio labels
- [x] Static site port (GitHub Pages) — all computation runs client-side
- [ ] Belt support — model belt capacity so intermediate steps don't overload; calculate how many belts each step requires

## Usage

```bash
npm run build
npm run serve
```

# recipe-calculator

Store recipes from factory games (e.g. 2 widgets + 1 cog → 1 motor in 2s) and calculate production ratios and throughput.

## Roadmap

- [x] Define core data structures (Product, Recipe, RecipeBook, ProductionChain)
- [x] Resolve production chains back to source materials
- [x] Calculate throughput for any product in a chain
- [x] Integerize fractional constructor counts (stoichiometry)
- [ ] Add tests
- [ ] Belt support — model belt capacity so intermediate steps don't overload; calculate how many belts each step requires
- [ ] Basic local UI & server — text representation of a production chain, buttons for resolveChain / integerize / getThroughput
- [ ] Graph visualization — use something like graphviz to render a springy diagram of production chains

## Usage

```bash
npm run build
npm run start
```

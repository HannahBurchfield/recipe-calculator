# Plan

## Data Structures

### Product
- `name: string`

### ItemStack
- `product: Product`
- `quantity: number`

### Recipe
- `name: string`
- `inputs: ItemStack[]` — can be empty (sources)
- `outputs: ItemStack[]` — generally at least one
- `duration: number` — seconds per run

### RecipeBook
- `recipes: Recipe[]`
- `products: Product[]`
Lookup container. Given a product, can find which recipes produce it.

### ChainNode
- `recipe: Recipe`
- `count: number` — how many constructors running this recipe (can be fractional before stoichiometry)

### ProductionChain
DAG of `ChainNode`s. Edges connect a node to the downstream node(s) that consume its output.
- `nodes: ChainNode[]`
- `edges: { from: ChainNode, to: ChainNode, product: Product }[]`

## Functions

### `findRecipesFor(book: RecipeBook, product: Product): Recipe[]`
Return all recipes in the book that produce the given product. Used internally by `resolveChain`, but also useful standalone when there are alternative recipes.

#### Algorithm
Filter `book.recipes` to those where `outputs` contains an `ItemStack` matching the product. Straightforward linear scan — recipe books are small.

### `resolveChain(book: RecipeBook, product: Product, throughput?: number): ProductionChain`
Given a target product, walk backwards through the recipe book to source materials, building the full production DAG. If `throughput` is provided (items/sec), scale constructor counts to meet it. If omitted, returns the chain for 1 recipe-run of the final product.

#### Algorithm
1. Start with the target product. Use `findRecipesFor` to pick a recipe (first match for now).
2. Compute the output rate of one constructor: `recipe.outputs[product].quantity / recipe.duration` items/sec.
3. If `throughput` given, `count = throughput / outputRate`. Otherwise `count = 1`.
4. Create a `ChainNode` for this recipe+count. Add to the chain.
5. For each input `ItemStack` of this recipe, compute the required items/sec: `input.quantity / recipe.duration * count`.
6. Recursively call `resolveChain` for each input product with that required throughput.
7. Connect the upstream node to the current node with an edge labeled by the product.
8. If a product has no recipe (source), create a source node with no recipe inputs — or skip (sources are leaf nodes with no upstream).
9. Deduplicate: if the same recipe is needed by multiple downstream nodes, merge into one `ChainNode` with summed count, and add edges from it to each consumer.

### `integerize(chain: ProductionChain, tolerance?: number): ProductionChain`
Find the smallest scalar that, when multiplied against all node counts, brings every count within `tolerance` (default 0.01) of an integer. Round the results. Returns a new chain with whole-number constructor counts.

#### Algorithm
1. Collect all node counts from `chain.nodes`.
2. Try successive integer scalars `k = 1, 2, 3, ...` up to a reasonable cap (e.g. 1000).
3. For each `k`, check if `count * k` is within `tolerance` of an integer for every node.
4. On first `k` that satisfies, multiply all counts by `k`, round, and return the new chain.
5. If no `k` found within the cap, return the chain scaled by the best `k` found (least total error) and round.

### `getThroughput(chain: ProductionChain, product: Product): number`
Return the net items/sec of a given product across the chain (total production minus internal consumption). Useful for checking source consumption rates or final output rate.

#### Algorithm
1. Sum production: for each node whose recipe outputs the product, add `output.quantity / recipe.duration * node.count`.
2. Sum consumption: for each node whose recipe inputs the product, add `input.quantity / recipe.duration * node.count`.
3. Return `production - consumption`.

# Handoff — Client-side storage + deployment prep

**Branch:** main
**Commit:** c20c5cc
**Date:** 2026-02-15

## What I was doing
Moved user book storage to localStorage and restricted server write endpoints to localhost. Also added full production graph visualization with constructor ratios (committed earlier). All code changes are committed but the localhost guard is untested from a non-localhost client.

## Recent changes (this session)
- `src/server.ts`: Localhost-only middleware on POST/DELETE book routes; computation endpoints (`resolve`, `throughput`, `graph`) now accept inline book data instead of server-side name lookup
- `src/public/index.html`: Editor saves to localStorage; merged preset/local book dropdown; preset books read-only with duplicate button
- `src/public/calculator.html`: Merged book dropdown; sends `book` object inline to resolve/throughput
- `src/public/graph.html`: Merged book dropdown; uses POST `/api/graph` for local books
- `src/types/graph.ts`, `src/api/build-production-graph.ts`: Full production graph with reduced A:B constructor ratios
- `src/__tests__/build-production-graph.test.ts`: 8 tests including float duration edge case
- `CLAUDE.md`: Added project overview

## Learnings
- Express 5 `@types/express` breaks `req.params` type inference when a middleware is passed before the handler — need `as string` cast on params.
- Float GCD for ratios: use brute-force scalar search (k=1..1000) to integerize, same pattern as `integerize.ts`. Continued fractions approach was tried first but the simpler scalar search matches the existing codebase pattern.
- Cytoscape edge label clipping: need `text-wrap: 'wrap'`, generous `text-max-width`, and `text-overflow-wrap: 'anywhere'`.

## Deployment decision (open)

**Goal:** Make the app accessible online.

**Option A: Go fully static (GitHub Pages)**
- Port computation (resolveChain, integerize, buildProductionGraph, getThroughput) to run in-browser. These are all pure functions with no server state — natural fit.
- Storage is already in localStorage. Preset books would be served as static JSON from `data/`.
- Free, zero maintenance, durable — GitHub Pages isn't going anywhere.
- Tradeoff: upfront work to bundle the TS for the browser (no bundler currently; Cytoscape loaded from CDN).
- A `.github/workflows/pages.yml` was drafted (currently uncommitted) that builds and deploys `dist/public/` + `data/` to Pages.

**Option B: Hosted Node/Express (Render, Railway, Fly.io)**
- Minimal code changes — app works as-is.
- Free tiers exist but are unreliable long-term (VC-funded, tiers keep shrinking). Render free tier has cold starts (~5-30s after idle).
- Not confident any of these will be around or free in 2 years.

**Option C: Cheap VPS (Hetzner, DigitalOcean, Linode)**
- ~$4-5/mo, full control, run Express directly.
- Most stable hosted option but costs money and requires maintenance.

**Option D: Self-host / local only**
- Already works on localhost. Could use reverse proxy + mkcert for HTTPS locally.
- The `req.ip` localhost guard is untested from non-localhost; may need `app.set('trust proxy', ...)` behind a proxy.

**Leaning toward:** Option A (static port) — zero cost, zero ops, and the architecture already moved most state client-side.

## Other next steps
- `data/books.json` is now un-gitignored (`.gitignore` change uncommitted) so preset books can be committed
- Test the localhost guard from a non-localhost IP to confirm 403 behavior

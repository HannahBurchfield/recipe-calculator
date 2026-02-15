# Client-Side Storage — Implementation Plan

## Overview
Move user recipe book storage to `localStorage` so the server stores nothing per-user. Server provides read-only preset books; write endpoints are localhost-only for admin use.

## Out of Scope
- Authentication / user accounts
- Import/export of books (could add later)
- Any changes to the computation endpoints (resolve, integerize, graph, throughput)

## Phase 1: Localhost-only write endpoints
### Changes
- `src/server.ts`: Add middleware guard on `POST /api/books/:name` and `DELETE /api/books/:name` that rejects non-localhost requests (check `req.ip` / `req.hostname` against `127.0.0.1`, `::1`, `localhost`)

### Verification
- [ ] `curl -X POST localhost:3000/api/books/test ...` still works
- [ ] Requests from non-localhost IPs get 403

## Phase 2: localStorage book storage
### Changes
- `src/public/index.html` (editor): Replace all `/api/books` save/delete calls with `localStorage` get/set/remove. Load still fetches preset list from server, but saves go to browser only.
- `src/public/calculator.html`: Book loading merges server presets + localStorage books into the dropdown
- `src/public/graph.html`: Same merge for book dropdown

All three pages need a shared pattern:
- `getLocalBooks(): Record<string, RecipeBook>` — parse from `localStorage.getItem('books')`
- `saveLocalBook(name, book)` / `deleteLocalBook(name)` — update localStorage
- `refreshBookList()` — fetch `/api/books` for presets, merge with local books, populate dropdown (mark preset vs local)

### Verification
- [ ] Create a book in editor, refresh — it persists from localStorage
- [ ] Preset books appear in all three pages
- [ ] Calculator and graph can load both preset and local books

## Phase 3: Preset book UX
### Changes
- `src/public/index.html`: When a preset book is loaded, disable save/delete buttons and show "(preset)" label. Add a "Duplicate" button that copies it into localStorage under a new name for editing.
- `src/public/calculator.html`, `src/public/graph.html`: Label preset vs local books in dropdown (e.g. "rogue-factory (preset)" vs "my-book")

### Verification
- [ ] Preset books are not editable in the editor
- [ ] Duplicating a preset creates a local editable copy
- [ ] Dropdown labels distinguish preset from local books

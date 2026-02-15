import express from 'express';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RecipeBook } from './types/index.js';
import { resolveChain, integerize, getThroughput, buildProductionGraph } from './api/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const BOOKS_FILE = join(DATA_DIR, 'books.json');

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(BOOKS_FILE)) writeFileSync(BOOKS_FILE, '{}');
}

function readBooks(): Record<string, RecipeBook> {
  ensureDataDir();
  return JSON.parse(readFileSync(BOOKS_FILE, 'utf-8')) as Record<string, RecipeBook>;
}

function writeBooks(books: Record<string, RecipeBook>): void {
  ensureDataDir();
  writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
}

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// List all books
app.get('/api/books', (_req, res) => {
  const books = readBooks();
  res.json(Object.keys(books));
});

// Get a specific book
app.get('/api/books/:name', (req, res) => {
  const books = readBooks();
  const book = books[req.params.name];
  if (!book) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }
  res.json(book);
});

// Save/overwrite a book
app.post('/api/books/:name', (req, res) => {
  const books = readBooks();
  books[req.params.name] = req.body as RecipeBook;
  writeBooks(books);
  res.json({ ok: true });
});

// Delete a book
app.delete('/api/books/:name', (req, res) => {
  const books = readBooks();
  if (!(req.params.name in books)) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }
  delete books[req.params.name];
  writeBooks(books);
  res.json({ ok: true });
});

// Resolve a production chain
app.post('/api/resolve', (req, res) => {
  const { bookName, productName, throughput } = req.body as {
    bookName: string;
    productName: string;
    throughput?: number;
  };
  const books = readBooks();
  const book = books[bookName];
  if (!book) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }
  const product = book.products.find((p) => p.name === productName);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  const chain = resolveChain(book, product, throughput);
  res.json(chain);
});

// Integerize a production chain
app.post('/api/integerize', (req, res) => {
  const chain = req.body as import('./types/index.js').ProductionChain;
  res.json(integerize(chain));
});

// Get throughput for all products in a chain
app.post('/api/throughput', (req, res) => {
  const { chain, bookName } = req.body as {
    chain: import('./types/index.js').ProductionChain;
    bookName: string;
  };
  const books = readBooks();
  const book = books[bookName];
  if (!book) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }
  const result: Record<string, number> = {};
  for (const product of book.products) {
    const t = getThroughput(chain, product);
    if (Math.abs(t) > 1e-9) result[product.name] = t;
  }
  res.json(result);
});

// Full production graph for a book
app.get('/api/graph/:name', (req, res) => {
  const books = readBooks();
  const book = books[req.params.name];
  if (!book) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }
  res.json(buildProductionGraph(book));
});

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);
app.listen(PORT, () => {
  console.log(`Recipe calculator running at http://localhost:${PORT}`);
});

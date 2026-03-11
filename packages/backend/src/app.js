const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialItems = [
  { name: 'Buy groceries', due_date: null },
  { name: 'Write project report', due_date: '2026-03-15' },
  { name: 'Schedule dentist appointment', due_date: '2026-03-20' },
];
const insertStmt = db.prepare('INSERT INTO items (name, due_date) VALUES (?, ?)');

initialItems.forEach(({ name, due_date }) => {
  insertStmt.run(name, due_date);
});

console.log('In-memory database initialized with sample data');

// Validate that a string is a valid ISO date (YYYY-MM-DD)
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isValidDate = (str) => ISO_DATE_RE.test(str) && !isNaN(Date.parse(str));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// API Routes

// GET /api/items — sorted: incomplete first, then by due_date ASC (nulls last), then created_at ASC
app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT * FROM items
      ORDER BY
        completed ASC,
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC,
        due_date ASC,
        created_at ASC
    `).all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// POST /api/items — create a new task
app.post('/api/items', (req, res) => {
  try {
    const { name, due_date } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    if (due_date !== undefined && due_date !== null && !isValidDate(due_date)) {
      return res.status(400).json({ error: 'due_date must be a valid date in YYYY-MM-DD format' });
    }

    const result = insertStmt.run(name.trim(), due_date || null);
    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/items/:id — update name and/or due_date
app.put('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, due_date } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({ error: 'Item name cannot be empty' });
    }

    if (due_date !== undefined && due_date !== null && !isValidDate(due_date)) {
      return res.status(400).json({ error: 'due_date must be a valid date in YYYY-MM-DD format' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updatedName = name !== undefined ? name.trim() : existingItem.name;
    const updatedDueDate = due_date !== undefined ? (due_date || null) : existingItem.due_date;

    db.prepare(`
      UPDATE items SET name = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(updatedName, updatedDueDate, id);

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// PATCH /api/items/:id/complete — toggle completion status
app.patch('/api/items/:id/complete', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const newCompleted = existingItem.completed === 1 ? 0 : 1;
    db.prepare(`
      UPDATE items SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(newCompleted, id);

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error toggling completion:', error);
    res.status(500).json({ error: 'Failed to toggle completion' });
  }
});

// DELETE /api/items/:id
app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);

    if (result.changes > 0) {
      res.json({ message: 'Item deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db };
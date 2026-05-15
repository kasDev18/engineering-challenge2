const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (intentionally sync to highlight blocking issue)
function readData() {
  const raw = fs.readFileSync(DATA_PATH);
  return JSON.parse(raw);
}

// GET /api/items?page=1&limit=10&q=search
router.get('/', (req, res, next) => {
  try {
    const data = readData();
    const { q, page: pageParam, limit: limitParam } = req.query;
    let results = data;

    if (q) {
      const term = q.toLowerCase();
      results = results.filter(item => item.name.toLowerCase().includes(term));
    }

    const total = results.length;
    const limit = Math.min(Math.max(parseInt(limitParam, 10) || 10, 1), 100);
    const requestedPage = Math.max(parseInt(pageParam, 10) || 1, 1);
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * limit;
    const items = results.slice(offset, offset + limit);

    res.json({ items, total, page, limit, totalPages });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', (req, res, next) => {
  try {
    const data = readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = readData();
    item.id = Date.now();
    data.push(item);
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
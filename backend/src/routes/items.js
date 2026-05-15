const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

async function readData() {
  const raw = await fs.promises.readFile(DATA_PATH);
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.promises.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

// GET /api/items?page=1&limit=10&q=search
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
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
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
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
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
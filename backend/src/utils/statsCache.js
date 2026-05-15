const fs = require('fs');
const path = require('path');
const { computeStats } = require('./stats');

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cachedStats = null;
let refreshPromise = null;
let watcher = null;

async function refreshCache() {
  const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);
  cachedStats = computeStats(items);
  return cachedStats;
}

async function getStats() {
  if (cachedStats) return cachedStats;
  if (!refreshPromise) {
    refreshPromise = refreshCache().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function invalidateCache() {
  cachedStats = null;
}

function startStatsWatcher() {
  if (watcher) return;

  watcher = fs.watch(DATA_PATH, () => {
    invalidateCache();
    refreshCache().catch((err) => {
      console.error('Failed to refresh stats cache:', err);
    });
  });
}

function stopStatsWatcher() {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
}

module.exports = {
  getStats,
  invalidateCache,
  refreshCache,
  startStatsWatcher,
  stopStatsWatcher,
};

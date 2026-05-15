import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 3;

function Items() {
  const { items, total, page, totalPages, loading, error, fetchItems } = useData();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;

    fetchItems({
      page: 1,
      limit: PAGE_SIZE,
      q: searchQuery,
      isActive: () => active,
    }).catch(console.error);

    return () => {
      active = false;
    };
  }, [searchQuery, fetchItems]);

  const changePage = (nextPage) => {
    fetchItems({ page: nextPage, limit: PAGE_SIZE, q: searchQuery });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleClear = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  return (
    <div style={{ padding: 16 }}>
      <form onSubmit={handleSearch} style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input
          type="search"
          placeholder="Search by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search items"
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Search</button>
        {searchQuery && (
          <button type="button" onClick={handleClear} style={{ padding: '8px 16px' }}>
            Clear
          </button>
        )}
      </form>

      {loading && <p>Loading...</p>}
      {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p>{searchQuery ? `No items match "${searchQuery}".` : 'No items found.'}</p>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <p style={{ color: '#666', marginBottom: 8 }}>
            Showing {items.length} of {total} item{total !== 1 ? 's' : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map(item => (
              <li key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <Link to={'/items/' + item.id}>{item.name}</Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav aria-label="Pagination" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => changePage(page - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => changePage(page + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default Items;

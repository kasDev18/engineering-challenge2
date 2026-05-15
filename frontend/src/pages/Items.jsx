import React, { useEffect, useState } from 'react';
import { List } from 'react-window';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 50;
const ROW_HEIGHT = 52;
const MAX_LIST_HEIGHT = 480;
const SKELETON_ROWS = 6;

const listStyle = (height) => ({ height, width: '100%' });

function ItemRow({ index, style, ariaAttributes, items }) {
  const item = items[index];
  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px',
        borderBottom: '1px solid var(--border)',
        boxSizing: 'border-box',
      }}
      {...ariaAttributes}
    >
      <Link
        to={`/items/${item.id}`}
        style={{
          color: 'var(--link)',
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        {item.name}
      </Link>
      {item.category && (
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 13,
            color: 'var(--muted)',
          }}
        >
          {item.category}
        </span>
      )}
    </div>
  );
}

function SkeletonRow({ style, ariaAttributes }) {
  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px',
        borderBottom: '1px solid var(--border)',
        boxSizing: 'border-box',
      }}
      {...ariaAttributes}
      aria-hidden="true"
    >
      <div
        style={{
          height: 14,
          width: '55%',
          borderRadius: 4,
          background: 'linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.2s ease-in-out infinite',
        }}
      />
    </div>
  );
}

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

  const listHeight = loading
    ? Math.min(MAX_LIST_HEIGHT, SKELETON_ROWS * ROW_HEIGHT)
    : Math.min(MAX_LIST_HEIGHT, Math.max(items.length, 1) * ROW_HEIGHT);

  return (
    <div
      className="items-page"
      style={{
        padding: 24,
        maxWidth: 720,
        margin: '0 auto',
        '--border': '#e5e7eb',
        '--muted': '#6b7280',
        '--link': '#2563eb',
        '--surface': '#f9fafb',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .items-page a:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
          border-radius: 2px;
        }
        .items-page button:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
      `}</style>

      <h1 style={{ margin: '0 0 16px', fontSize: 24, fontWeight: 600 }}>Items</h1>

      <form
        onSubmit={handleSearch}
        role="search"
        style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}
      >
        <input
          type="search"
          placeholder="Search by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search items by name"
          disabled={loading}
          style={{
            flex: '1 1 200px',
            padding: '10px 12px',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 15,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 18px',
            borderRadius: 6,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          Search
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            style={{
              padding: '10px 18px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </form>

      {error && (
        <p role="alert" style={{ color: '#b91c1c', marginBottom: 16 }}>
          {error}
        </p>
      )}

      {loading && (
        <div
          aria-busy="true"
          aria-label="Loading items"
          style={{
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
            background: '#fff',
          }}
        >
          <List
            rowCount={SKELETON_ROWS}
            rowHeight={ROW_HEIGHT}
            rowComponent={SkeletonRow}
            rowProps={{}}
            style={listStyle(listHeight)}
            defaultHeight={listHeight}
          />
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>
          {searchQuery ? `No items match "${searchQuery}".` : 'No items found.'}
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <p
            style={{ color: 'var(--muted)', marginBottom: 12, fontSize: 14 }}
            aria-live="polite"
          >
            Showing {items.length} of {total} item{total !== 1 ? 's' : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </p>

          <div
            aria-label="Items list"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            <List
              rowCount={items.length}
              rowHeight={ROW_HEIGHT}
              rowComponent={ItemRow}
              rowProps={{ items }}
              overscanCount={5}
              style={listStyle(listHeight)}
              defaultHeight={listHeight}
            />
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              style={{
                marginTop: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => changePage(page - 1)}
                aria-label="Go to previous page"
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: page <= 1 ? 'var(--surface)' : '#fff',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <span aria-current="page">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => changePage(page + 1)}
                aria-label="Go to next page"
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: page >= totalPages ? 'var(--surface)' : '#fff',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                }}
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

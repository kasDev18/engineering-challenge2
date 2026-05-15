import React, { createContext, useCallback, useContext, useState } from 'react';
import { apiConfig } from '../config/appConfig';

const DataContext = createContext();

const initialListState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  loading: false,
  error: null,
};

export function DataProvider({ children }) {
  const [listState, setListState] = useState(initialListState);

  const fetchItems = useCallback(async ({ page = 1, limit = 10, q = '', isActive = () => true } = {}) => {
    setListState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (q) params.set('q', q);

      const res = await fetch(`${apiConfig.baseUrl}/items?${params}`);
      if (!res.ok) throw new Error('Failed to fetch items');

      const json = await res.json();
      if (isActive()) {
        setListState({
          items: json.items,
          total: json.total,
          page: json.page,
          limit: json.limit,
          totalPages: json.totalPages,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      if (isActive()) {
        setListState(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to fetch items',
        }));
      }
    }
  }, []);

  return (
    <DataContext.Provider value={{ ...listState, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);

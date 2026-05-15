import React, { createContext, useCallback, useContext, useState } from 'react';
import { apiConfig } from '../config/appConfig';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);

  const fetchItems = useCallback(async (isActive = () => true) => {
    const res = await fetch(`${apiConfig.baseUrl}/items?limit=500`); // Intentional bug: backend ignores limit
    const json = await res.json();
    if (isActive()) {
      setItems(json);
    }
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
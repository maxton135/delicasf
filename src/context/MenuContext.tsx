'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MenuItem {
  itemData: {
    name: string;
    description: string;
  };
}

interface CategoryItems {
  [key: string]: MenuItem[];
}

interface SyncStatus {
  lastSuccessfulSync: string | null;
  lastSyncAttempt: string | null;
  syncStatus: 'success' | 'error' | 'in_progress' | 'pending';
  itemsCount?: number;
  categoriesCount?: number;
}

interface MenuContextType {
  menuItems: CategoryItems;
  loading: boolean;
  error: string | null;
  syncStatus: SyncStatus | null;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<CategoryItems>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/menu');
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      
      const data = await response.json();
      setMenuItems(data.menuItems || {});
      setSyncStatus(data.syncStatus);
      
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Fallback to Square API if cached data fails
      try {
        console.log('Falling back to Square API...');
        const fallbackResponse = await fetch('/api/square/catalog');
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setMenuItems(fallbackData);
          setError('Using live data (cache unavailable)');
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        setError('Failed to load menu data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return (
    <MenuContext.Provider value={{ menuItems, loading, error, syncStatus }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
} 
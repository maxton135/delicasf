'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface MenuItem {
  itemData: {
    name: string;
    description: string;
    [key: string]: any; // Allow for additional properties
  };
}

interface CartItem {
  itemData: MenuItem['itemData'];
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (itemData: MenuItem['itemData']) => void;
  removeItem: (name: string) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (itemData: MenuItem['itemData']) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.itemData.name === itemData.name);
      if (existingItem) {
        return currentItems.map(item =>
          item.itemData.name === itemData.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { itemData, quantity: 1 }];
    });
  };

  const removeItem = (name: string) => {
    setItems(currentItems =>
      currentItems.filter(item => item.itemData.name !== name)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 
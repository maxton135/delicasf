'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface MenuItem {
  id: string; // Square item ID
  itemData: {
    name: string;
    description: string;
    [key: string]: any; // Allow for additional properties
  };
  [key: string]: any; // Allow for additional Square properties
}

interface ComboSelection {
  [categoryName: string]: {
    id: string;
    dbId: number;
    name: string;
    description?: string;
    itemData?: any;
  };
}

interface CartItem {
  itemData: MenuItem; // Store the full menu item, not just itemData
  quantity: number;
  isCombo?: boolean;
  comboSelections?: ComboSelection;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  addComboItem: (item: MenuItem, comboSelections: ComboSelection) => void;
  removeItem: (name: string) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: MenuItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(cartItem => 
        cartItem.itemData.itemData.name === item.itemData.name && !cartItem.isCombo
      );
      if (existingItem) {
        return currentItems.map(cartItem =>
          cartItem.itemData.itemData.name === item.itemData.name && !cartItem.isCombo
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...currentItems, { itemData: item, quantity: 1 }];
    });
  };

  const addComboItem = (item: MenuItem, comboSelections: ComboSelection) => {
    setItems(currentItems => {
      // For combo items, always add as new item since selections might be different
      return [...currentItems, { 
        itemData: item, 
        quantity: 1, 
        isCombo: true, 
        comboSelections 
      }];
    });
  };

  const removeItem = (name: string) => {
    setItems(currentItems =>
      currentItems.filter(item => item.itemData.itemData.name !== name)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, addComboItem, removeItem, clearCart, totalItems }}>
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
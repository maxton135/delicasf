'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OrderConfigContextType {
  ordersEnabled: boolean;
  disabledMessage: string;
  toggleOrders: () => void;
  setDisabledMessage: (message: string) => void;
  enableOrders: () => void;
  disableOrders: () => void;
}

const OrderConfigContext = createContext<OrderConfigContextType | undefined>(undefined);

const DEFAULT_DISABLED_MESSAGE = "Online ordering is currently unavailable. Please call us to place your order.";

export function OrderConfigProvider({ children }: { children: ReactNode }) {
  const [ordersEnabled, setOrdersEnabled] = useState<boolean>(true);
  const [disabledMessage, setDisabledMessage] = useState<string>(DEFAULT_DISABLED_MESSAGE);

  // Load from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('delica-orders-enabled');
      const savedMessage = localStorage.getItem('delica-disabled-message');
      
      if (savedEnabled !== null) {
        setOrdersEnabled(JSON.parse(savedEnabled));
      }
      
      if (savedMessage !== null) {
        setDisabledMessage(savedMessage);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('delica-orders-enabled', JSON.stringify(ordersEnabled));
    }
  }, [ordersEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('delica-disabled-message', disabledMessage);
    }
  }, [disabledMessage]);

  const toggleOrders = () => {
    setOrdersEnabled(prev => !prev);
  };

  const enableOrders = () => {
    setOrdersEnabled(true);
  };

  const disableOrders = () => {
    setOrdersEnabled(false);
  };

  const updateDisabledMessage = (message: string) => {
    setDisabledMessage(message || DEFAULT_DISABLED_MESSAGE);
  };

  return (
    <OrderConfigContext.Provider 
      value={{ 
        ordersEnabled, 
        disabledMessage, 
        toggleOrders, 
        setDisabledMessage: updateDisabledMessage,
        enableOrders,
        disableOrders
      }}
    >
      {children}
    </OrderConfigContext.Provider>
  );
}

export function useOrderConfig() {
  const context = useContext(OrderConfigContext);
  if (context === undefined) {
    throw new Error('useOrderConfig must be used within an OrderConfigProvider');
  }
  return context;
}
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OrderConfigContextType {
  ordersEnabled: boolean;
  disabledMessage: string;
  toggleOrders: () => Promise<void>;
  setDisabledMessage: (message: string) => Promise<void>;
  enableOrders: () => Promise<void>;
  disableOrders: () => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
}

const OrderConfigContext = createContext<OrderConfigContextType | undefined>(undefined);

const DEFAULT_DISABLED_MESSAGE = "Online ordering is currently unavailable. Please call us to place your order.";

export function OrderConfigProvider({ children }: { children: ReactNode }) {
  const [ordersEnabled, setOrdersEnabled] = useState<boolean>(true);
  const [disabledMessage, setDisabledMessage] = useState<string>(DEFAULT_DISABLED_MESSAGE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch configuration from API
  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/order-config');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`);
      }
      
      const config = await response.json();
      setOrdersEnabled(config.ordersEnabled);
      setDisabledMessage(config.disabledMessage);
    } catch (err) {
      console.error('Error fetching order config:', err);
      setError('Failed to load order configuration');
    } finally {
      setLoading(false);
    }
  };

  // Load configuration on component mount
  useEffect(() => {
    fetchConfig();
  }, []);

  // Periodic sync to check for admin changes (every 30 seconds)
  useEffect(() => {
    if (loading) return; // Don't start polling until initial load is complete
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/order-config');
        if (response.ok) {
          const config = await response.json();
          
          // Only update if there are actual changes
          if (
            config.ordersEnabled !== ordersEnabled || 
            config.disabledMessage !== disabledMessage
          ) {
            setOrdersEnabled(config.ordersEnabled);
            setDisabledMessage(config.disabledMessage);
          }
        }
      } catch (error) {
        // Silently fail for background sync - don't show errors to user
        console.log('Background sync failed:', error);
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [loading, ordersEnabled, disabledMessage]);

  // Update configuration via API
  const updateConfig = async (updates: { ordersEnabled?: boolean; disabledMessage?: string }) => {
    try {
      setError(null);
      
      const response = await fetch('/api/admin/order-config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update config: ${response.status}`);
      }
      
      const config = await response.json();
      setOrdersEnabled(config.ordersEnabled);
      setDisabledMessage(config.disabledMessage);
    } catch (err) {
      console.error('Error updating order config:', err);
      setError('Failed to update order configuration');
      throw err;
    }
  };

  const toggleOrders = async () => {
    await updateConfig({ ordersEnabled: !ordersEnabled });
  };

  const enableOrders = async () => {
    await updateConfig({ ordersEnabled: true });
  };

  const disableOrders = async () => {
    await updateConfig({ ordersEnabled: false });
  };

  const updateDisabledMessage = async (message: string) => {
    await updateConfig({ disabledMessage: message || DEFAULT_DISABLED_MESSAGE });
  };

  return (
    <OrderConfigContext.Provider 
      value={{ 
        ordersEnabled, 
        disabledMessage, 
        toggleOrders, 
        setDisabledMessage: updateDisabledMessage,
        enableOrders,
        disableOrders,
        loading,
        error,
        refreshConfig: fetchConfig
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
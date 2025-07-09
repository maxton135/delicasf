'use client';

import { useState, useEffect } from 'react';
import { useOrderConfig } from '../../context/OrderConfigContext';

export default function AdminPage() {
  const { ordersEnabled, disabledMessage, toggleOrders, setDisabledMessage, loading, error } = useOrderConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tempMessage, setTempMessage] = useState(disabledMessage);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Menu sync state
  const [menuSyncing, setMenuSyncing] = useState(false);
  const [menuSyncStatus, setMenuSyncStatus] = useState<any>(null);
  const [lastMenuSync, setLastMenuSync] = useState<string | null>(null);
  
  // Menu management state
  const [menuItems, setMenuItems] = useState<any>({});
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);

  // Admin password will be validated server-side via API

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setErrorMessage('Please enter a password');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    try {
      setUpdating(true);
      
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        setPassword('');
        setShowError(false);
        setErrorMessage('');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Authentication failed');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
        setPassword('');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      setPassword('');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggle = async () => {
    try {
      setUpdating(true);
      await toggleOrders();
      setShowSuccess(true);
      setShowError(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage('Failed to update order status. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleMessageUpdate = async () => {
    try {
      if (!tempMessage.trim()) {
        setErrorMessage('Please enter a message');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
        return;
      }
      
      if (tempMessage.length > 200) {
        setErrorMessage('Message must be less than 200 characters');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
        return;
      }
      
      setUpdating(true);
      await setDisabledMessage(tempMessage);
      setShowSuccess(true);
      setShowError(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage('Failed to update message. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setUpdating(false);
    }
  };

  // Menu sync functions
  const fetchMenuSyncStatus = async () => {
    try {
      const response = await fetch('/api/menu/sync');
      if (response.ok) {
        const data = await response.json();
        setMenuSyncStatus(data.syncStatus);
        setLastMenuSync(data.syncStatus?.lastSuccessfulSync);
      }
    } catch (error) {
      console.error('Error fetching menu sync status:', error);
    }
  };

  // Menu management functions
  const fetchMenuItems = async () => {
    try {
      setLoadingMenuItems(true);
      const response = await fetch('/api/admin/menu');
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.menuItems);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoadingMenuItems(false);
    }
  };

  const handleToggleSoldOut = async (itemId: number) => {
    try {
      setUpdatingItem(itemId);
      
      const response = await fetch('/api/admin/menu', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          action: 'toggle',
        }),
      });
      
      if (response.ok) {
        await fetchMenuItems(); // Refresh the menu items
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to update item');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    } catch (error) {
      setErrorMessage('Failed to update item. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleMenuSync = async () => {
    try {
      setMenuSyncing(true);
      setShowError(false);
      
      const response = await fetch('/api/menu/sync', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        await fetchMenuSyncStatus(); // Refresh status
      } else {
        setErrorMessage(data.error || 'Menu sync failed');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
    } catch (error) {
      setErrorMessage('Failed to sync menu. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setMenuSyncing(false);
    }
  };

  // Load menu sync status and menu items when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMenuSyncStatus();
      fetchMenuItems();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Login</h1>
          
          {showError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={updating}
              className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                updating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {updating ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Restaurant Admin</h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>

          {showSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Settings updated successfully!
            </div>
          )}
          
          {showError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          <div className="space-y-6">
            {/* Order Toggle Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Online Orders</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Current status: 
                    <span className={`ml-2 font-medium ${ordersEnabled ? 'text-green-600' : 'text-red-600'}`}>
                      {ordersEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={updating || loading}
                  className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 ${
                    updating || loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : ordersEnabled 
                      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {updating ? 'Updating...' : ordersEnabled ? 'Disable Orders' : 'Enable Orders'}
                </button>
              </div>
            </div>

            {/* Menu Sync Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Menu Synchronization</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Sync Status: 
                      <span className={`ml-2 font-medium ${
                        menuSyncStatus?.syncStatus === 'success' ? 'text-green-600' : 
                        menuSyncStatus?.syncStatus === 'error' ? 'text-red-600' : 
                        menuSyncStatus?.syncStatus === 'in_progress' ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {menuSyncStatus?.syncStatus?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </p>
                    {lastMenuSync && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last sync: {new Date(lastMenuSync).toLocaleString()}
                      </p>
                    )}
                    {menuSyncStatus?.itemsCount && (
                      <p className="text-xs text-gray-500">
                        {menuSyncStatus.itemsCount} items, {menuSyncStatus.categoriesCount} categories
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleMenuSync}
                    disabled={menuSyncing || updating || loading}
                    className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 ${
                      menuSyncing || updating || loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                  >
                    {menuSyncing ? 'Syncing...' : 'Sync Menu'}
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  <p>• Menu data is automatically synced every 30 minutes</p>
                  <p>• Manual sync fetches the latest items from Square</p>
                  <p>• Changes may take a few seconds to appear on the website</p>
                </div>
              </div>
            </div>

            {/* Menu Management Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Menu Management</h2>
              <p className="text-sm text-gray-600 mb-4">
                Toggle individual items as sold out. Sold out items will not appear in the customer menu.
              </p>
              
              {loadingMenuItems ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading menu items...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(menuItems).map(([category, items]: [string, any[]]) => (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-3">{category}</h3>
                      <div className="space-y-2">
                        {items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{item.itemData?.name || item.name}</div>
                              {(item.itemData?.description || item.description) && (
                                <div className="text-sm text-gray-600">{item.itemData?.description || item.description}</div>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`text-sm font-medium ${
                                item.isSoldOut ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {item.isSoldOut ? 'SOLD OUT' : 'AVAILABLE'}
                              </span>
                              <button
                                onClick={() => handleToggleSoldOut(item.dbId)}
                                disabled={updatingItem === item.dbId}
                                className={`px-3 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 ${
                                  updatingItem === item.dbId
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : item.isSoldOut 
                                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
                                    : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                                }`}
                              >
                                {updatingItem === item.dbId ? 'Updating...' : item.isSoldOut ? 'Mark Available' : 'Mark Sold Out'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {Object.keys(menuItems).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No menu items found. Try syncing the menu first.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Message Customization Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Disabled Message</h2>
              <p className="text-sm text-gray-600 mb-3">
                This message will be shown to customers when online orders are disabled.
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    value={tempMessage}
                    onChange={(e) => setTempMessage(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      tempMessage.length > 200 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    rows={3}
                    placeholder="Enter message to show when orders are disabled..."
                    maxLength={250}
                  />
                  <div className={`text-sm mt-1 ${
                    tempMessage.length > 200 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {tempMessage.length}/200 characters
                  </div>
                </div>
                <button
                  onClick={handleMessageUpdate}
                  disabled={!tempMessage.trim() || tempMessage.length > 200 || updating || loading}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                    !tempMessage.trim() || tempMessage.length > 200 || updating || loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  } text-white`}
                >
                  {updating ? 'Updating...' : 'Update Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
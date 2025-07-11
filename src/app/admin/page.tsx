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
  const [sessionLoading, setSessionLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'store' | 'menu'>('store');

  // Check session on component mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/admin/menu', {
        method: 'GET',
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
      setIsAuthenticated(false);
      setPassword('');
      setTempMessage(disabledMessage);
      setShowSuccess(false);
      setShowError(false);
      setErrorMessage('');
    } catch (error) {
      // Force logout even if API call fails
      setIsAuthenticated(false);
    }
  };

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

  const fetchMenuSyncStatus = async () => {
    try {
      const response = await fetch('/api/menu/sync');
      if (response.ok) {
        const data = await response.json();
        setMenuSyncStatus(data);
        if (data.lastSync) {
          setLastMenuSync(data.lastSync);
        }
      }
    } catch (error) {
      console.error('Failed to fetch menu sync status:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoadingMenuItems(true);
      const response = await fetch('/api/admin/menu');
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.menuItems || {});
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setLoadingMenuItems(false);
    }
  };

  const handleMenuSync = async () => {
    try {
      setMenuSyncing(true);
      const response = await fetch('/api/menu/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        await fetchMenuSyncStatus(); // Refresh status
        await fetchMenuItems(); // Refresh menu items
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

  const handleItemToggle = async (itemId: number) => {
    try {
      setUpdatingItem(itemId);
      const response = await fetch('/api/admin/menu', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, action: 'toggle' }),
      });
      
      if (response.ok) {
        await fetchMenuItems(); // Refresh menu items
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
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

  // Update temp message when disabled message changes
  useEffect(() => {
    setTempMessage(disabledMessage);
  }, [disabledMessage]);

  // Load menu sync status and menu items when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMenuSyncStatus();
      fetchMenuItems();
    }
  }, [isAuthenticated]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={updating}
              className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 ${
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Restaurant Admin</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('store')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'store'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Store Operations
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'menu'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Menu Management
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
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

            {activeTab === 'store' ? (
              <div className="space-y-8">
                {/* Order Toggle Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Online Orders</h2>
                  <div className="flex items-center justify-between mb-4">
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
                      className={`px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 ${
                        updating || loading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : ordersEnabled 
                          ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                          : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                      }`}
                    >
                      {updating || loading ? 'Updating...' : ordersEnabled ? 'Disable Orders' : 'Enable Orders'}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    <p>• When disabled, customers will see a message instead of the order form</p>
                    <p>• The main menu will still be visible for viewing</p>
                  </div>
                </div>

                {/* Message Customization Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Disabled Message</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    This message will be shown to customers when online orders are disabled.
                  </p>
                  <div className="space-y-3">
                    <div className="relative">
                      <textarea
                        value={tempMessage}
                        onChange={(e) => setTempMessage(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 bg-white ${
                          tempMessage.length > 200 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        rows={4}
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
                      className={`px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 ${
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
            ) : (
              <div className="space-y-8">
                {/* Menu Sync Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Menu Synchronization</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Last sync: {lastMenuSync ? new Date(lastMenuSync).toLocaleString() : 'Never'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: <span className={`font-medium ${menuSyncStatus?.success ? 'text-green-600' : 'text-red-600'}`}>
                            {menuSyncStatus?.success ? 'Success' : 'Failed'}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={handleMenuSync}
                        disabled={menuSyncing}
                        className={`px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 ${
                          menuSyncing
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                        } text-white`}
                      >
                        {menuSyncing ? 'Syncing...' : 'Sync Menu'}
                      </button>
                    </div>
                    {menuSyncStatus?.error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                        Error: {menuSyncStatus.error}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 bg-white p-3 rounded">
                      <p>• Menu sync is manual only - no automatic syncing</p>
                      <p>• Manual sync fetches the latest items from Square</p>
                      <p>• Changes may take a few seconds to appear on the website</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items Management */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Menu Items</h2>
                    <p className="text-sm text-gray-600">
                      Manage item availability and sold-out status. Sold-out items will not appear in the customer menu.
                    </p>
                  </div>
                  
                  <div className="p-6">
                    {loadingMenuItems ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading menu items...</span>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.entries(menuItems).map(([category, items]) => (
                          <div key={category} className="border border-gray-200 rounded-lg">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                              <h3 className="font-medium text-gray-800">{category}</h3>
                              <p className="text-sm text-gray-600">
                                {(items as any[]).length} items, {(items as any[]).filter(item => item.isSoldOut).length} sold out
                              </p>
                            </div>
                            <div className="p-4">
                              <div className="grid gap-3">
                                {(items as any[]).map((item: any, index: number) => (
                                  <div key={item.id || index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                                      <p className="text-sm text-gray-600">
                                        ${(item.price || 0).toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        item.isSoldOut 
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {item.isSoldOut ? 'Sold Out' : 'Available'}
                                      </span>
                                      <button
                                        onClick={() => handleItemToggle(item.dbId)}
                                        disabled={updatingItem === item.dbId}
                                        className={`px-3 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 ${
                                          updatingItem === item.dbId
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : item.isSoldOut 
                                            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                        } text-white`}
                                      >
                                        {updatingItem === item.dbId ? 'Updating...' : (item.isSoldOut ? 'Mark Available' : 'Mark Sold Out')}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {Object.keys(menuItems).length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <p>No menu items found. Try syncing the menu first.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
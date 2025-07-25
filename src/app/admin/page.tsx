'use client';

import { useState, useEffect } from 'react';
import { useOrderConfig } from '../../context/OrderConfigContext';
import { useMenu } from '../../context/MenuContext';

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
  const [activeTab, setActiveTab] = useState<'store' | 'menu' | 'categories' | 'preview'>('store');

  // Display categories state
  const [displayCategories, setDisplayCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', displayOrder: 0 });
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [updatingCategory, setUpdatingCategory] = useState<number | null>(null);
  const [showCategoryAssignment, setShowCategoryAssignment] = useState<number | null>(null);
  const [menuItemCategories, setMenuItemCategories] = useState<{[key: number]: any[]}>({});
  const [previewMenuItems, setPreviewMenuItems] = useState<{[key: string]: any[]}>({});
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingCategoryAssignment, setLoadingCategoryAssignment] = useState(false);

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

  const fetchDisplayCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/admin/display-categories');
      if (response.ok) {
        const data = await response.json();
        setDisplayCategories(data.displayCategories || []);
      }
    } catch (error) {
      console.error('Failed to fetch display categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    try {
      setUpdatingCategory(editingCategory?.id || -1);
      const url = editingCategory 
        ? `/api/admin/display-categories/${editingCategory.id}`
        : '/api/admin/display-categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        await fetchDisplayCategories();
        setShowCategoryForm(false);
        setCategoryForm({ name: '', description: '', displayOrder: 0 });
        setEditingCategory(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to save category');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    } catch (error) {
      setErrorMessage('Failed to save category. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setUpdatingCategory(null);
    }
  };

  const handleCategoryDelete = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setUpdatingCategory(categoryId);
      const response = await fetch(`/api/admin/display-categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDisplayCategories();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to delete category');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    } catch (error) {
      setErrorMessage('Failed to delete category. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setUpdatingCategory(null);
    }
  };

  const handleCategoryEdit = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder || 0,
    });
    setShowCategoryForm(true);
  };

  const handleCategoryToggle = async (categoryId: number) => {
    try {
      setUpdatingCategory(categoryId);
      const category = displayCategories.find(c => c.id === categoryId);
      if (!category) return;

      const response = await fetch(`/api/admin/display-categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: category.name,
          description: category.description,
          displayOrder: category.displayOrder,
          isActive: !category.isActive,
        }),
      });

      if (response.ok) {
        await fetchDisplayCategories();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to update category');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    } catch (error) {
      setErrorMessage('Failed to update category. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setUpdatingCategory(null);
    }
  };

  const fetchMenuItemCategories = async (menuItemId: number) => {
    try {
      setLoadingCategoryAssignment(true);
      const response = await fetch(`/api/admin/menu-items/${menuItemId}/display-categories`);
      if (response.ok) {
        const data = await response.json();
        setMenuItemCategories(prev => ({
          ...prev,
          [menuItemId]: data.assignedCategories || []
        }));
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch menu item categories:', error);
      setErrorMessage('Failed to load category assignments. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoadingCategoryAssignment(false);
    }
  };

  const fetchPreviewMenuItems = async () => {
    try {
      setLoadingPreview(true);
      const response = await fetch('/api/menu');
      if (response.ok) {
        const data = await response.json();
        setPreviewMenuItems(data.menuItems || {});
      }
    } catch (error) {
      console.error('Failed to fetch preview menu items:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCategoryAssignment = async (menuItemId: number, categoryId: number, action: 'add' | 'remove') => {
    try {
      const url = `/api/admin/menu-items/${menuItemId}/display-categories`;
      const method = action === 'add' ? 'POST' : 'DELETE';
      const body = action === 'add' ? JSON.stringify({ displayCategoryId: categoryId }) : undefined;
      const queryParam = action === 'remove' ? `?displayCategoryId=${categoryId}` : '';

      const response = await fetch(url + queryParam, {
        method,
        headers: action === 'add' ? { 'Content-Type': 'application/json' } : {},
        body,
      });

      if (response.ok) {
        await fetchMenuItemCategories(menuItemId);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to update category assignment');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    } catch (error) {
      setErrorMessage('Failed to update category assignment. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
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
      fetchDisplayCategories();
      if (activeTab === 'preview') {
        fetchPreviewMenuItems();
      }
    }
  }, [isAuthenticated, activeTab]);

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
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Display Categories
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Menu Preview
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
            ) : activeTab === 'menu' ? (
              <div className="space-y-8">
                {/* Menu Sync Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Menu Synchronization</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Sync menu items from Square to update the website.
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
                                      <h4 className="font-medium text-gray-800">
                                        {item.itemData?.name || item.name || 'Unnamed Item'}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        ${(item.itemData?.variations?.[0]?.itemVariationData?.priceMoney?.amount 
                                          ? (item.itemData.variations[0].itemVariationData.priceMoney.amount / 100).toFixed(2)
                                          : (item.price || 0).toFixed(2)
                                        )}
                                      </p>
                                      {item.displayCategories && item.displayCategories.length > 0 ? (
                                        <p className="text-xs text-blue-600 font-medium">
                                          Displayed as: {item.displayCategories.join(', ')}
                                        </p>
                                      ) : (
                                        <p className="text-xs text-gray-400 italic">
                                          Not displayed
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      {item.isSoldOut && (
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                          Sold Out
                                        </span>
                                      )}
                                      <button
                                        onClick={async () => {
                                          await fetchMenuItemCategories(item.dbId);
                                          setShowCategoryAssignment(item.dbId);
                                        }}
                                        disabled={loadingCategoryAssignment}
                                        className={`px-3 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 ${
                                          loadingCategoryAssignment
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                        } text-white`}
                                      >
                                        {loadingCategoryAssignment ? 'Loading...' : 'Categories'}
                                      </button>
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

                {/* Category Assignment Modal */}
                {showCategoryAssignment !== null && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Assign Display Categories
                      </h3>
                      <div className="space-y-4">
                        {loadingCategoryAssignment ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading category assignments...</span>
                          </div>
                        ) : (
                          <>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Categories</h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {displayCategories.filter(cat => cat.isActive).map((category) => {
                                  const isAssigned = menuItemCategories[showCategoryAssignment]?.some(
                                    assigned => assigned.id === category.id
                                  );
                                  return (
                                    <div key={category.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <span className="text-sm text-gray-700">{category.name}</span>
                                      <button
                                        onClick={() => handleCategoryAssignment(
                                          showCategoryAssignment,
                                          category.id,
                                          isAssigned ? 'remove' : 'add'
                                        )}
                                        className={`px-2 py-1 text-xs font-medium rounded ${
                                          isAssigned
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                      >
                                        {isAssigned ? 'Remove' : 'Add'}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Categories</h4>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {menuItemCategories[showCategoryAssignment]?.length > 0 ? (
                                  menuItemCategories[showCategoryAssignment].map((category) => (
                                    <div key={category.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                      <span className="text-sm text-gray-700">{category.name}</span>
                                      <span className="text-xs text-blue-600">Assigned</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 italic">No categories assigned</p>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => setShowCategoryAssignment(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'categories' ? (
              <div className="space-y-8">
                {/* Display Categories Management */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Display Categories</h2>
                        <p className="text-sm text-gray-600">
                          Create and manage categories for displaying menu items on the website.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowCategoryForm(true);
                          setEditingCategory(null);
                          setCategoryForm({ name: '', description: '', displayOrder: 0 });
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add Category
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {loadingCategories ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading categories...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {displayCategories.map((category) => (
                          <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{category.name}</h4>
                              {category.description && (
                                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Order: {category.displayOrder} | Status: {category.isActive ? 'Active' : 'Inactive'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                category.isActive 
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {category.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <button
                                onClick={() => handleCategoryToggle(category.id)}
                                disabled={updatingCategory === category.id}
                                className={`px-3 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 ${
                                  updatingCategory === category.id
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : category.isActive 
                                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                } text-white`}
                              >
                                {updatingCategory === category.id ? 'Updating...' : (category.isActive ? 'Deactivate' : 'Activate')}
                              </button>
                              <button
                                onClick={() => handleCategoryEdit(category)}
                                className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCategoryDelete(category.id)}
                                disabled={updatingCategory === category.id}
                                className={`px-3 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 ${
                                  updatingCategory === category.id
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                } text-white`}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {displayCategories.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <p>No display categories found. Create your first category to get started.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Form Modal */}
                {showCategoryForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                      </h3>
                      <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name
                          </label>
                          <input
                            type="text"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            required
                            maxLength={100}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                          </label>
                          <textarea
                            value={categoryForm.description}
                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Display Order
                          </label>
                          <input
                            type="number"
                            value={categoryForm.displayOrder}
                            onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            min="0"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCategoryForm(false);
                              setEditingCategory(null);
                              setCategoryForm({ name: '', description: '', displayOrder: 0 });
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!categoryForm.name.trim() || updatingCategory !== null}
                            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 ${
                              !categoryForm.name.trim() || updatingCategory !== null
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            } text-white`}
                          >
                            {updatingCategory !== null ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Menu Preview */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Menu Preview</h2>
                    <p className="text-sm text-gray-600">
                      This is how your menu currently appears to customers on the website.
                    </p>
                  </div>
                  
                  <div className="p-6">
                    {loadingPreview ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading menu preview...</span>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="space-y-6">
                          {Object.entries(previewMenuItems).map(([category, items]) => (
                            <div key={category} className="space-y-3">
                              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                {category}
                              </h3>
                              
                              <div className="space-y-2">
                                {(items as any[]).map((item, index) => (
                                  <div 
                                    key={index} 
                                    className={`flex justify-between items-center p-3 rounded border ${
                                      item.isSoldOut ? 'bg-gray-50 border-gray-300' : 'bg-gray-50'
                                    }`}
                                  >
                                    <div>
                                      <h4 className={`font-medium ${item.isSoldOut ? 'text-gray-600' : 'text-gray-900'}`}>
                                        {item.name || 'Unnamed Item'}
                                      </h4>
                                      {item.isSoldOut && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">
                                          Sold Out
                                        </p>
                                      )}
                                      {item.description && (
                                        <p className={`text-sm ${item.isSoldOut ? 'text-gray-500' : 'text-gray-600'}`}>
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <span className={`font-medium ${item.isSoldOut ? 'text-gray-600' : 'text-gray-900'}`}>
                                      ${(item.itemData?.variations?.[0]?.itemVariationData?.priceMoney?.amount 
                                        ? (item.itemData.variations[0].itemVariationData.priceMoney.amount / 100).toFixed(2)
                                        : '0.00'
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              
                              {(items as any[]).length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                  <p>No items in this category</p>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {Object.keys(previewMenuItems).length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                              <p>No display categories with items found. Create display categories and assign menu items to them.</p>
                            </div>
                          )}
                        </div>
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
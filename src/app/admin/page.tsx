'use client';

import { useState } from 'react';
import { useOrderConfig } from '../../context/OrderConfigContext';

export default function AdminPage() {
  const { ordersEnabled, disabledMessage, toggleOrders, setDisabledMessage } = useOrderConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tempMessage, setTempMessage] = useState(disabledMessage);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const ADMIN_PASSWORD = 'delica2024'; // In production, this should be environment variable

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setErrorMessage('Please enter a password');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
      setShowError(false);
      setErrorMessage('');
    } else {
      setErrorMessage('Incorrect password. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      setPassword('');
    }
  };

  const handleToggle = () => {
    try {
      toggleOrders();
      setShowSuccess(true);
      setShowError(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage('Failed to update order status. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleMessageUpdate = () => {
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
      
      setDisabledMessage(tempMessage);
      setShowSuccess(true);
      setShowError(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage('Failed to update message. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

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
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
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
                  className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 ${
                    ordersEnabled 
                      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {ordersEnabled ? 'Disable Orders' : 'Enable Orders'}
                </button>
              </div>
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
                  disabled={!tempMessage.trim() || tempMessage.length > 200}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                    !tempMessage.trim() || tempMessage.length > 200
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  } text-white`}
                >
                  Update Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
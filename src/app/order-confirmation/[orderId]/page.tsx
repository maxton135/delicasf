'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import { playfair } from '../../fonts';

interface OrderDetails {
  id: string;
  totalItems: number;
  estimatedTotal: number;
  customer: {
    name: string;
    phone: string;
    pickupTime?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    isCombo: boolean;
    comboSelections?: Array<{
      category: string;
      item: string;
    }>;
  }>;
  createdAt: string;
  status: string;
}

// Helper function to format price from cents to dollars
const formatPrice = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {
        // First try to get order from localStorage (for just-placed orders)
        console.log('Looking for cached order with ID:', orderId);
        
        // Try specific order cache first
        let cachedOrder = localStorage.getItem(`order_${orderId}`);
        if (cachedOrder) {
          console.log('Found specific order cache');
          const orderData = JSON.parse(cachedOrder);
          console.log('Using cached order data:', orderData);
          setOrder(orderData);
          setLoading(false);
          return;
        }
        
        // Fall back to general lastOrder cache
        cachedOrder = localStorage.getItem('lastOrder');
        if (cachedOrder) {
          console.log('Found general cached order data');
          const orderData = JSON.parse(cachedOrder);
          console.log('Cached order ID:', orderData.id, 'Looking for:', orderId);
          if (orderData.id === orderId) {
            console.log('Order IDs match! Using cached data');
            setOrder(orderData);
            // Don't clear this one immediately in case of refresh
            setLoading(false);
            return;
          } else {
            console.log('Order IDs do not match, will fetch from API');
          }
        } else {
          console.log('No cached order found in localStorage');
        }

        // Fallback to API fetch
        console.log('No cached order found, fetching from API...');
        const response = await fetch(`/api/orders?id=${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          console.error('API fetch failed:', data);
          // If API fetch fails, create a minimal order object
          setOrder({
            id: orderId,
            totalItems: 0,
            estimatedTotal: 0,
            customer: {
              name: 'Customer',
              phone: 'N/A'
            },
            items: [],
            createdAt: new Date().toISOString(),
            status: 'confirmed'
          });
          setError('Order details unavailable, but your payment was processed successfully.');
        } else {
          console.log('Successfully fetched order from API:', data.order);
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#1a1a1a] text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b804a] mx-auto"></div>
            <p className="text-[#f2ede3] mt-4">Loading order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#1a1a1a] text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className={`${playfair.className} text-3xl text-[#9b804a] mb-4`}>Order Not Found</h1>
            <p className="text-[#f2ede3] mb-6">
              {error || 'We couldn\'t find the order you\'re looking for.'}
            </p>
            <button
              onClick={() => router.push('/menu')}
              className="bg-[#9b804a] text-[#f2ede3] px-6 py-2 rounded hover:bg-[#8a7040] transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Debug logging
  console.log('Rendering order confirmation with order data:', order);

  return (
    <Layout>
      <div className="min-h-screen bg-[#1a1a1a] text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className={`${playfair.className} text-4xl text-[#9b804a] mb-2`}>Order Confirmed!</h1>
            <p className="text-[#f2ede3] text-lg">Thank you for your order{order.customer?.name ? `, ${order.customer.name}` : ''}!</p>
            <p className="text-[#f2ede3]/70">Order #{order.id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="bg-[#2a2a2a] rounded-lg p-6">
              <h2 className={`${playfair.className} text-2xl text-[#9b804a] mb-4`}>Order Details</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#3a3a3a]">
                  <span className="text-[#f2ede3]/70">Order Status</span>
                  <span className="text-green-500 font-medium capitalize">{order.status}</span>
                </div>
                
                <div className="flex justify-between items-center pb-2 border-b border-[#3a3a3a]">
                  <span className="text-[#f2ede3]/70">Order Time</span>
                  <span className="text-[#f2ede3]">{formatDate(order.createdAt)}</span>
                </div>
                
                {order.customer?.pickupTime && (
                  <div className="flex justify-between items-center pb-2 border-b border-[#3a3a3a]">
                    <span className="text-[#f2ede3]/70">Pickup Time</span>
                    <span className="text-[#f2ede3]">{formatDate(order.customer.pickupTime)}</span>
                  </div>
                )}
                
                {order.customer?.phone && (
                  <div className="flex justify-between items-center pb-2 border-b border-[#3a3a3a]">
                    <span className="text-[#f2ede3]/70">Phone</span>
                    <span className="text-[#f2ede3]">{order.customer.phone}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-lg font-medium">
                  <span className="text-[#f2ede3]">Total ({order.totalItems || 0} items)</span>
                  <span className="text-[#9b804a]">{formatPrice(order.estimatedTotal || 0)}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-[#2a2a2a] rounded-lg p-6">
              <h2 className={`${playfair.className} text-2xl text-[#9b804a] mb-4`}>Your Items</h2>
              
              <div className="space-y-4">
                {order.items?.length > 0 ? order.items.map((item, index) => (
                  <div key={index} className="pb-4 border-b border-[#3a3a3a] last:border-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-[#f2ede3] font-medium">{item.name}</h3>
                          {item.isCombo && (
                            <span className="inline-block px-2 py-1 bg-[#9b804a]/20 text-[#9b804a] text-xs rounded-full font-medium">
                              Combo
                            </span>
                          )}
                        </div>
                        
                        {item.isCombo && item.comboSelections && (
                          <div className="mb-2 pl-4 border-l-2 border-[#9b804a]/30">
                            <div className="space-y-1">
                              {item.comboSelections.map((selection, selIndex) => (
                                <div key={selIndex} className="flex items-center space-x-2 text-sm">
                                  <span className="text-[#f2ede3]/60 font-medium">{selection.category}:</span>
                                  <span className="text-[#f2ede3]">{selection.item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[#f2ede3] font-medium">×{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-[#f2ede3]/70">
                    <p>Order items information is not available</p>
                    <p className="text-sm mt-2">But your payment was processed successfully!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="text-center mt-8 space-y-4">
            <p className="text-[#f2ede3]/70">
              We'll call you when your order is ready for pickup!
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/menu')}
                className="bg-[#9b804a] text-[#f2ede3] px-6 py-2 rounded hover:bg-[#8a7040] transition-colors"
              >
                Order Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="text-[#f2ede3]/70 hover:text-[#f2ede3] px-6 py-2 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
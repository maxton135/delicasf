'use client';

import { useCart } from '../../../context/CartContext';
import { useCheckout } from '../../../context/CheckoutContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { playfair } from '../../fonts';
import PaymentForm from '../../../components/PaymentForm';

// Helper function to format price from cents to dollars
const formatPrice = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Helper function to get item price from variations
const getItemPrice = (item: any) => {
  const variation = item.itemData?.variations?.[0];
  return variation?.itemVariationData?.priceMoney?.amount || 0;
};

export default function CheckoutPaymentPage() {
  const { items, clearCart, totalItems } = useCart();
  const { 
    customerInfo,
    paymentInfo,
    goToPreviousStep, 
    isProcessing, 
    setIsProcessing, 
    error, 
    setError,
    resetCheckout
  } = useCheckout();
  const router = useRouter();

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => {
    if (item.isCombo && item.comboSelections) {
      return sum + Object.values(item.comboSelections).reduce((comboSum, selection) => {
        const price = getItemPrice(selection.itemData) || getItemPrice(selection);
        return comboSum + price;
      }, 0) * item.quantity;
    } else {
      const itemPrice = getItemPrice(item.itemData);
      return sum + (itemPrice * item.quantity);
    }
  }, 0);

  // Redirect to review if no items (they can see empty cart message there)
  useEffect(() => {
    if (totalItems === 0) {
      router.push('/checkout/review');
    }
  }, [totalItems, router]);

  // Redirect back if customer info is missing
  useEffect(() => {
    if (!customerInfo.name || !customerInfo.phone) {
      router.push('/checkout/information');
    }
  }, [customerInfo, router]);

  const handleBack = () => {
    goToPreviousStep();
    router.push('/checkout/information');
  };

  const handlePaymentSuccess = async (token: string, details: any) => {
    // Prevent multiple calls
    if (isProcessing) {
      console.log('Payment already being processed, ignoring duplicate call');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('Processing payment with token:', token.substring(0, 10) + '...');
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customer: customerInfo,
          payment: {
            token,
            details
          }
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process payment');
      }

      // Success - store order data
      if (data.order && data.order.id) {
        console.log('Storing order data in localStorage:', data.order);
        localStorage.setItem(`order_${data.order.id}`, JSON.stringify(data.order));
        localStorage.setItem('lastOrder', JSON.stringify(data.order)); // Keep both for compatibility
        
        // Clear cart and reset checkout
        clearCart();
        resetCheckout();
        
        // Navigate to confirmation page with a small delay to ensure state cleanup
        setTimeout(() => {
          console.log('Navigating to order confirmation:', data.order.id);
          router.push(`/order-confirmation/${data.order.id}`);
        }, 100);
      } else {
        throw new Error('Invalid order response from server');
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setIsProcessing(false); // Reset processing state on error
    }
    // Don't reset isProcessing on success - let the navigation handle it
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (totalItems === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#f2ede3] text-lg mb-4">Your cart is empty</p>
        <button
          onClick={() => router.push('/menu')}
          className="bg-[#9b804a] text-[#f2ede3] px-6 py-2 rounded hover:bg-[#8a7040] transition-colors"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#2a2a2a] rounded-lg p-6 relative">
            <h2 className={`${playfair.className} text-2xl text-[#9b804a] mb-6`}>
              Payment Information
            </h2>
            
            {/* Customer Summary */}
            <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#3a3a3a]">
              <h3 className="text-sm font-medium text-[#9b804a] mb-2">Order Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#f2ede3]/70">Customer:</span>
                  <span className="text-[#f2ede3]">{customerInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#f2ede3]/70">Phone:</span>
                  <span className="text-[#f2ede3]">{customerInfo.phone}</span>
                </div>
                {customerInfo.pickupTime && (
                  <div className="flex justify-between">
                    <span className="text-[#f2ede3]/70">Pickup:</span>
                    <span className="text-[#f2ede3]">
                      {new Date(customerInfo.pickupTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Form */}
            <div className={isProcessing ? 'pointer-events-none opacity-50' : ''}>
              <PaymentForm
                total={totalPrice}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                disabled={isProcessing}
              />
              
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#2a2a2a]/80 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b804a] mx-auto mb-4"></div>
                    <p className="text-[#f2ede3]">Processing your payment...</p>
                    <p className="text-[#f2ede3]/70 text-sm mt-2">Please do not refresh or navigate away</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#2a2a2a] rounded-lg p-6 sticky top-24">
            <h2 className={`${playfair.className} text-2xl text-[#9b804a] mb-4`}>
              Order Summary
            </h2>
            
            {/* Order Items */}
            <div className="space-y-2 mb-6">
              {items.map((item, index) => (
                <div key={`${item.itemData.itemData.name}-${index}`} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <div className="text-[#f2ede3]">
                      {item.itemData.itemData.name} × {item.quantity}
                    </div>
                    {item.isCombo && (
                      <div className="text-[#f2ede3]/50 text-xs">Combo</div>
                    )}
                  </div>
                  <div className="text-[#f2ede3]">
                    {formatPrice(getItemPrice(item.itemData) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="space-y-2 mb-6 pb-4 border-t border-[#3a3a3a] pt-4">
              <div className="flex justify-between text-[#f2ede3]">
                <span>Items ({totalItems})</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-[#f2ede3] font-medium text-lg">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={handleBack}
              disabled={isProcessing}
              className="w-full text-[#9b804a] border border-[#9b804a] py-3 rounded font-medium hover:bg-[#9b804a]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back to Information
            </button>

            {/* Security Notice */}
            <div className="mt-6 pt-4 border-t border-[#3a3a3a]">
              <div className="flex items-center space-x-2 text-xs text-[#f2ede3]/50">
                <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secured by Square • PCI DSS Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useCart } from '../../../context/CartContext';
import { useCheckout } from '../../../context/CheckoutContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { playfair } from '../../fonts';

// Helper function to format price from cents to dollars
const formatPrice = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Helper function to get item price from variations
const getItemPrice = (item: any) => {
  const variation = item.itemData?.variations?.[0];
  return variation?.itemVariationData?.priceMoney?.amount || 0;
};

// Helper function to format pickup time display
const formatPickupTimeDisplay = (pickupTime: string) => {
  if (!pickupTime) return 'As Soon As Possible';
  
  const now = new Date();
  const pickup = new Date(pickupTime);
  const diffMinutes = Math.round((pickup.getTime() - now.getTime()) / (1000 * 60));
  
  if (diffMinutes <= 30) {
    return 'As Soon As Possible';
  }
  
  return pickup.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function CheckoutInformationPage() {
  const { items, clearCart, totalItems } = useCart();
  const { 
    customerInfo, 
    updateCustomerInfo, 
    goToPreviousStep, 
    isProcessing, 
    setIsProcessing, 
    error, 
    setError,
    isStepValid,
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

  // Redirect to cart if no items
  useEffect(() => {
    if (totalItems === 0) {
      router.push('/cart');
    }
  }, [totalItems, router]);

  const handleBack = () => {
    goToPreviousStep();
    router.push('/checkout/review');
  };

  const handlePlaceOrder = async () => {
    if (!isStepValid(2)) {
      setError('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customer: customerInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Success - store order data and redirect to confirmation
      localStorage.setItem('lastOrder', JSON.stringify(data.order));
      
      // Clear cart and reset checkout
      clearCart();
      resetCheckout();
      
      // Navigate to confirmation page
      router.push(`/order-confirmation/${data.order.id}`);

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = customerInfo.name.trim().length >= 2 && 
                      customerInfo.phone.trim().length >= 10;

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
        {/* Customer Information Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#2a2a2a] rounded-lg p-6">
            <h2 className={`${playfair.className} text-2xl text-[#9b804a] mb-6`}>
              Contact Information
            </h2>
            
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#f2ede3] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => updateCustomerInfo({ name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded text-[#f2ede3] focus:outline-none focus:border-[#9b804a] transition-colors"
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#f2ede3] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => updateCustomerInfo({ phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded text-[#f2ede3] focus:outline-none focus:border-[#9b804a] transition-colors"
                  placeholder="(555) 123-4567"
                  required
                />
                <p className="text-xs text-[#f2ede3]/50 mt-1">
                  We'll call you when your order is ready for pickup
                </p>
              </div>

              {/* Pickup Time Field */}
              <div>
                <label htmlFor="pickupTime" className="block text-sm font-medium text-[#f2ede3] mb-1">
                  Preferred Pickup Time
                </label>
                <div className="space-y-2">
                  <div className="text-sm text-[#9b804a] font-medium">
                    Current: {formatPickupTimeDisplay(customerInfo.pickupTime)}
                  </div>
                  <input
                    type="datetime-local"
                    id="pickupTime"
                    value={customerInfo.pickupTime}
                    onChange={(e) => updateCustomerInfo({ pickupTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded text-[#f2ede3] focus:outline-none focus:border-[#9b804a] transition-colors"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-[#f2ede3]/50">
                    Leave as-is for pickup as soon as possible (typically 15-30 minutes)
                  </p>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-[#f2ede3] mb-1">
                  Special Instructions
                </label>
                <textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) => updateCustomerInfo({ notes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded text-[#f2ede3] focus:outline-none focus:border-[#9b804a] transition-colors resize-none"
                  rows={3}
                  placeholder="Any special requests, dietary restrictions, or delivery instructions..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Actions */}
        <div className="lg:col-span-1">
          <div className="bg-[#2a2a2a] rounded-lg p-6 sticky top-24">
            <h2 className={`${playfair.className} text-2xl text-[#9b804a] mb-4`}>
              Order Summary
            </h2>
            
            {/* Order Totals */}
            <div className="space-y-2 mb-6 pb-4 border-b border-[#3a3a3a]">
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

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handlePlaceOrder}
                disabled={!isFormValid || isProcessing}
                className={`w-full py-3 rounded font-medium transition-colors ${
                  isFormValid && !isProcessing
                    ? 'bg-[#9b804a] text-[#f2ede3] hover:bg-[#8a7040]'
                    : 'bg-[#3a3a3a] text-[#f2ede3]/50 cursor-not-allowed'
                }`}
              >
                {isProcessing ? 'Processing Order...' : 'Place Order'}
              </button>
              
              <button
                onClick={handleBack}
                disabled={isProcessing}
                className="w-full text-[#9b804a] border border-[#9b804a] py-3 rounded font-medium hover:bg-[#9b804a]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back to Review
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-4 border-t border-[#3a3a3a]">
              <p className="text-xs text-[#f2ede3]/50">
                * Required fields
              </p>
              <p className="text-xs text-[#f2ede3]/50 mt-2">
                By placing this order, you confirm that your contact information is accurate and you'll be available for pickup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
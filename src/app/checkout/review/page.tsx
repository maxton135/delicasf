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
  // item is now the full Square item object with id and itemData
  const variation = item.itemData?.variations?.[0];
  return variation?.itemVariationData?.priceMoney?.amount || 0;
};

export default function CheckoutReviewPage() {
  const { items, totalItems, removeFromCart } = useCart();
  const { goToNextStep } = useCheckout();
  const router = useRouter();

  // Debug logging
  console.log('Review page - items:', items);
  console.log('Review page - totalItems:', totalItems);

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => {
    if (item.isCombo && item.comboSelections) {
      // For combo items, sum up all selections
      return sum + Object.values(item.comboSelections).reduce((comboSum, selection) => {
        const price = getItemPrice(selection.itemData) || getItemPrice(selection);
        return comboSum + price;
      }, 0) * item.quantity;
    } else {
      const itemPrice = getItemPrice(item.itemData);
      return sum + (itemPrice * item.quantity);
    }
  }, 0);

  // Don't auto-redirect when cart becomes empty - let user stay on page
  // They can manually go back to menu if they want
  useEffect(() => {
    console.log('Cart has items:', totalItems);
  }, [totalItems]);

  const handleProceedToPayment = () => {
    if (totalItems === 0) {
      // Don't proceed if cart is empty
      return;
    }
    goToNextStep();
    router.push('/checkout/information');
  };

  const handleAddMoreItems = () => {
    router.push('/menu');
  };

  if (totalItems === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-[#2a2a2a] rounded-lg p-8 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-[#9b804a]/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <h2 className={`${playfair.className} text-2xl text-[#9b804a] mb-2`}>Your cart is empty</h2>
            <p className="text-[#f2ede3]/70">Add some delicious items to get started with your order</p>
          </div>
          <button
            onClick={() => router.push('/menu')}
            className="bg-[#9b804a] text-[#f2ede3] px-8 py-3 rounded-lg hover:bg-[#8a7040] transition-colors font-medium"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Review */}
        <div className="lg:col-span-2">
          <div className="bg-[#2a2a2a] rounded-lg p-6">
            <h2 className={`${playfair.className} text-2xl text-[#9b804a] mb-6`}>
              Review Your Order
            </h2>
            
            {items.map((item, index) => {
              const itemPrice = getItemPrice(item.itemData);
              return (
                <div key={`${item.itemData.itemData.name}-${index}`} className="py-4 border-b border-[#3a3a3a] last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`${playfair.className} text-xl text-[#f2ede3]`}>
                          {item.itemData.itemData.name}
                        </h3>
                        {item.isCombo && (
                          <span className="inline-block px-2 py-1 bg-[#9b804a]/20 text-[#9b804a] text-xs rounded-full font-medium">
                            Combo
                          </span>
                        )}
                      </div>
                      
                      {item.isCombo && item.comboSelections && (
                        <div className="mb-3 pl-4 border-l-2 border-[#9b804a]/30">
                          <h4 className="text-[#9b804a] text-sm font-medium mb-2">Your Selections:</h4>
                          <div className="space-y-1">
                            {Object.entries(item.comboSelections).map(([categoryName, selection]) => (
                              <div key={categoryName} className="flex items-center space-x-2 text-sm">
                                <span className="text-[#f2ede3]/60 font-medium">{categoryName}:</span>
                                <span className="text-[#f2ede3]">{selection.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-[#f2ede3]/70">Quantity: {item.quantity}</span>
                        <span className="text-[#9b804a] font-medium">{formatPrice(itemPrice)} each</span>
                        <span className="text-[#f2ede3] font-medium">
                          Total: {formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>
                      
                      {item.itemData.itemData.description && (
                        <p className="text-[#f2ede3]/50 text-sm mt-2">
                          {item.itemData.itemData.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Remove Button */}
                    <div className="ml-4">
                      <button
                        onClick={() => removeFromCart(index)}
                        className="flex items-center justify-center w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Navigation */}
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

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleProceedToPayment}
                disabled={totalItems === 0}
                className={`w-full py-3 rounded font-medium transition-colors ${
                  totalItems > 0
                    ? 'bg-[#9b804a] text-[#f2ede3] hover:bg-[#8a7040]'
                    : 'bg-[#3a3a3a] text-[#f2ede3]/50 cursor-not-allowed'
                }`}
              >
                Proceed to Payment
              </button>
              
              <button
                onClick={handleAddMoreItems}
                className="w-full text-[#9b804a] border border-[#9b804a] py-3 rounded font-medium hover:bg-[#9b804a]/10 transition-colors"
              >
                Add More Items
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-4 border-t border-[#3a3a3a]">
              <p className="text-xs text-[#f2ede3]/50 text-center">
                Review your order above, then proceed to enter your contact information and complete your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
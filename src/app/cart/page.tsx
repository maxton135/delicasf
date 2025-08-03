'use client';

import { useCart } from '../../context/CartContext';
import Layout from '../../components/Layout';
import { playfair } from '../fonts';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Helper function to format price from cents to dollars
const formatPrice = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Helper function to get item price from variations
const getItemPrice = (itemData: any) => {
  const variation = itemData.variations?.[0];
  return variation?.itemVariationData?.priceMoney?.amount || 0;
};

export default function CartPage() {
  const { items, removeItem, clearCart, totalItems } = useCart();
  const router = useRouter();

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => {
    const itemPrice = getItemPrice(item.itemData);
    return sum + (itemPrice * item.quantity);
  }, 0);

  if (totalItems === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#1a1a1a] text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className={`${playfair.className} text-3xl text-[#9b804a] mb-8`}>Your Cart</h1>
            <div className="text-center py-12">
              <p className="text-[#f2ede3] text-lg mb-4">Your cart is empty</p>
              <button
                onClick={() => router.push('/menu')}
                className="bg-[#9b804a] text-[#f2ede3] px-6 py-2 rounded hover:bg-[#8a7040] transition-colors"
              >
                Browse Menu
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#1a1a1a] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className={`${playfair.className} text-3xl text-[#9b804a] mb-8`}>Your Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-[#2a2a2a] rounded-lg p-6">
                {items.map((item) => {
                  const itemPrice = getItemPrice(item.itemData);
                  return (
                    <div key={item.itemData.name} className="py-4 border-b border-[#3a3a3a] last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`${playfair.className} text-xl text-[#f2ede3]`}>{item.itemData.name}</h3>
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
                          
                          {item.itemData.description && (
                            <p className="text-[#f2ede3]/50 text-sm mt-2">{item.itemData.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => console.log('Item details:', item.itemData)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeItem(item.itemData.name)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#2a2a2a] rounded-lg p-6 sticky top-24">
                <h2 className={`${playfair.className} text-2xl text-[#9b804a] mb-4`}>Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-[#f2ede3]">
                    <span>Items ({totalItems})</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="border-t border-[#3a3a3a] pt-4">
                    <div className="flex justify-between text-[#f2ede3] font-medium">
                      <span>Total</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                  <button
                    className="w-full bg-[#9b804a] text-[#f2ede3] py-3 rounded hover:bg-[#8a7040] transition-colors"
                    onClick={() => alert('Checkout functionality coming soon!')}
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    className="w-full text-[#f2ede3]/70 hover:text-[#f2ede3] py-2 transition-colors"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
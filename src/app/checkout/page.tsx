'use client';

import { useState } from 'react';
import Layout from '../../components/Layout';
import { playfair } from '../fonts';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CartItem {
  name: string;
  quantity: number;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { name: 'California Roll', quantity: 2 },
    { name: 'Miso Soup', quantity: 1 },
  ]); // This will be replaced with actual cart data later

  const removeItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    ));
  };

  return (
    <Layout>
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className={`${playfair.className} text-3xl text-[#9b804a] mb-12`}>Your Order</h1>

          {/* Cart Items */}
          <div className="bg-[#2a2a2a] rounded-lg p-6 mb-8">
            {cartItems.length === 0 ? (
              <p className="text-[#f2ede3] text-center py-8">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-4 border-b border-[#f2ede3]/10 last:border-0">
                    <div className="flex-1">
                      <h3 className={`${playfair.className} text-xl text-[#f2ede3]`}>{item.name}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#9b804a]/20 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-[#f2ede3] w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#9b804a]/20 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 rounded-full hover:bg-[#9b804a]/20 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5 text-[#9b804a]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-[#2a2a2a] rounded-lg p-6 mb-8">
            <h2 className={`${playfair.className} text-2xl text-[#9b804a] mb-4`}>Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-[#f2ede3]">
                <span>Subtotal</span>
                <span>$45.00</span>
              </div>
              <div className="flex justify-between text-[#f2ede3]">
                <span>Tax</span>
                <span>$4.50</span>
              </div>
              <div className="flex justify-between text-[#f2ede3] border-t border-[#f2ede3]/10 pt-2 mt-2">
                <span className="font-medium">Total</span>
                <span className="font-medium">$49.50</span>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            className="w-full bg-[#9b804a] text-[#f2ede3] py-4 rounded-lg hover:bg-[#9b804a]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cartItems.length === 0}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </Layout>
  );
} 
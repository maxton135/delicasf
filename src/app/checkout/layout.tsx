'use client';

import { CheckoutProvider } from '../../context/CheckoutContext';
import Layout from '../../components/Layout';
import CheckoutProgressIndicator from '../../components/CheckoutProgressIndicator';
import { playfair } from '../fonts';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CheckoutProvider>
      <Layout>
        <div className="min-h-screen bg-[#1a1a1a] text-white py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className={`${playfair.className} text-4xl text-[#9b804a] mb-2`}>
                Checkout
              </h1>
              <p className="text-[#f2ede3]/70">
                Complete your order in just a few simple steps
              </p>
            </div>

            {/* Progress Indicator */}
            <CheckoutProgressIndicator />

            {/* Main Content */}
            <div className="mt-8">
              {children}
            </div>
          </div>
        </div>
      </Layout>
    </CheckoutProvider>
  );
}
'use client';

import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import { useCheckout } from '../context/CheckoutContext';

interface PaymentFormProps {
  total: number;
  onPaymentSuccess: (token: string, details: any) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

export default function SquarePaymentForm({ total, onPaymentSuccess, onPaymentError, disabled = false }: PaymentFormProps) {
  const { updatePaymentInfo, setError } = useCheckout();

  const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || '';
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '';
  const environment = (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';

  const handlePaymentResult = (token: any, buyer: any, paymentMethod: 'card' | 'apple_pay' | 'google_pay') => {
    // Prevent processing if disabled
    if (disabled) {
      console.log('Payment form is disabled, ignoring payment result');
      return;
    }

    console.log('Payment token received:', token);
    console.log('Buyer details:', buyer);

    // Update payment info in checkout context
    updatePaymentInfo({
      token: token.token,
      method: paymentMethod,
      lastFourDigits: token.details?.card?.last4 || null,
      cardBrand: token.details?.card?.brand || null
    });

    // Call success callback
    onPaymentSuccess(token.token, {
      method: paymentMethod,
      buyer,
      details: token.details
    });
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    const errorMessage = error?.message || 'Payment failed. Please try again.';
    setError(errorMessage);
    onPaymentError(errorMessage);
  };

  if (!applicationId || !locationId) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-400 text-sm">
          Payment configuration error. Please check Square credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PaymentForm
        applicationId={applicationId}
        locationId={locationId}
        cardTokenizeResponseReceived={(token, buyer) => 
          handlePaymentResult(token, buyer, 'card')
        }
        createPaymentRequest={() => ({
          countryCode: 'US',
          currencyCode: 'USD',
          total: {
            amount: (total / 100).toFixed(2), // Convert cents to dollars
            label: 'Total',
            pending: false
          }
        })}
        overrideEnvironment={environment}
      >
        {/* Credit Card Form */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-[#f2ede3] mb-4">Pay with Card</h3>
          <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-4">
            <CreditCard
              render={(Button) => (
                <Button
                  style={{
                    backgroundColor: '#9b804a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f2ede3',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    padding: '12px 24px',
                    width: '100%',
                    marginTop: '16px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#8a7040';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#9b804a';
                  }}
                >
                  Pay ${(total / 100).toFixed(2)}
                </Button>
              )}
              onError={handlePaymentError}
            />
          </div>
        </div>

        {/* Digital Wallet Options - Available in production with proper domain setup */}
        <div className="mt-4 p-4 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg">
          <p className="text-[#f2ede3]/70 text-sm text-center">
            💳 Credit card payment is available above
          </p>
          <p className="text-[#f2ede3]/50 text-xs text-center mt-2">
            Apple Pay and Google Pay require HTTPS and domain registration for production use
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-[#3a3a3a]">
          <div className="flex items-center space-x-2 text-sm text-[#f2ede3]/70">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Your payment information is secure and encrypted by Square</span>
          </div>
        </div>
      </PaymentForm>
    </div>
  );
}
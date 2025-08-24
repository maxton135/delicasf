'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CustomerInfo {
  name: string;
  phone: string;
  pickupTime: string;
  notes: string;
}

interface PaymentInfo {
  token: string | null;
  method: 'card' | 'apple_pay' | 'google_pay' | null;
  lastFourDigits: string | null;
  cardBrand: string | null;
}

interface CheckoutContextType {
  // Current step tracking
  currentStep: number;
  setCurrentStep: (step: number) => void;
  
  // Customer information
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: CustomerInfo) => void;
  updateCustomerInfo: (updates: Partial<CustomerInfo>) => void;
  
  // Payment information
  paymentInfo: PaymentInfo;
  setPaymentInfo: (info: PaymentInfo) => void;
  updatePaymentInfo: (updates: Partial<PaymentInfo>) => void;
  
  // Checkout state
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  
  // Navigation helpers
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetCheckout: () => void;
  
  // Validation
  isStepValid: (step: number) => boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

const CHECKOUT_STORAGE_KEY = 'checkout_data';

// Helper function to get default pickup time (30 minutes from now)
const getDefaultPickupTime = (): string => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return now.toISOString().slice(0, 16); // Format for datetime-local input
};

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize customer info with default pickup time
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    pickupTime: getDefaultPickupTime(),
    notes: ''
  });

  // Initialize payment info
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    token: null,
    method: null,
    lastFourDigits: null,
    cardBrand: null
  });

  // Load saved checkout data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setCustomerInfo(data.customerInfo || customerInfo);
          setPaymentInfo(data.paymentInfo || paymentInfo);
          setCurrentStep(data.currentStep || 1);
        } catch (error) {
          console.warn('Failed to load saved checkout data:', error);
        }
      }
    }
  }, []);

  // Save checkout data whenever it changes (but don't save payment tokens for security)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dataToSave = {
        customerInfo,
        paymentInfo: {
          ...paymentInfo,
          token: null // Never save payment tokens to localStorage for security
        },
        currentStep,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [customerInfo, paymentInfo, currentStep]);

  const updateCustomerInfo = (updates: Partial<CustomerInfo>) => {
    setCustomerInfo(prev => ({ ...prev, ...updates }));
  };

  const updatePaymentInfo = (updates: Partial<PaymentInfo>) => {
    setPaymentInfo(prev => ({ ...prev, ...updates }));
  };

  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setError(null); // Clear any previous errors
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null); // Clear any previous errors
    }
  };

  const resetCheckout = () => {
    setCurrentStep(1);
    setCustomerInfo({
      name: '',
      phone: '',
      pickupTime: getDefaultPickupTime(),
      notes: ''
    });
    setPaymentInfo({
      token: null,
      method: null,
      lastFourDigits: null,
      cardBrand: null
    });
    setIsProcessing(false);
    setError(null);
    
    // Clear saved data
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CHECKOUT_STORAGE_KEY);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        // Step 1 (cart review) is always valid if there are items in cart
        // We'll check this in the component using useCart
        return true;
      
      case 2:
        // Step 2 requires name and phone
        return customerInfo.name.trim().length >= 2 && 
               customerInfo.phone.trim().length >= 10;
      
      case 3:
        // Step 3 requires valid payment token
        return paymentInfo.token !== null;
      
      case 4:
        // Step 4 (success) doesn't need validation
        return true;
      
      default:
        return false;
    }
  };

  return (
    <CheckoutContext.Provider value={{
      currentStep,
      setCurrentStep,
      customerInfo,
      setCustomerInfo,
      updateCustomerInfo,
      paymentInfo,
      setPaymentInfo,
      updatePaymentInfo,
      isProcessing,
      setIsProcessing,
      error,
      setError,
      goToNextStep,
      goToPreviousStep,
      resetCheckout,
      isStepValid
    }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
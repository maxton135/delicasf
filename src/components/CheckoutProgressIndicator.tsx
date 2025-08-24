'use client';

import { useCheckout } from '../context/CheckoutContext';

interface StepInfo {
  number: number;
  title: string;
  description: string;
}

const steps: StepInfo[] = [
  {
    number: 1,
    title: 'Review',
    description: 'Verify your order'
  },
  {
    number: 2,
    title: 'Information',
    description: 'Contact & pickup details'
  },
  {
    number: 3,
    title: 'Payment',
    description: 'Secure payment'
  },
  {
    number: 4,
    title: 'Complete',
    description: 'Order confirmation'
  }
];

export default function CheckoutProgressIndicator() {
  const { currentStep } = useCheckout();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-300
                  ${isCompleted 
                    ? 'bg-[#9b804a] text-[#f2ede3]' 
                    : isActive 
                    ? 'bg-[#9b804a] text-[#f2ede3] ring-4 ring-[#9b804a]/20' 
                    : 'bg-[#3a3a3a] text-[#f2ede3]/50'
                  }
                `}>
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-[#9b804a]' : isCompleted ? 'text-[#f2ede3]' : 'text-[#f2ede3]/50'
                  }`}>
                    {step.title}
                  </div>
                  <div className={`text-xs mt-1 transition-colors ${
                    isActive || isCompleted ? 'text-[#f2ede3]/70' : 'text-[#f2ede3]/30'
                  }`}>
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`w-24 h-0.5 mx-6 transition-colors ${
                  isCompleted ? 'bg-[#9b804a]' : 'bg-[#3a3a3a]'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
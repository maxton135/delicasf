'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CartPage() {
  const router = useRouter();

  // Redirect to checkout review page - /cart is now replaced by /checkout/review
  useEffect(() => {
    router.replace('/checkout/review');
  }, [router]);

  // Return null since this component just redirects
  return null;
} 
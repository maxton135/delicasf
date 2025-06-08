'use client';

import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartButton() {
  const { totalItems } = useCart();
  const [prevTotal, setPrevTotal] = useState(totalItems);
  const [shouldBounce, setShouldBounce] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (totalItems > prevTotal) {
      setShouldBounce(true);
      setTimeout(() => setShouldBounce(false), 500);
    }
    setPrevTotal(totalItems);
  }, [totalItems, prevTotal]);

  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={() => router.push('/cart')}
        className="fixed bottom-6 right-6 bg-[#9b804a] text-[#f2ede3] p-4 rounded-full shadow-lg hover:bg-[#8a7040] transition-colors z-50"
      >
        <motion.div
          className="relative"
          animate={shouldBounce ? {
            scale: [1, 1.2, 1],
            rotate: [0, -10, 10, 0]
          } : {}}
          transition={{ duration: 0.5 }}
        >
          <ShoppingBagIcon className="w-6 h-6" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {totalItems}
          </motion.div>
        </motion.div>
      </motion.button>
    </AnimatePresence>
  );
} 
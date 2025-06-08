'use client';

import { useState } from 'react';
import Layout from '../../components/Layout';
import { playfair } from '../fonts';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useMenu } from '../../context/MenuContext';

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#9b804a]/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#9b804a] rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="mt-4 text-[#f2ede3] text-lg">Loading our delicious menu...</p>
    </div>
  );
}

export default function Menu() {
  const { menuItems, loading, error } = useMenu();
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const handleAddToCart = (itemName: string) => {
    setToast({ show: true, message: 'Added to cart' });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Layout>
      <div className="py-16">
        {/* Category Navigation */}
        <div className="max-w-6xl mx-auto px-4 mb-16">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <h2 className={`${playfair.className} text-3xl text-[#9b804a]`}>Our Menu</h2>
            <div className="flex flex-wrap gap-4 md:gap-6">
              {Object.keys(menuItems).map((category) => (
                <button
                  key={category}
                  onClick={() => scrollToCategory(category.toLowerCase())}
                  className={`${playfair.className} text-2xl text-[#f2ede3] hover:text-[#9b804a] transition-colors`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="max-w-6xl mx-auto px-4 space-y-20">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center text-red-500 py-20">
              <p className="text-xl mb-2">Oops! Something went wrong</p>
              <p className="text-[#f2ede3]/70">{error}</p>
            </div>
          ) : (
            Object.entries(menuItems).map(([category, items]) => (
              <div key={category} id={category.toLowerCase()}>
                <div className="flex items-center mb-8">
                  <h2 className={`${playfair.className} text-3xl text-[#9b804a] pr-4`}>
                    {category}
                  </h2>
                  <div className="flex-grow h-px bg-[#f2ede3]/30"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {items.map((item, index) => (
                    <div key={index} className="text-left">
                      <div className="flex items-center gap-2">
                        <h3 className={`${playfair.className} text-xl text-[#f2ede3]`}>
                          {item.itemData.name}
                        </h3>
                        <button
                          onClick={() => handleAddToCart(item.itemData.name)}
                          className="p-1 rounded-full hover:bg-[#9b804a]/20 transition-colors"
                        >
                          <PlusIcon className="w-5 h-5 text-[#9b804a]" />
                        </button>
                      </div>
                      <p className="text-[#f2ede3]/70 text-sm mt-2">
                        {item.itemData.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-[#9b804a] text-[#f2ede3] px-4 py-2 rounded-lg shadow-lg">
          {toast.message}
        </div>
      )}
    </Layout>
  );
} 
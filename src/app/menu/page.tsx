'use client';

import { useState } from 'react';
import Layout from '../../components/Layout';
import { playfair } from '../fonts';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useMenu } from '../../context/MenuContext';
import { useCart } from '../../context/CartContext';
import { useOrderConfig } from '../../context/OrderConfigContext';

export default function Menu() {
  const { menuItems, loading, error } = useMenu();
  const { addItem } = useCart();
  const { ordersEnabled, disabledMessage } = useOrderConfig();
  const [clickedButtons, setClickedButtons] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleAddToCart = (itemData: any) => {
    addItem(itemData);
    const buttonId = itemData.name;
    setClickedButtons(prev => new Set(prev).add(buttonId));
    setTimeout(() => {
      setClickedButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(buttonId);
        return newSet;
      });
    }, 300);
  };

  const handleItemClick = (itemName: string) => {
    setSelectedItem(selectedItem === itemName ? null : itemName);
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
          
          {/* Orders Disabled Message */}
          {!ordersEnabled && (
            <div className="mt-8 bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-red-400 mb-2">Online Orders Currently Disabled</h3>
              <p className="text-[#f2ede3]">{disabledMessage}</p>
            </div>
          )}
        </div>

        {/* Menu Sections */}
        <div className="max-w-6xl mx-auto px-4 space-y-20">
          {loading ? (
            <div className="text-center text-[#f2ede3]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b804a] mx-auto mb-4"></div>
              Loading menu items...
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="text-red-500 mb-4">{error}</div>
              <div className="text-[#f2ede3] text-sm">Please refresh the page to try again.</div>
            </div>
          ) : Object.keys(menuItems).length === 0 ? (
            <div className="text-center text-[#f2ede3]">
              <div className="mb-4">No menu items found. The menu may be being updated.</div>
              <div className="text-sm">Please refresh the page to try again.</div>
            </div>
          ) : (
            Object.entries(menuItems).map(([category, items]) => {
              return (
                <div key={category} id={category.toLowerCase()}>
                  <div className="flex items-center mb-8">
                    <h2 className={`${playfair.className} text-3xl text-[#9b804a] pr-4`}>
                      {category}
                    </h2>
                    <div className="flex-grow h-px bg-[#f2ede3]/30"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {items.map((item, index) => {
                      const isClicked = clickedButtons.has(item.itemData.name);
                      const isSelected = selectedItem === item.itemData.name;
                      
                      return (
                        <div 
                          key={index} 
                          className={`
                            text-left p-4 rounded-lg transition-all duration-300
                            ${(item as any).isSoldOut 
                              ? 'bg-[#2a2a2a] border-2 border-[#4a4a4a] cursor-not-allowed' 
                              : isSelected 
                              ? 'bg-[#9b804a]/20 border-2 border-[#9b804a] shadow-lg cursor-pointer' 
                              : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] border-2 border-transparent cursor-pointer'
                            }
                          `}
                          onClick={() => !(item as any).isSoldOut && handleItemClick(item.itemData.name)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className={`${playfair.className} text-xl ${(item as any).isSoldOut ? 'text-[#f2ede3]/60' : 'text-[#f2ede3]'}`}>
                                {item.itemData.name}
                              </h3>
                              {(item as any).isSoldOut && (
                                <p className="text-red-400 text-xs mt-1 font-medium">
                                  Sold Out
                                </p>
                              )}
                            </div>
                            {isSelected && ordersEnabled && !(item as any).isSoldOut && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(item.itemData);
                                }}
                                className={`
                                  p-2 rounded-full border-2 border-[#9b804a] text-[#9b804a] 
                                  hover:bg-[#9b804a] hover:text-[#f2ede3] 
                                  transition-all duration-300 ease-in-out
                                  ${isClicked ? 'animate-bounce scale-110' : ''}
                                  focus:outline-none focus:ring-2 focus:ring-[#9b804a] focus:ring-opacity-50
                                `}
                              >
                                <PlusIcon className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          <p className={`text-sm mt-2 ${(item as any).isSoldOut ? 'text-[#f2ede3]/40' : 'text-[#f2ede3]/70'}`}>
                            {item.itemData.description}
                          </p>
                          
                          {isSelected && !(item as any).isSoldOut && (
                            <p className="text-[#9b804a] text-sm mt-2 font-medium">
                              {ordersEnabled 
                                ? 'Click the + button to add to cart' 
                                : 'Online ordering is currently disabled'
                              }
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
} 
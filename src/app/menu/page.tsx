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
  const [selectedComboTypes, setSelectedComboTypes] = useState<Record<string, string>>({});

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
    // Clear combo selections when deselecting an item
    if (selectedItem === itemName) {
      setSelectedComboTypes(prev => {
        const newSelections = { ...prev };
        delete newSelections[itemName];
        return newSelections;
      });
    }
  };

  const handleComboTypeSelect = (itemName: string, comboTypeName: string, comboTypeValue: string) => {
    setSelectedComboTypes(prev => ({
      ...prev,
      [itemName]: comboTypeValue
    }));
  };

  const getComboOptions = (itemData: any) => {
    const variation = itemData.variations?.[0]?.customAttributeValues;
    if (!variation) {
      return [];
    }
    const comboTypes = Object.values(variation);
    console.log("combotypes", comboTypes);
    return comboTypes;
  };

  const parseComboString = (comboString: string) => {
    // Split by '+' and format each part
    return comboString
      .split('+')
      .map(part => {
        // Find the first letter (category name starts with a letter)
        const match = part.match(/^(\d+)([A-Za-z]+)$/);
        if (match) {
          const [, number, category] = match;
          return `${number} ${category}`;
        }
        return part; // Return as-is if it doesn't match the expected format
      })
      .join(' + ');
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
            <div className="text-center text-[#f2ede3]">Loading menu items...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            Object.entries(menuItems).map(([category, items]) => {
              const isComboCategory = category === "Combos";
              
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
                      const comboOptions = isComboCategory ? getComboOptions(item.itemData) : [];
                      const selectedComboType = selectedComboTypes[item.itemData.name];
                      const hasSelectedComboType = selectedComboType && selectedComboType !== '';
                      
                      return (
                        <div 
                          key={index} 
                          className={`
                            text-left p-4 rounded-lg cursor-pointer transition-all duration-300
                            ${isSelected 
                              ? 'bg-[#9b804a]/20 border-2 border-[#9b804a] shadow-lg' 
                              : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] border-2 border-transparent'
                            }
                          `}
                          onClick={() => handleItemClick(item.itemData.name)}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className={`${playfair.className} text-xl text-[#f2ede3]`}>
                              {item.itemData.name}
                            </h3>
                            {isSelected && !isComboCategory && ordersEnabled && (
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
                            {isSelected && isComboCategory && hasSelectedComboType && ordersEnabled && (
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
                          <p className="text-[#f2ede3]/70 text-sm mt-2">
                            {item.itemData.description}
                          </p>
                          
                          {/* Combo Options Display */}
                          {isSelected && isComboCategory && (
                            <div className="mt-4 space-y-3">
                              <p className="text-[#9b804a] text-sm font-medium">
                                Choose your combo type:
                              </p>
                              <div className="space-y-2">
                                {comboOptions
                                  .filter((option: any) => option.name && option.name.includes('combo_type'))
                                  .map((option: any, optionIndex: number) => {
                                    const isSelected = selectedComboType === option.stringValue;
                                    return (
                                      <div 
                                        key={optionIndex} 
                                        className={`
                                          p-3 rounded border cursor-pointer transition-all duration-200
                                          ${isSelected 
                                            ? 'bg-[#9b804a]/30 border-[#9b804a] shadow-md' 
                                            : 'bg-[#1a1a1a] border-[#3a3a3a] hover:bg-[#2a2a2a] hover:border-[#9b804a]/50'
                                          }
                                        `}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleComboTypeSelect(item.itemData.name, option.name, option.stringValue);
                                        }}
                                      >
                                        <p className="text-[#f2ede3] font-medium text-sm">
                                          {parseComboString(option.stringValue)}
                                        </p>
                                        {isSelected && (
                                          <div className="mt-2 text-[#9b804a] text-xs font-medium">
                                            ✓ Selected
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                              {!hasSelectedComboType && (
                                <p className="text-[#f2ede3]/50 text-xs italic">
                                  Please select a combo type to add to cart
                                </p>
                              )}
                            </div>
                          )}
                          
                          {isSelected && !isComboCategory && (
                            <p className="text-[#9b804a] text-sm mt-2 font-medium">
                              {ordersEnabled ? 'Click the + button to add to cart' : 'Online ordering is currently disabled'}
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
'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { playfair } from '../app/fonts';

interface ComboItem {
  id: string;
  dbId: number;
  name: string;
  description?: string;
  itemData?: any;
}

interface ComboCategory {
  id: number;
  name: string;
  description?: string;
  isRequired: boolean;
  displayOrder: number;
  items: ComboItem[];
}

interface ComboSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: {
    name: string;
    description?: string;
    comboCategories: { [key: string]: ComboCategory };
  };
  onConfirm: (selections: { [categoryName: string]: ComboItem }) => void;
}

export default function ComboSelectionModal({ 
  isOpen, 
  onClose, 
  menuItem, 
  onConfirm 
}: ComboSelectionModalProps) {
  const [selections, setSelections] = useState<{ [categoryName: string]: ComboItem }>({});
  const [errors, setErrors] = useState<{ [categoryName: string]: string }>({});

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelections({});
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleItemSelect = (categoryName: string, item: ComboItem) => {
    setSelections(prev => ({
      ...prev,
      [categoryName]: item
    }));
    
    // Clear error for this category
    if (errors[categoryName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[categoryName];
        return newErrors;
      });
    }
  };

  const handleConfirm = () => {
    const newErrors: { [categoryName: string]: string } = {};
    
    // Check if all required categories have selections
    Object.entries(menuItem.comboCategories).forEach(([categoryName, category]) => {
      if (category.isRequired && !selections[categoryName]) {
        newErrors[categoryName] = `Please select a ${categoryName.toLowerCase()}`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm(selections);
  };

  const allRequiredSelected = Object.entries(menuItem.comboCategories)
    .filter(([_, category]) => category.isRequired)
    .every(([categoryName, _]) => selections[categoryName]);

  // Sort categories by display order
  const sortedCategories = Object.entries(menuItem.comboCategories)
    .sort(([, a], [, b]) => a.displayOrder - b.displayOrder);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border-2 border-[#9b804a]/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#9b804a]/30">
          <div>
            <h2 className={`${playfair.className} text-2xl text-[#f2ede3] mb-2`}>
              Customize Your {menuItem.name}
            </h2>
            <p className="text-[#f2ede3]/70 text-sm">
              Choose your selections for each category
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#9b804a]/20 transition-colors text-[#f2ede3]"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-8">
            {sortedCategories.map(([categoryName, category]) => (
              <div key={categoryName} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`${playfair.className} text-xl text-[#9b804a]`}>
                    {categoryName}
                    {category.isRequired && <span className="text-red-400 ml-1">*</span>}
                  </h3>
                  {category.description && (
                    <p className="text-[#f2ede3]/60 text-sm">{category.description}</p>
                  )}
                </div>

                {errors[categoryName] && (
                  <p className="text-red-400 text-sm">{errors[categoryName]}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item) => {
                    const isSelected = selections[categoryName]?.id === item.id;
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemSelect(categoryName, item)}
                        className={`
                          p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                          ${isSelected
                            ? 'bg-[#9b804a]/20 border-[#9b804a] shadow-lg'
                            : 'bg-[#2a2a2a] border-[#4a4a4a] hover:border-[#9b804a]/50 hover:bg-[#3a3a3a]'
                          }
                        `}
                      >
                        <h4 className={`${playfair.className} text-lg text-[#f2ede3] mb-1`}>
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="text-[#f2ede3]/70 text-sm">{item.description}</p>
                        )}
                        {item.itemData?.variations?.[0]?.itemVariationData?.priceMoney?.amount && (
                          <p className="text-[#9b804a] text-sm font-medium mt-2">
                            ${(item.itemData.variations[0].itemVariationData.priceMoney.amount / 100).toFixed(2)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {category.items.length === 0 && (
                  <p className="text-[#f2ede3]/60 text-center py-8 italic">
                    No items available in this category
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#9b804a]/30">
          <p className="text-[#f2ede3]/60 text-sm">
            {Object.keys(selections).length} of {Object.keys(menuItem.comboCategories).length} categories selected
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-[#9b804a]/50 text-[#f2ede3] rounded-md hover:bg-[#9b804a]/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!allRequiredSelected}
              className={`
                px-6 py-2 rounded-md font-medium transition-colors
                ${allRequiredSelected
                  ? 'bg-[#9b804a] text-[#f2ede3] hover:bg-[#9b804a]/80'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
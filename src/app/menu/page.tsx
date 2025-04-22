'use client';

import Layout from '../../components/Layout';
import { playfair } from '../fonts';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Menu categories
const categories = [
  { id: 'bento', name: 'Bento Boxes' },
  { id: 'sushi', name: 'Sushi & Sashimi' },
  { id: 'appetizers', name: 'Appetizers' },
  { id: 'sides', name: 'Sides' },
  { id: 'drinks', name: 'Drinks' },
];

// Sample menu items (we'll expand this later)
const menuItems = {
  bento: [
    { name: 'Chicken Teriyaki Bento', price: '$16.95', description: 'Grilled chicken with teriyaki sauce, rice, and assorted sides' },
    { name: 'Salmon Bento', price: '$18.95', description: 'Grilled salmon, rice, and assorted sides' },
    { name: 'Vegetable Bento', price: '$15.95', description: 'Seasonal vegetables, rice, and assorted sides' },
  ],
  sushi: [
    { name: 'California Roll', price: '$8.95', description: 'Crab, avocado, and cucumber' },
    { name: 'Spicy Tuna Roll', price: '$9.95', description: 'Fresh tuna with spicy sauce' },
    { name: 'Salmon Nigiri', price: '$7.95', description: 'Fresh salmon over pressed sushi rice' },
  ],
  appetizers: [
    { name: 'Edamame', price: '$5.95', description: 'Steamed soybeans with sea salt' },
    { name: 'Gyoza', price: '$7.95', description: 'Pan-fried dumplings with pork and vegetables' },
    { name: 'Miso Soup', price: '$4.95', description: 'Traditional Japanese soup with tofu and seaweed' },
  ],
  sides: [
    { name: 'Steamed Rice', price: '$3.95', description: 'Japanese short-grain rice' },
    { name: 'Seaweed Salad', price: '$5.95', description: 'Fresh seaweed with sesame dressing' },
    { name: 'Pickled Vegetables', price: '$4.95', description: 'Assorted Japanese pickles' },
  ],
  drinks: [
    { name: 'Green Tea', price: '$3.95', description: 'Hot or iced' },
    { name: 'Sake', price: '$8.95', description: 'House sake' },
    { name: 'Japanese Beer', price: '$6.95', description: 'Asahi or Sapporo' },
  ],
};

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('bento');
  const [direction, setDirection] = useState(0);

  const handleCategoryChange = (categoryId: string) => {
    const currentIndex = categories.findIndex(cat => cat.id === activeCategory);
    const newIndex = categories.findIndex(cat => cat.id === categoryId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveCategory(categoryId);
  };

  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const pageTransition = {
    type: "tween",
    duration: 0.5
  };

  return (
    <Layout>
      <div className="py-16">
        {/* Menu Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className={`${playfair.className} text-4xl md:text-5xl text-[#f2ede3] mb-4`}>Our Menu</h1>
          <p className="text-[#f2ede3] text-lg">Fresh, authentic Japanese cuisine</p>
        </motion.div>

        {/* Menu Book */}
        <div className="max-w-4xl mx-auto">
          {/* Menu Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg bg-[#132a1f] p-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-[#9b804a] text-[#f2ede3]'
                      : 'text-[#f2ede3] hover:bg-[#9b804a]/20'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Pages */}
          <div className="relative h-[600px] bg-[#f2ede3] rounded-lg shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[#132a1f] opacity-5"></div>
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={activeCategory}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
                className="absolute inset-0 p-8"
              >
                <div className="h-full flex flex-col">
                  <h2 className={`${playfair.className} text-3xl text-[#132a1f] mb-8 text-center`}>
                    {categories.find(cat => cat.id === activeCategory)?.name}
                  </h2>
                  <div className="grid gap-6 flex-grow">
                    {menuItems[activeCategory as keyof typeof menuItems].map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-white rounded-lg p-6 shadow-md"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`${playfair.className} text-xl text-[#132a1f]`}>{item.name}</h3>
                          <span className="text-[#9b804a] font-medium">{item.price}</span>
                        </div>
                        <p className="text-[#132a1f]/80">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
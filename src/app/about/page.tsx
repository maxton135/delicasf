'use client';

import Layout from '../../components/Layout';
import Image from 'next/image';
import { playfair, notoSerifJP } from '../fonts';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <Layout>
      <div className="py-16">
        {/* History Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-4 mb-16"
        >
          <div className="flex items-center mb-8">
            <h2 className={`${playfair.className} text-3xl text-[#9b804a] pr-4`}>
              Our Story
            </h2>
            <div className="flex-grow h-px bg-[#f2ede3]/30"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#f2ede3] mb-4">
                DELICA was founded in 2003 as part of the iconic Ferry Building Marketplace, bringing authentic Japanese cuisine to San Francisco's waterfront. Our name, derived from the Japanese word "delicious," reflects our commitment to serving high-quality, authentic Japanese food.
              </p>
              <p className="text-[#f2ede3]">
                What started as a small deli counter has grown into a beloved destination for locals and visitors alike, known for our fresh, seasonal ingredients and traditional Japanese cooking techniques.
              </p>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/images/delica_our_story.jpg"
                alt="DELICA storefront in Ferry Building"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </motion.div>

        {/* Philosophy Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-4 mb-16"
        >
          <div className="flex items-center mb-8">
            <h2 className={`${playfair.className} text-3xl text-[#9b804a] pr-4`}>
              Our Philosophy
            </h2>
            <div className="flex-grow h-px bg-[#f2ede3]/30"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className={`${playfair.className} text-xl text-[#f2ede3] mb-4`}>Quality Ingredients</h3>
              <p className="text-[#f2ede3]">
                We source the freshest, highest-quality ingredients, including premium seafood, organic produce, and authentic Japanese staples.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className={`${playfair.className} text-xl text-[#f2ede3] mb-4`}>Traditional Techniques</h3>
              <p className="text-[#f2ede3]">
                Our chefs use time-honored Japanese cooking methods to create authentic flavors while maintaining the highest standards of food preparation.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.9 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className={`${playfair.className} text-xl text-[#f2ede3] mb-4`}>Seasonal Menus</h3>
              <p className="text-[#f2ede3]">
                We celebrate the changing seasons by incorporating fresh, seasonal ingredients into our rotating menu of bento boxes, sushi, and prepared foods.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Location Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-6xl mx-auto px-4"
        >
          <div className="flex items-center mb-8">
            <h2 className={`${playfair.className} text-3xl text-[#9b804a] pr-4`}>
              In the Heart of the City
            </h2>
            <div className="flex-grow h-px bg-[#f2ede3]/30"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/images/ferry_building.jpg"
                alt="Ferry Building Marketplace"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-[#f2ede3] mb-4">
                Located in the historic Ferry Building Marketplace, DELICA offers a unique dining experience in one of San Francisco's most iconic landmarks. The Ferry Building's vibrant atmosphere and stunning bay views provide the perfect backdrop for enjoying our Japanese cuisine.
              </p>
              <p className="text-[#f2ede3]">
                Our central location makes us easily accessible to both locals and visitors, whether they're exploring the Ferry Building's farmers market, commuting via ferry, or simply enjoying the waterfront.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 
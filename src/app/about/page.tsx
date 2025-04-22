'use client';

import Layout from '../../components/Layout';
import Image from 'next/image';
import { playfair, notoSerifJP } from '../fonts';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <Layout>
      <div className="py-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className={`${playfair.className} text-4xl md:text-5xl text-[#f2ede3] mb-4`}>Our Story</h1>
          <p className="text-[#f2ede3] text-lg">Fresh, authentic Japanese cuisine</p>
        </motion.div>

        {/* History Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16"
        >
          <div>
            <h2 className={`${playfair.className} text-3xl text-[#f2ede3] mb-6`}>From Osaka to the Bay</h2>
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
        </motion.div>

        {/* Philosophy Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="bg-[#132a1f] rounded-lg p-8 mb-16"
        >
          <h2 className={`${playfair.className} text-3xl text-[#f2ede3] mb-6 text-center`}>Our Philosophy</h2>
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
          transition={{ duration: 1.2 }}
          viewport={{ once: true, amount: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
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
            <h2 className={`${playfair.className} text-3xl text-[#f2ede3] mb-6`}>In the Heart of the City</h2>
            <p className="text-[#f2ede3] mb-4">
              Located in the historic Ferry Building Marketplace, DELICA offers a unique dining experience in one of San Francisco's most iconic landmarks. The Ferry Building's vibrant atmosphere and stunning bay views provide the perfect backdrop for enjoying our Japanese cuisine.
            </p>
            <p className="text-[#f2ede3]">
              Our central location makes us easily accessible to both locals and visitors, whether they're exploring the Ferry Building's farmers market, commuting via ferry, or simply enjoying the waterfront.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 
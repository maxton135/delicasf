'use client';

import Layout from '../components/Layout';
import { playfair } from './fonts';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <Layout fullWidth>
      <div className="relative h-screen w-full overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/images/sushi_cutting.mp4" type="video/mp4" />
        </video>

        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-center"
          >
            <h2 className={`${playfair.className} text-subtitle text-[#f2ede3] mb-6`}>
              Fresh, flavorful Japanese comfort food.
            </h2>
            <h1 className={`${playfair.className} text-5xl md:text-6xl text-[#f2ede3] tracking-wider mb-8`}>
              Welcome to DELICA SF
            </h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.5 }}
            >
              <a
                href="/menu"
                className="inline-block bg-[#9b804a] text-[#f2ede3] py-3 px-8 rounded hover:bg-[#9b804a]/90 transition-colors"
              >
                Order Now
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
} 
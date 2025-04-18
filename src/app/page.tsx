import Layout from '../components/Layout';
import Image from 'next/image';
import { playfair } from './fonts';

export default function Home() {
  return (
    <Layout>
      <div className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className={`${playfair.className} text-2xl text-[#f2ede3]`}>
              Fresh, flavorful Japanese comfort food—right here in the heart of the Ferry Building.
            </h2>
            <h1 className={`${playfair.className} text-5xl md:text-6xl text-[#f2ede3]`}>
              Welcome to DELICA SF
            </h1>
            <p className="text-lg text-[#f2ede3]">
              Experience authentic Japanese cuisine with our carefully crafted bento boxes, 
              fresh sushi, and seasonal specialties. Every dish is prepared with the finest 
              ingredients and traditional techniques.
            </p>
            <div className="pt-4">
              <a
                href="/menu"
                className="inline-block border-2 border-[#9b804a] text-[#9b804a] py-3 px-8 rounded hover:bg-[#9b804a]/10 transition-colors"
              >
                View Our Menu
              </a>
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="relative h-[500px] rounded-lg overflow-hidden bg-[#132a1f] flex items-center justify-center">
            <div className="text-center p-8">
              <svg
                className="w-24 h-24 text-[#f2ede3] mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-[#f2ede3]">Image Placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
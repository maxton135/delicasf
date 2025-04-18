import Layout from '../../components/Layout';
import Image from 'next/image';
import { playfair } from '../fonts';

export default function About() {
  return (
    <Layout>
      <div className="py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className={`${playfair.className} text-4xl md:text-5xl text-[#f2ede3] mb-6`}>About DELICA</h1>
          <p className="text-xl text-[#f2ede3] max-w-3xl mx-auto">
            A Japanese culinary experience in the heart of San Francisco's Ferry Building
          </p>
        </div>

        {/* History Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className={`${playfair.className} text-3xl text-[#f2ede3] mb-6`}>Our Story</h2>
            <p className="text-[#f2ede3] mb-4">
              DELICA was founded in 2003 as part of the iconic Ferry Building Marketplace, bringing authentic Japanese cuisine to San Francisco's waterfront. Our name, derived from the Japanese word "delicious," reflects our commitment to serving high-quality, authentic Japanese food.
            </p>
            <p className="text-[#f2ede3]">
              What started as a small deli counter has grown into a beloved destination for locals and visitors alike, known for our fresh, seasonal ingredients and traditional Japanese cooking techniques.
            </p>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/images/about-history.jpg"
              alt="DELICA storefront in Ferry Building"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="bg-[#132a1f] rounded-lg p-8 mb-16">
          <h2 className={`${playfair.className} text-3xl text-[#f2ede3] mb-6 text-center`}>Our Philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className={`${playfair.className} text-xl text-[#f2ede3] mb-4`}>Quality Ingredients</h3>
              <p className="text-[#f2ede3]">
                We source the freshest, highest-quality ingredients, including premium seafood, organic produce, and authentic Japanese staples.
              </p>
            </div>
            <div className="text-center">
              <h3 className={`${playfair.className} text-xl text-[#f2ede3] mb-4`}>Traditional Techniques</h3>
              <p className="text-[#f2ede3]">
                Our chefs use time-honored Japanese cooking methods to create authentic flavors while maintaining the highest standards of food preparation.
              </p>
            </div>
            <div className="text-center">
              <h3 className={`${playfair.className} text-xl text-[#f2ede3] mb-4`}>Seasonal Menus</h3>
              <p className="text-[#f2ede3]">
                We celebrate the changing seasons by incorporating fresh, seasonal ingredients into our rotating menu of bento boxes, sushi, and prepared foods.
              </p>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/images/ferry-building.jpg"
              alt="Ferry Building Marketplace"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className={`${playfair.className} text-3xl text-[#f2ede3] mb-6`}>Our Location</h2>
            <p className="text-[#f2ede3] mb-4">
              Located in the historic Ferry Building Marketplace, DELICA offers a unique dining experience in one of San Francisco's most iconic landmarks. The Ferry Building's vibrant atmosphere and stunning bay views provide the perfect backdrop for enjoying our Japanese cuisine.
            </p>
            <p className="text-[#f2ede3]">
              Our central location makes us easily accessible to both locals and visitors, whether they're exploring the Ferry Building's farmers market, commuting via ferry, or simply enjoying the waterfront.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
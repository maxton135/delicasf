'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#132a1f] text-[#f2ede3]">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-24 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">DELICA</h3>
            <p>
              Japanese cuisine in the heart of San Francisco's Ferry Building
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p>
              Ferry Building Marketplace<br />
              1 Ferry Building, Shop #45<br />
              San Francisco, CA 94111
            </p>
            <p className="mt-2">
              Phone: (415) 834-0344
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Hours</h3>
            <p>
              Monday - Friday: 10am - 7pm<br />
              Saturday: 9am - 7pm<br />
              Sunday: 10am - 6pm
            </p>
          </div>
        </div>
        
        <div className="border-t border-[#f2ede3]/20 mt-8 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-sm">
              © {new Date().getFullYear()} DELICA. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="/privacy" className="hover:text-[#f2ede3]/80 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#f2ede3]/80 text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 
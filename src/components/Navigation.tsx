'use client';

import Link from 'next/link';
import { useState } from 'react';
import { playfair } from '../app/fonts';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#132a1f] pt-6">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-24">
        <div className="flex items-center justify-between h-20">
          {/* Left Navigation */}
          <div className="hidden md:flex items-center space-x-8 w-1/3">
            <Link href="/" className="text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors">
              Home
            </Link>
            <Link href="/menu" className="text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors">
              Menu
            </Link>
            <Link href="/about" className="text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors">
              Contact
            </Link>
          </div>

          {/* Center Logo */}
          <div className="flex-1 flex items-center justify-center">
            <Link href="/" className={`${playfair.className} text-2xl text-[#f2ede3]`}>
              DELICA
            </Link>
          </div>

          {/* Right Section - Order Online Button and Icons */}
          <div className="hidden md:flex items-center justify-end w-1/3 space-x-4">
            <button
              className="border-2 border-[#9b804a] text-[#9b804a] py-2 px-6 rounded hover:bg-[#9b804a]/10 transition-colors"
            >
              Order Online
            </button>
            <button className="text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </button>
            <button className="text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#f2ede3] hover:text-[#f2ede3]/80"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#132a1f]">
          <div className="px-8 sm:px-12 lg:px-24 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/menu"
              className="block px-3 py-2 text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors"
            >
              Menu
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors"
            >
              Contact
            </Link>
            <button
              className="w-full mt-4 border-2 border-[#9b804a] text-[#9b804a] py-2 px-6 rounded hover:bg-[#9b804a]/10 transition-colors"
            >
              Order Online
            </button>
            <div className="flex justify-center space-x-4 mt-4">
              <button className="text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
              <button className="text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 
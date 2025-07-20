'use client';

import Link from 'next/link';
import { useState } from 'react';
import { playfair } from '../app/fonts';
import { usePathname } from 'next/navigation';
import { useOrderConfig } from '../context/OrderConfigContext';
import { useCart } from '../context/CartContext';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { ordersEnabled, disabledMessage } = useOrderConfig();
  const { totalItems } = useCart();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#132a1f] shadow-md">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-24">
        <div className="flex items-center justify-between h-24">
          {/* Left Navigation */}
          <div className="hidden md:flex items-center space-x-8 w-1/3">
            <Link 
              href="/" 
              className={`text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors ${isActive('/') ? 'border-b-2 border-[#9b804a]' : ''}`}
            >
              Home
            </Link>
            <Link 
              href="/menu" 
              className={`text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors ${isActive('/menu') ? 'border-b-2 border-[#9b804a]' : ''}`}
            >
              Menu
            </Link>
            <Link 
              href="/about" 
              className={`text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors ${isActive('/about') ? 'border-b-2 border-[#9b804a]' : ''}`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors ${isActive('/contact') ? 'border-b-2 border-[#9b804a]' : ''}`}
            >
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
            {ordersEnabled ? (
              <Link
                href="/menu"
                className="border-2 border-[#9b804a] text-[#9b804a] py-2 px-6 rounded hover:bg-[#9b804a]/10 transition-colors"
              >
                Order Now
              </Link>
            ) : (
              <div className="text-[#f2ede3] text-sm text-center">
                <div className="text-red-400 font-medium">Orders Disabled</div>
                <div className="text-xs mt-1 max-w-48">{disabledMessage}</div>
              </div>
            )}
            <Link href="/cart" className="relative text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
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
              className={`block px-3 py-2 text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors ${isActive('/') ? 'border-b-2 border-[#9b804a]' : ''}`}
            >
              Home
            </Link>
            <Link
              href="/menu"
              className={`block px-3 py-2 text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors ${isActive('/menu') ? 'border-b-2 border-[#9b804a]' : ''}`}
            >
              Menu
            </Link>
            <Link
              href="/about"
              className={`block px-3 py-2 text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors ${isActive('/about') ? 'border-b-2 border-[#9b804a]' : ''}`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`block px-3 py-2 text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors ${isActive('/contact') ? 'border-b-2 border-[#9b804a]' : ''}`}
            >
              Contact
            </Link>
            {ordersEnabled ? (
              <Link
                href="/menu"
                className="w-full mt-4 border-2 border-[#9b804a] text-[#9b804a] py-2 px-6 rounded hover:bg-[#9b804a]/10 transition-colors text-center block"
              >
                Order Now
              </Link>
            ) : (
              <div className="w-full mt-4 text-center">
                <div className="text-red-400 font-medium">Orders Disabled</div>
                <div className="text-[#f2ede3] text-sm mt-2 px-4">{disabledMessage}</div>
              </div>
            )}
            <div className="flex justify-center space-x-4 mt-4">
              <Link href="/cart" className="relative text-[#f2ede3] hover:text-[#f2ede3]/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 
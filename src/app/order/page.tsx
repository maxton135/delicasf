'use client';

import Layout from '../../components/Layout';
import { playfair } from '../fonts';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Order() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/square');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Authentication failed');
      }

      setSuccess(true);
      console.log('Authentication successful:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Authentication error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`${playfair.className} text-4xl md:text-5xl text-[#f2ede3] mb-8`}>Order Online</h1>
          
          <button
            onClick={handleAuth}
            disabled={loading}
            className={`bg-[#9b804a] text-[#f2ede3] py-3 px-8 rounded-lg text-lg font-medium transition-colors
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#9b804a]/90'}`}
          >
            {loading ? 'Authenticating...' : 'Authenticate with Square'}
          </button>

          {error && (
            <div className="mt-4 text-red-500">
              <p>Error: {error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 text-green-500">
              <p>Authentication successful!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 
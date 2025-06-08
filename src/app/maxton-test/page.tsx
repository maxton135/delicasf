'use client';

import { useState } from 'react';
import Layout from '../../components/Layout';
import { playfair } from '../fonts';

export default function MaxtonTest() {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/square/catalog', {
        method: 'GET',
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className={`${playfair.className} text-4xl md:text-5xl text-[#f2ede3] mb-8 text-center`}>
            API Test Page
          </h1>
          
          <div className="flex justify-center mb-8">
            <button
              onClick={handleTestAPI}
              disabled={loading}
              className="px-6 py-3 bg-[#9b804a] text-[#f2ede3] rounded-lg hover:bg-[#9b804a]/80 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Test API'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {response && (
            <div className="bg-[#132a1f] rounded-lg p-6">
              <h2 className={`${playfair.className} text-2xl text-[#f2ede3] mb-4`}>Response:</h2>
              <pre className="text-[#f2ede3] overflow-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 
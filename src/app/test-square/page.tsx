'use client';

import { useState } from 'react';
import Layout from '../../components/Layout';

export default function TestSquare() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Test Page: Starting fetch...');
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('Test Page: Calling /api/square/catalog endpoint...');
      const response = await fetch('/api/square/catalog');
      console.log('Test Page: Response received:', response.status);
      
      const data = await response.json();
      console.log('Test Page: Data parsed:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch catalog');
      }

      setResults(data);
    } catch (err) {
      console.error('Test Page: Error caught:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl text-[#f2ede3] mb-8">Square API Test</h1>
          
          <form onSubmit={handleSubmit} className="mb-8">
            <button
              type="submit"
              disabled={loading}
              className={`bg-[#9b804a] text-[#f2ede3] py-2 px-6 rounded hover:bg-[#9b804a]/90 transition-colors
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Loading...' : 'Fetch Catalog'}
            </button>
          </form>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded text-red-500">
              {error}
            </div>
          )}

          {results && (
            <div className="bg-[#1a1a1a] border border-[#9b804a]/30 rounded p-6">
              <h2 className="text-xl text-[#f2ede3] mb-4">Results</h2>
              <pre className="text-[#f2ede3] overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 
/**
 * Stats Page - View detailed stats for a specific link
 */

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatDate, formatRelativeTime } from '@/utils/time';
import CopyButton from '@/components/CopyButton';

interface LinkData {
  id: string;
  code: string;
  target_url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
}

export default function StatsPage() {
  const router = useRouter();
  const { code } = router.query;
  const [link, setLink] = useState<LinkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || typeof code !== 'string') return;

    const fetchLink = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/links/${code}`);

        if (response.status === 404) {
          setError('Link not found');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setLink(data);
        } else {
          setError('Failed to load link stats');
        }
      } catch (err) {
        console.error('Error fetching link:', err);
        setError('An error occurred while fetching link stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLink();
  }, [code]);

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading... - LinkProject</title>
        </Head>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow flex items-center justify-center">
            <p className="text-gray-500">Loading stats...</p>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (error || !link) {
    return (
      <>
        <Head>
          <title>Not Found - LinkProject</title>
        </Head>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h1 className="text-2xl font-bold text-red-800 mb-2">Link Not Found</h1>
              <p className="text-red-700 mb-4">{error || 'This shortened link does not exist.'}</p>
              <Link href="/" className="text-blue-600 hover:underline">
                ← Back to Dashboard
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${link.code}`;

  return (
    <>
      <Head>
        <title>Stats for {link.code} - LinkProject</title>
        <meta name="description" content={`View statistics for shortened link ${link.code}`} />
      </Head>

      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full">
          <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
            ← Back to Dashboard
          </Link>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-6">Link Statistics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={link.code}
                      readOnly
                      className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 font-mono"
                    />
                    <CopyButton text={link.code} label="Copy" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shortUrl}
                      readOnly
                      className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 text-sm"
                    />
                    <CopyButton text={shortUrl} label="Copy" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target URL
                  </label>
                  <input
                    type="text"
                    value={link.target_url}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-sm break-all"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <p className="text-gray-700 text-sm font-medium mb-1">Total Clicks</p>
                  <p className="text-4xl font-bold text-blue-600">{link.clicks}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Created</label>
                  <p className="text-gray-600">{formatDate(new Date(link.created_at))}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Clicked
                  </label>
                  <p className="text-gray-600">
                    {link.last_clicked ? formatRelativeTime(new Date(link.last_clicked)) : 'Never'}
                  </p>
                  {link.last_clicked && (
                    <p className="text-gray-500 text-sm mt-1">
                      {formatDate(new Date(link.last_clicked))}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sparkline Placeholder */}
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-lg font-semibold mb-4">Activity Chart</h2>
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                <p className="text-sm">Click tracking visualization placeholder</p>
                <p className="text-xs mt-2">
                  (Daily click breakdown can be implemented with click history table)
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

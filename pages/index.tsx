/**
 * Dashboard Page - Main URL Shortener Interface
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LinkForm from '@/components/LinkForm';
import LinkTable from '@/components/LinkTable';

interface Link {
  id: string;
  code: string;
  target_url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <>
      <Head>
        <title>LinkProject - URL Shortener</title>
        <meta name="description" content="Fast and simple URL shortener with link analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
          <LinkForm onLinkCreated={fetchLinks} />

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading links...</p>
            </div>
          ) : (
            <LinkTable links={links} onDelete={fetchLinks} />
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}

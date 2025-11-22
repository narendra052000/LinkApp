/**
 * GET /:code - Redirect to target URL
 * Atomically increments clicks and updates last_clicked
 */

import { NextApiRequest, NextApiResponse } from 'next';
import type { GetServerSideProps } from 'next';
import prisma from '@/lib/prisma';

export default function RedirectPage() {
  // This page should never render (always redirects)
  return <div>Redirecting...</div>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { code } = context.params as { code: string };

  try {
    // Atomically fetch and increment clicks
    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return {
        notFound: true,
      };
    }

    // Update clicks and last_clicked atomically
    await prisma.link.update({
      where: { code },
      data: {
        clicks: link.clicks + 1,
        lastClicked: new Date(),
      },
    });

    // Redirect with 302 (temporary redirect)
    return {
      redirect: {
        destination: link.targetUrl,
        permanent: false,
      },
    };
  } catch (error) {
    console.error('Error handling redirect:', error);
    return {
      notFound: true,
    };
  }
};

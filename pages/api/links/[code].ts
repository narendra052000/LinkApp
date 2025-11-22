/**
 * GET /api/links/:code - Get stats for a specific link
 * DELETE /api/links/:code - Delete a link
 */

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export interface LinkResponse {
  id: string;
  code: string;
  target_url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid code parameter' });
  }

  if (req.method === 'GET') {
    return handleGetLink(code, res);
  }
  if (req.method === 'DELETE') {
    return handleDeleteLink(code, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetLink(code: string, res: NextApiResponse<LinkResponse | { error: string }>) {
  try {
    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    return res.status(200).json({
      id: link.id,
      code: link.code,
      target_url: link.targetUrl,
      clicks: link.clicks,
      last_clicked: link.lastClicked ? link.lastClicked.toISOString() : null,
      created_at: link.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching link:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDeleteLink(code: string, res: NextApiResponse) {
  try {
    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    await prisma.link.delete({
      where: { code },
    });

    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting link:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

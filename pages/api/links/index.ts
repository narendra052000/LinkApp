/**
 * POST /api/links - Create a new shortened link
 * GET /api/links - List all links
 */

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { isValidUrl, isValidCode, generateRandomCode } from '@/utils/validation';
import { ApiError } from '@/utils/api';

export interface LinkResponse {
  id: string;
  code: string;
  target_url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return handlePostLink(req, res);
  }
  if (req.method === 'GET') {
    return handleGetLinks(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handlePostLink(
  req: NextApiRequest,
  res: NextApiResponse<LinkResponse | { error: string }>
) {
  try {
    const { target_url, code } = req.body;

    // Validate target_url is provided
    if (!target_url || typeof target_url !== 'string') {
      return res.status(400).json({ error: 'target_url is required' });
    }

    // Validate URL format (must have http or https)
    if (!isValidUrl(target_url)) {
      return res.status(400).json({
        error: 'target_url must be a valid URL with http:// or https://',
      });
    }

    // Validate custom code if provided
    let finalCode = code;
    if (code) {
      if (!isValidCode(code)) {
        return res.status(400).json({
          error: 'code must be 6-8 alphanumeric characters (a-z, A-Z, 0-9)',
        });
      }

      // Check if code already exists
      const existing = await prisma.link.findUnique({
        where: { code },
      });

      if (existing) {
        return res.status(409).json({ error: 'code_exists' });
      }
    } else {
      // Generate a random code if not provided
      finalCode = generateRandomCode();

      // Retry if collision (unlikely but possible)
      let retries = 5;
      while (retries > 0) {
        const existing = await prisma.link.findUnique({
          where: { code: finalCode },
        });
        if (!existing) break;
        finalCode = generateRandomCode();
        retries--;
      }

      if (retries === 0) {
        return res.status(500).json({ error: 'Failed to generate unique code' });
      }
    }

    // Create the link
    const link = await prisma.link.create({
      data: {
        code: finalCode,
        targetUrl: target_url,
      },
    });

    return res.status(201).json({
      id: link.id,
      code: link.code,
      target_url: link.targetUrl,
      clicks: link.clicks,
      last_clicked: link.lastClicked ? link.lastClicked.toISOString() : null,
      created_at: link.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating link:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetLinks(req: NextApiRequest, res: NextApiResponse<LinkResponse[]>) {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const response: LinkResponse[] = links.map((link) => ({
      id: link.id,
      code: link.code,
      target_url: link.targetUrl,
      clicks: link.clicks,
      last_clicked: link.lastClicked ? link.lastClicked.toISOString() : null,
      created_at: link.createdAt.toISOString(),
    }));

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching links:', error);
    return res.status(500).json([]);
  }
}

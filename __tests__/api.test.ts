/**
 * API Tests using Supertest
 */

import request from 'supertest';
import prisma from '@/lib/prisma';

const API_BASE = 'http://localhost:3000';

describe('API Endpoints', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await prisma.link.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/links', () => {
    it('should create a link with target_url and auto-generated code', async () => {
      const response = await request(API_BASE)
        .post('/api/links')
        .send({ target_url: 'https://example.com' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('target_url', 'https://example.com');
      expect(response.body).toHaveProperty('clicks', 0);
      expect(response.body).toHaveProperty('id');
      expect(response.body.code).toMatch(/^[A-Za-z0-9]{6,8}$/);
    });

    it('should create a link with custom code', async () => {
      const response = await request(API_BASE).post('/api/links').send({
        target_url: 'https://github.com',
        code: 'GITHUB',
      });

      expect(response.status).toBe(201);
      expect(response.body.code).toBe('GITHUB');
      expect(response.body.target_url).toBe('https://github.com');
    });

    it('should reject duplicate code with 409', async () => {
      // Create first link
      await request(API_BASE).post('/api/links').send({
        target_url: 'https://example.com',
        code: 'unique123',
      });

      // Try to create second link with same code
      const response = await request(API_BASE).post('/api/links').send({
        target_url: 'https://different.com',
        code: 'unique123',
      });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: 'code_exists' });
    });

    it('should reject invalid URL format', async () => {
      const response = await request(API_BASE)
        .post('/api/links')
        .send({ target_url: 'not-a-valid-url' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('must be a valid URL');
    });

    it('should reject URL without http/https', async () => {
      const response = await request(API_BASE)
        .post('/api/links')
        .send({ target_url: 'ftp://example.com' });

      expect(response.status).toBe(400);
    });

    it('should reject invalid code format', async () => {
      const response = await request(API_BASE).post('/api/links').send({
        target_url: 'https://example.com',
        code: 'toolong123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('6-8 alphanumeric');
    });

    it('should reject missing target_url', async () => {
      const response = await request(API_BASE).post('/api/links').send({ code: 'test' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/links', () => {
    it('should return all links', async () => {
      // Create a test link
      await request(API_BASE).post('/api/links').send({
        target_url: 'https://test.com',
        code: 'testlink',
      });

      const response = await request(API_BASE).get('/api/links');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('code');
      expect(response.body[0]).toHaveProperty('target_url');
      expect(response.body[0]).toHaveProperty('clicks');
    });
  });

  describe('GET /api/links/:code', () => {
    it('should return stats for a specific link', async () => {
      // Create a link
      const createResponse = await request(API_BASE).post('/api/links').send({
        target_url: 'https://stats-test.com',
        code: 'statscode',
      });

      const statsResponse = await request(API_BASE).get('/api/links/statscode');

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.code).toBe('statscode');
      expect(statsResponse.body.target_url).toBe('https://stats-test.com');
      expect(statsResponse.body.clicks).toBe(0);
    });

    it('should return 404 for non-existent code', async () => {
      const response = await request(API_BASE).get('/api/links/nonexistent999');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('DELETE /api/links/:code', () => {
    it('should delete a link and return 204', async () => {
      // Create a link
      await request(API_BASE).post('/api/links').send({
        target_url: 'https://delete-me.com',
        code: 'deleteme',
      });

      // Delete it
      const response = await request(API_BASE).delete('/api/links/deleteme');

      expect(response.status).toBe(204);

      // Verify it's gone
      const getResponse = await request(API_BASE).get('/api/links/deleteme');
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent link', async () => {
      const response = await request(API_BASE).delete('/api/links/nonexistent222');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /:code (Redirect)', () => {
    it('should redirect and increment clicks', async () => {
      // Create a link
      const createResponse = await request(API_BASE).post('/api/links').send({
        target_url: 'https://redirect-test.com',
        code: 'redirect1',
      });

      // First redirect
      const redirectResponse = await request(API_BASE).get('/redirect1');

      expect(redirectResponse.status).toBe(302);
      expect(redirectResponse.header.location).toBe('https://redirect-test.com');

      // Verify clicks incremented
      const statsResponse = await request(API_BASE).get('/api/links/redirect1');
      expect(statsResponse.body.clicks).toBe(1);
      expect(statsResponse.body.last_clicked).toBeDefined();
    });

    it('should return 404 for non-existent code', async () => {
      const response = await request(API_BASE).get('/nonexistent888');

      expect(response.status).toBe(404);
    });

    it('should return 404 for deleted code', async () => {
      // Create and delete
      await request(API_BASE).post('/api/links').send({
        target_url: 'https://deleted.com',
        code: 'deleted1',
      });

      await request(API_BASE).delete('/api/links/deleted1');

      // Try to access
      const response = await request(API_BASE).get('/deleted1');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /healthz', () => {
    it('should return 200 with ok and version', async () => {
      const response = await request(API_BASE).get('/healthz');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ok: true,
        version: '1.0',
      });
    });
  });
});

/**
 * Utility Tests
 */

import { isValidUrl, isValidCode, generateRandomCode, truncateUrl } from '@/utils/validation';
import { formatRelativeTime, formatDate } from '@/utils/time';

describe('URL Validation', () => {
  it('should validate HTTPS URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('https://example.com/path')).toBe(true);
  });

  it('should validate HTTP URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('http://example.com:8080/path')).toBe(true);
  });

  it('should reject URLs without protocol', () => {
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('www.example.com')).toBe(false);
  });

  it('should reject invalid protocols', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('file:///path')).toBe(false);
  });

  it('should reject malformed URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
});

describe('Code Validation', () => {
  it('should validate 6-8 character alphanumeric codes', () => {
    expect(isValidCode('ABC123')).toBe(true);
    expect(isValidCode('abc123')).toBe(true);
    expect(isValidCode('ABCDEFGH')).toBe(true);
    expect(isValidCode('abc1234')).toBe(true);
  });

  it('should reject codes shorter than 6 characters', () => {
    expect(isValidCode('ABC12')).toBe(false);
    expect(isValidCode('AB123')).toBe(false);
  });

  it('should reject codes longer than 8 characters', () => {
    expect(isValidCode('ABCDEFGHI')).toBe(false);
    expect(isValidCode('ABC123456')).toBe(false);
  });

  it('should reject codes with special characters', () => {
    expect(isValidCode('ABC@123')).toBe(false);
    expect(isValidCode('ABC-123')).toBe(false);
    expect(isValidCode('ABC_123')).toBe(false);
  });

  it('should reject codes with spaces', () => {
    expect(isValidCode('ABC 123')).toBe(false);
  });
});

describe('Random Code Generation', () => {
  it('should generate alphanumeric codes', () => {
    const code = generateRandomCode();
    expect(code).toMatch(/^[A-Za-z0-9]{6,8}$/);
  });

  it('should generate unique codes', () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateRandomCode());
    }
    // Very unlikely to have duplicates in 100 generations
    expect(codes.size).toBeGreaterThan(95);
  });
});

describe('URL Truncation', () => {
  it('should truncate long URLs', () => {
    const longUrl = 'https://example.com/very/long/path/to/something';
    const truncated = truncateUrl(longUrl, 30);
    expect(truncated).toHaveLength(31); // 30 chars + ellipsis
    expect(truncated).toContain('…');
  });

  it('should not truncate short URLs', () => {
    const shortUrl = 'https://example.com';
    const truncated = truncateUrl(shortUrl, 30);
    expect(truncated).toBe(shortUrl);
    expect(truncated).not.toContain('…');
  });
});

describe('Time Formatting', () => {
  it('should format relative time', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    expect(formatRelativeTime(oneHourAgo)).toContain('hour');
  });

  it('should handle null date', () => {
    expect(formatRelativeTime(null)).toBe('Never');
  });

  it('should format date in readable format', () => {
    const date = new Date('2025-11-22');
    const formatted = formatDate(date);
    expect(formatted).toContain('2025');
  });

  it('should handle null date for formatDate', () => {
    expect(formatDate(null)).toBe('N/A');
  });
});

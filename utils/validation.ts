/**
 * URL Validation Utilities
 */

/**
 * Validates that a URL has a valid protocol (http or https)
 * Does not auto-add scheme if missing.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Code validation: must be alphanumeric, 6-8 characters
 */
export function isValidCode(code: string): boolean {
  const codeRegex = /^[A-Za-z0-9]{6,8}$/;
  return codeRegex.test(code);
}

/**
 * Generate a random code if not provided
 */
export function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Truncate a URL for display purposes
 */
export function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '…';
}

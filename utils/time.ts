/**
 * Time and Date Utilities
 */

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | null): string {
  if (!date) return 'Never';

  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minutes ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hours ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)} days ago`;
  if (secondsAgo < 2592000) return `${Math.floor(secondsAgo / 604800)} weeks ago`;

  return date.toLocaleDateString();
}

/**
 * Format a date as ISO string or readable format
 */
export function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * CopyButton Component
 */

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
      aria-label={`Copy ${text}`}
    >
      {isCopied ? '✓ Copied' : label}
    </button>
  );
}

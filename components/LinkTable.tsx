/**
 * LinkTable Component
 */

import { useState } from 'react';
import { formatRelativeTime, formatDate } from '@/utils/time';
import { truncateUrl } from '@/utils/validation';
import CopyButton from './CopyButton';
import Modal from './Modal';
import Tooltip from './Tooltip';

interface Link {
  id: string;
  code: string;
  target_url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
}

interface LinkTableProps {
  links: Link[];
  onDelete?: () => void;
  onSearch?: (query: string) => void;
}

export default function LinkTable({ links, onDelete, onSearch }: LinkTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; code?: string }>({
    isOpen: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredLinks = links.filter(
    (link) =>
      link.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.target_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteModal.code) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/links/${deleteModal.code}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteModal({ isOpen: false });
        onDelete?.();
      }
    } catch (error) {
      console.error('Error deleting link:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (links.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-6xl mb-4">🔗</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No links yet</h3>
        <p className="text-gray-600">Create your first shortened link above to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by code or URL..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredLinks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No links match your search. Try a different query.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">
                  Short Code
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">
                  Target URL
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">
                  Clicks
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">
                  Last Clicked
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map((link) => (
                <tr key={link.code} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">
                    <a
                      href={`${window.location.origin}/${link.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-600 hover:underline"
                    >
                      {link.code}
                    </a>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <Tooltip text={link.target_url} position="top">
                      <span className="text-gray-700">{truncateUrl(link.target_url)}</span>
                    </Tooltip>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {link.clicks}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <Tooltip
                      text={link.last_clicked ? formatDate(new Date(link.last_clicked)) : 'Never'}
                      position="top"
                    >
                      <span className="text-gray-600 text-sm">
                        {formatRelativeTime(link.last_clicked ? new Date(link.last_clicked) : null)}
                      </span>
                    </Tooltip>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <CopyButton text={`${window.location.origin}/${link.code}`} label="Copy" />
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, code: link.code })}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        title="Delete Link"
        message={`Are you sure you want to delete the link "${deleteModal.code}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false })}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
      />
    </>
  );
}

/**
 * LinkForm Component
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import { isValidUrl, isValidCode } from '@/utils/validation';
import Spinner from './Spinner';
import Toast from './Toast';

interface LinkFormProps {
  onLinkCreated?: () => void;
}

interface FormData {
  target_url: string;
  code: string;
}

interface ValidationErrors {
  target_url?: string;
  code?: string;
}

export default function LinkForm({ onLinkCreated }: LinkFormProps) {
  const [formData, setFormData] = useState<FormData>({
    target_url: '',
    code: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.target_url.trim()) {
      newErrors.target_url = 'Target URL is required';
    } else if (!isValidUrl(formData.target_url)) {
      newErrors.target_url = 'Must be a valid URL starting with http:// or https://';
    }

    if (formData.code && !isValidCode(formData.code)) {
      newErrors.code = 'Code must be 6-8 alphanumeric characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_url: formData.target_url,
          code: formData.code || undefined,
        }),
      });

      if (response.status === 409) {
        setToast({
          message: 'This code is already taken. Try another one!',
          type: 'error',
        });
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        setToast({
          message: error.error || 'Failed to create link',
          type: 'error',
        });
        return;
      }

      setToast({
        message: 'Link created successfully!',
        type: 'success',
      });
      setFormData({ target_url: '', code: '' });
      setErrors({});
      onLinkCreated?.();
    } catch (error) {
      console.error('Error creating link:', error);
      setToast({
        message: 'An error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">Create Shortened Link</h2>

        <div className="mb-4">
          <label htmlFor="target_url" className="block text-sm font-medium text-gray-700 mb-2">
            Target URL <span className="text-red-500">*</span>
          </label>
          <input
            id="target_url"
            type="url"
            placeholder="https://example.com/very/long/url"
            value={formData.target_url}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, target_url: e.target.value });
              if (errors.target_url) {
                setErrors({ ...errors, target_url: undefined });
              }
            }}
            onBlur={() => {
              if (formData.target_url && !isValidUrl(formData.target_url)) {
                setErrors({
                  ...errors,
                  target_url: 'Must start with http:// or https://',
                });
              }
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.target_url && <p className="text-red-500 text-sm mt-1">{errors.target_url}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Code (Optional)
          </label>
          <input
            id="code"
            type="text"
            placeholder="abc123 (6-8 characters)"
            value={formData.code}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, code: e.target.value.toUpperCase() });
              if (errors.code) {
                setErrors({ ...errors, code: undefined });
              }
            }}
            onBlur={() => {
              if (formData.code && !isValidCode(formData.code)) {
                setErrors({
                  ...errors,
                  code: 'Must be 6-8 alphanumeric characters',
                });
              }
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
          <p className="text-gray-500 text-xs mt-1">
            Leave empty to auto-generate. Pattern: a-z, A-Z, 0-9
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 me-0"
        >
          {isLoading && <Spinner size="sm" />}
          {isLoading ? 'Creating...' : 'Create Link'}
        </button>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

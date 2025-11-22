/**
 * UI Component Tests using React Testing Library
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LinkForm from '@/components/LinkForm';
import LinkTable from '@/components/LinkTable';

// Mock fetch globally
global.fetch = jest.fn();

describe('LinkForm Component', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render form with inputs', () => {
    render(<LinkForm />);

    expect(screen.getByLabelText(/target url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/custom code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create link/i })).toBeInTheDocument();
  });

  it('should show validation error for invalid URL', async () => {
    render(<LinkForm />);

    const urlInput = screen.getByLabelText(/target url/i);
    await userEvent.type(urlInput, 'not-a-url');

    const submitButton = screen.getByRole('button', { name: /create link/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be a valid url/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid code format', async () => {
    render(<LinkForm />);

    const codeInput = screen.getByLabelText(/custom code/i);
    await userEvent.type(codeInput, 'toolongcode');

    const submitButton = screen.getByRole('button', { name: /create link/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/6-8 alphanumeric/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: '1',
        code: 'ABC123',
        target_url: 'https://example.com',
        clicks: 0,
        created_at: new Date().toISOString(),
      }),
    });

    const onCreated = jest.fn();
    render(<LinkForm onLinkCreated={onCreated} />);

    const urlInput = screen.getByLabelText(/target url/i);
    await userEvent.type(urlInput, 'https://example.com');

    const submitButton = screen.getByRole('button', { name: /create link/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled();
    });
  });

  it('should disable submit button while loading', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ ok: true, status: 201, json: async () => ({}) }), 100)
        )
    );

    render(<LinkForm />);

    const urlInput = screen.getByLabelText(/target url/i);
    await userEvent.type(urlInput, 'https://example.com');

    const submitButton = screen.getByRole('button', { name: /create link/i });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it('should show error toast on duplicate code', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'code_exists' }),
    });

    render(<LinkForm />);

    const urlInput = screen.getByLabelText(/target url/i);
    const codeInput = screen.getByLabelText(/custom code/i);

    await userEvent.type(urlInput, 'https://example.com');
    await userEvent.type(codeInput, 'ABC123');

    const submitButton = screen.getByRole('button', { name: /create link/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/code is already taken/i)).toBeInTheDocument();
    });
  });
});

describe('LinkTable Component', () => {
  const mockLinks = [
    {
      id: '1',
      code: 'ABC123',
      target_url: 'https://example.com',
      clicks: 5,
      last_clicked: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ];

  it('should show empty state when no links', () => {
    render(<LinkTable links={[]} />);

    expect(screen.getByText(/no links yet/i)).toBeInTheDocument();
    expect(screen.getByText(/create your first shortened link/i)).toBeInTheDocument();
  });

  it('should display links in table', () => {
    render(<LinkTable links={mockLinks} />);

    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should filter links by search query', async () => {
    render(<LinkTable links={mockLinks} />);

    const searchInput = screen.getByPlaceholderText(/search by code or url/i);
    await userEvent.type(searchInput, 'ABC');

    expect(screen.getByText('ABC123')).toBeInTheDocument();
  });

  it('should show no results for non-matching search', async () => {
    render(<LinkTable links={mockLinks} />);

    const searchInput = screen.getByPlaceholderText(/search by code or url/i);
    await userEvent.type(searchInput, 'NONEXISTENT');

    await waitFor(() => {
      expect(screen.getByText(/no links match your search/i)).toBeInTheDocument();
    });
  });

  it('should open delete modal when delete button clicked', async () => {
    render(<LinkTable links={mockLinks} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/delete link/i)).toBeInTheDocument();
    });
  });
});

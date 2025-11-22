/**
 * API Error Response Handler
 */

export interface ApiErrorResponse {
  error: string;
  status: number;
}

/**
 * Standardized error response
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public error: string
  ) {
    super(error);
    this.name = 'ApiError';
  }

  toJSON() {
    return { error: this.error };
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(err: unknown): ApiErrorResponse {
  if (err instanceof ApiError) {
    return { error: err.error, status: err.status };
  }
  if (err instanceof Error) {
    return { error: err.message, status: 500 };
  }
  return { error: 'Internal Server Error', status: 500 };
}

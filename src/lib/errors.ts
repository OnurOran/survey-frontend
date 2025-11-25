import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@/src/types';

/**
 * Parses an error from an API call and returns a user-friendly message
 * Handles Axios errors, API error responses, and generic errors
 */
export function parseApiError(error: unknown): string {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    // Check if we have a structured error response from the backend
    if (error.response?.data) {
      const data = error.response.data as ApiErrorResponse;

      // If the backend sent a message, use it
      if (data.message) {
        return data.message;
      }

      // If the backend sent validation errors, format them
      if (data.errors && Object.keys(data.errors).length > 0) {
        const errorMessages = Object.entries(data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        return errorMessages;
      }
    }

    // Handle common HTTP status codes
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'You are not authorized. Please login again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'A conflict occurred. The resource may already exist.';
        case 422:
          return 'Validation failed. Please check your input.';
        case 500:
          return 'A server error occurred. Please try again later.';
        case 503:
          return 'The service is temporarily unavailable. Please try again later.';
        default:
          return `An error occurred (${error.response.status}). Please try again.`;
      }
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }

    // Fallback for Axios errors
    return error.message || 'An unexpected error occurred.';
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for unknown errors
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Logs an error to the console in development mode
 * In production, this could be extended to send to an error tracking service
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }

  // TODO: In production, send to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { tags: { context } });
  // }
}

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public context?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

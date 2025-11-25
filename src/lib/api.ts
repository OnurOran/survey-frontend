import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { AuthTokensDto, RefreshTokenRequest } from '@/src/types';
import { logError } from './errors';

// Constants for token storage
const ACCESS_TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'survey_access_token';
const REFRESH_TOKEN_KEY = process.env.NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY || 'survey_refresh_token';

/**
 * Create the main API client instance
 * - Base URL from environment variable
 * - withCredentials enabled for cookie support (X-Survey-Participant)
 * - JSON content type by default
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5123/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Process the queue of failed requests after token refresh
 */
const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Token management utilities
 */
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (tokens: AuthTokensDto): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

/**
 * Request Interceptor
 * Automatically attach the Authorization Bearer token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    logError(error, 'Request Interceptor');
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle 401 errors and automatically refresh tokens
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If the error is not 401 or we've already retried, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If we're already refreshing tokens, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          // Retry the original request with the new token
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Mark this request as retried to prevent infinite loops
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenManager.getRefreshToken();

    // If no refresh token is available, clear tokens and reject
    if (!refreshToken) {
      isRefreshing = false;
      tokenManager.clearTokens();
      processQueue(new Error('No refresh token available'));
      return Promise.reject(error);
    }

    try {
      // Attempt to refresh the token
      const response = await axios.post<AuthTokensDto>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        { refreshToken } as RefreshTokenRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const newTokens = response.data;

      // Store the new tokens
      tokenManager.setTokens(newTokens);

      // Process the queue of failed requests
      processQueue();

      // Retry the original request with the new token
      return apiClient(originalRequest);
    } catch (refreshError) {
      // If refresh fails, clear tokens and reject all queued requests
      logError(refreshError, 'Token Refresh');
      tokenManager.clearTokens();
      processQueue(refreshError as Error);

      // Redirect to login page or trigger a logout event
      if (typeof window !== 'undefined') {
        // Dispatch a custom event that can be listened to by the auth context
        window.dispatchEvent(new Event('auth:logout'));
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Export a typed API client for use throughout the application
 */
export default apiClient;

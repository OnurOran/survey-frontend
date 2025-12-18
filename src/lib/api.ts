import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { logError } from './errors';

/**
 * Helper to recursively convert Date objects to ISO strings for API requests
 */
function serializeDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDates);
  }

  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        serialized[key] = serializeDates(obj[key]);
      }
    }
    return serialized;
  }

  return obj;
}

/**
 * Helper to recursively parse ISO date strings to Date objects in API responses
 */
function deserializeDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // ISO 8601 date pattern
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;
    if (isoDatePattern.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deserializeDates);
  }

  if (typeof obj === 'object') {
    const deserialized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        deserialized[key] = deserializeDates(obj[key]);
      }
    }
    return deserialized;
  }

  return obj;
}

/**
 * Create the main API client instance
 * - Base URL from environment variable
 * - withCredentials enabled for cookie-based auth
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

/**
 * Request Interceptor
 * Serialize Date objects to ISO strings before sending to API
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data) {
      config.data = serializeDates(config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

type AuthenticatedRequest = AxiosRequestConfig & { _retry?: boolean; skipAuthRefresh?: boolean };

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

const refreshSession = async () => {
  const refreshConfig: AuthenticatedRequest = {
    withCredentials: true,
    // Custom flag so the interceptor does not recurse on refresh calls
    headers: { 'X-Auth-Refresh': 'true' },
    skipAuthRefresh: true,
  };

  await apiClient.post('/auth/refresh', {}, refreshConfig);
};

/**
 * Response Interceptor
 * Handle 401 errors and automatically refresh tokens using httpOnly cookies
 * Also deserialize ISO date strings to Date objects
 */
apiClient.interceptors.response.use(
  (response) => {
    // Deserialize dates in response data
    if (response.data) {
      response.data = deserializeDates(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = (error.config as AuthenticatedRequest) ?? {};
    const url = originalRequest.url ?? '';

    // If the error is not 401 or we've already retried, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry || originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    // Do not attempt refresh for auth endpoints or auth test (e.g., first load without session)
    if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/test')) {
      return Promise.reject(error);
    }

    // If we're already refreshing tokens, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    // Mark this request as retried to prevent infinite loops
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Attempt to refresh the token using cookies
      await refreshSession();

      // Process the queue of failed requests
      processQueue();

      // Retry the original request with the new token
      return apiClient(originalRequest);
    } catch (refreshError) {
      // If refresh fails, reject all queued requests
      logError(refreshError, 'Token Refresh');
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

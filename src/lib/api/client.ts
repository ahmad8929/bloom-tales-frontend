import { getCookie, removeCookie } from '../utils';

// const API_URL = "https://bloom-backend-rtch.onrender.com";
export const API_URL = "https://orange-llama-692113.hostingersite.com";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Global token cache to handle race conditions between Redux and cookies
let tokenCache: string | null = null;

// Function to get token from multiple sources (cookies first, then cache)
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Try cookie first (most reliable)
  const cookieToken = getCookie('auth-token');
  if (cookieToken) {
    tokenCache = cookieToken; // Update cache
    return cookieToken;
  }

  // cache if cookie not available yet
  if (tokenCache) {
    return tokenCache;
  }

  return null;
}

// Function to set token cache (called from auth hooks)
export function setAuthTokenCache(token: string | null) {
  tokenCache = token;
}

// Enhanced fetch with timeout and retry logic
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection and try again');
    }
    throw error;
  }
}

function clearAuthAndRedirect(message: string) {
  if (typeof window === 'undefined') return;

  setAuthTokenCache(null);
  removeCookie('auth-token');
  removeCookie('user-role');

  // Dispatch custom event for auth system to handle logout
  window.dispatchEvent(new CustomEvent('authTokenExpired', { detail: { message } }));

  // Redirect to login after a short delay
  setTimeout(() => {
    window.location.href = '/login?expired=true';
  }, 100);
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = 2
): Promise<ApiResponse<T>> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Get token from multiple sources (cookies first, then cache)
      const token = getAuthToken();

      const headers: Record<string, string> = {
        ...options.headers as Record<string, string>,
      };

      // Don't set Content-Type for FormData - let browser set it with boundary
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetchWithTimeout(`${API_URL}/api${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
        mode: 'cors',
      }, 30000);

      // Handle non-JSON responses gracefully
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          throw new Error('Invalid server response format');
        }
      } else {
        // If not JSON, return a generic error
        throw new Error(`Unexpected response format from server`);
      }

      // Check for error status in response body (even if response.ok is true)
      if (data && data.status === 'error') {
        const errorMessage = data.message || data.error || 'An error occurred';

        // Handle token expiration specifically
        if (errorMessage.toLowerCase().includes('expired')) {
          clearAuthAndRedirect(errorMessage);
          throw new Error('Your session has expired. Please log in again.');
        }

        // Handle other error statuses
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        // Handle 401 Unauthorized - token might be expired or invalid
        if (response.status === 401) {
          clearAuthAndRedirect(data.message || 'Authentication required');
          throw new Error(data.message || 'Authentication required. Please log in again.');
        }
        // Handle 403 Forbidden - Access denied
        if (response.status === 403) {
          throw new Error(data.message || data.error || 'Access denied');
        }
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return { data };
    } catch (error: any) {
      lastError = error;
      console.error(`API Error (attempt ${attempt + 1}/${retries + 1}):`, error);

      // Handle token expiration errors - don't retry
      if (error.message?.toLowerCase().includes('expired')) {
        break;
      }

      // Don't retry on client errors (4xx) or auth errors
      if (error.message?.includes('401') || error.message?.includes('403') ||
          error.message?.includes('400') || error.message?.includes('404')) {
        break;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Return user-friendly error messages
  const errorMessage = lastError?.message || 'An unknown error occurred';
  let userFriendlyMessage = errorMessage;

  if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
    userFriendlyMessage = 'Network error - please check your connection and try again';
  } else if (errorMessage.includes('Failed to fetch')) {
    userFriendlyMessage = 'Unable to reach server - please try again later';
  }

  return {
    error: userFriendlyMessage,
  };
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data: any, options?: RequestInit) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  },

  put: <T>(endpoint: string, data: any, options?: RequestInit) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  },

  patch: <T>(endpoint: string, data: any, options?: RequestInit) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    });
  },

  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'DELETE',
    }),
};

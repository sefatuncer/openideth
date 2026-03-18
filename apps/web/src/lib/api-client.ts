const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface FetchOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

class ApiClientError extends Error {
  statusCode: number;
  error?: string;

  constructor(data: ApiError) {
    super(Array.isArray(data.message) ? data.message[0] : data.message);
    this.name = 'ApiClientError';
    this.statusCode = data.statusCode;
    this.error = data.error;
  }
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const { data } = await res.json();
      setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...rest,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  let res = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Auto-refresh on 401
  if (res.status === 401 && token) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }
      res = await fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers });
    } else {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }));
    throw new ApiClientError(errorData);
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const api = {
  get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return fetchApi<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return fetchApi<T>(endpoint, { ...options, method: 'POST', body });
  },

  patch<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return fetchApi<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  del<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return fetchApi<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export { ApiClientError, clearTokens, getAccessToken, getRefreshToken, setTokens };
export type { ApiError };

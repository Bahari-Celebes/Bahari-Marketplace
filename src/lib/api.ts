export const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000';

export class ApiError extends Error {
  public status: number;
  public data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('bahari_token');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // tokenStruct: { accessToken, tokenExpiry, user }
      if (parsed.accessToken && parsed.tokenExpiry) {
        const expiresAt = new Date(parsed.tokenExpiry).getTime();
        if (Date.now() < expiresAt) return parsed.accessToken;
      }
    } catch {
      return stored; // legacy plain text token
    }
  }
  return null;
}

function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('bahari_token');
  localStorage.removeItem('bahari_user');
  sessionStorage.clear();
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new ApiError(0, 'offline');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (response.status === 401) {
    clearAuth();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new ApiError(401, data?.error?.message || 'Session expired');
  }

  if (!response.ok) {
    throw new ApiError(response.status, data?.error?.message || response.statusText, data);
  }

  return data;
}

export const api = {
  get: (endpoint: string, options?: RequestInit) =>
    fetchWithAuth(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, body: any, options?: RequestInit) =>
    fetchWithAuth(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: (endpoint: string, body: any, options?: RequestInit) =>
    fetchWithAuth(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint: string, options?: RequestInit) =>
    fetchWithAuth(endpoint, { ...options, method: 'DELETE' }),
};

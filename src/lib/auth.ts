// Auth state management — offline-first token cache.

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cooperative_manager' | 'operator' | 'reviewer';
  cooperativeId?: string;
};

type TokenData = {
  accessToken: string;
  tokenExpiry: number; // epoch ms
  user: AuthUser;
};

const KEY = 'bahari_token';

function isBrowser() { return typeof window !== 'undefined'; }

export function saveAuth(data: { accessToken: string; tokenExpiry: number; user: AuthUser }) {
  if (!isBrowser()) return;
  const expiresAt = Date.now() + data.tokenExpiry * 1000;
  localStorage.setItem(KEY, JSON.stringify({ ...data, tokenExpiry: expiresAt }));
  localStorage.setItem('bahari_user', JSON.stringify(data.user));
}

export function getStoredAuth(): TokenData | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem('bahari_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function isOfflineSessionValid(): boolean {
  const auth = getStoredAuth();
  if (!auth) return false;
  return Date.now() < auth.tokenExpiry;
}

export function getAuthHeaders(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth || Date.now() >= auth.tokenExpiry) return {};
  return { Authorization: `Bearer ${auth.accessToken}` };
}

export function getRoleRedirect(role: string): string {
  switch (role) {
    case 'admin': return '/admin';
    case 'cooperative_manager': return '/dashboard';
    case 'operator': return '/dashboard/commodities';
    case 'reviewer': return '/dashboard';
    default: return '/';
  }
}

export function clearAuth() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY);
  localStorage.removeItem('bahari_user');
}

export async function login(email: string, password: string) {
  const res = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000'}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Login failed');
  const { accessToken, tokenExpiry, user } = json.data;
  saveAuth({ accessToken, tokenExpiry, user });
  return { user, tokenExpiry };
}

export async function register(data: { name: string; email: string; password: string; role: string; cooperativeId?: string }) {
  const res = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000'}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Registration failed');
  const { accessToken, tokenExpiry, user } = json.data;
  saveAuth({ accessToken, tokenExpiry, user });
  return { user, tokenExpiry };
}

export function logout() {
  clearAuth();
  if (isBrowser()) window.location.href = '/';
}

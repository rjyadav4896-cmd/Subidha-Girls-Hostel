import { getAdminToken, getStudentToken } from './storage';

type ApiRole = 'admin' | 'student' | 'public';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const DEFAULT_TIMEOUT_MS = 20000;

export async function apiFetch<T>(path: string, opts?: RequestInit & { role?: ApiRole }): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const role = opts?.role ?? 'public';
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const headers: Record<string, string> = {};
  if (!(opts?.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const token = role === 'admin' ? getAdminToken() : role === 'student' ? getStudentToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...opts,
      headers: { ...headers, ...(opts?.headers ?? {}) },
      credentials: 'include',
      signal: opts?.signal ?? controller.signal
    });
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error('Request timed out. Please check that the backend server is running and try again.');
    }
    throw new Error(e?.message || 'Could not connect to the backend server.');
  } finally {
    window.clearTimeout(timeout);
  }

  if (!res.ok) {
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const data = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
      throw new Error(data?.message || data?.error || `Request failed: ${res.status}`);
    }
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

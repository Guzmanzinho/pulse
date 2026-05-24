/* client.js — HTTP client real contra el backend de Pulse.
 *
 *  - Lee VITE_API_URL para resolver URLs (incluye dominio).
 *  - Adjunta Authorization: Bearer <token> si hay JWT en localStorage.
 *  - Soporta JSON y multipart/form-data (auto-detecta FormData).
 *  - Normaliza errores a ApiError({ message, status }).
 *  - Expone resolveMedia() para construir URLs absolutas de /uploads/*.
 */

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

const TOKEN_KEY = 'pulse.token';

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(t) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function apiUrl(path) {
  if (!path) return BASE;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Resuelve rutas relativas tipo `/uploads/x.png` a la URL absoluta del backend. */
export function resolveMedia(path) {
  if (!path) return null;
  if (/^(data:|blob:|https?:\/\/)/i.test(path)) return path;
  return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function apiFetch(path, {
  method = 'GET',
  body,
  headers = {},
  auth = true,
  signal,
} = {}) {
  const opts = { method, headers: { Accept: 'application/json', ...headers }, signal };

  if (auth) {
    const token = getToken();
    if (token) opts.headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      // Dejamos que el navegador setee el boundary correcto del multipart.
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }

  let res;
  try {
    res = await fetch(apiUrl(path), opts);
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError('Sem ligação ao servidor. Verifica a tua rede.', 0);
  }

  const ct = res.headers.get('content-type') || '';
  let payload = null;
  if (res.status !== 204) {
    if (ct.includes('application/json')) {
      payload = await res.json().catch(() => null);
    } else {
      payload = await res.text().catch(() => null);
    }
  }

  if (!res.ok) {
    const msg =
      (payload && typeof payload === 'object' && (payload.mensagem || payload.message))
      || (typeof payload === 'string' && payload)
      || `Erro ${res.status}`;
    throw new ApiError(msg, res.status, payload);
  }

  return payload;
}

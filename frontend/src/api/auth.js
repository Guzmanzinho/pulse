/* auth.js — Servicio de autenticação contra /api/auth/*.
 *
 *  El backend devuelve campos em portugués (utilizador_id, nome_utilizador,
 *  nome, email, is_admin, ativo). Esta capa adapta esos campos al shape que
 *  consome o resto del frontend ({ id, username, name, email, role,
 *  avatarColor, verified, … }).
 */

import { apiFetch, setToken, getToken, ApiError } from './client.js';

const USER_KEY = 'pulse.user';
const FOLLOWING_KEY = 'pulse.following.v1';

function colorFor(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return 0;
  return Math.abs(n) % 9;
}

/** Convierte un utilizador del backend al shape esperado por la UI. */
export function adaptUser(u) {
  if (!u) return null;
  return {
    id: u.utilizador_id,
    username: u.nome_utilizador,
    name: u.nome ?? u.nome_utilizador ?? '',
    email: u.email ?? '',
    role: u.is_admin ? 'admin' : 'user',
    bio: u.biografia || '',
    course: '',
    avatarColor: colorFor(u.utilizador_id),
    joinedAt: u.criado_em || null,
    verified: !!u.is_admin,
    ativo: u.ativo !== false,
    fotoPerfil: u.foto_perfil || null,
  };
}

function saveUser(u) {
  try {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  } catch {}
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearLocalState() {
  setToken(null);
  saveUser(null);
  try { localStorage.removeItem(FOLLOWING_KEY); } catch {}
}

export async function login({ username, password }) {
  if (!username || !password) {
    throw new ApiError('Preenche o utilizador e a password.', 400);
  }
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: { nome_utilizador: username.trim(), password },
  });
  setToken(data.token);
  const u = adaptUser(data.utilizador);
  saveUser(u);
  return u;
}

export async function register({ username, name, email, password }) {
  if (!username || !name || !email || !password) {
    throw new ApiError('Preenche todos os campos.', 400);
  }
  if (password.length < 6) {
    throw new ApiError('A password tem de ter pelo menos 6 caracteres.', 400);
  }
  await apiFetch('/api/auth/signup', {
    method: 'POST',
    auth: false,
    body: {
      nome_utilizador: username.trim(),
      nome: name.trim(),
      email: email.trim(),
      password,
    },
  });
  // O backend não devolve token no signup — fazemos login imediato.
  return login({ username: username.trim(), password });
}

export async function logout() {
  try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch {}
  clearLocalState();
  return true;
}

/** Valida o token chamando /api/auth/perfil. Devolve user em cache se válido. */
export async function getCurrentUser() {
  if (!getToken()) return null;
  try {
    const data = await apiFetch('/api/auth/perfil');
    const stored = getStoredUser();
    const jwtId = data?.user?.utilizador_id;
    if (stored && Number(stored.id) === Number(jwtId)) return stored;
    // Sem dados em cache: construímos um user mínimo a partir do JWT.
    const minimal = adaptUser(data?.user);
    if (minimal) saveUser(minimal);
    return minimal;
  } catch (e) {
    if (e.status === 401 || e.status === 403) clearLocalState();
    return null;
  }
}

/** Edição de perfil. Backend só permite via endpoint admin → falha graciosa para users normais. */
export async function updateMe(patch) {
  const me = getStoredUser();
  if (!me) throw new ApiError('Não autenticado.', 401);

  const body = {};
  if (patch.name !== undefined) body.nome = patch.name;
  if (patch.email !== undefined) body.email = patch.email;
  if (patch.bio !== undefined) body.biografia = patch.bio;

  if (!Object.keys(body).length) return me;

  try {
    await apiFetch(`/api/admin/utilizadores/${me.id}`, { method: 'PUT', body });
  } catch (e) {
    if (e.status === 401 || e.status === 403) {
      throw new ApiError('A edição de perfil está limitada a administradores nesta versão.', 403);
    }
    throw e;
  }
  const next = { ...me, ...patch };
  saveUser(next);
  return next;
}

/* users.js — Servicio de utilizadores / seguimentos / admin.
 *
 *  Endpoints reales:
 *    POST   /api/utilizadores/:utilizador_id/seguir
 *    DELETE /api/utilizadores/:utilizador_id/unfollow
 *    GET    /api/admin/utilizadores            (apenas admin)
 *    PUT    /api/admin/utilizadores/:id
 *    DELETE /api/admin/utilizadores/:id
 *
 *  Limitações conhecidas do backend (sem endpoint público):
 *    - listagem de utilizadores → tentamos via /api/admin/utilizadores; se 403, [].
 *    - getUserByUsername → resolvido client-side a partir da listagem (se disponível).
 *    - contagens de seguidores/seguindo de outros → não há endpoint; devolvemos 0.
 *    - lista de pessoas que “eu” sigo → cache local em localStorage (sincronizada
 *      apenas pelas chamadas follow/unfollow desta sessão).
 */

import { apiFetch, ApiError } from './client.js';
import { adaptUser, getStoredUser } from './auth.js';

const FOLLOWING_KEY = 'pulse.following.v1';

function readFollowing() {
  try {
    const raw = localStorage.getItem(FOLLOWING_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}
function writeFollowing(set) {
  try { localStorage.setItem(FOLLOWING_KEY, JSON.stringify([...set])); } catch {}
}

async function fetchAllUsersSafe() {
  try {
    const data = await apiFetch('/api/admin/utilizadores');
    return Array.isArray(data) ? data.map(adaptUser).filter(Boolean) : [];
  } catch (e) {
    if (e.status === 401 || e.status === 403) return [];
    throw e;
  }
}

/* ---- FOLLOW ---- */

export async function follow({ followingId }) {
  try {
    await apiFetch(`/api/utilizadores/${followingId}/seguir`, { method: 'POST' });
  } catch (e) {
    // 409 = "Já segues este utilizador" → idempotente, tratamos como sucesso
    // e sincronizamos o cache local (estávamos out-of-sync com o servidor).
    if (e.status !== 409) throw e;
  }
  const s = readFollowing();
  s.add(String(followingId));
  writeFollowing(s);
  return true;
}

export async function unfollow({ followingId }) {
  try {
    await apiFetch(`/api/utilizadores/${followingId}/unfollow`, { method: 'DELETE' });
  } catch (e) {
    // 404 = "Não segues este utilizador" → idempotente
    if (e.status !== 404) throw e;
  }
  const s = readFollowing();
  s.delete(String(followingId));
  writeFollowing(s);
  return true;
}

export function isFollowing(_followerId, followingId) {
  return readFollowing().has(String(followingId));
}

/** Apenas correto para o utilizador autenticado (cache local). */
export function getFollowingIds(_userId) {
  return [...readFollowing()].map((id) => {
    const n = Number(id);
    return Number.isFinite(n) ? n : id;
  });
}

/** Backend não expõe contagens — devolvemos 0/0 para não rebentar a UI. */
export function getFollowCounts(_userId) {
  return { followers: 0, following: 0 };
}

/* ---- LISTAGENS ---- */

export async function listUsers({ q = '', course = '', excludeId = null } = {}) {
  let users = await fetchAllUsersSafe();
  if (excludeId != null) users = users.filter((u) => Number(u.id) !== Number(excludeId));
  if (q) {
    const needle = q.toLowerCase();
    users = users.filter((u) =>
      (u.name || '').toLowerCase().includes(needle) ||
      (u.username || '').toLowerCase().includes(needle)
    );
  }
  // O backend não tem campo "curso"; filtro mantém-se inerte excepto "Todos".
  if (course && course !== 'Todos') users = [];
  return users;
}

export async function getUserByUsername(username) {
  // Primeiro: se for o próprio utilizador autenticado, devolvemo-lo do cache.
  const me = getStoredUser();
  if (me && me.username && me.username.toLowerCase() === username.toLowerCase()) return me;

  const users = await fetchAllUsersSafe();
  const u = users.find((x) => (x.username || '').toLowerCase() === username.toLowerCase());
  if (!u) throw new ApiError('Utilizador não encontrado.', 404);
  return u;
}

export async function getCourses() {
  // Sem campo "curso" no backend.
  return ['Todos'];
}

export async function suggestionsFor(userId, limit = 4) {
  const users = await fetchAllUsersSafe();
  if (!users.length) return [];
  const following = readFollowing();
  return users
    .filter((u) => Number(u.id) !== Number(userId) && !following.has(String(u.id)))
    .slice(0, limit);
}

/* ---- ADMIN ---- */

export async function adminListUsers({ q = '' } = {}) {
  const users = await fetchAllUsersSafe();
  if (!q) return users;
  const needle = q.toLowerCase();
  return users.filter((u) =>
    (u.name || '').toLowerCase().includes(needle) ||
    (u.username || '').toLowerCase().includes(needle) ||
    (u.email || '').toLowerCase().includes(needle)
  );
}

export async function adminUpdateUser(id, patch) {
  const body = {};
  if (patch.name !== undefined) body.nome = patch.name;
  if (patch.username !== undefined) body.nome_utilizador = patch.username;
  if (patch.email !== undefined) body.email = patch.email;
  if (patch.role !== undefined) body.is_admin = patch.role === 'admin';
  if (patch.bio !== undefined) body.biografia = patch.bio;
  if (patch.ativo !== undefined) body.ativo = patch.ativo;
  await apiFetch(`/api/admin/utilizadores/${id}`, { method: 'PUT', body });
  return { id, ...patch };
}

export async function adminDeleteUser(id) {
  await apiFetch(`/api/admin/utilizadores/${id}`, { method: 'DELETE' });
  return true;
}

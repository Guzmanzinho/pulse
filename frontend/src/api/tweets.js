/* tweets.js — Servicio de tweets / gostos / comentários contra /api/tweets/*.
 *
 *  Endpoints reales del backend:
 *    GET    /api/tweets                       (público, lista geral)
 *    POST   /api/tweets/criar                 (multipart: conteudo + imagem File)
 *    PUT    /api/tweets/:tweet_id             (edição do próprio)
 *    DELETE /api/tweets/:tweet_id
 *    POST   /api/tweets/:tweet_id/comentar
 *    POST   /api/tweets/:tweet_id/gosto       (singular!)
 *    DELETE /api/tweets/:tweet_id/gosto
 *    GET    /api/utilizadores/feed            (feed do utilizador autenticado)
 *
 *  Para admin:
 *    GET    /api/admin/tweets
 *    PUT    /api/admin/tweets/:tweet_id
 *    DELETE /api/admin/tweets/:tweet_id
 */

import { apiFetch, ApiError } from './client.js';
import { adaptUser, getStoredUser } from './auth.js';

const MAX = 280;

function colorFor(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return 0;
  return Math.abs(n) % 9;
}

/** Converte um tweet vindo do backend (com includes) ao shape esperado pela UI. */
export function adaptTweet(t, viewerId) {
  if (!t) return null;
  const author = t.Utilizador
    ? adaptUser(t.Utilizador)
    : {
        id: t.utilizador_id,
        username: '',
        name: 'Utilizador',
        avatarColor: colorFor(t.utilizador_id),
        verified: false,
      };
  const image = t.ImagemTweet?.url_imagem || null;
  const likes = Array.isArray(t.Gostos) ? t.Gostos : [];
  const rawComments = Array.isArray(t.Comentarios) ? t.Comentarios : [];
  const commentList = rawComments
    .map(adaptComment)
    .filter(Boolean)
    .sort((a, b) => a.createdAt - b.createdAt);
  return {
    id: t.tweet_id,
    authorId: t.utilizador_id,
    author,
    text: t.conteudo || '',
    image,
    createdAt: t.criado_em ? new Date(t.criado_em).getTime() : Date.now(),
    likes: likes.length,
    likedByMe: viewerId != null
      ? likes.some((l) => Number(l.utilizador_id) === Number(viewerId))
      : false,
    comments: commentList.length,
    commentList,
  };
}

/** Converte um comentário do backend ao shape consumido pela UI. */
export function adaptComment(c) {
  if (!c) return null;
  const u = c.Utilizador || null;
  return {
    id: c.comentario_id,
    text: c.conteudo || '',
    authorId: c.utilizador_id,
    authorName: u?.nome || u?.nome_utilizador || 'Utilizador',
    authorUsername: u?.nome_utilizador || '',
    avatarColor: colorFor(c.utilizador_id),
    createdAt: c.criado_em ? new Date(c.criado_em).getTime() : Date.now(),
  };
}

export async function listFeed({ viewerId, mode = 'following' } = {}) {
  if (mode === 'following') {
    const data = await apiFetch('/api/utilizadores/feed');
    const list = Array.isArray(data?.feed) ? data.feed : [];
    // O /feed não traz includes (autor, imagens, gostos). Hidratamos o autor a partir
    // do user em cache quando é o próprio; nos restantes ficam com placeholders.
    const me = getStoredUser();
    return list.map((t) => {
      const base = adaptTweet(t, viewerId);
      if (Number(t.utilizador_id) === Number(me?.id)) {
        base.author = {
          id: me.id, username: me.username, name: me.name,
          avatarColor: me.avatarColor, verified: me.verified,
        };
      }
      return base;
    });
  }
  // mode === 'all' → GET /api/tweets (público, com includes)
  const data = await apiFetch('/api/tweets', { auth: false });
  const list = Array.isArray(data) ? data : [];
  return list.map((t) => adaptTweet(t, viewerId));
}

export async function listByUser(userId, viewerId) {
  // Não existe endpoint dedicado — usamos /api/tweets e filtramos client-side.
  const data = await apiFetch('/api/tweets', { auth: false });
  const list = Array.isArray(data) ? data : [];
  return list
    .filter((t) => Number(t.utilizador_id) === Number(userId))
    .map((t) => adaptTweet(t, viewerId));
}

export async function createTweet({ text, image } = {}) {
  const clean = (text || '').trim();
  if (!clean) throw new ApiError('Escreve algo para publicar.', 400);
  if (clean.length > MAX) throw new ApiError(`Limite de ${MAX} caracteres excedido.`, 400);

  const fd = new FormData();
  fd.append('conteudo', clean);
  if (image instanceof File) fd.append('imagem', image);

  const res = await apiFetch('/api/tweets/criar', { method: 'POST', body: fd });
  const created = res?.tweet || {};
  const me = getStoredUser();

  // O endpoint de criação não devolve a URL da imagem; usamos uma preview local optimista.
  const optimisticImage = image instanceof File ? URL.createObjectURL(image) : null;

  return {
    id: created.tweet_id,
    authorId: created.utilizador_id,
    author: me ? {
      id: me.id, username: me.username, name: me.name,
      avatarColor: me.avatarColor, verified: me.verified,
    } : null,
    text: created.conteudo || clean,
    image: optimisticImage,
    createdAt: created.criado_em ? new Date(created.criado_em).getTime() : Date.now(),
    likes: 0,
    likedByMe: false,
    comments: 0,
  };
}

export async function editTweet(tweetId, { text }) {
  const res = await apiFetch(`/api/tweets/${tweetId}`, {
    method: 'PUT',
    body: { conteudo: text },
  });
  return res?.tweet || { tweet_id: tweetId, conteudo: text };
}

export async function deleteTweet(tweetId) {
  await apiFetch(`/api/tweets/${tweetId}`, { method: 'DELETE' });
  return true;
}

export async function likeTweet({ tweetId }) {
  try {
    await apiFetch(`/api/tweets/${tweetId}/gosto`, { method: 'POST' });
  } catch (e) {
    // 409 = "Já deste like" → idempotente. O estado óptimista do frontend
    // estava correcto; o servidor já tinha o like persistido.
    if (e.status !== 409) throw e;
  }
  return { id: tweetId, likedByMe: true };
}

export async function unlikeTweet({ tweetId }) {
  try {
    await apiFetch(`/api/tweets/${tweetId}/gosto`, { method: 'DELETE' });
  } catch (e) {
    // 404 = "Like não encontrado para remoção" → idempotente
    if (e.status !== 404) throw e;
  }
  return { id: tweetId, likedByMe: false };
}

export async function comentar({ tweetId, conteudo }) {
  const res = await apiFetch(`/api/tweets/${tweetId}/comentar`, {
    method: 'POST',
    body: { conteudo },
  });
  return res?.comentario || null;
}

/* ---- ADMIN ---- */
export async function adminListTweets({ q = '' } = {}) {
  const data = await apiFetch('/api/admin/tweets');
  const list = Array.isArray(data) ? data : [];
  let tweets = list.map((t) => adaptTweet(t, null));
  if (q) {
    const needle = q.toLowerCase();
    tweets = tweets.filter((t) =>
      (t.text || '').toLowerCase().includes(needle) ||
      (t.author?.name || '').toLowerCase().includes(needle) ||
      (t.author?.username || '').toLowerCase().includes(needle)
    );
  }
  return tweets;
}

export async function adminUpdateTweet(id, patch) {
  const body = {};
  if (patch.text !== undefined) body.conteudo = patch.text;
  if (patch.ativo !== undefined) body.ativo = patch.ativo;
  const res = await apiFetch(`/api/admin/tweets/${id}`, { method: 'PUT', body });
  return res?.tweet || { id, ...patch };
}

export async function adminDeleteTweet(id) {
  await apiFetch(`/api/admin/tweets/${id}`, { method: 'DELETE' });
  return true;
}

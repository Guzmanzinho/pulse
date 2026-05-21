import { getDb, setDb } from './db.js';
import { request, ApiError } from './client.js';
import { getFollowingIds } from './users.js';

const MAX_LEN = 280;

function strip(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

function hydrate(tweet, viewerId) {
  const db = getDb();
  const author = db.users.find((u) => u.id === tweet.authorId);
  const likes = db.likes.filter((l) => l.tweetId === tweet.id);
  return {
    ...tweet,
    author: strip(author),
    likes: likes.length,
    likedByMe: viewerId ? likes.some((l) => l.userId === viewerId) : false,
  };
}

export function listFeed({ viewerId, mode = 'following' }) {
  return request(() => {
    if (!viewerId) throw new ApiError('Não autenticado.', 401);
    const db = getDb();
    const followingIds = getFollowingIds(viewerId);
    const allowedAuthorIds = mode === 'all'
      ? db.users.map((u) => u.id)
      : [...followingIds, viewerId];
    const tweets = db.tweets
      .filter((t) => allowedAuthorIds.includes(t.authorId))
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((t) => hydrate(t, viewerId));
    return tweets;
  });
}

export function listByUser(userId, viewerId) {
  return request(() => {
    const db = getDb();
    return db.tweets
      .filter((t) => t.authorId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((t) => hydrate(t, viewerId));
  });
}

export function createTweet({ authorId, text, image }) {
  return request(() => {
    if (!authorId) throw new ApiError('Não autenticado.', 401);
    const clean = (text || '').trim();
    if (!clean && !image) throw new ApiError('Escreve algo ou adiciona uma imagem.');
    if (clean.length > MAX_LEN) throw new ApiError(`Limite de ${MAX_LEN} caracteres excedido.`);
    const tweet = {
      id: `t-${Date.now().toString(36)}`,
      authorId,
      text: clean,
      image: image || null,
      createdAt: Date.now(),
    };
    setDb((d) => ({ ...d, tweets: [tweet, ...d.tweets] }));
    return hydrate(tweet, authorId);
  });
}

export function likeTweet({ userId, tweetId }) {
  return request(() => {
    setDb((d) => {
      if (d.likes.some((l) => l.userId === userId && l.tweetId === tweetId)) return d;
      return { ...d, likes: [...d.likes, { userId, tweetId }] };
    });
    return hydrate(getDb().tweets.find((t) => t.id === tweetId), userId);
  });
}

export function unlikeTweet({ userId, tweetId }) {
  return request(() => {
    setDb((d) => ({
      ...d,
      likes: d.likes.filter((l) => !(l.userId === userId && l.tweetId === tweetId)),
    }));
    return hydrate(getDb().tweets.find((t) => t.id === tweetId), userId);
  });
}

/* ---- ADMIN ---- */
export function adminListTweets({ q = '' } = {}) {
  return request(() => {
    const db = getDb();
    let tweets = db.tweets
      .map((t) => hydrate(t, null))
      .sort((a, b) => b.createdAt - a.createdAt);
    if (q) {
      const needle = q.toLowerCase();
      tweets = tweets.filter((t) =>
        t.text.toLowerCase().includes(needle) ||
        t.author.name.toLowerCase().includes(needle) ||
        t.author.username.toLowerCase().includes(needle)
      );
    }
    return tweets;
  });
}
export function adminUpdateTweet(id, patch) {
  return request(() => {
    if (patch.text && patch.text.length > MAX_LEN) {
      throw new ApiError(`Limite de ${MAX_LEN} caracteres excedido.`);
    }
    setDb((d) => ({
      ...d,
      tweets: d.tweets.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
    return hydrate(getDb().tweets.find((t) => t.id === id), null);
  });
}
export function adminDeleteTweet(id) {
  return request(() => {
    setDb((d) => ({
      ...d,
      tweets: d.tweets.filter((t) => t.id !== id),
      likes: d.likes.filter((l) => l.tweetId !== id),
    }));
    return true;
  });
}

import { getDb, setDb } from './db.js';
import { request, ApiError } from './client.js';

function strip(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

export function listUsers({ q = '', course = '', excludeId = null } = {}) {
  return request(() => {
    const db = getDb();
    let users = db.users.map(strip);
    if (excludeId) users = users.filter((u) => u.id !== excludeId);
    if (q) {
      const needle = q.toLowerCase();
      users = users.filter((u) =>
        u.name.toLowerCase().includes(needle) ||
        u.username.toLowerCase().includes(needle) ||
        (u.course || '').toLowerCase().includes(needle)
      );
    }
    if (course && course !== 'Todos') {
      users = users.filter((u) => u.course === course);
    }
    return users;
  });
}

export function getUserByUsername(username) {
  return request(() => {
    const u = getDb().users.find((x) => x.username.toLowerCase() === username.toLowerCase());
    if (!u) throw new ApiError('Utilizador não encontrado.', 404);
    return strip(u);
  });
}

export function getCourses() {
  return request(() => {
    const set = new Set(getDb().users.map((u) => u.course).filter(Boolean));
    return ['Todos', ...Array.from(set)];
  });
}

export function follow({ followerId, followingId }) {
  return request(() => {
    if (followerId === followingId) throw new ApiError('Não te podes seguir a ti próprio.');
    setDb((d) => {
      if (d.follows.some((f) => f.followerId === followerId && f.followingId === followingId)) return d;
      return { ...d, follows: [...d.follows, { followerId, followingId }] };
    });
    return true;
  });
}

export function unfollow({ followerId, followingId }) {
  return request(() => {
    setDb((d) => ({
      ...d,
      follows: d.follows.filter((f) => !(f.followerId === followerId && f.followingId === followingId)),
    }));
    return true;
  });
}

export function isFollowing(followerId, followingId) {
  return getDb().follows.some((f) => f.followerId === followerId && f.followingId === followingId);
}

export function getFollowCounts(userId) {
  const db = getDb();
  return {
    followers: db.follows.filter((f) => f.followingId === userId).length,
    following: db.follows.filter((f) => f.followerId === userId).length,
  };
}

export function getFollowingIds(userId) {
  return getDb().follows.filter((f) => f.followerId === userId).map((f) => f.followingId);
}

export function suggestionsFor(userId, limit = 4) {
  return request(() => {
    const db = getDb();
    const following = new Set(getFollowingIds(userId));
    return db.users
      .filter((u) => u.id !== userId && !following.has(u.id))
      .slice(0, limit)
      .map(strip);
  });
}

/* ---- ADMIN ---- */
export function adminListUsers({ q = '' } = {}) {
  return request(() => {
    const db = getDb();
    let users = db.users.map(strip);
    if (q) {
      const needle = q.toLowerCase();
      users = users.filter((u) =>
        u.name.toLowerCase().includes(needle) ||
        u.username.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle)
      );
    }
    return users;
  });
}
export function adminUpdateUser(id, patch) {
  return request(() => {
    setDb((d) => ({
      ...d,
      users: d.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }));
    return strip(getDb().users.find((u) => u.id === id));
  });
}
export function adminDeleteUser(id) {
  return request(() => {
    setDb((d) => ({
      ...d,
      users: d.users.filter((u) => u.id !== id),
      tweets: d.tweets.filter((t) => t.authorId !== id),
      follows: d.follows.filter((f) => f.followerId !== id && f.followingId !== id),
      likes: d.likes.filter((l) => l.userId !== id),
    }));
    return true;
  });
}

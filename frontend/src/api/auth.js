import { getDb, setDb } from './db.js';
import { request, ApiError } from './client.js';

const SESSION_KEY = 'pulse.session.v1';

function publicUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function setSession(s) {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
}

export function login({ username, password }) {
  return request(() => {
    if (!username || !password) throw new ApiError('Preenche o utilizador e a password.');
    const db = getDb();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (!user) throw new ApiError('Credenciais inválidas. Verifica o utilizador e a password.');
    setSession({ userId: user.id });
    return publicUser(user);
  });
}

export function register({ username, name, email, password }) {
  return request(() => {
    if (!username || !name || !email || !password) {
      throw new ApiError('Preenche todos os campos.');
    }
    if (password.length < 6) {
      throw new ApiError('A password tem de ter pelo menos 6 caracteres.');
    }
    const db = getDb();
    if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      throw new ApiError('Este nome de utilizador já está em uso.');
    }
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new ApiError('Já existe uma conta com este email.');
    }
    const id = `u-${Date.now().toString(36)}`;
    const newUser = {
      id, username: username.trim(), name: name.trim(), email: email.trim(),
      password, role: 'user', bio: '', course: '',
      avatarColor: Math.floor(Math.random() * 9),
      joinedAt: new Date().toISOString(), verified: false,
    };
    setDb((d) => ({ ...d, users: [...d.users, newUser] }));
    setSession({ userId: id });
    return publicUser(newUser);
  });
}

export function logout() {
  setSession(null);
  return Promise.resolve(true);
}

export function getCurrentUser() {
  const s = getSession();
  if (!s) return null;
  const u = getDb().users.find((x) => x.id === s.userId);
  return publicUser(u);
}

export function updateMe(patch) {
  return request(() => {
    const s = getSession();
    if (!s) throw new ApiError('Não autenticado.', 401);
    setDb((d) => ({
      ...d,
      users: d.users.map((u) => (u.id === s.userId ? { ...u, ...patch } : u)),
    }));
    return publicUser(getDb().users.find((u) => u.id === s.userId));
  });
}

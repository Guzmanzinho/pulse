/*  db.js — In-browser mock database, persisted to localStorage.
 *  Represents the shape the real backend (Express + SGBD) would expose.
 *  All API services in /api operate on these collections. */

const STORAGE_KEY = 'pulse.db.v1';

const SEED = {
  users: [
    {
      id: 'u-admin', username: 'admin', name: 'Administrador Pulse',
      email: 'admin@pulse.pt', password: 'admin123', role: 'admin',
      bio: 'Conta administrativa da plataforma.', course: 'Sistema',
      avatarColor: 0, joinedAt: '2024-01-01T09:00:00Z', verified: true,
    },
    {
      id: 'u-marta', username: 'martasilva', name: 'Marta Silva',
      email: 'marta@univ.pt', password: 'pulse123', role: 'user',
      bio: 'Estudante de Engenharia Informática. Partilho ideias sobre tecnologia, produtividade e vida académica.',
      course: 'Engenharia Informática', avatarColor: 1,
      joinedAt: '2024-03-12T09:00:00Z', verified: true,
    },
    {
      id: 'u-joao', username: 'joaomartins', name: 'João Martins',
      email: 'joao@univ.pt', password: 'pulse123', role: 'user',
      bio: 'A aprender a programar uma linha de cada vez.',
      course: 'Engenharia Informática', avatarColor: 2,
      joinedAt: '2024-04-05T09:00:00Z', verified: false,
    },
    {
      id: 'u-ines', username: 'inesalmeida', name: 'Inês Almeida',
      email: 'ines@univ.pt', password: 'pulse123', role: 'user',
      bio: 'Design e investigação. Workshops todas as quartas.',
      course: 'Design de Comunicação', avatarColor: 3,
      joinedAt: '2024-02-20T09:00:00Z', verified: false,
    },
    {
      id: 'u-rafael', username: 'rafaelcosta', name: 'Rafael Costa',
      email: 'rafael@univ.pt', password: 'pulse123', role: 'user',
      bio: 'IA aplicada. Maintain 3 projetos open-source este ano.',
      course: 'Engenharia Informática', avatarColor: 4,
      joinedAt: '2024-01-18T09:00:00Z', verified: true,
    },
    {
      id: 'u-beatriz', username: 'bealopes', name: 'Beatriz Lopes',
      email: 'beatriz@univ.pt', password: 'pulse123', role: 'user',
      bio: 'Apaixonada por type design e branding académico.',
      course: 'Design de Comunicação', avatarColor: 5,
      joinedAt: '2024-02-18T09:00:00Z', verified: false,
    },
    {
      id: 'u-alex', username: 'alex_pereira', name: 'Alexandre Pereira',
      email: 'alex@univ.pt', password: 'pulse123', role: 'user',
      bio: 'Investigação em ML aplicada a saúde pública.',
      course: 'Ciência de Dados', avatarColor: 6,
      joinedAt: '2024-03-03T09:00:00Z', verified: false,
    },
    {
      id: 'u-leonor', username: 'leonorrocha', name: 'Leonor Rocha',
      email: 'leonor@univ.pt', password: 'pulse123', role: 'user',
      bio: 'Estudo o impacto das redes sociais no bem-estar.',
      course: 'Psicologia', avatarColor: 7,
      joinedAt: '2024-03-22T09:00:00Z', verified: false,
    },
  ],
  tweets: [
    { id: 't-1', authorId: 'u-marta',  text: 'Dia produtivo no campus! 📚 Nada melhor do que terminar com uma boa sessão de estudo na biblioteca central.', image: null, createdAt: Date.now() - 1000 * 60 * 5 },
    { id: 't-2', authorId: 'u-joao',   text: 'Alguém já terminou o exercício 4 da ficha de Infra? 😅 Estou preso num ciclo infinito…', image: null, createdAt: Date.now() - 1000 * 60 * 60 },
    { id: 't-3', authorId: 'u-ines',   text: 'Lembrete: Amanhã às 14h há workshop sobre Design Systems na Sala 2.1. Não percam! 💜', image: null, createdAt: Date.now() - 1000 * 60 * 60 * 3 },
    { id: 't-4', authorId: 'u-rafael', text: 'Thread sobre produtividade que me ajudou imenso este semestre 📚👇. Vou partilhar 5 hábitos que mudaram a minha forma de estudar.', image: null, createdAt: Date.now() - 1000 * 60 * 60 * 5 },
    { id: 't-5', authorId: 'u-beatriz', text: 'Estou a explorar Variable Fonts para um trabalho da cadeira de Tipografia. Sugestões?', image: null, createdAt: Date.now() - 1000 * 60 * 60 * 8 },
    { id: 't-6', authorId: 'u-alex',   text: 'Publiquei o dataset que limpei este fim-de-semana. Está disponível para quem quiser explorar 📈', image: null, createdAt: Date.now() - 1000 * 60 * 60 * 14 },
    { id: 't-7', authorId: 'u-marta',  text: 'Workshop de Design Systems amanhã às 14h na Sala 2.1. Não percam! 💜', image: null, createdAt: Date.now() - 1000 * 60 * 60 * 22 },
    { id: 't-8', authorId: 'u-leonor', text: 'Curiosidade do dia: o ato de ensinar a outra pessoa o que aprendeste consolida a memória em 80%. Vamos ensinar mais!', image: null, createdAt: Date.now() - 1000 * 60 * 60 * 36 },
  ],
  follows: [
    // Marta segue toda a gente
    { followerId: 'u-marta', followingId: 'u-joao'   },
    { followerId: 'u-marta', followingId: 'u-ines'   },
    { followerId: 'u-marta', followingId: 'u-rafael' },
    { followerId: 'u-joao',  followingId: 'u-marta'  },
    { followerId: 'u-joao',  followingId: 'u-rafael' },
    { followerId: 'u-ines',  followingId: 'u-marta'  },
    { followerId: 'u-ines',  followingId: 'u-beatriz'},
    { followerId: 'u-rafael',followingId: 'u-marta'  },
    { followerId: 'u-rafael',followingId: 'u-alex'   },
    { followerId: 'u-beatriz',followingId: 'u-ines'  },
  ],
  likes: [
    { userId: 'u-joao',    tweetId: 't-1' },
    { userId: 'u-ines',    tweetId: 't-1' },
    { userId: 'u-rafael',  tweetId: 't-1' },
    { userId: 'u-marta',   tweetId: 't-2' },
    { userId: 'u-marta',   tweetId: 't-3' },
    { userId: 'u-rafael',  tweetId: 't-4' },
    { userId: 'u-beatriz', tweetId: 't-4' },
  ],
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function save(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

let cache = load();

export function getDb() {
  if (!cache) { cache = structuredClone(SEED); save(cache); }
  return cache;
}

export function setDb(updater) {
  const db = getDb();
  const next = typeof updater === 'function' ? updater(db) : updater;
  cache = next;
  save(cache);
  return cache;
}

export function seedIfEmpty() {
  if (!load()) { cache = structuredClone(SEED); save(cache); }
}

export function resetDb() {
  cache = structuredClone(SEED);
  save(cache);
}

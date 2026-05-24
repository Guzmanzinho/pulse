/* TweetStoreContext — fonte única de verdade para tweets no frontend.
 *
 *  Resolve o bug de divergência entre os feeds "Toda a comunidade" e
 *  "A seguir": antes, cada página mantinha a sua cópia em useState; ao
 *  mudar de aba, o tweet recarregado vinha sem `likedByMe`/`commentList`
 *  do endpoint /api/utilizadores/feed (não traz includes) e o estado
 *  voltava ao "zero".
 *
 *  Agora as páginas guardam apenas arrays de IDs e leem do store. As
 *  mutações (like, comentário, criação) escrevem aqui e propagam para
 *  todas as vistas (Feed, Profile, etc.).
 *
 *  mergeTweet respeita o nível de detalhe do `source`:
 *    - 'tweets' | 'admin'  → resposta com includes completos: sobrescreve tudo.
 *    - 'feed'              → /api/utilizadores/feed (sem includes): só refresca
 *                            campos básicos; preserva likes, comentários, imagem.
 *    - 'local'             → mutação local (like/comment/edit): patch shallow.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const TweetStoreContext = createContext(null);

function pickRicherAuthor(existing, incoming) {
  if (!existing) return incoming || null;
  if (!incoming) return existing;
  // "Utilizador" / username vazio são placeholders do adaptTweet.
  const incomingIsRich = incoming.username && incoming.name && incoming.name !== 'Utilizador';
  const existingIsRich = existing.username && existing.name && existing.name !== 'Utilizador';
  if (incomingIsRich && !existingIsRich) return incoming;
  if (!incomingIsRich && existingIsRich) return existing;
  return incoming;
}

function mergeTweet(existing, incoming, source) {
  if (!existing) return incoming;
  if (!incoming) return existing;

  if (source === 'local') {
    return { ...existing, ...incoming };
  }

  if (source === 'feed') {
    // /api/utilizadores/feed não traz Gostos nem Comentarios nem ImagemTweet.
    // Apenas atualizamos os campos que esse endpoint conhece, sem destruir
    // o estado mais rico vindo de /api/tweets ou de mutações locais.
    return {
      ...existing,
      authorId: incoming.authorId ?? existing.authorId,
      text: incoming.text || existing.text,
      createdAt: incoming.createdAt || existing.createdAt,
      author: pickRicherAuthor(existing.author, incoming.author),
    };
  }

  // 'tweets' | 'admin' → resposta com includes; é a versão autoritativa.
  return { ...existing, ...incoming, author: pickRicherAuthor(existing.author, incoming.author) };
}

export function TweetStoreProvider({ children }) {
  const [tweetsById, setTweetsById] = useState({});

  const upsertMany = useCallback((list, source = 'tweets') => {
    if (!Array.isArray(list) || list.length === 0) return;
    setTweetsById((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const t of list) {
        if (!t || t.id == null) continue;
        const merged = mergeTweet(next[t.id], t, source);
        if (merged !== next[t.id]) {
          next[t.id] = merged;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const upsertOne = useCallback((tweet, source = 'tweets') => {
    if (!tweet || tweet.id == null) return;
    setTweetsById((prev) => ({
      ...prev,
      [tweet.id]: mergeTweet(prev[tweet.id], tweet, source),
    }));
  }, []);

  const update = useCallback((id, patch) => {
    setTweetsById((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      return { ...prev, [id]: { ...existing, ...patch } };
    });
  }, []);

  const remove = useCallback((id) => {
    setTweetsById((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ tweetsById, upsertMany, upsertOne, update, remove }),
    [tweetsById, upsertMany, upsertOne, update, remove],
  );

  return <TweetStoreContext.Provider value={value}>{children}</TweetStoreContext.Provider>;
}

export function useTweetStore() {
  const v = useContext(TweetStoreContext);
  if (!v) throw new Error('useTweetStore must be used inside TweetStoreProvider');
  return v;
}

export function useTweet(id) {
  const { tweetsById } = useTweetStore();
  return id == null ? null : tweetsById[id] || null;
}

export function useTweetList(ids) {
  const { tweetsById } = useTweetStore();
  return useMemo(
    () => (Array.isArray(ids) ? ids.map((id) => tweetsById[id]).filter(Boolean) : []),
    [ids, tweetsById],
  );
}

/* FollowContext — estado reactivo de "a quem eu sigo".
 *
 *  O backend não expõe contadores de seguidores/seguindo nem listagem de
 *  quem segue quem. A única coisa que podemos saber com fiabilidade é o
 *  conjunto de utilizadores que o próprio utilizador autenticado segue
 *  (gerido por nós através de POST/DELETE /api/utilizadores/:id/seguir).
 *
 *  Este contexto centraliza esse conjunto e propaga mutações para todas
 *  as vistas (Profile, Discover, RightRail) — antes cada página mantinha
 *  o seu próprio Set local que ficava desactualizado quando seguíamos
 *  alguém noutra página.
 *
 *  Persistido em localStorage (pulse.following.v1) através de users.js,
 *  o que também activa sincronização cross-tab via storage event.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as usersApi from '../api/users.js';
import { useAuth } from './AuthContext.jsx';

const FollowContext = createContext(null);
const STORAGE_KEY = 'pulse.following.v1';

function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw).map(String) : []);
  } catch { return new Set(); }
}

export function FollowProvider({ children }) {
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState(readFromStorage);

  // Sincronização cross-tab: outro separador segue/unfollow → reflectimos aqui.
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) setFollowingIds(readFromStorage());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Logout / troca de utilizador → re-sincroniza com o storage (que auth.js limpa).
  useEffect(() => {
    setFollowingIds(readFromStorage());
  }, [user?.id]);

  const isFollowing = useCallback(
    (id) => id != null && followingIds.has(String(id)),
    [followingIds],
  );

  const follow = useCallback(async (targetUserId) => {
    if (targetUserId == null) return false;
    // Update óptimista; users.js trata 409 como sucesso idempotente.
    setFollowingIds((prev) => {
      if (prev.has(String(targetUserId))) return prev;
      const next = new Set(prev); next.add(String(targetUserId)); return next;
    });
    try {
      await usersApi.follow({ followingId: targetUserId });
      return true;
    } catch (e) {
      // Rollback
      setFollowingIds((prev) => {
        if (!prev.has(String(targetUserId))) return prev;
        const next = new Set(prev); next.delete(String(targetUserId)); return next;
      });
      throw e;
    }
  }, []);

  const unfollow = useCallback(async (targetUserId) => {
    if (targetUserId == null) return false;
    setFollowingIds((prev) => {
      if (!prev.has(String(targetUserId))) return prev;
      const next = new Set(prev); next.delete(String(targetUserId)); return next;
    });
    try {
      await usersApi.unfollow({ followingId: targetUserId });
      return true;
    } catch (e) {
      setFollowingIds((prev) => {
        if (prev.has(String(targetUserId))) return prev;
        const next = new Set(prev); next.add(String(targetUserId)); return next;
      });
      throw e;
    }
  }, []);

  /** Limpa o set local (usado no logout). */
  const reset = useCallback(() => {
    setFollowingIds(new Set());
  }, []);

  const value = useMemo(() => ({
    followingIds,
    followingCount: followingIds.size,
    isFollowing,
    follow,
    unfollow,
    reset,
  }), [followingIds, isFollowing, follow, unfollow, reset]);

  return <FollowContext.Provider value={value}>{children}</FollowContext.Provider>;
}

export function useFollow() {
  const v = useContext(FollowContext);
  if (!v) throw new Error('useFollow must be used inside FollowProvider');
  return v;
}

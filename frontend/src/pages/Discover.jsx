import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { PIcon } from '../components/PIcon.jsx';
import { FollowButton } from '../components/FollowButton.jsx';
import { SkeletonTweet, EmptyState, ErrorState } from '../components/States.jsx';
import { listUsers, getCourses, getFollowCounts, getFollowingIds } from '../api/users.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export function Discover() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState(['Todos']);
  const [course, setCourse] = useState('Todos');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [followingIds, setFollowingIds] = useState(() => new Set());

  useEffect(() => {
    getCourses().then(setCourses).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setStatus('loading'); setError(null);
    try {
      const data = await listUsers({ q, course, excludeId: user.id });
      setUsers(data);
      setStatus(data.length === 0 ? 'empty' : 'success');
      setFollowingIds(new Set(getFollowingIds(user.id)));
    } catch (e) {
      setError(e.message); setStatus('error');
    }
  }, [q, course, user]);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const m = {};
    users.forEach((u) => { m[u.id] = getFollowCounts(u.id); });
    return m;
  }, [users]);

  function onFollowChange(targetId, isFollowing) {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.add(targetId); else next.delete(targetId);
      return next;
    });
  }

  return (
    <AppShell
      title="Utilizadores"
      subtitle="Descobre pessoas para seguir"
      search={q}
      onSearch={setQ}
      searchPlaceholder="Pesquisar por nome ou curso"
    >
      <div className="filter-pills">
        {courses.map((c) => (
          <button
            key={c}
            className={`filter-pill ${course === c ? 'filter-pill--active' : ''}`}
            onClick={() => setCourse(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {status === 'loading' && (
        <div className="user-grid">
          {[0, 1, 2, 3].map((i) => <SkeletonTweet key={i} />)}
        </div>
      )}
      {status === 'error' && <ErrorState message={error} onRetry={load} />}
      {status === 'empty' && (
        <EmptyState
          icon="search"
          title="Sem resultados"
          description="Tenta ajustar a pesquisa ou o filtro de curso."
        />
      )}
      {status === 'success' && (
        <div className="user-grid">
          {users.map((u) => (
            <article key={u.id} className="user-card fade-up">
              <div className="user-card__head">
                <Link to={`/perfil/${u.username}`}>
                  <Avatar name={u.name} paletteIndex={u.avatarColor} size={56} />
                </Link>
                <div className="user-card__head-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Link
                      to={`/perfil/${u.username}`}
                      style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-hi)' }}
                    >
                      {u.name}
                    </Link>
                    {u.verified && <PIcon name="verified" size={14} color="var(--primary)" />}
                  </div>
                  <div style={{ color: 'var(--text-mute)', fontSize: 13 }}>@{u.username}</div>
                  {u.course && (
                    <div className="user-card__chip">
                      <PIcon name="cap" size={12} /> {u.course}
                    </div>
                  )}
                </div>
                <FollowButton
                  targetUserId={u.id}
                  initialFollowing={followingIds.has(u.id)}
                  onChange={(f) => onFollowChange(u.id, f)}
                />
              </div>
              {u.bio && <p className="user-card__bio">{u.bio}</p>}
              <div className="user-card__stats">
                <span><b>{counts[u.id]?.followers ?? 0}</b> seguidores</span>
                <span><b>{counts[u.id]?.following ?? 0}</b> a seguir</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PIcon } from '../components/PIcon.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { FollowButton } from '../components/FollowButton.jsx';
import { suggestionsFor } from '../api/users.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const TRENDS = [
  ['#InteligênciaArtificial', '2 341 publicações'],
  ['#CiênciaDeDados',          '1 892 publicações'],
  ['#EstudarMelhor',           '1 210 publicações'],
  ['#Erasmus2026',             '864 publicações'],
];

export function RightRail() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    if (!user) return;
    suggestionsFor(user.id, 4)
      .then((data) => { if (alive) { setSuggestions(data); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user]);

  return (
    <aside className="rail">
      <section className="rail__section">
        <header className="rail__header">
          <span className="rail__title">Sugestões para seguir</span>
          <PIcon name="users" size={18} color="var(--brand-violet-400)" />
        </header>
        {loading && [0, 1, 2].map((i) => (
          <div key={i} className="user-card-row">
            <div className="skel skel-circle" style={{ width: 44, height: 44 }} />
            <div style={{ flex: 1 }}>
              <div className="skel" style={{ width: '60%', height: 12, marginBottom: 6 }} />
              <div className="skel" style={{ width: '40%', height: 10 }} />
            </div>
          </div>
        ))}
        {!loading && suggestions.length === 0 && (
          <div style={{ color: 'var(--text-mute)', fontSize: 13, padding: '12px 0' }}>
            Sem sugestões disponíveis.
          </div>
        )}
        {!loading && suggestions.map((u) => (
          <div key={u.id} className="user-card-row">
            <Link to={`/perfil/${u.username}`}>
              <Avatar name={u.name} paletteIndex={u.avatarColor} size={44} />
            </Link>
            <div className="user-card-row__info">
              <Link to={`/perfil/${u.username}`} className="user-card-row__name">{u.name}</Link>
              <div className="user-card-row__handle">@{u.username}</div>
              {u.course && <div className="user-card-row__dept">{u.course}</div>}
            </div>
            <FollowButton targetUserId={u.id} />
          </div>
        ))}
        <Link to="/utilizadores" className="rail__cta" style={{ background: 'transparent', textDecoration: 'none' }}>
          Ver mais sugestões <PIcon name="arrowRight" size={14} />
        </Link>
      </section>

      <section className="rail__section">
        <header className="rail__header">
          <span className="rail__title">Tendências académicas</span>
          <PIcon name="chart" size={18} color="var(--primary)" />
        </header>
        {TRENDS.map(([t, c]) => (
          <div key={t} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-hi)', fontSize: 14 }}>{t}</div>
            <div style={{ color: 'var(--text-mute)', fontSize: 12 }}>{c}</div>
          </div>
        ))}
      </section>
    </aside>
  );
}

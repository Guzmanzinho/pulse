import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminShell } from '../layouts/AdminShell.jsx';
import { PIcon } from '../components/PIcon.jsx';
import { Button } from '../components/Button.jsx';
import { CenterLoading } from '../components/States.jsx';
import { adminListUsers } from '../api/users.js';
import { adminListTweets } from '../api/tweets.js';

const STAT_BASE = [
  { key: 'users',  icon: 'users',   label: 'Total de utilizadores', bg: 'var(--primary-soft)', fg: 'var(--brand-blue-600)' },
  { key: 'tweets', icon: 'comment', label: 'Total de publicações',  bg: '#EEEAFF',             fg: 'var(--brand-violet-500)' },
  { key: 'likes',  icon: 'heart',   label: 'Total de gostos',       bg: '#FFE2EC',             fg: 'var(--brand-pink-500)' },
  { key: 'admins', icon: 'shield',  label: 'Administradores',       bg: '#FFF1D6',             fg: '#D97706' },
];

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminListUsers(), adminListTweets()])
      .then(([u, t]) => {
        const likes = t.reduce((acc, x) => acc + x.likes, 0);
        const admins = u.filter((x) => x.role === 'admin').length;
        setStats({ users: u.length, tweets: t.length, likes, admins });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell title="Backoffice" subtitle="Visão geral da plataforma e gestão de conteúdos.">
      {loading ? (
        <CenterLoading />
      ) : (
        <>
          <div className="admin-stats">
            {STAT_BASE.map((s) => (
              <div key={s.key} className="stat-card">
                <div className="stat-card__icon" style={{ background: s.bg, color: s.fg }}>
                  <PIcon name={s.icon} size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="stat-card__label">{s.label}</div>
                  <div className="stat-card__value">
                    {stats[s.key].toLocaleString('pt-PT')}
                  </div>
                  <div className="stat-card__sub">vs. semana anterior</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <Link to="/admin/utilizadores" style={{ textDecoration: 'none' }}>
              <div
                className="rail__section"
                style={{ cursor: 'pointer', transition: 'border-color var(--dur-interact), transform var(--dur-interact)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <header className="rail__header">
                  <span className="rail__title">Gestão de utilizadores</span>
                  <PIcon name="users" size={20} color="var(--primary)" />
                </header>
                <p style={{ color: 'var(--text-mute)', fontSize: 13.5, margin: '6px 0 14px', lineHeight: 1.5 }}>
                  Visualiza, edita ou elimina contas de utilizador da plataforma.
                </p>
                <Button variant="secondary" icon="arrowRight">Abrir gestão</Button>
              </div>
            </Link>
            <Link to="/admin/publicacoes" style={{ textDecoration: 'none' }}>
              <div
                className="rail__section"
                style={{ cursor: 'pointer', transition: 'border-color var(--dur-interact), transform var(--dur-interact)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--brand-violet-500)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <header className="rail__header">
                  <span className="rail__title">Gestão de publicações</span>
                  <PIcon name="file" size={20} color="var(--brand-violet-500)" />
                </header>
                <p style={{ color: 'var(--text-mute)', fontSize: 13.5, margin: '6px 0 14px', lineHeight: 1.5 }}>
                  Modera todas as publicações da comunidade. Edita ou elimina conteúdos problemáticos.
                </p>
                <Button variant="secondary" icon="arrowRight">Abrir gestão</Button>
              </div>
            </Link>
          </div>
        </>
      )}
    </AdminShell>
  );
}

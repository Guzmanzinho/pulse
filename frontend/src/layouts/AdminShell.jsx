import { NavLink, useNavigate } from 'react-router-dom';
import { PulseLogo } from '../components/PulseLogo.jsx';
import { PIcon } from '../components/PIcon.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { TopBar } from './TopBar.jsx';
import { BottomNav } from './BottomNav.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const ITEMS = [
  { to: '/admin',               label: 'Visão geral',  icon: 'chart',   end: true },
  { to: '/admin/utilizadores',  label: 'Utilizadores', icon: 'users' },
  { to: '/admin/publicacoes',   label: 'Publicações',  icon: 'file' },
];

export function AdminShell({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <NavLink to="/admin" aria-label="Pulse Admin"><PulseLogo size={30} /></NavLink>
        </div>
        <nav className="sidebar__nav">
          {ITEMS.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
            >
              <PIcon name={it.icon} size={20} color="var(--text-mute)" />
              {it.label}
            </NavLink>
          ))}
          <NavLink to="/feed" className="sidebar__link" style={{ marginTop: 8 }}>
            <PIcon name="home" size={20} color="var(--text-mute)" />
            Voltar à app
          </NavLink>
          <button
            type="button"
            onClick={async () => { await logout(); navigate('/'); }}
            className="sidebar__link"
            style={{ background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}
          >
            <PIcon name="logout" size={20} color="var(--text-mute)" />
            Sair
          </button>
        </nav>

        <div className="sidebar__footer">
          <Avatar name={user?.name || '?'} paletteIndex={user?.avatarColor} size={36} />
          <div className="sidebar__footer-info">
            <div className="sidebar__footer-name">{user?.name}</div>
            <div className="sidebar__footer-sub sidebar__footer-sub--admin">Administrador</div>
          </div>
        </div>
      </aside>
      <div className="shell__main">
        <TopBar title={title} subtitle={subtitle} showSearch={false} />
        <main className="shell__content" style={{ maxWidth: 'none' }}>
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

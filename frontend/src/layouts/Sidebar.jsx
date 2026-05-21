import { NavLink, useNavigate } from 'react-router-dom';
import { PulseLogo } from '../components/PulseLogo.jsx';
import { PIcon } from '../components/PIcon.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const ITEMS = [
  { to: '/feed',          label: 'Início',        icon: 'home' },
  { to: '/perfil',        label: 'Perfil',        icon: 'user' },
  { to: '/utilizadores',  label: 'Utilizadores',  icon: 'users' },
];

export function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    ...ITEMS,
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: 'shield' }] : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <NavLink to="/feed" aria-label="Pulse"><PulseLogo size={30} /></NavLink>
      </div>
      <nav className="sidebar__nav">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === '/feed'}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          >
            <PIcon name={it.icon} size={20} color="var(--text-mute)" />
            {it.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={async () => { await logout(); navigate('/'); }}
          className="sidebar__link"
          style={{ marginTop: 8, background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}
        >
          <PIcon name="logout" size={20} color="var(--text-mute)" />
          Sair
        </button>
      </nav>

      <NavLink to="/perfil" className="sidebar__footer">
        <Avatar name={user?.name || '?'} paletteIndex={user?.avatarColor} size={36} />
        <div className="sidebar__footer-info">
          <div className="sidebar__footer-name">{user?.name}</div>
          <div className={`sidebar__footer-sub ${isAdmin ? 'sidebar__footer-sub--admin' : ''}`}>
            {isAdmin ? 'Administrador' : `@${user?.username || ''}`}
          </div>
        </div>
        <PIcon name="chevronRight" size={16} color="var(--text-mute)" />
      </NavLink>
    </aside>
  );
}

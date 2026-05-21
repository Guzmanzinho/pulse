import { NavLink } from 'react-router-dom';
import { PIcon } from '../components/PIcon.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export function BottomNav() {
  const { isAdmin } = useAuth();
  const items = [
    { to: '/feed',         label: 'Início',  icon: 'home' },
    { to: '/utilizadores', label: 'Explorar',icon: 'users' },
    { to: '/perfil',       label: 'Perfil',  icon: 'user' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: 'shield' }] : []),
  ];
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === '/feed'}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <PIcon name={it.icon} size={22} />
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

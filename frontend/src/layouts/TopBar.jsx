import { useNavigate } from 'react-router-dom';
import { PIcon } from '../components/PIcon.jsx';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

export function TopBar({ title, subtitle, showSearch = true, onSearch, search, searchPlaceholder = 'Pesquisar' }) {
  const navigate = useNavigate();

  function onKey(e) {
    if (e.key === 'Enter' && onSearch) onSearch(e.target.value);
  }

  return (
    <header className="topbar">
      <div className="topbar__title-group">
        <h1 className="topbar__title">{title}</h1>
        {subtitle && <div className="topbar__subtitle">{subtitle}</div>}
      </div>
      {showSearch && (
        <label className="topbar__search">
          <PIcon name="search" size={18} color="var(--text-mute)" />
          <input
            placeholder={searchPlaceholder}
            value={search ?? ''}
            onChange={(e) => onSearch?.(e.target.value)}
            onKeyDown={onKey}
            aria-label={searchPlaceholder}
          />
        </label>
      )}
      <button
        className="topbar__bell"
        aria-label="Notificações"
        onClick={() => navigate('/feed')}
      >
        <PIcon name="bell" size={20} />
        <span className="topbar__bell-dot">3</span>
      </button>
      <ThemeToggle />
    </header>
  );
}

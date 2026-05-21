import { PIcon } from './PIcon.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      <span className="theme-toggle__sun"><PIcon name="sun" size={16} /></span>
      <span className="theme-toggle__moon"><PIcon name="moon" size={16} /></span>
      <span className="theme-toggle__knob" />
    </button>
  );
}

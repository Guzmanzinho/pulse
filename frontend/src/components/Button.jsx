import { PIcon } from './PIcon.jsx';

export function Spinner({ size = 16 }) {
  return (
    <span className="spin" aria-hidden>
      <svg width={size} height={size} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity=".25" fill="none" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    </span>
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  loading = false,
  disabled = false,
  danger = false,
  full = false,
  type = 'button',
  iconOnly = false,
  className = '',
  ...rest
}) {
  const cls = [
    'btn',
    `btn--${size}`,
    `btn--${variant}`,
    danger ? 'btn--danger' : '',
    full ? 'btn--full' : '',
    iconOnly ? 'btn--icon-only' : '',
    className,
  ].filter(Boolean).join(' ');

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading ? <Spinner size={iconSize} /> : icon ? <PIcon name={icon} size={iconSize} /> : null}
      {children}
    </button>
  );
}

import { PIcon } from './PIcon.jsx';
import { Button } from './Button.jsx';

export function SkeletonTweet() {
  return (
    <div className="state-skeleton">
      <div className="skel skel-circle" style={{ width: 44, height: 44 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skel" style={{ width: 160, height: 12 }} />
        <div className="skel" style={{ width: '100%', height: 10 }} />
        <div className="skel" style={{ width: '80%', height: 10 }} />
        <div className="skel" style={{ width: '100%', height: 120, marginTop: 4, borderRadius: 12 }} />
      </div>
    </div>
  );
}

export function EmptyState({ icon = 'users', title, description, cta }) {
  return (
    <div className="state-empty">
      <div className="state-empty__icon">
        <PIcon name={icon} size={44} />
      </div>
      <div className="state-empty__title">{title}</div>
      {description && <div className="state-empty__desc">{description}</div>}
      {cta}
    </div>
  );
}

export function ErrorState({ title = 'Algo correu mal', message, onRetry }) {
  return (
    <div className="state-error" role="alert">
      <div className="state-error__icon">
        <PIcon name="alert" size={22} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="state-error__title">{title}</div>
        <div className="state-error__desc">{message || 'Verifica a tua ligação à internet ou tenta novamente em alguns segundos.'}</div>
        {onRetry && (
          <div className="state-error__actions">
            <Button variant="primary" size="md" icon="arrowUp" onClick={onRetry}>
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CenterLoading({ label = 'A carregar…' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 60, color: 'var(--text-mute)', flexDirection: 'column', gap: 12,
    }}>
      <span className="spin" style={{ color: 'var(--primary)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity=".25" fill="none" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      </span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

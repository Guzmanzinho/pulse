import { createContext, useCallback, useContext, useMemo, useState, useRef } from 'react';
import { PIcon } from '../components/PIcon.jsx';

const ToastContext = createContext(null);
const ICONS = { success: 'check', error: 'alert', info: 'info' };

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback((kind, message, duration = 3000) => {
    const id = nextId++;
    setToasts((ts) => [...ts, { id, kind, message }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (m, d) => push('success', m, d),
    error:   (m, d) => push('error', m, d),
    info:    (m, d) => push('info', m, d),
    dismiss,
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-host" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`} role="status">
            <PIcon name={ICONS[t.kind]} size={18} className="toast__icon" />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              className="field__icon-btn"
              onClick={() => dismiss(t.id)}
              aria-label="Fechar"
              style={{ marginLeft: 8 }}
            >
              <PIcon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

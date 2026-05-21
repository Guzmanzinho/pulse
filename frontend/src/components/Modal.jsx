import { useEffect } from 'react';
import { Button } from './Button.jsx';
import { PIcon } from './PIcon.jsx';

export function Modal({ open, onClose, title, children, actions, tone = 'default' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toneStyle = {
    danger: { bg: 'rgba(229,72,77,.16)', color: 'var(--danger)', icon: 'alert' },
    info:   { bg: 'var(--primary-soft)',  color: 'var(--primary)', icon: 'info' },
    default:{ bg: 'var(--bg-subtle)',     color: 'var(--text)',    icon: 'info' },
  }[tone] || {};

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__head">
          <div className="modal__icon-wrap" style={{ background: toneStyle.bg, color: toneStyle.color }}>
            <PIcon name={toneStyle.icon} size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="modal__title">{title}</h3>
            <div className="modal__desc">{children}</div>
          </div>
        </div>
        <div className="modal__actions">{actions}</div>
      </div>
    </div>
  );
}

export function ConfirmDeleteModal({ open, onCancel, onConfirm, what, working }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      tone="danger"
      title={`Eliminar ${what}?`}
      actions={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={working}>Cancelar</Button>
          <Button variant="primary" danger icon="trash" onClick={onConfirm} loading={working}>
            Eliminar definitivamente
          </Button>
        </>
      }
    >
      Esta ação é permanente e não pode ser desfeita.
    </Modal>
  );
}

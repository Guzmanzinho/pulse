import { useState, forwardRef, useId } from 'react';
import { PIcon } from './PIcon.jsx';

export const Input = forwardRef(function Input(
  { label, icon, type = 'text', error, hint, className = '', id, ...rest },
  ref
) {
  const reactId = useId();
  const inputId = id || `i-${reactId}`;
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  const effectiveType = isPwd ? (show ? 'text' : 'password') : type;

  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={inputId} className="field__label">{label}</label>}
      <div className={`field__control ${error ? 'field__control--error' : ''}`}>
        {icon && <PIcon name={icon} size={18} color="var(--text-mute)" />}
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          className="field__input"
          {...rest}
        />
        {isPwd && (
          <button
            type="button"
            className="field__icon-btn"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Esconder password' : 'Mostrar password'}
            tabIndex={-1}
          >
            <PIcon name={show ? 'eye' : 'eyeOff'} size={18} />
          </button>
        )}
      </div>
      {error && (
        <span className="field__hint field__hint--error">
          <PIcon name="alert" size={13} /> {error}
        </span>
      )}
      {hint && !error && <span className="field__hint">{hint}</span>}
    </div>
  );
});

export const TextArea = forwardRef(function TextArea(
  { label, error, className = '', id, ...rest },
  ref
) {
  const reactId = useId();
  const tid = id || `t-${reactId}`;
  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={tid} className="field__label">{label}</label>}
      <div className={`field__control ${error ? 'field__control--error' : ''}`} style={{ alignItems: 'stretch', padding: 12 }}>
        <textarea ref={ref} id={tid} className="field__input" style={{ resize: 'vertical', minHeight: 90 }} {...rest} />
      </div>
      {error && <span className="field__hint field__hint--error">{error}</span>}
    </div>
  );
});

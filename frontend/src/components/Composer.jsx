import { useRef, useState, useEffect } from 'react';
import { Avatar } from './Avatar.jsx';
import { PIcon } from './PIcon.jsx';
import { Button } from './Button.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { createTweet } from '../api/tweets.js';

const MAX = 280;
const WARN = 220;

export function Composer({ onCreated, autoFocus = false }) {
  const { user } = useAuth();
  const toast = useToast();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);    // File | null
  const [preview, setPreview] = useState(null); // string (dataURL) | null
  const [posting, setPosting] = useState(false);
  const fileRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { if (autoFocus) taRef.current?.focus(); }, [autoFocus]);

  const remaining = MAX - text.length;
  const ratio = Math.min(text.length / MAX, 1);
  const countClass =
    text.length >= MAX ? 'composer__count-text--danger'
    : text.length >= WARN ? 'composer__count-text--warn'
    : '';
  const ringColor =
    text.length >= MAX ? 'var(--danger)'
    : text.length >= WARN ? 'var(--warning)'
    : 'var(--primary)';
  const C = 2 * Math.PI * 9;

  function pickImage() { fileRef.current?.click(); }
  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Apenas ficheiros de imagem são suportados.');
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      toast.error('A imagem é muito grande (máx 4 MB).');
      return;
    }
    setImage(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
    e.target.value = '';
  }

  async function submit() {
    if (!user) return;
    if (!text.trim() && !image) {
      toast.error('Escreve algo ou adiciona uma imagem.');
      return;
    }
    if (text.length > MAX) {
      toast.error(`Limite de ${MAX} caracteres excedido.`);
      return;
    }
    setPosting(true);
    try {
      const tweet = await createTweet({ text, image });
      setText('');
      setImage(null);
      setPreview(null);
      toast.success('Publicação criada com sucesso.');
      onCreated?.(tweet);
    } catch (err) {
      toast.error(err.message || 'Não foi possível publicar.');
    } finally {
      setPosting(false);
    }
  }

  const disabled = posting || (!text.trim() && !image) || text.length > MAX;

  return (
    <div className="composer">
      <Avatar name={user?.name || '?'} paletteIndex={user?.avatarColor} size={44} />
      <div className="composer__body">
        <textarea
          ref={taRef}
          className="composer__textarea"
          placeholder="O que estás a pensar?"
          value={text}
          maxLength={MAX + 50}
          onChange={(e) => setText(e.target.value)}
          aria-label="Compositor de publicação"
        />
        {preview && (
          <div className="composer__preview">
            <img src={preview} alt="Pré-visualização" />
            <button
              type="button"
              className="composer__preview-remove"
              onClick={() => { setImage(null); setPreview(null); }}
              aria-label="Remover imagem"
            >
              <PIcon name="close" size={16} />
            </button>
          </div>
        )}

        <div className="composer__actions">
          <button
            type="button"
            className="composer__img-btn"
            onClick={pickImage}
            aria-label="Adicionar imagem"
          >
            <PIcon name="image" size={18} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            style={{ display: 'none' }}
            aria-hidden
          />

          <div className="composer__counter">
            <span className={`composer__count-text ${countClass}`}>
              {remaining < 0 ? `${Math.abs(remaining)} a mais` : `${remaining} caracteres restantes`}
            </span>
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="var(--border)" strokeWidth="2.5" fill="none" />
              <circle
                cx="12" cy="12" r="9"
                stroke={ringColor}
                strokeWidth="2.5"
                fill="none"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - ratio)}
                transform="rotate(-90 12 12)"
                strokeLinecap="round"
                style={{ transition: 'stroke 180ms, stroke-dashoffset 180ms' }}
              />
            </svg>
            <Button variant="primary" size="md" onClick={submit} disabled={disabled} loading={posting}>
              Publicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

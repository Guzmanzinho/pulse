import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar.jsx';
import { PIcon } from './PIcon.jsx';
import { Button } from './Button.jsx';
import { likeTweet, unlikeTweet, comentar } from '../api/tweets.js';
import { resolveMedia } from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useTweet, useTweetStore } from '../contexts/TweetStoreContext.jsx';
import { formatRelative } from '../utils/time.js';

const COMMENT_MAX = 280;

function HeartBurst() {
  return (
    <>
      <span className="tweet__heart-ring" />
      {[-30, -10, 15, 40, 60, 90, 120, 160].map((deg, i) => {
        const r = 26 + (i % 2) * 4;
        const x = Math.cos((deg * Math.PI) / 180) * r;
        const y = Math.sin((deg * Math.PI) / 180) * r;
        return (
          <span
            key={i}
            className="tweet__heart-particle"
            style={{
              background: i % 2 ? 'var(--brand-pink-500)' : 'var(--brand-violet-400)',
              ['--p']: `translate(${x}px, ${y}px)`,
            }}
          />
        );
      })}
    </>
  );
}

export function TweetCard({ tweet: propTweet, onChange, onMenu }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { update } = useTweetStore();

  // O store é a fonte de verdade. Cai-se para a prop apenas se o tweet
  // ainda não foi inserido no store (caso muito raro, ex: render inicial).
  const stored = useTweet(propTweet?.id);
  const tweet = stored || propTweet;

  const liked = !!tweet.likedByMe;
  const count = tweet.likes ?? 0;
  const commentList = tweet.commentList || [];
  const commentsCount = tweet.comments ?? commentList.length;

  const [bursting, setBursting] = useState(false);
  const [pending, setPending] = useState(false);

  // Comentários (estado puramente de UI: form aberto, draft, in-flight)
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const commentRef = useRef(null);

  const author = tweet.author;
  const time = useMemo(() => formatRelative(tweet.createdAt), [tweet.createdAt]);

  useEffect(() => { if (composing) commentRef.current?.focus(); }, [composing]);

  async function handleLike(e) {
    e.stopPropagation();
    if (!user) {
      toast.info('Faz login para gostar de publicações.');
      navigate('/login');
      return;
    }
    if (pending) return;
    setPending(true);

    const next = !liked;
    const original = { likedByMe: liked, likes: count };
    // Update óptimista no store — propaga para todas as vistas.
    update(tweet.id, {
      likedByMe: next,
      likes: count + (next ? 1 : -1),
    });
    if (next) {
      setBursting(true);
      setTimeout(() => setBursting(false), 700);
    }
    try {
      if (next) await likeTweet({ tweetId: tweet.id });
      else await unlikeTweet({ tweetId: tweet.id });
      onChange?.({ ...tweet, likedByMe: next, likes: count + (next ? 1 : -1) });
    } catch (err) {
      // Rollback
      update(tweet.id, original);
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  }

  function handleToggleComment(e) {
    e.stopPropagation();
    if (!user) {
      toast.info('Faz login para comentar.');
      navigate('/login');
      return;
    }
    setComposing((v) => !v);
  }

  async function submitComment(e) {
    e?.preventDefault?.();
    if (posting) return;
    const clean = draft.trim();
    if (!clean) {
      toast.error('Escreve algo para comentar.');
      return;
    }
    if (clean.length > COMMENT_MAX) {
      toast.error(`Limite de ${COMMENT_MAX} caracteres excedido.`);
      return;
    }
    setPosting(true);
    try {
      const created = await comentar({ tweetId: tweet.id, conteudo: clean });
      const optimistic = {
        id: created?.comentario_id ?? `tmp-${Date.now()}`,
        text: clean,
        authorId: user.id,
        authorName: user.name,
        authorUsername: user.username,
        avatarColor: user.avatarColor,
        createdAt: created?.criado_em ? new Date(created.criado_em).getTime() : Date.now(),
      };
      const nextList = [...commentList, optimistic];
      // Mutação no store → propaga para todos os feeds.
      update(tweet.id, { comments: nextList.length, commentList: nextList });
      setDraft('');
      onChange?.({ ...tweet, comments: nextList.length, commentList: nextList });
      toast.success('Comentário publicado.');
    } catch (err) {
      toast.error(err.message || 'Não foi possível comentar.');
    } finally {
      setPosting(false);
    }
  }

  return (
    <article className="tweet fade-up">
      <Link to={`/perfil/${author.username}`} aria-label={author.name}>
        <Avatar name={author.name} size={44} paletteIndex={author.avatarColor} />
      </Link>
      <div className="tweet__body">
        <header className="tweet__header">
          <Link to={`/perfil/${author.username}`} className="tweet__name">
            {author.name}
          </Link>
          {author.verified && <PIcon name="verified" size={15} color="var(--primary)" />}
          <Link to={`/perfil/${author.username}`} className="tweet__handle">@{author.username}</Link>
          <span style={{ color: 'var(--text-faint)' }}>·</span>
          <span className="tweet__time">{time}</span>
          {onMenu && (
            <button className="tweet__menu" onClick={() => onMenu(tweet)} aria-label="Mais opções">
              <PIcon name="dots" size={18} />
            </button>
          )}
        </header>
        {tweet.text && <p className="tweet__text">{tweet.text}</p>}
        {tweet.image && (
          <div className="tweet__image">
            <img src={resolveMedia(tweet.image)} alt="" loading="lazy" />
          </div>
        )}
        <div className="tweet__actions">
          <button
            className={`tweet__action ${composing ? 'tweet__action--liked' : ''}`}
            onClick={handleToggleComment}
            aria-label={composing ? 'Cancelar comentário' : 'Comentar'}
            aria-expanded={composing}
            type="button"
          >
            <PIcon name="comment" size={18} />
            <span>{commentsCount}</span>
          </button>
          <button className="tweet__action" aria-label="Repostar">
            <PIcon name="repost" size={18} />
            <span>0</span>
          </button>
          <button
            className={`tweet__action ${liked ? 'tweet__action--liked' : ''}`}
            onClick={handleLike}
            aria-label={liked ? 'Deixar de gostar' : 'Gostar'}
            aria-pressed={liked}
          >
            <span className={`tweet__heart ${bursting ? 'tweet__heart--burst' : ''}`}>
              <PIcon name="heart" size={18} filled={liked} color={liked ? 'var(--brand-pink-500)' : undefined} />
              {bursting && <HeartBurst />}
            </span>
            <span style={{ minWidth: 18, textAlign: 'left' }}>{count}</span>
          </button>
          <button className="tweet__action" style={{ marginLeft: 'auto' }} aria-label="Partilhar">
            <PIcon name="share" size={18} />
          </button>
        </div>

        {composing && (
          <div
            className="fade-up"
            style={{
              marginTop: 10,
              padding: 12,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {commentList.length > 0 ? (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: 320,
                  overflowY: 'auto',
                }}
                aria-label="Lista de comentários"
              >
                {commentList.map((c) => (
                  <li
                    key={c.id}
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: '8px 10px',
                      background: 'var(--bg-raised)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                    }}
                  >
                    <Avatar name={c.authorName} paletteIndex={c.avatarColor} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-hi)', fontSize: 13.5 }}>
                          {c.authorName}
                        </span>
                        {c.authorUsername && (
                          <span style={{ color: 'var(--text-mute)', fontSize: 12.5 }}>
                            @{c.authorUsername}
                          </span>
                        )}
                        <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>·</span>
                        <span style={{ color: 'var(--text-mute)', fontSize: 12 }}>
                          {formatRelative(c.createdAt)}
                        </span>
                      </div>
                      <p style={{
                        margin: '2px 0 0', color: 'var(--text)', fontSize: 14,
                        lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      }}>
                        {c.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: 'var(--text-mute)', fontSize: 13, padding: '2px 4px' }}>
                Ainda sem comentários. Sê o primeiro a responder.
              </div>
            )}

            <form
              onSubmit={submitComment}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
            <textarea
              ref={commentRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Responder a @${author.username}…`}
              maxLength={COMMENT_MAX + 50}
              aria-label="Escrever comentário"
              rows={2}
              style={{
                width: '100%',
                resize: 'vertical',
                minHeight: 60,
                padding: '8px 10px',
                background: 'var(--bg-raised)',
                color: 'var(--text-hi)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontFamily: 'inherit',
                fontSize: 14,
                lineHeight: 1.4,
                outline: 'none',
              }}
              disabled={posting}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 12,
                color: draft.length > COMMENT_MAX ? 'var(--danger)'
                  : draft.length >= COMMENT_MAX - 60 ? 'var(--warning)'
                  : 'var(--text-mute)',
              }}>
                {COMMENT_MAX - draft.length} caracteres restantes
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => { setComposing(false); setDraft(''); }}
                  disabled={posting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={posting}
                  disabled={posting || !draft.trim() || draft.length > COMMENT_MAX}
                >
                  Comentar
                </Button>
              </div>
            </div>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}

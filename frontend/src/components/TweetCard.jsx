import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar.jsx';
import { PIcon } from './PIcon.jsx';
import { likeTweet, unlikeTweet } from '../api/tweets.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { formatRelative } from '../utils/time.js';

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

export function TweetCard({ tweet, onChange, onMenu }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(tweet.likedByMe);
  const [count, setCount] = useState(tweet.likes);
  const [bursting, setBursting] = useState(false);
  const [pending, setPending] = useState(false);

  const author = tweet.author;
  const time = useMemo(() => formatRelative(tweet.createdAt), [tweet.createdAt]);

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
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    if (next) {
      setBursting(true);
      setTimeout(() => setBursting(false), 700);
    }
    try {
      const updated = next
        ? await likeTweet({ userId: user.id, tweetId: tweet.id })
        : await unlikeTweet({ userId: user.id, tweetId: tweet.id });
      onChange?.(updated);
    } catch (err) {
      setLiked(!next);
      setCount((c) => c - (next ? 1 : -1));
      toast.error(err.message);
    } finally {
      setPending(false);
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
            <img src={tweet.image} alt="" loading="lazy" />
          </div>
        )}
        <div className="tweet__actions">
          <button className="tweet__action" aria-label="Comentar">
            <PIcon name="comment" size={18} />
            <span>0</span>
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
      </div>
    </article>
  );
}

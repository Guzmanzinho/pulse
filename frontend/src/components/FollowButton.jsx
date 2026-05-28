import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useFollow } from '../contexts/FollowContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useNavigate } from 'react-router-dom';

/** O estado "estou a seguir?" vive no FollowContext, por isso os props
 *  `initialFollowing` e `onChange` deixam de ser necessários. Mantemos-os
 *  como no-ops opcionais para retro-compatibilidade com callers antigos. */
export function FollowButton({ targetUserId, onChange }) {
  const { user } = useAuth();
  const { isFollowing, follow, unfollow } = useFollow();
  const toast = useToast();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const following = isFollowing(targetUserId);

  async function toggle() {
    if (!user) {
      toast.info('Faz login para seguir outros utilizadores.');
      navigate('/login');
      return;
    }
    if (pending || Number(user.id) === Number(targetUserId)) return;
    setPending(true);
    const next = !following;
    try {
      if (next) await follow(targetUserId);
      else await unfollow(targetUserId);
      onChange?.(next);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  }

  if (user && Number(user.id) === Number(targetUserId)) {
    return null;
  }

  return (
    <button
      type="button"
      className={`follow-btn ${following ? 'follow-btn--following' : ''}`}
      onClick={toggle}
      disabled={pending}
      aria-pressed={following}
    >
      <span className="follow-btn__label">
        <span className="follow-btn__label-text">{following ? 'A seguir' : 'Seguir'}</span>
      </span>
    </button>
  );
}

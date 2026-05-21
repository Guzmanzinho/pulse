import { useState } from 'react';
import { follow, unfollow } from '../api/users.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useNavigate } from 'react-router-dom';

export function FollowButton({ targetUserId, initialFollowing = false, onChange }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!user) {
      toast.info('Faz login para seguir outros utilizadores.');
      navigate('/login');
      return;
    }
    if (pending || user.id === targetUserId) return;
    setPending(true);
    const next = !following;
    setFollowing(next);
    try {
      await (next ? follow : unfollow)({ followerId: user.id, followingId: targetUserId });
      onChange?.(next);
    } catch (err) {
      setFollowing(!next);
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  }

  if (user && user.id === targetUserId) {
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

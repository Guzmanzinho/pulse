import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { PIcon } from '../components/PIcon.jsx';
import { Button } from '../components/Button.jsx';
import { FollowButton } from '../components/FollowButton.jsx';
import { TweetCard } from '../components/TweetCard.jsx';
import { Modal } from '../components/Modal.jsx';
import { Input, TextArea } from '../components/Input.jsx';
import { SkeletonTweet, EmptyState, ErrorState } from '../components/States.jsx';
import { getUserByUsername, getFollowCounts, getFollowingIds } from '../api/users.js';
import { listByUser } from '../api/tweets.js';
import { updateMe } from '../api/auth.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { formatDate } from '../utils/time.js';

export function Profile() {
  const { username } = useParams();
  const { user: me, refresh } = useAuth();
  const toast = useToast();
  const target = username || me?.username;

  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [following, setFollowing] = useState(false);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('posts'); // posts | likes | images
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    if (!target) return;
    setStatus('loading'); setError(null);
    try {
      const u = await getUserByUsername(target);
      setProfile(u);
      setCounts(getFollowCounts(u.id));
      setFollowing(new Set(getFollowingIds(me.id)).has(u.id));
      const list = await listByUser(u.id, me.id);
      setTweets(list);
      setStatus('success');
    } catch (e) {
      setError(e.message); setStatus('error');
    }
  }, [target, me]);

  useEffect(() => { load(); }, [load]);

  const isMe = me && profile && me.id === profile.id;

  const displayed = tab === 'images'
    ? tweets.filter((t) => t.image)
    : tab === 'likes'
      ? tweets.filter((t) => t.likedByMe)
      : tweets;

  function onTweetChange(updated) {
    setTweets((ts) => ts.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
  }

  if (status === 'loading') {
    return (
      <AppShell title="Perfil" subtitle="A carregar…">
        {[0, 1].map((i) => <SkeletonTweet key={i} />)}
      </AppShell>
    );
  }
  if (status === 'error') {
    return (
      <AppShell title="Perfil" subtitle="">
        <ErrorState message={error} onRetry={load} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Perfil" subtitle={isMe ? 'A tua conta Pulse' : 'Conhece melhor esta pessoa'}>
      <div className="profile-card fade-up">
        <div className="profile-banner">
          <svg viewBox="0 0 800 200" preserveAspectRatio="none">
            <path
              d="M 0 100 H 120 L 150 60 L 200 160 L 260 30 L 320 170 L 380 70 L 440 130 L 800 100"
              stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
            />
            <circle cx="120" cy="40" r="2" fill="#fff" />
            <circle cx="640" cy="160" r="2" fill="#fff" />
            <circle cx="720" cy="60" r="3" fill="#fff" opacity=".7" />
          </svg>
        </div>
        <div className="profile-body">
          <div className="profile-avatar">
            <Avatar
              name={profile.name}
              paletteIndex={profile.avatarColor}
              size={140}
              ring="var(--bg-raised)"
              status="online"
            />
          </div>
          <div className="profile-meta">
            <h2>
              {profile.name}
              {profile.verified && (
                <PIcon name="verified" size={20} color="var(--primary)" style={{ marginLeft: 8, verticalAlign: -2 }} />
              )}
            </h2>
            <div className="profile-meta__handle">@{profile.username}</div>
            {profile.bio && <p className="profile-meta__bio">{profile.bio}</p>}
            <div className="profile-meta__info">
              {profile.course && <span><PIcon name="cap" size={14} color="var(--brand-violet-400)" /> {profile.course}</span>}
              <span><PIcon name="calendar" size={14} /> Membro desde {formatDate(profile.joinedAt)}</span>
            </div>
          </div>
          <div className="profile-actions">
            {isMe ? (
              <Button variant="secondary" icon="pencil" onClick={() => setEditing(true)}>
                Editar perfil
              </Button>
            ) : (
              <FollowButton
                targetUserId={profile.id}
                initialFollowing={following}
                onChange={(f) => { setFollowing(f); setCounts((c) => ({ ...c, followers: c.followers + (f ? 1 : -1) })); }}
              />
            )}
          </div>
        </div>
        <div className="profile-stats">
          <div><b>{tweets.length}</b><span>Publicações</span></div>
          <div><b>{counts.followers}</b><span>Seguidores</span></div>
          <div><b>{counts.following}</b><span>A seguir</span></div>
        </div>
      </div>

      <div className="tabs">
        {[
          ['posts',  'Publicações', 'book'],
          ['likes',  'Gostos',      'heart'],
          ['images', 'Imagens',     'image'],
        ].map(([k, l, ic]) => (
          <button
            key={k}
            className={`tabs__btn ${tab === k ? 'tabs__btn--active' : ''}`}
            onClick={() => setTab(k)}
          >
            <PIcon name={ic} size={16} /> {l}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon={tab === 'images' ? 'image' : tab === 'likes' ? 'heart' : 'book'}
          title={
            tab === 'images' ? 'Sem imagens publicadas' :
            tab === 'likes'  ? 'Sem publicações de que tenhas gostado' :
                               'Sem publicações ainda'
          }
          description={isMe ? 'Partilha algo novo a partir do feed.' : ' '}
        />
      ) : (
        displayed.map((t) => <TweetCard key={t.id} tweet={t} onChange={onTweetChange} />)
      )}

      {editing && (
        <EditProfileModal
          user={profile}
          onClose={() => setEditing(false)}
          onSaved={async () => {
            setEditing(false);
            refresh();
            await load();
            toast.success('Perfil atualizado.');
          }}
        />
      )}
    </AppShell>
  );
}

function EditProfileModal({ user, onClose, onSaved }) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [course, setCourse] = useState(user.course || '');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function save() {
    setSaving(true);
    try {
      await updateMe({ name, bio, course });
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Editar perfil"
      tone="info"
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" onClick={save} loading={saving}>Guardar</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Curso" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Ex: Engenharia Informática" />
        <TextArea label="Bio" value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))} placeholder="Algumas palavras sobre ti…" />
        <small style={{ color: 'var(--text-mute)' }}>{bio.length}/200 caracteres</small>
      </div>
    </Modal>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell.jsx';
import { Composer } from '../components/Composer.jsx';
import { TweetCard } from '../components/TweetCard.jsx';
import { SkeletonTweet, EmptyState, ErrorState } from '../components/States.jsx';
import { Button } from '../components/Button.jsx';
import { listFeed } from '../api/tweets.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export function Feed() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | success | empty | error
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('following'); // following | all

  const load = useCallback(async (m = mode) => {
    setStatus('loading'); setError(null);
    try {
      const data = await listFeed({ viewerId: user.id, mode: m });
      setTweets(data);
      setStatus(data.length === 0 ? 'empty' : 'success');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }, [user, mode]);

  useEffect(() => { load(mode); }, [load, mode]);

  function handleCreated(tweet) {
    setTweets((ts) => [tweet, ...ts]);
    setStatus('success');
  }
  function handleChange(updated) {
    setTweets((ts) => ts.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
  }

  return (
    <AppShell title="Início" subtitle="O que se passa na tua universidade">
      <Composer onCreated={handleCreated} />

      <div className="tabs" style={{ marginTop: 4 }}>
        <button
          className={`tabs__btn ${mode === 'following' ? 'tabs__btn--active' : ''}`}
          onClick={() => setMode('following')}
        >
          A seguir
        </button>
        <button
          className={`tabs__btn ${mode === 'all' ? 'tabs__btn--active' : ''}`}
          onClick={() => setMode('all')}
        >
          Toda a comunidade
        </button>
      </div>

      {status === 'loading' && [0, 1, 2].map((i) => <SkeletonTweet key={i} />)}
      {status === 'error' && <ErrorState message={error} onRetry={() => load(mode)} />}
      {status === 'empty' && (
        <EmptyState
          icon="users"
          title="Ainda não há publicações"
          description={
            mode === 'following'
              ? 'Segue colegas e investigadores para veres aqui o que eles partilham.'
              : 'A comunidade está silenciosa. Sê tu o primeiro a publicar!'
          }
          cta={
            <Link to="/utilizadores">
              <Button variant="primary" size="lg" icon="users">Explorar utilizadores</Button>
            </Link>
          }
        />
      )}
      {status === 'success' && tweets.map((t) => (
        <TweetCard key={t.id} tweet={t} onChange={handleChange} />
      ))}
    </AppShell>
  );
}

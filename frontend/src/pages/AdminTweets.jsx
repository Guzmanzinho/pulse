import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../layouts/AdminShell.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { PIcon } from '../components/PIcon.jsx';
import { Button } from '../components/Button.jsx';
import { Input, TextArea } from '../components/Input.jsx';
import { Modal, ConfirmDeleteModal } from '../components/Modal.jsx';
import { SkeletonTweet, ErrorState, EmptyState } from '../components/States.jsx';
import { adminListTweets, adminUpdateTweet, adminDeleteTweet } from '../api/tweets.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { formatRelative, formatDateTime } from '../utils/time.js';

const PAGE_SIZE = 8;
const MAX = 280;

export function AdminTweets() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [type, setType] = useState('Todos');
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading'); setError(null);
    try {
      const data = await adminListTweets({ q });
      setItems(data);
      setStatus(data.length === 0 ? 'empty' : 'success');
    } catch (e) {
      setError(e.message); setStatus('error');
    }
  }, [q]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [q, type]);

  const filtered = useMemo(() => {
    if (type === 'Imagem') return items.filter((t) => t.image);
    if (type === 'Texto')  return items.filter((t) => !t.image);
    return items;
  }, [items, type]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  async function onSave(patch) {
    setWorking(true);
    try {
      await adminUpdateTweet(editing.id, patch);
      toast.success('Publicação atualizada.');
      setEditing(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setWorking(false);
    }
  }

  async function onDelete() {
    setWorking(true);
    try {
      await adminDeleteTweet(deleting.id);
      toast.success('Publicação eliminada.');
      setDeleting(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <AdminShell title="Gestão de publicações" subtitle="Modera todas as publicações da plataforma.">
      <section className="admin-section">
        <header className="admin-section__head">
          <h3 className="admin-section__title">{filtered.length} publicações</h3>
          <div className="admin-section__filters">
            <div style={{ width: 240 }}>
              <Input icon="search" placeholder="Pesquisar publicação ou autor" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Todos', 'Texto', 'Imagem'].map((t) => (
                <button
                  key={t}
                  className={`filter-pill ${type === t ? 'filter-pill--active' : ''}`}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </header>

        {status === 'loading' && (
          <div style={{ padding: 18 }}>
            {[0, 1, 2].map((i) => <SkeletonTweet key={i} />)}
          </div>
        )}
        {status === 'error' && <div style={{ padding: 18 }}><ErrorState message={error} onRetry={load} /></div>}
        {status === 'empty' && <div style={{ padding: 18 }}><EmptyState icon="file" title="Sem publicações" description="Tenta limpar a pesquisa." /></div>}

        {status === 'success' && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Publicação</th><th>Autor</th><th>Tipo</th><th>Gostos</th><th>Data</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((t) => (
                    <tr key={t.id}>
                      <td style={{ maxWidth: 340 }}>
                        <div className="data-table__user">
                          {t.image
                            ? <img src={t.image} alt="" style={{ width: 38, height: 30, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                            : <div style={{ width: 38, height: 30, borderRadius: 6, background: 'var(--bg-subtle)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PIcon name="comment" size={16} color="var(--text-mute)" />
                              </div>
                          }
                          <span className="data-table__excerpt">{t.text || '(sem texto)'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="data-table__user">
                          <Avatar name={t.author.name} paletteIndex={t.author.avatarColor} size={28} />
                          <div>
                            <div className="data-table__user-name">{t.author.name}</div>
                            <div className="data-table__user-handle">@{t.author.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`pill ${t.image ? 'pill--mod' : 'pill--user'}`}>
                          {t.image ? 'Imagem' : 'Texto'}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text)' }}>
                          <PIcon name="heart" size={14} color="var(--brand-pink-500)" />{t.likes}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-mute)' }} title={formatDateTime(t.createdAt)}>
                        {formatRelative(t.createdAt)}
                      </td>
                      <td>
                        <div className="table-actions">
                          <Button variant="secondary" size="sm" icon="pencil" onClick={() => setEditing(t)}>Editar</Button>
                          <Button variant="primary" size="sm" danger icon="trash" onClick={() => setDeleting(t)}>Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>
                {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div className="pagination__pages">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <PIcon name="chevronLeft" size={14} />
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? 'page-btn--active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button className="page-btn" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>
                  <PIcon name="chevronRight" size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {editing && (
        <EditTweetModal
          tweet={editing}
          working={working}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
      <ConfirmDeleteModal
        open={!!deleting}
        what="publicação"
        working={working}
        onCancel={() => setDeleting(null)}
        onConfirm={onDelete}
      />
    </AdminShell>
  );
}

function EditTweetModal({ tweet, working, onClose, onSave }) {
  const [text, setText] = useState(tweet.text);
  const remaining = MAX - text.length;
  const disabled = working || (!text.trim() && !tweet.image) || text.length > MAX;
  return (
    <Modal
      open
      onClose={onClose}
      title="Editar publicação"
      tone="info"
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={working}>Cancelar</Button>
          <Button variant="primary" loading={working} disabled={disabled} onClick={() => onSave({ text })}>
            Guardar
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        <TextArea label="Texto" value={text} onChange={(e) => setText(e.target.value)} maxLength={MAX + 50} />
        <small style={{ color: remaining < 0 ? 'var(--danger)' : 'var(--text-mute)' }}>
          {remaining < 0 ? `${Math.abs(remaining)} caracteres a mais` : `${remaining} restantes`}
        </small>
        {tweet.image && (
          <div style={{ marginTop: 8 }}>
            <img src={tweet.image} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)' }} />
          </div>
        )}
      </div>
    </Modal>
  );
}

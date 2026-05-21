import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../layouts/AdminShell.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { PIcon } from '../components/PIcon.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { Modal, ConfirmDeleteModal } from '../components/Modal.jsx';
import { SkeletonTweet, ErrorState, EmptyState } from '../components/States.jsx';
import { adminListUsers, adminUpdateUser, adminDeleteUser } from '../api/users.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatDate } from '../utils/time.js';

const PAGE_SIZE = 8;

export function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading'); setError(null);
    try {
      const data = await adminListUsers({ q });
      setUsers(data);
      setStatus(data.length === 0 ? 'empty' : 'success');
    } catch (e) {
      setError(e.message); setStatus('error');
    }
  }, [q]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [q]);

  const pageCount = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const slice = useMemo(
    () => users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [users, page]
  );

  async function onSave(patch) {
    setWorking(true);
    try {
      await adminUpdateUser(editing.id, patch);
      toast.success('Utilizador atualizado.');
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
      await adminDeleteUser(deleting.id);
      toast.success(`${deleting.name} eliminado.`);
      setDeleting(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <AdminShell title="Gestão de utilizadores" subtitle="Visualiza, edita e elimina contas da plataforma.">
      <section className="admin-section">
        <header className="admin-section__head">
          <h3 className="admin-section__title">{users.length} utilizadores</h3>
          <div className="admin-section__filters">
            <div style={{ width: 240 }}>
              <Input icon="search" placeholder="Pesquisar por nome, @ ou email" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
        </header>

        {status === 'loading' && (
          <div style={{ padding: 18 }}>
            {[0, 1, 2].map((i) => <SkeletonTweet key={i} />)}
          </div>
        )}
        {status === 'error' && <div style={{ padding: 18 }}><ErrorState message={error} onRetry={load} /></div>}
        {status === 'empty' && <div style={{ padding: 18 }}><EmptyState icon="users" title="Sem utilizadores" description="Tenta limpar a pesquisa." /></div>}

        {status === 'success' && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Utilizador</th><th>Email</th><th>Função</th><th>Estado</th><th>Registado em</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="data-table__user">
                          <Avatar name={u.name} paletteIndex={u.avatarColor} size={32} />
                          <div>
                            <div className="data-table__user-name">{u.name}</div>
                            <div className="data-table__user-handle">@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`pill ${u.role === 'admin' ? 'pill--admin' : 'pill--user'}`}>
                          {u.role === 'admin' ? 'Administrador' : 'Utilizador'}
                        </span>
                      </td>
                      <td>
                        <span className="status-dot pill--active">Ativo</span>
                      </td>
                      <td style={{ color: 'var(--text-mute)' }}>{formatDate(u.joinedAt)}</td>
                      <td>
                        <div className="table-actions">
                          <Button variant="secondary" size="sm" icon="pencil" onClick={() => setEditing(u)}>Editar</Button>
                          <Button
                            variant="primary"
                            size="sm"
                            danger
                            icon="trash"
                            disabled={u.id === me?.id}
                            onClick={() => setDeleting(u)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>
                {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, users.length)} de {users.length}
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
        <EditUserModal
          user={editing}
          working={working}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
      <ConfirmDeleteModal
        open={!!deleting}
        what={deleting?.name || ''}
        working={working}
        onCancel={() => setDeleting(null)}
        onConfirm={onDelete}
      />
    </AdminShell>
  );
}

function EditUserModal({ user, working, onClose, onSave }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [course, setCourse] = useState(user.course || '');

  return (
    <Modal
      open
      onClose={onClose}
      title={`Editar ${user.name}`}
      tone="info"
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={working}>Cancelar</Button>
          <Button variant="primary" loading={working} onClick={() => onSave({ name, email, role, course })}>
            Guardar
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Curso" value={course} onChange={(e) => setCourse(e.target.value)} />
        <div className="field">
          <label className="field__label">Função</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['user', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                className={`filter-pill ${role === r ? 'filter-pill--active' : ''}`}
                onClick={() => setRole(r)}
              >
                {r === 'admin' ? 'Administrador' : 'Utilizador'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

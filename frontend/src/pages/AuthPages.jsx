import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PulseLogo } from '../components/PulseLogo.jsx';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { PIcon } from '../components/PIcon.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

function AuthShell({ mode, children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        backgroundImage:
          'radial-gradient(circle at 0% 50%, rgba(110,79,232,.10), transparent 40%), radial-gradient(circle at 100% 50%, rgba(46,91,255,.08), transparent 40%)',
        padding: 'clamp(16px, 4vw, 32px)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <Link to="/" aria-label="Pulse"><PulseLogo size={28} /></Link>
        <ThemeToggle />
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
        <div
          className="fade-up"
          style={{
            width: 480, maxWidth: '100%',
            background: 'var(--bg-raised)', borderRadius: 22, padding: 'clamp(20px, 4vw, 36px)',
            boxShadow: 'var(--shadow-3)', border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'flex', gap: 0, background: 'var(--bg-subtle)',
              padding: 4, borderRadius: 12, position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute', top: 4, bottom: 4,
                left: mode === 'login' ? 4 : '50%',
                width: 'calc(50% - 4px)',
                background: 'var(--bg-raised)',
                borderRadius: 9, boxShadow: 'var(--shadow-1)',
                transition: 'left 260ms var(--ease-transition)',
              }}
            />
            {[['login', 'Entrar', '/login'], ['register', 'Registar', '/registo']].map(([k, l, to]) => (
              <Link
                key={k}
                to={to}
                replace
                style={{
                  position: 'relative', flex: 1, height: 42,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontWeight: 700, fontSize: 14,
                  color: mode === k ? 'var(--primary)' : 'var(--text-mute)',
                  textDecoration: 'none',
                  transition: 'color var(--dur-interact)',
                }}
              >
                <PIcon name="user" size={16} /> {l}
              </Link>
            ))}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null); setSubmitting(true);
    try {
      const u = await login(form);
      toast.success(`Bem-vindo, ${u.name}!`);
      const dest = location.state?.from || '/feed';
      navigate(dest, { replace: true });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell mode="login">
      <div style={{ textAlign: 'center', marginTop: 28, marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--text-hi)', letterSpacing: -0.5 }}>
          Bem-vindo de volta
        </h2>
        <div style={{ color: 'var(--text-mute)', fontSize: 14, marginTop: 6 }}>
          Entra na tua conta para continuar
        </div>
      </div>

      {err && (
        <div
          role="alert"
          className="fade-up"
          style={{
            background: 'rgba(229,72,77,.10)', border: '1px solid rgba(229,72,77,.30)',
            borderRadius: 10, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)',
            fontSize: 13, fontWeight: 600, marginBottom: 16,
          }}
        >
          <PIcon name="alert" size={16} /> {err}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input
          label="Nome de utilizador"
          icon="user"
          value={form.username}
          onChange={(e) => set('username', e.target.value)}
          placeholder="@joaomartins"
          autoComplete="username"
          required
        />
        <Input
          label="Password"
          icon="lock"
          type="password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          placeholder="A tua password"
          autoComplete="current-password"
          required
        />
        <Button variant="primary" size="lg" full type="submit" loading={submitting}>
          Entrar
        </Button>
        <div style={{
          textAlign: 'center', fontSize: 13.5, color: 'var(--text-mute)', marginTop: 4,
        }}>
          Ainda não tens conta?{' '}
          <Link to="/registo" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Registar
          </Link>
        </div>
        <div style={{
          marginTop: 10, padding: 12,
          background: 'var(--bg-subtle)', borderRadius: 10,
          fontSize: 12.5, color: 'var(--text-mute)', lineHeight: 1.5,
        }}>
          <strong style={{ color: 'var(--text-hi)' }}>Contas de demonstração:</strong><br />
          Utilizador: <span className="mono">martasilva</span> · password: <span className="mono">pulse123</span><br />
          Admin: <span className="mono">admin</span> · password: <span className="mono">admin123</span>
        </div>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '', confirm: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    if (form.password !== form.confirm) {
      setErr('As passwords não coincidem.');
      return;
    }
    setSubmitting(true);
    try {
      const u = await register({
        username: form.username,
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast.success(`Conta criada. Olá, ${u.name}!`);
      navigate('/feed', { replace: true });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell mode="register">
      <div style={{ textAlign: 'center', marginTop: 28, marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--text-hi)', letterSpacing: -0.5 }}>
          Cria a tua conta
        </h2>
        <div style={{ color: 'var(--text-mute)', fontSize: 14, marginTop: 6 }}>
          Junta-te à comunidade Pulse hoje
        </div>
      </div>

      {err && (
        <div
          role="alert"
          className="fade-up"
          style={{
            background: 'rgba(229,72,77,.10)', border: '1px solid rgba(229,72,77,.30)',
            borderRadius: 10, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)',
            fontSize: 13, fontWeight: 600, marginBottom: 16,
          }}
        >
          <PIcon name="alert" size={16} /> {err}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input
          label="Nome de utilizador"
          icon="user"
          value={form.username}
          onChange={(e) => set('username', e.target.value.replace(/\s+/g, '').toLowerCase())}
          placeholder="joaomartins"
          required
          minLength={3}
          autoComplete="username"
        />
        <Input
          label="Nome completo"
          icon="user"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="João Martins"
          required
          autoComplete="name"
        />
        <Input
          label="Email"
          icon="mail"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="joao@univ.pt"
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          icon="lock"
          type="password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <Input
          label="Confirmar password"
          icon="lock"
          type="password"
          value={form.confirm}
          onChange={(e) => set('confirm', e.target.value)}
          placeholder="Repete a password"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <Button variant="primary" size="lg" full type="submit" loading={submitting}>
          Criar conta
        </Button>
        <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text-mute)', marginTop: 4 }}>
          Já tens conta?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Entrar</Link>
        </div>
      </form>
    </AuthShell>
  );
}

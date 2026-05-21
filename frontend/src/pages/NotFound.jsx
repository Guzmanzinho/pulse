import { Link } from 'react-router-dom';
import { PulseLogo } from '../components/PulseLogo.jsx';
import { Button } from '../components/Button.jsx';

export function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, gap: 18, textAlign: 'center',
    }}>
      <PulseLogo size={36} />
      <h1 style={{ margin: 0, fontSize: 56, fontWeight: 800, color: 'var(--text-hi)', letterSpacing: -1.5 }}>404</h1>
      <p style={{ margin: 0, fontSize: 16, color: 'var(--text-mute)', maxWidth: 420 }}>
        A página que procuras não existe ou foi movida.
      </p>
      <Link to="/"><Button variant="primary" icon="home">Voltar ao início</Button></Link>
    </div>
  );
}

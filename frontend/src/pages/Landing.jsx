import { Link } from 'react-router-dom';
import { PulseLogo } from '../components/PulseLogo.jsx';
import { PIcon } from '../components/PIcon.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Button } from '../components/Button.jsx';
import { ThemeToggle } from '../components/ThemeToggle.jsx';

const FEATURES = [
  { icon: 'pencil', title: 'Publicações',         bg: 'var(--primary-soft)',         fg: 'var(--brand-blue-600)',   desc: 'Partilha ideias, perguntas e opiniões com textos curtos e impactantes.' },
  { icon: 'image',  title: 'Imagens',             bg: '#E0F8EE',                     fg: '#16A34A',                 desc: 'Ilustra as tuas ideias com imagens e torna as tuas publicações mais ricas.' },
  { icon: 'users',  title: 'Seguir utilizadores', bg: '#EFE9FF',                     fg: 'var(--brand-violet-500)', desc: 'Segue colegas, professores e investigadores e cria a tua rede académica.' },
  { icon: 'heart',  title: 'Gostos',              bg: '#FFE2EC',                     fg: 'var(--brand-pink-500)',   desc: 'Gosta do que te inspira e ajuda a destacar as melhores conversas.' },
  { icon: 'shield', title: 'Backoffice',          bg: '#FFF1D6',                     fg: '#D97706',                 desc: 'Ferramentas poderosas para gestão, análise e administração da plataforma.' },
];

export function Landing() {
  return (
    <div
      style={{
        minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text)',
        backgroundImage: 'radial-gradient(circle at 88% 4%, rgba(110,79,232,.10), transparent 38%), radial-gradient(circle at 2% 92%, rgba(46,91,255,.10), transparent 35%)',
      }}
    >
      <header
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px clamp(20px, 5vw, 56px)',
          background: 'transparent',
          backdropFilter: 'blur(8px)',
          position: 'sticky', top: 0, zIndex: 5,
          flexWrap: 'wrap', gap: 12,
        }}
      >
        <PulseLogo size={32} />
        <nav style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }} className="landing__nav">
          {['Funcionalidades', 'Recursos', 'Sobre', 'Para Universidades'].map((l) => (
            <a key={l} href="#features" style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>
              {l}
            </a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          <Link to="/login"><Button variant="ghost">Entrar</Button></Link>
          <Link to="/registo"><Button variant="primary">Registar</Button></Link>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{
          padding: 'clamp(32px, 6vw, 64px) clamp(20px, 5vw, 56px) 32px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)',
          gap: 'clamp(24px, 5vw, 56px)',
          alignItems: 'center',
        }}
        className="landing-hero"
      >
        <div className="fade-up">
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 999,
              background: 'var(--primary-soft)', color: 'var(--brand-blue-600)',
              fontSize: 13, fontWeight: 600,
              border: '1px solid var(--brand-blue-100)', marginBottom: 22,
            }}
          >
            <PIcon name="cap" size={16} />
            A plataforma académica para conversas que importam
          </div>
          <h1 style={{
            margin: 0, fontSize: 'clamp(38px, 6vw, 64px)', fontWeight: 800,
            lineHeight: 1.04, letterSpacing: '-1.5px', color: 'var(--text-hi)',
          }}>
            Partilha ideias <br />em <span style={{ color: 'var(--primary)' }}>tempo real</span>
          </h1>
          <p style={{ margin: '20px 0 32px', fontSize: 17, color: 'var(--text-mute)', lineHeight: 1.55, maxWidth: 480 }}>
            Publica, segue, gosta e descobre novas conversas. Uma rede académica feita para partilhar conhecimento.
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/registo"><Button variant="primary" size="lg" icon="arrowRight">Começar agora</Button></Link>
            <Link to="/login"><Button variant="ghost" size="lg" icon="play">Já tens conta?</Button></Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 36, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {['Marta Silva', 'João Martins', 'Inês Almeida', 'Rafael Costa', 'Beatriz Lopes'].map((n, i) => (
                <div key={n} style={{ marginLeft: i ? -10 : 0 }}>
                  <Avatar name={n} size={34} ring="var(--bg-base)" />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-mute)', lineHeight: 1.5 }}>
              Junta-te a <span style={{ color: 'var(--text-hi)', fontWeight: 700 }}>milhares de estudantes</span><br />
              e investigadores em todo o país.
            </div>
          </div>
        </div>

        {/* Mockup card */}
        <div
          className="fade-up"
          style={{
            position: 'relative',
            background: 'var(--bg-raised)', borderRadius: 22, padding: 22,
            boxShadow: 'var(--shadow-3)', border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            {['Para ti', 'A seguir', 'Universidade'].map((t, i) => (
              <span
                key={t}
                style={{
                  fontSize: 12.5, fontWeight: 700, padding: '4px 8px',
                  color: i === 0 ? 'var(--primary)' : 'var(--text-mute)',
                  borderBottom: i === 0 ? '2px solid var(--primary)' : 'none',
                }}
              >
                {t}
              </span>
            ))}
          </div>
          {[
            { name: 'Marta Silva', handle: '@martasilva', time: '5 min', text: 'Dia produtivo no campus! 📚 Nada melhor do que terminar com uma boa sessão de estudo.', likes: 24 },
            { name: 'João Martins', handle: '@joaomartins', time: '1 h',   text: 'Alguém já terminou o exercício 4 da ficha de Infra? 😅 Estou preso num ciclo infinito…', likes: 12 },
            { name: 'Inês Almeida', handle: '@inesalmeida', time: '3 h',   text: 'Workshop de Design Systems amanhã às 14h. Não percam! 💜', likes: 8 },
          ].map((t, i) => (
            <div
              key={t.handle}
              style={{
                border: '1px solid var(--border)', borderRadius: 12,
                padding: 12, display: 'flex', gap: 10, marginTop: 12,
                animation: `pulse-fade-up 260ms var(--ease-transition) ${i * 100}ms both`,
              }}
            >
              <Avatar name={t.name} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-hi)' }}>
                  {t.name} <span style={{ color: 'var(--text-mute)', fontWeight: 500 }}>{t.handle} · {t.time}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 4, lineHeight: 1.45 }}>
                  {t.text}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 8, color: 'var(--text-mute)', fontSize: 12 }}>
                  <span><PIcon name="comment" size={14} style={{ verticalAlign: -2 }} /> 2</span>
                  <span><PIcon name="repost" size={14} style={{ verticalAlign: -2 }} /> 1</span>
                  <span style={{ color: 'var(--brand-pink-500)' }}>
                    <PIcon name="heart" filled size={14} style={{ verticalAlign: -2 }} /> {t.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        style={{
          padding: '32px clamp(20px, 5vw, 56px) 56px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {FEATURES.map(({ icon, title, bg, fg, desc }) => (
          <div
            key={title}
            style={{
              background: 'var(--bg-raised)', borderRadius: 16, padding: 22,
              border: '1px solid var(--border)',
              transition: 'transform var(--dur-interact), border-color var(--dur-interact), box-shadow var(--dur-interact)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: bg, color: fg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
            }}>
              <PIcon name={icon} size={22} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-hi)', marginBottom: 6 }}>{title}</div>
            <div style={{ color: 'var(--text-mute)', fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ padding: '0 clamp(20px, 5vw, 56px) 56px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--brand-violet-500) 100%)',
          borderRadius: 22, padding: 'clamp(32px, 6vw, 56px)', color: '#fff',
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 24, alignItems: 'center',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Pronto para começar?
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 15, opacity: 0.88, maxWidth: 480 }}>
              Cria a tua conta gratuita e começa a partilhar ideias com a comunidade académica.
            </p>
          </div>
          <Link to="/registo">
            <Button variant="ghost" size="lg" icon="arrowRight" style={{ background: '#fff', color: 'var(--primary)' }}>
              Criar conta
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: '36px clamp(20px, 5vw, 56px) 40px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 32, alignItems: 'flex-start',
        }}
      >
        <div style={{ minWidth: 200 }}>
          <PulseLogo size={26} />
          <div style={{ color: 'var(--text-mute)', fontSize: 13, marginTop: 12, maxWidth: 260, lineHeight: 1.5 }}>
            A rede académica para partilhar ideias, conhecimento e oportunidades.
          </div>
        </div>
        {[
          ['Produto',  ['Funcionalidades', 'Novidades']],
          ['Recursos', ['Centro de Ajuda', 'Guias']],
          ['Empresa',  ['Sobre nós', 'Blogue']],
          ['Legal',    ['Termos', 'Privacidade']],
        ].map(([h, items]) => (
          <div key={h}>
            <div style={{ fontWeight: 700, color: 'var(--text-hi)', fontSize: 13.5, marginBottom: 10 }}>{h}</div>
            {items.map((i) => (
              <div key={i} style={{ fontSize: 13, color: 'var(--text-mute)', padding: '4px 0' }}>{i}</div>
            ))}
          </div>
        ))}
        <div style={{ color: 'var(--text-faint)', fontSize: 12, alignSelf: 'flex-end' }}>
          © 2026 Pulse. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

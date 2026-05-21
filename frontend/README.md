# Pulse — A pulsação da rede académica

Clone de Twitter/X em ReactJS (SPA) para o projecto 2 de **Desenvolvimento Web — Front-End** (2025/2026).

Plataforma de microblogging para a comunidade universitária com publicações de até **280 caracteres**, gostos, follow/unfollow, feed cronológico inverso, perfis de utilizador, página de descoberta, backoffice administrativo, temas claro/escuro e layout responsivo.

---

## Como executar

```bash
npm install
npm run dev          # arranca em http://localhost:5173
```

Outros scripts:

```bash
npm run build        # build de produção (dist/)
npm run preview      # serve o build localmente
```

> Node 18+ recomendado.

---

## Contas de demonstração

| Tipo  | Utilizador   | Password   |
|-------|--------------|------------|
| User  | `martasilva` | `pulse123` |
| User  | `joaomartins`| `pulse123` |
| Admin | `admin`      | `admin123` |

Podes também registar uma conta nova em `/registo`. Todos os dados são persistidos em `localStorage` no browser (mock backend).

---

## Stack

- **React 18** + **Vite 5**
- **React Router 6** — routing client-side (SPA)
- **CSS puro com variáveis** — design tokens light/dark, sem framework de UI
- **localStorage** — mock backend persistente (interface idêntica à de uma API REST real)

---

## Arquitetura

```
src/
├── api/                    # Camada de serviço (REST-like, async, com erros)
│   ├── client.js           # request() — simula latência e erros
│   ├── db.js               # mock DB em localStorage + seed
│   ├── auth.js             # login, register, sessão
│   ├── users.js            # CRUD utilizadores, follow/unfollow
│   └── tweets.js           # CRUD tweets, like/unlike, feed
├── contexts/               # State global (Context API)
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx    # data-theme="light|dark" + persistência
│   └── ToastContext.jsx
├── components/             # Átomos reutilizáveis
│   ├── PulseLogo.jsx
│   ├── PIcon.jsx           # icon set único, 50+ ícones SVG
│   ├── Avatar.jsx
│   ├── Button.jsx          # 4 variantes × 3 tamanhos
│   ├── Input.jsx
│   ├── ThemeToggle.jsx
│   ├── TweetCard.jsx       # com microinteração heart-burst
│   ├── FollowButton.jsx    # 3 estados (não segue / a seguir / largar)
│   ├── Composer.jsx        # 280 chars + imagem (preview, FileReader)
│   ├── Modal.jsx
│   └── States.jsx          # Skeleton, Empty, Error
├── layouts/
│   ├── AppShell.jsx        # Sidebar + TopBar + RightRail
│   ├── AdminShell.jsx      # Sidebar admin + TopBar
│   ├── Sidebar.jsx
│   ├── TopBar.jsx
│   ├── RightRail.jsx
│   └── BottomNav.jsx       # navegação mobile
├── pages/
│   ├── Landing.jsx
│   ├── AuthPages.jsx       # LoginPage + RegisterPage
│   ├── Feed.jsx
│   ├── Profile.jsx
│   ├── Discover.jsx
│   ├── AdminDashboard.jsx
│   ├── AdminUsers.jsx
│   ├── AdminTweets.jsx
│   └── NotFound.jsx
├── routes/
│   └── ProtectedRoute.jsx  # auth & admin guards
├── styles/
│   ├── tokens.css          # CSS variables — light/dark
│   ├── globals.css         # resets, animações @keyframes
│   └── components.css      # estilos dos componentes
├── utils/
│   └── time.js             # formatação relativa em PT-PT
├── App.jsx                 # router
└── main.jsx                # entry — providers + seed
```

### Camada de API
A camada `src/api/*` simula uma REST API real: cada função devolve uma `Promise`, com latência simulada (150–450 ms) e a opção de injetar erros para testar tratamento. Quando o backend Express+SGBD do projecto irmão estiver pronto, basta substituir as implementações destes ficheiros por `fetch()` — os componentes não mudam.

### Estados de API
Todos os ecrãs com dados implementam os 4 estados explícitos exigidos pelo design system:
- `loading` — `<SkeletonTweet />`
- `error` — `<ErrorState onRetry={...} />`
- `empty` — `<EmptyState />`
- `success` — render normal

### Temas
`ThemeContext` aplica `data-theme="light|dark"` ao `<html>`. Todos os tokens (cores, sombras, skeleton) são CSS variables — uma única troca de atributo recolore toda a aplicação. Persiste em `localStorage`. Respeita `prefers-color-scheme` na primeira visita.

### Routing
Cliente-side com React Router v6:

| Path                       | Acesso  | Página             |
|----------------------------|---------|--------------------|
| `/`                        | público | Landing            |
| `/login`                   | público | Login              |
| `/registo`                 | público | Registo            |
| `/feed`                    | auth    | Feed               |
| `/perfil`                  | auth    | Perfil (próprio)   |
| `/perfil/:username`        | auth    | Perfil (qualquer)  |
| `/utilizadores`            | auth    | Descobrir          |
| `/admin`                   | admin   | Dashboard          |
| `/admin/utilizadores`      | admin   | Gestão utilizadores|
| `/admin/publicacoes`       | admin   | Gestão publicações |
| `*`                        | público | 404                |

### Performance & re-renders
- `useCallback` / `useMemo` nos pages para evitar recriação de handlers e listas filtradas
- `React.memo`-friendly atoms (Avatar, Button, PIcon)
- API chama-se com `AbortController`-style guard via `alive` flag para evitar setState após unmount
- Imagens em `loading="lazy"`

### Acessibilidade
- Todas as imagens com `alt`, ícones com `aria-hidden`
- `aria-pressed`, `aria-modal`, `aria-live="polite"` (toasts)
- Focus ring visível em todos os elementos interativos
- `prefers-reduced-motion` desativa animações

---

## Funcionalidades implementadas (vs PDF)

| Requisito do enunciado                                  | Estado |
|---------------------------------------------------------|--------|
| Layout com Header, Footer e Menu                        | ✅      |
| Landing page                                            | ✅      |
| Alteração de tema (light/dark) em todos os componentes  | ✅      |
| Registo de utilizadores                                 | ✅      |
| Login de utilizadores                                   | ✅      |
| Publicar tweet (até 280 caracteres)                     | ✅      |
| Publicar tweet com imagem                               | ✅      |
| Seguir / deixar de seguir utilizadores                  | ✅      |
| Feed dos utilizadores seguidos (ordem cronológica inv.) | ✅      |
| Gostar / não gostar tweets                              | ✅      |
| Backoffice — gestão de utilizadores                     | ✅      |
| Backoffice — gestão de tweets                           | ✅      |
| Roteamento dinâmico cliente (SPA)                       | ✅      |
| Design responsivo (desktop + mobile)                    | ✅      |
| Estados de API (loading/error/empty/success)            | ✅      |

### Funcionalidades complementares
- Página de perfil com edição do próprio perfil
- Página de descoberta de utilizadores com filtros por curso
- Pesquisa em utilizadores e em publicações (admin)
- Paginação no backoffice
- Toasts de confirmação (success / error / info)
- Microinteração de "gosto" (heart-burst com partículas)
- Skeleton loaders animados (shimmer)
- Navegação inferior (`BottomNav`) em mobile
- Tabs no perfil (Publicações / Gostos / Imagens)
- Tabs no feed (A seguir / Toda a comunidade)

---

## Integração com backend real

Quando o backend Express+SGBD estiver disponível, basta substituir as funções em `src/api/*.js` por chamadas `fetch()`. A assinatura dos métodos (`listFeed`, `createTweet`, `login`, etc.) mantém-se igual e nenhum componente ou página precisa de ser alterado.

Exemplo de migração para `src/api/tweets.js`:
```js
export function listFeed({ viewerId, mode }) {
  return fetch(`/api/feed?mode=${mode}`, { credentials: 'include' })
    .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(new ApiError(e.message))));
}
```

---

## Limites conhecidos / TODO

- Comentários e repostagens estão visíveis na UI mas são apenas decorativos (não pedidos no PDF — implementáveis em < 30 min).
- Notificações no sino são estáticas (apenas indicador visual).
- Mensagens privadas, denúncias e analytics avançados estão marcados como opcionais no enunciado e não foram implementados.
- Double-tap para gostar (mobile) — opcional, não implementado.

---

## Design

Implementado a partir do Pulse Design System (handoff de Claude Design) — paleta azul/violeta, Plus Jakarta Sans, espaçamento de base 4 px, raios suaves 10–22 px, sombras subtis em três camadas. Microinterações respeitam `prefers-reduced-motion`.

A pasta `_design_handoff/` contém os ficheiros originais do design system (HTML/JSX), incluídos apenas para referência — não fazem parte do build.

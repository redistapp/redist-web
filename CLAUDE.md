# CLAUDE.md — redist-web

Orientações para o Claude Code trabalhar neste repositório. Leia antes de editar código.

## O que é

Site/aplicação **web** do **Redist**, sistema de **redistribuição e permuta de servidores públicos**. É a nova interface (substituindo, aos poucos, o app mobile `redist-expo-app`), com foco em **credibilidade, UX e desempenho**. Consome a API `redist-server`.

Repositórios irmãos: `redist-server` (API), `redist-expo-app` (app mobile legado), `lambda-functions`.

> Decisão de projeto: o site foi iniciado para avaliar **web × app**. A ideia é adotar apenas as **ideias gerais** do app antigo (domínio e fluxos), com UI redesenhada do zero. **Não** usar Expo/React Native aqui.

## Stack

- **Vite 8** + **React 19** + **TypeScript 6** (SPA leve).
- **Tailwind CSS v4** (via plugin `@tailwindcss/vite`; tokens em `src/index.css`).
- **react-router-dom v7** (roteamento).
- **lucide-react** (ícones) · **@fontsource-variable/inter** (fonte self-hosted, sem requisição externa).

## Comandos

```bash
npm install
npm run dev       # servidor de desenvolvimento (Vite, porta 5173)
npm run build     # tsc -b && vite build  (type-check + build de produção em dist/)
npm run preview   # serve o build de produção
npm run lint      # oxlint
```

## Docker (tier web: SPA + BFF)

O `docker-compose.yml` sobe dois serviços: `web` (Caddy servindo a SPA estática
+ HTTPS) e `bff` (buildado de `../redist-bff`). O Caddy roteia `/api/*` e
`/auth/*` para `bff:3001` e serve o resto como SPA (fallback `try_files …
/index.html`). `docker compose up -d --build`. Portas do host são
parametrizáveis (`WEB_HTTP_PORT`, para não colidir com a stack do redist-server
na 80). A SPA fala com a BFF por **mesma origem** — não há URL de API nem segredo
embutido no bundle. Ver `.env.example` (DOMAIN, API_BASE_URL, API_TOKEN, …).

## Arquitetura

```
src/
  main.tsx              entrypoint (BrowserRouter + SessionProvider + fonte + index.css)
  App.tsx               rotas: / (landing), /login, /cadastro, /painel (protegida)
  index.css            @import 'tailwindcss' + @theme com os tokens da marca
  types.ts             tipos de domínio (FullUser, Intention, Match, IdName, …)
  lib/
    cn.ts              helper para juntar classes
    api.ts             cliente HTTP base: fala com a BFF (/auth,/api, credentials:include)
    resources.ts       funções de API do domínio (getFullUser, intenções, matches, dropdowns, registerUser, updateContact)
    useAsync.ts        hook de carregamento (data/loading/error/reload)
  contexts/
    SessionContext.tsx estado de sessão (user/status) + login/logout; useSession()
  components/
    Logo.tsx           marca (selo + wordmark), tone light/dark
    ProtectedRoute.tsx redireciona p/ /login se não autenticado
    ui/                primitivos: Button, Container, Field, Select, Modal, Spinner, States (PageHeader/EmptyState/ErrorState)
    layout/            Navbar, Footer, AuthLayout (login), AppShell (área logada: nav + <Outlet/>)
    landing/           seções da landing
  pages/
    LandingPage, LoginPage, RegisterPage (cadastro multietapa)
    app/               DashboardPage, IntentionsPage, MatchesPage, ProfilePage
public/favicon.svg     marca do Redist
```

Área logada em `/painel` (layout route: `ProtectedRoute` → `AppShell` → `<Outlet/>`): `/painel` (dashboard), `/painel/intencoes`, `/painel/matches`, `/painel/perfil`. Dados via `lib/resources.ts` + `useAsync`. Cadastro é multietapa (`useState` único + dropdowns encadeados) → `registerUser` → auto-login.

Alias de import: `@/` → `src/` (configurado em `vite.config.ts` e `tsconfig.app.json`).

**Auth (via BFF):** a SPA nunca vê segredos. `lib/api.ts` chama caminhos relativos
`/auth/*` e `/api/*` com `credentials: 'include'`; a BFF (`redist-bff`) guarda o
`ApiToken` e a sessão (cookie httpOnly). Em **dev**, o Vite faz proxy de `/api` e
`/auth` para a BFF (`vite.config.ts`, `BFF_TARGET`, padrão `http://localhost:3001`)
— rode a BFF junto (`cd ../redist-bff && npm run dev`). Em **prod/Docker**, o Caddy
roteia essas rotas para o serviço `bff`.

## Design system (paleta B — "serviço em movimento")

Tokens definidos em `@theme` no `src/index.css`; o Tailwind v4 gera os utilitários:

- **`navy-*`** (`#0c2b4b` base) — superfícies escuras, títulos.
- **`brand-*`** (`#1e5fbf` em 600) — ações primárias, links, destaques.
- **`match-*`** (`#059669` em 600) — cor da **permuta/sucesso** (o "match"). Use para o CTA principal e indicadores de compatibilidade.
- **Neutros:** `slate-*` (padrão do Tailwind) para texto de apoio e bordas.
- Fonte: **Inter** (variável). Títulos com `tracking-tight`.

Convenções de UI:
- Botões via `buttonClasses(variant, size)` (ou o componente `Button`) — variantes `primary`/`match`/`secondary`/`ghost`/`onDark`. O CTA de conversão usa `match`.
- Cantos: `rounded-lg` em controles, `rounded-2xl`/`3xl` em cards/seções.
- **Tailwind v4:** gradientes são `bg-linear-*` (não `bg-gradient-*`); `ring-inset` foi removido. Atenção a isso ao adicionar utilitários.
- Textos, títulos e comentários em **português**. Sentence case.
- Responsivo mobile-first: layouts em grid/flex com breakpoints `sm`/`md`/`lg`.

## Estado atual e próximos passos

- **Pronto:** landing completa; login/logout via BFF (cookie httpOnly); **cadastro multietapa** (4 passos → auto-login); **recuperação de senha** (`/recuperar-senha` → BFF `/auth/recover-password`); **área logada** — dashboard, intenções (listar/adicionar/remover), matches, perfil (editar dados pessoais **e** profissionais). Tudo verificado ponta a ponta contra a API local.
- **Segurança:** nenhum segredo no cliente (`ApiToken`/Bearer na BFF; sessão em cookie httpOnly). **CSRF**: a SPA envia `X-Requested-By: redist-web` em toda requisição (`lib/api.ts`); a BFF exige esse header em mutações.
- Pendente: **premium/Stripe** (Fase B — a API retorna `client_secret` de PaymentIntent → Stripe Elements); **troca de instituição** no perfil (hoje o modal profissional mantém a instituição atual); upload de foto de perfil.
- Ressalvas do backend (não corrigir aqui): `GET /matches` filtra por `professional_1 = user.id` (deveria ser id de ProfessionalData) → costuma vir vazio; `updateProfile` não altera `instagram`; datas do perfil vêm sem zero-padding (`1992-7-27`).

## Verificação

Sem testes ainda. Ao concluir mudanças, rode `npm run build` (faz o type-check) e, quando possível, `npm run dev` e navegue pela tela afetada.

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
- **@stripe/stripe-js** + **@stripe/react-stripe-js** (Stripe Elements, para a assinatura Premium).

## Comandos

```bash
npm install
npm run dev       # servidor de desenvolvimento (Vite, porta 5173)
npm run build     # tsc -b && vite build  (type-check + build de produção em dist/)
npm run preview   # serve o build de produção
npm run lint      # oxlint
npm run test      # vitest run (CPF, resources puros, smoke de páginas-chave)
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
    cpf.ts             validação de CPF (dígito verificador, espelha redist-server/app/Services/Cpf.ts) + formatCpf
    resources.ts       funções de API do domínio (getFullUser, intenções, matches, dropdowns, registerUser, updateContact, changePassword)
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
    LandingPage, LoginPage, RegisterPage (cadastro multietapa), RecoverPasswordPage
    app/               DashboardPage, IntentionsPage, MatchesPage, ProfilePage, PremiumPage
public/favicon.svg     marca do Redist
```

Área logada em `/painel` (layout route: `ProtectedRoute` → `AppShell` → `<Outlet/>`): `/painel` (dashboard), `/painel/intencoes`, `/painel/matches`, `/painel/perfil`, `/painel/premium`. Dados via `lib/resources.ts` + `useAsync`. Cadastro é multietapa (`useState` único + dropdowns encadeados) → `registerUser` → auto-login.

**Premium/Stripe (`pages/app/PremiumPage.tsx`):** usa Stripe Elements (`@stripe/react-stripe-js`). Fluxo: `getStripeCustomer()` (GET `/api/stripe/customer`, cria o customer se preciso) → botão "Assinar" chama `createMonthlySubscription()` (POST `/api/stripe/subscription/monthly`, **sem** enviar `customer_id` — o servidor deriva o customer da sessão) → extrai `client_secret` de `latestInvoice.payment_intent` → monta `<Elements><PaymentElement/></Elements>` num `Modal` → `stripe.confirmPayment({redirect:'if_required'})` → em sucesso, recarrega o status. Cancelamento via `cancelSubscription()` (POST `/stripe/subscription/cancel`, com confirmação em modal). A chave publicável vem de `GET /auth/config` (rota da BFF, não do `/api/*`) — nunca embuta a chave no build.

Em `IntentionsPage`, `createIntention` lança `PremiumRequiredError` quando a API responde **402** (limite do plano gratuito) — o modal mostra um link para `/painel/premium` nesse caso.

⚠️ **Nota de ambiente:** `POST /intentions` (pré-existente, não é código deste front) chama `user.stripeCustomerId()` no servidor para checar o plano — **sem `STRIPE_SECRET_KEY` configurada, criar intenções falha também**, não só o Premium. Isso não é um bug introduzido aqui; é um acoplamento existente no `redist-server`.

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

- **Pronto:** landing completa; login/logout via BFF (cookie httpOnly); **cadastro multietapa** (4 passos, com validação de CPF por dígito verificador → auto-login); **recuperação de senha** (`/recuperar-senha` → BFF `/auth/recover-password`); **troca de senha estando logado** e **exclusão de conta/LGPD** (`ProfilePage`, card "Segurança"/"Excluir conta"); **upload de foto de perfil** (`AvatarUploader` em `ProfilePage`); **denúncia/feedback** (modal "Reportar um problema" no rodapé do `AppShell`, botão "Denunciar" nos cards de `MatchesPage`); **área logada** — dashboard, intenções (listar/adicionar/remover, com CTA para Premium ao bater o limite grátis), matches, perfil (editar dados pessoais **e** profissionais, incluindo **troca completa de instituição/carreira** via seletor encadeado estado→cidade→instituição), **Premium/Stripe** (assinar via Stripe Elements, ver status, cancelar). Tudo verificado ponta a ponta contra a API local (exceto o pagamento e o upload de foto em si — ver notas abaixo).
- **Segurança:** nenhum segredo no cliente (`ApiToken`/Bearer/`STRIPE_SECRET_KEY` ficam no servidor/BFF; sessão em cookie httpOnly; a chave **publicável** do Stripe é servida via `GET /auth/config`, o que é seguro por definição). **CSRF**: a SPA envia `X-Requested-By: redist-web` em toda requisição (`lib/api.ts`); a BFF exige esse header em mutações.
- ⚠️ **Testar o pagamento de verdade exige credenciais de teste do Stripe** que não estavam configuradas neste ambiente (`STRIPE_SECRET_KEY`/`STRIPE_PRICE_ID` no `redist-server`, `STRIPE_PUBLISHABLE_KEY` no `redist-bff`/`redist-web`). Sem elas, `/stripe/*` falha com um erro claro (`STRIPE_SECRET_KEY não configurada…`), tratado com `ErrorState` — não crasha a UI. Ver `.env.example` de cada repo.
- ⚠️ **Upload de foto** também depende de credenciais S3 reais no `redist-server` (`DRIVE_DISK=s3` + `S3_*`); sem elas, `POST /user/photo` falha com 500 tratado (não derruba a UI nem `GET /user`), mas não há como validar o resultado visual sem uma conta S3 de teste.
- Ressalva do backend (não corrigir aqui): `updateProfile` não altera `instagram`.

## Verificação

`npm run test` (Vitest + Testing Library) cobre `lib/cpf.ts`, funções puras de `lib/resources.ts` e smoke tests de `LandingPage`/`LoginPage`. `npm run build` faz o type-check. Ao concluir mudanças, rode ambos e, quando possível, `npm run dev` e navegue pela tela afetada.

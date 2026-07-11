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

## Arquitetura

```
src/
  main.tsx              entrypoint (BrowserRouter + import da fonte + index.css)
  App.tsx               rotas: / (landing), /login, /cadastro
  index.css            @import 'tailwindcss' + @theme com os tokens da marca
  lib/cn.ts            helper para juntar classes
  components/
    Logo.tsx           marca (selo + wordmark), tone light/dark
    ui/                primitivos: Button (+ buttonClasses), Container, Field
    layout/            Navbar, Footer, AuthLayout (split de login/cadastro)
    landing/           seções: Hero, Stats, HowItWorks, Features, Pricing, Faq, CtaBanner
  pages/               LandingPage, LoginPage, RegisterPage
public/favicon.svg     marca do Redist
```

Alias de import: `@/` → `src/` (configurado em `vite.config.ts` e `tsconfig.app.json`).

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

- **Pronto:** landing institucional completa (hero, números, como funciona, recursos, planos, FAQ, CTA, footer) + telas de **login** e **cadastro** (scaffold; cadastro é multietapa, só o passo 1 está montado).
- **Não conectado à API ainda.** Os formulários fazem `preventDefault` (ver `TODO` em `pages/LoginPage.tsx` e `RegisterPage.tsx`).
- ⚠️ **Segurança (importante para web):** o `API_TOKEN` estático da API fica **totalmente exposto** num front web (bundle/DevTools). Antes de conectar o login de verdade, é preciso repensar esse modelo (item S2 do parecer) — ex.: proxy/BFF que guarda o token no servidor, e sessão por cookie httpOnly. Não embuta segredos reais no cliente.
- Pendente: cliente HTTP (axios) + contexto de sessão, fluxo multietapa do cadastro, área logada (dashboard, intenções, matches, perfil, premium).

## Verificação

Sem testes ainda. Ao concluir mudanças, rode `npm run build` (faz o type-check) e, quando possível, `npm run dev` e navegue pela tela afetada.

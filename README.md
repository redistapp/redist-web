# Redist — Web

Site e aplicação **web** do **Redist**, sistema que facilita a **redistribuição e permuta de servidores públicos**. Interface moderna, responsiva e leve, que consome a API [`redist-server`](../redist-server).

Este projeto está sendo desenvolvido para avaliar o formato **web** frente ao app mobile ([`redist-expo-app`](../redist-expo-app)), com UI redesenhada do zero.

## Stack

- [Vite](https://vite.dev/) 8 · [React](https://react.dev/) 19 · TypeScript 5+
- [Tailwind CSS](https://tailwindcss.com/) v4 · [React Router](https://reactrouter.com/) v7
- lucide-react (ícones) · Inter (fonte self-hosted via Fontsource)

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173
```

Outros scripts:

```bash
npm run build      # type-check + build de produção (dist/)
npm run preview    # serve o build
npm run lint       # oxlint
```

## O que já existe

- **Landing institucional** completa e responsiva: hero, números, como funciona, recursos, planos (freemium), perguntas frequentes, chamada final e rodapé.
- Telas de **login** e **cadastro** (esta última, multietapa — passo 1 montado).

Os formulários ainda **não estão conectados à API** (ver `CLAUDE.md` para a nota de segurança sobre o `API_TOKEN` no cliente e os próximos passos).

## Estrutura

```
src/
  components/   Logo, ui (Button, Container, Field), layout (Navbar, Footer, AuthLayout), landing/
  pages/        LandingPage, LoginPage, RegisterPage
  index.css     tokens da marca (Tailwind v4 @theme)
```

Detalhes de arquitetura, design system (paleta e convenções) e próximos passos estão no [`CLAUDE.md`](CLAUDE.md).

## Repositórios relacionados

- [`redist-server`](../redist-server) — API (AdonisJS)
- [`redist-expo-app`](../redist-expo-app) — app mobile (Expo)
- [`lambda-functions`](../lambda-functions) — funções AWS Lambda

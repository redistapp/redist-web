# Redist — Web

Site e aplicação **web** do **Redist**, sistema que facilita a **redistribuição e permuta de servidores públicos**. Interface moderna, responsiva e leve, que consome a API [`redist-server`](../redist-server).

Interface principal do produto, com UI redesenhada do zero. Substituiu o app mobile ([`redist-expo-app`](../redist-expo-app)), descontinuado em ago/2026.

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

## Rodar com Docker (SPA + BFF)

O `docker-compose.yml` sobe o **tier web** completo: `web` (Caddy servindo a SPA +
HTTPS) e `bff` ([`redist-bff`](../redist-bff), que guarda o `ApiToken` e a sessão).
O Caddy roteia `/api` e `/auth` para a BFF e serve o resto como SPA (fallback para
`index.html`).

```bash
cp .env.example .env        # preencha API_TOKEN (o mesmo do redist-server)
docker compose up -d --build

# a stack do redist-server ocupa a porta 80? use outra porta no host:
WEB_HTTP_PORT=8080 WEB_HTTPS_PORT=8443 docker compose up -d --build
```

Produção (HTTPS automático): defina `DOMAIN=seu.dominio.com.br` e `ACME_EMAIL`; o
Caddy emite/renova o certificado sozinho. A BFF precisa de `API_BASE_URL` (a API
pública) e `API_TOKEN`. Ver `.env.example`.

> A SPA fala com a BFF por **mesma origem** (caminhos relativos) — não há URL de API
> nem segredo embutido no bundle.

## O que já existe

- **Landing institucional** completa e responsiva: hero, números, como funciona, recursos, planos (freemium), perguntas frequentes, chamada final e rodapé.
- **Login funcional** conectado à API via BFF: a sessão fica num cookie httpOnly, sem expor segredos ao navegador. Inclui logout e a rota protegida `/painel` (base da área logada).
- Tela de **cadastro** (multietapa — passo 1 montado, ainda sem submit).

Para desenvolver com login, rode a BFF junto: `cd ../redist-bff && npm run dev`
(o Vite faz proxy de `/api` e `/auth` para ela).

## Estrutura

```
src/
  components/   Logo, ui (Button, Container, Field), layout (Navbar, Footer, AuthLayout), landing/
  pages/        LandingPage, LoginPage, RegisterPage
  index.css     tokens da marca (Tailwind v4 @theme)
```

Detalhes de arquitetura, design system (paleta e convenções) e próximos passos estão no [`CLAUDE.md`](CLAUDE.md).

## Repositórios relacionados

- [`redist-bff`](../redist-bff) — backend-for-frontend (guarda o ApiToken e a sessão)
- [`redist-server`](../redist-server) — API (AdonisJS)
- [`redist-expo-app`](../redist-expo-app) — app mobile (Expo) — descontinuado em ago/2026, mantido como legado
- [`lambda-functions`](../lambda-functions) — funções AWS Lambda

# =============================================================================
# redist-web — imagem Docker (build da SPA + Caddy servindo os estáticos)
# -----------------------------------------------------------------------------
# Estágio 1 (builder): Node compila a SPA (Vite) -> /app/dist
# Estágio 2 (runtime): Caddy serve os estáticos com fallback de SPA + HTTPS
# =============================================================================

# ---- builder ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# A URL da API é embutida em BUILD TIME (Vite lê import.meta.env.VITE_*).
# Passe com --build-arg VITE_API_URL=... quando o login for conectado à API.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- runtime ----
FROM caddy:2-alpine AS runtime
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist /srv

EXPOSE 80 443
# A imagem base do Caddy já roda: caddy run --config /etc/caddy/Caddyfile

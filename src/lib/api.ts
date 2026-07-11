// Cliente HTTP da SPA. Fala SEMPRE com a BFF na mesma origem (caminhos
// relativos /auth e /api), com os cookies inclusos. Nenhum segredo aqui:
// o ApiToken e o Bearer ficam na BFF; a sessão é um cookie httpOnly.

export type SessionUser = {
  id: number
  cpf: string
  profile?: {
    first_name?: string
    last_name?: string
    email?: string
  } | null
} & Record<string, unknown>

async function request(path: string, init?: RequestInit): Promise<Response> {
  return fetch(path, {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
}

export async function loginRequest(cpf: string, password: string): Promise<SessionUser> {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ cpf, password }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? 'Não foi possível entrar. Tente novamente.')
  }
  const data = (await res.json()) as { user: SessionUser }
  return data.user
}

export async function logoutRequest(): Promise<void> {
  await request('/auth/logout', { method: 'POST' }).catch(() => undefined)
}

export async function meRequest(): Promise<SessionUser | null> {
  const res = await request('/auth/me')
  if (!res.ok) return null
  const data = (await res.json()) as { user: SessionUser | null }
  return data.user
}

/** Chamada autenticada genérica à API (via proxy da BFF em /api/*). */
export async function apiRequest(path: string, init?: RequestInit): Promise<Response> {
  return request(`/api${path}`, init)
}

// Cliente HTTP da SPA. Fala SEMPRE com a BFF na mesma origem (caminhos
// relativos /auth e /api), com os cookies inclusos. Nenhum segredo aqui:
// o ApiToken e o Bearer ficam na BFF; a sessão é um cookie httpOnly.

export type SessionUser = {
  id: number
  cpf: string
  is_admin?: boolean
  profile?: {
    first_name?: string
    last_name?: string
    email?: string
  } | null
} & Record<string, unknown>

async function request(path: string, init?: RequestInit): Promise<Response> {
  // Para FormData (upload de arquivo), não forçamos Content-Type — o browser
  // define automaticamente "multipart/form-data; boundary=..." sozinho.
  const isFormData = init?.body instanceof FormData
  return fetch(path, {
    credentials: 'include',
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      // Header de proteção CSRF exigido pela BFF em métodos que mudam estado.
      'X-Requested-By': 'redist-web',
      ...(init?.headers ?? {}),
    },
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

/** Login do painel administrativo — mesma sessão (cookie), autentica contra
 *  /loginadm na API (recusa quem não está na tabela admins). */
export async function adminLoginRequest(cpf: string, password: string): Promise<SessionUser> {
  const res = await request('/auth/admin-login', {
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

/** Recuperação de senha: a BFF pede à API uma nova senha (enviada por e-mail).
 *  Resposta sempre genérica — nunca revela se o CPF existe nem expõe a senha. */
export async function recoverPasswordRequest(cpf: string, dateBirth: string): Promise<void> {
  await request('/auth/recover-password', {
    method: 'POST',
    body: JSON.stringify({ cpf, date_birth: dateBirth }),
  }).catch(() => undefined)
}

/** Configuração pública da BFF (hoje: chave publicável do Stripe). GET, sem CSRF. */
export async function configRequest(): Promise<{ stripePublishableKey: string }> {
  const res = await request('/auth/config')
  if (!res.ok) return { stripePublishableKey: '' }
  return (await res.json()) as { stripePublishableKey: string }
}

/** Chamada autenticada genérica à API (via proxy da BFF em /api/*). */
export async function apiRequest(path: string, init?: RequestInit): Promise<Response> {
  return request(`/api${path}`, init)
}

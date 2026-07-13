// Funções de acesso à API do domínio, todas via proxy da BFF (/api/*).
// A BFF injeta o ApiToken e o Bearer do cookie — aqui não há segredo algum.

import { apiRequest } from '@/lib/api'
import type {
  CboItem,
  FullUser,
  IdName,
  IntentionsResponse,
  MatchesResponse,
  StateItem,
  StripeCustomer,
  StripeSubscriptionsResponse,
  SubscriptionCreated,
} from '@/types'

/** Lê o corpo de erro. A API responde em texto puro na maioria das rotas, mas
 *  os validators do Adonis (422) devolvem {errors:[{field,rule,message}]}. */
async function readError(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => '')
  if (!text) return fallback
  try {
    const parsed = JSON.parse(text) as {
      error?: string
      message?: string
      errors?: { message?: string }[]
    }
    if (parsed.errors?.length) {
      return parsed.errors.map((e) => e.message).filter(Boolean).join(' ')
    }
    return parsed.error ?? parsed.message ?? text
  } catch {
    return text
  }
}

async function getJson<T>(path: string): Promise<T> {
  const res = await apiRequest(path)
  if (!res.ok) throw new Error(await readError(res, 'Erro ao carregar dados.'))
  return (await res.json()) as T
}

// --- Perfil / usuário ---------------------------------------------------------

export function getFullUser(): Promise<FullUser> {
  return getJson<FullUser>('/user')
}

export async function updateContact(
  userId: number,
  data: {
    first_name: string
    last_name: string
    phone: string
    email: string
    home_city: number
    photo_url?: string
  },
): Promise<void> {
  const res = await apiRequest(`/users/update/profile/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível salvar.'))
}

export async function updateProfessional(
  userId: number,
  data: {
    institution_id: number
    registration: string
    office_career: number
    office_specialization: number
    cbo_id?: number
  },
): Promise<void> {
  const res = await apiRequest(`/users/update/professional/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível salvar.'))
}

/** Envia a foto de perfil (multipart/form-data). Aceita jpg/png/jpeg, até 5MB. */
export async function uploadPhoto(file: File): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiRequest('/user/photo', { method: 'POST', body: formData })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível enviar a foto.'))
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await apiRequest('/users/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível alterar a senha.'))
}

/** Exclusão de conta (LGPD). Irreversível — exige a senha atual. */
export async function deleteAccount(currentPassword: string): Promise<void> {
  const res = await apiRequest('/users/delete-account', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword }),
  })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível remover a conta.'))
}

// --- Denúncias / feedback -------------------------------------------------------

/** Reporta um problema/feedback livre sobre o site (não é sobre outro usuário). */
export async function sendFeedback(report: string): Promise<void> {
  const res = await apiRequest('/report', {
    method: 'POST',
    body: JSON.stringify({ report }),
  })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível enviar.'))
}

/** Denuncia outro usuário (ex.: a partir de um match). */
export async function reportUser(
  reportedUser: number,
  reason: string,
  observation?: string,
): Promise<void> {
  const res = await apiRequest('/report/user', {
    method: 'POST',
    body: JSON.stringify({ reported_user: reportedUser, reason, observation }),
  })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível enviar a denúncia.'))
}

// --- Intenções ----------------------------------------------------------------

export function getIntentions(): Promise<IntentionsResponse> {
  return getJson<IntentionsResponse>('/intentions')
}

/** Erro específico para quando o servidor recusa a intenção por limite do
 *  plano gratuito (HTTP 402). Permite à UI oferecer um CTA para o Premium. */
export class PremiumRequiredError extends Error {
  constructor(message = 'Você atingiu o limite de intenções do plano gratuito.') {
    super(message)
    this.name = 'PremiumRequiredError'
  }
}

export async function createIntention(institutionId: number): Promise<void> {
  const res = await apiRequest('/intentions', {
    method: 'PUT',
    body: JSON.stringify({ destination: institutionId }),
  })
  if (res.status === 402) {
    throw new PremiumRequiredError()
  }
  if (!res.ok) {
    throw new Error(
      await readError(res, 'Não foi possível cadastrar a intenção.'),
    )
  }
}

export async function deleteIntention(id: number): Promise<void> {
  const res = await apiRequest(`/intentions/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível remover.'))
}

// --- Matches ------------------------------------------------------------------

export function getMatches(): Promise<MatchesResponse> {
  return getJson<MatchesResponse>('/matches')
}

// --- Plano / Premium (Stripe) --------------------------------------------------

export async function getPlanStatus(): Promise<{ subscribed: boolean }> {
  try {
    const data = await getJson<{ subscribed: boolean }>('/stripe/customer')
    return { subscribed: Boolean(data.subscribed) }
  } catch {
    return { subscribed: false }
  }
}

/** Cria (se preciso) o customer Stripe do usuário logado e devolve o status. */
export function getStripeCustomer(): Promise<StripeCustomer> {
  return getJson<StripeCustomer>('/stripe/customer')
}

/** Detalhes das subscriptions do customer (status, fim do período, etc.). */
export function getStripeSubscriptions(): Promise<StripeSubscriptionsResponse> {
  return getJson<StripeSubscriptionsResponse>('/stripe/subscriptions')
}

/**
 * Cria (ou reaproveita) a subscription mensal Premium do usuário logado.
 * O servidor deriva o customer a partir da sessão — não é preciso (nem
 * possível) informar um customer_id pelo cliente.
 */
export async function createMonthlySubscription(): Promise<SubscriptionCreated> {
  const res = await apiRequest('/stripe/subscription/monthly', { method: 'POST', body: '{}' })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível iniciar a assinatura.'))
  return (await res.json()) as SubscriptionCreated
}

export async function cancelSubscription(): Promise<void> {
  const res = await apiRequest('/stripe/subscription/cancel', { method: 'POST', body: '{}' })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível cancelar a assinatura.'))
}

// --- Dados auxiliares (dropdowns) ---------------------------------------------

export function getStates(): Promise<StateItem[]> {
  return getJson<StateItem[]>('/states')
}

export function getCities(stateId: number): Promise<IdName[]> {
  return getJson<IdName[]>(`/states/${stateId}/cities`)
}

export function getCareers(): Promise<IdName[]> {
  return getJson<IdName[]>('/careers')
}

export function getOffices(careerId: number): Promise<IdName[]> {
  return getJson<IdName[]>(`/careers/${careerId}/offices`)
}

export function getGeneralAreas(): Promise<IdName[]> {
  return getJson<IdName[]>('/know/generals')
}

export async function getSpecificAreas(generalId: number): Promise<IdName[]> {
  // A API devolve o geral com os específicos aninhados: { id, name, specifics: [...] }.
  const data = await getJson<{ specifics?: IdName[] }>(`/know/generals/${generalId}/specifics`)
  return data.specifics ?? []
}

export async function getInstitutionsByCity(cityId: number): Promise<IdName[]> {
  // A API devolve { city, total, institutions: [{ id, description, ... }] } — o nome
  // da instituição vem em `description`, não em `name`.
  const data = await getJson<{
    institutions?: { id: number; description?: string; name?: string }[]
  }>(`/cities/${cityId}/institutions`)
  return (data.institutions ?? []).map((i) => ({ id: i.id, name: i.description ?? i.name ?? '' }))
}

export async function searchCbo(term: string): Promise<CboItem[]> {
  const res = await apiRequest('/cbos/search', {
    method: 'POST',
    body: JSON.stringify({ search: term }),
  })
  if (!res.ok) throw new Error(await readError(res, 'Erro na busca de CBO.'))
  return (await res.json()) as CboItem[]
}

// --- Cadastro -----------------------------------------------------------------

export type RegisterPayload = {
  cpf: string
  password: string
  first_name: string
  last_name: string
  date_birth: string
  phone: string
  email: string
  home_city: number
  institution_id: number
  registration: string
  office_career: number
  office_specialization: number
  cbo?: number
  photo_url?: string
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const res = await apiRequest('/user/all', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    if (res.status === 409) {
      throw new Error('Já existe uma conta com este CPF.')
    }
    throw new Error(await readError(res, 'Não foi possível concluir o cadastro.'))
  }
}

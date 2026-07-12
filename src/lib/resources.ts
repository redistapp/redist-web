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
} from '@/types'

/** Lê o corpo de erro (a API responde em texto puro na maioria dos casos). */
async function readError(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => '')
  if (!text) return fallback
  try {
    const parsed = JSON.parse(text) as { error?: string; message?: string }
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

// --- Intenções ----------------------------------------------------------------

export function getIntentions(): Promise<IntentionsResponse> {
  return getJson<IntentionsResponse>('/intentions')
}

export async function createIntention(institutionId: number): Promise<void> {
  const res = await apiRequest('/intentions', {
    method: 'PUT',
    body: JSON.stringify({ destination: institutionId }),
  })
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

// --- Plano (Stripe) — só leitura do status nesta fase -------------------------

export async function getPlanStatus(): Promise<{ subscribed: boolean }> {
  try {
    const data = await getJson<{ subscribed: boolean }>('/stripe/customer')
    return { subscribed: Boolean(data.subscribed) }
  } catch {
    return { subscribed: false }
  }
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

export function getSpecificAreas(generalId: number): Promise<IdName[]> {
  return getJson<IdName[]>(`/know/generals/${generalId}/specifics`)
}

export function getInstitutionsByCity(cityId: number): Promise<IdName[]> {
  return getJson<IdName[]>(`/cities/${cityId}/institutions`)
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

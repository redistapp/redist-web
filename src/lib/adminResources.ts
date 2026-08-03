// Funções de acesso à API do painel administrativo, via proxy da BFF (/api/*).
// Todas as rotas /api/admin/* exigem sessão de admin (ver AdminProtectedRoute).

import { apiRequest } from '@/lib/api'
import type {
  AdminUserDetail,
  AdminUserListItem,
  FeedbackReport,
  IdName,
  InstitutionData,
  UserReportItem,
} from '@/types'

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

export function searchInstitutions(search: string): Promise<InstitutionData[]> {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
  return getJson<InstitutionData[]>(`/admin/institutions${query}`)
}

export function getInstitutionNatures(): Promise<IdName[]> {
  return getJson<IdName[]>('/institution-natures')
}

export type InstitutionInput = {
  description: string
  address: string
  cep: string
  city: number
  nature_id: number
}

export async function createInstitution(data: InstitutionInput): Promise<void> {
  const res = await apiRequest('/admin/create/institution', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível criar a instituição.'))
}

export async function updateInstitution(id: number, data: InstitutionInput): Promise<void> {
  const res = await apiRequest(`/admin/update/institution/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível salvar a instituição.'))
}

export function getReports(): Promise<FeedbackReport[]> {
  return getJson<FeedbackReport[]>('/admin/reports')
}

export function getUserReports(): Promise<UserReportItem[]> {
  return getJson<UserReportItem[]>('/admin/reports/users')
}

export function searchUsers(search: string): Promise<AdminUserListItem[]> {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
  return getJson<AdminUserListItem[]>(`/admin/users${query}`)
}

export function getUserDetail(id: number): Promise<AdminUserDetail> {
  return getJson<AdminUserDetail>(`/admin/users/${id}`)
}

export async function suspendUser(id: number): Promise<void> {
  const res = await apiRequest(`/admin/users/${id}/suspend`, { method: 'POST' })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível suspender a conta.'))
}

export async function reactivateUser(id: number): Promise<void> {
  const res = await apiRequest(`/admin/users/${id}/reactivate`, { method: 'POST' })
  if (!res.ok) throw new Error(await readError(res, 'Não foi possível reativar a conta.'))
}

// ---------------------------------------------------------------------------
// Dados de referência (carreiras, ofícios, áreas de conhecimento).
//
// São as listas que alimentam o cadastro do usuário. Se falta um ofício aqui,
// ninguém daquela função consegue se cadastrar — até esta tela existir, a única
// saída era inserir direto no banco.
//
// A listagem usa as rotas públicas (mesmas que o cadastro consome); a escrita
// usa /admin/*. O endpoint de criar área geral tem "genereal" no caminho: é um
// typo antigo da API, mantido para não quebrar contrato.
// ---------------------------------------------------------------------------

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
  const r = await getJson<{ specifics: IdName[] }>(`/know/generals/${generalId}/specifics`)
  return r.specifics ?? []
}

async function post(path: string, body: unknown, erro: string): Promise<void> {
  const res = await apiRequest(path, { method: 'POST', body: JSON.stringify(body) })
  if (!res.ok) throw new Error(await readError(res, erro))
}

export const createCareer = (description: string) =>
  post('/admin/create/career', { description }, 'Não foi possível criar a carreira.')

export const updateCareer = (id: number, description: string) =>
  post(`/admin/update/career/${id}`, { description }, 'Não foi possível salvar a carreira.')

export const createOffice = (idCareerPath: number, description: string) =>
  post('/admin/create/office', { id_career_path: idCareerPath, description }, 'Não foi possível criar o ofício.')

export const updateOffice = (id: number, idCareerPath: number, description: string) =>
  post(`/admin/update/office/${id}`, { id_career_path: idCareerPath, description }, 'Não foi possível salvar o ofício.')

export const createGeneralArea = (description: string) =>
  post('/admin/create/generealarea', { description }, 'Não foi possível criar a área.')

export const updateGeneralArea = (id: number, description: string) =>
  post(`/admin/update/generealarea/${id}`, { description }, 'Não foi possível salvar a área.')

export const createSpecificArea = (idGeneral: number, description: string) =>
  post('/admin/create/specificarea', { id_general: idGeneral, description }, 'Não foi possível criar a área específica.')

export const updateSpecificArea = (id: number, idGeneral: number, description: string) =>
  post(`/admin/update/specificarea/${id}`, { id_general: idGeneral, description }, 'Não foi possível salvar a área específica.')

// ---------------------------------------------------------------------------
// Métricas do painel
// ---------------------------------------------------------------------------

export type AdminMetrics = {
  usuarios: { ativos: number; suspensos: number; excluidos: number; admins: number; novos_30_dias: number }
  intencoes: { total: number; ativas: number }
  matches: { total: number; notificados: number; pendentes_notificacao: number; novos_30_dias: number }
  denuncias: { feedbacks: number; usuarios: number }
  instituicoes: number
}

export function getMetrics(): Promise<AdminMetrics> {
  return getJson<AdminMetrics>('/admin/metrics')
}

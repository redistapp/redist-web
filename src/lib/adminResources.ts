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

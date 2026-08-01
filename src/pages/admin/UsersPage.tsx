import { useCallback, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShieldCheck, Search, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, EmptyState, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/lib/useAsync'
import { formatCpf } from '@/lib/cpf'
import { getUserDetail, reactivateUser, searchUsers, suspendUser } from '@/lib/adminResources'
import type { AdminUserDetail, AdminUserListItem } from '@/types'

function StatusBadge({ user }: { user: AdminUserListItem | AdminUserDetail }) {
  if (user.is_deleted) {
    return (
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
        Conta excluída
      </span>
    )
  }
  if (!user.is_active) {
    return (
      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        Suspensa
      </span>
    )
  }
  return (
    <span className="rounded-full bg-match-50 px-2.5 py-1 text-xs font-semibold text-match-700">
      Ativa
    </span>
  )
}

function UserDetailModal({
  userId,
  onClose,
  onChanged,
}: {
  userId: number | null
  onClose: () => void
  onChanged: () => void
}) {
  const fetchDetail = useCallback(() => {
    if (userId === null) return Promise.resolve(null as AdminUserDetail | null)
    return getUserDetail(userId)
  }, [userId])
  const { data, loading, error, reload } = useAsync(fetchDetail)

  const [acting, setActing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  function handleClose() {
    setActionError(null)
    setConfirming(false)
    onClose()
  }

  async function handleToggle() {
    if (!data) return
    setActing(true)
    setActionError(null)
    try {
      if (data.is_active) {
        await suspendUser(data.id)
      } else {
        await reactivateUser(data.id)
      }
      setConfirming(false)
      reload()
      onChanged()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Não foi possível concluir a ação.')
    } finally {
      setActing(false)
    }
  }

  return (
    <Modal open={userId !== null} onClose={handleClose} title="Detalhes do usuário">
      <div className="flex flex-col gap-4">
        {loading && <Spinner />}
        {error && <ErrorState message={error} />}
        {actionError && <ErrorState message={actionError} />}

        {data && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-navy-900">
                  {`${data.profile?.first_name ?? ''} ${data.profile?.last_name ?? ''}`.trim() || 'Sem perfil'}
                </p>
                <p className="text-sm text-slate-500">{formatCpf(data.cpf)}</p>
              </div>
              <div className="flex items-center gap-2">
                {data.is_admin && (
                  <span className="flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700">
                    <ShieldCheck size={13} />
                    Admin
                  </span>
                )}
                <StatusBadge user={data} />
              </div>
            </div>

            <dl className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">E-mail</dt>
                <dd className="text-right text-navy-900">{data.profile?.email ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Telefone</dt>
                <dd className="text-right text-navy-900">{data.profile?.phone ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Cidade</dt>
                <dd className="text-right text-navy-900">
                  {[data.profile?.city?.name, data.profile?.state?.abbreviation]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Instituição</dt>
                <dd className="text-right text-navy-900">{data.professional?.institution?.name ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Cargo</dt>
                <dd className="text-right text-navy-900">{data.professional?.office?.name ?? '—'}</dd>
              </div>
            </dl>

            {data.is_admin ? (
              <p className="text-sm text-slate-500">
                Contas de administrador não podem ser suspensas por aqui.
              </p>
            ) : data.is_deleted ? (
              <p className="text-sm text-slate-500">
                Essa conta foi excluída pelo próprio usuário e não pode ser reativada.
              </p>
            ) : confirming ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="mb-3">
                  {data.is_active
                    ? 'Suspender impede login imediatamente e desconecta a conta de todos os dispositivos. Confirmar?'
                    : 'Reativar essa conta?'}
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setConfirming(false)} disabled={acting}>
                    Cancelar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50"
                    onClick={handleToggle}
                    disabled={acting}
                  >
                    {acting ? 'Aplicando…' : 'Confirmar'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  className={
                    data.is_active
                      ? 'border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50'
                      : undefined
                  }
                  onClick={() => setConfirming(true)}
                >
                  {data.is_active ? 'Suspender conta' : 'Reativar conta'}
                </Button>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function UsersPage() {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [search, setSearch] = useState(initialSearch)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const fetchUsers = useCallback(() => searchUsers(search), [search])
  const { data, loading, error, reload } = useAsync(fetchUsers)

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div>
      <PageHeader title="Usuários" subtitle="Busque, veja o perfil e suspenda contas quando preciso." />

      <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
        <div className="max-w-sm flex-1">
          <Field
            label=""
            placeholder="Buscar por nome, e-mail ou CPF…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          <Search size={16} />
          Buscar
        </Button>
      </form>

      {loading && <Spinner />}
      {error && <ErrorState message={error} />}

      {data && data.length === 0 && (
        <EmptyState title="Nenhum usuário encontrado" description="Tente outro termo de busca." />
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {data.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedUserId(u.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                    <UserIcon size={16} />
                  </span>
                  <div>
                    <p className="font-medium text-navy-900">{u.name || 'Sem perfil'}</p>
                    <p className="text-sm text-slate-500">
                      {formatCpf(u.cpf)} · {u.email}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  {u.is_admin && (
                    <span className="flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700">
                      <ShieldCheck size={13} />
                      Admin
                    </span>
                  )}
                  <StatusBadge user={u} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <UserDetailModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onChanged={reload}
      />
    </div>
  )
}

import { useState } from 'react'
import type { ReactNode } from 'react'
import { MapPin, Building2, Briefcase, Flag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, EmptyState, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/lib/useAsync'
import type { Match } from '@/types'
import { getMatches, reportUser } from '@/lib/resources'

const REPORT_REASONS = [
  { value: 'perfil_falso', label: 'Perfil falso ou dados incorretos' },
  { value: 'comportamento', label: 'Comportamento inadequado' },
  { value: 'nao_responde', label: 'Combinou e não respondeu mais' },
  { value: 'outro', label: 'Outro motivo' },
]

function ReportUserModal({
  open,
  onClose,
  reportedUser,
  reportedName,
}: {
  open: boolean
  onClose: () => void
  reportedUser: number
  reportedName: string
}) {
  const [reason, setReason] = useState('')
  const [observation, setObservation] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleClose() {
    if (sending) return
    setReason('')
    setObservation('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  async function handleSend() {
    if (!reason) {
      setError('Selecione um motivo.')
      return
    }
    setSending(true)
    setError(null)
    try {
      await reportUser(reportedUser, reason, observation.trim() || undefined)
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível enviar a denúncia.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Denunciar ${reportedName || 'usuário'}`}>
      <div className="flex flex-col gap-4">
        {error && <ErrorState message={error} />}
        {success ? (
          <div className="rounded-lg border border-match-200 bg-match-50 px-4 py-3 text-sm text-match-700">
            Denúncia enviada. Nossa equipe vai analisar.
          </div>
        ) : (
          <>
            <Select
              label="Motivo"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={REPORT_REASONS}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-observation" className="text-sm font-medium text-navy-900">
                Observações (opcional)
              </label>
              <textarea
                id="report-observation"
                rows={4}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Conte mais detalhes, se quiser…"
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[0.95rem] text-navy-900 placeholder:text-slate-400 hover:border-slate-400 focus-visible:border-brand-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600/40"
              />
            </div>
          </>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            {success ? 'Fechar' : 'Cancelar'}
          </Button>
          {!success && (
            <Button
              variant="secondary"
              className="border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50"
              onClick={handleSend}
              disabled={sending || !reason}
            >
              {sending ? 'Enviando…' : 'Denunciar'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function initials(match: Match): string {
  const f = match.profile?.first_name?.[0] ?? ''
  const l = match.profile?.last_name?.[0] ?? ''
  return (f + l).toUpperCase() || '?'
}

function Info({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  if (!children) return null
  return (
    <p className="flex items-center gap-2 text-sm text-slate-600">
      <Icon size={15} className="shrink-0 text-slate-400" />
      {children}
    </p>
  )
}

function MatchCard({ match, onReport }: { match: Match; onReport: () => void }) {
  const name = [match.profile?.first_name, match.profile?.last_name].filter(Boolean).join(' ')
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
            {initials(match)}
          </span>
          <div>
            <p className="font-semibold text-navy-900">{name || 'Servidor'}</p>
            <p className="text-sm text-slate-500">{match.professional?.office?.name}</p>
          </div>
        </div>
        <span className="rounded-full bg-match-50 px-3 py-1 text-xs font-semibold text-match-700">
          Score {match.score}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-slate-100 pt-4">
        <Info icon={Building2}>{match.professional?.institution?.name}</Info>
        <Info icon={MapPin}>
          {[match.profile?.city?.name, match.profile?.state?.abbreviation]
            .filter(Boolean)
            .join(' · ')}
        </Info>
        <Info icon={Briefcase}>{match.professional?.knowledge_area?.specific?.name}</Info>
      </div>

      {match.user_id && (
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onReport}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-600"
          >
            <Flag size={13} />
            Denunciar
          </button>
        </div>
      )}
    </div>
  )
}

export default function MatchesPage() {
  const { data, loading, error } = useAsync(getMatches)
  const [reporting, setReporting] = useState<Match | null>(null)

  return (
    <div>
      <PageHeader
        title="Meus matches"
        subtitle="Servidores cujas intenções combinam com as suas."
      />

      {loading && <Spinner />}
      {error && <ErrorState message={error} />}

      {data && data.matches.length === 0 && (
        <EmptyState
          title="Nenhum match ainda"
          description="Quando alguém quiser trocar na direção contrária à sua, o match aparece aqui. Cadastre suas intenções para aumentar as chances."
        />
      )}

      {data && data.matches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.matches.map((match, i) => (
            <MatchCard key={match.user_id ?? i} match={match} onReport={() => setReporting(match)} />
          ))}
        </div>
      )}

      {reporting?.user_id && (
        <ReportUserModal
          open
          onClose={() => setReporting(null)}
          reportedUser={reporting.user_id}
          reportedName={[reporting.profile?.first_name, reporting.profile?.last_name]
            .filter(Boolean)
            .join(' ')}
        />
      )}
    </div>
  )
}

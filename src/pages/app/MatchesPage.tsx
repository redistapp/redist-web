import type { ReactNode } from 'react'
import { MapPin, Building2, Briefcase } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, EmptyState, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/lib/useAsync'
import type { Match } from '@/types'
import { getMatches } from '@/lib/resources'

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

function MatchCard({ match }: { match: Match }) {
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
    </div>
  )
}

export default function MatchesPage() {
  const { data, loading, error } = useAsync(getMatches)

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
            <MatchCard key={match.user_id ?? i} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}

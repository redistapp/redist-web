import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Building2, Crown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, EmptyState, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/lib/useAsync'
import type { IdName, StateItem } from '@/types'
import {
  getIntentions,
  createIntention,
  deleteIntention,
  getStates,
  getCities,
  getInstitutionsByCity,
  PremiumRequiredError,
} from '@/lib/resources'

function AddIntentionModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [states, setStates] = useState<StateItem[]>([])
  const [cities, setCities] = useState<IdName[]>([])
  const [institutions, setInstitutions] = useState<IdName[]>([])
  const [stateId, setStateId] = useState('')
  const [cityId, setCityId] = useState('')
  const [institutionId, setInstitutionId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsPremium, setNeedsPremium] = useState(false)

  useEffect(() => {
    if (open) getStates().then(setStates).catch(() => setError('Erro ao carregar estados.'))
  }, [open])

  useEffect(() => {
    setCities([])
    setCityId('')
    setInstitutions([])
    setInstitutionId('')
    if (stateId) getCities(Number(stateId)).then(setCities).catch(() => undefined)
  }, [stateId])

  useEffect(() => {
    setInstitutions([])
    setInstitutionId('')
    if (cityId) getInstitutionsByCity(Number(cityId)).then(setInstitutions).catch(() => undefined)
  }, [cityId])

  async function handleSave() {
    if (!institutionId) return
    setSaving(true)
    setError(null)
    setNeedsPremium(false)
    try {
      await createIntention(Number(institutionId))
      onCreated()
      onClose()
    } catch (e) {
      if (e instanceof PremiumRequiredError) {
        setError(e.message)
        setNeedsPremium(true)
      } else {
        setError(e instanceof Error ? e.message : 'Não foi possível cadastrar.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova intenção de permuta">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-600">
          Escolha a instituição para a qual você deseja ir.
        </p>
        {error && <ErrorState message={error} />}
        {needsPremium && (
          <Link
            to="/painel/premium"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg bg-match-50 px-4 py-3 text-sm font-medium text-match-700 hover:bg-match-100"
          >
            <Crown size={17} className="shrink-0" />
            Assine o Premium para ter até 3 intenções ativas
          </Link>
        )}
        <Select
          label="Estado de destino"
          value={stateId}
          onChange={(e) => setStateId(e.target.value)}
          options={states.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Select
          label="Cidade de destino"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          disabled={!stateId || cities.length === 0}
          options={cities.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select
          label="Instituição de destino"
          value={institutionId}
          onChange={(e) => setInstitutionId(e.target.value)}
          disabled={!cityId || institutions.length === 0}
          hint={cityId && institutions.length === 0 ? 'Nenhuma instituição nesta cidade.' : undefined}
          options={institutions.map((i) => ({ value: i.id, label: i.name }))}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="match" onClick={handleSave} disabled={!institutionId || saving}>
            {saving ? 'Salvando…' : 'Cadastrar intenção'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function IntentionsPage() {
  const { data, loading, error, reload } = useAsync(getIntentions)
  const [adding, setAdding] = useState(false)
  const [toRemove, setToRemove] = useState<number | null>(null)
  const [removing, setRemoving] = useState(false)

  const confirmRemove = useCallback(async () => {
    if (toRemove == null) return
    setRemoving(true)
    try {
      await deleteIntention(toRemove)
      setToRemove(null)
      reload()
    } finally {
      setRemoving(false)
    }
  }, [toRemove, reload])

  return (
    <div>
      <PageHeader
        title="Minhas intenções"
        subtitle="As instituições para onde você quer ir."
        action={
          <Button variant="match" onClick={() => setAdding(true)}>
            <Plus size={18} />
            Nova intenção
          </Button>
        }
      />

      {loading && <Spinner />}
      {error && <ErrorState message={error} />}

      {data && data.intentions.length === 0 && (
        <EmptyState
          title="Você ainda não tem intenções"
          description="Cadastre para onde você quer ir e comece a receber matches recíprocos."
          action={
            <Button variant="match" onClick={() => setAdding(true)}>
              <Plus size={18} />
              Cadastrar intenção
            </Button>
          }
        />
      )}

      {data && data.intentions.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.intentions.map((intention) => (
            <li
              key={intention.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <Building2 size={20} />
                </span>
                <p className="font-medium text-navy-900">
                  {intention.institution?.name ?? 'Instituição'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setToRemove(intention.id)}
                aria-label="Remover intenção"
                className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AddIntentionModal open={adding} onClose={() => setAdding(false)} onCreated={reload} />

      <Modal open={toRemove != null} onClose={() => setToRemove(null)} title="Remover intenção">
        <p className="text-slate-600">Tem certeza que deseja remover esta intenção de permuta?</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToRemove(null)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={confirmRemove}
            disabled={removing}
            className="bg-red-600 hover:bg-red-700"
          >
            {removing ? 'Removendo…' : 'Remover'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

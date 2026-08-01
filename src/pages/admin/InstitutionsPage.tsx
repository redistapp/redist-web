import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Building2, Pencil, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, EmptyState, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/lib/useAsync'
import { getCities, getStates } from '@/lib/resources'
import {
  createInstitution,
  getInstitutionNatures,
  searchInstitutions,
  updateInstitution,
} from '@/lib/adminResources'
import type { IdName, InstitutionData, StateItem } from '@/types'

function InstitutionFormModal({
  open,
  onClose,
  institution,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  institution: InstitutionData | null
  onSaved: () => void
}) {
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [cep, setCep] = useState('')
  const [states, setStates] = useState<StateItem[]>([])
  const [cities, setCities] = useState<IdName[]>([])
  const [natures, setNatures] = useState<IdName[]>([])
  const [stateId, setStateId] = useState('')
  const [cityId, setCityId] = useState('')
  const [natureId, setNatureId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setDescription(institution?.name ?? '')
    setAddress(institution?.address ?? '')
    setCep(institution?.cep ?? '')
    setStateId(String(institution?.state?.id ?? ''))
    setCityId(String(institution?.city?.id ?? ''))
    setNatureId(String(institution?.nature_id ?? ''))
    setError(null)
    getStates().then(setStates).catch(() => undefined)
    getInstitutionNatures().then(setNatures).catch(() => undefined)
    if (institution?.state?.id) {
      getCities(institution.state.id).then(setCities).catch(() => undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, institution])

  function onStateChange(v: string) {
    setStateId(v)
    setCityId('')
    setCities([])
    if (v) getCities(Number(v)).then(setCities).catch(() => undefined)
  }

  async function handleSave() {
    if (!description.trim() || !cityId || !natureId) {
      setError('Preencha nome, cidade e natureza.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const data = {
        description: description.trim(),
        address: address.trim(),
        cep: cep.trim(),
        city: Number(cityId),
        nature_id: Number(natureId),
      }
      if (institution) {
        await updateInstitution(institution.id, data)
      } else {
        await createInstitution(data)
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={institution ? 'Editar instituição' : 'Nova instituição'}>
      <div className="flex flex-col gap-4">
        {error && <ErrorState message={error} />}
        <Field label="Nome" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Field label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} />
        <Field label="CEP" value={cep} onChange={(e) => setCep(e.target.value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Estado"
            value={stateId}
            onChange={(e) => onStateChange(e.target.value)}
            options={states.map((s) => ({ value: s.id, label: s.name }))}
          />
          <Select
            label="Cidade"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            disabled={!stateId || cities.length === 0}
            options={cities.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>
        <Select
          label="Natureza"
          value={natureId}
          onChange={(e) => setNatureId(e.target.value)}
          options={natures.map((n) => ({ value: n.id, label: n.name }))}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function InstitutionsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<InstitutionData | null | 'new'>(null)

  const fetchInstitutions = useCallback(() => searchInstitutions(search), [search])
  const { data, loading, error, reload } = useAsync(fetchInstitutions)

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div>
      <PageHeader
        title="Instituições"
        subtitle="Cadastre e edite as instituições disponíveis para permuta."
        action={
          <Button variant="primary" onClick={() => setEditing('new')}>
            <Plus size={16} />
            Nova instituição
          </Button>
        }
      />

      <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
        <div className="max-w-sm flex-1">
          <Field
            label=""
            placeholder="Buscar por nome…"
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
        <EmptyState
          title="Nenhuma instituição encontrada"
          description="Tente outro termo de busca ou cadastre uma nova instituição."
        />
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {data.map((inst) => (
              <li key={inst.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                    <Building2 size={16} />
                  </span>
                  <div>
                    <p className="font-medium text-navy-900">{inst.name}</p>
                    <p className="text-sm text-slate-500">
                      {[inst.city?.name, inst.state?.abbreviation].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setEditing(inst)}>
                  <Pencil size={14} />
                  Editar
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <InstitutionFormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        institution={editing === 'new' ? null : editing}
        onSaved={reload}
      />
    </div>
  )
}

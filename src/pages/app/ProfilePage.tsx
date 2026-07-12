import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Pencil, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/lib/useAsync'
import type { CboItem, FullUser, IdName, StateItem } from '@/types'
import {
  getFullUser,
  updateContact,
  updateProfessional,
  getStates,
  getCities,
  getCareers,
  getOffices,
  getGeneralAreas,
  getSpecificAreas,
  searchCbo,
} from '@/lib/resources'

function Row({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="font-medium text-navy-900 sm:text-right">{value || '—'}</dd>
    </div>
  )
}

function Card({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
        {action}
      </div>
      <dl>{children}</dl>
    </section>
  )
}

function EditPersonalModal({
  open,
  onClose,
  user,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  user: FullUser
  onSaved: () => void
}) {
  const [firstName, setFirstName] = useState(user.profile?.first_name ?? '')
  const [lastName, setLastName] = useState(user.profile?.last_name ?? '')
  const [phone, setPhone] = useState(user.profile?.phone ?? '')
  const [email, setEmail] = useState(user.profile?.email ?? '')
  const [states, setStates] = useState<StateItem[]>([])
  const [cities, setCities] = useState<IdName[]>([])
  const [stateId, setStateId] = useState(String(user.profile?.state?.id ?? ''))
  const [cityId, setCityId] = useState(String(user.profile?.city?.id ?? ''))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    getStates().then(setStates).catch(() => undefined)
    if (stateId) getCities(Number(stateId)).then(setCities).catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function onStateChange(v: string) {
    setStateId(v)
    setCityId('')
    setCities([])
    if (v) getCities(Number(v)).then(setCities).catch(() => undefined)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateContact(user.id, {
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        home_city: Number(cityId) || user.profile?.city?.id || 0,
        photo_url: user.profile?.photo_url,
      })
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar dados pessoais">
      <div className="flex flex-col gap-4">
        {error && <ErrorState message={error} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Field label="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <Field label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
        <Field label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="match" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function EditProfessionalModal({
  open,
  onClose,
  user,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  user: FullUser
  onSaved: () => void
}) {
  const prof = user.professional
  const [careers, setCareers] = useState<IdName[]>([])
  const [offices, setOffices] = useState<IdName[]>([])
  const [generals, setGenerals] = useState<IdName[]>([])
  const [specifics, setSpecifics] = useState<IdName[]>([])
  const [careerId, setCareerId] = useState(String(prof?.career?.id ?? ''))
  const [officeId, setOfficeId] = useState(String(prof?.office?.id ?? ''))
  const [generalId, setGeneralId] = useState(String(prof?.knowledge_area?.general?.id ?? ''))
  const [specificId, setSpecificId] = useState(String(prof?.knowledge_area?.specific?.id ?? ''))
  const [registration, setRegistration] = useState(prof?.registration ?? '')
  const [cboId, setCboId] = useState(String(prof?.cbo?.id ?? ''))
  const [cboLabel, setCboLabel] = useState(prof?.cbo ? `${prof.cbo.code} — ${prof.cbo.title}` : '')
  const [cboTerm, setCboTerm] = useState('')
  const [cboResults, setCboResults] = useState<CboItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    getCareers().then(setCareers).catch(() => undefined)
    getGeneralAreas().then(setGenerals).catch(() => undefined)
    if (careerId) getOffices(Number(careerId)).then(setOffices).catch(() => undefined)
    if (generalId) getSpecificAreas(Number(generalId)).then(setSpecifics).catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function onCareerChange(v: string) {
    setCareerId(v)
    setOfficeId('')
    setOffices([])
    if (v) getOffices(Number(v)).then(setOffices).catch(() => undefined)
  }
  function onGeneralChange(v: string) {
    setGeneralId(v)
    setSpecificId('')
    setSpecifics([])
    if (v) getSpecificAreas(Number(v)).then(setSpecifics).catch(() => undefined)
  }
  async function onCboSearch() {
    if (cboTerm.trim().length < 3) return
    try {
      setCboResults(await searchCbo(cboTerm.trim()))
    } catch {
      setCboResults([])
    }
  }

  async function handleSave() {
    if (!officeId || !specificId || !registration) {
      setError('Preencha cargo, área específica e matrícula.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateProfessional(user.id, {
        // A instituição não é alterada aqui — mantém a atual.
        institution_id: prof?.institution?.id ?? 0,
        registration,
        office_career: Number(officeId),
        office_specialization: Number(specificId),
        cbo_id: cboId ? Number(cboId) : undefined,
      })
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar dados profissionais">
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
        {error && <ErrorState message={error} />}
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Instituição: <span className="font-medium text-navy-900">{prof?.institution?.name}</span>
          <span className="block text-xs text-slate-500">A troca de instituição será feita em breve.</span>
        </div>
        <Select
          label="Carreira"
          value={careerId}
          onChange={(e) => onCareerChange(e.target.value)}
          options={careers.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select
          label="Cargo / ofício"
          value={officeId}
          onChange={(e) => setOfficeId(e.target.value)}
          disabled={!careerId || offices.length === 0}
          options={offices.map((o) => ({ value: o.id, label: o.name }))}
        />
        <Select
          label="Área de conhecimento geral"
          value={generalId}
          onChange={(e) => onGeneralChange(e.target.value)}
          options={generals.map((g) => ({ value: g.id, label: g.name }))}
        />
        <Select
          label="Área de conhecimento específica"
          value={specificId}
          onChange={(e) => setSpecificId(e.target.value)}
          disabled={!generalId || specifics.length === 0}
          options={specifics.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Field
          label="Matrícula / SIAPE"
          value={registration}
          onChange={(e) => setRegistration(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-navy-900">CBO</label>
          {cboLabel && <p className="text-sm text-slate-600">Atual: {cboLabel}</p>}
          <div className="flex gap-2">
            <input
              className="h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 text-[0.95rem] text-navy-900 placeholder:text-slate-400 hover:border-slate-400 focus-visible:border-brand-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600/40"
              placeholder="Buscar por palavra-chave"
              value={cboTerm}
              onChange={(e) => setCboTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void onCboSearch()
                }
              }}
            />
            <Button variant="secondary" onClick={onCboSearch}>
              <Search size={16} />
              Buscar
            </Button>
          </div>
          {cboResults.length > 0 && (
            <Select
              label=""
              value={cboId}
              onChange={(e) => {
                const chosen = cboResults.find((c) => String(c.id) === e.target.value)
                setCboId(e.target.value)
                setCboLabel(chosen ? `${chosen.code} — ${chosen.name}` : '')
              }}
              options={cboResults.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))}
            />
          )}
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="match" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function ProfilePage() {
  const { data, loading, error, reload } = useAsync(getFullUser)
  const [editing, setEditing] = useState<'personal' | 'professional' | null>(null)

  return (
    <div>
      <PageHeader title="Meu perfil" subtitle="Seus dados pessoais e profissionais." />

      {loading && <Spinner />}
      {error && <ErrorState message={error} />}

      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card
            title="Dados pessoais"
            action={
              <Button variant="secondary" size="sm" onClick={() => setEditing('personal')}>
                <Pencil size={15} />
                Editar
              </Button>
            }
          >
            <Row label="Nome" value={`${data.profile?.first_name ?? ''} ${data.profile?.last_name ?? ''}`.trim()} />
            <Row label="CPF" value={data.cpf} />
            <Row label="Nascimento" value={data.profile?.date_birth} />
            <Row label="Telefone" value={data.profile?.phone} />
            <Row label="E-mail" value={data.profile?.email} />
            <Row
              label="Cidade"
              value={[data.profile?.city?.name, data.profile?.state?.abbreviation]
                .filter(Boolean)
                .join(' · ')}
            />
          </Card>

          <Card
            title="Dados profissionais"
            action={
              <Button variant="secondary" size="sm" onClick={() => setEditing('professional')}>
                <Pencil size={15} />
                Editar
              </Button>
            }
          >
            <Row label="Instituição" value={data.professional?.institution?.name} />
            <Row label="Cargo / ofício" value={data.professional?.office?.name} />
            <Row label="Carreira" value={data.professional?.career?.name} />
            <Row label="Matrícula / SIAPE" value={data.professional?.registration} />
            <Row label="Área geral" value={data.professional?.knowledge_area?.general?.name} />
            <Row label="Área específica" value={data.professional?.knowledge_area?.specific?.name} />
            <Row label="CBO" value={data.professional?.cbo?.title} />
          </Card>
        </div>
      )}

      {data && (
        <>
          <EditPersonalModal
            open={editing === 'personal'}
            onClose={() => setEditing(null)}
            user={data}
            onSaved={reload}
          />
          <EditProfessionalModal
            open={editing === 'professional'}
            onClose={() => setEditing(null)}
            user={data}
            onSaved={reload}
          />
        </>
      )}
    </div>
  )
}

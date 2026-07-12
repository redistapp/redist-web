import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/States'
import { useSession } from '@/contexts/SessionContext'
import { cn } from '@/lib/cn'
import type { CboItem, IdName, StateItem } from '@/types'
import {
  getStates,
  getCities,
  getInstitutionsByCity,
  getCareers,
  getOffices,
  getGeneralAreas,
  getSpecificAreas,
  searchCbo,
  registerUser,
} from '@/lib/resources'

const STEPS = ['Dados pessoais', 'Instituição', 'Profissional', 'Revisão']

type Form = {
  first_name: string
  last_name: string
  cpf: string
  email: string
  password: string
  phone: string
  date_birth: string
  state_id: string
  home_city: string
  institution_id: string
  career_id: string
  office_career: string
  general_id: string
  office_specialization: string
  registration: string
  cbo: string
  cbo_label: string
}

const EMPTY: Form = {
  first_name: '',
  last_name: '',
  cpf: '',
  email: '',
  password: '',
  phone: '',
  date_birth: '',
  state_id: '',
  home_city: '',
  institution_id: '',
  career_id: '',
  office_career: '',
  general_id: '',
  office_specialization: '',
  registration: '',
  cbo: '',
  cbo_label: '',
}

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex items-center gap-2" aria-label="Progresso do cadastro">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={cn(
              'grid size-7 place-items-center rounded-full text-xs font-semibold transition-colors',
              i < current
                ? 'bg-match-600 text-white'
                : i === current
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-500',
            )}
            aria-current={i === current ? 'step' : undefined}
          >
            {i + 1}
          </span>
          <span
            className={cn(
              'hidden text-sm sm:block',
              i === current ? 'font-medium text-navy-900' : 'text-slate-500',
            )}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && <span className="h-px w-4 bg-slate-200 sm:w-6" />}
        </li>
      ))}
    </ol>
  )
}

export default function RegisterPage() {
  const { login } = useSession()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Form>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [states, setStates] = useState<StateItem[]>([])
  const [cities, setCities] = useState<IdName[]>([])
  const [institutions, setInstitutions] = useState<IdName[]>([])
  const [careers, setCareers] = useState<IdName[]>([])
  const [offices, setOffices] = useState<IdName[]>([])
  const [generals, setGenerals] = useState<IdName[]>([])
  const [specifics, setSpecifics] = useState<IdName[]>([])
  const [cboTerm, setCboTerm] = useState('')
  const [cboResults, setCboResults] = useState<CboItem[]>([])
  const [cboSearching, setCboSearching] = useState(false)

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }))

  useEffect(() => {
    getStates().then(setStates).catch(() => undefined)
    getCareers().then(setCareers).catch(() => undefined)
    getGeneralAreas().then(setGenerals).catch(() => undefined)
  }, [])

  useEffect(() => {
    set({ home_city: '', institution_id: '' })
    setCities([])
    setInstitutions([])
    if (form.state_id) getCities(Number(form.state_id)).then(setCities).catch(() => undefined)
  }, [form.state_id])

  useEffect(() => {
    set({ institution_id: '' })
    setInstitutions([])
    if (form.home_city)
      getInstitutionsByCity(Number(form.home_city)).then(setInstitutions).catch(() => undefined)
  }, [form.home_city])

  useEffect(() => {
    set({ office_career: '' })
    setOffices([])
    if (form.career_id) getOffices(Number(form.career_id)).then(setOffices).catch(() => undefined)
  }, [form.career_id])

  useEffect(() => {
    set({ office_specialization: '' })
    setSpecifics([])
    if (form.general_id)
      getSpecificAreas(Number(form.general_id)).then(setSpecifics).catch(() => undefined)
  }, [form.general_id])

  async function handleCboSearch() {
    if (cboTerm.trim().length < 3) return
    setCboSearching(true)
    try {
      setCboResults(await searchCbo(cboTerm.trim()))
    } catch {
      setCboResults([])
    } finally {
      setCboSearching(false)
    }
  }

  const stepValid = (): boolean => {
    if (step === 0)
      return Boolean(
        form.first_name &&
          form.last_name &&
          form.cpf &&
          form.email &&
          form.password.length >= 8 &&
          form.phone &&
          form.date_birth,
      )
    if (step === 1) return Boolean(form.home_city && form.institution_id)
    if (step === 2)
      return Boolean(form.office_career && form.office_specialization && form.registration)
    return true
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      await registerUser({
        cpf: form.cpf,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        date_birth: form.date_birth,
        phone: form.phone,
        email: form.email,
        home_city: Number(form.home_city),
        institution_id: Number(form.institution_id),
        registration: form.registration,
        office_career: Number(form.office_career),
        office_specialization: Number(form.office_specialization),
        cbo: form.cbo ? Number(form.cbo) : undefined,
        photo_url: '',
      })
      // Auto-login após o cadastro.
      await login(form.cpf, form.password)
      navigate('/painel', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível concluir o cadastro.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-5">
          <Link to="/" aria-label="Redist — página inicial">
            <Logo />
          </Link>
          <Link to="/login" className="text-sm font-medium text-brand-700 hover:underline">
            Já tenho conta
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Criar conta</h1>
        <p className="mt-1 text-slate-600">Leva poucos minutos. Seus dados ficam protegidos.</p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <StepIndicator current={step} />

          {error && (
            <div className="mb-5">
              <ErrorState message={error} />
            </div>
          )}

          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Nome"
                  value={form.first_name}
                  onChange={(e) => set({ first_name: e.target.value })}
                  required
                />
                <Field
                  label="Sobrenome"
                  value={form.last_name}
                  onChange={(e) => set({ last_name: e.target.value })}
                  required
                />
              </div>
              <Field
                label="CPF"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => set({ cpf: e.target.value })}
                required
              />
              <Field
                label="E-mail"
                type="email"
                placeholder="nome@instituicao.gov.br"
                value={form.email}
                onChange={(e) => set({ email: e.target.value })}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Telefone"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  required
                />
                <Field
                  label="Data de nascimento"
                  type="date"
                  value={form.date_birth}
                  onChange={(e) => set({ date_birth: e.target.value })}
                  required
                />
              </div>
              <Field
                label="Senha"
                type="password"
                hint="Use ao menos 8 caracteres."
                value={form.password}
                onChange={(e) => set({ password: e.target.value })}
                required
              />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Select
                label="Estado"
                value={form.state_id}
                onChange={(e) => set({ state_id: e.target.value })}
                options={states.map((s) => ({ value: s.id, label: s.name }))}
              />
              <Select
                label="Cidade"
                value={form.home_city}
                onChange={(e) => set({ home_city: e.target.value })}
                disabled={!form.state_id || cities.length === 0}
                options={cities.map((c) => ({ value: c.id, label: c.name }))}
              />
              <Select
                label="Instituição"
                value={form.institution_id}
                onChange={(e) => set({ institution_id: e.target.value })}
                disabled={!form.home_city || institutions.length === 0}
                hint={
                  form.home_city && institutions.length === 0
                    ? 'Nenhuma instituição nesta cidade.'
                    : undefined
                }
                options={institutions.map((i) => ({ value: i.id, label: i.name }))}
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <Select
                label="Carreira"
                value={form.career_id}
                onChange={(e) => set({ career_id: e.target.value })}
                options={careers.map((c) => ({ value: c.id, label: c.name }))}
              />
              <Select
                label="Cargo / ofício"
                value={form.office_career}
                onChange={(e) => set({ office_career: e.target.value })}
                disabled={!form.career_id || offices.length === 0}
                options={offices.map((o) => ({ value: o.id, label: o.name }))}
              />
              <Select
                label="Área de conhecimento geral"
                value={form.general_id}
                onChange={(e) => set({ general_id: e.target.value })}
                options={generals.map((g) => ({ value: g.id, label: g.name }))}
              />
              <Select
                label="Área de conhecimento específica"
                value={form.office_specialization}
                onChange={(e) => set({ office_specialization: e.target.value })}
                disabled={!form.general_id || specifics.length === 0}
                options={specifics.map((s) => ({ value: s.id, label: s.name }))}
              />
              <Field
                label="Matrícula / SIAPE"
                value={form.registration}
                onChange={(e) => set({ registration: e.target.value })}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-navy-900">CBO (opcional)</label>
                <div className="flex gap-2">
                  <input
                    className="h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 text-[0.95rem] text-navy-900 placeholder:text-slate-400 hover:border-slate-400 focus-visible:border-brand-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600/40"
                    placeholder="Buscar por palavra-chave"
                    value={cboTerm}
                    onChange={(e) => setCboTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void handleCboSearch()
                      }
                    }}
                  />
                  <Button variant="secondary" onClick={handleCboSearch} disabled={cboSearching}>
                    <Search size={16} />
                    Buscar
                  </Button>
                </div>
                {cboResults.length > 0 && (
                  <Select
                    label=""
                    value={form.cbo}
                    onChange={(e) => {
                      const chosen = cboResults.find((c) => String(c.id) === e.target.value)
                      set({ cbo: e.target.value, cbo_label: chosen?.name ?? '' })
                    }}
                    options={cboResults.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))}
                    className="mt-1"
                  />
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <p className="text-slate-600">Confira seus dados antes de finalizar.</p>
              <dl className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <Review label="Nome" value={`${form.first_name} ${form.last_name}`} />
                <Review label="CPF" value={form.cpf} />
                <Review label="E-mail" value={form.email} />
                <Review label="Telefone" value={form.phone} />
                <Review
                  label="Instituição"
                  value={institutions.find((i) => String(i.id) === form.institution_id)?.name}
                />
                <Review
                  label="Cargo"
                  value={offices.find((o) => String(o.id) === form.office_career)?.name}
                />
                <Review
                  label="Área específica"
                  value={specifics.find((s) => String(s.id) === form.office_specialization)?.name}
                />
                <Review label="Matrícula" value={form.registration} />
                {form.cbo_label && <Review label="CBO" value={form.cbo_label} />}
              </dl>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
                <ArrowLeft size={18} />
                Voltar
              </Button>
            ) : (
              <span />
            )}

            {step < STEPS.length - 1 ? (
              <Button
                variant="match"
                onClick={() => stepValid() && setStep((s) => s + 1)}
                disabled={!stepValid()}
              >
                Continuar
                <ArrowRight size={18} />
              </Button>
            ) : (
              <Button variant="match" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Criando conta…' : 'Criar conta'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Review({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-200 py-2 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-navy-900">{value || '—'}</dd>
    </div>
  )
}

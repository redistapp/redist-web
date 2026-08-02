import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Search, KeyRound, Trash2, Camera } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/lib/useAsync'
import { useSession } from '@/contexts/SessionContext'
import type { CboItem, FullUser, IdName, StateItem } from '@/types'
import {
  getFullUser,
  updateContact,
  updateProfessional,
  changePassword,
  deleteAccount,
  uploadPhoto,
  getStates,
  getCities,
  getInstitutionsByCity,
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
  const [instagram, setInstagram] = useState(user.profile?.instagram ?? '')
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
        instagram,
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
        <Field
          label="Instagram"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="@seu.usuario"
          hint="Opcional. Aparece para quem der match com você."
        />
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
  const [states, setStates] = useState<StateItem[]>([])
  const [cities, setCities] = useState<IdName[]>([])
  const [institutions, setInstitutions] = useState<IdName[]>([])
  const [stateId, setStateId] = useState(String(prof?.institution?.state?.id ?? ''))
  const [cityId, setCityId] = useState(String(prof?.institution?.city?.id ?? ''))
  const [institutionId, setInstitutionId] = useState(String(prof?.institution?.id ?? ''))
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
    getStates().then(setStates).catch(() => undefined)
    getCareers().then(setCareers).catch(() => undefined)
    getGeneralAreas().then(setGenerals).catch(() => undefined)
    if (stateId) getCities(Number(stateId)).then(setCities).catch(() => undefined)
    if (cityId) getInstitutionsByCity(Number(cityId)).then(setInstitutions).catch(() => undefined)
    if (careerId) getOffices(Number(careerId)).then(setOffices).catch(() => undefined)
    if (generalId) getSpecificAreas(Number(generalId)).then(setSpecifics).catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function onStateChange(v: string) {
    setStateId(v)
    setCityId('')
    setCities([])
    setInstitutionId('')
    setInstitutions([])
    if (v) getCities(Number(v)).then(setCities).catch(() => undefined)
  }
  function onCityChange(v: string) {
    setCityId(v)
    setInstitutionId('')
    setInstitutions([])
    if (v) getInstitutionsByCity(Number(v)).then(setInstitutions).catch(() => undefined)
  }
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
    if (!institutionId || !officeId || !specificId || !registration) {
      setError('Preencha instituição, cargo, área específica e matrícula.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateProfessional(user.id, {
        institution_id: Number(institutionId),
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
        <p className="text-sm text-slate-600">
          Instituição atual: <span className="font-medium text-navy-900">{prof?.institution?.name}</span>
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Estado da instituição"
            value={stateId}
            onChange={(e) => onStateChange(e.target.value)}
            options={states.map((s) => ({ value: s.id, label: s.name }))}
          />
          <Select
            label="Cidade da instituição"
            value={cityId}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={!stateId || cities.length === 0}
            options={cities.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>
        <Select
          label="Instituição"
          value={institutionId}
          onChange={(e) => setInstitutionId(e.target.value)}
          disabled={!cityId || institutions.length === 0}
          hint={cityId && institutions.length === 0 ? 'Nenhuma instituição nesta cidade.' : undefined}
          options={institutions.map((i) => ({ value: i.id, label: i.name }))}
        />
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

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleClose() {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  async function handleSave() {
    setError(null)
    if (newPassword.length < 8) {
      setError('A nova senha deve ter ao menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('A confirmação não bate com a nova senha.')
      return
    }
    setSaving(true)
    try {
      await changePassword(currentPassword, newPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível alterar a senha.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Alterar senha">
      <div className="flex flex-col gap-4">
        {error && <ErrorState message={error} />}
        {success ? (
          <div className="rounded-lg border border-match-200 bg-match-50 px-4 py-3 text-sm text-match-700">
            Senha alterada com sucesso.
          </div>
        ) : (
          <>
            <Field
              label="Senha atual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Field
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="Use ao menos 8 caracteres."
              autoComplete="new-password"
            />
            <Field
              label="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            {success ? 'Fechar' : 'Cancelar'}
          </Button>
          {!success && (
            <Button
              variant="match"
              onClick={handleSave}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { logout } = useSession()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    if (deleting) return
    setCurrentPassword('')
    setConfirmText('')
    setError(null)
    onClose()
  }

  async function handleDelete() {
    setError(null)
    setDeleting(true)
    try {
      await deleteAccount(currentPassword)
      await logout()
      navigate('/login', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível remover a conta.')
      setDeleting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Excluir conta">
      <div className="flex flex-col gap-4">
        {error && <ErrorState message={error} />}
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Essa ação é <strong>irreversível</strong>. Seus dados pessoais serão anonimizados, suas
          intenções de permuta serão desativadas e você será desconectado de todos os
          dispositivos.
        </div>
        <Field
          label="Digite EXCLUIR para confirmar"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="EXCLUIR"
        />
        <Field
          label="Senha atual"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            variant="secondary"
            className="border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleting || confirmText !== 'EXCLUIR' || !currentPassword}
          >
            {deleting ? 'Excluindo…' : 'Excluir minha conta'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function AvatarUploader({ user, onUploaded }: { user: FullUser; onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initials =
    ((user.profile?.first_name?.[0] ?? '') + (user.profile?.last_name?.[0] ?? '')).toUpperCase() ||
    '?'
  const photoUrl = user.profile?.photo_url
  const hasPhoto = Boolean(photoUrl) && !photoUrl?.startsWith('$refresh')

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      await uploadPhoto(file)
      onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a foto.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mb-6 flex items-center gap-4">
      {hasPhoto ? (
        <img src={photoUrl} alt="" className="size-16 rounded-full object-cover" />
      ) : (
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-50 text-lg font-semibold text-brand-700">
          {initials}
        </span>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Camera size={15} />
          {uploading ? 'Enviando…' : 'Alterar foto'}
        </Button>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { data, loading, error, reload } = useAsync(getFullUser)
  const [editing, setEditing] = useState<'personal' | 'professional' | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  return (
    <div>
      <PageHeader title="Meu perfil" subtitle="Seus dados pessoais e profissionais." />

      {loading && <Spinner />}
      {error && <ErrorState message={error} />}

      {data && <AvatarUploader user={data} onUploaded={reload} />}

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
            <Row label="Instagram" value={data.profile?.instagram || '—'} />
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

          <Card
            title="Segurança"
            action={
              <Button variant="secondary" size="sm" onClick={() => setChangingPassword(true)}>
                <KeyRound size={15} />
                Alterar senha
              </Button>
            }
          >
            <p className="py-1 text-sm text-slate-600">
              Troque sua senha periodicamente para manter sua conta segura.
            </p>
          </Card>

          <Card
            title="Excluir conta"
            action={
              <Button
                variant="secondary"
                size="sm"
                className="border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50"
                onClick={() => setDeletingAccount(true)}
              >
                <Trash2 size={15} />
                Excluir conta
              </Button>
            }
          >
            <p className="py-1 text-sm text-slate-600">
              Remove seus dados pessoais permanentemente e encerra sua participação no Redist.
            </p>
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
          <ChangePasswordModal
            open={changingPassword}
            onClose={() => setChangingPassword(false)}
          />
          <DeleteAccountModal
            open={deletingAccount}
            onClose={() => setDeletingAccount(false)}
          />
        </>
      )}
    </div>
  )
}

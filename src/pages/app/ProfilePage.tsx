import { useState } from 'react'
import type { ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/lib/useAsync'
import type { FullUser } from '@/types'
import { getFullUser, updateContact } from '@/lib/resources'

function Row({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="font-medium text-navy-900 sm:text-right">{value || '—'}</dd>
    </div>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-2 text-lg font-semibold text-navy-900">{title}</h2>
      <dl>{children}</dl>
    </section>
  )
}

function EditContactModal({
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
  const [phone, setPhone] = useState(user.profile?.phone ?? '')
  const [email, setEmail] = useState(user.profile?.email ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateContact(user.id, {
        first_name: user.profile?.first_name ?? '',
        last_name: user.profile?.last_name ?? '',
        phone,
        email,
        home_city: user.profile?.city?.id ?? 0,
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
    <Modal open={open} onClose={onClose} title="Editar contato">
      <div className="flex flex-col gap-4">
        {error && <ErrorState message={error} />}
        <Field
          label="Telefone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
        />
        <Field
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
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
  const [editing, setEditing] = useState(false)

  return (
    <div>
      <PageHeader
        title="Meu perfil"
        subtitle="Seus dados pessoais e profissionais."
        action={
          data && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil size={16} />
              Editar contato
            </Button>
          )
        }
      />

      {loading && <Spinner />}
      {error && <ErrorState message={error} />}

      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Dados pessoais">
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

          <Card title="Dados profissionais">
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
        <EditContactModal
          open={editing}
          onClose={() => setEditing(false)}
          user={data}
          onSaved={reload}
        />
      )}
    </div>
  )
}

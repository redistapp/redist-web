import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Field } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { recoverPasswordRequest } from '@/lib/api'

export default function RecoverPasswordPage() {
  const [cpf, setCpf] = useState('')
  const [dateBirth, setDateBirth] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    await recoverPasswordRequest(cpf, dateBirth)
    setLoading(false)
    setSent(true)
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Confirme seus dados e enviaremos um link para você criar uma nova senha."
      footer={
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center rounded-xl border border-match-200 bg-match-50 px-6 py-8 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-match-100 text-match-700">
            <MailCheck size={22} />
          </span>
          <p className="mt-4 font-medium text-navy-900">Verifique seu e-mail</p>
          <p className="mt-1 text-sm text-slate-600">
            Se os dados conferirem, enviamos um link de redefinição para o e-mail cadastrado. Ele vale por 1 hora e só pode ser usado uma vez.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="CPF"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />
          <Field
            label="Data de nascimento"
            type="date"
            value={dateBirth}
            onChange={(e) => setDateBirth(e.target.value)}
            required
          />
          <Button type="submit" variant="match" size="lg" className="mt-2 w-full" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar link de redefinição'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}

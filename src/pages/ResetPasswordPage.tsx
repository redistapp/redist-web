import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Field } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { resetPasswordRequest } from '@/lib/api'

/*
| Conclui a redefinição de senha. O token vem no link enviado por e-mail
| (`/redefinir-senha?token=…`) — antes deste fluxo existir, a API trocava a
| senha direto a partir de CPF + data de nascimento, o que deixava qualquer
| pessoa trancar a conta de outra.
*/
export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''

  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pronto, setPronto] = useState(false)

  const senhaValida = senha.length >= 8
  const confere = senha === confirmacao
  const podeEnviar = Boolean(token) && senhaValida && confere && !loading

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    try {
      await resetPasswordRequest(token, senha)
      setPronto(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout
        title="Link inválido"
        subtitle="Este endereço não contém um token de redefinição."
        footer={
          <Link to="/recuperar-senha" className="font-medium text-brand-700 hover:underline">
            Solicitar um novo link
          </Link>
        }
      >
        <p className="text-sm text-slate-600">
          Abra o link exatamente como ele chegou no e-mail. Se ele já expirou, peça um novo.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Criar nova senha"
      subtitle="Escolha uma senha nova para acessar sua conta."
      footer={
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {pronto ? (
        <div className="flex flex-col items-center rounded-xl border border-match-200 bg-match-50 px-6 py-8 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-match-100 text-match-700">
            <CheckCircle2 size={22} />
          </span>
          <p className="mt-4 font-medium text-navy-900">Senha redefinida</p>
          <p className="mt-1 text-sm text-slate-600">
            Você já pode entrar com a nova senha. As sessões abertas em outros
            dispositivos foram encerradas.
          </p>
          <Button
            variant="match"
            size="lg"
            className="mt-5 w-full"
            onClick={() => navigate('/login', { replace: true })}
          >
            Ir para o login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            hint="Mínimo de 8 caracteres."
            required
          />
          <Field
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            required
          />

          {confirmacao.length > 0 && !confere && (
            <p className="text-sm text-red-700">As senhas não coincidem.</p>
          )}

          {erro && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
          )}

          <Button type="submit" variant="match" size="lg" className="mt-2 w-full" disabled={!podeEnviar}>
            {loading ? 'Salvando…' : 'Redefinir senha'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}

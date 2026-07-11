import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Field } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: conectar à API (POST /login com header ApiToken + cpf/senha).
    // Ver nota de segurança sobre o ApiToken no CLAUDE.md antes de expor o token no cliente.
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para gerenciar suas intenções de permuta."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-medium text-brand-700 hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="CPF"
          name="cpf"
          inputMode="numeric"
          autoComplete="username"
          placeholder="000.000.000-00"
          required
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="senha" className="text-sm font-medium text-navy-900">
              Senha
            </label>
            <a href="#" className="text-sm text-brand-700 hover:underline">
              Esqueci minha senha
            </a>
          </div>
          <input
            id="senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            required
            className="h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-[0.95rem] text-navy-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus-visible:border-brand-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600/40"
          />
        </div>
        <Button type="submit" variant="match" size="lg" className="mt-2 w-full">
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}

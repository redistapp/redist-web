import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Field } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const steps = ['Dados pessoais', 'Profissional', 'Instituição', 'Revisão']

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Progresso do cadastro">
      {steps.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            className={cn(
              'grid size-7 place-items-center rounded-full text-xs font-semibold',
              i === current
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-500',
            )}
            aria-current={i === current ? 'step' : undefined}
          >
            {i + 1}
          </span>
          {i < steps.length - 1 && <span className="h-px w-4 bg-slate-200" />}
        </li>
      ))}
    </ol>
  )
}

export default function RegisterPage() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: avançar para o passo 2 (dados profissionais) e, ao final,
    // enviar PUT /user/all para a API. Fluxo multietapa a ser implementado.
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Comece pelos seus dados pessoais. Leva poucos minutos."
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <StepIndicator current={0} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" name="first_name" autoComplete="given-name" required />
          <Field label="Sobrenome" name="last_name" autoComplete="family-name" required />
        </div>
        <Field
          label="CPF"
          name="cpf"
          inputMode="numeric"
          placeholder="000.000.000-00"
          required
        />
        <Field
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nome@instituicao.gov.br"
          required
        />
        <Field
          label="Senha"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="Use ao menos 8 caracteres."
          required
        />
        <Button type="submit" variant="match" size="lg" className="mt-2 w-full">
          Continuar
        </Button>
      </form>
    </AuthLayout>
  )
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SessionProvider } from '@/contexts/SessionContext'
import LoginPage from './LoginPage'

beforeEach(() => {
  // A SessionProvider dispara /auth/me ao montar — mockamos para um "guest" silencioso.
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: null }), { status: 200 })),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('LoginPage', () => {
  it('renderiza o formulário de login com os campos essenciais', () => {
    render(
      <MemoryRouter>
        <SessionProvider>
          <LoginPage />
        </SessionProvider>
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/CPF/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Esqueci minha senha/i })).toBeInTheDocument()
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { PremiumRequiredError, createIntention, getFullUser, registerUser } from './resources'

function mockFetchOnce(status: number, body: unknown): void {
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(text, { status })),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createIntention', () => {
  it('lança PremiumRequiredError quando a API responde 402', async () => {
    mockFetchOnce(402, {})
    await expect(createIntention(1)).rejects.toBeInstanceOf(PremiumRequiredError)
  })

  it('propaga a mensagem de erro em outras falhas', async () => {
    mockFetchOnce(400, { error: 'Instituição já cadastrada.' })
    await expect(createIntention(1)).rejects.toThrow('Instituição já cadastrada.')
  })
})

describe('registerUser', () => {
  it('traduz 409 em mensagem de CPF duplicado', async () => {
    mockFetchOnce(409, '')
    await expect(
      registerUser({
        cpf: '11144477735',
        password: 'x',
        first_name: 'A',
        last_name: 'B',
        date_birth: '1990-01-01',
        phone: '1',
        email: 'a@a.com',
        home_city: 1,
        institution_id: 1,
        registration: '1',
        office_career: 1,
        office_specialization: 1,
      }),
    ).rejects.toThrow('Já existe uma conta com este CPF.')
  })
})

describe('getFullUser', () => {
  it('lê a mensagem de erro no formato de validators do Adonis ({errors:[...]})', async () => {
    mockFetchOnce(422, {
      errors: [{ message: 'CPF inválido.' }, { message: 'Senha muito curta.' }],
    })
    await expect(getFullUser()).rejects.toThrow('CPF inválido. Senha muito curta.')
  })
})

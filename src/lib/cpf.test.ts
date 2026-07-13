import { describe, expect, it } from 'vitest'
import { formatCpf, isValidCpf } from './cpf'

describe('isValidCpf', () => {
  it('aceita um CPF válido, com ou sem máscara', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true)
    expect(isValidCpf('11144477735')).toBe(true)
  })

  it('rejeita CPF com dígito verificador incorreto', () => {
    expect(isValidCpf('11144477736')).toBe(false)
  })

  it('rejeita sequências de dígitos repetidos', () => {
    expect(isValidCpf('11111111111')).toBe(false)
    expect(isValidCpf('222.222.222-22')).toBe(false)
  })

  it('rejeita tamanho incorreto ou entrada vazia', () => {
    expect(isValidCpf('123')).toBe(false)
    expect(isValidCpf('')).toBe(false)
    expect(isValidCpf(null)).toBe(false)
    expect(isValidCpf(undefined)).toBe(false)
  })
})

describe('formatCpf', () => {
  it('formata progressivamente como 000.000.000-00', () => {
    expect(formatCpf('111')).toBe('111')
    expect(formatCpf('1114447')).toBe('111.444.7')
    expect(formatCpf('11144477735')).toBe('111.444.777-35')
  })

  it('ignora caracteres não numéricos e trunca em 11 dígitos', () => {
    expect(formatCpf('111.444.777-35999')).toBe('111.444.777-35')
  })
})

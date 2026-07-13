// Validação de CPF (dígito verificador), algoritmo padrão da Receita Federal.
// Mesma lógica do redist-server (app/Services/Cpf.ts) — mantenha as duas em sincronia.

function calcCheckDigit(base: string): number {
  let sum = 0
  let weight = base.length + 1
  for (const digit of base) {
    sum += parseInt(digit, 10) * weight
    weight--
  }
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export function isValidCpf(raw: string | null | undefined): boolean {
  if (!raw) return false
  const cpf = raw.replace(/\D/g, '')

  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const base9 = cpf.slice(0, 9)
  const digit1 = calcCheckDigit(base9)
  const digit2 = calcCheckDigit(base9 + digit1)

  return cpf === base9 + String(digit1) + String(digit2)
}

/** Formata como 000.000.000-00 (só para exibição; aceita string parcial). */
export function formatCpf(raw: string): string {
  const cpf = raw.replace(/\D/g, '').slice(0, 11)
  return cpf
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

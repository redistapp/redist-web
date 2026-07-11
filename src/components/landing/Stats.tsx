import { Container } from '@/components/ui/Container'

const stats = [
  { value: '1.000+', label: 'instituições cadastradas' },
  { value: '27', label: 'estados cobertos' },
  { value: 'CBO', label: 'classificação oficial de cargos' },
  { value: '100%', label: 'match automático e recíproco' },
]

export function Stats() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <Container className="py-10">
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <dt className="text-3xl font-semibold tracking-tight text-brand-700 sm:text-4xl">
                {s.value}
              </dt>
              <dd className="mt-1.5 text-sm text-slate-600">{s.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}

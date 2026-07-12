import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Indicador de carregamento centralizado. */
export function Spinner({
  className,
  label = 'Carregando…',
}: {
  className?: string
  label?: string
}) {
  return (
    <div
      className={cn('flex items-center justify-center gap-2 py-10 text-slate-500', className)}
      role="status"
    >
      <Loader2 size={18} className="animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

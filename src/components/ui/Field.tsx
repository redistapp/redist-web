import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/cn'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: ReactNode
}

/** Campo rotulado com input estilizado e dica opcional. */
export function Field({ label, hint, className, id, ...props }: FieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-navy-900">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          'h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-[0.95rem] text-navy-900',
          'placeholder:text-slate-400 transition-colors',
          'hover:border-slate-400 focus-visible:border-brand-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600/40',
        )}
        {...props}
      />
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
    </div>
  )
}

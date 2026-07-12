import type { SelectHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'
import { cn } from '@/lib/cn'

type Option = { value: string | number; label: string }

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label: string
  options: Option[]
  placeholder?: string
  hint?: ReactNode
}

/** Select nativo estilizado, com rótulo e placeholder. */
export function Select({
  label,
  options,
  placeholder = 'Selecione…',
  hint,
  className,
  id,
  disabled,
  ...props
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={selectId} className="text-sm font-medium text-navy-900">
        {label}
      </label>
      <select
        id={selectId}
        disabled={disabled}
        className={cn(
          'h-11 rounded-lg border border-slate-300 bg-white px-3 text-[0.95rem] text-navy-900',
          'transition-colors hover:border-slate-400 focus-visible:border-brand-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600/40',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-sm text-slate-500">{hint}</p>}
    </div>
  )
}

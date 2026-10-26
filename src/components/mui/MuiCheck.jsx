import { cn } from '@/lib/utils';

/**
 * Casilla de verificación accesible (área táctil de 44 px).
 * Props: label, name, checked, onChange, error, className, ...rest (input)
 */
export default function MuiCheck({ label, name, checked, onChange, error = '', className = '', ...rest }) {
  const id = rest.id || name;
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="inline-flex min-h-11 cursor-pointer items-center gap-3 select-none text-base">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          className="size-5 shrink-0 cursor-pointer rounded-[4px] accent-primary"
          {...rest}
        />
        <span className="font-medium">{label}</span>
      </label>
      {error && <span className="text-sm text-danger-ink">{error}</span>}
    </div>
  );
}

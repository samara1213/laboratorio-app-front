import { useId } from 'react';
import { cn } from '@/lib/utils';

// campos de 16 px: en iOS un tamaño menor hace zoom al enfocar
const controlBase =
  'w-full rounded-control border bg-surface px-3.5 text-base text-ink placeholder:text-muted/80 transition-colors disabled:cursor-not-allowed disabled:opacity-60';

/**
 * Input de texto del sistema visual
 */
export function Input({ className, invalid, ...props }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        'h-11',
        invalid ? 'border-2 border-danger' : 'border-border-strong focus-visible:border-primary',
        props.type === 'file' && 'h-auto py-2 file:mr-3 file:rounded-control file:border-0 file:bg-tint file:px-3 file:py-2 file:font-semibold file:text-primary',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Select nativo (accesible y con el selector del sistema en celulares)
 */
export function Select({ className, invalid, children, ...props }) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        'h-11 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2716%27%20height%3D%2716%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%234a5468%27%20stroke-width%3D%272%27%3E%3Cpath%20d%3D%27M6%209l6%206%206-6%27/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10',
        invalid ? 'border-2 border-danger' : 'border-border-strong focus-visible:border-primary',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/**
 * Área de texto
 */
export function Textarea({ className, invalid, ...props }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(controlBase, 'min-h-24 py-2.5', invalid ? 'border-2 border-danger' : 'border-border-strong focus-visible:border-primary', className)}
      {...props}
    />
  );
}

/**
 * Agrupa etiqueta, control, ayuda y error, enlazados con aria-describedby
 * @param {{ label?: string, error?: string, hint?: string, id?: string, className?: string,
 *   children: (props: { id: string, invalid: boolean, 'aria-describedby'?: string }) => JSX.Element }} props
 */
export function Field({ label, error, hint, id, className, children }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const hintId = hint ? `${fieldId}-ayuda` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={fieldId} className="text-[15px] font-semibold text-ink">
          {label}
        </label>
      )}
      {children({ id: fieldId, invalid: Boolean(error), 'aria-describedby': describedBy })}
      {hint && !error && (
        <span id={hintId} className="text-sm text-muted">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="text-sm text-danger-ink">
          {error}
        </span>
      )}
    </div>
  );
}

import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Casilla de verificación con área táctil de 44 px. Sin `label` visible, usar `aria-label`
 * @param {{ checked: boolean, onChange: (checked: boolean) => void, label?: string, disabled?: boolean,
 *   className?: string, 'aria-label'?: string }} props
 */
export function Checkbox({ checked, onChange, label, disabled = false, className, ...props }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2.5 text-[15px]',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 shrink-0 cursor-[inherit] accent-primary"
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  );
}

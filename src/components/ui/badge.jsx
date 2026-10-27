import { cn } from '@/lib/utils';

// colores con los tokens de estado (claro/oscuro)
const TONES = {
  neutral: 'bg-chip-cancel text-chip-cancel-ink',
  success: 'bg-chip-fin text-chip-fin-ink',
  warning: 'bg-chip-pend text-chip-pend-ink',
  info: 'bg-chip-adj text-chip-adj-ink',
  primary: 'bg-tint text-primary',
};

/**
 * Etiqueta corta de estado o categoría (Activo, Global, Sistema...)
 * @param {{ tone?: keyof TONES, className?: string, children: any }} props
 */
export function Badge({ tone = 'neutral', className, children }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap', TONES[tone], className)}>
      {children}
    </span>
  );
}

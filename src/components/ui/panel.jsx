import { cn } from '@/lib/utils';

/**
 * Panel de contenido (superficie con borde y radio de 10 px)
 */
export function Panel({ className, ...props }) {
  return <section className={cn('rounded-panel border border-border bg-surface', className)} {...props} />;
}

/**
 * Encabezado de un panel: título, descripción opcional y acciones a la derecha (abajo en celular)
 */
export function PanelHeader({ title, description, actions, className, headingLevel = 2 }) {
  const Heading = `h${headingLevel}`;
  return (
    <div className={cn('flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:px-5', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Heading className="text-lg font-bold leading-snug">{title}</Heading>
        {description && <p className="text-[15px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Bloque de carga (esqueleto)
 */
export function Skeleton({ className }) {
  return <span className={cn('block animate-pulse rounded-control bg-border/70', className)} aria-hidden="true" />;
}

/**
 * Indicador de carga con texto accesible
 */
export function Spinner({ label = 'Cargando…', className }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-3 text-[15px] font-semibold text-primary', className)}>
      <span className="size-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" aria-hidden="true" />
      {label}
    </span>
  );
}

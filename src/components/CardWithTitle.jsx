import { useInModal } from './mui/MuiModal';
import { Spinner } from '@/components/ui/panel';
import { cn } from '@/lib/utils';

/**
 * Panel con título. Dentro de un MuiModal se dibuja sin borde (el modal ya es la superficie).
 * Props: title, loading, loadingText, actions (botones a la derecha del título), className, children
 */
export default function CardWithTitle({ title, loading, loadingText = 'Cargando…', actions, className, children }) {
  const inModal = useInModal();
  return (
    <section className={cn(inModal ? 'flex flex-col' : 'rounded-panel border border-border bg-surface', className)}>
      <div className={cn('flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:px-6', inModal && 'pr-16')}>
        <h2 className="min-w-0 flex-1 text-lg font-bold leading-snug sm:text-xl">{title}</h2>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <div className="px-4 py-5 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner label={loadingText} />
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

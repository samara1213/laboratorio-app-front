import { Spinner } from '@/components/ui/panel';

/**
 * Capa de espera que bloquea la pantalla mientras termina una operación larga (por ejemplo, generar el PDF)
 */
export default function MuiModalLoader({ text = 'Generando PDF…' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4" aria-live="polite">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-panel border border-border bg-surface px-6 py-8 text-center shadow-xl">
        <Spinner label={text} />
        <p className="text-[15px] text-muted">No cierres ni recargues la página hasta que termine.</p>
      </div>
    </div>
  );
}

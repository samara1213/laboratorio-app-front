import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

/**
 * Confirmación de una acción destructiva. El botón nombra la acción (por defecto "Eliminar").
 * Props: open, title, message, onConfirm, onCancel, confirmLabel, loading, confirmVariant ('danger' por defecto)
 */
export default function ConfirmDialog({ open, title = 'Confirmar', message, onConfirm, onCancel, confirmLabel = 'Eliminar', loading = false, confirmVariant = 'danger' }) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onCancel?.()}>
      <DialogContent
        size="md"
        title={title}
        description={message}
        footer={
          <>
            <Button variant="secondary" onClick={onCancel}>
              Volver
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
              {loading ? 'Procesando…' : confirmLabel}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

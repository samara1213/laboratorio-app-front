import { toast } from 'sonner';
import { useChangeOrderStatus, useOrder } from '../../hooks/queries/useOrders';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/panel';
import { StatusChip } from '@/components/ui/status';
import { errorMessage } from '@/lib/utils';

/**
 * Vista previa de los exámenes de una orden, con la opción de pasarla a "Procesando"
 * Props: open, onClose, orderId
 */
export default function PreviewExamsModal({ open, onClose, orderId }) {
  const { data: order, isLoading } = useOrder(open ? orderId : null);
  const changeStatus = useChangeOrderStatus();

  const handleProcessOrder = () => {
    changeStatus.mutate(
      { ord_id: order.ord_id, ord_status: 'PROCESANDO' },
      {
        onSuccess: () => {
          toast.success(`Orden ${order.ord_code} en proceso`);
          onClose();
        },
        onError: (error) => toast.error(errorMessage(error, 'No fue posible cambiar el estado de la orden.')),
      },
    );
  };

  const patient = [order?.customer?.cus_first_name, order?.customer?.cus_first_lastname].filter(Boolean).join(' ');

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        size="2xl"
        title={order ? `Orden ${order.ord_code}` : 'Exámenes de la orden'}
        description={order ? `${patient} · ${order.customer?.cus_document_number ?? ''}` : undefined}
        footer={
          order && (
            <>
              <Button variant="secondary" onClick={onClose}>
                Cerrar
              </Button>
              {['PENDIENTE', 'ORDEN CON ADJUNTO'].includes(order.ord_status) && (
                <Button onClick={handleProcessOrder} disabled={changeStatus.isPending}>
                  {changeStatus.isPending ? 'Guardando…' : 'Pasar a procesando'}
                </Button>
              )}
            </>
          )
        }
      >
        {isLoading || !order ? (
          <div className="flex justify-center py-10">
            <Spinner label="Cargando la orden…" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <StatusChip status={order.ord_status} className="self-start" />
            <h3 className="text-base font-bold">Exámenes solicitados</h3>
            {(order.exams ?? []).length > 0 ? (
              <ul className="flex flex-col gap-2">
                {order.exams.map((exam) => (
                  <li key={exam.exa_id} className="flex flex-col gap-0.5 rounded-panel border border-border p-3">
                    <span className="font-semibold">{exam.exa_name}</span>
                    <span className="text-[15px] text-muted">{exam.exa_description || 'Sin descripción'}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] text-muted">La orden no tiene exámenes registrados.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

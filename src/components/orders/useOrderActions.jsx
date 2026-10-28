import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import PreviewExamsModal from '../dashboard/PreviewExamsModal';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import AttachmentsDialog from './AttachmentsDialog';
import { useCancelOrder, useGeneratePdf, useSendResults } from '../../hooks/queries/useOrders';
import { usePermissions } from '../../hooks/usePermissions';
import { getUrlPrefirredOrderDB } from '../../services';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { openInNewTab } from '@/lib/open-url';
import { errorMessage } from '@/lib/utils';

// estados con resultados en captura (aún no hay PDF)
const IN_PROGRESS = ['PENDIENTE', 'PROCESANDO', 'ORDEN CON ADJUNTO'];

/**
 * Acciones de una orden según su estado y los permisos del rol (Inicio y Buscar órdenes):
 * una acción principal (registrar resultados, generar PDF o ver PDF) y el resto en un menú.
 * @returns {{ renderActions: (order: object) => JSX.Element, dialogs: JSX.Element }}
 */
export function useOrderActions() {
  const { can } = usePermissions();
  const generatePdf = useGeneratePdf();
  const sendResults = useSendResults();
  const cancelOrder = useCancelOrder();
  const [preview, setPreview] = useState(null);
  const [attachments, setAttachments] = useState(null);
  const [toCancel, setToCancel] = useState(null);

  const canGenerate = can('orders:update') || can('results:create');

  const viewPdf = (order) =>
    openInNewTab(async () => (await getUrlPrefirredOrderDB(order.ord_id)).data.data.ord_pdf_url).catch((error) =>
      toast.error(errorMessage(error, 'No fue posible abrir el PDF.')),
    );

  const generate = (order) =>
    toast.promise(generatePdf.mutateAsync(order.ord_id), {
      loading: `Generando el PDF de la orden ${order.ord_code}…`,
      success: (response) => response?.data?.message || 'PDF generado',
      error: (error) => errorMessage(error, 'No fue posible generar el PDF.'),
    });

  const send = (order) =>
    toast.promise(sendResults.mutateAsync(order.ord_id), {
      loading: `Enviando los resultados de la orden ${order.ord_code}…`,
      success: (response) => response?.data?.message || 'Correo enviado',
      error: (error) => errorMessage(error, 'No fue posible enviar el correo.'),
    });

  const confirmCancel = () =>
    cancelOrder.mutate(toCancel.ord_id, {
      onSuccess: (response) => toast.success(response?.data?.message || `Orden ${toCancel.ord_code} cancelada`),
      onError: (error) => toast.error(errorMessage(error, 'No fue posible cancelar la orden.')),
      onSettled: () => setToCancel(null),
    });

  const renderActions = (order) => {
    const status = order.ord_status;
    const hasPdf = order.has_pdf ?? Boolean(order.ord_pdf_url);
    const hasEmail = order.customer?.has_email ?? Boolean(order.customer?.cus_email);
    const finished = status === 'FINALIZADA';
    const attachmentsCount = order.attachments_count;

    let primary = null;
    if (IN_PROGRESS.includes(status) && can('results:create'))
      primary = (
        <Button asChild variant="secondary" size="sm" className="max-md:h-11">
          <Link to={`/results/${order.ord_id}`}>Registrar resultados</Link>
        </Button>
      );
    else if (status === 'PENDIENTE PDF' && canGenerate)
      primary = (
        <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => generate(order)}>
          <Icon icon="mdi:file-pdf-box" className="size-5" aria-hidden="true" />
          Generar PDF
        </Button>
      );
    else if (finished && hasPdf)
      primary = (
        <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => viewPdf(order)}>
          <Icon icon="mdi:file-eye-outline" className="size-5" aria-hidden="true" />
          Ver PDF
        </Button>
      );

    return (
      <>
        {primary}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon-sm" aria-label={`Más acciones de la orden ${order.ord_code}`} className="max-md:size-11 max-md:flex-none">
              <Icon icon="mdi:dots-horizontal" className="size-5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setPreview(order)}>
              <Icon icon="mdi:eye-outline" aria-hidden="true" />
              Ver exámenes de la orden
            </DropdownMenuItem>
            {(status === 'PENDIENTE PDF' || finished) && can('results:update') && (
              <DropdownMenuItem asChild>
                <Link to={`/results/edit/${order.ord_id}`}>
                  <Icon icon="mdi:pencil-outline" aria-hidden="true" />
                  Corregir resultados
                </Link>
              </DropdownMenuItem>
            )}
            {finished && canGenerate && (
              <DropdownMenuItem onSelect={() => generate(order)}>
                <Icon icon="mdi:file-refresh-outline" aria-hidden="true" />
                Generar el PDF de nuevo
              </DropdownMenuItem>
            )}
            {finished && can('orders:update') && (
              <DropdownMenuItem disabled={!hasEmail} onSelect={() => send(order)}>
                <Icon icon="mdi:email-fast-outline" aria-hidden="true" />
                {hasEmail ? 'Enviar al correo del paciente' : 'Enviar al correo (el paciente no tiene)'}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => setAttachments(order)}>
              <Icon icon="mdi:paperclip" aria-hidden="true" />
              {attachmentsCount ? `Adjuntos (${attachmentsCount})` : can('orders:update') ? 'Adjuntar archivo' : 'Adjuntos'}
            </DropdownMenuItem>
            {can('orders:delete') && !finished && status !== 'CANCELADA' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={() => setToCancel(order)}>
                  <Icon icon="mdi:close-circle-outline" aria-hidden="true" />
                  Cancelar orden
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  };

  const dialogs = (
    <>
      <PreviewExamsModal open={Boolean(preview)} onClose={() => setPreview(null)} orderId={preview?.ord_id} />
      <AttachmentsDialog open={Boolean(attachments)} order={attachments} onClose={() => setAttachments(null)} />
      <ConfirmDialog
        open={Boolean(toCancel)}
        title={toCancel ? `Cancelar la orden ${toCancel.ord_code}` : 'Cancelar orden'}
        message="La orden quedará cancelada: no se podrán registrar resultados ni generar su PDF."
        confirmLabel="Cancelar orden"
        loading={cancelOrder.isPending}
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      />
    </>
  );

  return { renderActions, dialogs };
}

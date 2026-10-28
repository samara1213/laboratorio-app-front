import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useAttachFile, useAttachments, useDeleteAttachment } from '../../hooks/queries/useOrders';
import { usePermissions } from '../../hooks/usePermissions';
import { getAttachmentUrlDB } from '../../services';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/panel';
import { openInNewTab } from '@/lib/open-url';
import { errorMessage, formatDateTime } from '@/lib/utils';

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPT = 'application/pdf,image/png,image/jpeg,image/gif,image/webp,image/bmp';

/**
 * Adjunto de una orden (PDF o imagen, por ejemplo el resultado de un equipo): ver, subir o
 * reemplazar (también con la cámara en celular y tablet) y eliminar
 * @param {{ order?: object, open: boolean, onClose: () => void }} props
 */
export default function AttachmentsDialog({ order, open, onClose }) {
  const { can } = usePermissions();
  const { data: attachments = [], isLoading } = useAttachments(open ? order?.ord_id : null);
  const attach = useAttachFile();
  const remove = useDeleteAttachment();
  const [confirming, setConfirming] = useState(null);
  const fileInput = useRef(null);
  const cameraInput = useRef(null);
  const canEdit = can('orders:update');
  const touch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

  const upload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_SIZE) {
      toast.error('El archivo supera los 10 MB.');
      return;
    }
    attach.mutate(
      { order, file },
      {
        onSuccess: (response) => toast.success(response?.data?.message || 'Archivo adjuntado'),
        onError: (error) => toast.error(errorMessage(error, 'No fue posible adjuntar el archivo.')),
      },
    );
  };

  const view = (attachment) =>
    openInNewTab(async () => (await getAttachmentUrlDB(attachment.att_id)).data.data.url).catch((error) =>
      toast.error(errorMessage(error, 'No fue posible abrir el adjunto.')),
    );

  const confirmRemove = (attachment) =>
    remove.mutate(attachment.att_id, {
      onSuccess: (response) => toast.success(response.data.message),
      onError: (error) => toast.error(errorMessage(error, 'No fue posible eliminar el adjunto.')),
      onSettled: () => setConfirming(null),
    });

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent
        size="lg"
        title={order ? `Adjuntos · orden ${order.ord_code}` : 'Adjuntos'}
        description="PDF o imagen de hasta 10 MB. Las imágenes salen en el PDF de resultados, en las secciones que las incluyen."
      >
        <div className="flex flex-col gap-5">
          {isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : attachments.length === 0 ? (
            <p className="rounded-control border border-dashed border-border-strong px-4 py-6 text-center text-[15px] text-muted">
              La orden no tiene archivos adjuntos.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {attachments.map((attachment) => (
                <li key={attachment.att_id} className="flex flex-col gap-3 rounded-control border border-border p-3 sm:flex-row sm:items-center">
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-tint text-primary" aria-hidden="true">
                      <Icon icon={attachment.type === 'pdf' ? 'mdi:file-pdf-box' : 'mdi:image-outline'} className="size-6" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-semibold">{attachment.type === 'pdf' ? 'Documento PDF' : 'Imagen'}</span>
                      <span className="tabular text-sm text-muted">Subido el {formatDateTime(attachment.att_created_at)}</span>
                    </span>
                  </span>
                  {confirming === attachment.att_id ? (
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-danger-ink">¿Eliminar el adjunto?</span>
                      <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => setConfirming(null)}>
                        No
                      </Button>
                      <Button variant="danger" size="sm" className="max-md:h-11" disabled={remove.isPending} onClick={() => confirmRemove(attachment)}>
                        Eliminar
                      </Button>
                    </span>
                  ) : (
                    <span className="flex gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
                      <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => view(attachment)}>
                        <Icon icon="mdi:open-in-new" className="size-5" aria-hidden="true" />
                        Ver
                      </Button>
                      {canEdit && (
                        <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => setConfirming(attachment.att_id)}>
                          <Icon icon="mdi:delete-outline" className="size-5 text-danger-ink" aria-hidden="true" />
                          Eliminar
                        </Button>
                      )}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {canEdit && (
            <div className="flex flex-col gap-2">
              <input ref={fileInput} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={upload} />
              <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={upload} />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => fileInput.current?.click()} disabled={attach.isPending}>
                  <Icon icon="mdi:paperclip" className="size-5" aria-hidden="true" />
                  {attach.isPending ? 'Subiendo…' : attachments.length ? 'Reemplazar archivo' : 'Elegir archivo'}
                </Button>
                {touch && (
                  <Button variant="secondary" onClick={() => cameraInput.current?.click()} disabled={attach.isPending}>
                    <Icon icon="mdi:camera-outline" className="size-5" aria-hidden="true" />
                    Tomar foto
                  </Button>
                )}
              </div>
              {attachments.length > 0 && <p className="text-sm text-muted">Cada orden tiene un adjunto: el nuevo reemplaza al actual.</p>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

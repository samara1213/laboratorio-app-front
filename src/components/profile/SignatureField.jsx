import { useId, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useDeleteSignature, useSignature, useUploadSignature } from '../../hooks/queries/useProfile';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/panel';
import { errorMessage } from '@/lib/utils';

const MAX_SIZE = 1024 * 1024;

/**
 * Vista previa y carga de la firma (PNG o JPG de máximo 1 MB).
 * En celular y tablet el selector ofrece la cámara o la galería
 * @param {{ userId?: string, name?: string }} props userId vacío = la firma propia
 */
export default function SignatureField({ userId, name }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: url, isLoading } = useSignature(userId);
  const upload = useUploadSignature(userId);
  const remove = useDeleteSignature(userId);

  const onFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) return toast.error('La firma debe ser una imagen PNG o JPG.');
    if (file.size > MAX_SIZE) return toast.error('La firma debe pesar máximo 1 MB.');
    upload.mutate(file, {
      onSuccess: (response) => toast.success(response.data.message || 'Firma guardada'),
      onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar la firma.')),
    });
  };

  const onDelete = () =>
    remove.mutate(undefined, {
      onSuccess: (response) => toast.success(response.data.message || 'Firma eliminada'),
      onError: (error) => toast.error(errorMessage(error, 'No fue posible eliminar la firma.')),
      onSettled: () => setConfirmDelete(false),
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex aspect-[3/1] w-full max-w-md items-center justify-center overflow-hidden rounded-panel border border-dashed border-border-strong bg-white p-3">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : url ? (
          // fondo blanco también en tema oscuro: así se verá en el PDF
          <img src={url} alt={name ? `Firma de ${name}` : 'Tu firma'} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-center text-[15px] text-gray-500">Sin firma cargada</span>
        )}
      </div>
      <p className="max-w-prose text-sm text-muted">
        Usa una foto o un escaneo de la firma sobre fondo blanco, recortada y nítida. PNG o JPG de máximo 1 MB. Aparece en el PDF de cada examen que firmes.
      </p>
      <div className="flex flex-wrap gap-2">
        <input id={inputId} ref={inputRef} type="file" accept="image/png,image/jpeg" className="sr-only" onChange={onFile} />
        <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
          <Icon icon="mdi:upload" className="size-5" aria-hidden="true" />
          {upload.isPending ? 'Subiendo…' : url ? 'Cambiar firma' : 'Cargar firma'}
        </Button>
        {url &&
          (confirmDelete ? (
            <>
              <Button variant="danger" onClick={onDelete} disabled={remove.isPending}>
                {remove.isPending ? 'Eliminando…' : 'Sí, eliminar firma'}
              </Button>
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                No
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
              Eliminar firma
            </Button>
          ))}
      </div>
    </div>
  );
}

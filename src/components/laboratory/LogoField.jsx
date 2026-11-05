import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useDeleteLabLogo, useLabLogo, useUploadLabLogo } from '../../hooks/queries/useLaboratoryProfile';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/panel';
import { errorMessage } from '@/lib/utils';

const MAX_SIZE = 1024 * 1024;

/**
 * Vista previa y carga del logo del laboratorio (PNG o JPG de máximo 1 MB) que sale en el
 * encabezado del PDF. En celular y tablet el selector ofrece la cámara o la galería
 * @param {{ labId?: string, name?: string, canEdit?: boolean }} props labId vacío = el laboratorio de la sesión
 */
export default function LogoField({ labId, name, canEdit = true }) {
  const inputRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: url, isLoading } = useLabLogo(labId);
  const upload = useUploadLabLogo(labId);
  const remove = useDeleteLabLogo(labId);

  const onFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) return toast.error('El logo debe ser una imagen PNG o JPG.');
    if (file.size > MAX_SIZE) return toast.error('El logo debe pesar máximo 1 MB.');
    upload.mutate(file, {
      onSuccess: (response) => toast.success(response.data.message || 'Logo guardado'),
      onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar el logo.')),
    });
  };

  const onDelete = () =>
    remove.mutate(undefined, {
      onSuccess: (response) => toast.success(response.data.message || 'Logo eliminado'),
      onError: (error) => toast.error(errorMessage(error, 'No fue posible eliminar el logo.')),
      onSettled: () => setConfirmDelete(false),
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex aspect-[3/1] w-full max-w-md items-center justify-center overflow-hidden rounded-panel border border-dashed border-border-strong bg-white p-3">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : url ? (
          // fondo blanco también en tema oscuro: así se verá en el PDF
          <img src={url} alt={name ? `Logo de ${name}` : 'Logo del laboratorio'} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-center text-[15px] text-gray-500">Sin logo: el PDF sale sin imagen en el encabezado</span>
        )}
      </div>
      <p className="max-w-prose text-sm text-muted">
        PNG o JPG de máximo 1 MB. Sale en el encabezado del PDF de resultados; se ve mejor horizontal y con fondo transparente o blanco.
        Los PDF ya generados no cambian: el logo nuevo sale al generar o regenerar el PDF.
      </p>
      {canEdit && (
        <div className="flex flex-wrap gap-2">
          <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={onFile} />
          <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
            <Icon icon="mdi:upload" className="size-5" aria-hidden="true" />
            {upload.isPending ? 'Subiendo…' : url ? 'Cambiar logo' : 'Cargar logo'}
          </Button>
          {url &&
            (confirmDelete ? (
              <>
                <Button variant="danger" onClick={onDelete} disabled={remove.isPending}>
                  {remove.isPending ? 'Eliminando…' : 'Sí, quitar logo'}
                </Button>
                <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                  No
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
                Quitar logo
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/utils';

const WIDE = '(min-width: 1024px)';

/**
 * Vista previa de un PDF: en portátil y escritorio se abre en un panel lateral; en celular y
 * tablet, en una pestaña nueva (el visor de PDF del navegador). La URL del PDF es temporal
 * (blob) y se libera al cerrar
 * @returns {{ open: (title: string, fetchPdf: () => Promise<{ data: Blob }>, onError?: (error) => void) => Promise<boolean>, panel: JSX.Element }}
 *   onError: reemplaza el aviso por defecto (por ejemplo, para listar los errores de una plantilla)
 */
export function usePdfPreview() {
  const [preview, setPreview] = useState(null); // { title, url }
  const urls = useRef(new Set());

  // libera todas las URL al salir de la pantalla
  useEffect(() => {
    const created = urls.current;
    return () => created.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const close = useCallback(() => {
    setPreview((current) => {
      if (current) {
        URL.revokeObjectURL(current.url);
        urls.current.delete(current.url);
      }
      return null;
    });
  }, []);

  const open = useCallback(
    async (title, fetchPdf, onError) => {
      const wide = window.matchMedia(WIDE).matches;
      // la pestaña se abre en el mismo clic (si se abre después de esperar, el navegador la bloquea)
      const tab = wide ? null : window.open('', '_blank');
      try {
        const response = await fetchPdf();
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        urls.current.add(url);
        if (tab) {
          tab.location.href = url;
        } else {
          setPreview((current) => {
            if (current) {
              URL.revokeObjectURL(current.url);
              urls.current.delete(current.url);
            }
            return { title, url };
          });
        }
        return true;
      } catch (error) {
        tab?.close();
        if (onError) onError(error);
        else toast.error(errorMessage(error, 'No fue posible generar la vista previa.'));
        return false;
      }
    },
    [],
  );

  const panel = (
    <DialogPrimitive.Root open={Boolean(preview)} onOpenChange={(value) => !value && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-[min(820px,100vw)] flex-col bg-surface text-ink shadow-xl outline-none data-[state=open]:animate-fade-in"
        >
          <div className="flex items-center gap-3 border-b border-border px-5 py-3">
            <DialogPrimitive.Title className="min-w-0 flex-1 truncate text-lg font-bold">{preview?.title}</DialogPrimitive.Title>
            {preview && (
              <Button variant="secondary" size="sm" asChild>
                <a href={preview.url} target="_blank" rel="noopener">
                  <Icon icon="mdi:open-in-new" className="size-5" aria-hidden="true" />
                  Abrir en otra pestaña
                </a>
              </Button>
            )}
            <DialogPrimitive.Close className="inline-flex size-11 items-center justify-center rounded-control text-muted hover:bg-ground" aria-label="Cerrar vista previa">
              <Icon icon="mdi:close" className="size-6" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>
          {preview && <iframe title={preview.title} src={preview.url} className="min-h-0 flex-1 bg-ground" />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );

  return { open, panel };
}

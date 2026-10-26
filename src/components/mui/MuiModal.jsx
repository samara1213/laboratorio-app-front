import { createContext, useContext } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

// permite que CardWithTitle se dibuje sin borde cuando está dentro de un modal
const ModalContext = createContext(false);
export const useInModal = () => useContext(ModalContext);

const widths = {
  'max-w-sm': 'sm:max-w-sm',
  'max-w-md': 'sm:max-w-md',
  'max-w-lg': 'sm:max-w-lg',
  'max-w-xl': 'sm:max-w-xl',
  'max-w-2xl': 'sm:max-w-2xl',
  'max-w-3xl': 'sm:max-w-3xl',
  'max-w-4xl': 'sm:max-w-4xl',
};

/**
 * Modal reutilizable: pantalla completa en celular y ventana centrada desde `sm`.
 * Props:
 * - open: boolean, si el modal está visible
 * - onClose: función para cerrar el modal
 * - children: contenido del modal (normalmente un CardWithTitle con el título visible)
 * - maxWidth: ancho máximo ('max-w-lg', 'max-w-2xl'...)
 * - title: nombre accesible del diálogo (si no se envía se usa el del CardWithTitle interno)
 */
export default function MuiModal({ open, onClose, children, maxWidth = 'max-w-lg', title = 'Diálogo' }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(value) => !value && onClose?.()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-0 z-50 flex flex-col overflow-y-auto bg-surface text-ink outline-none data-[state=open]:animate-fade-in',
            'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[min(90dvh,900px)] sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-panel sm:border sm:border-border sm:shadow-xl',
            widths[maxWidth] ?? widths['max-w-lg'],
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close
            className="absolute top-3 right-3 z-10 inline-flex size-11 items-center justify-center rounded-control text-muted hover:bg-ground"
            aria-label="Cerrar"
          >
            <Icon icon="mdi:close" className="size-6" aria-hidden="true" />
          </DialogPrimitive.Close>
          <ModalContext.Provider value={true}>{children}</ModalContext.Provider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

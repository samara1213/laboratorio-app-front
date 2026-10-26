import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const widths = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
};

/**
 * Contenido del diálogo: pantalla completa en celular y ventana centrada desde `sm`.
 * El título es obligatorio (accesibilidad); la descripción y el pie son opcionales.
 */
export function DialogContent({ title, description, footer, size = 'lg', className, children, hideClose = false, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-fade-in" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-surface text-ink outline-none data-[state=open]:animate-fade-in',
          'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[min(90dvh,900px)] sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-panel sm:border sm:border-border sm:shadow-xl',
          widths[size] ?? widths.lg,
          className,
        )}
        {...(!description && { 'aria-describedby': undefined })}
        {...props}
      >
        <div className="flex items-start gap-3 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogPrimitive.Title className="text-xl font-bold leading-tight">{title}</DialogPrimitive.Title>
            {description && <DialogPrimitive.Description className="text-[15px] text-muted">{description}</DialogPrimitive.Description>}
          </div>
          {!hideClose && (
            <DialogPrimitive.Close className="-mr-2 -mt-1 inline-flex size-11 items-center justify-center rounded-control text-muted hover:bg-ground" aria-label="Cerrar">
              <Icon icon="mdi:close" className="size-6" aria-hidden="true" />
            </DialogPrimitive.Close>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6 [&>*]:w-full sm:[&>*]:w-auto">
            {footer}
          </div>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

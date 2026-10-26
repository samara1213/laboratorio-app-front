import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuSeparator = (props) => <DropdownPrimitive.Separator className="my-1 h-px bg-border" {...props} />;
export const DropdownMenuLabel = ({ className, ...props }) => (
  <DropdownPrimitive.Label className={cn('px-3 py-2 text-sm text-muted', className)} {...props} />
);

/**
 * Contenido del menú desplegable
 */
export function DropdownMenuContent({ className, align = 'end', sideOffset = 6, ...props }) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn('z-50 min-w-52 rounded-panel border border-border bg-surface p-1 text-ink shadow-lg data-[state=open]:animate-fade-in', className)}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

/**
 * Opción del menú (44 px de alto para uso táctil)
 */
export function DropdownMenuItem({ className, destructive = false, ...props }) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        'flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-control px-3 text-[15px] outline-none data-[highlighted]:bg-ground data-[disabled]:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0',
        destructive ? 'text-danger-ink' : 'text-ink',
        className,
      )}
      {...props}
    />
  );
}

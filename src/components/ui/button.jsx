import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Estilos de botón del sistema visual. Todos miden al menos 44 px de alto
 * (objetivo táctil); `sm` (40 px) solo para acciones dentro de tablas densas.
 */
export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold transition-colors disabled:pointer-events-none disabled:opacity-55 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:bg-primary-hover',
        secondary: 'border border-border-strong bg-surface text-ink hover:bg-ground',
        ghost: 'bg-transparent text-primary hover:bg-tint',
        danger: 'bg-danger text-white hover:bg-danger-hover',
      },
      size: {
        default: 'h-11 px-5 text-base',
        sm: 'h-10 px-3.5 text-[15px]',
        lg: 'h-12 px-6 text-[17px]',
        icon: 'size-11',
        'icon-sm': 'size-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

/**
 * Botón base. Con `asChild` aplica los estilos a su único hijo (por ejemplo un <Link>)
 */
export function Button({ className, variant, size, asChild = false, type = 'button', ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp type={asChild ? undefined : type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

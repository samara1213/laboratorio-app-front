import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Botón de acción solo con ícono (44 px). El `title` es su nombre accesible y su tooltip.
 */
export function ActionIconButton({ icon, title, onClick, className = '', tone = 'default', ...rest }) {
  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(tone === 'danger' && 'text-danger-ink hover:bg-danger/10', className)}
      {...rest}
    >
      <Icon icon={icon} className="size-5" aria-hidden="true" />
    </Button>
  );
}

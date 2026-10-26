import { getOrderStatus } from '@/lib/order-status';
import { cn } from '@/lib/utils';

/**
 * Chip de estado de orden: punto con el color de la tapa del tubo y el nombre del estado
 */
export function StatusChip({ status, className }) {
  const s = getOrderStatus(status);
  return (
    <span className={cn('inline-flex items-center gap-2 whitespace-nowrap rounded-full py-1 pr-3 pl-2 text-sm font-semibold', s.chip, className)}>
      <span className={cn('size-2.5 rounded-full', s.cap)} aria-hidden="true" />
      {s.label}
    </span>
  );
}

/**
 * Tubo de muestra con la tapa del color del estado (decorativo)
 * @param {{ status: string, level?: number, size?: 'sm'|'md' }} props level = llenado entre 0 y 1
 */
export function TubeIcon({ status, level = 0.4, size = 'md', className }) {
  const s = getOrderStatus(status);
  const dims = size === 'sm' ? { cap: 'h-2.5 w-[22px]', body: 'h-7 w-4' } : { cap: 'h-3 w-[30px]', body: 'h-10 w-[22px]' };
  return (
    <span className={cn('flex shrink-0 flex-col items-center', className)} aria-hidden="true">
      <span className={cn('rounded-t-[4px] rounded-b-[2px]', dims.cap, s.cap)} />
      <span className={cn('relative overflow-hidden rounded-b-full border-2 border-t-0 border-border-strong', dims.body)}>
        <span className={cn('absolute inset-x-0 bottom-0', s.fill)} style={{ height: `${Math.round(Math.min(Math.max(level, 0), 1) * 100)}%` }} />
      </span>
    </span>
  );
}

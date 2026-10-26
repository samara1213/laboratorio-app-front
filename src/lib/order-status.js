/**
 * Estados de orden con el color de las tapas de los tubos de muestra.
 * Cada estado conserva su color en toda la aplicación y siempre se muestra con su nombre.
 * Las clases son literales completas para que Tailwind las genere.
 */
export const ORDER_STATUS = {
  PENDIENTE: { label: 'Pendiente', cap: 'bg-cap-pend', chip: 'bg-chip-pend text-chip-pend-ink', fill: 'bg-cap-pend/20' },
  PROCESANDO: { label: 'Procesando', cap: 'bg-cap-proc', chip: 'bg-chip-proc text-chip-proc-ink', fill: 'bg-cap-proc/20' },
  'ORDEN CON ADJUNTO': { label: 'Con adjunto', cap: 'bg-cap-adj', chip: 'bg-chip-adj text-chip-adj-ink', fill: 'bg-cap-adj/20' },
  'PENDIENTE PDF': { label: 'Pendiente de PDF', cap: 'bg-cap-pdf', chip: 'bg-chip-pdf text-chip-pdf-ink', fill: 'bg-cap-pdf/20' },
  FINALIZADA: { label: 'Finalizada', cap: 'bg-cap-fin', chip: 'bg-chip-fin text-chip-fin-ink', fill: 'bg-cap-fin/20' },
  CANCELADA: { label: 'Cancelada', cap: 'bg-cap-cancel', chip: 'bg-chip-cancel text-chip-cancel-ink', fill: 'bg-cap-cancel/20' },
};

/**
 * Configuración visual de un estado; si no se conoce, se muestra en gris con su texto original
 * @param {string} status valor de ord_status
 */
export function getOrderStatus(status) {
  return ORDER_STATUS[status] ?? { ...ORDER_STATUS.CANCELADA, label: status || 'Sin estado' };
}

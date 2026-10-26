import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Une clases de Tailwind resolviendo conflictos (la última gana)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Mensaje de error legible a partir de un error de axios
 * @param {unknown} error error capturado
 * @param {string} fallback mensaje si el servidor no envía uno
 */
export function errorMessage(error, fallback = 'No fue posible completar la acción. Intenta de nuevo.') {
  const status = error?.response?.status;
  // los errores del servidor (5xx) nunca muestran el texto técnico
  if (!status || status >= 500) return fallback;
  const msg = error?.response?.data?.message;
  return (Array.isArray(msg) ? msg[0] : msg) || fallback;
}

/**
 * Fecha y hora cortas en español de Colombia (24 oct · 07:42)
 */
export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const day = date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: 'America/Bogota' }).replace('.', '');
  const time = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Bogota' });
  return `${day} · ${time}`;
}

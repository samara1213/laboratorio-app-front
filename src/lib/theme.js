// Preferencia de tema del usuario: 'light' | 'dark' | 'system' (por defecto)
const STORAGE_KEY = 'lab.theme';

/**
 * Lee la preferencia guardada (sin fallar si el navegador bloquea el almacenamiento)
 */
export function getThemePreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'system';
  } catch {
    return 'system';
  }
}

/**
 * Aplica el tema a <html> y lo guarda
 * @param {'light'|'dark'|'system'} preference preferencia elegida
 */
export function setThemePreference(preference) {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // sin almacenamiento: se aplica solo en esta sesión
  }
  applyTheme(preference);
}

/**
 * Agrega o quita la clase "dark" según la preferencia y el sistema operativo
 */
export function applyTheme(preference = getThemePreference()) {
  const dark = preference === 'dark' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}

/**
 * Suscripción a los cambios de la clase "dark" de <html> (para useSyncExternalStore)
 */
export function subscribeToTheme(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

export const isDarkTheme = () => document.documentElement.classList.contains('dark');

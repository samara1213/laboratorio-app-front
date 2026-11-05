import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Hash del script en línea de index.html (aplica el tema antes de pintar) para permitirlo en la CSP
 */
function inlineScriptHash() {
  // el navegador calcula el hash con los saltos de línea normalizados a \n
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8').replace(/\r\n?/g, '\n');
  const inline = html.match(/<script>([\s\S]*?)<\/script>/);
  return inline ? `'sha256-${createHash('sha256').update(inline[1]).digest('base64')}'` : '';
}

/**
 * Origen de la API (VITE_URL_API incluye /api); sin ella, solo el mismo origen
 */
function apiOrigin(env) {
  try {
    return new URL(env.VITE_URL_API).origin;
  } catch {
    return '';
  }
}

/**
 * Cabeceras de seguridad de `vite preview` (así sirve Railway el front con `yarn start`).
 * img-src admite https: por las firmas (URL firmadas de Supabase); el visor de plantillas usa blob:
 */
function securityHeaders(env) {
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${inlineScriptHash()}`.trim(),
    // React y Radix ponen estilos en el atributo style
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    // la API y, para íconos de menú que no estén en el bundle (men_icon de la base), la API de Iconify
    `connect-src 'self' ${apiOrigin(env)} https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com`,
    'frame-src blob:',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  return {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    // el enlace de recuperación lleva el token en la url: no se envía a otros sitios
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000',
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env };
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    preview: {
      headers: securityHeaders(env),
    },
  };
});

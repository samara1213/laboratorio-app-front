import { defineConfig } from '@playwright/test';

// Pruebas visuales y responsive con la API simulada (no requieren backend).
// Uso: yarn test:visual  (las capturas quedan en test-results/)
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5174',
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
  },
  webServer: {
    command: 'npx vite --port 5174 --strictPort',
    url: 'http://localhost:5174',
    reuseExistingServer: true,
    env: { VITE_URL_API: 'http://localhost:5174/api' },
  },
});

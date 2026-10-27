import { expect, test } from '@playwright/test';
import { laboratories, menus, modules, orders, roles, user, users } from './fixtures.js';

// los 4 tamaños de los criterios responsive (TASKS.md)
const VIEWPORTS = [
  { name: 'celular', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'portatil', width: 1280, height: 800 },
  { name: 'escritorio', width: 1440, height: 1000 },
];
const THEMES = ['light', 'dark'];

/**
 * Simula la API del backend
 */
async function mockApi(page) {
  // solo la API (no los módulos de Vite en /src/api/)
  await page.route((url) => url.pathname.startsWith('/api/'), async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/orders/laboratory')) {
      const { ord_status } = route.request().postDataJSON() ?? {};
      return route.fulfill({ json: { status: 200, data: orders.filter((o) => o.ord_status === ord_status) } });
    }
    // lecturas de sesión y administración
    const reads = {
      '/api/auth/me': user,
      '/api/auth/users': users,
      '/api/role': roles,
      '/api/role/modules': modules,
      '/api/menu': menus,
      '/api/laboratory': laboratories,
    };
    if (route.request().method() === 'GET' && url.pathname in reads) {
      return route.fulfill({ json: { status: 200, data: reads[url.pathname] } });
    }
    return route.fulfill({ status: 404, json: { message: 'No simulado en la prueba' } });
  });
}

/**
 * Prepara el navegador: tema y, si se pide, sesión iniciada
 */
async function setup(page, { theme, signedIn }) {
  // los íconos de la interfaz van en el bundle: sin red a Iconify deben verse igual
  await page.route(/api\.(iconify\.design|simplesvg\.com|unisvg\.com)/, (route) => route.abort());
  await page.addInitScript(
    ({ theme, signedIn, user }) => {
      localStorage.setItem('lab.theme', theme);
      if (signedIn) {
        localStorage.setItem('auth', 'token-de-prueba');
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    { theme, signedIn, user },
  );
}

/**
 * Falla si la página se desplaza horizontalmente
 */
async function expectNoHorizontalScroll(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'la página no debe desplazarse horizontalmente').toBeLessThanOrEqual(0);
}

/**
 * Falla si algún ícono quedó vacío (Iconify pinta un <span> sin atributos mientras no tiene el ícono)
 */
async function expectIconsRendered(page) {
  const empty = await page.evaluate(
    () => [...document.querySelectorAll('span:empty')].filter((el) => el.attributes.length === 0).length,
  );
  expect(empty, 'todos los íconos deben estar en el bundle').toBe(0);
}

for (const vp of VIEWPORTS) {
  for (const theme of THEMES) {
    test.describe(`${vp.name} · ${theme}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('login', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await setup(page, { theme, signedIn: false });
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Ingresa a tu cuenta' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
        await expectNoHorizontalScroll(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-login.png`, fullPage: true });
        expect(errors).toEqual([]);
      });

      test('dashboard', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await mockApi(page);
        await setup(page, { theme, signedIn: true });
        await page.goto('/dashboard');
        await expect(page.getByRole('heading', { name: 'Órdenes en curso', level: 1 })).toBeVisible();
        await expect(page.getByRole('button', { name: /Pendiente/ }).first()).toBeVisible();
        // la tabla (o las tarjetas en celular) muestra la primera orden
        await expect(page.getByText('Ana María Rojas').filter({ visible: true }).first()).toBeVisible();
        await expectNoHorizontalScroll(page);
        await expectIconsRendered(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-dashboard.png`, fullPage: true });

        // filtrar por estado desde la gradilla
        await page.getByRole('button', { name: /Procesando/ }).first().click();
        await expect(page.getByRole('heading', { name: 'Procesando', level: 2 })).toBeVisible();

        if (vp.width < 1024) {
          // menú en panel deslizable
          await page.getByRole('button', { name: 'Abrir menú' }).click();
          await expect(page.getByRole('dialog', { name: 'Menú principal' })).toBeVisible();
          await expect(page.getByRole('link', { name: 'Buscar órdenes' })).toBeVisible();
          // capturar con el panel ya abierto, no a mitad de la animación
          await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
          await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-menu.png` });
        } else {
          // barra lateral fija con el menú del rol
          await expect(page.getByRole('navigation', { name: 'Menú principal' })).toBeVisible();
        }
        expect(errors).toEqual([]);
      });

      test('administración: usuarios, roles y menús', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await mockApi(page);
        await setup(page, { theme, signedIn: true });

        await page.goto('/users');
        await expect(page.getByText('andres.zapata.restrepo@laboratorio-andino.ejemplo.test').filter({ visible: true })).toBeVisible();
        await expectNoHorizontalScroll(page);
        await expectIconsRendered(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-usuarios.png`, fullPage: true });

        await page.goto('/roles');
        await expect(page.getByText('Toma de muestras').filter({ visible: true })).toBeVisible();
        await expectNoHorizontalScroll(page);
        await page.getByRole('button', { name: 'Nuevo rol' }).click();
        const dialog = page.getByRole('dialog', { name: 'Nuevo rol' });
        await expect(dialog.getByRole('group', { name: 'Permisos por módulo' })).toBeVisible();
        // marcar "crear" en órdenes marca también "ver"
        await dialog.getByLabel('Crear Órdenes').check();
        await expect(dialog.getByLabel('Ver Órdenes')).toBeChecked();
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        await expectNoHorizontalScroll(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-rol.png` });
        await page.keyboard.press('Escape');

        await page.goto('/menus');
        await expect(page.getByRole('list', { name: 'Árbol del menú' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Subir Inicio' })).toBeDisabled();
        await expectNoHorizontalScroll(page);
        await expectIconsRendered(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-menus.png`, fullPage: true });
        expect(errors).toEqual([]);
      });
    });
  }
}

test('sin permiso para la pantalla muestra "Sin acceso"', async ({ page }) => {
  await mockApi(page);
  const consulta = { ...user, permissions: { orders: { view: true, create: false, update: false, delete: false } }, role: { ...user.role, rol_is_system: false } };
  await page.route((url) => url.pathname === '/api/auth/me', (route) => route.fulfill({ json: { status: 200, data: consulta } }));
  await page.addInitScript((u) => {
    localStorage.setItem('auth', 'token-de-prueba');
    localStorage.setItem('user', JSON.stringify(u));
  }, consulta);
  await page.goto('/users');
  await expect(page.getByRole('heading', { name: 'Sin acceso', level: 1 })).toBeVisible();
  await page.goto('/dashboard');
  // sin permiso para crear órdenes no aparece el acceso directo
  await expect(page.getByRole('heading', { name: 'Órdenes en curso', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nueva orden' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Registrar resultados' })).toHaveCount(0);
});

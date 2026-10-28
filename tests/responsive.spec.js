import { expect, test } from '@playwright/test';
import {
  alliances,
  basePdfTemplate,
  classifications,
  customers,
  exams,
  laboratories,
  menus,
  modules,
  orderResults,
  orders,
  parameters,
  pdfTemplates,
  roles,
  searchedOrders,
  user,
  users,
} from './fixtures.js';

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
      [`/api/orders/results/${orderResults.ord_id}`]: orderResults,
      '/api/auth/me/signature': { url: null },
      '/api/exam-classifications': classifications,
      '/api/pdf-templates': pdfTemplates,
      '/api/pdf-templates/default': basePdfTemplate,
    };
    if (url.pathname === '/api/customers/searches') {
      return route.fulfill({ json: { status: 200, data: { cus_id: 'c1', cus_document_type: 'CC', ...orderResults.customer, cus_phone: '3001234567', cus_email: 'ana.rojas@ejemplo.test' } } });
    }
    if (url.pathname === '/api/exams') {
      return route.fulfill({ json: { status: 200, data: exams } });
    }
    // búsqueda paginada de órdenes: filtra por estado y devuelve el conteo por estado
    if (url.pathname === '/api/orders') {
      const statusFilter = url.searchParams.get('status')?.split(',') ?? [];
      const limit = Number(url.searchParams.get('limit') ?? 20);
      const page = Number(url.searchParams.get('page') ?? 1);
      const rows = searchedOrders.filter((o) => !statusFilter.length || statusFilter.includes(o.ord_status));
      const status_counts = {};
      for (const o of searchedOrders) status_counts[o.ord_status] = (status_counts[o.ord_status] ?? 0) + 1;
      return route.fulfill({
        json: {
          status: 200,
          data: rows.slice((page - 1) * limit, page * limit),
          meta: { page, limit, total: rows.length, pages: Math.max(1, Math.ceil(rows.length / limit)), status_counts },
        },
      });
    }
    if (url.pathname === '/api/customers') {
      return route.fulfill({ json: { status: 200, data: customers, meta: { page: 1, limit: 20, total: 57, pages: 3 } } });
    }
    if (url.pathname === '/api/alliance') return route.fulfill({ json: { status: 200, data: alliances } });
    if (url.pathname === '/api/params-exams/exam/x1') return route.fulfill({ json: { status: 200, data: parameters } });
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

      test('crear orden', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await mockApi(page);
        await setup(page, { theme, signedIn: true });
        await page.goto('/orders/create');
        await page.getByLabel('Documento').fill('1020456781');
        await page.getByRole('button', { name: 'Buscar' }).click();
        await expect(page.getByText('Ana María Rojas Pérez')).toBeVisible();
        await page.getByRole('button', { name: /Hemograma completo/ }).click();
        await page.getByRole('button', { name: /Perfil lipídico/ }).click();
        await page.getByLabel('Descuento (%)').fill('10');
        // 25.000 + 48.000 = 73.000; con 10 % de descuento, 65.700
        await expect(page.getByText(/65\.700/)).toBeVisible();
        await expectNoHorizontalScroll(page);
        await expectIconsRendered(page);
        const create = await page.getByRole('button', { name: 'Crear orden' }).boundingBox();
        expect(create.y + create.height, 'el botón de crear queda a la vista').toBeLessThanOrEqual(vp.height + 1);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-crear-orden.png` });
        expect(errors).toEqual([]);
      });

      test('plantillas PDF y clasificaciones', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await mockApi(page);
        await setup(page, { theme, signedIn: true });

        await page.goto('/pdf-templates');
        await expect(page.getByRole('heading', { name: 'Qué plantilla usa cada PDF' })).toBeVisible();
        await expect(page.getByText('Membrete institucional 2026').filter({ visible: true })).toBeVisible();
        await expect(page.getByText('En uso', { exact: true }).filter({ visible: true })).toBeVisible();
        await expectNoHorizontalScroll(page);
        await expectIconsRendered(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-plantillas.png`, fullPage: true });

        await page.getByRole('button', { name: 'Subir plantilla' }).click();
        const upload = page.getByRole('dialog', { name: 'Subir plantilla' });
        await expect(upload.getByLabel('Archivo de la plantilla')).toBeVisible();
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        await expectNoHorizontalScroll(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-subir-plantilla.png` });
        await page.keyboard.press('Escape');

        await page.getByRole('button', { name: 'Guía de variables' }).click();
        await expect(page.getByRole('heading', { name: 'Datos disponibles' })).toBeVisible();
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        await expectNoHorizontalScroll(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-guia-plantillas.png` });
        await page.keyboard.press('Escape');

        await page.goto('/exam-classifications');
        await expect(page.getByRole('heading', { name: 'Secciones del PDF de resultados' })).toBeVisible();
        await expect(page.getByText('SEROLOGÍA E INFECCIOSAS').filter({ visible: true })).toBeVisible();
        await expect(page.getByText('Inactiva', { exact: true }).filter({ visible: true })).toBeVisible();
        await expectNoHorizontalScroll(page);
        await expectIconsRendered(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-clasificaciones.png`, fullPage: true });
        expect(errors).toEqual([]);
      });

      test('buscar órdenes y pacientes', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await mockApi(page);
        await setup(page, { theme, signedIn: true });

        await page.goto('/orders/search');
        await expect(page.getByRole('button', { name: /Finalizada/ })).toBeVisible();
        await expect(page.getByText('22 órdenes')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Ver PDF' }).filter({ visible: true }).first()).toBeVisible();
        await expectNoHorizontalScroll(page);
        await expectIconsRendered(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-buscar-ordenes.png`, fullPage: true });

        // el chip filtra en el servidor y queda en la url
        await page.getByRole('button', { name: /Finalizada/ }).click();
        await expect(page).toHaveURL(/status=FINALIZADA/);
        await expect(page.getByText(`${searchedOrders.filter((o) => o.ord_status === 'FINALIZADA').length} órdenes`)).toBeVisible();
        await page.getByRole('button', { name: 'Más acciones de la orden 1048' }).filter({ visible: true }).click();
        await expect(page.getByRole('menuitem', { name: 'Enviar al correo del paciente' })).toBeVisible();
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-acciones-orden.png` });
        await page.keyboard.press('Escape');

        await page.goto('/customers');
        await expect(page.getByText('57 pacientes')).toBeVisible();
        await expect(page.getByText('Valentina Ruiz Cárdenas').filter({ visible: true })).toBeVisible();
        await expectNoHorizontalScroll(page);
        await expectIconsRendered(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-pacientes.png`, fullPage: true });

        await page.goto('/customers/create?documento=1020456799');
        const form = page.getByRole('dialog', { name: 'Registrar paciente' });
        await expect(form.getByLabel('Número de documento')).toHaveValue('1020456799');
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        await expectNoHorizontalScroll(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-registrar-paciente.png` });
        expect(errors).toEqual([]);
      });

      test('catálogo: exámenes, parámetros, convenios y laboratorios', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await mockApi(page);
        await setup(page, { theme, signedIn: true });

        await page.goto('/exams');
        await expect(page.getByText('Perfil lipídico').filter({ visible: true })).toBeVisible();
        await expect(page.getByText('1 sin clasificación', { exact: false })).toBeVisible();
        await expectNoHorizontalScroll(page);
        await expectIconsRendered(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-examenes.png`, fullPage: true });
        await page.getByRole('button', { name: 'Editar' }).filter({ visible: true }).first().click();
        await expect(page.getByRole('dialog', { name: 'Editar examen' })).toBeVisible();
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        await expectNoHorizontalScroll(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-examen-form.png` });
        await page.keyboard.press('Escape');

        await page.goto('/param-exams?examen=x1');
        await expect(page.getByText('Hombres: 13.5 – 17.5', { exact: false }).filter({ visible: true }).first()).toBeVisible();
        await expect(page.getByText('Subtítulo').filter({ visible: true }).first()).toBeVisible();
        await expectNoHorizontalScroll(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-parametros.png`, fullPage: true });
        await page.getByRole('button', { name: 'Editar' }).filter({ visible: true }).nth(1).click();
        const paramForm = page.getByRole('dialog', { name: 'Editar parámetro' });
        await expect(paramForm.getByText('Mujeres', { exact: true })).toBeVisible();
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
        await expectNoHorizontalScroll(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-parametro-form.png` });
        await page.keyboard.press('Escape');

        await page.goto('/alliances');
        await expect(page.getByText('Salud Total EPS').filter({ visible: true })).toBeVisible();
        await expectNoHorizontalScroll(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-convenios.png`, fullPage: true });

        await page.goto('/laboratories');
        await expect(page.getByRole('heading', { name: 'Laboratorios del sistema' })).toBeVisible();
        await expectNoHorizontalScroll(page);
        await expectIconsRendered(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-laboratorios.png`, fullPage: true });
        expect(errors).toEqual([]);
      });

      test('resultados y perfil', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await mockApi(page);
        await setup(page, { theme, signedIn: true });

        await page.goto(`/results/${orderResults.ord_id}`);
        await expect(page.getByRole('heading', { name: 'Resultados · orden 1048', level: 1 })).toBeVisible();
        // abre el primer examen incompleto, con títulos de sección, rangos y teclado numérico
        await expect(page.getByRole('heading', { name: 'SERIE ROJA', level: 3 })).toBeVisible();
        await expect(page.getByText('Hombres 13.5–17.5 · Mujeres 12–15.5 · Niños 11–14')).toBeVisible();
        await expect(page.getByLabel('Hemoglobina', { exact: true })).toHaveAttribute('inputmode', 'decimal');
        await expect(page.getByLabel('Morfología', { exact: true })).toHaveValue('Normal');
        await expect(page.getByText('Firma: Andrés Felipe Zapata · Bacteriólogo')).toBeVisible();
        await page.getByLabel('Hemoglobina', { exact: true }).fill('13.1');
        await expect(page.getByText('2 cambios sin guardar')).toBeVisible();
        await expectNoHorizontalScroll(page);
        await expectIconsRendered(page);
        const save = await page.getByRole('button', { name: 'Guardar resultados' }).boundingBox();
        expect(save.y + save.height, 'el botón de guardar queda a la vista').toBeLessThanOrEqual(vp.height + 1);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-resultados.png` });

        await page.goto('/profile');
        await expect(page.getByRole('heading', { name: 'Tu firma' })).toBeVisible();
        await expect(page.getByText('Sin firma cargada')).toBeVisible();
        await expectNoHorizontalScroll(page);
        await page.screenshot({ path: `test-results/capturas/${vp.name}-${theme}-perfil.png`, fullPage: true });
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

// Datos ficticios para las pruebas visuales (nunca datos reales de pacientes)

const menu = (men_id, men_name, men_url, men_icon, children = []) => ({ men_id, men_name, men_url, men_icon, men_level: 1, children });

export const user = {
  use_id: '11111111-1111-4111-8111-111111111111',
  use_correo: 'paula.montoya@ejemplo.test',
  use_primer_nombre: 'Paula',
  use_primer_apellido: 'Montoya',
  use_primer_ingreso: false,
  laboratory: { lab_id: '22222222-2222-4222-8222-222222222222', lab_name: 'Laboratorio Andino', lab_nit: '900123456' },
  // super administrador de prueba: ve todas las pantallas
  permissions: Object.fromEntries(
    ['orders', 'results', 'customers', 'exams', 'alliances', 'users', 'roles', 'menus', 'laboratories'].map((m) => [m, { view: true, create: true, update: true, delete: true }]),
  ),
  role: {
    rol_id: '33333333-3333-4333-8333-333333333333',
    rol_nombre: 'Super administrador',
    rol_is_system: true,
    menus: [
      menu('m1', 'Inicio', '/dashboard', 'mdi:home-outline'),
      menu('m2', 'Órdenes', null, 'mdi:clipboard-text-outline', [
        menu('m21', 'Crear orden', '/orders/create', 'mdi:plus-circle-outline'),
        menu('m22', 'Buscar órdenes', '/orders/search', 'mdi:magnify'),
      ]),
      menu('m3', 'Pacientes', null, 'mdi:account-outline', [
        menu('m31', 'Registrar paciente', '/customers/create', 'mdi:account-plus-outline'),
        menu('m32', 'Editar paciente', '/customers/edit', 'mdi:account-edit-outline'),
      ]),
      menu('m4', 'Catálogo', null, 'mdi:flask-outline', [
        menu('m41', 'Exámenes', '/exams', 'mdi:flask-outline'),
        menu('m42', 'Parámetros', '/param-exams', 'mdi:tune-variant'),
        menu('m43', 'Convenios', '/alliances', 'mdi:handshake-outline'),
      ]),
      menu('m5', 'Administración', null, 'mdi:cog-outline', [
        menu('m51', 'Usuarios', '/users', 'mdi:account-multiple-outline'),
        menu('m52', 'Roles y permisos', '/roles', 'mdi:shield-account-outline'),
        menu('m53', 'Menús', '/menus', 'mdi:format-list-bulleted'),
      ]),
    ],
  },
};

const patients = [
  ['Ana María', 'Rojas', '1020456781'], ['Luis Fernando', 'Gómez', '79845120'], ['Valentina', 'Ruiz Cárdenas', '1098765432'],
  ['Jorge Iván', 'Mejía', '71234908'], ['Daniela', 'Ospina', '1037612004'], ['Carlos Andrés', 'Peña', '98556317'],
  ['María José', 'Herrera', '1152443090'], ['Samuel', 'Restrepo', '1019887665'],
];
const statuses = ['PENDIENTE', 'PROCESANDO', 'PENDIENTE', 'ORDEN CON ADJUNTO', 'PENDIENTE PDF', 'PROCESANDO', 'PENDIENTE', 'ORDEN CON ADJUNTO'];

export const orders = Array.from({ length: 24 }, (_, i) => {
  const [first, last, doc] = patients[i % patients.length];
  return {
    ord_id: `44444444-4444-4444-8444-${String(i).padStart(12, '0')}`,
    ord_code: 1048 - i,
    ord_status: statuses[i % statuses.length],
    ord_created_at: new Date(Date.UTC(2026, 9, 24, 12, 42) - i * 17 * 60_000).toISOString(),
    ord_total_value: 48500,
    customer: { cus_first_name: first, cus_first_lastname: last, cus_document_number: doc },
  };
});

export const laboratories = [
  { lab_id: '22222222-2222-4222-8222-222222222222', lab_name: 'Laboratorio Andino' },
  { lab_id: '22222222-2222-4222-8222-222222222223', lab_name: 'Laboratorio del Valle' },
];

export const modules = [
  ['orders', 'Órdenes', 'Crear, buscar y cancelar órdenes; generar, ver y enviar el PDF; adjuntos', ['view', 'create', 'update', 'delete']],
  ['results', 'Resultados', 'Registrar y corregir los resultados de una orden', ['view', 'create', 'update']],
  ['customers', 'Pacientes', 'Registrar, buscar y editar pacientes', ['view', 'create', 'update']],
  ['exams', 'Exámenes y parámetros', 'Catálogo de exámenes, precios y rangos de referencia', ['view', 'create', 'update']],
  ['users', 'Usuarios', 'Usuarios del laboratorio', ['view', 'create', 'update']],
  ['roles', 'Roles y permisos', 'Roles del laboratorio y sus permisos', ['view', 'create', 'update', 'delete']],
].map(([mod_slug, mod_name, mod_description, mod_actions], i) => ({ mod_slug, mod_name, mod_description, mod_actions, mod_order: i + 1, mod_global: false }));

const flags = (v, c, u, d) => ({ view: v, create: c, update: u, delete: d });
export const roles = [
  { rol_id: 'r1', rol_nombre: 'Super administrador', rol_description: 'Administra laboratorios, menús y roles globales', rol_is_system: true, rol_active: true, laboratory: null, users_count: 1, permissions: {}, editable: false, assignable: true },
  { rol_id: 'r2', rol_nombre: 'Bacteriólogo', rol_description: 'Procesa órdenes y registra resultados', rol_is_system: false, rol_active: true, laboratory: null, users_count: 4, permissions: { orders: flags(true, false, true, false), results: flags(true, true, true, false), customers: flags(true, false, false, false) }, editable: true, assignable: true },
  { rol_id: 'r3', rol_nombre: 'Recepción', rol_description: 'Registra pacientes y crea órdenes', rol_is_system: false, rol_active: true, laboratory: null, users_count: 3, permissions: { orders: flags(true, true, true, true), customers: flags(true, true, true, false) }, editable: true, assignable: true },
  { rol_id: 'r4', rol_nombre: 'Toma de muestras', rol_description: null, rol_is_system: false, rol_active: false, laboratory: { lab_id: laboratories[0].lab_id, lab_name: 'Laboratorio Andino' }, users_count: 0, permissions: { orders: flags(true, false, false, false) }, editable: true, assignable: false },
];

export const users = [
  ['Paula', 'Montoya', 'paula.montoya@ejemplo.test', 'r1', 'ACTIVO', false],
  ['Andrés Felipe', 'Zapata Restrepo', 'andres.zapata.restrepo@laboratorio-andino.ejemplo.test', 'r2', 'ACTIVO', false],
  ['Lucía', 'Ramírez', 'lucia.ramirez@ejemplo.test', 'r3', 'ACTIVO', true],
  ['Tomás', 'Gil', 'tomas.gil@ejemplo.test', 'r2', 'INACTIVO', false],
].map(([use_primer_nombre, use_primer_apellido, use_correo, rol, use_estado, use_primer_ingreso], i) => ({
  use_id: `55555555-5555-4555-8555-${String(i).padStart(12, '0')}`,
  use_primer_nombre, use_primer_apellido, use_correo, use_estado, use_primer_ingreso,
  use_ultimo_ingreso: i === 3 ? null : new Date(Date.UTC(2026, 9, 24, 13 + i, 5)).toISOString(),
  role: { rol_id: rol, rol_nombre: roles.find((r) => r.rol_id === rol).rol_nombre, rol_is_system: rol === 'r1' },
}));

const node = (men_id, men_name, men_url, men_level, men_parent, module, men_order, men_icon) => ({ men_id, men_name, men_url, men_level, men_parent, module, men_order, men_icon, men_active: true });
export const menus = [
  node('m1', 'Inicio', '/dashboard', 1, null, 'orders', 1, 'mdi:home-outline'),
  node('m2', 'Órdenes', null, 1, null, null, 2, 'mdi:clipboard-text-outline'),
  node('m21', 'Crear orden', '/orders/create', 2, 'm2', 'orders', 1, 'mdi:plus-circle-outline'),
  node('m22', 'Buscar órdenes', '/orders/search', 2, 'm2', 'orders', 2, 'mdi:magnify'),
  node('m5', 'Administración', null, 1, null, null, 3, 'mdi:cog-outline'),
  node('m51', 'Usuarios', '/users', 2, 'm5', 'users', 1, 'mdi:account-multiple-outline'),
  { ...node('m52', 'Roles y permisos', '/roles', 2, 'm5', 'roles', 2, 'mdi:shield-account-outline'), men_active: false },
];

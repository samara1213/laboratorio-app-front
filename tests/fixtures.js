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
    ['orders', 'results', 'customers', 'exams', 'alliances', 'users', 'roles', 'menus', 'laboratories', 'pdf_templates'].map((m) => [m, { view: true, create: true, update: true, delete: true }]),
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

const param = (par_id, par_name, extra = {}) => ({ par_id, par_name, par_order: 0, par_range: false, par_default_value: '', result: null, observation: null, reference: null, id_result: null, ...extra });
export const orderResults = {
  ord_id: '44444444-4444-4444-8444-000000000000',
  ord_code: 1048,
  ord_status: 'PROCESANDO',
  ord_created_at: new Date(Date.UTC(2026, 9, 24, 12, 42)).toISOString(),
  customer: { cus_first_name: 'Ana María', cus_first_lastname: 'Rojas', cus_second_lastname: 'Pérez', cus_document_number: '1020456781', cus_gender: 'F', cus_birthdate: '1988-05-12' },
  exams: [
    {
      exa_id: 'e1',
      exa_name: 'Hemograma completo',
      signer: null,
      parameters: [
        param('p0', '*SERIE ROJA', { par_order: 0 }),
        param('p1', 'Hemoglobina', { par_order: 1, par_range: true, par_unit_extent: 'g/dL', par_min_man: '13.5', par_max_man: '17.5', par_min_woman: '12', par_max_woman: '15.5', par_min_child: '11', par_max_child: '14' }),
        param('p2', 'Hematocrito', { par_order: 2, par_range: true, par_unit_extent: '%', par_min_man: '41', par_max_man: '53', par_min_woman: '36', par_max_woman: '46' }),
        param('p3', 'Morfología', { par_order: 3, par_reference_value: 'Normocítica normocrómica', par_default_value: 'Normal' }),
      ],
    },
    {
      exa_id: 'e2',
      exa_name: 'Glicemia en ayunas',
      signer: { use_id: 'u2', nombre: 'Andrés Felipe Zapata', cargo: 'Bacteriólogo', registro: 'RP-1020', has_signature: true },
      parameters: [param('p4', 'Glucosa', { par_order: 1, par_range: true, par_unit_extent: 'mg/dL', par_min_man: '70', par_max_man: '100', par_min_woman: '70', par_max_woman: '100', result: '92', id_result: 'r4' })],
    },
  ],
};

// Fase 5: clasificaciones de exámenes y plantillas PDF
const SYSTEM_CLASSIFICATIONS = ['HEMATOLOGÍA', 'QUÍMICA', 'INMUNOLOGÍA', 'MICROBIOLOGÍA'];
export const classifications = [
  ...SYSTEM_CLASSIFICATIONS.map((name, i) => ({
    cla_id: `c${i + 1}`,
    cla_name: name,
    cla_order: i + 1,
    cla_show_images: i === 0,
    cla_active: true,
    laboratory: null,
    exams_count: 6 - i,
    editable: true,
  })),
  { cla_id: 'c9', cla_name: 'SEROLOGÍA E INFECCIOSAS', cla_order: 9, cla_show_images: false, cla_active: false, laboratory: { lab_id: laboratories[0].lab_id, lab_name: 'Laboratorio Andino' }, exams_count: 0, editable: true },
];

export const pdfTemplates = [
  { tpl_id: 't1', tpl_name: 'Membrete institucional 2026', tpl_description: 'Logo grande y firma por examen', tpl_active: true, tpl_size: 14336, tpl_created_at: '2026-10-20T15:42:00Z', laboratory: { lab_id: laboratories[0].lab_id, lab_name: 'Laboratorio Andino' }, created_by: 'Paula Montoya' },
  { tpl_id: 't2', tpl_name: 'Formato general del sistema', tpl_description: null, tpl_active: false, tpl_size: 9830, tpl_created_at: '2026-10-18T13:05:00Z', laboratory: null, created_by: 'Paula Montoya' },
];

export const basePdfTemplate = {
  tpl_content: '<html><body>{{#each clasificaciones}}<h2>{{nombre}}</h2>{{/each}}</body></html>',
  helpers: ['if', 'unless', 'each', 'with', 'lookup', 'eq', 'or', 'and', 'not', 'contains', 'startsWith', 'substring', 'toLowerCase', 'toUpperCase', 'default'],
  max_size: 262144,
};

// Fase 6: Buscar órdenes (con finalizadas y canceladas), pacientes, catálogo y parámetros
const allStatuses = ['FINALIZADA', 'PENDIENTE PDF', 'PENDIENTE', 'PROCESANDO', 'FINALIZADA', 'CANCELADA', 'ORDEN CON ADJUNTO', 'FINALIZADA'];
export const searchedOrders = orders.slice(0, 22).map((order, i) => ({
  ...order,
  ord_status: allStatuses[i % allStatuses.length],
  has_pdf: allStatuses[i % allStatuses.length] === 'FINALIZADA',
  attachments_count: i % 5 === 0 ? 1 : 0,
  customer: { ...order.customer, cus_document_type: 'CC', has_email: i % 4 !== 1 },
}));

export const customers = patients.map(([first, last, doc], i) => ({
  cus_id: 'c' + i,
  cus_document_type: i === 3 ? 'TI' : 'CC',
  cus_document_number: doc,
  cus_first_name: first,
  cus_second_name: '',
  cus_first_lastname: last,
  cus_second_lastname: '',
  cus_gender: i % 2 ? 'M' : 'F',
  cus_birthdate: 1950 + i * 9 + '-0' + ((i % 9) + 1) + '-15',
  cus_phone: '300' + String(1234567 + i * 1111),
  cus_email: i === 2 ? '' : first.split(' ')[0].toLowerCase() + '.' + last.split(' ')[0].toLowerCase() + '@correo.ejemplo.test',
  cus_address: 'Calle ' + (10 + i) + ' # 20-30',
  orders_count: i % 3,
}));

export const alliances = [
  { ali_id: 'a1', ali_nombre: 'Salud Total EPS', ali_direccion: 'Carrera 7 # 72-64, Bogotá', ali_telefono: '6015550101', ali_nombre_contacto: 'Diana Moreno' },
  { ali_id: 'a2', ali_nombre: 'Clínica del Norte', ali_direccion: 'Avenida 19 # 120-15', ali_telefono: '6015550199', ali_nombre_contacto: 'Julián Vargas' },
];

export const exams = [
  {
    exa_id: 'x1',
    exa_name: 'Hemograma completo',
    exa_description: 'Serie roja, blanca y plaquetas',
    exa_price: 25000,
    classification: { cla_id: 'c1', cla_name: 'HEMATOLOGÍA' },
    alliance: alliances[0],
    parameters: [{}, {}, {}, {}, {}],
  },
  { exa_id: 'x2', exa_name: 'Glicemia en ayunas', exa_price: 12000, classification: { cla_id: 'c2', cla_name: 'QUÍMICA' }, alliance: null, parameters: [{}] },
  {
    exa_id: 'x3',
    exa_name: 'Perfil lipídico',
    exa_description: 'Colesterol total, HDL, LDL y triglicéridos',
    exa_price: 48000,
    classification: null,
    alliance: null,
    parameters: [],
  },
];

export const parameters = [
  { par_id: 'p1', par_name: '*Serie roja', par_order: 1, par_range: false },
  { par_id: 'p2', par_name: 'Hemoglobina', par_order: 2, par_range: true, par_unit_extent: 'g/dL', par_min_man: '13.50', par_max_man: '17.50', par_min_woman: '12.00', par_max_woman: '15.50', par_min_child: '11.00', par_max_child: '14.00' },
  { par_id: 'p3', par_name: 'Hematocrito', par_order: 3, par_range: true, par_unit_extent: '%', par_min_man: '41', par_max_man: '53', par_min_woman: '36', par_max_woman: '46' },
  { par_id: 'p4', par_name: '*Serie blanca', par_order: 4, par_range: false },
  { par_id: 'p5', par_name: 'Leucocitos', par_order: 5, par_range: false, par_unit_extent: '/mm³', par_reference_value: '4.500 - 11.000', par_default_value: '' },
];

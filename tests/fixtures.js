// Datos ficticios para las pruebas visuales (nunca datos reales de pacientes)

const menu = (men_id, men_name, men_url, men_icon, children = []) => ({ men_id, men_name, men_url, men_icon, men_level: 1, children });

export const user = {
  use_id: '11111111-1111-4111-8111-111111111111',
  use_correo: 'paula.montoya@ejemplo.test',
  use_primer_nombre: 'Paula',
  use_primer_apellido: 'Montoya',
  use_primer_ingreso: false,
  laboratory: { lab_id: '22222222-2222-4222-8222-222222222222', lab_name: 'Laboratorio Andino', lab_nit: '900123456' },
  role: {
    rol_id: '33333333-3333-4333-8333-333333333333',
    rol_nombre: 'Bacterióloga',
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

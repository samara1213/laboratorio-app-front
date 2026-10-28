// Guía para escribir plantillas del PDF de resultados (contrato del backend:
// lab-system-backend/src/pdf/report/result-report.builder.ts y engine/template-engine.ts)

export const GUIDE_VARIABLES = [
  {
    title: 'Laboratorio',
    path: 'laboratorio',
    fields: [
      ['nombre', 'Nombre del laboratorio'],
      ['nit', 'NIT con dígito de verificación'],
      ['direccion · telefono · correo', 'Datos de contacto'],
      ['representante', 'Representante legal'],
      ['logo', 'Logo como imagen embebida (vacío si no tiene): <img src="{{laboratorio.logo}}">'],
      ['firma', 'Firma del laboratorio, para exámenes sin firmante (resultados anteriores a la firma por examen)'],
    ],
  },
  {
    title: 'Paciente',
    path: 'paciente',
    fields: [
      ['nombre', 'Nombre completo'],
      ['tipo_documento · documento', 'Documento de identidad'],
      ['fecha_nacimiento', 'dd/mm/aaaa'],
      ['edad', 'Edad exacta: «36 años, 6 meses, 12 días»'],
      ['genero · telefono · correo', 'Datos del registro del paciente'],
    ],
  },
  {
    title: 'Orden',
    path: 'orden',
    fields: [
      ['codigo', 'Número de la orden'],
      ['fecha_ingreso · fecha_generacion', 'Fecha y hora en Colombia'],
    ],
  },
  {
    title: 'Clasificaciones (secciones del PDF)',
    path: '{{#each clasificaciones}}',
    fields: [
      ['nombre', 'Título de la sección'],
      ['mostrar_imagenes · imagenes', 'Si la sección incluye las imágenes adjuntas, y la lista de imágenes'],
      ['examenes', 'Lista de exámenes de la sección (ver abajo)'],
    ],
  },
  {
    title: 'Exámenes',
    path: '{{#each examenes}}',
    fields: [
      ['nombre', 'Nombre del examen'],
      ['parametros', 'Solo los que tienen resultado; los subtítulos (nombre con «*») tienen es_titulo'],
      ['observaciones', 'Observaciones únicas del examen'],
      ['firmante.nombre · firmante.cargo · firmante.registro', 'Quien registró o corrigió por última vez los resultados del examen'],
      ['firmante.firma', 'Firma del profesional como imagen embebida (vacía si no la ha cargado)'],
      ['mostrar_firma', 'Verdadero en el último examen seguido del mismo firmante: imprime la firma ahí para no repetirla'],
    ],
  },
  {
    title: 'Parámetros',
    path: '{{#each parametros}}',
    fields: [
      ['nombre · resultado · unidad', 'Datos del parámetro'],
      ['es_titulo', 'Fila de subtítulo dentro de la tabla'],
      ['referencia', 'Referencia escrita en el resultado o valor de referencia del parámetro'],
      ['rangos', 'Lista { grupo, minimo, maximo } (Hombres, Mujeres, Niños) cuando el parámetro tiene rango'],
    ],
  },
];

export const GUIDE_LAYOUT = [
  ['<!-- pdf:header --> … <!-- /pdf:header -->', 'Encabezado que se repite en cada página. Lleva sus propios estilos (<style> dentro del bloque).'],
  ['<!-- pdf:footer --> … <!-- /pdf:footer -->', 'Pie de página. <span class="pageNumber"></span> y <span class="totalPages"></span> imprimen la página.'],
  ['<meta name="pdf:format" content="letter">', 'Tamaño del papel: letter, legal o a4.'],
  ['<meta name="pdf:margin" content="236px 44px 56px 44px">', 'Márgenes arriba, derecha, abajo e izquierda (px, mm, cm o in). El de arriba deja espacio al encabezado.'],
];

export const GUIDE_RULES = [
  'Solo {{ }}: el texto siempre se escapa. No se permiten {{{ }}}, {{& }}, parciales ni decoradores.',
  'Sin JavaScript ni recursos externos (imágenes, hojas de estilo o fuentes por URL): el PDF se imprime sin red.',
  'Archivo .html en UTF-8 de hasta 256 KB.',
  'Antes de guardarla se prueba con datos de ejemplo; la vista previa muestra el resultado real.',
];

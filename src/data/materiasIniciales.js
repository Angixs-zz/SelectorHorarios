// Oferta administrativa publicada y supuestos provisionales de planeacion.

const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']

const createGroup = (key, group, docente, schedule, options = {}) => ({
  id: `${key.toLowerCase()}-${(group ?? options.idSuffix).toLowerCase()}`,
  grupo: group,
  semestreAdministrativo: options.semestreAdministrativo ?? (Number(group?.match(/^\d+/)?.[0]) || null),
  estado: options.estado ?? 'oficial',
  alcance: options.alcance ?? null,
  docente: docente || null,
  nota: options.nota ?? null,
  sesiones: schedule.flatMap(([inicio, fin, aula], index) =>
    inicio ? [{ dia: days[index], inicio, fin, aula: aula || null }] : [],
  ),
})

const createSubject = (id, clave, nombre, creditos, semestreCurricular, grupos, options = {}) => ({
  id,
  clave,
  nombre,
  creditos,
  semestreCurricular,
  tipo: options.tipo ?? 'materia',
  nota: options.nota ?? null,
  grupos,
})

const weekdaysAt = (inicio, fin) => days.map(() => [inicio, fin, null])

export const planeacionProvisionalEspecialidad = createSubject(
  'especialidad-toma-decisiones-provisional',
  'ESP-TD-PENDIENTE',
  'Especialidad Toma de Decisiones (materias por confirmar)',
  null,
  null,
  [
    ['08:00', '09:00'],
    ['10:00', '11:00'],
    ['19:00', '20:00'],
  ].map(([inicio, fin]) => ({
    id: `especialidad-toma-decisiones-opcion-${inicio.replace(':', '')}`,
    grupo: null,
    etiquetaProvisional: `Opción provisional ${inicio}-${fin}`,
    semestreAdministrativo: null,
    estado: 'provisional',
    docente: null,
    nota: 'Grupo provisional - pendiente de confirmación por coordinación. Los días de lunes a viernes son un supuesto editable para simular choques.',
    sesiones: weekdaysAt(inicio, fin).map(([, , aula], index) => ({
      dia: days[index],
      inicio,
      fin,
      aula,
    })),
  })),
  {
    tipo: 'planeacion-provisional',
    nota: 'Representa tres opciones de grupo alternativas; la materia, etiquetas administrativas, docentes, aulas y días definitivos aún no están confirmados.',
  },
)

export const softwareTomaDecisionesCurricular = createSubject(
  'software-toma-decisiones-dad-2605',
  'DAD-2605',
  'Software para Toma de Decisiones',
  null,
  7,
  [],
  {
    nota: 'Materia curricular de 7.º semestre. El grupo, horario, docente, aula y créditos están pendientes de confirmación.',
  },
)

export const materiasCurricularesOctavoPendientes = [
  createSubject('patrones-diseno-software', 'DAD-2601', 'Patrones de Diseño de Software', null, 8, [], {
    nota: 'Materia curricular de 8.º semestre. El grupo, horario, docente, aula y créditos están pendientes de confirmación.',
  }),
  createSubject('servicio-social', 'SESSC10', 'Servicio Social', null, 8, [], {
    nota: 'Actividad curricular de 8.º semestre. Los datos administrativos están pendientes de confirmación.',
  }),
  createSubject('desarrollo-entornos-moviles', 'DAD-2602', 'Desarrollo en Entornos Móviles', null, 8, [], {
    nota: 'Materia curricular de 8.º semestre. El grupo, horario, docente, aula y créditos están pendientes de confirmación.',
  }),
]

export const materiasIniciales = [
  createSubject('taller-investigacion-1', 'ACA0909', 'Taller de Investigación I', 4, 7, [
    createGroup('ACA0909', '7SA', null, [['10:00', '11:00', 'I1'], ['10:00', '11:00', 'I1'], ['10:00', '11:00', 'I1'], ['10:00', '11:00', 'I1'], []]),
    createGroup('ACA0909', '7SB', null, [['09:00', '10:00', 'VS'], ['09:00', '10:00', 'VS'], ['09:00', '10:00', 'VS'], ['09:00', '10:00', 'VS'], []]),
    createGroup('ACA0909', '7SC', null, [['08:00', '09:00', 'I7'], ['08:00', '09:00', 'I7'], ['08:00', '09:00', 'I7'], ['08:00', '09:00', 'I7'], []]),
    createGroup('ACA0909', '7SD', null, [['11:00', '12:00', 'I1'], ['11:00', '12:00', 'I1'], ['11:00', '12:00', 'I1'], [], ['11:00', '12:00', 'I1']]),
  ]),
  createSubject('programacion-web', 'AEB1055', 'Programación Web', 5, 7, [
    createGroup('AEB1055', '7SA', null, weekdaysAt('12:00', '13:00').map(([inicio, fin]) => [inicio, fin, 'I13'])),
    createGroup('AEB1055', '7SB', 'BAÑOS SOLIS FRANCISCO RICARDO', weekdaysAt('10:00', '11:00').map(([inicio, fin]) => [inicio, fin, 'I7'])),
    createGroup('AEB1055', '7SC', null, weekdaysAt('18:00', '19:00')),
    createGroup('AEB1055', '7SD', null, weekdaysAt('19:00', '20:00').map(([inicio, fin]) => [inicio, fin, 'I6'])),
  ]),
  createSubject('sistemas-programables', 'SCC1023', 'Sistemas Programables', 4, 7, [
    createGroup('SCC1023', '8SA', null, [['15:00', '16:00', null], ['15:00', '16:00', null], ['15:00', '16:00', null], ['15:00', '16:00', null], []]),
    createGroup('SCC1023', '8SB', null, [['16:00', '17:00', null], ['16:00', '17:00', null], ['16:00', '17:00', null], ['16:00', '17:00', null], []]),
    createGroup('SCC1023', '8SC', null, [['12:00', '13:00', 'Q5'], ['12:00', '13:00', 'Q5'], ['12:00', '13:00', 'Q5'], ['12:00', '13:00', 'Q5'], []]),
  ]),
  createSubject('conmutacion-redes', 'SCD1004', 'Conmutación y Enrutamiento de Redes de Datos', 5, 7, [
    createGroup('SCD1004', '7SA', null, weekdaysAt('07:00', '08:00').map(([inicio, fin]) => [inicio, fin, 'I1'])),
    createGroup('SCD1004', '7SB', 'ROBLEDO CABRERA OMAR', weekdaysAt('11:00', '12:00').map(([inicio, fin]) => [inicio, fin, 'I13'])),
    createGroup('SCD1004', '7SC', 'JIMENEZ HALLA JOHANN FRANCISCO', weekdaysAt('15:00', '16:00').map(([inicio, fin]) => [inicio, fin, 'cmc6'])),
    createGroup('SCD1004', '7SD', null, weekdaysAt('13:00', '14:00')),
  ]),
  createSubject('lenguajes-automatas-2', 'SCD1016', 'Lenguajes y Autómatas II', 5, 7, [
    createGroup('SCD1016', '7SA', 'BENITEZ QUECHA CLARIBEL', weekdaysAt('09:00', '10:00').map(([inicio, fin]) => [inicio, fin, 'I12'])),
    createGroup('SCD1016', '7SB', null, weekdaysAt('11:00', '12:00').map(([inicio, fin]) => [inicio, fin, 'CCOMP2'])),
    createGroup('SCD1016', '7SC', 'ALONSO HERNANDEZ LUIS ALBERTO', weekdaysAt('16:00', '17:00').map(([inicio, fin]) => [inicio, fin, 'I14'])),
    createGroup('SCD1016', '7SD', 'ALONSO HERNANDEZ LUIS ALBERTO', weekdaysAt('14:00', '15:00')),
  ]),
  createSubject('gestion-proyectos-software', 'SCG1009', 'Gestión de Proyectos de Software', 6, 7, [
    createGroup('SCG1009', '8SA', 'RAFAEL PEREZ EVA', [['10:00', '11:00', 'I10'], ['10:00', '11:00', 'I10'], ['10:00', '11:00', 'I10'], ['10:00', '11:00', 'I10'], ['10:00', '12:00', 'I10']]),
    createGroup('SCG1009', '8SB', 'RAFAEL PEREZ EVA', [['08:00', '09:00', 'I10'], ['08:00', '09:00', 'I10'], ['08:00', '09:00', 'I10'], ['08:00', '09:00', 'I10'], ['08:00', '10:00', 'I10']]),
    createGroup('SCG1009', '8SC', 'MARTINEZ NIETO ADELINA', [['07:00', '08:00', null], ['07:00', '08:00', null], ['07:00', '08:00', null], ['07:00', '09:00', null], ['07:00', '08:00', null]], { estado: 'por-verificar', nota: 'El horario fue descrito como aproximado; debe verificarse con la publicación administrativa.' }),
  ]),
  softwareTomaDecisionesCurricular,
  createSubject('taller-investigacion-2', 'ACA0910', 'Taller de Investigación II', 4, 8, [
    createGroup('ACA0910', '8SU', null, [['13:00', '14:00', null], ['13:00', '14:00', null], [], ['13:00', '14:00', null], ['13:00', '14:00', null]]),
  ]),
  ...materiasCurricularesOctavoPendientes,
  createSubject('software-toma-decisiones', 'DSED2302', 'Desarrollo de Software para la Toma de Decisiones', 5, null, [
    createGroup('DSED2302', '8SB', 'DIAZ SARMIENTO BIBIANA', weekdaysAt('09:00', '10:00').map(([inicio, fin]) => [inicio, fin, 'I13']), { alcance: 'oferta-administrativa-existente', nota: 'Oferta administrativa existente; no confirmada para alumnos de nuevo ingreso a la especialidad.' }),
    createGroup('DSED2302', '8SC', 'ALONSO HERNANDEZ LUIS ALBERTO', weekdaysAt('17:00', '18:00'), { alcance: 'oferta-administrativa-existente', nota: 'Oferta administrativa existente; no confirmada para alumnos de nuevo ingreso a la especialidad.' }),
  ]),
  createSubject('desarrollo-servicios-web', 'DSD2303', 'Desarrollo de Servicios Web', 5, null, [
    createGroup('DSD2303', '8SC', null, weekdaysAt('16:00', '17:00')),
  ]),
  createSubject('administracion-redes', 'SCA1002', 'Administración de Redes', 4, 8, [
    createGroup('SCA1002', '8SU', 'ROBLEDO CABRERA OMAR', [[], ['09:00', '10:00', 'I11'], ['09:00', '10:00', 'I11'], ['09:00', '10:00', 'I11'], ['09:00', '10:00', 'I11']]),
  ]),
  createSubject('programacion-logica-funcional', 'SCC1019', 'Programación Lógica y Funcional', 4, 8, [
    createGroup('SCC1019', '7SA', 'MATADAMAS TORRES LORENZO ALEJANDRO', [['14:00', '15:00', 'CCOMP3'], ['14:00', '15:00', 'CCOMP3'], [], ['14:00', '15:00', 'CCOMP3'], ['14:00', '15:00', 'CCOMP3']]),
    createGroup('SCC1019', '7SB', 'MATADAMAS TORRES LORENZO ALEJANDRO', [['10:00', '11:00', 'I9'], ['10:00', '11:00', 'I9'], [], ['10:00', '11:00', 'I9'], ['10:00', '11:00', 'I9']]),
    createGroup('SCC1019', '7SC', 'ALONSO MARTINEZ CARLOS', [['16:00', '17:00', null], ['16:00', '17:00', null], ['16:00', '17:00', null], ['16:00', '17:00', null], []]),
    createGroup('SCC1019', '7SD', 'MATADAMAS TORRES LORENZO ALEJANDRO', [['15:00', '16:00', null], ['15:00', '16:00', null], ['15:00', '16:00', null], ['15:00', '16:00', null], []]),
  ]),
  planeacionProvisionalEspecialidad,
]

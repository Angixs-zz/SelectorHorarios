// Oferta oficial cargada a partir de los horarios proporcionados por la escuela.

const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']

const createGroup = (key, group, docente, schedule) => ({
  id: `${key.toLowerCase()}-${group.toLowerCase()}`,
  grupo: group,
  docente,
  sesiones: schedule.flatMap(([inicio, fin, aula], index) =>
    inicio ? [{ dia: days[index], inicio, fin, aula }] : [],
  ),
})

const createSubject = (id, clave, nombre, creditos, grupos) => ({
  id,
  clave,
  nombre,
  creditos,
  grupos,
})

export const materiasIniciales = [
  createSubject('taller-investigacion-1', 'ACA0909', 'Taller de Investigación I', 4, [
    createGroup('ACA0909', '7SA', '', [['10:00', '11:00', 'I1'], ['10:00', '11:00', 'I1'], ['10:00', '11:00', 'I1'], ['10:00', '11:00', 'I1'], []]),
    createGroup('ACA0909', '7SB', '', [['09:00', '10:00', 'VS'], ['09:00', '10:00', 'VS'], ['09:00', '10:00', 'VS'], ['09:00', '10:00', 'VS'], []]),
    createGroup('ACA0909', '7SC', '', [['08:00', '09:00', 'I7'], ['08:00', '09:00', 'I7'], ['08:00', '09:00', 'I7'], ['08:00', '09:00', 'I7'], []]),
    createGroup('ACA0909', '7SD', '', [['11:00', '12:00', 'I1'], ['11:00', '12:00', 'I1'], ['11:00', '12:00', 'I1'], [], ['11:00', '12:00', 'I1']]),
  ]),
  createSubject('programacion-web', 'AEB1055', 'Programación Web', 5, [
    createGroup('AEB1055', '7SA', '', [['12:00', '13:00', 'I13'], ['12:00', '13:00', 'I13'], ['12:00', '13:00', 'I13'], ['12:00', '13:00', 'I13'], ['12:00', '13:00', 'I13']]),
    createGroup('AEB1055', '7SB', 'BAÑOS SOLIS FRANCISCO RICARDO', [['10:00', '11:00', 'I7'], ['10:00', '11:00', 'I7'], ['10:00', '11:00', 'I7'], ['10:00', '11:00', 'I7'], ['10:00', '11:00', 'I7']]),
    createGroup('AEB1055', '7SC', '', [['18:00', '19:00', 'buuuu'], ['18:00', '19:00', 'buuuu'], ['18:00', '19:00', 'buuuu'], ['18:00', '19:00', 'buuuu'], ['18:00', '19:00', 'buuuu']]),
    createGroup('AEB1055', '7SD', '', [['19:00', '20:00', 'I6'], ['19:00', '20:00', 'I6'], ['19:00', '20:00', 'I6'], ['19:00', '20:00', 'I6'], ['19:00', '20:00', 'I6']]),
  ]),
  createSubject('sistemas-programables', 'SCC1023', 'Sistemas Programables', 4, [
    createGroup('SCC1023', '8SA', '', [['15:00', '16:00', 'Ñ'], ['15:00', '16:00', 'Ñ'], ['15:00', '16:00', 'Ñ'], ['15:00', '16:00', 'Ñ'], []]),
    createGroup('SCC1023', '8SB', '', [['16:00', '17:00', 'Ñ'], ['16:00', '17:00', 'Ñ'], ['16:00', '17:00', 'Ñ'], ['16:00', '17:00', 'Ñ'], []]),
    createGroup('SCC1023', '8SC', '', [['12:00', '13:00', 'Q5'], ['12:00', '13:00', 'Q5'], ['12:00', '13:00', 'Q5'], ['12:00', '13:00', 'Q5'], []]),
  ]),
  createSubject('conmutacion-redes', 'SCD1004', 'Conmutación y Enrutamiento de Redes de Datos', 5, [
    createGroup('SCD1004', '7SA', '', [['07:00', '08:00', 'I1'], ['07:00', '08:00', 'I1'], ['07:00', '08:00', 'I1'], ['07:00', '08:00', 'I1'], ['07:00', '08:00', 'I1']]),
    createGroup('SCD1004', '7SB', 'ROBLEDO CABRERA OMAR', [['11:00', '12:00', 'I13'], ['11:00', '12:00', 'I13'], ['11:00', '12:00', 'I13'], ['11:00', '12:00', 'I13'], ['11:00', '12:00', 'I13']]),
    createGroup('SCD1004', '7SC', 'JIMENEZ HALLA JOHANN FRANCISCO', [['15:00', '16:00', 'cmc6'], ['15:00', '16:00', 'cmc6'], ['15:00', '16:00', 'cmc6'], ['15:00', '16:00', 'cmc6'], ['15:00', '16:00', 'cmc6']]),
    createGroup('SCD1004', '7SD', '', [['08:00', '09:00', 'buuuu'], ['08:00', '09:00', 'buuuu'], ['08:00', '09:00', 'buuuu'], ['08:00', '09:00', 'buuuu'], ['08:00', '09:00', 'buuuu']]),
  ]),
  createSubject('lenguajes-automatas-2', 'SCD1016', 'Lenguajes y Autómatas II', 5, [
    createGroup('SCD1016', '7SA', 'BENITEZ QUECHA CLARIBEL', [['09:00', '10:00', 'I12'], ['09:00', '10:00', 'I12'], ['09:00', '10:00', 'I12'], ['09:00', '10:00', 'I12'], ['09:00', '10:00', 'I12']]),
    createGroup('SCD1016', '7SB', '', [['11:00', '12:00', 'CCOMP2'], ['11:00', '12:00', 'CCOMP2'], ['11:00', '12:00', 'CCOMP2'], ['11:00', '12:00', 'CCOMP2'], ['11:00', '12:00', 'CCOMP2']]),
    createGroup('SCD1016', '7SC', 'ALONSO HERNANDEZ LUIS ALBERTO', [['16:00', '17:00', 'I14'], ['16:00', '17:00', 'I14'], ['16:00', '17:00', 'I14'], ['16:00', '17:00', 'I14'], ['16:00', '17:00', 'I14']]),
    createGroup('SCD1016', '7SD', 'ALONSO HERNANDEZ LUIS ALBERTO', [['14:00', '15:00', 'buuuu'], ['14:00', '15:00', 'buuuu'], ['14:00', '15:00', 'buuuu'], ['14:00', '15:00', 'buuuu'], ['14:00', '15:00', 'buuuu']]),
  ]),
  createSubject('gestion-proyectos-software', 'SCG1009', 'Gestión de Proyectos de Software', 6, [
    createGroup('SCG1009', '8SA', 'RAFAEL PEREZ EVA', [['10:00', '11:00', 'I10'], ['10:00', '11:00', 'I10'], ['10:00', '11:00', 'I10'], ['10:00', '11:00', 'I10'], ['10:00', '12:00', 'I10']]),
    createGroup('SCG1009', '8SB', 'RAFAEL PEREZ EVA', [['08:00', '09:00', 'I10'], ['08:00', '09:00', 'I10'], ['08:00', '09:00', 'I10'], ['08:00', '09:00', 'I10'], ['08:00', '10:00', 'I10']]),
    createGroup('SCG1009', '8SC', 'MARTINEZ NIETO ADELINA', [['07:00', '08:00', 'Ñ1'], ['07:00', '08:00', 'Ñ1'], ['07:00', '08:00', 'Ñ1'], ['07:00', '09:00', 'Ñ1'], ['07:00', '08:00', 'Ñ1']]),
  ]),
  createSubject('taller-investigacion-2', 'ACA0910', 'Taller de Investigación II', 4, [
    createGroup('ACA0910', '8SU', '', [['13:00', '14:00', 'Ñ1'], ['13:00', '14:00', 'Ñ1'], [], ['13:00', '14:00', 'Ñ1'], ['13:00', '14:00', 'Ñ1']]),
  ]),
  createSubject('software-toma-decisiones', 'DSED2302', 'Desarrollo de Software para la Toma de Decisiones', 5, [
    createGroup('DSED2302', '8SB', 'DIAZ SARMIENTO BIBIANA', [['09:00', '10:00', 'I13'], ['09:00', '10:00', 'I13'], ['09:00', '10:00', 'I13'], ['09:00', '10:00', 'I13'], ['09:00', '10:00', 'I13']]),
    createGroup('DSED2302', '8SC', 'ALONSO HERNANDEZ LUIS ALBERTO', [['17:00', '18:00', 'Ñ1'], ['17:00', '18:00', 'Ñ1'], ['17:00', '18:00', 'Ñ1'], ['17:00', '18:00', 'Ñ1'], ['17:00', '18:00', 'Ñ1']]),
  ]),
  createSubject('desarrollo-servicios-web', 'DSD2303', 'Desarrollo de Servicios Web', 5, [
    createGroup('DSD2303', '8SC', '', [['16:00', '17:00', 'Ñ1'], ['16:00', '17:00', 'Ñ1'], ['16:00', '17:00', 'Ñ1'], ['16:00', '17:00', 'Ñ1'], ['16:00', '17:00', 'Ñ1']]),
  ]),
  createSubject('administracion-redes', 'SCA1002', 'Administración de Redes', 4, [
    createGroup('SCA1002', '8SU', 'ROBLEDO CABRERA OMAR', [[], ['09:00', '10:00', 'I11'], ['09:00', '10:00', 'I11'], ['09:00', '10:00', 'I11'], ['09:00', '10:00', 'I11']]),
  ]),
  createSubject('programacion-logica-funcional', 'SCC1019', 'Programación Lógica y Funcional', 4, [
    createGroup('SCC1019', '7SA', 'MATADAMAS TORRES LORENZO ALEJANDRO', [['14:00', '15:00', 'CCOMP3'], ['14:00', '15:00', 'CCOMP3'], [], ['14:00', '15:00', 'CCOMP3'], ['14:00', '15:00', 'CCOMP3']]),
    createGroup('SCC1019', '7SB', 'MATADAMAS TORRES LORENZO ALEJANDRO', [['10:00', '11:00', 'I9'], ['10:00', '11:00', 'I9'], [], ['10:00', '11:00', 'I9'], ['10:00', '11:00', 'I9']]),
    createGroup('SCC1019', '7SC', 'ALONSO MARTINEZ CARLOS', [['16:00', '17:00', 'buuuu'], ['16:00', '17:00', 'buuuu'], ['16:00', '17:00', 'buuuu'], ['16:00', '17:00', 'buuuu'], []]),
    createGroup('SCC1019', '7SD', 'MATADAMAS TORRES LORENZO ALEJANDRO', [['15:00', '16:00', 'Ñ2'], ['15:00', '16:00', 'Ñ2'], ['15:00', '16:00', 'Ñ2'], ['15:00', '16:00', 'Ñ2'], []]),
  ]),
]

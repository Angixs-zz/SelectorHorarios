// Datos de demostración. Sustituir por los horarios oficiales proporcionados por el usuario.

const createGroup = (key, group, sessions) => ({
  id: `${key.toLowerCase()}-${group.toLowerCase()}`,
  grupo: group,
  docente: '',
  sesiones: sessions.map(([dia, inicio, fin]) => ({
    dia,
    inicio,
    fin,
    aula: 'DEMO',
  })),
})

export const materiasIniciales = [
  {
    id: 'taller-investigacion-1',
    clave: 'ACA0909',
    nombre: 'Taller de Investigación I',
    creditos: 4,
    grupos: [
      createGroup('ACA0909', '7SA', [['lunes', '10:00', '11:00'], ['martes', '10:00', '11:00']]),
      createGroup('ACA0909', '7SB', [['lunes', '11:00', '12:00'], ['miercoles', '11:00', '12:00']]),
      createGroup('ACA0909', '7SC', [['martes', '12:00', '13:00'], ['jueves', '12:00', '13:00']]),
      createGroup('ACA0909', '7SD', [['jueves', '09:00', '11:00']]),
    ],
  },
  {
    id: 'programacion-web',
    clave: 'AEB1055',
    nombre: 'Programación Web',
    creditos: 5,
    grupos: [
      createGroup('AEB1055', '7SA', [['lunes', '10:00', '12:00'], ['viernes', '10:00', '12:00']]),
      createGroup('AEB1055', '7SB', [['martes', '08:00', '10:00'], ['jueves', '08:00', '10:00']]),
      createGroup('AEB1055', '7SC', [['miercoles', '12:00', '14:00'], ['viernes', '12:00', '14:00']]),
      createGroup('AEB1055', '7SD', [['lunes', '15:00', '17:00'], ['jueves', '15:00', '17:00']]),
    ],
  },
  {
    id: 'sistemas-programables',
    clave: 'SCC1023',
    nombre: 'Sistemas Programables',
    creditos: 4,
    grupos: [
      createGroup('SCC1023', '8SA', [['lunes', '08:00', '10:00'], ['miercoles', '08:00', '10:00']]),
      createGroup('SCC1023', '8SB', [['martes', '10:00', '12:00'], ['viernes', '10:00', '12:00']]),
      createGroup('SCC1023', '8SC', [['jueves', '13:00', '15:00'], ['viernes', '13:00', '15:00']]),
    ],
  },
  {
    id: 'conmutacion-redes',
    clave: 'SCD1004',
    nombre: 'Conmutación y Enrutamiento de Redes de Datos',
    creditos: 5,
    grupos: [
      createGroup('SCD1004', '7SA', [['martes', '10:00', '12:00'], ['jueves', '10:00', '12:00']]),
      createGroup('SCD1004', '7SB', [['lunes', '12:00', '14:00'], ['miercoles', '12:00', '14:00']]),
      createGroup('SCD1004', '7SC', [['martes', '15:00', '17:00'], ['viernes', '15:00', '17:00']]),
      createGroup('SCD1004', '7SD', [['miercoles', '09:00', '11:00'], ['jueves', '09:00', '11:00']]),
    ],
  },
  {
    id: 'lenguajes-automatas-2',
    clave: 'SCD1016',
    nombre: 'Lenguajes y Autómatas II',
    creditos: 5,
    grupos: [
      createGroup('SCD1016', '7SA', [['lunes', '13:00', '15:00'], ['jueves', '13:00', '15:00']]),
      createGroup('SCD1016', '7SB', [['martes', '12:00', '14:00'], ['viernes', '12:00', '14:00']]),
      createGroup('SCD1016', '7SC', [['miercoles', '10:00', '12:00'], ['viernes', '10:00', '12:00']]),
      createGroup('SCD1016', '7SD', [['martes', '17:00', '19:00'], ['jueves', '17:00', '19:00']]),
    ],
  },
  {
    id: 'gestion-proyectos-software',
    clave: 'SCG1009',
    nombre: 'Gestión de Proyectos de Software',
    creditos: 6,
    grupos: [
      createGroup('SCG1009', '8SA', [['lunes', '17:00', '19:00'], ['miercoles', '17:00', '19:00']]),
      createGroup('SCG1009', '8SB', [['martes', '14:00', '16:00'], ['jueves', '14:00', '16:00']]),
      createGroup('SCG1009', '8SC', [['viernes', '08:00', '12:00']]),
    ],
  },
]

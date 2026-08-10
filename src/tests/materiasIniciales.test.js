import { describe, expect, it } from 'vitest'
import { materiasIniciales, planeacionProvisionalEspecialidad } from '../data/materiasIniciales.js'

const subjectById = (id) => materiasIniciales.find((subject) => subject.id === id)

describe('oferta académica inicial', () => {
  it('separa el semestre curricular de los grupos administrativos de octavo', () => {
    const systems = subjectById('sistemas-programables')
    const projects = subjectById('gestion-proyectos-software')

    expect(systems.semestreCurricular).toBe(7)
    expect(systems.grupos.map((group) => group.grupo)).toEqual(['8SA', '8SB', '8SC'])
    expect(projects.semestreCurricular).toBe(7)
    expect(projects.grupos.every((group) => group.semestreAdministrativo === 8)).toBe(true)
  })

  it('contiene exactamente las siete materias curriculares indicadas para séptimo', () => {
    const seventhSemesterKeys = materiasIniciales
      .filter((subject) => subject.semestreCurricular === 7)
      .map((subject) => subject.clave)
      .sort()

    expect(seventhSemesterKeys).toEqual([
      'ACA0909',
      'AEB1055',
      'DAD-2605',
      'SCC1023',
      'SCD1004',
      'SCD1016',
      'SCG1009',
    ])
    expect(subjectById('programacion-logica-funcional').semestreCurricular).toBe(8)
    expect(planeacionProvisionalEspecialidad.semestreCurricular).toBeNull()
    expect(subjectById('software-toma-decisiones-dad-2605').creditos).toBe(5)
  })

  it('contiene exactamente las seis materias curriculares únicas de octavo', () => {
    const eighthSemesterKeys = materiasIniciales
      .filter((subject) => subject.semestreCurricular === 8)
      .map((subject) => subject.clave)
      .sort()

    expect(eighthSemesterKeys).toEqual([
      'ACA0910',
      'DAD-2601',
      'DAD-2602',
      'SCA1002',
      'SCC1019',
      'SESSC10',
    ])
    expect(subjectById('software-toma-decisiones')).toBeUndefined()
    expect(subjectById('desarrollo-servicios-web').semestreCurricular).toBeNull()
  })

  it('guarda SCD1004 7SD de 13:00 a 14:00', () => {
    const group = subjectById('conmutacion-redes').grupos.find((current) => current.grupo === '7SD')
    expect(group.sesiones.every((session) => session.inicio === '13:00' && session.fin === '14:00')).toBe(true)
  })

  it('no conserva aulas ficticias', () => {
    const rooms = materiasIniciales.flatMap((subject) =>
      subject.grupos.flatMap((group) => group.sesiones.map((session) => session.aula)),
    )
    expect(rooms).not.toEqual(expect.arrayContaining(['Ñ', 'Ñ1', 'Ñ2', 'buuuu']))
  })

  it('unifica bajo DAD-2605 los grupos publicados con ambas claves', () => {
    const subject = subjectById('software-toma-decisiones-dad-2605')
    expect(subject.grupos.map((group) => group.grupo)).toEqual(['7SA', '7SB', '8SB', '8SC'])
    expect(subject.grupos.find((group) => group.grupo === '7SA').sesiones).toEqual(expect.arrayContaining([
      expect.objectContaining({ inicio: '08:00', fin: '09:00', aula: 'cmc6' }),
    ]))
    expect(subject.grupos.find((group) => group.grupo === '7SB').sesiones).toEqual(expect.arrayContaining([
      expect.objectContaining({ inicio: '19:00', fin: '20:00', aula: 'I10' }),
    ]))
    expect(subject.grupos.filter((group) => group.grupo.startsWith('8')).every((group) => group.alcance === 'oferta-administrativa-existente')).toBe(true)

    const provisionalGroups = planeacionProvisionalEspecialidad.grupos
    expect(provisionalGroups).toHaveLength(3)
    expect(provisionalGroups.every((group) => group.estado === 'provisional' && group.grupo === null)).toBe(true)
    expect(new Set(provisionalGroups.map((group) => `${group.sesiones[0].inicio}-${group.sesiones[0].fin}`))).toEqual(new Set([
      '08:00-09:00',
      '10:00-11:00',
      '19:00-20:00',
    ]))
    expect(provisionalGroups.every((group) => new Set(group.sesiones.map((session) => `${session.inicio}-${session.fin}`)).size === 1)).toBe(true)
  })
})

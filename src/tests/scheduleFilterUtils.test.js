import { describe, expect, it } from 'vitest'
import { emptyFilters, filterSubjects, getGroupSection } from '../utils/scheduleFilterUtils.js'

const group = (id, docente, dia, inicio, fin) => ({
  id,
  grupo: id,
  docente,
  sesiones: [{ dia, inicio, fin }],
})

const subject = (groups) => ({ id: 'subject', grupos: groups })

describe('filtros de horarios', () => {
  it('descarta grupos fuera del rango de entrada y salida', () => {
    const subjects = [subject([
      group('temprano', 'A', 'lunes', '09:00', '10:00'),
      group('valido', 'B', 'lunes', '10:00', '17:00'),
      group('tarde', 'C', 'lunes', '16:00', '18:00'),
    ])]
    const result = filterSubjects(subjects, { ...emptyFilters, startTime: '10:00', endTime: '17:00' })

    expect(result[0].grupos.map((current) => current.id)).toEqual(['valido'])
  })

  it('descarta grupos con clase en un día solicitado como libre', () => {
    const subjects = [subject([
      group('lunes', 'A', 'lunes', '10:00', '11:00'),
      group('viernes', 'B', 'viernes', '10:00', '11:00'),
    ])]

    expect(filterSubjects(subjects, { ...emptyFilters, freeDays: ['viernes'] })[0].grupos[0].id).toBe('lunes')
  })

  it('elimina docentes excluidos y prioriza uno cuando imparte la materia', () => {
    const subjects = [subject([
      group('preferido', 'PROFE A', 'lunes', '10:00', '11:00'),
      group('otro', 'PROFE B', 'martes', '10:00', '11:00'),
      group('excluido', 'PROFE C', 'miercoles', '10:00', '11:00'),
    ])]
    const result = filterSubjects(subjects, {
      ...emptyFilters,
      preferredTeacher: 'PROFE A',
      excludedTeachers: ['PROFE C'],
    })

    expect(result[0].grupos.map((current) => current.id)).toEqual(['preferido'])
  })

  it('conserva los grupos de materias que no imparte el profesor preferido', () => {
    const subjects = [subject([group('disponible', 'PROFE B', 'lunes', '10:00', '11:00')])]

    expect(filterSubjects(subjects, { ...emptyFilters, preferredTeacher: 'PROFE A' })[0].grupos).toHaveLength(1)
  })

  it('permite fijar uno o varios grupos concretos por materia', () => {
    const subjects = [subject([
      group('7SA', 'A', 'lunes', '10:00', '11:00'),
      group('7SB', 'B', 'martes', '10:00', '11:00'),
      group('7SC', 'C', 'miercoles', '10:00', '11:00'),
    ])]
    const result = filterSubjects(subjects, {
      ...emptyFilters,
      allowedGroupIds: { subject: ['7SA', '7SC'] },
    })

    expect(result[0].grupos.map((current) => current.id)).toEqual(['7SA', '7SC'])
  })

  it('filtra por terminación de grupo sin importar el semestre', () => {
    const subjects = [subject([
      group('7SA', 'A', 'lunes', '10:00', '11:00'),
      group('8SA', 'B', 'martes', '10:00', '11:00'),
      group('8SB', 'C', 'miercoles', '10:00', '11:00'),
    ])]
    const result = filterSubjects(subjects, { ...emptyFilters, groupSections: ['SA'] })

    expect(result[0].grupos.map((current) => current.id)).toEqual(['7SA', '8SA'])
    expect(getGroupSection('8SU')).toBe('SU')
  })
})

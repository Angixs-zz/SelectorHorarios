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

  it('mantiene separada la oferta existente de la planeación para nuevo ingreso', () => {
    const existing = subjectById('software-toma-decisiones')
    expect(existing.grupos.every((group) => group.alcance === 'oferta-administrativa-existente')).toBe(true)

    const provisionalGroup = planeacionProvisionalEspecialidad.grupos[0]
    expect(provisionalGroup.estado).toBe('provisional')
    expect(provisionalGroup.grupo).toBeNull()
    expect(new Set(provisionalGroup.sesiones.map((session) => `${session.inicio}-${session.fin}`))).toEqual(new Set([
      '08:00-09:00',
      '10:00-11:00',
      '19:00-20:00',
    ]))
  })
})

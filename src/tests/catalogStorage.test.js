import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadCatalogState, saveCatalogState } from '../utils/catalogStorage.js'

const storage = new Map()

beforeEach(() => {
  storage.clear()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  })
})

describe('catálogos por periodo', () => {
  it('migra el catálogo anterior sin perder materias y agrega la planeación provisional', () => {
    const legacySubjects = [{ id: 'personalizada', nombre: 'Materia personalizada', grupos: [] }]
    storage.set('selector-horarios-materias', JSON.stringify(legacySubjects))

    const state = loadCatalogState()

    expect(state.periods[0].label).toBe('Agosto-Diciembre 2026')
    expect(state.schemaVersion).toBe(5)
    expect(state.periods[0].subjects[0]).toMatchObject({
      id: 'personalizada',
      nombre: 'Materia personalizada',
      semestreCurricular: null,
      tipo: 'materia',
    })
    expect(state.periods[0].subjects).toContainEqual(expect.objectContaining({
      id: 'especialidad-toma-decisiones-provisional',
      semestreCurricular: null,
      tipo: 'planeacion-provisional',
    }))
    expect(state.periods[0].subjects).toContainEqual(expect.objectContaining({
      clave: 'DAD-2605',
      semestreCurricular: 7,
    }))
  })

  it('guarda y recupera varias ofertas académicas', () => {
    const state = {
      activePeriodId: '2027-enero-julio',
      periods: [
        { id: '2026-agosto-diciembre', label: 'Agosto-Diciembre 2026', subjects: [] },
        { id: '2027-enero-julio', label: 'Enero-Julio 2027', subjects: [] },
      ],
    }

    saveCatalogState(state)

    const loaded = loadCatalogState()
    expect(loaded.activePeriodId).toBe(state.activePeriodId)
    expect(loaded.schemaVersion).toBe(5)
    expect(loaded.periods[1]).toEqual(state.periods[1])
  })

  it('corrige el horario 7SD y normaliza datos pendientes conservando ids', () => {
    storage.set('selector-horarios-catalogos-v1', JSON.stringify({
      activePeriodId: '2026-agosto-diciembre',
      periods: [{
        id: '2026-agosto-diciembre',
        label: 'Agosto-Diciembre 2026',
        subjects: [{
          id: 'conmutacion-redes',
          clave: 'SCD1004',
          grupos: [{
            id: 'scd1004-7sd',
            grupo: '7SD',
            docente: '',
            sesiones: [{ dia: 'lunes', inicio: '08:00', fin: '09:00', aula: 'buuuu' }],
          }],
        }],
      }],
    }))

    const group = loadCatalogState().periods[0].subjects[0].grupos[0]
    expect(group).toMatchObject({
      id: 'scd1004-7sd',
      grupo: '7SD',
      semestreAdministrativo: 7,
      docente: null,
      estado: 'oficial',
    })
    expect(group.sesiones[0]).toEqual({ dia: 'lunes', inicio: '13:00', fin: '14:00', aula: null })
  })

  it('corrige la clasificación curricular y los grupos provisionales sin sobrescribir horarios editados', () => {
    storage.set('selector-horarios-catalogos-v1', JSON.stringify({
      schemaVersion: 2,
      activePeriodId: '2026-agosto-diciembre',
      periods: [{
        id: '2026-agosto-diciembre',
        label: 'Agosto-Diciembre 2026',
        subjects: [
          {
            id: 'conmutacion-redes',
            clave: 'SCD1004',
            semestreCurricular: 7,
            grupos: [{
              id: 'scd1004-7sd',
              grupo: '7SD',
              sesiones: [{ dia: 'lunes', inicio: '15:00', fin: '16:00', aula: null }],
            }],
          },
          { id: 'programacion-logica-funcional', clave: 'SCC1019', semestreCurricular: 7, grupos: [] },
          {
            id: 'especialidad-toma-decisiones-provisional',
            clave: 'ESP-TD-PENDIENTE',
            semestreCurricular: 7,
            grupos: [{ id: 'especialidad-toma-decisiones-bloques-previstos', grupo: null, sesiones: [] }],
          },
        ],
      }],
    }))

    const subjects = loadCatalogState().periods[0].subjects
    expect(subjects.find((subject) => subject.id === 'conmutacion-redes').grupos[0].sesiones[0]).toMatchObject({
      inicio: '15:00',
      fin: '16:00',
    })
    expect(subjects.find((subject) => subject.id === 'programacion-logica-funcional').semestreCurricular).toBe(8)
    const provisional = subjects.find((subject) => subject.id === 'especialidad-toma-decisiones-provisional')
    expect(provisional.semestreCurricular).toBeNull()
    expect(provisional.grupos).toHaveLength(3)
    expect(subjects.find((subject) => subject.clave === 'DAD-2605').semestreCurricular).toBe(7)
    expect(subjects.filter((subject) => ['DAD-2601', 'SESSC10', 'DAD-2602'].includes(subject.clave))).toHaveLength(3)
  })

  it('fusiona DSED2302 con DAD-2605 y conserva grupos editados', () => {
    storage.set('selector-horarios-catalogos-v1', JSON.stringify({
      schemaVersion: 4,
      activePeriodId: '2026-agosto-diciembre',
      periods: [{
        id: '2026-agosto-diciembre',
        label: 'Agosto-Diciembre 2026',
        subjects: [
          {
            id: 'software-toma-decisiones-dad-2605',
            clave: 'DAD-2605',
            nombre: 'Software para Toma de Decisiones',
            grupos: [{ id: 'dad-2605-7sa', grupo: '7SA', sesiones: [{ dia: 'lunes', inicio: '08:30', fin: '09:30', aula: 'EDITADA' }] }],
          },
          {
            id: 'software-toma-decisiones',
            clave: 'DSED2302',
            nombre: 'Desarrollo de Software para la Toma de Decisiones',
            grupos: [{ id: 'dsed2302-8sb', grupo: '8SB', sesiones: [{ dia: 'lunes', inicio: '09:30', fin: '10:30', aula: 'I13' }] }],
          },
        ],
      }],
    }))

    const subjects = loadCatalogState().periods[0].subjects
    const merged = subjects.find((subject) => subject.id === 'software-toma-decisiones-dad-2605')
    expect(subjects.some((subject) => subject.id === 'software-toma-decisiones')).toBe(false)
    expect(merged).toMatchObject({ clave: 'DAD-2605', creditos: 5, semestreCurricular: 7 })
    expect(merged.grupos.map((group) => group.grupo)).toEqual(['7SA', '7SB', '8SB', '8SC'])
    expect(merged.grupos.find((group) => group.id === 'dad-2605-7sa').sesiones[0]).toMatchObject({ inicio: '08:30', fin: '09:30', aula: 'EDITADA' })
    expect(merged.grupos.find((group) => group.id === 'dsed2302-8sb').sesiones[0]).toMatchObject({ inicio: '09:30', fin: '10:30' })
  })
})

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
    expect(state.schemaVersion).toBe(2)
    expect(state.periods[0].subjects[0]).toMatchObject({
      id: 'personalizada',
      nombre: 'Materia personalizada',
      semestreCurricular: null,
      tipo: 'materia',
    })
    expect(state.periods[0].subjects).toContainEqual(expect.objectContaining({
      id: 'especialidad-toma-decisiones-provisional',
      semestreCurricular: 7,
      tipo: 'planeacion-provisional',
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
    expect(loaded.schemaVersion).toBe(2)
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
})

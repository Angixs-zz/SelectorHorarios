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
  it('migra el catálogo anterior sin perder materias', () => {
    const legacySubjects = [{ id: 'personalizada', nombre: 'Materia personalizada', grupos: [] }]
    storage.set('selector-horarios-materias', JSON.stringify(legacySubjects))

    const state = loadCatalogState()

    expect(state.periods[0].label).toBe('Agosto-Diciembre 2026')
    expect(state.periods[0].subjects).toEqual(legacySubjects)
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

    expect(loadCatalogState()).toEqual(state)
  })
})

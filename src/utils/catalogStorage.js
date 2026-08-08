import { materiasIniciales } from '../data/materiasIniciales.js'

const LEGACY_STORAGE_KEY = 'selector-horarios-materias'
const CATALOGS_STORAGE_KEY = 'selector-horarios-catalogos-v1'
const DEFAULT_PERIOD_ID = '2026-agosto-diciembre'

const createDefaultState = (subjects = materiasIniciales) => ({
  activePeriodId: DEFAULT_PERIOD_ID,
  periods: [{
    id: DEFAULT_PERIOD_ID,
    label: 'Agosto-Diciembre 2026',
    subjects,
  }],
})

export function loadCatalogState() {
  try {
    const storedState = JSON.parse(window.localStorage.getItem(CATALOGS_STORAGE_KEY))
    if (storedState?.activePeriodId && Array.isArray(storedState.periods) && storedState.periods.length > 0) {
      return storedState.periods.some((period) => period.id === storedState.activePeriodId)
        ? storedState
        : { ...storedState, activePeriodId: storedState.periods[0].id }
    }

    const legacySubjects = JSON.parse(window.localStorage.getItem(LEGACY_STORAGE_KEY))
    const state = createDefaultState(Array.isArray(legacySubjects) ? legacySubjects : materiasIniciales)
    saveCatalogState(state)
    return state
  } catch {
    return createDefaultState()
  }
}

export function saveCatalogState(state) {
  try {
    window.localStorage.setItem(CATALOGS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // The catalogs still work for this session when storage is unavailable.
  }
}

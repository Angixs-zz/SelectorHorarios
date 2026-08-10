import { materiasIniciales, planeacionProvisionalEspecialidad } from '../data/materiasIniciales.js'

const LEGACY_STORAGE_KEY = 'selector-horarios-materias'
const CATALOGS_STORAGE_KEY = 'selector-horarios-catalogos-v1'
const DEFAULT_PERIOD_ID = '2026-agosto-diciembre'
const SCHEMA_VERSION = 2
const placeholderRooms = new Set(['Ñ', 'Ñ1', 'Ñ2', 'BUUUU'])
const curricularSemesters = {
  'taller-investigacion-1': 7,
  'programacion-web': 7,
  'sistemas-programables': 7,
  'conmutacion-redes': 7,
  'lenguajes-automatas-2': 7,
  'gestion-proyectos-software': 7,
  'programacion-logica-funcional': 7,
  'taller-investigacion-2': 8,
  'software-toma-decisiones': 8,
  'desarrollo-servicios-web': 8,
  'administracion-redes': 8,
}

const createDefaultState = (subjects = materiasIniciales) => ({
  schemaVersion: SCHEMA_VERSION,
  activePeriodId: DEFAULT_PERIOD_ID,
  periods: [{
    id: DEFAULT_PERIOD_ID,
    label: 'Agosto-Diciembre 2026',
    subjects,
  }],
})

const cleanOptionalText = (value) => typeof value === 'string' && value.trim() ? value.trim() : null

function normalizeSubject(subject, applyKnownCorrections) {
  return {
    ...subject,
    semestreCurricular: subject.semestreCurricular ?? curricularSemesters[subject.id] ?? null,
    tipo: subject.tipo ?? 'materia',
    nota: cleanOptionalText(subject.nota),
    grupos: (subject.grupos ?? []).map((group) => {
      const groupName = cleanOptionalText(group.grupo)?.toUpperCase() ?? null
      const isCorrectedGroup = applyKnownCorrections && subject.id === 'conmutacion-redes' && groupName === '7SD'
      return {
        ...group,
        grupo: groupName,
        semestreAdministrativo: group.semestreAdministrativo ?? (Number(groupName?.match(/^\d+/)?.[0]) || null),
        estado: applyKnownCorrections && subject.id === 'gestion-proyectos-software' && groupName === '8SC'
          ? 'por-verificar'
          : group.estado ?? 'oficial',
        alcance: group.alcance ?? (subject.id === 'software-toma-decisiones' ? 'oferta-administrativa-existente' : null),
        docente: cleanOptionalText(group.docente),
        nota: cleanOptionalText(group.nota) ?? (applyKnownCorrections && subject.id === 'gestion-proyectos-software' && groupName === '8SC'
          ? 'El horario fue descrito como aproximado; debe verificarse con la publicación administrativa.'
          : null),
        sesiones: (group.sesiones ?? []).map((session) => ({
          ...session,
          inicio: isCorrectedGroup ? '13:00' : session.inicio,
          fin: isCorrectedGroup ? '14:00' : session.fin,
          aula: placeholderRooms.has(String(session.aula).toUpperCase()) ? null : cleanOptionalText(session.aula),
        })),
      }
    }),
  }
}

function migrateState(state) {
  const isSchemaUpgrade = (state.schemaVersion ?? 1) < SCHEMA_VERSION
  const periods = state.periods.map((period) => {
    const subjects = (period.subjects ?? []).map((subject) => normalizeSubject(subject, isSchemaUpgrade))
    if (isSchemaUpgrade && period.id === DEFAULT_PERIOD_ID && !subjects.some((subject) => subject.id === planeacionProvisionalEspecialidad.id)) {
      subjects.push(structuredClone(planeacionProvisionalEspecialidad))
    }
    return { ...period, subjects }
  })
  return { ...state, schemaVersion: SCHEMA_VERSION, periods }
}

export function loadCatalogState() {
  try {
    const storedState = JSON.parse(window.localStorage.getItem(CATALOGS_STORAGE_KEY))
    if (storedState?.activePeriodId && Array.isArray(storedState.periods) && storedState.periods.length > 0) {
      const state = storedState.periods.some((period) => period.id === storedState.activePeriodId)
        ? storedState
        : { ...storedState, activePeriodId: storedState.periods[0].id }
      const migratedState = migrateState(state)
      saveCatalogState(migratedState)
      return migratedState
    }

    const legacySubjects = JSON.parse(window.localStorage.getItem(LEGACY_STORAGE_KEY))
    const hasLegacyCatalog = Array.isArray(legacySubjects)
    const initialState = createDefaultState(hasLegacyCatalog ? legacySubjects : materiasIniciales)
    const state = migrateState(hasLegacyCatalog ? { ...initialState, schemaVersion: 1 } : initialState)
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

import {
  materiasIniciales,
  materiasCurricularesOctavoPendientes,
  planeacionProvisionalEspecialidad,
  softwareTomaDecisionesCurricular,
} from '../data/materiasIniciales.js'

const LEGACY_STORAGE_KEY = 'selector-horarios-materias'
const CATALOGS_STORAGE_KEY = 'selector-horarios-catalogos-v1'
const DEFAULT_PERIOD_ID = '2026-agosto-diciembre'
const SCHEMA_VERSION = 4
const placeholderRooms = new Set(['Ñ', 'Ñ1', 'Ñ2', 'BUUUU'])
const curricularSemesters = {
  'taller-investigacion-1': 7,
  'programacion-web': 7,
  'sistemas-programables': 7,
  'conmutacion-redes': 7,
  'lenguajes-automatas-2': 7,
  'gestion-proyectos-software': 7,
  'software-toma-decisiones-dad-2605': 7,
  'taller-investigacion-2': 8,
  'programacion-logica-funcional': 8,
  'administracion-redes': 8,
  'patrones-diseno-software': 8,
  'servicio-social': 8,
  'desarrollo-entornos-moviles': 8,
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

const correctedSeventhSemesterIds = new Set([
  'taller-investigacion-1',
  'programacion-web',
  'sistemas-programables',
  'conmutacion-redes',
  'lenguajes-automatas-2',
  'gestion-proyectos-software',
  'software-toma-decisiones-dad-2605',
])

const correctedEighthSemesterIds = new Set([
  'programacion-logica-funcional',
  'administracion-redes',
  'patrones-diseno-software',
  'servicio-social',
  'desarrollo-entornos-moviles',
  'taller-investigacion-2',
])

function normalizeSubject(subject, previousSchemaVersion) {
  const applyV2Corrections = previousSchemaVersion < 2
  let semestreCurricular = subject.semestreCurricular ?? curricularSemesters[subject.id] ?? null
  if (previousSchemaVersion < 4) {
    if (correctedSeventhSemesterIds.has(subject.id)) semestreCurricular = 7
    if (correctedEighthSemesterIds.has(subject.id)) semestreCurricular = 8
    if (
      subject.id === planeacionProvisionalEspecialidad.id
      || subject.id === 'software-toma-decisiones'
      || subject.id === 'desarrollo-servicios-web'
    ) semestreCurricular = null
  }

  const sourceGroups = previousSchemaVersion < 4
    && subject.id === planeacionProvisionalEspecialidad.id
    && subject.grupos?.some((group) => group.id === 'especialidad-toma-decisiones-bloques-previstos')
    ? structuredClone(planeacionProvisionalEspecialidad.grupos)
    : subject.grupos ?? []

  return {
    ...subject,
    semestreCurricular,
    tipo: subject.tipo ?? 'materia',
    nota: cleanOptionalText(subject.nota),
    grupos: sourceGroups.map((group) => {
      const groupName = cleanOptionalText(group.grupo)?.toUpperCase() ?? null
      const isCorrectedGroup = applyV2Corrections && subject.id === 'conmutacion-redes' && groupName === '7SD'
      return {
        ...group,
        grupo: groupName,
        semestreAdministrativo: group.semestreAdministrativo ?? (Number(groupName?.match(/^\d+/)?.[0]) || null),
        estado: applyV2Corrections && subject.id === 'gestion-proyectos-software' && groupName === '8SC'
          ? 'por-verificar'
          : group.estado ?? 'oficial',
        alcance: group.alcance ?? (subject.id === 'software-toma-decisiones' ? 'oferta-administrativa-existente' : null),
        docente: cleanOptionalText(group.docente),
        nota: cleanOptionalText(group.nota) ?? (applyV2Corrections && subject.id === 'gestion-proyectos-software' && groupName === '8SC'
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
  const previousSchemaVersion = state.schemaVersion ?? 1
  const periods = state.periods.map((period) => {
    const subjects = (period.subjects ?? []).map((subject) => normalizeSubject(subject, previousSchemaVersion))
    if (previousSchemaVersion < 2 && period.id === DEFAULT_PERIOD_ID && !subjects.some((subject) => subject.id === planeacionProvisionalEspecialidad.id)) {
      subjects.push(structuredClone(planeacionProvisionalEspecialidad))
    }
    if (previousSchemaVersion < 4 && period.id === DEFAULT_PERIOD_ID && !subjects.some((subject) => subject.id === softwareTomaDecisionesCurricular.id)) {
      subjects.push(structuredClone(softwareTomaDecisionesCurricular))
    }
    if (previousSchemaVersion < 4 && period.id === DEFAULT_PERIOD_ID) {
      for (const subject of materiasCurricularesOctavoPendientes) {
        if (!subjects.some((current) => current.id === subject.id)) subjects.push(structuredClone(subject))
      }
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

import { materiasIniciales } from '../data/materiasIniciales.js'

const STORAGE_KEY = 'selector-horarios-materias'
const STORAGE_VERSION_KEY = 'selector-horarios-version'
const CATALOG_VERSION = 'oficial-2026-08-2'

export function loadSubjects() {
  try {
    const storedSubjects = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    const storedVersion = window.localStorage.getItem(STORAGE_VERSION_KEY)
    if (storedVersion === 'oficial-2026-08' && Array.isArray(storedSubjects)) {
      const storedIds = new Set(storedSubjects.map((subject) => subject.id))
      const mergedSubjects = [
        ...storedSubjects,
        ...materiasIniciales.filter((subject) => !storedIds.has(subject.id)),
      ]
      window.localStorage.setItem(STORAGE_VERSION_KEY, CATALOG_VERSION)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSubjects))
      return mergedSubjects
    }
    if (storedVersion !== CATALOG_VERSION) {
      window.localStorage.setItem(STORAGE_VERSION_KEY, CATALOG_VERSION)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(materiasIniciales))
      return materiasIniciales
    }
    return Array.isArray(storedSubjects) ? storedSubjects : materiasIniciales
  } catch {
    return materiasIniciales
  }
}

export function saveSubjects(subjects) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects))
    window.localStorage.setItem(STORAGE_VERSION_KEY, CATALOG_VERSION)
  } catch {
    // The catalog still works for this session when storage is unavailable.
  }
}

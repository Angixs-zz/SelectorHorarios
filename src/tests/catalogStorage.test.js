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
    expect(state.schemaVersion).toBe(6)
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
    expect(loaded.schemaVersion).toBe(6)
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
      docente: 'VALVERDE JARQUIN REYNA',
      estado: 'oficial',
    })
    expect(group.sesiones[0]).toEqual({ dia: 'lunes', inicio: '13:00', fin: '14:00', aula: 'cmc6' })
  })

  it('corrige la clasificación curricular, la oferta oficial y los grupos provisionales', () => {
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
      inicio: '13:00',
      fin: '14:00',
      aula: 'cmc6',
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
    expect(merged.grupos.find((group) => group.id === 'dad-2605-7sa')).toMatchObject({ docente: 'LIMON CORDERO ROGELIO NOE' })
    expect(merged.grupos.find((group) => group.id === 'dad-2605-7sa').sesiones[0]).toMatchObject({ inicio: '08:00', fin: '09:00', aula: 'cmc6' })
    expect(merged.grupos.find((group) => group.id === 'dsed2302-8sb').sesiones[0]).toMatchObject({ inicio: '09:30', fin: '10:30' })
  })

  it('actualiza la oferta guardada y agrega Patrones y Servicio Social', () => {
    storage.set('selector-horarios-catalogos-v1', JSON.stringify({
      schemaVersion: 5,
      activePeriodId: '2026-agosto-diciembre',
      periods: [{
        id: '2026-agosto-diciembre',
        label: 'Agosto-Diciembre 2026',
        subjects: [
          { id: 'programacion-web', clave: 'AEB1055', grupos: [{ id: 'aeb1055-7sb', grupo: '7SB', docente: 'DOCENTE ANTERIOR', sesiones: [] }] },
          { id: 'patrones-diseno-software', clave: 'DAD-2601', creditos: null, grupos: [] },
          { id: 'servicio-social', clave: 'SESSC10', creditos: null, grupos: [] },
        ],
      }],
    }))

    const subjects = loadCatalogState().periods[0].subjects
    const webGroup = subjects.find((subject) => subject.id === 'programacion-web').grupos[0]
    expect(webGroup).toMatchObject({ docente: 'LIMON CORDERO ROGELIO NOE' })
    expect(webGroup.sesiones).toHaveLength(5)
    expect(subjects.find((subject) => subject.id === 'patrones-diseno-software')).toMatchObject({ creditos: 5, grupos: [expect.objectContaining({ grupo: '7SD' })] })
    expect(subjects.find((subject) => subject.id === 'servicio-social')).toMatchObject({ creditos: 10, grupos: [expect.objectContaining({ grupo: '8SS' })] })
  })
})

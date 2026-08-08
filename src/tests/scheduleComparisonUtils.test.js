import { describe, expect, it } from 'vitest'
import {
  analyzeSchedule,
  comparisonDays,
  formatMinutes,
} from '../utils/scheduleComparisonUtils.js'

const baseSession = (dia, inicio, fin, aula = 'A1') => ({ dia, inicio, fin, aula })

const scheduleFixture = [
  {
    materia: { id: 'mat1', clave: 'ABC123', nombre: 'Programación', creditos: 5 },
    grupo: {
      id: 'g1',
      grupo: '7SA',
      docente: 'DRA. DOCENTE',
      sesiones: [
        baseSession('lunes', '08:00', '09:00'),
        baseSession('lunes', '11:00', '12:00'),
        baseSession('martes', '09:00', '10:00'),
      ],
    },
  },
  {
    materia: { id: 'mat2', clave: 'XYZ789', nombre: 'Redes', creditos: 4 },
    grupo: {
      id: 'g2',
      grupo: '7A',
      sesiones: [baseSession('martes', '07:00', '08:00')],
    },
  },
]

describe('analyzeSchedule', () => {
  it('calcula entrada y salida por día junto con horas libres', () => {
    const { daysData } = analyzeSchedule(scheduleFixture)

    expect(daysData.lunes.entryTime).toBe('08:00')
    expect(daysData.lunes.exitTime).toBe('12:00')
    expect(daysData.lunes.classMinutes).toBe(120)
    expect(daysData.lunes.freePeriods).toEqual([{ inicio: '09:00', fin: '11:00', minutes: 120 }])
    expect(daysData.lunes.freeMinutes).toBe(120)

    expect(daysData.martes.entryTime).toBe('07:00')
    expect(daysData.martes.exitTime).toBe('10:00')
    expect(daysData.martes.freePeriods).toEqual([{ inicio: '08:00', fin: '09:00', minutes: 60 }])
    expect(daysData.martes.freeMinutes).toBe(60)

    expect(daysData.miercoles.hasClass).toBe(false)
  })

  it('calcula métricas de la semana', () => {
    const analysis = analyzeSchedule(scheduleFixture)

    expect(analysis.entryTime).toBe('07:00')
    expect(analysis.exitTime).toBe('12:00')
    expect(analysis.daysWithClass).toBe(2)
    expect(analysis.totalClassMinutes).toBe(240)
    expect(analysis.totalFreeMinutes).toBe(180)
  })
})

describe('formatMinutes', () => {
  it('formatea minutos como horas y minutos', () => {
    expect(formatMinutes(45)).toBe('45 min')
    expect(formatMinutes(120)).toBe('2 h')
    expect(formatMinutes(150)).toBe('2 h 30 min')
  })
})

describe('comparisonDays', () => {
  it('enumera los días lectivos en orden', () => {
    expect(comparisonDays).toEqual(['lunes', 'martes', 'miercoles', 'jueves', 'viernes'])
  })
})

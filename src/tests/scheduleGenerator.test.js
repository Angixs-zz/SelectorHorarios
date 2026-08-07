import { describe, expect, it } from 'vitest'
import { generateValidSchedules } from '../services/scheduleGenerator.js'
import {
  calculateTheoreticalCombinations,
  calculateTotalCredits,
} from '../utils/scheduleUtils.js'

const session = (dia, inicio, fin) => ({ dia, inicio, fin, aula: 'DEMO' })
const group = (id, sessions) => ({ id, grupo: id, docente: '', sesiones: sessions })
const subject = (id, groups, credits = 4) => ({
  id,
  clave: id.toUpperCase(),
  nombre: `Materia ${id}`,
  creditos: credits,
  grupos: groups,
})

describe('generateValidSchedules', () => {
  it('conserva una combinación válida', () => {
    const subjects = [
      subject('a', [group('a1', [session('lunes', '08:00', '09:00')])]),
      subject('b', [group('b1', [session('lunes', '09:00', '10:00')])]),
    ]

    expect(generateValidSchedules(subjects).schedules).toHaveLength(1)
  })

  it('descarta una combinación con conflicto mediante poda', () => {
    const subjects = [
      subject('a', [group('a1', [session('lunes', '08:00', '10:00')])]),
      subject('b', [group('b1', [session('lunes', '09:00', '11:00')])]),
    ]
    const result = generateValidSchedules(subjects)

    expect(result.schedules).toHaveLength(0)
    expect(result.completeCombinationsEvaluated).toBe(1)
    expect(result.prunedBranches).toBe(1)
  })

  it('elige exactamente un grupo por cada materia', () => {
    const subjects = [
      subject('a', [
        group('a1', [session('lunes', '08:00', '09:00')]),
        group('a2', [session('lunes', '09:00', '10:00')]),
      ]),
      subject('b', [
        group('b1', [session('martes', '08:00', '09:00')]),
        group('b2', [session('martes', '09:00', '10:00')]),
      ]),
    ]
    const result = generateValidSchedules(subjects)

    expect(result.schedules).toHaveLength(4)
    expect(result.schedules.every((schedule) => schedule.length === 2)).toBe(true)
    expect(result.schedules.every((schedule) => new Set(schedule.map((entry) => entry.materia.id)).size === 2)).toBe(true)
  })

  it('no incluye materias que no se entregaron como seleccionadas', () => {
    const selected = subject('seleccionada', [group('s1', [session('lunes', '08:00', '09:00')])])
    const unselected = subject('desmarcada', [group('d1', [session('martes', '08:00', '09:00')])])
    const result = generateValidSchedules([selected])

    expect(result.schedules[0].map((entry) => entry.materia.id)).toEqual(['seleccionada'])
    expect(result.schedules[0].some((entry) => entry.materia.id === unselected.id)).toBe(false)
  })

  it('devuelve una lista vacía cuando no hay materias', () => {
    const result = generateValidSchedules([])

    expect(result.schedules).toEqual([])
    expect(result.theoreticalCombinations).toBe(0)
  })

  it('no genera horarios si una materia no tiene grupos', () => {
    const subjects = [
      subject('a', [group('a1', [session('lunes', '08:00', '09:00')])]),
      subject('b', []),
    ]

    expect(generateValidSchedules(subjects).schedules).toEqual([])
  })

  it('considera válidas dos clases consecutivas', () => {
    const subjects = [
      subject('a', [group('a1', [session('viernes', '10:00', '11:00')])]),
      subject('b', [group('b1', [session('viernes', '11:00', '12:00')])]),
    ]

    expect(generateValidSchedules(subjects).schedules).toHaveLength(1)
  })
})

describe('cálculos de selección', () => {
  it('calcula las combinaciones teóricas multiplicando grupos', () => {
    const subjects = [subject('a', new Array(4).fill({})), subject('b', new Array(3).fill({})), subject('c', new Array(4).fill({}))]
    expect(calculateTheoreticalCombinations(subjects)).toBe(48)
  })

  it('suma los créditos seleccionados', () => {
    expect(calculateTotalCredits([subject('a', [], 4), subject('b', [], 5)])).toBe(9)
  })
})

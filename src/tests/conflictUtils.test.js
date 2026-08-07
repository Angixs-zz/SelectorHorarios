import { describe, expect, it } from 'vitest'
import {
  groupConflictsWithSchedule,
  sessionsConflict,
} from '../utils/conflictUtils.js'

const session = (dia, inicio, fin) => ({ dia, inicio, fin, aula: 'DEMO' })
const group = (id, sessions) => ({ id, grupo: id, docente: '', sesiones: sessions })

describe('sessionsConflict', () => {
  it('detecta dos sesiones idénticas', () => {
    expect(sessionsConflict(
      session('lunes', '10:00', '11:00'),
      session('lunes', '10:00', '11:00'),
    )).toBe(true)
  })

  it('detecta sesiones parcialmente superpuestas', () => {
    expect(sessionsConflict(
      session('martes', '10:00', '12:00'),
      session('martes', '11:00', '13:00'),
    )).toBe(true)
  })

  it('permite que una sesión empiece cuando termina otra', () => {
    expect(sessionsConflict(
      session('lunes', '10:00', '11:00'),
      session('lunes', '11:00', '12:00'),
    )).toBe(false)
  })

  it('no compara como conflicto sesiones en días diferentes', () => {
    expect(sessionsConflict(
      session('lunes', '10:00', '12:00'),
      session('martes', '10:00', '12:00'),
    )).toBe(false)
  })
})

describe('groupConflictsWithSchedule', () => {
  it('rechaza un grupo con una sesión conflictiva', () => {
    const selected = [{ grupo: group('A', [session('lunes', '10:00', '11:00')]) }]
    const candidate = group('B', [session('lunes', '10:30', '12:00')])

    expect(groupConflictsWithSchedule(candidate, selected)).toBe(true)
  })

  it('revisa todas las sesiones de un grupo', () => {
    const selected = [{ grupo: group('A', [
      session('lunes', '08:00', '09:00'),
      session('jueves', '12:00', '13:00'),
    ]) }]
    const candidate = group('B', [
      session('martes', '08:00', '09:00'),
      session('jueves', '12:30', '14:00'),
    ])

    expect(groupConflictsWithSchedule(candidate, selected)).toBe(true)
  })
})

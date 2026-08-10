import { describe, expect, it } from 'vitest'
import { blocksToSessions, sessionsToBlocks } from '../utils/sessionBlockUtils.js'

describe('bloques de días y horarios', () => {
  it('agrupa sesiones con la misma hora y aula y puede expandirlas de nuevo', () => {
    const sessions = ['martes', 'miercoles', 'jueves', 'viernes'].map((dia) => ({
      dia,
      inicio: '10:00',
      fin: '11:00',
      aula: 'I1',
    }))

    const blocks = sessionsToBlocks(sessions, () => 'block-1')

    expect(blocks).toEqual([{
      id: 'block-1',
      dias: ['martes', 'miercoles', 'jueves', 'viernes'],
      inicio: '10:00',
      fin: '11:00',
      aula: 'I1',
    }])
    expect(blocksToSessions(blocks)).toEqual(sessions)
  })

  it('mantiene separados los horarios o aulas diferentes', () => {
    const sessions = [
      { dia: 'lunes', inicio: '10:00', fin: '11:00', aula: 'I1' },
      { dia: 'martes', inicio: '11:00', fin: '12:00', aula: 'I2' },
    ]

    expect(sessionsToBlocks(sessions, () => 'block').length).toBe(2)
  })

  it('convierte un aula vacía del formulario en null', () => {
    const blocks = [{ id: 'block', dias: ['lunes'], inicio: '08:00', fin: '09:00', aula: '  ' }]
    expect(blocksToSessions(blocks)).toEqual([
      { dia: 'lunes', inicio: '08:00', fin: '09:00', aula: null },
    ])
  })
})

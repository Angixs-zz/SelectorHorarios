import { describe, expect, it } from 'vitest'
import { timeToMinutes } from '../utils/timeUtils.js'

describe('timeToMinutes', () => {
  it('convierte 10:30 a minutos', () => {
    expect(timeToMinutes('10:30')).toBe(630)
  })
})

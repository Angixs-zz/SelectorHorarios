import { describe, expect, it } from 'vitest'
import { getGroupLabel, getScheduleWarnings } from '../utils/offerMetadata.js'

describe('metadatos de la oferta', () => {
  it('no inventa un grupo administrativo pendiente', () => {
    expect(getGroupLabel({ grupo: null })).toBe('Grupo administrativo por confirmar')
    expect(getGroupLabel({ grupo: null, etiquetaProvisional: 'Opción provisional 08:00-09:00' })).toBe('Opción provisional 08:00-09:00')
  })

  it('advierte cuando un horario usa planeación provisional', () => {
    const warnings = getScheduleWarnings([{
      materia: { id: 'especialidad' },
      grupo: { id: 'previsto', estado: 'provisional' },
    }])
    expect(warnings).toEqual(['Este horario contiene grupos de especialidad todavía no confirmados.'])
  })

  it('distingue la oferta existente no confirmada para nuevo ingreso', () => {
    const warnings = getScheduleWarnings([{
      materia: { id: 'dsed2302' },
      grupo: { id: '8sb', estado: 'oficial', alcance: 'oferta-administrativa-existente' },
    }])
    expect(warnings[0]).toContain('no está confirmada para alumnos de nuevo ingreso')
  })
})

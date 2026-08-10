export const PROVISIONAL_NOTICE = 'Horario provisional - pendiente de confirmación por coordinación.'

export function getGroupLabel(group) {
  return group.grupo || 'Grupo administrativo por confirmar'
}

export function isProvisionalGroup(group) {
  return group.estado === 'provisional'
}

export function getGroupStatusLabel(group) {
  if (isProvisionalGroup(group)) return 'Provisional'
  if (group.estado === 'por-verificar') return 'Publicado; horario por verificar'
  if (group.alcance === 'oferta-administrativa-existente') return 'Publicada; nuevo ingreso por confirmar'
  return 'Oferta publicada'
}

export function scheduleHasProvisionalData(schedule) {
  return schedule.some(({ grupo }) => isProvisionalGroup(grupo))
}

export function getScheduleWarnings(schedule) {
  const warnings = []
  if (scheduleHasProvisionalData(schedule)) {
    warnings.push('Este horario contiene grupos de especialidad todavía no confirmados.')
  }
  if (schedule.some(({ grupo }) => grupo.alcance === 'oferta-administrativa-existente')) {
    warnings.push('Incluye oferta administrativa existente que no está confirmada para alumnos de nuevo ingreso a la especialidad.')
  }
  if (schedule.some(({ grupo }) => grupo.estado === 'por-verificar')) {
    warnings.push('Incluye un horario administrativo descrito como aproximado y pendiente de verificación.')
  }
  return warnings
}

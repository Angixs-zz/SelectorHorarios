import { timeToMinutes } from './timeUtils.js'

export function sessionsConflict(sessionA, sessionB) {
  if (sessionA.dia !== sessionB.dia) return false

  const startA = timeToMinutes(sessionA.inicio)
  const endA = timeToMinutes(sessionA.fin)
  const startB = timeToMinutes(sessionB.inicio)
  const endB = timeToMinutes(sessionB.fin)

  return startA < endB && startB < endA
}

export function groupConflictsWithSchedule(candidateGroup, selectedGroups) {
  return candidateGroup.sesiones.some((candidateSession) =>
    selectedGroups.some(({ grupo }) =>
      grupo.sesiones.some((selectedSession) =>
        sessionsConflict(candidateSession, selectedSession),
      ),
    ),
  )
}

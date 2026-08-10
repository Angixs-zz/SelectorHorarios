import { minutesToTime, timeToMinutes } from './timeUtils.js'
import { scheduleHasProvisionalData } from './offerMetadata.js'

export const comparisonDays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']

export const comparisonDayNames = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
}

export function analyzeSchedule(schedule) {
  const daysData = {}
  let earliestEntry = Infinity
  let latestExit = -Infinity
  let totalClassMinutes = 0
  let totalFreeMinutes = 0
  let daysWithClass = 0

  for (const day of comparisonDays) {
    const sessions = schedule.flatMap(({ materia, grupo }) =>
      grupo.sesiones
        .filter((session) => session.dia === day)
        .map((session) => ({ ...session, materia, grupo })),
    )

    if (sessions.length === 0) {
      daysData[day] = { hasClass: false, sessions: [], freePeriods: [], freeMinutes: 0 }
      continue
    }

    const ordered = sessions.sort((a, b) => timeToMinutes(a.inicio) - timeToMinutes(b.inicio))
    const first = timeToMinutes(ordered[0].inicio)
    const last = timeToMinutes(ordered[ordered.length - 1].fin)
    const classMinutes = ordered.reduce(
      (sum, session) => sum + timeToMinutes(session.fin) - timeToMinutes(session.inicio),
      0,
    )
    const freePeriods = []

    for (let i = 1; i < ordered.length; i += 1) {
      const gapStart = timeToMinutes(ordered[i - 1].fin)
      const gapEnd = timeToMinutes(ordered[i].inicio)
      if (gapEnd > gapStart) {
        freePeriods.push({
          inicio: minutesToTime(gapStart),
          fin: minutesToTime(gapEnd),
          minutes: gapEnd - gapStart,
        })
      }
    }

    const freeMinutes = freePeriods.reduce((sum, period) => sum + period.minutes, 0)

    earliestEntry = Math.min(earliestEntry, first)
    latestExit = Math.max(latestExit, last)
    totalClassMinutes += classMinutes
    totalFreeMinutes += freeMinutes
    daysWithClass += 1

    daysData[day] = {
      hasClass: true,
      sessions: ordered,
      entryTime: minutesToTime(first),
      exitTime: minutesToTime(last),
      classMinutes,
      freePeriods,
      freeMinutes,
    }
  }

  return {
    daysData,
    daysWithClass,
    entryTime: earliestEntry === Infinity ? null : minutesToTime(earliestEntry),
    exitTime: latestExit === -Infinity ? null : minutesToTime(latestExit),
    totalClassMinutes,
    totalFreeMinutes,
    hasProvisionalData: scheduleHasProvisionalData(schedule),
  }
}

export function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} h`
  return `${hours} h ${minutes} min`
}

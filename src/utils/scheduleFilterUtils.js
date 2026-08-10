import { timeToMinutes } from './timeUtils.js'

export const emptyFilters = {
  startTime: '',
  endTime: '',
  freeDays: [],
  preferredTeacher: '',
  excludedTeachers: [],
  excludeUnassigned: false,
  groupSections: [],
  allowedGroupIds: {},
  maxDailyFreeMinutes: '',
}

export function getGroupSection(groupName) {
  return groupName?.replace(/^\d+/, '').toUpperCase() || 'PENDIENTE'
}

export function filterSubjects(subjects, filters) {
  const earliest = filters.startTime ? timeToMinutes(filters.startTime) : null
  const latest = filters.endTime ? timeToMinutes(filters.endTime) : null
  const freeDays = new Set(filters.freeDays)
  const excludedTeachers = new Set(filters.excludedTeachers)

  return subjects.map((subject) => {
    const allowedGroupIds = new Set(filters.allowedGroupIds?.[subject.id] ?? [])
    const eligibleGroups = subject.grupos.filter((group) => {
      if (allowedGroupIds.size > 0 && !allowedGroupIds.has(group.id)) return false
      if (filters.groupSections?.length > 0 && !filters.groupSections.includes(getGroupSection(group.grupo))) return false
      if (excludedTeachers.has(group.docente)) return false
      if (filters.excludeUnassigned && !group.docente) return false

      return group.sesiones.every((session) => {
        if (freeDays.has(session.dia)) return false
        if (earliest !== null && timeToMinutes(session.inicio) < earliest) return false
        if (latest !== null && timeToMinutes(session.fin) > latest) return false
        return true
      })
    })

    const preferredGroups = filters.preferredTeacher
      ? eligibleGroups.filter((group) => group.docente === filters.preferredTeacher)
      : []

    return {
      ...subject,
      grupos: preferredGroups.length > 0 ? preferredGroups : eligibleGroups,
    }
  })
}

export function filterSchedulesByFreeTime(schedules, maxDailyFreeMinutes) {
  if (maxDailyFreeMinutes === '') return schedules
  const maximum = Number(maxDailyFreeMinutes)

  return schedules.filter((schedule) => {
    const sessionsByDay = new Map()
    for (const { grupo } of schedule) {
      for (const session of grupo.sesiones) {
        const sessions = sessionsByDay.get(session.dia) ?? []
        sessions.push(session)
        sessionsByDay.set(session.dia, sessions)
      }
    }

    return [...sessionsByDay.values()].every((sessions) => {
      const ordered = sessions.sort((a, b) => timeToMinutes(a.inicio) - timeToMinutes(b.inicio))
      let freeMinutes = 0
      for (let index = 1; index < ordered.length; index += 1) {
        freeMinutes += Math.max(0, timeToMinutes(ordered[index].inicio) - timeToMinutes(ordered[index - 1].fin))
      }
      return freeMinutes <= maximum
    })
  })
}

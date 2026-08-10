export function calculateTheoreticalCombinations(subjects) {
  if (subjects.length === 0) return 0
  return subjects.reduce((total, subject) => total * subject.grupos.length, 1)
}

export function calculateTotalCredits(subjects) {
  return subjects.reduce((total, subject) => total + (Number(subject.creditos) || 0), 0)
}

export function createScheduleSignature(schedule) {
  return schedule
    .map(({ materia, grupo }) => `${materia.id}:${grupo.id}`)
    .sort()
    .join('|')
}

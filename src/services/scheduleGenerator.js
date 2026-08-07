import { groupConflictsWithSchedule } from '../utils/conflictUtils.js'
import {
  calculateTheoreticalCombinations,
  createScheduleSignature,
} from '../utils/scheduleUtils.js'

export function generateValidSchedules(selectedSubjects) {
  const theoreticalCombinations = calculateTheoreticalCombinations(selectedSubjects)
  const schedules = []
  const signatures = new Set()
  let completeCombinationsEvaluated = 0
  let prunedBranches = 0

  if (selectedSubjects.length === 0 || theoreticalCombinations === 0) {
    return {
      schedules,
      theoreticalCombinations,
      completeCombinationsEvaluated,
      prunedBranches,
    }
  }

  const currentSchedule = []

  function backtrack(subjectIndex) {
    if (subjectIndex === selectedSubjects.length) {
      const schedule = [...currentSchedule]
      const signature = createScheduleSignature(schedule)

      if (!signatures.has(signature)) {
        signatures.add(signature)
        schedules.push(schedule)
      }
      return
    }

    const subject = selectedSubjects[subjectIndex]

    for (const group of subject.grupos) {
      if (subjectIndex === selectedSubjects.length - 1) {
        completeCombinationsEvaluated += 1
      }

      if (groupConflictsWithSchedule(group, currentSchedule)) {
        prunedBranches += 1
        continue
      }

      currentSchedule.push({ materia: subject, grupo: group })
      backtrack(subjectIndex + 1)
      currentSchedule.pop()
    }
  }

  backtrack(0)

  return {
    schedules,
    theoreticalCombinations,
    completeCombinationsEvaluated,
    prunedBranches,
  }
}

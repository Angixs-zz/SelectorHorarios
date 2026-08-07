import { useState } from 'react'
import { EmptyState } from './components/EmptyState.jsx'
import { GenerationStats } from './components/GenerationStats.jsx'
import { Header } from './components/Header.jsx'
import { ScheduleGrid } from './components/ScheduleGrid.jsx'
import { ScheduleNavigator } from './components/ScheduleNavigator.jsx'
import { ScheduleSummary } from './components/ScheduleSummary.jsx'
import { SubjectSelector } from './components/SubjectSelector.jsx'
import { materiasIniciales } from './data/materiasIniciales.js'
import { generateValidSchedules } from './services/scheduleGenerator.js'
import {
  calculateTheoreticalCombinations,
  calculateTotalCredits,
} from './utils/scheduleUtils.js'

function App() {
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [generation, setGeneration] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  const selectedSubjects = materiasIniciales.filter((subject) => selectedIds.has(subject.id))
  const totalCredits = calculateTotalCredits(selectedSubjects)
  const theoreticalCombinations = calculateTheoreticalCombinations(selectedSubjects)

  const updateSelection = (nextIds) => {
    setSelectedIds(nextIds)
    setGeneration(null)
    setCurrentIndex(0)
  }

  const toggleSubject = (subjectId) => {
    const nextIds = new Set(selectedIds)
    if (nextIds.has(subjectId)) nextIds.delete(subjectId)
    else nextIds.add(subjectId)
    updateSelection(nextIds)
  }

  const generateSchedules = () => {
    setIsGenerating(true)
    setGeneration(null)
    setCurrentIndex(0)

    window.setTimeout(() => {
      const start = performance.now()
      const result = generateValidSchedules(selectedSubjects)
      const elapsedMs = performance.now() - start
      setGeneration({
        ...result,
        elapsedMs,
        subjectCount: selectedSubjects.length,
        totalCredits,
      })
      setIsGenerating(false)
    }, 0)
  }

  const currentSchedule = generation?.schedules[currentIndex]

  return (
    <>
      <Header />
      <main className="page-shell">
        <SubjectSelector
          subjects={materiasIniciales}
          selectedIds={selectedIds}
          onToggle={toggleSubject}
          onSelectAll={() => updateSelection(new Set(materiasIniciales.map((subject) => subject.id)))}
          onClear={() => updateSelection(new Set())}
          selectedCount={selectedSubjects.length}
          totalCredits={totalCredits}
          theoreticalCombinations={theoreticalCombinations}
        />

        <div className="generate-bar">
          <div>
            <strong>Listo para combinar</strong>
            <span>El cálculo se realiza únicamente en este navegador.</span>
          </div>
          <button
            type="button"
            className="button primary"
            disabled={selectedSubjects.length === 0 || isGenerating}
            onClick={generateSchedules}
          >
            {isGenerating ? 'Generando…' : 'Generar horarios'}
          </button>
        </div>

        {generation && <GenerationStats result={generation} />}

        {!generation && !isGenerating && <EmptyState />}
        {generation && generation.schedules.length === 0 && <EmptyState noResults />}

        {currentSchedule && (
          <section className="results-panel">
            <ScheduleNavigator
              currentIndex={currentIndex}
              total={generation.schedules.length}
              onChange={setCurrentIndex}
            />
            <ScheduleGrid schedule={currentSchedule} />
            <ScheduleSummary schedule={currentSchedule} />
          </section>
        )}
      </main>
      <footer>
        <span>Generador local · Primera etapa</span>
        <span>Los datos mostrados son de demostración.</span>
      </footer>
    </>
  )
}

export default App

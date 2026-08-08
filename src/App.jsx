import { useEffect, useState } from 'react'
import { AcademicPeriodSelector } from './components/AcademicPeriodSelector.jsx'
import { EmptyState } from './components/EmptyState.jsx'
import { GenerationStats } from './components/GenerationStats.jsx'
import { Header } from './components/Header.jsx'
import { ScheduleGrid } from './components/ScheduleGrid.jsx'
import { ScheduleFilters } from './components/ScheduleFilters.jsx'
import { ScheduleNavigator } from './components/ScheduleNavigator.jsx'
import { ScheduleComparePanel } from './components/ScheduleComparePanel.jsx'
import { ScheduleSummary } from './components/ScheduleSummary.jsx'
import { SubjectSelector } from './components/SubjectSelector.jsx'
import { SubjectEditor } from './components/SubjectEditor.jsx'
import { generateValidSchedules } from './services/scheduleGenerator.js'
import { exportSchedulePdf } from './services/schedulePdfExporter.js'
import { loadCatalogState, saveCatalogState } from './utils/catalogStorage.js'
import {
  emptyFilters,
  filterSchedulesByFreeTime,
  filterSubjects,
  getGroupSection,
} from './utils/scheduleFilterUtils.js'
import {
  calculateTheoreticalCombinations,
  calculateTotalCredits,
} from './utils/scheduleUtils.js'

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  const [catalogState, setCatalogState] = useState(loadCatalogState)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [generation, setGeneration] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [comparedIndexes, setComparedIndexes] = useState(() => new Set())
  const [filters, setFilters] = useState(emptyFilters)
  const [route, setRoute] = useState(() => `${window.location.pathname}${window.location.search}`)
  const activePeriod = catalogState.periods.find((period) => period.id === catalogState.activePeriodId) ?? catalogState.periods[0]
  const subjects = activePeriod.subjects

  useEffect(() => {
    const updateRoute = () => setRoute(`${window.location.pathname}${window.location.search}`)
    window.addEventListener('popstate', updateRoute)
    return () => window.removeEventListener('popstate', updateRoute)
  }, [])

  const navigate = (path, { replace = false } = {}) => {
    const appPath = `${basePath}${path}`
    window.history[replace ? 'replaceState' : 'pushState'](null, '', appPath)
    setRoute(appPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const routeUrl = new URL(route, window.location.origin)
  const isEditorRoute = routeUrl.pathname === `${basePath}/edicion-materia`
  const editingId = routeUrl.searchParams.get('id')
  const editingSubject = editingId ? subjects.find((subject) => subject.id === editingId) : null

  const selectedSubjects = subjects.filter((subject) => selectedIds.has(subject.id))
  const filteredSelectedSubjects = filterSubjects(selectedSubjects, filters)
  const totalCredits = calculateTotalCredits(selectedSubjects)
  const theoreticalCombinations = calculateTheoreticalCombinations(selectedSubjects)
  const filteredCombinations = calculateTheoreticalCombinations(filteredSelectedSubjects)
  const professors = [...new Set(subjects.flatMap((subject) =>
    subject.grupos.map((group) => group.docente).filter(Boolean),
  ))].sort((a, b) => a.localeCompare(b, 'es'))
  const groupSections = [...new Set(subjects.flatMap((subject) =>
    subject.grupos.map((group) => getGroupSection(group.grupo)),
  ))].sort()

  const updateSelection = (nextIds) => {
    setSelectedIds(nextIds)
    setGeneration(null)
    setCurrentIndex(0)
    setComparedIndexes(new Set())
  }

  const toggleSubject = (subjectId) => {
    const nextIds = new Set(selectedIds)
    if (nextIds.has(subjectId)) nextIds.delete(subjectId)
    else nextIds.add(subjectId)
    updateSelection(nextIds)
  }

  const updateCatalog = (nextSubjects) => {
    const nextState = {
      ...catalogState,
      periods: catalogState.periods.map((period) =>
        period.id === activePeriod.id ? { ...period, subjects: nextSubjects } : period,
      ),
    }
    setCatalogState(nextState)
    saveCatalogState(nextState)
    setGeneration(null)
    setCurrentIndex(0)
    setComparedIndexes(new Set())
  }

  const resetWorkspace = () => {
    setSelectedIds(new Set())
    setFilters({ ...emptyFilters })
    setGeneration(null)
    setCurrentIndex(0)
    setComparedIndexes(new Set())
  }

  const changePeriod = (periodId) => {
    const nextState = { ...catalogState, activePeriodId: periodId }
    setCatalogState(nextState)
    saveCatalogState(nextState)
    resetWorkspace()
    navigate('/', { replace: true })
  }

  const createPeriod = (copyCurrent) => {
    const label = window.prompt('Nombre del nuevo periodo, por ejemplo: Enero-Julio 2027')?.trim()
    if (!label) return
    const id = `periodo-${Date.now()}`
    const subjectsForPeriod = copyCurrent ? structuredClone(subjects) : []
    const nextState = {
      activePeriodId: id,
      periods: [...catalogState.periods, { id, label, subjects: subjectsForPeriod }],
    }
    setCatalogState(nextState)
    saveCatalogState(nextState)
    resetWorkspace()
    navigate('/', { replace: true })
  }

  const deletePeriod = () => {
    if (catalogState.periods.length === 1 || !window.confirm(`¿Eliminar el periodo ${activePeriod.label}?`)) return
    const periods = catalogState.periods.filter((period) => period.id !== activePeriod.id)
    const nextState = { periods, activePeriodId: periods[0].id }
    setCatalogState(nextState)
    saveCatalogState(nextState)
    resetWorkspace()
    navigate('/', { replace: true })
  }

  const updateFilters = (nextFilters) => {
    setFilters(nextFilters)
    setGeneration(null)
    setCurrentIndex(0)
    setComparedIndexes(new Set())
  }

  const toggleComparedIndex = (index) => {
    setComparedIndexes((currentIndexes) => {
      const nextIndexes = new Set(currentIndexes)
      if (nextIndexes.has(index)) nextIndexes.delete(index)
      else if (nextIndexes.size < 4) nextIndexes.add(index)
      return nextIndexes
    })
  }

  const saveSubject = (savedSubject) => {
    const exists = subjects.some((subject) => subject.id === savedSubject.id)
    updateCatalog(exists
      ? subjects.map((subject) => subject.id === savedSubject.id ? savedSubject : subject)
      : [...subjects, savedSubject])
    navigate('/', { replace: true })
  }

  const deleteSubject = () => {
    if (!editingSubject || !window.confirm(`¿Eliminar ${editingSubject.nombre} y todos sus grupos?`)) return
    updateCatalog(subjects.filter((subject) => subject.id !== editingSubject.id))
    const nextIds = new Set(selectedIds)
    nextIds.delete(editingSubject.id)
    setSelectedIds(nextIds)
    navigate('/', { replace: true })
  }

  const generateSchedules = () => {
    setIsGenerating(true)
    setGeneration(null)
    setCurrentIndex(0)
    setComparedIndexes(new Set())

    window.setTimeout(() => {
      const start = performance.now()
      const result = generateValidSchedules(filteredSelectedSubjects)
      const schedules = filterSchedulesByFreeTime(result.schedules, filters.maxDailyFreeMinutes)
      const elapsedMs = performance.now() - start
      setGeneration({
        ...result,
        schedules,
        schedulesBeforeFreeTimeFilter: result.schedules.length,
        freeTimeFilterApplied: filters.maxDailyFreeMinutes !== '',
        elapsedMs,
        subjectCount: selectedSubjects.length,
        totalCredits,
      })
      setIsGenerating(false)
      window.requestAnimationFrame(() => document.querySelector('#schedule-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }, 0)
  }

  const currentSchedule = generation?.schedules[currentIndex]

  const exportCurrentSchedule = async () => {
    if (!currentSchedule) return
    setIsExporting(true)
    try {
      await exportSchedulePdf(currentSchedule, currentIndex + 1)
    } catch {
      window.alert('No fue posible crear el PDF. Intenta nuevamente.')
    } finally {
      setIsExporting(false)
    }
  }

  const clearCompared = () => setComparedIndexes(new Set())

  return (
    <>
      <Header />
      <main className="page-shell">
        <AcademicPeriodSelector
          periods={catalogState.periods}
          activePeriodId={activePeriod.id}
          onChange={changePeriod}
          onCreate={createPeriod}
          onDelete={deletePeriod}
        />
        {isEditorRoute && editingId && !editingSubject && (
          <section className="panel editor-panel">
            <p className="step-label">Catálogo oficial</p>
            <h2>Materia no encontrada</h2>
            <p>La materia pudo haber sido eliminada o la dirección ya no es válida.</p>
            <button type="button" className="button secondary" onClick={() => navigate('/', { replace: true })}>Volver al inicio</button>
          </section>
        )}

        {isEditorRoute && (!editingId || editingSubject) && (
          <SubjectEditor
            key={editingSubject?.id ?? 'new'}
            subject={editingSubject}
            subjects={subjects}
            onSave={saveSubject}
            onDelete={deleteSubject}
            onCancel={() => navigate('/', { replace: true })}
          />
        )}

        {!isEditorRoute && (
          <>
            <div className="setup-layout">
              <SubjectSelector
                subjects={subjects}
                selectedIds={selectedIds}
                onToggle={toggleSubject}
                onSelectAll={(visibleIds) => updateSelection(new Set([...selectedIds, ...visibleIds]))}
                onClear={() => updateSelection(new Set())}
                selectedCount={selectedSubjects.length}
                totalCredits={totalCredits}
                theoreticalCombinations={theoreticalCombinations}
                onAdd={() => navigate('/edicion-materia')}
                onEdit={(subject) => navigate(`/edicion-materia?id=${encodeURIComponent(subject.id)}`)}
              />

              <ScheduleFilters
                filters={filters}
                professors={professors}
                groupSections={groupSections}
                selectedSubjects={selectedSubjects}
                combinations={filteredCombinations}
                onChange={updateFilters}
                onReset={() => updateFilters({ ...emptyFilters })}
              />
            </div>

            <div className="generate-bar">
              <div>
                <strong>Listo para combinar</strong>
                <span>Se combinarán únicamente los grupos que cumplen tus filtros.</span>
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
              <section className="results-panel" id="schedule-results">
                <ScheduleNavigator
                  currentIndex={currentIndex}
                  total={generation.schedules.length}
                  onChange={setCurrentIndex}
                  onExport={exportCurrentSchedule}
                  isExporting={isExporting}
                  isCompared={comparedIndexes.has(currentIndex)}
                  compareDisabled={!comparedIndexes.has(currentIndex) && comparedIndexes.size >= 4}
                  onToggleCompare={() => toggleComparedIndex(currentIndex)}
                />
                <ScheduleGrid schedule={currentSchedule} />
                <ScheduleSummary schedule={currentSchedule} />
              </section>
            )}

            {generation && generation.schedules.length > 0 && (
              <ScheduleComparePanel
                schedules={generation.schedules}
                selectedIndexes={comparedIndexes}
                currentIndex={currentIndex}
                onToggle={toggleComparedIndex}
                onClear={clearCompared}
                onView={(index) => {
                  setCurrentIndex(index)
                  document.querySelector('#schedule-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              />
            )}
          </>
        )}
      </main>
      <footer>
        <span>Generador local · Catálogo editable</span>
        <span>Tu oferta académica se guarda únicamente en este navegador.</span>
      </footer>
    </>
  )
}

export default App

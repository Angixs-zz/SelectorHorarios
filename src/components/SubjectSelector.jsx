import { SubjectCard } from './SubjectCard.jsx'

export function SubjectSelector({
  subjects,
  selectedIds,
  onToggle,
  onSelectAll,
  onClear,
  selectedCount,
  totalCredits,
  theoreticalCombinations,
}) {
  return (
    <section className="panel selector-panel" aria-labelledby="subjects-heading">
      <div className="section-heading">
        <div>
          <p className="step-label">01 · Materias</p>
          <h2 id="subjects-heading">Elige tu carga académica</h2>
        </div>
        <div className="compact-actions">
          <button type="button" className="button secondary" onClick={onSelectAll}>
            Seleccionar todas
          </button>
          <button type="button" className="button ghost" onClick={onClear}>
            Limpiar selección
          </button>
        </div>
      </div>

      <p className="demo-notice">
        Horarios y aulas de demostración. Sustituye estos datos antes de usarlos para una inscripción real.
      </p>

      <div className="subject-grid">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            selected={selectedIds.has(subject.id)}
            onToggle={onToggle}
          />
        ))}
      </div>

      <div className="selection-summary" aria-live="polite">
        <span><strong>{selectedCount}</strong> materias seleccionadas</span>
        <span><strong>{totalCredits}</strong> créditos</span>
        <span><strong>{theoreticalCombinations.toLocaleString('es-MX')}</strong> combinaciones teóricas</span>
      </div>
    </section>
  )
}

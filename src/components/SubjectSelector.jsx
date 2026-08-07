import { useState } from 'react'
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
  onAdd,
  onEdit,
}) {
  const [search, setSearch] = useState('')
  const [semester, setSemester] = useState('all')
  const normalizedSearch = search.trim().toLocaleLowerCase('es')
  const visibleSubjects = subjects.filter((subject) => {
    const matchesSearch = !normalizedSearch || `${subject.clave} ${subject.nombre}`.toLocaleLowerCase('es').includes(normalizedSearch)
    const matchesSemester = semester === 'all' || subject.grupos.some((group) => group.grupo.startsWith(semester))
    return matchesSearch && matchesSemester
  })

  return (
    <section className="panel selector-panel" aria-labelledby="subjects-heading">
      <div className="section-heading">
        <div>
          <p className="step-label">01 · Materias</p>
          <h2 id="subjects-heading">Elige tu carga académica</h2>
        </div>
        <div className="compact-actions">
          <button type="button" className="button primary" onClick={onAdd}>
            + Agregar materia
          </button>
          <button type="button" className="button secondary" onClick={() => onSelectAll(visibleSubjects.map((subject) => subject.id))}>
            Seleccionar visibles
          </button>
          <button type="button" className="button ghost" onClick={onClear}>
            Limpiar selección
          </button>
        </div>
      </div>

      <p className="catalog-notice">
        Combina libremente materias de séptimo y octavo. Tu selección se conserva al cambiar de semestre.
      </p>

      <div className="catalog-toolbar">
        <label className="subject-search">Buscar materia<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Clave o nombre" /></label>
        <div className="semester-switch" aria-label="Filtrar materias por semestre">
          {[['all', 'Todas'], ['7', '7° semestre'], ['8', '8° semestre']].map(([value, label]) => (
            <button type="button" className={semester === value ? 'is-active' : ''} onClick={() => setSemester(value)} key={value}>{label}</button>
          ))}
        </div>
      </div>

      <div className="subject-grid">
        {visibleSubjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            selected={selectedIds.has(subject.id)}
            onToggle={onToggle}
            onEdit={onEdit}
          />
        ))}
        {visibleSubjects.length === 0 && <p className="no-subject-results">No hay materias que coincidan con la búsqueda.</p>}
      </div>

      <div className="selection-summary" aria-live="polite">
        <span><strong>{selectedCount}</strong> materias seleccionadas</span>
        <span><strong>{totalCredits}</strong> créditos</span>
        <span><strong>{theoreticalCombinations.toLocaleString('es-MX')}</strong> combinaciones teóricas</span>
      </div>
    </section>
  )
}

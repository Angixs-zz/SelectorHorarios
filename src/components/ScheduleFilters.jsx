import { InfoIcon } from './InfoIcon.jsx'

const days = [
  ['lunes', 'Lun'],
  ['martes', 'Mar'],
  ['miercoles', 'Mié'],
  ['jueves', 'Jue'],
  ['viernes', 'Vie'],
]

const dayNames = Object.fromEntries(days)

export function ScheduleFilters({ filters, professors, groupSections, selectedSubjects, combinations, onChange, onReset }) {
  const update = (field, value) => onChange({ ...filters, [field]: value })

  const toggleListValue = (field, value) => {
    const current = filters[field]
    update(field, current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value])
  }

  const toggleGroup = (subjectId, groupId) => {
    const current = filters.allowedGroupIds[subjectId] ?? []
    const next = current.includes(groupId)
      ? current.filter((id) => id !== groupId)
      : [...current, groupId]
    const allowedGroupIds = { ...filters.allowedGroupIds }
    if (next.length > 0) allowedGroupIds[subjectId] = next
    else delete allowedGroupIds[subjectId]
    update('allowedGroupIds', allowedGroupIds)
  }

  const clearSubjectGroups = (subjectId) => {
    const allowedGroupIds = { ...filters.allowedGroupIds }
    delete allowedGroupIds[subjectId]
    update('allowedGroupIds', allowedGroupIds)
  }

  const pinnedSubjectCount = selectedSubjects.filter(
    (subject) => (filters.allowedGroupIds[subject.id] ?? []).length > 0,
  ).length

  return (
    <section className="panel filters-panel" aria-labelledby="filters-heading">
      <div className="section-heading">
        <div>
          <p className="step-label">02 · Restricciones</p>
          <h2 id="filters-heading">Define el horario que sí aceptarías</h2>
        </div>
        <button type="button" className="button ghost" onClick={onReset}>Restablecer filtros</button>
      </div>

      <div className="filter-grid">
        <div className="filter-card">
          <h3><InfoIcon name="clock" /> Rango de clases</h3>
          <div className="time-filter-fields">
            <label>No comenzar antes de<input type="time" value={filters.startTime} onChange={(event) => update('startTime', event.target.value)} /></label>
            <label>Terminar a más tardar<input type="time" value={filters.endTime} onChange={(event) => update('endTime', event.target.value)} /></label>
          </div>
          <p>Ejemplo: `10:00` a `17:00` elimina cualquier grupo fuera de ese rango.</p>
        </div>

        <div className="filter-card">
          <h3><InfoIcon name="calendar" /> Familia de grupo</h3>
          <div className="filter-checks">
            {groupSections.map((section) => (
              <label className={filters.groupSections.includes(section) ? 'is-checked' : ''} key={section}>
                <input type="checkbox" checked={filters.groupSections.includes(section)} onChange={() => toggleListValue('groupSections', section)} />
                {section}
              </label>
            ))}
          </div>
          <p>Seleccionar SA acepta tanto 7SA como 8SA y permite mezclar semestres.</p>
        </div>

        <div className="filter-card">
          <h3><InfoIcon name="calendar" /> Días libres</h3>
          <div className="filter-checks day-filter-checks">
            {days.map(([value, label]) => (
              <label className={filters.freeDays.includes(value) ? 'is-checked' : ''} key={value}>
                <input type="checkbox" checked={filters.freeDays.includes(value)} onChange={() => toggleListValue('freeDays', value)} />
                {label}
              </label>
            ))}
          </div>
          <p>Los grupos con clases en esos días quedarán fuera.</p>
        </div>

        <div className="filter-card">
          <h3><InfoIcon name="user" /> Profesor preferido</h3>
          <label>Priorizar grupos de<select value={filters.preferredTeacher} onChange={(event) => update('preferredTeacher', event.target.value)}><option value="">Sin preferencia</option>{professors.map((professor) => <option key={professor} value={professor}>{professor}</option>)}</select></label>
          <p>Solo fija al profesor en las materias que realmente imparte.</p>
        </div>

        <div className="filter-card">
          <h3><InfoIcon name="user" /> Profesores excluidos</h3>
          <div className="teacher-exclusions">
            {professors.map((professor) => (
              <label key={professor}>
                <input type="checkbox" checked={filters.excludedTeachers.includes(professor)} onChange={() => toggleListValue('excludedTeachers', professor)} />
                <span>{professor}</span>
              </label>
            ))}
          </div>
          <label className="unassigned-filter"><input type="checkbox" checked={filters.excludeUnassigned} onChange={(event) => update('excludeUnassigned', event.target.checked)} /> Excluir grupos sin profesor asignado</label>
        </div>
      </div>

      <section className="pinned-groups-panel" aria-labelledby="pinned-groups-heading">
        <div className="pinned-panel-heading">
          <span><InfoIcon name="calendar" /><strong id="pinned-groups-heading">Fijar materias en grupos y horarios</strong></span>
          <small>{pinnedSubjectCount > 0 ? `${pinnedSubjectCount} materias fijadas` : 'Opcional'}</small>
        </div>
        <p className="pinned-help">Selecciona una opción para fijar la materia en esos días y horas. Puedes fijar todas las materias que quieras. Si eliges varias opciones de una misma materia, cualquiera de ellas será aceptada.</p>
        {selectedSubjects.length === 0 && <p>Primero selecciona materias en el catálogo.</p>}
        <div className="pinned-subjects">
          {selectedSubjects.map((subject) => {
            const selectedGroups = filters.allowedGroupIds[subject.id] ?? []
            return (
              <article className={`pinned-subject${selectedGroups.length > 0 ? ' has-pinned-groups' : ''}`} key={subject.id}>
                <header>
                  <div><strong>{subject.nombre}</strong><span>{subject.clave}</span></div>
                  {selectedGroups.length > 0 && (
                    <button type="button" className="text-button danger" onClick={() => clearSubjectGroups(subject.id)}>Quitar fijación</button>
                  )}
                </header>
                <div className="group-choice-list">
                  {subject.grupos.map((group) => {
                    const checked = selectedGroups.includes(group.id)
                    return (
                      <label className={checked ? 'is-checked' : ''} key={group.id}>
                        <input type="checkbox" checked={checked} onChange={() => toggleGroup(subject.id, group.id)} />
                        <strong>Grupo {group.grupo}</strong>
                        <span className="group-session-list">
                          {group.sesiones.map((session) => (
                            <span key={`${session.dia}-${session.inicio}-${session.fin}`}>
                              {dayNames[session.dia]} <b>{session.inicio}-{session.fin}</b>
                            </span>
                          ))}
                        </span>
                        <small>{group.docente || 'Profesor por asignar'}</small>
                      </label>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <div className={`filter-result${combinations === 0 ? ' has-warning' : ''}`} aria-live="polite">
        <strong>{combinations.toLocaleString('es-MX')}</strong>
        <span>combinaciones cumplen los filtros antes de revisar cruces entre materias</span>
      </div>
    </section>
  )
}

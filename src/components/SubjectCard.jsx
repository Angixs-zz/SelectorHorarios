export function SubjectCard({ subject, selected, onToggle }) {
  return (
    <article className={`subject-card${selected ? ' is-selected' : ''}`}>
      <label className="subject-main">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(subject.id)}
        />
        <span>
          <span className="subject-key">{subject.clave}</span>
          <strong>{subject.nombre}</strong>
        </span>
      </label>
      <div className="subject-meta">
        <span>{subject.creditos} créditos</span>
        <span>{subject.grupos.length} grupos</span>
      </div>
      <details>
        <summary>Consultar grupos disponibles</summary>
        <div className="group-list">
          {subject.grupos.map((group) => (
            <div key={group.id} className="group-detail">
              <strong>{group.grupo}</strong>
              <span>
                {group.sesiones.map((session) =>
                  `${session.dia} ${session.inicio}-${session.fin}`,
                ).join(' · ')}
              </span>
            </div>
          ))}
        </div>
      </details>
    </article>
  )
}

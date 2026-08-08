import { InfoIcon } from './InfoIcon.jsx'
import { getSubjectTone } from '../utils/subjectTone.js'

export function SubjectCard({ subject, selected, onToggle, onEdit }) {
  const semesters = [...new Set(subject.grupos.map((group) => group.grupo.match(/^\d+/)?.[0]).filter(Boolean))]

  return (
    <article className={`subject-card subject-identity-tone-${getSubjectTone(subject.id)}${selected ? ' is-selected' : ''}`}>
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
        {semesters.length > 0 && <span>{semesters.join('° / ')}° semestre</span>}
        <button type="button" className="text-button icon-button" onClick={() => onEdit(subject)}><InfoIcon name="edit" /> Editar</button>
      </div>
      <details>
        <summary>Consultar grupos disponibles</summary>
        <div className="group-list">
          {subject.grupos.map((group) => (
            <div key={group.id} className="group-detail">
              <strong>Grupo {group.grupo}</strong>
              <span className="detail-line"><InfoIcon name="user" /> {group.docente || 'Profesor por asignar'}</span>
              <span className="detail-line"><InfoIcon name="clock" /> {group.sesiones.map((session) => `${session.dia} ${session.inicio}-${session.fin}`).join(' · ')}</span>
              <span className="detail-line"><InfoIcon name="room" /> {[...new Set(group.sesiones.map((session) => session.aula || 'Aula por asignar'))].join(', ')}</span>
            </div>
          ))}
        </div>
      </details>
    </article>
  )
}

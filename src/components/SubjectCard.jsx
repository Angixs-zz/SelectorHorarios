import { InfoIcon } from './InfoIcon.jsx'
import { getSubjectTone } from '../utils/subjectTone.js'
import { getGroupLabel, getGroupStatusLabel, isProvisionalGroup, PROVISIONAL_NOTICE } from '../utils/offerMetadata.js'

export function SubjectCard({ subject, selected, onToggle, onEdit }) {
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
        {subject.semestreCurricular && <span>{subject.semestreCurricular}° semestre curricular</span>}
        <button type="button" className="text-button icon-button" onClick={() => onEdit(subject)}><InfoIcon name="edit" /> Editar</button>
      </div>
      <details>
        <summary>Consultar grupos disponibles</summary>
        <div className="group-list">
          {subject.grupos.map((group) => (
            <div key={group.id} className={`group-detail${isProvisionalGroup(group) ? ' is-provisional' : ''}`}>
              <strong>{getGroupLabel(group)}</strong>
              <span className={`status-badge ${group.estado}`}>{getGroupStatusLabel(group)}</span>
              {isProvisionalGroup(group) && <span className="provisional-copy">{PROVISIONAL_NOTICE}</span>}
              {group.nota && <span className="provisional-copy">{group.nota}</span>}
              <span className="detail-line"><InfoIcon name="user" /> {group.docente || 'Docente por confirmar'}</span>
              <span className="detail-line"><InfoIcon name="clock" /> {group.sesiones.map((session) => `${session.dia} ${session.inicio}-${session.fin}`).join(' · ')}</span>
              <span className="detail-line"><InfoIcon name="room" /> {[...new Set(group.sesiones.map((session) => session.aula || 'Aula por confirmar'))].join(', ')}</span>
            </div>
          ))}
        </div>
      </details>
    </article>
  )
}

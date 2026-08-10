import { useState } from 'react'
import { sessionsConflict } from '../utils/conflictUtils.js'
import { blocksToSessions, sessionsToBlocks } from '../utils/sessionBlockUtils.js'
import { timeToMinutes } from '../utils/timeUtils.js'
import { InfoIcon } from './InfoIcon.jsx'

const days = [
  ['lunes', 'Lunes'],
  ['martes', 'Martes'],
  ['miercoles', 'Miércoles'],
  ['jueves', 'Jueves'],
  ['viernes', 'Viernes'],
]

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
const newTimeBlock = () => ({ id: createId(), dias: [], inicio: '07:00', fin: '08:00', aula: '' })
const newGroup = () => ({ id: createId(), grupo: '', semestreAdministrativo: '', estado: 'oficial', docente: '', nota: null, sesiones: [newTimeBlock()] })
const emptySubject = () => ({ id: createId(), clave: '', nombre: '', creditos: 0, semestreCurricular: 7, tipo: 'materia', nota: null, grupos: [newGroup()] })

function copySubject(subject) {
  if (!subject) return emptySubject()
  return {
    ...subject,
    creditos: subject.creditos ?? '',
    semestreCurricular: subject.semestreCurricular ?? '',
    grupos: subject.grupos.map((group) => ({
      ...group,
      grupo: group.grupo ?? '',
      semestreAdministrativo: group.semestreAdministrativo ?? '',
      docente: group.docente ?? '',
      sesiones: sessionsToBlocks(group.sesiones, createId),
    })),
  }
}

export function SubjectEditor({ subject, subjects, onSave, onCancel, onDelete }) {
  const [draft, setDraft] = useState(() => copySubject(subject))
  const [error, setError] = useState('')

  const updateSubject = (field, value) => setDraft((current) => ({ ...current, [field]: value }))

  const updateGroup = (groupId, field, value) => {
    setDraft((current) => ({
      ...current,
      grupos: current.grupos.map((group) => group.id === groupId ? { ...group, [field]: value } : group),
    }))
  }

  const updateSession = (groupId, sessionId, field, value) => {
    setDraft((current) => ({
      ...current,
      grupos: current.grupos.map((group) => group.id === groupId ? {
        ...group,
        sesiones: group.sesiones.map((session) =>
          session.id === sessionId ? { ...session, [field]: value } : session,
        ),
      } : group),
    }))
  }

  const removeGroup = (groupId) => {
    setDraft((current) => ({ ...current, grupos: current.grupos.filter((group) => group.id !== groupId) }))
  }

  const removeSession = (groupId, sessionId) => {
    setDraft((current) => ({
      ...current,
      grupos: current.grupos.map((group) => group.id === groupId ? {
        ...group,
        sesiones: group.sesiones.filter((session) => session.id !== sessionId),
      } : group),
    }))
  }

  const toggleDay = (groupId, sessionId, day) => {
    const session = draft.grupos.find((group) => group.id === groupId)?.sesiones.find((current) => current.id === sessionId)
    if (!session) return
    const nextDays = session.dias.includes(day)
      ? session.dias.filter((current) => current !== day)
      : [...session.dias, day]
    updateSession(groupId, sessionId, 'dias', nextDays)
  }

  const submit = (event) => {
    event.preventDefault()
    const normalizedKey = draft.clave.trim().toUpperCase()
    const expandedGroups = draft.grupos.map((group) => ({ ...group, sesiones: blocksToSessions(group.sesiones) }))
    const invalidSession = draft.grupos.some((group) => group.sesiones.some((session) =>
      timeToMinutes(session.inicio) >= timeToMinutes(session.fin),
    ))
    const overlappingSessions = expandedGroups.some((group) => group.sesiones.some((session, index) =>
      group.sesiones.slice(index + 1).some((otherSession) => sessionsConflict(session, otherSession)),
    ))

    if (subjects.some((current) => current.id !== draft.id && current.clave.toUpperCase() === normalizedKey)) {
      setError('Ya existe una materia con esa clave.')
      return
    }
    if (draft.grupos.length === 0 || draft.grupos.some((group) => group.sesiones.length === 0 || group.sesiones.some((session) => session.dias.length === 0))) {
      setError('Cada grupo necesita al menos un bloque horario con uno o más días seleccionados.')
      return
    }
    const namedGroups = draft.grupos.map((group) => group.grupo.trim().toLowerCase()).filter(Boolean)
    if (new Set(namedGroups).size !== namedGroups.length) {
      setError('No puede haber dos grupos con el mismo nombre en una materia.')
      return
    }
    if (invalidSession) {
      setError('La hora de término debe ser posterior a la hora de inicio.')
      return
    }
    if (overlappingSessions) {
      setError('Un mismo grupo no puede tener sesiones traslapadas.')
      return
    }

    onSave({
      ...draft,
      clave: normalizedKey,
      nombre: draft.nombre.trim(),
      creditos: Number(draft.creditos),
      semestreCurricular: Number(draft.semestreCurricular),
      grupos: draft.grupos.map((group) => ({
        ...group,
        grupo: group.grupo.trim().toUpperCase() || null,
        semestreAdministrativo: Number(group.semestreAdministrativo) || null,
        docente: group.docente.trim() || null,
        sesiones: blocksToSessions(group.sesiones),
      })),
    })
  }

  return (
    <section className="panel editor-panel" aria-labelledby="editor-heading">
      <div className="section-heading">
        <div>
          <p className="step-label">Catálogo académico</p>
          <h2 id="editor-heading">{subject ? 'Editar materia y grupos' : 'Agregar materia'}</h2>
        </div>
        <button type="button" className="button ghost" onClick={onCancel}>Cancelar</button>
      </div>

      <form onSubmit={submit}>
        <div className="subject-fields">
          <label>Clave<input required value={draft.clave} onChange={(event) => updateSubject('clave', event.target.value)} placeholder="Ej. AEB1055" /></label>
          <label>Nombre de la materia<input required value={draft.nombre} onChange={(event) => updateSubject('nombre', event.target.value)} /></label>
          <label>Créditos<input required min="0" type="number" value={draft.creditos} onChange={(event) => updateSubject('creditos', event.target.value)} /></label>
          <label>Semestre curricular<input required min="1" type="number" value={draft.semestreCurricular} onChange={(event) => updateSubject('semestreCurricular', event.target.value)} /></label>
        </div>

        <div className="editor-heading-row">
          <h3>Grupos ofertados</h3>
          <button type="button" className="button ghost small icon-button" onClick={() => setDraft((current) => ({ ...current, grupos: [...current.grupos, newGroup()] }))}><InfoIcon name="plus" /> Agregar grupo</button>
        </div>

        <div className="editable-groups">
          {draft.grupos.map((group, groupIndex) => (
            <fieldset className="group-editor" key={group.id}>
              <legend>Grupo {groupIndex + 1}</legend>
              <div className="group-fields">
                <label>Grupo administrativo<input value={group.grupo} onChange={(event) => updateGroup(group.id, 'grupo', event.target.value)} placeholder="Ej. 8SA o pendiente" /></label>
                <label>Semestre administrativo<input min="1" type="number" value={group.semestreAdministrativo} onChange={(event) => updateGroup(group.id, 'semestreAdministrativo', event.target.value)} placeholder="Pendiente" /></label>
                <label>Estado<select value={group.estado} onChange={(event) => updateGroup(group.id, 'estado', event.target.value)}><option value="oficial">Publicado</option><option value="por-verificar">Publicado, por verificar</option><option value="provisional">Provisional</option></select></label>
                <label><span className="label-with-icon"><InfoIcon name="user" /> Docente</span><input value={group.docente} onChange={(event) => updateGroup(group.id, 'docente', event.target.value)} placeholder="Por confirmar" /></label>
                <button type="button" className="text-button danger icon-button" onClick={() => removeGroup(group.id)}><InfoIcon name="trash" /> Eliminar grupo</button>
              </div>

              <div className="session-list">
                {group.sesiones.map((session, sessionIndex) => (
                  <div className="session-row" key={session.id}>
                    <div className="time-block-title"><InfoIcon name="calendar" /><strong>Bloque horario {sessionIndex + 1}</strong></div>
                    <fieldset className="day-picker">
                      <legend>Días de clase</legend>
                      {days.map(([value, label]) => (
                        <label className={session.dias.includes(value) ? 'is-checked' : ''} key={value}>
                          <input type="checkbox" checked={session.dias.includes(value)} onChange={() => toggleDay(group.id, session.id, value)} />
                          {label.slice(0, 3)}
                        </label>
                      ))}
                    </fieldset>
                    <div className="time-fields">
                      <label><span className="label-with-icon"><InfoIcon name="clock" /> Inicio</span><input required type="time" value={session.inicio} onChange={(event) => updateSession(group.id, session.id, 'inicio', event.target.value)} /></label>
                      <label><span className="label-with-icon"><InfoIcon name="clock" /> Fin</span><input required type="time" value={session.fin} onChange={(event) => updateSession(group.id, session.id, 'fin', event.target.value)} /></label>
                      <label><span className="label-with-icon"><InfoIcon name="room" /> Aula</span><input value={session.aula} onChange={(event) => updateSession(group.id, session.id, 'aula', event.target.value)} placeholder="Por asignar" /></label>
                    </div>
                    <button type="button" className="text-button danger icon-button" onClick={() => removeSession(group.id, session.id)}><InfoIcon name="trash" /> Quitar bloque</button>
                  </div>
                ))}
              </div>
              <button type="button" className="text-button icon-button" onClick={() => updateGroup(group.id, 'sesiones', [...group.sesiones, newTimeBlock()])}><InfoIcon name="plus" /> Agregar otro horario</button>
            </fieldset>
          ))}
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="editor-actions">
          {subject && <button type="button" className="button danger icon-button" onClick={onDelete}><InfoIcon name="trash" /> Eliminar materia</button>}
          <button type="submit" className="button primary">Guardar materia</button>
        </div>
      </form>
    </section>
  )
}

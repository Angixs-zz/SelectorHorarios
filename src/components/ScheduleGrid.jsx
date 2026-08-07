import { minutesToTime, timeToMinutes } from '../utils/timeUtils.js'
import { InfoIcon } from './InfoIcon.jsx'

const weekDays = [
  ['lunes', 'Lunes'],
  ['martes', 'Martes'],
  ['miercoles', 'Miércoles'],
  ['jueves', 'Jueves'],
  ['viernes', 'Viernes'],
]

const pixelsPerMinute = 1.5

export function ScheduleGrid({ schedule }) {
  const sessions = schedule.flatMap((entry, subjectIndex) =>
    entry.grupo.sesiones.map((session) => ({ ...session, ...entry, subjectIndex })),
  )
  const visibleDays = weekDays
  const earliest = Math.floor(Math.min(...sessions.map((session) => timeToMinutes(session.inicio))) / 60) * 60
  const latest = Math.ceil(Math.max(...sessions.map((session) => timeToMinutes(session.fin))) / 60) * 60
  const timelineHeight = (latest - earliest) * pixelsPerMinute
  const hourMarks = []

  for (let minute = earliest; minute <= latest; minute += 60) {
    hourMarks.push(minute)
  }

  return (
    <section className="schedule-view" aria-label="Vista semanal del horario">
      <div className="schedule-scroll">
        <div className="weekly-grid" style={{ '--day-count': visibleDays.length }}>
          <div className="grid-corner">Hora</div>
          {visibleDays.map(([, label]) => <div className="day-heading" key={label}>{label}</div>)}

          <div className="time-axis" style={{ height: timelineHeight }}>
            {hourMarks.map((minute) => (
              <span key={minute} style={{ top: (minute - earliest) * pixelsPerMinute }}>{minutesToTime(minute)}</span>
            ))}
          </div>

          {visibleDays.map(([day]) => (
            <div className="day-column" key={day} style={{ height: timelineHeight }}>
              {hourMarks.map((minute) => (
                <span className="hour-line" key={minute} style={{ top: (minute - earliest) * pixelsPerMinute }} />
              ))}
              {sessions.filter((session) => session.dia === day).map((session) => (
                <article
                  className={`class-block subject-tone-${session.subjectIndex % 6}`}
                  key={`${session.materia.id}-${session.grupo.id}-${session.inicio}`}
                  style={{
                    top: (timeToMinutes(session.inicio) - earliest) * pixelsPerMinute + 4,
                    height: Math.max((timeToMinutes(session.fin) - timeToMinutes(session.inicio)) * pixelsPerMinute - 8, 34),
                  }}
                >
                  <header className="class-block-heading">
                    <strong>{session.materia.nombre}</strong>
                    <span>Grupo {session.grupo.grupo}</span>
                  </header>
                  <span className="detail-line class-professor" title={session.grupo.docente || 'Profesor por asignar'}><InfoIcon name="user" /><span className="professor-name">{session.grupo.docente || 'Profesor por asignar'}</span></span>
                  <div className="class-block-meta">
                    <span className="detail-line"><InfoIcon name="clock" /> {session.inicio}-{session.fin}</span>
                    <span className="detail-line"><InfoIcon name="room" /> {session.aula || 'Aula por asignar'}</span>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

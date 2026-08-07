import { minutesToTime, timeToMinutes } from '../utils/timeUtils.js'

const weekDays = [
  ['lunes', 'Lunes'],
  ['martes', 'Martes'],
  ['miercoles', 'Miércoles'],
  ['jueves', 'Jueves'],
  ['viernes', 'Viernes'],
  ['sabado', 'Sábado'],
]

const pixelsPerMinute = 1

export function ScheduleGrid({ schedule }) {
  const sessions = schedule.flatMap((entry, subjectIndex) =>
    entry.grupo.sesiones.map((session) => ({ ...session, ...entry, subjectIndex })),
  )
  const hasSaturday = sessions.some((session) => session.dia === 'sabado')
  const visibleDays = hasSaturday ? weekDays : weekDays.slice(0, 5)
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
              <span key={minute} style={{ top: minute - earliest }}>{minutesToTime(minute)}</span>
            ))}
          </div>

          {visibleDays.map(([day]) => (
            <div className="day-column" key={day} style={{ height: timelineHeight }}>
              {hourMarks.map((minute) => (
                <span className="hour-line" key={minute} style={{ top: minute - earliest }} />
              ))}
              {sessions.filter((session) => session.dia === day).map((session) => (
                <article
                  className={`class-block subject-tone-${session.subjectIndex % 6}`}
                  key={`${session.materia.id}-${session.grupo.id}-${session.inicio}`}
                  style={{
                    top: timeToMinutes(session.inicio) - earliest,
                    height: timeToMinutes(session.fin) - timeToMinutes(session.inicio),
                  }}
                >
                  <strong>{session.materia.nombre}</strong>
                  <span>Grupo {session.grupo.grupo}</span>
                  <span>{session.inicio}-{session.fin}</span>
                  <span>Aula: {session.aula || 'Por asignar'}</span>
                  {session.grupo.docente && <span>{session.grupo.docente}</span>}
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { InfoIcon } from './InfoIcon.jsx'

const dayNames = {
  lunes: 'Lun',
  martes: 'Mar',
  miercoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie',
}

export function ScheduleSummary({ schedule }) {
  return (
    <section className="summary-section" aria-labelledby="summary-heading">
      <h3 id="summary-heading">Resumen del horario</h3>
      <div className="summary-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Clave</th>
              <th>Materia</th>
              <th>Grupo</th>
              <th>Docente</th>
              <th>Créditos</th>
              <th>Sesiones</th>
              <th>Aula</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map(({ materia, grupo }) => (
              <tr key={materia.id}>
                <td><strong>{materia.clave}</strong></td>
                <td>{materia.nombre}</td>
                <td>{grupo.grupo}</td>
                <td><span className="detail-line"><InfoIcon name="user" /> {grupo.docente || 'Por asignar'}</span></td>
                <td>{materia.creditos}</td>
                <td><span className="detail-line"><InfoIcon name="clock" />
                  {grupo.sesiones.map((session) =>
                    `${dayNames[session.dia]} ${session.inicio}-${session.fin}`,
                  ).join(' · ')}
                </span></td>
                <td><span className="detail-line"><InfoIcon name="room" /> {[...new Set(grupo.sesiones.map((session) => session.aula || 'Por asignar'))].join(', ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

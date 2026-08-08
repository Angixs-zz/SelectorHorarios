export function AcademicPeriodSelector({ periods, activePeriodId, onChange, onCreate, onDelete }) {
  return (
    <section className="period-panel" aria-labelledby="period-heading">
      <div>
        <p className="step-label">Oferta académica</p>
        <h2 id="period-heading">Periodo de horarios</h2>
        <p>Cada periodo conserva sus propias materias, grupos, docentes y horas.</p>
      </div>
      <div className="period-controls">
        <label>
          Periodo activo
          <select value={activePeriodId} onChange={(event) => onChange(event.target.value)}>
            {periods.map((period) => <option key={period.id} value={period.id}>{period.label}</option>)}
          </select>
        </label>
        <button type="button" className="button secondary" onClick={() => onCreate(true)}>Duplicar periodo</button>
        <button type="button" className="button ghost" onClick={() => onCreate(false)}>Crear vacío</button>
        <button type="button" className="button danger" onClick={onDelete} disabled={periods.length === 1}>Eliminar</button>
      </div>
    </section>
  )
}

import { InfoIcon } from './InfoIcon.jsx'

export function ScheduleNavigator({ currentIndex, total, onChange, onExport, isExporting }) {
  const goToInput = (event) => {
    const requested = Number(event.target.value)
    if (Number.isInteger(requested) && requested >= 1 && requested <= total) {
      onChange(requested - 1)
    }
  }

  return (
    <nav className="schedule-navigator" aria-label="Navegación de horarios">
      <div>
        <p className="step-label">03 · Horario generado</p>
        <h2>Horario {currentIndex + 1} de {total}</h2>
      </div>
      <div className="navigation-controls">
        <button
          type="button"
          className="button ghost"
          onClick={() => onChange(0)}
          disabled={currentIndex === 0}
        >
          Primero
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() => onChange(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          Anterior
        </button>
        <label className="schedule-jump">
          <span>Ir al horario</span>
          <input
            type="number"
            min="1"
            max={total}
            value={currentIndex + 1}
            onChange={goToInput}
          />
        </label>
        <button
          type="button"
          className="button secondary"
          onClick={() => onChange(currentIndex + 1)}
          disabled={currentIndex === total - 1}
        >
          Siguiente
        </button>
        <button
          type="button"
          className="button ghost"
          onClick={() => onChange(total - 1)}
          disabled={currentIndex === total - 1}
        >
          Último
        </button>
        <button type="button" className="button export icon-button" onClick={onExport} disabled={isExporting}>
          <InfoIcon name="download" /> {isExporting ? 'Preparando…' : 'Exportar PDF'}
        </button>
      </div>
    </nav>
  )
}

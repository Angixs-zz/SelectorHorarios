import { useMemo, useState } from 'react'
import { InfoIcon } from './InfoIcon.jsx'
import { getSubjectTone } from '../utils/subjectTone.js'
import { getGroupLabel, isProvisionalGroup } from '../utils/offerMetadata.js'
import {
  analyzeSchedule,
  comparisonDayNames,
  comparisonDays,
  formatMinutes,
} from '../utils/scheduleComparisonUtils.js'

const maxPickers = 400
const maxComparedSchedules = 4

export function ScheduleComparePanel({
  schedules,
  selectedIndexes,
  currentIndex,
  onToggle,
  onClear,
  onView,
}) {
  const [draftIndex, setDraftIndex] = useState('')

  const comparedSchedules = useMemo(
    () => [...selectedIndexes]
      .sort((a, b) => a - b)
      .filter((index) => index >= 0 && index < schedules.length)
      .map((index) => ({ index, analysis: analyzeSchedule(schedules[index]) })),
    [selectedIndexes, schedules],
  )

  const visibleSchedules = schedules.length <= maxPickers ? schedules : schedules.slice(0, maxPickers)
  const hiddenCount = schedules.length - visibleSchedules.length
  const isAtLimit = selectedIndexes.size >= maxComparedSchedules

  const addDraft = () => {
    const requested = Number(draftIndex)
    if (Number.isInteger(requested) && requested >= 1 && requested <= schedules.length) {
      onToggle(requested - 1)
    }
    setDraftIndex('')
  }

  return (
    <section className="results-panel compare-panel" id="schedule-compare" aria-labelledby="compare-heading">
      <div className="section-heading">
        <div>
          <p className="step-label">04 · Comparación de horarios</p>
          <h2 id="compare-heading">Comparar horarios</h2>
        </div>
        <div className="compact-actions">
          <button
            type="button"
            className="button ghost small"
            onClick={onClear}
            disabled={selectedIndexes.size === 0}
          >
            Limpiar
          </button>
        </div>
      </div>

      <p className="compare-hint">
        Marca entre dos y cuatro horarios para analizar lado a lado sus entradas, salidas, materias
        y horas libres de cada jornada.
      </p>

      <div className="compare-picker">
        <label className="compare-adder">
          <span>Agregar por número</span>
          <input
            type="number"
            min="1"
            max={schedules.length}
            placeholder="Nº"
            value={draftIndex}
            onChange={(event) => setDraftIndex(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addDraft()
              }
            }}
          />
        </label>
        <button type="button" className="button secondary small" onClick={addDraft} disabled={!draftIndex}>
          Agregar
        </button>

        <div className="compare-pill-list">
          {visibleSchedules.map((_, index) => {
            const isSelected = selectedIndexes.has(index)
            return (
              <label
                className={`compare-pill${isSelected ? ' is-checked' : ''}${index === currentIndex ? ' is-current' : ''}`}
                key={index}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={!isSelected && isAtLimit}
                  onChange={() => onToggle(index)}
                />
                <span>Horario {index + 1}</span>
              </label>
            )
          })}
          {hiddenCount > 0 && (
            <span className="compare-more">
              +{hiddenCount} más, usa el campo para agregarlos por número
            </span>
          )}
        </div>
      </div>

      <p className="compare-count" aria-live="polite">
        {selectedIndexes.size} de {maxComparedSchedules} horarios seleccionados
        {isAtLimit ? ' · Quita uno para elegir otro.' : ''}
      </p>

      {comparedSchedules.length === 0 && (
        <p className="compare-empty">Selecciona al menos un horario para empezar a comparar.</p>
      )}

      {comparedSchedules.length === 1 && (
        <p className="compare-empty">
          Tienes <strong>Horario {comparedSchedules[0].index + 1}</strong> seleccionado. Marca al menos
          otro para ver la comparación.
        </p>
      )}

      {comparedSchedules.length >= 2 && (
        <ComparisonView schedules={comparedSchedules} onView={onView} onRemove={onToggle} />
      )}
    </section>
  )
}

function ComparisonView({ schedules, onView, onRemove }) {
  return (
    <>
      <div className="compare-cards">
        {schedules.map(({ index, analysis }) => (
          <article className="compare-card" key={index}>
            <div className="compare-card-header">
              <strong>Horario {index + 1}</strong>
              <div className="compare-card-actions">
                <button type="button" className="text-button" onClick={() => onView(index)}>Ver</button>
                <button type="button" className="text-button danger" onClick={() => onRemove(index)}>Quitar</button>
              </div>
            </div>
            <dl className="compare-card-metrics">
              {analysis.hasProvisionalData && <div className="compare-provisional"><dt>Estado</dt><dd>Contiene información provisional</dd></div>}
              <div>
                <dt>Hora de entrada</dt>
                <dd>{analysis.entryTime ?? '—'}</dd>
              </div>
              <div>
                <dt>Hora de salida</dt>
                <dd>{analysis.exitTime ?? '—'}</dd>
              </div>
              <div>
                <dt>Días con clase</dt>
                <dd>{analysis.daysWithClass}</dd>
              </div>
              <div>
                <dt>Horas de clase</dt>
                <dd>{formatMinutes(analysis.totalClassMinutes)}</dd>
              </div>
              <div>
                <dt>Horas libres</dt>
                <dd>{formatMinutes(analysis.totalFreeMinutes)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="summary-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Día</th>
              {schedules.map(({ index }) => (
                <th key={index}>Horario {index + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonDays.map((day) => (
              <tr key={day}>
                <th className="compare-day" scope="row">{comparisonDayNames[day]}</th>
                {schedules.map(({ index, analysis }) => {
                  const dayData = analysis.daysData[day]
                  return (
                    <td key={`${index}-${day}`} className="compare-day-cell">
                      {!dayData.hasClass ? (
                        <span className="compare-muted">Sin clases</span>
                      ) : (
                        <>
                          <div className="compare-entry">
                            <InfoIcon name="clock" />
                            Entrada {dayData.entryTime} · Salida {dayData.exitTime}
                          </div>
                          <ul className="compare-subjects">
                            {dayData.sessions.map((session) => (
                              <li
                                className={`subject-tone-${getSubjectTone(session.materia.id)}`}
                                key={`${session.materia.id}-${session.grupo.id}-${session.inicio}`}
                              >
                                <span className="compare-range">{session.inicio}–{session.fin}</span>
                                <span className="compare-subject-name">{session.materia.nombre}</span>
                                <span className={`compare-group-tag${isProvisionalGroup(session.grupo) ? ' is-provisional' : ''}`}>{getGroupLabel(session.grupo)}</span>
                              </li>
                            ))}
                          </ul>
                          <p className={`compare-free${dayData.freePeriods.length === 0 ? ' is-none' : ''}`}>
                            {dayData.freePeriods.length > 0
                              ? `Libres: ${dayData.freePeriods.map((period) => `${period.inicio}–${period.fin}`).join(', ')}`
                              : 'Sin horas libres'}
                          </p>
                        </>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

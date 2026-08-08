export function GenerationStats({ result }) {
  const stats = [
    ['Materias utilizadas', result.subjectCount],
    ['Créditos totales', result.totalCredits],
    ['Combinaciones teóricas', result.theoreticalCombinations.toLocaleString('es-MX')],
    ['Combinaciones completas evaluadas', result.completeCombinationsEvaluated.toLocaleString('es-MX')],
    ['Horarios válidos encontrados', result.schedules.length.toLocaleString('es-MX')],
    ['Ramas descartadas por empalme', result.prunedBranches.toLocaleString('es-MX')],
    ['Tiempo aproximado', `${result.elapsedMs.toFixed(2)} ms`],
  ]

  if (result.freeTimeFilterApplied) {
    stats.splice(5, 0, ['Horarios antes del filtro de horas libres', result.schedulesBeforeFreeTimeFilter.toLocaleString('es-MX')])
  }

  return (
    <section className="stats-section" aria-labelledby="stats-heading">
      <div className="section-heading">
        <div>
          <p className="step-label">02 · Resultado del cálculo</p>
          <h2 id="stats-heading">Estadísticas de generación</h2>
        </div>
      </div>
      <div className="stats-grid">
        {stats.map(([label, value]) => (
          <div className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

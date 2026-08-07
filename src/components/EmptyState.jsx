export function EmptyState({ noResults = false }) {
  return (
    <section className="empty-state" role="status">
      <span aria-hidden="true">{noResults ? '0' : '→'}</span>
      <div>
        <h2>{noResults ? 'Sin combinaciones compatibles' : 'Prepara tu horario'}</h2>
        <p>
          {noResults
            ? 'No se encontraron horarios sin empalmes con las materias seleccionadas.'
            : 'Selecciona las materias que deseas cursar y presiona Generar horarios.'}
        </p>
      </div>
    </section>
  )
}

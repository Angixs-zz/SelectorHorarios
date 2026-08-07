export function sessionsToBlocks(sessions, createId) {
  const blocks = new Map()

  sessions.forEach((session) => {
    const key = `${session.inicio}|${session.fin}|${session.aula ?? ''}`
    const block = blocks.get(key) ?? {
      id: createId(),
      dias: [],
      inicio: session.inicio,
      fin: session.fin,
      aula: session.aula ?? '',
    }
    block.dias.push(session.dia)
    blocks.set(key, block)
  })

  return [...blocks.values()]
}

export function blocksToSessions(blocks) {
  return blocks.flatMap(({ id, dias, ...block }) =>
    dias.map((dia) => ({ ...block, dia })),
  )
}

import { timeToMinutes } from '../utils/timeUtils.js'
import { getGroupLabel, getScheduleWarnings } from '../utils/offerMetadata.js'

const days = [
  ['lunes', 'Lunes'],
  ['martes', 'Martes'],
  ['miercoles', 'Miércoles'],
  ['jueves', 'Jueves'],
  ['viernes', 'Viernes'],
]

const colors = [
  { fill: [219, 232, 232], border: [40, 93, 102] },
  { fill: [243, 226, 213], border: [189, 117, 77] },
  { fill: [231, 227, 239], border: [128, 116, 155] },
  { fill: [230, 236, 216], border: [129, 149, 89] },
  { fill: [228, 232, 239], border: [105, 126, 155] },
  { fill: [240, 228, 228], border: [162, 108, 114] },
]

function fitText(doc, text, maxWidth) {
  if (doc.getTextWidth(text) <= maxWidth) return text
  let shortened = text
  while (shortened.length > 1 && doc.getTextWidth(`${shortened}…`) > maxWidth) {
    shortened = shortened.slice(0, -1)
  }
  return `${shortened}…`
}

export async function exportSchedulePdf(schedule, scheduleNumber) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const sessions = schedule.flatMap((entry, subjectIndex) =>
    entry.grupo.sesiones.map((session) => ({ ...session, ...entry, subjectIndex })),
  )
  const earliest = Math.floor(Math.min(...sessions.map((session) => timeToMinutes(session.inicio))) / 60) * 60
  const latest = Math.ceil(Math.max(...sessions.map((session) => timeToMinutes(session.fin))) / 60) * 60
  const startX = 10
  const startY = 29
  const gridWidth = pageWidth - 20
  const gridHeight = 158
  const timeWidth = 19
  const dayWidth = (gridWidth - timeWidth) / days.length
  const minuteHeight = gridHeight / (latest - earliest)
  const warnings = getScheduleWarnings(schedule)

  doc.setProperties({ title: `Horario ${scheduleNumber}`, subject: 'Horario escolar generado' })
  doc.setFillColor(22, 50, 79)
  doc.rect(0, 0, pageWidth, 21, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.text(`HORARIO ESCOLAR · OPCIÓN ${scheduleNumber}`, 10, 13.5)
  doc.setFontSize(8)
  doc.text(`${schedule.length} materias · Generado localmente`, pageWidth - 10, 13.5, { align: 'right' })

  doc.setFillColor(22, 50, 79)
  doc.rect(startX, startY, gridWidth, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text('HORA', startX + timeWidth / 2, startY + 6.5, { align: 'center' })
  days.forEach(([, label], index) => {
    const x = startX + timeWidth + index * dayWidth
    doc.setDrawColor(96, 120, 140)
    doc.line(x, startY, x, startY + 10)
    doc.text(label.toUpperCase(), x + dayWidth / 2, startY + 6.5, { align: 'center' })
  })

  const bodyY = startY + 10
  doc.setFillColor(250, 250, 247)
  doc.rect(startX, bodyY, gridWidth, gridHeight, 'F')
  doc.setDrawColor(205, 209, 207)
  doc.setLineWidth(0.2)
  for (let minute = earliest; minute <= latest; minute += 60) {
    const y = bodyY + (minute - earliest) * minuteHeight
    doc.line(startX, y, startX + gridWidth, y)
    if (minute < latest) {
      doc.setTextColor(70, 82, 92)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      const hour = `${String(Math.floor(minute / 60)).padStart(2, '0')}:00`
      doc.text(hour, startX + timeWidth / 2, y + 4.5, { align: 'center' })
    }
  }
  for (let index = 0; index <= days.length; index += 1) {
    const x = startX + timeWidth + index * dayWidth
    doc.line(x, bodyY, x, bodyY + gridHeight)
  }

  sessions.forEach((session) => {
    const dayIndex = days.findIndex(([day]) => day === session.dia)
    if (dayIndex < 0) return
    const x = startX + timeWidth + dayIndex * dayWidth + 1.2
    const y = bodyY + (timeToMinutes(session.inicio) - earliest) * minuteHeight + 0.8
    const width = dayWidth - 2.4
    const height = (timeToMinutes(session.fin) - timeToMinutes(session.inicio)) * minuteHeight - 1.6
    const color = colors[session.subjectIndex % colors.length]

    doc.setFillColor(...color.fill)
    doc.setDrawColor(...color.border)
    doc.setLineWidth(0.5)
    doc.roundedRect(x, y, width, height, 1.2, 1.2, 'FD')
    doc.setTextColor(21, 34, 43)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.text(fitText(doc, `${session.materia.nombre} · ${getGroupLabel(session.grupo)}`, width - 3), x + 1.5, y + 3.7)
    doc.setFontSize(5.7)
    doc.text(fitText(doc, session.grupo.docente || 'Docente por confirmar', width - 3), x + 1.5, y + 6.8)
    doc.setFont('helvetica', 'normal')
    doc.text(fitText(doc, `${session.inicio}-${session.fin} · Aula ${session.aula || 'por confirmar'}`, width - 3), x + 1.5, y + 9.8)
  })

  doc.setTextColor(90, 100, 108)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.text(warnings.length > 0
    ? `ATENCION: ${warnings.join(' ')}`
    : 'Selector de Horarios · Verifica los datos con la oferta oficial antes de inscribirte.', 10, 202)
  doc.text(`Exportado: ${new Date().toLocaleDateString('es-MX')}`, pageWidth - 10, 202, { align: 'right' })
  doc.save(`horario-opcion-${scheduleNumber}.pdf`)
}

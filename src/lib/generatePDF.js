import { jsPDF } from 'jspdf'

const PAGE_W = 215.9
const PAGE_H = 279.4
const MARGIN = 20
const CONTENT_W = PAGE_W - MARGIN * 2

// [text rgb, background rgb] for each rubric level
const LEVEL_COLORS = {
  'Excellent':    [[21,  128, 61],  [220, 252, 231]],
  'Proficient':   [[132, 22,  23],  [250, 229, 229]],
  'Developing':   [[146, 64,  14],  [254, 243, 199]],
  'Not Observed': [[107, 114, 128], [243, 244, 246]],
  'Insufficient': [[185, 28,  28],  [254, 226, 226]],
}

export function downloadSessionPDF({ client, assessmentText, interviewMessages, feedbackMessages }) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' })
  let y = MARGIN

  const checkPage = (needed = 8) => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  // === HEADER BAR ===
  doc.setFillColor(132, 22, 23)
  doc.rect(0, 0, PAGE_W, 28, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(229, 160, 160)
  doc.text('GENERALIST PRACTICE WITH INDIVIDUALS AND FAMILIES', MARGIN, 10)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Client Engagement Practice Simulator', MARGIN, 21)
  y = 36

  // Session line
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(31, 41, 55)
  doc.text(`Session Assessment — ${client.name}`, MARGIN, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text(`Printed: ${new Date().toLocaleDateString()}`, PAGE_W - MARGIN, y, { align: 'right' })
  y += 6

  // Divider
  doc.setDrawColor(224, 224, 224)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 5

  // Stats line
  const userCount = interviewMessages.filter(m => m.role === 'user').length
  const clientCount = interviewMessages.filter(m => m.role === 'assistant').length
  const feedbackCount = feedbackMessages.filter(m => m.role === 'assistant').length
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text(
    `${userCount} student responses  ·  ${clientCount} client responses  ·  ${feedbackCount} feedback exchanges`,
    MARGIN, y
  )
  y += 10

  // === ASSESSMENT RUBRIC ===
  for (const line of assessmentText.split('\n')) {
    if (!line.trim()) {
      y += 1.5
      continue
    }

    if (line.startsWith('## ')) {
      checkPage(14)
      y += 3
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      const wrapped = doc.splitTextToSize(line.slice(3), CONTENT_W)
      doc.text(wrapped, MARGIN, y)
      y += wrapped.length * 5.5
      doc.setDrawColor(200, 200, 200)
      doc.line(MARGIN, y, PAGE_W - MARGIN, y)
      y += 4

    } else if (line.startsWith('### ')) {
      checkPage(8)
      y += 2
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(132, 22, 23)
      doc.text(line.slice(4).toUpperCase(), MARGIN, y)
      y += 5

    } else if (line.startsWith('**') && line.includes('** —')) {
      checkPage(9)
      const boldEnd = line.indexOf('** —')
      const title = line.slice(2, boldEnd)
      const rest  = line.slice(boldEnd + 4).trim()
      const levelKey = Object.keys(LEVEL_COLORS).find(k => rest.includes(k))

      // Draw badge first so title renders on top if they somehow overlap
      if (levelKey) {
        const [[tr, tg, tb], [br, bg, bb]] = LEVEL_COLORS[levelKey]
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'bold')
        const badgeW = doc.getTextWidth(levelKey) + 6
        const bx = PAGE_W - MARGIN - badgeW
        doc.setFillColor(br, bg, bb)
        doc.roundedRect(bx, y - 4, badgeW, 5.5, 1.5, 1.5, 'F')
        doc.setTextColor(tr, tg, tb)
        doc.text(levelKey, bx + 3, y)
      }

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(55, 65, 81)
      const titleLines = doc.splitTextToSize(title, CONTENT_W - 32)
      doc.text(titleLines, MARGIN, y)
      y += titleLines.length * 4.2 + 1.5

    } else if (line.startsWith('- ')) {
      checkPage(6)
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(75, 85, 99)
      const bulletLines = doc.splitTextToSize(line.slice(2), CONTENT_W - 6)
      doc.text('•', MARGIN + 1, y)
      doc.text(bulletLines, MARGIN + 5, y)
      y += bulletLines.length * 3.9 + 0.5

    } else if (line.startsWith('---')) {
      y += 2
      doc.setDrawColor(224, 224, 224)
      doc.line(MARGIN, y, PAGE_W - MARGIN, y)
      y += 4

    } else {
      checkPage(8)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(75, 85, 99)
      const wrapped = doc.splitTextToSize(line, CONTENT_W)
      doc.text(wrapped, MARGIN, y)
      y += wrapped.length * 4.2 + 1
    }
  }

  // === TRANSCRIPT PAGE ===
  doc.addPage()
  y = MARGIN

  doc.setFillColor(247, 247, 247)
  doc.rect(MARGIN, y - 4, CONTENT_W, 10, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(31, 41, 55)
  doc.text('Full Session Transcript', MARGIN + 3, y + 2)
  y += 12

  const writeTranscriptSection = (label, messages) => {
    if (!messages.length) return
    checkPage(12)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(132, 22, 23)
    doc.text(label, MARGIN, y)
    y += 6

    for (const msg of messages) {
      checkPage(10)
      const isStudent = msg.role === 'user'
      const speaker = isStudent ? 'Student' : client.name

      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      if (isStudent) {
        doc.setTextColor(132, 22, 23)
      } else {
        doc.setTextColor(31, 41, 55)
      }
      doc.text(speaker + ':', MARGIN, y)
      y += 4

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(75, 85, 99)
      const contentLines = doc.splitTextToSize(msg.content, CONTENT_W - 4)
      for (const cl of contentLines) {
        checkPage(5)
        doc.text(cl, MARGIN + 4, y)
        y += 3.9
      }
      y += 2.5
    }
    y += 4
  }

  writeTranscriptSection('INTERVIEW', interviewMessages)
  writeTranscriptSection('CLIENT REFLECTION', feedbackMessages)

  const filename = `session-assessment-${client.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
  doc.save(filename)
}

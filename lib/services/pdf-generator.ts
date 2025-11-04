import jsPDF from 'jspdf'

export interface PDFOptions {
  title?: string
  brandName?: string
  creatorName?: string
}

export async function generateNDAPDF(ndaText: string, options: PDFOptions = {}): Promise<Blob> {
  const doc = new jsPDF()
  
  // Set font
  doc.setFontSize(12)
  
  // Add title if provided
  if (options.title) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(options.title, 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setY(30)
  }
  
  // Split text into lines that fit the page width
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - 2 * margin
  let yPosition = doc.getY() || margin
  
  // Split text into paragraphs
  const paragraphs = ndaText.split('\n\n')
  
  paragraphs.forEach((paragraph) => {
    if (paragraph.trim() === '') {
      yPosition += 5
      return
    }
    
    // Check if we need a new page
    if (yPosition > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
    }
    
    // Handle lines that might contain placeholders for signatures
    if (paragraph.includes('_________________') || paragraph.includes('IN WITNESS')) {
      // For signature sections, add extra space
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = margin
      }
    }
    
    // Split paragraph into lines
    const lines = doc.splitTextToSize(paragraph, maxWidth)
    
    lines.forEach((line: string) => {
      // Check if we need a new page before adding this line
      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }
      
      doc.text(line, margin, yPosition)
      yPosition += 7
    })
    
    // Add spacing between paragraphs
    yPosition += 3
  })
  
  // Generate PDF blob
  const pdfBlob = doc.output('blob')
  return pdfBlob
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}



/**
 * Export Chat to PDF with ECONEURA branding
 * Uses jsPDF library
 */

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export async function exportChatToPDF(
  messages: Message[],
  neuraName: string,
  userName: string
) {
  // Dynamic import to reduce bundle size
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Header with ECONEURA branding
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ECONEURA', margin, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Conversación con ${neuraName}`, margin, 26);

  yPosition = 45;

  // Chat info
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Usuario: ${userName}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Total mensajes: ${messages.length}`, margin, yPosition);
  yPosition += 15;

  // Messages
  doc.setTextColor(0, 0, 0);
  
  for (const message of messages) {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Role badge
    if (message.role === 'user') {
      doc.setFillColor(59, 130, 246); // blue-500
    } else {
      doc.setFillColor(16, 185, 129); // emerald-500
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const roleText = message.role === 'user' ? 'TÚ' : neuraName.toUpperCase();
    const roleWidth = doc.getTextWidth(roleText) + 6;
    doc.roundedRect(margin, yPosition - 4, roleWidth, 7, 2, 2, 'F');
    doc.text(roleText, margin + 3, yPosition);
    
    yPosition += 10;

    // Message content
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const lines = doc.splitTextToSize(message.content, maxWidth);
    
    for (const line of lines) {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    }

    // Timestamp
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(
      new Date(message.createdAt).toLocaleString('es-ES'),
      margin,
      yPosition
    );
    
    yPosition += 15;
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(
      `ECONEURA.COM — ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save
  const filename = `ECONEURA_${neuraName}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}


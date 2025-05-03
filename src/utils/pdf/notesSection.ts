
import { jsPDF } from 'jspdf';
import { MealPlanExportOptions } from './types';

export const addNotesSection = (
  doc: jsPDF, 
  options: MealPlanExportOptions,
  startY: number
): number => {
  const { notes } = options;
  let currentY = startY;
  
  // Add notes if provided
  if (notes) {
    if (currentY > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('OBSERVAÇÕES', 20, currentY);
    currentY += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const splitNotes = doc.splitTextToSize(notes, pageWidth - 40);
    doc.text(splitNotes, 20, currentY);
    
    currentY += splitNotes.length * 5 + 10;
  }
  
  return currentY;
};

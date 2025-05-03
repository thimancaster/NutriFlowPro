
import { jsPDF } from 'jspdf';
import { MealPlanExportOptions } from './types';

export const addFooterSection = (
  doc: jsPDF, 
  options: MealPlanExportOptions
): void => {
  const { nutritionistName = 'Nutricionista' } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const bottomY = doc.internal.pageSize.getHeight() - 30;
  
  // Add nutritionist signature at the bottom
  doc.setDrawColor(0, 100, 80); // Green line color
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 50, bottomY, pageWidth / 2 + 50, bottomY);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 100, 80);
  doc.text(nutritionistName, pageWidth / 2, bottomY + 10, { align: 'center' });
};

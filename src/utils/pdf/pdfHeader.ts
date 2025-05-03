
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { MealPlanExportOptions } from './types';

export const addPdfHeader = (
  doc: jsPDF, 
  options: MealPlanExportOptions
): void => {
  const {
    clinicName = 'NutriVita',
    date = new Date(),
  } = options;
  
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add background color on top
  doc.setFillColor(240, 249, 245); // Light green background
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add title
  doc.setTextColor(0, 100, 80); // Green text color
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PLANO ALIMENTAR', pageWidth / 2, 20, { align: 'center' });
  
  // Add clinic name and date
  doc.setTextColor(100, 100, 100); // Gray text color
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(clinicName, 20, 35);
  doc.text(`Data: ${format(date, 'dd/MM/yyyy')}`, pageWidth - 20, 35, { align: 'right' });
};

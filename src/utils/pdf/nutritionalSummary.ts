
import { jsPDF } from 'jspdf';
import { MealPlanExportOptions } from './types';

export const addNutritionalSummary = (
  doc: jsPDF, 
  options: MealPlanExportOptions
): void => {
  const { totalCalories, totalProtein, totalCarbs, totalFats } = options;
  
  // Add nutritional summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO NUTRICIONAL', 20, 95);
  
  const summaryData = [
    ['Calorias Totais', 'Proteínas', 'Carboidratos', 'Gorduras'],
    [`${totalCalories} kcal`, `${totalProtein}g`, `${totalCarbs}g`, `${totalFats}g`]
  ];
  
  doc.autoTable({
    startY: 100,
    head: [summaryData[0]],
    body: [summaryData[1]],
    theme: 'grid',
    headStyles: {
      fillColor: [0, 128, 102],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      halign: 'center'
    }
  });
};

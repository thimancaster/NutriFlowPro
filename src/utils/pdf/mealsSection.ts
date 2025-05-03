
import { jsPDF } from 'jspdf';
import { MealPlanExportOptions } from './types';

export const addMealsSection = (
  doc: jsPDF, 
  options: MealPlanExportOptions
): number => {
  const { meals } = options;
  
  // Add meal plan table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  let currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 150;
  doc.text('PLANO ALIMENTAR', 20, currentY);
  currentY += 10;
  
  // For each meal, add a table
  meals.forEach((meal, index) => {
    // Check if we need a new page
    if (currentY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      currentY = 20;
    }
    
    // Add meal header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 100, 80); // Green text color
    doc.text(`${meal.name} (${meal.percent}%) - ${meal.calories} kcal`, 20, currentY);
    currentY += 5;
    
    // Create meal macros table
    const mealMacros = [
      ['Proteínas', 'Carboidratos', 'Gorduras'],
      [`${meal.protein}g`, `${meal.carbs}g`, `${meal.fat}g`]
    ];
    
    doc.autoTable({
      startY: currentY,
      head: [mealMacros[0]],
      body: [mealMacros[1]],
      theme: 'grid',
      styles: {
        fontSize: 10
      },
      headStyles: {
        fillColor: [230, 237, 244],
        textColor: [60, 60, 60],
        fontStyle: 'bold'
      },
      margin: { left: 20 }
    });
    
    currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 5 : currentY + 25;
    
    // Add food suggestions
    if (meal.suggestions && meal.suggestions.length > 0) {
      const suggestionRows = meal.suggestions.map((suggestion: string) => [suggestion]);
      
      doc.autoTable({
        startY: currentY,
        head: [['Sugestões de Alimentos']],
        body: suggestionRows,
        theme: 'grid',
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [240, 249, 245],
          textColor: [0, 100, 80],
          fontStyle: 'bold'
        },
        margin: { left: 20 }
      });
      
      currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : currentY + 35;
    } else {
      currentY += 10;
    }
  });
  
  return currentY;
};

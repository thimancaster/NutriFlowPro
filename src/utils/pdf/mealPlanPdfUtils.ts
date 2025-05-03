
import { jsPDF } from 'jspdf';
import { MealPlanSettings } from '@/utils/mealGeneratorUtils';

// Extend the jsPDF type definition to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

export interface MealPlanPdfData {
  mealPlan: {
    meals: any[];
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fats: number;
  };
  settings: MealPlanSettings;
}

export const generateMealPlanPDF = ({ mealPlan, settings }: MealPlanPdfData): jsPDF => {
  // Create PDF document
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text('Plano Alimentar', 105, 15, { align: 'center' });
  
  // Add settings summary
  doc.setFontSize(12);
  doc.text(`Número de refeições: ${settings.numMeals}`, 20, 30);
  doc.text(`Calorias totais: ${settings.totalCalories}`, 20, 40);
  doc.text(`Tipo de dieta: ${settings.dietType}`, 20, 50);
  
  if (settings.restrictions.length > 0) {
    doc.text(`Restrições: ${settings.restrictions.join(', ')}`, 20, 60);
  }
  
  // Add macronutrient summary
  doc.setFontSize(16);
  doc.text('Macronutrientes Diários', 105, 75, { align: 'center' });
  
  doc.autoTable({
    head: [['Nutriente', 'Quantidade', 'Calorias', '% do Total']],
    body: [
      ['Proteínas', `${mealPlan.total_protein}g`, `${mealPlan.total_protein * 4} kcal`, `${Math.round((mealPlan.total_protein * 4 * 100) / mealPlan.total_calories)}%`],
      ['Carboidratos', `${mealPlan.total_carbs}g`, `${mealPlan.total_carbs * 4} kcal`, `${Math.round((mealPlan.total_carbs * 4 * 100) / mealPlan.total_calories)}%`],
      ['Gorduras', `${mealPlan.total_fats}g`, `${mealPlan.total_fats * 9} kcal`, `${Math.round((mealPlan.total_fats * 9 * 100) / mealPlan.total_calories)}%`],
      ['Total', '', `${mealPlan.total_calories} kcal`, '100%']
    ],
    startY: 80,
    headStyles: { fillColor: [0, 128, 0] }
  });
  
  // Add each meal
  let yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 100;
  
  mealPlan.meals.forEach((meal: any, index: number) => {
    // Add new page if needed
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text(`${meal.name} (${meal.calories} kcal)`, 20, yPosition);
    
    yPosition += 10;
    
    doc.autoTable({
      head: [['Nutriente', 'Quantidade']],
      body: [
        ['Proteínas', `${meal.protein}g`],
        ['Carboidratos', `${meal.carbs}g`],
        ['Gorduras', `${meal.fat}g`]
      ],
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20 },
      tableWidth: 80
    });
    
    yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : yPosition + 50;
    
    if (meal.foodSuggestions && meal.foodSuggestions.length > 0) {
      doc.setFontSize(12);
      doc.text('Sugestões de alimentos:', 20, yPosition);
      
      yPosition += 5;
      
      meal.foodSuggestions.forEach((food: string) => {
        doc.setFontSize(10);
        doc.text(`• ${food}`, 25, yPosition);
        yPosition += 5;
      });
    }
    
    yPosition += 15;
  });
  
  // Add notes section
  doc.setFontSize(12);
  doc.text('Observações:', 20, yPosition);
  doc.setFontSize(10);
  doc.text('Este plano alimentar é apenas uma sugestão e deve ser adaptado às necessidades individuais.', 20, yPosition + 5);
  doc.text('Consulte sempre um nutricionista para orientações personalizadas.', 20, yPosition + 10);
  
  return doc;
};

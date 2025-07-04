
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
    date?: string;
  };
  settings: MealPlanSettings & {
    patientName?: string;
    patientAge?: number;
    patientGender?: string;
    dietType?: string;
    numMeals?: number;
  };
}

export const generateMealPlanPDF = ({ mealPlan, settings }: MealPlanPdfData): jsPDF => {
  // Create PDF document
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text('Plano Alimentar Personalizado', 105, 15, { align: 'center' });
  
  // Add date and professional info
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 25);
  doc.text('NutriFlow Pro - Sistema Profissional de Nutrição', 20, 30);
  
  // Add patient info section if available
  if (settings.patientName) {
    doc.setFontSize(14);
    doc.text('Informações do Paciente:', 20, 45);
    doc.setFontSize(12);
    doc.text(`Nome: ${settings.patientName}`, 20, 52);
    if (settings.patientAge) doc.text(`Idade: ${settings.patientAge} anos`, 20, 59);
    if (settings.patientGender) doc.text(`Sexo: ${settings.patientGender}`, 20, 66);
  }
  
  // Add settings summary
  doc.setFontSize(12);
  const startY = settings.patientName ? 80 : 45;
  doc.text(`Número de refeições: ${settings.numMeals || mealPlan.meals.length}`, 20, startY);
  doc.text(`Calorias totais: ${Math.round(mealPlan.total_calories)} kcal`, 20, startY + 7);
  if (settings.dietType) doc.text(`Tipo de dieta: ${settings.dietType}`, 20, startY + 14);
  
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
  
  // Add each meal with proper data mapping
  let yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 110;
  
  mealPlan.meals.forEach((meal: any, index: number) => {
    // Add new page if needed
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Meal header with proper data extraction
    doc.setFontSize(14);
    const mealCalories = meal.total_calories || meal.calories || 0;
    doc.text(`${meal.name} (${Math.round(mealCalories)} kcal)`, 20, yPosition);
    
    yPosition += 10;
    
    // Macronutrients table with corrected field mapping
    const mealProtein = meal.total_protein || meal.protein || 0;
    const mealCarbs = meal.total_carbs || meal.carbs || 0;
    const mealFats = meal.total_fats || meal.fats || meal.fat || 0;
    
    doc.autoTable({
      head: [['Nutriente', 'Quantidade', 'Calorias']],
      body: [
        ['Proteínas', `${Math.round(mealProtein)}g`, `${Math.round(mealProtein * 4)} kcal`],
        ['Carboidratos', `${Math.round(mealCarbs)}g`, `${Math.round(mealCarbs * 4)} kcal`],
        ['Gorduras', `${Math.round(mealFats)}g`, `${Math.round(mealFats * 9)} kcal`]
      ],
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [52, 168, 83] }, // Verde NutriFlow
      margin: { left: 20 },
      tableWidth: 100
    });
    
    yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : yPosition + 50;
    
    // Foods list with proper data structure
    if (meal.foods && meal.foods.length > 0) {
      doc.setFontSize(12);
      doc.text('Alimentos da refeição:', 20, yPosition);
      yPosition += 5;
      
      const foodRows = meal.foods.map((food: any) => [
        food.name || 'Alimento não especificado',
        `${food.quantity || 100}${food.unit || 'g'}`,
        `${Math.round(food.calories || 0)} kcal`
      ]);
      
      doc.autoTable({
        head: [['Alimento', 'Quantidade', 'Calorias']],
        body: foodRows,
        startY: yPosition,
        theme: 'striped',
        headStyles: { fillColor: [33, 150, 243] }, // Azul NutriFlow
        margin: { left: 20 },
        tableWidth: 160
      });
      
      yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : yPosition + 40;
    } else {
      // Fallback para sugestões quando não há alimentos específicos
      doc.setFontSize(10);
      doc.text('* Consulte o nutricionista para alimentos específicos desta refeição', 25, yPosition);
      yPosition += 15;
    }
  });
  
  // Add notes section
  doc.setFontSize(12);
  doc.text('Observações:', 20, yPosition);
  doc.setFontSize(10);
  doc.text('Este plano alimentar é apenas uma sugestão e deve ser adaptado às necessidades individuais.', 20, yPosition + 5);
  doc.text('Consulte sempre um nutricionista para orientações personalizadas.', 20, yPosition + 10);
  
  return doc;
};

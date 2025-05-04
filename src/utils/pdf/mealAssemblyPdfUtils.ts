
import { jsPDF } from 'jspdf';
import { Meal } from '@/types/meal';
import 'jspdf-autotable';

interface MealAssemblyPdfData {
  meals: Meal[];
  patientName: string;
  patientData?: any;
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const generateMealAssemblyPDF = (data: MealAssemblyPdfData): jsPDF => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text("Plano Alimentar", 105, 20, { align: "center" });
  
  // Add patient info
  doc.setFontSize(12);
  doc.text(`Paciente: ${data.patientName}`, 20, 40);
  if (data.patientData) {
    doc.text(`Idade: ${data.patientData.age || '-'}`, 20, 50);
    doc.text(`Peso: ${data.patientData.weight || '-'} kg`, 20, 60);
    doc.text(`Altura: ${data.patientData.height || '-'} cm`, 20, 70);
    doc.text(`Objetivo: ${data.patientData.objective || '-'}`, 20, 80);
  }
  
  // Add nutrition summary
  doc.setFontSize(14);
  doc.text("Resumo Nutricional", 105, 90, { align: "center" });
  doc.setFontSize(11);
  doc.text(`Calorias totais: ${data.totalCalories} kcal`, 20, 100);
  doc.text(`Proteínas: ${data.macros.protein}g (${Math.round(data.macros.protein * 4 / data.totalCalories * 100)}%)`, 20, 110);
  doc.text(`Carboidratos: ${data.macros.carbs}g (${Math.round(data.macros.carbs * 4 / data.totalCalories * 100)}%)`, 20, 120);
  doc.text(`Gorduras: ${data.macros.fat}g (${Math.round(data.macros.fat * 9 / data.totalCalories * 100)}%)`, 20, 130);
  
  // Add meals table
  let yPosition = 150;
  
  for (const meal of data.meals) {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(13);
    doc.text(`${meal.name} - ${meal.time}`, 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Calorias: ${meal.calories} kcal | Proteínas: ${meal.protein}g | Carboidratos: ${meal.carbs}g | Gorduras: ${meal.fat}g`, 25, yPosition);
    yPosition += 10;
    
    if (meal.foods.length > 0) {
      const tableColumn = ["Alimento", "Porção", "Calorias", "P", "C", "G"];
      const tableRows = meal.foods.map(food => [
        food.name,
        food.portion,
        `${food.calories} kcal`,
        `${food.protein || "-"}g`,
        `${food.carbs || "-"}g`,
        `${food.fat || "-"}g`
      ]);
      
      (doc as any).autoTable({
        startY: yPosition,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [0, 123, 255] },
        margin: { left: 25 }
      });
      
      // Update yPosition to after the table
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    } else {
      yPosition += 5;
      doc.text("Nenhum alimento selecionado", 25, yPosition);
      yPosition += 15;
    }
  }
  
  // Add footer
  const date = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(10);
  doc.text(`Gerado em: ${date}`, 20, doc.internal.pageSize.height - 10);
  doc.text("NutriFlow Pro", doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: "right" });
  
  return doc;
};

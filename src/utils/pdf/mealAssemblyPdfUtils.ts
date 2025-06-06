
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Meal, MealFood } from '@/types/meal';

interface GeneratePDFOptions {
  meals: Array<Meal>;
  patientName: string;
  patientData?: any;
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const generateMealAssemblyPDF = ({
  meals,
  patientName,
  patientData,
  totalCalories,
  macros
}: GeneratePDFOptions): jsPDF => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Plano Alimentar', 105, 15, { align: 'center' });
  
  // Add patient info
  doc.setFontSize(12);
  doc.text(`Paciente: ${patientName}`, 14, 30);
  
  if (patientData) {
    const birthDate = patientData.birth_date 
      ? new Date(patientData.birth_date).toLocaleDateString() 
      : 'Não informada';
    
    doc.text(`Data de nascimento: ${birthDate}`, 14, 37);
    
    if (patientData.gender) {
      doc.text(`Sexo: ${patientData.gender === 'M' ? 'Masculino' : patientData.gender === 'F' ? 'Feminino' : 'Outro'}`, 14, 44);
    }
  }
  
  // Add macro summary
  doc.setFontSize(14);
  doc.text('Resumo Nutricional', 14, 58);
  
  doc.setFontSize(11);
  doc.text(`Calorias: ${totalCalories} kcal`, 14, 65);
  doc.text(`Proteínas: ${macros.protein}g (${Math.round(macros.protein * 4 / totalCalories * 100)}%)`, 14, 72);
  doc.text(`Carboidratos: ${macros.carbs}g (${Math.round(macros.carbs * 4 / totalCalories * 100)}%)`, 14, 79);
  doc.text(`Gorduras: ${macros.fat}g (${Math.round(macros.fat * 9 / totalCalories * 100)}%)`, 14, 86);
  
  // Add meals
  let yPosition = 100;
  
  for (const meal of meals) {
    // Add some extra space if we're close to the end of the page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Add meal name
    doc.setFontSize(14);
    doc.text(`${meal.name} (${meal.time || 'Horário não definido'})`, 14, yPosition);
    
    yPosition += 7;
    
    // Add meal summary
    doc.setFontSize(11);
    const calories = meal.totalCalories || meal.calories || 0;
    const protein = meal.totalProtein || meal.protein || 0;
    const carbs = meal.totalCarbs || meal.carbs || 0;
    const fat = meal.totalFats || meal.fat || 0;
    
    doc.text(`Calorias: ${calories} kcal | P: ${protein}g | C: ${carbs}g | G: ${fat}g`, 14, yPosition);
    
    yPosition += 10;
    
    // Add food table
    const foods = meal.foods || [];
    if (foods.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Alimento', 'Porção', 'Calorias', 'Proteínas', 'Carboidratos', 'Gorduras']],
        body: foods.map(food => {
          // Create a unified interface for accessing food properties using type assertion
          const typedFood = food as any; // Use any to bypass type checking temporarily
          
          // Now we can safely access properties with fallbacks
          const foodName = typedFood.food?.name || typedFood.name || '';
          const portion = typedFood.quantity 
            ? `${typedFood.quantity} ${typedFood.unit || ''}`
            : typedFood.portion || 'N/A';
          const foodCalories = Number(typedFood.calories || 0);
          const foodProtein = Number(typedFood.protein || 0);
          const foodCarbs = Number(typedFood.carbs || 0);
          const foodFats = Number(typedFood.fats || typedFood.fat || 0);
          
          return [
            foodName,
            portion,
            `${foodCalories} kcal`,
            `${foodProtein}g`,
            `${foodCarbs}g`,
            `${foodFats}g`
          ];
        }),
        margin: { left: 14 },
        headStyles: {
          fillColor: [76, 175, 80]
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.text('Nenhum alimento adicionado.', 14, yPosition);
      yPosition += 15;
    }
  }
  
  // Add date at the bottom
  const currentDate = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.text(`Gerado em ${currentDate}`, 14, doc.internal.pageSize.height - 10);
  
  return doc;
};
